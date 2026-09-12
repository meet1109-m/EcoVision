from sqlalchemy import Column, String, Float, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from app.database import Base
from app.models.base import TimestampMixin


class Equipment(Base, TimestampMixin):
    __tablename__ = "equipment"

    id = Column(String(100), primary_key=True, index=True)
    process_unit_id = Column(String(50), ForeignKey("process_units.id", ondelete="CASCADE"), nullable=False, index=True)
    plant_id = Column(String(50), ForeignKey("plants.id", ondelete="CASCADE"), nullable=False, index=True)
    equipment_type = Column(String(100), nullable=False, index=True)
    process_type = Column(String(100), nullable=False)
    equipment_age_years = Column(Float, default=0.0, nullable=False)
    maintenance_status = Column(String(50), default="ok", nullable=False)  # ok, due_soon, overdue
    installation_date = Column(DateTime, nullable=True)

    plant = relationship("Plant", back_populates="equipment")
    process_unit = relationship("ProcessUnit", back_populates="equipment")
    readings = relationship("ProcessReading", back_populates="equipment", lazy="dynamic")
    predictions = relationship("Prediction", back_populates="equipment", lazy="dynamic")
    hotspots = relationship("Hotspot", back_populates="equipment_rel", lazy="dynamic")
    incidents = relationship("Incident", back_populates="equipment", lazy="dynamic")
    recommendations = relationship("Recommendation", back_populates="equipment", lazy="dynamic")
    actions = relationship("Action", back_populates="equipment", lazy="dynamic")
