"""Arma el HTML de los 5 mails de la secuencia de recursos para pegar en Sender (editor HTML).

Salida: docs/mails/mail-N.html (docs/ no se publica en la web). Estilos en línea y tablas,
que es lo único que respetan Gmail y Outlook. Diseño de mail de persona, no de publicidad:
fondo claro, una columna de 600 px, firma con foto y a lo sumo un botón.

Variables de Sender: {$firstname}, {$recurso}. El link de baja va con la etiqueta de Sender
{$unsubscribe_link}: si el editor muestra otra, reemplazarla por la que inserta Sender.
"""
from pathlib import Path

AZUL = "#2F5BFF"
NOCHE = "#0A0F1F"
TEXTO = "#1F2433"
SUAVE = "#5B6478"
WEB = "https://crececonads.site"

MAILS = [
    {
        "asunto": "Tu recurso de CreceConAds",
        "previa": "Acá lo tenés, y una sugerencia para aprovecharlo.",
        "cuerpo": [
            "Gracias por bajar el recurso. Lo tenés siempre disponible acá:",
            ("boton", "Abrir mi recurso", WEB + "/recursos/{$recurso}"),
            "Una sugerencia: no lo leas entero hoy. Elegí una sola parte y aplicala esta semana. Lo que se usa rinde más que lo que se guarda.",
            "En los próximos días te voy a mandar algunas cosas que complementan lo que bajaste: una guía, un caso real y el error que más veo. Son pocos mails y cortos.",
        ],
    },
    {
        "asunto": "Lo que viene después del recurso",
        "previa": "La guía que lo explica a fondo.",
        "cuerpo": [
            "El recurso que bajaste es la parte práctica. Si querés entender el porqué, escribí guías que lo explican con ejemplos y números reales:",
            ("lista", [
                ("Cuánto cuesta la publicidad en Instagram y cuánto invertir", WEB + "/guias/cuanto-cuesta-publicidad-instagram-argentina"),
                ("Agente de IA en WhatsApp Business: el de Meta o uno propio", WEB + "/guias/agente-ia-whatsapp-business-meta-o-propio"),
                ("Automatizar procesos administrativos con IA", WEB + "/guias/automatizar-procesos-administrativos-ia-pyme"),
            ]),
            "Todas tienen una calculadora o un test para que hagas la cuenta con tus números.",
        ],
    },
    {
        "asunto": "Un caso real (con números)",
        "previa": "Qué cambió y qué no.",
        "cuerpo": [
            "Te cuento tres casos reales, con números del administrador de anuncios de Meta:",
            ("datos", [
                ("Prussia", "ecommerce de moda", "$209 millones en ventas atribuidas a Meta en 4 meses (enero a abril de 2026), con $25,5 millones de inversión."),
                ("Alejandra Ferechian", "inmobiliaria en CABA", "630 conversaciones de WhatsApp con interesados en 7 meses; un solo reel trajo 206."),
                ("Win Ar", "marca de pádel", "el costo por seguidor bajó de $46.848 a $1.419 con contenido de personas."),
            ]),
            "En los tres, lo que más movió los números no fue el presupuesto: fueron los creativos (anuncios distintos, con personas reales) y responder rápido a quien escribía.",
            "No te lo cuento como promesa: cada negocio es distinto. Te lo cuento para que veas qué es lo que suele hacer la diferencia.",
        ],
    },
    {
        "asunto": "El error que más veo",
        "previa": "Y cómo se arregla esta semana.",
        "cuerpo": [
            "El error que más veo en negocios que invierten en anuncios: <strong>todos los anuncios dicen lo mismo</strong>. Cambia la foto o el producto, pero el argumento es siempre el precio o la promo.",
            "El problema es que así solo le hablás a quien ya estaba por comprar. La persona que todavía no te conoce no encuentra un motivo para frenar el scroll, y con el tiempo llega cada vez menos gente nueva.",
            "<strong>Cómo arreglarlo esta semana:</strong> armá 3 anuncios con ángulos distintos.",
            ("numerada", [
                "Uno que muestre el problema que resolvés.",
                "Uno con una persona usando tu producto.",
                "Uno con una opinión real de un cliente.",
            ]),
            "Dejalos correr 7 días al lado de lo que ya tenés y compará el costo por resultado.",
        ],
    },
    {
        "asunto": "¿Lo vemos juntos?",
        "previa": "30 minutos, sin compromiso.",
        "cuerpo": [
            "Si querés que miremos tu caso puntual, te ofrezco una llamada de diagnóstico de 30 minutos, sin costo. Reviso tus anuncios y cómo respondés las consultas, y te digo qué haría. Si no tiene sentido trabajar juntos, te lo digo.",
            ("boton", "Elegir horario", "https://calendar.app.google/Y7rQAcUQw2EqX5z3A"),
            'Y si preferís escribirme, mandá <strong>AGENTE</strong> por <a href="https://wa.me/5491173566942?text=AGENTE" style="color:' + AZUL + ';">WhatsApp al +54 9 11 7356-6942</a> y te responde mi agente de IA, para que veas cómo funcionaría en tu negocio.',
        ],
    },
]

