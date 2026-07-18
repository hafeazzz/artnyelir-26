/* ============================================================
   ARTNYELIR '26 — rendering UI & helper bersama
   ============================================================ */

/* escape HTML biar input pengguna aman ditaruh via innerHTML */
function esc(s){
  return String(s).replace(/[&<>"']/g, function(c){
    return { "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[c];
  });
}

/* ---------- papan pendaftar: jumlah anak (global, realtime) ----------
   Hanya angka — nama anak tidak pernah ditampilkan di halaman publik.
   Sumbernya /statistik/jumlah, bukan /pendaftaran (yang butuh login). */
function renderBoard(jumlah){
  var num  = document.getElementById("board-num");
  var note = document.getElementById("board-note");

  if (jumlah === null || jumlah === undefined){
    num.textContent = "–";
    note.textContent = "Menghitung…";
    return;
  }

  if (num.textContent !== String(jumlah)){
    num.textContent = jumlah;
    num.classList.remove("naik");
    void num.offsetWidth;          /* paksa reflow supaya animasi terulang */
    num.classList.add("naik");
  }

  note.textContent = jumlah === 0
    ? "Belum ada pendaftar — jadilah yang pertama! 🚩"
    : "Ayo daftarkan anakmu juga! 🇮🇩";
}

/* Ringkasan pendaftaran kini bagian dari wizard (step "ringkasan") dan
   dirender di form.js, karena strukturnya sudah pindah ke model keluarga. */
