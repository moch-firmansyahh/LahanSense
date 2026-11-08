from typing import Literal

from pydantic import BaseModel, Field

Status = Literal["aman", "waspada", "kritis"]
Confidence = Literal["rendah", "sedang", "tinggi"]
EfficiencyStatus = Literal["optimal", "over_irrigated", "under_irrigated", "no_data"]


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


# --- Irrigation Log & Efficiency ---


class IrrigationLogCreate(BaseModel):
    log_date: str  # YYYY-MM-DD
    volume_m3: float = Field(gt=0, description="Volume air aktual dalam meter kubik")
    note: str | None = None


class IrrigationLogOut(BaseModel):
    id: int
    plot_id: int
    log_date: str
    volume_m3: float
    note: str | None = None


class DailyEfficiencyItem(BaseModel):
    date: str
    actual_m3: float
    recommended_m3: float
    deficit_mm: float
    difference_m3: float


class EfficiencyOut(BaseModel):
    plot_id: int
    period_days: int
    total_actual_volume_m3: float
    total_recommended_volume_m3: float
    water_savings_m3: float
    efficiency_score: float
    status: EfficiencyStatus
    insight: str
    daily_breakdown: list[DailyEfficiencyItem]
