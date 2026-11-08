"""
================================================================================
 LAHANSENSE - SUITE PENGUJIAN OTOMATIS KESELURUHAN FITUR (END-TO-END)
 Intelijen Irigasi Presisi Berbasis Satelit Sentinel-2 + FAO-56 Penman-Monteith
================================================================================
Script ini memvalidasi seluruh formula ilmiah, algoritma hidrologi, engine
peringatan dini, audit efisiensi, integritas 10 petak demo, dan rute frontend.

Cara Menjalankan:
    backend\\.venv\\Scripts\\python.exe test_all_features.py
Atau:
    python test_all_features.py
"""

import sys
import os
import math
from datetime import date, timedelta

# Pastikan path backend masuk ke sys.path
backend_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "backend"))
if backend_path not in sys.path:
    sys.path.insert(0, backend_path)

# ANSI Colors untuk output terminal yang profesional
GREEN = "\033[92m"
RED = "\033[91m"
YELLOW = "\033[93m"
CYAN = "\033[96m"
BOLD = "\033[1m"
RESET = "\033[0m"

pass_count = 0
fail_count = 0


def log_test(module_name: str, test_name: str, status: bool, detail: str = ""):
    global pass_count, fail_count
    if status:
        pass_count += 1
        print(f"  {GREEN}✔ [PASS]{RESET} {BOLD}{test_name}{RESET}")
        if detail:
            print(f"         {detail}")
    else:
        fail_count += 1
        print(f"  {RED}✖ [FAIL]{RESET} {BOLD}{test_name}{RESET}")
        if detail:
            print(f"         {RED}Error: {detail}{RESET}")


def section(title: str):
    print(f"\n{CYAN}{BOLD}{'=' * 78}{RESET}")
    print(f"{CYAN}{BOLD} {title}{RESET}")
    print(f"{CYAN}{BOLD}{'=' * 78}{RESET}")


def test_fao56_penman_monteith():
    section("MODUL 1: ALGORITMA EVAPOTRANSPIRASI FAO-56 PENMAN-MONTEITH")
    from app.services.et0 import et0_penman_monteith, _svp

    # 1.1 Tekanan Uap Jenuh (SVP)
    svp_25 = _svp(25.0)
    expected_svp = 0.6108 * math.exp(17.27 * 25.0 / (25.0 + 237.3))
    log_test(
        "FAO-56",
        "SVP (Saturation Vapor Pressure) pada 25°C",
        abs(svp_25 - expected_svp) < 1e-4,
        f"Nilai SVP: {svp_25:.4f} kPa (Referensi FAO: ~3.167 kPa)",
    )

    # 1.2 Kondisi Tropis Indonesia Normal (Karawang Cuaca Cerah)
    # Tmax=32°C, Tmin=24°C, RH=70%, Angin=2.0 m/s, Radiasi=20 MJ/m2, Lat=-6.3°, DOY=312
    et0_normal = et0_penman_monteith(
        t_max=32.0,
        t_min=24.0,
        rh_mean=70.0,
        wind_2m=2.0,
        solar_rad_mj=20.0,
        lat_deg=-6.3,
        doy=312,
        elevation_m=25.0,
    )
    log_test(
        "FAO-56",
        "ET0 Tropis Dataran Rendah Normal (Karawang)",
        3.5 <= et0_normal <= 6.5,
        f"Hasil ET0: {et0_normal:.2f} mm/hari (Range wajar tropis 3.5 - 6.5 mm/hari)",
    )

    # 1.3 Kondisi Dataran Tinggi (Lembang / Pangalengan)
    # Suhu lebih sejuk (Tmax=24°C, Tmin=15°C, Alt=1200m)
    et0_highland = et0_penman_monteith(
        t_max=24.0,
        t_min=15.0,
        rh_mean=80.0,
        wind_2m=1.5,
        solar_rad_mj=18.0,
        lat_deg=-6.8,
        doy=312,
        elevation_m=1250.0,
    )
    log_test(
        "FAO-56",
        "ET0 Dataran Tinggi Suhu Sejuk (Lembang)",
        2.0 <= et0_highland < et0_normal,
        f"Hasil ET0: {et0_highland:.2f} mm/hari (Lebih rendah dari dataran rendah sesuai fisika)",
    )

    # 1.4 Kondisi Ekstrem Hujan Lebat / Mendung Gelap (Radiasi rendah 5 MJ, RH 95%)
    et0_rainy = et0_penman_monteith(
        t_max=25.0,
        t_min=22.0,
        rh_mean=95.0,
        wind_2m=0.8,
        solar_rad_mj=5.0,
        lat_deg=-6.3,
        doy=312,
        elevation_m=10.0,
    )
    log_test(
        "FAO-56",
        "ET0 Saat Cuaca Mendung/Hujan Lebat",
        0.5 <= et0_rainy <= 2.2,
        f"Hasil ET0: {et0_rainy:.2f} mm/hari (Evaporasi menurun drastis)",
    )


