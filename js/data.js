/* ============================================================
   ARTNYELIR '26 — data & konstanta
   ============================================================ */

/* GANTI nomor WhatsApp panitia (format internasional tanpa "+") */
var WA_PANITIA = "6281286047298";

/* ---------- penyimpanan pendaftaran ----------
   Data pendaftar dikirim ke Firebase Realtime Database, path /pendaftaran.
   Konfigurasi Firebase ada di <head> index.html. */
var FIREBASE_PATH = "pendaftaran";

/* ---------- counter publik ----------
   /pendaftaran hanya bisa dibaca setelah login (isinya nama anak & nomor
   telepon), jadi papan di halaman publik tidak boleh membacanya. Sebagai
   gantinya jumlahnya disimpan terpisah di sini: angka telanjang, tanpa
   data pribadi, aman dibaca siapa pun. */
var STATISTIK_PATH = "statistik/jumlah";

/* ---------- kategori usia + lomba yang sudah ditentukan ---------- */
/* Tiap kategori otomatis dapat 1 lomba — peserta tidak memilih lomba. */
var KATEGORI = {
  "1-3":   { label: "1–3 Tahun (Balita)",      lomba: "Lomba Jalan Estafet Balita" },
  "4-6":   { label: "4–6 Tahun (TK/SD Awal)",  lomba: "Lomba Lari Cepat" },
  "7-9":   { label: "7–9 Tahun (SD)",          lomba: "Lomba Tarik Tambang" },
  "10-12": { label: "10–12 Tahun (Pra-remaja)", lomba: "Lomba Balap Karung" }
};

/* ---------- pilihan divisi ---------- */
var DIVISI = {
  "konsumsi":    "🍽️ Konsumsi (Makanan & Minuman)",
  "dokumentasi": "📸 Dokumentasi (Foto & Video)",
  "lomba":       "🏆 Lomba (Dewasa & Anak-anak)"
};

/* ---------- data pendaftar (disimpan di memori selama halaman terbuka) ----------
   Satu panitia/keluarga bisa mendaftarkan beberapa anak. */
var pendaftar = {
  panitia: { nama: "", telpon: "" },
  anak: []   /* { nama, kategori, divisi, lomba, noOrangTua } */
};
