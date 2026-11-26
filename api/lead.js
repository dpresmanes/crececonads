// Formulario público de la oferta (página /oferta): crea el contacto en el CRM con origen "pauta" (o "web" sin UTM de anuncio).
const { crear, leerCuerpo, txt } = require("./_crm");
const avisos = require("./_avisos");

module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).json({ ok: false });
  const b = leerCuerpo(req);
  if (b.empresa_web) return res.status(200).json({ ok: true }); // campo trampa: los bots lo completan
  const email = txt(b.email, 120).toLowerCase(), whatsapp = txt(b.whatsapp, 40);
  if (!txt(b.nombre) || !txt(b.web) || (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) && whatsapp.replace(/\D/g, "").length < 8))
    return res.status(400).json({ ok: false, motivo: "faltan_datos" });
  if (!process.env.BLOB_READ_WRITE_TOKEN) return res.status(503).json({ ok: false, motivo: "sin_configurar" });
  const utm = b.utm && typeof b.utm === "object" ? b.utm : {};
  const deAnuncio = /facebook|instagram|meta|fb|ig|google/i.test(String(utm.source || "")) || Boolean(utm.fbclid || utm.gclid);
  // Calificado: invierte $ 2.000.000 o más por mes en Meta (decisión de Damián, 26/11).
  const calificado = ["$ 2.000.000 a $ 5.000.000", "Más de $ 5.000.000"].includes(txt(b.inversion));
  const notas = ["Oferta: " + (txt(b.oferta, 60) || "radiografía de 3 fugas"), "Calificado: " + (calificado ? "SÍ" : "no"),
    b.invierte && "¿Invierte en Meta?: " + txt(b.invierte, 40), b.mensaje && "Comentario: " + txt(b.mensaje, 600)].filter(Boolean).join("\n");
  const proximo = calificado
    ? { proximo_paso: "Confirmar por WhatsApp y mandar la radiografía (48 h hábiles)", proximo_fecha: new Date(Date.now() + 2 * 86400000).toISOString().slice(0, 10) }
    : { proximo_paso: "No califica por inversión: mandar guía y seguir en 3 meses", proximo_fecha: "" };
  try {
    await crear({ ...b, email, whatsapp, utm, notas, ...proximo }, deAnuncio ? "pauta" : "web", "Pidió la radiografía desde la web" + (utm.campaign ? " (campaña " + txt(utm.campaign, 80) + ")" : "") + (calificado ? " · CALIFICADO" : ""));
  } catch (e) {
    console.error("CRM: no se pudo guardar el lead", e && e.message);
    return res.status(502).json({ ok: false });
  }
  // Avisos en paralelo y con tope de tiempo: si fallan, el lead ya quedó guardado.
  const lead = { ...b, email, whatsapp, utm, event_id: txt(b.event_id, 80), fbp: txt(b.fbp, 200), fbc: txt(b.fbc, 300), url: txt(b.url, 300) };
  const tope = (p) => Promise.race([p, new Promise((r) => setTimeout(() => r("tiempo"), 7000))]);
  const [m, c] = await Promise.allSettled([tope(avisos.mail(lead, calificado)), tope(avisos.capi(lead, calificado, req))]);
  if (m.status === "rejected") console.error("Aviso por mail:", m.reason && m.reason.message);
  if (c.status === "rejected") console.error("CAPI:", c.reason && c.reason.message);
  return res.status(200).json({ ok: true, calificado });
};
