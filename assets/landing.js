// Formulario de la radiografía (2 pasos). Guarda en el CRM (/api/lead) y, solo si se guardó, dispara el Lead del píxel
// y generate_lead de GA4 con el evento que ya usa Tag Manager (recurso_desbloqueado), sin tocar GTM.
(() => {
  const $ = (s) => document.querySelector(s);
  const form = $("#ld-form"), err = $("#ld-error"), datos = {};
  const qs = new URLSearchParams(location.search);
  const utm = {};
  ["utm_source", "utm_medium", "utm_campaign", "utm_content", "fbclid", "gclid"].forEach((k) => { if (qs.get(k)) utm[k.replace("utm_", "")] = qs.get(k); });
  const error = (t) => { err.textContent = t; err.hidden = !t; };

  document.querySelectorAll(".ld-opc").forEach((g) => g.addEventListener("click", (e) => {
    const b = e.target.closest("button"); if (!b) return;
    g.querySelectorAll("button").forEach((x) => x.setAttribute("aria-pressed", x === b));
    datos[g.dataset.campo] = b.textContent.trim(); error("");
  }));

  const paso = (n) => {
    document.querySelectorAll(".ld-paso").forEach((p) => (p.hidden = p.dataset.paso !== String(n)));
    form.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  $("#ld-sig").addEventListener("click", () => {
    if ($("#ld-web").value.trim().length < 4) return error("Poné la web de tu tienda.");
    if (!datos.inversion) return error("Elegí cuánto invertís en Meta por mes.");
    if (!datos.vende) return error("Elegí qué vendés.");
    error(""); paso(2);
    (window.dataLayer = window.dataLayer || []).push({ event: "cta_click", cta_type: "radiografia_paso2", cta_section: location.pathname });
  });
  $("#ld-volver").addEventListener("click", () => paso(1));

  form.addEventListener("submit", async (ev) => {
    ev.preventDefault();
    const nombre = $("#ld-nombre").value.trim(), wa = $("#ld-wa").value.trim(), mail = $("#ld-mail").value.trim();
    if (!nombre) return error("Poné tu nombre.");
    if (wa.replace(/\D/g, "").length < 8 && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(mail)) return error("Dejá un WhatsApp o un mail para mandarte la radiografía.");
    const boton = $("#ld-enviar"); boton.disabled = true; boton.textContent = "Enviando…"; error("");
    const cuerpo = { nombre, whatsapp: wa, email: mail, web: $("#ld-web").value.trim(), instagram: $("#ld-ig").value.trim(),
      inversion: datos.inversion, vende: datos.vende, mensaje: $("#ld-msj").value.trim(), empresa_web: form.empresa_web.value,
      oferta: "Radiografía de 3 fugas", utm };
    try {
      const r = await fetch("/api/lead", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(cuerpo) });
      const j = await r.json().catch(() => ({}));
      if (!r.ok || !j.ok) throw new Error("envio");
      (window.dataLayer = window.dataLayer || []).push({ event: "recurso_desbloqueado", recurso: "radiografia-3-fugas", rubro: datos.vende, calificado: j.calificado ? "si" : "no" });
      // Invierte $ 2.000.000 o más por mes: evento aparte para medir (y optimizar) el costo por lead calificado.
      if (j.calificado) window.dataLayer.push({ event: "lead_calificado", recurso: "radiografia-3-fugas", rubro: datos.vende, inversion: datos.inversion });
      form.hidden = true;
      const ok = $("#ld-ok"); ok.hidden = false;
      ok.innerHTML = j.calificado
        ? `<h3>¡Listo, ${nombre.split(" ")[0]}! Ya estoy con tu radiografía.</h3><p>En 48 horas hábiles te mando las 3 fugas por ${wa ? "WhatsApp" : "mail"}. Si querés adelantarme algo, escribime.</p>
           <p><a class="btn" data-cta="whatsapp" href="https://wa.me/5491173566942?text=${encodeURIComponent("Hola, pedí la radiografía de " + cuerpo.web)}" target="_blank" rel="noopener">Escribirme por WhatsApp</a></p>`
        : `<h3>¡Gracias, ${nombre.split(" ")[0]}!</h3><p>Recibí tus datos. La radiografía está pensada para tiendas que ya invierten todos los meses en Meta, así que por ahora te va a servir más esto:</p>
           <p><a href="/guias/cuanto-cuesta-publicidad-instagram-argentina">Cuánto invertir en publicidad en Instagram</a> · <a href="/recursos/cuenta-inversion-publicidad-instagram">La cuenta para saber cuánto invertir</a></p><p>Igual te escribo para ver tu caso.</p>`;
      ok.scrollIntoView({ behavior: "smooth", block: "center" });
    } catch (e) {
      boton.disabled = false; boton.textContent = "Quiero mis 3 fugas";
      error("No se pudo enviar. Probá de nuevo o escribime por WhatsApp al +54 9 11 7356-6942.");
    }
  });
})();
