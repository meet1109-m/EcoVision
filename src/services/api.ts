/**
 * EcoLeak / EcoVision Backend API Client
 * 
 * Provides type-safe communication between the React frontend and FastAPI backend.
 * Gracefully handles offline mode and fallback scenarios.
 */

export interface BackendHealth {
  status: string;
  database: string;
  ml_model: string;
  version: string;
  dialect?: string;
}

export interface TelemetryInput {
  timestamp?: string;
  plant_id?: string;
  process_unit_id?: string;
  equipment_id?: string;
  equipment_type?: string;
  process_type?: string;
  temperature_c?: number;
  pressure_bar?: number;
  flow_rate?: number;
  production_rate?: number;
  operating_hours?: number;
  equipment_age_years?: number;
  maintenance_due?: boolean;
  co2_ppm?: number;
  co_ppm?: number;
  nox_ppm?: number;
  so2_ppm?: number;
  voc_ppm?: number;
  ch4_ppm?: number;
  pm25_mg_m3?: number;
  fuel_or_material_type?: string;
  ambient_temperature_c?: number;
  humidity_pct?: number;
  wind_speed_m_s?: number;
  shift?: string;
  maintenance_status?: string;
  pressure_deviation_pct?: number;
  flow_deviation_pct?: number;
  temperature_deviation_pct?: number;
  emission_above_baseline_pct?: number;
  rolling_mean?: number;
  rolling_std?: number;
}

export interface FeatureImportanceItem {
  feature: string;
  importance: number;
}

export interface MLPredictionResult {
  predicted_incident_label: number;
  is_incident: boolean;
  incident_probability: number;
  class_probabilities: Record<string, number>;
  confidence: number;
  predicted_risk_class: string;
  predicted_leak_severity: string;
  predicted_risk_score: number;
  model_version: string;
}

export interface PredictResponse {
  status: string;
  plant_id: string;
  equipment_id: string;
  incident_prediction: number;
  incident_probability: number;
  is_incident: boolean;
  predicted_risk_score: number;
  predicted_risk_class: string;
  predicted_leak_severity: string;
  predicted_leak_location: string;
  confidence: number;
  ml_result?: MLPredictionResult;
  rule_signals: string[];
  feature_importance: FeatureImportanceItem[];
  model_version: string;
  prediction_id?: number | null;
  created_at?: string;
}

/**
 * Check health status of the FastAPI backend and loaded ML model.
 */
