export type IndustryType = 
  | 'Chemicals'
  | 'Cement'
  | 'Steel'
  | 'Textiles'
  | 'Food Processing'
  | 'Pharmaceuticals'
  | 'Manufacturing'
  | 'Other';

export interface FactoryProfile {
  id: string;
  name: string;
  location: string;
  industryType: IndustryType;
  productionProcess: string;
  productionCapacity: number;
  capacityUnit: string;
  equipment: string[];
  operatingHoursPerDay: number;
  
  // Energy
  electricityKWhDay: number;
  coalTonnesDay: number;
  naturalGasM3Day: number;
  dieselLitresDay: number;
  otherFuels: string;
  renewablePercentage: number;
  
  // Material
  rawMaterial: string;
  materialQuantity: number;
  materialUnit: string;
  materialType: string;
  virginMaterialPercentage: number;
  recycledMaterialPercentage: number;
  supplierInfo: string;
  
  // Waste
  wasteType: string;
  wasteQuantity: number;
  wasteUnit: string;
  disposalMethod: 'Landfill' | 'Incineration' | 'External recycling' | 'Internal reuse' | 'Other';
  reusePossibilityPercentage: number;
}

export type PipelineStage = 
  | 'INPUT' 
  | 'DETECT' 
  | 'LOCALIZE' 
  | 'EXPLAIN' 
  | 'RECOMMEND' 
  | 'SIMULATE' 
  | 'ACT';

export interface AnomalyFactor {
  id: string;
  name: string;
  percentage: number;
  impactLevel: 'HIGH IMPACT' | 'MEDIUM IMPACT' | 'LOW IMPACT';
  description: string;
  deviationValue: string;
  baselineValue: string;
}

export interface HotspotNode {
  id: string;
  name: string;
  type: string;
  riskScore: number;
  status: 'Critical' | 'High Risk' | 'Warning' | 'Normal';
  probableCause: string;
  estimatedEmissionKgCO2e: number;
  recommendedAction: string;
  telemetry: {
    temperature: { value: number; unit: string; status: 'normal' | 'warning' | 'critical' };
    pressure: { value: number; unit: string; status: 'normal' | 'warning' | 'critical' };
    flowRate: { value: number; unit: string; status: 'normal' | 'warning' | 'critical' };
    emissionConcentration: { value: number; unit: string; status: 'normal' | 'warning' | 'critical' };
  };
  connectedTo: string[];
}

export interface CircularAlternative {
  id: string;
  code: 'ALTERNATIVE A' | 'ALTERNATIVE B' | 'ALTERNATIVE C';
  title: string;
  summary: string;
  emissionReductionPercentage: number;
  costReductionPercentage: number;
  circularityScore: number;
  feasibilityScore: number;
  implementationRiskScore: number; // 0-100 (lower is better)
  computedEcoScore: number;
  isRecommended: boolean;
  recommendedReason?: string;
  technologyAvailability: string;
  paybackPeriodMonths: number;
  capexEstimatedUSD: number;
  annualSavingsUSD: number;
  co2SavedAnnualTonnes: number;
  keyInterventions: string[];
}

export interface OptimizerWeights {
  environmental: number; // 0 - 100
  economic: number;      // 0 - 100
  circularity: number;   // 0 - 100
  feasibility: number;   // 0 - 100
  riskTolerance: number; // 0 - 100
}

export type PriorityPreset = 'Environment-first' | 'Cost-first' | 'Circularity-first' | 'Low-disruption' | 'Balanced';

export interface WhatIfScenario {
  recycledMaterialPercentage: number;
  renewableEnergyPercentage: number;
  productionRatePercentage: number;
  processConditionTuning: number; // 0-100 efficiency
  wasteRecoveryPercentage: number;
  sourcingDistanceKm: number;
}

export interface ActionPlanItem {
  id: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  title: string;
  targetUnit: string;
  description: string;
  expectedImpact: string;
  estimatedEffort: 'Low (< 1 wk)' | 'Medium (1-4 wks)' | 'High (> 1 mo)';
  feasibilityScore: number;
  status: 'Pending' | 'In Progress' | 'Completed' | 'Verified';
  assignedRole: string;
  dueDate: string;
}

export type NavigationTab = 
  | 'overview'
  | 'factory-profile'
  | 'process-data'
  | 'emission-intelligence'
  | 'hotspot-detection'
  | 'digital-twin'
  | 'ai-recommendations'
  | 'optimizer'
  | 'what-if'
  | 'impact-report'
  | 'action-center';
