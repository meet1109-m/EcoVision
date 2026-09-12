from typing import Tuple, List, Optional
from sqlalchemy.orm import Session
from app.models.process_reading import ProcessReading
from app.schemas.process_reading import ProcessReadingCreate, ProcessReadingFilter


from app.services.equipment_service import ensure_equipment_hierarchy


def create_reading(db: Session, reading_in: ProcessReadingCreate) -> ProcessReading:
    ensure_equipment_hierarchy(
        db=db,
        plant_id=reading_in.plant_id,
        process_unit_id=reading_in.process_unit_id,
        equipment_id=reading_in.equipment_id,
        equipment_type=reading_in.equipment_type,
        process_type=reading_in.process_type,
        equipment_age_years=reading_in.equipment_age_years,
    )
    reading = ProcessReading(**reading_in.model_dump())
    db.add(reading)
    db.commit()
    db.refresh(reading)
    return reading


def get_reading(db: Session, reading_id: int) -> Optional[ProcessReading]:
    return db.query(ProcessReading).filter(ProcessReading.id == reading_id).first()


def query_readings(
    db: Session,
    filter_params: ProcessReadingFilter
) -> Tuple[List[ProcessReading], int]:
    query = db.query(ProcessReading)

    if filter_params.plant_id:
        query = query.filter(ProcessReading.plant_id == filter_params.plant_id)
    if filter_params.process_unit_id:
        query = query.filter(ProcessReading.process_unit_id == filter_params.process_unit_id)
    if filter_params.equipment_id:
        query = query.filter(ProcessReading.equipment_id == filter_params.equipment_id)
    if filter_params.risk_class:
        query = query.filter(ProcessReading.risk_class == filter_params.risk_class)
    if filter_params.leak_severity:
        query = query.filter(ProcessReading.leak_severity == filter_params.leak_severity)
    if filter_params.incident_only:
        query = query.filter(ProcessReading.incident_label > 0)
    if filter_params.shift:
        query = query.filter(ProcessReading.shift == filter_params.shift)
    if filter_params.start_date:
        query = query.filter(ProcessReading.timestamp >= filter_params.start_date)
    if filter_params.end_date:
        query = query.filter(ProcessReading.timestamp <= filter_params.end_date)

    total = query.count()
    skip = (filter_params.page - 1) * filter_params.size
    readings = (
        query.order_by(ProcessReading.timestamp.desc())
        .offset(skip)
        .limit(filter_params.size)
        .all()
    )
    return readings, total
