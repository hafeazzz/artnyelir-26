/* ============================================================
   ARTNYELIR '26 — wizard pendaftaran multi-step
   Alur: orang tua → anak (berulang) → tanya → panitia → ringkasan → sukses
   Satu keluarga = satu record di Firebase /pendaftaran.
   ============================================================ */

/* ---------- koneksi Firebase Realtime Database ----------
   `database` dibuat di <head> index.html. Kalau SDK gagal dimuat, form
   tetap bisa diisi sampai step ringkasan; hanya submit yang gagal. */
var pendaftaranRef = null;
var statistikRef   = null;

(function initFirebase(){
  if (typeof database === "undefined" || !database){
    console.warn("[Firebase] SDK/database tidak tersedia — submit tidak akan tersimpan.");
    return;
  }
  pendaftaranRef = database.ref(FIREBASE_PATH);
  statistikRef   = database.ref(STATISTIK_PATH);
  console.log("[Firebase] Terhubung ke path /" + FIREBASE_PATH);

  /* Counter realtime. Halaman ini TIDAK boleh membaca /pendaftaran (isinya
     data pribadi, .read butuh login), jadi papan membaca angka dari
     /statistik/jumlah yang memang publik. Angkanya = jumlah anak. */
  statistikRef.on("value", function(snap){
    var jumlah = snap.val();
    console.log("[Firebase] Counter anak:", jumlah);
    renderBoard(typeof jumlah === "number" ? jumlah : 0);
  }, function(err){
    console.error("❌ [Firebase] Gagal membaca counter:", err);
    renderBoard(null);
  });
})();

/* Naikkan counter sebanyak `n` anak. Transaction supaya dua pendaftaran
   bersamaan tidak saling menimpa. Tidak menghambat alur: kalau gagal,
   data pendaftaran sendiri sudah aman — halaman admin menyelaraskan nanti. */
function naikkanCounter(n){
  if (!statistikRef || !n) return;
  statistikRef.transaction(function(nilai){
    return (typeof nilai === "number" ? nilai : 0) + n;
  }).catch(function(err){
    console.warn("[Firebase] Counter gagal naik (data tetap tersimpan):", err);
  });
}

/* ---------- elemen & helper ---------- */
var errEl = document.getElementById("form-error");
var steps = {};
document.querySelectorAll(".wz-step").forEach(function(el){
  steps[el.getAttribute("data-step")] = el;
});

function tampilkanError(pesan){
  errEl.textContent = pesan;
  errEl.classList.add("show");
  errEl.scrollIntoView({ block: "nearest", behavior: "smooth" });
}
function sembunyikanError(){ errEl.classList.remove("show"); }

function isValidPhone(v){ return v.replace(/\D/g, "").length >= 9; }
function val(id){ return document.getElementById(id).value.trim(); }

/* ---------- state mesin langkah ----------
   riwayat menyimpan snapshot {step, anakIndex} tiap kali maju, supaya
   tombol "Kembali" bisa menelusuri balik alur yang bercabang (loop anak). */
var state   = { step: "orangtua", anakIndex: 0 };
var riwayat = [];

/* bobot progress per jenis step (total step dinamis karena anak bisa banyak) */
var PROGRESS = { orangtua: 15, anak: 35, tanya: 48, panitia: 72, ringkasan: 90, sukses: 100 };
var LABEL = {
  orangtua: "Langkah 1 · Data Orang Tua",
  anak: "Data Anak",
  tanya: "Konfirmasi",
  panitia: "Data Panitia",
  ringkasan: "Ringkasan",
  sukses: "Selesai"
};

