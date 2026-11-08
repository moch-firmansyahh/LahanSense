import math
import time
from datetime import date, timedelta

import httpx

from app.core.config import get_settings

_TTL_SECONDS = 3 * 3600
_CACHE: dict[tuple, tuple[float, list[dict]]] = {}


def _synthetic(past_days: int, forecast_days: int, lat: float = -6.2, lng: float = 107.3) -> list[dict]:
    """Data cuaca sintetis realistis berdasarkan koordinat mikroiklim dan elevasi regional."""
    # Deteksi iklim dataran tinggi (Lembang, Pangalengan, Malang) vs pesisir panas (Brebes, Jakarta, Karawang) vs karst (Gunungkidul)
    is_highland = (-7.25 <= lat <= -6.75 and 107.5 <= lng <= 107.7) or (-8.25 <= lat <= -7.95 and 112.4 <= lng <= 112.9)
    is_karst = -8.1 <= lat <= -7.8 and 110.4 <= lng <= 110.8
    is_coastal = lat >= -6.95 and (lng <= 107.0 or (108.8 <= lng <= 109.2))

    if is_highland:
        base_t_max = 23.5
        base_t_min = 16.5
        base_et0 = 3.2
    elif is_karst:
        base_t_max = 33.0
        base_t_min = 23.0
        base_et0 = 5.2
    elif is_coastal:
        base_t_max = 34.5
        base_t_min = 25.5
        base_et0 = 5.0
    else:
        # Standar dataran rendah tropis (Karawang, Subang, dsb)
        base_t_max = 31.5
        base_t_min = 24.0
        base_et0 = 4.4

    rows = []
    today = date.today()
    for i in range(-past_days, forecast_days):
        d = today + timedelta(days=i)
        rain = 18.0 if i in (3, 4) else (6.0 if i == -2 else 0.0)
        rows.append(
            {
                "date": d.isoformat(),
                "t_max": round(base_t_max + 0.6 * math.sin(i), 1),
                "t_min": round(base_t_min + 0.4 * math.cos(i), 1),
                "rain_mm": rain,
                "et0_mm": round(base_et0 + 0.3 * math.sin(i), 2),
            }
        )
    return rows


def fetch_daily_weather(lat: float, lng: float, past_days: int = 7, forecast_days: int = 8) -> list[dict]:
    settings = get_settings()
    key = (round(lat, 2), round(lng, 2), past_days, forecast_days)
    now = time.time()
    hit = _CACHE.get(key)
    if hit and now - hit[0] < _TTL_SECONDS:
        return hit[1]

    params = {
        "latitude": lat,
        "longitude": lng,
        "daily": "temperature_2m_max,temperature_2m_min,precipitation_sum,et0_fao_evapotranspiration",
        "past_days": past_days,
        "forecast_days": forecast_days,
        "timezone": "Asia/Jakarta",
    }
    try:
        r = httpx.get(f"{settings.open_meteo_base_url}/forecast", params=params, timeout=20)
        r.raise_for_status()
        d = r.json()["daily"]
        rows = [
            {
                "date": d["time"][i],
                "t_max": d["temperature_2m_max"][i],
                "t_min": d["temperature_2m_min"][i],
                "rain_mm": d["precipitation_sum"][i] or 0.0,
                "et0_mm": d["et0_fao_evapotranspiration"][i] or 0.0,
            }
            for i in range(len(d["time"]))
        ]
    except Exception:
        if settings.demo_mode:
            rows = _synthetic(past_days, forecast_days, lat=lat, lng=lng)
        else:
            raise
    _CACHE[key] = (now, rows)
    return rows
