"""MCP de CreceConAds para Google Analytics 4, Search Console y Tag Manager.

Corre en Railway como servidor MCP remoto (HTTP). Se conecta a Google con una cuenta de servicio:
  - GOOGLE_SA_JSON: el JSON completo de la cuenta de servicio (se carga en Railway, nunca en el repo ni en un chat).
  - MCP_TOKEN: una cadena larga al azar. La URL del conector es https://<dominio>/<MCP_TOKEN>/mcp
    (sin el token correcto no se llega al servidor).
  - Opcionales: GA4_PROPIEDAD (ID numérico por defecto), GSC_SITIO (por defecto sc-domain o URL del sitio),
    GTM_CUENTA y GTM_CONTENEDOR (IDs por defecto).

La cuenta de servicio tiene que estar agregada como usuario en GA4 (Editor), Search Console (Propietario o
Completo) y Tag Manager (Publicar). Lectura libre; en GTM se crea en un espacio de trabajo y publicar exige
confirmar=True, que solo se usa con el OK explícito de Damián.
"""
import json
import os
import re
import time
from datetime import date, datetime, timedelta, timezone
from urllib.parse import quote

import requests
import uvicorn
from google.auth.transport.requests import AuthorizedSession
from google.oauth2 import service_account
from mcp.server.fastmcp import FastMCP
from mcp.server.transport_security import TransportSecuritySettings
from starlette.applications import Starlette
from starlette.responses import PlainTextResponse
from starlette.routing import Mount, Route

ALCANCES = [
    "https://www.googleapis.com/auth/analytics.readonly",
    "https://www.googleapis.com/auth/analytics.edit",
    "https://www.googleapis.com/auth/webmasters",
    "https://www.googleapis.com/auth/tagmanager.readonly",
    "https://www.googleapis.com/auth/tagmanager.edit.containers",
    "https://www.googleapis.com/auth/tagmanager.edit.containerversions",
    "https://www.googleapis.com/auth/tagmanager.publish",
]
GA_DATA = "https://analyticsdata.googleapis.com/v1beta"
GA_ADMIN = "https://analyticsadmin.googleapis.com/v1beta"
GSC = "https://searchconsole.googleapis.com/webmasters/v3"
GSC_INSPECCION = "https://searchconsole.googleapis.com/v1/urlInspection/index:inspect"
GTM = "https://tagmanager.googleapis.com/tagmanager/v2"

_sesion = None


def google() -> AuthorizedSession:
    global _sesion
    if _sesion is None:
        crudo = os.environ.get("GOOGLE_SA_JSON")
        if not crudo:
            raise RuntimeError("Falta la variable GOOGLE_SA_JSON en Railway (JSON de la cuenta de servicio).")
        cred = service_account.Credentials.from_service_account_info(json.loads(crudo), scopes=ALCANCES)
        _sesion = AuthorizedSession(cred)
    return _sesion


def pedir(metodo: str, url: str, **kw):
    r = google().request(metodo, url, timeout=60, **kw)
    if r.status_code >= 400:
        try:
            msg = r.json().get("error", {}).get("message", r.text)
        except ValueError:
            msg = r.text
        if r.status_code == 403:
            msg += (" · Revisá que la cuenta de servicio (" + cuenta_servicio() + ") esté agregada como usuario "
                    "en esa propiedad o contenedor y que la API esté habilitada en Google Cloud.")
        raise RuntimeError(f"Google respondió {r.status_code}: {msg}")
    return r.json() if r.content else {}


def cuenta_servicio() -> str:
    try:
        return json.loads(os.environ.get("GOOGLE_SA_JSON", "{}")).get("client_email", "?")
    except ValueError:
        return "?"


def fechas(desde: str | None, hasta: str | None, dias: int = 28) -> tuple[str, str]:
    fin = hasta or (date.today() - timedelta(days=1)).isoformat()
    ini = desde or (date.fromisoformat(fin) - timedelta(days=dias - 1)).isoformat()
    return ini, fin


def propiedad(p: str | None) -> str:
    p = (p or os.environ.get("GA4_PROPIEDAD", "")).replace("properties/", "").strip()
    if not p:
        raise RuntimeError("Indicá el ID de la propiedad de GA4 (usá ga4_propiedades para verlo).")
    return p


def sitio(s: str | None) -> str:
    s = s or os.environ.get("GSC_SITIO", "")
    if not s:
        raise RuntimeError("Indicá el sitio de Search Console (usá gsc_sitios para verlo).")
    return s


