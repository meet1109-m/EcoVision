import React, { createContext, useContext, useState, useMemo, useCallback, useEffect } from 'react';
import { 
  FactoryProfile, 
  NavigationTab, 
  PipelineStage, 
  OptimizerWeights, 
  PriorityPreset, 
  WhatIfScenario, 
  ActionPlanItem,
  CircularAlternative 
} from '../types';
import { FACTORY_PRESETS } from '../data/presets';
import { runSimulation, SimulationResult } from '../data/simulationEngine';
import { predictIncident, PredictResponse, TelemetryInput } from '../services/api';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  plantName: string;
}

interface AppContextType {
  isAuthenticated: boolean;
  currentUser: User | null;
  factoryProfile: FactoryProfile;
  activePresetId: string;
  activeTab: NavigationTab;
  activePipelineStage: PipelineStage;
  optimizerWeights: OptimizerWeights;
  activePriorityPreset: PriorityPreset;
  whatIfScenario: WhatIfScenario;
  simulationResult: SimulationResult;
  isAnalyzing: boolean;
  analysisStepIndex: number;
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;
  latestMLPrediction: PredictResponse | null;
  isMLPredicting: boolean;
  selectedRecommendationForCalculator: CircularAlternative | null;
  
  // Actions
  login: (customerIdOrEmail?: string, customUser?: Partial<User>) => void;
  logout: () => void;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  updateProfile: (updates: Partial<FactoryProfile>) => void;
  loadPreset: (presetId: string) => void;
  setActiveTab: (tab: NavigationTab) => void;
  setActivePipelineStage: (stage: PipelineStage) => void;
  updateWeights: (weights: Partial<OptimizerWeights>) => void;
  applyPriorityPreset: (preset: PriorityPreset) => void;
  updateWhatIfScenario: (updates: Partial<WhatIfScenario>) => void;
  resetWhatIfToDefault: () => void;
  triggerAIAnalysis: () => Promise<void>;
  updateActionStatus: (id: string, status: ActionPlanItem['status']) => void;
  runLiveMLPrediction: (overrideReading?: Partial<TelemetryInput>) => Promise<PredictResponse | null>;
  selectRecommendationForCalculator: (alt: CircularAlternative) => void;
}

const defaultWeights: OptimizerWeights = {
  environmental: 85,
  economic: 65,
  circularity: 90,
  feasibility: 75,
  riskTolerance: 80
};

const defaultWhatIf: WhatIfScenario = {
  recycledMaterialPercentage: 45,
  renewableEnergyPercentage: 60,
  productionRatePercentage: 100,
  processConditionTuning: 85,
  wasteRecoveryPercentage: 75,
  sourcingDistanceKm: 180
};

