from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.plant import Plant
from app.models.process_unit import ProcessUnit
from app.models.equipment import Equipment
from app.models.process_reading import ProcessReading
from app.schemas.equipment import EquipmentCreate, EquipmentUpdate


def ensure_equipment_hierarchy(
    db: Session,
    plant_id: str,
    process_unit_id: Optional[str] = None,
    equipment_id: Optional[str] = None,
    equipment_type: Optional[str] = None,
    process_type: Optional[str] = None,
    equipment_age_years: float = 0.0,
) -> Optional[Equipment]:
    """
    Ensures that the corresponding Plant, ProcessUnit, and Equipment records
    exist in the database to satisfy relational foreign key constraints.
    Creates records dynamically if they do not exist.
    """
    if not plant_id:
        plant_id = "PLANT001"

    plant = db.query(Plant).filter(Plant.id == plant_id).first()
    if not plant:
        plant = Plant(
            id=plant_id,
            name=f"Plant {plant_id}",
            location="Industrial Facility",
            industry_type="Petrochemical & Refining",
            is_active=True,
        )
        db.add(plant)
        db.flush()

    if not process_unit_id:
        process_unit_id = f"{plant_id}-PU01"

    unit = db.query(ProcessUnit).filter(ProcessUnit.id == process_unit_id).first()
    if not unit:
        unit = ProcessUnit(
            id=process_unit_id,
            plant_id=plant_id,
            name=f"Process Unit {process_unit_id}",
            unit_type="Processing",
        )
        db.add(unit)
        db.flush()

    if equipment_id:
        eq = db.query(Equipment).filter(Equipment.id == equipment_id).first()
        if not eq:
            eq = Equipment(
                id=equipment_id,
                process_unit_id=process_unit_id,
                plant_id=plant_id,
                equipment_type=equipment_type or "Reactor",
                process_type=process_type or "General Process",
                equipment_age_years=float(equipment_age_years or 0.0),
                maintenance_status="ok",
            )
            db.add(eq)
            db.flush()
        return eq

    return None


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
