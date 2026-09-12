import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  AlertTriangle, 
  Activity, 
  Crosshair, 
  TrendingDown, 
  Sparkles, 
  ArrowRight, 
  Radio, 
  Sliders, 
  Binary, 
  CheckCircle2, 
  Layers, 
  Building2, 
  Clock,
  ShieldAlert
} from 'lucide-react';
import { ProcessFlowMap } from '../components/process/ProcessFlowMap';

export const OverviewView: React.FC = () => {
  const { 
    simulationResult, 
    factoryProfile, 
    setActiveTab, 
    setActivePipelineStage 
  } = useApp();

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Executive Welcome Card */}
      <div className="acrylic-card rounded-2xl p-6 border border-slate-200 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold font-mono text-sky-700 bg-sky-100 px-2.5 py-1 rounded-full uppercase tracking-wider">
                Executive Overview
              </span>
              <span className="text-xs text-slate-500 font-medium">| Industrial Emission Intelligence Platform</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-2">
              Decarbonization Decision Center
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-3xl leading-relaxed">
              Real-time anomaly monitoring for <strong>{factoryProfile.name}</strong>. The EcoVision neural pipeline has identified critical emission leak points and computed optimized circular interventions.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-shrink-0">
            <button
              type="button"
              onClick={() => { setActivePipelineStage('LOCALIZE'); setActiveTab('hotspot-detection'); }}
              className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-2"
            >
              <Crosshair className="w-4 h-4" />
              <span>Inspect Hotspots</span>
            </button>
            <button
              type="button"
              onClick={() => { setActivePipelineStage('SIMULATE'); setActiveTab('what-if'); }}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all border border-slate-200 flex items-center gap-2"
            >
              <Binary className="w-4 h-4" />
              <span>Simulate Sandbox</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Executive KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div className="acrylic-card rounded-2xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Emission Risk Index</span>
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-extrabold font-mono text-slate-900">
              {simulationResult.emissionRiskScore}
            </span>
            <span className="text-xs font-semibold text-slate-400 font-mono">/ 100</span>
          </div>
          <div className="mt-2 text-xs font-bold uppercase tracking-wider text-rose-700">
            {simulationResult.emissionRiskStatus} ALERT
          </div>
        </div>

        {/* KPI 2 */}
        <div className="acrylic-card rounded-2xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Active Hotspots</span>
            <Crosshair className="w-4 h-4 text-amber-500" />
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-extrabold font-mono text-slate-900">
              {simulationResult.activeHotspotsCount}
            </span>
            <span className="text-xs text-slate-500 font-medium">Unit Nodes</span>
          </div>
          <div className="mt-2 text-xs font-bold text-amber-700">
            2 Critical (Scrubber & Furnace)
          </div>
        </div>

        {/* KPI 3 */}
        <div className="acrylic-card rounded-2xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Potential Reduction</span>
            <TrendingDown className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-extrabold font-mono text-emerald-600">
              {simulationResult.potentialReductionPercentage}%
            </span>
            <span className="text-xs text-slate-500 font-medium">CO₂e Target</span>
          </div>
          <div className="mt-2 text-xs font-bold text-emerald-700">
            ~{simulationResult.potentialCO2eSavedKgDay} kg CO₂e / day
          </div>
        </div>

        {/* KPI 4 */}
        <div className="acrylic-card rounded-2xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Circularity Score</span>
            <Sparkles className="w-4 h-4 text-sky-500" />
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-extrabold font-mono text-slate-900">
              {simulationResult.circularityScore}
            </span>
            <span className="text-xs font-semibold text-slate-400 font-mono">/ 100</span>
          </div>
          <div className="mt-2 text-xs font-bold text-sky-700">
            Feedstock & Waste Diversion
          </div>
        </div>
      </div>

      {/* Digital Twin Lite Map */}
      <div className="acrylic-card rounded-2xl p-6 border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              Live Digital Twin Lite Process Map
            </h3>
            <p className="text-xs text-slate-500">
              Click any equipment node to inspect telemetry anomalies and localized probable sources.
            </p>
          </div>
          <button
            type="button"
            onClick={() => { setActivePipelineStage('LOCALIZE'); setActiveTab('hotspot-detection'); }}
            className="text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1"
          >
            <span>Full Digital Twin View</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <ProcessFlowMap />
      </div>

      {/* Recommended Alternative Highlight & Action Center Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recommended Alternative */}
        <div className="acrylic-card rounded-2xl p-6 border border-sky-300 bg-gradient-to-br from-sky-50/60 via-white to-white shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-sky-700 bg-sky-100 px-2.5 py-0.5 rounded-full">
                AI Top Recommendation
              </span>
              <span className="text-xs font-mono font-bold text-sky-800">
                EcoScore: {simulationResult.recommendedAlternative.computedEcoScore}/100
              </span>
            </div>

            <h4 className="font-extrabold text-base text-slate-900">
              {simulationResult.recommendedAlternative.code}: {simulationResult.recommendedAlternative.title}
            </h4>

            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              {simulationResult.recommendedAlternative.summary}
            </p>

            <div className="grid grid-cols-2 gap-3 my-4">
              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200">
                <div className="text-[10px] font-semibold text-emerald-800 uppercase">CO₂ Abatement</div>
                <div className="text-base font-bold font-mono text-emerald-700">
                  +{simulationResult.recommendedAlternative.emissionReductionPercentage}%
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-sky-50 border border-sky-200">
                <div className="text-[10px] font-semibold text-sky-800 uppercase">Annual Savings</div>
                <div className="text-base font-bold font-mono text-sky-700">
                  ₹{Math.round(simulationResult.recommendedAlternative.annualSavingsUSD * 80).toLocaleString('en-IN')}
                </div>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => { setActivePipelineStage('RECOMMEND'); setActiveTab('ai-recommendations'); }}
            className="w-full py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold transition-colors flex items-center justify-center gap-2"
          >
            <span>Review Full Circular Alternatives</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Action Center Preview */}
        <div className="acrylic-card rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-3">
              <h4 className="font-bold text-sm text-slate-900">
                Immediate Engineering Actions Required
              </h4>
              <span className="text-xs font-mono font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                Critical Priority
              </span>
            </div>

            <div className="space-y-3">
              {simulationResult.actionPlan.slice(0, 2).map((item) => (
                <div key={item.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-900">{item.title}</span>
                    <span className="text-[10px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded">
                      {item.priority}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 line-clamp-2">{item.description}</p>
                  <div className="mt-2 text-[10px] text-slate-500 flex justify-between">
                    <span>Target: {item.targetUnit}</span>
                    <span className="font-mono text-slate-700 font-semibold">{item.dueDate}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={() => { setActivePipelineStage('ACT'); setActiveTab('action-center'); }}
            className="w-full mt-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors flex items-center justify-center gap-2"
          >
            <span>Open Action Center</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
