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
    setSidebarOpen(false);
  };

  return (
    <>
      {/* Drawer Backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-md z-40 transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={`
        fixed top-0 bottom-0 left-0 z-50
        w-72 bg-slate-900/95 backdrop-blur-2xl border-r border-slate-800/80 shadow-2xl
        flex flex-col justify-between transition-transform duration-300 ease-in-out text-white
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Brand Header */}
        <div>
          <div className="h-16 px-5 flex items-center justify-between border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
            <div className="flex items-center gap-2.5">
              <img 
                src="/ecovision_logo.png" 
                alt="EcoVision" 
                className="w-9 h-9 rounded-xl object-contain shadow-sm border border-emerald-500/40 bg-slate-900 p-0.5" 
              />
              <div>
                <div className="flex items-center gap-0.5">
                  <span className="font-extrabold text-base tracking-tight text-white">Eco</span>
                  <span className="font-extrabold text-base tracking-tight text-emerald-400">Vision</span>
                </div>
                <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest">
                  Industrial Intelligence
                </p>
              </div>
            </div>
            <button
              type="button"
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              onClick={() => setSidebarOpen(false)}
              title="Close Navigation Menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Plant Selector Dropdown */}
          <div className="px-4 py-3 border-b border-slate-800/80 bg-slate-950/50 backdrop-blur-sm">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Active Industrial Facility
            </label>
            <div className="relative">
              <select
                value={activePresetId}
                onChange={(e) => loadPreset(e.target.value)}
                className="w-full text-xs font-semibold bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 pr-7 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 appearance-none cursor-pointer truncate shadow-sm"
              >
                <option value="DEMO001" className="bg-slate-900 text-white">GreenTech Chemicals (DEMO001)</option>
                <option value="DEMO002" className="bg-slate-900 text-white">FutureChem Industries (DEMO002)</option>
                <option value="DEMO003" className="bg-slate-900 text-white">Apex Low-Carbon Cement (DEMO003)</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-3 pointer-events-none" />
            </div>
          </div>

          {/* Clean Navigation Links */}
          <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-14.5rem)]">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNav(item)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs transition-all ${
                    isActive
                      ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40 shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/80 font-medium border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                    <span className="truncate">{item.label}</span>
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        {/* User Footer & Logout */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
          <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 mb-2 flex items-center gap-3 shadow-sm">
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-300 font-bold text-xs shadow-sm">
              {currentUser?.name?.charAt(0) || 'E'}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-white truncate">
                {currentUser?.name || 'Chief Sustainability Officer'}
              </div>
              <div className="text-[10px] text-slate-400 truncate">
                {currentUser?.role || 'Plant Technical Director'}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 border border-rose-900/30 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out Workspace</span>
          </button>
        </div>
      </aside>
    </>
  );
};
