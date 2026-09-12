import React, { useState, useEffect, useCallback } from 'react';
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
  ShieldAlert,
  Server,
  RefreshCw,
  WifiOff,
  Database
} from 'lucide-react';
import { ProcessFlowMap } from '../components/process/ProcessFlowMap';
import { 
  fetchPlantSummary, 
  fetchEmissionsSummary, 
  fetchRecommendations, 
  fetchActions,
  PlantSummary,
  EmissionsSummary,
  RecommendationItem,
  ActionItem
} from '../services/api';

export const OverviewView: React.FC = () => {
  const { 
    simulationResult, 
    factoryProfile, 
    setActiveTab, 
    setActivePipelineStage 
  } = useApp();

  // Backend Integration State
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isBackendLive, setIsBackendLive] = useState<boolean>(false);
  const [backendError, setBackendError] = useState<string | null>(null);
  const [plantSummary, setPlantSummary] = useState<PlantSummary | null>(null);
  const [emissionsSummary, setEmissionsSummary] = useState<EmissionsSummary | null>(null);
  const [backendRecommendations, setBackendRecommendations] = useState<RecommendationItem[] | null>(null);
  const [backendActions, setBackendActions] = useState<ActionItem[] | null>(null);

  // Load backend data with graceful fallback
  const loadOverviewData = useCallback(async () => {
    setIsLoading(true);
    setBackendError(null);

    // Map frontend preset ID to backend plant ID
    const mappedPlantId = factoryProfile.id === 'DEMO002' ? 'PLANT-B' : 'PLANT-A';

    try {
      const [pSummary, eSummary, recs, acts] = await Promise.all([
        fetchPlantSummary(mappedPlantId),
        fetchEmissionsSummary(mappedPlantId),
        fetchRecommendations(mappedPlantId, 3),
        fetchActions(mappedPlantId, 5),
      ]);

      if (pSummary || eSummary || (recs && recs.length > 0) || (acts && acts.length > 0)) {
        setIsBackendLive(true);
        setPlantSummary(pSummary);
        setEmissionsSummary(eSummary);
        setBackendRecommendations(recs);
        setBackendActions(acts);
      } else {
        // Backend returned nulls (e.g. 404 or offline)
        setIsBackendLive(false);
      }
    } catch (err: any) {
      setIsBackendLive(false);
      setBackendError(err?.message || 'Backend service unreachable. Running in offline fallback mode.');
    } finally {
      setIsLoading(false);
    }
  }, [factoryProfile.id]);

  useEffect(() => {
    loadOverviewData();
  }, [loadOverviewData]);

  // Computed values with fallback to local simulationEngine results
  const emissionRiskScore = emissionsSummary?.avg_risk_score ?? plantSummary?.avg_risk_score ?? simulationResult.emissionRiskScore;
  const emissionRiskStatus = isBackendLive && emissionRiskScore !== undefined
    ? (emissionRiskScore >= 75 ? 'CRITICAL' : emissionRiskScore >= 50 ? 'HIGH' : emissionRiskScore >= 30 ? 'WARNING' : 'NORMAL')
    : simulationResult.emissionRiskStatus;

  const activeHotspotsCount = plantSummary?.active_hotspots ?? simulationResult.activeHotspotsCount;
  const activeHotspotsSubtitle = isBackendLive && plantSummary
    ? `${plantSummary.open_incidents} Open Incident(s) Active`
    : '2 Critical (Scrubber & Furnace)';

  // Top Recommendation: backend or fallback
  const hasLiveRec = backendRecommendations && backendRecommendations.length > 0;
  const topRec = hasLiveRec ? {
    code: backendRecommendations[0].id.toUpperCase(),
    title: backendRecommendations[0].title,
    summary: backendRecommendations[0].description,
    computedEcoScore: Math.round(backendRecommendations[0].circularity || 88),
    emissionReductionPercentage: backendRecommendations[0].co2Reduction,
    annualSavingsUSD: Math.round(backendRecommendations[0].costReduction * 1000),
  } : simulationResult.recommendedAlternative;

  // Immediate Engineering Actions: backend or fallback
  const hasLiveActions = backendActions && backendActions.length > 0;
  const displayActions = hasLiveActions 
    ? backendActions.slice(0, 2).map((a) => ({
        id: a.id,
        title: a.title,
        priority: a.priority,
        description: a.description,
        targetUnit: a.equipment_id || 'Process Unit SC-01',
        dueDate: a.status === 'COMPLETED' ? 'Completed' : 'Immediate Intervention',
      }))
    : simulationResult.actionPlan.slice(0, 2);

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Executive Welcome Card */}
      <div className="acrylic-card rounded-2xl p-6 border border-slate-200 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold font-mono text-sky-700 bg-sky-100 px-2.5 py-1 rounded-full uppercase tracking-wider">
                Executive Overview
              </span>
              <span className="text-xs text-slate-500 font-medium">| Industrial Emission Intelligence Platform</span>
              
              {/* Live Connection / Offline Fallback Status Indicator */}
              {isLoading ? (
                <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-700 text-xs font-medium border border-sky-200 animate-pulse">
                  <RefreshCw className="w-3 h-3 animate-spin text-sky-600" />
                  Syncing backend...
                </span>
              ) : isBackendLive ? (
                <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
                  <Server className="w-3 h-3 text-emerald-600" />
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Live API: {plantSummary?.plant_id || 'PLANT-A'}
                </span>
              ) : (
                <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 text-xs font-semibold border border-amber-200">
                  <WifiOff className="w-3 h-3 text-amber-600" />
                  Offline Fallback (Local Engine)
                </span>
              )}
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-2">
              Decarbonization Decision Center
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-3xl leading-relaxed">
              Real-time anomaly monitoring for <strong>{plantSummary?.name || factoryProfile.name}</strong>. The EcoVision neural pipeline has identified critical emission leak points and computed optimized circular interventions.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-shrink-0">
            <button
              type="button"
              onClick={loadOverviewData}
              disabled={isLoading}
              className="px-3 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all border border-slate-200 flex items-center gap-1.5"
              title="Refresh Live Telemetry from FastAPI Backend"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>{isLoading ? 'Syncing...' : 'Sync'}</span>
            </button>
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

        {/* Informative notification if offline fallback is active */}
        {!isBackendLive && !isLoading && (
          <div className="mt-4 p-2.5 rounded-xl bg-amber-50/80 border border-amber-200/80 flex items-center justify-between text-xs text-amber-900">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span>
                Backend server is currently offline or unreachable. Displaying cached high-fidelity simulation engine data.
              </span>
            </div>
            <button 
              type="button"
              onClick={loadOverviewData}
              className="text-xs font-bold text-amber-800 underline hover:text-amber-950 flex-shrink-0 ml-3"
            >
              Retry Connection
            </button>
          </div>
        )}
      </div>

      {/* 4 Executive KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Emission Risk Index */}
        <div className="acrylic-card rounded-2xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Emission Risk Index</span>
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-extrabold font-mono text-slate-900">
              {emissionRiskScore}
            </span>
            <span className="text-xs font-semibold text-slate-400 font-mono">/ 100</span>
          </div>
          <div className="mt-2 text-xs font-bold uppercase tracking-wider text-rose-700 flex items-center justify-between">
            <span>{emissionRiskStatus} ALERT</span>
            {isBackendLive && (
              <span className="text-[10px] font-normal text-slate-500 font-sans normal-case">
                SQL Avg: {emissionsSummary?.avg_risk_score ?? plantSummary?.avg_risk_score}
              </span>
            )}
          </div>
        </div>

        {/* KPI 2: Active Hotspots */}
        <div className="acrylic-card rounded-2xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Active Hotspots</span>
            <Crosshair className="w-4 h-4 text-amber-500" />
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-extrabold font-mono text-slate-900">
              {activeHotspotsCount}
            </span>
            <span className="text-xs text-slate-500 font-medium">Unit Nodes</span>
          </div>
          <div className="mt-2 text-xs font-bold text-amber-700">
            {activeHotspotsSubtitle}
          </div>
        </div>

        {/* KPI 3: Potential Reduction */}
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

        {/* KPI 4: Circularity Score */}
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
              <span className="text-xs font-bold uppercase tracking-wider text-sky-700 bg-sky-100 px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
                <Sparkles className="w-3 h-3" />
                {hasLiveRec ? 'Live AI Recommendation' : 'AI Top Recommendation'}
              </span>
              <span className="text-xs font-mono font-bold text-sky-800">
                EcoScore: {topRec.computedEcoScore}/100
              </span>
            </div>

            <h4 className="font-extrabold text-base text-slate-900">
              {topRec.code}: {topRec.title}
            </h4>

            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              {topRec.summary}
            </p>

            <div className="grid grid-cols-2 gap-3 my-4">
              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200">
                <div className="text-[10px] font-semibold text-emerald-800 uppercase">CO₂ Abatement</div>
                <div className="text-base font-bold font-mono text-emerald-700">
                  +{topRec.emissionReductionPercentage}%
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-sky-50 border border-sky-200">
                <div className="text-[10px] font-semibold text-sky-800 uppercase">Annual Savings</div>
                <div className="text-base font-bold font-mono text-sky-700">
                  ₹{Math.round(topRec.annualSavingsUSD * 80).toLocaleString('en-IN')}
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
              <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <span>Immediate Engineering Actions Required</span>
                {hasLiveActions && (
                  <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Live SQL
                  </span>
                )}
              </h4>
              <span className="text-xs font-mono font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                Critical Priority
              </span>
            </div>

            <div className="space-y-3">
              {displayActions.map((item) => (
                <div key={item.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-900">{item.title}</span>
                    <span className="text-[10px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded uppercase">
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