def test_crop_coefficients_and_stages():
    section("MODUL 2: KURVA KOEFISIEN TANAMAN (Kc) PER FASE TUMBUH")
    from app.services.water_balance import kc_by_stage, CROP_PARAMS

    # 2.1 Validasi Database Koefisien 4 Komoditas Utama
    crops = ["padi", "cabai", "jagung", "bawang_merah"]
    all_crops_valid = all(c in CROP_PARAMS for c in crops)
    log_test("Kc", "Kelengkapan Parameter Tanaman Pangan & Hortikultura", all_crops_valid)

    # 2.2 Padi Fase Awal (DAP=10) vs Fase Bunting/Mid (DAP=70) vs Akhir (DAP=130)
    kc_padi_ini = kc_by_stage("padi", 10)
    kc_padi_mid = kc_by_stage("padi", 70)
    kc_padi_late = kc_by_stage("padi", 130)
    log_test(
        "Kc",
        "Dinamika Kc Padi (Awal -> Vegetatif Maksimal -> Pematangan)",
        kc_padi_ini == 1.05 and kc_padi_mid == 1.20 and kc_padi_late < kc_padi_mid,
        f"Awal: {kc_padi_ini:.2f} | Puncak/Mid: {kc_padi_mid:.2f} | Akhir: {kc_padi_late:.2f}",
    )

    # 2.3 Jagung: Fase Awal Kebutuhan Rendah -> Melonjak saat Pembungaan
    kc_jagung_ini = kc_by_stage("jagung", 15)
    kc_jagung_mid = kc_by_stage("jagung", 75)
    log_test(
        "Kc",
        "Dinamika Kc Jagung (Initial 0.30 -> Peak 1.20)",
        kc_jagung_ini == 0.30 and kc_jagung_mid == 1.20,
        f"Awal: {kc_jagung_ini:.2f} -> Puncak Pembungaan: {kc_jagung_mid:.2f}",
    )

    # 2.4 Interpolasi Linear Halus Antar-Fase
    kc_padi_dev = kc_by_stage("padi", 45)  # pertengahan l_dev (30-60)
    log_test(
        "Kc",
        "Interpolasi Linear Antara Fase Awal dan Puncak",
        1.05 < kc_padi_dev < 1.20,
        f"Kc Hari ke-45: {kc_padi_dev:.3f} (Interpolasi halus tanpa lonjakan tajam)",
    )


def test_satellite_agriwatch_integration():
    section("MODUL 3: INTEGRASI SATELIT SENTINEL-2 (AGRIWATCH) & BLENDED Kc")
    from app.services.water_balance import kc_from_ndvi, blended_kc

    # 3.1 Konversi Indeks Vegetasi NDVI ke Kc Empiris
    # Formula: Kc = 1.457 * NDVI - 0.1725 (dibatasi min 0.2, max 1.3)
    kc_dense = kc_from_ndvi(0.80)  # Kanopi lebat
    kc_sparse = kc_from_ndvi(0.35)  # Vegetasi renggang
    log_test(
        "Satelit",
        "Model AgriWatch: Ekstraksi Kc dari Spektrum NDVI Sentinel-2",
        0.95 <= kc_dense <= 1.05 and 0.30 <= kc_sparse <= 0.40,
        f"NDVI 0.80 -> Kc {kc_dense:.3f} | NDVI 0.35 -> Kc {kc_sparse:.3f}",
    )

    # 3.2 Blended Kc: Penggabungan Model Teoretis FAO-56 + Pengamatan Satelit Riil
    kc_stage = 1.05
    ndvi_obs = 0.74
    blended = blended_kc("padi", 30, ndvi_obs)
    log_test(
        "Satelit",
        "Blended Kc (50% Model Kalender HST + 50% Ground Truth NDVI)",
        abs(blended - (0.5 * kc_stage + 0.5 * kc_from_ndvi(ndvi_obs))) < 1e-4,
        f"Hasil Blended Kc: {blended:.3f} (Mengoreksi keterlambatan tanam)",
    )

    # 3.3 Fallback Satelit Saat Cuaca Mendung / Tertutup Awan (NDVI = None)
    blended_cloudy = blended_kc("padi", 30, None)
    log_test(
        "Satelit",
        "Graceful Fallback saat Citra Satelit Tertutup Awan",
        blended_cloudy == kc_stage,
        f"Fallback Kc otomatis ke model agronomis: {blended_cloudy:.2f}",
    )


