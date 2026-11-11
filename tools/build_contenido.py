"""Arma las páginas de contenido de crececonads.site a partir de contenido/*.html.

Cada archivo de contenido empieza con un comentario JSON con sus datos:
<!--{"tipo": "guia" | "perfil", "slug": "...", "titulo": "...", "descripcion": "...",
    "respuesta": "...", "fecha": "AAAA-MM-DD", "tag": "...", "faq": [["pregunta", "respuesta"], ...]}-->
y sigue con el cuerpo en HTML (los <h2 id="..."> arman el índice).

Genera guias/<slug>.html, guias/index.html, <slug>.html para el perfil,
y actualiza sitemap.xml y la sección de guías de llms.txt.

Uso: python3 tools/build_contenido.py
"""
import html
import json
import portadas_og
import re
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
SITIO = "https://crececonads.site"
GTM = "GTM-TKWHBHB9"
WA = "https://wa.me/5491173566942?text="
CAL = "/agendar"
PERSONA = SITIO + "/damian-presmanes#persona"
ORG = SITIO + "/#org"

# Vercel Web Analytics: visitas por página, origen y UTM, sin cookies. Se activa en el proyecto de Vercel.
VERCEL_ANALYTICS = ('<script>window.va=window.va||function(){(window.vaq=window.vaq||[]).push(arguments)};</script>'
                    '<script defer src="/_vercel/insights/script.js"></script>')

# Tag Manager se carga cuando la persona interactúa o 2 s después de cargar la página: así no
# compite con el contenido en celulares (Lighthouse: 270 ms de código de terceros en el hilo principal).
GTM_DIFERIDO = ("<script>window.dataLayer=window.dataLayer||[];dataLayer.push({'gtm.start':Date.now(),event:'gtm.js'});"
                "(function(){var c=0;function g(){if(c)return;c=1;var j=document.createElement('script');j.async=true;"
                "j.src='https://www.googletagmanager.com/gtm.js?id=" + GTM + "';document.head.appendChild(j);}"
                "['scroll','pointerdown','keydown','touchstart'].forEach(function(e){addEventListener(e,g,{once:true,passive:true});});"
                "addEventListener('load',function(){setTimeout(g,2000);});})();</script>\n" + VERCEL_ANALYTICS)

FUENTES = ('<link rel="preconnect" href="https://fonts.googleapis.com">\n'
           '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n'
           '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,800'
           '&family=DM+Sans:opsz,wght@9..40,400;9..40,700&family=IBM+Plex+Mono:wght@500&display=swap">')

CABECERA = f'''<header class="top"><div class="wrap">
  <a class="logo" href="/">Crece<b>Con</b>Ads</a>
  <nav aria-label="Secciones"><a href="/#resultados">Resultados</a><a href="/#servicios">Servicios</a><a href="/guias">Guías</a><a href="/recursos">Recursos</a><a href="/damian-presmanes">Quién soy</a></nav>
  <a class="btn btn-sm" data-cta="agendar" href="{CAL}">Agendar llamada</a>
</div></header>'''

PIE = '''<footer class="site-foot"><div class="wrap">
  <span>© 2026 CreceConAds · Damián Presmanes</span>
  <span><a href="/guias">Guías</a> · <a href="/recursos">Recursos</a> · <a href="https://www.instagram.com/crececonads/">Instagram</a> · <a href="https://maps.google.com/?cid=8214692810272884951">Google Maps</a> · <a href="/privacidad">Privacidad</a> · <a href="/eliminacion-de-datos">Eliminación de datos</a> · <a href="/terminos">Términos</a></span>
</div></footer>
<script>
  window.dataLayer = window.dataLayer || [];
  document.querySelectorAll("[data-cta]").forEach(a => a.addEventListener("click", () =>
    window.dataLayer.push({ event: "cta_click", cta_type: a.dataset.cta, cta_text: a.textContent.trim().slice(0, 60), cta_section: location.pathname })));
</script>'''

AUTOR = '''<aside class="autor">
  <img src="/img/damian-presmanes-avatar.jpg" alt="Damián Presmanes" width="72" height="72" loading="lazy">
  <div><b><a href="/damian-presmanes">Damián Presmanes</a></b>
  <p>Especialista en Meta Ads para tiendas online y en agentes de IA. Recibido en Comercio Electrónico y Marketing Digital en la UTN, con formación en programación. Fundador de CreceConAds.</p></div>
</aside>'''


def leer(path):
    texto = path.read_text(encoding="utf-8")
    m = re.match(r"\s*<!--(\{.*?\})-->\s*", texto, re.S)
    return json.loads(m.group(1)), texto[m.end():].strip()


