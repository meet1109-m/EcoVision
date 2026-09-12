import React from 'react';
import { useApp } from '../context/AppContext';
import { calculateWhatIfDeltas } from '../data/simulationEngine';
import { 
  Binary, 
  RotateCcw, 
  TrendingDown, 
  Sparkles, 
  DollarSign, 
  ShieldCheck, 
  ArrowRight, 
  Info,
  Sliders,
  Flame,
  BatteryCharging,
  Recycle,
  Truck,
  Gauge,
  Cpu,
  Zap,
  RefreshCw
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts';

export const WhatIfSimulatorView: React.FC = () => {
  const { 
    whatIfScenario, 
    updateWhatIfScenario, 
    resetWhatIfToDefault, 
    simulationResult,
    factoryProfile,
    latestMLPrediction,
    isMLPredicting,
    runLiveMLPrediction,
    setActiveTab,
    setActivePipelineStage 
  } = useApp();

  const deltas = calculateWhatIfDeltas(
    simulationResult.dailyBaselineCO2eKg,
    simulationResult.emissionRiskScore,
    simulationResult.circularityScore,
    whatIfScenario
  );

  const comparisonChartData = [
    {
      metric: 'Emissions (kg/d)',
      'Current Scenario': deltas.baselineEmissions,
      'Scenario B (Simulated)': deltas.simulatedEmissions
    },
    {
      metric: 'Risk Score (/100)',
      'Current Scenario': deltas.emissionRiskBefore,
      'Scenario B (Simulated)': deltas.emissionRiskAfter
    },
    {
      metric: 'Circularity (/100)',
      'Current Scenario': deltas.circularityBefore,
      'Scenario B (Simulated)': deltas.circularityAfter
    }
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="acrylic-card rounded-2xl p-6 border border-white/80 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold font-mono text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full uppercase tracking-wider">
                Stage 06 • What-If Sandbox
              </span>
              <span className="text-xs text-slate-500 font-medium">| Decarbonization Scenario Simulator</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-2">
              Interactive What-If Scenario Sandbox
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-3xl leading-relaxed">
              Test hypothetical plant reconfigurations, energy transitions, and circular sourcing strategies in real-time before capital commitment.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
            <button
              type="button"
              onClick={resetWhatIfToDefault}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Baseline</span>
            </button>
            <button
              type="button"
              onClick={() => runLiveMLPrediction()}
              disabled={isMLPredicting}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 disabled:opacity-50"
            >
              {isMLPredicting ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Cpu className="w-3.5 h-3.5" />
              )}
              <span>{isMLPredicting ? 'Evaluating RF...' : 'Evaluate with ML Model'}</span>
            </button>
            <button
              type="button"
              onClick={() => { setActivePipelineStage('ACT'); setActiveTab('action-center'); }}
              className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-2"
            >
              <span>Build Action Plan</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Comparison Delta KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Estimated Daily Emissions */}
        <div className="acrylic-card rounded-2xl p-5 border border-white/80 shadow-sm">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
            Estimated Daily Emissions
          </div>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-xs line-through text-slate-400 font-mono">
              {deltas.baselineEmissions.toLocaleString()} kg
            </span>
            <span className="text-2xl font-extrabold font-mono text-emerald-600">
              {deltas.simulatedEmissions.toLocaleString()} kg
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs pt-1.5 border-t border-slate-100">
            <span className="font-bold text-emerald-700">↓ {deltas.reductionPercentage}% Reduction</span>
            <span className="text-[10px] text-slate-400 font-mono">CO₂e/day</span>
          </div>
        </div>

        {/* Emission Risk Index */}
        <div className="acrylic-card rounded-2xl p-5 border border-white/80 shadow-sm">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
            Emission Risk Index
          </div>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-xs line-through text-slate-400 font-mono">
              {deltas.emissionRiskBefore} / 100
            </span>
            <span className="text-2xl font-extrabold font-mono text-sky-700">
              {deltas.emissionRiskAfter} / 100
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs pt-1.5 border-t border-slate-100">
            <span className="font-bold text-sky-800">
              {deltas.emissionRiskAfter <= 50 ? 'Stabilized (Normal)' : 'Moderate Warning'}
            </span>
            <span className="text-[10px] text-slate-400">Predicted Risk</span>
          </div>
        </div>

        {/* Circularity Score */}
        <div className="acrylic-card rounded-2xl p-5 border border-white/80 shadow-sm">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
            Circularity Score
          </div>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-xs line-through text-slate-400 font-mono">
              {deltas.circularityBefore} / 100
            </span>
            <span className="text-2xl font-extrabold font-mono text-cyan-700">
              {deltas.circularityAfter} / 100
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs pt-1.5 border-t border-slate-100">
            <span className="font-bold text-cyan-800">
              +{deltas.circularityAfter - deltas.circularityBefore} pts Gain
            </span>
            <span className="text-[10px] text-slate-400">Closed-Loop</span>
          </div>
        </div>

        {/* Estimated Annual OPEX Savings */}
        <div className="acrylic-card rounded-2xl p-5 border border-white/80 shadow-sm">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
            Est. Annual Cost Benefit
          </div>
          <div className="mt-2">
            <span className="text-2xl font-extrabold font-mono text-slate-900">
              ₹{Math.round(deltas.estimatedAnnualSavingsUSD * 80).toLocaleString('en-IN')}
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs pt-1.5 border-t border-slate-100">
            <span className="font-bold text-slate-700">Energy & Fuel OPEX</span>
            <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">
              High ROI
            </span>
          </div>
        </div>
      </div>

      {/* Simulator Sliders & Side-by-side Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sliders (7 cols) */}
        <div className="lg:col-span-7 acrylic-card rounded-2xl p-6 border border-white/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-sky-600" />
              Adjust Operational & Decarbonization Parameters
            </h3>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Live Sandbox
            </span>
          </div>

          {/* Slider 1: Recycled Material % */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-semibold text-slate-700">
              <span className="flex items-center gap-1.5">
                <Recycle className="w-3.5 h-3.5 text-cyan-600" /> Recycled Material Ratio
              </span>
              <span className="font-mono text-cyan-700 font-bold">{whatIfScenario.recycledMaterialPercentage}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={whatIfScenario.recycledMaterialPercentage}
              onChange={(e) => updateWhatIfScenario({ recycledMaterialPercentage: Number(e.target.value) })}
              className="w-full h-2 bg-slate-200 rounded-lg cursor-pointer"
            />
          </div>

          {/* Slider 2: Renewable Energy % */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-semibold text-slate-700">
              <span className="flex items-center gap-1.5">
                <BatteryCharging className="w-3.5 h-3.5 text-emerald-600" /> Renewable Energy Share
              </span>
              <span className="font-mono text-emerald-700 font-bold">{whatIfScenario.renewableEnergyPercentage}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={whatIfScenario.renewableEnergyPercentage}
              onChange={(e) => updateWhatIfScenario({ renewableEnergyPercentage: Number(e.target.value) })}
              className="w-full h-2 bg-slate-200 rounded-lg cursor-pointer"
            />
          </div>

          {/* Slider 3: Production Rate % */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-semibold text-slate-700">
              <span className="flex items-center gap-1.5">
                <Gauge className="w-3.5 h-3.5 text-sky-600" /> Plant Production Rate
              </span>
              <span className="font-mono text-sky-700 font-bold">{whatIfScenario.productionRatePercentage}%</span>
            </div>
            <input
              type="range"
              min={50}
              max={150}
              value={whatIfScenario.productionRatePercentage}
              onChange={(e) => updateWhatIfScenario({ productionRatePercentage: Number(e.target.value) })}
              className="w-full h-2 bg-slate-200 rounded-lg cursor-pointer"
            />
          </div>

          {/* Slider 4: Process Condition Tuning (Efficiency) */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-semibold text-slate-700">
              <span className="flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-amber-600" /> Scrubber & Furnace Condition Tuning
              </span>
              <span className="font-mono text-amber-700 font-bold">{whatIfScenario.processConditionTuning}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={whatIfScenario.processConditionTuning}
              onChange={(e) => updateWhatIfScenario({ processConditionTuning: Number(e.target.value) })}
              className="w-full h-2 bg-slate-200 rounded-lg cursor-pointer"
            />
          </div>

          {/* Slider 5: Waste Recovery % */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-semibold text-slate-700">
              <span className="flex items-center gap-1.5">
                <Recycle className="w-3.5 h-3.5 text-emerald-600" /> Waste Recovery & Byproduct Divert
              </span>
              <span className="font-mono text-emerald-700 font-bold">{whatIfScenario.wasteRecoveryPercentage}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={whatIfScenario.wasteRecoveryPercentage}
              onChange={(e) => updateWhatIfScenario({ wasteRecoveryPercentage: Number(e.target.value) })}
              className="w-full h-2 bg-slate-200 rounded-lg cursor-pointer"
            />
          </div>

          {/* Slider 6: Sourcing Distance (km) */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-semibold text-slate-700">
              <span className="flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-indigo-600" /> Feedstock Sourcing Distance
              </span>
              <span className="font-mono text-indigo-700 font-bold">{whatIfScenario.sourcingDistanceKm} km</span>
            </div>
            <input
              type="range"
              min={20}
              max={800}
              value={whatIfScenario.sourcingDistanceKm}
              onChange={(e) => updateWhatIfScenario({ sourcingDistanceKm: Number(e.target.value) })}
              className="w-full h-2 bg-slate-200 rounded-lg cursor-pointer"
            />
          </div>
        </div>

        {/* Side-by-Side Scenario Chart (5 cols) */}
        <div className="lg:col-span-5 acrylic-card rounded-2xl p-6 border border-white/80 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="font-bold text-sm text-slate-900">
                Scenario Comparison
              </h3>
              <span className="text-[10px] text-slate-500 font-mono">Current vs Simulated</span>
            </div>

            <p className="text-xs text-slate-500 mt-2">
              Visualizing baseline metrics vs. simulated intervention outcomes.
            </p>

            <div className="h-64 w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={comparisonChartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="metric" tick={{ fontSize: 10, fill: '#64748B' }} />
                  <YAxis tick={{ fontSize: 10, fill: '#64748B' }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', borderRadius: '0.75rem', fontSize: '11px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Bar dataKey="Current Scenario" fill="#94A3B8" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Scenario B (Simulated)" fill="#0284C7" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500">
            <span className="font-semibold text-slate-700">Simulation Status:</span> All displayed numbers are illustrative simulation parameters designed for industrial decision support.
          </div>
        </div>
      </div>
    </div>
  );
};
