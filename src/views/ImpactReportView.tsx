import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  FileText, 
  Download, 
  Printer, 
  TrendingDown, 
  DollarSign, 
  Sparkles, 
  Zap, 
  Trash2, 
  CheckCircle2, 
  Building2, 
  Clock, 
  ShieldCheck 
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts';

export const ImpactReportView: React.FC = () => {
  const { simulationResult, factoryProfile } = useApp();

  const handlePrint = () => {
    window.print();
  };

  const trajectoryData = [
    { month: 'Month 0', 'Current Baseline': 1240, 'Target Scenario B': 1240 },
    { month: 'Month 3', 'Current Baseline': 1250, 'Target Scenario B': 1080 },
    { month: 'Month 6', 'Current Baseline': 1260, 'Target Scenario B': 940 },
    { month: 'Month 9', 'Current Baseline': 1245, 'Target Scenario B': 830 },
    { month: 'Month 12', 'Current Baseline': 1270, 'Target Scenario B': 760 }
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Top Action Bar */}
      <div className="acrylic-card rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold font-mono text-sky-700 bg-sky-100 px-2.5 py-1 rounded-full uppercase tracking-wider">
              Executive Brief
            </span>
            <span className="text-xs text-slate-500 font-medium">| Decarbonization Impact Assessment</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-2">
            Decarbonization Impact Report
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Official synthesized decision brief for executive sustainability committees and plant leadership.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handlePrint}
            className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-2"
          >
            <Printer className="w-4 h-4" />
            <span>Print Executive PDF</span>
          </button>
        </div>
      </div>

      {/* Main Printable Document Card */}
      <div className="acrylic-card rounded-2xl p-8 border border-slate-200 shadow-elevated bg-white space-y-8">
        {/* Report Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200 gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-black tracking-tight text-slate-900 font-mono">ECOLEAK AI</span>
              <span className="text-xs font-bold bg-sky-100 text-sky-800 px-2 py-0.5 rounded">
                SIMULATION REPORT
              </span>
            </div>
            <h1 className="text-xl font-extrabold text-slate-900 mt-1">
              Industrial Decarbonization & Circularity Audit
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Plant ID: <strong className="text-slate-800">{factoryProfile.id}</strong> • {factoryProfile.name} • {factoryProfile.location}
            </p>
          </div>

          <div className="text-right text-xs text-slate-500 space-y-0.5">
            <div>Generated: <strong className="text-slate-800">{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</strong></div>
            <div>Model Engine: <span className="font-mono font-bold text-sky-700">EcoLeak-XGBoost-v2.6</span></div>
            <div className="text-[10px] text-slate-400">* Prototype / Illustrative Simulation Data</div>
          </div>
        </div>

        {/* 6 Key Impact Metrics */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
            Primary Decarbonization Metrics (Estimated Simulation Targets):
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {/* 1 */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <div className="text-[10px] text-slate-500 font-semibold uppercase">Daily Baseline CO₂e</div>
              <div className="text-lg font-mono font-extrabold text-slate-900 mt-1">
                {simulationResult.dailyBaselineCO2eKg.toLocaleString()} <span className="text-xs text-slate-400">kg/d</span>
              </div>
            </div>

            {/* 2 */}
            <div className="p-3.5 rounded-xl bg-emerald-50/80 border border-emerald-200">
              <div className="text-[10px] text-emerald-800 font-semibold uppercase">Potential CO₂ Red.</div>
              <div className="text-lg font-mono font-extrabold text-emerald-700 mt-1">
                ↓ {simulationResult.potentialReductionPercentage}%
              </div>
            </div>

            {/* 3 */}
            <div className="p-3.5 rounded-xl bg-cyan-50/80 border border-cyan-200">
              <div className="text-[10px] text-cyan-800 font-semibold uppercase">Waste Reduction</div>
              <div className="text-lg font-mono font-extrabold text-cyan-700 mt-1">
                ↓ 40.0%
              </div>
            </div>

            {/* 4 */}
            <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200">
              <div className="text-[10px] text-amber-800 font-semibold uppercase">Energy Efficiency</div>
              <div className="text-lg font-mono font-extrabold text-amber-700 mt-1">
                ↑ {simulationResult.energyEfficiencyScore}%
              </div>
            </div>

            {/* 5 */}
            <div className="p-3.5 rounded-xl bg-sky-50/80 border border-sky-200">
              <div className="text-[10px] text-sky-800 font-semibold uppercase">Est. Annual Savings</div>
              <div className="text-lg font-mono font-extrabold text-sky-700 mt-1">
                ${(simulationResult.potentialCO2eSavedKgDay * 365 * 0.095).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
              </div>
            </div>

            {/* 6 */}
            <div className="p-3.5 rounded-xl bg-indigo-50/80 border border-indigo-200">
              <div className="text-[10px] text-indigo-800 font-semibold uppercase">Circularity Score</div>
              <div className="text-lg font-mono font-extrabold text-indigo-700 mt-1">
                {simulationResult.circularityScore} <span className="text-xs text-indigo-400">/100</span>
              </div>
            </div>
          </div>
        </div>

        {/* Current Process vs Recommended Scenario Table */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
            Comparative Analysis: Current Operating Process vs Recommended Scenario
          </h3>
          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase text-[10px] tracking-wider">
                  <th className="p-3">Decarbonization Dimension</th>
                  <th className="p-3">Current Facility Baseline</th>
                  <th className="p-3">Target Scenario (Alternative B)</th>
                  <th className="p-3">Net Projected Benefit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                <tr>
                  <td className="p-3 font-semibold text-slate-900">Direct Stack & Fugitive Emissions</td>
                  <td className="p-3 font-mono">{simulationResult.dailyBaselineCO2eKg.toLocaleString()} kg CO₂e/day</td>
                  <td className="p-3 font-mono font-bold text-emerald-700">760 kg CO₂e/day</td>
                  <td className="p-3 font-bold text-emerald-700">-38.7% (-480 kg/d)</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-slate-900">Emission Hotspot Risk Index</td>
                  <td className="p-3 font-mono text-rose-600 font-bold">87 / 100 (Critical)</td>
                  <td className="p-3 font-mono text-sky-700 font-bold">41 / 100 (Normal)</td>
                  <td className="p-3 font-bold text-sky-700">-46 Risk Points</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-slate-900">Virgin vs Recycled Feedstock Ratio</td>
                  <td className="p-3 font-mono">{factoryProfile.virginMaterialPercentage}% Virgin / {factoryProfile.recycledMaterialPercentage}% Recycled</td>
                  <td className="p-3 font-mono font-bold text-cyan-700">40% Virgin / 60% Recycled</td>
                  <td className="p-3 font-bold text-cyan-700">+42% Circular Feedstock</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-slate-900">Waste Recovery & Effluent Neutralization</td>
                  <td className="p-3 font-mono">{factoryProfile.reusePossibilityPercentage}% Recovery ({factoryProfile.disposalMethod})</td>
                  <td className="p-3 font-mono font-bold text-indigo-700">85% Closed-Loop Diversion</td>
                  <td className="p-3 font-bold text-indigo-700">+45% Diverted from Landfill</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-slate-900">Clean Energy Mix Contribution</td>
                  <td className="p-3 font-mono">{factoryProfile.renewablePercentage}% Grid / Renewable</td>
                  <td className="p-3 font-mono font-bold text-emerald-700">65% Solar PPA + Biomass</td>
                  <td className="p-3 font-bold text-emerald-700">+41% Renewable Energy</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* 12-Month Decarbonization Trajectory Chart */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
            12-Month Projected Emission Reduction Trajectory (kg CO₂e/day):
          </h3>
          <div className="h-60 w-full border border-slate-200 rounded-xl p-4 bg-slate-50/50">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trajectoryData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#64748B' }} />
                <YAxis tick={{ fontSize: 10, fill: '#64748B' }} domain={[600, 1400]} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', borderRadius: '0.75rem', fontSize: '11px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Line type="monotone" dataKey="Current Baseline" stroke="#94A3B8" strokeWidth={2} strokeDasharray="4 4" />
                <Line type="monotone" dataKey="Target Scenario B" stroke="#059669" strokeWidth={2.5} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Audit Sign-off Block */}
        <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-500 gap-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span>
              Validated by EcoLeak AI Multi-Variate Industrial Optimization Engine (HackOut’26 Edition).
            </span>
          </div>
          <div className="font-mono text-slate-400">
            Signature Token: #AGY-EC-2026-9941
          </div>
        </div>
      </div>
    </div>
  );
};
