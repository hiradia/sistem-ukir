// ----------------------------------------------------------------
// Ambil semua elemen HTML yang bakal dipakai
// ----------------------------------------------------------------
const searchInput = document.getElementById("search");
const suggestionsBox = document.getElementById("suggestions");
const detailBox = document.getElementById("detail");
const detailSumber = document.getElementById("detail-sumber");
const detailSatuan = document.getElementById("detail-satuan");
const detailRange = document.getElementById("detail-range");
const posisiBox = document.getElementById("posisi-box");
const posisiFill = document.getElementById("posisi-fill");
const posisiMarker = document.getElementById("posisi-marker");
const posisiMin = document.getElementById("posisi-min");
const posisiMax = document.getElementById("posisi-max");
const posisiCaption = document.getElementById("posisi-caption");
const hargaInput = document.getElementById("harga");
const fieldNamaLain = document.getElementById("field-nama-lain");
const namaLainInput = document.getElementById("nama-lain");
const fieldSatuanLain = document.getElementById("field-satuan-lain");
const satuanLainInput = document.getElementById("satuan-lain");
const statusBox = document.getElementById("status-box");
const statusStamp = document.getElementById("status-stamp");
const statusCaption = document.getElementById("status-caption");
const btnCatat = document.getElementById("btn-catat");

let selectedLabel = null;   // komoditas yang lagi dipilih
let selectedItem = null;    // data lengkapnya (Min/Max), buat hitung preview di browser
let debounceTimer = null;   // buat nunda pencarian pas user masih ngetik

// ----------------------------------------------------------------
// Format angka jadi "Rp 15.000" biar gampang dibaca
// ----------------------------------------------------------------
function formatRupiah(angka) {
  return "Rp " + Number(angka).toLocaleString("id-ID");
}

// ----------------------------------------------------------------
// 1. Search-as-you-type
//    "debounce" = tunggu 200ms setelah user berhenti ngetik,
//    biar gak nembak request ke server tiap 1 huruf diketik.
// ----------------------------------------------------------------
searchInput.addEventListener("input", () => {
  clearTimeout(debounceTimer);
  const query = searchInput.value.trim();

  // kalau user ngetik ulang, anggap pilihan lama gak valid lagi
  selectedLabel = null;
  resetHasil();

  if (query.length < 2) {
    suggestionsBox.classList.add("hidden");
    return;
  }

  debounceTimer = setTimeout(() => cariKomoditas(query), 200);
});

async function cariKomoditas(query) {
  const res = await fetch(`/api/komoditas?q=${encodeURIComponent(query)}`);
  const hasil = await res.json();
  tampilkanSaran(hasil);
}

function tampilkanSaran(daftar) {
  suggestionsBox.innerHTML = "";

  if (daftar.length === 0) {
    suggestionsBox.innerHTML = `<div class="suggestion-empty">Gak ketemu, coba kata kunci lain</div>`;
    suggestionsBox.classList.remove("hidden");
    return;
  }

  daftar.forEach(item => {
    const div = document.createElement("div");
    div.className = "suggestion-item";
    div.textContent = item.Label;
    div.addEventListener("click", () => pilihKomoditas(item));
    suggestionsBox.appendChild(div);
  });

  suggestionsBox.classList.remove("hidden");
}

// ----------------------------------------------------------------
// 2. Pas user klik salah satu saran
// ----------------------------------------------------------------
function pilihKomoditas(item) {
  selectedLabel = item.Label;
  selectedItem = item;
  searchInput.value = item.Label;
  suggestionsBox.classList.add("hidden");

  detailSumber.textContent = item.Sumber;
  detailSatuan.textContent = item.Satuan || "(diisi manual)";
  detailRange.textContent = `${formatRupiah(item.Min)} – ${formatRupiah(item.Max)}`;
  detailBox.classList.remove("hidden");

  posisiMin.textContent = `Min ${formatRupiah(item.Min)}`;
  posisiMax.textContent = `Max ${formatRupiah(item.Max)}`;
  posisiBox.classList.add("hidden");

  // Komoditas kategori "lainnya" -- munculin input tambahan sesuai kebutuhan.
  // ButuhInput: null (gak perlu apa-apa) / "nama" (nama doang) / "nama_satuan" (dua-duanya)
  namaLainInput.value = "";
  satuanLainInput.value = "";
  fieldNamaLain.classList.toggle("hidden", !item.ButuhInput);
  fieldSatuanLain.classList.toggle("hidden", item.ButuhInput !== "nama_satuan");

  hargaInput.disabled = false;
  hargaInput.value = "";
  hargaInput.focus();

  statusBox.classList.add("hidden");
  btnCatat.disabled = true;
}

function resetHasil() {
  selectedItem = null;
  detailBox.classList.add("hidden");
  posisiBox.classList.add("hidden");
  fieldNamaLain.classList.add("hidden");
  fieldSatuanLain.classList.add("hidden");
  statusBox.classList.add("hidden");
  hargaInput.disabled = true;
  hargaInput.value = "";
  btnCatat.disabled = true;
}

// Cek apakah semua input yang WAJIB diisi (sesuai ButuhInput) udah keisi.
function inputLengkap() {
  if (!selectedItem) return false;
  if (selectedItem.ButuhInput && !namaLainInput.value.trim()) return false;
  if (selectedItem.ButuhInput === "nama_satuan" && !satuanLainInput.value.trim()) return false;
  return true;
}

