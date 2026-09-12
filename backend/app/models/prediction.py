import datetime
from sqlalchemy import Column, BigInteger, Integer, String, Float, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.database import Base
from app.models.base import utc_now


class Prediction(Base):
    __tablename__ = "predictions"

    id = Column(
        BigInteger().with_variant(Integer, "sqlite"),
        primary_key=True,
        index=True,
        autoincrement=True,
    )
    reading_id = Column(BigInteger, ForeignKey("process_readings.id", ondelete="SET NULL"), nullable=True, index=True)
    plant_id = Column(String(50), ForeignKey("plants.id", ondelete="CASCADE"), nullable=False, index=True)
    equipment_id = Column(String(100), ForeignKey("equipment.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # ML Prediction outputs
    incident_prediction = Column(Integer, default=0, nullable=False)
    incident_probability = Column(Float, default=0.0, nullable=False)
    predicted_risk_score = Column(Float, nullable=False)
    predicted_risk_class = Column(String(50), nullable=False)  # normal, warning, leak_suspected, critical
    predicted_leak_severity = Column(String(50), default="none", nullable=False)  # none, low, medium, high, critical
    predicted_leak_location = Column(String(100), default="sensor_point", nullable=False)
    confidence = Column(Float, nullable=False)
    
    # Explainability & rule signals
    feature_importance = Column(JSON, nullable=True)  # list of {feature, importance}
    rule_signals = Column(JSON, nullable=True)        # list of triggered anomaly signals
    model_version = Column(String(50), default="xgb-incident-v1.0", nullable=False)
    created_at = Column(DateTime, default=utc_now, nullable=False, index=True)

    # Relationships
    reading = relationship("ProcessReading", back_populates="predictions")
    equipment = relationship("Equipment", back_populates="predictions")
    plant = relationship("Plant")
    incidents = relationship("Incident", back_populates="prediction")

    @property
    def risk_score(self) -> float:
        return self.predicted_risk_score

    @property
    def risk_class(self) -> str:
        return self.predicted_risk_class
