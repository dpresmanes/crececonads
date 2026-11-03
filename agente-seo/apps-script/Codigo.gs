/**
 * Agente SEO y GEO de CreceConAds, dentro de la planilla "Agente SEO · CreceConAds".
 *
 * Cada lunes:
 *  - Búsquedas y Páginas: qué búsquedas de Google muestran crececonads.site (Search Console, últimos 28 días).
 *  - Bing: lo mismo en Bing (Bing Webmaster Tools), que es de donde busca ChatGPT.
 *  - Visibilidad IA: hace a Gemini las preguntas de la pestaña "Preguntas" y anota si te nombra.
 *  - Ideas: propone 5 guías nuevas para la web, sin repetir las que ya están en la pestaña.
 *  - Historial: una fila por semana para ver la evolución.
 *  - Palabras clave (primer lunes de cada mes, o desde el menú): qué busca la gente en Argentina
 *    alrededor de las semillas de la pestaña "Semillas", con autocompletar de Google y volumen de Bing.
 *
 * Primera vez: menú "Agente SEO" > "Configurar clave de Gemini", después "Programar cada lunes".
 * Bing (opcional): "Configurar clave de Bing" con la clave de Bing Webmaster > Configuración > Acceso a la API.
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
    .addItem('Configurar clave de Bing', 'configurarClaveBing')
    .addItem('Investigar palabras clave', 'investigarPalabras')
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

function configurarClaveBing() {
  const ui = SpreadsheetApp.getUi();
  const r = ui.prompt('Clave de Bing', 'Pegá la clave de Bing Webmaster > Configuración > Acceso a la API (se guarda en el script, no en la planilla):', ui.ButtonSet.OK_CANCEL);
  if (r.getSelectedButton() !== ui.Button.OK || !r.getResponseText().trim()) return;
  PropertiesService.getScriptProperties().setProperty('BING_API_KEY', r.getResponseText().trim());
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
  [busquedas, bing, visibilidadIA, ideas].forEach(tarea => {
    try {
      tarea(estado);
    } catch (e) {
      console.error(tarea.name + ' falló: ' + e);
    }
  });
  // Una vez por mes alcanza: el volumen de búsquedas no cambia de una semana a otra.
  if (Number(Utilities.formatDate(new Date(), 'America/Argentina/Buenos_Aires', 'd')) <= 7) {
    try { investigarPalabras(); } catch (e) { console.error('investigarPalabras falló: ' + e); }
  }
  const historial = hoja('Historial');
  if (!historial.getRange('G1').getValue()) historial.getRange('G1:H1').setValues([['Clics Bing (28 días)', 'Impresiones Bing (28 días)']]);
  historial.appendRow([hoy(), ...(estado.resumen || ['', '', '']), ...(estado.ia || ['', '']), ...(estado.bing || ['', ''])]);
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

// ---------- Bing Webmaster Tools ----------

function bing(estado) {
  const clave = PropertiesService.getScriptProperties().getProperty('BING_API_KEY');
  if (!clave) return; // opcional: sin clave no se mide Bing
  const res = UrlFetchApp.fetch('https://ssl.bing.com/webmaster/api.svc/json/GetQueryStats?siteUrl=' + encodeURIComponent(SITIO) +
    '&apikey=' + encodeURIComponent(clave), { muteHttpExceptions: true });
  if (res.getResponseCode() !== 200) throw new Error('Bing respondió ' + res.getResponseCode() + ': ' + res.getContentText().slice(0, 150));
  // Bing devuelve una fila por búsqueda y por semana; se suman las de los últimos 28 días.
  const desde = Date.now() - 28 * 864e5;
  const porBusqueda = {};
  (JSON.parse(res.getContentText()).d || []).forEach(r => {
    const ms = Number((String(r.Date).match(/\d+/) || [0])[0]);
    if (ms < desde) return;
    const b = porBusqueda[r.Query] || (porBusqueda[r.Query] = { clics: 0, impresiones: 0, posicion: 0 });
    b.clics += r.Clicks;
    b.impresiones += r.Impressions;
    b.posicion = r.AvgImpressionPosition; // la más reciente alcanza para ver dónde está
  });
  const filas = Object.keys(porBusqueda).map(q => [q, porBusqueda[q].clics, porBusqueda[q].impresiones, redondear(porBusqueda[q].posicion)])
    .sort((a, b) => b[2] - a[2]);
  if (!hoja('Bing')) SpreadsheetApp.getActive().insertSheet('Bing');
  escribir('Bing', [['Búsqueda', 'Clics', 'Impresiones', 'Posición']].concat(filas));
  estado.bing = [filas.reduce((s, f) => s + f[1], 0), filas.reduce((s, f) => s + f[2], 0)];
  estado.busquedasBing = filas.slice(0, 40).map(f => [f[0], f[2], f[3]]);
}

// ---------- Palabras clave ----------

const SEMILLAS = ['meta ads tienda online', 'facebook ads ecommerce', 'publicidad en instagram', 'agencia meta ads',
  'agente ia whatsapp', 'chatbot whatsapp', 'automatizar procesos', 'tiendanube publicidad'];
const PREFIJOS = ['como', 'que es', 'cuanto cuesta', 'mejor', 'para'];

// Junta lo que la gente busca alrededor de cada semilla y cuánto se busca:
//  - Google autocompletar (Argentina): las búsquedas reales más comunes, sin volumen.
//  - Bing (Argentina, últimos 3 meses): palabras relacionadas con impresiones. Bing es mucho más chico que
//    Google, así que el número sirve para comparar entre palabras, no como volumen absoluto.
function investigarPalabras() {
  let semillasHoja = hoja('Semillas');
  if (!semillasHoja) {
    semillasHoja = SpreadsheetApp.getActive().insertSheet('Semillas');
    semillasHoja.getRange(1, 1, SEMILLAS.length + 1, 1).setValues([['Semilla']].concat(SEMILLAS.map(s => [s])));
  }
  const semillas = semillasHoja.getRange('A2:A').getValues().map(f => String(f[0]).trim()).filter(Boolean);
  const clave = PropertiesService.getScriptProperties().getProperty('BING_API_KEY');
  const palabras = {}; // palabra -> { semilla, fuente, bing }

  semillas.forEach(semilla => {
    const consultas = [semilla].concat(PREFIJOS.map(p => p + ' ' + semilla), 'abcdefghilmnoprstv'.split('').map(l => semilla + ' ' + l));
    consultas.forEach(q => autocompletar(q).forEach(p => {
      if (!palabras[p]) palabras[p] = { semilla: semilla, fuente: 'Google', bing: '' };
    }));
    if (clave) {
      bingRelacionadas(clave, semilla).forEach(r => {
        const p = String(r.Query).toLowerCase();
        palabras[p] = { semilla: semilla, fuente: palabras[p] ? 'Google y Bing' : 'Bing', bing: r.Impressions };
      });
    }
  });

  let descartadas = 0;
  const filas = [];
  Object.keys(palabras).forEach(p => {
    const tipo = intencion(p, palabras[p].semilla, palabras[p].fuente);
    if (!tipo) { descartadas++; return; }
    filas.push([p, tipo, palabras[p].semilla, palabras[p].fuente, palabras[p].bing]);
  });
  const orden = { 'Comercial': 0, 'Cómo hacer': 1, 'Informativa': 2 };
  filas.sort((a, b) => (Number(b[4]) || 0) - (Number(a[4]) || 0) || orden[a[1]] - orden[b[1]] || a[2].localeCompare(b[2]));
  if (!hoja('Palabras clave')) SpreadsheetApp.getActive().insertSheet('Palabras clave');
  escribir('Palabras clave', [['Palabra clave', 'Intención', 'Semilla', 'Fuente', 'Impresiones Bing AR (3 meses)']].concat(filas));
  hoja('Palabras clave').getRange('G1:G2').setValues([['Actualizado: ' + hoy()], ['Descartadas por ruido: ' + descartadas]]);
}

// Filtro de ruido: deja solo búsquedas en español de gente que podría ser cliente o lector de una guía.
// Saca lo de navegación ("whatsapp web", "tienda nube ingresar"), otros idiomas, otros países, marcas
// ajenas y lo que Bing relaciona pero no tiene que ver (con "automatizar procesos" trae "pjn").
// Devuelve la intención o null si se descarta.
const NAVEGACION = /\b(web|login|iniciar sesi[oó]n|ingresar|entrar|descargar|download|apk|app|abrir|logo|icon|png|github|figma|html|beta|instalar|messenger|reddit|open source|template|library|biblioteca|manager|\.com)\b/;
const OTRO_IDIOMA = /\b(n[aã]o|ativar|desativar|atendimento|vendas|seu|fazer|grátis|é gratuito|advogado|financeiro|quando|libera|brasil|teste|simples|come|togliere|disattivare|su whatsapp|how|for|with|case|study|course|strategy|agency|examples|best|run|build|create|hindi|vs|reminder|help|options|number|free|integration|to)\b/;
const OTRO_LUGAR = /\b(madrid|barcelona|tenerife|ciudad real|monterrey|colombia|m[eé]xico|chile|per[uú]|guatemala|costa rica|indonesia|ecuador|espa[nñ]a|iess|bancolombia|semovi|renaper|registradur[ií]a|oxxo|telmex|volaris|visa|movistar|claro|coca cola|doritos|frito lay|margarita|detodito|nueva eps|edesur|muthoot|luzia|leifer|sap|qgis|photoshop|android|windows)\b/;
const VACIAS = ['de', 'en', 'para', 'con', 'el', 'la', 'los', 'las', 'un', 'una', 'y', 'online'];

function intencion(p, semilla, fuente) {
  if (p.split(/\s+/).length < 2) return null;
  if (NAVEGACION.test(p) || OTRO_IDIOMA.test(p) || OTRO_LUGAR.test(p) || /( é |ç|ã|õ)/.test(p)) return null;
  const nucleo = semilla.split(/\s+/).filter(w => VACIAS.indexOf(w) < 0);
  const comunes = nucleo.filter(w => p.indexOf(w) >= 0).length;
  // Bing sugiere cosas lejanas: tiene que compartir al menos dos palabras del núcleo de la semilla.
  if (fuente === 'Bing' && comunes < Math.min(2, nucleo.length)) return null;
  if (comunes === 0) return null;
  if (/\b(precio|cuesta|costo|valor|agencia|contratar|mejor|servicio|empresas?|econ[oó]mico|presupuesto|cotizar)\b/.test(p)) return 'Comercial';
  if (/\b(c[oó]mo|crear|configurar|activar|desactivar|hacer|armar|usar|poner)\b/.test(p)) return 'Cómo hacer';
  return 'Informativa';
}

function autocompletar(q) {
  const res = UrlFetchApp.fetch('https://suggestqueries.google.com/complete/search?client=firefox&hl=es&gl=ar&q=' + encodeURIComponent(q),
    { muteHttpExceptions: true });
  if (res.getResponseCode() !== 200) return [];
  try {
    return (JSON.parse(res.getContentText())[1] || []).map(s => String(s).toLowerCase());
  } catch (e) {
    return [];
  }
}

function bingRelacionadas(clave, q) {
  const fin = new Date(Date.now() - 864e5);
  const ini = new Date(fin.getTime() - 90 * 864e5);
  const url = 'https://ssl.bing.com/webmaster/api.svc/json/GetRelatedKeywords?q=' + encodeURIComponent(q) +
    '&country=ar&language=es-AR&startDate=' + fecha(ini) + '&endDate=' + fecha(fin) + '&apikey=' + encodeURIComponent(clave);
  const res = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
  if (res.getResponseCode() !== 200) {
    console.error('Bing palabras "' + q + '": ' + res.getResponseCode() + ' ' + res.getContentText().slice(0, 150));
    return [];
  }
  const d = JSON.parse(res.getContentText()).d;
  return Array.isArray(d) ? d : [];
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
    'Búsquedas reales en Bing (consulta, impresiones, posición): ' + JSON.stringify(estado.busquedasBing || []) + '\n' +
    'Preguntas a asistentes de IA donde CreceConAds NO aparece: ' + JSON.stringify(estado.sinMencion || []) + '\n' +
    'Guías que ya existen o ya se propusieron (no repitas ninguna ni propongas el mismo tema con otras palabras): ' + JSON.stringify(yaPropuestas()) + '\n' +
    'Proponé 5 guías nuevas para publicar en crececonads.site/guias que respondan una pregunta concreta de un dueño de tienda online. ' +
    'Devolvé JSON: lista de objetos con "titulo", "pregunta_que_responde", "por_que" (una línea, citando el dato que lo justifica).';
  const temas = JSON.parse(gemini(clave, prompt, false, true).texto);
  const filas = temas.map(t => [hoy(), t.titulo || '', t.pregunta_que_responde || '', t.por_que || '', 'Pendiente']);
  if (filas.length) hoja('Ideas').getRange(hoja('Ideas').getLastRow() + 1, 1, filas.length, 5).setValues(filas);
}

// Títulos de la pestaña Ideas (publicadas, pendientes y descartadas), para no proponerlos otra vez.
function yaPropuestas() {
  return hoja('Ideas').getRange('B2:B').getValues().map(f => String(f[0]).trim()).filter(Boolean);
}

function gemini(clave, prompt, buscar, json) {
  const props = PropertiesService.getScriptProperties();
  const guardado = props.getProperty('GEMINI_COMBO'); // ej. "gemini-2.5-flash|buscar"
  const combos = [];
  // Lo guardado va primero solo si incluye búsqueda: así cada semana se vuelve a intentar buscar en internet.
  if (guardado && guardado.endsWith('|buscar')) combos.push(guardado.split('|'));
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
