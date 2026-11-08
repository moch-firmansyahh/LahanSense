from datetime import date, datetime
from typing import Any

from geoalchemy2 import Geometry
from sqlalchemy import Boolean, Date, DateTime, ForeignKey, Numeric, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class Plot(Base):
    __tablename__ = "plots"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(120))
    crop: Mapped[str] = mapped_column(String(30))
    planting_date: Mapped[date] = mapped_column(Date)
    irrigation_method: Mapped[str] = mapped_column(String(20))
    area_ha: Mapped[float] = mapped_column(Numeric(10, 4))
    centroid_lat: Mapped[float]
    centroid_lng: Mapped[float]
    geom: Mapped[Any] = mapped_column(Geometry("POLYGON", srid=4326))
    is_demo: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class NdviObservation(Base):
    __tablename__ = "ndvi_observations"

    id: Mapped[int] = mapped_column(primary_key=True)
    plot_id: Mapped[int] = mapped_column(ForeignKey("plots.id", ondelete="CASCADE"))
    obs_date: Mapped[date] = mapped_column(Date)
    ndvi_mean: Mapped[float | None] = mapped_column(Numeric(5, 4))
    cloud_cover: Mapped[float | None] = mapped_column(Numeric(5, 2))
    source: Mapped[str] = mapped_column(String(30), default="sentinel-2")


class IrrigationLog(Base):
    __tablename__ = "irrigation_logs"

    id: Mapped[int] = mapped_column(primary_key=True)
    plot_id: Mapped[int] = mapped_column(ForeignKey("plots.id", ondelete="CASCADE"))
    log_date: Mapped[date] = mapped_column(Date)
    volume_m3: Mapped[float] = mapped_column(Numeric(10, 2))
    note: Mapped[str | None] = mapped_column(Text)
