// Avisos de un lead nuevo: mail inmediato a Damián (Gmail con contraseña de aplicación) y evento a Meta por la
// API de Conversiones (servidor), con el mismo event_id que el píxel para que Meta no lo cuente dos veces.
// Variables en Vercel (las carga Damián): GMAIL_USUARIO, GMAIL_APP_PASSWORD, opcional AVISO_A;
// META_PIXEL_ID y META_CAPI_TOKEN. Si faltan, ese aviso se saltea sin romper el formulario.
const crypto = require("crypto");

const sha = (v) => crypto.createHash("sha256").update(String(v).trim().toLowerCase()).digest("hex");
const esc = (t) => String(t == null ? "" : t).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

function telefonoAR(t) {
  let d = String(t || "").replace(/\D/g, "");
  if (!d) return "";
  if (d.startsWith("54")) d = d.slice(2);
  d = d.replace(/^0/, "");
  if (d.startsWith("9")) d = d.slice(1);
  d = d.replace(/^(\d{2,4})15/, "$1"); // 11 15 1234-5678 → 11 1234-5678
  return "549" + d;
}

async function mail(lead, calificado) {
  const usuario = process.env.GMAIL_USUARIO, clave = process.env.GMAIL_APP_PASSWORD;
  if (!usuario || !clave) return "sin_configurar";
  const nodemailer = require("nodemailer");
  const t = nodemailer.createTransport({ service: "gmail", auth: { user: usuario, pass: String(clave).replace(/\s/g, "") } });
  const wa = telefonoAR(lead.whatsapp);
  const filas = [["Nombre", lead.nombre], ["Tienda", lead.web], ["Instagram", lead.instagram], ["Invierte en Meta", lead.inversion],
    ["Vende", lead.vende], ["WhatsApp", lead.whatsapp], ["Mail", lead.email], ["Comentario", lead.mensaje],
    ["Campaña", lead.utm && (lead.utm.campaign || lead.utm.source)]].filter(([, v]) => v);
  const html = `<div style="font-family:Arial,sans-serif;max-width:560px">
    <h2 style="margin:0 0 8px">${calificado ? "🟢 Lead CALIFICADO" : "⚪ Lead nuevo (no califica)"}: ${esc(lead.nombre)}</h2>
    <p style="margin:0 0 12px;color:#555">Pidió la radiografía de 3 fugas. Respondé en menos de 5 minutos.</p>
    <table style="border-collapse:collapse">${filas.map(([k, v]) => `<tr><td style="padding:4px 10px 4px 0;color:#777">${k}</td><td style="padding:4px 0"><b>${esc(v)}</b></td></tr>`).join("")}</table>
    <p style="margin:16px 0">${wa ? `<a href="https://wa.me/${wa}?text=${encodeURIComponent("Hola " + String(lead.nombre).split(" ")[0] + ", soy Damián de CreceConAds. Recibí tu pedido de radiografía para " + lead.web + ". En 48 h hábiles te mando las 3 fugas por acá. ¿Hay algo en particular que te preocupe de tus anuncios?")}" style="background:#25D366;color:#fff;padding:10px 16px;border-radius:8px;text-decoration:none;font-weight:bold">Responder por WhatsApp</a>` : ""}
      &nbsp;<a href="https://crececonads.site/crm" style="color:#2F5BFF">Abrir el CRM</a></p></div>`;
  await t.sendMail({ from: `CreceConAds <${usuario}>`, to: process.env.AVISO_A || usuario,
    subject: `${calificado ? "🟢 Lead calificado" : "Lead nuevo"} · ${lead.web || lead.nombre}`, html });
  return "ok";
}

async function capi(lead, calificado, req) {
  const pixel = process.env.META_PIXEL_ID, token = process.env.META_CAPI_TOKEN;
  if (!pixel || !token || !lead.event_id) return "sin_configurar";
  const nombre = String(lead.nombre || "").trim().split(/\s+/);
  const ud = {
    client_ip_address: String(req.headers["x-forwarded-for"] || "").split(",")[0].trim() || undefined,
    client_user_agent: req.headers["user-agent"] || undefined,
    fbp: lead.fbp || undefined, fbc: lead.fbc || undefined,
    em: lead.email ? [sha(lead.email)] : undefined,
    ph: telefonoAR(lead.whatsapp) ? [sha(telefonoAR(lead.whatsapp))] : undefined,
    fn: nombre[0] ? [sha(nombre[0])] : undefined, ln: nombre.length > 1 ? [sha(nombre[nombre.length - 1])] : undefined,
    country: [sha("ar")],
  };
  const base = { event_time: Math.floor(Date.now() / 1000), action_source: "website", event_source_url: lead.url || "https://crececonads.site/radiografia", user_data: ud };
  const data = [{ ...base, event_name: "Lead", event_id: lead.event_id, custom_data: { content_name: "radiografia-3-fugas" } }];
  if (calificado) data.push({ ...base, event_name: "LeadCalificado", event_id: lead.event_id + "-c", custom_data: { content_name: "radiografia-3-fugas" } });
  const r = await fetch(`https://graph.facebook.com/v25.0/${encodeURIComponent(pixel)}/events?access_token=${encodeURIComponent(token)}`, {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ data }),
  });
  if (!r.ok) { console.error("CAPI respondió", r.status, (await r.text()).slice(0, 200)); return "error"; }
  return "ok";
}

module.exports = { mail, capi, telefonoAR };
