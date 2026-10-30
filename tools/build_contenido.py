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
import re
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
SITIO = "https://crececonads.site"
GTM = "GTM-TKWHBHB9"
WA = "https://wa.me/5491137638307?text="
CAL = "https://calendar.app.google/Y7rQAcUQw2EqX5z3A"
PERSONA = SITIO + "/damian-presmanes#persona"
ORG = SITIO + "/#org"

FUENTES = ('<link rel="preconnect" href="https://fonts.googleapis.com">\n'
           '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n'
           '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,800'
           '&family=DM+Sans:opsz,wght@9..40,400;9..40,700&family=IBM+Plex+Mono:wght@500&display=swap">')

CABECERA = f'''<header class="top"><div class="wrap">
  <a class="logo" href="/">Crece<b>Con</b>Ads</a>
  <nav aria-label="Secciones"><a href="/#resultados">Resultados</a><a href="/#servicios">Servicios</a><a href="/guias/">Guías</a><a href="/damian-presmanes">Quién soy</a></nav>
  <a class="btn btn-sm" data-cta="agendar" href="{CAL}" target="_blank" rel="noopener">Agendar llamada</a>
</div></header>'''

PIE = '''<footer class="site-foot"><div class="wrap">
  <span>© 2026 CreceConAds · Damián Presmanes</span>
  <span><a href="/guias/">Guías</a> · <a href="https://www.instagram.com/crececonads/">Instagram</a> · <a href="https://maps.google.com/?cid=8214692810272884951">Google Maps</a> · <a href="/privacidad">Privacidad</a></span>
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
<script>(function(w,d,s,l,i){{w[l]=w[l]||[];w[l].push({{'gtm.start':new Date().getTime(),event:'gtm.js'}});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);}})(window,document,'script','dataLayer','{GTM}');</script>
<title>{esc(meta["titulo_seo"])}</title>
<meta name="description" content="{esc(meta["descripcion"])}">
<link rel="canonical" href="{url}">
<meta name="robots" content="index, follow, max-image-preview:large">
<meta name="author" content="Damián Presmanes">
<meta name="theme-color" content="#0A0F1F">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<meta property="og:type" content="{meta.get("og_tipo", "article")}">
<meta property="og:locale" content="es_AR">
<meta property="og:site_name" content="CreceConAds">
<meta property="og:url" content="{url}">
<meta property="og:title" content="{esc(meta["titulo"])}">
<meta property="og:description" content="{esc(meta["descripcion"])}">
<meta property="og:image" content="{SITIO}/img/og.jpg">
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


def guia(meta, cuerpo):
    url = f"{SITIO}/guias/{meta['slug']}"
    meta["titulo_seo"] = meta.get("titulo_seo", meta["titulo"] + " | CreceConAds")
    cta = meta.get("cta", "agendar")
    if cta == "agente":
        botones = (f'<a class="btn" data-cta="whatsapp" href="{WA}AGENTE" target="_blank" rel="noopener">Escribí AGENTE y probalo</a>'
                   f'<a class="btn btn-line" data-cta="agendar" href="{CAL}" target="_blank" rel="noopener">Agendar llamada gratis</a>')
        cta_txt = "Escribí AGENTE por WhatsApp y te responde mi agente, para que veas cómo atendería tu tienda."
    else:
        botones = (f'<a class="btn" data-cta="agendar" href="{CAL}" target="_blank" rel="noopener">Agendar llamada gratis</a>'
                   f'<a class="btn btn-line" data-cta="whatsapp" href="{WA}Vengo%20de%20la%20gu%C3%ADa" target="_blank" rel="noopener">Escribime por WhatsApp</a>')
        cta_txt = "En 30 minutos reviso tus campañas y te digo qué haría en tu tienda. Sin compromiso."
    html_cuerpo = f'''<p class="crumbs"><a href="/">Inicio</a> / <a href="/guias/">Guías</a></p>
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
{AUTOR}
</article>'''
    grafo = [
        {"@type": "Article", "@id": url + "#articulo", "headline": meta["titulo"], "description": meta["descripcion"],
         "datePublished": meta["fecha"], "dateModified": meta.get("actualizado", meta["fecha"]), "inLanguage": "es-AR",
         "author": {"@id": PERSONA}, "publisher": {"@id": ORG}, "mainEntityOfPage": url, "image": SITIO + "/img/og.jpg",
         "about": meta.get("temas", [])},
        migas([("Inicio", SITIO + "/"), ("Guías", SITIO + "/guias/"), (meta["titulo"], url)]),
    ]
    if meta.get("faq"):
        grafo.append(faq_ld(meta["faq"], url))
    return url, documento(meta, url, {"@context": "https://schema.org", "@graph": grafo}, html_cuerpo)


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
<div class="row"><a class="btn" data-cta="agendar" href="{CAL}" target="_blank" rel="noopener">Agendar llamada gratis</a>
<a class="btn btn-line" data-cta="whatsapp" href="{WA}Hola%20Dami%C3%A1n" target="_blank" rel="noopener">Escribime por WhatsApp</a></div></section>
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
    url = SITIO + "/guias/"
    tarjetas = "\n".join(
        f'<a class="card" href="/guias/{m["slug"]}"><span class="tag">{esc(m.get("tag", "Guía"))}</span>'
        f'<h2>{esc(m["titulo"])}</h2><p>{esc(m["descripcion"])}</p></a>' for m in guias)
    meta = {"titulo": "Guías de Meta Ads, agentes de IA y automatización",
            "titulo_seo": "Guías de Meta Ads e IA para tiendas online | CreceConAds",
            "descripcion": "Guías prácticas para dueños de tiendas online: campañas de ventas en Meta Ads, agentes de IA para WhatsApp y automatización, con casos y números reales.",
            "og_tipo": "website"}
    cuerpo = f'''<p class="crumbs"><a href="/">Inicio</a> / Guías</p>
