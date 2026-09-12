import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { ProcessFlowMap } from '../components/process/ProcessFlowMap';
import { fetchBackendHotspots } from '../services/api';
import { HotspotNode } from '../types';
import { 
  Crosshair, 
  AlertOctagon, 
  AlertTriangle, 
  ArrowRight, 
  ShieldAlert, 
  Info, 
  CheckCircle2,
  Sparkles,
  Layers,
  RefreshCw,
  Database,
  WifiOff
} from 'lucide-react';

export const DigitalTwinHotspotsView: React.FC = () => {
  const { simulationResult, setActiveTab, setActivePipelineStage } = useApp();

  const [hotspots, setHotspots] = useState<HotspotNode[]>(simulationResult.hotspotNodes);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [usingFallback, setUsingFallback] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;

    async function loadHotspots() {
      setIsLoading(true);
      try {
        const data = await fetchBackendHotspots();
        if (isMounted && data && Array.isArray(data) && data.length > 0) {
          const mapped: HotspotNode[] = data.map((bItem) => {
            const mockMatch = simulationResult.hotspotNodes.find(n => n.id === bItem.id);
            
            let normStatus: HotspotNode['status'] = 'Normal';
            const s = (bItem.status || '').toUpperCase();
            if (s === 'CRITICAL') normStatus = 'Critical';
            else if (s === 'HIGH' || s === 'HIGH RISK') normStatus = 'High Risk';
            else if (s === 'WARNING') normStatus = 'Warning';
            else if (['Critical', 'High Risk', 'Warning', 'Normal'].includes(bItem.status)) {
              normStatus = bItem.status as HotspotNode['status'];
            }

            return {
              id: bItem.id,
              name: bItem.equipment || bItem.name || mockMatch?.name || 'Equipment Node',
              type: bItem.equipment_id || bItem.type || mockMatch?.type || 'Process Unit',
              riskScore: bItem.riskScore ?? bItem.risk_score ?? mockMatch?.riskScore ?? 50,
              status: normStatus,
              probableCause: bItem.probableCause ?? bItem.probable_cause ?? mockMatch?.probableCause ?? 'Telemetry anomaly detected',
              estimatedEmissionKgCO2e: bItem.emission ?? bItem.estimatedEmissionKgCO2e ?? mockMatch?.estimatedEmissionKgCO2e ?? 100,
              recommendedAction: bItem.recommendedAction ?? bItem.recommended_action ?? mockMatch?.recommendedAction ?? 'Inspect unit operating parameters.',
              telemetry: bItem.telemetry || mockMatch?.telemetry || {
                temperature: { value: 185, unit: '°C', status: 'warning' },
                pressure: { value: 14.2, unit: 'bar', status: 'warning' },
                flowRate: { value: 130, unit: 'm³/h', status: 'normal' },
                emissionConcentration: { value: 4800, unit: 'ppm', status: 'critical' },
              },
              connectedTo: bItem.connectedTo || mockMatch?.connectedTo || [],
            };
          });

          setHotspots(mapped);
          setUsingFallback(false);
        } else {
          setHotspots(simulationResult.hotspotNodes);
          setUsingFallback(true);
        }
      } catch (err) {
        console.warn('Failed to fetch backend hotspots, using fallback:', err);
        if (isMounted) {
          setHotspots(simulationResult.hotspotNodes);
          setUsingFallback(true);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadHotspots();

    return () => {
      isMounted = false;
    };
  }, [simulationResult.hotspotNodes]);

  const activeHotspotsCount = hotspots.filter(n => n.riskScore >= 40).length;

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
              
              {/* Data Source Badge */}
              {!isLoading && (
                <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded-full border flex items-center gap-1 ${
                  usingFallback
                    ? 'bg-amber-50 text-amber-700 border-amber-300'
                    : 'bg-emerald-50 text-emerald-700 border-emerald-300'
                }`}>
                  {usingFallback ? (
                    <>
                      <WifiOff className="w-3 h-3 text-amber-600" />
                      <span>Offline Fallback</span>
                    </>
                  ) : (
                    <>
                      <Database className="w-3 h-3 text-emerald-600" />
                      <span>Live Backend (/api/v1/hotspots)</span>
                    </>
                  )}
                </span>
              )}
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

      {/* Loading State Banner */}
      {isLoading ? (
        <div className="acrylic-card rounded-2xl p-12 text-center border border-slate-200 space-y-3">
          <RefreshCw className="w-8 h-8 text-amber-600 animate-spin mx-auto" />
          <div className="text-sm font-bold text-slate-800">Fetching Digital Twin Hotspots...</div>
          <p className="text-xs text-slate-500">Querying backend API endpoint GET /api/v1/hotspots...</p>
        </div>
      ) : (
        <>
          {/* Interactive Process Flow Map Component */}
          <ProcessFlowMap hotspotNodes={hotspots} />

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
                {activeHotspotsCount} Active Anomaly Hotspots
              </span>
            </div>

            <div className="mt-5 space-y-3">
              {hotspots.filter(n => n.riskScore >= 40).map((node, index) => {
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
        </>
      )}
    </div>
  );
};
