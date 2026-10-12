// Halaman Prediksi Harga -- 4 bagian:
// 1. Ringkasan semua komoditas (grid kartu kecil)
// 2. Detail 1 komoditas (chart historis + prediksi)
// 3. Bandingin beberapa komoditas (chart multi-garis, mode ganti dari #2)
// 4. Cek harga di bulan tertentu (lookup langsung tanpa baca chart)
//
// Semua data (historis + prediksi) sudah di-embed dari server (PREDIKSI_DATA),
// jadi ganti-ganti tampilan di sini gak perlu manggil API lagi.

const WARNA_GARIS = ["#2a78d6", "#eb6834", "#008B45", "#8B5CF6", "#DB2777"];

function formatRupiah(angka) {
  return "Rp " + Math.round(angka).toLocaleString("id-ID");
}

function bulanLabel(bulanStr) {
  const [tahun, bulan] = bulanStr.split("-");
  const nama = ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"];
  return `${nama[parseInt(bulan, 10) - 1]} ${tahun}`;
}

// ============ 1. RINGKASAN SEMUA KOMODITAS ============
function gambarRingkasan() {
  const grid = document.getElementById("ringkasan-grid");
  const daftar = Object.keys(PREDIKSI_DATA.historis_bulanan);

  grid.innerHTML = daftar.map((nama) => {
    const hist = PREDIKSI_DATA.historis_bulanan[nama];
    const pred = PREDIKSI_DATA.prediksi[nama];
    const hargaSekarang = hist.harga[hist.harga.length - 1];
    const hargaDepan = pred.prediksi[0];
    const persen = ((hargaDepan - hargaSekarang) / hargaSekarang) * 100;
    const naik = persen >= 0;

    return `
      <div class="ringkasan-komoditas-item">
        <div class="rki-nama">${nama}</div>
        <div class="rki-harga">${formatRupiah(hargaDepan)}</div>
        <div class="rki-bawah">
          <span class="rki-badge ${naik ? "naik" : "turun"}">
            ${naik ? "▲" : "▼"} ${Math.abs(persen).toFixed(1)}%
          </span>
          <span class="rki-label">bulan depan</span>
        </div>
      </div>
    `;
  }).join("");
}

// ============ 2 & 3. CHART DETAIL / PERBANDINGAN ============
let chartInstance = null;
let mode = "detail"; // "detail" | "bandingin"

const pilihKomoditas = document.getElementById("pilih-komoditas");
const wrapTunggal = document.getElementById("wrap-pilih-tunggal");
const wrapMulti = document.getElementById("wrap-pilih-multi");
const checkboxKomoditas = document.getElementById("checkbox-komoditas");
const chartJudul = document.getElementById("chart-judul");
const chartTerakhir = document.getElementById("chart-terakhir");
const chartLegend = document.getElementById("chart-legend");
const tabelPrediksi = document.getElementById("tabel-prediksi");
const cardTabelDetail = document.getElementById("card-tabel-detail");

function semuaLabelBulan() {
  const contoh = PREDIKSI_DATA.historis_bulanan[Object.keys(PREDIKSI_DATA.historis_bulanan)[0]];
  const predContoh = PREDIKSI_DATA.prediksi[Object.keys(PREDIKSI_DATA.prediksi)[0]];
  return [...contoh.bulan, ...predContoh.bulan];
}

function buatDataset(nama, warna, withBand) {
  const hist = PREDIKSI_DATA.historis_bulanan[nama];
  const pred = PREDIKSI_DATA.prediksi[nama];
  const totalBulan = hist.bulan.length + pred.bulan.length;

  const dataHist = [...hist.harga, ...Array(pred.bulan.length).fill(null)];
  const dataPred = [
    ...Array(hist.harga.length - 1).fill(null),
    hist.harga[hist.harga.length - 1],
    ...pred.prediksi,
  ];

  const datasets = [
    { label: `${nama} (historis)`, data: dataHist, borderColor: warna, backgroundColor: warna, borderWidth: 2, pointRadius: 2, tension: 0.15 },
    { label: `${nama} (prediksi)`, data: dataPred, borderColor: warna, backgroundColor: warna, borderWidth: 2, borderDash: [6, 4], pointRadius: 2, tension: 0.15 },
  ];

  if (withBand) {
    const dataLo = [...Array(hist.harga.length).fill(null), ...pred.batas_bawah];
    const dataHi = [...Array(hist.harga.length).fill(null), ...pred.batas_atas];
    datasets.unshift(
      { label: "Batas bawah", data: dataLo, borderWidth: 0, pointRadius: 0, fill: false },
      { label: "Batas atas", data: dataHi, borderWidth: 0, pointRadius: 0, fill: "+1", backgroundColor: warna + "26" }
    );
  }
  return datasets;
}

