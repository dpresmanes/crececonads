"""Portadas ilustradas de los 5 mails de la secuencia de recursos (img/mails/mail-N.png, 1200x560).

Imagen y no HTML porque los clientes de mail no cargan Bricolage: así el título sale con la letra
de la marca. Paleta de la web (noche, azul, verde), sin naranja.
"""
import math
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter, ImageFont

RAIZ = Path(__file__).resolve().parent.parent
OUT = RAIZ / "img" / "mails"
FUENTES = Path(__file__).resolve().parent / "fuentes"
BRIC = str(FUENTES / "Bricolage-ExtraBold.ttf")
INTER = str(FUENTES / "Inter-Bold.otf")

NOCHE, NOCHE2, BORDE = (10, 15, 31), (24, 33, 63), (36, 49, 90)
AZUL, AZUL2, VERDE, TEXTO, SUAVE = (47, 91, 255), (109, 139, 255), (47, 208, 143), (238, 241, 250), (163, 172, 200)
W, H, S = 1200, 560, 2  # se dibuja a 2x y se reduce

PORTADAS = [
    ("Tu recurso", "ya es tuyo", "candado"),
    ("La guía que", "lo explica", "libros"),
    ("Casos reales,", "números reales", "barras"),
    ("El error que", "más veo", "anuncios"),
    ("¿Lo vemos", "juntos?", "calendario"),
]


def fondo():
    im = Image.new("RGB", (W * S, H * S), NOCHE)
    g = Image.new("RGB", im.size, NOCHE)
    d = ImageDraw.Draw(g)
    d.ellipse([-300 * S, -380 * S, 650 * S, 420 * S], fill=(28, 50, 140))
    d.ellipse([760 * S, 220 * S, 1500 * S, 900 * S], fill=(16, 92, 78))
    im = Image.blend(im, g.filter(ImageFilter.GaussianBlur(140 * S)), 0.95)
    d = ImageDraw.Draw(im)
    # grilla de puntos, sutil
    for x in range(30, W, 40):
        for y in range(30, H, 40):
            d.ellipse([(x - 1.5) * S, (y - 1.5) * S, (x + 1.5) * S, (y + 1.5) * S], fill=(36, 49, 90))
    return im


def chispa(d, x, y, r, color):
    p = [(x, y - r), (x + r * 0.28, y - r * 0.28), (x + r, y), (x + r * 0.28, y + r * 0.28),
         (x, y + r), (x - r * 0.28, y + r * 0.28), (x - r, y), (x - r * 0.28, y - r * 0.28)]
    d.polygon([(a * S, b * S) for a, b in p], fill=color)


def rr(d, box, r, **kw):
    d.rounded_rectangle([v * S for v in box], r * S, **{k: v for k, v in kw.items() if k != "width"}, width=kw.get("width", 0) * S if kw.get("width") else 0)


