from typing import Optional
from datetime import datetime
from pydantic import BaseModel, ConfigDict


class SimulationInput(BaseModel):
    productionRate: float
    temperature: float
    pressure: float
    renewableEnergy: float
    recycledMaterial: float
    wasteRecovery: float
    sourcingDistance: Optional[float] = None
    alternativeId: Optional[str] = None

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)


class SimulationResult(BaseModel):
    currentCO2e: float
    optimizedCO2e: float
    co2Reduction: float
    co2ReductionPercent: float
    currentRisk: float
    optimizedRisk: float
    riskReduction: float
    wasteReduction: float
    energyReduction: float
    estimatedCostSaving: float
    annualReduction: float
    annualSaving: float

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)


class SimulationSaveRequest(BaseModel):
    name: str = "Simulation Scenario"
    plant_id: Optional[str] = None
    input: SimulationInput
    result: SimulationResult


class SimulationRecordResponse(BaseModel):
    id: int
    user_id: Optional[int] = None
    plant_id: Optional[str] = None
    name: str
    production_rate: float
    temperature: float
    pressure: float
    renewable_energy: float
    recycled_material: float
    waste_recovery: float
    sourcing_distance: Optional[float] = None
    alternative_id: Optional[str] = None
    current_co2e: float
    optimized_co2e: float
    co2_reduction: float
    co2_reduction_percent: float
    current_risk: float
    optimized_risk: float
    risk_reduction: float
    waste_reduction: float
    energy_reduction: float
    estimated_cost_saving: float
    annual_reduction: float
    annual_saving: float
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
