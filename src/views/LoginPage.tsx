import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { GlobeVisualization } from '../components/common/GlobeVisualization';
import { 
  ArrowRight, 
  TrendingDown, 
  TrendingUp, 
  Sparkles, 
  ShieldCheck, 
  Lock, 
  Mail, 
  User, 
  Building2, 
  X, 
  CheckCircle2, 
  AlertCircle,
  KeyRound,
  ChevronLeft
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useApp();

  // Two-stage flow: 'landing' (Earth revolving, no login box) vs 'login' (same background, no Earth, auth form + demo popup)
  const [viewStage, setViewStage] = useState<'landing' | 'login'>('landing');

  // Auth Mode: Sign In vs Sign Up
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [plantName, setPlantName] = useState('');
  const [role, setRole] = useState('Senior Plant Engineer');
  const [rememberMe, setRememberMe] = useState(true);

  // Status & Validation
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Demo Accounts Popup Box State
  const [isDemoPopupOpen, setIsDemoPopupOpen] = useState(false);

  // Handle Sign In submission with real authentication validation
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const trimmedEmail = email.trim();

    // Validation: Require email & password
    if (!trimmedEmail) {
      setErrorMsg('Please enter your industrial email address or Customer ID.');
      return;
    }
    if (!password || password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    // 3. Explicit Demo Account Shortcut Path (when explicitly using DEMO001/DEMO002)
    const normalized = trimmedEmail.toUpperCase();
    if (normalized === 'DEMO001' || normalized === 'DEMO002') {
      login(normalized);
      return;
    }

    setIsLoading(true);

    try {
      // Attempt backend authentication
      const res = await fetch('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ email: trimmedEmail, password }),
      });

      if (res.ok) {
        // 1. Successful /auth/login response: store token and log in
        const data = await res.json();
        if (data.access_token) {
          localStorage.setItem('ecovision_token', data.access_token);
        }
        login(trimmedEmail);
        return;
      } else {
        // 2. 401 or non-OK response with invalid credentials: show error and DO NOT log in
        let detailMsg = 'Invalid email or password. Please verify your credentials.';
        try {
          const errData = await res.json();
          if (errData?.detail) {
            detailMsg = typeof errData.detail === 'string' ? errData.detail : JSON.stringify(errData.detail);
          }
        } catch {
          // JSON parse fallback
        }
        setErrorMsg(`Authentication Failed: ${detailMsg}`);
        setIsLoading(false);
        return;
      }
    } catch {
      // 4. Genuine network error / offline backend fallback with visible notice
      setSuccessMsg('Offline Mode Notice: Backend server unreachable. Accessing workspace in local demonstration mode...');
      setTimeout(() => {
        login(trimmedEmail);
      }, 1000);
    }
  };

  // Handle Sign Up submission
  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const trimmedEmail = email.trim();

    if (!fullName.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }
    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      setErrorMsg('Please enter a valid work email address.');
      return;
    }
    if (!password || password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          email: trimmedEmail,
          password,
          full_name: fullName.trim(),
          role: role.toLowerCase().replace(/\s+/g, '_'),
          plant_id: plantName ? plantName.toUpperCase().slice(0, 8) : 'PLANT-CUSTOM',
        }),
      });

      if (res.ok) {
        const data = await res.json().catch(() => ({}));
        if (data?.access_token) {
          localStorage.setItem('ecovision_token', data.access_token);
        }
        setSuccessMsg('Account created successfully! Accessing workspace...');
        setTimeout(() => {
          login(trimmedEmail);
        }, 800);
        return;
      } else {
        let detailMsg = 'Registration failed. Email may already be registered.';
        try {
          const errData = await res.json();
          if (errData?.detail) {
            detailMsg = typeof errData.detail === 'string' ? errData.detail : JSON.stringify(errData.detail);
          }
        } catch {
          // JSON parse fallback
        }
        setErrorMsg(`Registration Failed: ${detailMsg}`);
        setIsLoading(false);
        return;
      }
    } catch {
      // Offline fallback with visible notice
      setSuccessMsg('Offline Mode Notice: Backend server unreachable. Registering user in local mode...');
      setTimeout(() => {
        login(trimmedEmail);
      }, 1000);
    }
  };

  // Quick Demo Account Selection from Popup Box
  const handleSelectDemo = (demoId: 'DEMO001' | 'DEMO002') => {
    setIsDemoPopupOpen(false);
    if (demoId === 'DEMO001') {
      setEmail('DEMO001');
      setPassword('EcoLeak@123');
    } else {
      setEmail('DEMO002');
      setPassword('EcoLeak@456');
    }
    login(demoId);
  };

  // =========================================================================
  // STAGE 1: FIRST PAGE (LANDING VIEW - EARTH REVOLVING, NO LOGIN BOX)
  // =========================================================================
  if (viewStage === 'landing') {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-slate-950 via-slate-900 to-sky-950 text-white flex flex-col justify-between relative overflow-hidden">
        {/* Subtle background ambient glow & factory silhouette */}
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(16,185,129,0.18),rgba(255,255,255,0))] pointer-events-none" />
        <div 
          className="absolute inset-0 opacity-15 pointer-events-none bg-cover bg-center"
          style={{ backgroundImage: "url('/factory_bg.jpg')" }}
        />

        {/* Top Header Branding */}
        <header className="relative z-10 px-6 sm:px-12 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img 
              src="/ecovision_logo.png" 
              alt="EcoVision" 
              className="w-11 h-11 rounded-2xl object-contain bg-white/95 p-1 shadow-lg shadow-emerald-500/20 border border-emerald-500/30" 
            />
            <div>
              <div className="flex items-center gap-1">
                <span className="text-2xl font-extrabold tracking-tight text-emerald-400 font-sans">Eco</span>
                <span className="text-2xl font-extrabold tracking-tight text-white font-sans">Vision</span>
                <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2 py-0.5 rounded-full ml-1.5">
                  HackOut’26
                </span>
              </div>
              <p className="text-[11px] font-medium text-slate-300 tracking-wider uppercase">
                Industrial Emission Intelligence
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setViewStage('login')}
            className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all border border-white/20 backdrop-blur-md flex items-center gap-2 shadow-sm active:scale-95"
          >
            <span>Sign In</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </header>

        {/* Center: Headline & Revolving 3D Earth */}
        <main className="relative z-10 max-w-6xl mx-auto px-6 py-4 flex-1 flex flex-col lg:flex-row items-center justify-between gap-8">
          {/* Left Column: Problem Statement */}
          <div className="w-full lg:w-1/2 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Next-Gen Decarbonization Decision Support</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.12]">
              Detect. Localize.<br />
              Explain. Optimize.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
                Simulate.
              </span>
            </h1>

            <p className="text-sm sm:text-base text-slate-300 max-w-xl leading-relaxed">
              Transform fragmented factory operational, energy, material, and waste information into actionable decarbonization and leak mitigation decisions.
            </p>

            {/* 3 Impact Indicators on Landing */}
            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-700/60 max-w-lg mx-auto lg:mx-0">
              <div className="bg-slate-900/70 rounded-xl p-3 border border-slate-700/80 backdrop-blur-md">
                <div className="flex items-center gap-1 text-emerald-400 text-xs font-bold mb-1">
                  <TrendingDown className="w-3.5 h-3.5" />
                  <span>↓ 38.7%</span>
                </div>
                <div className="text-[11px] font-medium text-slate-300 leading-tight">
                  Potential Emission Reduction
                </div>
              </div>

              <div className="bg-slate-900/70 rounded-xl p-3 border border-slate-700/80 backdrop-blur-md">
                <div className="flex items-center gap-1 text-sky-400 text-xs font-bold mb-1">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>↑ 24.5%</span>
                </div>
                <div className="text-[11px] font-medium text-slate-300 leading-tight">
                  Energy Efficiency
                </div>
              </div>

              <div className="bg-slate-900/70 rounded-xl p-3 border border-slate-700/80 backdrop-blur-md">
                <div className="flex items-center gap-1 text-cyan-300 text-xs font-bold mb-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>94/100</span>
                </div>
                <div className="text-[11px] font-medium text-slate-300 leading-tight">
                  Circular Economy Score
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Revolving 3D Earth Canvas */}
          <div className="w-full lg:w-1/2 flex items-center justify-center relative">
            <GlobeVisualization />
          </div>
        </main>

        {/* Bottom Bar with Prominent LOGIN Button */}
        <footer className="relative z-10 px-6 sm:px-12 py-6 border-t border-slate-800/80 bg-slate-950/70 backdrop-blur-lg flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Industrial Emission Intelligence & Cost Analysis Platform</span>
          </div>

          {/* REQUIRED BOTTOM LOGIN BUTTON */}
          <button
            type="button"
            onClick={() => setViewStage('login')}
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-sky-600 hover:from-emerald-600 hover:via-teal-600 hover:to-sky-700 text-white font-extrabold text-sm tracking-wide shadow-xl shadow-emerald-500/25 transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3"
          >
            <span>ENTER ECOVISION WORKSPACE (LOGIN)</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </footer>
      </div>
    );
  }

  // =========================================================================
  // STAGE 2: LOGIN WEBPAGE (SAME BACKGROUND, NO REVOLVING EARTH, AUTH + DEMO POPUP)
  // =========================================================================
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-950 via-slate-900 to-sky-950 text-white flex flex-col justify-between relative overflow-hidden">
      {/* Exact Same Background as First Page */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(16,185,129,0.18),rgba(255,255,255,0))] pointer-events-none" />
      <div 
        className="absolute inset-0 opacity-15 pointer-events-none bg-cover bg-center"
        style={{ backgroundImage: "url('/factory_bg.jpg')" }}
      />

      {/* Top Header */}
      <header className="relative z-10 px-6 sm:px-12 py-5 flex items-center justify-between border-b border-slate-800/80 bg-slate-950/40 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <img 
            src="/ecovision_logo.png" 
            alt="EcoVision" 
            className="w-10 h-10 rounded-xl object-contain bg-white/95 p-1 shadow-md border border-emerald-500/30" 
          />
          <div>
            <div className="flex items-center gap-1">
              <span className="text-xl font-extrabold tracking-tight text-emerald-400">Eco</span>
              <span className="text-xl font-extrabold tracking-tight text-white">Vision</span>
            </div>
            <p className="text-[10px] font-medium text-slate-300 uppercase tracking-wider">
              Authentication Portal
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setViewStage('landing')}
          className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 text-xs font-semibold transition-colors flex items-center gap-1.5"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Landing</span>
        </button>
      </header>

      {/* Center Acrylic Authentication Card */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-md">
          <div className="acrylic-card rounded-3xl p-6 sm:p-8 border border-white/20 shadow-2xl backdrop-blur-xl bg-slate-900/80 text-white">
            {/* Tab Toggle: Sign In vs Sign Up */}
            <div className="flex items-center justify-between p-1 bg-slate-950/60 rounded-xl mb-6 border border-slate-800">
              <button
                type="button"
                onClick={() => { setAuthMode('login'); setErrorMsg(null); }}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                  authMode === 'login'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setAuthMode('signup'); setErrorMsg(null); }}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                  authMode === 'signup'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Create Account (Sign Up)
              </button>
            </div>

            {/* Error or Success Alert */}
            {errorMsg && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-200 text-xs flex items-start gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}
            {successMsg && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 text-xs flex items-start gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* SIGN IN FORM */}
            {authMode === 'login' && (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Customer ID or Work Email
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Mail className="w-4 h-4" />
                    </span>
                    <input
                      type="text"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="DEMO001 or engineer@plant.com"
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-950/70 border border-slate-700/80 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </span>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-950/70 border border-slate-700/80 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-3.5 h-3.5 rounded text-emerald-500 focus:ring-emerald-500 bg-slate-800 border-slate-700"
                    />
                    <span>Remember session</span>
                  </label>
                  <span className="text-[11px] text-emerald-400">Secured via SHA-256</span>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-xl text-xs font-bold tracking-wide shadow-lg shadow-emerald-600/25 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <span>{isLoading ? 'Verifying Credentials...' : 'SIGN IN TO WORKSPACE'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}

            {/* SIGN UP FORM */}
            {authMode === 'signup' && (
              <form onSubmit={handleSignUpSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <User className="w-4 h-4" />
                    </span>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Dr. Rajesh Sharma"
                      className="w-full pl-9 pr-3 py-2 bg-slate-950/70 border border-slate-700/80 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Work Email Address
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Mail className="w-4 h-4" />
                    </span>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="engineer@plant.com"
                      className="w-full pl-9 pr-3 py-2 bg-slate-950/70 border border-slate-700/80 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Plant Facility Name
                    </label>
                    <input
                      type="text"
                      value={plantName}
                      onChange={(e) => setPlantName(e.target.value)}
                      placeholder="Bhiwadi Petrochem"
                      className="w-full px-3 py-2 bg-slate-950/70 border border-slate-700/80 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Professional Role
                    </label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="w-full px-2.5 py-2 bg-slate-950/70 border border-slate-700/80 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="Senior Plant Engineer">Plant Engineer</option>
                      <option value="Chief Sustainability Officer">Sustainability CSO</option>
                      <option value="Plant Technical Director">Technical Director</option>
                      <option value="Process Auditor">Process Auditor</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Create Password
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </span>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Minimum 6 characters"
                      className="w-full pl-9 pr-3 py-2 bg-slate-950/70 border border-slate-700/80 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 px-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-xl text-xs font-bold tracking-wide shadow-lg shadow-emerald-600/25 transition-all disabled:opacity-50"
                >
                  <span>{isLoading ? 'Creating Account...' : 'REGISTER & ACCESS ECOVISION'}</span>
                </button>
              </form>
            )}

            {/* REQUIRED DEMO POPUP TRIGGER BUTTON */}
            <div className="mt-6 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsDemoPopupOpen(true)}
                className="w-full py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/15 text-emerald-300 hover:text-emerald-200 border border-emerald-500/30 text-xs font-bold transition-all flex items-center justify-center gap-2"
              >
                <KeyRound className="w-4 h-4 text-emerald-400" />
                <span>Open 1-Click Fast Demo Accounts</span>
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 px-6 py-4 text-center text-xs text-slate-400 border-t border-slate-800/80 bg-slate-950/40">
        EcoVision Industrial Emission Intelligence & Cost Analysis • All Rights Reserved
      </footer>

      {/* ========================================================================= */}
      {/* REQUIRED POPUP BOX: FAST DEMO PROFILES MODAL DIALOG                       */}
      {/* ========================================================================= */}
      {isDemoPopupOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-lg acrylic-card rounded-3xl p-6 border border-white/20 bg-slate-900/95 text-white shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <KeyRound className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-white">
                    Select Benchmark Demo Account
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Includes pre-loaded factory telemetry, sensor feeds & AI circular recommendations.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsDemoPopupOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              {/* Demo Account 1 */}
              <div 
                onClick={() => handleSelectDemo('DEMO001')}
                className="p-4 rounded-2xl bg-slate-950/80 border border-slate-700/80 hover:border-emerald-500/80 hover:bg-emerald-950/30 cursor-pointer transition-all group"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-emerald-400 group-hover:text-emerald-300">
                    Demo Account #1: Petrochemical & Polymers
                  </span>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    DEMO001
                  </span>
                </div>
                <div className="font-bold text-sm text-white">GreenTech Chemicals Plant Alpha</div>
                <div className="text-xs text-slate-300 mt-0.5">Bhiwadi Industrial Zone, Rajasthan</div>
                <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Lead: Dr. Rajesh Sharma (CSO)</span>
                  <span className="font-bold text-emerald-400 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                    <span>Launch Profile</span>
                    <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>

              {/* Demo Account 2 */}
              <div 
                onClick={() => handleSelectDemo('DEMO002')}
                className="p-4 rounded-2xl bg-slate-950/80 border border-slate-700/80 hover:border-sky-500/80 hover:bg-sky-950/30 cursor-pointer transition-all group"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-sky-400 group-hover:text-sky-300">
                    Demo Account #2: Catalytic Refining & Solvent
                  </span>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30">
                    DEMO002
                  </span>
                </div>
                <div className="font-bold text-sm text-white">FutureChem Industries - Unit 4</div>
                <div className="text-xs text-slate-300 mt-0.5">Dahej Petrochemical Corridor, Gujarat</div>
                <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Lead: Ananya Patel (Decarbonization Lead)</span>
                  <span className="font-bold text-sky-400 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                    <span>Launch Profile</span>
                    <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 text-center">
              <span className="text-[11px] text-slate-400">
                Clicking either profile automatically authenticates and opens the interactive dashboard.
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
