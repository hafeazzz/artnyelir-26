# Integrasi Google Sheets — Panduan Setup

Setiap anak yang didaftarkan otomatis masuk sebagai satu baris di Google Sheet.
Gratis, tanpa server, tanpa API key di frontend. Ikuti langkah berikut sekali saja.

## Langkah 1 — Buat Google Sheet

1. Buka <https://sheets.new> (buat spreadsheet baru).
2. Beri nama, misal **"Pendaftaran ARTNYELIR 26"**.
   (Tab/sheet bernama `Pendaftaran` akan dibuat otomatis oleh script.)

## Langkah 2 — Pasang Apps Script

1. Di spreadsheet: menu **Extensions → Apps Script**.
2. Hapus semua kode contoh di editor.
3. Buka file `apps-script/Code.gs` dari proyek ini, **copy seluruh isinya**, tempel ke editor.
4. Klik ikon **Save** (💾).

## Langkah 3 — Deploy sebagai Web App

1. Klik **Deploy → New deployment**.
2. Klik ikon gerigi ⚙ di "Select type" → pilih **Web app**.
3. Isi:
   - **Description**: `artnyelir` (bebas)
   - **Execute as**: **Me** (email kamu)
   - **Who has access**: **Anyone**
4. Klik **Deploy**.
5. Pertama kali akan diminta **Authorize access** → pilih akun Google → jika muncul
   "Google hasn't verified this app", klik **Advanced → Go to (nama proyek) (unsafe)**
   → **Allow**. (Aman: ini script milikmu sendiri.)
6. Copy **Web app URL** yang berakhiran **`/exec`**.

## Langkah 4 — Sambungkan ke website

1. Buka `js/data.js`.
2. Tempel URL tadi ke `SHEET_ENDPOINT`:

   ```js
   var SHEET_ENDPOINT = "https://script.google.com/macros/s/AKfyc.../exec";
   ```

3. Simpan, deploy ulang website (`vercel --prod`) atau refresh lokal.

## Uji coba

- Buka URL `/exec` tadi langsung di browser → harus muncul
  `{"ok":true,"service":"ARTNYELIR pendaftaran",...}`.
- Daftarkan satu anak lewat form → cek Sheet, baris baru muncul dalam ~1-2 detik.

## Kalau nanti mengubah Code.gs

Setiap edit script harus **redeploy**: **Deploy → Manage deployments →** (pilih deployment)
**→ Edit (pensil) → Version: New version → Deploy**. URL `/exec` tetap sama.

## Catatan

- Kolom yang tersimpan: **Waktu, Nama Panitia, No Telepon, Nama Anak, Kategori, Lomba, Divisi**.
- No telepon disimpan sebagai teks (awalan `'`) supaya angka `0` di depan tidak hilang.
- Kalau `SHEET_ENDPOINT` dikosongkan (`""`), penyimpanan ke Sheet mati — website tetap
  jalan normal dan konfirmasi cukup lewat WhatsApp.
- Penyimpanan bersifat *non-blocking*: kalau internet putus saat submit, form tetap
  lanjut dan data masih terkirim ke panitia via link WhatsApp.
