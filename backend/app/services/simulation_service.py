from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.simulation import Simulation
from app.schemas.simulation import SimulationInput, SimulationResult, SimulationSaveRequest


def compute_simulation(input_data: SimulationInput) -> SimulationResult:
    """
    Computes What-If industrial decarbonization and emission simulation metrics.
    Aligned with engineering mass balance and operational efficiency models.
    """
    baseline_co2 = 1240.0
    risk_reduction = max(
        0.0,
        50.0
        - input_data.productionRate * 0.3
        + input_data.renewableEnergy * 0.5
        + input_data.recycledMaterial * 0.3,
    )

    optimized_co2 = max(
        100.0,
        baseline_co2 * (1.0 - (input_data.recycledMaterial + input_data.renewableEnergy) / 300.0),
    )
    reduction = baseline_co2 - optimized_co2
    reduction_percent = (reduction / baseline_co2) * 100.0

    current_risk = 82.0
    optimized_risk = max(10.0, current_risk - risk_reduction)

    waste_reduction = input_data.wasteRecovery * 0.5
    energy_reduction = input_data.renewableEnergy * 0.4
    estimated_cost_saving = reduction * 40.0
    annual_reduction = (reduction * 365.0) / 1000.0
    annual_saving = reduction * 40.0 * 365.0

    return SimulationResult(
        currentCO2e=baseline_co2,
        optimizedCO2e=round(optimized_co2, 1),
        co2Reduction=round(reduction, 1),
        co2ReductionPercent=round(reduction_percent, 1),
        currentRisk=current_risk,
        optimizedRisk=round(optimized_risk, 1),
        riskReduction=round(risk_reduction, 1),
        wasteReduction=round(waste_reduction, 1),
        energyReduction=round(energy_reduction, 1),
        estimatedCostSaving=round(estimated_cost_saving, 1),
        annualReduction=round(annual_reduction, 2),
        annualSaving=round(annual_saving, 1),
    )


def save_simulation_record(
    db: Session,
    save_in: SimulationSaveRequest,
    user_id: Optional[int] = None
) -> Simulation:
    sim = Simulation(
        user_id=user_id,
        plant_id=save_in.plant_id,
        name=save_in.name,
        production_rate=save_in.input.productionRate,
        temperature=save_in.input.temperature,
        pressure=save_in.input.pressure,
        renewable_energy=save_in.input.renewableEnergy,
        recycled_material=save_in.input.recycledMaterial,
        waste_recovery=save_in.input.wasteRecovery,
        sourcing_distance=save_in.input.sourcingDistance,
        alternative_id=save_in.input.alternativeId,
        current_co2e=save_in.result.currentCO2e,
        optimized_co2e=save_in.result.optimizedCO2e,
        co2_reduction=save_in.result.co2Reduction,
        co2_reduction_percent=save_in.result.co2ReductionPercent,
        current_risk=save_in.result.currentRisk,
        optimized_risk=save_in.result.optimizedRisk,
        risk_reduction=save_in.result.riskReduction,
        waste_reduction=save_in.result.wasteReduction,
        energy_reduction=save_in.result.energyReduction,
        estimated_cost_saving=save_in.result.estimatedCostSaving,
        annual_reduction=save_in.result.annualReduction,
        annual_saving=save_in.result.annualSaving,
    )
    db.add(sim)
    db.commit()
    db.refresh(sim)
    return sim


def get_simulations(db: Session, skip: int = 0, limit: int = 20) -> List[Simulation]:
    return db.query(Simulation).order_by(Simulation.created_at.desc()).offset(skip).limit(limit).all()