def ilustracion(d, tipo):
    cx, cy = 900, 290
    if tipo == "candado":
        rr(d, (cx - 120, cy - 20, cx + 120, cy + 150), 34, fill=AZUL)
        d.arc([(cx - 82) * S, (cy - 150) * S, (cx + 82) * S, (cy + 20) * S], 180, 330, fill=TEXTO, width=26 * S)
        d.ellipse([(cx - 20) * S, (cy + 40) * S, (cx + 20) * S, (cy + 80) * S], fill=NOCHE)
        rr(d, (cx - 9, cy + 66, cx + 9, cy + 112), 8, fill=NOCHE)
        rr(d, (cx + 60, cy - 170, cx + 230, cy - 110), 30, fill=VERDE)
        d.text(((cx + 80) * S, (cy - 160) * S), "¡Listo!", font=ImageFont.truetype(BRIC, 38 * S), fill=NOCHE)
    elif tipo == "libros":
        for k, (dx, dy, col, ang) in enumerate([(-90, 30, BORDE, -8), (0, 0, AZUL, 4), (90, 40, VERDE, -3)]):
            card = Image.new("RGBA", (190 * S, 250 * S), (0, 0, 0, 0))
            cd = ImageDraw.Draw(card)
            cd.rounded_rectangle([0, 0, 190 * S - 1, 250 * S - 1], 22 * S, fill=col)
            for j in range(4):
                cd.rounded_rectangle([24 * S, (40 + j * 44) * S, (166 - j * 22) * S, (58 + j * 44) * S], 9 * S,
                                     fill=(255, 255, 255, 150) if col != BORDE else (163, 172, 200, 140))
            card = card.rotate(ang, expand=True, resample=Image.BICUBIC)
            d._image.paste(card, (int((cx + dx - card.width / S / 2) * S), int((cy + dy - card.height / S / 2) * S)), card)
    elif tipo == "barras":
        base = cy + 140
        for k, (h, col) in enumerate([(80, BORDE), (130, BORDE), (190, AZUL2), (270, AZUL)]):
            x = cx - 170 + k * 90
            rr(d, (x, base - h, x + 66, base), 16, fill=col)
        pts = [(cx - 137, base - 110), (cx - 47, base - 160), (cx + 43, base - 225), (cx + 133, base - 310)]
        d.line([(a * S, b * S) for a, b in pts], fill=VERDE, width=12 * S, joint="curve")
        for a, b in pts:
            d.ellipse([(a - 14) * S, (b - 14) * S, (a + 14) * S, (b + 14) * S], fill=VERDE)
    elif tipo == "anuncios":
        for k, col in enumerate([BORDE, BORDE, BORDE]):
            x = cx - 200 + k * 140
            rr(d, (x, cy - 120, x + 120, cy + 110), 18, fill=col)
            rr(d, (x + 14, cy - 104, x + 106, cy - 20), 12, fill=(52, 66, 112))
            rr(d, (x + 14, cy, x + 92, cy + 16), 8, fill=SUAVE)
            d.text(((x + 20) * S, (cy + 34) * S), "-20%", font=ImageFont.truetype(BRIC, 30 * S), fill=SUAVE)
        rr(d, (cx - 230, cy + 140, cx + 230, cy + 196), 28, fill=AZUL)
        f = ImageFont.truetype(INTER, 26 * S)
        t = "Todos dicen lo mismo"
        tw = d.textlength(t, font=f) / S
        d.text(((cx - tw / 2) * S, (cy + 152) * S), t, font=f, fill=TEXTO)
    elif tipo == "calendario":
        rr(d, (cx - 150, cy - 140, cx + 150, cy + 150), 30, fill=TEXTO)
        rr(d, (cx - 150, cy - 140, cx + 150, cy - 70), 30, fill=AZUL)
        d.rectangle([(cx - 150) * S, (cy - 100) * S, (cx + 150) * S, (cy - 70) * S], fill=AZUL)
        for k in (-80, 80):
            rr(d, (cx + k - 10, cy - 170, cx + k + 10, cy - 115), 10, fill=NOCHE2)
        for r in range(3):
            for c in range(5):
                x, y = cx - 120 + c * 54, cy - 40 + r * 56
                col = VERDE if (r, c) == (1, 3) else (210, 216, 232)
                rr(d, (x, y, x + 38, y + 38), 10, fill=col)
        d.text(((cx - 112) * S, (cy - 128) * S), "30 min", font=ImageFont.truetype(BRIC, 40 * S), fill=TEXTO)


def portada(i, l1, l2, tipo):
    im = fondo()
    d = ImageDraw.Draw(im)
    ilustracion(d, tipo)
    chispa(d, 700, 110, 22, VERDE)
    if tipo != "anuncios":
        chispa(d, 1110, 470, 16, AZUL2)
    chispa(d, 1080, 120, 11, TEXTO)
    # pastilla "mail i de 5", inclinada
    pill = Image.new("RGBA", (250 * S, 64 * S), (0, 0, 0, 0))
    pd = ImageDraw.Draw(pill)
    pd.rounded_rectangle([0, 0, 250 * S - 1, 64 * S - 1], 32 * S, fill=VERDE)
    f = ImageFont.truetype(INTER, 26 * S)
    t = f"MAIL {i} DE 5"
    pd.text(((250 * S - pd.textlength(t, font=f)) / 2, 15 * S), t, font=f, fill=NOCHE)
    pill = pill.rotate(-4, expand=True, resample=Image.BICUBIC)
    im.paste(pill, (64 * S, 86 * S), pill)
    fb = ImageFont.truetype(BRIC, 76 * S)
    d.text((70 * S, 190 * S), l1, font=fb, fill=TEXTO)
    d.text((70 * S, 280 * S), l2, font=fb, fill=AZUL2 if i % 2 else VERDE)
    # subrayado juguetón
    w2 = d.textlength(l2, font=fb) / S
    d.arc([70 * S, 350 * S, (70 + w2) * S, 395 * S], 15, 165, fill=VERDE if i % 2 else AZUL2, width=7 * S)
    # puntitos de avance
    for k in range(5):
        x = 76 + k * 30
        col = VERDE if k < i else BORDE
        d.ellipse([x * S, 462 * S, (x + 16) * S, 478 * S], fill=col)
    d.text((76 * S, 492 * S), "CreceConAds", font=ImageFont.truetype(INTER, 22 * S), fill=SUAVE)
    return im.resize((W, H), Image.LANCZOS)


if __name__ == "__main__":
    OUT.mkdir(parents=True, exist_ok=True)
    for i, (l1, l2, tipo) in enumerate(PORTADAS, 1):
        portada(i, l1, l2, tipo).save(OUT / f"mail-{i}.png", optimize=True)
        print(OUT / f"mail-{i}.png")
