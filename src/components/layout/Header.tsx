import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Menu, 
  Bell, 
  Sparkles, 
  Download, 
  CheckCircle2, 
  AlertCircle, 
  Building2, 
  Activity, 
  RefreshCw,
  X
} from 'lucide-react';

export const Header: React.FC = () => {
  const { 
    factoryProfile, 
    triggerAIAnalysis, 
    isAnalyzing, 
    setSidebarCollapsed, 
    simulationResult,
    activeTab,
    setActiveTab
  } = useApp();

  const [notificationsOpen, setNotificationsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200 px-6 py-3.5">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Mobile Toggle & Context Breadcrumb */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setSidebarCollapsed(true)}
            className="lg:hidden p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="hidden sm:flex items-center gap-2 text-xs">
            <Building2 className="w-4 h-4 text-sky-600" />
            <span className="font-semibold text-slate-800">{factoryProfile.name}</span>
            <span className="text-slate-300">/</span>
            <span className="text-slate-500">{factoryProfile.location}</span>
          </div>
        </div>

        {/* Right: Telemetry status, AI Trigger, Notification bell, Export */}
        <div className="flex items-center gap-3">
          {/* Live Telemetry Ping */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs text-slate-600">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="font-medium">Sensors: 18 Online</span>
            <span className="text-slate-300">|</span>
            <span className="font-mono text-rose-600 font-bold">1 Anomaly</span>
          </div>

          {/* Quick AI Trigger */}
          <button
            type="button"
            onClick={() => triggerAIAnalysis()}
            disabled={isAnalyzing}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-sky-600 to-cyan-600 hover:from-sky-700 hover:to-cyan-700 text-white text-xs font-semibold shadow-sm shadow-sky-600/20 transition-all active:scale-95 disabled:opacity-50"
          >
            {isAnalyzing ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            )}
            <span>Re-Run AI Engine</span>
          </button>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="relative p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white"></span>
            </button>

            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 py-3 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="px-4 pb-2 border-b border-slate-100 flex items-center justify-between">
                  <span className="font-semibold text-xs text-slate-900">Industrial Alert Stream</span>
                  <button 
                    onClick={() => setNotificationsOpen(false)}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="p-2 space-y-1.5 max-h-72 overflow-y-auto">
                  <div 
                    onClick={() => { setActiveTab('hotspot-detection'); setNotificationsOpen(false); }}
                    className="p-2.5 rounded-xl bg-rose-50/70 border border-rose-100 cursor-pointer hover:bg-rose-100/70 transition-colors"
                  >
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="text-xs font-bold text-rose-900">Critical Scrubber Bypass Anomaly</div>
                        <p className="text-[11px] text-rose-700 mt-0.5">Differential pressure drop (-1.82 bar) suggests urgent packing inspection required.</p>
                        <span className="text-[9px] text-rose-500 font-mono">12 minutes ago</span>
                      </div>
                    </div>
                  </div>

                  <div 
                    onClick={() => { setActiveTab('action-center'); setNotificationsOpen(false); }}
                    className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-100 cursor-pointer hover:bg-amber-100/70 transition-colors"
                  >
                    <div className="flex items-start gap-2">
                      <Activity className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="text-xs font-bold text-amber-900">Furnace O₂ Gradient Shift</div>
                        <p className="text-[11px] text-amber-700 mt-0.5">Secondary combustion chamber air-to-fuel ratio deviation.</p>
                        <span className="text-[9px] text-amber-500 font-mono">34 minutes ago</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quick Print/Export */}
          <button
            type="button"
            onClick={() => setActiveTab('impact-report')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-200 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Impact Report</span>
          </button>
        </div>
      </div>
    </header>
  );
};
