# LahanSense — DESIGN.md (Frontend Design System & Spesifikasi Fitur)

> Sumber kebenaran tunggal untuk UI LahanSense. Semua komponen, spasi, warna, dan teks **wajib** mengikuti dokumen ini. Jika ada yang belum diatur, tambahkan ke dokumen ini lewat PR sebelum diimplementasikan.
> Stack: Next.js (App Router) + Tailwind CSS + MapLibre GL JS + Terra Draw + Turf.js + Recharts.
> Bahasa UI: **Bahasa Indonesia**. Kode, nama komponen, dan nama branch: Inggris.

---

## 1. Prinsip Desain

1. **Keputusan, bukan informasi.** Angka aksi (volume m³, durasi pompa) selalu jadi elemen paling besar di layar.
2. **Per petak, bukan per kota.** Semua data terikat ke satu poligon lahan.
3. **Tenang dan terpercaya.** Agritech premium: terang, hijau lembut, kartu bulat besar.
4. **Transparan.** Setiap rekomendasi menampilkan alasan dan *confidence level* (risiko awan Sentinel-2).
5. **Tanpa sensor.** Tidak ada ikon/teks/ilustrasi sensor atau IoT di mana pun.
6. **Mobile-first untuk petani, desktop untuk koperasi/juri.** Satu bahasa visual, dua layout.
7. **Konsisten.** Satu token untuk satu fungsi. Dilarang nilai warna/spasi/radius di luar token.

---

## 2. Design Tokens

### 2.1 Warna

| Token | Hex | Penggunaan |
|---|---|---|
| `primary-600` | `#16A34A` | Tombol utama, link aktif, status Aman |
| `primary-700` | `#15803D` | Hover tombol utama |
| `primary-50` | `#F0FDF4` | Latar chip/hover lembut |
| `primary-100` | `#DCFCE7` | Latar badge Aman |
| `forest-900` | `#14532D` | Hero card, sidebar, bottom nav mobile |
| `forest-800` | `#166534` | Hover elemen di atas forest |
| `lime-400` | `#A3E635` | Aksen (indikator aktif, highlight angka) |
| `water-600` | `#2563EB` | **Hanya** data air (volume, hujan, defisit) |
| `water-50` | `#EFF6FF` | Latar chip air |
| `warn-500` | `#F59E0B` | Status Waspada |
| `warn-50` | `#FFFBEB` | Latar banner Waspada |
| `danger-600` | `#DC2626` | Status Kritis, error |
| `danger-50` | `#FEF2F2` | Latar banner Kritis |
| `ink-900` | `#0F1F17` | Teks utama |
| `ink-600` | `#4B5B52` | Teks sekunder |
| `ink-400` | `#8A988F` | Placeholder, caption |
| `line-200` | `#E3EBE6` | Border, divider |
| `surface-0` | `#FFFFFF` | Kartu |
| `surface-50` | `#F6FAF7` | Latar halaman dasar |

Latar halaman: `linear-gradient(160deg, #ECFDF3 0%, #F6FAF7 45%, #EEF7E8 100%)` di dalam **app frame** putih bulat (desktop).

Peta overlay poligon: Aman `#16A34A`, Waspada `#F59E0B`, Kritis `#DC2626`; fill opacity `0.25`, outline putih 2px + stroke status 2px; poligon terpilih outline 3px.

Skala NDVI (peta panas): `0.0–0.2 #B91C1C` → `0.2–0.4 #F59E0B` → `0.4–0.6 #A3E635` → `0.6–0.8 #16A34A` → `0.8–1.0 #14532D`.

Kontras: teks ≥ 4.5:1. Status tidak boleh hanya warna; selalu sertakan ikon + label teks.

### 2.2 Tipografi

Font: **Plus Jakarta Sans** (Google Fonts via `next/font`), fallback `system-ui, sans-serif`. Angka memakai `font-variant-numeric: tabular-nums`. Format angka Indonesia: koma desimal (`2,8`), titik ribuan (`1.200`).

| Token | Ukuran / Line-height | Weight | Dipakai untuk |
|---|---|---|---|
| `display` | 56 / 60 | 800 | Angka hero ("28 m³") |
| `h1` | 32 / 40 | 700 | Judul halaman desktop |
| `h2` | 24 / 32 | 700 | Judul seksi, judul kartu besar |
| `h3` | 18 / 26 | 600 | Judul kartu |
| `body-lg` | 16 / 24 | 500 | Teks utama |
| `body` | 14 / 22 | 400 | Teks standar |
| `caption` | 12 / 16 | 500 | Label, meta, legenda |
| `button` | 14 / 20 | 600 | Tombol (mobile 16 / 24) |

