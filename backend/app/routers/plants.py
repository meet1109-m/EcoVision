from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.plant import PlantCreate, PlantUpdate, PlantResponse, PlantSummaryResponse
from app.schemas.equipment import EquipmentResponse
from app.services.plant_service import (
    get_plants,
    get_plant,
    create_plant,
    update_plant,
    get_plant_summary,
)
from app.services.equipment_service import get_equipment_list

router = APIRouter(tags=["Plants"])


@router.get("/plants", response_model=List[PlantResponse])
@router.get("/api/v1/plants", response_model=List[PlantResponse])
def list_plants(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Retrieve all industrial plants from PostgreSQL."""
    return get_plants(db, skip=skip, limit=limit)


@router.post("/plants", response_model=PlantResponse, status_code=status.HTTP_201_CREATED)
@router.post("/api/v1/plants", response_model=PlantResponse, status_code=status.HTTP_201_CREATED)
def add_plant(plant_in: PlantCreate, db: Session = Depends(get_db)):
    """Register a new industrial plant in PostgreSQL."""
    existing = get_plant(db, plant_in.id)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Plant with ID '{plant_in.id}' already exists."
        )
    return create_plant(db, plant_in)


@router.get("/plants/{plant_id}", response_model=PlantResponse)
@router.get("/api/v1/plants/{plant_id}", response_model=PlantResponse)
def get_plant_detail(plant_id: str, db: Session = Depends(get_db)):
    """Get single plant details by ID."""
    plant = get_plant(db, plant_id)
    if not plant:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Plant not found")
    return plant


@router.get("/plants/{plant_id}/equipment", response_model=List[EquipmentResponse])
@router.get("/api/v1/plants/{plant_id}/equipment", response_model=List[EquipmentResponse])
def get_plant_equipment(plant_id: str, skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Get all equipment belonging to a specific plant."""
    plant = get_plant(db, plant_id)
    if not plant:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Plant not found")
    return get_equipment_list(db, plant_id=plant_id, skip=skip, limit=limit)


@router.patch("/plants/{plant_id}", response_model=PlantResponse)
@router.patch("/api/v1/plants/{plant_id}", response_model=PlantResponse)
def modify_plant(plant_id: str, plant_in: PlantUpdate, db: Session = Depends(get_db)):
    """Update plant configuration or operational status."""
    plant = update_plant(db, plant_id, plant_in)
    if not plant:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Plant not found")
    return plant


@router.get("/plants/{plant_id}/summary", response_model=PlantSummaryResponse)
@router.get("/api/v1/plants/{plant_id}/summary", response_model=PlantSummaryResponse)
def get_summary(plant_id: str, db: Session = Depends(get_db)):
    """Get high-level summary KPIs and metrics for a plant."""
    summary = get_plant_summary(db, plant_id)
    if not summary:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Plant not found")
    return summary
