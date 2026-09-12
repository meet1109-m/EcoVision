import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { ActionPlanItem } from '../types';
import { getPredictionHistory } from '../services/api';
import { 
  CheckSquare, 
  AlertOctagon, 
  AlertTriangle, 
  Clock, 
  UserCheck, 
  TrendingUp, 
  Wrench, 
  CheckCircle2, 
  Sparkles,
  ShieldCheck,
  Calendar,
  History,
  RefreshCw,
  Database,
  Cpu,
  Layers
} from 'lucide-react';

export const ActionCenterView: React.FC = () => {
  const { simulationResult, updateActionStatus, runLiveMLPrediction, isMLPredicting } = useApp();

  // Tab State: 'action-plan' vs 'prediction-history'
  const [activeSubTab, setActiveSubTab] = useState<'action-plan' | 'prediction-history'>('action-plan');

  // Prediction History API State
  const [historyRecords, setHistoryRecords] = useState<any[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState<boolean>(false);
  const [hasFetchedHistory, setHasFetchedHistory] = useState<boolean>(false);

  const fetchHistory = async () => {
    setIsLoadingHistory(true);
    try {
      const records = await getPredictionHistory(25);
      setHistoryRecords(records || []);
    } catch {
      setHistoryRecords([]);
    } finally {
      setIsLoadingHistory(false);
      setHasFetchedHistory(true);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleTriggerInferenceAndRefresh = async () => {
    await runLiveMLPrediction();
    await fetchHistory();
  };

  const getPriorityStyle = (priority: ActionPlanItem['priority']) => {
    switch (priority) {
      case 'CRITICAL':
        return {
          badge: 'bg-rose-100 text-rose-800 border-rose-300',
          border: 'border-l-4 border-l-rose-500',
          dot: 'bg-rose-500'
        };
      case 'HIGH':
        return {
          badge: 'bg-amber-100 text-amber-800 border-amber-300',
          border: 'border-l-4 border-l-amber-500',
          dot: 'bg-amber-500'
        };
      case 'MEDIUM':
        return {
          badge: 'bg-sky-100 text-sky-800 border-sky-300',
          border: 'border-l-4 border-l-sky-500',
          dot: 'bg-sky-500'
        };
      case 'LOW':
      default:
        return {
          badge: 'bg-slate-100 text-slate-700 border-slate-300',
          border: 'border-l-4 border-l-slate-400',
          dot: 'bg-slate-400'
        };
    }
  };

  const getStatusBadge = (status: ActionPlanItem['status']) => {
    switch (status) {
      case 'Completed':
      case 'Verified':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'In Progress':
        return 'bg-sky-100 text-sky-800 border-sky-300';
      case 'Pending':
      default:
        return 'bg-slate-100 text-slate-700 border-slate-300';
    }
  };

  const getRiskClassBadge = (riskClass: string) => {
    const norm = (riskClass || '').toLowerCase();
    if (norm.includes('critical')) return 'bg-rose-100 text-rose-800 border-rose-300';
    if (norm.includes('high') || norm.includes('suspected')) return 'bg-amber-100 text-amber-800 border-amber-300';
    if (norm.includes('warning') || norm.includes('moderate')) return 'bg-sky-100 text-sky-800 border-sky-300';
    return 'bg-emerald-100 text-emerald-800 border-emerald-300';
  };

  const completedCount = simulationResult.actionPlan.filter(a => a.status === 'Completed' || a.status === 'Verified').length;
  const inProgressCount = simulationResult.actionPlan.filter(a => a.status === 'In Progress').length;
  const pendingCount = simulationResult.actionPlan.filter(a => a.status === 'Pending').length;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="acrylic-card rounded-2xl p-6 border border-slate-200 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold font-mono text-indigo-700 bg-indigo-100 px-2.5 py-1 rounded-full uppercase tracking-wider">
                Stage 07 • Action Execution
              </span>
              <span className="text-xs text-slate-500 font-medium">| Industrial Taskboard & Model Audit Audit Logs</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-2">
              Plant Action Center & ML Audit Logs
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-3xl leading-relaxed">
              Manage prioritized decarbonization tasks and review historical machine learning inference records stored in PostgreSQL/SQLite database.
            </p>
          </div>

          {/* Sub-Tab Navigation Toggle */}
          <div className="flex items-center p-1 bg-slate-100/90 rounded-2xl border border-slate-200 self-start md:self-auto">
            <button
              type="button"
              onClick={() => setActiveSubTab('action-plan')}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 ${
                activeSubTab === 'action-plan'
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CheckSquare className="w-4 h-4 text-emerald-600" />
              <span>Intervention Plan</span>
            </button>

            <button
              type="button"
              onClick={() => { setActiveSubTab('prediction-history'); fetchHistory(); }}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 ${
                activeSubTab === 'prediction-history'
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <History className="w-4 h-4 text-sky-600" />
              <span>Prediction Audit Logs</span>
              {historyRecords.length > 0 && (
                <span className="bg-sky-100 text-sky-800 text-[10px] px-1.5 py-0.5 rounded-full font-mono">
                  {historyRecords.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: INTERVENTION ACTION PLAN                                           */}
      {/* ========================================================================= */}
      {activeSubTab === 'action-plan' && (
        <div className="space-y-6">
          {/* Task Status Overview KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="acrylic-card rounded-2xl p-4 border border-slate-200">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Total Action Items</div>
              <div className="text-2xl font-mono font-extrabold text-slate-900 mt-1">
                {simulationResult.actionPlan.length} Tasks
              </div>
            </div>
            <div className="acrylic-card rounded-2xl p-4 border border-rose-200 bg-rose-50/40">
              <div className="text-[10px] font-bold uppercase tracking-wider text-rose-700">Critical / Pending</div>
              <div className="text-2xl font-mono font-extrabold text-rose-700 mt-1">
                {pendingCount} Pending
              </div>
            </div>
            <div className="acrylic-card rounded-2xl p-4 border border-sky-200 bg-sky-50/40">
              <div className="text-[10px] font-bold uppercase tracking-wider text-sky-700">In Active Execution</div>
              <div className="text-2xl font-mono font-extrabold text-sky-700 mt-1">
                {inProgressCount} In Progress
              </div>
            </div>
            <div className="acrylic-card rounded-2xl p-4 border border-emerald-200 bg-emerald-50/40">
              <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">Verified Completed</div>
              <div className="text-2xl font-mono font-extrabold text-emerald-700 mt-1">
                {completedCount} Verified
              </div>
            </div>
          </div>

          {/* Prioritized Task List */}
          <div className="space-y-4">
            {simulationResult.actionPlan.map((action) => {
              const pStyle = getPriorityStyle(action.priority);

              return (
                <div
                  key={action.id}
                  className={`acrylic-card rounded-2xl p-6 border border-slate-200 shadow-sm ${pStyle.border} transition-all`}
                >
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    {/* Left: Task info */}
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${pStyle.badge}`}>
                          {action.priority} PRIORITY
                        </span>
                        <span className="text-xs font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                          Target: {action.targetUnit}
                        </span>
                        <span className="text-xs text-slate-500 font-mono flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" /> Due: {action.dueDate}
                        </span>
                      </div>

                      <h3 className="font-extrabold text-base text-slate-900">
                        {action.title}
                      </h3>

                      <p className="text-xs text-slate-600 leading-relaxed">
                        {action.description}
                      </p>

                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-700 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                        <span><strong>Expected Impact:</strong> {action.expectedImpact}</span>
                      </div>
                    </div>

                    {/* Right: Assigned role, effort, feasibility, status selector */}
                    <div className="w-full md:w-64 space-y-3 flex-shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                          Assigned Responsible Lead:
                        </span>
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800">
                          <UserCheck className="w-4 h-4 text-sky-600 flex-shrink-0" />
                          <span className="truncate">{action.assignedRole}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs text-slate-600 pt-1 border-t border-slate-100">
                        <span>Estimated Effort:</span>
                        <strong className="text-slate-800 font-medium">{action.estimatedEffort}</strong>
                      </div>

                      <div className="flex items-center justify-between text-xs text-slate-600">
                        <span>Feasibility:</span>
                        <strong className="text-indigo-700 font-mono font-bold">{action.feasibilityScore}/100</strong>
                      </div>

                      {/* Status Dropdown */}
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                          Update Task Status:
                        </label>
                        <select
                          value={action.status}
                          onChange={(e) => updateActionStatus(action.id, e.target.value as any)}
                          className={`w-full text-xs font-bold rounded-xl px-3 py-2 border focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer ${getStatusBadge(action.status)}`}
                        >
                          <option value="Pending">⏳ Pending</option>
                          <option value="In Progress">⚡ In Progress</option>
                          <option value="Completed">✅ Completed</option>
                          <option value="Verified">🛡️ Verified</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: PREDICTION AUDIT HISTORY (DATABASE PREDICTIONS TABLE)              */}
      {/* ========================================================================= */}
      {activeSubTab === 'prediction-history' && (
        <div className="space-y-6">
          {/* Controls & Sub-Header */}
          <div className="acrylic-card rounded-2xl p-5 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-slate-900">
                  ML Prediction Database Records
                </h3>
                <p className="text-xs text-slate-500">
                  Live prediction records fetched from backend endpoint <code className="font-mono text-sky-700">/api/v1/predictions/history</code>.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleTriggerInferenceAndRefresh}
                disabled={isMLPredicting}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isMLPredicting ? 'Inferring...' : 'Trigger & Save Live Prediction'}</span>
              </button>

              <button
                type="button"
                onClick={fetchHistory}
                disabled={isLoadingHistory}
                className="p-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors shadow-sm"
                title="Refresh Table"
              >
                <RefreshCw className={`w-4 h-4 ${isLoadingHistory ? 'animate-spin text-sky-600' : ''}`} />
              </button>
            </div>
          </div>

          {/* Loading State */}
          {isLoadingHistory && (
            <div className="acrylic-card rounded-2xl p-12 text-center border border-slate-200 space-y-3">
              <RefreshCw className="w-8 h-8 text-sky-600 animate-spin mx-auto" />
              <div className="text-sm font-bold text-slate-800">Fetching Prediction Audit Log...</div>
              <p className="text-xs text-slate-500">Querying database table via FastAPI backend...</p>
            </div>
          )}

          {/* Empty DB / Offline State */}
          {!isLoadingHistory && hasFetchedHistory && historyRecords.length === 0 && (
            <div className="acrylic-card rounded-2xl p-10 text-center border border-slate-200 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center mx-auto">
                <Cpu className="w-6 h-6" />
              </div>
              <div className="max-w-md mx-auto space-y-1">
                <h3 className="font-extrabold text-base text-slate-900">No Database Records Found</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  No prediction records have been persisted to the database yet. Click below to trigger a live Random Forest inference call and save the output.
                </p>
              </div>
              <button
                type="button"
                onClick={handleTriggerInferenceAndRefresh}
                disabled={isMLPredicting}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-cyan-600 hover:from-sky-700 hover:to-cyan-700 text-white text-xs font-bold shadow-md transition-all inline-flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Run Live Inference & Persist to Database</span>
              </button>
            </div>
          )}

          {/* Results Table */}
          {!isLoadingHistory && historyRecords.length > 0 && (
            <div className="acrylic-card rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-100/80 border-b border-slate-200 text-[10px] font-bold uppercase tracking-wider text-slate-600 font-mono">
                      <th className="py-3 px-4">Record ID & Timestamp</th>
                      <th className="py-3 px-4">Facility / Plant ID</th>
                      <th className="py-3 px-4">Equipment ID</th>
                      <th className="py-3 px-4">Predicted Risk Class</th>
                      <th className="py-3 px-4">Risk Score</th>
                      <th className="py-3 px-4">Confidence</th>
                      <th className="py-3 px-4">Leak Location</th>
                      <th className="py-3 px-4">Model Version</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200/60 text-xs">
                    {historyRecords.map((rec) => {
                      const createdDate = rec.created_at
                        ? new Date(rec.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' })
                        : 'Just now';

                      return (
                        <tr key={rec.id} className="hover:bg-white/60 transition-colors">
                          <td className="py-3 px-4 font-mono font-medium text-slate-800">
                            <div className="font-bold text-slate-900">#{rec.id}</div>
                            <div className="text-[10px] text-slate-500">{createdDate}</div>
                          </td>

                          <td className="py-3 px-4 font-semibold text-slate-800">
                            {rec.plant_id || 'PLANT-A'}
                          </td>

                          <td className="py-3 px-4 font-mono font-bold text-slate-700">
                            {rec.equipment_id || 'EQ-001'}
                          </td>

                          <td className="py-3 px-4">
                            <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wide ${getRiskClassBadge(rec.predicted_risk_class)}`}>
                              {rec.predicted_risk_class || rec.predicted_leak_severity || 'NORMAL'}
                            </span>
                          </td>

                          <td className="py-3 px-4 font-mono font-extrabold text-slate-900">
                            {typeof rec.predicted_risk_score === 'number' ? rec.predicted_risk_score.toFixed(1) : '8.0'}/100
                          </td>

                          <td className="py-3 px-4 font-mono font-bold text-emerald-700">
                            {typeof rec.confidence === 'number' ? `${(rec.confidence * 100).toFixed(0)}%` : '95%'}
                          </td>

                          <td className="py-3 px-4 text-slate-600 font-medium">
                            {rec.predicted_leak_location || 'Reactor_sensor'}
                          </td>

                          <td className="py-3 px-4 font-mono text-[10px] text-slate-500">
                            {rec.model_version || 'rf-incident-v1.0'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

