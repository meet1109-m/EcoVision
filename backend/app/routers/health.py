from fastapi import APIRouter, Response, status
from app.config import settings
from app.database import check_db_connection
from app.schemas.common import HealthResponse
from app.ml.inference import predictor

router = APIRouter(tags=["Health"])


@router.get("/health", response_model=HealthResponse)
@router.get("/api/v1/health", response_model=HealthResponse)
def get_health(response: Response):
    """
    System health check verifying:
    - API operational status
    - PostgreSQL live database connection
    - ML model pipeline loaded state
    """
    db_status = check_db_connection()
    is_db_connected = db_status.get("connected", False)
    is_ml_loaded = predictor.is_loaded

    if is_db_connected:
        overall_status = "ok"
    else:
        overall_status = "unhealthy"
        response.status_code = status.HTTP_503_SERVICE_UNAVAILABLE

    return HealthResponse(
        status=overall_status,
        database="connected" if is_db_connected else "disconnected",
        ml_model="loaded" if is_ml_loaded else "not_loaded",
        version=settings.VERSION,
        environment=settings.APP_ENV,
        dialect=db_status.get("dialect", "unknown"),
        database_detail=db_status,
    )
