import React from 'react';
import { useApp } from '../context/AppContext';
import { PriorityPreset } from '../types';
import { 
  Sliders, 
  Leaf, 
  DollarSign, 
  Sparkles, 
  Wrench, 
  ShieldAlert, 
  Award, 
  ArrowRight, 
  RotateCcw,
  Binary
} from 'lucide-react';

const PRESET_OPTIONS: { id: PriorityPreset; label: string; desc: string }[] = [
  { id: 'Environment-first', label: 'Environment-First', desc: 'Maximum decarbonization (CO₂ focus)' },
  { id: 'Cost-first', label: 'Cost-First', desc: 'Accelerated OPEX & CAPEX payback' },
  { id: 'Circularity-first', label: 'Circularity-First', desc: 'High recycled content & zero-waste' },
  { id: 'Low-disruption', label: 'Low-Disruption', desc: 'Maximum feasibility & lowest plant downtime' },
  { id: 'Balanced', label: 'Balanced Matrix', desc: 'Equal harmonic weighting across all dimensions' }
];

export const MultiCriteriaOptimizerView: React.FC = () => {
  const { 
    optimizerWeights, 
    updateWeights, 
    applyPriorityPreset, 
    activePriorityPreset, 
    simulationResult,
    setActiveTab,
    setActivePipelineStage 
  } = useApp();

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="acrylic-card rounded-2xl p-6 border border-slate-200 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold font-mono text-indigo-700 bg-indigo-100 px-2.5 py-1 rounded-full uppercase tracking-wider">
                Optimization Engine
              </span>
              <span className="text-xs text-slate-500 font-medium">| Dynamic Decision Weights</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-2">
              Multi-Criteria Decision Matrix & EcoScore
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-3xl leading-relaxed">
              Dynamically balance conflicting industrial objectives: Environmental compliance, financial payback, material circularity, and operational feasibility.
            </p>
          </div>

          <div className="p-3 bg-slate-100/90 rounded-xl border border-slate-200 text-xs">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Active Ranking Leader:
            </div>
            <div className="font-extrabold text-sm text-sky-800 font-mono mt-0.5">
              {simulationResult.recommendedAlternative.code}: {simulationResult.recommendedAlternative.title.split('&')[0]}
            </div>
          </div>
        </div>
      </div>

      {/* Preset Strategy Selector */}
      <div className="acrylic-card rounded-2xl p-6 border border-slate-200 shadow-sm">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
          Select Strategic Executive Priority Preset:
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {PRESET_OPTIONS.map((preset) => {
            const isSelected = activePriorityPreset === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => applyPriorityPreset(preset.id)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'bg-sky-50 border-sky-400 text-sky-950 font-bold shadow-xs ring-2 ring-sky-400/20'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="text-xs font-bold truncate">{preset.label}</div>
                <div className="text-[10px] text-slate-500 mt-1 leading-tight">{preset.desc}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4 Weight Sliders & EcoScore Formula */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sliders (8 cols) */}
        <div className="lg:col-span-8 acrylic-card rounded-2xl p-6 border border-slate-200 shadow-sm space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-sky-600" />
              Fine-Tune Optimization Objective Weights
            </h3>
            <span className="text-[11px] font-mono text-slate-500">Live Re-calculation</span>
          </div>

          {/* 1. Environmental Weight */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Leaf className="w-4 h-4 text-emerald-600" />
                Environmental Benefit (CO₂e, Energy, Effluent)
              </span>
              <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
                {optimizerWeights.environmental}%
              </span>
            </div>
            <input
              type="range"
              min={10}
              max={100}
              value={optimizerWeights.environmental}
              onChange={(e) => updateWeights({ environmental: Number(e.target.value) })}
              className="w-full h-2 bg-slate-200 rounded-lg cursor-pointer"
            />
          </div>

          {/* 2. Economic Weight */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-sky-600" />
                Economic Benefit (CAPEX, OPEX Savings, Payback Speed)
              </span>
              <span className="text-xs font-mono font-bold text-sky-700 bg-sky-50 px-2.5 py-0.5 rounded border border-sky-200">
                {optimizerWeights.economic}%
              </span>
            </div>
            <input
              type="range"
              min={10}
              max={100}
              value={optimizerWeights.economic}
              onChange={(e) => updateWeights({ economic: Number(e.target.value) })}
              className="w-full h-2 bg-slate-200 rounded-lg cursor-pointer"
            />
          </div>

          {/* 3. Circularity Weight */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-cyan-600" />
                Circularity Score (Recyclability, Byproduct Divert)
              </span>
              <span className="text-xs font-mono font-bold text-cyan-700 bg-cyan-50 px-2.5 py-0.5 rounded border border-cyan-200">
                {optimizerWeights.circularity}%
              </span>
            </div>
            <input
              type="range"
              min={10}
              max={100}
              value={optimizerWeights.circularity}
              onChange={(e) => updateWeights({ circularity: Number(e.target.value) })}
              className="w-full h-2 bg-slate-200 rounded-lg cursor-pointer"
            />
          </div>

          {/* 4. Feasibility Weight */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Wrench className="w-4 h-4 text-indigo-600" />
                Operational Feasibility (TRL, Process Compatibility)
              </span>
              <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded border border-indigo-200">
                {optimizerWeights.feasibility}%
              </span>
            </div>
            <input
              type="range"
              min={10}
              max={100}
              value={optimizerWeights.feasibility}
              onChange={(e) => updateWeights({ feasibility: Number(e.target.value) })}
              className="w-full h-2 bg-slate-200 rounded-lg cursor-pointer"
            />
          </div>

          {/* 5. Implementation Risk Tolerance */}
          <div className="space-y-1.5 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-amber-600" />
                Implementation Risk Tolerance
              </span>
              <span className="text-xs font-mono font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded border border-amber-200">
                {optimizerWeights.riskTolerance}%
              </span>
            </div>
            <input
              type="range"
              min={10}
              max={100}
              value={optimizerWeights.riskTolerance}
              onChange={(e) => updateWeights({ riskTolerance: Number(e.target.value) })}
              className="w-full h-2 bg-slate-200 rounded-lg cursor-pointer"
            />
          </div>
        </div>

        {/* EcoScore Formula & Real-time Re-ranking (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Formula Box */}
          <div className="acrylic-card rounded-2xl p-5 border border-slate-200 shadow-sm">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
              Multi-Objective Formulation
            </span>
            <h4 className="font-bold text-sm text-slate-900 mb-2">
              Visual EcoScore Objective Function:
            </h4>
            <div className="bg-slate-900 text-sky-300 p-3 rounded-xl font-mono text-xs leading-relaxed">
              EcoScore = <br />
              + (w_env · CO₂ Reduction)<br />
              + (w_econ · Cost Savings)<br />
              + (w_circ · Circularity)<br />
              + (w_feas · Feasibility)<br />
              − (w_risk · Risk Score)
            </div>
          </div>

          {/* Live Re-ranked List */}
          <div className="acrylic-card rounded-2xl p-5 border border-slate-200 shadow-sm">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-2">
              Dynamic Real-Time Re-ranking:
            </span>
            <div className="space-y-2">
              {simulationResult.alternatives.map((alt, rank) => (
                <div 
                  key={alt.id}
                  className={`p-3 rounded-xl border flex items-center justify-between ${
                    rank === 0 
                      ? 'bg-sky-50 border-sky-300 font-bold' 
                      : 'bg-white border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-mono ${
                      rank === 0 ? 'bg-sky-600 text-white font-bold' : 'bg-slate-200 text-slate-600'
                    }`}>
                      {rank + 1}
                    </span>
                    <span className="text-xs text-slate-800 truncate">{alt.code}</span>
                  </div>
                  <div className="font-mono text-xs font-bold text-sky-700">
                    {alt.computedEcoScore} pts
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
