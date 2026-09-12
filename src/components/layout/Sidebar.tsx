import React from 'react';
import { useApp } from '../../context/AppContext';
import { NavigationTab, PipelineStage } from '../../types';
import { 
  LayoutDashboard, 
  Factory, 
  Activity, 
  Crosshair, 
  Sparkles, 
  Sliders, 
  Binary, 
  FileText, 
  CheckSquare, 
  LogOut, 
  Building2,
  Cpu,
  ChevronDown,
  Menu,
  X,
  Calculator
} from 'lucide-react';

interface NavItem {
  id: NavigationTab;
  stage: PipelineStage;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'overview', stage: 'DETECT', label: 'Executive Overview', icon: LayoutDashboard },
  { id: 'factory-profile', stage: 'INPUT', label: 'Factory Data Ingestion', icon: Factory },
  { id: 'emission-intelligence', stage: 'DETECT', label: 'Emission Intelligence', icon: Activity },
  { id: 'hotspot-detection', stage: 'LOCALIZE', label: 'Digital Twin Hotspots', icon: Crosshair },
  { id: 'ai-recommendations', stage: 'RECOMMEND', label: 'Circular Alternatives', icon: Sparkles },
  { id: 'cost-savings', stage: 'SIMULATE', label: 'Cost & Savings', icon: Calculator },
  { id: 'optimizer', stage: 'RECOMMEND', label: 'Multi-Criteria Optimizer', icon: Sliders },
  { id: 'what-if', stage: 'SIMULATE', label: 'What-If Simulator', icon: Binary },
  { id: 'impact-report', stage: 'ACT', label: 'Decarbonization Report', icon: FileText },
  { id: 'action-center', stage: 'ACT', label: 'Action Center', icon: CheckSquare },
];

export const Sidebar: React.FC = () => {
  const { 
    activeTab, 
    setActiveTab, 
    setActivePipelineStage, 
    currentUser, 
    logout, 
    activePresetId, 
    loadPreset,
    sidebarOpen,
    setSidebarOpen
  } = useApp();

  const handleNav = (item: NavItem) => {
    setActiveTab(item.id);
    setActivePipelineStage(item.stage);
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  };

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={`
        fixed top-0 bottom-0 left-0 z-40
        w-64 bg-white/65 backdrop-blur-2xl border-r border-white/70 shadow-2xl
        flex flex-col justify-between transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Brand Header */}
        <div>
          <div className="h-16 px-5 flex items-center justify-between border-b border-white/50 bg-white/40 backdrop-blur-md">
            <div className="flex items-center gap-2.5">
              <img 
                src="/ecovision_logo.png" 
                alt="EcoVision" 
                className="w-9 h-9 rounded-xl object-contain shadow-sm border border-emerald-500/30 bg-white p-0.5" 
              />
              <div>
                <div className="flex items-center gap-0.5">
                  <span className="font-extrabold text-base tracking-tight text-slate-900">Eco</span>
                  <span className="font-extrabold text-base tracking-tight text-emerald-600">Vision</span>
                </div>
                <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">
                  Industrial Intelligence
                </p>
              </div>
            </div>
            <button
              type="button"
              className="lg:hidden p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-white/60"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Plant Selector Dropdown */}
          <div className="px-4 py-3 border-b border-white/40 bg-white/30 backdrop-blur-sm">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
              Active Industrial Facility
            </label>
            <div className="relative">
              <select
                value={activePresetId}
                onChange={(e) => loadPreset(e.target.value)}
                className="w-full text-xs font-semibold bg-white/80 backdrop-blur-md border border-white/90 rounded-xl px-3 py-2 pr-7 text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 appearance-none cursor-pointer truncate shadow-sm"
              >
                <option value="DEMO001">GreenTech Chemicals (DEMO001)</option>
                <option value="DEMO002">FutureChem Industries (DEMO002)</option>
                <option value="DEMO003">Apex Low-Carbon Cement (DEMO003)</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-3 pointer-events-none" />
            </div>
          </div>

          {/* Clean Navigation Links */}
          <nav className="p-3 space-y-1.5 overflow-y-auto max-h-[calc(100vh-14.5rem)]">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNav(item)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs transition-all ${
                    isActive
                      ? 'bg-slate-900 text-white font-bold shadow-lg shadow-slate-900/25 scale-[1.02]'
                      : 'text-slate-700 hover:text-slate-950 hover:bg-white/60 font-medium'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-emerald-400' : 'text-slate-500'}`} />
                    <span className="truncate">{item.label}</span>
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        {/* User Footer & Logout */}
        <div className="p-3 border-t border-white/50 bg-white/40 backdrop-blur-md">
          <div className="p-2.5 rounded-2xl bg-white/70 backdrop-blur-md border border-white/80 mb-2 flex items-center gap-3 shadow-sm">
            <div className="w-8 h-8 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-800 font-bold text-xs shadow-sm">
              {currentUser?.name?.charAt(0) || 'E'}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-slate-900 truncate">
                {currentUser?.name || 'Chief Sustainability Officer'}
              </div>
              <div className="text-[10px] text-slate-500 truncate">
                {currentUser?.role || 'Plant Technical Director'}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50/80 border border-transparent hover:border-rose-200 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out Workspace</span>
          </button>
        </div>
      </aside>
    </>
  );
};
