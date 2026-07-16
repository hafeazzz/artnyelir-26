/* ============================================================
   ARTNYELIR '26 — logika form, validasi & alur multi-anak
   ============================================================ */

/* elemen dipakai berulang */
var errEl        = document.getElementById("form-error");
var form1        = document.getElementById("form-anak-1");
var formTambahan = document.getElementById("form-anak-tambahan");
var panelTanya   = document.getElementById("sukses-anak-pertama");
var panelRingkas = document.getElementById("ringkasan-akhir");

/* ---------- koneksi Firebase Realtime Database ----------
   `database` dibuat di <head> index.html. Kalau SDK gagal dimuat (offline,
   diblokir, config belum diisi), pendaftaranRef = null dan form otomatis
   jatuh ke mode WhatsApp-only supaya halaman tidak mati total. */
var pendaftaranRef = null;

(function initFirebase(){
  if (typeof database === "undefined" || !database){
    console.warn("[Firebase] SDK/database tidak tersedia — pendaftaran hanya lewat WhatsApp.");
    return;
  }
  pendaftaranRef = database.ref(FIREBASE_PATH);
  console.log("[Firebase] Terhubung ke path /" + FIREBASE_PATH);
})();

/* ---------- helper ---------- */
function isValidPhone(phone){
  return phone.replace(/\D/g, "").length >= 9;
}

function tampilkanError(pesan){
  errEl.textContent = pesan;
  errEl.classList.add("show");
  errEl.scrollIntoView({ block: "center", behavior: "smooth" });
}

function sembunyikanError(){
  errEl.classList.remove("show");
}

/* nilai radio yang ter-checked di dalam sebuah form */
function radioValue(form, name){
  var el = form.querySelector('input[name="' + name + '"]:checked');
  return el ? el.value : null;
}

/* ---------- simpan satu anak ke Firebase ----------
   Mengembalikan Promise supaya pemanggil bisa menunggu hasilnya sebelum
   menampilkan panel sukses — jangan bilang "berhasil" sebelum benar tersimpan. */
function simpanKeFirebase(anak){
  if (!pendaftaranRef){
    console.warn("[Firebase] Dilewati — tidak ada koneksi database.");
    return Promise.resolve(null);
  }

  var data = {
    waktu:       new Date().toLocaleString("id-ID"),
    namaPanitia: pendaftar.panitia.nama,
    noTelepon:   pendaftar.panitia.telpon,
    namaAnak:    anak.nama,
    kategori:    KATEGORI[anak.kategori].label,
    lomba:       anak.lomba,
    divisi:      DIVISI[anak.divisi]
  };

  console.log("[Firebase] Mengirim data:", data);

  return pendaftaranRef.push(data).then(function(ref){
    console.log("✅ Data saved — /" + FIREBASE_PATH + "/" + ref.key);
    return ref;
  });
}

/* tombol submit: kunci selama proses simpan biar tidak dobel-kirim */
function kunciTombol(form, sedangKirim){
  var btn = form.querySelector('button[type="submit"]');
  if (!btn) return;
  btn.disabled = sedangKirim;
  if (sedangKirim){
    btn.dataset.labelAsli = btn.textContent;
    btn.textContent = "Menyimpan…";
  } else if (btn.dataset.labelAsli){
    btn.textContent = btn.dataset.labelAsli;
  }
}

/* update catatan "Lomba: ..." sesuai kategori terpilih */
function updateLombaNote(form, name, noteEl){
  var kategori = radioValue(form, name);
  noteEl.querySelector("b").textContent = kategori ? KATEGORI[kategori].lomba : "—";
}

var note1 = document.getElementById("lomba-note-1");
var noteTambahan = document.getElementById("lomba-note-tambahan");

form1.addEventListener("change", function(e){
  if (e.target.name === "kategori-1") updateLombaNote(form1, "kategori-1", note1);
});
formTambahan.addEventListener("change", function(e){
  if (e.target.name === "kategori-tambahan") updateLombaNote(formTambahan, "kategori-tambahan", noteTambahan);
});

/* ---------- submit anak pertama (dengan data panitia) ---------- */
form1.addEventListener("submit", function(e){
  e.preventDefault();
  sembunyikanError();

  var panitia  = document.getElementById("in-panitia-nama").value.trim();
  var telpon   = document.getElementById("in-panitia-telpon").value.trim();
  var nama     = document.getElementById("in-nama-anak-1").value.trim();
  var kategori = radioValue(form1, "kategori-1");
  var divisi   = radioValue(form1, "divisi-1");

  var masalah = [];
  if (panitia.length < 2)     masalah.push("nama panitia");
  if (!isValidPhone(telpon))  masalah.push("nomor telepon panitia yang valid");
  if (nama.length < 2)        masalah.push("nama anak");

  if (masalah.length){
    console.warn("[Form] Validasi gagal:", masalah);
    tampilkanError("Lengkapi dulu ya: " + masalah.join(", ") + ".");
    return;
  }

  pendaftar.panitia = { nama: panitia, telpon: telpon };
  var anakBaru = {
    nama: nama,
    kategori: kategori,
    divisi: divisi,
    lomba: KATEGORI[kategori].lomba
  };

  console.log("[Form] Submit anak ke-1:", anakBaru.nama);
  kunciTombol(form1, true);

  simpanKeFirebase(anakBaru).then(function(){
    pendaftar.anak.push(anakBaru);
    renderBoard();

    /* tampilkan pertanyaan "ada anak lagi?" */
    form1.style.display = "none";
    panelTanya.style.display = "block";
    panelTanya.scrollIntoView({ block: "center", behavior: "smooth" });
  }).catch(function(err){
    console.error("❌ Gagal menyimpan ke Firebase:", err);
    tampilkanError("Gagal menyimpan pendaftaran: " + err.message + ". Coba lagi ya.");
  }).then(function(){
    kunciTombol(form1, false);
  });
});