def test_water_balance_and_volume():
    section("MODUL 4: NERACA AIR HARIAN, VOLUME IRIGASI & OPERASI POMPA")
    from app.services.water_balance import (
        compute_day,
        irrigation_volume_m3,
        pump_minutes,
        classify,
        IRRIGATION_EFFICIENCY,
    )

    # 4.1 Efisiensi Metode Irigasi
    log_test(
        "Irigasi",
        "Standar Efisiensi Metode (Genangan=45%, Alur=60%, Pompa=65%, Tetes=90%)",
        IRRIGATION_EFFICIENCY["genangan"] == 0.45
        and IRRIGATION_EFFICIENCY["tetes"] == 0.90
        and IRRIGATION_EFFICIENCY["pompa"] == 0.65,
    )

    # 4.2 Formula Konversi Volume: V = (Defisit mm * Luas ha * 10) / Efisiensi
    # Defisit 2.8 mm pada 1.0 ha sawah irigasi genangan (eff 0.45) -> 2.8 * 1 * 10 / 0.45 = 62.2 m3
    vol_genangan = irrigation_volume_m3(2.8, 1.0, "genangan")
    vol_tetes = irrigation_volume_m3(2.8, 1.0, "tetes")
    log_test(
        "Irigasi",
        "Perhitungan Volume Kebutuhan Air Aktual",
        round(vol_genangan, 1) == 62.2 and round(vol_tetes, 1) == 31.1,
        f"Genangan (Sawah): {vol_genangan:.1f} m³ vs Tetes (Hemat 50%): {vol_tetes:.1f} m³",
    )

    # 4.3 Estimasi Durasi Operasi Pompa (Debit 8 Liter/Detik = 28.8 m3/jam)
    durasi_55m3 = pump_minutes(28.8, flow_lps=8.0)
    log_test(
        "Irigasi",
        "Estimasi Waktu Pompa Air (8 L/s)",
        durasi_55m3 == 60,
        f"Volume 28.8 m³ membutuhkan waktu tepat: {durasi_55m3} menit",
    )

    # 4.4 Pengaruh Hujan Efektif (Peff)
    today = date.today()
    rec_hujan = compute_day(
        crop="padi",
        planting_date=today - timedelta(days=40),
        method="genangan",
        area_ha=1.0,
        target=today,
        et0_mm=4.5,
        rain_mm=25.0,  # Hujan lebat 25 mm
    )
    log_test(
        "Irigasi",
        "Hujan Alami Mengeliminasi Defisit Air (Zero Waste Irrigation)",
        rec_hujan["deficit_mm"] == 0 and rec_hujan["irrigation_volume_m3"] == 0 and rec_hujan["status"] == "aman",
        "Defisit air menjadi 0 mm dan status otomatis Aman (Pompa tidak perlu hidup)",
    )

    # 4.5 Klasifikasi Status Hidrologis (Aman, Waspada, Kritis)
    log_test(
        "Irigasi",
        "Klasifikasi Ambang Batas Risiko Hidrologis",
        classify(1.2) == "aman" and classify(3.5) == "waspada" and classify(6.2) == "kritis",
        "1.2 mm: Aman | 3.5 mm: Waspada | 6.2 mm: Kritis",
    )