def esc(t):
    return html.escape(t, quote=True)


def fecha_larga(iso):
    meses = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"]
    a, m, d = iso.split("-")
    return f"{int(d)} de {meses[int(m) - 1]} de {a}"


def documento(meta, url, ld, cuerpo):
    return f'''<!doctype html>
<html lang="es-AR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
{GTM_DIFERIDO}
<title>{esc(meta["titulo_seo"])}</title>
<meta name="description" content="{esc(meta["descripcion"])}">
<link rel="canonical" href="{url}">
<meta name="robots" content="index, follow, max-image-preview:large">
<meta name="author" content="Damián Presmanes">
<meta name="theme-color" content="#0A0F1F">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="icon" href="/favicon-48.png" sizes="48x48" type="image/png">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<meta property="og:type" content="{meta.get("og_tipo", "article")}">
<meta property="og:locale" content="es_AR">
<meta property="og:site_name" content="CreceConAds">
<meta property="og:url" content="{url}">
<meta property="og:title" content="{esc(meta["titulo"])}">
<meta property="og:description" content="{esc(meta["descripcion"])}">
<meta property="og:image" content="{SITIO}{meta.get("og_imagen", "/img/og.jpg")}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
{FUENTES}
<link rel="stylesheet" href="/assets/blog.css">
<script type="application/ld+json">
{json.dumps(ld, ensure_ascii=False, indent=1)}
</script>
</head>
<body>
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id={GTM}" height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
{CABECERA}
<main class="wrap narrow">
{cuerpo}
</main>
{PIE}
</body>
</html>
'''


# Entrada al newsletter desde guías y listados (el formulario vive en /newsletter, armado aparte).
NEWS = ('<aside class="news-bloque"><div><span class="k">Newsletter gratis · un mail por mes</span>'
        '<b>Novedades de Meta en 5 minutos</b><p>Lo que cambió en los anuncios de Instagram y Facebook, '
        'confirmado en fuentes oficiales, y qué conviene hacer.</p></div>'
        '<a class="btn" data-cta="newsletter" href="/newsletter">Quiero recibirlo</a></aside>')


def faq_html(faq):
    if not faq:
        return ""
    items = "\n".join(f"<details><summary>{esc(q)}</summary><p>{esc(a)}</p></details>" for q, a in faq)
    return f'<h2 id="preguntas">Preguntas frecuentes</h2>\n<div class="faq">\n{items}\n</div>'


