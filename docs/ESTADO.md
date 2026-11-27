# Estado de la web y del embudo de mails · leer antes de trabajar

Actualizado: 24/11/2026. Si un chat nuevo retoma este trabajo, **arranca acá**: lo que figura como hecho está
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
- Calendario con temas cargados hasta el 25/01. La guía semanal toma la primera fila sin publicar desde el lunes próximo (17/11: se adelanta Navidad, semana del 30/11, por decisión de Damián).

**Hechos el 11/11 (no rehacer):** GTM y `generate_lead` como evento clave; 13 recursos de la semana 2; web lista para
novedades diarias (tema Novedades de Meta e IA, NewsArticle, "Seguí leyendo" por tema); MCP de Google y Bing (abajo);
sitemap reenviado a Google y 39 URLs enviadas a Bing; columnas nuevas en `Ideas` (A–L) para el investigador.

**Página /agentes (publicada el 16/11 con OK de Damián, merge de la rama `agentes`):** oficina animada del equipo de agentes a partir del prototipo
aprobado (artifact U7nHsnpCS271RxGSprsnFR). Horarios reales de las tareas, sin Prospector, sin clientes ni montos.
Fuente `contenido/pagina-agentes.html` (tipo nuevo `"pagina"` en el generador: CSS/JS propios, `"ancho": true`,
`og_sitio`), `assets/agentes.css|js`. CTA `data-cta="agendar"` → `/agendar` (`agendar_click`). La animación se frena
fuera de pantalla y con la pestaña oculta (probado: 0 cuadros por segundo). Link desde la home y entrada en el sitemap.
PageSpeed en celular en la vista previa: 100 / 100 / 100 / SEO 92 (el 92 es el `noindex` que Vercel pone en las vistas previas).
Avisada a IndexNow y Bing el 16/11. Falta pedir la indexación en Google (Search Console).
Pendiente para después: resumen diario de datos en la misma página.
**Enlaces a /agentes (publicados el 16/11 con OK de Damián):** "Equipo en vivo" en el menú (home y páginas
generadas; en la home "Cómo funciona" y "Preguntas" se ocultan por debajo de 1240 px y "Automatizaciones" por debajo de 980 px
para que no se parta; en las páginas generadas el menú se oculta por debajo de 800 px) y en el pie; recuadro `AGENTES_BLOQUE` en las guías de los temas agentes-ia y automatizacion y en
/guias/tema/agentes-ia; en /agentes, botón "Probá el agente: escribí AGENTE" (wa.me, `data-cta="whatsapp"`) en la ficha y la
lista del Bot de WhatsApp y link a Instagram en el Bot de Instagram (`cta_click`, clases btn btn-sm / btn-line); borrado
`recursos/_prueba.html` (da 404). Avisado a IndexNow y Bing.
**Menú de la home (16/11, OK de Damián):** 5 opciones (Servicios, Resultados, Guías, Quién soy, ● Equipo en vivo con punto verde,
clase `nav-vivo`); fuera Automatizaciones, Cómo funciona y Preguntas (siguen como secciones de la home).

**17/11:** guía corta publicada `/guias/mejor-dia-hora-publicidad-instagram` (OK de Damián; IndexNow y Bing avisados; fila en Ideas).
**18/11:** guía semanal de Navidad publicada `/guias/publicidad-instagram-navidad-tienda-online` (OK de Damián; Calendario
fila 30/11 en "Publicada"; IndexNow y Bing avisados).

**19/11:** guía corta publicada `/guias/como-pagar-publicidad-instagram-argentina` (OK de Damián; IndexNow y Bing; fila en Ideas).
**Novedades IA (19/11):** se publica sola con lo ✅ del Vigía de IA (decisión de Damián en ceo/DECISIONES.md; tarea del Vigía actualizada). Publicadas las 3 propuestas trabadas (Gemini en Apps Script, skills de Gemini, Gemini Notebook). Las ramas `novedades-ia-*` viejas quedan sin uso (el entorno no puede borrarlas).

**19/11, interactivos (OK de Damián):** las guías de pagos, Navidad y horarios tienen su `<figure class="viz">` (elegir medio de pago, línea de tiempo de diciembre que marca la semana actual, simulador de presupuesto). Las tareas de guía corta y semanal piden un interactivo obligatorio en cada guía. Novedades (Meta e IA): banda por herramienta/tema (`herramienta()` en el generador, campo opcional "herramienta"), filtros, botón Compartir (`cta_click` compartir_novedad), imagen para redes por novedad (`img/novedades/<pagina>-<id>.jpg`, `portadas_og.novedad`, og:image de la página = la última) y anclas estables `n-<fecha>-<k>` (k contado desde la más vieja del día).