def contenedor(cuenta: str | None, cont: str | None) -> str:
    c = cuenta or os.environ.get("GTM_CUENTA", "")
    k = cont or os.environ.get("GTM_CONTENEDOR", "")
    if not (c and k):
        raise RuntimeError("Indicá cuenta y contenedor de GTM (usá gtm_contenedores para verlos).")
    return f"accounts/{c}/containers/{k}"


def espacio(cuenta, cont, workspace) -> str:
    base = contenedor(cuenta, cont)
    if workspace:
        return f"{base}/workspaces/{workspace}"
    ws = pedir("GET", f"{GTM}/{base}/workspaces").get("workspace", [])
    if not ws:
        raise RuntimeError("El contenedor no tiene espacios de trabajo.")
    return ws[0]["path"]


mcp = FastMCP(
    "CreceConAds Google y Bing",
    instructions=("Google Analytics 4, Search Console, Tag Manager y Bing Webmaster de CreceConAds. Lectura libre. "
                  "En Tag Manager los cambios quedan en un espacio de trabajo; gtm_publicar solo con el OK explícito de Damián."),
    stateless_http=True,
    json_response=True,
    transport_security=TransportSecuritySettings(enable_dns_rebinding_protection=False),
)

# ---------------------------------------------------------------- Google Analytics 4


@mcp.tool()
def ga4_propiedades() -> list[dict]:
    """Lista las cuentas y propiedades de GA4 a las que tiene acceso la cuenta de servicio."""
    salida = []
    token = None
    while True:
        r = pedir("GET", f"{GA_ADMIN}/accountSummaries", params={"pageToken": token} if token else None)
        for c in r.get("accountSummaries", []):
            for p in c.get("propertySummaries", []):
                salida.append({"cuenta": c.get("displayName"), "propiedad": p["property"].split("/")[-1],
                               "nombre": p.get("displayName")})
        token = r.get("nextPageToken")
        if not token:
            return salida


@mcp.tool()
def ga4_reporte(metricas: list[str], dimensiones: list[str] | None = None, desde: str | None = None,
                hasta: str | None = None, propiedad_id: str | None = None, filtro_dimension: str | None = None,
                filtro_valor: str | None = None, orden_metrica: str | None = None, limite: int = 50) -> dict:
    """Reporte de GA4 (Data API). Fechas AAAA-MM-DD (por defecto, últimos 28 días hasta ayer).
    Métricas: sessions, totalUsers, newUsers, screenPageViews, engagementRate, averageSessionDuration,
    keyEvents, eventCount, conversions... Dimensiones: date, pagePath, sessionSource, sessionMedium,
    sessionCampaignName, sessionDefaultChannelGroup, eventName, deviceCategory, city, landingPage...
    Filtro opcional: una dimensión que contenga un texto (ej. filtro_dimension="eventName", filtro_valor="generate_lead").
    orden_metrica ordena de mayor a menor."""
    ini, fin = fechas(desde, hasta)
    cuerpo = {"dateRanges": [{"startDate": ini, "endDate": fin}],
              "metrics": [{"name": m} for m in metricas],
              "dimensions": [{"name": d} for d in (dimensiones or [])],
              "limit": max(1, min(limite, 10000))}
    if filtro_dimension and filtro_valor:
        cuerpo["dimensionFilter"] = {"filter": {"fieldName": filtro_dimension,
                                                "stringFilter": {"matchType": "CONTAINS", "value": filtro_valor}}}
    if orden_metrica:
        cuerpo["orderBys"] = [{"metric": {"metricName": orden_metrica}, "desc": True}]
    r = pedir("POST", f"{GA_DATA}/properties/{propiedad(propiedad_id)}:runReport", json=cuerpo)
    cols = [h["name"] for h in r.get("dimensionHeaders", [])] + [h["name"] for h in r.get("metricHeaders", [])]
    filas = [[v["value"] for v in f.get("dimensionValues", [])] + [v["value"] for v in f.get("metricValues", [])]
             for f in r.get("rows", [])]
    return {"desde": ini, "hasta": fin, "columnas": cols, "filas": filas, "total_filas": r.get("rowCount", 0)}


