import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { checkBackendHealth, BackendHealth } from '../../services/api';
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
    sidebarOpen,
    toggleSidebar, 
    simulationResult,
    activeTab,
    setActiveTab
  } = useApp();

  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [backendHealth, setBackendHealth] = useState<BackendHealth | null>(null);

  useEffect(() => {
    let isMounted = true;
    const updateHealth = async () => {
      const h = await checkBackendHealth();
      if (isMounted) setBackendHealth(h);
    };
    updateHealth();
    const timer = setInterval(updateHealth, 15000);
    return () => {
      isMounted = false;
      clearInterval(timer);
    };
  }, []);

  return (
    <header className="sticky top-0 z-30 bg-white/70 backdrop-blur-xl border-b border-white/80 px-4 sm:px-6 py-3 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        {/* Left: 3-Lines Navbar Icon, Logo & Web Name, Context Breadcrumb */}
        <div className="flex items-center gap-3 min-w-0">
          {/* 3-Lines Hamburger Navbar Icon Button */}
          <button
            type="button"
            onClick={toggleSidebar}
            className="p-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800 border border-slate-700/80 shadow-sm transition-all active:scale-95 flex-shrink-0 cursor-pointer"
            title="Toggle Navigation Menu"
          >
            <Menu className="w-5 h-5 text-emerald-400" />
          </button>

          {/* Web Name & Logo */}
          <div className="flex items-center gap-2.5 flex-shrink-0 cursor-pointer" onClick={() => setActiveTab('overview')}>
            <img 
              src="/ecovision_logo.png" 
              alt="EcoVision" 
              className="w-8 h-8 rounded-xl object-contain shadow-sm border border-emerald-500/30 bg-white p-0.5" 
            />
            <div className="flex flex-col justify-center">
              <div className="flex items-center gap-0.5 leading-none">
                <span className="font-extrabold text-base tracking-tight text-slate-900">Eco</span>
                <span className="font-extrabold text-base tracking-tight text-emerald-600">Vision</span>
              </div>
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest leading-tight hidden sm:block">
                Industrial Intelligence
              </p>
            </div>
          </div>

          {/* Facility Context Breadcrumb */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/80 backdrop-blur-md border border-white/90 shadow-sm text-xs max-w-xs truncate">
            <Building2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
            <span className="font-bold text-slate-900 truncate">{factoryProfile.name}</span>
            <span className="text-slate-300">/</span>
            <span className="text-slate-500 font-medium truncate">{factoryProfile.location}</span>
          </div>
        </div>

        {/* Right: Telemetry status, AI Trigger, Notification bell, Export */}
        <div className="flex items-center gap-2 sm:gap-2.5 flex-shrink-0">
          {/* Live Telemetry & Backend Status Badge */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/80 backdrop-blur-md border border-white/90 shadow-sm text-xs text-slate-700 whitespace-nowrap">
            <span className={`w-2 h-2 rounded-full ${backendHealth?.status === 'ok' ? 'bg-emerald-500 animate-pulse' : 'bg-emerald-500'}`} />
            <span className="font-semibold">
              {backendHealth?.status === 'ok' ? 'API Online' : 'Sensors: 18 Online'}
            </span>
            <span className="text-slate-300">|</span>
            <span className={`font-mono font-bold ${backendHealth?.ml_model === 'loaded' ? 'text-emerald-700' : 'text-rose-600'}`}>
              {backendHealth?.ml_model === 'loaded' ? 'ML: RF-95.2%' : '1 Anomaly'}
            </span>
          </div>

          {/* Quick AI Trigger */}
          <button
            type="button"
            onClick={() => triggerAIAnalysis()}
            disabled={isAnalyzing}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-emerald-600 via-teal-600 to-sky-600 hover:from-emerald-700 hover:to-sky-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all active:scale-95 disabled:opacity-50"
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
              className="relative p-2 rounded-full bg-white/70 backdrop-blur-md border border-white/80 text-slate-600 hover:text-slate-900 shadow-sm transition-all"
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