**24/11, conversión (OK de Damián):** barra fija de WhatsApp (`barra_wa()` en el generador, `meta["barra"]`) en todas las guías y en /novedades-meta y /novedades-ia: aparece después de 700 px y se esconde cerca de `section.cta`/pie; el mensaje lleva el título de la página; `data-cta=whatsapp` → `cta_click` con la página. /agentes suma "Escribime por WhatsApp" en el cierre. Medir clics en el parte del 30/11.

**27/11, arreglo (OK de Damián, detectado por la sesión 3):** en /radiografia, "Siguiente" mandaba cta_click y disparaba un Contact falso en Meta y el evento clave de GA4; ahora manda su propio evento radiografia_paso2 (sin etiqueta en GTM).

**27/11, CRM etapa 1 (OK de Damián):** vista «Hoy» (Vencidos, Para hoy, Abiertos sin próximo paso), acciones rápidas Hecho/Mover/Perdido (motivo obligatorio), enlaces directos (Instagram, LinkedIn, WhatsApp, mail, web), campos nuevos `canal` (instagram, linkedin, mail, whatsapp, web, otro) y `linkedin`, filtro por canal, DELETE en /api/crm (botón Eliminar en la ficha), importación sin duplicar por Instagram/LinkedIn/web, tablero con scroll por columna y Ganado/Perdido plegados, textos largos que no se salen de las tarjetas. POST y PATCH sin cambios. Pendiente: borrar los contactos «PRUEBA…» con OK de Damián; etapas 2 y 3 después de unos días de uso.

**27/11, avisos y API de Conversiones (OK de Damián):** /api/lead manda mail inmediato (Gmail, GMAIL_USUARIO + GMAIL_APP_PASSWORD) con botón para responder por WhatsApp, y Lead/LeadCalificado por la API de Conversiones (META_PIXEL_ID = 1828726871801334, el píxel que carga la web por GTM; META_CAPI_TOKEN). Píxel y servidor comparten event_id (GTM versión 7: variable DLV - event_id en las etiquetas de Meta). El píxel 476118299562902 NO es el de la web. Probado en vivo sin errores (4 contactos "PRUEBA… Claude (borrar)" en el CRM).

**26/11, oferta de pauta (OK de Damián):** crececonads.site/radiografia, landing sin menú, «3 fugas en 48 h», formulario en 2 pasos → /api/lead → CRM (Calificado si invierte ≥ $ 2.000.000/mes). Eventos: recurso_desbloqueado (Lead de Meta + generate_lead) y lead_calificado (Meta LeadCalificado + GA4 lead_calificado; GTM versión 6 publicada). Probada en vivo con cookie interna: hay un contacto "PRUEBA Claude (borrar)" en el CRM. Kit en docs/kit-radiografia.md (copia de ceo/procesos/RADIOGRAFIA.md). Falta: campaña en pausa (dpto. 3) con los 3 videos, y confirmación automática por WhatsApp.

**26/11, CRM (OK de Damián):** crececonads.site/crm, privado (clave CRM_CLAVE en Vercel, solo Production), noindex. Datos en Vercel Blob privado `crececonads-crm` (gru1), un JSON por contacto en crm/contactos/. /api/lead (público, formulario de la oferta → origen pauta/web) y /api/crm (lista, crea, edita, importa el pipeline). Etapas Nuevo → Contactado → Ideas enviadas → Llamada → Propuesta → Ganado/Perdido, próximo paso con fecha, seguimientos de hoy, historial. Hay un contacto de prueba "Prueba Claude" para marcar Perdido. Pendiente: página de la oferta "Radiografía de 3 fugas" (investigación en docs/investigacion-oferta-pauta.md, guiones en docs/guiones-pauta-fugas.md).

**26/11, Preguntas de Google (OK de Damián):** pestaña nueva "Preguntas de Google" en la planilla SEO (A–G: fecha, tema, pregunta, tipo, guía que la responde, acción, estado). El parte SEO de los lunes (paso 3b) expande el autocompletar de Google AR con como/que/cuanto/por que/cuando/donde/se puede para 6 temas y carga solo las nuevas; la guía corta toma de ahí (primero "guía nueva") y responde en su FAQ las "FAQ en <guía>". Reemplaza a AnswerThePublic, gratis.

**26/11, guía corta (OK de Damián):** /guias/respuestas-rapidas-whatsapp-business (búsqueda "respuestas rapidas whatsapp business", autocompletar AR), con el probador de atajos `viz-atajo` (reglas oficiales: 50 respuestas, atajo sin espacios de hasta 25 caracteres). Fuentes: Centro de ayuda de WhatsApp. IndexNow y Bing; Ideas marcada Publicada.

