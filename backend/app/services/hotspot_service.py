from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.hotspot import Hotspot
from app.schemas.hotspot import HotspotCreate, HotspotUpdate


def get_hotspots(
    db: Session,
    plant_id: Optional[str] = None,
    status: Optional[str] = None,
    is_active: Optional[bool] = None,
    skip: int = 0,
    limit: int = 50,
) -> List[Hotspot]:
    query = db.query(Hotspot)
    if plant_id:
        query = query.filter(Hotspot.plant_id == plant_id)
    if status:
        query = query.filter(Hotspot.status == status)
    if is_active is not None:
        query = query.filter(Hotspot.is_active == is_active)
    return query.order_by(Hotspot.risk_score.desc()).offset(skip).limit(limit).all()


def get_hotspot(db: Session, hotspot_id: str) -> Optional[Hotspot]:
    return db.query(Hotspot).filter(Hotspot.id == hotspot_id).first()


def create_hotspot(db: Session, hotspot_in: HotspotCreate) -> Hotspot:
    hotspot = Hotspot(
        id=hotspot_in.id,
        plant_id=hotspot_in.plant_id,
        equipment_id=hotspot_in.equipment_id,
        equipment_name=hotspot_in.equipment,
        risk_score=hotspot_in.riskScore,
        status=hotspot_in.status,
        probability=hotspot_in.probability,
        emission=hotspot_in.emission,
        probable_cause=hotspot_in.probableCause,
        detected_signals=hotspot_in.detectedSignals,
        recommended_action=hotspot_in.recommendedAction,
        is_active=hotspot_in.is_active,
    )
    db.add(hotspot)
    db.commit()
    db.refresh(hotspot)
    return hotspot


def update_hotspot(db: Session, hotspot_id: str, hotspot_in: HotspotUpdate) -> Optional[Hotspot]:
    hotspot = get_hotspot(db, hotspot_id)
    if not hotspot:
        return None
    data = hotspot_in.model_dump(exclude_unset=True)
    if "riskScore" in data:
        hotspot.risk_score = data["riskScore"]
    if "status" in data:
        hotspot.status = data["status"]
    if "probability" in data:
        hotspot.probability = data["probability"]
    if "emission" in data:
        hotspot.emission = data["emission"]
    if "probableCause" in data:
        hotspot.probable_cause = data["probableCause"]
    if "detectedSignals" in data:
        hotspot.detected_signals = data["detectedSignals"]
    if "recommendedAction" in data:
        hotspot.recommended_action = data["recommendedAction"]
    if "is_active" in data:
        hotspot.is_active = data["is_active"]
    db.commit()
    db.refresh(hotspot)
    return hotspot
