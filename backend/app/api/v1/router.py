from fastapi import APIRouter

from app.api.v1 import analytics, demo, health, plots

api_router = APIRouter()
api_router.include_router(health.router, tags=["health"])
api_router.include_router(plots.router, prefix="/plots", tags=["plots"])
api_router.include_router(analytics.router, prefix="/plots", tags=["analytics"])
api_router.include_router(demo.router, prefix="/demo", tags=["demo"])