**25/11, SEO punto 1 y 2 (OK de Damián):** títulos y descripciones más cortos para celular en no-aparece, activar-desactivar-agente y cambios-meta-noviembre; guía herramientas-automatizar-procesos-ia reenfocada en "ia para automatizar procesos" (estaba en el puesto 82): secciones nuevas "Qué procesos se pueden automatizar con IA" (con el caso UTN 4–5 h → 2 h) y "Cómo empezar en 4 pasos", FAQ nueva, OG nueva. Enviadas a IndexNow y Bing. Informe SEO de noviembre: https://claude.ai/artifact/MfRkb7k8E9kpyp3LdoW1Jn. Medir CTR y posición en el parte del 30/11.

**24/11, novedades con página propia (OK de Damián):** cada novedad de /novedades-ia y /novedades-meta tiene `/<pagina>/<slug>` (slug guardado en el JSON por `asegurar_slugs()`, no cambia si se corrige el título; `novedad_pagina()`). Las anclas viejas `#n-…` redirigen a la página propia conservando las UTM (arreglo del bug: el ancla a veces abría la lista al final). Compartir usa la URL propia; las 30 páginas están en sitemap y llms.txt, enviadas a IndexNow (30) y Bing (10). Actualizados: REDES-DIARIO.md (lista de URLs), tarea Threads diario y Vigía de IA. Después (OK de Damián): la lista muestra solo un resumen y "Leer la novedad →" (el texto completo queda en la página propia, sin contenido duplicado); la Cola de la planilla de Redes pasó a las URLs nuevas. Las 2 tareas del Vigía de Meta no se pudieron editar desde acá (el filtro de privacidad frena prompts con el mail): en su chequeo diario verificar que commiteen la carpeta novedades-meta/.

**24/11, portfolio oculto (OK de Damián):** /portfolio-damian-presmanes (redirige desde /portfolio-automatizaciones-k7q2) para presentar a un consultor junto con el CV (CV adaptado aparte, en PDF). Perfil con foto, resultados de clientes ya publicados, caso UTN con demo de planilla (datos inventados), líneas de montaje de Meta orgánico, Meta Ads clientes y SEO, "Qué puedo aportar". Campo nuevo `"oculta": true` en el generador: noindex y fuera del sitemap. Damián ya se recibió (técnico universitario, UTN): /damian-presmanes dice "me recibí" y está bien.

**24/11 (OK de Damián):** publicadas `/guias/como-promocionar-publicacion-instagram` (guía corta, interactivo "¿desde dónde promocionar?") y `/guias/whatsapp-inmobiliaria-alquileres-verano` (semanal del 07/12, checklist de temporada; Calendario en Publicada); botón de WhatsApp debajo del diagnóstico en "no aparece" (`data-cta=whatsapp`). IndexNow y Bing avisados.

**23/11, parte SEO:** 42 sesiones (16-22/11, +75%), Google 305 impresiones y 6 clics en 28 días (antes 46 y 3), 18 de 19 páginas indexadas (falta agente-ia-whatsapp-tienda-online), 0 contactos. "No aparece" pasó de 2 s a 208 s promedio con el diagnóstico. Bing sin datos (respuesta vacía) y Visibilidad IA sin medir (Gemini 429). 5 ideas nuevas en Ideas; Calendario cubierto hasta el 25/01.

**19/11, guía «no aparece» (OK de Damián):** 48 impresiones y 0 clics en Google, visitas de 2-3 s. Nuevo titulo_seo y descripción ("Qué hacer según el estado") y diagnóstico interactivo por estado (`viz-estado-anuncio`, evento `viz_resultado`). Medir CTR en 1-2 semanas. /agentes: las sesiones de 0 s entran directo desde Facebook/Google (vistas previas); quien llega desde la web se queda (518 s en 8 vistas).

**18/11, pie legal (OK de Damián):** en todas las páginas, "© 2026 CreceConAds® · Damián Presmanes · CUIT 20-33488306-0",
"CreceConAds® es marca registrada" (marca concedida, confirmado por Damián) y QR de Data Fiscal de ARCA (F.960/NM, link
`qr.afip.gob.ar/?qr=00BDHbA6FI6aH0XpUoj7bw,,`). En el generador (PIE) y a mano en index, agendar, newsletter y páginas legales.
`legalName` y `taxID` en el marcado de la home. Botón de arrepentimiento y link a Defensa del Consumidor: Damián lo consulta con su contador.

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
