# Agente SEO y GEO

Corre en Railway todos los lunes a las 9:00 (Argentina) y escribe en la planilla "Agente SEO · CreceConAds".

| Tarea | Qué hace | Necesita |
|---|---|---|
| `busquedas` | Búsquedas y páginas de Search Console, últimos 28 días | `GOOGLE_SA_JSON`, `SHEET_ID` |
| `ia` | Hace las preguntas de `preguntas.txt` a Gemini con búsqueda y anota si te nombra | `GEMINI_API_KEY` |
| `ideas` | Propone 5 guías nuevas para la web | las tres anteriores |
| `indexnow` | Avisa a Bing y otros buscadores las páginas del sitemap | nada |

Variables en Railway:
- `GOOGLE_SA_JSON`: el JSON completo de la cuenta de servicio de Google (no subirlo nunca al repositorio).
- `SHEET_ID`: el ID de la planilla.
- `GEMINI_API_KEY`: clave gratuita de aistudio.google.com.
- Opcionales: `GSC_SITE` (por defecto `https://crececonads.site/`), `GEMINI_MODEL`, `INDEXNOW_KEY`.

Para probar a mano: `python main.py ia` (o `busquedas`, `ideas`, `indexnow`).
Para cambiar las preguntas, editá `preguntas.txt`.
