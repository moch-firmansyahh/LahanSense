from datetime import date, timedelta

from fastapi import APIRouter, Depends
from sqlalchemy import delete
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.api.v1.plots import build_plot, to_out
from app.models import Plot
from app.models.plot import IrrigationLog, NdviObservation
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
            planting_date=today - timedelta(days=47),
            irrigation_method="genangan",
            geometry=_square(107.3850, -6.2450, size=0.0018),
        ),
        PlotCreate(
            name="Kebun Cabai Lembang (demo)",
            crop="cabai",
            planting_date=today - timedelta(days=61),
            irrigation_method="tetes",
            geometry=_square(107.6320, -6.8020, size=0.0015),
        ),
        PlotCreate(
            name="Lahan Jagung Gunungkidul (demo)",
            crop="jagung",
            planting_date=today - timedelta(days=35),
            irrigation_method="alur",
            geometry=_square(110.7100, -7.9250, size=0.0016),
        ),
        PlotCreate(
            name="Sentra Bawang Brebes (demo)",
            crop="bawang_merah",
            planting_date=today - timedelta(days=28),
            irrigation_method="pompa",
            geometry=_square(108.9950, -6.8920, size=0.0014),
        ),
        PlotCreate(
            name="Kebun Tomat Pangalengan (demo)",
            crop="cabai",
            planting_date=today - timedelta(days=50),
            irrigation_method="tetes",
            geometry=_square(107.5750, -7.1720, size=0.0016),
        ),
        PlotCreate(
            name="Lahan Kedelai Grobogan (demo)",
            crop="jagung",
            planting_date=today - timedelta(days=40),
            irrigation_method="alur",
            geometry=_square(110.9520, -7.0980, size=0.0020),
        ),
        PlotCreate(
            name="Sawah Organik Subang (demo)",
            crop="padi",
            planting_date=today - timedelta(days=52),
            irrigation_method="genangan",
            geometry=_square(107.7850, -6.4850, size=0.0021),
        ),
        PlotCreate(
            name="Sentra Jagung Hibrida Malang (demo)",
            crop="jagung",
            planting_date=today - timedelta(days=38),
            irrigation_method="alur",
            geometry=_square(112.7650, -8.0350, size=0.0018),
        ),
        PlotCreate(
            name="Sentra Bawang Merah Nganjuk (demo)",
            crop="bawang_merah",
            planting_date=today - timedelta(days=34),
            irrigation_method="pompa",
            geometry=_square(111.9520, -7.5650, size=0.0015),
        ),
        PlotCreate(
            name="Kebun Cabai Rawit Magelang (demo)",
            crop="cabai",
            planting_date=today - timedelta(days=44),
            irrigation_method="tetes",
            geometry=_square(110.3550, -7.4950, size=0.0014),
        ),
    ]


@router.post("/load", response_model=list[PlotOut])
def load_demo(db: Session = Depends(get_db)):
    """Idempoten: hapus poligon demo lama, lalu isi ulang 6 plot demo lengkap."""
    today = date.today()
    db.execute(delete(Plot).where(Plot.is_demo.is_(True)))
    plots = [build_plot(p, is_demo=True) for p in _demo_payloads()]
    db.add_all(plots)
    db.commit()
    for p in plots:
        db.refresh(p)

    # Seed data observasi NDVI Sentinel-2 untuk keenam plot demo
    demo_ndvi_samples = [
        {"plot_idx": 0, "ndvi": 0.62, "cloud": 12.0},  # Sawah Karawang
        {"plot_idx": 1, "ndvi": 0.74, "cloud": 8.5},   # Kebun Cabai Lembang
        {"plot_idx": 2, "ndvi": 0.48, "cloud": 18.0},  # Lahan Jagung Gunungkidul
        {"plot_idx": 3, "ndvi": 0.58, "cloud": 10.0},  # Sentra Bawang Brebes
        {"plot_idx": 4, "ndvi": 0.81, "cloud": 6.0},   # Kebun Tomat Pangalengan
        {"plot_idx": 5, "ndvi": 0.51, "cloud": 15.0},  # Lahan Kedelai Grobogan
        {"plot_idx": 6, "ndvi": 0.78, "cloud": 9.0},   # Sawah Organik Subang
        {"plot_idx": 7, "ndvi": 0.65, "cloud": 14.0},  # Sentra Jagung Malang
        {"plot_idx": 8, "ndvi": 0.52, "cloud": 11.0},  # Sentra Bawang Merah Nganjuk
        {"plot_idx": 9, "ndvi": 0.73, "cloud": 7.5},   # Kebun Cabai Magelang
    ]
    for sample in demo_ndvi_samples:
        if sample["plot_idx"] < len(plots):
            p = plots[sample["plot_idx"]]
            for days_ago, ndvi_delta in [(25, -0.22), (15, -0.12), (7, -0.05), (1, 0.0)]:
                db.add(
                    NdviObservation(
                        plot_id=p.id,
                        obs_date=today - timedelta(days=days_ago),
                        ndvi_mean=round(sample["ndvi"] + ndvi_delta, 4),
                        cloud_cover=sample["cloud"],
                        source="sentinel-2-demo",
                    )
                )

    # Seed data log irigasi aktual untuk evaluasi audit efisiensi demo
    demo_irrigation_samples = [
        # Sawah Karawang
        {"plot_idx": 0, "logs": [(6, 45.0, "Penggenangan macak-macak"), (3, 28.0, "Irigasi rotasi tersier")]},
        # Kebun Cabai Lembang
        {
            "plot_idx": 1,
            "logs": [(5, 16.0, "Drip fertigasi pagi"), (3, 16.5, "Drip sore hari"), (1, 15.0, "Drip pemeliharaan")],
        },
        # Lahan Jagung Gunungkidul
        {"plot_idx": 2, "logs": [(7, 35.0, "Pompa sumur dalam")]},
        # Sentra Bawang Brebes
        {"plot_idx": 3, "logs": [(4, 24.0, "Siraman pagi sprinkler"), (1, 25.0, "Siraman rutin saluran")]},
        # Kebun Tomat Pangalengan
        {"plot_idx": 4, "logs": [(6, 10.0, "Drip fertigasi"), (2, 11.0, "Drip pagi")]},
        # Lahan Kedelai Grobogan
        {"plot_idx": 5, "logs": [(5, 50.0, "Pompa alur sawah")]},
        # Sawah Organik Subang
        {"plot_idx": 6, "logs": [(5, 30.0, "Genangan bertahap"), (2, 12.0, "Macak-macak pemeliharaan")]},
        # Sentra Jagung Malang
        {"plot_idx": 7, "logs": [(4, 28.0, "Alur irigasi")]},
        # Sentra Bawang Merah Nganjuk
        {"plot_idx": 8, "logs": [(6, 22.0, "Kabut siram pagi"), (3, 20.0, "Siraman sore pompa dangkal")]},
        # Kebun Cabai Magelang
        {"plot_idx": 9, "logs": [(4, 10.0, "Drip fertigasi"), (1, 10.0, "Drip harian")]},
    ]
    for sample in demo_irrigation_samples:
        if sample["plot_idx"] < len(plots):
            p = plots[sample["plot_idx"]]
            for days_ago, vol, note in sample["logs"]:
                db.add(
                    IrrigationLog(
                        plot_id=p.id,
                        log_date=today - timedelta(days=days_ago),
                        volume_m3=vol,
                        note=note,
                    )
                )
    db.commit()

    return [to_out(p) for p in plots]
