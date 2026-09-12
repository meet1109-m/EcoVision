from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.plant import Plant
from app.models.equipment import Equipment
from app.models.hotspot import Hotspot
from app.models.incident import Incident
from app.models.action import Action
from app.models.process_reading import ProcessReading
from app.schemas.plant import PlantCreate, PlantUpdate, PlantSummaryResponse


def get_plants(db: Session, skip: int = 0, limit: int = 100) -> List[Plant]:
    return db.query(Plant).offset(skip).limit(limit).all()


def get_plant(db: Session, plant_id: str) -> Optional[Plant]:
    return db.query(Plant).filter(Plant.id == plant_id).first()


def create_plant(db: Session, plant_in: PlantCreate) -> Plant:
    plant = Plant(**plant_in.model_dump())
    db.add(plant)
    db.commit()
    db.refresh(plant)
    return plant


def update_plant(db: Session, plant_id: str, plant_in: PlantUpdate) -> Optional[Plant]:
    plant = get_plant(db, plant_id)
    if not plant:
        return None
    for key, value in plant_in.model_dump(exclude_unset=True).items():
        setattr(plant, key, value)
    db.commit()
    db.refresh(plant)
    return plant


def get_plant_summary(db: Session, plant_id: str) -> Optional[PlantSummaryResponse]:
    plant = get_plant(db, plant_id)
    if not plant:
        plant = Plant(
            id=plant_id,
            name=f"Plant {plant_id}",
            location="Industrial Facility",
            industry_type="Petrochemical & Refining",
            is_active=True,
        )
        try:
            db.add(plant)
            db.commit()
            db.refresh(plant)
        except Exception:
            db.rollback()

    total_equipment = db.query(Equipment).filter(Equipment.plant_id == plant_id).count()
    active_hotspots = db.query(Hotspot).filter(
        Hotspot.plant_id == plant_id, Hotspot.is_active == True
    ).count()
    open_incidents = db.query(Incident).filter(
        Incident.plant_id == plant_id, Incident.status.in_(["OPEN", "INVESTIGATING"])
    ).count()
    
    # Calculate average risk and emission stats from recent readings
    avg_stats = db.query(
        func.avg(ProcessReading.risk_score).label("avg_risk"),
        func.avg(ProcessReading.co2_ppm).label("avg_co2")
    ).filter(ProcessReading.plant_id == plant_id).first()

    avg_risk_score = float(avg_stats.avg_risk or 0.0)
    avg_co2_ppm = float(avg_stats.avg_co2 or 0.0)

    pending_actions = db.query(Action).filter(
        Action.plant_id == plant_id, Action.status.in_(["PENDING", "PLANNED"])
    ).count()

    return PlantSummaryResponse(
        plant_id=plant.id,
        name=plant.name,
        total_equipment=total_equipment,
        active_hotspots=active_hotspots,
        open_incidents=open_incidents,
        avg_risk_score=round(avg_risk_score, 2),
        avg_co2_ppm=round(avg_co2_ppm, 2),
        total_actions_pending=pending_actions,
    )
