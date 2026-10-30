"""Agente SEO y GEO de CreceConAds.

Corre una vez por semana en Railway y deja todo en una planilla de Google:
  - busquedas: qué búsquedas de Google muestran crececonads.site (Search Console)
  - ia: si los asistentes de IA te nombran cuando un cliente pregunta (Gemini con búsqueda)
  - ideas: guías nuevas para publicar, a partir de lo anterior
  - indexnow: avisa a Bing y otros buscadores qué páginas tiene la web

Uso: python main.py [todo|busquedas|ia|ideas|indexnow]
Cada tarea que no tenga sus credenciales se saltea y lo avisa, sin cortar las demás.
"""
import datetime as dt
import os
import re
import sys
from pathlib import Path

import requests

import ia
from google_api import Google

SITIO = os.environ.get("GSC_SITE", "https://crececonads.site/")
SHEET_ID = os.environ.get("SHEET_ID")
INDEXNOW_KEY = os.environ.get("INDEXNOW_KEY", "014f905a0d3967e58894626d1e7a2c7c")
HOY = dt.date.today()


def log(msg):
    print(f"[{dt.datetime.now():%H:%M:%S}] {msg}", flush=True)


def busquedas(g, estado):
    if not (g.ok and SHEET_ID):
        return log("busquedas: falta GOOGLE_SA_JSON o SHEET_ID, se saltea")
    fin = HOY - dt.timedelta(days=3)  # Search Console tarda ~2 días en tener datos
    ini = fin - dt.timedelta(days=27)
    filas = g.gsc_query(SITIO, ini.isoformat(), fin.isoformat(), "query")
    paginas = g.gsc_query(SITIO, ini.isoformat(), fin.isoformat(), "page")
    tabla = [["Búsqueda", "Clics", "Impresiones", "CTR", "Posición"]] + [
        [r["keys"][0], r["clicks"], r["impressions"], round(r["ctr"] * 100, 1), round(r["position"], 1)] for r in filas]
    g.sheet_write(SHEET_ID, "Búsquedas", tabla)
    g.sheet_write(SHEET_ID, "Páginas", [["Página", "Clics", "Impresiones", "Posición"]] + [
        [r["keys"][0], r["clicks"], r["impressions"], round(r["position"], 1)] for r in paginas])
    clics = sum(r["clicks"] for r in filas)
    impresiones = sum(r["impressions"] for r in filas)
    estado["busquedas"] = [[r["keys"][0], r["impressions"], round(r["position"], 1)] for r in filas]
    estado["resumen"] = [clics, impresiones, len(filas)]
    log(f"busquedas: {len(filas)} búsquedas, {clics} clics, {impresiones} impresiones ({ini} a {fin})")


def visibilidad_ia(g, estado):
    if not ia.disponible():
        return log("ia: falta GEMINI_API_KEY, se saltea")
    preguntas = [l.strip() for l in Path(__file__).with_name("preguntas.txt").read_text(encoding="utf-8").splitlines()
                 if l.strip() and not l.startswith("#")]
    tabla = [["Fecha", "Pregunta", "¿Te nombra?", "Fuentes que cita", "Respuesta (inicio)"]]
    sin_mencion = []
    for p in preguntas:
        try:
            mencion, texto, fuentes = ia.preguntar(p)
        except requests.HTTPError as e:
            log(f"ia: error en '{p[:40]}…': {e}")
            continue
        if not mencion:
            sin_mencion.append(p)
        tabla.append([HOY.isoformat(), p, "SÍ" if mencion else "no", ", ".join(dict.fromkeys(fuentes))[:500],
                      re.sub(r"\s+", " ", texto)[:400]])
    nombrado = len(preguntas) - len(sin_mencion)
    estado["sin_mencion"] = sin_mencion
    estado["ia"] = [nombrado, len(preguntas)]
    if g.ok and SHEET_ID:
        g.sheet_append(SHEET_ID, "Visibilidad IA", tabla[1:])
    log(f"ia: te nombra en {nombrado} de {len(preguntas)} preguntas")


def ideas(g, estado):
    if not (ia.disponible() and g.ok and SHEET_ID):
        return log("ideas: falta GEMINI_API_KEY, GOOGLE_SA_JSON o SHEET_ID, se saltea")
    temas = ia.proponer_temas(estado.get("busquedas", []), estado.get("sin_mencion", []))
    g.sheet_append(SHEET_ID, "Ideas", [[HOY.isoformat(), t.get("titulo", ""), t.get("pregunta_que_responde", ""),
                                        t.get("por_que", ""), "Pendiente"] for t in temas])
    log(f"ideas: {len(temas)} temas nuevos")


def indexnow(g, estado):
    sitemap = requests.get(SITIO.rstrip("/") + "/sitemap.xml", timeout=30).text
    urls = re.findall(r"<loc>(.*?)</loc>", sitemap)
    host = re.sub(r"^https?://|/$", "", SITIO)
    r = requests.post("https://api.indexnow.org/indexnow", timeout=30, json={
        "host": host, "key": INDEXNOW_KEY, "keyLocation": f"{SITIO.rstrip('/')}/{INDEXNOW_KEY}.txt", "urlList": urls})
    log(f"indexnow: {len(urls)} páginas enviadas, respuesta {r.status_code}")


def historial(g, estado):
    if not (g.ok and SHEET_ID):
        return
    clics, impresiones, n = estado.get("resumen", ["", "", ""])
    nombrado, total = estado.get("ia", ["", ""])
    g.sheet_append(SHEET_ID, "Historial", [[HOY.isoformat(), clics, impresiones, n, nombrado, total]])


TAREAS = {"busquedas": busquedas, "ia": visibilidad_ia, "ideas": ideas, "indexnow": indexnow}

if __name__ == "__main__":
    pedido = sys.argv[1] if len(sys.argv) > 1 else "todo"
    g = Google()
    estado = {}
    for nombre, tarea in TAREAS.items():
        if pedido in ("todo", nombre):
            try:
                tarea(g, estado)
            except Exception as e:  # una tarea que falla no corta las demás
                log(f"{nombre}: falló: {e}")
    if pedido == "todo":
        historial(g, estado)
