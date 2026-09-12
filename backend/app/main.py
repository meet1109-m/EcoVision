import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError

from app.config import settings
from app.database import engine, Base
import app.models  # Ensure all models are registered with Base.metadata

from app.routers import (
    health_router,
    auth_router,
    plants_router,
    equipment_router,
    readings_router,
    predict_router,
    emissions_router,
    hotspots_router,
    recommendations_router,
    simulation_router,
    actions_router,
)

# Setup logging
logging.basicConfig(
    level=logging.INFO if not settings.DEBUG else logging.DEBUG,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("ecovision")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application startup & shutdown events."""
    logger.info("Starting up EcoVision backend application...")
    from app.database import check_db_connection
    db_health = check_db_connection()
    if db_health.get("connected"):
        try:
            Base.metadata.create_all(bind=engine)
            logger.info("Database connected. Schema tables verified/created successfully.")
        except Exception as e:
            logger.warning(f"Could not verify tables on connected database: {e}")
    else:
        logger.warning(
            f"Database not connected at startup ({db_health.get('dialect')}). "
            "Ensure PostgreSQL is running or run Alembic migrations."
        )
    yield
    logger.info("Shutting down EcoVision backend application...")


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description=settings.DESCRIPTION,
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# Configure CORS
origins = settings.CORS_ORIGINS if isinstance(settings.CORS_ORIGINS, list) else [settings.CORS_ORIGINS]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins if origins else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Exception Handlers
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    logger.error(f"Validation error on {request.method} {request.url.path}: {exc}")
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"detail": exc.errors(), "message": "Input validation failed"},
    )


# Root Endpoint
@app.get("/", tags=["Root"])
def root():
    return {
        "app": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "docs": "/docs",
        "health": "/health",
        "status": "online",
    }


# Register all router groups (supports both native paths and /api/v1 paths)
app.include_router(health_router)
app.include_router(auth_router)
app.include_router(plants_router)
app.include_router(equipment_router)
app.include_router(readings_router)
app.include_router(predict_router)
app.include_router(emissions_router)
app.include_router(hotspots_router)
app.include_router(recommendations_router)
app.include_router(simulation_router)
app.include_router(actions_router)
