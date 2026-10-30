/**
 * Agente SEO y GEO de CreceConAds, dentro de la planilla "Agente SEO · CreceConAds".
 *
 * Cada lunes:
 *  - Búsquedas y Páginas: qué búsquedas de Google muestran crececonads.site (Search Console, últimos 28 días).
 *  - Visibilidad IA: hace a Gemini las preguntas de la pestaña "Preguntas" y anota si te nombra.
 *  - Ideas: propone 5 guías nuevas para la web.
 *  - Historial: una fila por semana para ver la evolución.
 *
 * Primera vez: menú "Agente SEO" > "Configurar clave de Gemini", después "Programar cada lunes".
 */

const SITIO = 'https://crececonads.site/';
const MARCA = /crece\s*con\s*ads|crececonads|presmanes/i;
// Se prueban en orden; el primero con cupo gratuito queda guardado para las próximas corridas.
const MODELOS = ['gemini-2.5-flash', 'gemini-flash-latest', 'gemini-2.5-flash-lite', 'gemini-flash-lite-latest', 'gemini-2.0-flash'];
let SIN_CUPO = false;

function onOpen() {
  SpreadsheetApp.getUi().createMenu('Agente SEO')
    .addItem('Correr ahora', 'correrAgente')
    .addItem('Configurar clave de Gemini', 'configurarClave')
    .addItem('Programar cada lunes', 'programar')
    .addToUi();
}

function configurarClave() {
  const ui = SpreadsheetApp.getUi();
  const r = ui.prompt('Clave de Gemini', 'Pegá tu clave de aistudio.google.com (se guarda en el script, no en la planilla):', ui.ButtonSet.OK_CANCEL);
  if (r.getSelectedButton() !== ui.Button.OK || !r.getResponseText().trim()) return;
  PropertiesService.getScriptProperties().setProperty('GEMINI_API_KEY', r.getResponseText().trim());
  ui.alert('Clave guardada.');
}

function programar() {
  ScriptApp.getProjectTriggers()
    .filter(t => t.getHandlerFunction() === 'correrAgente')
    .forEach(t => ScriptApp.deleteTrigger(t));
  ScriptApp.newTrigger('correrAgente').timeBased().onWeekDay(ScriptApp.WeekDay.MONDAY).atHour(9).create();
  SpreadsheetApp.getUi().alert('Listo: el agente va a correr todos los lunes a las 9.');
}

function correrAgente() {
  const estado = {};
  [busquedas, visibilidadIA, ideas].forEach(tarea => {
    try {
      tarea(estado);
    } catch (e) {
      console.error(tarea.name + ' falló: ' + e);
    }
  });
  hoja('Historial').appendRow([hoy(), ...(estado.resumen || ['', '', '']), ...(estado.ia || ['', ''])]);
}

// ---------- Search Console ----------

function busquedas(estado) {
  const fin = new Date(Date.now() - 3 * 864e5); // Search Console tarda ~2 días en tener datos
  const ini = new Date(fin.getTime() - 27 * 864e5);
  const consultas = gsc(ini, fin, 'query');
  const paginas = gsc(ini, fin, 'page');

  escribir('Búsquedas', [['Búsqueda', 'Clics', 'Impresiones', 'CTR %', 'Posición']].concat(
    consultas.map(r => [r.keys[0], r.clicks, r.impressions, redondear(r.ctr * 100), redondear(r.position)])));
  escribir('Páginas', [['Página', 'Clics', 'Impresiones', 'Posición']].concat(
    paginas.map(r => [r.keys[0], r.clicks, r.impressions, redondear(r.position)])));

  estado.busquedas = consultas.map(r => [r.keys[0], r.impressions, redondear(r.position)]);
  estado.resumen = [suma(consultas, 'clicks'), suma(consultas, 'impressions'), consultas.length];
}

function gsc(ini, fin, dimension) {
  const url = 'https://searchconsole.googleapis.com/webmasters/v3/sites/' + encodeURIComponent(SITIO) + '/searchAnalytics/query';
  const res = UrlFetchApp.fetch(url, {
    method: 'post',
    contentType: 'application/json',
    headers: { Authorization: 'Bearer ' + ScriptApp.getOAuthToken() },
    payload: JSON.stringify({ startDate: fecha(ini), endDate: fecha(fin), dimensions: [dimension], rowLimit: 250 }),
  });
  return JSON.parse(res.getContentText()).rows || [];
}

// ---------- Visibilidad en IA ----------

function visibilidadIA(estado) {
  const clave = PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY');
  if (!clave) throw new Error('falta la clave de Gemini (menú Agente SEO > Configurar clave de Gemini)');
  const preguntas = hoja('Preguntas').getRange('A2:A').getValues().map(f => String(f[0]).trim()).filter(Boolean);

  const filas = [];
  estado.sinMencion = [];
  preguntas.forEach((p, i) => {
    if (SIN_CUPO) return; // ningún modelo tiene cupo: no tiene sentido seguir preguntando
    if (i) Utilities.sleep(7000); // el plan gratuito limita las consultas por minuto
    let r;
    try {
      r = gemini(clave, p + '\nRespondé en español rioplatense. Si recomendás profesionales o empresas, nombralos.', true);
    } catch (e) {
      console.error('Pregunta "' + p + '": ' + e);
      return;
    }
    const nombra = MARCA.test(r.texto) || r.fuentes.some(f => MARCA.test(f));
    if (!nombra) estado.sinMencion.push(p);
    filas.push([hoy(), p, nombra ? 'SÍ' : 'no', r.fuentes.join(', ').slice(0, 500), r.texto.replace(/\s+/g, ' ').slice(0, 400)]);
  });
  if (filas.length) hoja('Visibilidad IA').getRange(hoja('Visibilidad IA').getLastRow() + 1, 1, filas.length, 5).setValues(filas);
  estado.ia = [filas.filter(f => f[2] === 'SÍ').length, filas.length];
}

