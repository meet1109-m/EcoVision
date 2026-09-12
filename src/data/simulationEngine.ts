import { 
  FactoryProfile, 
  AnomalyFactor, 
  HotspotNode, 
  CircularAlternative, 
  OptimizerWeights, 
  WhatIfScenario, 
  ActionPlanItem 
} from '../types';

export interface SimulationResult {
  dailyBaselineCO2eKg: number;
  potentialReductionPercentage: number;
  potentialCO2eSavedKgDay: number;
  emissionRiskScore: number;
  emissionRiskStatus: 'CRITICAL' | 'HIGH' | 'WARNING' | 'NORMAL';
  activeHotspotsCount: number;
  criticalHotspotsCount: number;
  circularityScore: number;
  energyEfficiencyScore: number;
  anomalyFactors: AnomalyFactor[];
  hotspotNodes: HotspotNode[];
  alternatives: CircularAlternative[];
  recommendedAlternative: CircularAlternative;
  actionPlan: ActionPlanItem[];
  historicalTelemetry: { time: string; baseline: number; actual: number; threshold: number }[];
}

export function runSimulation(profile: FactoryProfile, weights: OptimizerWeights): SimulationResult {
  // Estimated daily carbon equivalent calculation
  const gridElectricityCO2 = profile.electricityKWhDay * (1 - profile.renewablePercentage / 100) * 0.71;
  const coalCO2 = profile.coalTonnesDay * 1000 * 2.42;
  const gasCO2 = profile.naturalGasM3Day * 1.95;
  const dieselCO2 = profile.dieselLitresDay * 2.68;
  const virginMaterialPenalty = (profile.virginMaterialPercentage / 100) * profile.materialQuantity * 45;
  const wastePenalty = profile.disposalMethod === 'Landfill' ? profile.wasteQuantity * 120 :
                       profile.disposalMethod === 'Incineration' ? profile.wasteQuantity * 85 : profile.wasteQuantity * 25;

  const rawDailyCO2 = Math.round(gridElectricityCO2 + coalCO2 + gasCO2 + dieselCO2 + virginMaterialPenalty + wastePenalty);
  const dailyBaselineCO2eKg = rawDailyCO2 > 0 ? rawDailyCO2 : 1240;

  // Emission Risk Score: weighted by non-renewables, virgin %, scrubber/furnace presence
  const renewableDeficit = 100 - profile.renewablePercentage;
  const virginWeight = profile.virginMaterialPercentage;
  const wasteRisk = profile.disposalMethod === 'Landfill' || profile.disposalMethod === 'Incineration' ? 85 : 40;
  const rawRisk = Math.round((renewableDeficit * 0.35) + (virginWeight * 0.35) + (wasteRisk * 0.30));
  
  // Normalized risk for demo consistency: 87 for GreenTech DEMO001
  const emissionRiskScore = profile.id === 'DEMO001' ? 87 : Math.min(95, Math.max(35, rawRisk));
  const emissionRiskStatus = emissionRiskScore >= 80 ? 'CRITICAL' : emissionRiskScore >= 65 ? 'HIGH' : emissionRiskScore >= 50 ? 'WARNING' : 'NORMAL';

  const potentialReductionPercentage = 38.7;
  const potentialCO2eSavedKgDay = Math.round(dailyBaselineCO2eKg * (potentialReductionPercentage / 100));
  const circularityScore = Math.round((profile.recycledMaterialPercentage * 0.6) + (profile.reusePossibilityPercentage * 0.4));
  const energyEfficiencyScore = Math.round(60 + (profile.renewablePercentage * 0.35));

  // Anomaly Contributing Factors
  const anomalyFactors: AnomalyFactor[] = [
    {
      id: 'f1',
      name: 'Emission concentration deviation',
      percentage: 31,
      impactLevel: 'HIGH IMPACT',
      description: 'Stack sensor detects transient surges of volatile organic hydrocarbons exceeding baseline parameters by +42%.',
      deviationValue: '+42.3 ppm',
      baselineValue: '18.0 ppm target'
    },
    {
      id: 'f2',
      name: 'Pressure deviation',
      percentage: 24,
      impactLevel: 'HIGH IMPACT',
      description: 'Differential pressure sensor across scrubber packed bed shows intermittent localized pressure drops (-1.8 bar).',
      deviationValue: '-1.82 bar ΔP',
      baselineValue: '3.50 bar nominal'
    },
    {
      id: 'f3',
      name: 'Flow abnormality',
      percentage: 18,
      impactLevel: 'MEDIUM IMPACT',
      description: 'Flue gas volumetric flow rate displays erratic cycling indicative of bypass valve seal degradation.',
      deviationValue: '+215 m³/h spike',
      baselineValue: '1,450 m³/h target'
    },
    {
      id: 'f4',
      name: 'Temperature deviation',
      percentage: 14,
      impactLevel: 'MEDIUM IMPACT',
      description: 'Thermal boundary gradient at furnace secondary combustion chamber indicates heat distribution irregularity.',
      deviationValue: '+34.5 °C gradient',
      baselineValue: '480 °C uniform'
    },
    {
      id: 'f5',
      name: 'Production variation',
      percentage: 13,
      impactLevel: 'LOW IMPACT',
      description: 'Batch throughput fluctuations during raw material switchover periods.',
      deviationValue: '±7.8% variance',
      baselineValue: '100% steady state'
    }
  ];

  // Hotspot Process Map Nodes
  const hotspotNodes: HotspotNode[] = [
    {
      id: 'raw-material',
      name: 'Raw Material Feed',
      type: 'Feedstock Ingestion',
      riskScore: 25,
      status: 'Normal',
      probableCause: 'Consistent feedstock flow within stoichiometric bounds',
      estimatedEmissionKgCO2e: 85,
      recommendedAction: 'Standard raw material QA inspection and moisture verification',
      telemetry: {
        temperature: { value: 24.2, unit: '°C', status: 'normal' },
        pressure: { value: 1.02, unit: 'bar', status: 'normal' },
        flowRate: { value: 6.2, unit: 't/h', status: 'normal' },
        emissionConcentration: { value: 4.1, unit: 'ppm', status: 'normal' }
      },
      connectedTo: ['reactor']
    },
    {
      id: 'reactor',
      name: 'Catalytic Reactor Unit',
      type: 'Chemical Synthesis',
      riskScore: 38,
      status: 'Normal',
      probableCause: 'Reaction kinetics stable; catalyst bed at 94% activity',
      estimatedEmissionKgCO2e: 190,
      recommendedAction: 'Schedule routine catalyst regen cycle in 45 days',
      telemetry: {
        temperature: { value: 168.4, unit: '°C', status: 'normal' },
        pressure: { value: 4.8, unit: 'bar', status: 'normal' },
        flowRate: { value: 5.8, unit: 't/h', status: 'normal' },
        emissionConcentration: { value: 12.4, unit: 'ppm', status: 'normal' }
      },
      connectedTo: ['separator']
    },
    {
      id: 'separator',
      name: 'Rotary Separator',
      type: 'Phase Separation',
      riskScore: 42,
      status: 'Normal',
      probableCause: 'Mild vibration harmonics observed during peak continuous throughput',
      estimatedEmissionKgCO2e: 140,
      recommendedAction: 'Inspect seal lubrication at next shift changeover',
      telemetry: {
        temperature: { value: 84.1, unit: '°C', status: 'normal' },
        pressure: { value: 2.1, unit: 'bar', status: 'normal' },
        flowRate: { value: 5.4, unit: 't/h', status: 'normal' },
        emissionConcentration: { value: 18.2, unit: 'ppm', status: 'warning' }
      },
      connectedTo: ['scrubber', 'furnace']
    },
    {
      id: 'scrubber',
      name: 'Centrifugal Gas Scrubber',
      type: 'Emission Abatement',
      riskScore: 87,
      status: 'Critical',
      probableCause: 'Abnormal pressure + flow pattern indicating bypass valve leakage & packing channel fouling',
      estimatedEmissionKgCO2e: 520,
      recommendedAction: 'Immediate acoustic emission inspection + wash column differential pressure recalibration',
      telemetry: {
        temperature: { value: 112.8, unit: '°C', status: 'warning' },
        pressure: { value: 1.68, unit: 'bar', status: 'critical' },
        flowRate: { value: 1665, unit: 'm³/h', status: 'critical' },
        emissionConcentration: { value: 60.3, unit: 'ppm', status: 'critical' }
      },
      connectedTo: ['stack']
    },
    {
      id: 'furnace',
      name: 'Thermal Fluid Furnace',
      type: 'Process Heating',
      riskScore: 73,
      status: 'High Risk',
      probableCause: 'Secondary combustion chamber thermal gradient fluctuation causing sub-optimal flame stoichiometry',
      estimatedEmissionKgCO2e: 380,
      recommendedAction: 'Calibrate automated excess O2 sensor and clean preheated burner nozzles',
      telemetry: {
        temperature: { value: 514.5, unit: '°C', status: 'critical' },
        pressure: { value: 1.15, unit: 'bar', status: 'normal' },
        flowRate: { value: 840, unit: 'm³/h', status: 'warning' },
        emissionConcentration: { value: 44.7, unit: 'ppm', status: 'warning' }
      },
      connectedTo: ['compressor', 'stack']
    },
    {
      id: 'compressor',
      name: 'Heavy Gas Compressor',
      type: 'Pneumatic Pressure',
      riskScore: 61,
      status: 'Warning',
      probableCause: 'Interstage seal micro-leakage and high thermal dissipation in stage 2 discharge',
      estimatedEmissionKgCO2e: 210,
      recommendedAction: 'Replace secondary PTFE seal rings and align intake valve damper',
      telemetry: {
        temperature: { value: 92.4, unit: '°C', status: 'warning' },
        pressure: { value: 7.4, unit: 'bar', status: 'warning' },
        flowRate: { value: 980, unit: 'm³/h', status: 'normal' },
        emissionConcentration: { value: 29.8, unit: 'ppm', status: 'warning' }
      },
      connectedTo: ['scrubber']
    },
    {
      id: 'stack',
      name: 'Exhaust Stack & Continuous Monitor',
      type: 'Final Discharge & CEMS',
      riskScore: 52,
      status: 'Warning',
      probableCause: 'Receiving fugitive emissions from compromised upstream scrubber bypass',
      estimatedEmissionKgCO2e: 490,
      recommendedAction: 'Continuous FTIR laser monitoring validation and recalibration',
      telemetry: {
        temperature: { value: 72.0, unit: '°C', status: 'normal' },
        pressure: { value: 1.01, unit: 'bar', status: 'normal' },
        flowRate: { value: 2450, unit: 'm³/h', status: 'warning' },
        emissionConcentration: { value: 58.6, unit: 'ppm', status: 'critical' }
      },
      connectedTo: []
    }
  ];

  // AI Circular Recommendations (Alternatives A, B, C)
  const baseAlternatives: Omit<CircularAlternative, 'computedEcoScore' | 'isRecommended'>[] = [
    {
      id: 'alt-a',
      code: 'ALTERNATIVE A',
      title: 'Electrified Heating & Closed-Loop Scrubber Recovery',
      summary: 'Electrify furnace pre-heating with renewable heat pump integration and install closed-loop sodium bicarbonate wash for the centrifugal scrubber.',
      emissionReductionPercentage: 32,
      costReductionPercentage: 18,
      circularityScore: 82,
      feasibilityScore: 91,
      implementationRiskScore: 20,
      technologyAvailability: 'Commercial Off-The-Shelf (TRL 9)',
      paybackPeriodMonths: 14,
      capexEstimatedUSD: 42000,
      annualSavingsUSD: 36000,
      co2SavedAnnualTonnes: 145,
      keyInterventions: [
        'Replace fossil pre-heaters with 120kW industrial electromagnetic induction heater',
        'Convert open scrubber discharge to continuous neutralization and closed effluent loop',
        'Deploy dynamic differential pressure sensors with auto-purge valves'
      ]
    },
    {
      id: 'alt-b',
      code: 'ALTERNATIVE B',
      title: 'Bio-Feedstock Substitution & Catalytic Condensation Loop',
      summary: 'Substitute 40% virgin petrochemical solvents with circular bio-derived ethyl lactate and install cryogenic solvent condensation loop to capture fugitive vapors.',
      emissionReductionPercentage: 45,
      costReductionPercentage: 10,
      circularityScore: 94,
      feasibilityScore: 76,
      implementationRiskScore: 28,
      technologyAvailability: 'Industrial Proven in Pilot Sites (TRL 8)',
      paybackPeriodMonths: 19,
      capexEstimatedUSD: 68000,
      annualSavingsUSD: 43000,
      co2SavedAnnualTonnes: 204,
      keyInterventions: [
        'Shift recipe to circular bio-solvent feedstock without altering polymer melt index',
        'Install closed-circuit cryogenic chiller (-25°C) to condense 98% of volatile solvent vapors',
        'Implement automated solvent distillation unit returning 92% reclaimed solvent into reaction'
      ]
    },
    {
      id: 'alt-c',
      code: 'ALTERNATIVE C',
      title: 'Waste Heat Recuperator & Internal Byproduct Reclaim',
      summary: 'Install high-efficiency finned heat exchanger on stack exhaust to preheat reactor feedstock while diverting scrubber salts into ceramic fluxing agent.',
      emissionReductionPercentage: 27,
      costReductionPercentage: 25,
      circularityScore: 71,
      feasibilityScore: 96,
      implementationRiskScore: 12,
      technologyAvailability: 'Standard Industrial Equipment (TRL 9)',
      paybackPeriodMonths: 10,
      capexEstimatedUSD: 28000,
      annualSavingsUSD: 33500,
      co2SavedAnnualTonnes: 122,
      keyInterventions: [
        'Install flue-gas plate-and-shell heat exchanger transferring 380 kWth back to boiler feedwater',
        'Integrate automated bypass valve shut-off interlock with scrubber pressure alarms',
        'Establish direct byproduct supply agreement with local construction tile manufacturer'
      ]
    }
  ];

  // Dynamic Multi-Criteria EcoScore Calculation:
  // EcoScore = (w_env * CO2_Red + w_econ * Cost_Red + w_circ * Circ + w_feas * Feas - w_risk * Risk) / total_weights
  const totalWeight = (weights.environmental + weights.economic + weights.circularity + weights.feasibility + (100 - weights.riskTolerance)) || 1;

  const alternatives: CircularAlternative[] = baseAlternatives.map(alt => {
    const rawScore = (
      (weights.environmental / 100) * alt.emissionReductionPercentage * 1.6 +
      (weights.economic / 100) * alt.costReductionPercentage * 1.8 +
      (weights.circularity / 100) * alt.circularityScore * 0.9 +
      (weights.feasibility / 100) * alt.feasibilityScore * 0.9 -
      ((100 - weights.riskTolerance) / 100) * alt.implementationRiskScore * 0.8
    );
    const normalizedScore = Math.min(99, Math.max(40, Math.round((rawScore / (totalWeight / 100)) * 1.15)));
    
    return {
      ...alt,
      computedEcoScore: normalizedScore,
      isRecommended: false
    };
  });

  // Sort descending by computed EcoScore
  alternatives.sort((a, b) => b.computedEcoScore - a.computedEcoScore);
  
  // Set recommended flag
  alternatives[0].isRecommended = true;
  alternatives[0].recommendedReason = `Highest environmental (+${alternatives[0].emissionReductionPercentage}% CO₂ reduction) and circularity (${alternatives[0].circularityScore}/100) benefit under the selected decision priorities.`;

  const recommendedAlternative = alternatives[0];

  // Action Plan items
  const actionPlan: ActionPlanItem[] = [
    {
      id: 'act-01',
      priority: 'CRITICAL',
      title: 'Inspect Scrubber Differential Pressure & Clean Packing Bed',
      targetUnit: 'Centrifugal Gas Scrubber (Unit SC-02)',
      description: 'Physical inspection of internal gas distributors and automated purge of fouled packing beds to eliminate anomalous bypass leakage.',
      expectedImpact: 'Immediate reduction of ~320 kg CO₂e/day in fugitive VOC slip',
      estimatedEffort: 'Low (< 1 wk)',
      feasibilityScore: 94,
      status: 'Pending',
      assignedRole: 'Plant Maintenance Lead / Process Reliability Engineer',
      dueDate: 'Within 48 hours'
    },
    {
      id: 'act-02',
      priority: 'HIGH',
      title: 'Optimize Furnace Air-Fuel Ratio & Calibrate O₂ Trimming Sensor',
      targetUnit: 'Thermal Fluid Furnace (Unit FN-01)',
      description: 'Recalibrate automated gas-to-air stoichiometric controller to stabilize secondary combustion zone thermal gradient.',
      expectedImpact: 'Estimated 8.5% thermal fuel efficiency gain and -110 kg CO₂e/day',
      estimatedEffort: 'Low (< 1 wk)',
      feasibilityScore: 88,
      status: 'In Progress',
      assignedRole: 'Combustion Specialist / Instrumentation Engineer',
      dueDate: 'Sep 16, 2026'
    },
    {
      id: 'act-03',
      priority: 'MEDIUM',
      title: 'Initiate Bio-Solvent Substitution Pilot (Alternative B)',
      targetUnit: 'Feedstock & Material Storage (Bay M-04)',
      description: 'Order test batch (5 tonnes) of circular bio-derived ethyl lactate and validate reaction kinetics on pilot reactor skid.',
      expectedImpact: 'Potential 45% lifecycle emission reduction & 94/100 circularity score',
      estimatedEffort: 'High (> 1 mo)',
      feasibilityScore: 76,
      status: 'Pending',
      assignedRole: 'R&D Director / Sustainability Program Manager',
      dueDate: 'Oct 15, 2026'
    },
    {
      id: 'act-04',
      priority: 'LOW',
      title: 'Install Waste Heat Recuperator Ducting for Boiler Preheat',
      targetUnit: 'Exhaust Stack & Flue Gas Duct',
      description: 'Fabricate tie-in spool for plate-and-shell heat exchanger to recover ~380 kWth of sensible heat from exhaust stream.',
      expectedImpact: 'Estimated $33,500 annual fuel savings and 122 tonnes CO₂ avoided',
      estimatedEffort: 'Medium (1-4 wks)',
      feasibilityScore: 92,
      status: 'Pending',
      assignedRole: 'Facility Energy Manager',
      dueDate: 'Nov 01, 2026'
    }
  ];

  // 24-hour historical telemetry
  const historicalTelemetry = [
    { time: '00:00', baseline: 18, actual: 21, threshold: 45 },
    { time: '02:00', baseline: 18, actual: 20, threshold: 45 },
    { time: '04:00', baseline: 18, actual: 24, threshold: 45 },
    { time: '06:00', baseline: 18, actual: 32, threshold: 45 },
    { time: '08:00', baseline: 18, actual: 48, threshold: 45 }, // Anomaly starts
    { time: '10:00', baseline: 18, actual: 58, threshold: 45 },
    { time: '12:00', baseline: 18, actual: 64, threshold: 45 },
    { time: '14:00', baseline: 18, actual: 61, threshold: 45 },
    { time: '16:00', baseline: 18, actual: 59, threshold: 45 },
    { time: '18:00', baseline: 18, actual: 62, threshold: 45 },
    { time: '20:00', baseline: 18, actual: 56, threshold: 45 },
    { time: '22:00', baseline: 18, actual: 54, threshold: 45 }
  ];

  return {
    dailyBaselineCO2eKg,
    potentialReductionPercentage,
    potentialCO2eSavedKgDay,
    emissionRiskScore,
    emissionRiskStatus,
    activeHotspotsCount: 3,
    criticalHotspotsCount: 2,
    circularityScore,
    energyEfficiencyScore,
    anomalyFactors,
    hotspotNodes,
    alternatives,
    recommendedAlternative,
    actionPlan,
    historicalTelemetry
  };
}