def faq_ld(faq, url):
    return {"@type": "FAQPage", "@id": url + "#preguntas", "mainEntity": [
        {"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in faq]}


def migas(items):
    return {"@type": "BreadcrumbList", "itemListElement": [
        {"@type": "ListItem", "position": i + 1, "name": n, "item": u} for i, (n, u) in enumerate(items)]}


def indice(cuerpo):
    h2 = re.findall(r'<h2 id="([^"]+)">(.*?)</h2>', cuerpo)
    if len(h2) < 3:
        return ""
    li = "".join(f'<li><a href="#{i}">{t}</a></li>' for i, t in h2)
    return f'<nav class="toc" aria-label="En esta guía"><b>En esta guía</b><ul>{li}</ul></nav>'


def relacionadas(meta, todas):
    # Primero las del mismo tema (arma el grupo de páginas que Google lee como un tema), después las más nuevas.
    resto = [m for m in todas if m["slug"] != meta["slug"]]
    mismo = [m for m in resto if pilar(m) == pilar(meta)]
    otras = (mismo + [m for m in resto if m not in mismo])[:3]
    if not otras:
        return ""
    tarjetas = "\n".join(
        f'<a class="card" href="/guias/{m["slug"]}"><span class="tag">{esc(m.get("tag", "Guía"))}</span>'
        f'<h3>{esc(m["titulo"])}</h3></a>' for m in otras)
    return f'<section class="relacionadas"><h2>Seguí leyendo</h2>\n<div class="cards">\n{tarjetas}\n</div></section>'


def guia(meta, cuerpo, todas=()):
    url = f"{SITIO}/guias/{meta['slug']}"
    og = portadas_og.asegurar(meta)
    if og:
        meta["og_imagen"] = og
    meta["titulo_seo"] = meta.get("titulo_seo", meta["titulo"] + " | CreceConAds")
    cta = meta.get("cta", "agendar")
    if cta == "agente":
        botones = (f'<a class="btn" data-cta="whatsapp" href="{WA}AGENTE" target="_blank" rel="noopener">Escribí AGENTE y probalo</a>'
                   f'<a class="btn btn-line" data-cta="agendar" href="{CAL}">Agendar llamada gratis</a>')
        cta_txt = "Escribí AGENTE por WhatsApp y te responde mi agente, para que veas cómo atendería tu tienda."
    else:
        botones = (f'<a class="btn" data-cta="agendar" href="{CAL}">Agendar llamada gratis</a>'
                   f'<a class="btn btn-line" data-cta="whatsapp" href="{WA}Vengo%20de%20la%20gu%C3%ADa" target="_blank" rel="noopener">Escribime por WhatsApp</a>')
        cta_txt = "En 30 minutos reviso tus campañas y te digo qué haría en tu tienda. Sin compromiso."
    html_cuerpo = f'''<p class="crumbs"><a href="/">Inicio</a> / <a href="/guias">Guías</a></p>
<article>
<h1>{esc(meta["titulo"])}</h1>
<p class="lead">{esc(meta["descripcion"])}</p>
<div class="byline"><img src="/img/damian-presmanes-avatar.jpg" alt="" width="44" height="44">
<span>Por <a href="/damian-presmanes">Damián Presmanes</a> · {fecha_larga(meta["fecha"])}</span></div>
<div class="answer"><span class="k">Respuesta corta</span><p>{esc(meta["respuesta"])}</p></div>
{indice(cuerpo)}
{cuerpo}
{faq_html(meta.get("faq"))}
<section class="cta"><h2>{esc(meta.get("cta_titulo", "¿Vemos tu caso?"))}</h2><p>{cta_txt}</p><div class="row">{botones}</div></section>
{NEWS}
{relacionadas(meta, todas)}
{AUTOR}
</article>'''
    grafo = [
        {"@type": "NewsArticle" if pilar(meta) == "novedades" else "Article", "@id": url + "#articulo", "headline": meta["titulo"], "description": meta["descripcion"],
         "datePublished": meta["fecha"], "dateModified": meta.get("actualizado", meta["fecha"]), "inLanguage": "es-AR",
         "author": {"@id": PERSONA}, "publisher": {"@id": ORG}, "mainEntityOfPage": url, "image": SITIO + "/img/og.jpg",
         "about": meta.get("temas", [])},
        migas([("Inicio", SITIO + "/"), ("Guías", SITIO + "/guias"), (meta["titulo"], url)]),
    ]
    if meta.get("faq"):
        grafo.append(faq_ld(meta["faq"], url))
    return url, documento(meta, url, {"@context": "https://schema.org", "@graph": grafo}, html_cuerpo)


RUBROS = ["Tienda online", "Inmobiliaria", "Servicios o profesional", "Otro"]


def recurso(meta, cuerpo, guias):
    """Recurso gratis: se ve una parte; el resto se desbloquea dejando nombre, mail y rubro (Sender)."""
    url = f"{SITIO}/recursos/{meta['slug']}"
    meta["titulo_seo"] = meta.get("titulo_seo", meta["titulo"] + " | Recurso gratis | CreceConAds")
    visible, _, completo = cuerpo.partition("<!-- completo -->")
    guia = next((g for g in guias if g["slug"] == meta.get("guia")), None)
    enlace_guia = (f'<a class="card" href="/guias/{guia["slug"]}"><span class="tag">Guía relacionada</span><h3>{esc(guia["titulo"])}</h3></a>'
                   if guia else '<a class="card" href="/guias"><span class="tag">Guías</span><h3>Todas las guías de Meta Ads, agentes de IA y automatización</h3></a>')
    opciones = "".join(f"<option>{esc(r)}</option>" for r in RUBROS)
    html_cuerpo = f'''<p class="crumbs"><a href="/">Inicio</a> / <a href="/recursos">Recursos</a></p>
<article class="recurso" data-recurso="{esc(meta['slug'])}">
<span class="chip-recurso">Recurso gratis · {esc(meta.get("tag", ""))}</span>
<h1>{meta.get("titulo_html", esc(meta["titulo"])).replace("<em>", '<span class="g">').replace("</em>", "</span>")}</h1>
<p class="lead">{esc(meta["descripcion"])}</p>
{visible}
<section class="gate" id="gate">
  <h2>Desbloqueá el recurso completo</h2>
  <p>Dejá tu nombre y tu mail y se abre todo acá mismo, con la opción de descargarlo en PDF. Te mandamos también una copia por mail.</p>
  <form id="gate-form" novalidate>
    <label>Nombre<input name="nombre" autocomplete="given-name" required maxlength="80"></label>
    <label>Mail<input name="email" type="email" autocomplete="email" required maxlength="120"></label>
    <label>¿A qué se dedica tu negocio?<select name="rubro" required><option value="">Elegí una opción</option>{opciones}</select></label>
    <label class="hp" aria-hidden="true">Web<input name="web" tabindex="-1" autocomplete="off"></label>
    <label class="acepto"><input type="checkbox" name="acepto" required> Acepto recibir el recurso y novedades de CreceConAds por mail. Me puedo dar de baja cuando quiera. <a href="/privacidad">Privacidad</a></label>
    <button class="btn" type="submit">Ver el recurso completo</button>
    <p class="gate-error" id="gate-error" hidden></p>
  </form>
</section>
<div class="completo" id="completo" hidden>
{completo}
<p class="acciones"><button class="btn btn-line" type="button" onclick="window.print()">Descargar en PDF</button></p>
</div>
<section class="relacionadas"><h2>Seguí con esto</h2><div class="cards">{enlace_guia}</div></section>
<section class="cta"><h2>¿Querés que lo armemos para tu negocio?</h2><p>En 30 minutos vemos tu caso y te digo qué haría. Sin compromiso.</p>
<div class="row"><a class="btn" data-cta="agendar" href="{CAL}">Agendar llamada gratis</a>
<a class="btn btn-line" data-cta="whatsapp" href="{WA}AGENTE" target="_blank" rel="noopener">Escribí AGENTE por WhatsApp</a></div></section>
{AUTOR}
</article>
<script>
(() => {{
  const CLAVE = "cca-recursos-desbloqueados", slug = document.querySelector("[data-recurso]").dataset.recurso;
  const abrir = () => {{ document.getElementById("gate").hidden = true; document.getElementById("completo").hidden = false; }};
  try {{ if (localStorage.getItem(CLAVE)) abrir(); }} catch (e) {{}}
  const form = document.getElementById("gate-form"), error = document.getElementById("gate-error");
  form.addEventListener("submit", async (ev) => {{
    ev.preventDefault();
    const d = Object.fromEntries(new FormData(form));
    if (!d.nombre.trim() || !/^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$/.test(d.email) || !d.rubro || !form.acepto.checked) {{
      error.textContent = "Completá nombre, un mail válido, tu rubro y aceptá recibir el recurso."; error.hidden = false; return;
    }}
    form.querySelector("button").disabled = true;
    try {{
      await fetch("/api/suscribir", {{ method: "POST", headers: {{ "Content-Type": "application/json" }},
        body: JSON.stringify({{ nombre: d.nombre, email: d.email, rubro: d.rubro, web: d.web || "", recurso: slug }}) }});
    }} catch (e) {{}}
    (window.dataLayer = window.dataLayer || []).push({{ event: "recurso_desbloqueado", recurso: slug, rubro: d.rubro }});
    try {{ localStorage.setItem(CLAVE, "1"); }} catch (e) {{}}
    abrir(); document.getElementById("completo").scrollIntoView({{ behavior: "smooth" }});
  }});
  document.querySelectorAll("[data-copiar]").forEach((b) => b.addEventListener("click", () => {{
    navigator.clipboard.writeText(b.nextElementSibling.textContent).then(() => (b.textContent = "Copiado"));
  }}));
}})();
</script>'''
    ld = {"@context": "https://schema.org", "@graph": [
        {"@type": "LearningResource", "@id": url + "#recurso", "name": meta["titulo"], "description": meta["descripcion"],
         "inLanguage": "es-AR", "isAccessibleForFree": True, "author": {"@id": PERSONA}, "publisher": {"@id": ORG}, "datePublished": meta["fecha"]},
        migas([("Inicio", SITIO + "/"), ("Recursos", SITIO + "/recursos"), (meta["titulo"], url)])]}
    return url, documento(meta, url, ld, html_cuerpo)


# ---------- temas y filtros de los listados ----------
# Pilar de cada guía o recurso: el campo "pilar" si lo trae; si no, se deduce del "tag".
PILARES = [("meta-ads", "Meta Ads"), ("agentes-ia", "Agentes de IA y WhatsApp"), ("automatizacion", "Automatización"),
           ("novedades", "Novedades de Meta e IA"), ("ventas", "Ventas y ecommerce")]
NOMBRE_PILAR = dict(PILARES)
INTRO_PILAR = {
    "meta-ads": "Campañas de ventas en Instagram y Facebook para tiendas online: presupuesto, creativos, métricas y cómo escalar sin quemar plata.",
    "agentes-ia": "Agentes de IA para responder por WhatsApp: el de Meta o uno propio, cómo se activan, cuánto cuestan y qué tiene que estar listo.",
    "automatizacion": "Cómo sacarte de encima las tareas que se repiten: procesos administrativos, contables y de atención, con o sin IA.",
    "novedades": "Lo que cambia en Meta Ads, WhatsApp y las herramientas de IA, confirmado en fuentes oficiales, y qué hacer en tu negocio.",
    "ventas": "Seguimiento de consultas, cierre y lo legal de vender por redes en Argentina.",
}
TEMAS_CON_PAGINA = set()  # lo llena main(): temas con 2 guías o más
CORTO = {"meta-ads": "Meta Ads", "agentes-ia": "Agentes de IA", "automatizacion": "Automatización",
         "novedades": "Novedades", "ventas": "Ventas"}  # para el menú, que en celular es angosto


def pilar(m):
    if m.get("pilar") in NOMBRE_PILAR:
        return m["pilar"]
    t = m.get("tag", "").lower()
    if "novedades" in t:
        return "novedades"
    if t.startswith("meta ads"):
        return "meta-ads"
    if "automatiz" in t:
        return "automatizacion"
    if "agente" in t or "whatsapp" in t or t.startswith("ia"):
        return "agentes-ia"
    return "ventas"


def formato(m):
    """Tipo de recurso, para filtrarlos: el campo "formato" o se deduce del nombre."""
    if m.get("formato"):
        return m["formato"]
    r = (m.get("recurso", "") + " " + m.get("titulo", "")).lower()
    if "checklist" in r:
        return "Checklists"
    if "planilla" in r or "calcul" in r:
        return "Calculadoras"
    if r.startswith("guía") or " guía de " in r:
        return "Guías rápidas"
    return "Plantillas"


def filtros_html(items, buscar_txt, con_formato=False):
    """Buscador + menús de tema (y de formato en recursos). Todo el contenido queda en el HTML: el script solo
    oculta tarjetas, así Google ve todo igual y sin JavaScript se ve la lista completa."""
    def menu(nombre, rotulo, opciones):
        ops = [f'<option value="">{"Tema: todos" if nombre == "pilar" else "Formato: todos"}</option>']
        ops += [f'<option value="{esc(v)}">{esc(t)} ({n})</option>' for v, t, n in opciones]
        return (f'<label class="menu"><span class="sr">{rotulo}</span>'
                f'<select id="f-{nombre}" data-filtro="{nombre}">{"".join(ops)}</select></label>')
    temas = [(k, CORTO[k], sum(1 for m in items if pilar(m) == k)) for k, _ in PILARES]
    out = ['<div class="filtros">',
           f'<input class="buscar" id="buscar" type="search" placeholder="{esc(buscar_txt)}" aria-label="Buscar" autocomplete="off">',
           menu("pilar", "Tema", [t for t in temas if t[2]])]
    if con_formato:
        formatos = sorted({formato(m) for m in items})
        out.append(menu("formato", "Formato", [(f, f, sum(1 for m in items if formato(m) == f)) for f in formatos]))
    out.append('</div><p class="cuenta" id="cuenta" aria-live="polite"></p>')
    return "".join(out)


SCRIPT_FILTROS = """<p class="vacio" id="vacio" hidden>No hay nada con ese filtro. <button type="button" id="limpiar">Ver todo</button></p>
<div class="ver-mas-wrap"><button type="button" class="ver-mas" id="ver-mas" hidden></button></div>
<script>
(() => {
  const POR_PAGINA = 12, cards = [...document.querySelectorAll('.cards[data-filtrable] .card')];
  const q = document.getElementById('buscar'), cuenta = document.getElementById('cuenta');
  const mas = document.getElementById('ver-mas'), vacio = document.getElementById('vacio');
  const sin = (t) => t.toLowerCase().normalize('NFD').replace(/[\\u0300-\\u036f]/g, '');
  const estado = { pilar: '', formato: '', texto: '', limite: POR_PAGINA };
  const menus = [...document.querySelectorAll('select[data-filtro]')];
  try { const h = location.hash.slice(1); const sp = document.getElementById('f-pilar'); if (h && sp && [...sp.options].some((o) => o.value === h)) estado.pilar = h; } catch (e) {}
  function pintar() {
    const t = sin(estado.texto.trim());
    const ok = cards.filter((c) => (!estado.pilar || c.dataset.pilar === estado.pilar)
      && (!estado.formato || c.dataset.formato === estado.formato) && (!t || sin(c.textContent).includes(t)));
    cards.forEach((c) => (c.hidden = true));
    ok.slice(0, estado.limite).forEach((c) => (c.hidden = false));
    menus.forEach((m) => { m.value = estado[m.dataset.filtro]; m.classList.toggle('activo', !!m.value); });
    const quedan = ok.length - Math.min(ok.length, estado.limite);
    mas.hidden = quedan <= 0;
    mas.textContent = 'Ver ' + Math.min(quedan, POR_PAGINA) + ' más';
    vacio.hidden = ok.length > 0;
    cuenta.textContent = ok.length === cards.length && ok.length <= estado.limite ? cards.length + ' en total'
      : 'Mostrando ' + Math.min(ok.length, estado.limite) + ' de ' + ok.length;
  }
  menus.forEach((m) => m.addEventListener('change', () => {
    const k = m.dataset.filtro;
    estado[k] = m.value; estado.limite = POR_PAGINA;
    if (k === 'pilar') { try { history.replaceState(null, '', estado.pilar ? '#' + estado.pilar : location.pathname); } catch (e) {} }
    pintar();
  }));
  q.addEventListener('input', () => { estado.texto = q.value; estado.limite = POR_PAGINA; pintar(); });
  mas.addEventListener('click', () => { estado.limite += POR_PAGINA; pintar(); });
  document.getElementById('limpiar').addEventListener('click', () => {
    estado.pilar = estado.formato = estado.texto = ''; q.value = ''; estado.limite = POR_PAGINA; pintar();
  });
  pintar();
})();
</script>"""


def tarjeta(m, carpeta):
    fmt = esc(formato(m)) if carpeta == "recursos" else ""
    return (f'<a class="card" href="/{carpeta}/{m["slug"]}" data-pilar="{pilar(m)}" data-formato="{fmt}">'
            f'<span class="tag">{esc(m.get("tag", "Guía"))}</span><h2>{esc(m["titulo"])}</h2><p>{esc(m["descripcion"])}</p></a>')


def tema(clave, guias, recursos):
    """Página de un tema: sus guías y sus recursos, para Google y para quien llega buscando el tema."""
    url = f"{SITIO}/guias/tema/{clave}"
    nombre = NOMBRE_PILAR[clave]
    gs = [m for m in guias if pilar(m) == clave]
    rs = [m for m in recursos if pilar(m) == clave]
    meta = {"titulo": f"Guías de {nombre}", "titulo_seo": f"{nombre}: guías y recursos gratis | CreceConAds",
            "descripcion": INTRO_PILAR[clave], "og_tipo": "website"}
    otros = " · ".join(f'<a href="/guias/tema/{k}">{esc(v)}</a>' for k, v in PILARES if k != clave and k in TEMAS_CON_PAGINA)
    partes = [f'<p class="crumbs"><a href="/">Inicio</a> / <a href="/guias">Guías</a> / {esc(nombre)}</p>',
              f'<h1>{esc(meta["titulo"])}</h1>', f'<p class="lead">{esc(meta["descripcion"])}</p>',
              '<div class="cards">', "\n".join(tarjeta(m, "guias") for m in gs), '</div>']
    if rs:
        partes += [f'<h2 class="sub-listado">Recursos gratis de {esc(nombre)}</h2>', '<div class="cards">',
                   "\n".join(tarjeta(m, "recursos") for m in rs), '</div>']
    if otros:
        partes.append(f'<p class="otros-temas">Otros temas: {otros}</p>')
    ld = {"@context": "https://schema.org", "@graph": [
        {"@type": "CollectionPage", "@id": url, "url": url, "name": meta["titulo"], "inLanguage": "es-AR",
         "about": nombre, "hasPart": [{"@id": f"{SITIO}/guias/{m['slug']}#articulo"} for m in gs]},
        migas([("Inicio", SITIO + "/"), ("Guías", SITIO + "/guias"), (nombre, url)])]}
    return url, documento(meta, url, ld, "\n".join(partes))


def listado_recursos(recursos):
    url = SITIO + "/recursos"
    recursos = sorted(recursos, key=lambda m: m["fecha"], reverse=True)
    tarjetas = "\n".join(tarjeta(m, "recursos") for m in recursos)
    meta = {"titulo": "Recursos gratis para vender más por redes y WhatsApp",
            "titulo_seo": "Recursos gratis: plantillas y checklists | CreceConAds",
            "descripcion": "Plantillas, checklists y prompts listos para usar en tu negocio: respuestas de WhatsApp, seguimiento de consultas, métricas de Meta Ads y más.",
            "og_tipo": "website"}
    cuerpo = f'''<p class="crumbs"><a href="/">Inicio</a> / Recursos</p>
<h1>{meta["titulo"]}</h1>
<p class="lead">{meta["descripcion"]}</p>
{filtros_html(recursos, "Buscar un recurso", con_formato=True)}
<div class="cards" data-filtrable>
{tarjetas}
</div>
{SCRIPT_FILTROS}
{NEWS}'''
    ld = {"@context": "https://schema.org", "@graph": [
        {"@type": "CollectionPage", "@id": url, "url": url, "name": meta["titulo"], "inLanguage": "es-AR",
         "hasPart": [{"@id": f"{SITIO}/recursos/{m['slug']}#recurso"} for m in recursos]},
        migas([("Inicio", SITIO + "/"), ("Recursos", url)])]}
    return url, documento(meta, url, ld, cuerpo)


def perfil(meta, cuerpo):
    url = f"{SITIO}/{meta['slug']}"
    meta["titulo_seo"] = meta.get("titulo_seo", meta["titulo"])
    meta["og_tipo"] = "profile"
    html_cuerpo = f'''<p class="crumbs"><a href="/">Inicio</a> / Quién soy</p>
<article>
<h1>{esc(meta["titulo"])}</h1>
<p class="lead">{esc(meta["descripcion"])}</p>
<div class="answer"><span class="k">En una línea</span><p>{esc(meta["respuesta"])}</p></div>
{cuerpo}
{faq_html(meta.get("faq"))}
<section class="cta"><h2>¿Trabajamos juntos?</h2><p>En 30 minutos reviso tu caso y te digo qué haría. Sin compromiso.</p>
<div class="row"><a class="btn" data-cta="agendar" href="{CAL}">Agendar llamada gratis</a>
<a class="btn btn-line" data-cta="whatsapp" href="{WA}Hola%2C%20vengo%20de%20la%20web" target="_blank" rel="noopener">Escribime por WhatsApp</a></div></section>
</article>'''
    persona = dict(meta["persona"])
    persona.update({"@type": "Person", "@id": PERSONA, "url": url, "worksFor": {"@id": ORG},
                    "image": SITIO + "/img/damian-presmanes.webp", "mainEntityOfPage": url})
    grafo = [{"@type": "ProfilePage", "@id": url, "url": url, "name": meta["titulo"], "inLanguage": "es-AR",
              "mainEntity": {"@id": PERSONA}, "dateModified": meta["fecha"]},
             persona,
             migas([("Inicio", SITIO + "/"), ("Quién soy", url)])]
    if meta.get("faq"):
        grafo.append(faq_ld(meta["faq"], url))
    return url, documento(meta, url, {"@context": "https://schema.org", "@graph": grafo}, html_cuerpo)


def listado(guias):
    url = SITIO + "/guias"
    tarjetas = "\n".join(tarjeta(m, "guias") for m in guias)
    por_tema = " · ".join(f'<a href="/guias/tema/{k}">{esc(v)}</a>' for k, v in PILARES if k in TEMAS_CON_PAGINA)
    meta = {"titulo": "Guías de Meta Ads, agentes de IA y automatización",
            "titulo_seo": "Guías de Meta Ads e IA para tiendas online | CreceConAds",
            "descripcion": "Guías prácticas para dueños de tiendas online: campañas de ventas en Meta Ads, agentes de IA para WhatsApp y automatización, con casos y números reales.",
            "og_tipo": "website"}
    temas_html = f'<p class="otros-temas">Por tema: {por_tema}</p>' if por_tema else ""
    cuerpo = f'''<p class="crumbs"><a href="/">Inicio</a> / Guías</p>
<h1>{meta["titulo"]}</h1>
<p class="lead">{meta["descripcion"]}</p>
{filtros_html(guias, "Buscar una guía")}
<div class="cards" data-filtrable>
{tarjetas}
</div>
{SCRIPT_FILTROS}
{temas_html}
{NEWS}'''
    ld = {"@context": "https://schema.org", "@graph": [
        {"@type": "CollectionPage", "@id": url, "url": url, "name": meta["titulo"], "inLanguage": "es-AR",
         "hasPart": [{"@id": f"{SITIO}/guias/{m['slug']}#articulo"} for m in guias]},
        migas([("Inicio", SITIO + "/"), ("Guías", url)])]}
    return url, documento(meta, url, ld, cuerpo)


def main():
    guias, urls = [], [(SITIO + "/", "2026-10-30"), (SITIO + "/privacidad", "2026-11-05"), (SITIO + "/eliminacion-de-datos", "2026-11-05"), (SITIO + "/terminos", "2026-11-05")]
    contenidos = [leer(p) for p in sorted((RAIZ / "contenido").glob("*.html"))]
    # Las más nuevas primero: son las que se muestran en "Seguí leyendo" y en la home.
    todas = sorted([m for m, _ in contenidos if m["tipo"] == "guia"], key=lambda m: m["fecha"], reverse=True)
    recursos = sorted([m for m, _ in contenidos if m["tipo"] == "recurso"], key=lambda m: m["fecha"])
    for meta, cuerpo in contenidos:
        if meta["tipo"] == "recurso":
            url, doc = recurso(meta, cuerpo, todas)
            destino = RAIZ / "recursos" / f"{meta['slug']}.html"
            destino.parent.mkdir(exist_ok=True)
            destino.write_text(doc, encoding="utf-8")
            urls.append((url, meta.get("actualizado", meta["fecha"])))
            print("ok", destino.relative_to(RAIZ))
            continue
        if meta["tipo"] == "guia":
            url, doc = guia(meta, cuerpo, todas)
            destino = RAIZ / "guias" / f"{meta['slug']}.html"
            guias.append(meta)
        else:
            url, doc = perfil(meta, cuerpo)
            destino = RAIZ / f"{meta['slug']}.html"
        destino.parent.mkdir(exist_ok=True)
        destino.write_text(doc, encoding="utf-8")
        urls.append((url, meta.get("actualizado", meta["fecha"])))
        print("ok", destino.relative_to(RAIZ))

    if recursos:
        url, doc = listado_recursos(recursos)
        (RAIZ / "recursos" / "index.html").write_text(doc, encoding="utf-8")
        urls.append((url, max(m["fecha"] for m in recursos)))
    guias.sort(key=lambda m: m["fecha"], reverse=True)
    # Página por tema solo cuando tiene al menos 2 guías (una sola sería una página flaca).
    TEMAS_CON_PAGINA.clear()
    TEMAS_CON_PAGINA.update(k for k, _ in PILARES if sum(1 for m in guias if pilar(m) == k) >= 2)
    for k in sorted(TEMAS_CON_PAGINA):
        url, doc = tema(k, guias, recursos)
        destino = RAIZ / "guias" / "tema" / f"{k}.html"
        destino.parent.mkdir(parents=True, exist_ok=True)
        destino.write_text(doc, encoding="utf-8")
        urls.append((url, max(m.get("actualizado", m["fecha"]) for m in guias if pilar(m) == k)))
        print("ok", destino.relative_to(RAIZ))
    url, doc = listado(guias)
    (RAIZ / "guias" / "index.html").write_text(doc, encoding="utf-8")
    urls.append((url, max([m["fecha"] for m in guias], default="2026-10-30")))

    items = "\n".join(f"  <url>\n    <loc>{u}</loc>\n    <lastmod>{f}</lastmod>\n  </url>" for u, f in urls)
    (RAIZ / "sitemap.xml").write_text(
        f'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n{items}\n</urlset>\n', encoding="utf-8")

    portada = (RAIZ / "index.html").read_text(encoding="utf-8")
    enlaces = "\n".join(
        f'        <a href="/guias/{m["slug"]}"><span class="label">{esc(m.get("tag", "Guía"))}</span><b>{esc(m["titulo"])}</b></a>'
        for m in guias[:4])
    portada = re.sub(r"(<!-- guias-home:inicio -->).*?(\n\s*<!-- guias-home:fin -->)",
                     lambda x: x.group(1) + "\n" + enlaces + x.group(2), portada, flags=re.S)
    (RAIZ / "index.html").write_text(portada, encoding="utf-8")

    llms = (RAIZ / "llms.txt").read_text(encoding="utf-8")
    bloque = "## Guías\n\n" + "\n".join(f"- [{m['titulo']}]({SITIO}/guias/{m['slug']}): {m['respuesta']}" for m in guias)
    bloque = "<!-- guias:inicio -->\n" + bloque + "\n<!-- guias:fin -->"
    if "<!-- guias:inicio -->" in llms:
        llms = re.sub(r"<!-- guias:inicio -->.*?<!-- guias:fin -->", bloque, llms, flags=re.S)
    else:
        llms = llms.replace("## Contacto", bloque + "\n\n## Contacto")
    if recursos:
        rec = "## Recursos gratis\n\n" + "\n".join(
            f"- [{m['recurso']}]({SITIO}/recursos/{m['slug']}): {m['descripcion']}" for m in recursos)
        rec = "<!-- recursos:inicio -->\n" + rec + "\n<!-- recursos:fin -->"
        if "<!-- recursos:inicio -->" in llms:
            llms = re.sub(r"<!-- recursos:inicio -->.*?<!-- recursos:fin -->", rec, llms, flags=re.S)
        else:
            llms = llms.replace("## Contacto", rec + "\n\n## Contacto")
    (RAIZ / "llms.txt").write_text(llms, encoding="utf-8")
    print(f"sitemap: {len(urls)} páginas · guías: {len(guias)}")


if __name__ == "__main__":
    main()