Mobile: `display` 48/52, `h1` 26/34, `h2` 20/28. Huruf kapital semua hanya untuk `caption` label KPI (letter-spacing 0.04em).

### 2.3 Spasi (basis 4px)

`space-1 4` · `2 8` · `3 12` · `4 16` · `5 20` · `6 24` · `8 32` · `10 40` · `12 48` · `16 64`

Aturan baku:
- Padding kartu: **24px** desktop, **16px** mobile.
- Gap antar kartu: **24px** desktop, **12px** mobile.
- Gutter halaman: **32px** desktop, **16px** mobile.
- Jarak judul seksi ke konten: **16px**.
- Jarak antar field form: **16px**; label ke input: **8px**.

### 2.4 Radius, Shadow, Border

| Token | Nilai | Pakai |
|---|---|---|
| `radius-card` | 24px | Kartu, panel, peta |
| `radius-frame` | 32px | App frame desktop |
| `radius-input` | 16px | Input, select |
| `radius-pill` | 9999px | Tombol, chip, nav pill |
| `radius-sm` | 12px | Tooltip, thumbnail |

Shadow:
- `shadow-card`: `0 8px 24px -8px rgba(22,163,74,0.18), 0 2px 6px rgba(15,31,23,0.04)`
- `shadow-float`: `0 16px 40px -12px rgba(20,83,45,0.35)` (hero, bottom nav, panel melayang di peta)
- `shadow-focus`: ring `0 0 0 3px rgba(22,163,74,0.35)`

Border default `1px solid #E3EBE6`. Glass (label peta): `background rgba(255,255,255,0.72); backdrop-filter: blur(12px); border: 1px solid rgba(255,255,255,0.6)`.

### 2.5 Motion

Durasi 150ms (hover), 250ms (transisi panel), 400ms (angka count-up). Easing `cubic-bezier(0.22,1,0.36,1)`. Hormati `prefers-reduced-motion` (matikan count-up dan animasi peta).

### 2.6 Ikon

Library: **Lucide**. Stroke 1.75, ukuran 20 (default), 24 (nav), 16 (inline chip). Warna mengikuti teks, tidak ada ikon berwarna acak.

### 2.7 Tailwind config (acuan)

```ts
// tailwind.config.ts
export default {
  theme: {
    extend: {
      colors: {
        primary: { 50:'#F0FDF4',100:'#DCFCE7',600:'#16A34A',700:'#15803D' },
        forest: { 800:'#166534', 900:'#14532D' },
        lime: { 400:'#A3E635' },
        water: { 50:'#EFF6FF', 600:'#2563EB' },
        warn: { 50:'#FFFBEB', 500:'#F59E0B' },
        danger: { 50:'#FEF2F2', 600:'#DC2626' },
        ink: { 900:'#0F1F17', 600:'#4B5B52', 400:'#8A988F' },
        line: { 200:'#E3EBE6' },
        surface: { 0:'#FFFFFF', 50:'#F6FAF7' },
      },
      borderRadius: { card:'24px', frame:'32px', input:'16px' },
      boxShadow: {
        card:'0 8px 24px -8px rgba(22,163,74,0.18), 0 2px 6px rgba(15,31,23,0.04)',
        float:'0 16px 40px -12px rgba(20,83,45,0.35)',
      },
      fontFamily: { sans: ['var(--font-jakarta)','system-ui','sans-serif'] },
    },
  },
}
```

---

## 3. Layout & Grid

### 3.1 Breakpoint

| Nama | Lebar | Layout |
|---|---|---|
| `mobile` | < 768 | 1 kolom, bottom nav, tanpa sidebar |
| `tablet` | 768–1199 | Sidebar ikon, konten 1–2 kolom |
| `desktop` | ≥ 1200 | Sidebar ikon + konten 12 kolom |

Frame desktop acuan: **1440×900**. Konten maks lebar `1360px`, di tengah. Grid 12 kolom, gap 24px.

### 3.2 App Shell (desktop)

