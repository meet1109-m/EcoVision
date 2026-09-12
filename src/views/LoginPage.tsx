import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { GlobeVisualization } from '../components/common/GlobeVisualization';
import { 
  Cpu, 
  ArrowRight, 
  TrendingDown, 
  TrendingUp, 
  Sparkles, 
  ShieldCheck, 
  Building2, 
  Lock, 
  Mail, 
  HelpCircle 
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useApp();
  const [customerId, setCustomerId] = useState('DEMO001');
  const [password, setPassword] = useState('••••••••••••');
  const [rememberMe, setRememberMe] = useState(true);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(customerId);
  };

  const handleDemoSelect = (demoId: string) => {
    setCustomerId(demoId);
    login(demoId);
  };

  return (
    <div className="min-h-screen w-full bg-[#F5F7FA] flex flex-col lg:flex-row items-stretch justify-between relative overflow-hidden">
      {/* ========================================================================= */}
      {/* LEFT 50% — PLANETARY DECARBONIZATION & REVOLVING EARTH VISUAL            */}
      {/* ========================================================================= */}
      <div className="w-full lg:w-1/2 bg-gradient-to-br from-slate-900 via-slate-800 to-sky-950 text-white p-8 lg:p-14 flex flex-col justify-between relative overflow-hidden">
        {/* Subtle background ambient glow */}
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(14,165,233,0.25),rgba(255,255,255,0))] pointer-events-none" />

        {/* Top Header Branding */}
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-cyan-400 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-sky-500/30">
              <Cpu className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-extrabold tracking-tight text-white font-mono">ECOLEAK AI</span>
                <span className="text-[10px] font-bold bg-sky-500/20 text-sky-300 border border-sky-400/30 px-2 py-0.5 rounded-full">
                  HACKOUT’26
                </span>
              </div>
              <p className="text-xs font-medium text-sky-300 tracking-wider uppercase">
                Industrial Emission Intelligence
              </p>
            </div>
          </div>

          {/* Core Problem Statement Headline */}
          <div className="mt-8 space-y-3">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-[1.15]">
              Detect. Localize.<br />
              Explain. Optimize.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-cyan-300 to-emerald-400">
                Simulate.
              </span>
            </h1>
            <p className="text-sm text-slate-300 max-w-lg leading-relaxed">
              Transform fragmented factory operational, energy, material and waste information into actionable decarbonization decisions.
            </p>
          </div>
        </div>

        {/* Center: Revolving Realistic Earth Canvas */}
        <div className="relative z-10 my-6 flex items-center justify-center">
          <GlobeVisualization />
        </div>

        {/* Bottom: 3 Demonstration Impact Indicators */}
        <div className="relative z-10">
          <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-700/60">
            {/* KPI 1 */}
            <div className="bg-slate-800/80 rounded-xl p-3 border border-slate-700/80 backdrop-blur-md">
              <div className="flex items-center gap-1 text-emerald-400 text-xs font-bold mb-1">
                <TrendingDown className="w-3.5 h-3.5" />
                <span>↓ 38.7%</span>
              </div>
              <div className="text-[11px] font-medium text-slate-300 leading-tight">
                Potential Emission Reduction
              </div>
            </div>

            {/* KPI 2 */}
            <div className="bg-slate-800/80 rounded-xl p-3 border border-slate-700/80 backdrop-blur-md">
              <div className="flex items-center gap-1 text-sky-400 text-xs font-bold mb-1">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>↑ 24.5%</span>
              </div>
              <div className="text-[11px] font-medium text-slate-300 leading-tight">
                Energy Efficiency
              </div>
            </div>

            {/* KPI 3 */}
            <div className="bg-slate-800/80 rounded-xl p-3 border border-slate-700/80 backdrop-blur-md">
              <div className="flex items-center gap-1 text-cyan-300 text-xs font-bold mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>94/100</span>
              </div>
              <div className="text-[11px] font-medium text-slate-300 leading-tight">
                Circular Economy Score
              </div>
            </div>
          </div>

          <p className="text-[10px] text-slate-400 text-center mt-3">
            * Demonstration / simulation values for industrial leak & circular alternative validation.
          </p>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* RIGHT 50% — SOLID CLEAN WHITE ENTERPRISE LOGIN CARD                       */}
      {/* ========================================================================= */}
      <div className="w-full lg:w-1/2 p-8 lg:p-14 flex items-center justify-center bg-[#F5F7FA]">
        <div className="w-full max-w-md">
          {/* SOLID WHITE CARD (STRICTLY NO ACRYLIC / GLASS EFFECT) */}
          <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-elevated">
            <div className="mb-6">
              <span className="text-xs font-bold uppercase tracking-wider text-sky-600 bg-sky-50 px-2.5 py-1 rounded-full border border-sky-100">
                Enterprise Portal
              </span>
              <h2 className="text-2xl font-bold text-slate-900 mt-2.5">
                Welcome Back
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Sign in to your EcoLeak AI workspace to analyze industrial telemetry.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Customer ID / Plant Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={customerId}
                    onChange={(e) => setCustomerId(e.target.value)}
                    placeholder="DEMO001 or name@plant.com"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white font-medium transition-all"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-700">
                    Password
                  </label>
                  <a href="#forgot" onClick={(e) => e.preventDefault()} className="text-[11px] text-sky-600 hover:text-sky-700 font-medium">
                    Forgot password?
                  </a>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white font-medium transition-all"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500 border-slate-300"
                  />
                  <span className="text-xs text-slate-600">Remember session</span>
                </label>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold tracking-wide shadow-sm shadow-sky-600/30 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <span>LOGIN TO WORKSPACE</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Continue with Demo Button */}
              <button
                type="button"
                onClick={() => login('DEMO001')}
                className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2"
              >
                <span>CONTINUE WITH DEMO (GREEN TECH)</span>
              </button>
            </form>

            <div className="mt-5 text-center text-xs text-slate-500">
              Don't have an industrial account?{' '}
              <a href="#signup" onClick={(e) => { e.preventDefault(); login('DEMO001'); }} className="font-bold text-sky-600 hover:text-sky-700 underline">
                SIGN UP
              </a>
            </div>

            {/* Quick Demo Switcher Card Below Login */}
            <div className="mt-6 pt-5 border-t border-slate-100 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                Fast Hackathon Demo Profiles
              </span>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleDemoSelect('DEMO001')}
                  className="p-2.5 text-left rounded-xl bg-slate-50 hover:bg-sky-50 hover:border-sky-200 border border-slate-200 transition-all text-xs"
                >
                  <div className="font-bold text-slate-900 truncate">GreenTech Chem</div>
                  <div className="text-[10px] font-mono text-sky-600 font-semibold">DEMO001</div>
                </button>

                <button
                  type="button"
                  onClick={() => handleDemoSelect('DEMO002')}
                  className="p-2.5 text-left rounded-xl bg-slate-50 hover:bg-sky-50 hover:border-sky-200 border border-slate-200 transition-all text-xs"
                >
                  <div className="font-bold text-slate-900 truncate">FutureChem Ind</div>
                  <div className="text-[10px] font-mono text-sky-600 font-semibold">DEMO002</div>
                </button>
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-center gap-2 text-[11px] text-slate-500">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Encrypted Industrial Data Pipeline & Decarbonization Sandbox</span>
          </div>
        </div>
      </div>
    </div>
  );
};