const profileToTelemetry = (profile: FactoryProfile, whatIf?: WhatIfScenario): TelemetryInput => {
  const isChemical = profile.industryType === 'Chemicals' || profile.industryType === 'Pharmaceuticals';
  const processType = isChemical ? 'Refining' : 'Petrochemical';
  const equip = profile.equipment[0] || 'Continuous Stirred Tank Reactor';
  const equipType = equip.includes('Reactor') ? 'Reactor' : (equip.includes('Compressor') ? 'Compressor' : (equip.includes('Scrubber') ? 'Scrubber' : 'Furnace'));
  
  let pressDev = 12.5;
  let flowDev = -8.4;
  let tempDev = 3.2;
  let vocPpm = 12.5;
  let co2Ppm = 4800.0;
  
  if (whatIf) {
    const tuningFactor = (100 - whatIf.processConditionTuning) / 100;
    pressDev = 12.5 * tuningFactor;
    flowDev = -8.4 * tuningFactor;
    tempDev = 3.2 * tuningFactor;
    vocPpm = Math.max(1.0, 12.5 * tuningFactor);
    const renewableFactor = (100 - whatIf.renewableEnergyPercentage * 0.5) / 100;
    co2Ppm = Math.max(400.0, 4800.0 * renewableFactor);
  }

  return {
    plant_id: profile.id,
    process_unit_id: 'UNIT-01',
    equipment_id: profile.equipment[0] ? `${profile.id}-EQ01` : 'EQ-001',
    equipment_type: equipType,
    process_type: processType,
    temperature_c: 185.0,
    pressure_bar: 14.2,
    flow_rate: 130.0,
    production_rate: 80.0,
    operating_hours: (profile.operatingHoursPerDay || 20) * 365 * 4,
    equipment_age_years: 12.0,
    maintenance_due: false,
    co2_ppm: co2Ppm,
    co_ppm: 18.5,
    nox_ppm: 52.0,
    so2_ppm: 22.0,
    voc_ppm: vocPpm,
    ch4_ppm: 3.2,
    pm25_mg_m3: 14.0,
    fuel_or_material_type: profile.naturalGasM3Day > 0 ? 'NaturalGas' : 'Naphtha',
    ambient_temperature_c: 32.0,
    humidity_pct: 55.0,
    wind_speed_m_s: 3.2,
    shift: 'Morning',
    maintenance_status: 'Normal',
    pressure_deviation_pct: pressDev,
    flow_deviation_pct: flowDev,
    temperature_deviation_pct: tempDev,
    emission_above_baseline_pct: 28.0,
    rolling_mean: 14.2,
    rolling_std: 1.1,
  };
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activePresetId, setActivePresetId] = useState<string>('DEMO001');
  const [factoryProfile, setFactoryProfile] = useState<FactoryProfile>(FACTORY_PRESETS['DEMO001']);
  const [activeTab, setActiveTab] = useState<NavigationTab>('factory-profile');
  const [activePipelineStage, setActivePipelineStage] = useState<PipelineStage>('INPUT');
  const [optimizerWeights, setOptimizerWeights] = useState<OptimizerWeights>(defaultWeights);
  const [activePriorityPreset, setActivePriorityPreset] = useState<PriorityPreset>('Environment-first');
  const [whatIfScenario, setWhatIfScenario] = useState<WhatIfScenario>(defaultWhatIf);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisStepIndex, setAnalysisStepIndex] = useState<number>(0);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);

  const toggleSidebar = () => setSidebarOpen(prev => !prev);
  const setSidebarCollapsed = (collapsed: boolean) => setSidebarOpen(!collapsed);
  const sidebarCollapsed = !sidebarOpen;
  const [actionPlanOverrides, setActionPlanOverrides] = useState<Record<string, ActionPlanItem['status']>>({});
  
  // Real ML Prediction state
  const [latestMLPrediction, setLatestMLPrediction] = useState<PredictResponse | null>(null);
  const [isMLPredicting, setIsMLPredicting] = useState<boolean>(false);
  const [selectedRecommendationForCalculator, setSelectedRecommendationForCalculator] = useState<CircularAlternative | null>(null);

  // Compute simulation result, merging in real ML prediction metrics when available
  const simulationResult = useMemo(() => {
    const res = runSimulation(factoryProfile, optimizerWeights);
    
    // Apply action plan overrides
    res.actionPlan = res.actionPlan.map(act => ({
      ...act,
      status: actionPlanOverrides[act.id] || act.status
    }));

    // If live ML model result is available, seamlessly enrich KPIs with true ML outputs
    if (latestMLPrediction) {
      res.emissionRiskScore = Math.round(latestMLPrediction.predicted_risk_score);
      const riskClassMap: Record<string, 'CRITICAL' | 'HIGH' | 'WARNING' | 'NORMAL'> = {
        normal: 'NORMAL',
        warning: 'WARNING',
        leak_suspected: 'HIGH',
        critical: 'CRITICAL',
        confirmed_leak: 'CRITICAL'
      };
      res.emissionRiskStatus = riskClassMap[latestMLPrediction.predicted_risk_class] || 'WARNING';
    }

    return res;
  }, [factoryProfile, optimizerWeights, actionPlanOverrides, latestMLPrediction]);

  // Real ML prediction caller
  const runLiveMLPrediction = useCallback(async (overrideReading?: Partial<TelemetryInput>): Promise<PredictResponse | null> => {
    setIsMLPredicting(true);
    try {
      const baseTelemetry = profileToTelemetry(factoryProfile, whatIfScenario);
      const mergedTelemetry: TelemetryInput = { ...baseTelemetry, ...(overrideReading || {}) };
      const res = await predictIncident(mergedTelemetry, { saveReading: false, savePrediction: true });
      setLatestMLPrediction(res);
      return res;
    } catch (err) {
      console.warn('Live ML inference request notice:', err);
      return null;
    } finally {
      setIsMLPredicting(false);
    }
  }, [factoryProfile, whatIfScenario]);

  // Trigger initial ML prediction on startup
  useEffect(() => {
    runLiveMLPrediction();
  }, [factoryProfile.id]);

  // Restore session from localStorage on initial load
  useEffect(() => {
    try {
      const savedUserStr = localStorage.getItem('ecovision_current_user');
      const token = localStorage.getItem('ecovision_token');
      if (savedUserStr) {
        const savedUser: User = JSON.parse(savedUserStr);
        setCurrentUser(savedUser);
        setIsAuthenticated(true);
        const pid = (savedUser.id && FACTORY_PRESETS[savedUser.id]) ? savedUser.id : 'DEMO001';
        setActivePresetId(pid);
        setFactoryProfile(FACTORY_PRESETS[pid]);
      }
    } catch {
      // Ignore parsing errors
    }
  }, []);

  const login = useCallback((customerIdOrEmail?: string, customUser?: Partial<User>) => {
    let presetId = 'DEMO001';
    let userName = 'Dr. Rajesh Sharma';
    let userRole = 'Chief Sustainability Officer';

    const normalized = customerIdOrEmail ? customerIdOrEmail.trim().toUpperCase() : '';

    if (normalized === 'DEMO002' || normalized.includes('DEMO002')) {
      presetId = 'DEMO002';
      userName = 'Ananya Patel';
      userRole = 'Lead Process & Decarbonization Engineer';
    } else if (normalized === 'DEMO003' || normalized.includes('DEMO003')) {
      presetId = 'DEMO003';
      userName = 'Vikram Singhania';
      userRole = 'Plant Technical Director';
    } else if (normalized === 'DEMO001' || normalized.includes('DEMO001')) {
      presetId = 'DEMO001';
      userName = 'Dr. Rajesh Sharma';
      userRole = 'Chief Sustainability Officer';
    } else if (customUser?.name) {
      userName = customUser.name;
      userRole = customUser.role || 'Senior Plant Engineer';
    } else if (customerIdOrEmail && customerIdOrEmail.includes('@')) {
      // Format human name from email (e.g. john.doe@company.com -> John Doe)
      const rawPrefix = customerIdOrEmail.split('@')[0];
      const cleaned = rawPrefix.replace(/[._-]/g, ' ');
      userName = cleaned
        .split(' ')
        .filter(Boolean)
        .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
        .join(' ') || customerIdOrEmail;
      userRole = customUser?.role || 'Senior Plant Engineer';
    } else if (customerIdOrEmail) {
      userName = customerIdOrEmail;
      userRole = customUser?.role || 'Plant Engineer';
    }

    if (customUser?.name) {
      userName = customUser.name;
    }
    if (customUser?.role) {
      userRole = customUser.role;
    }

    const preset = FACTORY_PRESETS[presetId] || FACTORY_PRESETS['DEMO001'];
    setActivePresetId(presetId);
    setFactoryProfile(preset);

    const newUser: User = {
      id: customUser?.id || preset.id,
      name: userName,
      email: customUser?.email || customerIdOrEmail || `${preset.id.toLowerCase()}@ecovision.ai`,
      role: userRole,
      plantName: customUser?.plantName || preset.name
    };

    setCurrentUser(newUser);
    try {
      localStorage.setItem('ecovision_current_user', JSON.stringify(newUser));
    } catch {
      // ignore
    }

    setIsAuthenticated(true);
    setActiveTab('factory-profile');
    setActivePipelineStage('INPUT');
  }, []);

  const logout = useCallback(() => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    try {
      localStorage.removeItem('ecovision_token');
      localStorage.removeItem('ecovision_current_user');
    } catch {
      // ignore
    }
    setActiveTab('factory-profile');
    setActivePipelineStage('INPUT');
  }, []);

  const updateProfile = useCallback((updates: Partial<FactoryProfile>) => {
    setFactoryProfile(prev => ({
      ...prev,
      ...updates
    }));
  }, []);

  const loadPreset = useCallback((presetId: string) => {
    if (FACTORY_PRESETS[presetId]) {
      const newPreset = FACTORY_PRESETS[presetId];
      setFactoryProfile(newPreset);
      setActivePresetId(presetId);
      
      setCurrentUser(prev => {
        if (!prev) return null;
        
        // If current user is a demo user switching benchmark presets, update their demo persona
        const isDemoUser = ['Dr. Rajesh Sharma', 'Ananya Patel', 'Vikram Singhania'].includes(prev.name) ||
                           prev.id.startsWith('DEMO');
        
        if (isDemoUser) {
          const demoPersonaMap: Record<string, { name: string; role: string }> = {
            DEMO001: { name: 'Dr. Rajesh Sharma', role: 'Chief Sustainability Officer' },
            DEMO002: { name: 'Ananya Patel', role: 'Lead Process & Decarbonization Engineer' },
            DEMO003: { name: 'Vikram Singhania', role: 'Plant Technical Director' },
          };
          const persona = demoPersonaMap[presetId] || { name: prev.name, role: prev.role };
          const updated = {
            ...prev,
            id: presetId,
            name: persona.name,
            role: persona.role,
            plantName: newPreset.name
          };
          try {
            localStorage.setItem('ecovision_current_user', JSON.stringify(updated));
          } catch {}
          return updated;
        }

        const updated = { ...prev, plantName: newPreset.name };
        try {
          localStorage.setItem('ecovision_current_user', JSON.stringify(updated));
        } catch {}
        return updated;
      });
    }
  }, []);

  const updateWeights = useCallback((weights: Partial<OptimizerWeights>) => {
    setOptimizerWeights(prev => ({
      ...prev,
      ...weights
    }));
    setActivePriorityPreset('Balanced');
  }, []);

  const applyPriorityPreset = useCallback((preset: PriorityPreset) => {
    setActivePriorityPreset(preset);
    switch (preset) {
      case 'Environment-first':
        setOptimizerWeights({ environmental: 95, economic: 40, circularity: 90, feasibility: 70, riskTolerance: 75 });
        break;
      case 'Cost-first':
        setOptimizerWeights({ environmental: 50, economic: 95, circularity: 55, feasibility: 90, riskTolerance: 85 });
        break;
      case 'Circularity-first':
        setOptimizerWeights({ environmental: 80, economic: 50, circularity: 98, feasibility: 65, riskTolerance: 70 });
        break;
      case 'Low-disruption':
        setOptimizerWeights({ environmental: 60, economic: 70, circularity: 65, feasibility: 98, riskTolerance: 95 });
        break;
      case 'Balanced':
        setOptimizerWeights({ environmental: 75, economic: 75, circularity: 75, feasibility: 75, riskTolerance: 80 });
        break;
    }
  }, []);

  const updateWhatIfScenario = useCallback((updates: Partial<WhatIfScenario>) => {
    setWhatIfScenario(prev => ({
      ...prev,
      ...updates
    }));
  }, []);

  const resetWhatIfToDefault = useCallback(() => {
    setWhatIfScenario(defaultWhatIf);
  }, []);

  const updateActionStatus = useCallback((id: string, status: ActionPlanItem['status']) => {
    setActionPlanOverrides(prev => ({
      ...prev,
      [id]: status
    }));
  }, []);

  // Multi-step AI analysis trigger with live ML execution
  const triggerAIAnalysis = useCallback(async () => {
    setIsAnalyzing(true);
    setAnalysisStepIndex(0);

    // Call live ML prediction in parallel
    const mlPromise = runLiveMLPrediction();

    const steps = 7;
    for (let i = 0; i < steps; i++) {
      setAnalysisStepIndex(i);
      await new Promise(res => setTimeout(res, 380));
    }

    await mlPromise;
    await new Promise(res => setTimeout(res, 250));
    setIsAnalyzing(false);
    setActiveTab('overview');
    setActivePipelineStage('DETECT');
  }, [runLiveMLPrediction]);

  const selectRecommendationForCalculator = useCallback((alt: CircularAlternative) => {
    setSelectedRecommendationForCalculator(alt);
    setActiveTab('cost-savings');
    setActivePipelineStage('SIMULATE');
  }, []);

  return (
    <AppContext.Provider
      value={{
        isAuthenticated,
        currentUser,
        factoryProfile,
        activePresetId,
        activeTab,
        activePipelineStage,
        optimizerWeights,
        activePriorityPreset,
        whatIfScenario,
        simulationResult,
        isAnalyzing,
        analysisStepIndex,
        sidebarOpen,
        sidebarCollapsed,
        latestMLPrediction,
        isMLPredicting,
        selectedRecommendationForCalculator,
        login,
        logout,
        setSidebarOpen,
        toggleSidebar,
        setSidebarCollapsed,
        updateProfile,
        loadPreset,
        setActiveTab,
        setActivePipelineStage,
        updateWeights,
        applyPriorityPreset,
        updateWhatIfScenario,
        resetWhatIfToDefault,
        triggerAIAnalysis,
        updateActionStatus,
        runLiveMLPrediction,
        selectRecommendationForCalculator
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
