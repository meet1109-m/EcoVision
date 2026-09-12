from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.hotspot import HotspotCreate, HotspotUpdate, HotspotResponse
from app.services.hotspot_service import (
    get_hotspots,
    get_hotspot,
    create_hotspot,
    update_hotspot,
)

router = APIRouter(tags=["Hotspots"])


@router.get("/hotspots", response_model=List[HotspotResponse])
@router.get("/api/v1/hotspots", response_model=List[HotspotResponse])
def list_hotspots(
    plant_id: Optional[str] = Query(None, description="Filter by plant"),
    status: Optional[str] = Query(None, description="Filter by status (CRITICAL, HIGH, MEDIUM, NORMAL)"),
    is_active: Optional[bool] = Query(True, description="Filter by active status"),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
):
    """List emission hotspots stored in PostgreSQL ranked by risk score."""
    return get_hotspots(
        db, plant_id=plant_id, status=status, is_active=is_active, skip=skip, limit=limit
    )


@router.post("/hotspots", response_model=HotspotResponse, status_code=status.HTTP_201_CREATED)
@router.post("/api/v1/hotspots", response_model=HotspotResponse, status_code=status.HTTP_201_CREATED)
def add_hotspot(hotspot_in: HotspotCreate, db: Session = Depends(get_db)):
    """Register or log a new emission hotspot."""
    existing = get_hotspot(db, hotspot_in.id)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Hotspot with ID '{hotspot_in.id}' already exists."
        )
    return create_hotspot(db, hotspot_in)


@router.get("/hotspots/{hotspot_id}", response_model=HotspotResponse)
@router.get("/api/v1/hotspots/{hotspot_id}", response_model=HotspotResponse)
def get_hotspot_detail(hotspot_id: str, db: Session = Depends(get_db)):
    """Retrieve detailed hotspot telemetry and recommended action."""
    hotspot = get_hotspot(db, hotspot_id)
    if not hotspot:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Hotspot not found")
    return hotspot


@router.patch("/hotspots/{hotspot_id}", response_model=HotspotResponse)
@router.patch("/api/v1/hotspots/{hotspot_id}", response_model=HotspotResponse)
def modify_hotspot(hotspot_id: str, hotspot_in: HotspotUpdate, db: Session = Depends(get_db)):
    """Update hotspot risk level, detected signals, or operational state."""
    hotspot = update_hotspot(db, hotspot_id, hotspot_in)
    if not hotspot:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Hotspot not found")
    return hotspot
