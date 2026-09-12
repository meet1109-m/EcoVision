import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  Sparkles, 
  TrendingDown, 
  DollarSign, 
  CheckCircle2, 
  ArrowRight, 
  Layers, 
  Sliders, 
  ShieldCheck, 
  Clock, 
  Wrench,
  Award,
  Binary,
  Calculator
} from 'lucide-react';

export const AIRecommendationsView: React.FC = () => {
  const { 
    simulationResult, 
    setActiveTab, 
    setActivePipelineStage,
    selectRecommendationForCalculator 
  } = useApp();

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Top Banner */}
      <div className="acrylic-card rounded-2xl p-6 border border-slate-200 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold font-mono text-sky-700 bg-sky-100 px-2.5 py-1 rounded-full uppercase tracking-wider">
                Stage 05 • Circular Recommendations
              </span>
              <span className="text-xs text-slate-500 font-medium">| Multi-Objective Optimization</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-2">
              AI Circular Alternatives & Abatement Matrix
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-3xl leading-relaxed">
              Synthesized circular economy interventions, feedstock replacements, and energy efficiency upgrades ranked by multi-criteria utility.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => { setActivePipelineStage('SIMULATE'); setActiveTab('what-if'); }}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-emerald-600 hover:from-sky-700 hover:to-emerald-700 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-2"
            >
              <Binary className="w-4 h-4" />
              <span>Simulate What-If Scenario</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3 Circular Alternatives Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {simulationResult.alternatives.map((alt) => {
          const isRec = alt.isRecommended;

          return (
            <div
              key={alt.id}
              className={`acrylic-card rounded-2xl p-6 border flex flex-col justify-between transition-all ${
                isRec
                  ? 'border-sky-400 ring-2 ring-sky-400/30 bg-gradient-to-b from-sky-50/70 via-white to-white shadow-elevated relative'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              {isRec && (
                <div className="absolute -top-3.5 left-6 bg-gradient-to-r from-sky-600 to-emerald-600 text-white text-[11px] font-bold px-3 py-1 rounded-full shadow-md flex items-center gap-1.5 uppercase tracking-wider">
                  <Award className="w-3.5 h-3.5 text-amber-300" />
                  RECOMMENDED INTERVENTION
                </div>
              )}

              <div>
                {/* Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 mb-4 mt-1">
                  <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
                    {alt.code}
                  </span>
                  <div className="flex items-center gap-1 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                    <span className="text-[10px] text-slate-500 font-semibold uppercase">EcoScore</span>
                    <span className="text-xs font-mono font-bold text-sky-700">{alt.computedEcoScore}/100</span>
                  </div>
                </div>

                <h3 className="font-extrabold text-base text-slate-900 leading-snug">
                  {alt.title}
                </h3>

                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  {alt.summary}
                </p>

                {isRec && alt.recommendedReason && (
                  <div className="mt-3 p-2.5 rounded-xl bg-sky-100/60 border border-sky-200 text-[11px] text-sky-900 font-medium leading-relaxed">
                    💡 <strong>Selection Rationale:</strong> {alt.recommendedReason}
                  </div>
                )}

                {/* 4 Multi-Criteria Score Badges */}
                <div className="grid grid-cols-2 gap-2.5 my-4">
                  {/* CO2 Reduction */}
                  <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200">
                    <div className="text-[10px] font-semibold text-emerald-800 uppercase">CO₂ Reduction</div>
                    <div className="text-lg font-mono font-extrabold text-emerald-700">
                      +{alt.emissionReductionPercentage}%
                    </div>
                  </div>

                  {/* Cost Reduction */}
                  <div className="p-2.5 rounded-xl bg-sky-50/70 border border-sky-200">
                    <div className="text-[10px] font-semibold text-sky-800 uppercase">Cost Savings</div>
                    <div className="text-lg font-mono font-extrabold text-sky-700">
                      +{alt.costReductionPercentage}%
                    </div>
                  </div>

                  {/* Circularity */}
                  <div className="p-2.5 rounded-xl bg-cyan-50/70 border border-cyan-200">
                    <div className="text-[10px] font-semibold text-cyan-800 uppercase">Circularity Score</div>
                    <div className="text-lg font-mono font-extrabold text-cyan-700">
                      {alt.circularityScore}/100
                    </div>
                  </div>

                  {/* Feasibility */}
                  <div className="p-2.5 rounded-xl bg-indigo-50/70 border border-indigo-200">
                    <div className="text-[10px] font-semibold text-indigo-800 uppercase">Feasibility</div>
                    <div className="text-lg font-mono font-extrabold text-indigo-700">
                      {alt.feasibilityScore}/100
                    </div>
                  </div>
                </div>

                {/* Key Interventions Checklist */}
                <div className="space-y-1.5 pt-2 border-t border-slate-100">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Key Technical Interventions:
                  </div>
                  {alt.keyInterventions.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-slate-700 leading-snug">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Card Footer: Financial & Technical Metrics */}
              <div className="mt-5 pt-4 border-t border-slate-200 text-xs text-slate-500 space-y-1.5">
                <div className="flex justify-between">
                  <span>Payback Period:</span>
                  <strong className="text-slate-800 font-mono">{alt.paybackPeriodMonths} Months</strong>
                </div>
                <div className="flex justify-between">
                  <span>Est. Annual Benefit:</span>
                  <strong className="text-emerald-700 font-mono">₹{Math.round(alt.annualSavingsUSD * 80).toLocaleString('en-IN')} / yr</strong>
                </div>
                <div className="flex justify-between">
                  <span>Readiness:</span>
                  <span className="text-slate-700 font-medium">{alt.technologyAvailability}</span>
                </div>

                {/* Calculate Cost & Savings Button */}
                <button
                  type="button"
                  onClick={() => selectRecommendationForCalculator(alt)}
                  className="w-full mt-3 py-2 px-3 rounded-xl bg-gradient-to-r from-sky-600 to-emerald-600 hover:from-sky-700 hover:to-emerald-700 text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5 active:scale-[0.98]"
                >
                  <Calculator className="w-3.5 h-3.5" />
                  <span>Calculate Cost & Savings →</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Navigation Box */}
      <div className="acrylic-card rounded-2xl p-5 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Sliders className="w-5 h-5 text-sky-600" />
          <div>
            <h4 className="text-xs font-bold text-slate-900">
              Want to reprioritize optimization weights?
            </h4>
            <p className="text-[11px] text-slate-500">
              Adjust weights for Environment, Cost, Circularity and Feasibility in the Multi-Criteria Optimizer.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => { setActiveTab('optimizer'); }}
          className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors flex items-center gap-1.5 whitespace-nowrap"
        >
          <span>Adjust Criteria Weights</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
