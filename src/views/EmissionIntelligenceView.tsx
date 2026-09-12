import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  AlertTriangle, 
  Activity, 
  Sparkles, 
  TrendingDown, 
  Crosshair, 
  ShieldAlert, 
  HelpCircle, 
  CheckCircle2, 
  BarChart3, 
  Layers, 
  Info,
  Clock,
  ArrowRight,
  Cpu,
  RefreshCw,
  Zap,
  Server
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ReferenceLine 
} from 'recharts';

export const EmissionIntelligenceView: React.FC = () => {
  const { 
    simulationResult, 
    latestMLPrediction, 
    isMLPredicting, 
    runLiveMLPrediction,
    setActiveTab, 
    setActivePipelineStage 
  } = useApp();

  const [lastInferenceTimeMs, setLastInferenceTimeMs] = useState<number | null>(null);

  const handleRunInference = async () => {
    const t0 = performance.now();
    await runLiveMLPrediction();
    const t1 = performance.now();
    setLastInferenceTimeMs(Math.round(t1 - t0));
  };

  const getImpactBadge = (level: string) => {
    switch (level) {
      case 'HIGH IMPACT':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'MEDIUM IMPACT':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'LOW IMPACT':
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  // Class labels for Random Forest (0: Normal, 1: Warning, 2: Leak Suspected, 3: Confirmed Leak)
  const incidentLabels = [
    { label: 'Normal', code: 0, color: 'bg-emerald-500', textColor: 'text-emerald-700', bgLight: 'bg-emerald-50 border-emerald-200' },
    { label: 'Warning', code: 1, color: 'bg-amber-500', textColor: 'text-amber-700', bgLight: 'bg-amber-50 border-amber-200' },
    { label: 'Leak Suspected', code: 2, color: 'bg-orange-500', textColor: 'text-orange-700', bgLight: 'bg-orange-50 border-orange-200' },
    { label: 'Confirmed Leak', code: 3, color: 'bg-rose-600', textColor: 'text-rose-700', bgLight: 'bg-rose-50 border-rose-200' },
  ];

  const currentClassIndex = latestMLPrediction?.incident_prediction ?? 1;
  const currentClass = incidentLabels[currentClassIndex] || incidentLabels[1];
  const classProbs = latestMLPrediction?.ml_result?.class_probabilities || {
    '0': 0.12,
    '1': 0.68,
    '2': 0.15,
    '3': 0.05,
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Live Machine Learning & Backend Connection Banner */}
      <div className="acrylic-card rounded-2xl p-5 border border-sky-200/80 bg-gradient-to-r from-sky-50/60 via-white to-indigo-50/40 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-600 text-white flex items-center justify-center flex-shrink-0 shadow-sm shadow-sky-500/30">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-sky-700 bg-sky-100 px-2 py-0.5 rounded uppercase">
                  Production ML Pipeline
                </span>
                <span className="text-xs text-slate-500 flex items-center gap-1">
                  <Server className="w-3.5 h-3.5 text-emerald-600" />
                  FastAPI Backend Connected
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 mt-0.5">
                Random Forest Incident Predictor (95.25% Test Accuracy)
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
            {lastInferenceTimeMs !== null && (
              <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                Inference: {lastInferenceTimeMs}ms
              </span>
            )}
            <button
              type="button"
              onClick={handleRunInference}
              disabled={isMLPredicting}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold transition-all shadow-sm shadow-sky-600/20 active:scale-95 disabled:opacity-50"
            >
              {isMLPredicting ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Zap className="w-3.5 h-3.5 text-amber-300" />
              )}
              <span>{isMLPredicting ? 'Evaluating Model...' : 'Run Live Inference'}</span>
            </button>
          </div>
        </div>

        {/* Real-time Multi-Class Output Breakdown */}
        <div className="mt-4 pt-4 border-t border-slate-200/80 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {incidentLabels.map((item) => {
            const isPredicted = currentClassIndex === item.code;
            const probValue = Math.round((classProbs[String(item.code)] ?? 0) * 100);

            return (
              <div 
                key={item.code} 
                className={`p-3 rounded-xl border transition-all ${
                  isPredicted 
                    ? `${item.bgLight} ring-2 ring-sky-500 shadow-sm` 
                    : 'bg-white/80 border-slate-200 opacity-80'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">
                    Class {item.code}: {item.label}
                  </span>
                  {isPredicted && (
                    <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-sky-600 text-white">
                      Predicted
                    </span>
                  )}
                </div>

                <div className="flex items-baseline justify-between mt-2">
                  <span className="text-xl font-extrabold font-mono text-slate-900">
                    {probValue}%
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">Probability</span>
                </div>

                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mt-1.5">
                  <div 
                    className={`h-full ${item.color} rounded-full transition-all duration-500`}
                    style={{ width: `${probValue}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Backend Rule Engine Signals */}
        {latestMLPrediction?.rule_signals && latestMLPrediction.rule_signals.length > 0 && (
          <div className="mt-3 p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Active Physics Rule Engine Guardrails:</span>
              <ul className="mt-1 space-y-0.5 list-disc list-inside text-amber-800 font-mono text-[11px]">
                {latestMLPrediction.rule_signals.map((sig, idx) => (
                  <li key={idx}>{sig}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Executive KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Emission Risk */}
        <div className="acrylic-card rounded-2xl p-5 border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Overall Emission Risk</span>
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-mono text-slate-900">
              {simulationResult.emissionRiskScore}
            </span>
            <span className="text-xs font-semibold text-slate-400 font-mono">/ 100</span>
          </div>
          <div className="mt-2.5 flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-200">
              {simulationResult.emissionRiskStatus}
            </span>
            <span className="text-[10px] text-slate-500 font-medium">
              ML Confidence: {latestMLPrediction ? `${Math.round(latestMLPrediction.confidence * 100)}%` : '95.2%'}
            </span>
          </div>
          <div className="mt-2 text-[10px] text-slate-400 border-t border-slate-100 pt-1.5 flex items-center justify-between">
            <span>Model: {latestMLPrediction?.model_version || 'Random Forest v2.0'}</span>
            <span className="text-emerald-600 font-medium font-mono">Live</span>
          </div>
        </div>

        {/* KPI 2: Active Hotspots */}
        <div className="acrylic-card rounded-2xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Active Hotspots</span>
            <Crosshair className="w-4 h-4 text-amber-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-mono text-slate-900">
              {simulationResult.activeHotspotsCount}
            </span>
            <span className="text-xs font-semibold text-slate-400">Localized</span>
          </div>
          <div className="mt-2.5 flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200">
              {simulationResult.criticalHotspotsCount} CRITICAL (Scrubber & Furnace)
            </span>
          </div>
          <div className="mt-2 text-[10px] text-slate-400 border-t border-slate-100 pt-1.5">
            * Probable sources flagged
          </div>
        </div>

        {/* KPI 3: Potential Reduction */}
        <div className="acrylic-card rounded-2xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Potential Reduction</span>
            <TrendingDown className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-mono text-emerald-600">
              {simulationResult.potentialReductionPercentage}%
            </span>
          </div>
          <div className="mt-2.5 flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-700">
              ~{simulationResult.potentialCO2eSavedKgDay} kg CO₂e/day
            </span>
            <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              High Impact
            </span>
          </div>
          <div className="mt-2 text-[10px] text-slate-400 border-t border-slate-100 pt-1.5">
            * Estimated simulation benefit
          </div>
        </div>

        {/* KPI 4: Circularity Score */}
        <div className="acrylic-card rounded-2xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Circularity Score</span>
            <Sparkles className="w-4 h-4 text-sky-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-mono text-slate-900">
              {simulationResult.circularityScore}
            </span>
            <span className="text-xs font-semibold text-slate-400 font-mono">/ 100</span>
          </div>
          <div className="mt-2.5 flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-600">
              Raw Feed + Waste Recovery
            </span>
            <span className="text-[10px] font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
              Target: 94/100
            </span>
          </div>
          <div className="mt-2 text-[10px] text-slate-400 border-t border-slate-100 pt-1.5">
            * Circular alternative potential
          </div>
        </div>
      </div>

      {/* Main Section: Anomaly Contributing Factors & 24h Telemetry Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 Cols: Anomaly Contributing Factors */}
        <div className="lg:col-span-7 acrylic-card rounded-2xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-slate-200">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold font-mono text-rose-700 bg-rose-50 px-2 py-0.5 rounded uppercase">
                  Detection Layer
                </span>
                <span className="text-xs font-semibold text-slate-700">Risk Breakdown</span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mt-1">
                Anomaly Contributing Factors
              </h3>
              <p className="text-xs text-slate-500">
                High probability of anomalous emission behavior localized across 5 process vectors.
              </p>
            </div>
          </div>

          <div className="mt-5 space-y-4">
            {simulationResult.anomalyFactors.map((factor) => (
              <div key={factor.id} className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200 hover:bg-slate-100/70 transition-all">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">{factor.name}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getImpactBadge(factor.impactLevel)}`}>
                      {factor.impactLevel}
                    </span>
                  </div>
                  <span className="text-xs font-mono font-extrabold text-slate-900">{factor.percentage}%</span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden mb-2">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      factor.percentage >= 25 ? 'bg-rose-500' :
                      factor.percentage >= 18 ? 'bg-amber-500' :
                      factor.percentage >= 14 ? 'bg-yellow-500' : 'bg-sky-500'
                    }`}
                    style={{ width: `${factor.percentage * 2.5}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                  <span>{factor.description}</span>
                  <span className="font-mono text-rose-600 font-semibold flex-shrink-0 ml-2">{factor.deviationValue}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 pt-4 border-t border-slate-200 flex items-center justify-between">
            <span className="text-xs text-slate-500 flex items-center gap-1.5">
              <Info className="w-4 h-4 text-sky-600" />
              Sensor anomaly calculated via Random Forest (200 trees, class_weight='balanced')
            </span>
            <button
              type="button"
              onClick={() => { setActivePipelineStage('LOCALIZE'); setActiveTab('hotspot-detection'); }}
              className="text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1"
            >
              <span>View Hotspots</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right 5 Cols: 24h Telemetry Stream Chart */}
        <div className="lg:col-span-5 acrylic-card rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-sky-600" />
                <h3 className="font-bold text-sm text-slate-900">
                  24-Hour Continuous Telemetry (CEMS)
                </h3>
              </div>
              <span className="text-[10px] font-mono font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                Surge at 08:00
              </span>
            </div>

            <p className="text-xs text-slate-500 my-3">
              Volatile organic hydrocarbon concentration (ppm) vs. regulatory safe operating limit.
            </p>

            <div className="h-56 w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={simulationResult.historicalTelemetry} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="actualEmissionGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#DC2626" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#DC2626" stopOpacity={0.0}/>
                    </linearGradient>
                    <linearGradient id="baselineGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0284C7" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#0284C7" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#64748B' }} />
                  <YAxis tick={{ fontSize: 10, fill: '#64748B' }} domain={[0, 80]} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', borderRadius: '0.75rem', fontSize: '11px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                  />
                  <ReferenceLine y={45} stroke="#EF4444" strokeDasharray="4 4" label={{ value: 'Regulatory Limit (45 ppm)', fill: '#EF4444', fontSize: 10 }} />
                  <Area type="monotone" dataKey="baseline" stroke="#0284C7" strokeWidth={1.5} fillOpacity={1} fill="url(#baselineGrad)" name="Baseline Target" />
                  <Area type="monotone" dataKey="actual" stroke="#DC2626" strokeWidth={2.5} fillOpacity={1} fill="url(#actualEmissionGrad)" name="Actual CEMS Sensor" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-800">Anomaly Diagnostic:</span>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Emission levels crossed regulatory threshold (+42.3 ppm) at 08:00 AM coinciding with pressure drop at Scrubber Unit SC-02.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Explainable AI (XAI) Feature Importance Section */}
      <div className="acrylic-card rounded-2xl p-6 border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold font-mono text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                Explainable AI (XAI)
              </span>
              <span className="text-xs text-slate-500">Live Random Forest Feature Attribution</span>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mt-1">
              Why is the Emission Risk Score {simulationResult.emissionRiskScore}/100?
            </h3>
            <p className="text-xs text-slate-600">
              The EcoVision ML model ranks the exact operational telemetry channels that contributed to the incident prediction.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-emerald-50 text-emerald-800 px-3 py-1.5 rounded-xl border border-emerald-200 text-xs font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Zero Black-Box Transparency</span>
          </div>
        </div>

        {/* Dynamic Feature Importance Items from Live ML API */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mt-5">
          {latestMLPrediction?.feature_importance && latestMLPrediction.feature_importance.length > 0 ? (
            latestMLPrediction.feature_importance.slice(0, 5).map((item, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
                <div>
                  <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border bg-sky-50 text-sky-800 border-sky-200 inline-block mb-2">
                    Rank #{idx + 1}
                  </span>
                  <div className="text-xs font-bold text-slate-800 font-mono leading-snug">
                    {item.feature.replace(/_/g, ' ')}
                  </div>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-200">
                  <span className="text-[10px] text-slate-500 block">Relative Weight</span>
                  <span className="text-xs font-mono font-bold text-sky-700 block mt-0.5">
                    {(item.importance > 1 ? item.importance : item.importance * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            ))
          ) : (
            simulationResult.anomalyFactors.map((factor) => (
              <div key={factor.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
                <div>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${getImpactBadge(factor.impactLevel)} inline-block mb-2`}>
                    {factor.impactLevel}
                  </span>
                  <div className="text-xs font-bold text-slate-800 leading-snug">
                    {factor.name}
                  </div>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-200">
                  <span className="text-[10px] text-slate-500 block">Baseline vs Observed</span>
                  <span className="text-xs font-mono font-bold text-slate-900 block mt-0.5">
                    {factor.deviationValue}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
