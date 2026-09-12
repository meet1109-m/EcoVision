from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.equipment import EquipmentCreate, EquipmentUpdate, EquipmentResponse
from app.schemas.process_reading import ProcessReadingResponse
from app.services.equipment_service import (
    get_equipment_list,
    get_equipment,
    create_equipment,
    update_equipment,
    get_equipment_telemetry,
)

router = APIRouter(tags=["Equipment"])


@router.get("/equipment", response_model=List[EquipmentResponse])
@router.get("/api/v1/equipment", response_model=List[EquipmentResponse])
def list_equipment(
    plant_id: Optional[str] = Query(None, description="Filter by plant ID"),
    process_unit_id: Optional[str] = Query(None, description="Filter by process unit ID"),
    equipment_type: Optional[str] = Query(None, description="Filter by equipment type"),
    maintenance_status: Optional[str] = Query(None, description="Filter by maintenance status (ok, due_soon, overdue)"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db),
):
    """List equipment inventory with filters."""
    return get_equipment_list(
        db,
        plant_id=plant_id,
        process_unit_id=process_unit_id,
        equipment_type=equipment_type,
        maintenance_status=maintenance_status,
        skip=skip,
        limit=limit,
    )


@router.post("/equipment", response_model=EquipmentResponse, status_code=status.HTTP_201_CREATED)
@router.post("/api/v1/equipment", response_model=EquipmentResponse, status_code=status.HTTP_201_CREATED)
def add_equipment(equipment_in: EquipmentCreate, db: Session = Depends(get_db)):
    """Register new equipment asset in PostgreSQL."""
    existing = get_equipment(db, equipment_in.id)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Equipment with ID '{equipment_in.id}' already exists."
        )
    return create_equipment(db, equipment_in)


@router.get("/equipment/{equipment_id}", response_model=EquipmentResponse)
@router.get("/api/v1/equipment/{equipment_id}", response_model=EquipmentResponse)
def get_equipment_detail(equipment_id: str, db: Session = Depends(get_db)):
    """Get equipment specifications and current status."""
    equipment = get_equipment(db, equipment_id)
    if not equipment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Equipment not found")
    return equipment


@router.patch("/equipment/{equipment_id}", response_model=EquipmentResponse)
@router.patch("/api/v1/equipment/{equipment_id}", response_model=EquipmentResponse)
def modify_equipment(
    equipment_id: str, equipment_in: EquipmentUpdate, db: Session = Depends(get_db)
):
    """Update equipment status or parameters."""
    equipment = update_equipment(db, equipment_id, equipment_in)
    if not equipment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Equipment not found")
    return equipment


@router.get("/equipment/{equipment_id}/telemetry", response_model=List[ProcessReadingResponse])
@router.get("/api/v1/equipment/{equipment_id}/telemetry", response_model=List[ProcessReadingResponse])
def get_telemetry(
    equipment_id: str,
    limit: int = Query(50, ge=1, le=500, description="Max readings to retrieve"),
    db: Session = Depends(get_db),
):
    """Get recent time-series telemetry readings for specific equipment."""
    equipment = get_equipment(db, equipment_id)
    if not equipment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Equipment not found")
    return get_equipment_telemetry(db, equipment_id, limit=limit)