def test_early_warning_engine():
    section("MODUL 5: ENGINE PUSAT PERINGATAN DINI (EARLY WARNING 7 HARI)")
    from app.services.alerts import build_alerts

    # 5.1 Deteksi Risiko Kekeringan Kumulatif 3 Hari Berturut-turut (Defisit >= 12 mm)
    forecast_dry = [
        {"date": "2026-11-09", "deficit_mm": 4.5, "rain_mm": 0.0},
        {"date": "2026-11-10", "deficit_mm": 4.8, "rain_mm": 0.0},
        {"date": "2026-11-11", "deficit_mm": 5.2, "rain_mm": 0.0},  # Kumulatif 14.5 mm
        {"date": "2026-11-12", "deficit_mm": 3.0, "rain_mm": 0.0},
    ]
    alerts_dry = build_alerts(forecast_dry)
    has_drought_alert = any(a["type"] == "kekeringan" for a in alerts_dry)
    log_test(
        "Peringatan",
        "Deteksi Dini Bahaya Kekeringan 3 Hari Kedepan",
        has_drought_alert,
        f"Pesan: {alerts_dry[0]['message'] if alerts_dry else 'None'}",
    )

    # 5.2 Deteksi Peringatan Bahaya Banjir / Hujan Badai Ekstrem (Rain >= 50 mm)
    forecast_storm = [
        {"date": "2026-11-09", "deficit_mm": 0.0, "rain_mm": 65.0},
    ]
    alerts_storm = build_alerts(forecast_storm)
    has_storm_alert = any(a["type"] == "hujan_ekstrem" for a in alerts_storm)
    log_test(
        "Peringatan",
        "Deteksi Cuaca Ekstrem Hujan Badai (>50 mm/hari)",
        has_storm_alert,
        f"Pesan: {alerts_storm[0]['message'] if alerts_storm else 'None'}",
    )


def test_water_and_cost_audit_engine():
    section("MODUL 6: ENGINE AUDIT EFISIENSI AIR & PENGHEMATAN BIAYA")
    from app.services.efficiency import calculate_irrigation_efficiency
    from app.models.plot import Plot, IrrigationLog

    dummy_plot = Plot(
        id=1,
        name="Sawah Karawang",
        crop="padi",
        planting_date=date(2026, 9, 22),
        irrigation_method="genangan",
        area_ha=1.0,
        centroid_lat=-6.3,
        centroid_lng=107.3,
        is_demo=True,
    )

    # Log penyiraman aktual petani (sedikit lebih boros dari rekomendasi)
    logs = [
        IrrigationLog(plot_id=1, log_date=date(2026, 11, 5), volume_m3=35.0, note="Pompa pagi"),
        IrrigationLog(plot_id=1, log_date=date(2026, 11, 7), volume_m3=30.0, note="Pompa rotasi"),
    ]

    weather_7days = [
        {"date": (date(2026, 11, 8) - timedelta(days=i)).isoformat(), "et0_mm": 4.5, "rain_mm": 0.0}
        for i in range(7)
    ]

    audit = calculate_irrigation_efficiency(
        plot=dummy_plot,
        weather=weather_7days,
        logs=logs,
        period_days=7,
        end_date=date(2026, 11, 8),
    )

    log_test(
        "Audit",
        "Kalkulasi Skor Kepatuhan & Efisiensi Irigasi (0-100)",
        0 <= audit["efficiency_score"] <= 100,
        f"Skor Audit: {audit['efficiency_score']}/100 | Status: {audit['status']}",
    )

    log_test(
        "Audit",
        "Rincian Harian Aktual vs Rekomendasi Defisit",
        len(audit["daily_breakdown"]) == 7,
        f"Total Aktual: {audit['total_actual_volume_m3']} m³ | Total Disarankan: {audit['total_recommended_volume_m3']} m³",
    )


def test_demo_plots_database_integrity():
    section("MODUL 7: INTEGRITAS 10 PETAK LAHAN DEMO DI SELURUH INDONESIA")
    from app.api.v1.demo import _demo_payloads

    demo_plots = _demo_payloads()

    # 7.1 Jumlah petak demo
    log_test(
        "Database",
        "Ketersediaan 10 Petak Lahan Pertanian Komprehensif",
        len(demo_plots) == 10,
        f"Ditemukan {len(demo_plots)} petak lahan demo terdaftar",
    )

    # 7.2 Diversitas Komoditas
    unique_crops = set(p.crop for p in demo_plots)
    expected_crops = {"padi", "cabai", "jagung", "bawang_merah"}
    log_test(
        "Database",
        "Cakupan 4 Komoditas Utama (Padi, Cabai, Jagung, Bawang)",
        expected_crops.issubset(unique_crops),
        f"Komoditas: {', '.join(unique_crops)}",
    )

    # 7.3 Validitas Koordinat Geografis (Poligon GeoJSON SRID 4326)
    valid_geoms = True
    for p in demo_plots:
        coords = p.geometry.get("coordinates", [[]])[0]
        if len(coords) < 4:
            valid_geoms = False
            break
        # Cek koordinat Indonesia: Lng 95..141, Lat -11..6
        lng, lat = coords[0][0], coords[0][1]
        if not (95.0 <= lng <= 141.0 and -11.0 <= lat <= 6.0):
            valid_geoms = False
            break

    log_test(
        "Database",
        "Integritas Geometri Poligon Hamparan & Koordinat Indonesia",
        valid_geoms,
        "Seluruh poligon tertutup valid dan berada di wilayah Indonesia",
    )


