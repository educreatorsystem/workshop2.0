const CONFIG = {
  SHEET_ID: '1g-OdeiBrOMJpe6gIPqfUazQBc6dB8z7Y9d61ACj_GTc',
  DRIVE_FOLDER_ID: '1KNFQmve3ZTFCC172X41VvtzUm1TB5Wbe',
  SHEET_NAME: 'Pembelian',
  TELEGRAM_URL: 'https://t.me/+H_aPfKt9ulIzYzM1',
  WORKSHOP_NAME: 'EduCreator System Workshop 2.0',
  WORKSHOP_DATE: '27 Jun 2026 (Sabtu)',
  WORKSHOP_TIME: '2.30 PM - 5.30 PM',
  DEFAULT_ADMIN_PASSWORD: 'heryani95'
};

const HEADERS = [
  'Timestamp',
  'Nama',
  'Email',
  'Sekolah',
  'Telefon',
  'Receipt File ID',
  'Receipt URL',
  'Status',
  'Confirmed At',
  'Email Sent At'
];

function doPost(e) {
  try {
    const params = e.parameter || {};
    if (params.action !== 'submit') {
      return jsonOutput({ ok: false, message: 'Action tidak sah.' });
    }

    const required = ['nama', 'email', 'sekolah', 'telefon', 'receiptData', 'receiptName'];
    required.forEach(function (field) {
      if (!params[field]) throw new Error('Maklumat tidak lengkap: ' + field);
    });

    const sheet = getSheet();
    const file = saveReceipt(params);
    sheet.appendRow([
      new Date(),
      params.nama,
      params.email,
      params.sekolah,
      params.telefon,
      file.getId(),
      file.getUrl(),
      'Menunggu semakan',
      '',
      ''
    ]);

    return jsonOutput({
      ok: true,
      message: 'Maklumat pembelian berjaya disimpan.'
    });
  } catch (error) {
    return jsonOutput({
      ok: false,
      message: error.message || 'Ralat server.'
    });
  }
}

function doGet(e) {
  const params = e.parameter || {};
  const callback = params.callback;

  try {
    if (params.action === 'records') {
      assertAdmin(params.password);
      return jsonpOutput({
        ok: true,
        records: getRecords()
      }, callback);
    }

    if (params.action === 'confirm') {
      assertAdmin(params.password);
      const row = Number(params.row);
      if (!row || row < 2) throw new Error('Nombor rekod tidak sah.');
      confirmRegistration(row);
      return jsonpOutput({
        ok: true,
        message: 'Tempahan disahkan dan emel telah dihantar.'
      }, callback);
    }

    return jsonpOutput({
      ok: true,
      message: 'EduCreator Workshop Apps Script aktif.'
    }, callback);
  } catch (error) {
    return jsonpOutput({
      ok: false,
      message: error.message || 'Ralat server.'
    }, callback);
  }
}

function getSheet() {
  const spreadsheet = SpreadsheetApp.openById(CONFIG.SHEET_ID);
  let sheet = spreadsheet.getSheetByName(CONFIG.SHEET_NAME);

  if (!sheet) {
    sheet = spreadsheet.insertSheet(CONFIG.SHEET_NAME);
  }

  const currentHeaders = sheet.getRange(1, 1, 1, HEADERS.length).getValues()[0];
  const needsHeader = currentHeaders.join('') === '' || currentHeaders[0] !== HEADERS[0];

  if (needsHeader) {
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
    sheet.setFrozenRows(1);
  }

  return sheet;
}

function saveReceipt(params) {
  const folder = DriveApp.getFolderById(CONFIG.DRIVE_FOLDER_ID);
  const bytes = Utilities.base64Decode(params.receiptData);
  const contentType = params.receiptType || 'application/octet-stream';
  const safeName = String(params.receiptName || 'resit').replace(/[^\w.\- ]+/g, '_');
  const filename = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyyMMdd-HHmmss') + '-' + safeName;
  const blob = Utilities.newBlob(bytes, contentType, filename);
  return folder.createFile(blob);
}

