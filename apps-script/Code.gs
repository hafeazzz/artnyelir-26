/**
 * ARTNYELIR '26 — backend penyimpanan pendaftaran ke Google Sheets.
 *
 * Cara pakai (ringkas — detail di SETUP-SHEETS.md):
 *   1. Buka Google Sheet baru → Extensions → Apps Script.
 *   2. Hapus isi default, tempel seluruh file ini.
 *   3. Deploy → New deployment → Web app:
 *        - Execute as: Me
 *        - Who has access: Anyone
 *   4. Copy URL yang berakhiran /exec, tempel ke SHEET_ENDPOINT di js/data.js.
 *
 * Setiap anak yang didaftarkan dikirim sebagai satu baris.
 */

var NAMA_SHEET = 'Pendaftaran';
var HEADER = ['Waktu', 'Nama Panitia', 'No Telepon', 'Nama Anak', 'Kategori', 'Lomba', 'Divisi'];

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(30000); // hindari dua penulisan bertabrakan
  try {
    var sheet = ambilSheet();
    var data = JSON.parse(e.postData.contents);

    sheet.appendRow([
      new Date(),
      data.panitiaNama || '',
      "'" + (data.panitiaTelpon || ''), // awalan ' agar 0 di depan tidak hilang
      data.namaAnak || '',
      data.kategori || '',
      data.lomba || '',
      data.divisi || ''
    ]);

    return jsonOutput({ ok: true });
  } catch (err) {
    return jsonOutput({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

/** GET untuk cek cepat di browser bahwa Web App hidup. */
function doGet() {
  return jsonOutput({ ok: true, service: 'ARTNYELIR pendaftaran', time: new Date() });
}

function ambilSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(NAMA_SHEET);
  if (!sheet) {
    sheet = ss.insertSheet(NAMA_SHEET);
  }
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADER);
    sheet.getRange(1, 1, 1, HEADER.length).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function jsonOutput(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