def test_frontend_routes_and_architecture():
    section("MODUL 8: VERIFIKASI ARSITEKTUR & 13 RUTE FRONTEND NEXT.JS")

    routes = [
        ("frontend/src/app/page.tsx", "Beranda / Dashboard Utama"),
        ("frontend/src/app/peta/page.tsx", "Peta Satelit GIS Interaktif"),
        ("frontend/src/app/rekomendasi/page.tsx", "Rekomendasi Irigasi Presisi"),
        ("frontend/src/app/peringatan/page.tsx", "Pusat Peringatan Dini 7 Hari"),
        ("frontend/src/app/audit/page.tsx", "Audit Efisiensi Air & Biaya"),
        ("frontend/src/app/lahan/page.tsx", "Katalog Lahan Pertanian"),
        ("frontend/src/app/lahan/[id]/page.tsx", "Detail & Peta Lahan Individual"),
        ("frontend/src/app/lahan/baru/page.tsx", "Pendaftaran & Gambar Poligon"),
        ("frontend/src/app/pengaturan/page.tsx", "Pengaturan & Konfigurasi Pompa"),
        ("frontend/src/components/map/MapView.tsx", "Komponen MapLibre GL GIS"),
        ("frontend/src/components/layout/AppShell.tsx", "Layout Edge-to-Edge Responsif"),
        ("frontend/src/components/layout/Sidebar.tsx", "Navigasi Menu Buttery Smooth"),
        ("frontend/public/maplibre-gl-worker.mjs", "Web Worker MapLibre GL"),
    ]

    all_exist = True
    base_dir = os.path.dirname(__file__)
    for rel_path, desc in routes:
        full_path = os.path.join(base_dir, rel_path)
        exists = os.path.isfile(full_path)
        if not exists:
            all_exist = False
        log_test("Frontend", f"{desc} ({os.path.basename(rel_path)})", exists)

    log_test("Frontend", "Seluruh File Rute & Komponen Kritis Lengkap", all_exist)


def main():
    print(f"\n{BOLD}=============================================================================={RESET}")
    print(f"{BOLD}{GREEN}  🌱 LAHANSENSE AUTOMATED TEST SUITE - HASIL PENGUJIAN SEMUA FITUR 🌱{RESET}")
    print(f"{BOLD}=============================================================================={RESET}")

    try:
        test_fao56_penman_monteith()
        test_crop_coefficients_and_stages()
        test_satellite_agriwatch_integration()
        test_water_balance_and_volume()
        test_early_warning_engine()
        test_water_and_cost_audit_engine()
        test_demo_plots_database_integrity()
        test_frontend_routes_and_architecture()
    except Exception as e:
        import traceback
        traceback.print_exc()
        print(f"\n{RED}Fatal Error saat pengujian: {e}{RESET}")
        sys.exit(1)

    section("RINGKASAN EKSEKUTIF PENGUJIAN")
    total_tests = pass_count + fail_count
    percentage = (pass_count / total_tests) * 100 if total_tests > 0 else 0

    print(f"  Total Pengujian Dijalankan : {BOLD}{total_tests}{RESET}")
    print(f"  Pengujian Berhasil         : {GREEN}{BOLD}{pass_count}{RESET}")
    print(f"  Pengujian Gagal            : {RED}{BOLD}{fail_count}{RESET}")
    print(f"  Tingkat Keberhasilan       : {GREEN if percentage == 100 else YELLOW}{BOLD}{percentage:.1f}%{RESET}")

    if fail_count == 0:
        print(f"\n{GREEN}{BOLD}  🎉 SELURUH FITUR LAHANSENSE LULUS UJI 100% DAN SIAP DIPRESENTASIKAN! 🎉{RESET}\n")
    else:
        print(f"\n{RED}{BOLD}  ⚠️ TERDAPAT {fail_count} PENGUJIAN YANG MEMERLUKAN PERHATIAN.{RESET}\n")


if __name__ == "__main__":
    main()