// ----------------------------------------------------------------
// 3. Preview status -- dihitung LANGSUNG DI BROWSER, gak manggil server,
//    jadi gak kecatat ke riwayat. Ini cuma buat feedback instan sambil
//    user masih ngetik/belum yakin sama angkanya.
// ----------------------------------------------------------------
hargaInput.addEventListener("input", () => {
  const harga = Number(hargaInput.value);

  if (!selectedItem || hargaInput.value === "" || isNaN(harga)) {
    statusBox.classList.add("hidden");
    posisiBox.classList.add("hidden");
    btnCatat.disabled = true;
    return;
  }

  const wajar = harga >= selectedItem.Min && harga <= selectedItem.Max;
  tampilkanStatus(wajar, "Pratinjau -- klik \"Cek & Catat\" buat menyimpan ke riwayat");
  tampilkanPosisi(harga, selectedItem, wajar);
  btnCatat.disabled = !inputLengkap();
});

// Hitung & tampilin posisi harga di dalam rentang Min-Max sebagai progress bar.
// Ini cuma tambahan visual (bukan pengganti status WAJAR/TIDAK WAJAR),
// buat kasih gambaran seberapa jauh harga dari batas, bukan cuma lolos/nggak.
function tampilkanPosisi(harga, item, wajar) {
  const rentang = item.Max - item.Min;

  let persen; // posisi marker di sepanjang track, 0-100
  let caption;

  if (rentang <= 0) {
    // Jaga-jaga kalau Min == Max di data (rentangnya nol) -- hindari bagi dengan nol.
    persen = 50;
    caption = wajar ? "Sama dengan batas wajar" : "Di luar batas wajar";
  } else if (harga < item.Min) {
    const selisihPersen = Math.round(((item.Min - harga) / item.Min) * 100);
    persen = 0;
    caption = `${selisihPersen}% di bawah Min`;
  } else if (harga > item.Max) {
    const selisihPersen = Math.round(((harga - item.Max) / item.Max) * 100);
    persen = 100;
    caption = `${selisihPersen}% di atas Max`;
  } else {
    persen = ((harga - item.Min) / rentang) * 100;
    caption = `${Math.round(persen)}% dari rentang wajar`;
  }

  posisiFill.style.width = `${Math.max(0, Math.min(100, persen))}%`;
  posisiFill.classList.toggle("tidak-wajar", !wajar);
  posisiMarker.style.left = `${Math.max(0, Math.min(100, persen))}%`;
  posisiCaption.textContent = caption;
  posisiBox.classList.remove("hidden");
}

// Input nama/satuan tambahan juga ikut ngaruh ke aktif/nggaknya tombol,
// soalnya harga bisa aja udah keisi duluan sebelum nama-lain diisi.
namaLainInput.addEventListener("input", () => {
  btnCatat.disabled = !(hargaInput.value !== "" && inputLengkap());
});
satuanLainInput.addEventListener("input", () => {
  btnCatat.disabled = !(hargaInput.value !== "" && inputLengkap());
});

// ----------------------------------------------------------------
// 4. Tombol "Cek & Catat" -- baru di titik INI manggil server,
//    dan baru di titik ini kecatat ke riwayat (lewat /api/cek).
// ----------------------------------------------------------------
btnCatat.addEventListener("click", async () => {
  if (!selectedLabel || hargaInput.value === "" || !inputLengkap()) return;

  btnCatat.disabled = true;
  btnCatat.textContent = "Menyimpan...";

  const params = new URLSearchParams({
    label: selectedLabel,
    harga: hargaInput.value,
    nama_custom: namaLainInput.value.trim(),
    satuan_custom: satuanLainInput.value.trim(),
  });
  const res = await fetch(`/api/cek?${params.toString()}`);

  btnCatat.textContent = "Cek & Catat";

  if (!res.ok) {
    btnCatat.disabled = false;
    return;
  }

  await res.json();
  tampilkanToast("Berhasil dicatat ke riwayat");

  // Reset supaya gak bisa ke-klik dobel buat data yang sama --
  // user "mulai dari awal" lagi buat komoditas berikutnya.
  hargaInput.value = "";
  namaLainInput.value = "";
  satuanLainInput.value = "";
  statusBox.classList.add("hidden");
  btnCatat.disabled = true;
});

// ----------------------------------------------------------------
// 5. Toast -- notifikasi kecil di tengah layar, muncul sebentar
//    terus ilang sendiri.
// ----------------------------------------------------------------
let toastTimer = null;

function tampilkanToast(pesan) {
  let toast = document.getElementById("toast");

  if (!toast) {
    toast = document.createElement("div");
    toast.id = "toast";
    toast.innerHTML = `
      <svg class="toast-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="11" stroke="currentColor" stroke-width="2"/>
        <path d="M7 12.5L10.5 16L17 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      <span class="toast-text"></span>
    `;
    document.body.appendChild(toast);
  }

  toast.querySelector(".toast-text").textContent = pesan;
  toast.className = "toast show";

  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, 2000);
}

function tampilkanStatus(wajar, caption) {
  statusStamp.textContent = wajar ? "WAJAR" : "TIDAK WAJAR — CEK ULANG";
  statusStamp.className = "stamp " + (wajar ? "wajar" : "tidak-wajar");
  statusCaption.textContent = caption;

  // trik biar animasi CSS keputer ulang tiap kali status berubah
  void statusStamp.offsetWidth;
  statusStamp.style.animation = "none";
  void statusStamp.offsetWidth;
  statusStamp.style.animation = "";

  statusBox.classList.remove("hidden");
}

// ----------------------------------------------------------------
// Tutup dropdown saran kalau user klik di luar search box
// ----------------------------------------------------------------
document.addEventListener("click", (e) => {
  if (!e.target.closest(".search-wrap")) {
    suggestionsBox.classList.add("hidden");
  }
});