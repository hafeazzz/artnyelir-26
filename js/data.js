/* ============================================================
   ARTNYELIR '26 — data & konstanta
   ============================================================ */

/* GANTI nomor WhatsApp panitia (format internasional tanpa "+") */
var WA_PANITIA = "6281286047298";

/* ---------- penyimpanan pendaftaran ----------
   Satu record = satu keluarga (orang tua + daftar anak + satu panitia).
   Dikirim ke Firebase Realtime Database, path /pendaftaran.
   Konfigurasi Firebase ada di <head> index.html. */
var FIREBASE_PATH = "pendaftaran";

/* ---------- counter publik ----------
   /pendaftaran hanya bisa dibaca setelah login (isinya data pribadi),
   jadi papan di halaman publik tidak boleh membacanya. Jumlah anak
   disimpan terpisah di sini: angka telanjang, aman dibaca siapa pun. */
var STATISTIK_PATH = "statistik/jumlah";

/* ---------- pilihan divisi panitia (multi-select) ----------
   Nilai yang tersimpan ke Firebase persis string di array ini. */
var DIVISI_PANITIA = ["Konsumsi", "Dokumentasi", "Crew Lomba", "Bebas Aja"];

/* usia minimal perwakilan panitia dari tiap rumah */
var USIA_PANITIA_MIN = 13;

/* kunci localStorage untuk cadangan progres pengisian */
var DRAFT_KEY = "artnyelir26-draft";

/* ---------- data pendaftar (di memori selama halaman terbuka) ----------
   Satu keluarga: satu orang tua, beberapa anak, satu panitia. */
var pendaftar = {
  orangTua: { nama: "", alamat: "" },
  anak: [],   /* { nama, jenisKelamin, usia } */
  panitia: { nama: "", usia: "", noHp: "", divisi: [] }
};
