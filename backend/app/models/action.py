from sqlalchemy import Column, Integer, String, Float, ForeignKey, Text, DateTime
from sqlalchemy.orm import relationship
from app.database import Base
from app.models.base import TimestampMixin


class Action(Base, TimestampMixin):
    """
    Action items matching frontend ActionItem interface.
    """
    __tablename__ = "actions"

    id = Column(String(50), primary_key=True, index=True)
    plant_id = Column(String(50), ForeignKey("plants.id", ondelete="SET NULL"), nullable=True, index=True)
    equipment_id = Column(String(100), ForeignKey("equipment.id", ondelete="SET NULL"), nullable=True, index=True)
    recommendation_id = Column(String(50), ForeignKey("recommendations.id", ondelete="SET NULL"), nullable=True, index=True)
    assigned_to_user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)

    title = Column(String(255), nullable=False)
    priority = Column(String(50), default="MEDIUM", nullable=False)  # CRITICAL, HIGH, MEDIUM, LOW
    impact = Column(Float, default=0.0, nullable=False)
    estimated_cost = Column(Float, default=0.0, nullable=False)
    feasibility = Column(Float, default=0.0, nullable=False)
    status = Column(String(50), default="PENDING", nullable=False)  # PENDING, PLANNED, IN_PROGRESS, COMPLETED
    description = Column(Text, default="", nullable=False)
    completed_at = Column(DateTime, nullable=True)

    plant = relationship("Plant", back_populates="actions")
    equipment = relationship("Equipment", back_populates="actions")
    recommendation = relationship("Recommendation", back_populates="actions")
    assignee = relationship("User", back_populates="actions")

    @property
    def estimatedCost(self) -> float:
        return self.estimated_cost
