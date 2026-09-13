import React, { useState, useEffect } from 'react';
import { fetchBackendReadings } from '../../services/api';
import { useApp } from '../../context/AppContext';
import { 
  Activity, 
  Clock, 
  Database, 
  WifiOff, 
  RefreshCw, 
  Thermometer, 
  Gauge, 
  Wind, 
  Zap,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

export interface ProcessReadingItem {
  id?: number | string;
  timestamp: string;
  plant_id: string;
  process_unit_id: string;
  equipment_id: string;
  equipment_type: string;
  temperature_c: number;
  pressure_bar: number;
  flow_rate: number;
  co2_ppm: number;
  risk_class?: string;
  risk_score?: number;
  maintenance_status?: string;
}

export const LiveReadingsPanel: React.FC = () => {
  const { simulationResult, factoryProfile } = useApp();

  const [readings, setReadings] = useState<ProcessReadingItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isBackendLive, setIsBackendLive] = useState<boolean>(false);
  const [lastFetchedTime, setLastFetchedTime] = useState<string>('');

  const generateMockReadings = (): ProcessReadingItem[] => {
    const now = new Date();
    return [
      {
        id: 'sim-01',
        timestamp: new Date(now.getTime() - 1000 * 30).toISOString(),
        plant_id: factoryProfile?.id || 'PLANT-A',
        process_unit_id: 'UNIT-01',
        equipment_id: 'EQ-001 (Scrubber)',
        equipment_type: 'Scrubber',
        temperature_c: 195.8,
        pressure_bar: 16.9,
        flow_rate: 112.0,
        co2_ppm: 5250.0,
        risk_class: 'CRITICAL',
        risk_score: 87.0,
        maintenance_status: 'High Deviation'
      },
      {
        id: 'sim-02',
        timestamp: new Date(now.getTime() - 1000 * 90).toISOString(),
        plant_id: factoryProfile?.id || 'PLANT-A',
        process_unit_id: 'UNIT-01',
        equipment_id: 'EQ-002 (Furnace)',
        equipment_type: 'Furnace',
        temperature_c: 210.4,
        pressure_bar: 15.1,
        flow_rate: 125.5,
        co2_ppm: 4920.0,
        risk_class: 'HIGH',
        risk_score: 73.0,
        maintenance_status: 'Warning'
      },
      {
        id: 'sim-03',
        timestamp: new Date(now.getTime() - 1000 * 180).toISOString(),
        plant_id: factoryProfile?.id || 'PLANT-A',
        process_unit_id: 'UNIT-02',
        equipment_id: 'EQ-003 (Distillation Column)',
        equipment_type: 'Distillation Column',
        temperature_c: 178.2,
        pressure_bar: 13.8,
        flow_rate: 140.0,
        co2_ppm: 4100.0,
        risk_class: 'NORMAL',
        risk_score: 15.0,
        maintenance_status: 'Optimal'
      },
      {
        id: 'sim-04',
        timestamp: new Date(now.getTime() - 1000 * 240).toISOString(),
        plant_id: factoryProfile?.id || 'PLANT-A',
        process_unit_id: 'UNIT-02',
        equipment_id: 'EQ-004 (Heat Exchanger)',
        equipment_type: 'Heat Exchanger',
        temperature_c: 182.0,
        pressure_bar: 14.0,
        flow_rate: 135.2,
        co2_ppm: 4350.0,
        risk_class: 'NORMAL',
        risk_score: 22.0,
        maintenance_status: 'Optimal'
      }
    ];
  };

  const loadReadings = async () => {
    setIsLoading(true);
    try {
      const plantId = factoryProfile?.id || 'PLANT-A';
      const res = await fetchBackendReadings(plantId, 8);
      if (res && res.items && Array.isArray(res.items) && res.items.length > 0) {
        setReadings(res.items);
        setIsBackendLive(true);
      } else {
        setReadings(generateMockReadings());
        setIsBackendLive(false);
      }
    } catch (err) {
      console.warn('Failed to fetch backend process readings, using fallback mock telemetry:', err);
      setReadings(generateMockReadings());
      setIsBackendLive(false);
    } finally {
      setIsLoading(false);
      setLastFetchedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }
  };

  useEffect(() => {
    loadReadings();

    // 30-second polling interval
    const intervalId = setInterval(() => {
      loadReadings();
    }, 30000);

    return () => {
      clearInterval(intervalId);
    };
  }, [factoryProfile?.id]);

  const getRiskBadge = (riskClass?: string) => {
    const norm = (riskClass || '').toUpperCase();
    if (norm.includes('CRITICAL')) return 'bg-rose-100 text-rose-800 border-rose-300';
    if (norm.includes('HIGH')) return 'bg-amber-100 text-amber-800 border-amber-300';
    if (norm.includes('WARNING')) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    return 'bg-emerald-100 text-emerald-800 border-emerald-300';
  };

  return (
    <div className="acrylic-card rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-100 text-cyan-700 flex items-center justify-center flex-shrink-0">
            <Activity className="w-5 h-5 animate-pulse text-cyan-600" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-base text-slate-900">
                Live Process Telemetry Stream
              </h3>
              <span className="text-xs font-mono text-slate-500 font-medium">GET /readings</span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Real-time sensor telemetry stream automatically polled every 30 seconds.
            </p>
          </div>
        </div>

        {/* Status Badges & Controls */}
        <div className="flex items-center gap-2.5">
          <span className={`text-[11px] font-bold font-mono px-2.5 py-1 rounded-full border flex items-center gap-1.5 ${
            isBackendLive
              ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
              : 'bg-amber-50 text-amber-700 border-amber-300'
          }`}>
            {isBackendLive ? (
              <>
                <Database className="w-3.5 h-3.5 text-emerald-600" />
                <span>Backend Polling (30s)</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3.5 h-3.5 text-amber-600" />
                <span>Simulated Telemetry Fallback</span>
              </>
            )}
          </span>

          {lastFetchedTime && (
            <span className="text-[10px] font-mono text-slate-400 hidden md:inline">
              Updated: {lastFetchedTime}
            </span>
          )}

          <button
            type="button"
            onClick={loadReadings}
            disabled={isLoading}
            className="p-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors shadow-sm disabled:opacity-50"
            title="Refresh Live Telemetry"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-cyan-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* Telemetry Stream Content */}
      {isLoading && readings.length === 0 ? (
        <div className="p-8 text-center space-y-2">
          <RefreshCw className="w-6 h-6 text-cyan-600 animate-spin mx-auto" />
          <div className="text-xs font-bold text-slate-700">Polling backend telemetry stream...</div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100/80 border-b border-slate-200 text-[10px] font-bold uppercase tracking-wider text-slate-600 font-mono">
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">Equipment / Unit</th>
                <th className="py-2.5 px-3">Temperature (°C)</th>
                <th className="py-2.5 px-3">Pressure (bar)</th>
                <th className="py-2.5 px-3">Flow Rate (m³/h)</th>
                <th className="py-2.5 px-3">CO₂ (ppm)</th>
                <th className="py-2.5 px-3">Risk Assessment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/60 text-xs">
              {readings.map((item, idx) => {
                const tsFormatted = item.timestamp
                  ? new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
                  : 'Just now';

                const isTempHigh = item.temperature_c > 190;
                const isPressHigh = item.pressure_bar > 15;

                return (
                  <tr key={item.id || idx} className="hover:bg-white/60 transition-colors">
                    <td className="py-2.5 px-3 font-mono text-[11px] text-slate-600">
                      {tsFormatted}
                    </td>

                    <td className="py-2.5 px-3 font-semibold text-slate-800">
                      <div className="font-bold text-slate-900">{item.equipment_id}</div>
                      <div className="text-[10px] text-slate-500">{item.process_unit_id} • {item.equipment_type}</div>
                    </td>

                    <td className="py-2.5 px-3 font-mono font-bold">
                      <span className={isTempHigh ? 'text-rose-600 font-extrabold' : 'text-slate-800'}>
                        {typeof item.temperature_c === 'number' ? item.temperature_c.toFixed(1) : item.temperature_c} °C
                      </span>
                    </td>

                    <td className="py-2.5 px-3 font-mono font-bold">
                      <span className={isPressHigh ? 'text-amber-600 font-extrabold' : 'text-slate-800'}>
                        {typeof item.pressure_bar === 'number' ? item.pressure_bar.toFixed(1) : item.pressure_bar} bar
                      </span>
                    </td>

                    <td className="py-2.5 px-3 font-mono text-slate-800">
                      {typeof item.flow_rate === 'number' ? item.flow_rate.toFixed(1) : item.flow_rate} m³/h
                    </td>

                    <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                      {typeof item.co2_ppm === 'number' ? item.co2_ppm.toFixed(0) : item.co2_ppm} ppm
                    </td>

                    <td className="py-2.5 px-3">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${getRiskBadge(item.risk_class)}`}>
                        {item.risk_class || 'NORMAL'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