function render(){
  Object.keys(steps).forEach(function(k){ steps[k].hidden = (k !== state.step); });

  document.getElementById("wz-bar-fill").style.width = PROGRESS[state.step] + "%";
  var label = LABEL[state.step];
  if (state.step === "anak") label = "Data Anak " + (state.anakIndex + 1);
  document.getElementById("wz-step-label").textContent = label;

  sembunyikanError();
  if (onEnter[state.step]) onEnter[state.step]();

  var fokus = steps[state.step].querySelector("input, button.btn-primary");
  if (fokus) try { fokus.focus({ preventScroll: true }); } catch(e){ fokus.focus(); }

  steps[state.step].scrollIntoView({ block: "nearest", behavior: "smooth" });
  simpanDraft();
}

/* maju: validasi step sekarang, lalu pindah & catat riwayat */
function maju(nextStep){
  if (validasi[state.step] && !validasi[state.step]()) return;
  riwayat.push({ step: state.step, anakIndex: state.anakIndex });
  state.step = nextStep;
  render();
}
function mundur(){
  if (!riwayat.length) return;
  var prev = riwayat.pop();
  state.step = prev.step;
  state.anakIndex = prev.anakIndex;
  render();
}

/* ---------- logika saat MASUK tiap step ---------- */
var onEnter = {
  anak: function(){
    document.getElementById("anak-head").textContent = "Data Anak " + (state.anakIndex + 1);
    var a = pendaftar.anak[state.anakIndex] || { nama: "", jenisKelamin: "", usia: "" };
    document.getElementById("in-anak-nama").value = a.nama;
    document.getElementById("in-anak-usia").value = a.usia;
    var jk = steps.anak.querySelector('input[name="jk"][value="' + a.jenisKelamin + '"]');
    steps.anak.querySelectorAll('input[name="jk"]').forEach(function(r){ r.checked = false; });
    if (jk) jk.checked = true;
  },
  tanya: function(){
    document.getElementById("tanya-head").textContent =
      "Anak " + (state.anakIndex + 1) + " Tercatat!";
  },
  panitia: function(){
    document.getElementById("in-panitia-nama").value = pendaftar.panitia.nama;
    document.getElementById("in-panitia-usia").value = pendaftar.panitia.usia;
    document.getElementById("in-panitia-hp").value   = pendaftar.panitia.noHp;
    /* selaraskan centang divisi dengan data tersimpan (penting setelah
       kembali dari ringkasan atau pulih dari draft) */
    var dipilih = pendaftar.panitia.divisi || [];
    document.querySelectorAll('#chk-divisi input').forEach(function(c){
      c.checked = dipilih.indexOf(c.value) !== -1;
      c.closest(".chk").classList.toggle("on", c.checked);
    });
  },
  ringkasan: function(){ renderReview(); }
};

/* ---------- validasi per step (return true kalau lolos) ---------- */
var validasi = {
  orangtua: function(){
    var nama = val("in-ortu-nama"), alamat = val("in-ortu-alamat");
    var m = [];
    if (nama.length < 2)   m.push("nama orang tua");
    if (alamat.length < 3) m.push("alamat orang tua");
    if (m.length){ tampilkanError("Lengkapi dulu: " + m.join(", ") + "."); return false; }
    pendaftar.orangTua = { nama: nama, alamat: alamat };
    return true;
  },
  anak: function(){
    var nama = val("in-anak-nama");
    var jk   = steps.anak.querySelector('input[name="jk"]:checked');
    var usia = val("in-anak-usia");
    var m = [];
    if (nama.length < 2) m.push("nama anak");
    if (!jk)             m.push("jenis kelamin");
    if (usia === "" || isNaN(usia) || Number(usia) < 0 || Number(usia) > 17)
      m.push("usia anak (0–17)");
    if (m.length){ tampilkanError("Lengkapi dulu: " + m.join(", ") + "."); return false; }
    /* assignment by index → menambah anak baru ATAU mengedit yang sudah ada */
    pendaftar.anak[state.anakIndex] = { nama: nama, jenisKelamin: jk.value, usia: usia };
    console.log("[Form] Anak ke-" + (state.anakIndex + 1) + " tersimpan (sementara):", nama);
    return true;
  },
  panitia: function(){
    var nama = val("in-panitia-nama"), usia = val("in-panitia-usia"), hp = val("in-panitia-hp");
    var divisi = [];
    document.querySelectorAll('#chk-divisi input:checked').forEach(function(c){ divisi.push(c.value); });
    var m = [];
    if (nama.length < 2) m.push("nama panitia");
    if (usia === "" || isNaN(usia)) m.push("usia panitia");
    if (!isValidPhone(hp)) m.push("nomor HP yang valid");
    if (!divisi.length) m.push("minimal satu divisi");
    if (m.length){ tampilkanError("Lengkapi dulu: " + m.join(", ") + "."); return false; }
    if (Number(usia) < USIA_PANITIA_MIN){
      tampilkanError("Perwakilan panitia harus berusia minimal " + USIA_PANITIA_MIN + " tahun.");
      return false;
    }
    pendaftar.panitia = { nama: nama, usia: usia, noHp: hp, divisi: divisi };
    return true;
  }
};

