from sqlalchemy import Column, String, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base
from app.models.base import TimestampMixin


class ProcessUnit(Base, TimestampMixin):
    __tablename__ = "process_units"

    id = Column(String(50), primary_key=True, index=True)
    plant_id = Column(String(50), ForeignKey("plants.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    unit_type = Column(String(100), nullable=True)
    description = Column(String(500), nullable=True)

    plant = relationship("Plant", back_populates="process_units")
    equipment = relationship("Equipment", back_populates="process_unit", cascade="all, delete-orphan", lazy="selectin")
    readings = relationship("ProcessReading", back_populates="process_unit", lazy="dynamic")
