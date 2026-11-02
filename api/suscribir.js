// Alta de quien desbloquea un recurso en Sender (grupo de recursos), para la secuencia de mails.
// Variables en Vercel: SENDER_API_TOKEN y SENDER_GROUP_ID. Sin ellas responde 503 y la página
// igual muestra el recurso (el contenido no depende de que el alta funcione).
const RUBROS = ["Tienda online", "Inmobiliaria", "Servicios o profesional", "Otro"];

module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).json({ ok: false });
  const b = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
  // Campo trampa: las personas no lo ven; los bots lo completan.
  if (b.web) return res.status(200).json({ ok: true });
  const email = String(b.email || "").trim().toLowerCase();
  const nombre = String(b.nombre || "").trim().slice(0, 80);
  const rubro = RUBROS.includes(b.rubro) ? b.rubro : "Otro";
  const recurso = String(b.recurso || "").replace(/[^a-z0-9-]/g, "").slice(0, 80);
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || email.length > 120 || !nombre) return res.status(400).json({ ok: false });

  // trim y sin "Bearer " por si se pegó con espacios o con el prefijo.
  const token = String(process.env.SENDER_API_TOKEN || "").trim().replace(/^Bearer\s+/i, "").replace(/[\s"']/g, ""), grupo = String(process.env.SENDER_GROUP_ID || "").trim();
  if (!token || !grupo) return res.status(503).json({ ok: false, motivo: "sin_configurar" });

  const r = await fetch("https://api.sender.net/v2/subscribers", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ email, firstname: nombre, groups: [grupo], fields: { "{$rubro}": rubro, "{$recurso}": recurso }, trigger_automation: true }),
  });
  if (!r.ok) {
    console.error("Sender respondió", r.status, "largo del token:", token.length, (await r.text()).slice(0, 200));
    return res.status(502).json({ ok: false });
  }
  return res.status(200).json({ ok: true });
};
