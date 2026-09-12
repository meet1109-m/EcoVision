import React from 'react';
import { useApp } from '../../context/AppContext';
import { PipelineStage, NavigationTab } from '../../types';
import { AlertTriangle, ChevronRight, Activity, Cpu } from 'lucide-react';

interface StageConfig {
  id: PipelineStage;
  num: string;
  label: string;
  sublabel: string;
  tabTarget: NavigationTab;
}

const PIPELINE_STAGES: StageConfig[] = [
  { id: 'INPUT', num: '01', label: 'INPUT', sublabel: 'Process & Energy', tabTarget: 'factory-profile' },
  { id: 'DETECT', num: '02', label: 'DETECT', sublabel: 'Risk Anomaly', tabTarget: 'emission-intelligence' },
  { id: 'LOCALIZE', num: '03', label: 'LOCALIZE', sublabel: 'Digital Twin Hotspots', tabTarget: 'hotspot-detection' },
  { id: 'EXPLAIN', num: '04', label: 'EXPLAIN', sublabel: 'Explainable AI Factors', tabTarget: 'emission-intelligence' },
  { id: 'RECOMMEND', num: '05', label: 'RECOMMEND', sublabel: 'Circular Alternatives', tabTarget: 'ai-recommendations' },
  { id: 'SIMULATE', num: '06', label: 'SIMULATE', sublabel: 'What-If Sandbox', tabTarget: 'what-if' },
  { id: 'ACT', num: '07', label: 'ACT', sublabel: 'Prioritized Action Plan', tabTarget: 'action-center' },
];

export const PipelineHeader: React.FC = () => {
  const { activePipelineStage, setActivePipelineStage, setActiveTab, simulationResult } = useApp();

  const handleStageClick = (stage: StageConfig) => {
    setActivePipelineStage(stage.id);
    setActiveTab(stage.tabTarget);
  };

  return (
    <div className="acrylic-card rounded-2xl p-5 mb-6 border border-white/80 shadow-sm">
      {/* Top Title & Badges Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Emission Intelligence
            </h1>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-700 border border-rose-200 animate-pulse">
              <AlertTriangle className="w-3.5 h-3.5" />
              STATUS: ACTION REQUIRED
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-100 text-sky-800 border border-sky-200 font-mono">
              <Cpu className="w-3 h-3" />
              PROTOTYPE • SIMULATION DATA
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            End-to-end industrial decision support workflow: Measure → Detect → Localize → Explain → Recommend → Simulate → Act
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-slate-100/80 px-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-600">
            <Activity className="w-4 h-4 text-sky-600" />
            <span>Overall Emission Risk:</span>
            <span className="font-bold text-rose-600 font-mono text-sm">{simulationResult.emissionRiskScore}/100</span>
          </div>
        </div>
      </div>

      {/* 7-Stage Pipeline Workflow Grid */}
      <div className="mt-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
          {PIPELINE_STAGES.map((stage, idx) => {
            const isActive = activePipelineStage === stage.id;
            const isPassed = PIPELINE_STAGES.findIndex(s => s.id === activePipelineStage) > idx;

            return (
              <button
                key={stage.id}
                type="button"
                onClick={() => handleStageClick(stage)}
                className={`flex flex-col items-start text-left p-3 rounded-xl transition-all relative border ${
                  isActive
                    ? 'bg-sky-50 border-sky-400 text-sky-950 shadow-sm ring-2 ring-sky-400/20'
                    : isPassed
                    ? 'bg-slate-50/80 border-slate-200 text-slate-700 hover:bg-slate-100'
                    : 'bg-white/70 border-slate-200/70 text-slate-400 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <span className={`text-[10px] font-mono font-bold tracking-wider px-1.5 py-0.5 rounded ${
                    isActive 
                      ? 'bg-sky-600 text-white' 
                      : isPassed 
                      ? 'bg-emerald-600 text-white' 
                      : 'bg-slate-200 text-slate-600'
                  }`}>
                    {stage.num}
                  </span>
                  {isActive && (
                    <span className="w-2 h-2 rounded-full bg-sky-500 animate-ping" />
                  )}
                </div>
                <span className={`text-xs font-bold tracking-wide truncate max-w-full ${isActive ? 'text-sky-900' : 'text-slate-800'}`}>
                  {stage.label}
                </span>
                <span className="text-[10px] text-slate-500 truncate max-w-full">
                  {stage.sublabel}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
