# LahanSense

> Tim **SundaSundaJawa** | CR Youth 2026 Hackathon  
> Modul: **AgriWatch** + **WaterCast**  
> Database: **Supabase (PostgreSQL + PostGIS)**

Intelijen irigasi presisi tanpa sensor fisik menggunakan citra satelit (NDVI Sentinel-2) dan cuaca terbuka (Open-Meteo) berbasis neraca air FAO-56.

---

## Tech Stack

- **Frontend:** Next.js (App Router), TypeScript, Tailwind CSS, MapLibre GL JS, Terra Draw, Recharts
- **Backend:** FastAPI (Python 3.11+), SQLAlchemy 2, GeoAlchemy2, Alembic
- **Database:** Supabase (PostgreSQL + PostGIS)
- **Cuaca:** Open-Meteo API
- **Deployment:** Vercel (FE) + Railway / Fly.io (BE)

---

## Panduan Menjalankan Lokal

### 1. Backend

```bash
cd backend
python -m venv .venv
# Linux/macOS:
source .venv/bin/activate
# Windows:
.venv\Scripts\Activate.ps1

pip install -r requirements-dev.txt
cp .env.example .env
# Edit .env dan sesuaikan DATABASE_URL Supabase

# Menjalankan backend:
uvicorn app.main:app --reload --port 8000
```

- API Docs: http://localhost:8000/docs
- Health check: http://localhost:8000/api/v1/health
- DB & PostGIS check: http://localhost:8000/api/v1/health/db

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env.local

# Menjalankan frontend:
npm run dev
```

- Buka http://localhost:3000/dashboard

