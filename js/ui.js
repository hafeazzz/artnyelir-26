/* ============================================================
   ARTNYELIR '26 — rendering UI & helper bersama
   ============================================================ */

/* escape HTML biar input pengguna aman ditaruh via innerHTML */
function esc(s){
  return String(s).replace(/[&<>"']/g, function(c){
    return { "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[c];
  });
}

/* ---------- papan pendaftar: total anak + 5 terbaru ---------- */
function renderBoard(){
  var num  = document.getElementById("board-num");
  var list = document.getElementById("board-list");

  num.textContent = pendaftar.anak.length;

  if (pendaftar.anak.length === 0){
    list.innerHTML = '<li class="board-empty">Belum ada pendaftar — jadilah yang pertama! 🚩</li>';
    return;
  }

  var terbaru = pendaftar.anak.slice(-5).reverse();
  var html = "";
  terbaru.forEach(function(anak){
    var avatar = anak.nama.charAt(0).toUpperCase();
    html +=
      '<li>' +
        '<div class="avatar">' + esc(avatar) + '</div>' +
        '<div>' +
          '<div class="nm">' + esc(anak.nama) + '</div>' +
          '<div class="mt">' + esc(KATEGORI[anak.kategori].label) + ' · ' + esc(anak.lomba) + '</div>' +
        '</div>' +
      '</li>';
  });
  list.innerHTML = html;
}

/* ---------- ringkasan akhir: panitia + daftar semua anak ---------- */
function renderRingkasan(){
  document.getElementById("ringkasan-panitia").textContent = pendaftar.panitia.nama;
  document.getElementById("ringkasan-telpon").textContent  = pendaftar.panitia.telpon;

  var list = document.getElementById("ringkasan-list");
  var html = "";
  pendaftar.anak.forEach(function(anak, i){
    html +=
      '<li>' +
        '<strong>Anak ' + (i + 1) + ':</strong> ' + esc(anak.nama) +
        ' — ' + esc(KATEGORI[anak.kategori].label) +
        '<small>' + esc(anak.lomba) + ' · ' + esc(DIVISI[anak.divisi]) + '</small>' +
      '</li>';
  });
  list.innerHTML = html;
}
