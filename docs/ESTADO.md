# Estado de la web y del embudo de mails · leer antes de trabajar

Actualizado: 11/11/2026. Si un chat nuevo retoma este trabajo, **arranca acá**: lo que figura como hecho está
hecho y probado en producción; no se rehace ni se reescribe. Antes de tocar algo, `git pull origin web-v2`.

## Organigrama (desde el 13/11)
Esta sesión es el departamento 1 (web, guías, SEO y novedades). Al terminar un trabajo, además de este archivo, actualizar la fila
"Web, guías y SEO" de la sección 1 de `ceo/ESTADO.md` (repo crececonads-sistema, main), en una línea. Ver `ceo/ORGANIGRAMA.md`.

## Cómo funciona la web
- Repo `dpresmanes/crececonads`, rama **`web-v2`**. Vercel (proyecto "project") publica solo cada push a esa rama
  (conectado el 3/11; la landing vieja `dycLandingLeads` ya no está conectada).
- Contenido: un archivo por guía o recurso en `contenido/` (`guia-*.html`, `recurso-*.html`) con cabecera JSON.
  `python tools/build_contenido.py` arma `guias/`, `recursos/`, `guias/tema/`, sitemap, `llms.txt`, el bloque de
  guías de la home y las imágenes para compartir (`img/og/<slug>.png`, `tools/portadas_og.py`).
- Después de publicar: avisar a IndexNow (clave `014f905a0d3967e58894626d1e7a2c7c`). Google lee el sitemap solo.
- `docs/` no se publica (`.vercelignore`). `propuestas/` sí, con noindex.

## Hecho (no rehacer)
- 8 guías con visuales interactivos, FAQ y JSON-LD. Temas con página propia: Meta Ads, Agentes de IA, Automatización.
- 7 recursos con formulario (nombre, mail, rubro) que desbloquea el resto y da de alta en Sender.
- Listados `/guias` y `/recursos`: buscador, menús de tema y formato, "Ver más" de a 12.
- Bloque "Novedades de Meta en 5 minutos" al final de cada guía y en los listados → `/newsletter` (página de otra sesión).
- `api/suscribir.js`: alta en Sender. Lista recursos (grupo `SENDER_GROUP_ID`, campos rubro y recurso) o newsletter
  (`lista: "newsletter"`, grupo `SENDER_NEWSLETTER_GROUP_ID`, nombre opcional). Token `SENDER_API_TOKEN` en Vercel.
- Mails de la secuencia: diseño en `tools/build_mails.py` → `docs/mails/`, portadas `tools/portadas_mails.py` →
  `img/mails/`. Copias para "Import from URL" de Sender: `crececonads.site/propuestas/mails/mail-N-r4p9` (N 1 a 5);
  vista previa con botón de copiar: `crececonads.site/propuestas/mails-secuencia-r4p9`. Textos: `docs/secuencia-mails-recursos.md`.
- DNS en Hostinger: DKIM (`sender._domainkey` CNAME), DMARC (`_dmarc`) y SPF combinado con Google
  (`v=spf1 include:_spf.google.com include:sendersrv.com ~all`). Publicados y verificados.
- Home: título y descripción para "agencia de Meta Ads en Argentina".
- Agente SEO (Apps Script v4.1, `agente-seo/apps-script/Codigo.gs`): ya pegado y corrido; filtro de ruido e intención.

## Pendiente (en orden) · al 11/11
**De Damián:**
1. **Instagram semana 2:** en la PC, que el CEO baje `main` (semana 2 ya mergeada), corra `s2_gen.py`, `s2_videos.py render`
   y `s2_recursos.py`, y que `ig-programador` programe desde el 11/11. Reubicar los posts del 9 y 10/11 (no salieron).
   Las 13 páginas de recurso de la semana 2 ya están en la web (subidas el 11/11).
2. **Sender:** confirmar que la automatización "Secuencia recursos" (grupo Recursos, 5 mails, delays 2/3/4/5 días) esté *Active*.
3. **Apps Script:** borrar los activadores `correrAgente` y `seguir` (lo reemplaza la tarea "SEO semanal"). Código v4.3 en el repo.
4. **Links externos:** bio de Instagram → crececonads.site/guias, link en Google Business, un post de LinkedIn por guía.
5. **Google Business API:** pedir acceso (developers.google.com/my-business/content/prereqs, proyecto apt-bonbon-464013-s6).
6. **Indexación en Google:** pedirla a mano en Search Console (máx. ~10 por día) con la lista que pasa el parte del lunes.
7. Invitación al newsletter desde Gmail a su lista. Perfil de X (sumarlo al `sameAs` de `index.html` y del perfil de autor).
8. Aprobar con "OK" la página diaria y la guía semanal (llegan como aviso en la sesión "Estrategia de guías semanales").

