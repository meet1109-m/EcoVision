/**
 * EcoVision Cost & Savings Calculation Engine
 * 
 * Standalone pure financial & environmental analysis engine.
 * Computes initial investments, multi-vector operational savings, payback periods,
 * return on investment (ROI), 5-year cumulative cash flows, and transparent AI implementation outlooks.
 */

import { FactoryProfile, CircularAlternative } from '../types';

export interface CostInputs {
  equipmentCost: number;
  installationCost: number;
  engineeringCost: number;
  trainingCost: number;
  inspectionCost: number;
  otherCost: number;
  additionalAnnualMaintenanceCost: number;
}

export interface OperatingSavings {
  energySavings: number;
  wasteSavings: number;
  operatingSavings: number;
  maintenanceSavings: number;
  totalAnnualSavings: number;
  annualNetSavings: number;
}

export interface PaybackResult {
  years: number;
  months: number;
  display: string;
  isValid: boolean;
}

export interface CO2ImpactResult {
  currentDailyKg: number;
  projectedDailyKg: number;
  reductionPercentage: number;
  annualReductionTonnes: number;
}

export interface FiveYearDataPoint {
  year: string;
  annualCashFlow: number;
  cumulativeBenefit: number;
  isBreakEven: boolean;
}

export type ImplementationOutlook = 'RECOMMENDED' | 'REVIEW REQUIRED' | 'NOT CURRENTLY ATTRACTIVE';

export interface DecisionSummary {
  outlook: ImplementationOutlook;
  outlookRationale: string;
  narrativeText: string;
}

/**
 * Format any numerical currency value into Indian Rupees (INR) with standard Lakh/Crore grouping.
 * Guaranteed never to return NaN, Infinity, or undefined.
 */
export function formatINR(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(amount) || !isFinite(amount)) {
    return '₹0';
  }
  const rounded = Math.round(amount);
  try {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(rounded);
  } catch {
    return `₹${rounded.toLocaleString('en-IN')}`;
  }
}

/**
 * Calculate total initial capital investment across 6 granular line items.
 */
export function calculateTotalInvestment(inputs: CostInputs): number {
  const sum = 
    (Number(inputs.equipmentCost) || 0) +
    (Number(inputs.installationCost) || 0) +
    (Number(inputs.engineeringCost) || 0) +
    (Number(inputs.trainingCost) || 0) +
    (Number(inputs.inspectionCost) || 0) +
    (Number(inputs.otherCost) || 0);
  return Math.max(0, sum);
}

/**
 * Estimate baseline annual energy expenditure in INR from factory consumption.
 */
export function calculateBaselineEnergyCost(profile: FactoryProfile): number {
  // Industrial Tariffs in India (approximate medians)
  const electricityTariffKWh = 8.5; // ₹8.5 / kWh
  const gasTariffM3 = 48.0;          // ₹48 / m³
  const coalTariffTonne = 8500.0;     // ₹8,500 / tonne
  const dieselTariffLitre = 92.0;    // ₹92 / litre

  const annualElectricity = (profile.electricityKWhDay || 0) * 365 * electricityTariffKWh;
  const annualGas = (profile.naturalGasM3Day || 0) * 365 * gasTariffM3;
  const annualCoal = (profile.coalTonnesDay || 0) * 365 * coalTariffTonne;
  const annualDiesel = (profile.dieselLitresDay || 0) * 365 * dieselTariffLitre;

  const total = annualElectricity + annualGas + annualCoal + annualDiesel;
  return total > 0 ? total : 25000000; // Default fallback to ₹2.5 Cr for benchmark
}

/**
 * Estimate baseline annual waste disposal costs in INR.
 */
export function calculateBaselineWasteCost(profile: FactoryProfile): number {
  const costPerTonne = profile.disposalMethod === 'Incineration' ? 6500 : 
                       profile.disposalMethod === 'Landfill' ? 4200 : 2500;
  const annualWasteTonnes = (profile.wasteQuantity || 10) * 365;
  return annualWasteTonnes * costPerTonne;
}

/**
 * Estimate baseline annual operating/maintenance costs in INR.
 */
export function calculateBaselineOperatingCost(profile: FactoryProfile): number {
  // Operational baseline derived from production capacity & operating hours
  const dailyProdTonnes = profile.productionCapacity || 100;
  const operatingCostPerTonne = 1200; // ₹1,200/tonne conversion operational cost
  return dailyProdTonnes * operatingCostPerTonne * 365;
}

/**
 * Calculate energy savings based on intervention efficiency and factory profile.
 */
export function calculateEnergySavings(profile: FactoryProfile, alt: CircularAlternative): number {
  const baselineEnergy = calculateBaselineEnergyCost(profile);
  const efficiencyRate = (alt.costReductionPercentage || 18) / 100 * 0.70; // 70% of cost reduction is energy
  return Math.round(baselineEnergy * efficiencyRate);
}

