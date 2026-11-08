from datetime import date, timedelta

from fastapi import APIRouter, Depends
from sqlalchemy import delete
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.api.v1.plots import build_plot, to_out
from app.models import Plot
from app.models.plot import NdviObservation
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

    # Seed data observasi NDVI Sentinel-2 untuk ketiga plot demo
    demo_ndvi_samples = [
        {"plot_idx": 0, "ndvi": 0.68, "cloud": 12.0},  # Sawah Karawang
        {"plot_idx": 1, "ndvi": 0.72, "cloud": 8.5},   # Kebun Cabai Lembang
        {"plot_idx": 2, "ndvi": 0.58, "cloud": 18.0},  # Lahan Jagung Gunungkidul
    ]
    for sample in demo_ndvi_samples:
        p = plots[sample["plot_idx"]]
        for days_ago, ndvi_delta in [(15, -0.15), (7, -0.06), (1, 0.0)]:
            db.add(
                NdviObservation(
                    plot_id=p.id,
                    obs_date=today - timedelta(days=days_ago),
                    ndvi_mean=round(sample["ndvi"] + ndvi_delta, 4),
                    cloud_cover=sample["cloud"],
                    source="sentinel-2-demo",
                )
            )
    db.commit()

    return [to_out(p) for p in plots]
