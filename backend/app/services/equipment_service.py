from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.equipment import Equipment
from app.models.process_reading import ProcessReading
from app.schemas.equipment import EquipmentCreate, EquipmentUpdate


def get_equipment_list(
    db: Session,
    plant_id: Optional[str] = None,
    process_unit_id: Optional[str] = None,
    equipment_type: Optional[str] = None,
    maintenance_status: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
) -> List[Equipment]:
    query = db.query(Equipment)
    if plant_id:
        query = query.filter(Equipment.plant_id == plant_id)
    if process_unit_id:
        query = query.filter(Equipment.process_unit_id == process_unit_id)
    if equipment_type:
        query = query.filter(Equipment.equipment_type == equipment_type)
    if maintenance_status:
        query = query.filter(Equipment.maintenance_status == maintenance_status)
    return query.offset(skip).limit(limit).all()


def get_equipment(db: Session, equipment_id: str) -> Optional[Equipment]:
    return db.query(Equipment).filter(Equipment.id == equipment_id).first()


def create_equipment(db: Session, equipment_in: EquipmentCreate) -> Equipment:
    equipment = Equipment(**equipment_in.model_dump())
    db.add(equipment)
    db.commit()
    db.refresh(equipment)
    return equipment


def update_equipment(db: Session, equipment_id: str, equipment_in: EquipmentUpdate) -> Optional[Equipment]:
    equipment = get_equipment(db, equipment_id)
    if not equipment:
        return None
    for key, value in equipment_in.model_dump(exclude_unset=True).items():
        setattr(equipment, key, value)
    db.commit()
    db.refresh(equipment)
    return equipment


def get_equipment_telemetry(db: Session, equipment_id: str, limit: int = 50) -> List[ProcessReading]:
    return (
        db.query(ProcessReading)
        .filter(ProcessReading.equipment_id == equipment_id)
        .order_by(ProcessReading.timestamp.desc())
        .limit(limit)
        .all()
    )
