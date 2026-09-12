import React from 'react';
import { useApp } from './context/AppContext';
import { LoginPage } from './views/LoginPage';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { PipelineHeader } from './components/layout/PipelineHeader';
import { AIProcessingModal } from './components/common/AIProcessingModal';

// Views
import { OverviewView } from './views/OverviewView';
import { FactoryProfileView } from './views/FactoryProfileView';
import { EmissionIntelligenceView } from './views/EmissionIntelligenceView';
import { DigitalTwinHotspotsView } from './views/DigitalTwinHotspotsView';
import { AIRecommendationsView } from './views/AIRecommendationsView';
import { MultiCriteriaOptimizerView } from './views/MultiCriteriaOptimizerView';
import { WhatIfSimulatorView } from './views/WhatIfSimulatorView';
import { ImpactReportView } from './views/ImpactReportView';
import { ActionCenterView } from './views/ActionCenterView';
import { CostSavingsCalculatorView } from './views/CostSavingsCalculatorView';

export const App: React.FC = () => {
  const { isAuthenticated, activeTab } = useApp();

  // If not signed in, show the Landing / Login experience
  if (!isAuthenticated) {
    return <LoginPage />;
  }

  // Render current active tab view
  const renderCurrentView = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewView />;
      case 'factory-profile':
      case 'process-data':
        return <FactoryProfileView />;
      case 'emission-intelligence':
        return <EmissionIntelligenceView />;
      case 'hotspot-detection':
      case 'digital-twin':
        return <DigitalTwinHotspotsView />;
      case 'ai-recommendations':
        return <AIRecommendationsView />;
      case 'cost-savings':
        return <CostSavingsCalculatorView />;
      case 'optimizer':
        return <MultiCriteriaOptimizerView />;
      case 'what-if':
        return <WhatIfSimulatorView />;
      case 'impact-report':
        return <ImpactReportView />;
      case 'action-center':
        return <ActionCenterView />;
      default:
        return <OverviewView />;
    }
  };

  return (
    <div className="factory-bg-container">
      {/* Subtle Factory Smoke Background Layer & Light Translucent Overlay */}
      <div className="factory-bg-layer" />
      <div className="factory-overlay-layer" />

      {/* Main UI Layout (Sidebar + Main Content - NO OVERLAP) */}
      <div className="main-content-layer flex min-h-screen">
        {/* Left Sidebar (Desktop Fixed w-64, Mobile Slide-out) */}
        <Sidebar />

        {/* Main Content Area - Correctly offset by sidebar width on desktop */}
        <div className="flex-1 flex flex-col min-w-0 lg:pl-64 transition-all duration-300">
          <Header />

          <main className="flex-1 p-4 sm:p-6 lg:p-8">
            {/* 7-Stage Pipeline Header */}
            <PipelineHeader />

            {/* View Content */}
            {renderCurrentView()}
          </main>
        </div>
      </div>

      {/* Neural AI Calculation Progress Modal */}
      <AIProcessingModal />
    </div>
  );
};
