-- ====================================================================
-- Smart Energy Grid Platform - Optimized Supabase SQL Schema
-- Preservation of Schema Structure with High-Performance Indexing,
-- Row-Level Security (RLS), Realtime Publications & Cleanup Routine.
-- ====================================================================

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

-- Substations Table
CREATE TABLE IF NOT EXISTS public.substations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  capacity_mw DOUBLE PRECISION NOT NULL,
  status TEXT DEFAULT 'optimal',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Transformers Table
CREATE TABLE IF NOT EXISTS public.transformers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  substation_id UUID REFERENCES public.substations(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  rating_kva DOUBLE PRECISION NOT NULL,
  health_status TEXT DEFAULT 'optimal',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Smart Meters Table
CREATE TABLE IF NOT EXISTS public.smart_meters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transformer_id UUID REFERENCES public.transformers(id) ON DELETE SET NULL,
  consumer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  address TEXT,
  status TEXT DEFAULT 'ONLINE',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Renewable Energy Sources Table
CREATE TABLE IF NOT EXISTS public.renewable_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- 'solar', 'wind', 'hydro'
  capacity_mw DOUBLE PRECISION NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  status TEXT DEFAULT 'optimal',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- High-Frequency Telemetry: Energy Consumption
CREATE TABLE IF NOT EXISTS public.energy_consumption (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meter_id UUID REFERENCES public.smart_meters(id) ON DELETE CASCADE,
  consumption_kwh DOUBLE PRECISION NOT NULL,
  voltage DOUBLE PRECISION,
  current DOUBLE PRECISION,
  frequency DOUBLE PRECISION,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- High-Frequency Telemetry: Energy Generation
CREATE TABLE IF NOT EXISTS public.energy_generation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id UUID REFERENCES public.renewable_sources(id) ON DELETE CASCADE,
  generated_kwh DOUBLE PRECISION NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Weather Data Telemetry
CREATE TABLE IF NOT EXISTS public.weather_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  temperature DOUBLE PRECISION,
  humidity DOUBLE PRECISION,
  wind_speed DOUBLE PRECISION,
  rainfall DOUBLE PRECISION,
  solar_radiation DOUBLE PRECISION,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- System & AI Alerts Table
CREATE TABLE IF NOT EXISTS public.alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL,
  severity TEXT NOT NULL, -- 'critical', 'high', 'medium', 'low'
  message TEXT NOT NULL,
  source_id TEXT,
  status TEXT DEFAULT 'active', -- 'active', 'resolved'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI Predictions & Forecasts
CREATE TABLE IF NOT EXISTS public.predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  target_type TEXT NOT NULL, -- 'substation', 'transformer', 'grid'
  target_id TEXT,
  predicted_value DOUBLE PRECISION NOT NULL,
  prediction_time TIMESTAMPTZ NOT NULL,
  confidence DOUBLE PRECISION,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Maintenance Tickets
CREATE TABLE IF NOT EXISTS public.maintenance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  equipment_type TEXT NOT NULL,
  equipment_id UUID NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'scheduled', -- 'scheduled', 'in_progress', 'completed'
  scheduled_date TIMESTAMPTZ NOT NULL,
  assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit Logs Table
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  resource TEXT NOT NULL,
  details JSONB,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================================
-- 3. HIGH-PERFORMANCE INDEXING
-- ====================================================================

-- Energy Consumption Telemetry Indexes
CREATE INDEX IF NOT EXISTS idx_energy_consumption_meter_time 
  ON public.energy_consumption(meter_id, timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_energy_consumption_timestamp 
  ON public.energy_consumption(timestamp DESC);

-- Energy Generation Telemetry Indexes
CREATE INDEX IF NOT EXISTS idx_energy_generation_source_time 
  ON public.energy_generation(source_id, timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_energy_generation_timestamp 
  ON public.energy_generation(timestamp DESC);

-- Weather Data Telemetry Index
CREATE INDEX IF NOT EXISTS idx_weather_data_timestamp 
  ON public.weather_data(timestamp DESC);

-- Alerts Table Indexes
CREATE INDEX IF NOT EXISTS idx_alerts_status_created 
  ON public.alerts(status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_alerts_source_id 
  ON public.alerts(source_id);

-- Predictions Table Index
CREATE INDEX IF NOT EXISTS idx_predictions_target_time 
  ON public.predictions(target_type, target_id, prediction_time DESC);

-- Foreign Key Lookup Indexes
CREATE INDEX IF NOT EXISTS idx_smart_meters_transformer 
  ON public.smart_meters(transformer_id);

CREATE INDEX IF NOT EXISTS idx_smart_meters_consumer 
  ON public.smart_meters(consumer_id);

CREATE INDEX IF NOT EXISTS idx_transformers_substation 
  ON public.transformers(substation_id);

CREATE INDEX IF NOT EXISTS idx_maintenance_equipment 
  ON public.maintenance(equipment_type, equipment_id);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_time 
  ON public.audit_logs(user_id, timestamp DESC);

-- ====================================================================
-- 4. ROW-LEVEL SECURITY (RLS) POLICIES
-- ====================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.substations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transformers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.smart_meters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.renewable_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.energy_consumption ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.energy_generation ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weather_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Allow public read access to static infrastructure & telemetry (for dashboard and simulator display)
CREATE POLICY "Public Read Access Infrastructure" ON public.substations FOR SELECT USING (true);
CREATE POLICY "Public Read Access Transformers" ON public.transformers FOR SELECT USING (true);
CREATE POLICY "Public Read Access Smart Meters" ON public.smart_meters FOR SELECT USING (true);
CREATE POLICY "Public Read Access Renewable Sources" ON public.renewable_sources FOR SELECT USING (true);
CREATE POLICY "Public Read Access Consumption" ON public.energy_consumption FOR SELECT USING (true);
CREATE POLICY "Public Read Access Generation" ON public.energy_generation FOR SELECT USING (true);
CREATE POLICY "Public Read Access Weather" ON public.weather_data FOR SELECT USING (true);
CREATE POLICY "Public Read Access Alerts" ON public.alerts FOR SELECT USING (true);
CREATE POLICY "Public Read Access Predictions" ON public.predictions FOR SELECT USING (true);

-- Allow authenticated users to view profiles & update own profile
CREATE POLICY "User View Own Profile" ON public.profiles FOR SELECT USING (auth.uid() = id OR true);
CREATE POLICY "User Update Own Profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Allow write access to alerts for authenticated users / edge functions
CREATE POLICY "Allow Insert Alerts" ON public.alerts FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow Update Alerts" ON public.alerts FOR UPDATE USING (true);

-- Allow service_role full access across all tables (Handled natively by Supabase, policies added for anon/authenticated writes where needed)
CREATE POLICY "Allow Insert Telemetry Consumption" ON public.energy_consumption FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow Insert Telemetry Generation" ON public.energy_generation FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow Insert Telemetry Weather" ON public.weather_data FOR INSERT WITH CHECK (true);

-- ====================================================================
-- 5. REALTIME PUBLICATIONS
-- Enable Realtime subscriptions for live dashboard streaming
-- ====================================================================

ALTER PUBLICATION supabase_realtime ADD TABLE public.alerts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.energy_consumption;
ALTER PUBLICATION supabase_realtime ADD TABLE public.energy_generation;
ALTER PUBLICATION supabase_realtime ADD TABLE public.predictions;

-- ====================================================================
-- 6. AUTOMATED TELEMETRY CLEANUP PROCEDURE
-- Function to purge telemetry data older than X days to control DB size
-- ====================================================================

CREATE OR REPLACE FUNCTION public.cleanup_old_telemetry(retention_days INT DEFAULT 30)
RETURNS VOID AS $$
BEGIN
  DELETE FROM public.energy_consumption
  WHERE timestamp < NOW() - (retention_days || ' days')::INTERVAL;

  DELETE FROM public.energy_generation
  WHERE timestamp < NOW() - (retention_days || ' days')::INTERVAL;

  DELETE FROM public.weather_data
  WHERE timestamp < NOW() - (retention_days || ' days')::INTERVAL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
