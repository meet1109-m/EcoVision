import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { HotspotNode } from '../../types';
import { 
  AlertOctagon, 
  AlertTriangle, 
  CheckCircle, 
  Info, 
  Activity, 
  Thermometer, 
  Gauge, 
  Wind, 
  Radio, 
  ArrowRight, 
  ShieldAlert,
  HelpCircle,
  X
} from 'lucide-react';

export const ProcessFlowMap: React.FC = () => {
  const { simulationResult } = useApp();
  const [selectedNode, setSelectedNode] = useState<HotspotNode>(
    simulationResult.hotspotNodes.find(n => n.id === 'scrubber') || simulationResult.hotspotNodes[0]
  );

  const getStatusColor = (status: HotspotNode['status']) => {
    switch (status) {
      case 'Critical':
        return {
          badge: 'bg-rose-100 text-rose-800 border-rose-300',
          nodeBorder: 'border-rose-500 ring-4 ring-rose-500/20 bg-rose-50/90',
          dot: 'bg-rose-500 animate-ping',
          text: 'text-rose-700',
          glow: 'shadow-rose-500/20'
        };
      case 'High Risk':
        return {
          badge: 'bg-amber-100 text-amber-800 border-amber-300',
          nodeBorder: 'border-amber-500 ring-2 ring-amber-500/20 bg-amber-50/90',
          dot: 'bg-amber-500',
          text: 'text-amber-700',
          glow: 'shadow-amber-500/20'
        };
      case 'Warning':
        return {
          badge: 'bg-yellow-100 text-yellow-800 border-yellow-300',
          nodeBorder: 'border-yellow-400 bg-yellow-50/70',
          dot: 'bg-yellow-500',
          text: 'text-yellow-700',
          glow: 'shadow-yellow-500/20'
        };
      case 'Normal':
      default:
        return {
          badge: 'bg-emerald-100 text-emerald-800 border-emerald-300',
          nodeBorder: 'border-slate-300 bg-white hover:border-emerald-400',
          dot: 'bg-emerald-500',
          text: 'text-emerald-700',
          glow: 'shadow-slate-200'
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Explainer */}
      <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-sky-100 flex items-center justify-center text-sky-700">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-800">
              Interactive Digital Twin Lite — Process Telemetry Stream
            </h4>
            <p className="text-xs text-slate-500">
              Click any plant unit node to inspect localized anomaly deviations and probable emission sources.
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-4 text-xs font-semibold">
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Normal</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-yellow-400" /> Warning</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> High Risk</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Critical</span>
        </div>
      </div>

      {/* Interactive Process Flow Graph Canvas */}
      <div className="acrylic-card rounded-2xl p-6 border border-slate-200 overflow-x-auto shadow-sm">
        <div className="min-w-[850px] py-4">
          <div className="grid grid-cols-7 gap-3 items-center relative">
            {simulationResult.hotspotNodes.map((node, idx) => {
              const styles = getStatusColor(node.status);
              const isSelected = selectedNode.id === node.id;

              return (
                <div key={node.id} className="relative flex flex-col items-center">
                  <button
                    type="button"
                    onClick={() => setSelectedNode(node)}
                    className={`w-full p-4 rounded-xl border text-left transition-all relative ${styles.nodeBorder} ${
                      isSelected ? 'ring-2 ring-sky-500 shadow-lg scale-105 z-10' : 'hover:shadow-md'
                    }`}
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-mono font-bold text-slate-500">
                        UNIT 0{idx + 1}
                      </span>
                      <span className={`w-2.5 h-2.5 rounded-full ${styles.dot}`} />
                    </div>

                    <div className="font-bold text-xs text-slate-900 line-clamp-2 h-8">
                      {node.name}
                    </div>

                    <div className="text-[10px] text-slate-500 mt-1 truncate">
                      {node.type}
                    </div>

                    {/* Risk Badge */}
                    <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-between">
                      <span className="text-[10px] font-semibold text-slate-500">Risk Score</span>
                      <span className={`text-xs font-mono font-extrabold ${styles.text}`}>
                        {node.riskScore}/100
                      </span>
                    </div>

                    {node.status === 'Critical' && (
                      <div className="mt-2 text-[9px] font-bold uppercase tracking-wider bg-rose-600 text-white px-1.5 py-0.5 rounded text-center">
                        Probable Source
                      </div>
                    )}
                  </button>

                  {/* Flow Arrow */}
                  {idx < simulationResult.hotspotNodes.length - 1 && (
                    <div className="hidden lg:block absolute -right-3.5 top-1/2 -translate-y-1/2 z-20 text-slate-400">
                      <ArrowRight className="w-4 h-4 text-slate-400" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Selected Node Diagnostic Panel */}
      {selectedNode && (
        <div className="acrylic-card rounded-2xl p-6 border border-slate-200 shadow-md">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 pb-4 border-b border-slate-200">
            <div>
              <div className="flex items-center gap-3">
                <h3 className="text-xl font-bold text-slate-900">
                  {selectedNode.name}
                </h3>
                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(selectedNode.status).badge}`}>
                  STATUS: {selectedNode.status.toUpperCase()}
                </span>
                <span className="text-xs font-mono text-slate-500">
                  Type: {selectedNode.type}
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1">
                Estimated localized contribution: <strong className="font-mono text-slate-900">{selectedNode.estimatedEmissionKgCO2e} kg CO₂e/day</strong>
              </p>
            </div>

            <div className="flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-xl border border-slate-200">
              <span className="text-xs text-slate-600">Calculated Risk Index:</span>
              <span className="text-lg font-mono font-extrabold text-rose-600">{selectedNode.riskScore}/100</span>
            </div>
          </div>

          {/* Diagnostic Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            {/* Left: Probable Cause & Recommended Action */}
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-900 mb-1">
                  <ShieldAlert className="w-4 h-4 text-amber-700" />
                  Probable Source Analysis
                </div>
                <p className="text-xs text-amber-800 leading-relaxed">
                  {selectedNode.probableCause}
                </p>
                <div className="mt-2 text-[10px] text-amber-700/80 italic">
                  * Note: Model identifies probable operational anomalies based on sensor correlation; not physical leak confirmation.
                </div>
              </div>

              <div className="p-4 rounded-xl bg-sky-50/70 border border-sky-200">
                <div className="flex items-center gap-2 text-xs font-bold text-sky-900 mb-1">
                  <Activity className="w-4 h-4 text-sky-700" />
                  Recommended Engineering Action
                </div>
                <p className="text-xs text-sky-800 leading-relaxed font-medium">
                  {selectedNode.recommendedAction}
                </p>
              </div>
            </div>

            {/* Right: Live Telemetry Gauges */}
            <div className="bg-slate-50/90 rounded-xl p-4 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Live Unit Telemetry Signals
                </span>
                <span className="text-[10px] font-mono text-slate-500">Sampling rate: 5s</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Temperature */}
                <div className="p-3 bg-white rounded-lg border border-slate-200">
                  <div className="flex items-center justify-between text-slate-500 mb-1">
                    <span className="text-[11px] font-medium flex items-center gap-1">
                      <Thermometer className="w-3.5 h-3.5 text-orange-500" /> Temperature
                    </span>
                    <span className={`w-2 h-2 rounded-full ${selectedNode.telemetry.temperature.status === 'critical' ? 'bg-rose-500' : 'bg-emerald-500'}`} />
                  </div>
                  <div className="text-base font-bold font-mono text-slate-900">
                    {selectedNode.telemetry.temperature.value} {selectedNode.telemetry.temperature.unit}
                  </div>
                </div>

                {/* Pressure */}
                <div className="p-3 bg-white rounded-lg border border-slate-200">
                  <div className="flex items-center justify-between text-slate-500 mb-1">
                    <span className="text-[11px] font-medium flex items-center gap-1">
                      <Gauge className="w-3.5 h-3.5 text-sky-500" /> Pressure
                    </span>
                    <span className={`w-2 h-2 rounded-full ${selectedNode.telemetry.pressure.status === 'critical' ? 'bg-rose-500' : 'bg-emerald-500'}`} />
                  </div>
                  <div className="text-base font-bold font-mono text-slate-900">
                    {selectedNode.telemetry.pressure.value} {selectedNode.telemetry.pressure.unit}
                  </div>
                </div>

                {/* Flow Rate */}
                <div className="p-3 bg-white rounded-lg border border-slate-200">
                  <div className="flex items-center justify-between text-slate-500 mb-1">
                    <span className="text-[11px] font-medium flex items-center gap-1">
                      <Wind className="w-3.5 h-3.5 text-cyan-500" /> Flow Rate
                    </span>
                    <span className={`w-2 h-2 rounded-full ${selectedNode.telemetry.flowRate.status === 'critical' ? 'bg-rose-500' : 'bg-emerald-500'}`} />
                  </div>
                  <div className="text-base font-bold font-mono text-slate-900">
                    {selectedNode.telemetry.flowRate.value} {selectedNode.telemetry.flowRate.unit}
                  </div>
                </div>

                {/* Emission Concentration */}
                <div className="p-3 bg-white rounded-lg border border-slate-200">
                  <div className="flex items-center justify-between text-slate-500 mb-1">
                    <span className="text-[11px] font-medium flex items-center gap-1">
                      <Activity className="w-3.5 h-3.5 text-rose-500" /> Concentration
                    </span>
                    <span className={`w-2 h-2 rounded-full ${selectedNode.telemetry.emissionConcentration.status === 'critical' ? 'bg-rose-500' : 'bg-emerald-500'}`} />
                  </div>
                  <div className="text-base font-bold font-mono text-slate-900">
                    {selectedNode.telemetry.emissionConcentration.value} {selectedNode.telemetry.emissionConcentration.unit}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