function getRecords() {
  const sheet = getSheet();
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return [];

  const values = sheet.getRange(2, 1, lastRow - 1, HEADERS.length).getValues();
  return values.map(function (row, index) {
    return {
      row: index + 2,
      timestamp: toIso(row[0]),
      nama: row[1],
      email: row[2],
      sekolah: row[3],
      telefon: row[4],
      receiptFileId: row[5],
      receiptUrl: row[6],
      status: row[7] || 'Menunggu semakan',
      confirmedAt: toIso(row[8]),
      emailSentAt: toIso(row[9])
    };
  }).reverse();
}

function confirmRegistration(rowNumber) {
  const sheet = getSheet();
  const row = sheet.getRange(rowNumber, 1, 1, HEADERS.length).getValues()[0];
  if (!row || !row[1]) throw new Error('Rekod tidak ditemui.');

  const status = row[7];
  if (status === 'Disahkan' && row[9]) {
    return;
  }

  const now = new Date();
  sheet.getRange(rowNumber, 8).setValue('Disahkan');
  sheet.getRange(rowNumber, 9).setValue(now);

  sendConfirmationEmail({
    nama: row[1],
    email: row[2],
    sekolah: row[3],
    telefon: row[4]
  });

  sheet.getRange(rowNumber, 10).setValue(new Date());
}

function sendConfirmationEmail(record) {
  const subject = 'Pengesahan Tempahan - ' + CONFIG.WORKSHOP_NAME;
  const htmlBody =
    '<div style="font-family:Arial,sans-serif;line-height:1.65;color:#162033">' +
    '<h2 style="color:#0b1f47;margin-bottom:8px">Tempahan cikgu telah disahkan</h2>' +
    '<p>Assalamualaikum/Salam sejahtera ' + escapeHtml(record.nama) + ',</p>' +
    '<p>Bayaran cikgu telah disahkan. Berikut ialah maklumat bengkel:</p>' +
    '<table style="border-collapse:collapse;width:100%;max-width:560px">' +
    rowHtml('Nama workshop', CONFIG.WORKSHOP_NAME) +
    rowHtml('Tarikh', CONFIG.WORKSHOP_DATE) +
    rowHtml('Masa', CONFIG.WORKSHOP_TIME) +
    rowHtml('Platform', 'Google Meet - link akan dimaklumkan dalam group Telegram') +
    rowHtml('Link Telegram', '<a href="' + CONFIG.TELEGRAM_URL + '">' + CONFIG.TELEGRAM_URL + '</a>') +
    '</table>' +
    '<p>Sila join group Telegram untuk maklumat lanjut, bahan kelas, rakaman dan support selepas bengkel.</p>' +
    '<p><a href="' + CONFIG.TELEGRAM_URL + '" style="display:inline-block;background:#1261d8;color:#fff;text-decoration:none;padding:12px 18px;border-radius:8px;font-weight:bold">Join Group Telegram</a></p>' +
    '<p>Terima kasih dan jumpa cikgu dalam kelas.</p>' +
    '</div>';

  MailApp.sendEmail({
    to: record.email,
    subject: subject,
    htmlBody: htmlBody,
    name: 'EduCreator Workshop'
  });
}

function rowHtml(label, value) {
  return '<tr>' +
    '<td style="border:1px solid #dce7f5;padding:10px;background:#f7fbff;font-weight:bold;width:36%">' + label + '</td>' +
    '<td style="border:1px solid #dce7f5;padding:10px">' + value + '</td>' +
    '</tr>';
}

function assertAdmin(password) {
  const savedPassword = PropertiesService.getScriptProperties().getProperty('ADMIN_PASSWORD') || CONFIG.DEFAULT_ADMIN_PASSWORD;
  if (!password || password !== savedPassword) {
    throw new Error('Kata laluan admin tidak sah.');
  }
}

function jsonOutput(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}

function jsonpOutput(payload, callback) {
  if (!callback) return jsonOutput(payload);
  const safeCallback = String(callback).replace(/[^\w.$]/g, '');
  return ContentService
    .createTextOutput(safeCallback + '(' + JSON.stringify(payload) + ');')
    .setMimeType(ContentService.MimeType.JAVASCRIPT);
}

function toIso(value) {
  if (!value) return '';
  if (Object.prototype.toString.call(value) === '[object Date]' && !isNaN(value.getTime())) {
    return value.toISOString();
  }
  return value;
}

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
