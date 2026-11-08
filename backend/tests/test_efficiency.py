from datetime import date, timedelta

from app.models.plot import IrrigationLog, Plot
from app.services.efficiency import calculate_irrigation_efficiency


def _mock_plot():
    return Plot(
        id=1,
        name="Sawah Test",
        crop="padi",
        planting_date=date.today() - timedelta(days=40),
        irrigation_method="genangan",
        area_ha=1.0,
        centroid_lat=-6.3,
        centroid_lng=107.3,
    )


def test_efficiency_no_data():
    plot = _mock_plot()
    today = date.today()
    weather = [{"date": (today - timedelta(days=i)).isoformat(), "et0_mm": 4.0, "rain_mm": 0.0} for i in range(7)]
    res = calculate_irrigation_efficiency(plot, weather, logs=[], period_days=7)
    assert res["status"] == "no_data"
    assert res["total_actual_volume_m3"] == 0.0
    assert res["total_recommended_volume_m3"] > 0
    assert len(res["daily_breakdown"]) == 7


def test_efficiency_optimal():
    plot = _mock_plot()
    today = date.today()
    weather = [{"date": (today - timedelta(days=i)).isoformat(), "et0_mm": 4.0, "rain_mm": 0.0} for i in range(7)]
    # First get recommended volume
    baseline = calculate_irrigation_efficiency(plot, weather, logs=[], period_days=7)
    rec_total = baseline["total_recommended_volume_m3"]

    # Provide logs very close to recommended (e.g. 98% of rec)
    logs = [
        IrrigationLog(
            id=10,
            plot_id=1,
            log_date=today - timedelta(days=3),
            volume_m3=round(rec_total * 0.98, 2),
            note="Penyiraman teratur",
        )
    ]
    res = calculate_irrigation_efficiency(plot, weather, logs=logs, period_days=7)
    assert res["status"] == "optimal"
    assert res["efficiency_score"] >= 90.0
    assert "optimal" in res["insight"].lower()


def test_efficiency_over_irrigated():
    plot = _mock_plot()
    today = date.today()
    weather = [{"date": (today - timedelta(days=i)).isoformat(), "et0_mm": 4.0, "rain_mm": 0.0} for i in range(7)]
    baseline = calculate_irrigation_efficiency(plot, weather, logs=[], period_days=7)
    rec_total = baseline["total_recommended_volume_m3"]

    # Berikan 200% dari rekomendasi
    logs = [
        IrrigationLog(
            id=11,
            plot_id=1,
            log_date=today - timedelta(days=2),
            volume_m3=round(rec_total * 2.0, 2),
            note="Penyiraman berlebih",
        )
    ]
    res = calculate_irrigation_efficiency(plot, weather, logs=logs, period_days=7)
    assert res["status"] == "over_irrigated"
    assert res["efficiency_score"] < 70.0
    assert "over-irigasi" in res["insight"].lower()


def test_efficiency_under_irrigated():
    plot = _mock_plot()
    today = date.today()
    weather = [{"date": (today - timedelta(days=i)).isoformat(), "et0_mm": 4.0, "rain_mm": 0.0} for i in range(7)]
    baseline = calculate_irrigation_efficiency(plot, weather, logs=[], period_days=7)
    rec_total = baseline["total_recommended_volume_m3"]

    # Berikan hanya 30% dari rekomendasi
    logs = [
        IrrigationLog(
            id=12,
            plot_id=1,
            log_date=today - timedelta(days=2),
            volume_m3=round(rec_total * 0.3, 2),
            note="Irigasi terbatas",
        )
    ]
    res = calculate_irrigation_efficiency(plot, weather, logs=logs, period_days=7)
    assert res["status"] == "under_irrigated"
    assert res["efficiency_score"] < 70.0
    assert "kurang" in res["insight"].lower()


def test_efficiency_rainy_season():
    plot = _mock_plot()
    today = date.today()
    # Hujan deras setiap hari sehingga rekomendasi 0
    weather = [{"date": (today - timedelta(days=i)).isoformat(), "et0_mm": 3.0, "rain_mm": 50.0} for i in range(7)]
    # Tanpa penyiraman aktual -> optimal 100
    res_no_pump = calculate_irrigation_efficiency(
        plot,
        weather,
        logs=[IrrigationLog(id=1, plot_id=1, log_date=today - timedelta(days=1), volume_m3=0.0)],
        period_days=7,
    )
    assert res_no_pump["status"] == "optimal"
    assert res_no_pump["efficiency_score"] == 100.0
