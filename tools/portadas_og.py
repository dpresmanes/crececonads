"""Imagen para compartir de cada guía (img/og/<slug>.png, 1200x630): la que muestran LinkedIn, X y WhatsApp.

La llama build_contenido.py. Estilo de las portadas de los mails: noche, azul y verde, título en Bricolage.
Si falta Pillow, no hace nada y la guía usa la imagen general (img/og.jpg).
"""
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
FUENTES = Path(__file__).resolve().parent / "fuentes"
W, H, S = 1200, 630, 2
NOCHE, BORDE = (10, 15, 31), (36, 49, 90)
AZUL, AZUL2, VERDE, TEXTO, SUAVE = (47, 91, 255), (109, 139, 255), (47, 208, 143), (238, 241, 250), (163, 172, 200)


def _partir(d, texto, fuente, ancho):
    lineas, linea = [], ""
    for palabra in texto.split():
        prueba = (linea + " " + palabra).strip()
        if d.textlength(prueba, font=fuente) <= ancho:
            linea = prueba
        else:
            lineas.append(linea)
            linea = palabra
    return lineas + [linea]


def portada(titulo, tag, destino):
    from PIL import Image, ImageDraw, ImageFilter, ImageFont
    im = Image.new("RGB", (W * S, H * S), NOCHE)
    g = Image.new("RGB", im.size, NOCHE)
    dg = ImageDraw.Draw(g)
    dg.ellipse([-300 * S, -420 * S, 700 * S, 460 * S], fill=(28, 50, 140))
    dg.ellipse([800 * S, 300 * S, 1500 * S, 1000 * S], fill=(16, 92, 78))
    im = Image.blend(im, g.filter(ImageFilter.GaussianBlur(140 * S)), 0.95)
    d = ImageDraw.Draw(im)
    for x in range(30, W, 40):
        for y in range(30, H, 40):
            d.ellipse([(x - 1.5) * S, (y - 1.5) * S, (x + 1.5) * S, (y + 1.5) * S], fill=BORDE)
    inter = ImageFont.truetype(str(FUENTES / "Inter-Bold.otf"), 24 * S)
    # etiqueta del tema
    t = tag.upper()
    tw = d.textlength(t, font=inter) / S
    d.rounded_rectangle([70 * S, 64 * S, (70 + tw + 44) * S, 112 * S], 24 * S, fill=VERDE)
    d.text((92 * S, 74 * S), t, font=inter, fill=NOCHE)
    # título: el tamaño más grande que entre en 4 renglones
    for tam in (78, 70, 62, 56, 50):
        fb = ImageFont.truetype(str(FUENTES / "Bricolage-ExtraBold.ttf"), tam * S)
        lineas = _partir(d, titulo, fb, 1060 * S)
        if len(lineas) <= 4:
            break
    y = 150
    for k, l in enumerate(lineas):
        d.text((70 * S, y * S), l, font=fb, fill=TEXTO if k < len(lineas) - 1 else AZUL2)
        y += tam * 1.12
    # pie: marca y sitio
    pie = ImageFont.truetype(str(FUENTES / "Inter-Bold.otf"), 26 * S)
    d.text((70 * S, 552 * S), "Crece", font=pie, fill=TEXTO)
    x = 70 + d.textlength("Crece", font=pie) / S
    d.text((x * S, 552 * S), "Con", font=pie, fill=AZUL2)
    x += d.textlength("Con", font=pie) / S
    d.text((x * S, 552 * S), "Ads", font=pie, fill=TEXTO)
    sitio = "crececonads.site/guias"
    d.text(((1130 - d.textlength(sitio, font=pie) / S) * S, 552 * S), sitio, font=pie, fill=SUAVE)
    destino.parent.mkdir(parents=True, exist_ok=True)
    im.resize((W, H), Image.LANCZOS).save(destino, optimize=True)


def asegurar(meta):
    """Genera la imagen de la guía si falta. Devuelve la ruta pública o None."""
    destino = RAIZ / "img" / "og" / f"{meta['slug']}.png"
    if not destino.exists():
        try:
            portada(meta["titulo"], meta.get("tag", "Guía"), destino)
        except ImportError:
            return None
    return f"/img/og/{meta['slug']}.png"
