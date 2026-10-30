"""Consultas a Gemini (plan gratuito) con búsqueda en Google, para medir si las IA te citan."""
import json
import os
import re

import requests

MARCA = re.compile(r"crece\s*con\s*ads|crececonads|presmanes", re.I)


def disponible():
    return bool(os.environ.get("GEMINI_API_KEY"))


def _gemini(prompt, buscar=True, json_out=False):
    model = os.environ.get("GEMINI_MODEL", "gemini-flash-latest")
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"
    body = {"contents": [{"parts": [{"text": prompt}]}]}
    if buscar:
        body["tools"] = [{"google_search": {}}]
    if json_out:
        body["generationConfig"] = {"responseMimeType": "application/json"}
    r = requests.post(url, params={"key": os.environ["GEMINI_API_KEY"]}, json=body, timeout=120)
    r.raise_for_status()
    cand = r.json()["candidates"][0]
    texto = "".join(p.get("text", "") for p in cand.get("content", {}).get("parts", []))
    fuentes = [c["web"].get("title") or c["web"].get("uri")
               for c in cand.get("groundingMetadata", {}).get("groundingChunks", []) if "web" in c]
    return texto, fuentes


def preguntar(pregunta):
    """Hace la pregunta como la haría un cliente y devuelve si te mencionan y qué fuentes cita."""
    texto, fuentes = _gemini(pregunta + "\nRespondé en español rioplatense. Si recomendás profesionales o empresas, nombralos.")
    mencion = bool(MARCA.search(texto) or any(MARCA.search(f or "") for f in fuentes))
    return mencion, texto, fuentes


def proponer_temas(busquedas, sin_mencion, n=5):
    """Propone guías para crececonads.site a partir de lo que la gente busca y donde no aparecés."""
    prompt = f"""Sos estratega de SEO y GEO de CreceConAds (Damián Presmanes, Argentina): campañas de ventas en Meta Ads
para tiendas online, agentes de IA para WhatsApp y automatización de procesos con IA.
Búsquedas reales en Google que ya muestran la web (consulta, impresiones, posición): {json.dumps(busquedas[:40], ensure_ascii=False)}
Preguntas a asistentes de IA donde CreceConAds NO aparece: {json.dumps(sin_mencion, ensure_ascii=False)}
Proponé {n} guías nuevas para publicar en crececonads.site/guias que respondan una pregunta concreta de un dueño de tienda online.
Devolvé JSON: lista de objetos con "titulo", "pregunta_que_responde", "por_que" (una línea, citando el dato que lo justifica)."""
    texto, _ = _gemini(prompt, buscar=False, json_out=True)
    return json.loads(texto)
