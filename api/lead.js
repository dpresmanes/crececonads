// Formulario público de la oferta (página /oferta): crea el contacto en el CRM con origen "pauta" (o "web" sin UTM de anuncio).
const { crear, leerCuerpo, txt } = require("./_crm");

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
  try {
    await crear({ ...b, email, whatsapp, utm }, deAnuncio ? "pauta" : "web", "Pidió la oferta desde la web" + (utm.campaign ? " (campaña " + txt(utm.campaign, 80) + ")" : ""));
  } catch (e) {
    console.error("CRM: no se pudo guardar el lead", e && e.message);
    return res.status(502).json({ ok: false });
  }
  return res.status(200).json({ ok: true });
};
