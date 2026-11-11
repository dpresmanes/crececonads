"""Arma el HTML de los 5 mails de la secuencia de recursos para pegar en Sender (editor HTML).

Salida: docs/mails/mail-N.html (docs/ no se publica en la web). Estilos en línea y tablas,
que es lo único que respetan Gmail y Outlook. Estilo de la marca, en clave lúdica: cabecera
noche con portada ilustrada (img/mails/mail-N.png, la arma tools/portadas_mails.py), avance
"mail N de 5", cajas de tip, tarjetas con números grandes y un botón por mail.

Variables de Sender: {$firstname}, {$recurso}. El link de baja va con la etiqueta de Sender
{$unsubscribe_link}: si el editor muestra otra, reemplazarla por la que inserta Sender.
"""
from pathlib import Path

NOCHE, NOCHE2, BORDE = "#0A0F1F", "#18213F", "#24315A"
AZUL, AZUL2, VERDE = "#2F5BFF", "#6D8BFF", "#2FD08F"
TEXTO, SUAVE, FONDO = "#1A2036", "#5B6478", "#E9EDF7"
WEB = "https://crececonads.site"
FUENTE = "'DM Sans',Arial,Helvetica,sans-serif"

MAILS = [
    {
        "asunto": "Tu recurso de CreceConAds",
        "previa": "Acá lo tenés, y una sugerencia para aprovecharlo.",
        "alt": "Tu recurso ya es tuyo",
        "cuerpo": [
            "Gracias por bajar el recurso. Ya es tuyo y lo tenés siempre a mano:",
            ("boton", "Abrir mi recurso", WEB + "/recursos/{$recurso}"),
            ("tip", "Un consejo", "No lo leas entero hoy. Elegí <strong>una sola parte</strong> y aplicala esta semana. Lo que se usa rinde más que lo que se guarda."),
            "En los próximos días te mando cuatro mails más, cortos: una guía, casos reales, el error que más veo y una invitación. Nada de relleno.",
        ],
    },
    {
        "asunto": "Lo que viene después del recurso",
        "previa": "La guía que lo explica a fondo.",
        "alt": "La guía que lo explica",
        "cuerpo": [
            "El recurso que bajaste es la parte práctica. Si querés entender el porqué, escribí guías con ejemplos y números reales. Elegí la que más te sirva:",
            ("guias", [
                ("Calculadora", "Cuánto cuesta la publicidad en Instagram y cuánto invertir", WEB + "/guias/cuanto-cuesta-publicidad-instagram-argentina"),
                ("Comparación + test", "Agente de IA en WhatsApp: el de Meta o uno propio", WEB + "/guias/agente-ia-whatsapp-business-meta-o-propio"),
                ("Calculadora de horas", "Automatizar procesos administrativos con IA", WEB + "/guias/automatizar-procesos-administrativos-ia-pyme"),
            ]),
            ("tip", "Para jugar", "Todas traen una calculadora o un test: poné tus números y en dos minutos tenés tu respuesta."),
        ],
    },
    {
        "asunto": "Un caso real (con números)",
        "previa": "Qué cambió y qué no.",
        "alt": "Casos reales, números reales",
        "cuerpo": [
            "Te cuento tres casos reales, con números del administrador de anuncios de Meta:",
            ("datos", [
                ("8,2x", "Prussia · ecommerce de moda", "$209 millones en ventas atribuidas a Meta en 4 meses (enero a abril de 2026), con $25,5 millones de inversión."),
                ("630", "Alejandra Ferechian · inmobiliaria en CABA", "conversaciones de WhatsApp con interesados en 7 meses. Un solo reel trajo 206."),
                ("-97%", "Win Ar · marca de pádel", "en el costo por seguidor: de $46.848 a $1.419, con contenido de personas."),
            ]),
            ("tip", "Lo que tienen en común", "No fue el presupuesto: fueron los <strong>creativos</strong> (anuncios distintos, con personas reales) y <strong>responder rápido</strong> a quien escribía."),
            "No te lo cuento como promesa: cada negocio es distinto. Te lo cuento para que veas qué suele hacer la diferencia.",
        ],
    },
    {
        "asunto": "El error que más veo",
        "previa": "Y cómo se arregla esta semana.",
        "alt": "El error que más veo",
        "cuerpo": [
            "El error que más veo en negocios que invierten en anuncios: <strong>todos los anuncios dicen lo mismo</strong>. Cambia la foto o el producto, pero el argumento es siempre el precio o la promo.",
            "Así solo le hablás a quien ya estaba por comprar. Quien todavía no te conoce no encuentra un motivo para frenar el scroll, y cada vez llega menos gente nueva.",
            ("titulo", "Cómo arreglarlo esta semana: 3 anuncios, 3 ángulos"),
            ("tres", [
                ("1", "El problema", "Mostrá lo que resolvés."),
                ("2", "Una persona", "Alguien usando tu producto."),
                ("3", "Un cliente", "Una opinión real."),
            ]),
            ("tip", "El desafío", "Dejalos correr <strong>7 días</strong> al lado de lo que ya tenés y compará el costo por resultado. Si querés, contame cómo te fue respondiendo este mail."),
        ],
    },
    {
        "asunto": "¿Lo vemos juntos?",
        "previa": "30 minutos, sin compromiso.",
        "alt": "¿Lo vemos juntos?",
        "cuerpo": [
            "Si querés que miremos tu caso puntual, te ofrezco una <strong>llamada de diagnóstico de 30 minutos, sin costo</strong>. Reviso tus anuncios y cómo respondés las consultas, y te digo qué haría. Si no tiene sentido trabajar juntos, te lo digo.",
            ("boton", "Elegir mi horario", "https://crececonads.site/agendar"),
            ("tip", "¿Preferís escribir?", 'Mandá <strong>AGENTE</strong> por <a href="https://wa.me/5491173566942?text=AGENTE" style="color:' + AZUL + ';font-weight:bold;">WhatsApp al +54 9 11 7356-6942</a> y te responde mi agente de IA: así ves cómo funcionaría en tu negocio.'),
        ],
    },
]

