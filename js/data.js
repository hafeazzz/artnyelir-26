/* ============================================================
   ARTNYELIR '26 — data & konstanta
   ============================================================ */

/* GANTI nomor WhatsApp panitia (format internasional tanpa "+") */
var WA_PANITIA = "6281286047298";

/* ---------- endpoint Google Sheets (Apps Script Web App) ----------
   Kosongkan ("") untuk menonaktifkan penyimpanan ke Sheet.
   Cara mendapatkan URL: lihat SETUP-SHEETS.md — deploy apps-script/Code.gs
   sebagai Web App, lalu tempel URL yang berakhiran /exec di sini. */
var SHEET_ENDPOINT = "https://script.google.com/macros/s/AKfycbycfwK2QAiqbdYGoNVJcsc7u80htR21xrMjgDb5FEipGnPjAzrt565A5oH7D4lB8xn1/userweb/exec";

/* ---------- kategori usia + lomba yang sudah ditentukan ---------- */
/* Tiap kategori otomatis dapat 1 lomba — peserta tidak memilih lomba. */
var KATEGORI = {
  "1-4":   { label: "1–4 Tahun (Balita)",    lomba: "Lomba Jalan Estafet Balita" },
  "5-7":   { label: "5–7 Tahun (SD Awal)",   lomba: "Lomba Lari Cepat" },
  "8-9":   { label: "8–9 Tahun (SD Akhir)",  lomba: "Lomba Tarik Tambang" },
  "10-12": { label: "10–12 Tahun (Pra-remaja)", lomba: "Lomba Balap Karung" }
};

/* ---------- pilihan divisi ---------- */
var DIVISI = {
  "konsumsi":    "🍽️ Konsumsi (Makanan & Minuman)",
  "dokumentasi": "📸 Dokumentasi (Foto & Video)",
  "lomba" : "lomba (dewasa & anak anak)"
};

/* ---------- data pendaftar (disimpan di memori selama halaman terbuka) ----------
   Satu panitia/keluarga bisa mendaftarkan beberapa anak. */
var pendaftar = {
  panitia: { nama: "", telpon: "" },
  anak: []   /* { nama, kategori, divisi, lomba } */
};