```
┌──────────────────────────────────────────────────────────────┐
│ Page bg gradient (padding 16px)                              │
│ ┌──────────────────────────────────────────────────────────┐ │
│ │ App Frame (putih, radius 32, shadow-card)                │ │
│ │ ┌──────┬───────────────────────────────────────────────┐ │ │
│ │ │Side  │ Topbar (72px)                                 │ │ │
│ │ │bar   ├───────────────────────────────────────────────┤ │ │
│ │ │88px  │ Content (padding 32)                          │ │ │
│ │ │      │                                               │ │ │
│ │ │      ├───────────────────────────────────────────────┤ │ │
│ │ │      │ Footer (48px)                                 │ │ │
│ │ └──────┴───────────────────────────────────────────────┘ │ │
│ └──────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

### 3.3 Sidebar (desktop/tablet)

- Lebar **88px**, latar `forest-900`, radius kiri frame mengikuti `radius-frame`, padding vertikal 24px.
- Atas: logo mark LahanSense 40×40 (daun + piksel satelit, putih di atas `forest-800` bulat).
- Item nav: tombol **56×56**, radius pill, ikon 24, jarak antar item 8px.
  - Normal: ikon `rgba(255,255,255,0.65)`.
  - Hover: latar `rgba(255,255,255,0.10)`.
  - **Aktif: pil gelap** (`#0B3A20`) dengan ikon `lime-400` + indikator titik lime 6px di sisi kiri.
- Tooltip label muncul di kanan saat hover (glass gelap, caption putih).
- Urutan nav (sama dengan bottom nav mobile): Beranda, Peta, Rekomendasi, Peringatan, Audit, Lahan Saya. Bawah: Pengaturan, Profil.
- Fokus keyboard: ring `shadow-focus` warna lime.

| Rute | Label | Ikon Lucide |
|---|---|---|
| `/` | Beranda | `LayoutDashboard` |
| `/peta` | Peta | `Map` |
| `/rekomendasi` | Rekomendasi | `Droplets` |
| `/peringatan` | Peringatan | `BellRing` |
| `/audit` | Audit Efisiensi | `Gauge` |
| `/lahan` | Lahan Saya | `Sprout` |
| `/pengaturan` | Pengaturan | `Settings` |

### 3.4 Topbar (desktop, tinggi 72px)

Padding horizontal 32px, tanpa border bawah (pemisah lewat jarak). Dari kiri ke kanan:
1. **Judul halaman** `h1` (mis. "Dashboard").
2. **Search** lebar 360px, tinggi 44px, radius pill, latar `surface-50`, ikon `Search` kiri, placeholder **"Cari lahan atau lokasi..."**.
3. Spacer.
4. **Toggle Mode Demo** (pill kecil, label "Mode Demo", aktif = latar `warn-50` + titik amber).
5. **Lonceng** 44×44 pill dengan badge angka (latar `danger-600`, 16px).
6. **Avatar** 44px bulat.
7. **CTA "+ Gambar Lahan"**: tombol utama pill tinggi 44px, ikon `Plus`.

Tablet: search jadi ikon. Mobile: lihat bagian 3.6.

### 3.5 Footer (desktop, tinggi 48px)

Teks `caption` `ink-400`, padding horizontal 32px, rata kiri-kanan:
- Kiri: "© 2026 LahanSense · Kelompok SundaSundaJawa"
- Tengah: "Data: Sentinel-2 · Open-Meteo · NASA POWER · BMKG"
- Kanan: "Pembaruan terakhir: 08 Nov 2026, 06.00 WIB" + titik hijau (data segar) / amber (cache lama).

Mobile: footer disembunyikan; info sumber data dipindah ke halaman Pengaturan > Tentang.

### 3.6 Mobile Shell

- Lebar acuan **393×852**. Gutter 16px.
- **Header** (tanpa topbar desktop): pada Beranda memakai header foto lahan blur (tinggi 280px). Halaman lain: header 56px dengan judul `h2` + tombol kembali/aksi 44×44.
- **Bottom nav melayang**: pil `forest-900`, tinggi 64px, lebar `calc(100% - 32px)`, jarak dari bawah 16px + safe-area, `shadow-float`. 5 ikon: Beranda, Peta, Rekomendasi, Peringatan, Profil. Item aktif = lingkaran `primary-600` 48px dengan ikon putih. Label tidak ditampilkan; `aria-label` wajib.
- **Bottom sheet**: radius atas 28px, handle 40×4 `line-200`, overlap header foto 24px.
- Target sentuh minimum **44×44**, tombol aksi utama **48px** tinggi.
- Konten diberi `padding-bottom: 96px` agar tidak tertutup nav.

---

