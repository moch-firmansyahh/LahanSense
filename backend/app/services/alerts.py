from datetime import date

from app.services.water_balance import compute_day

DROUGHT_3DAY_MM = 12.0
EXTREME_RAIN_MM = 50.0


def build_forecast(plot, weather: list[dict], start: date) -> list[dict]:
    out = []
    for w in weather:
        if w["date"] < start.isoformat():
            continue
        day = compute_day(
            crop=plot.crop,
            planting_date=plot.planting_date,
            method=plot.irrigation_method,
            area_ha=float(plot.area_ha),
            target=date.fromisoformat(w["date"]),
            et0_mm=w["et0_mm"],
            rain_mm=w["rain_mm"],
        )
        out.append({**day, "rain_mm": w["rain_mm"]})
        if len(out) == 7:
            break
    return out


def build_alerts(forecast: list[dict]) -> list[dict]:
    alerts: list[dict] = []
    for i in range(len(forecast)):
        window = forecast[i : i + 3]
        cum = sum(d["deficit_mm"] for d in window)
        if len(window) == 3 and cum >= DROUGHT_3DAY_MM:
            severity = "kritis" if cum >= 2 * DROUGHT_3DAY_MM else "waspada"
            alerts.append(
                {
                    "type": "kekeringan",
                    "severity": severity,
                    "date": forecast[i]["date"],
                    "message": f"Defisit air kumulatif {cum:.1f} mm dalam 3 hari sejak {forecast[i]['date']}.",
                    "suggested_action": "Majukan jadwal irigasi dan hindari pemupukan hingga defisit mereda.",
                }
            )
            break  # satu alert kekeringan (yang paling awal) cukup
    for d in forecast:
        if d["rain_mm"] >= EXTREME_RAIN_MM:
            alerts.append(
                {
                    "type": "hujan_ekstrem",
                    "severity": "waspada",
                    "date": d["date"],
                    "message": f"Prakiraan hujan {d['rain_mm']:.0f} mm pada {d['date']}.",
                    "suggested_action": "Periksa saluran drainase dan tunda irigasi serta pemupukan.",
                }
            )
    return alerts