/* ---------- render checkbox divisi (dari data.js) ---------- */
(function isiDivisi(){
  var wrap = document.getElementById("chk-divisi");
  wrap.innerHTML = DIVISI_PANITIA.map(function(d){
    return '<label class="chk"><input type="checkbox" value="' + esc(d) + '" /><span>' + esc(d) + '</span></label>';
  }).join("");
  /* highlight kotak saat dicentang */
  wrap.addEventListener("change", function(e){
    var lbl = e.target.closest(".chk");
    if (lbl) lbl.classList.toggle("on", e.target.checked);
  });
})();

/* ---------- ringkasan ---------- */
function renderReview(){
  var p = pendaftar;
  var html = "";

  html += '<div class="review-grup"><h4>Orang Tua</h4>' +
    row("Nama", p.orangTua.nama) + row("Alamat", p.orangTua.alamat) + '</div>';

  html += '<div class="review-grup"><h4>Anak (' + p.anak.length + ')</h4>';
  p.anak.forEach(function(a, i){
    html += '<div class="review-anak"><b>' + (i + 1) + '. ' + esc(a.nama) + '</b>' +
      ' <small>· ' + esc(a.jenisKelamin) + ' · ' + esc(a.usia) + ' th</small></div>';
  });
  html += '</div>';

  html += '<div class="review-grup"><h4>Panitia</h4>' +
    row("Nama", p.panitia.nama) +
    row("Usia", p.panitia.usia + " tahun") +
    row("No. HP", p.panitia.noHp) +
    row("Divisi", p.panitia.divisi.join(", ")) + '</div>';

  document.getElementById("review").innerHTML = html;
}
function row(dt, dd){
  return '<div class="review-row"><dt>' + esc(dt) + '</dt><dd>' + esc(dd) + '</dd></div>';
}

/* ---------- cadangan draft di localStorage ----------
   Kalau user tidak sengaja refresh sebelum submit, isian tidak hilang. */
function simpanDraft(){
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify({ pendaftar: pendaftar, state: state, riwayat: riwayat }));
  } catch(e){ /* storage penuh / diblokir — abaikan, bukan fitur wajib */ }
}
function hapusDraft(){
  try { localStorage.removeItem(DRAFT_KEY); } catch(e){}
}
function pulihkanDraft(){
  var raw;
  try { raw = localStorage.getItem(DRAFT_KEY); } catch(e){ return false; }
  if (!raw) return false;
  var d;
  try { d = JSON.parse(raw); } catch(e){ hapusDraft(); return false; }
  if (!d || !d.pendaftar || d.state.step === "sukses") { hapusDraft(); return false; }
  var adaIsi = d.pendaftar.orangTua.nama || d.pendaftar.anak.length;
  if (!adaIsi) return false;
  if (!confirm("Ada pengisian yang belum selesai. Lanjutkan dari sebelumnya?")){
    hapusDraft();
    return false;
  }
  pendaftar = d.pendaftar;
  state = d.state;
  riwayat = d.riwayat || [];
  return true;
}

