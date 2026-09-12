import { FactoryProfile } from '../types';

export const FACTORY_PRESETS: Record<string, FactoryProfile> = {
  'DEMO001': {
    id: 'DEMO001',
    name: 'GreenTech Chemicals Plant Alpha',
    location: 'Bhiwadi Industrial Zone, Rajasthan',
    industryType: 'Chemicals',
    productionProcess: 'Continuous Polymer & Resin Synthesis',
    productionCapacity: 120,
    capacityUnit: 'tonnes/day',
    equipment: ['Continuous Stirred Tank Reactor (CSTR)', 'Centrifugal Gas Scrubber', 'Rotary Separator', 'Thermal Fluid Furnace', 'Heavy Multi-Stage Compressor', 'Exhaust Stack Monitor'],
    operatingHoursPerDay: 24,
    
    // Energy
    electricityKWhDay: 18500,
    coalTonnesDay: 4.2,
    naturalGasM3Day: 2800,
    dieselLitresDay: 350,
    otherFuels: 'Biomass Pellets (0.8 t/day)',
    renewablePercentage: 24,
    
    // Material
    rawMaterial: 'Petrochemical Monomers & Solvent Grade Benzene',
    materialQuantity: 145,
    materialUnit: 'tonnes/day',
    materialType: 'Synthetic Petrochemical Feedstock',
    virginMaterialPercentage: 82,
    recycledMaterialPercentage: 18,
    supplierInfo: 'SinoChem & Reliance Industrial Supply (Tier 1)',
    
    // Waste
    wasteType: 'Spent Hydrocarbon Sludge & Acidic Scrubber Effluent',
    wasteQuantity: 12.5,
    wasteUnit: 'tonnes/day',
    disposalMethod: 'Incineration',
    reusePossibilityPercentage: 40,
  },
  'DEMO002': {
    id: 'DEMO002',
    name: 'FutureChem Industries - Unit 4',
    location: 'Dahej Petrochemical Corridor, Gujarat',
    industryType: 'Chemicals',
    productionProcess: 'Catalytic Cracking & Solvent Recovery',
    productionCapacity: 250,
    capacityUnit: 'tonnes/day',
    equipment: ['Fixed Bed Catalytic Reactor', 'Wet Venturi Scrubber', 'Flash Drum Separator', 'Natural Gas Cracking Furnace', 'Reciprocating Gas Compressor', 'Emissions Flare Stack'],
    operatingHoursPerDay: 24,
    
    // Energy
    electricityKWhDay: 32000,
    coalTonnesDay: 0,
    naturalGasM3Day: 9500,
    dieselLitresDay: 120,
    otherFuels: 'Hydrogen Off-Gas blend',
    renewablePercentage: 35,
    
    // Material
    rawMaterial: 'High-purity Bio-feedstock & Virgin Solvents',
    materialQuantity: 280,
    materialUnit: 'tonnes/day',
    materialType: 'Specialty Solvent Formulations',
    virginMaterialPercentage: 70,
    recycledMaterialPercentage: 30,
    supplierInfo: 'Gujarat Gas & BASF Chemical Logistics',
    
    // Waste
    wasteType: 'Organic Still Bottoms & Contaminated Glycol',
    wasteQuantity: 18.0,
    wasteUnit: 'tonnes/day',
    disposalMethod: 'External recycling',
    reusePossibilityPercentage: 55,
  },
  'DEMO003': {
    id: 'DEMO003',
    name: 'Apex Low-Carbon Cement Works',
    location: 'Chandrapur Mineral Belt, Maharashtra',
    industryType: 'Cement',
    productionProcess: 'Dry Process Clinker Calcination & Grinding',
    productionCapacity: 1400,
    capacityUnit: 'tonnes/day',
    equipment: ['Rotary Kiln', 'Cyclonic Preheater', 'Baghouse Dust Collector', 'Gas Scrubber Unit', 'Raw Material Ball Mill'],
    operatingHoursPerDay: 24,
    
    // Energy
    electricityKWhDay: 48000,
    coalTonnesDay: 45.0,
    naturalGasM3Day: 0,
    dieselLitresDay: 800,
    otherFuels: 'Refuse Derived Fuel (RDF) 15 t/day',
    renewablePercentage: 18,
    
    // Material
    rawMaterial: 'Limestone, Clay & Fly Ash Additives',
    materialQuantity: 1850,
    materialUnit: 'tonnes/day',
    materialType: 'Mineral & Industrial Byproducts',
    virginMaterialPercentage: 75,
    recycledMaterialPercentage: 25,
    supplierInfo: 'Regional Quarry & NTPC Thermal Plant Byproduct',
    
    // Waste
    wasteType: 'Cement Kiln Dust (CKD) & Flue Gas Particulates',
    wasteQuantity: 34.0,
    wasteUnit: 'tonnes/day',
    disposalMethod: 'Landfill',
    reusePossibilityPercentage: 65,
  }
};