@mcp.tool()
def ga4_tiempo_real(metricas: list[str] | None = None, dimensiones: list[str] | None = None,
                    propiedad_id: str | None = None) -> dict:
    """Usuarios y eventos de los últimos 30 minutos (por defecto activeUsers por unifiedScreenName).
    Sirve para comprobar que un evento nuevo de GTM llega a GA4."""
    cuerpo = {"metrics": [{"name": m} for m in (metricas or ["activeUsers"])],
              "dimensions": [{"name": d} for d in (dimensiones or ["unifiedScreenName"])]}
    r = pedir("POST", f"{GA_DATA}/properties/{propiedad(propiedad_id)}:runRealtimeReport", json=cuerpo)
    cols = [h["name"] for h in r.get("dimensionHeaders", [])] + [h["name"] for h in r.get("metricHeaders", [])]
    filas = [[v["value"] for v in f.get("dimensionValues", [])] + [v["value"] for v in f.get("metricValues", [])]
             for f in r.get("rows", [])]
    return {"columnas": cols, "filas": filas}


@mcp.tool()
def ga4_eventos_clave(propiedad_id: str | None = None) -> list[dict]:
    """Lista los eventos marcados como clave (conversiones) en la propiedad."""
    r = pedir("GET", f"{GA_ADMIN}/properties/{propiedad(propiedad_id)}/keyEvents")
    return [{"evento": k.get("eventName"), "creado": k.get("createTime"), "nombre_recurso": k.get("name")}
            for k in r.get("keyEvents", [])]


@mcp.tool()
def ga4_marcar_evento_clave(evento: str, propiedad_id: str | None = None) -> dict:
    """Marca un evento como evento clave (ej. generate_lead). Requiere rol Editor de la cuenta de servicio."""
    r = pedir("POST", f"{GA_ADMIN}/properties/{propiedad(propiedad_id)}/keyEvents",
              json={"eventName": evento, "countingMethod": "ONCE_PER_EVENT"})
    return {"ok": True, "evento": r.get("eventName"), "nombre_recurso": r.get("name")}


# ---------------------------------------------------------------- Search Console


@mcp.tool()
def gsc_sitios() -> list[dict]:
    """Lista los sitios de Search Console a los que tiene acceso la cuenta de servicio y su permiso."""
    return [{"sitio": s["siteUrl"], "permiso": s.get("permissionLevel")}
            for s in pedir("GET", f"{GSC}/sites").get("siteEntry", [])]


@mcp.tool()
def gsc_rendimiento(dimensiones: list[str] | None = None, desde: str | None = None, hasta: str | None = None,
                    sitio_url: str | None = None, filtro_pagina: str | None = None, filtro_busqueda: str | None = None,
                    pais: str | None = None, limite: int = 100) -> dict:
    """Clics, impresiones, CTR y posición en Google. Dimensiones: query, page, date, country, device.
    Por defecto últimos 28 días (Search Console tarda ~2 días en tener datos). Filtros opcionales por texto
    contenido en la página o la búsqueda, y país en código ISO de 3 letras (ej. "arg")."""
    ini, fin = fechas(desde, hasta or (date.today() - timedelta(days=3)).isoformat())
    cuerpo = {"startDate": ini, "endDate": fin, "dimensions": dimensiones or ["query"],
              "rowLimit": max(1, min(limite, 25000))}
    filtros = []
    if filtro_pagina:
        filtros.append({"dimension": "page", "operator": "contains", "expression": filtro_pagina})
    if filtro_busqueda:
        filtros.append({"dimension": "query", "operator": "contains", "expression": filtro_busqueda})
    if pais:
        filtros.append({"dimension": "country", "operator": "equals", "expression": pais.lower()})
    if filtros:
        cuerpo["dimensionFilterGroups"] = [{"filters": filtros}]
    s = sitio(sitio_url)
    r = pedir("POST", f"{GSC}/sites/{quote(s, safe='')}/searchAnalytics/query", json=cuerpo)
    filas = [{"claves": f.get("keys", []), "clics": f["clicks"], "impresiones": f["impressions"],
              "ctr": round(f["ctr"] * 100, 2), "posicion": round(f["position"], 1)} for f in r.get("rows", [])]
    return {"sitio": s, "desde": ini, "hasta": fin, "filas": filas,
            "nota": "" if filas else "Sin datos en el período: Google todavía no mostró el sitio en esas fechas."}


@mcp.tool()
def gsc_inspeccionar_url(url: str, sitio_url: str | None = None) -> dict:
    """Estado de indexación de una URL en Google: si está indexada, última lectura, canónica y problemas."""
    r = pedir("POST", GSC_INSPECCION, json={"inspectionUrl": url, "siteUrl": sitio(sitio_url), "languageCode": "es"})
    i = r.get("inspectionResult", {}).get("indexStatusResult", {})
    return {"url": url, "veredicto": i.get("verdict"), "estado": i.get("coverageState"),
            "ultima_lectura": i.get("lastCrawlTime"), "canonica_google": i.get("googleCanonical"),
            "canonica_propia": i.get("userCanonical"), "robots": i.get("robotsTxtState"),
            "indexacion": i.get("indexingState"), "link": r.get("inspectionResult", {}).get("inspectionResultLink")}


