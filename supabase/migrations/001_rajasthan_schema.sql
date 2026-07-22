-- ====================================================================
-- Smart Energy Grid Platform - Rajasthan Schema
-- 19 Tables with RLS, Indexes, and Realtime Publications
-- ====================================================================

-- 0. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

-- 1. ENUMS
CREATE TYPE user_role AS ENUM (
  'Admin',
  'Utility Operator',
  'Engineer',
  'Technician',
  'Consumer'
);

-- 2. TABLES

-- Profiles Table (Linked to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  role user_role DEFAULT 'Consumer',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Weather Data Telemetry (Real-time from Open-Meteo)
CREATE TABLE IF NOT EXISTS public.weather_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city TEXT NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  temperature DOUBLE PRECISION,
  humidity DOUBLE PRECISION,
  wind_speed DOUBLE PRECISION,
  wind_direction DOUBLE PRECISION,
  cloud_cover DOUBLE PRECISION,
  surface_pressure DOUBLE PRECISION,
  shortwave_radiation DOUBLE PRECISION,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Solar Generation Data
CREATE TABLE IF NOT EXISTS public.solar_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city TEXT NOT NULL,
  generation_kw DOUBLE PRECISION NOT NULL,
  irradiance DOUBLE PRECISION,
  spi_index DOUBLE PRECISION,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Wind Generation Data
CREATE TABLE IF NOT EXISTS public.wind_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city TEXT NOT NULL,
  generation_kw DOUBLE PRECISION NOT NULL,
  wind_speed DOUBLE PRECISION,
  wpi_index DOUBLE PRECISION,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Demand Data
CREATE TABLE IF NOT EXISTS public.demand_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city TEXT NOT NULL,
  demand_kw DOUBLE PRECISION NOT NULL,
  peak_kw DOUBLE PRECISION,
  dsi_index DOUBLE PRECISION,
  temperature_adjustment_kw DOUBLE PRECISION,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Battery Storage Data (BESS)
CREATE TABLE IF NOT EXISTS public.battery_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city TEXT NOT NULL,
  soc_percent DOUBLE PRECISION NOT NULL,
  soh_percent DOUBLE PRECISION NOT NULL,
  net_power_kw DOUBLE PRECISION,
  status TEXT DEFAULT 'Stable',
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- AI Forecasts
CREATE TABLE IF NOT EXISTS public.forecasts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL, -- 'solar', 'wind', 'demand', 'carbon'
  city TEXT NOT NULL,
  predictions_json JSONB NOT NULL,
  mae DOUBLE PRECISION,
  rmse DOUBLE PRECISION,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Feature Store (Indices)
CREATE TABLE IF NOT EXISTS public.feature_store (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city TEXT NOT NULL,
  spi DOUBLE PRECISION,
  wpi DOUBLE PRECISION,
  dsi DOUBLE PRECISION,
  rai DOUBLE PRECISION,
  ahi DOUBLE PRECISION,
  quality_grade TEXT, -- 'A', 'B', 'C'
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Asset Health
CREATE TABLE IF NOT EXISTS public.asset_health (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city TEXT NOT NULL,
  asset_name TEXT NOT NULL,
  health_score DOUBLE PRECISION NOT NULL,
  temperature DOUBLE PRECISION,
  load_ratio DOUBLE PRECISION,
  fault_severity TEXT, -- 'Low', 'Medium', 'High', 'Critical'
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Operational Events
CREATE TABLE IF NOT EXISTS public.operational_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city TEXT NOT NULL,
  event_type TEXT NOT NULL,
  severity TEXT NOT NULL,
  description TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  severity TEXT NOT NULL, -- 'INFO', 'WARNING', 'CRITICAL'
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  city TEXT,
  acknowledged BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notification History
CREATE TABLE IF NOT EXISTS public.notification_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  severity TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  city TEXT,
  resolved_at TIMESTAMPTZ DEFAULT NOW()
);

-- API Health
CREATE TABLE IF NOT EXISTS public.api_health (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  api_name TEXT NOT NULL,
  status TEXT NOT NULL, -- 'Online', 'Degraded', 'Offline'
  latency_ms DOUBLE PRECISION,
  quality_score DOUBLE PRECISION,
  last_success TIMESTAMPTZ DEFAULT NOW()
);

-- Chat Sessions
CREATE TABLE IF NOT EXISTS public.chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chat Messages
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES public.chat_sessions(id) ON DELETE CASCADE,
  role TEXT NOT NULL, -- 'user', 'assistant'
  content TEXT NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Carbon Metrics
CREATE TABLE IF NOT EXISTS public.carbon_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city TEXT NOT NULL,
  carbon_intensity DOUBLE PRECISION NOT NULL,
  renewable_share DOUBLE PRECISION NOT NULL,
  co2_savings_kg DOUBLE PRECISION NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Scenario Results
CREATE TABLE IF NOT EXISTS public.scenario_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scenario_params_json JSONB NOT NULL,
  impact_json JSONB NOT NULL,
  ai_narrative TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Executive Reports
CREATE TABLE IF NOT EXISTS public.executive_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  period TEXT NOT NULL, -- 'Daily', 'Weekly', 'Monthly'
  revenue DOUBLE PRECISION NOT NULL,
  roi DOUBLE PRECISION NOT NULL,
  carbon_savings DOUBLE PRECISION NOT NULL,
  risk_score DOUBLE PRECISION NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- System Settings
CREATE TABLE IF NOT EXISTS public.system_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  category TEXT NOT NULL
);

-- ====================================================================
-- 3. HIGH-PERFORMANCE INDEXING
-- ====================================================================

CREATE INDEX IF NOT EXISTS idx_weather_data_city_time ON public.weather_data(city, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_solar_data_city_time ON public.solar_data(city, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_wind_data_city_time ON public.wind_data(city, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_demand_data_city_time ON public.demand_data(city, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_battery_data_city_time ON public.battery_data(city, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_forecasts_type_city_time ON public.forecasts(type, city, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_feature_store_city_time ON public.feature_store(city, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_status ON public.notifications(acknowledged, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_messages_session ON public.chat_messages(session_id, timestamp ASC);

-- ====================================================================
-- 4. ROW-LEVEL SECURITY (RLS) POLICIES
-- ====================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weather_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.solar_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wind_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.demand_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.battery_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forecasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feature_store ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asset_health ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.operational_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_health ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.carbon_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scenario_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.executive_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- Allow public read access to all telemetry (Simulator & Dashboard)
CREATE POLICY "Public Read Access Telemetry" ON public.weather_data FOR SELECT USING (true);
CREATE POLICY "Public Read Access Solar" ON public.solar_data FOR SELECT USING (true);
CREATE POLICY "Public Read Access Wind" ON public.wind_data FOR SELECT USING (true);
CREATE POLICY "Public Read Access Demand" ON public.demand_data FOR SELECT USING (true);
CREATE POLICY "Public Read Access Battery" ON public.battery_data FOR SELECT USING (true);
CREATE POLICY "Public Read Access Forecasts" ON public.forecasts FOR SELECT USING (true);
CREATE POLICY "Public Read Access Feature Store" ON public.feature_store FOR SELECT USING (true);
CREATE POLICY "Public Read Access Asset Health" ON public.asset_health FOR SELECT USING (true);
CREATE POLICY "Public Read Access Notifications" ON public.notifications FOR SELECT USING (true);
CREATE POLICY "Public Read Access API Health" ON public.api_health FOR SELECT USING (true);
CREATE POLICY "Public Read Access Carbon" ON public.carbon_metrics FOR SELECT USING (true);

-- Allow simulator to write telemetry anonymously (in production, use Service Role)
CREATE POLICY "Anon Write Telemetry" ON public.weather_data FOR INSERT WITH CHECK (true);
CREATE POLICY "Anon Write Solar" ON public.solar_data FOR INSERT WITH CHECK (true);
CREATE POLICY "Anon Write Wind" ON public.wind_data FOR INSERT WITH CHECK (true);
CREATE POLICY "Anon Write Demand" ON public.demand_data FOR INSERT WITH CHECK (true);
CREATE POLICY "Anon Write Battery" ON public.battery_data FOR INSERT WITH CHECK (true);
CREATE POLICY "Anon Write Features" ON public.feature_store FOR INSERT WITH CHECK (true);
CREATE POLICY "Anon Write Notifications" ON public.notifications FOR INSERT WITH CHECK (true);
CREATE POLICY "Anon Update Notifications" ON public.notifications FOR UPDATE USING (true);

-- ====================================================================
-- 5. REALTIME PUBLICATIONS
-- ====================================================================

-- Drop existing publication if modifying
DROP PUBLICATION IF EXISTS supabase_realtime;
CREATE PUBLICATION supabase_realtime FOR TABLE 
  public.weather_data, 
  public.solar_data, 
  public.wind_data, 
  public.demand_data, 
  public.battery_data, 
  public.forecasts, 
  public.feature_store, 
  public.notifications,
  public.api_health,
  public.chat_messages;
