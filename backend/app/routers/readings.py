from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
import math
from app.database import get_db
from app.schemas.process_reading import (
    ProcessReadingCreate,
    ProcessReadingResponse,
    ProcessReadingFilter,
)
from app.schemas.common import PaginatedResponse
from app.services.reading_service import create_reading, get_reading, query_readings

router = APIRouter(tags=["Readings"])


@router.get("/readings", response_model=PaginatedResponse[ProcessReadingResponse])
@router.get("/api/v1/readings", response_model=PaginatedResponse[ProcessReadingResponse])
def get_readings(
    plant_id: Optional[str] = Query(None, description="Filter by Plant ID"),
    process_unit_id: Optional[str] = Query(None, description="Filter by Process Unit ID"),
    equipment_id: Optional[str] = Query(None, description="Filter by Equipment ID"),
    risk_class: Optional[str] = Query(None, description="Filter by Risk Class (normal, warning, leak_suspected, critical)"),
    leak_severity: Optional[str] = Query(None, description="Filter by Severity (none, low, medium, high, critical)"),
    incident_only: Optional[bool] = Query(None, description="Show only readings with incident_label > 0"),
    shift: Optional[str] = Query(None, description="Filter by Shift (Morning, Afternoon, Night)"),
    start_date: Optional[datetime] = Query(None, description="Start date/time"),
    end_date: Optional[datetime] = Query(None, description="End date/time"),
    page: int = Query(1, ge=1),
    size: int = Query(50, ge=1, le=500),
    db: Session = Depends(get_db),
):
    """Query time-series process readings with multi-dimensional filtering and SQL pagination."""
    filter_params = ProcessReadingFilter(
        plant_id=plant_id,
        process_unit_id=process_unit_id,
        equipment_id=equipment_id,
        risk_class=risk_class,
        leak_severity=leak_severity,
        incident_only=incident_only,
        shift=shift,
        start_date=start_date,
        end_date=end_date,
        page=page,
        size=size,
    )
    items, total = query_readings(db, filter_params)
    pages = math.ceil(total / size) if total > 0 else 1
    return PaginatedResponse(
        items=items,
        total=total,
        page=page,
        size=size,
        pages=pages,
    )


@router.post("/readings", response_model=ProcessReadingResponse, status_code=status.HTTP_201_CREATED)
@router.post("/api/v1/readings", response_model=ProcessReadingResponse, status_code=status.HTTP_201_CREATED)
def ingest_reading(reading_in: ProcessReadingCreate, db: Session = Depends(get_db)):
    """Ingest a new telemetry process reading into PostgreSQL."""
    return create_reading(db, reading_in)


@router.get("/readings/{reading_id}", response_model=ProcessReadingResponse)
@router.get("/api/v1/readings/{reading_id}", response_model=ProcessReadingResponse)
def get_reading_detail(reading_id: int, db: Session = Depends(get_db)):
    """Get single process reading record by ID."""
    reading = get_reading(db, reading_id)
    if not reading:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Reading record not found")
    return reading
