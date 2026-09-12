import datetime
from sqlalchemy import (
    Column, Integer, BigInteger, String, Float, Boolean, DateTime, ForeignKey, Index
)
from sqlalchemy.orm import relationship
from app.database import Base


from app.models.base import utc_now


class ProcessReading(Base):
    """
    Industrial telemetry process reading table.
    Contains actual columns from industrial_leak_training_v2.csv.
    Input features and target/ground truth labels are explicitly distinguished
    to avoid data leakage during model training and inference.
    """
    __tablename__ = "process_readings"

    id = Column(
        BigInteger().with_variant(Integer, "sqlite"),
        primary_key=True,
        index=True,
        autoincrement=True,
    )
    
    # Process & Equipment Identification
    timestamp = Column(DateTime, nullable=False, index=True)
    plant_id = Column(String(50), ForeignKey("plants.id", ondelete="CASCADE"), nullable=False, index=True)
    process_unit_id = Column(String(50), ForeignKey("process_units.id", ondelete="CASCADE"), nullable=False, index=True)
    equipment_id = Column(String(100), ForeignKey("equipment.id", ondelete="CASCADE"), nullable=False, index=True)
    equipment_type = Column(String(100), nullable=False)
    process_type = Column(String(100), nullable=False)

    # Operational Process Variables (Model Input Features)
    temperature_c = Column(Float, nullable=False)
    pressure_bar = Column(Float, nullable=False)
    flow_rate = Column(Float, nullable=False)
    production_rate = Column(Float, nullable=False)
    operating_hours = Column(Float, nullable=False)
    equipment_age_years = Column(Float, nullable=False)
    maintenance_due = Column(Boolean, default=False, nullable=False)

    # Gas & Particulate Emission Concentrations (Model Input Features)
    co2_ppm = Column(Float, nullable=False)
    co_ppm = Column(Float, nullable=False)
    nox_ppm = Column(Float, nullable=False)
    so2_ppm = Column(Float, nullable=False)
    voc_ppm = Column(Float, nullable=False)
    ch4_ppm = Column(Float, nullable=False)
    pm25_mg_m3 = Column(Float, nullable=False)

    # Environmental & Shift Context (Model Input Features)
    fuel_or_material_type = Column(String(100), nullable=False)
    ambient_temperature_c = Column(Float, nullable=False)
    humidity_pct = Column(Float, nullable=False)
    wind_speed_m_s = Column(Float, nullable=False)
    shift = Column(String(50), nullable=False)  # Morning, Afternoon, Night
    maintenance_status = Column(String(50), nullable=False)  # ok, due_soon, overdue

    # Process Deviations & Rolling Statistics (Engineered Input Features)
    pressure_deviation_pct = Column(Float, nullable=False)
    flow_deviation_pct = Column(Float, nullable=False)
    temperature_deviation_pct = Column(Float, nullable=False)
    emission_above_baseline_pct = Column(Float, nullable=False)
    rolling_mean = Column(Float, nullable=False)
    rolling_std = Column(Float, nullable=False)

    # TARGET / GROUND TRUTH LABELS (Never to be passed into prediction inputs)
    incident_label = Column(Integer, default=0, nullable=False, index=True)
    risk_class = Column(String(50), default="normal", nullable=False, index=True)  # normal, warning, leak_suspected, critical
    risk_score = Column(Float, default=0.0, nullable=False)
    leak_location = Column(String(100), default="none", nullable=False)
    leak_severity = Column(String(50), default="none", nullable=False)  # none, low, medium, high, critical
    confirmed_by = Column(String(50), default="sensor", nullable=False)

    created_at = Column(DateTime, default=utc_now, nullable=False)

    # Relationships
    plant = relationship("Plant", back_populates="readings")
    process_unit = relationship("ProcessUnit", back_populates="readings")
    equipment = relationship("Equipment", back_populates="readings")
    predictions = relationship("Prediction", back_populates="reading", lazy="dynamic")
    incidents = relationship("Incident", back_populates="reading", lazy="dynamic")

    __table_args__ = (
        Index("ix_readings_plant_timestamp", "plant_id", "timestamp"),
        Index("ix_readings_eq_timestamp", "equipment_id", "timestamp"),
    )
