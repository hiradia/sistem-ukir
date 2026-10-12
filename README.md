# Alat Cek Kewajaran Harga (versi Web)

Versi web dari alat cek kewajaran harga komoditas Susenas & Seruti — Kota Bandung (32/78).
Ini masih **prototype lokal**, belum di-hosting kemana-mana.

## Struktur project

```
webapp/
├── app.py                  # backend Flask - logic utama
├── requirements.txt         # daftar library Python yang dibutuhkan
├── data/
│   └── master_data.json    # 345 komoditas (Susenas + Seruti) hasil dari Excel
├── templates/
│   └── index.html           # struktur halaman
└── static/
    ├── style.css             # tampilan
    └── script.js              # logic di browser (search & cek kewajaran)
```

## Cara menjalankan (lokal)

1. Pastikan Python 3 sudah terinstall di komputer.
2. Buka terminal, masuk ke folder `webapp`:
   ```
   cd webapp
   ```
3. (Opsional tapi disarankan) buat virtual environment biar library-nya
   gak nyampur sama project Python lain:
   ```
   python -m venv venv
   source venv/bin/activate      # Mac/Linux
   venv\Scripts\activate         # Windows
   ```
4. Install library yang dibutuhkan:
   ```
   pip install -r requirements.txt
   ```
5. Jalankan server:
   ```
   python app.py
   ```
6. Buka browser, akses:
   ```
   http://127.0.0.1:5000
   ```
7. Buat berhenti, tekan `CTRL + C` di terminal.

# langkah termudah kalo yg di atas gak ngerti 

**Syarat:** Python sudah terinstall di komputer. Cek dengan buka Command Prompt/Terminal, ketik `python --version` — kalau muncul angka versi, berarti udah ada.

**Langkah-langkah:**

1. Extract file zip project-nya ke folder mana aja (misal Desktop)
2. Buka Command Prompt/Terminal
3. Masuk ke folder `webapp` di dalam hasil extract-an:
   ```
   cd /d [path ke folder webapp] (cara nemu path tinggal buka aja folder webapp-nya di File Explorer terus copy address yg di atas itu, klik kanan aja. habis itu tinggal paste di cmd, abis cd /d atau cd /c)
   ```
   (di Windows kalau beda drive, pakai `/d` biar bisa lompat drive)
4. Install library yang dibutuhkan (cukup sekali aja per komputer):
   ```
   pip install -r requirements.txt
   ```
5. Jalankan server:
   ```
   python app.py
   ```
6. Buka browser, akses:
   ```
   http://127.0.0.1:5000
   ```
7. Buat berhentiin server, tekan `CTRL + C` di terminal, atau tutup aja jendela terminal-nya

**Penting buat diinget:**
- Selama terminal itu kebuka dan `python app.py` masih jalan (ada tulisan `Running on http://127.0.0.1:5000`), web-nya bisa diakses
- Begitu terminal ditutup, web-nya otomatis gak bisa diakses lagi — ini masih versi lokal, belum di-hosting ke mana-mana, jadi cuma bisa diakses dari komputer yang lagi jalanin `python app.py` itu.

## Cara pakai

1. Ketik nama komoditas di kolom pencarian (misal "beras", "cabai", "listrik").
2. Pilih salah satu dari daftar saran yang muncul.
3. Batas wajar (min-max) dan satuan otomatis muncul.
4. Isi harga hasil wawancara di kolom "Harga hasil wawancara".
5. Status otomatis muncul: **WAJAR** atau **TIDAK WAJAR — CEK ULANG**.

## Update data

Kalau ada data komoditas baru/revisi, tinggal update file `data/master_data.json`
(atau generate ulang dari file Excel master pakai pandas: `df.to_json(...)`),
tidak perlu ubah kode `app.py` sama sekali, asal struktur kolomnya
(`Sumber`, `Kode`, `Nama`, `Satuan`, `Min`, `Max`, `Label`) tetap sama.

## Catatan buat yang lanjutin project ini

- Ini masih development server bawaan Flask (`debug=True`), **jangan dipakai
  buat production/publik** — kalau nanti mau dipakai banyak orang di kantor,
  perlu pakai server yang lebih proper (misal Gunicorn) dan didiskusikan ke
  bagian IT soal hosting di jaringan internal.
- Data (`master_data.json`) sumbernya dari file Excel batas kewajaran
  (`RH_KABU.xlsx` & `3278_RH_SERUTI.xlsx`), bukan data historis harga per
  waktu — jadi tool ini fungsinya validasi kewajaran, bukan prediksi.
- Kalau nanti bagian prediksi (ARIMA dkk) jadi dikerjakan, taruh logic-nya
  di file Python terpisah (misal `prediksi.py`) dan panggil dari `app.py`
  lewat endpoint baru, jangan dicampur ke `app.py` yang sudah ada biar
  gampang di-maintain.