P = f"margin:0 0 18px;font-family:{FUENTE};font-size:17px;line-height:1.6;color:{TEXTO};"


def bloque(b):
    if isinstance(b, str):
        return f'<p style="{P}">{b}</p>'
    tipo = b[0]
    if tipo == "boton":
        _, texto, url = b
        return (f'<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:6px 0 24px;"><tr>'
                f'<td style="border-radius:999px;background:{AZUL};border-bottom:4px solid #1D3FC7;">'
                f'<a href="{url}" style="display:inline-block;padding:16px 30px;font-family:{FUENTE};font-size:17px;font-weight:bold;color:#ffffff;text-decoration:none;border-radius:999px;">{texto} &nbsp;&rarr;</a>'
                f'</td></tr></table>')
    if tipo == "tip":
        _, etiqueta, texto = b
        return (f'<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 22px;"><tr>'
                f'<td style="background:#E6FAF2;border:2px dashed {VERDE};border-radius:16px;padding:16px 20px;font-family:{FUENTE};font-size:16px;line-height:1.55;color:{TEXTO};">'
                f'<span style="display:inline-block;background:{VERDE};color:{NOCHE};font-size:12px;font-weight:bold;letter-spacing:.06em;text-transform:uppercase;padding:4px 10px;border-radius:999px;margin-bottom:8px;">{etiqueta}</span><br>{texto}'
                f'</td></tr></table>')
    if tipo == "titulo":
        return f'<p style="margin:6px 0 12px;font-family:{FUENTE};font-size:20px;line-height:1.3;font-weight:bold;color:{NOCHE};">{b[1]}</p>'
    if tipo == "guias":
        filas = "".join(
            f'<tr><td style="padding:0 0 12px;"><a href="{u}" style="display:block;text-decoration:none;background:#F3F5FC;border:2px solid #DCE2F5;border-radius:16px;padding:16px 18px;">'
            f'<span style="display:inline-block;background:{AZUL};color:#ffffff;font-family:{FUENTE};font-size:12px;font-weight:bold;padding:3px 10px;border-radius:999px;">{tag}</span>'
            f'<span style="display:block;margin-top:8px;font-family:{FUENTE};font-size:17px;line-height:1.35;font-weight:bold;color:{NOCHE};">{t} <span style="color:{AZUL};">&rarr;</span></span></a></td></tr>'
            for tag, t, u in b[1])
        return f'<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 10px;">{filas}</table>'
    if tipo == "datos":
        colores = [AZUL, VERDE, AZUL2]
        filas = "".join(
            f'<tr><td style="padding:0 0 12px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:{NOCHE};border-radius:18px;"><tr>'
            f'<td width="128" style="padding:18px 0 18px 20px;vertical-align:middle;font-family:{FUENTE};font-size:34px;line-height:1;font-weight:bold;color:{colores[k]};white-space:nowrap;">{num}</td>'
            f'<td style="padding:18px 20px 18px 10px;font-family:{FUENTE};font-size:15px;line-height:1.5;color:#C9D0E6;">'
            f'<strong style="color:#ffffff;">{quien}</strong><br>{txt}</td></tr></table></td></tr>'
            for k, (num, quien, txt) in enumerate(b[1]))
        return f'<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 10px;">{filas}</table>'
    if tipo == "tres":
        colores = [AZUL, VERDE, AZUL2]
        celdas = "".join(
            f'<td width="33%" style="padding:0 5px;vertical-align:top;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#F3F5FC;border:2px solid #DCE2F5;border-radius:16px;"><tr>'
            f'<td style="padding:16px 12px;text-align:center;font-family:{FUENTE};">'
            f'<span style="display:inline-block;width:40px;height:40px;line-height:40px;border-radius:50%;background:{colores[k]};color:{"#ffffff" if k != 1 else NOCHE};font-size:20px;font-weight:bold;">{n}</span>'
            f'<span style="display:block;margin-top:10px;font-size:16px;font-weight:bold;color:{NOCHE};">{t}</span>'
            f'<span style="display:block;margin-top:4px;font-size:14px;line-height:1.4;color:{SUAVE};">{d}</span></td></tr></table></td>'
            for k, (n, t, d) in enumerate(b[1]))
        return f'<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 20px;"><tr>{celdas}</tr></table>'
    raise ValueError(tipo)


