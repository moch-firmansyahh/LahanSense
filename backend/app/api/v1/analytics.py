from datetime import date, timedelta

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.api.v1.plots import get_plot_or_404
from app.models.plot import IrrigationLog, NdviObservation
from app.schemas.analytics import (
    AlertOut,
    EfficiencyOut,
    ForecastDay,
    IrrigationLogCreate,
    IrrigationLogOut,
    NdviHistoryOut,
    NdviObservationOut,
    RecommendationOut,
)
from app.services.alerts import build_alerts, build_forecast
from app.services.efficiency import calculate_irrigation_efficiency
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


# --- Irrigation Log Endpoints ---


@router.post("/{plot_id}/irrigation-log", response_model=IrrigationLogOut, status_code=status.HTTP_201_CREATED)
def create_irrigation_log(
    plot_id: int,
    payload: IrrigationLogCreate,
    db: Session = Depends(get_db),
):
    plot = get_plot_or_404(db, plot_id)
    try:
        parsed_date = date.fromisoformat(payload.log_date)
    except ValueError:
        raise HTTPException(422, detail="Format tanggal harus YYYY-MM-DD")

    log_entry = IrrigationLog(
        plot_id=plot.id,
        log_date=parsed_date,
        volume_m3=payload.volume_m3,
        note=payload.note,
    )
    db.add(log_entry)
    db.commit()
    db.refresh(log_entry)

    return IrrigationLogOut(
        id=log_entry.id,
        plot_id=log_entry.plot_id,
        log_date=log_entry.log_date.isoformat(),
        volume_m3=float(log_entry.volume_m3),
        note=log_entry.note,
    )


@router.get("/{plot_id}/irrigation-logs", response_model=list[IrrigationLogOut])
def list_irrigation_logs(
    plot_id: int,
    limit: int = Query(30, ge=1, le=100),
    db: Session = Depends(get_db),
):
    plot = get_plot_or_404(db, plot_id)
    records = (
        db.query(IrrigationLog)
        .filter(IrrigationLog.plot_id == plot.id)
        .order_by(IrrigationLog.log_date.desc(), IrrigationLog.id.desc())
        .limit(limit)
        .all()
    )

    return [
        IrrigationLogOut(
            id=r.id,
            plot_id=r.plot_id,
            log_date=r.log_date.isoformat(),
            volume_m3=float(r.volume_m3),
            note=r.note,
        )
        for r in records
    ]


@router.delete("/{plot_id}/irrigation-logs/{log_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_irrigation_log(
    plot_id: int,
    log_id: int,
    db: Session = Depends(get_db),
):
    get_plot_or_404(db, plot_id)
    log_entry = db.get(IrrigationLog, log_id)
    if not log_entry or log_entry.plot_id != plot_id:
        raise HTTPException(404, detail="Log irigasi tidak ditemukan")

    db.delete(log_entry)
    db.commit()
    return None


# --- Irrigation Efficiency Audit ---


@router.get("/{plot_id}/efficiency", response_model=EfficiencyOut)
def efficiency(
    plot_id: int,
    days: int = Query(7, ge=1, le=30, description="Rentang evaluasi hari"),
    db: Session = Depends(get_db),
):
    plot = get_plot_or_404(db, plot_id)
    weather = fetch_daily_weather(plot.centroid_lat, plot.centroid_lng, past_days=days + 1, forecast_days=1)

    start_date = date.today() - timedelta(days=days - 1)
    logs = (
        db.query(IrrigationLog)
        .filter(
            IrrigationLog.plot_id == plot.id,
            IrrigationLog.log_date >= start_date,
            IrrigationLog.log_date <= date.today(),
        )
        .all()
    )

    result = calculate_irrigation_efficiency(
        plot=plot,
        weather=weather,
        logs=logs,
        period_days=days,
        end_date=date.today(),
    )
    return result
