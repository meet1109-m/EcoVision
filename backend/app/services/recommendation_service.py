from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.recommendation import Recommendation
from app.schemas.recommendation import RecommendationCreate, RecommendationUpdate


def get_recommendations(
    db: Session,
    plant_id: Optional[str] = None,
    equipment_id: Optional[str] = None,
    status: Optional[str] = None,
    skip: int = 0,
    limit: int = 50,
) -> List[Recommendation]:
    query = db.query(Recommendation)
    if plant_id:
        query = query.filter(Recommendation.plant_id == plant_id)
    if equipment_id:
        query = query.filter(Recommendation.equipment_id == equipment_id)
    if status:
        query = query.filter(Recommendation.status == status)
    return query.order_by(Recommendation.co2_reduction.desc()).offset(skip).limit(limit).all()


def get_recommendation(db: Session, rec_id: str) -> Optional[Recommendation]:
    return db.query(Recommendation).filter(Recommendation.id == rec_id).first()


def create_recommendation(db: Session, rec_in: RecommendationCreate) -> Recommendation:
    rec = Recommendation(
        id=rec_in.id,
        plant_id=rec_in.plant_id,
        equipment_id=rec_in.equipment_id,
        title=rec_in.title,
        description=rec_in.description,
        co2_reduction=rec_in.co2Reduction,
        cost_reduction=rec_in.costReduction,
        environmental=rec_in.environmental,
        economic=rec_in.economic,
        circularity=rec_in.circularity,
        feasibility=rec_in.feasibility,
        is_ai_recommended=rec_in.isAIRecommended,
        status=rec_in.status,
    )
    db.add(rec)
    db.commit()
    db.refresh(rec)
    return rec


def update_recommendation(db: Session, rec_id: str, rec_in: RecommendationUpdate) -> Optional[Recommendation]:
    rec = get_recommendation(db, rec_id)
    if not rec:
        return None
    data = rec_in.model_dump(exclude_unset=True)
    if "title" in data:
        rec.title = data["title"]
    if "description" in data:
        rec.description = data["description"]
    if "co2Reduction" in data:
        rec.co2_reduction = data["co2Reduction"]
    if "costReduction" in data:
        rec.cost_reduction = data["costReduction"]
    if "environmental" in data:
        rec.environmental = data["environmental"]
    if "economic" in data:
        rec.economic = data["economic"]
    if "circularity" in data:
        rec.circularity = data["circularity"]
    if "feasibility" in data:
        rec.feasibility = data["feasibility"]
    if "status" in data:
        rec.status = data["status"]
    db.commit()
    db.refresh(rec)
    return rec
