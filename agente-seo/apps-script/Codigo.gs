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
const MODELO = 'gemini-flash-latest';

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
  if (!clave) return;
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
  const body = { contents: [{ parts: [{ text: prompt }] }] };
  if (buscar) body.tools = [{ google_search: {} }];
  if (json) body.generationConfig = { responseMimeType: 'application/json' };
  const pedir = () => UrlFetchApp.fetch('https://generativelanguage.googleapis.com/v1beta/models/' + MODELO + ':generateContent?key=' + clave, {
    method: 'post', contentType: 'application/json', payload: JSON.stringify(body), muteHttpExceptions: true,
  });
  let res = pedir();
  if (res.getResponseCode() === 429) { // demasiadas consultas: espera y reintenta una vez
    Utilities.sleep(30000);
    res = pedir();
  }
  if (res.getResponseCode() !== 200) throw new Error('Gemini respondió ' + res.getResponseCode() + ': ' + res.getContentText().slice(0, 200));
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