function gambarChartDetail(nama) {
  const hist = PREDIKSI_DATA.historis_bulanan[nama];
  const pred = PREDIKSI_DATA.prediksi[nama];

  chartJudul.textContent = `Tren harga -- ${nama}`;
  chartTerakhir.textContent = `Data s.d. ${PREDIKSI_DATA.terakhir_update}`;
  chartLegend.innerHTML = "";
  cardTabelDetail.classList.remove("hidden");

  const labels = semuaLabelBulan().map(bulanLabel);
  const datasets = buatDataset(nama, "#eb6834", true);

  if (chartInstance) chartInstance.destroy();
  chartInstance = new Chart(document.getElementById("chart-prediksi"), {
    type: "line",
    data: { labels, datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: { ticks: { callback: (v) => "Rp " + (v / 1000) + "rb" } },
        x: { ticks: { maxRotation: 45, autoSkip: true, maxTicksLimit: 12 } },
      },
    },
  });

  tabelPrediksi.innerHTML = pred.bulan.map((b, i) => `
    <tr>
      <td>${bulanLabel(b)}</td>
      <td>${formatRupiah(pred.prediksi[i])}</td>
      <td class="mono">${formatRupiah(pred.batas_bawah[i])} - ${formatRupiah(pred.batas_atas[i])}</td>
    </tr>
  `).join("");
}

function gambarChartBandingin(daftarNama) {
  chartJudul.textContent = daftarNama.length ? `Perbandingan -- ${daftarNama.length} komoditas` : "Pilih komoditas untuk dibandingkan";
  chartTerakhir.textContent = `Data s.d. ${PREDIKSI_DATA.terakhir_update}`;
  cardTabelDetail.classList.add("hidden");

  const labels = semuaLabelBulan().map(bulanLabel);
  let datasets = [];
  daftarNama.forEach((nama, i) => {
    datasets = datasets.concat(buatDataset(nama, WARNA_GARIS[i % WARNA_GARIS.length], false));
  });

  chartLegend.innerHTML = daftarNama.map((nama, i) => `
    <span class="legend-item"><span class="legend-dot" style="background:${WARNA_GARIS[i % WARNA_GARIS.length]}"></span>${nama}</span>
  `).join("");

  if (chartInstance) chartInstance.destroy();
  chartInstance = new Chart(document.getElementById("chart-prediksi"), {
    type: "line",
    data: { labels, datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: { ticks: { callback: (v) => "Rp " + (v / 1000) + "rb" } },
        x: { ticks: { maxRotation: 45, autoSkip: true, maxTicksLimit: 12 } },
      },
    },
  });
}

// Toggle mode detail <-> bandingin
document.querySelectorAll(".mode-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".mode-btn").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    mode = btn.dataset.mode;

    if (mode === "detail") {
      wrapTunggal.classList.remove("hidden");
      wrapMulti.classList.add("hidden");
      gambarChartDetail(pilihKomoditas.value);
    } else {
      wrapTunggal.classList.add("hidden");
      wrapMulti.classList.remove("hidden");
      gambarChartBandingin(getKomoditasTerpilihMulti());
    }
  });
});

pilihKomoditas.addEventListener("change", () => gambarChartDetail(pilihKomoditas.value));

function getKomoditasTerpilihMulti() {
  return Array.from(checkboxKomoditas.querySelectorAll("input:checked")).map((el) => el.value);
}

checkboxKomoditas.addEventListener("change", (e) => {
  const terpilih = getKomoditasTerpilihMulti();
  if (terpilih.length > 5) {
    e.target.checked = false;
    alert("Maksimal 5 komoditas biar chart-nya masih kebaca.");
    return;
  }
  gambarChartBandingin(terpilih);
});

// ============ 4. CEK HARGA DI BULAN TERTENTU ============
const cekKomoditas = document.getElementById("cek-komoditas");
const cekBulan = document.getElementById("cek-bulan");
const btnCekTanggal = document.getElementById("btn-cek-tanggal");
const hasilCekTanggal = document.getElementById("hasil-cek-tanggal");

btnCekTanggal.addEventListener("click", () => {
  const nama = cekKomoditas.value;
  const bulanInput = cekBulan.value; // format "YYYY-MM"
  if (!bulanInput) {
    alert("Pilih bulan dulu.");
    return;
  }

  const hist = PREDIKSI_DATA.historis_bulanan[nama];
  const pred = PREDIKSI_DATA.prediksi[nama];

  const idxHist = hist.bulan.indexOf(bulanInput);
  const idxPred = pred.bulan.indexOf(bulanInput);

  hasilCekTanggal.classList.remove("hidden");

  if (idxHist !== -1) {
    hasilCekTanggal.innerHTML = `
      <div class="hct-tipe">Data historis (aktual)</div>
      <div class="hct-nilai">${formatRupiah(hist.harga[idxHist])}</div>
      <div class="hct-ket">${nama} -- ${bulanLabel(bulanInput)}</div>
    `;
  } else if (idxPred !== -1) {
    hasilCekTanggal.innerHTML = `
      <div class="hct-tipe">Prediksi</div>
      <div class="hct-nilai">${formatRupiah(pred.prediksi[idxPred])}</div>
      <div class="hct-ket">${nama} -- ${bulanLabel(bulanInput)} -- kisaran ${formatRupiah(pred.batas_bawah[idxPred])} - ${formatRupiah(pred.batas_atas[idxPred])}</div>
    `;
  } else {
    const bulanTerawal = hist.bulan[0];
    const bulanTerakhir = pred.bulan[pred.bulan.length - 1];
    hasilCekTanggal.innerHTML = `
      <div class="hct-tipe hct-error">Di luar jangkauan</div>
      <div class="hct-ket">Data cuma tersedia ${bulanLabel(bulanTerawal)} - ${bulanLabel(bulanTerakhir)}. Prediksi gak bisa lebih jauh dari 6 bulan ke depan karena makin gak akurat.</div>
    `;
  }
});

// ============ Inisialisasi ============
gambarRingkasan();
gambarChartDetail(pilihKomoditas.value);
