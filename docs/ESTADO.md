# Estado de la web y del embudo de mails · leer antes de trabajar

Actualizado: 7/11/2026. Si un chat nuevo retoma este trabajo, **arranca acá**: lo que figura como hecho está
hecho y probado en producción; no se rehace ni se reescribe. Antes de tocar algo, `git pull origin web-v2`.

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

## Pendiente (en orden)
1. **Sender, automatización "Secuencia recursos"** (la arma Damián en la web de Sender; Automation → Create from
   scratch): trigger "Subscriber joins a group" = Recursos → Email 1 → Delay 2 días → Email 2 → Delay 3 → Email 3 →
   Delay 4 → Email 4 → Delay 5 → Email 5 (opcional: Action → copiar al grupo Newsletter). Cada email: Custom HTML →
   Import from URL con el link de arriba. Asuntos y vistas previas en `docs/secuencia-mails-recursos.md`.
   Activar con el SPF en verde en Sender; si sigue rojo, cambiar `~all` por `?all` en Hostinger.
2. **GTM**: variables `recurso` y `rubro`, activador evento `recurso_desbloqueado`, etiqueta GA4 `generate_lead`;
   en GA4 marcarlo como evento clave. Ver también `docs/medicion/`.
3. ~~**Guías nuevas**~~ (resuelto el 11/11, ver "Estrategia de contenido"): ritmo recomendado 1 por semana (tema del Calendario) + 1 corta de "cómo hacer" cada 2 semanas +
   1 de Novedades por mes. Decidir si se programa una tarea semanal que escriba la guía y la deje para aprobar.
   La de Novedades se escribe con el informe del Vigía de diciembre (solo cambios confirmados).
4. Perfil de X: cuando exista, sumarlo al `sameAs` de `index.html` y del perfil de autor.

## Estrategia de contenido (desde el 11/11/2026)
Objetivo: que Damián sea referente en IA y marketing para pymes y tiendas online de Argentina, y que cada página lleve a consultas.
- **Lunes a viernes, 9:12:** una página nueva (tarea programada "Página diaria", corre en la sesión "Estrategia de guías semanales").
  Prioridad: novedad confirmada de Meta, WhatsApp o IA (fuente: documento del Vigía "Meta Ads – Reglas vigentes"
  1P7uys7oTec63vIoG55hLDSUCkucr5DmasPlevTY14T4, que se actualiza a las 8:23); si no hay, "cómo hacer" o pregunta real de la planilla.
  Tags "Novedades · …" van al tema /guias/tema/novedades (marcado NewsArticle).
- **Martes 10:40:** guía larga del tema de la semana (Calendario), la misma del principal de Instagram.
- **Mensual:** resumen de novedades del mes y actualizar 2 guías viejas.
- Cada página: respuesta corta arriba, FAQ, "qué hacer en tu negocio", 2+ enlaces internos, fuentes. Nada sin fuente oficial.
- Aprobación: cada borrador queda en una rama (`pagina-AAAA-MM-DD` o `guia-AAAA-MM-DD`) y se publica cuando Damián responde OK.
- Agente SEO v4.2 (Apps Script, lunes 9:00) trabaja por tandas (límite de 6 minutos de Google). Railway: solo IndexNow.

## Reglas
Nada de precios propios ni montos del equipo; no inventar datos (los de Meta, con fuente y "verificalo en tu cuenta");
nunca pedir claves por chat; publicar solo con el OK de Damián; sin capturas con teléfonos ni datos de clientes.
