export interface OpenMeteoResponse {
  current: {
    temperature_2m: number;
    relative_humidity_2m: number;
    wind_speed_10m: number;
    wind_direction_10m: number;
    cloud_cover: number;
    surface_pressure: number;
    shortwave_radiation: number;
    time: string;
  };
}

export interface TelemetryPayload {
  city: string;
  temperature: number;
  humidity: number;
  wind_speed: number;
  wind_direction: number;
  cloud_cover: number;
  surface_pressure: number;
  shortwave_radiation: number;
  timestamp: string;
  isFallback?: boolean;
}

export interface DataQualityReport {
  city: string;
  grade: 'A' | 'B' | 'C';
  freshness_score: number;
  completeness_score: number;
  reliability_score: number;
  latency_score: number;
  overall_score: number;
  timestamp: string;
}

export interface SimulationState {
  time_offset_seconds: number;
  demand_multiplier: number;
  solar_multiplier: number;
  wind_multiplier: number;
  peaker_active: boolean;
  demand_shedding_active: boolean;
  bess_mode: 'AUTO' | 'CHARGE' | 'DISCHARGE';
}
