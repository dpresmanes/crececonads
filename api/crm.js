// API privada del CRM. Clave en la variable de entorno CRM_CLAVE (la carga Damián en Vercel); se manda en el header x-crm-clave.
// GET: todos los contactos. POST: crear (o importar con {importar:[...]}). PATCH: actualizar {id, ...campos, nota}.
// DELETE: borrar {id} (baja definitiva).
const crypto = require("crypto");
const { crear, leer, guardar, borrar, todos, limpiar, leerCuerpo, txt, ahora } = require("./_crm");

function autorizado(req) {
  const clave = String(process.env.CRM_CLAVE || "");
  const dada = String(req.headers["x-crm-clave"] || "");
  if (clave.length < 8 || dada.length !== clave.length) return false;
  return crypto.timingSafeEqual(Buffer.from(dada), Buffer.from(clave));
}

module.exports = async (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Robots-Tag", "noindex, nofollow");
  if (!process.env.CRM_CLAVE || !process.env.BLOB_READ_WRITE_TOKEN) return res.status(503).json({ ok: false, motivo: "sin_configurar" });
  if (!autorizado(req)) return res.status(401).json({ ok: false, motivo: "clave" });
  try {
    if (req.method === "GET") {
      const lista = await todos();
      lista.sort((a, b) => String(b.actualizado).localeCompare(String(a.actualizado)));
      return res.status(200).json({ ok: true, contactos: lista });
    }
    const b = leerCuerpo(req);
    if (req.method === "POST") {
      if (Array.isArray(b.importar)) {
        // Dedupe por Instagram, LinkedIn o web: si cualquiera ya existe, se saltea.
        const claves = (c) => [c.instagram, c.linkedin, c.web].map((v) => txt(v).toLowerCase().replace(/\/+$/, "")).filter(Boolean);
        const existentes = new Set((await todos()).flatMap(claves));
        let n = 0;
        for (const d of b.importar.slice(0, 500)) {
          const ks = claves(d);
          if (ks.some((k) => existentes.has(k))) continue;
          await crear(d, d.origen || "prospeccion", txt(d.nota_inicial, 500) || "Importado del pipeline de prospección");
          ks.forEach((k) => existentes.add(k)); n++;
        }
        return res.status(200).json({ ok: true, importados: n });
      }
      const c = await crear(b, b.origen || "otro", txt(b.nota, 500) || "Cargado a mano");
      return res.status(200).json({ ok: true, contacto: c });
    }
    if (req.method === "PATCH") {
      const c = await leer(txt(b.id, 60));
      if (!c) return res.status(404).json({ ok: false });
      const antes = c.etapa;
      const nuevo = limpiar(b, c);
      nuevo.historial = Array.isArray(c.historial) ? c.historial : [];
      if (nuevo.etapa !== antes) nuevo.historial.push({ fecha: ahora(), texto: "Etapa: " + antes + " → " + nuevo.etapa });
      if (txt(b.nota)) nuevo.historial.push({ fecha: ahora(), texto: txt(b.nota, 1000) });
      return res.status(200).json({ ok: true, contacto: await guardar(nuevo) });
    }
    if (req.method === "DELETE") {
      const c = await leer(txt(b.id, 60));
      if (!c) return res.status(404).json({ ok: false });
      await borrar(c.id);
      return res.status(200).json({ ok: true, borrado: c.id });
    }
    return res.status(405).json({ ok: false });
  } catch (e) {
    console.error("CRM:", e && e.message);
    return res.status(502).json({ ok: false });
  }
};
