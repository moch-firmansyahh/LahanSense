from datetime import date, timedelta

from fastapi import APIRouter, Depends
from sqlalchemy import delete
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.api.v1.plots import build_plot, to_out
from app.models import Plot
from app.schemas.plot import PlotCreate, PlotOut

router = APIRouter()


def _square(lng: float, lat: float, size: float = 0.0015) -> dict:
    return {
        "type": "Polygon",
        "coordinates": [
            [
                [lng, lat],
                [lng + size, lat],
                [lng + size, lat + size],
                [lng, lat + size],
                [lng, lat],
            ]
        ],
    }


def _demo_payloads() -> list[PlotCreate]:
    today = date.today()
    return [
        PlotCreate(
            name="Sawah Karawang (demo)",
            crop="padi",
            planting_date=today - timedelta(days=45),
            irrigation_method="genangan",
            geometry=_square(107.30, -6.30),
        ),
        PlotCreate(
            name="Kebun Cabai Lembang (demo)",
            crop="cabai",
            planting_date=today - timedelta(days=60),
            irrigation_method="tetes",
            geometry=_square(107.617, -6.812),
        ),
        PlotCreate(
            name="Lahan Jagung Gunungkidul (demo)",
            crop="jagung",
            planting_date=today - timedelta(days=35),
            irrigation_method="alur",
            geometry=_square(110.60, -7.95),
        ),
    ]


@router.post("/load", response_model=list[PlotOut])
def load_demo(db: Session = Depends(get_db)):
    """Idempoten: hapus poligon demo lama, lalu isi ulang."""
    db.execute(delete(Plot).where(Plot.is_demo.is_(True)))
    plots = [build_plot(p, is_demo=True) for p in _demo_payloads()]
    db.add_all(plots)
    db.commit()
    for p in plots:
        db.refresh(p)
    return [to_out(p) for p in plots]
