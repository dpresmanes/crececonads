// Portfolio de automatizaciones: líneas de montaje animadas y demo de la planilla de la UTN (datos inventados).
(() => {
const $ = (s, r = document) => r.querySelector(s);
const push = (tipo, texto) => (window.dataLayer = window.dataLayer || []).push({ event: "cta_click", cta_type: tipo, cta_text: texto, cta_section: location.pathname });

// paso: [título, detalle, etiqueta]; etiqueta "ok" = lo apruebo yo
const LINEAS = {
  utn: { titulo: "Cómo funciona", pasos: [
    ["Llega el pedido", "Cada pedido de simultaneidad queda cargado en una fila de la planilla.", "Automático"],
    ["Materias a evaluar", "El script cruza las dos carreras y deja marcadas las materias que hay que evaluar.", "Automático"],
    ["Pedido al departamento", "Con las materias marcadas se arma el pedido al departamento docente.", "Automático"],
    ["Informe de equivalencias", "Con la respuesta del departamento, el informe se genera solo.", "Automático"],
    ["Reviso yo", "Controlo los trámites listos y los marco para la resolución.", "ok"],
    ["Resolución colectiva", "Un clic en el menú «Resoluciones» y sale el documento con todos los trámites marcados.", "1 clic"]]},
  organico: { titulo: "Contenido en Instagram y Facebook", intro: "Tres carruseles y cuatro historias por día en @crececonads, con un equipo de agentes que investiga, diseña, programa y mide.", pasos: [
    ["Investigación", "Un agente busca los temas que preocupan a los dueños de pymes y lo que está funcionando en la competencia.", "Semanal"],
    ["Producción", "Se arman 3 carruseles y 4 historias por día, con videos animados. Los reels se editan con cortes y animaciones.", "Diario"],
    ["Reviso yo", "Apruebo el calendario y las piezas antes de que salgan.", "ok"],
    ["Programación", "Las publicaciones quedan programadas y un agente controla que salgan a horario.", "Automático"],
    ["Captación", "Quien comenta la palabra clave recibe un recurso gratis por mensaje directo y entra a la secuencia de mails.", "24 h"],
    ["Métricas", "A las 48 h se leen los números de cada publicación con la API oficial y vuelven a la planilla para decidir qué repetir.", "Automático"]]},
  ads: { titulo: "Meta Ads para clientes", intro: "Campañas de clientes armadas y controladas por agentes, con todo en pausa hasta mi aprobación.", pasos: [
    ["Objetivo del cliente", "Producto, público y meta de cada cuenta, en la bitácora del cliente.", "Inicio"],
    ["Reglas al día", "Un vigía lee todos los días las novedades oficiales de Meta Ads y actualiza las reglas que se usan.", "Diario"],
    ["Armado", "Campañas, conjuntos, anuncios y textos armados; los creativos quedan ordenados en el Drive del cliente.", "Automático"],
    ["Apruebo yo", "Todo queda en pausa o en borrador hasta mi OK. Nada se gasta sin aprobación.", "ok"],
    ["Control diario", "Cada mañana se revisan gasto, resultados y alertas de todas las cuentas.", "Diario"],
    ["Reporte semanal", "Un informe por cuenta con qué funcionó y qué cambiar, y todo queda en la bitácora.", "Semanal"]]},
  seo: { titulo: "SEO e investigación web", intro: "La web crececonads.site se escribe, se publica y se mide con un sistema propio.", pasos: [
    ["Investigación", "Búsquedas reales de Google y Bing y preguntas de clientes alimentan un calendario de guías en una planilla.", "Semanal"],
    ["Borradores", "Martes y jueves se escribe una guía corta, y los martes la guía semanal, cada una con su herramienta interactiva.", "Automático"],
    ["Reviso yo", "Leo cada borrador y la guía se publica solo con mi OK.", "ok"],
    ["Publicación", "El generador arma la página, la imagen para redes, el sitemap y los datos para buscadores e IA, y avisa a Google, Bing e IndexNow.", "Automático"],
    ["Vigía de novedades", "Todos los días revisa fuentes oficiales de IA y de Meta y publica solo lo confirmado, con su fuente.", "Diario"],
    ["Parte de los lunes", "Search Console, Analytics y velocidad en un informe que dice qué mejorar esa semana.", "Semanal"]]}
};

function linea(cont, clave, compacta) {
  const L = LINEAS[clave];
  cont.innerHTML = `${compacta ? "" : `<p class="pf-intro">${L.intro}</p>`}
  <div class="pf-flujo-head"><b>${L.titulo}</b><button type="button" class="btn btn-sm btn-line pf-play">▶ Ver cómo funciona</button></div>
  <ol class="pf-flujo">${L.pasos.map(([t, d, e], i) => `<li class="${e === "ok" ? "es-ok" : ""}"><button type="button" data-i="${i}" aria-expanded="false"><span class="n">${i + 1}</span><span class="t">${t}</span><span class="e">${e === "ok" ? "✋ Apruebo yo" : e}</span></button></li>`).join("")}</ol>
  <p class="pf-detalle" aria-live="polite">Tocá un paso para ver qué hace.</p>`;
  const lis = [...cont.querySelectorAll(".pf-flujo li")], det = cont.querySelector(".pf-detalle");
  let timer;
  const mostrar = (i) => {
    lis.forEach((li, k) => { li.classList.toggle("activo", k === i); li.classList.toggle("hecho", k < i); li.firstElementChild.setAttribute("aria-expanded", k === i); });
    const [t, d, e] = L.pasos[i];
    det.innerHTML = `<b>${i + 1}. ${t}.</b> ${d}`;
    det.classList.toggle("es-ok", e === "ok");
  };
  cont.querySelector(".pf-flujo").addEventListener("click", (ev) => { const b = ev.target.closest("button"); if (!b) return; clearInterval(timer); mostrar(+b.dataset.i); });
  cont.querySelector(".pf-play").addEventListener("click", () => {
    clearInterval(timer); let i = 0; mostrar(0); push("portfolio_play", clave);
    timer = setInterval(() => { i++; if (i >= L.pasos.length) { clearInterval(timer); lis.forEach(li => li.classList.add("hecho")); return; } mostrar(i); }, 1600);
  });
}

document.querySelectorAll("[data-linea]").forEach(c => linea(c, c.dataset.linea, true));
const sis = $("#sistema");
linea(sis, "organico");
document.querySelectorAll(".pf-tabs button").forEach(b => b.addEventListener("click", () => {
  document.querySelectorAll(".pf-tabs button").forEach(x => x.setAttribute("aria-selected", x === b));
  linea(sis, b.dataset.s);
}));

// Demo de la planilla (todo inventado)
const FILAS = [
  ["Estudiante 1", "Ing. en Sistemas", "Ing. Industrial", ["Análisis Matemático I", "Álgebra y Geometría Analítica", "Física I"], true],
  ["Estudiante 2", "Ing. Civil", "Ing. Mecánica", ["Física I", "Química General"], true],
  ["Estudiante 3", "Ing. Química", "Ing. Industrial", ["Análisis Matemático I", "Química General", "Sistemas de Representación"], false],
  ["Estudiante 4", "Ing. Electrónica", "Ing. Eléctrica", ["Análisis Matemático I", "Física I", "Física II", "Álgebra y Geometría Analítica"], true],
  ["Estudiante 5", "Ing. Mecánica", "Ing. Naval", ["Sistemas de Representación", "Física I"], true]
];
const tabla = $("#tabla-utn");
tabla.innerHTML = `<div class="fila cab" role="row"><span role="columnheader"></span><span role="columnheader">Estudiante</span><span role="columnheader">Carrera de origen → nueva</span><span role="columnheader">Materias</span><span role="columnheader">Estado</span></div>` +
  FILAS.map(([n, o, d, m, listo], i) => `<label class="fila${listo ? "" : " espera"}" role="row"><span role="cell"><input type="checkbox" data-i="${i}" ${listo ? "checked" : "disabled"} aria-label="Incluir ${n}"></span><span role="cell"><b>${n}</b></span><span role="cell">${o} → ${d}</span><span role="cell">${m.length} a evaluar</span><span role="cell"><em>${listo ? "Informe listo" : "Esperando al departamento"}</em></span></label>`).join("");

const RES = ["Reconocida por equivalencia", "Reconocida por equivalencia", "Equivalencia parcial", "Reconocida por equivalencia", "A cursar"];
$("#generar").addEventListener("click", async () => {
  const sel = [...tabla.querySelectorAll("input:checked")].map(x => FILAS[+x.dataset.i]);
  const proc = $("#proceso"), resol = $("#resol"), boton = $("#generar");
  if (!sel.length) { proc.hidden = false; proc.innerHTML = "<p>Marcá al menos un trámite con el informe listo.</p>"; resol.hidden = true; return; }
  push("demo_utn", `${sel.length} trámites`);
  boton.disabled = true; resol.hidden = true; proc.hidden = false; proc.innerHTML = "";
  const pasos = [`Leyendo ${sel.length} trámite${sel.length > 1 ? "s" : ""} marcado${sel.length > 1 ? "s" : ""}…`, "Tomando los informes de equivalencias…", "Armando el anexo con cada estudiante…", "Resolución lista ✓"];
  for (const p of pasos) { proc.insertAdjacentHTML("beforeend", `<p>${p}</p>`); await new Promise(r => setTimeout(r, 650)); }
  let k = 0;
  resol.innerHTML = `<p class="sello">Borrador de ejemplo · generado por la planilla</p>
  <h3>Resolución colectiva de simultaneidad de carreras</h3>
  <p><b>Visto</b> los pedidos de simultaneidad presentados y los informes de equivalencias de los departamentos docentes,</p>
  <p><b>Artículo 1.</b> Otorgar la simultaneidad de carreras a los ${sel.length} estudiante${sel.length > 1 ? "s" : ""} que figuran en el Anexo.</p>
  <p><b>Artículo 2.</b> Reconocer las materias según el detalle del Anexo.</p>
  <h4>Anexo</h4>
  ${sel.map(([n, o, d, m]) => `<div class="anexo"><b>${n}</b> · ${o} → ${d}<ul>${m.map(x => `<li>${x}: <span>${RES[k++ % RES.length]}</span></li>`).join("")}</ul></div>`).join("")}
  <p class="sello">Antes este documento se armaba a mano. Ahora sale con un clic y queda solo la revisión final.</p>`;
  resol.hidden = false; boton.disabled = false;
  resol.scrollIntoView({ behavior: "smooth", block: "nearest" });
});
})();