## 4. Komponen Dasar

### 4.1 Tombol

| Varian | Spesifikasi |
|---|---|
| Primary | `primary-600`, teks putih, pill, tinggi 44 (mobile aksi utama 48), padding-x 20, hover `primary-700` |
| On-dark | Putih, teks `forest-900`, pill (di hero card) |
| Secondary | Putih, border `line-200`, teks `ink-900` |
| Ghost | Transparan, teks `primary-600`, hover `primary-50` |
| Danger | `danger-600`, teks putih |
| Icon | 44×44 pill |

State: hover naik 1px + shadow; pressed skala 0.98; disabled opacity 0.5 tanpa shadow; loading = spinner 16px menggantikan ikon, teks tetap.

### 4.2 Kartu

Latar putih, `radius-card`, `shadow-card`, padding 24 (mobile 16). Judul kartu `h3`, aksi sekunder di kanan atas (ghost kecil). Varian **Hero**: latar `forest-900`, teks putih, pola kontur halus opacity 0.06, `shadow-float`.

### 4.3 Chip & Badge Status

Pill tinggi 28, padding-x 12, `caption` 600, ikon 16 di kiri.

| Status | Latar | Teks | Ikon | Label |
|---|---|---|---|---|
| Aman | `primary-100` | `#166534` | `CheckCircle2` | Aman |
| Waspada | `#FEF3C7` | `#92400E` | `AlertTriangle` | Waspada |
| Kritis | `#FEE2E2` | `#991B1B` | `OctagonAlert` | Kritis |
| Info air | `water-50` | `water-600` | `Droplet` | (nilai) |

### 4.4 Input, Select, Date

Tinggi 48, radius 16, border `line-200`, latar putih, padding-x 16. Fokus: border `primary-600` + `shadow-focus`. Error: border `danger-600` + pesan `caption` merah di bawah (jarak 4). Label `body` 600, wajib di atas input. Helper `caption` `ink-600`. Chip pilihan (komoditas, metode irigasi) memakai **segmented chips** (bukan dropdown) bila ≤ 6 opsi.

### 4.5 KPI Card

`caption` kapital (label) → angka `h1` 700 → delta chip. Ikon 40×40 bulat `primary-50` di kanan atas. Tinggi seragam 120px.

### 4.6 Label Peta (Glass Pill)

Tinggi 32, padding-x 12, glass (lihat 2.4), teks `caption` 600 `ink-900`. Berisi satu metrik ("Defisit 3,2 mm", "NDVI 0,62"). Maksimal 2 label per poligon. Disembunyikan saat zoom < 13.

### 4.7 Grafik (Recharts)

Font Plus Jakarta Sans 12, grid horizontal `line-200` putus-putus, tanpa border sumbu. Garis 2.5px, titik aktif 8px putih border warna seri. Seri NDVI `primary-600`; seri air `water-600`; ambang kritis garis putus `danger-600`. Tooltip: kartu putih `radius-sm` `shadow-float`. Selalu ada `aria-label` ringkasan teks.

### 4.8 Peta (MapLibre)

- Basemap default: satelit; toggle "Peta jalan".
- Kontrol: zoom (+/−) pill vertikal di kanan bawah (44×44, glass), tombol lokasi GPS di atasnya, minimap 160×110 radius 16 di kiri bawah.
- Legenda Aman/Waspada/Kritis: kartu glass di kiri atas, 3 titik + label.
- Toggle layer: "Poligon", "NDVI", "Curah hujan" (segmented glass, atas tengah).
- Pada poligon terpilih: label nama ("Sawah Pak Ujang · 1,0 ha").

### 4.9 State Global

- **Loading**: skeleton shimmer (latar `surface-50`, radius sama dengan komponen). Pemrosesan citra: kartu progres "Mengambil citra satelit… 60%" + pesan "Sementara memakai data terakhir".
- **Kosong**: ilustrasi daun sederhana + judul `h3` + 1 kalimat + tombol "+ Gambar Lahan".
- **Error**: banner `danger-50` + ikon + tombol "Coba lagi".
- **Offline/Cache**: chip amber "Data tersimpan · terakhir 06.00".
- **Confidence rendah (awan)**: chip "Kepercayaan: Sedang — tutupan awan 45%" + tooltip penjelasan.

### 4.10 Toast & Modal

Toast: pil putih `shadow-float`, kanan atas (desktop) / atas tengah (mobile), 4 detik. Modal: radius 24, lebar maks 480, overlay `rgba(15,31,23,0.5)`; mobile jadi bottom sheet.

