/**
 * ============================================================
 *  AutomatIA — CRM de Leads en Google Sheets
 * ============================================================
 *  Qué hace:
 *   1. setup()  -> crea en "Mi unidad" la carpeta "AutomatIA_CRM"
 *                  y dentro la planilla "CRM_Leads_AutomatIA".
 *   2. doPost() -> recibe los formularios de la web, agrega una fila
 *                  al CRM y envía una alerta por email con el asunto
 *                  "New_Leads_AutomatIA".
 *
 *  Instrucciones completas en INSTRUCCIONES.md (misma carpeta).
 * ============================================================
 */

const CONFIG = {
  FOLDER_NAME: 'AutomatIA_CRM',
  SPREADSHEET_NAME: 'CRM_Leads_AutomatIA',
  SHEET_NAME: 'Leads',
  ALERT_EMAIL: 'consultora.automatia@gmail.com',
  ALERT_SUBJECT: 'New_Leads_AutomatIA',
  TIMEZONE: 'America/Santiago',
};

const HEADERS = [
  'Fecha',
  'Nombre',
  'Email',
  'Origen',
  'Página',
  'Estado',
  'Responsable',
  'Próxima acción',
  'Fecha próxima acción',
  'Notas',
];

const ESTADOS = ['Nuevo', 'Contactado', 'Diagnóstico agendado', 'Propuesta enviada', 'Ganado', 'Perdido'];

/* ------------------------------------------------------------
 * 1) SETUP — ejecutar UNA sola vez desde el editor
 * ------------------------------------------------------------ */
function setup() {
  const props = PropertiesService.getScriptProperties();

  // Si ya existe, no duplicar
  const existingId = props.getProperty('SPREADSHEET_ID');
  if (existingId) {
    try {
      const existing = SpreadsheetApp.openById(existingId);
      Logger.log('El CRM ya existe: ' + existing.getUrl());
      return existing.getUrl();
    } catch (e) {
      // la planilla fue borrada: se vuelve a crear
    }
  }

  // Carpeta en la raíz de "Mi unidad"
  const folders = DriveApp.getRootFolder().getFoldersByName(CONFIG.FOLDER_NAME);
  const folder = folders.hasNext() ? folders.next() : DriveApp.getRootFolder().createFolder(CONFIG.FOLDER_NAME);

  // Planilla
  const ss = SpreadsheetApp.create(CONFIG.SPREADSHEET_NAME);
  ss.setSpreadsheetTimeZone(CONFIG.TIMEZONE);
  DriveApp.getFileById(ss.getId()).moveTo(folder);

  // Hoja Leads
  const sheet = ss.getSheets()[0];
  sheet.setName(CONFIG.SHEET_NAME);
  sheet.getRange(1, 1, 1, HEADERS.length)
    .setValues([HEADERS])
    .setFontWeight('bold')
    .setFontColor('#FFFFFF')
    .setBackground('#0A1628');
  sheet.setFrozenRows(1);
  sheet.setColumnWidths(1, HEADERS.length, 160);
  sheet.setColumnWidth(10, 320);
  sheet.getRange('A:A').setNumberFormat('dd/MM/yyyy HH:mm');
  sheet.getRange('I:I').setNumberFormat('dd/MM/yyyy');

  // Lista desplegable de Estado
  const estadoRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(ESTADOS, true)
    .setAllowInvalid(false)
    .build();
  sheet.getRange(2, 6, sheet.getMaxRows() - 1, 1).setDataValidation(estadoRule);

  // Colores por estado
  const estadoRange = sheet.getRange(2, 6, sheet.getMaxRows() - 1, 1);
  const color = (texto, bg) => SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo(texto).setBackground(bg).setRanges([estadoRange]).build();
  sheet.setConditionalFormatRules([
    color('Nuevo', '#FFF3D6'),
    color('Contactado', '#D9F2EF'),
    color('Diagnóstico agendado', '#CDEBFF'),
    color('Propuesta enviada', '#E6DDFF'),
    color('Ganado', '#C8F0C8'),
    color('Perdido', '#F4CCCC'),
  ]);
  sheet.getRange(1, 1, 1, HEADERS.length).createFilter();

  // Hoja Resumen
  const resumen = ss.insertSheet('Resumen');
  resumen.getRange('A1:B1').setValues([['Estado', 'Cantidad']])
    .setFontWeight('bold').setFontColor('#FFFFFF').setBackground('#0A1628');
  ESTADOS.forEach((estado, i) => {
    resumen.getRange(i + 2, 1).setValue(estado);
    resumen.getRange(i + 2, 2).setFormula(`=COUNTIF(Leads!F:F,"${estado}")`);
  });
  const totalRow = ESTADOS.length + 2;
  resumen.getRange(totalRow, 1).setValue('Total leads').setFontWeight('bold');
  resumen.getRange(totalRow, 2).setFormula('=COUNTA(Leads!C2:C)').setFontWeight('bold');
  resumen.setColumnWidth(1, 200);

  props.setProperty('SPREADSHEET_ID', ss.getId());
  Logger.log('CRM creado en la carpeta "' + CONFIG.FOLDER_NAME + '": ' + ss.getUrl());
  return ss.getUrl();
}

