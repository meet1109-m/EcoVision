import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { IndustryType, FactoryProfile } from '../types';
import { FACTORY_PRESETS } from '../data/presets';
import { 
  Factory, 
  Zap, 
  Layers, 
  Trash2, 
  ArrowRight, 
  Sparkles, 
  RefreshCw, 
  Sliders, 
  CheckCircle, 
  Info,
  Building2,
  Gauge,
  Flame,
  BatteryCharging
} from 'lucide-react';

const INDUSTRY_OPTIONS: IndustryType[] = [
  'Chemicals',
  'Cement',
  'Steel',
  'Textiles',
  'Food Processing',
  'Pharmaceuticals',
  'Manufacturing',
  'Other'
];

const COMMON_EQUIPMENT = [
  'Continuous Stirred Tank Reactor (CSTR)',
  'Centrifugal Gas Scrubber',
  'Rotary Separator',
  'Thermal Fluid Furnace',
  'Heavy Multi-Stage Compressor',
  'Exhaust Stack Monitor',
  'Rotary Calcining Kiln',
  'Cyclonic Preheater',
  'Wet Venturi Scrubber',
  'Plate & Shell Heat Exchanger'
];

export const FactoryProfileView: React.FC = () => {
  const { 
    factoryProfile, 
    updateProfile, 
    loadPreset, 
    triggerAIAnalysis, 
    isAnalyzing, 
    activePresetId 
  } = useApp();

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const handleEquipmentToggle = (equip: string) => {
    const current = factoryProfile.equipment || [];
    if (current.includes(equip)) {
      updateProfile({ equipment: current.filter(e => e !== equip) });
    } else {
      updateProfile({ equipment: [...current, equip] });
    }
  };

  const handleVirginChange = (virgin: number) => {
    const clampedVirgin = Math.max(0, Math.min(100, virgin));
    updateProfile({
      virginMaterialPercentage: clampedVirgin,
      recycledMaterialPercentage: 100 - clampedVirgin
    });
  };

  const handleRecycledChange = (recycled: number) => {
    const clampedRecycled = Math.max(0, Math.min(100, recycled));
    updateProfile({
      recycledMaterialPercentage: clampedRecycled,
      virginMaterialPercentage: 100 - clampedRecycled
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    triggerAIAnalysis();
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Page Header & Preset Bar */}
      <div className="acrylic-card rounded-2xl p-6 border border-white/80 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold font-mono text-sky-700 bg-sky-100 px-2.5 py-1 rounded-full uppercase tracking-wider">
                Stage 01 • Data Ingestion
              </span>
              <span className="text-xs text-slate-500 font-medium">| Factory Digital Twin Input</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-2">
              Create Factory Intelligence Profile
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-3xl leading-relaxed">
              Provide your factory's operational, energy, material and waste information to generate an AI-powered decarbonization analysis.
            </p>
          </div>

          {/* 1-Click Preset Switchers */}
          <div className="flex flex-col gap-1.5 flex-shrink-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Quick Load Benchmark Facility:
            </span>
            <div className="flex flex-wrap gap-2">
              {Object.keys(FACTORY_PRESETS).map((key) => {
                const preset = FACTORY_PRESETS[key];
                const isSelected = activePresetId === key;

                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => loadPreset(key)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                      isSelected
                        ? 'bg-sky-600 text-white border-sky-600 shadow-sm'
                        : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    {preset.industryType}: {key}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ========================================================================= */}
        {/* SECTION 1: PROCESS INFORMATION                                           */}
        {/* ========================================================================= */}
        <div className="acrylic-card rounded-2xl p-6 border border-white/80 shadow-sm">
          <div className="flex items-center gap-3 pb-4 mb-5 border-b border-slate-200">
            <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center">
              <Factory className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">
                Section 1: Process Information
              </h3>
              <p className="text-xs text-slate-500">
                Core industrial classification, manufacturing process, equipment list and operating cadence.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Industry Type */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Industry Sector
              </label>
              <select
                value={factoryProfile.industryType}
                onChange={(e) => updateProfile({ industryType: e.target.value as IndustryType })}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-sm"
              >
                {INDUSTRY_OPTIONS.map((ind) => (
                  <option key={ind} value={ind}>{ind}</option>
                ))}
              </select>
            </div>

            {/* Production Process */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Primary Production Process
              </label>
              <input
                type="text"
                value={factoryProfile.productionProcess}
                onChange={(e) => updateProfile({ productionProcess: e.target.value })}
                placeholder="e.g. Continuous Polymer & Resin Synthesis"
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-sm"
                required
              />
            </div>

            {/* Production Capacity & Unit */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Production Capacity
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={factoryProfile.productionCapacity}
                  onChange={(e) => updateProfile({ productionCapacity: Number(e.target.value) })}
                  className="w-2/3 bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-sm"
                  required
                />
                <select
                  value={factoryProfile.capacityUnit}
                  onChange={(e) => updateProfile({ capacityUnit: e.target.value })}
                  className="w-1/3 bg-white border border-slate-200 rounded-xl px-2 py-2.5 text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-sm"
                >
                  <option value="tonnes/day">tonnes/day</option>
                  <option value="kg/day">kg/day</option>
                  <option value="m³/day">m³/day</option>
                  <option value="units/day">units/day</option>
                </select>
              </div>
            </div>

            {/* Operating Hours */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Operating Schedule
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={1}
                  max={24}
                  value={factoryProfile.operatingHoursPerDay}
                  onChange={(e) => updateProfile({ operatingHoursPerDay: Number(e.target.value) })}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-sm"
                  required
                />
                <span className="text-xs text-slate-500 font-medium whitespace-nowrap">hrs/day</span>
              </div>
            </div>

            {/* Facility Location */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Plant Name & Industrial Cluster
              </label>
              <input
                type="text"
                value={factoryProfile.name}
                onChange={(e) => updateProfile({ name: e.target.value })}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-sm"
                required
              />
            </div>
          </div>

          {/* Equipment Multi-Select Tags */}
          <div className="mt-5 pt-4 border-t border-slate-100">
            <label className="block text-xs font-bold text-slate-700 mb-2">
              Operating Process Equipment & Unit Operations (Click to Toggle)
            </label>
            <div className="flex flex-wrap gap-2">
              {COMMON_EQUIPMENT.map((equip) => {
                const isSelected = factoryProfile.equipment?.includes(equip);
                return (
                  <button
                    key={equip}
                    type="button"
                    onClick={() => handleEquipmentToggle(equip)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 border ${
                      isSelected
                        ? 'bg-sky-50 text-sky-900 border-sky-300 shadow-xs font-semibold'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-sky-600' : 'bg-slate-300'}`} />
                    {equip}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SECTION 2: ENERGY INFORMATION                                            */}
        {/* ========================================================================= */}
        <div className="acrylic-card rounded-2xl p-6 border border-white/80 shadow-sm">
          <div className="flex items-center gap-3 pb-4 mb-5 border-b border-slate-200">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">
                Section 2: Energy & Fuel Information
              </h3>
              <p className="text-xs text-slate-500">
                Electricity grid consumption, stationary thermal combustion fuels, and renewable energy ratio.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Electricity */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Electricity Grid Draw
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={factoryProfile.electricityKWhDay}
                  onChange={(e) => updateProfile({ electricityKWhDay: Number(e.target.value) })}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-sm"
                  required
                />
                <span className="absolute right-3 top-2.5 text-[11px] text-slate-400 font-mono">kWh/day</span>
              </div>
            </div>

            {/* Coal */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Coal Consumption
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  value={factoryProfile.coalTonnesDay}
                  onChange={(e) => updateProfile({ coalTonnesDay: Number(e.target.value) })}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-sm"
                />
                <span className="absolute right-3 top-2.5 text-[11px] text-slate-400 font-mono">tonnes/day</span>
              </div>
            </div>

            {/* Natural Gas */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Natural Gas
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={factoryProfile.naturalGasM3Day}
                  onChange={(e) => updateProfile({ naturalGasM3Day: Number(e.target.value) })}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-sm"
                />
                <span className="absolute right-3 top-2.5 text-[11px] text-slate-400 font-mono">m³/day</span>
              </div>
            </div>

            {/* Diesel */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Diesel Generator Fuel
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={factoryProfile.dieselLitresDay}
                  onChange={(e) => updateProfile({ dieselLitresDay: Number(e.target.value) })}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-sm"
                />
                <span className="absolute right-3 top-2.5 text-[11px] text-slate-400 font-mono">litres/day</span>
              </div>
            </div>
          </div>

          {/* Renewable Contribution Slider & Visual Energy Mix */}
          <div className="mt-5 pt-4 border-t border-slate-100 bg-slate-50/70 p-4 rounded-xl border border-slate-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
              <div>
                <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <BatteryCharging className="w-4 h-4 text-emerald-600" />
                  Renewable Energy Share Contribution
                </span>
                <p className="text-[11px] text-slate-500">Solar rooftop, PPA, wind or on-site cogeneration</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold font-mono text-emerald-700 bg-emerald-100 px-3 py-1 rounded-lg border border-emerald-200">
                  {factoryProfile.renewablePercentage}%
                </span>
              </div>
            </div>

            <input
              type="range"
              min={0}
              max={100}
              value={factoryProfile.renewablePercentage}
              onChange={(e) => updateProfile({ renewablePercentage: Number(e.target.value) })}
              className="w-full h-2 bg-slate-200 rounded-lg cursor-pointer"
            />

            {/* Visual Energy Mix Bar */}
            <div className="mt-3">
              <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                <span>Renewable Clean Power ({factoryProfile.renewablePercentage}%)</span>
                <span>Fossil / Grid Intensity ({100 - factoryProfile.renewablePercentage}%)</span>
              </div>
              <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden flex shadow-inner">
                <div 
                  className="bg-emerald-500 h-full transition-all duration-300"
                  style={{ width: `${factoryProfile.renewablePercentage}%` }}
                />
                <div 
                  className="bg-slate-400 h-full transition-all duration-300"
                  style={{ width: `${100 - factoryProfile.renewablePercentage}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SECTION 3: MATERIAL INFORMATION                                          */}
        {/* ========================================================================= */}
        <div className="acrylic-card rounded-2xl p-6 border border-white/80 shadow-sm">
          <div className="flex items-center gap-3 pb-4 mb-5 border-b border-slate-200">
            <div className="w-9 h-9 rounded-xl bg-cyan-100 text-cyan-700 flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">
                Section 3: Material Feedstock & Circularity
              </h3>
              <p className="text-xs text-slate-500">
                Virgin vs. recycled input composition, feedstock type and supply chain circularity parameters.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Primary Raw Material
              </label>
              <input
                type="text"
                value={factoryProfile.rawMaterial}
                onChange={(e) => updateProfile({ rawMaterial: e.target.value })}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-sm"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Material Quantity & Unit
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={factoryProfile.materialQuantity}
                  onChange={(e) => updateProfile({ materialQuantity: Number(e.target.value) })}
                  className="w-2/3 bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-sm"
                  required
                />
                <input
                  type="text"
                  value={factoryProfile.materialUnit}
                  onChange={(e) => updateProfile({ materialUnit: e.target.value })}
                  className="w-1/3 bg-white border border-slate-200 rounded-xl px-2 py-2.5 text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Feedstock Material Type
              </label>
              <input
                type="text"
                value={factoryProfile.materialType}
                onChange={(e) => updateProfile({ materialType: e.target.value })}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-sm"
              />
            </div>
          </div>

          {/* Virgin % vs Recycled % Lock Sync */}
          <div className="mt-5 pt-4 border-t border-slate-100 bg-slate-50/70 p-4 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-900">
                Material Circularity Composition (Virgin % + Recycled % = 100%)
              </span>
              <span className="text-xs font-mono font-bold text-sky-700">
                {factoryProfile.virginMaterialPercentage}% Virgin / {factoryProfile.recycledMaterialPercentage}% Recycled
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-2">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Virgin Material Ratio: {factoryProfile.virginMaterialPercentage}%
                </label>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={factoryProfile.virginMaterialPercentage}
                  onChange={(e) => handleVirginChange(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Recycled / Bio-Based Ratio: {factoryProfile.recycledMaterialPercentage}%
                </label>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={factoryProfile.recycledMaterialPercentage}
                  onChange={(e) => handleRecycledChange(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg cursor-pointer"
                />
              </div>
            </div>

            <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden flex shadow-inner mt-2">
              <div 
                className="bg-amber-500 h-full transition-all duration-200"
                style={{ width: `${factoryProfile.virginMaterialPercentage}%` }}
                title="Virgin material fraction"
              />
              <div 
                className="bg-cyan-500 h-full transition-all duration-200"
                style={{ width: `${factoryProfile.recycledMaterialPercentage}%` }}
                title="Recycled circular fraction"
              />
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SECTION 4: WASTE INFORMATION                                             */}
        {/* ========================================================================= */}
        <div className="acrylic-card rounded-2xl p-6 border border-white/80 shadow-sm">
          <div className="flex items-center gap-3 pb-4 mb-5 border-b border-slate-200">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">
                Section 4: Waste Stream & Disposal Method
              </h3>
              <p className="text-xs text-slate-500">
                Byproduct categorization, current disposal route, and internal/external reuse potential.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Waste / Byproduct Stream
              </label>
              <input
                type="text"
                value={factoryProfile.wasteType}
                onChange={(e) => updateProfile({ wasteType: e.target.value })}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-sm"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Waste Generation Quantity
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  step="0.1"
                  value={factoryProfile.wasteQuantity}
                  onChange={(e) => updateProfile({ wasteQuantity: Number(e.target.value) })}
                  className="w-2/3 bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-sm"
                  required
                />
                <input
                  type="text"
                  value={factoryProfile.wasteUnit}
                  onChange={(e) => updateProfile({ wasteUnit: e.target.value })}
                  className="w-1/3 bg-white border border-slate-200 rounded-xl px-2 py-2.5 text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Current Disposal Method
              </label>
              <select
                value={factoryProfile.disposalMethod}
                onChange={(e) => updateProfile({ disposalMethod: e.target.value as any })}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-sm"
              >
                <option value="Landfill">Landfill</option>
                <option value="Incineration">Incineration</option>
                <option value="External recycling">External recycling</option>
                <option value="Internal reuse">Internal reuse</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          {/* Reuse / Recovery Slider */}
          <div className="mt-5 pt-4 border-t border-slate-100 bg-slate-50/70 p-4 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-900">
                Estimated Internal/Circular Reuse Possibility
              </span>
              <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                {factoryProfile.reusePossibilityPercentage}% Potential Recovery
              </span>
            </div>

            <input
              type="range"
              min={0}
              max={100}
              value={factoryProfile.reusePossibilityPercentage}
              onChange={(e) => updateProfile({ reusePossibilityPercentage: Number(e.target.value) })}
              className="w-full h-2 bg-slate-200 rounded-lg cursor-pointer"
            />
          </div>
        </div>

        {/* ========================================================================= */}
        {/* AI RECOMMENDATION TRIGGER BUTTON                                         */}
        {/* ========================================================================= */}
        <div className="acrylic-card rounded-2xl p-6 border border-sky-200 bg-gradient-to-r from-sky-50/80 via-cyan-50/60 to-emerald-50/80 shadow-elevated">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <h4 className="font-extrabold text-base text-slate-900 flex items-center justify-center sm:justify-start gap-2">
                <Sparkles className="w-5 h-5 text-sky-600" />
                Ready to Execute Multi-Variate Industrial AI Analysis
              </h4>
              <p className="text-xs text-slate-600">
                Compute baseline emission risks, localize probable leak points on the digital twin, and score circular alternatives.
              </p>
            </div>

            <button
              type="submit"
              disabled={isAnalyzing}
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-sky-600 via-sky-700 to-indigo-700 hover:from-sky-700 hover:to-indigo-800 text-white rounded-xl text-sm font-bold tracking-wide shadow-lg shadow-sky-600/30 transition-all active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-50 flex-shrink-0"
            >
              <span>RUN AI ANALYSIS →</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
