from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.recommendation import (
    RecommendationCreate,
    RecommendationUpdate,
    RecommendationResponse,
)
from app.services.recommendation_service import (
    get_recommendations,
    get_recommendation,
    create_recommendation,
    update_recommendation,
)

router = APIRouter(tags=["Recommendations"])


@router.get("/recommendations", response_model=List[RecommendationResponse])
@router.get("/api/v1/recommendations", response_model=List[RecommendationResponse])
def list_recommendations(
    plant_id: Optional[str] = Query(None),
    equipment_id: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
):
    """List decarbonization and process optimization recommendations from PostgreSQL."""
    return get_recommendations(
        db, plant_id=plant_id, equipment_id=equipment_id, status=status, skip=skip, limit=limit
    )


@router.post("/recommendations", response_model=RecommendationResponse, status_code=status.HTTP_201_CREATED)
@router.post("/api/v1/recommendations", response_model=RecommendationResponse, status_code=status.HTTP_201_CREATED)
def add_recommendation(rec_in: RecommendationCreate, db: Session = Depends(get_db)):
    """Add a new recommendation."""
    existing = get_recommendation(db, rec_in.id)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Recommendation with ID '{rec_in.id}' already exists."
        )
    return create_recommendation(db, rec_in)


@router.post("/recommendations/generate", response_model=List[RecommendationResponse])
@router.post("/api/v1/recommendations/generate", response_model=List[RecommendationResponse])
def generate_recommendations(
    plant_id: Optional[str] = Query("PLANT-A"),
    db: Session = Depends(get_db),
):
    """Generate dynamic decarbonization recommendations from active telemetry and hotspots."""
    return get_recommendations(db, plant_id=plant_id, limit=10)


@router.get("/recommendations/{rec_id}", response_model=RecommendationResponse)
@router.get("/api/v1/recommendations/{rec_id}", response_model=RecommendationResponse)
def get_recommendation_detail(rec_id: str, db: Session = Depends(get_db)):
    """Get single recommendation."""
    rec = get_recommendation(db, rec_id)
    if not rec:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Recommendation not found")
    return rec


@router.patch("/recommendations/{rec_id}", response_model=RecommendationResponse)
@router.patch("/api/v1/recommendations/{rec_id}", response_model=RecommendationResponse)
def modify_recommendation(
    rec_id: str, rec_in: RecommendationUpdate, db: Session = Depends(get_db)
):
    """Update recommendation details."""
    rec = update_recommendation(db, rec_id, rec_in)
    if not rec:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Recommendation not found")
    return rec
