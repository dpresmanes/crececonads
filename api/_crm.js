// Guardado del CRM en Vercel Blob (store privado "crececonads-crm"). Un archivo JSON por contacto: crm/contactos/<id>.json
const { put, get, list } = require("@vercel/blob");
const crypto = require("crypto");

const PREFIJO = "crm/contactos/";
const ETAPAS = ["Nuevo", "Contactado", "Ideas enviadas", "Llamada", "Propuesta", "Ganado", "Perdido"];
const ORIGENES = ["pauta", "prospeccion", "web", "referido", "otro"];
const CAMPOS = ["nombre", "marca", "web", "instagram", "email", "whatsapp", "vende", "inversion", "notas",
  "proximo_paso", "proximo_fecha", "valor", "motivo_perdida"];

const txt = (v, max = 400) => String(v == null ? "" : v).trim().slice(0, max);
const ahora = () => new Date().toISOString();
const nuevoId = () => Date.now().toString(36) + "-" + crypto.randomBytes(3).toString("hex");

function limpiar(d, base = {}) {
  const c = { ...base };
  for (const k of CAMPOS) if (k in d) c[k] = txt(d[k], k === "notas" ? 4000 : 400);
  if ("etapa" in d && ETAPAS.includes(d.etapa)) c.etapa = d.etapa;
  if ("origen" in d && ORIGENES.includes(d.origen)) c.origen = d.origen;
  if (d.utm && typeof d.utm === "object") c.utm = Object.fromEntries(Object.entries(d.utm).slice(0, 6).map(([k, v]) => [txt(k, 30), txt(v, 120)]));
  return c;
}

async function guardar(c) {
  c.actualizado = ahora();
  await put(PREFIJO + c.id + ".json", JSON.stringify(c), {
    access: "private", addRandomSuffix: false, allowOverwrite: true, contentType: "application/json",
  });
  return c;
}

async function leer(id) {
  const r = await get(PREFIJO + id.replace(/[^a-z0-9-]/g, "") + ".json", { access: "private", useCache: false });
  if (!r) return null;
  return JSON.parse(await new Response(r.stream).text());
}

async function todos() {
  const out = [];
  let cursor;
  do {
    const r = await list({ prefix: PREFIJO, cursor, limit: 1000 });
    cursor = r.hasMore ? r.cursor : undefined;
    const lotes = r.blobs;
    for (let i = 0; i < lotes.length; i += 20) {
      const parte = await Promise.all(lotes.slice(i, i + 20).map(async (b) => {
        const g = await get(b.pathname, { access: "private", useCache: false });
        return g ? JSON.parse(await new Response(g.stream).text()) : null;
      }));
      out.push(...parte.filter(Boolean));
    }
  } while (cursor);
  return out;
}

async function crear(d, origen, nota) {
  const c = limpiar(d, { id: nuevoId(), creado: ahora(), etapa: "Nuevo", origen: ORIGENES.includes(origen) ? origen : "otro", historial: [] });
  if (d.etapa && ETAPAS.includes(d.etapa)) c.etapa = d.etapa;
  c.historial.push({ fecha: c.creado, texto: nota || "Contacto creado" });
  return guardar(c);
}

function leerCuerpo(req) {
  if (req.body && typeof req.body === "object") return req.body;
  try { return JSON.parse(req.body || "{}"); } catch (e) { return {}; }
}

module.exports = { ETAPAS, ORIGENES, limpiar, guardar, leer, todos, crear, leerCuerpo, txt, ahora };
