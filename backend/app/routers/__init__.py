from app.routers.health import router as health_router
from app.routers.auth import router as auth_router
from app.routers.plants import router as plants_router
from app.routers.equipment import router as equipment_router
from app.routers.readings import router as readings_router
from app.routers.predict import router as predict_router
from app.routers.emissions import router as emissions_router
from app.routers.hotspots import router as hotspots_router
from app.routers.recommendations import router as recommendations_router
from app.routers.simulation import router as simulation_router
from app.routers.actions import router as actions_router

__all__ = [
    "health_router",
    "auth_router",
    "plants_router",
    "equipment_router",
    "readings_router",
    "predict_router",
    "emissions_router",
    "hotspots_router",
    "recommendations_router",
    "simulation_router",
    "actions_router",
]
