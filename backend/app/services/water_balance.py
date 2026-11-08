from datetime import date

CROP_PARAMS: dict[str, dict[str, float]] = {
    # Nilai baseline FAO-56 (perlu diverifikasi & dikalibrasi lokal oleh tim Data)
    "padi": dict(kc_ini=1.05, kc_mid=1.20, kc_end=0.90, l_ini=30, l_dev=30, l_mid=60, l_late=30),
    "jagung": dict(kc_ini=0.30, kc_mid=1.20, kc_end=0.60, l_ini=20, l_dev=35, l_mid=40, l_late=30),
    "cabai": dict(kc_ini=0.60, kc_mid=1.05, kc_end=0.90, l_ini=30, l_dev=40, l_mid=110, l_late=30),
    "bawang_merah": dict(kc_ini=0.70, kc_mid=1.05, kc_end=0.75, l_ini=15, l_dev=25, l_mid=35, l_late=10),
}

# Efisiensi sistem irigasi (asumsi awal)
IRRIGATION_EFFICIENCY = {"genangan": 0.45, "alur": 0.60, "pompa": 0.65, "tetes": 0.90}

DEFAULT_PUMP_LPS = 8.0  # debit pompa (L/detik)
EFFECTIVE_RAIN_FACTOR = 0.8


def kc_by_stage(crop: str, dap: int) -> float:
    """Kc berdasarkan hari setelah tanam (dap), interpolasi linear antar fase."""
    p = CROP_PARAMS[crop]
    d_ini = p["l_ini"]
    d_dev = d_ini + p["l_dev"]
    d_mid = d_dev + p["l_mid"]
    d_late = d_mid + p["l_late"]
    if dap <= d_ini:
        return p["kc_ini"]
    if dap <= d_dev:
        return p["kc_ini"] + (dap - d_ini) / p["l_dev"] * (p["kc_mid"] - p["kc_ini"])
    if dap <= d_mid:
        return p["kc_mid"]
    if dap <= d_late:
        return p["kc_mid"] + (dap - d_mid) / p["l_late"] * (p["kc_end"] - p["kc_mid"])
    return p["kc_end"]


def kc_from_ndvi(ndvi: float) -> float:
    """Kc dari NDVI (regresi linear umum; TODO: kalibrasi per komoditas)."""
    return max(0.2, min(1.3, 1.457 * ndvi - 0.1725))


def blended_kc(crop: str, dap: int, ndvi: float | None) -> float:
    kc_stage = kc_by_stage(crop, dap)
    if ndvi is None:
        return kc_stage
    return 0.5 * kc_stage + 0.5 * kc_from_ndvi(ndvi)


def classify(deficit_mm: float) -> str:
    if deficit_mm < 2:
        return "aman"
    if deficit_mm < 5:
        return "waspada"
    return "kritis"


def irrigation_volume_m3(deficit_mm: float, area_ha: float, method: str) -> float:
    eff = IRRIGATION_EFFICIENCY.get(method, 0.6)
    return deficit_mm * area_ha * 10 / eff


def pump_minutes(volume_m3: float, flow_lps: float = DEFAULT_PUMP_LPS) -> int | None:
    if volume_m3 <= 0 or flow_lps <= 0:
        return None
    return round(volume_m3 * 1000 / flow_lps / 60)


def compute_day(
    *,
    crop: str,
    planting_date: date,
    method: str,
    area_ha: float,
    target: date,
    et0_mm: float,
    rain_mm: float,
    ndvi: float | None = None,
    ndvi_cloud: float | None = None,
    soil_contrib_mm: float = 0.0,
) -> dict:
    dap = max(0, (target - planting_date).days)
    kc = blended_kc(crop, dap, ndvi)
    etc = kc * et0_mm
    eff_rain = EFFECTIVE_RAIN_FACTOR * rain_mm
    deficit = max(0.0, etc - eff_rain - soil_contrib_mm)
    volume = irrigation_volume_m3(deficit, area_ha, method)
    status = classify(deficit)

    if ndvi is None:
        confidence = "rendah"
    else:
        confidence = "tinggi" if (ndvi_cloud or 0) < 30 else "sedang"

    reason = (
        f"Hari ke-{dap} setelah tanam. Kebutuhan air {etc:.1f} mm, "
        f"hujan efektif {eff_rain:.1f} mm, defisit {deficit:.1f} mm."
    )
    return {
        "date": target.isoformat(),
        "et0_mm": round(et0_mm, 2),
        "kc": round(kc, 3),
        "etc_mm": round(etc, 2),
        "effective_rain_mm": round(eff_rain, 2),
        "deficit_mm": round(deficit, 2),
        "irrigation_volume_m3": round(volume, 1),
        "pump_minutes": pump_minutes(volume),
        "status": status,
        "reason": reason,
        "confidence": confidence,
    }
