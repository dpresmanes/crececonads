# crececonads.site

Landing de CreceConAds. Es un sitio estático: no necesita compilación.

- `index.html`: la página. Para cambiar el WhatsApp o el calendario, buscá `EDITAR ACÁ`.
- `img/`: fotos y la imagen para compartir (`og.jpg`).
- `robots.txt`, `sitemap.xml`, `llms.txt`: para buscadores y asistentes de IA.
- `vercel.json`: configuración de Vercel.

Los clics en los botones envían el evento `cta_click` a Google Tag Manager (`GTM-TKWHBHB9`), con `cta_type` = `agendar`, `agendar_whatsapp` o `whatsapp`.