<h1>{meta["titulo"]}</h1>
<p class="lead">{meta["descripcion"]}</p>
<div class="cards">
{tarjetas}
</div>'''
    ld = {"@context": "https://schema.org", "@graph": [
        {"@type": "CollectionPage", "@id": url, "url": url, "name": meta["titulo"], "inLanguage": "es-AR",
         "hasPart": [{"@id": f"{SITIO}/guias/{m['slug']}#articulo"} for m in guias]},
        migas([("Inicio", SITIO + "/"), ("Guías", url)])]}
    return url, documento(meta, url, ld, cuerpo)


def main():
    guias, urls = [], [(SITIO + "/", "2026-10-30"), (SITIO + "/privacidad", "2026-10-30")]
    for path in sorted((RAIZ / "contenido").glob("*.html")):
        meta, cuerpo = leer(path)
        if meta["tipo"] == "guia":
            url, doc = guia(meta, cuerpo)
            destino = RAIZ / "guias" / f"{meta['slug']}.html"
            guias.append(meta)
        else:
            url, doc = perfil(meta, cuerpo)
            destino = RAIZ / f"{meta['slug']}.html"
        destino.parent.mkdir(exist_ok=True)
        destino.write_text(doc, encoding="utf-8")
        urls.append((url, meta.get("actualizado", meta["fecha"])))
        print("ok", destino.relative_to(RAIZ))

    guias.sort(key=lambda m: m["fecha"], reverse=True)
    url, doc = listado(guias)
    (RAIZ / "guias" / "index.html").write_text(doc, encoding="utf-8")
    urls.append((url, max([m["fecha"] for m in guias], default="2026-10-30")))

    items = "\n".join(f"  <url>\n    <loc>{u}</loc>\n    <lastmod>{f}</lastmod>\n  </url>" for u, f in urls)
    (RAIZ / "sitemap.xml").write_text(
        f'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n{items}\n</urlset>\n', encoding="utf-8")

    llms = (RAIZ / "llms.txt").read_text(encoding="utf-8")
    bloque = "## Guías\n\n" + "\n".join(f"- [{m['titulo']}]({SITIO}/guias/{m['slug']}): {m['respuesta']}" for m in guias)
    bloque = "<!-- guias:inicio -->\n" + bloque + "\n<!-- guias:fin -->"
    if "<!-- guias:inicio -->" in llms:
        llms = re.sub(r"<!-- guias:inicio -->.*?<!-- guias:fin -->", bloque, llms, flags=re.S)
    else:
        llms = llms.replace("## Contacto", bloque + "\n\n## Contacto")
    (RAIZ / "llms.txt").write_text(llms, encoding="utf-8")
    print(f"sitemap: {len(urls)} páginas · guías: {len(guias)}")


if __name__ == "__main__":
    main()