export async function checkBackendHealth(): Promise<BackendHealth | null> {
  try {
    const res = await fetch('/health', {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

/**
 * Send real-time industrial telemetry reading to FastAPI /api/v1/predict
 * for machine learning inference and anomaly detection.
 */
export async function predictIncident(
  reading: TelemetryInput,
  options: { saveReading?: boolean; savePrediction?: boolean } = {}
): Promise<PredictResponse> {
  const payload = {
    reading: {
      timestamp: reading.timestamp || new Date().toISOString().replace('Z', ''),
      plant_id: reading.plant_id || 'PLANT-A',
      process_unit_id: reading.process_unit_id || 'UNIT-01',
      equipment_id: reading.equipment_id || 'EQ-001',
      equipment_type: reading.equipment_type || 'Reactor',
      process_type: reading.process_type || 'Refining',
      temperature_c: reading.temperature_c ?? 185.0,
      pressure_bar: reading.pressure_bar ?? 14.2,
      flow_rate: reading.flow_rate ?? 130.0,
      production_rate: reading.production_rate ?? 80.0,
      operating_hours: reading.operating_hours ?? 15000.0,
      equipment_age_years: reading.equipment_age_years ?? 12.0,
      maintenance_due: reading.maintenance_due ?? false,
      co2_ppm: reading.co2_ppm ?? 4800.0,
      co_ppm: reading.co_ppm ?? 18.5,
      nox_ppm: reading.nox_ppm ?? 52.0,
      so2_ppm: reading.so2_ppm ?? 22.0,
      voc_ppm: reading.voc_ppm ?? 12.5,
      ch4_ppm: reading.ch4_ppm ?? 3.2,
      pm25_mg_m3: reading.pm25_mg_m3 ?? 14.0,
      fuel_or_material_type: reading.fuel_or_material_type || 'NaturalGas',
      ambient_temperature_c: reading.ambient_temperature_c ?? 32.0,
      humidity_pct: reading.humidity_pct ?? 55.0,
      wind_speed_m_s: reading.wind_speed_m_s ?? 3.2,
      shift: reading.shift || 'Morning',
      maintenance_status: reading.maintenance_status || 'Normal',
      pressure_deviation_pct: reading.pressure_deviation_pct ?? 12.5,
      flow_deviation_pct: reading.flow_deviation_pct ?? -8.4,
      temperature_deviation_pct: reading.temperature_deviation_pct ?? 3.2,
      emission_above_baseline_pct: reading.emission_above_baseline_pct ?? 28.0,
      rolling_mean: reading.rolling_mean ?? 14.2,
      rolling_std: reading.rolling_std ?? 1.1,
    },
    save_reading: options.saveReading ?? false,
    save_prediction: options.savePrediction ?? false,
  };

  const res = await fetch('/api/v1/predict', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Prediction request failed (${res.status}): ${errorText}`);
  }

  return await res.json();
}

/**
 * Fetch historical predictions persisted in the database.
 */
export async function getPredictionHistory(limit: number = 20): Promise<any[]> {
  try {
    const res = await fetch(`/api/v1/predictions/history?limit=${limit}`);
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

/**
 * Fetch digital twin hotspots from backend.
 */
export async function fetchBackendHotspots(): Promise<any[]> {
  try {
    const res = await fetch('/api/v1/hotspots');
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

/**
 * Fetch process readings from backend.
 */
export async function fetchBackendReadings(plantId: string = 'PLANT-A', size: number = 10): Promise<any> {
  try {
    const res = await fetch(`/readings?plant_id=${encodeURIComponent(plantId)}&size=${size}`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export interface PlantSummary {
  plant_id: string;
  name: string;
  total_equipment: number;
  active_hotspots: number;
  open_incidents: number;
  avg_risk_score: number;
  avg_co2_ppm: number;
  total_actions_pending: number;
}

export interface EmissionsSummary {
  status: string;
  plant_id: string;
  total_readings: number;
  avg_co2_ppm: number;
  avg_ch4_ppm: number;
  avg_voc_ppm: number;
  avg_pm25_mg_m3: number;
  avg_risk_score: number;
  incident_count: number;
  incident_rate_pct: number;
  critical_leak_count: number;
  total_co2e_tonnes: number;
}

export interface RecommendationItem {
  id: string;
  plant_id?: string | null;
  equipment_id?: string | null;
  title: string;
  description: string;
  co2Reduction: number;
  costReduction: number;
  environmental: number;
  economic: number;
  circularity: number;
  feasibility: number;
  isAIRecommended: boolean;
  status: string;
  created_at?: string;
  updated_at?: string;
}

export interface ActionItem {
  id: string;
  plant_id?: string | null;
  equipment_id?: string | null;
  recommendation_id?: string | null;
  title: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  impact: number;
  estimatedCost: number;
  feasibility: number;
  status: 'PENDING' | 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED';
  description: string;
  assigned_to_user_id?: number | null;
  created_at?: string;
  updated_at?: string;
}

/**
 * Fetch plant summary metrics from FastAPI /api/v1/plants/{plant_id}/summary.
 */
export async function fetchPlantSummary(plantId: string = 'PLANT-A'): Promise<PlantSummary | null> {
  try {
    const res = await fetch(`/api/v1/plants/${encodeURIComponent(plantId)}/summary`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

/**
 * Fetch aggregate emission metrics from FastAPI /api/v1/emissions/summary.
 */
export async function fetchEmissionsSummary(plantId?: string): Promise<EmissionsSummary | null> {
  try {
    const url = plantId 
      ? `/api/v1/emissions/summary?plant_id=${encodeURIComponent(plantId)}`
      : '/api/v1/emissions/summary';
    const res = await fetch(url, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

/**
 * Fetch decarbonization recommendations from FastAPI /api/v1/recommendations.
 */
export async function fetchRecommendations(plantId?: string, limit: number = 10): Promise<RecommendationItem[] | null> {
  try {
    const params = new URLSearchParams();
    if (plantId) params.append('plant_id', plantId);
    params.append('limit', String(limit));
    const res = await fetch(`/api/v1/recommendations?${params.toString()}`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

/**
 * Fetch operational actions from FastAPI /api/v1/actions.
 */
export async function fetchActions(plantId?: string, limit: number = 20): Promise<ActionItem[] | null> {
  try {
    const params = new URLSearchParams();
    if (plantId) params.append('plant_id', plantId);
    params.append('limit', String(limit));
    const res = await fetch(`/api/v1/actions?${params.toString()}`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

