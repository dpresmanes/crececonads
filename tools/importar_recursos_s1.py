"""Pasa los recursos de la semana 1 del sistema de Instagram (s1_contenido.IMANES + s1_recursos_extra)
a páginas de contenido de crececonads.site (contenido/recurso-*.html). Se corre una vez; después cada
recurso nuevo se escribe directo como página.

Uso: python3 tools/importar_recursos_s1.py <recursos-s1.json>
"""
import html, json, sys
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
PROMPT_IA = """Sos el asistente de atención de [NOMBRE DEL NEGOCIO], que vende [QUÉ VENDÉS] a [PARA QUIÉN].
Hablás como nosotros: de vos, cálido, frases cortas y [SÍ / NO] usamos emojis.

Estos son ejemplos reales de cómo respondemos:
1. [PREGUNTA] → [TU RESPUESTA]
2. [PREGUNTA] → [TU RESPUESTA]
3. [PREGUNTA] → [TU RESPUESTA]
4. [PREGUNTA] → [TU RESPUESTA]
5. [PREGUNTA] → [TU RESPUESTA]

Reglas:
- Nunca inventes precios, stock ni plazos: usá solo esta información: [PEGÁ TU INFO].
- Si no sabés algo, decí que lo consultás y pasale la conversación a una persona.
- Si alguien pregunta si sos una persona, decí la verdad: sos un asistente.
- Terminá cada respuesta con un paso concreto: el link, una pregunta o el próximo paso.

Ahora respondé este mensaje de un cliente: [MENSAJE]"""

COMO = {
  "2026-11-02": ["Completá cada respuesta con tus datos reales: precios, plazos, condiciones.", "Escribila como hablás vos con tus clientes, no como un manual.", "Guardala en respuestas rápidas de WhatsApp Business (o en un documento compartido con tu equipo).", "Si después sumás un agente de IA, esta plantilla es lo primero que va a aprender."],
  "2026-11-03": ["Tomá los chats de la última semana.", "Marcá cada punto: sí, no o a veces.", "El bloque con más \"no\" es tu fuga principal: empezá por ahí.", "Repetí el checklist en 30 días para ver si mejoró."],
  "2026-11-04": ["Anotá cada semana: inversión, consultas y ventas.", "Calculá las dos cuentas.", "Compará el costo por cliente con lo que te deja cada venta.", "Decidí: escalar, ajustar el anuncio o mejorar la atención."],
  "2026-11-05": ["Elegí 2 o 3 mensajes que suenen a vos y adaptalos.", "Mandá el primero a las 24 horas, sin presión.", "Sumá algo útil: una foto, una reseña, un dato.", "Si te dicen que no, agradecé y dejá la puerta abierta."],
  "2026-11-06": ["Revisá tu web, tu Instagram y tus mensajes de compra con esta lista.", "Escribí tu política de cambios y garantía en un texto corto.", "Sumá el aviso de datos personales en tu primer mensaje o en tu web.", "Para tu caso puntual, consultá con tu contador o abogado: esto es información general."],
  "2026-11-07": ["Copiá el prompt de abajo y completá lo que está entre corchetes.", "Pegale 5 respuestas reales tuyas como ejemplo.", "Probá con preguntas reales de clientes.", "Corregí lo que no te guste y volvé a pedir: la IA aprende de tus correcciones en la charla."],
  "2026-11-08": ["Abrí el administrador de anuncios y elegí \"últimos 7 días\".", "Seguí los 4 pasos en orden.", "Anotá los números en una planilla cada semana.", "Si algo no cierra, mirá primero el creativo, después la oferta y por último la atención."],
}
SLUGS = {
  "2026-11-02": ("plantilla-respuestas-whatsapp", "agente-ia-whatsapp-tienda-online", "Agentes de IA · WhatsApp"),
  "2026-11-03": ("checklist-consultas-perdidas", "agente-ia-whatsapp-business-meta-o-propio", "Atención · WhatsApp"),
  "2026-11-04": ("cuanto-te-cuesta-cada-cliente", "cuanto-cuesta-publicidad-instagram-argentina", "Meta Ads · Presupuesto"),
  "2026-11-05": ("mensajes-de-seguimiento", "agente-ia-whatsapp-tienda-online", "Ventas · Seguimiento"),
  "2026-11-06": ("vender-por-redes-sin-problemas-legales", "", "Ecommerce · Legal"),
  "2026-11-07": ("prompt-ia-con-tu-tono", "automatizar-procesos-administrativos-ia-pyme", "IA · Atención"),
  "2026-11-08": ("metricas-meta-ads-en-10-minutos", "escalar-ventas-tienda-online-meta-ads", "Meta Ads · Métricas"),
}
esc = lambda t: html.escape(t, quote=False)


def checklist(filas):
    return '<ul class="viz-chk">' + "".join(f"<li><label><input type=\"checkbox\"> {esc(f)}</label></li>" for f in filas) + "</ul>"


def main(origen):
    datos = json.load(open(origen, encoding="utf-8"))
    for fecha, d in datos.items():
        im, extra = d["im"], d["extra"]
        slug, guia, tag = SLUGS[fecha]
        titulo_txt = im["titulo"].replace("<em>", "").replace("</em>", "")
        bloques = im["bloques"]
        visibles, cerrados = bloques[:1], bloques[1:]
        cuerpo = [f'<h2 id="b0">{esc(visibles[0][0])}</h2>', checklist(visibles[0][1])]
        cuerpo.append("<!-- completo -->")
        for i, (h, filas) in enumerate(cerrados, 1):
            cuerpo += [f'<h2 id="b{i}">{esc(h)}</h2>', checklist(filas)]
        for sec, filas in extra:
            cuerpo.append(f"<h2>{esc(sec)}</h2>")
            cuerpo.append('<div class="pares">' + "".join(f'<div><b>{esc(a)}</b><p>{esc(b)}</p></div>' for a, b in filas) + "</div>")
        if im["palabra"] == "IA":
            cuerpo.append('<h2>El prompt para copiar</h2><div class="copiar"><button type="button" class="btn btn-line btn-sm" data-copiar>Copiar el prompt</button><pre>' + esc(PROMPT_IA) + "</pre></div>")
        cuerpo.append("<h2>Cómo usarlo</h2><ol>" + "".join(f"<li>{esc(x)}</li>" for x in COMO[fecha]) + "</ol>")
        if im["palabra"] == "GUIA":
            cuerpo.append('<p class="nota">Información general, no es asesoramiento legal. Consultá tu caso con tu contador o abogado.</p>')
        meta = {"tipo": "recurso", "slug": slug, "palabra": im["palabra"], "titulo": titulo_txt, "titulo_html": im["titulo"],
                "descripcion": im["sub"], "recurso": im["recurso"], "fecha": fecha, "tag": tag, "guia": guia}
        destino = RAIZ / "contenido" / f"recurso-{slug}.html"
        destino.write_text("<!--" + json.dumps(meta, ensure_ascii=False, indent=1) + "-->\n" + "\n".join(cuerpo) + "\n", encoding="utf-8")
        print("ok", destino.name)


if __name__ == "__main__":
    main(sys.argv[1])
