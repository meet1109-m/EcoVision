from sqlalchemy import Column, String, Float, Boolean, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.database import Base
from app.models.base import TimestampMixin


class Hotspot(Base, TimestampMixin):
    """
    Identified high-risk equipment hotspot matching frontend Hotspot interface.
    """
    __tablename__ = "hotspots"

    id = Column(String(50), primary_key=True, index=True)
    plant_id = Column(String(50), ForeignKey("plants.id", ondelete="CASCADE"), nullable=False, index=True)
    equipment_id = Column(String(100), ForeignKey("equipment.id", ondelete="CASCADE"), nullable=False, index=True)
    equipment_name = Column(String(100), nullable=False)
    risk_score = Column(Float, nullable=False)
    status = Column(String(50), default="NORMAL", nullable=False)  # CRITICAL, HIGH, MEDIUM, NORMAL
    probability = Column(Float, nullable=False)
    emission = Column(Float, nullable=False)
    probable_cause = Column(String(255), nullable=False)
    detected_signals = Column(JSON, default=list, nullable=False)
    recommended_action = Column(String(500), nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)

    plant = relationship("Plant", back_populates="hotspots")
    equipment_rel = relationship("Equipment", back_populates="hotspots")

    @property
    def equipment(self) -> str:
        return self.equipment_name

    @property
    def riskScore(self) -> float:
        return self.risk_score

    @property
    def probableCause(self) -> str:
        return self.probable_cause

    @property
    def detectedSignals(self) -> list:
        return self.detected_signals or []

    @property
    def recommendedAction(self) -> str:
        return self.recommended_action