---

## 5. Spesifikasi Fitur (selaras proposal)

Peta fitur ke rute, branch GitFlow, dan komponen utama. Semua teks UI di bawah adalah teks final.

| # | Fitur | Rute | Branch | Prioritas |
|---|---|---|---|---|
| F1 | Dashboard | `/` | `feature/fe-dashboard` | Wajib |
| F2 | Polygon Geofencing (Gambar Lahan) | `/lahan/baru` | `feature/fe-polygon-draw` | Wajib |
| F3 | Detail Lahan + Peta NDVI | `/lahan/[id]` | `feature/fe-field-detail` | Wajib |
| F4 | Rekomendasi Irigasi Harian | `/rekomendasi` | `feature/fe-recommendation` | Wajib |
| F5 | Peringatan Dini 7 Hari | `/peringatan` | `feature/fe-early-alert` | Wajib |
| F6 | Audit Efisiensi Air | `/audit` | `feature/fe-audit` | Nilai tambah |
| F7 | Bandingkan Petak | `/bandingkan` | `feature/fe-compare` | Nilai tambah |
| F8 | Ekspor Laporan PDF | modal di F3/F6 | `feature/fe-report-export` | Nilai tambah |
| F9 | Mode Demo + Slider Waktu | global | `feature/fe-demo-mode` | Wajib (demo) |
| F10 | Lahan Saya (daftar) | `/lahan` | `feature/fe-fields-list` | Wajib |
| F11 | Pengaturan & Profil | `/pengaturan` | `feature/fe-settings` | Minor |

### F1 — Dashboard (`/`)

**Tujuan:** menjawab "Hari ini lahan saya butuh air berapa banyak dan apakah ada risiko?" dalam satu layar.

**Desktop (grid 12 kolom):**
- Kolom kiri (5 kolom): 
  1. Baris 3 KPI card (masing-masing 1/3 lebar): **Total Lahan 3**, **Total Luas 4,1 ha**, **Perlu Perhatian 2** (angka ini ber-ikon `AlertTriangle` amber).
  2. **Hero Card** (forest-900): label "Rekomendasi Hari Ini · Sawah Pak Ujang"; angka `display` putih **"28 m³"**; subteks "≈ 2,8 mm · Pompa 55 menit pada 8 L/detik"; chip Waspada; tombol on-dark **"Tandai sudah diairi"**; tautan kecil "Lihat alasan" membuka panel transparansi (F4).
  3. **Peringatan Dini 7 Hari**: batang tersegmentasi 7 hari (hijau/amber/merah, inisial hari Sen–Min), teks "Risiko kekeringan Rabu–Jumat. Majukan irigasi ke Selasa." tombol ghost "Lihat detail".
  4. **Tren NDVI**: mini line chart 30 hari, angka **0,62** dengan delta **+0,03**.
- Kolom kanan (7 kolom): **Peta satelit besar** (tinggi penuh sisa area), 3 poligon (hijau, amber terpilih, merah), label glass "Defisit 3,2 mm" dan "NDVI 0,62", minimap, zoom, legenda.

**Mobile:** header foto (salam "Selamat pagi, Pak Ujang", chip lokasi "Karawang", suhu `display` 48 "30°" + "Cerah berawan", tiga glass mini card: Hujan 0 mm, Kelembapan 80%, Angin 18 km/j) → bottom sheet: hero card, banner kuning "Risiko kekeringan Rabu–Jumat ›", scroller horizontal **"Lahan Saya"** (kartu 160×120 dengan titik status), KPI ringkas, NDVI.

**Interaksi:** klik poligon di peta menyinkronkan hero card ke lahan tersebut. "Tandai sudah diairi" membuka modal kecil (input volume aktual, default = rekomendasi) → toast "Tercatat. Terima kasih!" dan data masuk Audit (F6).

**State:** skeleton hero + peta; kosong = ajakan gambar lahan pertama.

### F2 — Polygon Geofencing (`/lahan/baru`)

**Tujuan:** onboarding < 2 menit, < 3 menit total.

**Layout desktop:** peta penuh + panel kanan 400px (kartu melayang, `shadow-float`, margin 24). **Mobile:** peta penuh + bottom sheet 3 tingkat (ringkas 120 / setengah / penuh).

