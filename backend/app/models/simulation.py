from sqlalchemy import Column, Integer, String, Float, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.database import Base
from app.models.base import TimestampMixin


class Simulation(Base, TimestampMixin):
    """
    Simulation scenario run and results matching frontend SimulationInput/SimulationResult.
    Stores structured scenario metrics alongside JSON scenario parameter payloads.
    """
    __tablename__ = "simulations"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    plant_id = Column(String(50), ForeignKey("plants.id", ondelete="SET NULL"), nullable=True, index=True)
    name = Column(String(255), default="Simulation Scenario", nullable=False)

    # Structured Scenario Input Parameters
    production_rate = Column(Float, default=0.0, nullable=False)
    temperature = Column(Float, default=0.0, nullable=False)
    pressure = Column(Float, default=0.0, nullable=False)
    renewable_energy = Column(Float, default=0.0, nullable=False)
    recycled_material = Column(Float, default=0.0, nullable=False)
    waste_recovery = Column(Float, default=0.0, nullable=False)
    sourcing_distance = Column(Float, nullable=True)
    alternative_id = Column(String(50), nullable=True)

    # Optional JSON payloads for flexible scenarios
    input_parameters = Column(JSON, nullable=True)
    baseline_result = Column(JSON, nullable=True)
    simulated_result = Column(JSON, nullable=True)

    # Calculated Optimization Results
    current_co2e = Column(Float, default=0.0, nullable=False)
    optimized_co2e = Column(Float, default=0.0, nullable=False)
    co2_reduction = Column(Float, default=0.0, nullable=False)
    co2_reduction_percent = Column(Float, default=0.0, nullable=False)
    current_risk = Column(Float, default=0.0, nullable=False)
    optimized_risk = Column(Float, default=0.0, nullable=False)
    risk_reduction = Column(Float, default=0.0, nullable=False)
    waste_reduction = Column(Float, default=0.0, nullable=False)
    energy_reduction = Column(Float, default=0.0, nullable=False)
    estimated_cost_saving = Column(Float, default=0.0, nullable=False)
    annual_reduction = Column(Float, default=0.0, nullable=False)
    annual_saving = Column(Float, default=0.0, nullable=False)

    user = relationship("User", back_populates="simulations")
    plant = relationship("Plant", back_populates="simulations")
