from sqlalchemy import Column, Integer, BigInteger, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.database import Base
from app.models.base import TimestampMixin, utc_now


class Incident(Base, TimestampMixin):
    __tablename__ = "incidents"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    plant_id = Column(String(50), ForeignKey("plants.id", ondelete="CASCADE"), nullable=False, index=True)
    equipment_id = Column(String(100), ForeignKey("equipment.id", ondelete="CASCADE"), nullable=False, index=True)
    reading_id = Column(BigInteger, ForeignKey("process_readings.id", ondelete="SET NULL"), nullable=True, index=True)
    prediction_id = Column(BigInteger, ForeignKey("predictions.id", ondelete="SET NULL"), nullable=True, index=True)

    incident_label = Column(Integer, default=1, nullable=False, index=True)
    risk_class = Column(String(50), default="warning", nullable=False)
    risk_score = Column(Float, default=50.0, nullable=False)
    leak_severity = Column(String(50), default="low", nullable=False)
    leak_location = Column(String(100), default="sensor_point", nullable=False)
    confirmed_by = Column(String(50), default="sensor", nullable=False)
    status = Column(String(50), default="OPEN", nullable=False)  # OPEN, INVESTIGATING, RESOLVED, CLOSED
    detected_at = Column(DateTime, default=utc_now, nullable=False, index=True)
    resolved_at = Column(DateTime, nullable=True)
    description = Column(Text, nullable=True)

    # Relationships
    reading = relationship("ProcessReading", back_populates="incidents")
    equipment = relationship("Equipment", back_populates="incidents")
    prediction = relationship("Prediction", back_populates="incidents")
    plant = relationship("Plant")
