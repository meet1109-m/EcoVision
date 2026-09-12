import React from 'react';
import { useApp } from '../context/AppContext';
import { ProcessFlowMap } from '../components/process/ProcessFlowMap';
import { 
  Crosshair, 
  AlertOctagon, 
  AlertTriangle, 
  ArrowRight, 
  ShieldAlert, 
  Info, 
  CheckCircle2,
  Sparkles,
  Layers
} from 'lucide-react';

export const DigitalTwinHotspotsView: React.FC = () => {
  const { simulationResult, setActiveTab, setActivePipelineStage } = useApp();

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Top Banner */}
      <div className="acrylic-card rounded-2xl p-6 border border-slate-200 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold font-mono text-amber-700 bg-amber-100 px-2.5 py-1 rounded-full uppercase tracking-wider">
                Stage 03 • Localize Hotspots
              </span>
              <span className="text-xs text-slate-500 font-medium">| Digital Twin Process Telemetry</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-2">
              Industrial Hotspot Localization & Process Twin
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-3xl leading-relaxed">
              Pinpoint anomalous leak vectors across sequential unit operations to determine the most probable emission sources before deploying circular interventions.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => { setActivePipelineStage('RECOMMEND'); setActiveTab('ai-recommendations'); }}
              className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-2"
            >
              <span>Explore Recommendations</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Process Flow Map Component */}
      <ProcessFlowMap />

      {/* Top Emission Hotspots Prioritization Summary */}
      <div className="acrylic-card rounded-2xl p-6 border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              Top Process Emission Hotspots
            </h3>
            <p className="text-xs text-slate-500">
              Ranked by combined thermal, differential pressure, and CEMS concentration anomaly index.
            </p>
          </div>
          <span className="text-xs font-mono font-semibold text-slate-600 bg-slate-100 px-3 py-1 rounded-lg">
            3 Active Anomaly Hotspots
          </span>
        </div>

        <div className="mt-5 space-y-3">
          {simulationResult.hotspotNodes.filter(n => n.riskScore >= 40).map((node, index) => {
            const isCritical = node.status === 'Critical';
            const isHigh = node.status === 'High Risk';

            return (
              <div 
                key={node.id} 
                className={`p-4 rounded-xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  isCritical 
                    ? 'bg-rose-50/70 border-rose-200' 
                    : isHigh 
                    ? 'bg-amber-50/70 border-amber-200' 
                    : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-mono font-bold text-xs flex-shrink-0 ${
                    isCritical ? 'bg-rose-600 text-white' : isHigh ? 'bg-amber-600 text-white' : 'bg-slate-200 text-slate-700'
                  }`}>
                    0{index + 1}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-slate-900">{node.name}</h4>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        isCritical ? 'bg-rose-100 text-rose-800 border-rose-300' :
                        isHigh ? 'bg-amber-100 text-amber-800 border-amber-300' : 'bg-slate-100 text-slate-700 border-slate-300'
                      }`}>
                        {node.status}
                      </span>
                      {isCritical && (
                        <span className="text-[10px] font-bold bg-rose-600 text-white px-2 py-0.5 rounded uppercase">
                          Probable Source
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 mt-1">
                      <strong className="text-slate-800">Probable Root Cause:</strong> {node.probableCause}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      <strong className="text-slate-700">Recommended Action:</strong> {node.recommendedAction}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 flex-shrink-0 border-t md:border-t-0 pt-3 md:pt-0 border-slate-200">
                  <div className="text-right">
                    <div className="text-[10px] text-slate-500 uppercase font-semibold">Localized Leak Risk</div>
                    <div className={`text-xl font-extrabold font-mono ${
                      isCritical ? 'text-rose-600' : isHigh ? 'text-amber-600' : 'text-slate-800'
                    }`}>
                      {node.riskScore}/100
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-slate-500 uppercase font-semibold">Est. Emission</div>
                    <div className="text-sm font-bold font-mono text-slate-900">
                      {node.estimatedEmissionKgCO2e} kg/d
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-5 p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2.5 text-xs text-slate-500">
          <Info className="w-4 h-4 text-sky-600 flex-shrink-0 mt-0.5" />
          <span>
            <strong>Responsible AI Disclosure:</strong> Hotspot localization relies on multi-sensor Bayesian inference and correlation matrices. 
            All classifications are denoted as <em>"Probable source"</em> rather than <em>"Confirmed leak"</em>, directing field inspection teams to targeted validation points without requiring intrusive hardware tear-downs.
          </span>
        </div>
      </div>
    </div>
  );
};
