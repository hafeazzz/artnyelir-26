/* ============================================================
   ARTNYELIR '26 — inisialisasi & animasi halaman
   ============================================================ */

/* ---------- parallax mouse di panggung hero ---------- */
(function parallax(){
  var fine = window.matchMedia("(hover:hover) and (pointer:fine)").matches;
  var calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!fine || calm) return;

  var hero = document.querySelector(".hero");
  var rig  = document.getElementById("rig");

  hero.addEventListener("mousemove", function(e){
    var r = hero.getBoundingClientRect();
    var x = (e.clientX - r.left) / r.width  - 0.5;   /* -0.5 .. 0.5 */
    var y = (e.clientY - r.top)  / r.height - 0.5;
    rig.style.setProperty("--mx", (x * 14).toFixed(2) + "deg");
    rig.style.setProperty("--my", (-y * 10).toFixed(2) + "deg");
  });
  hero.addEventListener("mouseleave", function(){
    rig.style.setProperty("--mx", "0deg");
    rig.style.setProperty("--my", "0deg");
  });
})();

/* ---------- tilt 3D kartu galeri ---------- */
(function tilt(){
  var fine = window.matchMedia("(hover:hover) and (pointer:fine)").matches;
  var calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!fine || calm) return;

  var cards = document.querySelectorAll(".polaroid");
  cards.forEach(function(card){
    card.addEventListener("mousemove", function(e){
      var r = card.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width  - 0.5;
      var y = (e.clientY - r.top)  / r.height - 0.5;
      card.style.transform =
        "rotate(0deg) perspective(600px)" +
        " rotateY(" + (x * 10).toFixed(2) + "deg)" +
        " rotateX(" + (-y * 10).toFixed(2) + "deg)" +
        " scale(1.03)";
    });
    card.addEventListener("mouseleave", function(){
      card.style.transform = "";
    });
  });
})();

/* ---------- reveal saat scroll ---------- */
(function reveal(){
  var els = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window)){
    els.forEach(function(el){ el.classList.add("in"); });
    return;
  }
  var io = new IntersectionObserver(function(entries){
    entries.forEach(function(en){
      if (en.isIntersecting){
        en.target.classList.add("in");
        io.unobserve(en.target);
      }
    });
  }, { threshold: 0.12 });
  els.forEach(function(el){ io.observe(el); });
})();

/* ---------- hitung mundur ke 17 Agustus 2026, 07.00 WIB ---------- */
(function countdown(){
  var target = new Date("2026-08-17T07:00:00+07:00").getTime();
  var elH = document.getElementById("cd-hari");
  var elJ = document.getElementById("cd-jam");
  var elM = document.getElementById("cd-menit");
  var elD = document.getElementById("cd-detik");
  var lbl = document.getElementById("cd-label");

  function pad(n){ return n < 10 ? "0" + n : "" + n; }

  function tick(){
    var diff = target - Date.now();
    if (diff <= 0){
      elH.textContent = "00"; elJ.textContent = "00";
      elM.textContent = "00"; elD.textContent = "00";
      lbl.innerHTML = "<strong>HARI INI! MERDEKA! 🎉</strong>";
      clearInterval(timer);
      return;
    }
    var s = Math.floor(diff / 1000);
    elH.textContent = pad(Math.floor(s / 86400));
    elJ.textContent = pad(Math.floor((s % 86400) / 3600));
    elM.textContent = pad(Math.floor((s % 3600) / 60));
    elD.textContent = pad(s % 60);
  }
  tick();
  var timer = setInterval(tick, 1000);
})();

/* ---------- papan pendaftar ----------
   Tampilkan status "menghitung" dulu; angka aslinya menyusul dari
   listener /statistik/jumlah yang dipasang di form.js. */
renderBoard(null);
