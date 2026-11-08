# LahanSense: Panduan Inisiasi Project (v2, Supabase, tanpa Docker)

> Tim **SundaSundaJawa** | CR Youth 2026 Hackathon
> Modul: **AgriWatch** + **WaterCast**
> Database: **Supabase (PostgreSQL + PostGIS)**. Tidak memakai Docker maupun Redis.
> Dokumen ini berisi kode awal yang **sudah bisa dijalankan** untuk backend dan frontend, plus alur GitFlow + Pull Request.

---

## Daftar Isi

1. [Ringkasan & Tech Stack](#1-ringkasan--tech-stack)
2. [Prasyarat](#2-prasyarat)
3. [Struktur Repository](#3-struktur-repository)
4. [Inisiasi Repository & Git](#4-inisiasi-repository--git)
5. [Setup Supabase](#5-setup-supabase)
6. [Backend (FastAPI)](#6-backend-fastapi)
7. [Frontend (Next.js)](#7-frontend-nextjs)
8. [Kontrak API](#8-kontrak-api)
9. [Alur Git: GitFlow + Pull Request](#9-alur-git-gitflow--pull-request)
10. [Pembagian Tugas & Branch](#10-pembagian-tugas--branch)
11. [Standar Kode & Definition of Done](#11-standar-kode--definition-of-done)
12. [Timeline 48 Jam](#12-timeline-48-jam)
13. [Troubleshooting](#13-troubleshooting)
14. [Checklist Inisiasi](#14-checklist-inisiasi)

---

## 1. Ringkasan & Tech Stack

LahanSense menggantikan sensor fisik dengan data satelit (NDVI Sentinel-2) dan cuaca terbuka. Pengguna menggambar poligon lahan, lalu sistem menghitung defisit air (FAO-56), rekomendasi irigasi harian, dan peringatan dini 7 hari.

| Lapisan | Teknologi |
|---------|-----------|
| Frontend | Next.js (App Router) + TypeScript + Tailwind CSS |
| Peta | MapLibre GL JS + Terra Draw + Turf.js |
| Grafik | Recharts |
| Backend | FastAPI (Python 3.11+) |
| ORM & migrasi | SQLAlchemy 2 + GeoAlchemy2 + Alembic |
| Database | Supabase (PostgreSQL + PostGIS) |
| Cuaca | Open-Meteo (via httpx), cache in-memory |
| Citra satelit | pystac-client, planetary-computer, rasterio (dikerjakan tim Data) |
| Deploy | Vercel (FE) + Railway/Fly.io (BE) |

### Cakupan kode awal di dokumen ini

| Sudah berfungsi | Masih stub (dikerjakan per fitur lewat PR) |
|-----------------|--------------------------------------------|
| CRUD poligon + hitung luas | NDVI Sentinel-2 (`services/satellite.py`) |
| Cuaca Open-Meteo + cache + fallback demo | Kalibrasi Kc lokal & validasi |
| ET₀ FAO-56, Kc per fase, defisit, volume irigasi | Audit efisiensi (`irrigation-log`, skor) |
| Rekomendasi harian, forecast 7 hari, alert | Scheduler harian |
| Mode demo (3 poligon) | Ekspor PDF |
| Frontend: peta, gambar poligon, form, dashboard, grafik | Peta panas NDVI |

---

## 2. Prasyarat

| Tools | Versi minimum | Cek |
|-------|---------------|-----|
| Git | 2.40+ | `git --version` |
| Node.js | 20 LTS+ | `node -v` |
| Python | 3.11+ | `python --version` |
| Akun GitHub + Supabase | n/a | n/a |

> **Windows:** gunakan WSL2 atau Git Bash agar perintah di dokumen ini sama. Instalasi `rasterio` di Windows native bisa merepotkan; pipeline NDVI baru dibutuhkan di Sprint 1, jadi kode awal ini **belum memasangnya** (lihat catatan di `requirements.txt`).

---

## 3. Struktur Repository

```
lahansense/
├── .github/
│   ├── CODEOWNERS
│   ├── pull_request_template.md
│   └── workflows/
│       ├── backend-ci.yml
│       └── frontend-ci.yml
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── core/config.py
│   │   ├── db/{base.py, session.py}
│   │   ├── models/{__init__.py, plot.py}
│   │   ├── schemas/{__init__.py, plot.py, analytics.py}
│   │   ├── api/
│   │   │   ├── deps.py
│   │   │   └── v1/{router.py, health.py, plots.py, analytics.py, demo.py}
│   │   └── services/{weather.py, et0.py, water_balance.py, alerts.py, satellite.py}
│   ├── alembic/
│   ├── tests/{test_health.py, test_et0.py, test_water_balance.py}
│   ├── alembic.ini
│   ├── requirements.txt
│   ├── requirements-dev.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── app/{layout.tsx, page.tsx, dashboard/page.tsx}
│   │   ├── components/
│   │   │   ├── map/MapView.tsx
│   │   │   ├── plot/{PlotForm.tsx, RecommendationCard.tsx}
│   │   │   ├── alerts/AlertList.tsx
│   │   │   └── charts/ForecastChart.tsx
│   │   ├── lib/api.ts
│   │   └── types/api.ts
│   └── .env.example
├── docs/{api-contract.md, proposal/}
├── Makefile
├── .gitignore
├── .editorconfig
└── README.md
```

---

## 4. Inisiasi Repository & Git

> Dikerjakan **satu orang** (disarankan Moch Firmansyah sebagai repo owner). Anggota lain cukup `git clone`.

### 4.1 Buat repo

```bash
mkdir lahansense && cd lahansense
git init -b main
mkdir -p backend frontend docs/proposal .github/workflows
```

### 4.2 `.gitignore`

```gitignore
.DS_Store
Thumbs.db
.vscode/*
!.vscode/extensions.json
.idea/

# Env: JANGAN commit secret
.env
.env.*
!.env.example

# Python
__pycache__/
*.pyc
.venv/
venv/
.pytest_cache/
.mypy_cache/
.ruff_cache/

# Node
node_modules/
.next/
out/
npm-debug.log*

# Data
*.tif
*.tiff
data/
dist/
build/
coverage/
```

### 4.3 `.editorconfig`

```ini
root = true

[*]
indent_style = space
indent_size = 2
end_of_line = lf
charset = utf-8
trim_trailing_whitespace = true
insert_final_newline = true

[*.py]
indent_size = 4

[Makefile]
indent_style = tab
```

### 4.4 `Makefile`

```makefile
.PHONY: be-run be-test be-lint migrate fe-run

be-run:
	cd backend && . .venv/bin/activate && uvicorn app.main:app --reload --port 8000

be-test:
	cd backend && . .venv/bin/activate && pytest -q

be-lint:
	cd backend && . .venv/bin/activate && ruff check . && ruff format --check .

migrate:
	cd backend && . .venv/bin/activate && alembic upgrade head

fe-run:
	cd frontend && npm run dev
```

### 4.5 Commit awal, branch `develop`, push

Lakukan **setelah** bagian 6 dan 7 selesai (agar `main` sudah berisi scaffold):

```bash
git add .
git commit -m "chore: initial project scaffold"
git branch develop

git remote add origin git@github.com:<org-atau-user>/lahansense.git
git push -u origin main
git push -u origin develop
```

### 4.6 Proteksi branch (GitHub → Settings → Branches)

| Branch | Aturan |
|--------|--------|
| `main` | Require PR, minimal 1 approval, require status checks, tanpa push langsung |
| `develop` | Sama seperti `main` |

Set **default branch** ke `develop`. Undang 2 anggota lain sebagai *collaborator* (Write).

---

## 5. Setup Supabase

Supabase hanya dipakai sebagai **database Postgres + PostGIS**. Auth, Storage, dan API key bawaan tidak dipakai.

### 5.1 Buat project (satu orang)

1. Buka supabase.com, lalu **New project**.
2. **Region:** Southeast Asia (Singapore).
3. **Database password:** kuat, tanpa karakter spesial (`@ # / :`) agar tidak perlu URL-encode.

### 5.2 Aktifkan PostGIS

Buka **SQL Editor**, jalankan:

```sql
CREATE EXTENSION IF NOT EXISTS postgis WITH SCHEMA extensions;
SELECT PostGIS_Version();
```

### 5.3 Ambil connection string: gunakan **Session pooler**

Klik **Connect** di dashboard, lalu pilih **Session pooler**. Ciri-cirinya:

| Mode | Ciri | Pakai? |
|------|------|--------|
| **Session pooler** | host `...pooler.supabase.com`, port **5432**, user `postgres.<project-ref>` | **Ya** |
| Direct connection | host `db.<project-ref>.supabase.co` | **Tidak**: hanya IPv6 di plan gratis, sering gagal di jaringan Indonesia |
| Transaction pooler | port 6543 | Tidak |

Ubah awalan menjadi `postgresql+psycopg://` agar cocok dengan driver:

```
postgresql+psycopg://postgres.<project-ref>:<PASSWORD>@<host-pooler-dari-dashboard>:5432/postgres
```

### 5.4 Keamanan & koordinasi

- Bagikan `DATABASE_URL` lewat **kanal privat** (DM atau password manager), tidak lewat repo atau chat grup yang terbuka.
- **Key lain Supabase (anon, service_role, Project URL, JWT secret) tidak perlu dibagikan.** Khusus `service_role` jangan pernah dipakai di frontend.
- Hanya **satu orang** yang menjalankan `alembic upgrade head` agar skema tidak bentrok.
- Nonaktifkan **Data API** di *Project Settings → Data API* (kita tidak memakainya) agar tabel tidak terbuka lewat REST bawaan Supabase.
- Disarankan **dua project**: `lahansense-dev` (bersama) dan `lahansense-demo` (bersih untuk presentasi).
- Project gratis akan *pause* bila lama tidak aktif; cek sebelum demo.

---

## 6. Backend (FastAPI)

### 6.1 Environment

```bash
cd backend
python -m venv .venv
source .venv/bin/activate        # Windows PowerShell: .venv\Scripts\Activate.ps1
```

**`requirements.txt`**

```txt
fastapi>=0.115
uvicorn[standard]>=0.30
pydantic-settings>=2.4
sqlalchemy>=2.0
geoalchemy2>=0.15
psycopg[binary]>=3.2
alembic>=1.13
httpx>=0.27
shapely>=2.0
pyproj>=3.6
numpy>=1.26
pandas>=2.2

# Sprint 1 (tim Data): aktifkan saat mengerjakan pipeline NDVI
# pystac-client>=0.8
# planetary-computer>=1.0
# rasterio>=1.4
# rio-tiler>=7.0
```

**`requirements-dev.txt`**

```txt
-r requirements.txt
pytest>=8.0
ruff>=0.6
```

```bash
pip install -r requirements-dev.txt
```

**`.env.example`**

```env
APP_ENV=development
CORS_ORIGINS=http://localhost:3000

# Supabase: Session pooler (isi password asli hanya di .env lokal!)
DATABASE_URL=postgresql+psycopg://postgres.<project-ref>:<PASSWORD>@<host-pooler>:5432/postgres

OPEN_METEO_BASE_URL=https://api.open-meteo.com/v1

# true = bila Open-Meteo gagal, pakai data cuaca sintetis agar demo tetap jalan
DEMO_MODE=true
```

```bash
cp .env.example .env     # lalu isi DATABASE_URL asli
```

### 6.2 Kerangka folder

```bash
mkdir -p app/{core,db,models,schemas,api/v1,services} tests
touch app/__init__.py app/core/__init__.py app/db/__init__.py app/api/__init__.py \
      app/api/v1/__init__.py app/services/__init__.py
```

### 6.3 Core & database

**`app/core/config.py`**

```python
from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    app_env: str = "development"
    cors_origins: str = "http://localhost:3000"
    database_url: str
    open_meteo_base_url: str = "https://api.open-meteo.com/v1"
    demo_mode: bool = True

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
```

**`app/db/base.py`**

```python
from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    pass
```

**`app/db/session.py`**

```python
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.core.config import get_settings

engine = create_engine(get_settings().database_url, pool_pre_ping=True)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)
```

**`app/api/deps.py`**

```python
from collections.abc import Generator

from sqlalchemy.orm import Session

from app.db.session import SessionLocal


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

### 6.4 Model

**`app/models/plot.py`**

```python
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
```

**`app/models/__init__.py`**

```python
from app.models.plot import IrrigationLog, NdviObservation, Plot  # noqa: F401
```

### 6.5 Schema (Pydantic)

**`app/schemas/plot.py`**

```python
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
```

**`app/schemas/analytics.py`**

```python
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
```

### 6.6 Services

**`app/services/et0.py`** (Penman-Monteith FAO-56, sudah divalidasi terhadap contoh FAO: hasil 3,79 mm/hari vs 3,9 acuan)

```python
import math


def _svp(t: float) -> float:
    """Tekanan uap jenuh (kPa)."""
    return 0.6108 * math.exp(17.27 * t / (t + 237.3))


def et0_penman_monteith(
    t_max: float,
    t_min: float,
    rh_mean: float,
    wind_2m: float,
    solar_rad_mj: float,
    lat_deg: float,
    doy: int,
    elevation_m: float = 0.0,
) -> float:
    """ET0 harian (mm/hari) metode FAO-56.

    solar_rad_mj dalam MJ/m2/hari, wind_2m dalam m/s pada ketinggian 2 m.
    """
    t_mean = (t_max + t_min) / 2
    pressure = 101.3 * ((293 - 0.0065 * elevation_m) / 293) ** 5.26
    gamma = 0.000665 * pressure
    delta = 4098 * _svp(t_mean) / (t_mean + 237.3) ** 2
    es = (_svp(t_max) + _svp(t_min)) / 2
    ea = es * rh_mean / 100

    phi = math.radians(lat_deg)
    dr = 1 + 0.033 * math.cos(2 * math.pi / 365 * doy)
    sd = 0.409 * math.sin(2 * math.pi / 365 * doy - 1.39)
    ws = math.acos(max(-1.0, min(1.0, -math.tan(phi) * math.tan(sd))))
    ra = (24 * 60 / math.pi) * 0.0820 * dr * (
        ws * math.sin(phi) * math.sin(sd) + math.cos(phi) * math.cos(sd) * math.sin(ws)
    )
    rso = (0.75 + 2e-5 * elevation_m) * ra
    rns = 0.77 * solar_rad_mj
    ratio = min(solar_rad_mj / rso, 1.0) if rso > 0 else 0.5
    rnl = (
        4.903e-9
        * (((t_max + 273.16) ** 4 + (t_min + 273.16) ** 4) / 2)
        * (0.34 - 0.14 * math.sqrt(ea))
        * (1.35 * ratio - 0.35)
    )
    rn = rns - rnl

    et0 = (0.408 * delta * rn + gamma * 900 / (t_mean + 273) * wind_2m * (es - ea)) / (
        delta + gamma * (1 + 0.34 * wind_2m)
    )
    return max(0.0, et0)
```

> Untuk MVP, ET₀ diambil dari Open-Meteo (`et0_fao_evapotranspiration`), sedangkan fungsi di atas dipakai sebagai pembanding/cadangan oleh tim Data.

**`app/services/water_balance.py`**

```python
from datetime import date

CROP_PARAMS: dict[str, dict[str, float]] = {
    # Nilai baseline FAO-56 (perlu diverifikasi & dikalibrasi lokal oleh tim Data)
    "padi": dict(kc_ini=1.05, kc_mid=1.20, kc_end=0.90, l_ini=30, l_dev=30, l_mid=60, l_late=30),
    "jagung": dict(kc_ini=0.30, kc_mid=1.20, kc_end=0.60, l_ini=20, l_dev=35, l_mid=40, l_late=30),
    "cabai": dict(kc_ini=0.60, kc_mid=1.05, kc_end=0.90, l_ini=30, l_dev=40, l_mid=110, l_late=30),
    "bawang_merah": dict(kc_ini=0.70, kc_mid=1.05, kc_end=0.75, l_ini=15, l_dev=25, l_mid=35, l_late=10),
}

# Efisiensi sistem irigasi (asumsi awal)
IRRIGATION_EFFICIENCY = {"genangan": 0.45, "alur": 0.60, "pompa": 0.65, "tetes": 0.90}

DEFAULT_PUMP_LPS = 8.0  # debit pompa (L/detik)
EFFECTIVE_RAIN_FACTOR = 0.8


def kc_by_stage(crop: str, dap: int) -> float:
    """Kc berdasarkan hari setelah tanam (dap), interpolasi linear antar fase."""
    p = CROP_PARAMS[crop]
    d_ini = p["l_ini"]
    d_dev = d_ini + p["l_dev"]
    d_mid = d_dev + p["l_mid"]
    d_late = d_mid + p["l_late"]
    if dap <= d_ini:
        return p["kc_ini"]
    if dap <= d_dev:
        return p["kc_ini"] + (dap - d_ini) / p["l_dev"] * (p["kc_mid"] - p["kc_ini"])
    if dap <= d_mid:
        return p["kc_mid"]
    if dap <= d_late:
        return p["kc_mid"] + (dap - d_mid) / p["l_late"] * (p["kc_end"] - p["kc_mid"])
    return p["kc_end"]


def kc_from_ndvi(ndvi: float) -> float:
    """Kc dari NDVI (regresi linear umum; TODO: kalibrasi per komoditas)."""
    return max(0.2, min(1.3, 1.457 * ndvi - 0.1725))


def blended_kc(crop: str, dap: int, ndvi: float | None) -> float:
    kc_stage = kc_by_stage(crop, dap)
    if ndvi is None:
        return kc_stage
    return 0.5 * kc_stage + 0.5 * kc_from_ndvi(ndvi)


def classify(deficit_mm: float) -> str:
    if deficit_mm < 2:
        return "aman"
    if deficit_mm < 5:
        return "waspada"
    return "kritis"


def irrigation_volume_m3(deficit_mm: float, area_ha: float, method: str) -> float:
    eff = IRRIGATION_EFFICIENCY.get(method, 0.6)
    return deficit_mm * area_ha * 10 / eff


def pump_minutes(volume_m3: float, flow_lps: float = DEFAULT_PUMP_LPS) -> int | None:
    if volume_m3 <= 0 or flow_lps <= 0:
        return None
    return round(volume_m3 * 1000 / flow_lps / 60)


def compute_day(
    *,
    crop: str,
    planting_date: date,
    method: str,
    area_ha: float,
    target: date,
    et0_mm: float,
    rain_mm: float,
    ndvi: float | None = None,
    ndvi_cloud: float | None = None,
    soil_contrib_mm: float = 0.0,
) -> dict:
    dap = max(0, (target - planting_date).days)
    kc = blended_kc(crop, dap, ndvi)
    etc = kc * et0_mm
    eff_rain = EFFECTIVE_RAIN_FACTOR * rain_mm
    deficit = max(0.0, etc - eff_rain - soil_contrib_mm)
    volume = irrigation_volume_m3(deficit, area_ha, method)
    status = classify(deficit)

    if ndvi is None:
        confidence = "rendah"
    else:
        confidence = "tinggi" if (ndvi_cloud or 0) < 30 else "sedang"

    reason = (
        f"Hari ke-{dap} setelah tanam. Kebutuhan air {etc:.1f} mm, "
        f"hujan efektif {eff_rain:.1f} mm, defisit {deficit:.1f} mm."
    )
    return {
        "date": target.isoformat(),
        "et0_mm": round(et0_mm, 2),
        "kc": round(kc, 3),
        "etc_mm": round(etc, 2),
        "effective_rain_mm": round(eff_rain, 2),
        "deficit_mm": round(deficit, 2),
        "irrigation_volume_m3": round(volume, 1),
        "pump_minutes": pump_minutes(volume),
        "status": status,
        "reason": reason,
        "confidence": confidence,
    }
```

**`app/services/weather.py`**

```python
import math
import time
from datetime import date, timedelta

import httpx

from app.core.config import get_settings

_TTL_SECONDS = 3 * 3600
_CACHE: dict[tuple, tuple[float, list[dict]]] = {}


def _synthetic(past_days: int, forecast_days: int) -> list[dict]:
    """Data cuaca sintetis untuk mode demo saat API tidak tersedia."""
    rows = []
    today = date.today()
    for i in range(-past_days, forecast_days):
        d = today + timedelta(days=i)
        rain = 18.0 if i in (3, 4) else (6.0 if i == -2 else 0.0)
        rows.append(
            {
                "date": d.isoformat(),
                "t_max": 32.0,
                "t_min": 22.0,
                "rain_mm": rain,
                "et0_mm": round(4.0 + 0.4 * math.sin(i), 2),
            }
        )
    return rows


def fetch_daily_weather(lat: float, lng: float, past_days: int = 7, forecast_days: int = 8) -> list[dict]:
    settings = get_settings()
    key = (round(lat, 2), round(lng, 2), past_days, forecast_days)
    now = time.time()
    hit = _CACHE.get(key)
    if hit and now - hit[0] < _TTL_SECONDS:
        return hit[1]

    params = {
        "latitude": lat,
        "longitude": lng,
        "daily": "temperature_2m_max,temperature_2m_min,precipitation_sum,et0_fao_evapotranspiration",
        "past_days": past_days,
        "forecast_days": forecast_days,
        "timezone": "Asia/Jakarta",
    }
    try:
        r = httpx.get(f"{settings.open_meteo_base_url}/forecast", params=params, timeout=20)
        r.raise_for_status()
        d = r.json()["daily"]
        rows = [
            {
                "date": d["time"][i],
                "t_max": d["temperature_2m_max"][i],
                "t_min": d["temperature_2m_min"][i],
                "rain_mm": d["precipitation_sum"][i] or 0.0,
                "et0_mm": d["et0_fao_evapotranspiration"][i] or 0.0,
            }
            for i in range(len(d["time"]))
        ]
    except Exception:
        if settings.demo_mode:
            rows = _synthetic(past_days, forecast_days)
        else:
            raise
    _CACHE[key] = (now, rows)
    return rows
```

**`app/services/satellite.py`** (stub, diisi tim Data)

```python
from datetime import date


def get_latest_ndvi(geometry: dict, around: date) -> dict | None:
    """TODO (feature/data-ndvi-pipeline).

    Langkah: query STAC Sentinel-2 L2A (Planetary Computer) untuk bbox poligon,
    filter eo:cloud_cover, baca band B04 (red) dan B08 (NIR), mask dengan SCL,
    hitung NDVI = (B08 - B04) / (B08 + B04), lalu rata-rata zonal di dalam poligon.

    Return contoh: {"obs_date": date, "ndvi_mean": 0.62, "cloud_cover": 12.0}
    atau None bila tidak ada citra yang valid.
    """
    return None
```

**`app/services/alerts.py`**

```python
from datetime import date

from app.services.water_balance import compute_day

DROUGHT_3DAY_MM = 12.0
EXTREME_RAIN_MM = 50.0


def build_forecast(plot, weather: list[dict], start: date) -> list[dict]:
    out = []
    for w in weather:
        if w["date"] < start.isoformat():
            continue
        day = compute_day(
            crop=plot.crop,
            planting_date=plot.planting_date,
            method=plot.irrigation_method,
            area_ha=float(plot.area_ha),
            target=date.fromisoformat(w["date"]),
            et0_mm=w["et0_mm"],
            rain_mm=w["rain_mm"],
        )
        out.append({**day, "rain_mm": w["rain_mm"]})
        if len(out) == 7:
            break
    return out


def build_alerts(forecast: list[dict]) -> list[dict]:
    alerts: list[dict] = []
    for i in range(len(forecast)):
        window = forecast[i : i + 3]
        cum = sum(d["deficit_mm"] for d in window)
        if len(window) == 3 and cum >= DROUGHT_3DAY_MM:
            severity = "kritis" if cum >= 2 * DROUGHT_3DAY_MM else "waspada"
            alerts.append(
                {
                    "type": "kekeringan",
                    "severity": severity,
                    "date": forecast[i]["date"],
                    "message": f"Defisit air kumulatif {cum:.1f} mm dalam 3 hari sejak {forecast[i]['date']}.",
                    "suggested_action": "Majukan jadwal irigasi dan hindari pemupukan hingga defisit mereda.",
                }
            )
            break  # satu alert kekeringan (yang paling awal) cukup
    for d in forecast:
        if d["rain_mm"] >= EXTREME_RAIN_MM:
            alerts.append(
                {
                    "type": "hujan_ekstrem",
                    "severity": "waspada",
                    "date": d["date"],
                    "message": f"Prakiraan hujan {d['rain_mm']:.0f} mm pada {d['date']}.",
                    "suggested_action": "Periksa saluran drainase dan tunda irigasi serta pemupukan.",
                }
            )
    return alerts
```

### 6.7 Endpoint

**`app/api/v1/health.py`**

```python
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
```

**`app/api/v1/plots.py`**

```python
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
```

**`app/api/v1/analytics.py`**

```python
from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.api.v1.plots import get_plot_or_404
from app.schemas.analytics import AlertOut, ForecastDay, RecommendationOut
from app.services.alerts import build_alerts, build_forecast
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

    # TODO (feature/data-ndvi-pipeline): ganti None dengan NDVI terbaru dari database
    result = compute_day(
        crop=plot.crop,
        planting_date=plot.planting_date,
        method=plot.irrigation_method,
        area_ha=float(plot.area_ha),
        target=target,
        et0_mm=day["et0_mm"],
        rain_mm=day["rain_mm"],
        ndvi=None,
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


@router.get("/{plot_id}/ndvi")
def ndvi(plot_id: int, db: Session = Depends(get_db)):
    get_plot_or_404(db, plot_id)
    # TODO (feature/data-ndvi-pipeline)
    return {"plot_id": plot_id, "latest": None, "history": []}
```

**`app/api/v1/demo.py`**

```python
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
        "coordinates": [[
            [lng, lat], [lng + size, lat], [lng + size, lat + size],
            [lng, lat + size], [lng, lat],
        ]],
    }


def _demo_payloads() -> list[PlotCreate]:
    today = date.today()
    return [
        PlotCreate(name="Sawah Karawang (demo)", crop="padi",
                   planting_date=today - timedelta(days=45),
                   irrigation_method="genangan", geometry=_square(107.30, -6.30)),
        PlotCreate(name="Kebun Cabai Lembang (demo)", crop="cabai",
                   planting_date=today - timedelta(days=60),
                   irrigation_method="tetes", geometry=_square(107.617, -6.812)),
        PlotCreate(name="Lahan Jagung Gunungkidul (demo)", crop="jagung",
                   planting_date=today - timedelta(days=35),
                   irrigation_method="alur", geometry=_square(110.60, -7.95)),
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
```

**`app/api/v1/router.py`**

```python
from fastapi import APIRouter

from app.api.v1 import analytics, demo, health, plots

api_router = APIRouter()
api_router.include_router(health.router, tags=["health"])
api_router.include_router(plots.router, prefix="/plots", tags=["plots"])
api_router.include_router(analytics.router, prefix="/plots", tags=["analytics"])
api_router.include_router(demo.router, prefix="/demo", tags=["demo"])
```

**`app/main.py`**

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.router import api_router
from app.core.config import get_settings

settings = get_settings()

app = FastAPI(
    title="LahanSense API",
    version="0.1.0",
    description="Intelijen irigasi tanpa sensor: NDVI + FAO-56",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api/v1")


@app.get("/")
def root():
    return {"name": "LahanSense API", "docs": "/docs"}
```

### 6.8 Migrasi Alembic

Pastikan PostGIS sudah aktif (bagian 5.2), lalu:

```bash
alembic init alembic
```

Edit **`alembic/env.py`**: tambahkan di bagian atas (setelah import bawaan) dan ganti `target_metadata`:

```python
from app.core.config import get_settings
from app.db.base import Base
import app.models  # noqa: F401  (agar semua model terdaftar)

config.set_main_option("sqlalchemy.url", get_settings().database_url)
target_metadata = Base.metadata


def include_object(obj, name, type_, reflected, compare_to):
    # abaikan tabel bawaan PostGIS
    if type_ == "table" and name == "spatial_ref_sys":
        return False
    return True
```

Lalu tambahkan `include_object=include_object` pada **kedua** pemanggilan `context.configure(...)` (mode offline dan online).

Buat dan jalankan migrasi pertama:

```bash
alembic revision --autogenerate -m "init tables"
```

Buka file migrasi yang terbentuk di `alembic/versions/`, lalu **tambahkan di baris import paling atas**:

```python
import geoalchemy2  # noqa: F401
```

Kemudian:

```bash
alembic upgrade head
```

> Hanya **satu orang** yang menjalankan `upgrade head` di database bersama. Perubahan model berikutnya: `alembic revision --autogenerate -m "..."` dan sertakan file migrasi di PR.

### 6.9 Test

**`tests/test_health.py`**

```python
import os

os.environ.setdefault("DATABASE_URL", "postgresql+psycopg://u:p@localhost:5432/test")

from fastapi.testclient import TestClient  # noqa: E402

from app.main import app  # noqa: E402

client = TestClient(app)


def test_health():
    r = client.get("/api/v1/health")
    assert r.status_code == 200
    assert r.json() == {"status": "ok"}
```

**`tests/test_et0.py`**

```python
from app.services.et0 import et0_penman_monteith


def test_fao56_example():
    # Contoh FAO-56 (Brussels, 6 Juli): acuan sekitar 3,9 mm/hari
    et0 = et0_penman_monteith(
        t_max=21.5, t_min=12.3, rh_mean=73.5, wind_2m=2.078,
        solar_rad_mj=22.07, lat_deg=50.8, doy=187, elevation_m=100,
    )
    assert abs(et0 - 3.9) < 0.3


def test_et0_never_negative():
    assert et0_penman_monteith(15, 10, 95, 0.5, 2.0, -6.9, 10) >= 0
```

**`tests/test_water_balance.py`**

```python
from datetime import date, timedelta

from app.services.water_balance import classify, compute_day, kc_by_stage, irrigation_volume_m3


def test_kc_stage_bounds():
    assert kc_by_stage("padi", 0) == 1.05
    assert kc_by_stage("padi", 80) == 1.20
    assert kc_by_stage("padi", 500) == 0.90


def test_volume_formula():
    # 3,2 mm x 1 ha x 10 / 0,45 = ~71 m3
    assert round(irrigation_volume_m3(3.2, 1.0, "genangan"), 1) == 71.1


def test_rain_removes_deficit():
    r = compute_day(
        crop="padi", planting_date=date.today() - timedelta(days=40), method="genangan",
        area_ha=1.0, target=date.today(), et0_mm=4.0, rain_mm=30.0,
    )
    assert r["deficit_mm"] == 0
    assert r["status"] == "aman"
    assert r["irrigation_volume_m3"] == 0


def test_classify():
    assert classify(1) == "aman"
    assert classify(3) == "waspada"
    assert classify(8) == "kritis"
```

```bash
pytest -q
```

### 6.10 Jalankan & verifikasi

```bash
uvicorn app.main:app --reload --port 8000
```

| URL | Hasil yang diharapkan |
|-----|-----------------------|
| http://localhost:8000/api/v1/health | `{"status":"ok"}` |
| http://localhost:8000/api/v1/health/db | `{"status":"ok","postgis":"3.x ..."}` (membuktikan Supabase + PostGIS tersambung) |
| http://localhost:8000/docs | Swagger UI |

Uji cepat via Swagger: `POST /api/v1/demo/load`, lalu `GET /api/v1/plots/1/recommendation`.

---

## 7. Frontend (Next.js)

### 7.1 Scaffold & dependency

Dari root repo:

```bash
npx create-next-app@latest frontend \
  --typescript --tailwind --eslint --app --src-dir \
  --import-alias "@/*" --use-npm

cd frontend
npm install maplibre-gl terra-draw terra-draw-maplibre-gl-adapter @turf/turf recharts
```

**`.env.example`**

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1
```

```bash
cp .env.example .env.local
```

> Frontend **tidak memerlukan key Supabase apa pun**. Ia hanya memanggil backend. Variabel `NEXT_PUBLIC_*` terlihat publik, jadi jangan taruh secret di sana.

### 7.2 Tipe & API client

**`src/types/api.ts`**

```ts
export type Crop = "padi" | "jagung" | "cabai" | "bawang_merah";
export type Method = "genangan" | "alur" | "tetes" | "pompa";
export type Status = "aman" | "waspada" | "kritis";

export interface Plot {
  id: number;
  name: string;
  crop: Crop;
  planting_date: string;
  irrigation_method: Method;
  area_ha: number;
  centroid: { lat: number; lng: number };
  geometry: GeoJSON.Polygon;
  is_demo: boolean;
}

export interface PlotCreate {
  name: string;
  crop: Crop;
  planting_date: string;
  irrigation_method: Method;
  geometry: GeoJSON.Polygon;
}

export interface Recommendation {
  plot_id: number;
  date: string;
  et0_mm: number;
  kc: number;
  etc_mm: number;
  effective_rain_mm: number;
  deficit_mm: number;
  irrigation_volume_m3: number;
  pump_minutes: number | null;
  status: Status;
  reason: string;
  confidence: "rendah" | "sedang" | "tinggi";
}

export interface ForecastDay {
  date: string;
  et0_mm: number;
  rain_mm: number;
  deficit_mm: number;
  irrigation_volume_m3: number;
  status: Status;
}

export interface HazardAlert {
  type: "kekeringan" | "hujan_ekstrem" | "anomali_ndvi";
  severity: "info" | "waspada" | "kritis";
  date: string;
  message: string;
  suggested_action: string;
}
```

**`src/lib/api.ts`**

```ts
const BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api/v1";

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
    cache: "no-store",
  });
  if (!res.ok) {
    let detail = res.statusText;
    try {
      detail = (await res.json()).detail ?? detail;
    } catch {}
    throw new Error(typeof detail === "string" ? detail : JSON.stringify(detail));
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}
```

### 7.3 Komponen peta

**`src/components/map/MapView.tsx`**

```tsx
"use client";

import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { TerraDraw, TerraDrawPolygonMode, TerraDrawSelectMode } from "terra-draw";
import { TerraDrawMapLibreGLAdapter } from "terra-draw-maplibre-gl-adapter";
import * as turf from "@turf/turf";
import type { Plot } from "@/types/api";

interface Props {
  plots: Plot[];
  selectedId: number | null;
  drawing: boolean;
  resetKey: number; // naikkan nilainya untuk menghapus gambar sementara
  onSelect: (id: number) => void;
  onDrawn: (geometry: GeoJSON.Polygon, areaHa: number) => void;
}

const STYLE: maplibregl.StyleSpecification = {
  version: 8,
  sources: {
    osm: {
      type: "raster",
      tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
      tileSize: 256,
      attribution: "© OpenStreetMap contributors",
    },
    esri: {
      type: "raster",
      tiles: [
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      ],
      tileSize: 256,
      attribution: "Esri, Maxar, Earthstar Geographics",
    },
  },
  layers: [
    { id: "esri", type: "raster", source: "esri" },
    { id: "osm", type: "raster", source: "osm", layout: { visibility: "none" } },
  ],
};

export default function MapView({ plots, selectedId, drawing, resetKey, onSelect, onDrawn }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const drawRef = useRef<TerraDraw | null>(null);
  const [ready, setReady] = useState(false);
  const [satellite, setSatellite] = useState(true);

  // simpan callback di ref agar event handler tidak basi
  const onDrawnRef = useRef(onDrawn);
  const onSelectRef = useRef(onSelect);
  onDrawnRef.current = onDrawn;
  onSelectRef.current = onSelect;

  // inisialisasi peta + Terra Draw
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: STYLE,
      center: [107.6098, -6.9147],
      zoom: 11,
    });
    map.addControl(new maplibregl.NavigationControl(), "top-right");
    map.addControl(
      new maplibregl.GeolocateControl({ positionOptions: { enableHighAccuracy: true } }),
      "top-right",
    );
    mapRef.current = map;

    map.on("load", () => {
      map.addSource("plots", { type: "geojson", data: { type: "FeatureCollection", features: [] } });
      map.addLayer({
        id: "plots-fill",
        type: "fill",
        source: "plots",
        paint: {
          "fill-color": ["case", ["==", ["get", "selected"], 1], "#16a34a", "#3b82f6"],
          "fill-opacity": 0.35,
        },
      });
      map.addLayer({
        id: "plots-line",
        type: "line",
        source: "plots",
        paint: { "line-color": "#ffffff", "line-width": 2 },
      });
      map.on("click", "plots-fill", (e) => {
        const id = e.features?.[0]?.properties?.id;
        if (id !== undefined) onSelectRef.current(Number(id));
      });
      map.on("mouseenter", "plots-fill", () => (map.getCanvas().style.cursor = "pointer"));
      map.on("mouseleave", "plots-fill", () => (map.getCanvas().style.cursor = ""));

      const draw = new TerraDraw({
        adapter: new TerraDrawMapLibreGLAdapter({ map, lib: maplibregl }),
        modes: [new TerraDrawPolygonMode(), new TerraDrawSelectMode()],
      });
      draw.start();
      draw.setMode("select");
      draw.on("finish", (id, context) => {
        if (context.action !== "draw") return;
        const feature = draw.getSnapshot().find((f) => f.id === id);
        if (feature && feature.geometry.type === "Polygon") {
          const areaHa = turf.area(feature as GeoJSON.Feature) / 10_000;
          onDrawnRef.current(feature.geometry as GeoJSON.Polygon, areaHa);
        }
      });
      drawRef.current = draw;
      setReady(true);
    });

    return () => {
      drawRef.current?.stop();
      drawRef.current = null;
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // sinkronkan poligon tersimpan ke peta
  useEffect(() => {
    const map = mapRef.current;
    if (!ready || !map) return;
    const src = map.getSource("plots") as maplibregl.GeoJSONSource | undefined;
    src?.setData({
      type: "FeatureCollection",
      features: plots.map((p) => ({
        type: "Feature",
        properties: { id: p.id, selected: p.id === selectedId ? 1 : 0 },
        geometry: p.geometry,
      })),
    });
  }, [plots, selectedId, ready]);

  // zoom ke poligon terpilih
  useEffect(() => {
    const map = mapRef.current;
    const plot = plots.find((p) => p.id === selectedId);
    if (!ready || !map || !plot) return;
    const [minX, minY, maxX, maxY] = turf.bbox(plot.geometry);
    map.fitBounds([[minX, minY], [maxX, maxY]], { padding: 80, maxZoom: 17, duration: 800 });
  }, [selectedId, ready]); // sengaja tidak memasukkan `plots` agar tidak zoom ulang

  // mode gambar
  useEffect(() => {
    if (!ready) return;
    drawRef.current?.setMode(drawing ? "polygon" : "select");
  }, [drawing, ready]);

  // hapus gambar sementara
  useEffect(() => {
    if (ready) drawRef.current?.clear();
  }, [resetKey, ready]);

  // ganti basemap
  useEffect(() => {
    const map = mapRef.current;
    if (!ready || !map) return;
    map.setLayoutProperty("esri", "visibility", satellite ? "visible" : "none");
    map.setLayoutProperty("osm", "visibility", satellite ? "none" : "visible");
  }, [satellite, ready]);

  return (
    <div className="relative h-full w-full">
      <div ref={containerRef} className="h-full w-full" />
      <button
        onClick={() => setSatellite((s) => !s)}
        className="absolute bottom-6 left-3 rounded bg-white px-3 py-1.5 text-xs font-medium shadow"
      >
        {satellite ? "Peta jalan" : "Satelit"}
      </button>
    </div>
  );
}
```

> Terra Draw masih sering berubah antar versi. Bila ada error tipe pada `draw.on("finish", ...)` atau nama mode, cek dokumentasi versi yang terpasang (`npm ls terra-draw`).

### 7.4 Komponen UI

**`src/components/plot/PlotForm.tsx`**

```tsx
"use client";

import { useState } from "react";
import type { Crop, Method } from "@/types/api";

interface Props {
  areaHa: number;
  submitting: boolean;
  onSubmit: (v: { name: string; crop: Crop; planting_date: string; irrigation_method: Method }) => void;
  onCancel: () => void;
}

export default function PlotForm({ areaHa, submitting, onSubmit, onCancel }: Props) {
  const [name, setName] = useState("");
  const [crop, setCrop] = useState<Crop>("padi");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [method, setMethod] = useState<Method>("genangan");

  const field = "mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm";

  return (
    <div className="space-y-3 rounded-lg border bg-white p-4">
      <p className="text-sm text-gray-600">
        Luas terdeteksi: <b>{areaHa.toFixed(2)} ha</b>
      </p>
      <label className="block text-sm">
        Nama lahan
        <input className={field} value={name} onChange={(e) => setName(e.target.value)} placeholder="Sawah Pak Ujang" />
      </label>
      <label className="block text-sm">
        Komoditas
        <select className={field} value={crop} onChange={(e) => setCrop(e.target.value as Crop)}>
          <option value="padi">Padi</option>
          <option value="jagung">Jagung</option>
          <option value="cabai">Cabai</option>
          <option value="bawang_merah">Bawang merah</option>
        </select>
      </label>
      <label className="block text-sm">
        Tanggal tanam
        <input type="date" className={field} value={date} onChange={(e) => setDate(e.target.value)} />
      </label>
      <label className="block text-sm">
        Metode irigasi
        <select className={field} value={method} onChange={(e) => setMethod(e.target.value as Method)}>
          <option value="genangan">Genangan</option>
          <option value="alur">Alur</option>
          <option value="tetes">Tetes</option>
          <option value="pompa">Pompa</option>
        </select>
      </label>
      <div className="flex gap-2">
        <button
          disabled={!name.trim() || submitting}
          onClick={() => onSubmit({ name: name.trim(), crop, planting_date: date, irrigation_method: method })}
          className="flex-1 rounded bg-green-600 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {submitting ? "Menyimpan..." : "Simpan lahan"}
        </button>
        <button onClick={onCancel} className="rounded border px-3 py-2 text-sm">
          Batal
        </button>
      </div>
    </div>
  );
}
```

**`src/components/plot/RecommendationCard.tsx`**

```tsx
import type { Recommendation, Status } from "@/types/api";

const COLOR: Record<Status, string> = {
  aman: "bg-green-100 text-green-800",
  waspada: "bg-yellow-100 text-yellow-800",
  kritis: "bg-red-100 text-red-800",
};

export default function RecommendationCard({ rec }: { rec: Recommendation }) {
  return (
    <div className="space-y-3 rounded-lg border bg-white p-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Rekomendasi hari ini</h3>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase ${COLOR[rec.status]}`}>
          {rec.status}
        </span>
      </div>

      {rec.irrigation_volume_m3 > 0 ? (
        <p className="text-sm">
          Berikan <b>{rec.irrigation_volume_m3} m³</b> ({rec.deficit_mm} mm defisit)
          {rec.pump_minutes ? <> | pompa sekitar <b>{rec.pump_minutes} menit</b> pada 8 L/detik</> : null}.
        </p>
      ) : (
        <p className="text-sm">Tidak perlu irigasi hari ini.</p>
      )}

      <dl className="grid grid-cols-3 gap-2 text-center text-xs">
        <div className="rounded bg-gray-50 p-2"><dt className="text-gray-500">ET₀</dt><dd className="font-semibold">{rec.et0_mm} mm</dd></div>
        <div className="rounded bg-gray-50 p-2"><dt className="text-gray-500">Kc</dt><dd className="font-semibold">{rec.kc}</dd></div>
        <div className="rounded bg-gray-50 p-2"><dt className="text-gray-500">Hujan efektif</dt><dd className="font-semibold">{rec.effective_rain_mm} mm</dd></div>
      </dl>

      <p className="text-xs text-gray-500">{rec.reason}</p>
      <p className="text-xs text-gray-500">
        Tingkat keyakinan: <b>{rec.confidence}</b>
        {rec.confidence === "rendah" && " (belum memakai data NDVI)"}
      </p>
    </div>
  );
}
```

**`src/components/alerts/AlertList.tsx`**

```tsx
import type { HazardAlert } from "@/types/api";

const BORDER = {
  info: "border-blue-300 bg-blue-50",
  waspada: "border-yellow-300 bg-yellow-50",
  kritis: "border-red-300 bg-red-50",
} as const;

export default function AlertList({ alerts }: { alerts: HazardAlert[] }) {
  return (
    <div className="space-y-2">
      <h3 className="font-semibold">Peringatan dini 7 hari</h3>
      {alerts.length === 0 && (
        <p className="rounded border bg-white p-3 text-sm text-gray-600">Tidak ada risiko terdeteksi.</p>
      )}
      {alerts.map((a, i) => (
        <div key={i} className={`rounded border p-3 text-sm ${BORDER[a.severity]}`}>
          <p className="font-medium">{a.message}</p>
          <p className="mt-1 text-xs text-gray-700">Saran: {a.suggested_action}</p>
        </div>
      ))}
    </div>
  );
}
```

**`src/components/charts/ForecastChart.tsx`**

```tsx
"use client";

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { ForecastDay } from "@/types/api";

export default function ForecastChart({ data }: { data: ForecastDay[] }) {
  const rows = data.map((d) => ({ ...d, label: d.date.slice(5) }));
  return (
    <div className="rounded-lg border bg-white p-4">
      <h3 className="mb-2 font-semibold">Defisit & hujan 7 hari</h3>
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={rows}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="label" fontSize={11} />
            <YAxis fontSize={11} unit=" mm" />
            <Tooltip />
            <Legend />
            <Bar dataKey="deficit_mm" name="Defisit" fill="#ef4444" />
            <Bar dataKey="rain_mm" name="Hujan" fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
```

### 7.5 Halaman

**`src/app/dashboard/page.tsx`**

```tsx
"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useState } from "react";
import AlertList from "@/components/alerts/AlertList";
import ForecastChart from "@/components/charts/ForecastChart";
import PlotForm from "@/components/plot/PlotForm";
import RecommendationCard from "@/components/plot/RecommendationCard";
import { api } from "@/lib/api";
import type { ForecastDay, HazardAlert, Plot, PlotCreate, Recommendation } from "@/types/api";

const MapView = dynamic(() => import("@/components/map/MapView"), { ssr: false });

export default function DashboardPage() {
  const [plots, setPlots] = useState<Plot[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [drawing, setDrawing] = useState(false);
  const [draft, setDraft] = useState<{ geometry: GeoJSON.Polygon; areaHa: number } | null>(null);
  const [resetKey, setResetKey] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [rec, setRec] = useState<Recommendation | null>(null);
  const [forecast, setForecast] = useState<ForecastDay[]>([]);
  const [alerts, setAlerts] = useState<HazardAlert[]>([]);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);

  const loadPlots = useCallback(async () => {
    try {
      setPlots(await api<Plot[]>("/plots"));
    } catch (e) {
      setError((e as Error).message);
    }
  }, []);

  useEffect(() => {
    loadPlots();
  }, [loadPlots]);

  useEffect(() => {
    if (selectedId === null) return;
    let cancelled = false;
    setLoadingAnalytics(true);
    setError(null);
    Promise.all([
      api<Recommendation>(`/plots/${selectedId}/recommendation`),
      api<ForecastDay[]>(`/plots/${selectedId}/forecast`),
      api<HazardAlert[]>(`/plots/${selectedId}/alerts`),
    ])
      .then(([r, f, a]) => {
        if (cancelled) return;
        setRec(r);
        setForecast(f);
        setAlerts(a);
      })
      .catch((e) => !cancelled && setError((e as Error).message))
      .finally(() => !cancelled && setLoadingAnalytics(false));
    return () => {
      cancelled = true;
    };
  }, [selectedId]);

  async function handleSave(v: Omit<PlotCreate, "geometry">) {
    if (!draft) return;
    setSaving(true);
    setError(null);
    try {
      const created = await api<Plot>("/plots", {
        method: "POST",
        body: JSON.stringify({ ...v, geometry: draft.geometry }),
      });
      setDraft(null);
      setDrawing(false);
      setResetKey((k) => k + 1);
      await loadPlots();
      setSelectedId(created.id);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  function cancelDraft() {
    setDraft(null);
    setDrawing(false);
    setResetKey((k) => k + 1);
  }

  async function loadDemo() {
    setError(null);
    try {
      const demo = await api<Plot[]>("/demo/load", { method: "POST" });
      await loadPlots();
      if (demo[0]) setSelectedId(demo[0].id);
    } catch (e) {
      setError((e as Error).message);
    }
  }

  return (
    <main className="flex h-screen flex-col md:flex-row">
      <aside className="max-h-[55vh] w-full shrink-0 space-y-4 overflow-y-auto border-b bg-gray-50 p-4 md:max-h-none md:w-[400px] md:border-b-0 md:border-r">
        <header>
          <h1 className="text-xl font-bold text-green-700">LahanSense</h1>
          <p className="text-xs text-gray-500">Intelijen irigasi tanpa sensor</p>
        </header>

        {error && <p className="rounded border border-red-300 bg-red-50 p-2 text-xs text-red-700">{error}</p>}

        {!draft && (
          <div className="flex gap-2">
            <button
              onClick={() => setDrawing((d) => !d)}
              className={`flex-1 rounded px-3 py-2 text-sm font-medium text-white ${drawing ? "bg-orange-500" : "bg-green-600"}`}
            >
              {drawing ? "Klik titik sudut, klik ulang titik awal untuk selesai" : "Gambar lahan"}
            </button>
            <button onClick={loadDemo} className="rounded border bg-white px-3 py-2 text-sm">
              Mode demo
            </button>
          </div>
        )}

        {draft && (
          <PlotForm areaHa={draft.areaHa} submitting={saving} onSubmit={handleSave} onCancel={cancelDraft} />
        )}

        {plots.length > 0 && !draft && (
          <div>
            <h3 className="mb-1 text-sm font-semibold">Lahan Anda</h3>
            <ul className="space-y-1">
              {plots.map((p) => (
                <li key={p.id}>
                  <button
                    onClick={() => setSelectedId(p.id)}
                    className={`w-full rounded border px-3 py-2 text-left text-sm ${
                      p.id === selectedId ? "border-green-600 bg-green-50" : "bg-white"
                    }`}
                  >
                    <span className="font-medium">{p.name}</span>
                    <span className="block text-xs text-gray-500">
                      {p.crop} | {p.area_ha.toFixed(2)} ha
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {loadingAnalytics && <p className="text-sm text-gray-500">Menghitung rekomendasi...</p>}
        {!loadingAnalytics && rec && selectedId !== null && !draft && (
          <>
            <RecommendationCard rec={rec} />
            <ForecastChart data={forecast} />
            <AlertList alerts={alerts} />
          </>
        )}
      </aside>

      <section className="min-h-[45vh] flex-1">
        <MapView
          plots={plots}
          selectedId={selectedId}
          drawing={drawing}
          resetKey={resetKey}
          onSelect={setSelectedId}
          onDrawn={(geometry, areaHa) => {
            setDraft({ geometry, areaHa });
            setDrawing(false);
          }}
        />
      </section>
    </main>
  );
}
```

**`src/app/page.tsx`**

```tsx
import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center">
      <h1 className="text-4xl font-bold text-green-700">LahanSense</h1>
      <p className="max-w-md text-gray-600">
        Tanpa sensor. Gambar lahan Anda, dapatkan rekomendasi irigasi harian dan peringatan dini kekeringan.
      </p>
      <Link href="/dashboard" className="rounded bg-green-600 px-5 py-3 font-medium text-white">
        Mulai
      </Link>
    </main>
  );
}
```

### 7.6 Jalankan & verifikasi

```bash
npm run dev
```

Buka http://localhost:3000/dashboard (backend harus sudah jalan di port 8000). Alur uji:

1. Klik **Mode demo** → 3 lahan muncul di daftar, rekomendasi, grafik, dan alert tampil.
2. Klik **Gambar lahan** → klik titik-titik sudut di peta → selesaikan poligon → isi form → **Simpan lahan**.
3. Rekomendasi muncul untuk lahan baru.

---

## 8. Kontrak API

> Perubahan kontrak harus lewat PR ke `docs/api-contract.md` dan disetujui FE + BE. Base URL: `/api/v1`.

| Method | Endpoint | Status |
|--------|----------|--------|
| GET | `/health`, `/health/db` | Siap |
| GET / POST | `/plots` | Siap |
| GET / DELETE | `/plots/{id}` | Siap |
| GET | `/plots/{id}/recommendation?date=YYYY-MM-DD` | Siap (tanpa NDVI) |
| GET | `/plots/{id}/forecast` | Siap |
| GET | `/plots/{id}/alerts` | Siap (kekeringan & hujan ekstrem) |
| GET | `/plots/{id}/ndvi` | Stub |
| POST | `/plots/{id}/irrigation-log` | Belum ada |
| GET | `/plots/{id}/efficiency` | Belum ada |
| POST | `/demo/load` | Siap |

**Contoh `POST /plots`**

```json
{
  "name": "Sawah Pak Ujang",
  "crop": "padi",
  "planting_date": "2026-10-20",
  "irrigation_method": "genangan",
  "geometry": {
    "type": "Polygon",
    "coordinates": [[[107.60, -6.91], [107.61, -6.91], [107.61, -6.92], [107.60, -6.92], [107.60, -6.91]]]
  }
}
```

**Error seragam:** `{ "detail": "Pesan error yang bisa dibaca manusia" }`

---

## 9. Alur Git: GitFlow + Pull Request

### 9.1 Branch

| Branch | Fungsi | Dibuat dari | Merge ke |
|--------|--------|-------------|----------|
| `main` | Stabil, siap demo & deploy | n/a | n/a |
| `develop` | Integrasi seluruh fitur | `main` | `main` (via release) |
| `feature/<scope>-<deskripsi>` | Satu fitur oleh satu orang | `develop` | `develop` (PR) |
| `fix/<scope>-<deskripsi>` | Perbaikan bug biasa | `develop` | `develop` (PR) |
| `release/<versi>` | Persiapan demo | `develop` | `main` + `develop` |
| `hotfix/<deskripsi>` | Bug kritis di `main` | `main` | `main` + `develop` |

Prefix scope: `be-`, `fe-`, `data-`, `infra-`, `docs-`. Contoh: `feature/be-irrigation-log`, `feature/fe-ndvi-layer`.

### 9.2 Alur harian

```bash
git checkout develop && git pull origin develop
git checkout -b feature/fe-polygon-draw

# kerjakan, commit kecil & sering
git add .
git commit -m "feat(fe): tambah kontrol gambar poligon"

# sinkronkan sebelum push
git fetch origin
git rebase origin/develop

git push -u origin feature/fe-polygon-draw
gh pr create --base develop --fill      # atau lewat UI GitHub
```

### 9.3 Aturan PR

1. Target PR selalu **`develop`** (kecuali release/hotfix).
2. Minimal **1 reviewer** dari anggota lain; dilarang approve PR sendiri.
3. **CI harus hijau.**
4. PR kecil (idealnya < 400 baris).
5. Merge dengan **Squash and merge**, lalu hapus branch.
6. Review maksimal **2 jam** saat hackathon.
7. Konflik diselesaikan oleh pembuat PR (rebase).
8. PR yang mengubah model wajib menyertakan **file migrasi Alembic**.

### 9.4 Konvensi commit

Format: `<tipe>(<scope>): <deskripsi>`. Tipe: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`, `style`.

```
feat(be): tambah endpoint irrigation-log
fix(fe): perbaiki peta tidak resize di mobile
chore(infra): tambah workflow CI backend
```

### 9.5 `.github/pull_request_template.md`

```markdown
## Deskripsi
<!-- Apa yang dikerjakan dan kenapa? -->

## Jenis Perubahan
- [ ] Fitur baru
- [ ] Perbaikan bug
- [ ] Refactor
- [ ] Dokumentasi / konfigurasi

## Issue Terkait
Closes #

## Cara Menguji
1.
2.

## Screenshot / Rekaman (jika UI)

## Checklist
- [ ] Branch dari `develop` dan sudah di-rebase terbaru
- [ ] Berjalan lokal tanpa error
- [ ] Lint & test lolos
- [ ] Tidak ada secret / `.env` ikut ter-commit
- [ ] Kontrak API diperbarui (jika berubah)
- [ ] File migrasi Alembic disertakan (jika model berubah)
```

### 9.6 `.github/CODEOWNERS`

```
/backend/                              @username-firmansyah
/frontend/                             @username-daffa
/backend/app/services/satellite.py     @username-hilmi
/backend/app/services/et0.py           @username-hilmi
/backend/app/services/water_balance.py @username-hilmi
/docs/                                 @username-firmansyah @username-daffa @username-hilmi
```

Ganti `username-*` dengan username GitHub masing-masing.

### 9.7 CI

**`.github/workflows/backend-ci.yml`**

```yaml
name: Backend CI
on:
  pull_request:
    paths: ["backend/**"]
jobs:
  test:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: backend
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: "3.11"
      - run: pip install -r requirements-dev.txt
      - run: ruff check .
      - run: pytest -q
        env:
          DATABASE_URL: postgresql+psycopg://u:p@localhost:5432/test
```

**`.github/workflows/frontend-ci.yml`**

```yaml
name: Frontend CI
on:
  pull_request:
    paths: ["frontend/**"]
jobs:
  build:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: frontend
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
          cache-dependency-path: frontend/package-lock.json
      - run: npm ci
      - run: npm run lint
      - run: npm run build
```

> Test di CI tidak menyentuh database Supabase asli. Jangan pernah menaruh `DATABASE_URL` produksi di workflow PR.

### 9.8 Rilis & demo

```bash
git checkout develop && git pull
git checkout -b release/v0.1.0
# hanya bugfix kecil di sini, lalu:
git checkout main && git merge --no-ff release/v0.1.0
git tag v0.1.0 && git push origin main --tags
git checkout develop && git merge --no-ff release/v0.1.0 && git push origin develop
```

---

## 10. Pembagian Tugas & Branch

> Proposal memberi contoh 4 peran, tim berjumlah 3 orang. Produk/Pitch dikerjakan bersama.

| Anggota | Peran | Fokus |
|---------|-------|-------|
| **Moch Firmansyah** | Backend + Infra | FastAPI, Supabase, migrasi, deploy |
| **Muhammad Daffa** | Frontend/UX | Peta, dashboard, mode demo, tampilan mobile |
| **Listianto Hilmi Fauzaan** | Data/Geospasial | NDVI, kalibrasi Kc, validasi model |

### Sprint 0: Fondasi

| # | Branch | Pemilik | Tugas |
|---|--------|---------|-------|
| 0.1 | `chore/infra-init` | Firmansyah | Repo, branch protection, CI, template PR, setup Supabase |
| 0.2 | `feature/be-init` | Firmansyah | Scaffold backend (bagian 6) + migrasi pertama |
| 0.3 | `feature/fe-init` | Daffa | Scaffold frontend (bagian 7) |
| 0.4 | `feature/data-init` | Hilmi | Notebook eksplorasi Sentinel-2 (STAC) + validasi ET₀ |

### Sprint 1: Fitur (paralel)

**Firmansyah**

| Branch | Tugas |
|--------|-------|
| `feature/be-weather-ingest` | Simpan cuaca ke tabel DB sebagai cache persisten (ganti cache in-memory) |
| `feature/be-scheduler` | Refresh data harian (APScheduler/cron) |
| `feature/be-irrigation-log` | `POST /irrigation-log` + `GET /efficiency` (skor 0-100) |
| `feature/be-deploy` | Deploy backend (Railway/Fly.io) + env produksi |

**Muhammad Daffa**

| Branch | Tugas |
|--------|-------|
| `feature/fe-polish-mobile` | Responsif mobile-first, loading & empty state |
| `feature/fe-ndvi-layer` | Peta panas NDVI di dalam poligon |
| `feature/fe-date-slider` | Slider tanggal untuk demo skenario "waktu" |
| `feature/fe-efficiency-ui` | Tampilan skor efisiensi + form input air aktual |
| `feature/fe-deploy` | Deploy Vercel |

**Listianto Hilmi**

| Branch | Tugas |
|--------|-------|
| `feature/data-ndvi-pipeline` | Isi `services/satellite.py`: STAC, filter awan, NDVI zonal; simpan ke `ndvi_observations` |
| `feature/data-kc-calibration` | Kalibrasi `kc_from_ndvi` per komoditas, tinjau `CROP_PARAMS` |
| `feature/data-ndvi-anomaly` | Deteksi anomali NDVI untuk alert `anomali_ndvi` |
| `feature/data-validation` | Validasi hasil + dokumentasi asumsi untuk juri |

### Titik integrasi

| Titik | Kesepakatan |
|-------|-------------|
| Fungsi `compute_day` | Milik Data; BE hanya memanggil, tidak mengubah rumus tanpa sepengetahuan Hilmi |
| NDVI → rekomendasi | Hilmi menyediakan `get_latest_ndvi()`; Firmansyah menyambungkannya di `analytics.py` (ada tanda `TODO`) |
| Bentuk response | Mengikuti bagian 8; ubah lewat PR kontrak |
| Data demo | Satu sumber: `api/v1/demo.py` |

---

## 11. Standar Kode & Definition of Done

**Backend:** `ruff check . && ruff format .`; type hints pada fungsi publik; rumus (ET₀, Kc, defisit) berupa **fungsi murni** dengan unit test; endpoint tidak memanggil API eksternal tanpa lewat `services/`.

**Frontend:** `npm run lint`; komponen `PascalCase.tsx`; peta wajib `"use client"` + `dynamic(..., { ssr: false })`; semua request lewat `lib/api.ts`; **mobile-first**.

**Definition of Done:**

- [ ] Berjalan lokal sesuai deskripsi tugas
- [ ] Lint, test, dan build lolos
- [ ] Ada test untuk logika penting (BE/Data)
- [ ] Kontrak API terdokumentasi bila berubah
- [ ] Migrasi disertakan bila model berubah
- [ ] PR di-approve minimal 1 orang dan ter-merge ke `develop`
- [ ] Tetap berfungsi dalam **Mode Demo**

**Keamanan:** jangan commit `.env` atau kredensial; perbarui `.env.example` saat menambah variabel; validasi input poligon di backend (sudah ada: tipe, validitas, batas luas).

---

## 12. Timeline 48 Jam

| Jam | Fokus | Output |
|-----|-------|--------|
| 0-2 | **Inisiasi** (dokumen ini) | Repo, Supabase, backend + frontend jalan, demo load berfungsi |
| 2-14 | Sprint 1: fitur inti | NDVI pipeline, irrigation-log, UI mobile, ndvi layer |
| 14-26 | Integrasi | NDVI masuk rekomendasi, efisiensi tampil, scheduler |
| 26-36 | Demo-proofing | Pre-cache, slider tanggal, deploy FE + BE |
| 36-44 | Polish & bug fixing | UI rapi, tes di HP, tes tanpa internet (mode demo) |
| 44-48 | **Feature freeze** & pitch | `release/v0.1.0`, video cadangan, latihan skrip 3 menit |

> **Feature freeze 4 jam sebelum presentasi.** Setelah itu hanya `fix/` atau `hotfix/`.

---

## 13. Troubleshooting

| Masalah | Solusi |
|---------|--------|
| `connection refused` / timeout ke Supabase | Pastikan memakai **Session pooler** (bukan Direct connection yang IPv6-only) dan port 5432 |
| `password authentication failed` | Username pooler harus `postgres.<project-ref>`; cek password, reset bila perlu |
| `type "geometry" does not exist` | PostGIS belum aktif: jalankan `CREATE EXTENSION postgis WITH SCHEMA extensions;` |
| Alembic ingin menghapus `spatial_ref_sys` | Tambahkan `include_object` di `env.py` (bagian 6.8) |
| Migrasi error `NameError: geoalchemy2` | Tambahkan `import geoalchemy2` di file migrasi |
| `/health/db` error | Cek `DATABASE_URL` di `backend/.env` dan awalan `postgresql+psycopg://` |
| CORS error dari FE | `CORS_ORIGINS` di `backend/.env` harus memuat `http://localhost:3000` |
| Peta error `window is not defined` | `MapView` harus di-import dengan `dynamic(..., { ssr: false })` |
| Poligon tidak bisa digambar | Cek versi Terra Draw (`npm ls terra-draw`) dan dokumentasinya |
| Open-Meteo gagal / lambat | Dengan `DEMO_MODE=true` backend memakai data sintetis |
| Konflik saat rebase | Selesaikan, `git rebase --continue`; bila kacau `git rebase --abort` |
| Push ke `develop` ditolak | Memang diproteksi; buat branch fitur dan buka PR |
| Password database sempat tersebar | Reset di Supabase, kirim connection string baru; password yang pernah ter-commit dianggap bocor |

---

## 14. Checklist Inisiasi

### Repo owner (Firmansyah)
- [ ] Buat repo GitHub, undang anggota
- [ ] Buat project Supabase (region Singapore), aktifkan PostGIS
- [ ] Ambil **Session pooler** connection string, kirim lewat kanal privat
- [ ] Nonaktifkan Data API Supabase
- [ ] Scaffold backend, `alembic upgrade head` sukses, `/health/db` menampilkan versi PostGIS
- [ ] Push `main` + `develop`, set default branch `develop`
- [ ] Aktifkan branch protection, tambahkan template PR, CODEOWNERS, CI
- [ ] Taruh PDF proposal di `docs/proposal/`

### Setiap anggota
- [ ] `git clone`, `git checkout develop`
- [ ] Backend: venv, `pip install -r requirements-dev.txt`, `.env` terisi, `pytest -q` lolos, `/docs` terbuka
- [ ] Frontend: `npm install`, `.env.local` terisi, `/dashboard` menampilkan peta
- [ ] Coba alur lengkap: **Mode demo** → pilih lahan → rekomendasi + grafik + alert
- [ ] Paham alur: branch dari `develop` → commit → rebase → PR → review → squash merge
- [ ] Buat branch fitur pertama sesuai tabel Sprint 0/1

### Kesepakatan tim
- [ ] Kontrak API (bagian 8) disetujui
- [ ] Siapa yang menjalankan migrasi database bersama ditetapkan
- [ ] Jadwal sinkronisasi singkat (mis. tiap 4 jam) ditetapkan
- [ ] Skenario demo & 3-4 lokasi contoh dipilih

---

*Dokumen ini titik awal; perbarui lewat PR ke `develop` seiring project berkembang.*
