from datetime import date
from typing import Any, Literal

from pydantic import BaseModel, Field

Crop = Literal["padi", "jagung", "cabai", "bawang_merah"]
Method = Literal["genangan", "alur", "tetes", "pompa"]


class PlotCreate(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    crop: Crop
    planting_date: date
    irrigation_method: Method
    geometry: dict[str, Any]  # GeoJSON Polygon


class Centroid(BaseModel):
    lat: float
    lng: float


class PlotOut(BaseModel):
    id: int
    name: str
    crop: Crop
    planting_date: date
    irrigation_method: Method
    area_ha: float
    centroid: Centroid
    geometry: dict[str, Any]
    is_demo: bool
