# EcoVision — Industrial Emission Intelligence & Cost Analysis

> **Problem Statement:** *“Industrial Emission Leak-Point Detector & Circular Alternative Recommender”*

---

## 🌍 Overview

**EcoVision** is an enterprise-grade industrial decision-support SaaS platform designed to transform fragmented factory process, energy, material, waste, and continuous emission monitoring (CEMS) data into actionable decarbonization decisions.

### The 7-Stage Core Workflow:
$$\text{MEASURE} \longrightarrow \text{DETECT} \longrightarrow \text{LOCALIZE} \longrightarrow \text{EXPLAIN} \longrightarrow \text{RECOMMEND} \longrightarrow \text{SIMULATE} \longrightarrow \text{ACT}$$

1. **01 INPUT (Measure)**: Ingest operational process, energy consumption, material circularity ratios, and byproduct waste streams.
2. **02 DETECT**: Calculate baseline carbon equivalents and compute emission risk scores via anomaly models.
3. **03 LOCALIZE**: Pinpoint anomalous process units (e.g., Centrifugal Scrubber, Thermal Furnace) on an interactive Digital Twin Lite.
4. **04 EXPLAIN**: Explainable AI (XAI) feature attribution breakdown answering *"Why is the risk high?"*.
5. **05 RECOMMEND**: Synthesize and rank circular economy alternatives (Alternative A, B, C) with multi-objective trade-offs.
6. **06 SIMULATE**: Interactive What-If sandbox to test operational changes before capital allocation.
7. **07 ACT**: Prioritized, role-assigned decarbonization execution roadmap.

---

## 📁 Complete Project Structure

```
ecovision/
├── public/
│   ├── factory_bg.jpg              # High-res desaturated industrial factory smoke backdrop
│   └── logo.svg                    # Brand vector logo
├── src/
│   ├── components/
│   │   ├── common/
│   │   │   ├── AIProcessingModal.tsx    # 7-step neural AI progress modal
│   │   │   └── GlobeVisualization.tsx   # Revolving 3D/2.5D Earth globe for login
│   │   ├── layout/
│   │   │   ├── Header.tsx               # Top application header with telemetry status
│   │   │   ├── PipelineHeader.tsx       # 7-stage interactive workflow pipeline bar
│   │   │   └── Sidebar.tsx              # Responsive non-overlapping left navigation
│   │   └── process/
│   │       └── ProcessFlowMap.tsx       # Digital Twin Lite interactive node map
│   ├── context/
│   │   └── AppContext.tsx          # Global state management & simulation orchestration
│   ├── data/
│   │   ├── presets.ts              # Benchmark facility profiles (Chemicals, Cement, etc.)
│   │   └── simulationEngine.ts     # Physics & ML calculation engine (CO2e, EcoScore, Deltas)
│   ├── types/
│   │   └── index.ts                # TypeScript domain models and interfaces
│   ├── views/
│   │   ├── ActionCenterView.tsx         # Prioritized task execution board
│   │   ├── AIRecommendationsView.tsx    # Circular alternatives comparison
│   │   ├── DigitalTwinHotspotsView.tsx  # Hotspot localization & process twin
│   │   ├── EmissionIntelligenceView.tsx # KPIs, anomaly factors & CEMS chart
│   │   ├── FactoryProfileView.tsx       # Multi-section data ingestion form
│   │   ├── ImpactReportView.tsx         # Decarbonization report & print audit
│   │   ├── LoginPage.tsx                # 50/50 split Earth visual & solid login card
│   │   ├── MultiCriteriaOptimizerView.tsx # EcoScore weights & live re-ranking
│   │   ├── OverviewView.tsx             # Executive summary dashboard
│   │   └── WhatIfSimulatorView.tsx      # Real-time scenario sandbox
│   ├── App.tsx                     # Main layout shell & view router
│   ├── index.css                   # Industrial light theme styling & acrylic tokens
│   └── main.tsx                    # React DOM entry point
├── index.html                      # HTML5 root with Google Fonts (Inter & JetBrains Mono)
├── package.json                    # Project metadata and dependencies
├── postcss.config.js               # PostCSS configuration
├── tailwind.config.js              # Tailwind CSS light industrial palette
├── tsconfig.json                   # TypeScript configuration
├── tsconfig.node.json              # TypeScript Node configuration
└── vite.config.ts                  # Vite development and bundle configuration
```

---

## 🚀 Running the Application

### Development Mode:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build:
```bash
npm run build
```

---

## 🎨 Design System

- **Background**: `#F5F7FA` (Light Industrial Slate)
- **Cards**: `#FFFFFF` / Frosted Acrylic (`backdrop-filter: blur(14px)`, `border: #E2E8F0`)
- **Typography**: Inter & JetBrains Mono (Primary text: `#0F172A`, Secondary text: `#64748B`)
- **Accents**:
  - Electric Blue (`#0284C7`): AI and primary actions
  - Emerald Green (`#059669`): Sustainability and verified actions
  - Amber (`#D97706`): Warning alerts
  - Crimson Red (`#DC2626`): Critical emission risks*Typography**: Inter & JetBrains Mono (Primary text: `#0F172A`, Secondary text: `#64748B`)
- **Accents**:
  - Electric Blue (`#0284C7`): AI and primary actions
  - Emerald Green (`#059669`): Sustainability and verified actions
  - Amber (`#D97706`): Warning alerts
  - Crimson Red (`#DC2626`): Critical emission risks
=======
# EcoVision
>>>>>>> a7b2f166a368b27d5f2577785a0fd12ef56e32af