P = f'margin:0 0 16px;font-size:16px;line-height:1.6;color:{TEXTO};'


def bloque(b):
    if isinstance(b, str):
        return f'<p style="{P}">{b}</p>'
    tipo = b[0]
    if tipo == "boton":
        _, texto, url = b
        return (f'<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:4px 0 20px;"><tr>'
                f'<td style="border-radius:8px;background:{AZUL};">'
                f'<a href="{url}" style="display:inline-block;padding:12px 22px;font-size:16px;font-weight:bold;color:#ffffff;text-decoration:none;border-radius:8px;">{texto} &rarr;</a>'
                f'</td></tr></table>')
    if tipo == "lista":
        items = "".join(f'<li style="margin:0 0 10px;"><a href="{u}" style="color:{AZUL};text-decoration:underline;">{t}</a></li>' for t, u in b[1])
        return f'<ul style="margin:0 0 16px;padding-left:20px;font-size:16px;line-height:1.5;color:{TEXTO};">{items}</ul>'
    if tipo == "numerada":
        items = "".join(f'<li style="margin:0 0 8px;">{t}</li>' for t in b[1])
        return f'<ol style="margin:0 0 16px;padding-left:22px;font-size:16px;line-height:1.5;color:{TEXTO};">{items}</ol>'
    if tipo == "datos":
        filas = "".join(
            f'<tr><td style="padding:14px 16px;border-left:3px solid {AZUL};background:#F3F5FB;font-size:15px;line-height:1.5;color:{TEXTO};">'
            f'<strong>{n}</strong> <span style="color:{SUAVE};">· {r}</span><br>{d}</td></tr>'
            f'<tr><td style="height:10px;line-height:10px;font-size:0;">&nbsp;</td></tr>'
            for n, r, d in b[1])
        return f'<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 8px;">{filas}</table>'
    raise ValueError(tipo)


def html(m):
    cuerpo = "\n".join(bloque(b) for b in m["cuerpo"])
    return f"""<!DOCTYPE html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>{m['asunto']}</title></head>
<body style="margin:0;padding:0;background:#EEF1F6;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">{m['previa']}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#EEF1F6;"><tr><td align="center" style="padding:24px 12px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;background:#ffffff;border-radius:10px;font-family:Arial,Helvetica,sans-serif;">
<tr><td style="padding:22px 32px;border-bottom:1px solid #E4E8F1;">
<a href="{WEB}" style="font-size:18px;font-weight:bold;color:{NOCHE};text-decoration:none;">Crece<span style="color:{AZUL};">Con</span>Ads</a>
</td></tr>
<tr><td style="padding:28px 32px 8px;">
<p style="{P}">Hola {{$firstname}},</p>
{cuerpo}
</td></tr>
<tr><td style="padding:4px 32px 28px;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
<td style="padding-right:12px;"><img src="{WEB}/img/damian-presmanes-avatar.jpg" width="48" height="48" alt="Damián Presmanes" style="display:block;border-radius:50%;"></td>
<td style="font-size:15px;line-height:1.4;color:{TEXTO};"><strong>Damián Presmanes</strong><br><a href="{WEB}" style="color:{SUAVE};text-decoration:none;">CreceConAds · crececonads.site</a></td>
</tr></table>
</td></tr>
</table>
<p style="max-width:600px;margin:16px auto 0;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.5;color:{SUAVE};text-align:center;">
Recibís este mail porque pediste un recurso en crececonads.site.<br>
<a href="{{$unsubscribe_link}}" style="color:{SUAVE};">Darme de baja</a>
</p>
</td></tr></table>
</body></html>
"""


if __name__ == "__main__":
    out = Path(__file__).resolve().parent.parent / "docs" / "mails"
    out.mkdir(parents=True, exist_ok=True)
    for i, m in enumerate(MAILS, 1):
        (out / f"mail-{i}.html").write_text(html(m), encoding="utf-8")
        print(f"mail-{i}.html  ·  {m['asunto']}")
