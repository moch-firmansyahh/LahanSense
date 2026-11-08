from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.api.v1.plots import get_plot_or_404
from app.schemas.analytics import AlertOut, ForecastDay, RecommendationOut
from app.services.alerts import build_alerts, build_forecast
from app.services.water_balance import compute_day
from app.services.weather import fetch_daily_weather

router = APIRouter()


@router.get("/{plot_id}/recommendation", response_model=RecommendationOut)
def recommendation(
    plot_id: int,
    target: date | None = Query(None, alias="date"),
    db: Session = Depends(get_db),
):
    plot = get_plot_or_404(db, plot_id)
    target = target or date.today()
    weather = fetch_daily_weather(plot.centroid_lat, plot.centroid_lng)
    day = next((w for w in weather if w["date"] == target.isoformat()), None)
    if day is None:
        raise HTTPException(404, detail="Data cuaca untuk tanggal tersebut tidak tersedia")

    # TODO (feature/data-ndvi-pipeline): ganti None dengan NDVI terbaru dari database
    result = compute_day(
        crop=plot.crop,
        planting_date=plot.planting_date,
        method=plot.irrigation_method,
        area_ha=float(plot.area_ha),
        target=target,
        et0_mm=day["et0_mm"],
        rain_mm=day["rain_mm"],
        ndvi=None,
    )
    return {"plot_id": plot.id, **result}


@router.get("/{plot_id}/forecast", response_model=list[ForecastDay])
def forecast(plot_id: int, db: Session = Depends(get_db)):
    plot = get_plot_or_404(db, plot_id)
    weather = fetch_daily_weather(plot.centroid_lat, plot.centroid_lng)
    return build_forecast(plot, weather, date.today())


@router.get("/{plot_id}/alerts", response_model=list[AlertOut])
def alerts(plot_id: int, db: Session = Depends(get_db)):
    plot = get_plot_or_404(db, plot_id)
    weather = fetch_daily_weather(plot.centroid_lat, plot.centroid_lng)
    return build_alerts(build_forecast(plot, weather, date.today()))


@router.get("/{plot_id}/ndvi")
def ndvi(plot_id: int, db: Session = Depends(get_db)):
    get_plot_or_404(db, plot_id)
    # TODO (feature/data-ndvi-pipeline)
    return {"plot_id": plot_id, "latest": None, "history": []}