/**
 * Calculate waste disposal and effluent recovery savings.
 */
export function calculateWasteSavings(profile: FactoryProfile, alt: CircularAlternative): number {
  const baselineWaste = calculateBaselineWasteCost(profile);
  const circularFactor = (alt.circularityScore || 80) / 100 * 0.45;
  return Math.round(baselineWaste * circularFactor);
}

/**
 * Calculate process throughput & operational yield savings.
 */
export function calculateOperatingSavings(profile: FactoryProfile, alt: CircularAlternative): number {
  const baselineOp = calculateBaselineOperatingCost(profile);
  const opEfficiency = (alt.costReductionPercentage || 18) / 100 * 0.20; // 20% of cost reduction is operational
  return Math.round(baselineOp * opEfficiency);
}

/**
 * Calculate preventative maintenance & leak mitigation savings.
 */
export function calculateMaintenanceSavings(profile: FactoryProfile, alt: CircularAlternative): number {
  // Reduced leak repair callouts, seal degradation, and steam/pressure loss
  const baselineOp = calculateBaselineOperatingCost(profile);
  const maintFactor = (alt.costReductionPercentage || 18) / 100 * 0.10; // 10% maintenance
  return Math.round(baselineOp * maintFactor);
}

/**
 * Compute aggregated annual savings and annual net savings after subtracting maintenance.
 */
export function calculateAnnualSavings(
  energy: number,
  waste: number,
  operating: number,
  maintenance: number,
  additionalMaintenanceCost: number
): OperatingSavings {
  const safeEnergy = Math.max(0, energy || 0);
  const safeWaste = Math.max(0, waste || 0);
  const safeOperating = Math.max(0, operating || 0);
  const safeMaintenance = Math.max(0, maintenance || 0);
  const safeAddMaint = Math.max(0, additionalMaintenanceCost || 0);

  const totalAnnualSavings = safeEnergy + safeWaste + safeOperating + safeMaintenance;
  const annualNetSavings = totalAnnualSavings - safeAddMaint;

  return {
    energySavings: safeEnergy,
    wasteSavings: safeWaste,
    operatingSavings: safeOperating,
    maintenanceSavings: safeMaintenance,
    totalAnnualSavings,
    annualNetSavings,
  };
}

/**
 * Calculate simple payback period in years and months.
 * Guaranteed safe handling for negative/zero savings, never returns NaN/Infinity.
 */
export function calculatePayback(initialInvestment: number, annualNetSavings: number): PaybackResult {
  if (initialInvestment <= 0) {
    return {
      years: 0,
      months: 0,
      display: 'Immediate (< 1 Month)',
      isValid: true,
    };
  }

  if (annualNetSavings <= 0 || !isFinite(annualNetSavings)) {
    return {
      years: 0,
      months: 0,
      display: 'Payback not achieved under current assumptions.',
      isValid: false,
    };
  }

  const rawYears = initialInvestment / annualNetSavings;

  if (!isFinite(rawYears) || isNaN(rawYears) || rawYears > 50) {
    return {
      years: 50,
      months: 600,
      display: 'Payback not achieved under current assumptions.',
      isValid: false,
    };
  }

  const roundedYears = Math.round(rawYears * 10) / 10;
  const totalMonths = Math.round(rawYears * 12);
  const remainingMonths = Math.round((rawYears - Math.floor(rawYears)) * 12);
  const wholeYears = Math.floor(rawYears);

  let displayStr = `${roundedYears} Years`;
  if (wholeYears === 0) {
    displayStr = `${totalMonths} Months`;
  } else if (remainingMonths > 0) {
    displayStr = `${wholeYears} Yrs ${remainingMonths} Mos (${totalMonths} Mos)`;
  }

  return {
    years: roundedYears,
    months: totalMonths,
    display: displayStr,
    isValid: true,
  };
}

/**
 * Calculate Simple Annual ROI %.
 * Handles zero investment and non-finite math safely.
 */
export function calculateROI(annualNetSavings: number, initialInvestment: number): number {
  if (initialInvestment <= 0) {
    return annualNetSavings > 0 ? 100 : 0;
  }
  if (!isFinite(annualNetSavings) || isNaN(annualNetSavings)) {
    return 0;
  }
  const rawROI = (annualNetSavings / initialInvestment) * 100;
  return Math.max(-100, Math.min(1000, Math.round(rawROI * 10) / 10));
}

/**
 * Calculate daily and annual CO2 emission reductions connecting with EcoVision baseline.
 */
