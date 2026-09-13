import React, { useState } from 'react';
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
  RefreshCw,
  Layers,
  Activity,
  CheckCircle2
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

type MetricViewMode = 'normalized' | 'emissions' | 'scores';

export const WhatIfSimulatorView: React.FC = () => {
  const [viewMode, setViewMode] = useState<MetricViewMode>('normalized');

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

  const getChartData = () => {
    if (viewMode === 'emissions') {
      return [
        {
          metric: 'Total Daily CO₂e',
          'Current Scenario': deltas.baselineEmissions,
          'Scenario B (Simulated)': deltas.simulatedEmissions,
          baselineRaw: `${deltas.baselineEmissions.toLocaleString()} kg/d`,
          simulatedRaw: `${deltas.simulatedEmissions.toLocaleString()} kg/d`,
          unit: 'kg CO₂e/day',
          delta: `-${deltas.reductionPercentage}%`
        },
        {
          metric: 'Energy Scope',
          'Current Scenario': Math.round(deltas.baselineEmissions * 0.45),
          'Scenario B (Simulated)': Math.round(deltas.simulatedEmissions * (1 - (whatIfScenario.renewableEnergyPercentage / 100) * 0.55)),
          baselineRaw: `${Math.round(deltas.baselineEmissions * 0.45).toLocaleString()} kg/d`,
          simulatedRaw: `${Math.round(deltas.simulatedEmissions * (1 - (whatIfScenario.renewableEnergyPercentage / 100) * 0.55)).toLocaleString()} kg/d`,
          unit: 'kg CO₂e/day',
          delta: `${Math.round(whatIfScenario.renewableEnergyPercentage * 0.48)}% cut`
        },
        {
          metric: 'Process Scope',
          'Current Scenario': Math.round(deltas.baselineEmissions * 0.55),
          'Scenario B (Simulated)': Math.round(deltas.simulatedEmissions * (1 - (whatIfScenario.recycledMaterialPercentage / 100) * 0.40)),
          baselineRaw: `${Math.round(deltas.baselineEmissions * 0.55).toLocaleString()} kg/d`,
          simulatedRaw: `${Math.round(deltas.simulatedEmissions * (1 - (whatIfScenario.recycledMaterialPercentage / 100) * 0.40)).toLocaleString()} kg/d`,
          unit: 'kg CO₂e/day',
          delta: `${Math.round(whatIfScenario.recycledMaterialPercentage * 0.42)}% cut`
        }
      ];
    }

    if (viewMode === 'scores') {
      return [
        {
          metric: 'Risk Score (0-100)',
          'Current Scenario': deltas.emissionRiskBefore,
          'Scenario B (Simulated)': deltas.emissionRiskAfter,
          baselineRaw: `${deltas.emissionRiskBefore} / 100`,
          simulatedRaw: `${deltas.emissionRiskAfter} / 100`,
          unit: 'Points (0-100)',
          delta: `${deltas.emissionRiskAfter - deltas.emissionRiskBefore > 0 ? '+' : ''}${deltas.emissionRiskAfter - deltas.emissionRiskBefore} pts`
        },
        {
          metric: 'Circularity (0-100)',
          'Current Scenario': deltas.circularityBefore,
          'Scenario B (Simulated)': deltas.circularityAfter,
          baselineRaw: `${deltas.circularityBefore} / 100`,
          simulatedRaw: `${deltas.circularityAfter} / 100`,
          unit: 'Points (0-100)',
          delta: `+${deltas.circularityAfter - deltas.circularityBefore} pts`
        },
        {
          metric: 'Renewable Share (%)',
          'Current Scenario': 24,
          'Scenario B (Simulated)': whatIfScenario.renewableEnergyPercentage,
          baselineRaw: '24%',
          simulatedRaw: `${whatIfScenario.renewableEnergyPercentage}%`,
          unit: 'Percentage',
          delta: `+${whatIfScenario.renewableEnergyPercentage - 24}%`
        },
        {
          metric: 'Recycled Ratio (%)',
          'Current Scenario': 18,
          'Scenario B (Simulated)': whatIfScenario.recycledMaterialPercentage,
          baselineRaw: '18%',
          simulatedRaw: `${whatIfScenario.recycledMaterialPercentage}%`,
          unit: 'Percentage',
          delta: `+${whatIfScenario.recycledMaterialPercentage - 18}%`
        }
      ];
    }

    // Default: Normalized Comparison (% / 100-base scale so all 3 metrics are clearly visible)
    const simulatedEmissionsNorm = Math.max(
      0,
      Math.round((deltas.simulatedEmissions / (deltas.baselineEmissions || 1)) * 100 * 10) / 10
    );

    return [
      {
        metric: 'Emissions (% Base)',
        'Current Scenario': 100,
        'Scenario B (Simulated)': simulatedEmissionsNorm,
        baselineRaw: `${deltas.baselineEmissions.toLocaleString()} kg/d (100%)`,
        simulatedRaw: `${deltas.simulatedEmissions.toLocaleString()} kg/d (${simulatedEmissionsNorm}%)`,
        unit: '% of Baseline (100%)',
        delta: `-${deltas.reductionPercentage}% reduction`
      },
      {
        metric: 'Risk Score (/100)',
        'Current Scenario': deltas.emissionRiskBefore,
        'Scenario B (Simulated)': deltas.emissionRiskAfter,
        baselineRaw: `${deltas.emissionRiskBefore} / 100`,
        simulatedRaw: `${deltas.emissionRiskAfter} / 100`,
        unit: 'Score (0-100)',
        delta: `${deltas.emissionRiskAfter - deltas.emissionRiskBefore > 0 ? '+' : ''}${deltas.emissionRiskAfter - deltas.emissionRiskBefore} pts lower`
      },
      {
        metric: 'Circularity (/100)',
        'Current Scenario': deltas.circularityBefore,
        'Scenario B (Simulated)': deltas.circularityAfter,
        baselineRaw: `${deltas.circularityBefore} / 100`,
        simulatedRaw: `${deltas.circularityAfter} / 100`,
        unit: 'Score (0-100)',
        delta: `+${deltas.circularityAfter - deltas.circularityBefore} pts gain`
      }
    ];
  };

  const chartData = getChartData();

  const CustomChartTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="acrylic-card p-3 rounded-xl border border-slate-200 shadow-xl text-xs space-y-1.5 z-50 min-w-[210px]">
          <div className="font-extrabold text-slate-900 border-b border-slate-100 pb-1 flex items-center justify-between gap-2">
            <span>{label}</span>
            {data.delta && (
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                {data.delta}
              </span>
            )}
          </div>
          <div className="flex items-center justify-between gap-4 text-slate-600">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-slate-400 inline-block" />
              <span>Current Baseline:</span>
            </span>
            <span className="font-mono font-bold text-slate-800">
              {data.baselineRaw || `${payload[0]?.value} ${data.unit || ''}`}
            </span>
          </div>
          <div className="flex items-center justify-between gap-4 text-slate-600">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-sky-600 inline-block" />
              <span>Scenario B (Sim):</span>
            </span>
            <span className="font-mono font-bold text-sky-700">
              {data.simulatedRaw || `${payload[1]?.value} ${data.unit || ''}`}
            </span>
          </div>
          {data.unit && (
            <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-100 font-mono">
              Scale: {data.unit}
            </div>
          )}
        </div>
      );
    }
    return null;
  };

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
        <div className="lg:col-span-5 acrylic-card rounded-2xl p-6 border border-white/80 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200 gap-2">
              <div>
                <h3 className="font-bold text-sm text-slate-900">
                  Scenario Comparison
                </h3>
                <span className="text-[10px] text-slate-500 font-mono">Current Baseline vs Simulated Outcome</span>
              </div>

              {/* View Mode Toggle */}
              <div className="inline-flex p-0.5 rounded-lg bg-slate-100 border border-slate-200 text-[10px] font-bold">
                <button
                  type="button"
                  onClick={() => setViewMode('normalized')}
                  className={`px-2 py-1 rounded-md transition-all ${
                    viewMode === 'normalized'
                      ? 'bg-white text-sky-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Show all metrics normalized on a 0-100% scale so all bars are clearly visible"
                >
                  All (Normalized)
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('emissions')}
                  className={`px-2 py-1 rounded-md transition-all ${
                    viewMode === 'emissions'
                      ? 'bg-white text-sky-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="View absolute daily emissions in kg CO2e"
                >
                  Emissions (kg/d)
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('scores')}
                  className={`px-2 py-1 rounded-md transition-all ${
                    viewMode === 'scores'
                      ? 'bg-white text-sky-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="View Risk & Circularity scores on 0-100 index"
                >
                  Scores (0-100)
                </button>
              </div>
            </div>

            <p className="text-xs text-slate-500 mt-2">
              {viewMode === 'normalized' 
                ? 'All metrics normalized to a 100-base scale to compare relative reductions & gains side-by-side.'
                : viewMode === 'emissions'
                ? 'Absolute emissions breakdown across operational scopes in kg CO₂e/day.'
                : 'Direct comparison of process risk and material circularity indices.'}
            </p>

            <div className="h-60 w-full mt-3">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="metric" tick={{ fontSize: 10, fill: '#64748B' }} />
                  <YAxis 
                    tick={{ fontSize: 10, fill: '#64748B' }} 
                    domain={viewMode === 'emissions' ? ['auto', 'auto'] : [0, 100]}
                  />
                  <Tooltip content={<CustomChartTooltip />} />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                  <Bar dataKey="Current Scenario" fill="#94A3B8" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Scenario B (Simulated)" fill="#0284C7" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Metric Breakdown Cards */}
          <div className="space-y-2 pt-2 border-t border-slate-200/80">
            {/* Emissions Row */}
            <div className="p-2.5 rounded-xl bg-slate-50/90 border border-slate-200/80 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="font-semibold text-slate-700">Daily Emissions:</span>
              </div>
              <div className="flex items-center gap-2 font-mono">
                <span className="line-through text-slate-400 text-[11px]">
                  {deltas.baselineEmissions.toLocaleString()} kg
                </span>
                <span className="font-extrabold text-emerald-700">
                  {deltas.simulatedEmissions.toLocaleString()} kg
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                  ↓ {deltas.reductionPercentage}%
                </span>
              </div>
            </div>

            {/* Risk Row */}
            <div className="p-2.5 rounded-xl bg-slate-50/90 border border-slate-200/80 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-sky-500" />
                <span className="font-semibold text-slate-700">Emission Risk:</span>
              </div>
              <div className="flex items-center gap-2 font-mono">
                <span className="line-through text-slate-400 text-[11px]">
                  {deltas.emissionRiskBefore}/100
                </span>
                <span className="font-extrabold text-sky-700">
                  {deltas.emissionRiskAfter}/100
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-sky-100 text-sky-800">
                  ↓ {deltas.emissionRiskBefore - deltas.emissionRiskAfter} pts
                </span>
              </div>
            </div>

            {/* Circularity Row */}
            <div className="p-2.5 rounded-xl bg-slate-50/90 border border-slate-200/80 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-cyan-500" />
                <span className="font-semibold text-slate-700">Circularity Index:</span>
              </div>
              <div className="flex items-center gap-2 font-mono">
                <span className="line-through text-slate-400 text-[11px]">
                  {deltas.circularityBefore}/100
                </span>
                <span className="font-extrabold text-cyan-700">
                  {deltas.circularityAfter}/100
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-cyan-100 text-cyan-800">
                  +{deltas.circularityAfter - deltas.circularityBefore} pts
                </span>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500">
            <span className="font-semibold text-slate-700">Simulation Status:</span> All displayed numbers are illustrative simulation parameters designed for industrial decision support.
          </div>
        </div>
      </div>
    </div>
  );
};
