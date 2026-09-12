from sqlalchemy import Column, String, Float, Boolean, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.database import Base
from app.models.base import TimestampMixin


class Recommendation(Base, TimestampMixin):
    """
    Decarbonization & operational recommendations matching frontend Recommendation interface.
    """
    __tablename__ = "recommendations"

    id = Column(String(50), primary_key=True, index=True)
    plant_id = Column(String(50), ForeignKey("plants.id", ondelete="SET NULL"), nullable=True, index=True)
    equipment_id = Column(String(100), ForeignKey("equipment.id", ondelete="SET NULL"), nullable=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    co2_reduction = Column(Float, nullable=False)
    cost_reduction = Column(Float, nullable=False)
    environmental = Column(Float, nullable=False)
    economic = Column(Float, nullable=False)
    circularity = Column(Float, nullable=False)
    feasibility = Column(Float, nullable=False)
    priority = Column(String(50), default="MEDIUM", nullable=False)  # CRITICAL, HIGH, MEDIUM, LOW
    is_ai_recommended = Column(Boolean, default=False, nullable=False)
    status = Column(String(50), default="active", nullable=False)

    plant = relationship("Plant", back_populates="recommendations")
    equipment = relationship("Equipment", back_populates="recommendations")
    actions = relationship("Action", back_populates="recommendation", cascade="all, delete-orphan")

    @property
    def environmental_score(self) -> float:
        return self.environmental

    @property
    def economic_score(self) -> float:
        return self.economic

    @property
    def circularity_score(self) -> float:
        return self.circularity

    @property
    def feasibility_score(self) -> float:
        return self.feasibility

    @property
    def co2Reduction(self) -> float:
        return self.co2_reduction

    @property
    def costReduction(self) -> float:
        return self.cost_reduction

    @property
    def isAIRecommended(self) -> bool:
        return self.is_ai_recommended
