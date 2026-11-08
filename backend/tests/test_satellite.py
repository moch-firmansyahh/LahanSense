from datetime import date
from app.services.satellite import get_latest_ndvi
from app.services.water_balance import compute_day, blended_kc, kc_from_ndvi


def test_get_latest_ndvi_structure():
    geom = {
        "type": "Polygon",
        "coordinates": [
            [
                [107.30, -6.30],
                [107.31, -6.30],
                [107.31, -6.31],
                [107.30, -6.31],
                [107.30, -6.30]
            ]
        ]
    }
    res = get_latest_ndvi(geom, around=date.today())
    assert isinstance(res, dict)
    assert "obs_date" in res
    assert "ndvi_mean" in res
    assert "cloud_cover" in res
    assert 0.0 <= res["ndvi_mean"] <= 1.0
    assert 0.0 <= res["cloud_cover"] <= 100.0


def test_ndvi_impact_on_confidence_and_kc():
    # Tanpa NDVI -> confidence rendah
    r_no_ndvi = compute_day(
        crop="padi",
        planting_date=date(2026, 10, 1),
        method="genangan",
        area_ha=1.0,
        target=date(2026, 11, 8),
        et0_mm=5.0,
        rain_mm=0.0,
        ndvi=None,
    )
    assert r_no_ndvi["confidence"] == "rendah"

    # Dengan NDVI bersih (awan 10%) -> confidence tinggi
    r_with_ndvi = compute_day(
        crop="padi",
        planting_date=date(2026, 10, 1),
        method="genangan",
        area_ha=1.0,
        target=date(2026, 11, 8),
        et0_mm=5.0,
        rain_mm=0.0,
        ndvi=0.72,
        ndvi_cloud=10.0,
    )
    assert r_with_ndvi["confidence"] == "tinggi"
    # Nilai Kc terkalibrasi dengan NDVI
    assert r_with_ndvi["kc"] > 0.5