/* ---------- tombol navigasi generik ---------- */
document.querySelectorAll("[data-maju]").forEach(function(btn){
  /* step orangtua & anak: "Lanjut" menuju step logis berikutnya */
  btn.addEventListener("click", function(){
    if (state.step === "orangtua") maju("anak");
    else if (state.step === "anak") maju("tanya");
  });
});
document.querySelectorAll("[data-mundur]").forEach(function(btn){
  btn.addEventListener("click", mundur);
});

/* step tanya: tambah anak / lanjut ke panitia */
document.getElementById("btn-tambah-anak").addEventListener("click", function(){
  riwayat.push({ step: state.step, anakIndex: state.anakIndex });
  state.anakIndex += 1;
  state.step = "anak";
  render();
});
document.getElementById("btn-selesai-anak").addEventListener("click", function(){
  riwayat.push({ step: state.step, anakIndex: state.anakIndex });
  state.step = "panitia";
  render();
});

/* step panitia → ringkasan */
document.getElementById("btn-ke-ringkasan").addEventListener("click", function(){
  maju("ringkasan");
});

/* ---------- submit final ---------- */
document.getElementById("btn-kirim").addEventListener("click", function(){
  var btn = this;
  sembunyikanError();

  var record = {
    waktu:          new Date().toLocaleString("id-ID"),
    namaOrangTua:   pendaftar.orangTua.nama,
    alamatOrangTua: pendaftar.orangTua.alamat,
    anak:           pendaftar.anak.map(function(a){
      return { namaAnak: a.nama, jenisKelamin: a.jenisKelamin, usia: a.usia };
    }),
    namaPanitia:    pendaftar.panitia.nama,
    usiaPanitia:    pendaftar.panitia.usia,
    noHpPanitia:    pendaftar.panitia.noHp,
    divisi:         pendaftar.panitia.divisi
  };

  if (!pendaftaranRef){
    tampilkanError("Koneksi database tidak tersedia. Cek internet lalu coba lagi.");
    return;
  }

  btn.disabled = true;
  btn.textContent = "Mengirim…";
  console.log("[Firebase] Mengirim pendaftaran keluarga:", record);

  pendaftaranRef.push(record).then(function(ref){
    console.log("✅ Data saved — /" + FIREBASE_PATH + "/" + ref.key);
    naikkanCounter(record.anak.length);
    hapusDraft();
    document.getElementById("sukses-detail").textContent =
      record.anak.length + " anak dari keluarga " + record.namaOrangTua +
      " berhasil didaftarkan. Sampai jumpa di lapangan — Merdeka! 🇮🇩";
    /* reset state supaya draft/keluarga berikutnya bersih */
    riwayat = [];
    state = { step: "sukses", anakIndex: 0 };
    render();
  }).catch(function(err){
    console.error("❌ Gagal menyimpan ke Firebase:", err);
    tampilkanError("Gagal mengirim: " + err.message + ". Coba lagi ya.");
    btn.disabled = false;
    btn.textContent = "Kirim Sekarang 🎉";
  });
});

/* ---------- "Daftarkan Keluarga Lain" ---------- */
document.getElementById("btn-daftar-baru").addEventListener("click", function(){
  pendaftar = {
    orangTua: { nama: "", alamat: "" },
    anak: [],
    panitia: { nama: "", usia: "", noHp: "", divisi: [] }
  };
  riwayat = [];
  state = { step: "orangtua", anakIndex: 0 };
  document.getElementById("in-ortu-nama").value = "";
  document.getElementById("in-ortu-alamat").value = "";
  document.querySelectorAll('#chk-divisi input').forEach(function(c){
    c.checked = false; c.closest(".chk").classList.remove("on");
  });
  hapusDraft();
  render();
});

/* ---------- mulai ---------- */
pulihkanDraft();
render();
