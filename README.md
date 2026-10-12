# Alat Cek Kewajaran dan Kira Perubahan Harga Komoditas

## Struktur project

```
webapp/
├── app.py                 
├── requirements.txt        
├── data/
│   ├── master_data.json
│   ├── harga_prediksi.json
│   └── riwayat.json
├── templates/
│   ├── about.html
│   ├── base.html
│   ├── cek_kewajaran.html
│   ├── home.html
│   ├── komoditas.html
│   ├── login.html
│   ├── prediksi.html
│   └── riwayat.html    
└── static/
    ├── style.css             
    ├── script.js
    ├── prediksi.js
    ├── navbar.js
    ├── komoditas.js
    └── images
        ├── kantor-bps-tasikmalaya
        ├── logo-bps
        └── logo-ukir
```

## Cara pakai

1. Ketik nama komoditas di kolom pencarian (misal "beras", "cabai", "listrik").
2. Pilih salah satu dari daftar saran yang muncul.
3. Batas wajar (min-max) dan satuan otomatis muncul.
4. Isi harga hasil wawancara di kolom "Harga hasil wawancara".
5. Status otomatis muncul: **WAJAR** atau **TIDAK WAJAR — CEK ULANG**.