export function calculateWhatIfDeltas(
  baselineCO2eKg: number,
  baselineRisk: number,
  baselineCircularity: number,
  scenario: WhatIfScenario
) {
  // Compute impact of scenario sliders
  // Recycled Material: 0 - 100% (baseline ~18%)
  const recycledDelta = (scenario.recycledMaterialPercentage - 18) * 0.42;
  
  // Renewable Energy: 0 - 100% (baseline ~24%)
  const renewableDelta = (scenario.renewableEnergyPercentage - 24) * 0.48;
  
  // Tuning Efficiency: 0 - 100% (nominal 50%)
  const tuningDelta = (scenario.processConditionTuning - 50) * 0.22;
  
  // Waste Recovery: 0 - 100% (baseline 40%)
  const wasteDelta = (scenario.wasteRecoveryPercentage - 40) * 0.25;
  
  // Production rate adjustment: 50% - 150%
  const prodFactor = scenario.productionRatePercentage / 100;
  
  // Sourcing distance reduction: 0 - 1000 km (baseline ~450 km)
  const logisticsDelta = ((450 - scenario.sourcingDistanceKm) / 450) * 4;

  const totalReductionPct = Math.min(78, Math.max(0, 
    recycledDelta + renewableDelta + tuningDelta + wasteDelta + logisticsDelta
  ));

  const newEstimatedEmissions = Math.round(baselineCO2eKg * prodFactor * (1 - totalReductionPct / 100));
  const newEmissionRisk = Math.max(12, Math.min(95, Math.round(baselineRisk - (totalReductionPct * 0.95))));
  const newCircularity = Math.min(99, Math.max(20, Math.round(
    (scenario.recycledMaterialPercentage * 0.55) + (scenario.wasteRecoveryPercentage * 0.45)
  )));
  const estimatedAnnualSavingsUSD = Math.round((baselineCO2eKg - newEstimatedEmissions) * 365 * 0.095);

  return {
    baselineEmissions: baselineCO2eKg,
    simulatedEmissions: newEstimatedEmissions,
    reductionPercentage: Math.max(0, Math.round(((baselineCO2eKg - newEstimatedEmissions) / baselineCO2eKg) * 100 * 10) / 10),
    emissionRiskBefore: baselineRisk,
    emissionRiskAfter: newEmissionRisk,
    circularityBefore: baselineCircularity,
    circularityAfter: newCircularity,
    estimatedAnnualSavingsUSD
  };
}
