from app.services.et0 import et0_penman_monteith


def test_fao56_example():
    # Contoh FAO-56 (Brussels, 6 Juli): acuan sekitar 3,9 mm/hari
    et0 = et0_penman_monteith(
        t_max=21.5,
        t_min=12.3,
        rh_mean=73.5,
        wind_2m=2.078,
        solar_rad_mj=22.07,
        lat_deg=50.8,
        doy=187,
        elevation_m=100,
    )
    assert abs(et0 - 3.9) < 0.3


def test_et0_never_negative():
    assert et0_penman_monteith(15, 10, 95, 0.5, 2.0, -6.9, 10) >= 0