/* ---------- submit anak tambahan (tanpa data panitia) ---------- */
formTambahan.addEventListener("submit", function(e){
  e.preventDefault();
  sembunyikanError();

  var nama     = document.getElementById("in-nama-anak-tambahan").value.trim();
  var kategori = radioValue(formTambahan, "kategori-tambahan");
  var divisi   = radioValue(formTambahan, "divisi-tambahan");

  if (nama.length < 2){
    console.warn("[Form] Validasi gagal: nama anak");
    tampilkanError("Lengkapi dulu ya: nama anak.");
    return;
  }

  var anakBaru = {
    nama: nama,
    kategori: kategori,
    divisi: divisi,
    lomba: KATEGORI[kategori].lomba
  };

  console.log("[Form] Submit anak ke-" + (pendaftar.anak.length + 1) + ":", anakBaru.nama);
  kunciTombol(formTambahan, true);

  simpanKeFirebase(anakBaru).then(function(){
    pendaftar.anak.push(anakBaru);
    renderBoard();

    /* reset & langsung tanya lagi lewat panel */
    formTambahan.reset();
    updateLombaNote(formTambahan, "kategori-tambahan", noteTambahan);
    formTambahan.style.display = "none";
    panelTanya.style.display = "block";
    panelTanya.scrollIntoView({ block: "center", behavior: "smooth" });
  }).catch(function(err){
    console.error("❌ Gagal menyimpan ke Firebase:", err);
    tampilkanError("Gagal menyimpan pendaftaran: " + err.message + ". Coba lagi ya.");
  }).then(function(){
    kunciTombol(formTambahan, false);
  });
});

/* ---------- "Ya, daftar anak lagi" ---------- */
document.getElementById("btn-anak-lagi").addEventListener("click", function(){
  panelTanya.style.display = "none";
  formTambahan.style.display = "block";
  document.getElementById("in-nama-anak-tambahan").focus();
});

/* ---------- "Tidak, lihat ringkasan" ---------- */
document.getElementById("btn-lihat-ringkasan").addEventListener("click", tampilkanRingkasan);

/* ---------- "Selesai pendaftaran" dari form tambahan ---------- */
document.getElementById("btn-selesai").addEventListener("click", tampilkanRingkasan);

function tampilkanRingkasan(){
  panelTanya.style.display = "none";
  formTambahan.style.display = "none";
  panelRingkas.style.display = "block";

  renderRingkasan();

  var pesan = buatPesanWA();
  document.getElementById("btn-wa-akhir").href =
    "https://wa.me/" + WA_PANITIA + "?text=" + encodeURIComponent(pesan);

  panelRingkas.scrollIntoView({ block: "center", behavior: "smooth" });
}

/* ---------- "Pendaftaran baru" — mulai dari nol ---------- */
document.getElementById("btn-daftar-baru").addEventListener("click", function(){
  pendaftar.panitia = { nama: "", telpon: "" };
  pendaftar.anak = [];
  renderBoard();

  form1.reset();
  updateLombaNote(form1, "kategori-1", note1);
  panelRingkas.style.display = "none";
  form1.style.display = "block";
  document.getElementById("in-panitia-nama").focus();
});

/* ---------- rakit pesan WhatsApp ---------- */
function buatPesanWA(){
  var pesan =
    "Halo Panitia ARTNYELIR 🙏\n" +
    "Saya mau daftar lomba 17an:\n\n" +
    "Panitia yang Diajukan: " + pendaftar.panitia.nama + "\n" +
    "No. Telepon: " + pendaftar.panitia.telpon + "\n\n" +
    "--- DATA ANAK ---\n";

  pendaftar.anak.forEach(function(anak, i){
    pesan +=
      "\nAnak " + (i + 1) + ":\n" +
      "Nama: " + anak.nama + "\n" +
      "Kategori: " + KATEGORI[anak.kategori].label + "\n" +
      "Lomba: " + anak.lomba + "\n" +
      "Divisi: " + DIVISI[anak.divisi] + "\n";
  });

  pesan += "\nMerdeka! 🇮🇩";
  return pesan;
}

/* set catatan lomba awal sesuai radio default */
updateLombaNote(form1, "kategori-1", note1);
updateLombaNote(formTambahan, "kategori-tambahan", noteTambahan);
