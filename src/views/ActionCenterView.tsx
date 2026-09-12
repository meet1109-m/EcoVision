import React from 'react';
import { useApp } from '../context/AppContext';
import { ActionPlanItem } from '../types';
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
  Calendar
} from 'lucide-react';

export const ActionCenterView: React.FC = () => {
  const { simulationResult, updateActionStatus } = useApp();

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
              <span className="text-xs text-slate-500 font-medium">| Prioritized Decarbonization Taskboard</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-2">
              Plant Action Center & Execution Roadmap
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-3xl leading-relaxed">
              Prioritized mitigation tasks assigned to specific plant engineering leads, ranked by localized leak severity and circular ROI.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="px-3.5 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700">
              {completedCount} of {simulationResult.actionPlan.length} Interventions Executed
            </span>
          </div>
        </div>
      </div>

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
  );
};