def avance(i):
    puntos = "".join(
        f'<td style="padding:0 4px;"><div style="width:{26 if k == i else 10}px;height:10px;border-radius:999px;background:{VERDE if k <= i else BORDE};font-size:0;line-height:0;">&nbsp;</div></td>'
        for k in range(1, 6))
    return f'<table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center"><tr>{puntos}</tr></table>'


def html(m, i):
    cuerpo = "\n".join(bloque(b) for b in m["cuerpo"])
    return f"""<!DOCTYPE html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light"><title>{m['asunto']}</title></head>
<body style="margin:0;padding:0;background:{FONDO};">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">{m['previa']}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:{FONDO};"><tr><td align="center" style="padding:24px 12px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;">

<tr><td style="background:{NOCHE};border-radius:22px 22px 0 0;padding:18px 24px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
<td style="font-family:{FUENTE};font-size:20px;font-weight:bold;color:#ffffff;"><a href="{WEB}" style="color:#ffffff;text-decoration:none;">Crece<span style="color:{AZUL2};">Con</span>Ads</a></td>
<td align="right" style="font-family:{FUENTE};font-size:13px;font-weight:bold;color:{VERDE};letter-spacing:.06em;">MAIL {i} DE 5</td>
</tr></table></td></tr>

<tr><td style="background:{NOCHE};padding:0 16px;"><img src="{WEB}/img/mails/mail-{i}.png" width="568" alt="{m['alt']}" style="display:block;width:100%;max-width:568px;height:auto;border-radius:16px;border:0;"></td></tr>
<tr><td style="background:{NOCHE};padding:16px 0 22px;">{avance(i)}</td></tr>

<tr><td style="background:#ffffff;padding:32px 30px 10px;">
<p style="margin:0 0 16px;font-family:{FUENTE};font-size:24px;line-height:1.25;font-weight:bold;color:{NOCHE};">Hola, {{$firstname}} <span style="color:{VERDE};">&#10022;</span></p>
{cuerpo}
</td></tr>

<tr><td style="background:#ffffff;padding:6px 30px 30px;border-radius:0 0 22px 22px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-top:2px dashed #DCE2F5;"><tr><td style="padding-top:20px;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
<td style="padding-right:14px;"><img src="{WEB}/img/damian-presmanes-avatar.jpg" width="56" height="56" alt="Damián Presmanes" style="display:block;border-radius:50%;border:3px solid {VERDE};"></td>
<td style="font-family:{FUENTE};font-size:16px;line-height:1.4;color:{TEXTO};"><strong>Damián Presmanes</strong><br><a href="{WEB}" style="color:{SUAVE};text-decoration:none;font-size:14px;">CreceConAds · crececonads.site</a></td>
</tr></table></td></tr></table>
</td></tr>

<tr><td style="padding:18px 20px 0;text-align:center;font-family:{FUENTE};font-size:12px;line-height:1.6;color:{SUAVE};">
Recibís este mail porque pediste un recurso en crececonads.site.<br>
<a href="{{$unsubscribe_link}}" style="color:{SUAVE};">Darme de baja</a>
</td></tr>

</table></td></tr></table>
</body></html>
"""


if __name__ == "__main__":
    out = Path(__file__).resolve().parent.parent / "docs" / "mails"
    out.mkdir(parents=True, exist_ok=True)
    for i, m in enumerate(MAILS, 1):
        (out / f"mail-{i}.html").write_text(html(m, i), encoding="utf-8")
        print(f"mail-{i}.html  ·  {m['asunto']}")
