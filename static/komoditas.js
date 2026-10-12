// Data komoditas sudah di-embed langsung dari server (lihat komoditas.html),
// jadi gak perlu request API terpisah -- cukup sekali load pas halaman dibuka.
const DATA_SUSENAS_SERUTI = JSON.parse(document.getElementById("komoditas-data").textContent);
const DATA_PIHPS = JSON.parse(document.getElementById("pihps-data").textContent);
const DATA = [...DATA_SUSENAS_SERUTI, ...DATA_PIHPS];

const searchInput = document.getElementById("k-search");
const chips = document.querySelectorAll(".chip");
const tbody = document.getElementById("k-body");
const countText = document.getElementById("k-count");

let activeFilter = "Semua";

function formatRupiah(angka) {
  return "Rp " + Number(angka).toLocaleString("id-ID");
}

function bulanLabel(bulanStr) {
  const [tahun, bulan] = bulanStr.split("-");
  const nama = ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"];
  return `${nama[parseInt(bulan, 10) - 1]} ${tahun}`;
}

function render() {
  const keyword = searchInput.value.trim().toLowerCase();

  const hasil = DATA.filter(item => {
    const cocokSumber = activeFilter === "Semua" || item.Sumber === activeFilter;
    const cocokKeyword = item.Nama.toLowerCase().includes(keyword);
    return cocokSumber && cocokKeyword;
  });

  tbody.innerHTML = "";

  if (hasil.length === 0) {
    tbody.innerHTML = `<tr><td colspan="4" class="k-empty">Gak ada komoditas yang cocok</td></tr>`;
  } else {
    hasil.forEach(item => {
      const tr = document.createElement("tr");
      let hargaCell;

      if (item.Sumber === "PIHPS") {
        // PIHPS: range historis + info harga terakhir
        hargaCell = `
          <div>${formatRupiah(item.Min)} – ${formatRupiah(item.Max)}</div>
          <div class="harga-sub">Terakhir ${formatRupiah(item.HargaTerakhir)} · ${bulanLabel(item.BulanTerakhir)}</div>
        `;
      } else {
        // Susenas / Seruti: cuma range batas wajar
        hargaCell = `${formatRupiah(item.Min)} – ${formatRupiah(item.Max)}`;
      }

      tr.innerHTML = `
        <td><span class="src-tag src-${item.Sumber.toLowerCase()}">${item.Sumber}</span></td>
        <td>${item.Nama}</td>
        <td>${item.Satuan}</td>
        <td class="right mono">${hargaCell}</td>
      `;
      tbody.appendChild(tr);
    });
  }

  countText.textContent = `Menampilkan ${hasil.length} dari ${DATA.length} komoditas`;
}

searchInput.addEventListener("input", render);

chips.forEach(chip => {
  chip.addEventListener("click", () => {
    chips.forEach(c => c.classList.remove("active"));
    chip.classList.add("active");
    activeFilter = chip.dataset.filter;
    render();
  });
});

render();