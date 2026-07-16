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
├── package.json
├── vercel.json
├── .gitignore
└── artnyelir.html      # file lama (single-file) — backup, boleh dihapus
```

## Yang perlu diganti sebelum dipakai

- **Config Firebase** di `<head>` **`index.html`** — lihat bagian di bawah. **Wajib**, form
  tidak bisa menyimpan tanpa ini.
- Nomor WhatsApp panitia: `WA_PANITIA` di **`js/data.js`** dan link di footer `index.html`.
- Nama & lomba tiap kategori usia: objek `KATEGORI` di **`js/data.js`**.
- Foto galeri: ganti `<span class="ph-emoji">` dengan `<img src="...">` (lihat komentar di `index.html`).

## Simpan pendaftaran ke Firebase Realtime Database

Setiap anak yang didaftarkan tersimpan sebagai satu record di path **`/pendaftaran`**.

1. Buat project di <https://console.firebase.google.com> → **Realtime Database** →
   **Create Database**.
2. Menu **Project settings → Your apps → Web app** → copy objek `firebaseConfig`.
3. Tempel ke `firebaseConfig` di `<head>` **`index.html`** (menggantikan placeholder
   `"AIzaSy..."` dkk). Pastikan `databaseURL` ikut terisi.
4. Atur **Rules** database. Untuk pendaftaran terbuka (siapa pun boleh menulis, tidak
   boleh membaca data orang lain):

   ```json
   { "rules": { "pendaftaran": { ".read": false, ".write": true } } }
   ```

Catatan: SDK dimuat lewat build **`-compat`** (`firebase-app-compat.js`). Build modular
tanpa `-compat` tidak membuat global `firebase` dan akan error.

Field yang tersimpan: **waktu, namaPanitia, noTelepon, namaAnak, kategori, lomba, divisi**.

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

> Catatan: papan pendaftar di halaman hanya membaca memori browser — isinya kosong lagi
> setelah refresh. Data permanennya ada di Firebase. Konfirmasi final tetap dikirim via
> link WhatsApp ke panitia sebagai cadangan.