**Stepper 3 langkah** (indikator bulat 28px di atas panel, garis penghubung):
1. **Cari lokasi** — input "Cari desa atau kecamatan..." + tombol "Gunakan lokasi saya" (GPS).
2. **Gambar batas petak** — toolbar glass di peta: Gambar (`Pentagon`), Ubah titik (`MousePointer2`), Hapus (`Trash2`), Urungkan (`Undo2`). Petunjuk di atas peta: "Ketuk titik sudut petak. Ketuk titik pertama untuk menutup." Setelah selesai, kartu hasil menampilkan **Luas: 1,0 ha** dan **Titik pusat** (koordinat `caption`). Peringatan amber bila luas < 0,1 ha: "Petak sangat kecil. Resolusi satelit 10 m, hasil kurang akurat."
3. **Detail tanaman** — Nama petak (input), **Komoditas** (chips: Padi, Jagung, Cabai, Bawang Merah, Lainnya), **Tanggal tanam** (date), **Metode irigasi** (chips: Genangan, Alur, Tetes, Pompa); bila Pompa muncul input "Debit pompa (L/detik)" default 8.
- Tombol bawah: "Kembali" (secondary) dan **"Simpan & Analisis"** (primary, penuh lebar mobile).

**Setelah simpan:** layar progres "Mengambil citra satelit terbaru…" (3 langkah centang: Citra Sentinel-2 · Data cuaca · Menghitung kebutuhan air), lalu redirect ke F3 dengan peta panas NDVI.

**Validasi:** poligon wajib tertutup, tak boleh self-intersect (pesan "Garis batas saling bersilang. Perbaiki titik."), nama wajib, tanggal tanam tidak boleh di masa depan > 30 hari.

### F3 — Detail Lahan (`/lahan/[id]`)

- Header: nama lahan `h1`, chip status, chip komoditas + "Hari ke-47 · Fase vegetatif akhir", tombol "Ekspor PDF" (ghost) dan menu `⋯` (Ubah, Hapus).
- Kiri 7 kolom: peta dengan **toggle NDVI** (peta panas di dalam batas petak, legenda skala NDVI, tanggal citra "Citra: 03 Nov 2026"). Kontrol tanggal citra (dropdown riwayat).
- Kanan 5 kolom (tumpuk kartu):
  1. Hero rekomendasi hari ini (sama seperti F1).
  2. **Neraca Air Harian**: tabel 4 baris — ET₀, ETc (Kc × ET₀), Hujan efektif, Defisit (nilai `water-600`), tiap baris satuan mm/hari.
  3. **Tren NDVI vs fase tumbuh**: line chart + pita rentang normal; anomali ditandai titik merah + tooltip "NDVI turun tidak wajar. Periksa lapangan (stres air/hama)."
  4. Chip **Kepercayaan data** (Tinggi/Sedang/Rendah) + tautan "Apa ini?".
- Tab (mobile): Ringkasan · Peta · Tren · Riwayat.

### F4 — Rekomendasi Irigasi Harian (`/rekomendasi`)

- Daftar kartu rekomendasi per lahan (urut: Kritis → Waspada → Aman).
- Setiap kartu: nama lahan, chip status, angka **volume m³** `h2` water-600, "≈ 2,8 mm · Pompa 55 menit pada 8 L/detik", tombol "Tandai sudah diairi", tautan "Lihat alasan".
- **Panel Alasan (transparan)**: rumus bertahap yang dapat dibaca petani:
  `ET₀ 4,6 → ETc (Kc 1,10) 5,1 → − hujan efektif 0 → − kelembapan tanah 1,9 → Defisit 3,2 mm → × 1,0 ha × 10 ÷ efisiensi 0,70 ≈ 28 m³`.
  Ditampilkan sebagai langkah vertikal dengan ikon, bukan rumus mentah. Di bawahnya chip kepercayaan.
- Input koreksi petani (sesuai mitigasi risiko proposal): slider "Tanah terasa: Kering · Cukup · Basah" yang menggeser kontribusi kelembapan tanah; tombol "Terapkan koreksi".
- Filter atas: segmented "Semua · Perlu air hari ini · Aman".

### F5 — Peringatan Dini 7 Hari (`/peringatan`)