**De la web (automático o en curso):**
- Gemini del MCP dio 429 (cupo del día agotado) el 11/11; se reprueba el 12/11. Si sigue: facturación con tope o preguntas sin búsqueda.
- Calendario sin temas desde el 30/11: los carga la tarea "SEO semanal" con las ideas del ig-investigador (primeras 15 antes del 20/11).

**Hechos el 11/11 (no rehacer):** GTM y `generate_lead` como evento clave; 13 recursos de la semana 2; web lista para
novedades diarias (tema Novedades de Meta e IA, NewsArticle, "Seguí leyendo" por tema); MCP de Google y Bing (abajo);
sitemap reenviado a Google y 39 URLs enviadas a Bing; columnas nuevas en `Ideas` (A–L) para el investigador.

## Tareas programadas (corren en la sesión "Estrategia de guías semanales", que tiene el repo, la planilla y el MCP)
| Cuándo | Tarea |
|---|---|
| Martes y jueves 9:12 | Guía corta "cómo hacer" (800–1.200 palabras, búsqueda con evidencia real, sin pisar guías ni /novedades-meta o /novedades-ia) → borrador en `contenido/borradores/`, se publica con OK. Si no hay tema que cumpla, no se escribe |
| Martes 10:40 | Guía larga del tema de la semana → borrador en `contenido/borradores/`, se publica con OK |
| Lunes 9:42 | SEO semanal: datos de Google/Bing/GA4 a la planilla, ideas, Calendario, indexación, velocidad, visibilidad IA y parte |
| Diario 8:23 / lunes 8:47 | Vigía de Meta (actualiza el doc "Meta Ads – Reglas vigentes") |

## Estrategia de contenido (desde el 11/11/2026)
Objetivo: que Damián sea referente en IA y marketing para pymes y tiendas online de Argentina, y que cada página lleve a consultas.
- **Martes y jueves, 9:12** (desde el 11/11; antes lunes a viernes): una guía corta (tarea programada "Guía corta", corre en la sesión "Estrategia de guías semanales").
  Prioridad: novedad confirmada de Meta, WhatsApp o IA (fuente: documento del Vigía "Meta Ads – Reglas vigentes"
  1P7uys7oTec63vIoG55hLDSUCkucr5DmasPlevTY14T4, que se actualiza a las 8:23); si no hay, "cómo hacer" o pregunta real de la planilla.
  Tags "Novedades · …" van al tema /guias/tema/novedades (marcado NewsArticle).
- **Martes 10:40:** guía larga del tema de la semana (Calendario), la misma del principal de Instagram.
- **Mensual:** resumen de novedades del mes y actualizar 2 guías viejas.
- Cada página: respuesta corta arriba, FAQ, "qué hacer en tu negocio", 2+ enlaces internos, fuentes. Nada sin fuente oficial.
- Aprobación: cada borrador queda en `contenido/borradores/` (en web-v2, no se publica) y se mueve a `contenido/` cuando Damián responde OK.
  No se usan ramas: el entorno en la nube no puede borrar ramas de GitHub.
- **Lunes 9:42: "SEO semanal"** (tarea en esta sesión, con el MCP de Google y Bing): llena Búsquedas, Páginas, Bing, Historial y
  Visibilidad IA, completa el volumen de Ideas, carga el Calendario a 4 semanas, revisa indexación y velocidad, y manda el parte.
  Reemplaza al Apps Script (sacarle el activador de los lunes). Ideas: el ig-investigador carga ~30 por mes (columnas A–K).

## MCP de Google y Bing (desde el 11/11)
Railway, proyecto `mcp-google` (carpeta `mcp-google/`). Cuenta de servicio mcp-crececonads@apt-bonbon-464013-s6.iam.gserviceaccount.com
con acceso a GA4 465752183 (Editor), Search Console https://crececonads.site/ y GTM-TKWHBHB9. Conector "Google CreceConAds" en claude.ai.
Variables en Railway: GOOGLE_SA_JSON, MCP_TOKEN, BING_API_KEY, GEMINI_API_KEY, PAGESPEED_API_KEY, GA4_PROPIEDAD, GSC_SITIO, GTM_CUENTA,
GTM_CONTENEDOR. 28 herramientas (GA4, Search Console, GTM, Bing, IndexNow, PageSpeed, visibilidad IA); ver `mcp-google/README.md`.
Railway a veces deja las variables "en espera": hay que tocar Deploy (o aplicar con accept-deploy).
PageSpeed home 11/11: 97/100/100/100 en celular.
Indexación al 13/11: 16 páginas en Google (home, perfil, /guias, /recursos, 3 temas, 2 novedades y 7 de 9 guías). Faltan
agente-ia-whatsapp-tienda-online y escalar-ventas-tienda-online-meta-ads ("descubiertas, sin indexar") y los 21 recursos (Google no los conoce).

## Reglas
Nada de precios propios ni montos del equipo; no inventar datos (los de Meta, con fuente y "verificalo en tu cuenta");
nunca pedir claves por chat; publicar solo con el OK de Damián; sin capturas con teléfonos ni datos de clientes.