/* ------------------------------------------------------------
 * 2) RECEPCIÓN DE LEADS DESDE LA WEB
 * ------------------------------------------------------------ */
function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
    const p = (e && e.parameter) || {};

    // Anti-spam: campo trampa invisible que solo llenan los bots
    if (p.website) return json_({ ok: true });

    const nombre = clean_(p.nombre, 120);
    const email = clean_(p.email, 160);
    if (!nombre || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return json_({ ok: false, error: 'Datos inválidos' });
    }
    const origen = clean_(p.origen, 120) || 'Web';
    const pagina = clean_(p.pagina, 300);
    const fecha = new Date();

    const sheet = getSheet_();
    sheet.appendRow([fecha, nombre, email, origen, pagina, 'Nuevo', '', 'Contactar lead', '', '']);

    sendAlert_({ fecha, nombre, email, origen, pagina, url: sheet.getParent().getUrl() });

    return json_({ ok: true });
  } catch (err) {
    console.error(err);
    return json_({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

// Permite comprobar en el navegador que el despliegue está activo
function doGet() {
  return json_({ ok: true, servicio: 'AutomatIA CRM', estado: 'activo' });
}

/* ------------------------------------------------------------
 * Utilidades
 * ------------------------------------------------------------ */
function getSheet_() {
  let id = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');
  if (!id) {
    setup();
    id = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');
  }
  return SpreadsheetApp.openById(id).getSheetByName(CONFIG.SHEET_NAME);
}

function sendAlert_(lead) {
  const fechaTxt = Utilities.formatDate(lead.fecha, CONFIG.TIMEZONE, 'dd/MM/yyyy HH:mm');
  const esc = (s) => String(s || '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  const html =
    '<div style="font-family:Arial,sans-serif;max-width:520px">' +
    '<h2 style="color:#0A1628;margin:0 0 12px">Nuevo lead en AutomatIA</h2>' +
    '<table style="border-collapse:collapse;width:100%">' +
    row_('Fecha', esc(fechaTxt)) +
    row_('Nombre', esc(lead.nombre)) +
    row_('Email', '<a href="mailto:' + esc(lead.email) + '">' + esc(lead.email) + '</a>') +
    row_('Origen', esc(lead.origen)) +
    row_('Página', esc(lead.pagina)) +
    '</table>' +
    '<p style="margin-top:16px"><a href="' + lead.url + '" style="background:#00B8A9;color:#0A1628;padding:10px 16px;text-decoration:none;font-weight:bold;border-radius:4px">Abrir CRM</a></p>' +
    '</div>';

  MailApp.sendEmail({
    to: CONFIG.ALERT_EMAIL,
    subject: CONFIG.ALERT_SUBJECT,
    replyTo: lead.email,
    htmlBody: html,
    body: 'Nuevo lead: ' + lead.nombre + ' <' + lead.email + '> | Origen: ' + lead.origen + ' | ' + fechaTxt + '\nCRM: ' + lead.url,
  });
}

function row_(k, v) {
  return '<tr><td style="padding:6px 8px;border-bottom:1px solid #eee;color:#666;width:90px">' + k +
    '</td><td style="padding:6px 8px;border-bottom:1px solid #eee"><b>' + v + '</b></td></tr>';
}

function clean_(v, max) {
  // Evita inyección de fórmulas en Sheets (=, +, -, @)
  let s = String(v || '').trim().slice(0, max);
  if (/^[=+\-@]/.test(s)) s = "'" + s;
  return s;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

/* Prueba manual desde el editor: simula un lead */
function testLead() {
  const res = doPost({ parameter: { nombre: 'Lead de Prueba', email: 'prueba@ejemplo.com', origen: 'Test manual', pagina: 'editor' } });
  Logger.log(res.getContent());
}
