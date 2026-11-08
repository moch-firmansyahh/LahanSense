import math


def _svp(t: float) -> float:
    """Tekanan uap jenuh (kPa)."""
    return 0.6108 * math.exp(17.27 * t / (t + 237.3))


def et0_penman_monteith(
    t_max: float,
    t_min: float,
    rh_mean: float,
    wind_2m: float,
    solar_rad_mj: float,
    lat_deg: float,
    doy: int,
    elevation_m: float = 0.0,
) -> float:
    """ET0 harian (mm/hari) metode FAO-56.

    solar_rad_mj dalam MJ/m2/hari, wind_2m dalam m/s pada ketinggian 2 m.
    """
    t_mean = (t_max + t_min) / 2
    pressure = 101.3 * ((293 - 0.0065 * elevation_m) / 293) ** 5.26
    gamma = 0.000665 * pressure
    delta = 4098 * _svp(t_mean) / (t_mean + 237.3) ** 2
    es = (_svp(t_max) + _svp(t_min)) / 2
    ea = es * rh_mean / 100

    phi = math.radians(lat_deg)
    dr = 1 + 0.033 * math.cos(2 * math.pi / 365 * doy)
    sd = 0.409 * math.sin(2 * math.pi / 365 * doy - 1.39)
    ws = math.acos(max(-1.0, min(1.0, -math.tan(phi) * math.tan(sd))))
    ra = (
        (24 * 60 / math.pi)
        * 0.0820
        * dr
        * (ws * math.sin(phi) * math.sin(sd) + math.cos(phi) * math.cos(sd) * math.sin(ws))
    )
    rso = (0.75 + 2e-5 * elevation_m) * ra
    rns = 0.77 * solar_rad_mj
    ratio = min(solar_rad_mj / rso, 1.0) if rso > 0 else 0.5
    rnl = (
        4.903e-9
        * (((t_max + 273.16) ** 4 + (t_min + 273.16) ** 4) / 2)
        * (0.34 - 0.14 * math.sqrt(ea))
        * (1.35 * ratio - 0.35)
    )
    rn = rns - rnl

    et0 = (0.408 * delta * rn + gamma * 900 / (t_mean + 273) * wind_2m * (es - ea)) / (
        delta + gamma * (1 + 0.34 * wind_2m)
    )
    return max(0.0, et0)