function ideas(estado) {
  const clave = PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY');
  if (!clave || SIN_CUPO) return;
  const prompt = 'Sos estratega de SEO y GEO de CreceConAds (Damián Presmanes, Argentina): campañas de ventas en Meta Ads ' +
    'para tiendas online, agentes de IA para WhatsApp y automatización de procesos con IA.\n' +
    'Búsquedas reales en Google que ya muestran la web (consulta, impresiones, posición): ' + JSON.stringify((estado.busquedas || []).slice(0, 40)) + '\n' +
    'Preguntas a asistentes de IA donde CreceConAds NO aparece: ' + JSON.stringify(estado.sinMencion || []) + '\n' +
    'Proponé 5 guías nuevas para publicar en crececonads.site/guias que respondan una pregunta concreta de un dueño de tienda online. ' +
    'Devolvé JSON: lista de objetos con "titulo", "pregunta_que_responde", "por_que" (una línea, citando el dato que lo justifica).';
  const temas = JSON.parse(gemini(clave, prompt, false, true).texto);
  const filas = temas.map(t => [hoy(), t.titulo || '', t.pregunta_que_responde || '', t.por_que || '', 'Pendiente']);
  if (filas.length) hoja('Ideas').getRange(hoja('Ideas').getLastRow() + 1, 1, filas.length, 5).setValues(filas);
}

function gemini(clave, prompt, buscar, json) {
  const props = PropertiesService.getScriptProperties();
  const guardado = props.getProperty('GEMINI_COMBO'); // ej. "gemini-2.5-flash|buscar"
  const combos = [];
  if (guardado) combos.push(guardado.split('|'));
  // Primero con búsqueda en Google en todos los modelos; si ninguno tiene cupo, sin búsqueda.
  [true, false].forEach(b => MODELOS.forEach(m => combos.push([m, b ? 'buscar' : 'sin'])));

  let ultimo = '';
  for (const [modelo, modo] of combos) {
    if (!buscar && modo === 'buscar') continue; // sin búsqueda pedida, alcanza con probar cada modelo una vez
    const conBusqueda = modo === 'buscar';
    const body = { contents: [{ parts: [{ text: prompt }] }] };
    if (conBusqueda) body.tools = [{ google_search: {} }];
    if (json) body.generationConfig = { responseMimeType: 'application/json' };
    const pedir = () => UrlFetchApp.fetch('https://generativelanguage.googleapis.com/v1beta/models/' + modelo + ':generateContent?key=' + clave, {
      method: 'post', contentType: 'application/json', payload: JSON.stringify(body), muteHttpExceptions: true,
    });
    let res = pedir();
    // 429 por ritmo (muchas por minuto) o 503 (modelo saturado): espera y reintenta una vez.
    // 429 por cupo agotado: pasa directo al siguiente modelo.
    if (res.getResponseCode() === 503 || (res.getResponseCode() === 429 && !/quota/i.test(res.getContentText()))) {
      Utilities.sleep(res.getResponseCode() === 503 ? 10000 : 30000);
      res = pedir();
    }
    if (res.getResponseCode() === 200) {
      if (buscar) props.setProperty('GEMINI_COMBO', modelo + '|' + modo);
      return leerRespuesta(res);
    }
    ultimo = modelo + (conBusqueda ? ' con búsqueda' : '') + ' respondió ' + res.getResponseCode() + ': ' + res.getContentText().slice(0, 150);
    // Clave inválida o sin permiso: no tiene sentido probar otros modelos. Cupo, saturación (503) u otros: probar el siguiente.
    if (res.getResponseCode() === 401 || res.getResponseCode() === 403) break;
  }
  SIN_CUPO = true;
  throw new Error('Gemini sin cupo disponible. Último intento: ' + ultimo);
}

function leerRespuesta(res) {
  const cand = JSON.parse(res.getContentText()).candidates[0];
  const texto = ((cand.content || {}).parts || []).map(p => p.text || '').join('');
  const fuentes = ((cand.groundingMetadata || {}).groundingChunks || []).filter(c => c.web).map(c => c.web.title || c.web.uri);
  return { texto: texto, fuentes: fuentes };
}

// ---------- utilidades ----------

function hoja(nombre) {
  return SpreadsheetApp.getActive().getSheetByName(nombre);
}

function escribir(nombre, filas) {
  const h = hoja(nombre);
  h.clearContents();
  h.getRange(1, 1, filas.length, filas[0].length).setValues(filas);
}

function hoy() {
  return fecha(new Date());
}

function fecha(d) {
  return Utilities.formatDate(d, 'America/Argentina/Buenos_Aires', 'yyyy-MM-dd');
}

function suma(filas, campo) {
  return filas.reduce((s, r) => s + r[campo], 0);
}

function redondear(n) {
  return Math.round(n * 10) / 10;
}
