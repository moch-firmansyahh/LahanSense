from datetime import date, timedelta

from app.services.water_balance import classify, compute_day, irrigation_volume_m3, kc_by_stage


def test_kc_stage_bounds():
    assert kc_by_stage("padi", 0) == 1.05
    assert kc_by_stage("padi", 80) == 1.20
    assert kc_by_stage("padi", 500) == 0.90


def test_volume_formula():
    # 3,2 mm x 1 ha x 10 / 0,45 = ~71 m3
    assert round(irrigation_volume_m3(3.2, 1.0, "genangan"), 1) == 71.1


def test_rain_removes_deficit():
    r = compute_day(
        crop="padi",
        planting_date=date.today() - timedelta(days=40),
        method="genangan",
        area_ha=1.0,
        target=date.today(),
        et0_mm=4.0,
        rain_mm=30.0,
    )
    assert r["deficit_mm"] == 0
    assert r["status"] == "aman"
    assert r["irrigation_volume_m3"] == 0


def test_classify():
    assert classify(1) == "aman"
    assert classify(3) == "waspada"
    assert classify(8) == "kritis"