- **Timeline 7 hari** (kartu lebar): 7 kolom hari (Sen…Min, tanggal `caption`), tiap kolom: ikon cuaca kecil, bar defisit kumulatif bertingkat warna, titik status. Hari ini disorot `primary-50`. Garis ambang kritis putus-putus.
- **Daftar alert** (kartu per alert, ikon di kiri 40×40 bulat berwarna status):
  - Jenis: **Risiko kekeringan**, **Anomali iklim** (hujan jauh di bawah normal / gelombang panas / hujan ekstrem), **Anomali vegetasi**.
  - Isi: judul `h3`, lahan terkait, rentang hari, dampak ("Fase pengisian bulir sensitif"), kotak **Tindakan disarankan** (latar `primary-50`, ikon `Lightbulb`): contoh "Majukan irigasi ke Selasa, tunda pemupukan."
  - Aksi: "Tandai sudah dibaca", "Atur pengingat".
- Filter: Semua · Kekeringan · Iklim · Vegetasi; per lahan (select).
- **Pusat notifikasi** (lonceng di topbar): dropdown 360px berisi 5 alert terbaru + "Lihat semua".
- WhatsApp: tampilkan toggle terkunci "WhatsApp — segera hadir" (roadmap), jangan dihilangkan agar konsisten dengan proposal.

### F6 — Audit Efisiensi Air (`/audit`)

- Kartu atas: **Skor Efisiensi Air** gauge setengah lingkaran 0–100 (warna mengikuti ambang: ≥75 hijau, 50–74 amber, <50 merah), angka `display`, delta musim lalu "+6 poin".
- 3 KPI: **Air disarankan** (m³), **Air dilaporkan** (m³), **Selisih** (m³, chip "Terbuang" amber atau "Kurang" merah).
- **Grafik tren**: batang ganda mingguan (disarankan vs aktual) + garis skor.
- **Tabel riwayat** (desktop) / kartu (mobile): Tanggal, Lahan, Disarankan, Aktual, Selisih, Status. Pagination 10 baris.
- Teks insight di bawah gauge: "Anda mengairi 18% lebih banyak dari kebutuhan pekan ini. Estimasi air terbuang 14 m³."
- Tombol "Ekspor laporan PDF" (F8).

### F7 — Bandingkan Petak (`/bandingkan`)

- Pilih 2–3 lahan (multi-select chips).
- Tabel perbandingan sejajar (kolom per lahan): Komoditas, Fase, Luas, NDVI, Defisit, Volume hari ini, Skor efisiensi, Status.
- Satu grafik gabungan NDVI 30 hari (warna seri berbeda dari palet: `primary-600`, `water-600`, `lime-400` + pola garis berbeda untuk aksesibilitas).
- Peta mini menyorot ketiga poligon.

### F8 — Ekspor Laporan PDF

Modal 480px: pilih lahan, rentang tanggal (7/30/90 hari/musim), isi (checkbox: Rekomendasi, NDVI, Alert, Audit). Tombol "Buat Laporan" → progres → tombol "Unduh PDF". Pratinjau halaman pertama 3:4 di sisi kanan modal (desktop). Header PDF: logo + nama lahan + periode; font sama; warna token yang sama.

### F9 — Mode Demo & Slider Waktu (global)

- Toggle "Mode Demo" di topbar (lihat 3.4). Saat aktif: banner tipis amber 32px di atas konten "Mode Demo aktif — memakai data bawaan" dan 3–4 poligon contoh (sawah, hortikultura, lahan kering) termuat dari cache.
- **Slider Tanggal** (kartu melayang bawah-tengah desktop, 560px; mobile bottom sheet): rentang ±14 hari, tombol putar ▶, menggeser tanggal mengubah hero, alert, dan neraca air secara langsung (animasi count-up 400ms). Penanda hari hujan (ikon tetes biru) pada trek.
- Jalan pintas keyboard: `D` toggle demo, `←/→` geser hari.

### F10 — Lahan Saya (`/lahan`)

- Header: judul + tombol "+ Gambar Lahan" + toggle tampilan Grid/Daftar.
- Grid kartu (3 kolom desktop, 1 mobile): thumbnail peta poligon 16:9 radius 16, nama, komoditas · luas, chip status, mini sparkline NDVI, angka "Hari ini 28 m³".
- Pencarian & urutan (Status, Nama, Luas).

### F11 — Pengaturan & Profil (`/pengaturan`)

Kartu bertab: Profil (nama, lokasi, foto), Notifikasi (web, email; WhatsApp terkunci), Preferensi (satuan, bahasa: Indonesia saja saat ini), Tentang (sumber data, versi, kontak tim). Tidak ada autentikasi kompleks pada MVP; profil bersifat lokal/demo.

---

## 6. Teks & Nada (Microcopy)

