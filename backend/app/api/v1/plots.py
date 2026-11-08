from fastapi import APIRouter, Depends, HTTPException
from geoalchemy2.shape import from_shape, to_shape
from pyproj import Geod
from shapely.geometry import mapping, shape
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.models import Plot
from app.schemas.plot import Centroid, PlotCreate, PlotOut

router = APIRouter()
_GEOD = Geod(ellps="WGS84")

MIN_AREA_HA = 0.01
MAX_AREA_HA = 5000


def to_out(p: Plot) -> PlotOut:
    return PlotOut(
        id=p.id,
        name=p.name,
        crop=p.crop,
        planting_date=p.planting_date,
        irrigation_method=p.irrigation_method,
        area_ha=float(p.area_ha),
        centroid=Centroid(lat=p.centroid_lat, lng=p.centroid_lng),
        geometry=mapping(to_shape(p.geom)),
        is_demo=p.is_demo,
    )


def get_plot_or_404(db: Session, plot_id: int) -> Plot:
    plot = db.get(Plot, plot_id)
    if not plot:
        raise HTTPException(404, detail="Poligon tidak ditemukan")
    return plot


def area_ha_of(shp) -> float:
    area_m2, _ = _GEOD.geometry_area_perimeter(shp)
    return abs(area_m2) / 10_000


def build_plot(payload: PlotCreate, is_demo: bool = False) -> Plot:
    try:
        shp = shape(payload.geometry)
    except Exception:
        raise HTTPException(422, detail="Geometri GeoJSON tidak valid")
    if shp.geom_type != "Polygon" or not shp.is_valid:
        raise HTTPException(422, detail="Geometri harus berupa Polygon yang valid")

    area_ha = area_ha_of(shp)
    if area_ha < MIN_AREA_HA:
        raise HTTPException(422, detail="Luas lahan terlalu kecil untuk resolusi satelit")
    if area_ha > MAX_AREA_HA:
        raise HTTPException(422, detail="Luas lahan melebihi batas")

    c = shp.centroid
    return Plot(
        name=payload.name,
        crop=payload.crop,
        planting_date=payload.planting_date,
        irrigation_method=payload.irrigation_method,
        area_ha=round(area_ha, 4),
        centroid_lat=c.y,
        centroid_lng=c.x,
        geom=from_shape(shp, srid=4326),
        is_demo=is_demo,
    )


@router.get("", response_model=list[PlotOut])
def list_plots(db: Session = Depends(get_db)):
    plots = db.scalars(select(Plot).order_by(Plot.id)).all()
    return [to_out(p) for p in plots]


@router.post("", response_model=PlotOut, status_code=201)
def create_plot(payload: PlotCreate, db: Session = Depends(get_db)):
    plot = build_plot(payload)
    db.add(plot)
    db.commit()
    db.refresh(plot)
    return to_out(plot)


@router.get("/{plot_id}", response_model=PlotOut)
def get_plot(plot_id: int, db: Session = Depends(get_db)):
    return to_out(get_plot_or_404(db, plot_id))


@router.delete("/{plot_id}", status_code=204)
def delete_plot(plot_id: int, db: Session = Depends(get_db)):
    db.delete(get_plot_or_404(db, plot_id))
    db.commit()