@mcp.tool()
def gsc_sitemaps(sitio_url: str | None = None) -> list[dict]:
    """Sitemaps enviados, cuándo los leyó Google, cuántas URLs y si tienen errores."""
    s = sitio(sitio_url)
    r = pedir("GET", f"{GSC}/sites/{quote(s, safe='')}/sitemaps")
    return [{"sitemap": m.get("path"), "enviado": m.get("lastSubmitted"), "leido": m.get("lastDownloaded"),
             "errores": m.get("errors"), "advertencias": m.get("warnings"),
             "urls": sum(int(c.get("submitted", 0)) for c in m.get("contents", []))} for m in r.get("sitemap", [])]


@mcp.tool()
def gsc_enviar_sitemap(sitemap_url: str = "https://crececonads.site/sitemap.xml", sitio_url: str | None = None) -> dict:
    """Envía (o reenvía) un sitemap a Google. Seguro: no cambia nada del sitio."""
    s = sitio(sitio_url)
    pedir("PUT", f"{GSC}/sites/{quote(s, safe='')}/sitemaps/{quote(sitemap_url, safe='')}")
    return {"ok": True, "sitemap": sitemap_url}


# ---------------------------------------------------------------- Tag Manager


@mcp.tool()
def gtm_contenedores() -> list[dict]:
    """Lista cuentas y contenedores de Tag Manager con sus IDs (GTM-XXXX)."""
    salida = []
    for c in pedir("GET", f"{GTM}/accounts").get("account", []):
        for k in pedir("GET", f"{GTM}/{c['path']}/containers").get("container", []):
            salida.append({"cuenta": c["name"], "cuenta_id": c["accountId"], "contenedor": k["name"],
                           "contenedor_id": k["containerId"], "gtm": k.get("publicId"), "dominios": k.get("domainName", [])})
    return salida


@mcp.tool()
def gtm_listar(tipo: str = "tags", cuenta_id: str | None = None, contenedor_id: str | None = None,
               workspace_id: str | None = None) -> list[dict]:
    """Lista etiquetas (tags), activadores (triggers) o variables (variables) del espacio de trabajo."""
    if tipo not in ("tags", "triggers", "variables"):
        raise RuntimeError('tipo tiene que ser "tags", "triggers" o "variables".')
    ws = espacio(cuenta_id, contenedor_id, workspace_id)
    clave = {"tags": "tag", "triggers": "trigger", "variables": "variable"}[tipo]
    items = pedir("GET", f"{GTM}/{ws}/{tipo}").get(clave, [])
    return [{"id": i.get(f"{clave}Id"), "nombre": i.get("name"), "tipo": i.get("type"),
             "parametros": i.get("parameter", []), "activadores": i.get("firingTriggerId", []),
             "filtro": i.get("customEventFilter") or i.get("filter")} for i in items]


@mcp.tool()
def gtm_crear_variable_capa_datos(nombre: str, clave_capa_datos: str, cuenta_id: str | None = None,
                                  contenedor_id: str | None = None, workspace_id: str | None = None) -> dict:
    """Crea una variable de capa de datos (dataLayer) en el espacio de trabajo. No publica."""
    ws = espacio(cuenta_id, contenedor_id, workspace_id)
    r = pedir("POST", f"{GTM}/{ws}/variables", json={
        "name": nombre, "type": "v",
        "parameter": [{"type": "integer", "key": "dataLayerVersion", "value": "2"},
                      {"type": "boolean", "key": "setDefaultValue", "value": "false"},
                      {"type": "template", "key": "name", "value": clave_capa_datos}]})
    return {"ok": True, "variable_id": r.get("variableId"), "nombre": r.get("name")}


@mcp.tool()
def gtm_crear_activador_evento(nombre: str, evento: str, cuenta_id: str | None = None,
                               contenedor_id: str | None = None, workspace_id: str | None = None) -> dict:
    """Crea un activador de evento personalizado (dataLayer.push({event: ...})). No publica."""
    ws = espacio(cuenta_id, contenedor_id, workspace_id)
    r = pedir("POST", f"{GTM}/{ws}/triggers", json={
        "name": nombre, "type": "customEvent",
        "customEventFilter": [{"type": "equals", "parameter": [
            {"type": "template", "key": "arg0", "value": "{{_event}}"},
            {"type": "template", "key": "arg1", "value": evento}]}]})
    return {"ok": True, "activador_id": r.get("triggerId"), "nombre": r.get("name")}