- Sapaan hangat, kalimat pendek, kata kerja aktif: "Tandai sudah diairi", bukan "Konfirmasi pelaksanaan irigasi".
- Gunakan istilah petani: "petak", "lahan", "pompa", "air". Hindari "evapotranspirasi" di UI utama; jelaskan di panel alasan sebagai "Kebutuhan air tanaman".
- Satuan: m³, mm, ha, L/detik, km/j, °C. Spasi sebelum satuan ("28 m³"), kecuali persen ("80%").
- Tanggal: "08 Nov 2026", waktu "06.00 WIB".
- Tidak ada kata "sensor" atau "IoT" selain di halaman Tentang (menjelaskan bahwa LahanSense tanpa sensor).

---

## 7. Aksesibilitas

- Kontras minimum AA, status = warna + ikon + teks.
- Semua kontrol dapat diakses keyboard; urutan fokus mengikuti urutan visual; ring fokus selalu terlihat.
- Peta: sediakan alternatif teks (daftar lahan dengan status) dan `aria-live="polite"` untuk update rekomendasi.
- Grafik: ringkasan teks via `aria-label`, tabel data tersembunyi untuk pembaca layar.
- Target sentuh ≥ 44px. Dukung zoom teks 200%. Hormati `prefers-reduced-motion`.

---

## 8. Struktur Kode Frontend

```
frontend/
├─ app/
│  ├─ layout.tsx               # AppShell (sidebar, topbar, footer)
│  ├─ page.tsx                 # F1
│  ├─ peta/page.tsx
│  ├─ lahan/page.tsx           # F10
│  ├─ lahan/baru/page.tsx      # F2
│  ├─ lahan/[id]/page.tsx      # F3
│  ├─ rekomendasi/page.tsx     # F4
│  ├─ peringatan/page.tsx      # F5
│  ├─ audit/page.tsx           # F6
│  ├─ bandingkan/page.tsx      # F7
│  └─ pengaturan/page.tsx      # F11
├─ components/
│  ├─ ui/          # Button, Card, Chip, Input, Modal, Toast, Skeleton
│  ├─ layout/      # Sidebar, Topbar, Footer, BottomNav, MobileHeader
│  ├─ map/         # MapView, DrawToolbar, NdviLayer, GlassLabel, Legend, Minimap
│  ├─ charts/      # NdviChart, DeficitBars, EfficiencyGauge, WeekTimeline
│  └─ features/    # HeroRecommendation, KpiCard, AlertCard, FieldCard, DemoSlider
├─ lib/            # api.ts, format.ts (angka ID), geo.ts (Turf), constants.ts
├─ styles/tokens.css
└─ types/api.ts
```

Aturan: komponen `ui/` tidak boleh memuat logika bisnis; warna hanya dari token Tailwind; format angka lewat `lib/format.ts` (`Intl.NumberFormat('id-ID')`).

---

## 9. Alur Kerja Tim (GitFlow + PR)

- Branch dari `develop`: `feature/fe-<nama>` sesuai tabel bagian 5; PR ke `develop`, minimal 1 reviewer.
- PR desain wajib melampirkan **screenshot desktop + mobile** dan mencentang checklist di bawah.
- Urutan pengerjaan yang disarankan: `feature/fe-design-tokens` (tokens, font, komponen ui) → `feature/fe-app-shell` (sidebar, topbar, footer, bottom nav) → F2 → F1 → F3 → F4 → F5 → F9 → F6/F7/F8.

---

## 10. Checklist Konsistensi (wajib sebelum PR)

- [ ] Hanya memakai token warna, spasi, radius, shadow dari dokumen ini
- [ ] Font Plus Jakarta Sans, angka tabular, format Indonesia
- [ ] Padding kartu 24/16, gap 24/12, gutter 32/16
- [ ] Sidebar/topbar/footer/bottom nav tidak berubah antar halaman
- [ ] Status memakai warna + ikon + teks
- [ ] Ada state loading, kosong, error, cache/offline
- [ ] Tidak ada elemen sensor/IoT
- [ ] Teks UI Bahasa Indonesia, nada sesuai bagian 6
- [ ] Mobile 393 px dan desktop 1440 px diperiksa
- [ ] Fokus keyboard dan label aria terpasang
- [ ] Angka demo konsisten dengan proposal (28 m³, 2,8 mm, 55 menit, 8 L/detik, NDVI 0,62, 3 lahan, 4,1 ha)
