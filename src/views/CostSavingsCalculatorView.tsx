import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { CircularAlternative } from '../types';
import { 
  CostInputs, 
  getInitialCostInputs, 
  calculateTotalInvestment, 
  calculateEnergySavings, 
  calculateWasteSavings, 
  calculateOperatingSavings, 
  calculateMaintenanceSavings, 
  calculateAnnualSavings, 
  calculatePayback, 
  calculateROI, 
  calculateCO2Reduction, 
  calculateFiveYearBenefit, 
  generateDecisionSummary, 
  formatINR,
  calculateBaselineEnergyCost,
  calculateBaselineWasteCost,
  calculateBaselineOperatingCost
} from '../data/costEngine';
import { 
  Calculator, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  Award, 
  Sparkles, 
  DollarSign, 
  CheckCircle2, 
  AlertCircle, 
  Info, 
  RotateCcw, 
  ArrowRight, 
  Layers, 
  ShieldCheck, 
  ChevronRight,
  BarChart3,
  Flame,
  Zap,
  Building2,
  HelpCircle
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ReferenceLine,
  Cell,
  Legend
} from 'recharts';

export const CostSavingsCalculatorView: React.FC = () => {
  const { 
    factoryProfile, 
    simulationResult, 
    selectedRecommendationForCalculator, 
    setActiveTab, 
    setActivePipelineStage 
  } = useApp();

  // Selected Alternative state (defaults to explicitly passed recommendation, or AI-recommended, or first)
  const alternatives = simulationResult.alternatives || [];
  const defaultAlt = 
    selectedRecommendationForCalculator || 
    alternatives.find(a => a.isRecommended) || 
    alternatives[0];

  const [activeAltId, setActiveAltId] = useState<string>(defaultAlt?.id || 'alt-a');

  // Sync if selectedRecommendationForCalculator changes from another view
  useEffect(() => {
    if (selectedRecommendationForCalculator) {
      setActiveAltId(selectedRecommendationForCalculator.id);
    }
  }, [selectedRecommendationForCalculator]);

  const currentAlt = useMemo(() => {
    return alternatives.find(a => a.id === activeAltId) || defaultAlt;
  }, [alternatives, activeAltId, defaultAlt]);

  // Cost inputs state (in INR ₹)
  const [costInputs, setCostInputs] = useState<CostInputs>(() => getInitialCostInputs(currentAlt));

  // When selected alternative switches, reinitialize cost inputs
  useEffect(() => {
    if (currentAlt) {
      setCostInputs(getInitialCostInputs(currentAlt));
    }
  }, [currentAlt?.id]);

  const handleInputChange = (field: keyof CostInputs, rawValue: string) => {
    const parsed = parseFloat(rawValue.replace(/[^0-9.]/g, '')) || 0;
    setCostInputs(prev => ({
      ...prev,
      [field]: Math.max(0, parsed),
    }));
  };

  const handleResetInputs = () => {
    if (currentAlt) {
      setCostInputs(getInitialCostInputs(currentAlt));
    }
  };

  // --- Dynamic Core Calculations ---
  const totalInvestment = useMemo(() => {
    return calculateTotalInvestment(costInputs);
  }, [costInputs]);

  const baselineDailyCO2Kg = simulationResult.dailyBaselineCO2eKg || 1240;

  const co2Result = useMemo(() => {
    const reductionPct = currentAlt?.emissionReductionPercentage || 30;
    return calculateCO2Reduction(baselineDailyCO2Kg, reductionPct);
  }, [baselineDailyCO2Kg, currentAlt]);

  const operatingSavings = useMemo(() => {
    if (!currentAlt) {
      return {
        energySavings: 0,
        wasteSavings: 0,
        operatingSavings: 0,
        maintenanceSavings: 0,
        totalAnnualSavings: 0,
        annualNetSavings: 0,
      };
    }
    const energy = calculateEnergySavings(factoryProfile, currentAlt);
    const waste = calculateWasteSavings(factoryProfile, currentAlt);
    const op = calculateOperatingSavings(factoryProfile, currentAlt);
    const maint = calculateMaintenanceSavings(factoryProfile, currentAlt);

    return calculateAnnualSavings(
      energy,
      waste,
      op,
      maint,
      costInputs.additionalAnnualMaintenanceCost
    );
  }, [factoryProfile, currentAlt, costInputs.additionalAnnualMaintenanceCost]);

  const payback = useMemo(() => {
    return calculatePayback(totalInvestment, operatingSavings.annualNetSavings);
  }, [totalInvestment, operatingSavings.annualNetSavings]);

  const roi = useMemo(() => {
    return calculateROI(operatingSavings.annualNetSavings, totalInvestment);
  }, [operatingSavings.annualNetSavings, totalInvestment]);

  const fiveYearBenefitData = useMemo(() => {
    return calculateFiveYearBenefit(totalInvestment, operatingSavings.annualNetSavings);
  }, [totalInvestment, operatingSavings.annualNetSavings]);

  const decisionSummary = useMemo(() => {
    return generateDecisionSummary(
      currentAlt?.title || 'Selected Intervention',
      totalInvestment,
      operatingSavings.annualNetSavings,
      payback,
      roi,
      co2Result,
      currentAlt?.feasibilityScore || 85
    );
  }, [currentAlt, totalInvestment, operatingSavings.annualNetSavings, payback, roi, co2Result]);

  // Baseline comparison values in INR
  const baselineEnergyAnnual = calculateBaselineEnergyCost(factoryProfile);
  const projectedEnergyAnnual = Math.max(0, baselineEnergyAnnual - operatingSavings.energySavings);

  const baselineWasteAnnual = calculateBaselineWasteCost(factoryProfile);
  const projectedWasteAnnual = Math.max(0, baselineWasteAnnual - operatingSavings.wasteSavings);

  const baselineOpAnnual = calculateBaselineOperatingCost(factoryProfile);
  const projectedOpAnnual = Math.max(0, baselineOpAnnual - operatingSavings.operatingSavings);

  // Breakdown chart data
  const savingsBreakdownData = [
    { name: 'Energy Savings', amount: operatingSavings.energySavings, fill: '#0284C7' },
    { name: 'Waste Recovery', amount: operatingSavings.wasteSavings, fill: '#059669' },
    { name: 'Process Yield', amount: operatingSavings.operatingSavings, fill: '#D97706' },
    { name: 'Maintenance Avoidance', amount: operatingSavings.maintenanceSavings, fill: '#7C3AED' },
  ];

  const getOutlookBadgeColor = (outlook: string) => {
    switch (outlook) {
      case 'RECOMMENDED':
        return 'bg-emerald-50 text-emerald-800 border-emerald-300';
      case 'REVIEW REQUIRED':
        return 'bg-amber-50 text-amber-800 border-amber-300';
      case 'NOT CURRENTLY ATTRACTIVE':
      default:
        return 'bg-rose-50 text-rose-800 border-rose-300';
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* ========================================================================= */}
      {/* 1. HEADER & INTERVENTION SELECTOR                                         */}
      {/* ========================================================================= */}
      <div className="acrylic-card rounded-2xl p-6 border border-slate-200/80 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-sky-700 bg-sky-100 px-2.5 py-1 rounded-full uppercase tracking-wider">
                Financial Decision Support
              </span>
              <span className="text-xs text-slate-500 font-medium">
                | {factoryProfile.name}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-2">
              Cost & Savings Calculator
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-3xl leading-relaxed">
              Synthesize plant capital requirements, operating net cash flows, and payback horizons connected directly with EcoVision AI recommendations.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleResetInputs}
              className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Model</span>
            </button>
            <button
              type="button"
              onClick={() => { setActivePipelineStage('ACT'); setActiveTab('action-center'); }}
              className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
            >
              <span>Commit to Action Plan</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* AI Recommendations Tab Bar */}
        <div className="mt-4 pt-1">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Active Intervention Scenario:
            </span>
            <span className="text-[10px] text-slate-400">
              * Select an AI recommendation to auto-populate capital & operational parameters
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {alternatives.map((alt) => {
              const isSelected = alt.id === activeAltId;
              const isRec = alt.isRecommended;

              return (
                <button
                  key={alt.id}
                  type="button"
                  onClick={() => setActiveAltId(alt.id)}
                  className={`p-3 rounded-xl text-left border transition-all relative ${
                    isSelected
                      ? 'bg-sky-50/80 border-sky-400 ring-2 ring-sky-400/20 shadow-sm'
                      : 'bg-white/80 hover:bg-slate-50 border-slate-200/90'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-mono font-bold text-slate-500 uppercase">
                      {alt.code}
                    </span>
                    {isRec && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-600 text-white flex items-center gap-1">
                        <Award className="w-2.5 h-2.5" />
                        AI Recommended
                      </span>
                    )}
                  </div>
                  <div className="text-xs font-bold text-slate-900 truncate">
                    {alt.title}
                  </div>
                  <div className="mt-2 flex items-center justify-between text-[11px] text-slate-600 pt-1.5 border-t border-slate-100">
                    <span>CO₂: <strong className="text-emerald-700">+{alt.emissionReductionPercentage}%</strong></span>
                    <span>Circularity: <strong className="text-sky-700">{alt.circularityScore}/100</strong></span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. TOP 5 CLEAN KPI CARDS                                                  */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* KPI 1: Total Investment */}
        <div className="acrylic-card rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-sm">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
            Total Initial Investment
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold font-mono text-slate-900 mt-2">
            {formatINR(totalInvestment)}
          </div>
          <div className="mt-2 text-[11px] text-slate-500 border-t border-slate-100 pt-1.5">
            Equipment + Installation + Works
          </div>
        </div>

        {/* KPI 2: Annual Net Savings */}
        <div className="acrylic-card rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-sm">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
            Annual Net Savings
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold font-mono text-emerald-600 mt-2">
            {formatINR(operatingSavings.annualNetSavings)}
          </div>
          <div className="mt-2 text-[11px] text-emerald-700 font-semibold border-t border-slate-100 pt-1.5 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            <span>Net recurring cash benefit</span>
          </div>
        </div>

        {/* KPI 3: Payback Period */}
        <div className="acrylic-card rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-sm">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
            Payback Period
          </div>
          <div className={`text-2xl sm:text-3xl font-extrabold font-mono mt-2 ${
            payback.isValid ? 'text-sky-700' : 'text-rose-600 text-lg sm:text-xl'
          }`}>
            {payback.isValid ? `${payback.years} Yrs` : 'N/A'}
          </div>
          <div className="mt-2 text-[11px] text-slate-600 truncate border-t border-slate-100 pt-1.5">
            {payback.display}
          </div>
        </div>

        {/* KPI 4: ROI */}
        <div className="acrylic-card rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-sm">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
            Annual ROI
          </div>
          <div className={`text-2xl sm:text-3xl font-extrabold font-mono mt-2 ${
            roi >= 20 ? 'text-emerald-600' : roi > 0 ? 'text-amber-600' : 'text-rose-600'
          }`}>
            {roi}%
          </div>
          <div className="mt-2 text-[11px] text-slate-500 border-t border-slate-100 pt-1.5">
            Annual Net Benefit / Capex
          </div>
        </div>

        {/* KPI 5: Annual CO2 Reduction */}
        <div className="acrylic-card rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-sm">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
            Annual CO₂ Reduction
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold font-mono text-emerald-700 mt-2">
            {co2Result.annualReductionTonnes} T
          </div>
          <div className="mt-2 text-[11px] text-emerald-800 font-semibold border-t border-slate-100 pt-1.5">
            ↓ {co2Result.reductionPercentage}% Abatement
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. IMPLEMENTATION COST INPUTS & OPERATING SAVINGS MATRIX                  */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 6 Cols: Implementation Cost Inputs */}
        <div className="lg:col-span-6 acrylic-card rounded-2xl p-6 border border-slate-200/90 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-200/80">
              <div className="flex items-center gap-2">
                <Calculator className="w-4 h-4 text-sky-600" />
                <h2 className="text-base font-bold text-slate-900">
                  Implementation Cost Structure (₹)
                </h2>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                Editable Line Items
              </span>
            </div>

            <p className="text-xs text-slate-500 my-3 leading-relaxed">
              Granular capital expenditures estimated for deploying <strong>{currentAlt?.title}</strong>. Adjust values to reflect vendor quotations.
            </p>

            <div className="space-y-3 mt-2">
              {/* Field 1: Equipment */}
              <div className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-slate-50/80 border border-slate-200/80">
                <label className="text-xs font-semibold text-slate-700">
                  Equipment / Technology Cost
                </label>
                <div className="relative w-40">
                  <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-xs font-bold text-slate-400">₹</span>
                  <input
                    type="text"
                    value={costInputs.equipmentCost.toLocaleString('en-IN')}
                    onChange={(e) => handleInputChange('equipmentCost', e.target.value)}
                    className="w-full pl-6 pr-2.5 py-1.5 text-xs font-mono font-bold text-slate-900 bg-white border border-slate-200 rounded-lg text-right focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              {/* Field 2: Installation */}
              <div className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-slate-50/80 border border-slate-200/80">
                <label className="text-xs font-semibold text-slate-700">
                  Installation & Commissioning
                </label>
                <div className="relative w-40">
                  <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-xs font-bold text-slate-400">₹</span>
                  <input
                    type="text"
                    value={costInputs.installationCost.toLocaleString('en-IN')}
                    onChange={(e) => handleInputChange('installationCost', e.target.value)}
                    className="w-full pl-6 pr-2.5 py-1.5 text-xs font-mono font-bold text-slate-900 bg-white border border-slate-200 rounded-lg text-right focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              {/* Field 3: Engineering */}
              <div className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-slate-50/80 border border-slate-200/80">
                <label className="text-xs font-semibold text-slate-700">
                  Engineering / Modification Cost
                </label>
                <div className="relative w-40">
                  <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-xs font-bold text-slate-400">₹</span>
                  <input
                    type="text"
                    value={costInputs.engineeringCost.toLocaleString('en-IN')}
                    onChange={(e) => handleInputChange('engineeringCost', e.target.value)}
                    className="w-full pl-6 pr-2.5 py-1.5 text-xs font-mono font-bold text-slate-900 bg-white border border-slate-200 rounded-lg text-right focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              {/* Field 4: Training */}
              <div className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-slate-50/80 border border-slate-200/80">
                <label className="text-xs font-semibold text-slate-700">
                  Operator & Safety Training
                </label>
                <div className="relative w-40">
                  <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-xs font-bold text-slate-400">₹</span>
                  <input
                    type="text"
                    value={costInputs.trainingCost.toLocaleString('en-IN')}
                    onChange={(e) => handleInputChange('trainingCost', e.target.value)}
                    className="w-full pl-6 pr-2.5 py-1.5 text-xs font-mono font-bold text-slate-900 bg-white border border-slate-200 rounded-lg text-right focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              {/* Field 5: Inspection */}
              <div className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-slate-50/80 border border-slate-200/80">
                <label className="text-xs font-semibold text-slate-700">
                  Regulatory Inspection & Audit
                </label>
                <div className="relative w-40">
                  <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-xs font-bold text-slate-400">₹</span>
                  <input
                    type="text"
                    value={costInputs.inspectionCost.toLocaleString('en-IN')}
                    onChange={(e) => handleInputChange('inspectionCost', e.target.value)}
                    className="w-full pl-6 pr-2.5 py-1.5 text-xs font-mono font-bold text-slate-900 bg-white border border-slate-200 rounded-lg text-right focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              {/* Field 6: Other */}
              <div className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-slate-50/80 border border-slate-200/80">
                <label className="text-xs font-semibold text-slate-700">
                  Contingency / Other Ancillary
                </label>
                <div className="relative w-40">
                  <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-xs font-bold text-slate-400">₹</span>
                  <input
                    type="text"
                    value={costInputs.otherCost.toLocaleString('en-IN')}
                    onChange={(e) => handleInputChange('otherCost', e.target.value)}
                    className="w-full pl-6 pr-2.5 py-1.5 text-xs font-mono font-bold text-slate-900 bg-white border border-slate-200 rounded-lg text-right focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-3.5 border-t border-slate-200/80 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Total Initial Investment:
            </span>
            <span className="text-lg font-extrabold font-mono text-slate-900">
              {formatINR(totalInvestment)}
            </span>
          </div>
        </div>

        {/* Right 6 Cols: Operating Cost & Annual Savings Breakdown */}
        <div className="lg:col-span-6 acrylic-card rounded-2xl p-6 border border-slate-200/90 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-200/80">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                <h2 className="text-base font-bold text-slate-900">
                  Operating Cost & Savings Matrix
                </h2>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Annual Recurring Benefit
              </span>
            </div>

            <p className="text-xs text-slate-500 my-3 leading-relaxed">
              Derived from factory baseline energy tariffs, raw material recovery, and preventative leak maintenance.
            </p>

            <div className="space-y-3 mt-2">
              {/* Savings 1: Energy */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50/80 border border-slate-200/80">
                <div>
                  <span className="text-xs font-semibold text-slate-800 block">Energy Abatement Savings</span>
                  <span className="text-[10px] text-slate-500">Electricity, Natural Gas & Thermal Fuel</span>
                </div>
                <span className="text-sm font-extrabold font-mono text-emerald-600">
                  +{formatINR(operatingSavings.energySavings)}
                </span>
              </div>

              {/* Savings 2: Waste */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50/80 border border-slate-200/80">
                <div>
                  <span className="text-xs font-semibold text-slate-800 block">Waste Disposal & Surcharge Reduction</span>
                  <span className="text-[10px] text-slate-500">Effluent treatment and landfill surcharge avoidance</span>
                </div>
                <span className="text-sm font-extrabold font-mono text-emerald-600">
                  +{formatINR(operatingSavings.wasteSavings)}
                </span>
              </div>

              {/* Savings 3: Process */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50/80 border border-slate-200/80">
                <div>
                  <span className="text-xs font-semibold text-slate-800 block">Process Yield & Operating Optimization</span>
                  <span className="text-[10px] text-slate-500">Unplanned downtime reduction & throughput efficiency</span>
                </div>
                <span className="text-sm font-extrabold font-mono text-emerald-600">
                  +{formatINR(operatingSavings.operatingSavings)}
                </span>
              </div>

              {/* Savings 4: Maintenance */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50/80 border border-slate-200/80">
                <div>
                  <span className="text-xs font-semibold text-slate-800 block">Preventative Maintenance Avoidance</span>
                  <span className="text-[10px] text-slate-500">Decreased seal wear, acoustic leak inspection savings</span>
                </div>
                <span className="text-sm font-extrabold font-mono text-emerald-600">
                  +{formatINR(operatingSavings.maintenanceSavings)}
                </span>
              </div>

              {/* Deduction: Additional Maintenance */}
              <div className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-amber-50/60 border border-amber-200/80">
                <div>
                  <span className="text-xs font-semibold text-amber-900 block">Additional Annual Maintenance Cost</span>
                  <span className="text-[10px] text-amber-700">Spare filters, calibration & system consumables</span>
                </div>
                <div className="relative w-36">
                  <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-xs font-bold text-amber-500">₹</span>
                  <input
                    type="text"
                    value={costInputs.additionalAnnualMaintenanceCost.toLocaleString('en-IN')}
                    onChange={(e) => handleInputChange('additionalAnnualMaintenanceCost', e.target.value)}
                    className="w-full pl-6 pr-2.5 py-1 text-xs font-mono font-bold text-slate-900 bg-white border border-amber-300 rounded-lg text-right focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-3.5 border-t border-slate-200/80 space-y-1.5">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Gross Annual Operational Savings:</span>
              <span className="font-mono font-semibold text-slate-700">{formatINR(operatingSavings.totalAnnualSavings)}</span>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Less Additional Annual Maintenance:</span>
              <span className="font-mono text-rose-600 font-semibold">−{formatINR(costInputs.additionalAnnualMaintenanceCost)}</span>
            </div>
            <div className="flex items-center justify-between pt-1 text-sm font-extrabold border-t border-slate-100">
              <span className="text-slate-900">Net Annual Operating Savings:</span>
              <span className="font-mono text-emerald-700 text-base">{formatINR(operatingSavings.annualNetSavings)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. CURRENT VS RECOMMENDED SCENARIO COMPARISON                             */}
      {/* ========================================================================= */}
      <div className="acrylic-card rounded-2xl p-6 border border-slate-200/90 shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Current vs. Recommended Scenario Comparison
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Impact of adopting {currentAlt?.title} against the current plant baseline.
            </p>
          </div>
          <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            Validated Simulation Model
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {/* Item 1: Energy Cost */}
          <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/80">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Annual Energy Cost
            </div>
            <div className="text-xs font-mono line-through text-slate-400">
              {formatINR(baselineEnergyAnnual)}
            </div>
            <div className="text-lg font-mono font-extrabold text-sky-700 mt-0.5">
              {formatINR(projectedEnergyAnnual)}
            </div>
            <div className="mt-2 text-[10px] font-bold text-emerald-700 pt-1 border-t border-slate-200">
              ↓ {formatINR(operatingSavings.energySavings)} / yr
            </div>
          </div>

          {/* Item 2: Waste Cost */}
          <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/80">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Annual Waste Cost
            </div>
            <div className="text-xs font-mono line-through text-slate-400">
              {formatINR(baselineWasteAnnual)}
            </div>
            <div className="text-lg font-mono font-extrabold text-sky-700 mt-0.5">
              {formatINR(projectedWasteAnnual)}
            </div>
            <div className="mt-2 text-[10px] font-bold text-emerald-700 pt-1 border-t border-slate-200">
              ↓ {formatINR(operatingSavings.wasteSavings)} / yr
            </div>
          </div>

          {/* Item 3: Operating Cost */}
          <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/80">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Operational Cost
            </div>
            <div className="text-xs font-mono line-through text-slate-400">
              {formatINR(baselineOpAnnual)}
            </div>
            <div className="text-lg font-mono font-extrabold text-sky-700 mt-0.5">
              {formatINR(projectedOpAnnual)}
            </div>
            <div className="mt-2 text-[10px] font-bold text-emerald-700 pt-1 border-t border-slate-200">
              ↓ {formatINR(operatingSavings.operatingSavings)} / yr
            </div>
          </div>

          {/* Item 4: CO2 Emissions */}
          <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/80">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              CO₂ Emissions
            </div>
            <div className="text-xs font-mono line-through text-slate-400">
              {co2Result.currentDailyKg.toLocaleString()} kg/day
            </div>
            <div className="text-lg font-mono font-extrabold text-emerald-600 mt-0.5">
              {co2Result.projectedDailyKg.toLocaleString()} kg/day
            </div>
            <div className="mt-2 text-[10px] font-bold text-emerald-700 pt-1 border-t border-slate-200">
              ↓ {co2Result.reductionPercentage}% Abatement
            </div>
          </div>

          {/* Item 5: Daily Waste */}
          <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/80">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Daily Waste Quantity
            </div>
            <div className="text-xs font-mono line-through text-slate-400">
              {factoryProfile.wasteQuantity || 12.5} t/day
            </div>
            <div className="text-lg font-mono font-extrabold text-emerald-600 mt-0.5">
              {((factoryProfile.wasteQuantity || 12.5) * (1 - (currentAlt?.circularityScore || 80) / 100 * 0.45)).toFixed(1)} t/day
            </div>
            <div className="mt-2 text-[10px] font-bold text-sky-700 pt-1 border-t border-slate-200">
              Circular Recovery: {currentAlt?.circularityScore || 80}/100
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5. VISUAL CHARTS: SAVINGS BREAKDOWN & 5-YEAR CUMULATIVE IMPACT             */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 5 Cols: Annual Savings Breakdown Chart */}
        <div className="lg:col-span-5 acrylic-card rounded-2xl p-6 border border-slate-200/90 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-200/80">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-sky-600" />
                <h3 className="font-bold text-sm text-slate-900">
                  Annual Savings Breakdown
                </h3>
              </div>
              <span className="text-[10px] font-mono font-bold text-slate-500">
                INR (₹)
              </span>
            </div>

            <p className="text-xs text-slate-500 my-3">
              Distribution of recurring operational cost savings across 4 functional domains.
            </p>

            <div className="h-56 w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={savingsBreakdownData} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis type="number" tickFormatter={(val) => `₹${(val / 100000).toFixed(1)}L`} tick={{ fontSize: 10, fill: '#64748B' }} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: '#334155' }} width={90} />
                  <Tooltip 
                    formatter={(value: any) => [formatINR(Number(value)), 'Annual Benefit']}
                    contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', borderRadius: '0.75rem', fontSize: '11px' }}
                  />
                  <Bar dataKey="amount" radius={[0, 6, 6, 0]}>
                    {savingsBreakdownData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Aggregated Gross Annual Savings:</span>
            <strong className="text-slate-900 font-mono font-bold">{formatINR(operatingSavings.totalAnnualSavings)}</strong>
          </div>
        </div>

        {/* Right 7 Cols: 5-Year Cumulative Financial Impact Chart */}
        <div className="lg:col-span-7 acrylic-card rounded-2xl p-6 border border-slate-200/90 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-200/80">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-600" />
                <h3 className="font-bold text-sm text-slate-900">
                  5-Year Cumulative Net Financial Impact
                </h3>
              </div>
              <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Break-Even Horizon
              </span>
            </div>

            <p className="text-xs text-slate-500 my-3">
              Cumulative net cash position starting from initial investment at Year 0 through 5 operating years.
            </p>

            <div className="h-56 w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={fiveYearBenefitData} margin={{ top: 10, right: 15, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="cashFlowGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#059669" stopOpacity={0.35}/>
                      <stop offset="95%" stopColor="#059669" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="year" tick={{ fontSize: 10, fill: '#64748B' }} />
                  <YAxis 
                    tickFormatter={(val) => `₹${(val / 100000).toFixed(0)}L`}
                    tick={{ fontSize: 10, fill: '#64748B' }} 
                  />
                  <Tooltip 
                    formatter={(value: any) => [formatINR(Number(value)), 'Cumulative Position']}
                    contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', borderRadius: '0.75rem', fontSize: '11px' }}
                  />
                  <ReferenceLine y={0} stroke="#EF4444" strokeDasharray="3 3" label={{ value: 'Break-Even (₹0)', fill: '#EF4444', fontSize: 10, position: 'insideTopRight' }} />
                  <Area 
                    type="monotone" 
                    dataKey="cumulativeBenefit" 
                    stroke="#059669" 
                    strokeWidth={2.5} 
                    fillOpacity={1} 
                    fill="url(#cashFlowGrad)" 
                    name="Net Cash Flow" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">5-Year Cumulative Net Surplus:</span>
            <span className="font-mono font-extrabold text-emerald-700 text-sm">
              {formatINR(fiveYearBenefitData[fiveYearBenefitData.length - 1]?.cumulativeBenefit || 0)}
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 6. COMPARE AI RECOMMENDATIONS MATRIX                                      */}
      {/* ========================================================================= */}
      <div className="acrylic-card rounded-2xl p-6 border border-slate-200/90 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200/80 mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Comparative Financial & Environmental Matrix
            </h2>
            <p className="text-xs text-slate-500">
              Cross-evaluate capital outlays and payback profiles across all synthesized alternatives.
            </p>
          </div>
          <span className="text-[10px] text-slate-400 font-medium">
            * Multi-criteria ranking preserved from AI engine
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500 bg-slate-50/60">
                <th className="py-2.5 px-3">Alternative</th>
                <th className="py-2.5 px-3">Est. Investment</th>
                <th className="py-2.5 px-3">Annual Savings</th>
                <th className="py-2.5 px-3">CO₂ Reduction</th>
                <th className="py-2.5 px-3">Payback Period</th>
                <th className="py-2.5 px-3">ROI (%)</th>
                <th className="py-2.5 px-3">Circularity</th>
                <th className="py-2.5 px-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {alternatives.map((alt) => {
                const isSelected = alt.id === activeAltId;
                const isRec = alt.isRecommended;
                
                // Calculate quick metrics for each alternative in table
                const altCostInputs = getInitialCostInputs(alt);
                const altInvest = calculateTotalInvestment(altCostInputs);
                const altEnergy = calculateEnergySavings(factoryProfile, alt);
                const altWaste = calculateWasteSavings(factoryProfile, alt);
                const altOp = calculateOperatingSavings(factoryProfile, alt);
                const altMaint = calculateMaintenanceSavings(factoryProfile, alt);
                const altSavings = calculateAnnualSavings(altEnergy, altWaste, altOp, altMaint, altCostInputs.additionalAnnualMaintenanceCost);
                const altPayback = calculatePayback(altInvest, altSavings.annualNetSavings);
                const altROI = calculateROI(altSavings.annualNetSavings, altInvest);

                return (
                  <tr 
                    key={alt.id} 
                    className={`transition-colors ${isSelected ? 'bg-sky-50/70 font-semibold' : 'hover:bg-slate-50/70'}`}
                  >
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-slate-700">{alt.code}:</span>
                        <span className="truncate max-w-xs text-slate-900">{alt.title}</span>
                        {isRec && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-600 text-white flex-shrink-0">
                            AI Pick
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-slate-800">
                      {formatINR(altInvest)}
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-emerald-700">
                      {formatINR(altSavings.annualNetSavings)}
                    </td>
                    <td className="py-3 px-3 font-mono text-emerald-700 font-bold">
                      +{alt.emissionReductionPercentage}%
                    </td>
                    <td className="py-3 px-3 font-mono text-sky-700">
                      {altPayback.display}
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-slate-900">
                      {altROI}%
                    </td>
                    <td className="py-3 px-3 font-mono text-cyan-700">
                      {alt.circularityScore}/100
                    </td>
                    <td className="py-3 px-3">
                      <button
                        type="button"
                        onClick={() => setActiveAltId(alt.id)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all border ${
                          isSelected
                            ? 'bg-sky-600 text-white border-sky-600 shadow-sm'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {isSelected ? 'Active' : 'Evaluate'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 7. DYNAMIC AI DECISION SUMMARY & IMPLEMENTATION OUTLOOK                   */}
      {/* ========================================================================= */}
      <div className="acrylic-card rounded-2xl p-6 border border-slate-200/90 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200/80">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold font-mono text-sky-700 bg-sky-100 px-2 py-0.5 rounded uppercase">
                Executive Synthesis
              </span>
              <span className="text-xs text-slate-500 font-medium">Financial Impact Summary</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mt-1">
              AI Decision Rationale & Recommendation Horizon
            </h3>
          </div>

          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold uppercase tracking-wider ${getOutlookBadgeColor(decisionSummary.outlook)}`}>
            {decisionSummary.outlook === 'RECOMMENDED' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            ) : decisionSummary.outlook === 'REVIEW REQUIRED' ? (
              <AlertCircle className="w-4 h-4 text-amber-600" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600" />
            )}
            <span>Outlook: {decisionSummary.outlook}</span>
          </div>
        </div>

        <div className="mt-4 space-y-3">
          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
            {decisionSummary.narrativeText}
          </p>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600 flex items-start gap-2">
            <Info className="w-4 h-4 text-sky-600 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-800">Operational Assessment:</span>{' '}
              {decisionSummary.outlookRationale}
            </div>
          </div>
        </div>

        {/* Data Honesty Disclaimer */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
          <span>* Estimated / Simulation Data. Calculations are decision-support projections based on operational heuristics.</span>
          <span className="font-mono text-slate-400">EcoVision Finance v1.0</span>
        </div>
      </div>
    </div>
  );
};
