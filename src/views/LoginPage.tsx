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

  // Password Complexity & Strength Evaluation
  const passHasMinLength = password.length >= 8;
  const passHasNumber = /\d/.test(password);
  const passHasSpecial = /[^a-zA-Z0-9]/.test(password);
  const isPasswordStrong = passHasMinLength && passHasNumber && passHasSpecial;

  let passwordStrengthScore = 0;
  if (passHasMinLength) passwordStrengthScore++;
  if (passHasNumber) passwordStrengthScore++;
  if (passHasSpecial) passwordStrengthScore++;

  let strengthLabel = 'Weak';
  let strengthBarWidth = '33%';
  let strengthBarColor = 'bg-rose-500 shadow-rose-500/50';
  let strengthBadgeBg = 'bg-rose-500/10 text-rose-400 border-rose-500/30';

  if (!password) {
    strengthLabel = 'Required';
    strengthBarWidth = '0%';
    strengthBarColor = 'bg-slate-700';
    strengthBadgeBg = 'bg-slate-800 text-slate-400 border-slate-700';
  } else if (isPasswordStrong) {
    strengthLabel = 'Strong';
    strengthBarWidth = '100%';
    strengthBarColor = 'bg-emerald-500 shadow-emerald-500/50';
    strengthBadgeBg = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
  } else if (passwordStrengthScore >= 2 || password.length >= 6) {
    strengthLabel = 'Medium';
    strengthBarWidth = '66%';
    strengthBarColor = 'bg-amber-500 shadow-amber-500/50';
    strengthBadgeBg = 'bg-amber-500/10 text-amber-400 border-amber-500/30';
  } else {
    strengthLabel = 'Weak';
    strengthBarWidth = '33%';
    strengthBarColor = 'bg-rose-500 shadow-rose-500/50';
    strengthBadgeBg = 'bg-rose-500/10 text-rose-400 border-rose-500/30';
  }

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

    // Explicit Demo Account Shortcut Path
    const normalized = trimmedEmail.toUpperCase();
    if (normalized === 'DEMO001' || normalized === 'DEMO002' || normalized === 'DEMO003') {
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
        // 1. Successful /auth/login response: store token and log in with user profile
        const data = await res.json();
        if (data.access_token) {
          localStorage.setItem('ecovision_token', data.access_token);
        }
        const userObj = data.user;
        const roleDisplayMap: Record<string, string> = {
          senior_plant_engineer: 'Senior Plant Engineer',
          chief_sustainability_officer: 'Chief Sustainability Officer',
          plant_technical_director: 'Plant Technical Director',
          process_auditor: 'Process Auditor',
          operator: 'Plant Operator',
          admin: 'System Administrator',
        };
        const formattedRole = userObj?.role ? (roleDisplayMap[userObj.role] || userObj.role) : undefined;
        login(trimmedEmail, {
          id: userObj?.id ? String(userObj.id) : undefined,
          name: userObj?.full_name || trimmedEmail,
          email: userObj?.email || trimmedEmail,
          role: formattedRole,
          plantName: userObj?.plant_id
        });
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
        login(trimmedEmail, {
          email: trimmedEmail,
        });
      }, 1000);
    }
  };

  // Handle Sign Up submission
  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const trimmedEmail = email.trim();
    const cleanName = fullName.trim();

    if (!cleanName) {
      setErrorMsg('Please enter your full name.');
      return;
    }
    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      setErrorMsg('Please enter a valid work email address.');
      return;
    }
    if (!password) {
      setErrorMsg('Please create a password.');
      return;
    }
    if (!passHasMinLength) {
      setErrorMsg('Password must be at least 8 characters long.');
      return;
    }
    if (!passHasNumber) {
      setErrorMsg('Password must contain at least 1 number (0-9).');
      return;
    }
    if (!passHasSpecial) {
      setErrorMsg('Password must contain at least 1 special character (!@#$%...).');
      return;
    }
    if (!isPasswordStrong) {
      setErrorMsg('Password must be Strong before you can sign up.');
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
          full_name: cleanName,
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
          login(trimmedEmail, {
            name: cleanName,
            email: trimmedEmail,
            role: role,
            plantName: plantName || 'Custom Industrial Facility'
          });
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
        login(trimmedEmail, {
          name: cleanName,
          email: trimmedEmail,
          role: role,
          plantName: plantName || 'Custom Industrial Facility'
        });
      }, 1000);
    }
  };

  // Quick Demo Account Selection from Popup Box
  const handleSelectDemo = (demoId: 'DEMO001' | 'DEMO002' | 'DEMO003') => {
    setIsDemoPopupOpen(false);
    if (demoId === 'DEMO001') {
      setEmail('DEMO001');
      setPassword('EcoLeak@123');
      login('DEMO001', {
        id: 'DEMO001',
        name: 'Dr. Rajesh Sharma',
        role: 'Chief Sustainability Officer',
        email: 'rajesh.sharma@greentech.com',
        plantName: 'GreenTech Chemicals Plant Alpha'
      });
    } else if (demoId === 'DEMO002') {
      setEmail('DEMO002');
      setPassword('EcoLeak@456');
      login('DEMO002', {
        id: 'DEMO002',
        name: 'Ananya Patel',
        role: 'Lead Process & Decarbonization Engineer',
        email: 'ananya.patel@futurechem.com',
        plantName: 'FutureChem Industries - Unit 4'
      });
    } else {
      setEmail('DEMO003');
      setPassword('EcoLeak@789');
      login('DEMO003', {
        id: 'DEMO003',
        name: 'Vikram Singhania',
        role: 'Plant Technical Director',
        email: 'vikram.singhania@apexcement.com',
        plantName: 'Apex Low-Carbon Cement Works'
      });
    }
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

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => { setViewStage('login'); setAuthMode('login'); setErrorMsg(null); }}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all border border-white/20 backdrop-blur-md flex items-center gap-2 shadow-sm active:scale-95 cursor-pointer"
            >
              <span>Sign In</span>
              <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
            </button>
            <button
              type="button"
              onClick={() => { setViewStage('login'); setAuthMode('signup'); setErrorMsg(null); }}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-xs font-extrabold transition-all shadow-md shadow-emerald-600/30 active:scale-95 flex items-center gap-2 cursor-pointer"
            >
              <span>Sign Up</span>
              <User className="w-3.5 h-3.5" />
            </button>
          </div>
        </header>

        {/* Center: Headline & Revolving 3D Earth */}
        <main className="relative z-10 max-w-6xl mx-auto px-6 py-4 flex-1 flex flex-col lg:flex-row items-center justify-between gap-8">
          {/* Left Column: Problem Statement */}
          <div className="w-full lg:w-1/2 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Next-Gen Decarbonization Decision Support</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.12]">
              Detect. Localize.<br />
              Explain. Optimize.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
                Simulate.
              </span>
            </h1>

            <p className="text-xs sm:text-base text-slate-300 max-w-xl leading-relaxed">
              Transform fragmented factory operational, energy, material, and waste information into actionable decarbonization and leak mitigation decisions.
            </p>

            {/* 3 Impact Indicators on Landing */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-4 border-t border-slate-700/60 max-w-lg mx-auto lg:mx-0">
              <div className="bg-slate-900/70 rounded-xl p-3 border border-slate-700/80 backdrop-blur-md flex sm:flex-col items-center sm:items-start justify-between sm:justify-start gap-2">
                <div className="flex items-center gap-1 text-emerald-400 text-xs font-bold">
                  <TrendingDown className="w-3.5 h-3.5" />
                  <span>↓ 38.7%</span>
                </div>
                <div className="text-[11px] font-medium text-slate-300 leading-tight">
                  Potential Emission Reduction
                </div>
              </div>

              <div className="bg-slate-900/70 rounded-xl p-3 border border-slate-700/80 backdrop-blur-md flex sm:flex-col items-center sm:items-start justify-between sm:justify-start gap-2">
                <div className="flex items-center gap-1 text-sky-400 text-xs font-bold">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>↑ 24.5%</span>
                </div>
                <div className="text-[11px] font-medium text-slate-300 leading-tight">
                  Energy Efficiency
                </div>
              </div>

              <div className="bg-slate-900/70 rounded-xl p-3 border border-slate-700/80 backdrop-blur-md flex sm:flex-col items-center sm:items-start justify-between sm:justify-start gap-2">
                <div className="flex items-center gap-1 text-cyan-300 text-xs font-bold">
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

          {/* REQUIRED BOTTOM ACTION BUTTONS */}
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => { setViewStage('login'); setAuthMode('login'); setErrorMsg(null); }}
              className="flex-1 sm:flex-initial px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-sky-600 hover:from-emerald-600 hover:via-teal-600 hover:to-sky-700 text-white font-extrabold text-xs tracking-wider uppercase shadow-xl shadow-emerald-500/25 transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>SIGN IN TO WORKSPACE</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => { setViewStage('login'); setAuthMode('signup'); setErrorMsg(null); }}
              className="flex-1 sm:flex-initial px-6 py-3 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-emerald-300 font-extrabold text-xs tracking-wider uppercase border border-emerald-500/40 shadow-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>CREATE ACCOUNT (SIGN UP)</span>
              <User className="w-4 h-4" />
            </button>
          </div>
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

      {/* Center Authentication Card */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-md">
          <div className="rounded-3xl p-6 sm:p-8 border border-slate-700/80 shadow-2xl shadow-black/60 backdrop-blur-2xl bg-slate-900/95 text-white ring-1 ring-white/10">
            {/* Tab Toggle: Sign In vs Sign Up */}
            <div className="flex items-center justify-between p-1 bg-slate-950/80 rounded-2xl mb-6 border border-slate-800 gap-1">
              <button
                type="button"
                onClick={() => { setAuthMode('login'); setErrorMsg(null); }}
                className={`flex-1 py-2.5 px-3 text-xs font-bold rounded-xl transition-all ${
                  authMode === 'login'
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/25'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60 font-medium'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setAuthMode('signup'); setErrorMsg(null); }}
                className={`flex-1 py-2.5 px-3 text-xs font-bold rounded-xl transition-all ${
                  authMode === 'signup'
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/25'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60 font-medium'
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
                  <label className="block text-xs font-bold text-slate-200 mb-1.5 uppercase tracking-wider">
                    Customer ID or Work Email
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-emerald-400/80">
                      <Mail className="w-4 h-4" />
                    </span>
                    <input
                      type="text"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="DEMO001 or engineer@plant.com"
                      className="w-full pl-10 pr-3.5 py-3 bg-slate-950/90 border border-slate-700/90 hover:border-slate-500 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/25 rounded-xl text-xs text-white placeholder:text-slate-400 focus:outline-none font-medium transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-200 mb-1.5 uppercase tracking-wider">
                    Password
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-emerald-400/80">
                      <Lock className="w-4 h-4" />
                    </span>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full pl-10 pr-3.5 py-3 bg-slate-950/90 border border-slate-700/90 hover:border-slate-500 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/25 rounded-xl text-xs text-white placeholder:text-slate-400 focus:outline-none font-medium transition-all"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-500/40 bg-slate-950 border-slate-600 cursor-pointer"
                    />
                    <span className="text-xs font-semibold text-slate-200">Remember session</span>
                  </label>
                  <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Secured via SHA-256</span>
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:via-teal-400 hover:to-emerald-500 text-white rounded-xl text-xs font-extrabold tracking-wider uppercase shadow-lg shadow-emerald-600/30 transition-all transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2"
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
                  <label className="block text-xs font-bold text-slate-200 mb-1 uppercase tracking-wider">
                    Full Name
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-emerald-400/80">
                      <User className="w-4 h-4" />
                    </span>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Dr. Rajesh Sharma"
                      className="w-full pl-10 pr-3.5 py-2.5 bg-slate-950/90 border border-slate-700/90 hover:border-slate-500 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/25 rounded-xl text-xs text-white placeholder:text-slate-400 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-200 mb-1 uppercase tracking-wider">
                    Work Email Address
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-emerald-400/80">
                      <Mail className="w-4 h-4" />
                    </span>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="engineer@plant.com"
                      className="w-full pl-10 pr-3.5 py-2.5 bg-slate-950/90 border border-slate-700/90 hover:border-slate-500 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/25 rounded-xl text-xs text-white placeholder:text-slate-400 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-200 mb-1 uppercase tracking-wider">
                      Plant Facility Name
                    </label>
                    <input
                      type="text"
                      value={plantName}
                      onChange={(e) => setPlantName(e.target.value)}
                      placeholder="Bhiwadi Petrochem"
                      className="w-full px-3 py-2.5 bg-slate-950/90 border border-slate-700/90 hover:border-slate-500 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/25 rounded-xl text-xs text-white placeholder:text-slate-400 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-200 mb-1 uppercase tracking-wider">
                      Professional Role
                    </label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="w-full px-2.5 py-2.5 bg-slate-950/90 border border-slate-700/90 hover:border-slate-500 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/25 rounded-xl text-xs text-white focus:outline-none"
                    >
                      <option value="Senior Plant Engineer" className="bg-slate-900 text-white">Plant Engineer</option>
                      <option value="Chief Sustainability Officer" className="bg-slate-900 text-white">Sustainability CSO</option>
                      <option value="Plant Technical Director" className="bg-slate-900 text-white">Technical Director</option>
                      <option value="Process Auditor" className="bg-slate-900 text-white">Process Auditor</option>
                    </select>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider">
                      Create Password
                    </label>
                    {password && (
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${strengthBadgeBg}`}>
                        {strengthLabel} Password
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-emerald-400/80">
                      <Lock className="w-4 h-4" />
                    </span>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Req. 8+ chars, 1 number, 1 special char"
                      className="w-full pl-10 pr-3.5 py-2.5 bg-slate-950/90 border border-slate-700/90 hover:border-slate-500 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/25 rounded-xl text-xs text-white placeholder:text-slate-400 focus:outline-none"
                    />
                  </div>

                  {/* Password Strength Color Line & Criteria Checklist */}
                  <div className="mt-2 space-y-1.5">
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${strengthBarColor}`}
                        style={{ width: strengthBarWidth }}
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-1 pt-1 text-[10px]">
                      <div className={`flex items-center gap-1 ${passHasMinLength ? 'text-emerald-400 font-medium' : 'text-slate-500'}`}>
                        {passHasMinLength ? <CheckCircle2 className="w-3 h-3 text-emerald-400" /> : <AlertCircle className="w-3 h-3 text-slate-600" />}
                        <span>8+ Chars</span>
                      </div>
                      <div className={`flex items-center gap-1 ${passHasNumber ? 'text-emerald-400 font-medium' : 'text-slate-500'}`}>
                        {passHasNumber ? <CheckCircle2 className="w-3 h-3 text-emerald-400" /> : <AlertCircle className="w-3 h-3 text-slate-600" />}
                        <span>1+ Number</span>
                      </div>
                      <div className={`flex items-center gap-1 ${passHasSpecial ? 'text-emerald-400 font-medium' : 'text-slate-500'}`}>
                        {passHasSpecial ? <CheckCircle2 className="w-3 h-3 text-emerald-400" /> : <AlertCircle className="w-3 h-3 text-slate-600" />}
                        <span>1+ Special</span>
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !isPasswordStrong}
                  className={`w-full py-3 px-4 text-white rounded-xl text-xs font-extrabold tracking-wider uppercase shadow-lg transition-all flex items-center justify-center gap-2 mt-2 ${
                    isPasswordStrong
                      ? 'bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:via-teal-400 hover:to-emerald-500 shadow-emerald-600/30 active:scale-[0.98]'
                      : 'bg-slate-800 text-slate-400 border border-slate-700/60 opacity-60 cursor-not-allowed shadow-none'
                  }`}
                >
                  <span>{isLoading ? 'Creating Account...' : 'REGISTER & ACCESS ECOVISION'}</span>
                  {isPasswordStrong && <ArrowRight className="w-4 h-4" />}
                </button>
              </form>
            )}

            {/* REQUIRED DEMO POPUP TRIGGER BUTTON */}
            <div className="mt-6 pt-5 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsDemoPopupOpen(true)}
                className="w-full py-3 px-4 rounded-xl bg-slate-950 hover:bg-slate-800 text-emerald-300 hover:text-emerald-100 border border-emerald-500/50 hover:border-emerald-400 text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40 active:scale-[0.99]"
              >
                <KeyRound className="w-4 h-4 text-emerald-400" />
                <span>Open 1-Click Fast Demo Accounts</span>
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 px-6 py-4 text-center text-xs text-slate-300 border-t border-slate-800/80 bg-slate-950/60 backdrop-blur-md">
        EcoVision Industrial Emission Intelligence & Cost Analysis • All Rights Reserved
      </footer>

      {/* ========================================================================= */}
      {/* REQUIRED POPUP BOX: FAST DEMO PROFILES MODAL DIALOG                       */}
      {/* ========================================================================= */}
      {isDemoPopupOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl p-6 sm:p-7 border border-slate-700 bg-slate-900/98 text-white shadow-2xl shadow-black/80 backdrop-blur-2xl relative ring-1 ring-white/10">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                  <KeyRound className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-white">
                    Select Benchmark Demo Account
                  </h3>
                  <p className="text-xs text-slate-300 font-medium mt-0.5">
                    Includes pre-loaded factory telemetry, sensor feeds & AI circular recommendations.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsDemoPopupOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              {/* Demo Account 1 */}
              <div 
                onClick={() => handleSelectDemo('DEMO001')}
                className="p-4 rounded-2xl bg-slate-950 border border-slate-700/80 hover:border-emerald-400 hover:bg-slate-800/80 cursor-pointer transition-all group shadow-md"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-emerald-400 group-hover:text-emerald-300">
                    Demo Account #1: Petrochemical & Polymers
                  </span>
                  <span className="text-[11px] font-mono font-extrabold px-2.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    DEMO001
                  </span>
                </div>
                <div className="font-bold text-sm text-white">GreenTech Chemicals Plant Alpha</div>
                <div className="text-xs text-slate-300 mt-0.5 font-medium">Bhiwadi Industrial Zone, Rajasthan</div>
                <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-300">
                  <span>Lead: Dr. Rajesh Sharma (CSO)</span>
                  <span className="font-bold text-emerald-400 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                    <span>Launch Profile</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>

              {/* Demo Account 2 */}
              <div 
                onClick={() => handleSelectDemo('DEMO002')}
                className="p-4 rounded-2xl bg-slate-950 border border-slate-700/80 hover:border-sky-400 hover:bg-slate-800/80 cursor-pointer transition-all group shadow-md"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-sky-400 group-hover:text-sky-300">
                    Demo Account #2: Catalytic Refining & Solvent
                  </span>
                  <span className="text-[11px] font-mono font-extrabold px-2.5 py-0.5 rounded-md bg-sky-500/20 text-sky-300 border border-sky-500/40">
                    DEMO002
                  </span>
                </div>
                <div className="font-bold text-sm text-white">FutureChem Industries - Unit 4</div>
                <div className="text-xs text-slate-300 mt-0.5 font-medium">Dahej Petrochemical Corridor, Gujarat</div>
                <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-300">
                  <span>Lead: Ananya Patel (Decarbonization Lead)</span>
                  <span className="font-bold text-sky-400 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                    <span>Launch Profile</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>

              {/* Demo Account 3 */}
              <div 
                onClick={() => handleSelectDemo('DEMO003')}
                className="p-4 rounded-2xl bg-slate-950 border border-slate-700/80 hover:border-amber-400 hover:bg-slate-800/80 cursor-pointer transition-all group shadow-md"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-amber-400 group-hover:text-amber-300">
                    Demo Account #3: Heavy Manufacturing & Kiln
                  </span>
                  <span className="text-[11px] font-mono font-extrabold px-2.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    DEMO003
                  </span>
                </div>
                <div className="font-bold text-sm text-white">Apex Low-Carbon Cement Works</div>
                <div className="text-xs text-slate-300 mt-0.5 font-medium">Satna Industrial Belt, Madhya Pradesh</div>
                <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-300">
                  <span>Lead: Vikram Singhania (Plant Technical Director)</span>
                  <span className="font-bold text-amber-400 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                    <span>Launch Profile</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 text-center">
              <span className="text-xs text-slate-300 font-medium">
                Clicking any profile automatically authenticates and opens the interactive dashboard.
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