@mcp.tool()
def gtm_crear_etiqueta_evento_ga4(nombre: str, evento_ga4: str, activador_id: str, id_medicion: str,
                                  parametros: dict[str, str] | None = None, cuenta_id: str | None = None,
                                  contenedor_id: str | None = None, workspace_id: str | None = None) -> dict:
    """Crea una etiqueta "Evento de GA4" (ej. generate_lead) con parámetros {nombre: "{{Variable}}"}. No publica.
    id_medicion es el G-XXXX de GA4."""
    ws = espacio(cuenta_id, contenedor_id, workspace_id)
    params = [{"type": "template", "key": "eventName", "value": evento_ga4},
              {"type": "template", "key": "measurementIdOverride", "value": id_medicion}]
    if parametros:
        params.append({"type": "list", "key": "eventSettingsTable", "list": [
            {"type": "map", "map": [{"type": "template", "key": "parameter", "value": k},
                                    {"type": "template", "key": "parameterValue", "value": v}]}
            for k, v in parametros.items()]})
    r = pedir("POST", f"{GTM}/{ws}/tags", json={"name": nombre, "type": "gaawe", "parameter": params,
                                                 "firingTriggerId": [activador_id]})
    return {"ok": True, "etiqueta_id": r.get("tagId"), "nombre": r.get("name")}


@mcp.tool()
def gtm_crear(tipo: str, recurso: dict, cuenta_id: str | None = None, contenedor_id: str | None = None,
              workspace_id: str | None = None) -> dict:
    """Crea una etiqueta (tags), activador (triggers) o variable (variables) con el JSON completo de la API de
    Tag Manager v2 (name, type, parameter, firingTriggerId, blockingTriggerId, customEventFilter, filter...).
    Queda en el espacio de trabajo: no publica."""
    if tipo not in ("tags", "triggers", "variables"):
        raise RuntimeError('tipo tiene que ser "tags", "triggers" o "variables".')
    ws = espacio(cuenta_id, contenedor_id, workspace_id)
    r = pedir("POST", f"{GTM}/{ws}/{tipo}", json=recurso)
    clave = {"tags": "tagId", "triggers": "triggerId", "variables": "variableId"}[tipo]
    return {"ok": True, "id": r.get(clave), "nombre": r.get("name")}


@mcp.tool()
def gtm_editar(tipo: str, id: str, cambios: dict, cuenta_id: str | None = None, contenedor_id: str | None = None,
               workspace_id: str | None = None) -> dict:
    """Edita una etiqueta, activador o variable existente: reemplaza solo los campos de primer nivel que vengan en
    `cambios` (ej. {"blockingTriggerId": ["25"]}). Queda en el espacio de trabajo: no publica."""
    if tipo not in ("tags", "triggers", "variables"):
        raise RuntimeError('tipo tiene que ser "tags", "triggers" o "variables".')
    ws = espacio(cuenta_id, contenedor_id, workspace_id)
    actual = pedir("GET", f"{GTM}/{ws}/{tipo}/{id}")
    actual.update(cambios)
    r = pedir("PUT", f"{GTM}/{ws}/{tipo}/{id}", json=actual, params={"fingerprint": actual.get("fingerprint")})
    return {"ok": True, "id": id, "nombre": r.get("name"), "campos": list(cambios)}


@mcp.tool()
def gtm_cambios_pendientes(cuenta_id: str | None = None, contenedor_id: str | None = None,
                           workspace_id: str | None = None) -> dict:
    """Muestra qué cambió en el espacio de trabajo respecto de lo publicado (para revisar antes de publicar)."""
    ws = espacio(cuenta_id, contenedor_id, workspace_id)
    r = pedir("GET", f"{GTM}/{ws}/status")
    cambios = []
    for c in r.get("workspaceChange", []):
        tipo = next((k for k in ("tag", "trigger", "variable", "folder", "client", "template") if k in c), "otro")
        cambios.append({"cambio": c.get("changeStatus"), "tipo": tipo, "nombre": c.get(tipo, {}).get("name")})
    return {"espacio": ws, "cambios": cambios, "conflictos": len(r.get("mergeConflict", []))}


