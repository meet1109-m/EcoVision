import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';
import { 
  FactoryProfile, 
  NavigationTab, 
  PipelineStage, 
  OptimizerWeights, 
  PriorityPreset, 
  WhatIfScenario, 
  ActionPlanItem 
} from '../types';
import { FACTORY_PRESETS } from '../data/presets';
import { runSimulation, SimulationResult } from '../data/simulationEngine';

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
  sidebarCollapsed: boolean;
  
  // Actions
  login: (customerIdOrEmail?: string) => void;
  logout: () => void;
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
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [actionPlanOverrides, setActionPlanOverrides] = useState<Record<string, ActionPlanItem['status']>>({});

  // Compute live simulation result based on current factory profile & weights
  const simulationResult = useMemo(() => {
    const res = runSimulation(factoryProfile, optimizerWeights);
    // Apply action plan overrides
    res.actionPlan = res.actionPlan.map(act => ({
      ...act,
      status: actionPlanOverrides[act.id] || act.status
    }));
    return res;
  }, [factoryProfile, optimizerWeights, actionPlanOverrides]);

  const login = useCallback((customerIdOrEmail?: string) => {
    let preset = FACTORY_PRESETS['DEMO001'];
    let userName = 'Dr. Rajesh Sharma';
    let userRole = 'Chief Sustainability Officer';

    if (customerIdOrEmail && customerIdOrEmail.toUpperCase().includes('DEMO002')) {
      preset = FACTORY_PRESETS['DEMO002'];
      setActivePresetId('DEMO002');
      userName = 'Ananya Patel';
      userRole = 'Lead Process & Decarbonization Engineer';
    } else if (customerIdOrEmail && customerIdOrEmail.toUpperCase().includes('DEMO003')) {
      preset = FACTORY_PRESETS['DEMO003'];
      setActivePresetId('DEMO003');
      userName = 'Vikram Singhania';
      userRole = 'Plant Technical Director';
    } else {
      setActivePresetId('DEMO001');
    }

    setFactoryProfile(preset);
    setCurrentUser({
      id: preset.id,
      name: userName,
      email: `${preset.id.toLowerCase()}@ecoleak.ai`,
      role: userRole,
      plantName: preset.name
    });
    setIsAuthenticated(true);
    setActiveTab('factory-profile');
    setActivePipelineStage('INPUT');
  }, []);

  const logout = useCallback(() => {
    setIsAuthenticated(false);
    setCurrentUser(null);
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
      setFactoryProfile(FACTORY_PRESETS[presetId]);
      setActivePresetId(presetId);
      if (currentUser) {
        setCurrentUser(prev => prev ? ({ ...prev, plantName: FACTORY_PRESETS[presetId].name }) : null);
      }
    }
  }, [currentUser]);

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

  // Multi-step AI analysis trigger with timed step progression
  const triggerAIAnalysis = useCallback(async () => {
    setIsAnalyzing(true);
    setAnalysisStepIndex(0);

    const steps = 7;
    for (let i = 0; i < steps; i++) {
      setAnalysisStepIndex(i);
      await new Promise(res => setTimeout(res, 450));
    }

    await new Promise(res => setTimeout(res, 350));
    setIsAnalyzing(false);
    setActiveTab('overview');
    setActivePipelineStage('DETECT');
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
        sidebarCollapsed,
        login,
        logout,
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
        updateActionStatus
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
