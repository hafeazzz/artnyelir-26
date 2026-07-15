# ARTNYELIR '26 — Website Pendaftaran Lomba 17an

Website statis (HTML + CSS + JS terpisah) untuk pendaftaran lomba 17 Agustus komplek.
Anak usia 1–12 tahun, tiap kategori usia sudah punya lomba khusus, satu keluarga bisa
mendaftarkan beberapa anak sekaligus.

## Struktur

```
artnyelir/
├── index.html          # struktur halaman & form
├── css/
│   └── style.css       # seluruh styling
├── js/
│   ├── data.js         # kategori usia, lomba, divisi, konstanta
│   ├── ui.js           # render papan pendaftar & ringkasan
│   ├── form.js         # validasi & alur pendaftaran multi-anak
│   └── main.js         # animasi hero/galeri, countdown, init
├── apps-script/
│   └── Code.gs         # backend Google Sheets (Apps Script)
├── SETUP-SHEETS.md     # panduan menyambungkan Google Sheets
├── package.json
├── vercel.json
├── .gitignore
└── artnyelir.html      # file lama (single-file) — backup, boleh dihapus
```

## Yang perlu diganti sebelum dipakai

- Nomor WhatsApp panitia: `WA_PANITIA` di **`js/data.js`** dan link di footer `index.html`.
- Nama & lomba tiap kategori usia: objek `KATEGORI` di **`js/data.js`**.
- Foto galeri: ganti `<span class="ph-emoji">` dengan `<img src="...">` (lihat komentar di `index.html`).

## Simpan pendaftaran ke Google Sheets (opsional tapi disarankan)

Setiap anak yang didaftarkan otomatis masuk ke Google Sheet — panitia bisa memantau
langsung dari spreadsheet. Ikuti **`SETUP-SHEETS.md`**, lalu tempel URL Web App ke
`SHEET_ENDPOINT` di `js/data.js`. Kalau dibiarkan kosong, penyimpanan mati dan
konfirmasi cukup lewat WhatsApp.

## Jalankan lokal

```bash
npm start        # http-server di http://localhost:3000
```

Atau buka `index.html` langsung lewat Live Server / browser.

## Deploy ke Vercel

```bash
npm i -g vercel
vercel           # preview
vercel --prod    # production
```

Tidak butuh build step — Vercel menyajikan file statis apa adanya.

> Catatan: tanpa `SHEET_ENDPOINT`, data pendaftar hanya ada di memori browser selama
> halaman terbuka. Dengan integrasi Google Sheets (lihat `SETUP-SHEETS.md`), setiap
> pendaftaran tersimpan permanen di spreadsheet. Konfirmasi final tetap dikirim via
> link WhatsApp ke panitia sebagai cadangan.