@mcp.tool()
def gtm_publicar(confirmar: bool, nombre_version: str, notas: str = "", cuenta_id: str | None = None,
                 contenedor_id: str | None = None, workspace_id: str | None = None) -> dict:
    """Crea una versión con los cambios del espacio de trabajo y la PUBLICA en el sitio en vivo.
    Usar SOLO cuando Damián dio el OK explícito en el turno actual, después de mostrarle gtm_cambios_pendientes.
    confirmar tiene que ser True."""
    if confirmar is not True:
        raise RuntimeError("No publiqué: hace falta confirmar=True con el OK de Damián.")
    ws = espacio(cuenta_id, contenedor_id, workspace_id)
    v = pedir("POST", f"{GTM}/{ws}:create_version", json={"name": nombre_version, "notes": notas})
    if v.get("compilerError") or not v.get("containerVersion"):
        raise RuntimeError("GTM no pudo crear la versión (error de compilación o sin cambios).")
    path = v["containerVersion"]["path"]
    p = pedir("POST", f"{GTM}/{path}:publish")
    return {"ok": not p.get("compilerError"), "version": v["containerVersion"].get("containerVersionId"),
            "nombre": nombre_version}



# ---------------------------------------------------------------- Bing Webmaster Tools e IndexNow

BING = "https://ssl.bing.com/webmaster/api.svc/json"
INDEXNOW_KEY = os.environ.get("INDEXNOW_KEY", "014f905a0d3967e58894626d1e7a2c7c")


def bing(metodo: str, http: str = "GET", cuerpo: dict | None = None, **params):
    clave = os.environ.get("BING_API_KEY")
    if not clave:
        raise RuntimeError("Falta la variable BING_API_KEY en Railway (Bing Webmaster > Configuración > Acceso a la API).")
    params["apikey"] = clave
    r = requests.request(http, f"{BING}/{metodo}", params=params, json=cuerpo, timeout=60)
    if r.status_code >= 400:
        raise RuntimeError(f"Bing respondió {r.status_code}: {r.text[:300]}")
    return r.json().get("d") if r.content else None


def sitio_bing(s: str | None) -> str:
    return s or os.environ.get("BING_SITIO", "https://crececonads.site/")


def fecha_bing(v) -> str:
    """Bing devuelve fechas como /Date(1699999999000-0800)/."""
    ms = re.search(r"-?\d+", str(v or ""))
    if not ms or int(ms.group()) <= 0:  # Bing usa el año 1 para "nunca"
        return ""
    return datetime.fromtimestamp(int(ms.group()) / 1000, tz=timezone.utc).date().isoformat()


def sumar_bing(filas: list, clave: str, dias: int) -> list[dict]:
    desde = (date.today() - timedelta(days=dias)).isoformat()
    tot = {}
    for f in filas or []:
        if fecha_bing(f.get("Date")) < desde:
            continue
        t = tot.setdefault(f.get(clave), {"clics": 0, "impresiones": 0, "posicion": None})
        t["clics"] += f.get("Clicks", 0)
        t["impresiones"] += f.get("Impressions", 0)
        t["posicion"] = f.get("AvgImpressionPosition")
    return sorted(({clave.lower(): k, **v} for k, v in tot.items()), key=lambda x: -x["impresiones"])


@mcp.tool()
def bing_busquedas(dias: int = 28, sitio_url: str | None = None, limite: int = 100) -> list[dict]:
    """Búsquedas de Bing (también las usan ChatGPT y Copilot) que muestran el sitio: clics, impresiones y posición."""
    return sumar_bing(bing("GetQueryStats", siteUrl=sitio_bing(sitio_url)), "Query", dias)[:limite]


@mcp.tool()
def bing_paginas(dias: int = 28, sitio_url: str | None = None, limite: int = 100) -> list[dict]:
    """Páginas del sitio que aparecen en Bing: clics, impresiones y posición."""
    return sumar_bing(bing("GetPageStats", siteUrl=sitio_bing(sitio_url)), "Query", dias)[:limite]


@mcp.tool()
def bing_trafico(sitio_url: str | None = None) -> list[dict]:
    """Clics e impresiones por día en Bing (últimos 6 meses aprox.)."""
    return [{"fecha": fecha_bing(f.get("Date")), "clics": f.get("Clicks"), "impresiones": f.get("Impressions")}
            for f in bing("GetRankAndTrafficStats", siteUrl=sitio_bing(sitio_url)) or []]


@mcp.tool()
def bing_estado_url(url: str, sitio_url: str | None = None) -> dict:
    """Si Bing conoce una URL: última lectura, código HTTP, si está indexada y links que recibe."""
    d = bing("GetUrlInfo", siteUrl=sitio_bing(sitio_url), url=url) or {}
    return {"url": url, "codigo_http": d.get("HttpStatus"), "ultima_lectura": fecha_bing(d.get("LastCrawledDate")),
            "descubierta": fecha_bing(d.get("DiscoveryDate")), "links_entrantes": d.get("AnchorCount"),
            "tamano": d.get("DocumentSize"), "conocida": bool(d.get("LastCrawledDate") or d.get("DiscoveryDate"))}


