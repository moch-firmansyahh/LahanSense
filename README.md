# LahanSense: Intelijen Irigasi Presisi Tanpa Sensor Fisik

<div align="center">

![LahanSense Logo](frontend/public/logo-lahansense.svg)

**Platform Intelijen Irigasi Berbasis Citra Satelit Sentinel-2 dan Pemodelan Neraca Air Agrometeorologi FAO-56**

[![CR Youth 2026](https://img.shields.io/badge/CR_Youth_2026-Hackathon-10b981?style=for-the-badge)](https://github.com/moch-firmansyahh/LahanSense)
[![Tests Passed](https://img.shields.io/badge/Automated_Tests-37%2F37_Passed-brightgreen?style=for-the-badge)](PANDUAN_TESTING.md)
[![Playwright E2E](https://img.shields.io/badge/Playwright_E2E-9%2F9_Passed-blue?style=for-the-badge)](frontend/e2e/all_features.spec.ts)
[![Next.js](https://img.shields.io/badge/Frontend-Next.js_App_Router-black?style=for-the-badge&logo=next.js)](frontend)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?style=for-the-badge&logo=fastapi)](backend)
[![PostGIS](https://img.shields.io/badge/Database-Supabase_PostGIS-3ecf8e?style=for-the-badge&logo=supabase)](backend/alembic)

</div>

---

> **Tim SundaSundaJawa | CR Youth 2026 Hackathon**  
> **Modul Utama:** AgriWatch (Virtual Satellite Sensor) + WaterCast (FAO-56 Irrigation Engine)  
> **Database:** Supabase (PostgreSQL 15 + PostGIS Spatial Engine)

---

## 🌾 Latar Belakang & Nilai Inovasi

Pertanian Indonesia menghadapi tantangan krisis air dan pemborosan energi pompa irigasi. Sebagian besar petani mengairi sawah berdasarkan kebiasaan (jadwal kalender kaku) atau intuisi visual, yang kerap memicu:
1. **Pemborosan Air Tanah & Bahan Bakar Pompa:** Irigasi berlebih (*over-irrigation*) menghabiskan 30–50% lebih banyak air dan solar/listrik pompa.
2. **Cekaman Kekeringan Tanpa Terdeteksi:** Keterlambatan mengairi pada fase kritis pembungaan menurunkan hasil panen hingga 40%.
3. **Kendala Sensor Fisik IoT:** Sensor kelembapan tanah fisik mahal ($100–$300/unit), rentan rusak/terendam lumpur saat olah tanah, membutuhkan penggantian baterai berkala, serta sulit diskalakan untuk jutaan petani gurem (*smallholders*).

**LahanSense hadir sebagai solusi *Zero-Hardware Precision Irrigation*:**
Menggantikan sensor fisik di lapangan dengan memanfaatkan citra satelit **Copernicus Sentinel-2 (10m)** dan data agrometeorologi terbuka (**Open-Meteo**) yang diproses melalui algoritma baku **FAO-56 Penman-Monteith**. Petani cukup menggambar poligon lahan di peta, dan sistem langsung menghitung defisit air perakaran, rekomendasi volume irigasi, serta estimasi durasi operasional pompa air secara presisi.

---

## 🚀 Fitur Utama

### 1. AgriWatch: Sensor Vegetasi Satelit Virtual (Sentinel-2 10m)
- **Ekstraksi NDVI Spektral:** Perhitungan indeks kehijauan kanopi secara otomatis dari pita spektral NIR (Band 8) dan Red (Band 4) satelit Sentinel-2 L2A.
- **Telemetri Lengkap Lahan:** Estimasi kelembapan tanah volumetrik (%), suhu permukaan tanah (LST - Land Surface Temperature), dan indeks pH tanah per petak.
- **Peta Heatmap NDVI:** Visualisasi sebaran kerapatan biomassa tanaman di atas peta ortofoto resolusi tinggi.

### 2. WaterCast: Engine Neraca Air Agrometeorologi FAO-56
- **Evapotranspirasi Standar ($ET_0$):** Perhitungan kehilangan air harian berbasis persamaan Penman-Monteith (radiasi matahari, suhu udara, kelembapan relatif, dan kecepatan angin).
- **Pendekatan *Blended $K_c$*:** Menggabungkan koefisien tanaman kalender fase tumbuh ($K_{c,\text{stage}}$) dengan koefisien aktual hasil observasi satelit ($K_{c,\text{NDVI}}$) untuk akurasi optimal.
- **Rekomendasi Volume & Durasi Pompa:** Rekomendasi volume air ($m^3$) dan durasi pompa (menit) yang disesuaikan dengan efisiensi sistem irigasi (Genangan 45%, Alur 60%, Pompa 65%, Tetes 90%).

### 3. Early Warning System (EWS) 7 Hari & Notifikasi WhatsApp Otomatis
- **Pusat Peringatan Dini:** Pemantauan risiko kekeringan ekstrem, defisit air kumulatif, dan anomali vegetasi hingga 7 hari ke depan.
- **Otomasi WhatsApp:** Pengiriman notifikasi darurat secara otomatis ke nomor pengelola (`08112222136`) saat lahan memasuki status kritis.
- **Dokumen Resmi Berita Acara PDF:** Cetak lembar Berita Acara formal standar A4 (Kop Surat, tabel parameter risiko, matriks mitigasi lapangan, dan blok tanda tangan verifikasi 3 pihak).

### 4. GIS Engine & Penggambaran Poligon Petak
- **Pemetaan Interaktif:** Didukung oleh MapLibre GL JS, Terra Draw, dan Turf.js untuk menggambar poligon petak sawah secara langsung.
- **Kalkulasi Geospasial Instan:** Perhitungan luas otomatis dalam hektar ($ha$) dan ekstraksi titik koordinat *centroid* GPS WGS84.
- **Multi-Layer Switcher:** Opsi lapisan citra Satelit Ortofoto Sentinel-2, Heatmap AgriWatch NDVI, dan Vektor Jalan OpenStreetMap.

### 5. Simulator Skenario Waktu (*Time-Travel*) & Kalibrasi Lapangan
- **Slider Proyeksi H+1 s.d. H+7:** Mensimulasikan dinamika kelengasan tanah dan proyeksi defisit air di masa mendatang.
- **Kalibrasi *Ground-Truth*:** Koreksi rekomendasi air berdasarkan observasi fisik petani di lapangan (*Kering Pecah*, *Lembap Cukup*, atau *Basah Becek*).

### 6. Audit Efisiensi Air & Biaya Pompa
- **Pencatatan Realisasi:** Rekam jejak debit air aktual yang dialirkan petani vs saran sistem.
- **Skor Efisiensi (0–100):** Analisis ketercapaian target penghematan air (target 30–40%) dan estimasi biaya bahan bakar/listrik pompa yang dihemat.

### 7. Katalog 10 Petak Demo Lahan Nusantara
Dilengkapi dengan data *pre-cached* komprehensif pada sentra komoditas pangan dan hortikultura Indonesia:
- **Padi:** Karawang (Jawa Barat), Subang (Jawa Barat), Grobogan (Jawa Tengah).
- **Bawang Merah:** Brebes (Jawa Tengah), Nganjuk (Jawa Timur).
- **Jagung:** Malang (Jawa Timur), Gunungkidul (D.I. Yogyakarta).
- **Cabai & Sayuran:** Lembang (Jawa Barat), Pangalengan (Jawa Barat), Magelang (Jawa Tengah).

---

## 📐 Landasan Matematis & Agrometeorologi

### 1. Evapotranspirasi Standar ($ET_0$) Penman-Monteith FAO-56
$$ET_0 = \frac{0.408 \Delta (R_n - G) + \gamma \frac{900}{T + 273} u_2 (e_s - e_a)}{\Delta + \gamma (1 + 0.34 u_2)}$$

### 2. Mekanisme *Blended $K_c$*
$$K_c = 0.5 \times K_{c,\text{stage}} + 0.5 \times K_{c,\text{NDVI}}$$

Model regresi spektral NDVI yang diimplementasikan pada kode:
$$K_{c,\text{NDVI}} = \text{clamp}(1.457 \times \text{NDVI} - 0.1725, \text{min}=0.2, \text{max}=1.3)$$

### 3. Neraca Air & Defisit Harian
$$ET_c = K_c \times ET_0 \quad (\text{mm/hari})$$
$$\text{Defisit } (D_r) = \max\left(0, ET_c - P_{\text{eff}} - \text{Kontribusi Lengas}\right) \quad (\text{mm})$$
*di mana curah hujan efektif $P_{\text{eff}} = 0.8 \times P$.*

### 4. Volume Irigasi & Durasi Pompa
$$\text{Volume Irigasi } (m^3) = \frac{\text{Defisit } (\text{mm}) \times \text{Luas } (\text{ha}) \times 10}{\text{Efisiensi Sistem Irigasi}}$$
$$\text{Durasi Pompa } (\text{menit}) = \text{round}\left(\frac{\text{Volume } (m^3) \times 1000}{\text{Debit Pompa } (L/\text{detik}) \times 60}\right)$$

*Nilai efisiensi sistem: Irigasi Tetes ($90\%$), Pompa Tradisional ($65\%$), Alur ($60\%$), Genangan Sawah ($45\%$).*

---

## 🛠️ Tech Stack & Arsitektur

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           FRONTEND (Next.js 15)                         │
│   App Router · TypeScript · Tailwind CSS · Tipografi Montserrat         │
│   MapLibre GL JS · Terra Draw · Turf.js GIS · Recharts · Lucide Icons   │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │ REST API (JSON / GeoJSON)
┌────────────────────────────────────▼────────────────────────────────────┐
│                           BACKEND (FastAPI)                             │
│   Python 3.11+ · SQLAlchemy 2 · GeoAlchemy2 · Alembic · Pydantic v2    │
│   FAO-56 Engine · Water Balance · EWS Service · WhatsApp Automation     │
└───────────────────┬─────────────────────────────────┬───────────────────┘
                    │                                 │
┌───────────────────▼──────────────┐   ┌──────────────▼───────────────────┐
│     DATABASE (Supabase)          │   │      EKSTERNAL OPEN DATA         │
│  PostgreSQL 15 + PostGIS         │   │  Open-Meteo API (Cuaca Mikro)    │
│  Tabel Poligon, Observasi NDVI,  │   │  Sentinel-2 STAC (Copernicus)    │
│  Log Irigasi, Parameter Lahan    │   │  WhatsApp Gateway (Automated EWS)│
└──────────────────────────────────┘   └──────────────────────────────────┘
```

---

## 📁 Struktur Direktori Repository

```
LahanSense/
├── backend/
│   ├── alembic/                 # Skrip migrasi skema database PostGIS
│   ├── app/
│   │   ├── api/v1/              # Routing endpoint (health, plots, analytics, demo)
│   │   ├── core/                # Konfigurasi aplikasi & environment variables
│   │   ├── db/                  # Inisiasi koneksi PostgreSQL & session
│   │   ├── models/              # Model SQLAlchemy (Plot, NdviObservation, IrrigationLog)
│   │   ├── schemas/             # Skema validasi Pydantic
│   │   └── services/            # Modul inti hidrologi (et0, water_balance, alerts, weather, satellite)
│   ├── requirements.txt         # Dependensi produksi Python
│   ├── requirements-dev.txt     # Dependensi pengujian Python
│   └── tests/                   # Unit test pytest backend
├── frontend/
│   ├── e2e/                     # Suite pengujian Playwright End-to-End
│   ├── public/                  # Aset statis & logo resmi LahanSense (SVG/PNG)
│   └── src/
│       ├── app/                 # Halaman Next.js App Router
│       │   ├── page.tsx         # Dashboard utama & Time-Travel Simulator
│       │   ├── peta/            # Peta GIS interaktif & visualisasi kanopi
│       │   ├── lahan/           # Katalog galeri & tabel petak lahan
│       │   ├── lahan/baru/      # Formulir pendaftaran & gambar poligon
│       │   ├── rekomendasi/     # Rekomendasi irigasi detail per komoditas
│       │   ├── peringatan/      # Pusat peringatan dini & Berita Acara PDF
│       │   └── audit/           # Audit efisiensi air & biaya listrik/solar
│       ├── components/          # Komponen modular UI & feature widgets
│       └── lib/                 # Utility functions & API client
├── docs/                        # Dokumentasi kontrak API & proposal
├── PANDUAN_TESTING.md           # Panduan lengkap skenario pengujian juri
├── test_all_features.py         # Skrip pengujian otomatis 37 modul
├── run_tests.bat                # 1-Click execution pengujian otomatis (Windows)
└── README.md                    # Dokumentasi utama proyek
```

---

## ⚡ Panduan Menjalankan Aplikasi di Lokal

### Prasyarat
- **Node.js**: Versi 20 LTS atau lebih baru (`node -v`)
- **Python**: Versi 3.11 atau lebih baru (`python --version`)
- **Git**: Versi 2.40+ (`git --version`)

---

### 1. Menjalankan Backend (FastAPI)

1. Masuk ke direktori `backend`:
   ```bash
   cd backend
   ```
2. Buat dan aktifkan *virtual environment*:
   - **Windows (PowerShell):**
     ```powershell
     python -m venv .venv
     .venv\Scripts\Activate.ps1
     ```
   - **Linux / macOS:**
     ```bash
     python3 -m venv .venv
     source .venv/bin/activate
     ```
3. Pasang dependensi:
   ```bash
   pip install -r requirements-dev.txt
   ```
4. Konfigurasikan berkas lingkungan:
   ```bash
   cp .env.example .env
   ```
   *Sesuaikan `DATABASE_URL` jika menggunakan instance database Supabase sendiri.*
5. Jalankan server FastAPI:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```
6. Akses dokumentasi interaktif API di peramban:
   - **Swagger UI:** [http://localhost:8000/docs](http://localhost:8000/docs)
   - **Health Check:** [http://localhost:8000/api/v1/health](http://localhost:8000/api/v1/health)

---

### 2. Menjalankan Frontend (Next.js)

1. Buka terminal baru dan masuk ke direktori `frontend`:
   ```bash
   cd frontend
   ```
2. Pasang paket dependensi Node:
   ```bash
   npm install
   ```
3. Konfigurasikan environment lokal:
   ```bash
   cp .env.example .env.local
   ```
4. Jalankan server pengembangan Next.js:
   ```bash
   npm run dev
   ```
5. Buka aplikasi di peramban:
   - **Dashboard Utama:** [http://localhost:3000](http://localhost:3000)
   - **Peta GIS:** [http://localhost:3000/peta](http://localhost:3000/peta)
   - **Katalog Lahan:** [http://localhost:3000/lahan](http://localhost:3000/lahan)
   - **Pusat Peringatan:** [http://localhost:3000/peringatan](http://localhost:3000/peringatan)
   - **Audit Efisiensi:** [http://localhost:3000/audit](http://localhost:3000/audit)

---

## 🧪 Pengujian & Jaminan Mutu (Quality Assurance)

LahanSense dilengkapi dengan sistem pengujian komprehensif di setiap lapisan arsitektur:

### 1. Pengujian Otomatis 37 Modul (Python E2E)
Memvalidasi formula FAO-56 Penman-Monteith, dinamika $K_c$, integrasi spektral Sentinel-2, kalkulasi defisit air, engine EWS, audit efisiensi, integritas 10 poligon demo, dan seluruh rute frontend:

```powershell
# Melalui batch file (Windows):
.\run_tests.bat

# Atau langsung via python:
backend\.venv\Scripts\python.exe test_all_features.py
```
> **Hasil Uji:** 37/37 Butir Uji Lolos (100% Pass Rate).

### 2. Pengujian Antarmuka Pengguna (Playwright E2E)
Memvalidasi fungsionalitas rendering dashboard, penggantian petak dinamis, interaksi modal detail tanah/satelit, slider skenario waktu, layer switcher peta GIS, serta format cetak Berita Acara PDF:

```bash
cd frontend
npx playwright test
```
> **Hasil Uji:** 9/9 Skenario Playwright Lolos (100% Pass Rate).

### 3. Static Typecheck & Production Build
```bash
cd frontend
npm run build
```
> **Hasil Uji:** 14/14 Rute Halaman terkompilasi bersih tanpa *type error* atau *warning*.

---

## 👥 Tim Pengembang

**Tim SundaSundaJawa — CR Youth 2026 Hackathon**

| Peran | Fokus Kontribusi |
|---|---|
| **Fullstack & System Architect** | Arsitektur GIS MapLibre, Next.js App Router, integrasi backend FastAPI & Supabase PostGIS |
| **Data & Hydrology Engineer** | Pemodelan evapotranspirasi FAO-56 Penman-Monteith, algoritma Blended $K_c$, dan integrasi Sentinel-2 |
| **UI/UX & Product Design** | Desain ramah pengguna pertanian, sistem tipografi Montserrat, dokumen Berita Acara PDF, dan EWS WhatsApp |

---

## 📄 Lisensi

Proyek ini dikembangkan di bawah lisensi **MIT License** untuk keperluan kompetisi **CR Youth 2026 Hackathon**. Bebas digunakan, dipelajari, dan dikembangkan untuk kemaslahatan ketahanan pangan nasional.
