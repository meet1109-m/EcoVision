import React from 'react';
import { useApp } from '../../context/AppContext';
import { Cpu, CheckCircle2, Loader2, Sparkles, ShieldCheck } from 'lucide-react';

const ANALYSIS_STEPS = [
  'Analyzing process & operational data...',
  'Calculating estimated baseline emissions...',
  'Detecting abnormal sensor & telemetry patterns...',
  'Localizing probable leak & emission hotspots...',
  'Generating circular alternatives & raw material substitutes...',
  'Optimizing multi-criteria recommendation matrix...',
  'Preparing decarbonization decision dashboard...'
];

export const AIProcessingModal: React.FC = () => {
  const { isAnalyzing, analysisStepIndex } = useApp();

  if (!isAnalyzing) return null;

  const progressPercentage = Math.min(100, Math.round(((analysisStepIndex + 1) / ANALYSIS_STEPS.length) * 100));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden transform scale-100 transition-all">
        {/* Header */}
        <div className="bg-gradient-to-r from-sky-600 via-sky-700 to-indigo-700 px-6 py-5 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center backdrop-blur-md">
                <Cpu className="w-5 h-5 text-sky-200 animate-pulse" />
              </div>
              <div>
                <h3 className="font-semibold text-lg tracking-tight flex items-center gap-2">
                  EcoLeak Neural Engine
                  <Sparkles className="w-4 h-4 text-amber-300" />
                </h3>
                <p className="text-xs text-sky-200">Multi-Variate Industrial Anomaly & Decarbonization Pipeline</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold font-mono text-white">{progressPercentage}%</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4 w-full bg-sky-950/40 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-gradient-to-r from-sky-300 to-emerald-300 h-full rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Step List */}
        <div className="p-6 space-y-3.5 bg-slate-50/70">
          {ANALYSIS_STEPS.map((step, idx) => {
            const isCompleted = idx < analysisStepIndex;
            const isCurrent = idx === analysisStepIndex;
            const isPending = idx > analysisStepIndex;

            return (
              <div 
                key={idx}
                className={`flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-sm transition-all ${
                  isCurrent 
                    ? 'bg-white border border-sky-300 shadow-sm text-sky-950 font-medium' 
                    : isCompleted 
                    ? 'bg-emerald-50/70 text-emerald-900 border border-emerald-200/60' 
                    : 'text-slate-400 opacity-60'
                }`}
              >
                <div className="flex-shrink-0">
                  {isCompleted ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  ) : isCurrent ? (
                    <Loader2 className="w-5 h-5 text-sky-600 animate-spin" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border border-slate-300 flex items-center justify-center text-[10px] text-slate-400">
                      {idx + 1}
                    </div>
                  )}
                </div>
                <span className="flex-1">{step}</span>
                {isCurrent && (
                  <span className="text-[11px] font-semibold text-sky-600 uppercase tracking-wider bg-sky-100 px-2 py-0.5 rounded-full">
                    Computing
                  </span>
                )}
                {isCompleted && (
                  <span className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider">
                    Done
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="px-6 py-3.5 bg-white border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            FastAPI / ML Model Orchestration Ready
          </span>
          <span className="font-mono text-slate-400">Step {Math.min(analysisStepIndex + 1, 7)} of 7</span>
        </div>
      </div>
    </div>
  );
};