@mcp.tool()
def bing_cupo_envio(sitio_url: str | None = None) -> dict:
    """Cuántas URLs se pueden enviar hoy y este mes a Bing para indexar."""
    d = bing("GetUrlSubmissionQuota", siteUrl=sitio_bing(sitio_url)) or {}
    return {"hoy": d.get("DailyQuota"), "mes": d.get("MonthlyQuota")}


@mcp.tool()
def bing_enviar_urls(urls: list[str], sitio_url: str | None = None) -> dict:
    """Envía URLs a Bing para que las indexe (permitido por Bing, con cupo diario). Seguro: no cambia el sitio."""
    if not urls:
        raise RuntimeError("Pasá al menos una URL.")
    bing("SubmitUrlBatch", http="POST", cuerpo={"siteUrl": sitio_bing(sitio_url), "urlList": urls[:500]})
    return {"ok": True, "enviadas": len(urls[:500])}


@mcp.tool()
def bing_palabras_relacionadas(busqueda: str, pais: str = "ar", idioma: str = "es-AR") -> list[dict]:
    """Palabras clave relacionadas con volumen de impresiones en Bing (últimos 3 meses)."""
    fin = date.today() - timedelta(days=1)
    d = bing("GetRelatedKeywords", q=busqueda, country=pais, language=idioma,
             startDate=(fin - timedelta(days=90)).isoformat(), endDate=fin.isoformat()) or []
    return sorted(({"palabra": k.get("Query"), "impresiones": k.get("Impressions")} for k in d),
                  key=lambda x: -(x["impresiones"] or 0))[:100]


@mcp.tool()
def indexnow_enviar(urls: list[str]) -> dict:
    """Avisa a Bing, Yandex, Seznam y otros buscadores (IndexNow) que estas URLs de crececonads.site son nuevas o cambiaron."""
    r = requests.post("https://api.indexnow.org/indexnow", timeout=30, json={
        "host": "crececonads.site", "key": INDEXNOW_KEY,
        "keyLocation": f"https://crececonads.site/{INDEXNOW_KEY}.txt", "urlList": urls[:10000]})
    return {"ok": r.status_code in (200, 202), "codigo": r.status_code, "enviadas": len(urls)}


# ---------------------------------------------------------------- PageSpeed Insights


@mcp.tool()
def pagespeed(url: str = "https://crececonads.site/", estrategia: str = "mobile") -> dict:
    """Velocidad de una página (PageSpeed Insights): puntaje de rendimiento y SEO, Core Web Vitals de usuarios reales
    (si Google tiene datos) y las 5 mejoras con más impacto. estrategia: "mobile" o "desktop"."""
    params = [("url", url), ("strategy", estrategia), ("locale", "es")] + [("category", c) for c in ("PERFORMANCE", "SEO", "ACCESSIBILITY", "BEST_PRACTICES")]
    if os.environ.get("PAGESPEED_API_KEY"):
        params.append(("key", os.environ["PAGESPEED_API_KEY"]))
    r = requests.get("https://www.googleapis.com/pagespeedonline/v5/runPagespeed", params=params, timeout=120)
    if r.status_code >= 400:
        extra = " · Falta PAGESPEED_API_KEY en Railway (sin clave propia se usa un cupo compartido que suele estar agotado)." \
            if r.status_code == 429 and not os.environ.get("PAGESPEED_API_KEY") else ""
        raise RuntimeError(f"PageSpeed respondió {r.status_code}: {r.text[:200]}{extra}")
    d = r.json()
    lh = d.get("lighthouseResult", {})
    cats = {k: round((v.get("score") or 0) * 100) for k, v in lh.get("categories", {}).items()}
    audits = lh.get("audits", {})
    lab = {k: audits.get(k, {}).get("displayValue") for k in
           ("largest-contentful-paint", "cumulative-layout-shift", "total-blocking-time", "first-contentful-paint", "speed-index")}
    campo = {k: {"valor": v.get("percentile"), "categoria": v.get("category")}
             for k, v in d.get("loadingExperience", {}).get("metrics", {}).items()}
    mejoras = sorted((a for a in audits.values() if a.get("details", {}).get("type") == "opportunity"
                      and (a.get("details", {}).get("overallSavingsMs") or 0) > 0),
                     key=lambda a: -a["details"]["overallSavingsMs"])[:5]
    return {"url": url, "estrategia": estrategia, "puntajes": cats, "laboratorio": lab,
            "usuarios_reales": campo or "Google todavía no tiene datos de usuarios reales para esta página",
            "mejoras": [{"titulo": a.get("title"), "ahorro_ms": round(a["details"]["overallSavingsMs"])} for a in mejoras]}


