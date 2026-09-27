const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://cyber-predict-360.onrender.com';
const ML_API_BASE_URL = process.env.NEXT_PUBLIC_ML_API_URL || 'https://cyber-predict-360.onrender.com';

export interface HealthCheckResponse {
  status: string;
  service: string;
  environment: string;
  version: string;
  timestamp: string;
}

export interface DbHealthResponse {
  service: string;
  database: {
    status: string;
    postgis_enabled: boolean;
    postgis_version?: string;
    error?: string;
  };
  timestamp: string;
}

export interface MlHealthResponse {
  status: string;
  service: string;
  environment: string;
  model_status: {
    model_version: string;
    status: string;
    supported_algorithms: string[];
  };
  timestamp: string;
}

export interface LocationPrediction {
  atm_id: string;
  bank_name: string;
  address: string;
  city: string;
  hub_name: string;
  latitude: number;
  longitude: number;
  distance_km: number;
  location_probability: number;
}

export interface GraphNode {
  id: string;
  label: string;
  properties: Record<string, any>;
}

export interface GraphEdge {
  source: string;
  target: string;
  type: string;
  amount?: number;
  hop_level?: number;
}

export interface ComplaintGraphResponse {
  complaint_ack_id: string;
  total_nodes: number;
  total_edges: number;
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface GraphAnalyticsResponse {
  account_number: string;
  account_degree: number;
  connected_complaint_count: number;
  transaction_hops: number;
  connected_account_count: number;
  suspicious_cluster_indicators: string[];
  risk_assessment_notice: string;
}

export interface SupportingSignal {
  signal_name: string;
  weight: string;
  score: number;
  description: string;
}

export interface ContradictingSignal {
  signal_name: string;
  penalty: string;
  description: string;
}

export interface RedTeamChallenge {
  prediction: string;
  supporting_evidence: string[];
  contradicting_evidence: string[];
  data_quality: {
    completeness_pct: number;
    rating: string;
    missing_fields: string[];
  };
  final_confidence: number;
  alert_action: string;
  alert_action_reason: string;
  why_prediction_may_be_wrong: string[];
}

export interface PredictionResponse {
  complaint_ack_id: string;
  origin_hub: string;
  crime_category: string;
  location_predictions: LocationPrediction[];
  predicted_time_window: string;
  window_start_timestamp: string;
  window_end_timestamp: string;
  location_probability: number;
  time_probability: number;
  model_probability: number;
  operational_risk_score: number;
  confidence: number;
  prediction_convergence: number;
  risk_score: number;
  risk_level: string;
  supporting_signals: SupportingSignal[];
  contradicting_signals: ContradictingSignal[];
  auditable_config: {
    config_version: string;
    weights: Record<string, number>;
  };
  explainability: {
    top_contributing_features: any[];
    positive_contributions: any[];
    negative_contributions: any[];
    disclaimer: string;
  };
  redteam_challenge?: RedTeamChallenge;
  disclaimer: string;
}

export interface CounterfactualResponse {
  simulation_id: string;
  scenario: {
    base_complaint_ack_id: string;
    base_loss_amount: number;
    hypothetical_additional_amount: number;
    total_simulated_loss: number;
    hypothetical_extra_hops: number;
    simulated_crime_category: string;
  };
  before_prediction: PredictionResponse;
  after_prediction: PredictionResponse;
  risk_delta: {
    score_before: number;
    score_after: number;
    delta: number;
    direction: string;
  };
  changed_hotspots: any[];
  changed_time_window: {
    before: string;
    after: string;
    shift_description: string;
  };
  explanation: string;
  is_simulation: boolean;
  simulation_notice: string;
}

export async function fetchBackendHealth(): Promise<HealthCheckResponse | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/health`, { cache: 'no-store' });
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    return null;
  }
}

export async function fetchDbHealth(): Promise<DbHealthResponse | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/health/db`, { cache: 'no-store' });
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    return null;
  }
}

export async function fetchMlHealth(): Promise<MlHealthResponse | null> {
  try {
    const res = await fetch(`${ML_API_BASE_URL}/api/v1/health`, { cache: 'no-store' });
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    return null;
  }
}

export async function fetchSyntheticStats(): Promise<any> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/synthetic/stats`, { cache: 'no-store' });
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    return null;
  }
}

export async function fetchComplaints(category?: string, limit: number = 20): Promise<any[]> {
  try {
    const url = new URL(`${API_BASE_URL}/api/v1/synthetic/complaints`);
    if (category) url.searchParams.append('category', category);
    url.searchParams.append('limit', limit.toString());
    const res = await fetch(url.toString(), { cache: 'no-store' });
    if (!res.ok) return [];
    return await res.json();
  } catch (error) {
    return [];
  }
}

export async function fetchComplaintGraph(ackId: string): Promise<any> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/graph/complaint/${ackId}`, { cache: 'no-store' });
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    return null;
  }
}

export async function fetchAccountGraphAnalytics(accNo: string): Promise<any> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/graph/account/${accNo}`, { cache: 'no-store' });
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    return null;
  }
}

export async function generatePredictionForecast(payload: {
  complaint_ack_id: string;
  origin_hub: string;
  latitude: number;
  longitude: number;
  crime_category: string;
  loss_amount: number;
}): Promise<PredictionResponse | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/predictions/forecast`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    return null;
  }
}

export async function runCounterfactualSimulation(payload: {
  complaint_ack_id: string;
  origin_hub: string;
  latitude: number;
  longitude: number;
  crime_category: string;
  loss_amount: number;
  hypothetical_additional_amount: number;
  hypothetical_extra_hops?: number;
}): Promise<CounterfactualResponse | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/simulation/counterfactual`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    return null;
  }
}
