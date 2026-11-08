from datetime import date, timedelta
from typing import Any

from app.models.plot import IrrigationLog, Plot
from app.services.water_balance import compute_day


def calculate_irrigation_efficiency(
    plot: Plot,
    weather: list[dict[str, Any]],
    logs: list[IrrigationLog],
    period_days: int = 7,
    end_date: date | None = None,
) -> dict[str, Any]:
    """
    Menghitung audit efisiensi irigasi (skor 0-100) berbasis perbandingan
    volume penyiraman aktual vs rekomendasi defisit air evapotranspirasi (FAO-56).
    """
    end_date = end_date or date.today()
    start_date = end_date - timedelta(days=period_days - 1)

    # Petakan log aktual berdasarkan tanggal
    actual_by_date: dict[str, float] = {}
    for log in logs:
        d_str = log.log_date.isoformat() if isinstance(log.log_date, date) else str(log.log_date)
        actual_by_date[d_str] = actual_by_date.get(d_str, 0.0) + float(log.volume_m3)

    daily_breakdown: list[dict[str, Any]] = []
    total_actual = 0.0
    total_recommended = 0.0

    # Buat lookup data cuaca harian
    weather_by_date = {w["date"]: w for w in weather}

    for i in range(period_days):
        cur_date = start_date + timedelta(days=i)
        d_str = cur_date.isoformat()
        w = weather_by_date.get(d_str)

        et0 = w["et0_mm"] if w else 4.0
        rain = w["rain_mm"] if w else 0.0

        rec_day = compute_day(
            crop=plot.crop,
            planting_date=plot.planting_date,
            method=plot.irrigation_method,
            area_ha=float(plot.area_ha),
            target=cur_date,
            et0_mm=et0,
            rain_mm=rain,
        )

        rec_m3 = round(rec_day["irrigation_volume_m3"], 2)
        act_m3 = round(actual_by_date.get(d_str, 0.0), 2)
        diff_m3 = round(act_m3 - rec_m3, 2)

        total_actual += act_m3
        total_recommended += rec_m3

        daily_breakdown.append(
            {
                "date": d_str,
                "actual_m3": act_m3,
                "recommended_m3": rec_m3,
                "deficit_mm": rec_day["deficit_mm"],
                "difference_m3": diff_m3,
            }
        )

    has_logs = len(logs) > 0 or total_actual > 0

    if not has_logs:
        return {
            "plot_id": plot.id,
            "period_days": period_days,
            "total_actual_volume_m3": 0.0,
            "total_recommended_volume_m3": round(total_recommended, 2),
            "water_savings_m3": 0.0,
            "efficiency_score": 100.0,
            "status": "no_data",
            "insight": "Belum ada catatan log penyiraman untuk lahan ini. Catat penyiraman aktual untuk melihat analisis efisiensi.",
            "daily_breakdown": daily_breakdown,
        }

    water_savings = round(total_recommended - total_actual, 2)

    # Perhitungan rasio dan skor efisiensi (0-100)
    if total_recommended <= 0.01:
        # Jika rekomendasi 0 (musim hujan lebat)
        if total_actual <= 0.01:
            score = 100.0
            status = "optimal"
            insight = "Sangat efisien! Tidak ada penyiraman saat curah hujan mencukupi kebutuhan tanaman."
        else:
            score = max(0.0, round(100.0 - (total_actual * 5.0), 1))
            status = "over_irrigated"
            insight = f"Terjadi penyiraman {total_actual:.1f} m³ saat kebutuhan air alami sudah tercukupi hujan."
    else:
        ratio = total_actual / total_recommended
        if 0.85 <= ratio <= 1.15:
            deviation = abs(ratio - 1.0)
            score = max(0.0, min(100.0, round(100.0 - (deviation * 50.0), 1)))
            status = "optimal"
            insight = (
                f"Irigasi optimal ({score:.0f}%). Volume aktual ({total_actual:.1f} m³) "
                f"sangat selaras dengan kebutuhan evapotranspirasi ({total_recommended:.1f} m³)."
            )
        elif ratio > 1.15:
            excess_pct = round((ratio - 1.0) * 100, 1)
            score = max(0.0, round(100.0 - (ratio - 1.0) * 60.0, 1))
            status = "over_irrigated"
            insight = (
                f"Terjadi over-irigasi sebesar {excess_pct}% di atas rekomendasi. "
                "Kurangi durasi pompa untuk mencegah pencucian nutrisi tanah dan hemat energi."
            )
        else:
            under_pct = round((1.0 - ratio) * 100, 1)
            score = max(0.0, round(100.0 - (1.0 - ratio) * 60.0, 1))
            status = "under_irrigated"
            insight = (
                f"Pemberian air kurang {under_pct}% dari kebutuhan defisit tanaman. "
                "Waspadai penurunan laju pertumbuhan atau stres kekeringan."
            )

    return {
        "plot_id": plot.id,
        "period_days": period_days,
        "total_actual_volume_m3": round(total_actual, 2),
        "total_recommended_volume_m3": round(total_recommended, 2),
        "water_savings_m3": water_savings,
        "efficiency_score": score,
        "status": status,
        "insight": insight,
        "daily_breakdown": daily_breakdown,
    }