# ---------------------------------------------------------------- Visibilidad en IA (Gemini con búsqueda)

MARCA = re.compile(r"crece\s*con\s*ads|crececonads|presmanes", re.I)
MODELOS_GEMINI = ["gemini-2.5-flash", "gemini-flash-latest", "gemini-2.5-flash-lite", "gemini-flash-lite-latest"]


def gemini_buscar(pregunta: str) -> dict:
    clave = os.environ.get("GEMINI_API_KEY")
    if not clave:
        raise RuntimeError("Falta la variable GEMINI_API_KEY en Railway (aistudio.google.com/apikey).")
    ultimo = ""
    for modelo in MODELOS_GEMINI:
        r = requests.post(f"https://generativelanguage.googleapis.com/v1beta/models/{modelo}:generateContent",
                          params={"key": clave}, timeout=90, json={
                              "contents": [{"parts": [{"text": pregunta + "\nRespondé en español rioplatense. Si recomendás profesionales o empresas, nombralos."}]}],
                              "tools": [{"google_search": {}}]})
        if r.status_code == 200:
            c = r.json()["candidates"][0]
            texto = "".join(p.get("text", "") for p in c.get("content", {}).get("parts", []))
            fuentes = [g["web"].get("title") or g["web"].get("uri") for g in c.get("groundingMetadata", {}).get("groundingChunks", []) if g.get("web")]
            return {"modelo": modelo, "texto": texto, "fuentes": fuentes}
        ultimo = f"{modelo}: {r.status_code} {r.text[:150]}"
        if r.status_code in (400, 401, 403):
            break
    raise RuntimeError("Gemini no respondió. Último intento: " + ultimo)


@mcp.tool()
def ia_visibilidad(preguntas: list[str]) -> dict:
    """Le hace a Gemini (con búsqueda en Google) las preguntas que haría un cliente y anota si nombra a
    CreceConAds o a Damián Presmanes, y qué fuentes cita. Máximo 8 preguntas por llamada."""
    filas = []
    for i, q in enumerate(preguntas[:8]):
        if i:
            time.sleep(6)  # el plan gratuito limita las consultas por minuto
        try:
            r = gemini_buscar(q)
        except RuntimeError as e:
            filas.append({"pregunta": q, "error": str(e)})
            if "429" in str(e) or "400" in str(e) or "403" in str(e):
                break
            continue
        nombra = bool(MARCA.search(r["texto"]) or any(MARCA.search(f or "") for f in r["fuentes"]))
        filas.append({"pregunta": q, "te_nombra": nombra, "fuentes": r["fuentes"][:8], "respuesta_inicio": r["texto"][:400]})
    hechas = [f for f in filas if "error" not in f]
    return {"preguntas_hechas": len(hechas), "te_nombra": sum(f["te_nombra"] for f in hechas), "detalle": filas}

# ---------------------------------------------------------------- servidor


@mcp.tool()
def estado_conexion() -> dict:
    """Comprueba la conexión: cuenta de servicio y a qué tiene acceso en GA4, Search Console y GTM."""
    salida = {"cuenta_servicio": cuenta_servicio()}
    for nombre, f in (("ga4", ga4_propiedades), ("search_console", gsc_sitios), ("tag_manager", gtm_contenedores),
                      ("bing", bing_cupo_envio),
                      ("gemini", lambda: "clave cargada" if os.environ.get("GEMINI_API_KEY") else "ERROR: falta GEMINI_API_KEY")):
        try:
            salida[nombre] = f()
        except Exception as e:  # se informa por servicio, sin cortar el resto
            salida[nombre] = f"ERROR: {e}"
    return salida


def app() -> Starlette:
    token = os.environ.get("MCP_TOKEN", "")
    if len(token) < 24:
        raise RuntimeError("MCP_TOKEN tiene que tener al menos 24 caracteres.")
    interno = mcp.streamable_http_app()
    return Starlette(
        routes=[Route("/", lambda r: PlainTextResponse("ok")), Mount(f"/{token}", app=interno)],
        lifespan=lambda a: mcp.session_manager.run(),
    )


if __name__ == "__main__":
    uvicorn.run(app(), host="0.0.0.0", port=int(os.environ.get("PORT", "8000")), proxy_headers=True,
                forwarded_allow_ips="*")