export function calculateCO2Reduction(currentDailyKg: number, reductionPercentage: number): CO2ImpactResult {
  const safeDaily = Math.max(0, currentDailyKg || 1200);
  const safePct = Math.max(0, Math.min(100, reductionPercentage || 0));

  const dailyReductionKg = safeDaily * (safePct / 100);
  const projectedDailyKg = Math.max(0, safeDaily - dailyReductionKg);
  const annualReductionTonnes = Math.round((dailyReductionKg * 365) / 1000);

  return {
    currentDailyKg: Math.round(safeDaily),
    projectedDailyKg: Math.round(projectedDailyKg),
    reductionPercentage: safePct,
    annualReductionTonnes,
  };
}

/**
 * Compute 5-Year Cumulative Cash Flow data points for chart rendering.
 */
export function calculateFiveYearBenefit(
  initialInvestment: number,
  annualNetSavings: number
): FiveYearDataPoint[] {
  const inv = Math.max(0, initialInvestment || 0);
  const net = annualNetSavings || 0;

  const points: FiveYearDataPoint[] = [];

  // Year 0
  let cumulative = -inv;
  let hasBrokenEven = cumulative >= 0;

  points.push({
    year: 'Year 0',
    annualCashFlow: -inv,
    cumulativeBenefit: cumulative,
    isBreakEven: hasBrokenEven,
  });

  for (let i = 1; i <= 5; i++) {
    cumulative += net;
    const isNowBreakEven = cumulative >= 0 && !hasBrokenEven;
    if (cumulative >= 0) hasBrokenEven = true;

    points.push({
      year: `Year ${i}`,
      annualCashFlow: net,
      cumulativeBenefit: cumulative,
      isBreakEven: isNowBreakEven,
    });
  }

  return points;
}

/**
 * Transparent rule-based implementation outlook determination.
 */
export function determineImplementationOutlook(
  paybackYears: number,
  roi: number,
  co2Tonnes: number,
  feasibility: number,
  isValidPayback: boolean
): ImplementationOutlook {
  if (!isValidPayback || roi <= 0 || paybackYears > 6) {
    return 'NOT CURRENTLY ATTRACTIVE';
  }
  if (paybackYears <= 3.0 && roi >= 25 && feasibility >= 70) {
    return 'RECOMMENDED';
  }
  return 'REVIEW REQUIRED';
}

/**
 * Generate a dynamic, human-readable AI financial & environmental decision summary.
 */
export function generateDecisionSummary(
  interventionTitle: string,
  totalInvestment: number,
  annualNetSavings: number,
  payback: PaybackResult,
  roi: number,
  co2Result: CO2ImpactResult,
  feasibility: number
): DecisionSummary {
  const outlook = determineImplementationOutlook(
    payback.years,
    roi,
    co2Result.annualReductionTonnes,
    feasibility,
    payback.isValid
  );

  let outlookRationale = '';
  if (outlook === 'RECOMMENDED') {
    outlookRationale = `High operational feasibility (${feasibility}/100) paired with an attractive payback period of ${payback.display} and strong annual ROI of ${roi}%.`;
  } else if (outlook === 'REVIEW REQUIRED') {
    outlookRationale = `Moderate financial return (${roi}% ROI) and ${payback.display} payback. Recommended for phased deployment or capital co-financing review.`;
  } else {
    outlookRationale = `Extended payback horizon or net negative annual cash flows under current tariff assumptions. Requires technology subsidy or alternate configuration.`;
  }

  const narrativeText = payback.isValid
    ? `Under the current operational and tariff assumptions, the selected intervention "${interventionTitle}" requires an estimated initial investment of ${formatINR(totalInvestment)} and is projected to yield ${formatINR(annualNetSavings)} in net annual savings. The calculated simple payback period is ${payback.display} with an annual ROI of ${roi}%, while avoiding approximately ${co2Result.annualReductionTonnes} tonnes of CO₂e per year.`
    : `Under the current assumptions, the selected intervention "${interventionTitle}" requires an initial capital outlay of ${formatINR(totalInvestment)}. However, annual net operational savings are insufficient to achieve capital payback under current tariffs. Technology subsidies or alternate energy recovery pathways are advised.`;

  return {
    outlook,
    outlookRationale,
    narrativeText,
  };
}

/**
 * Default cost inputs synthesized from an AI circular alternative.
 */
export function getInitialCostInputs(alt?: CircularAlternative | null): CostInputs {
  // Convert alternative metrics to realistic INR defaults (approx ₹83/USD scaled to industrial benchmark)
  const baseEqUSD = alt?.capexEstimatedUSD || 42000;
  const baseEqINR = Math.round(baseEqUSD * 80);

  return {
    equipmentCost: Math.round(baseEqINR * 0.65),
    installationCost: Math.round(baseEqINR * 0.15),
    engineeringCost: Math.round(baseEqINR * 0.10),
    trainingCost: Math.round(baseEqINR * 0.04),
    inspectionCost: Math.round(baseEqINR * 0.04),
    otherCost: Math.round(baseEqINR * 0.02),
    additionalAnnualMaintenanceCost: Math.round(baseEqINR * 0.05),
  };
}
