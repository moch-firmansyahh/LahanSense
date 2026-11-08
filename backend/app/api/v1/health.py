from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.api.deps import get_db

router = APIRouter()


@router.get("/health")
def health():
    return {"status": "ok"}


@router.get("/health/db")
def health_db(db: Session = Depends(get_db)):
    """Cek koneksi ke Supabase dan ketersediaan PostGIS."""
    version = db.execute(text("SELECT PostGIS_Version()")).scalar()
    return {"status": "ok", "postgis": version}
