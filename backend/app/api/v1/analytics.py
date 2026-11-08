from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.api.v1.plots import get_plot_or_404
from app.models.plot import NdviObservation
from app.schemas.analytics import AlertOut, ForecastDay, NdviHistoryOut, NdviObservationOut, RecommendationOut
from app.services.alerts import build_alerts, build_forecast
from app.services.satellite import get_or_create_ndvi_for_plot
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

    # Tarik atau generate observasi NDVI Sentinel-2 terbaru
    ndvi_obs = get_or_create_ndvi_for_plot(db, plot, target)
    ndvi_val = float(ndvi_obs.ndvi_mean) if ndvi_obs and ndvi_obs.ndvi_mean is not None else None
    ndvi_cloud = float(ndvi_obs.cloud_cover) if ndvi_obs and ndvi_obs.cloud_cover is not None else None

    result = compute_day(
        crop=plot.crop,
        planting_date=plot.planting_date,
        method=plot.irrigation_method,
        area_ha=float(plot.area_ha),
        target=target,
        et0_mm=day["et0_mm"],
        rain_mm=day["rain_mm"],
        ndvi=ndvi_val,
        ndvi_cloud=ndvi_cloud,
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


@router.get("/{plot_id}/ndvi", response_model=NdviHistoryOut)
def ndvi(plot_id: int, db: Session = Depends(get_db)):
    plot = get_plot_or_404(db, plot_id)
    # Pastikan data observasi NDVI terbaru tersedia
    get_or_create_ndvi_for_plot(db, plot, date.today())

    records = (
        db.query(NdviObservation)
        .filter(NdviObservation.plot_id == plot.id)
        .order_by(NdviObservation.obs_date.desc())
        .all()
    )

    obs_out = [
        NdviObservationOut(
            id=r.id,
            plot_id=r.plot_id,
            obs_date=r.obs_date.isoformat(),
            ndvi_mean=float(r.ndvi_mean or 0.0),
            cloud_cover=float(r.cloud_cover) if r.cloud_cover is not None else None,
            source=r.source or "sentinel-2",
        )
        for r in records
    ]

    latest = obs_out[0] if obs_out else None
    confidence = "tinggi" if latest and (latest.cloud_cover or 0) < 30 else "sedang"
    veg_status = "Kanopi Sehat / Rimbun" if latest and latest.ndvi_mean >= 0.6 else "Vegetasi Sedang"

    return NdviHistoryOut(
        plot_id=plot.id,
        latest_ndvi=latest.ndvi_mean if latest else None,
        latest_date=latest.obs_date if latest else None,
        confidence=confidence,
        vegetation_status=veg_status,
        observations=obs_out,
    )
