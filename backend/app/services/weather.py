import math
import time
from datetime import date, timedelta

import httpx

from app.core.config import get_settings

_TTL_SECONDS = 3 * 3600
_CACHE: dict[tuple, tuple[float, list[dict]]] = {}


def _synthetic(past_days: int, forecast_days: int) -> list[dict]:
    """Data cuaca sintetis untuk mode demo saat API tidak tersedia."""
    rows = []
    today = date.today()
    for i in range(-past_days, forecast_days):
        d = today + timedelta(days=i)
        rain = 18.0 if i in (3, 4) else (6.0 if i == -2 else 0.0)
        rows.append(
            {
                "date": d.isoformat(),
                "t_max": 32.0,
                "t_min": 22.0,
                "rain_mm": rain,
                "et0_mm": round(4.0 + 0.4 * math.sin(i), 2),
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
            rows = _synthetic(past_days, forecast_days)
        else:
            raise
    _CACHE[key] = (now, rows)
    return rows
