from typing import Literal

from pydantic import BaseModel

Status = Literal["aman", "waspada", "kritis"]
Confidence = Literal["rendah", "sedang", "tinggi"]


class RecommendationOut(BaseModel):
    plot_id: int
    date: str
    et0_mm: float
    kc: float
    etc_mm: float
    effective_rain_mm: float
    deficit_mm: float
    irrigation_volume_m3: float
    pump_minutes: int | None
    status: Status
    reason: str
    confidence: Confidence


class ForecastDay(BaseModel):
    date: str
    et0_mm: float
    rain_mm: float
    deficit_mm: float
    irrigation_volume_m3: float
    status: Status


class AlertOut(BaseModel):
    type: Literal["kekeringan", "hujan_ekstrem", "anomali_ndvi"]
    severity: Literal["info", "waspada", "kritis"]
    date: str
    message: str
    suggested_action: str


class NdviObservationOut(BaseModel):
    id: int | None = None
    plot_id: int
    obs_date: str
    ndvi_mean: float
    cloud_cover: float | None
    source: str


class NdviHistoryOut(BaseModel):
    plot_id: int
    latest_ndvi: float | None
    latest_date: str | None
    confidence: Confidence
    vegetation_status: str
    observations: list[NdviObservationOut]

