import React, { createContext, useContext, useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { TelemetryPayload, DataQualityReport, SimulationState } from '../types/telemetry';
import { DataFusionEngine } from '../lib/engines/dataFusionEngine';
import { PhysicsEngine } from '../lib/engines/physicsModels';
import { FeatureStore } from '../lib/engines/featureStore';
import { RAJASTHAN_CITIES, BESS_CONFIG } from '../lib/constants';
import { syncGridStateToDatabase } from '../lib/api/telemetry';
import { isSupabaseConfigured } from '../lib/supabase';

export interface GridState {
  city: string;
  solar_kw: number;
  wind_kw: number;
  demand_kw: number;
  bess_net_kw: number;
  bess_soc: number;
  spi: number;
  wpi: number;
  dsi: number;
  rai: number;
  ahi: number;
  quality: DataQualityReport;
  telemetry: TelemetryPayload;
}

interface SimulationContextType {
  gridStates: Record<string, GridState>;
  simulationConfig: SimulationState;
  updateConfig: (updates: Partial<SimulationState>) => void;
  triggerOverride: (type: 'PEAKER' | 'SHEDDING' | 'HYPERCHARGE') => void;
}

const defaultConfig: SimulationState = {
  time_offset_seconds: 0,
  demand_multiplier: 1.0,
  solar_multiplier: 1.0,
  wind_multiplier: 1.0,
  peaker_active: false,
  demand_shedding_active: false,
  bess_mode: 'AUTO'
};

const SimulationContext = createContext<SimulationContextType | null>(null);

export const SimulationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [simulationConfig, setSimulationConfig] = useState<SimulationState>(defaultConfig);
  const [gridStates, setGridStates] = useState<Record<string, GridState>>({});
  const gridStatesRef = useRef<Record<string, GridState>>({});
  const bessSocRef = useRef<Record<string, number>>({});
  const configRef = useRef<SimulationState>(simulationConfig);
  const overrideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Keep configRef synchronized with simulationConfig state without re-running effect intervals
  useEffect(() => {
    configRef.current = simulationConfig;
  }, [simulationConfig]);

  // Initialize BESS SOC from LocalStorage or default to 50%
  useEffect(() => {
    const saved = localStorage.getItem('gridpulse_bess_state');
    if (saved) {
      try {
        bessSocRef.current = JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse saved BESS state", e);
      }
    }
    
    RAJASTHAN_CITIES.forEach(c => {
      if (bessSocRef.current[c.name] === undefined) {
        bessSocRef.current[c.name] = 50;
      }
    });
  }, []);

  const updateConfig = useCallback((updates: Partial<SimulationState>) => {
    setSimulationConfig(prev => ({ ...prev, ...updates }));
  }, []);

  const triggerOverride = useCallback((type: 'PEAKER' | 'SHEDDING' | 'HYPERCHARGE') => {
    if (type === 'PEAKER') updateConfig({ peaker_active: true });
    if (type === 'SHEDDING') updateConfig({ demand_shedding_active: true });
    if (type === 'HYPERCHARGE') updateConfig({ bess_mode: 'CHARGE' });
    
    // Clear any existing timer before setting a new one to prevent stacking
    if (overrideTimerRef.current) clearTimeout(overrideTimerRef.current);
    
    // Auto-reset overrides after 30 seconds for demo purposes
    overrideTimerRef.current = setTimeout(() => {
      if (type === 'PEAKER') updateConfig({ peaker_active: false });
      if (type === 'SHEDDING') updateConfig({ demand_shedding_active: false });
      if (type === 'HYPERCHARGE') updateConfig({ bess_mode: 'AUTO' });
      overrideTimerRef.current = null;
    }, 30000);
  }, [updateConfig]);

  // Main Persistent Simulation Loop (runs once on mount without re-subscriptions)
  useEffect(() => {
    let telemetryCache: TelemetryPayload[] = [];
    let qualityCache: DataQualityReport[] = [];

    // 5-second Data Fusion Loop
    const fetchTelemetry = async () => {
      const { payloads, qualityReports } = await DataFusionEngine.fetchTelemetry();
      telemetryCache = payloads;
      qualityCache = qualityReports;
    };
    fetchTelemetry().catch(console.error); // Initial fetch
    const fusionInterval = setInterval(() => fetchTelemetry().catch(console.error), 60000);

    // 2-second Physics Simulation Loop using configRef
    const physicsInterval = setInterval(() => {
      if (telemetryCache.length === 0) return;

      const currentConfig = configRef.current;
      const currentTime = new Date();
      // Apply time offset for fast-forwarding
      currentTime.setSeconds(currentTime.getSeconds() + currentConfig.time_offset_seconds);
      const currentHour = currentTime.getHours() + (currentTime.getMinutes() / 60) + (currentTime.getSeconds() / 3600);

      const newGridStates: Record<string, GridState> = {};

      RAJASTHAN_CITIES.forEach(cityConfig => {
        const t = telemetryCache.find(p => p.city === cityConfig.name);
        const q = qualityCache.find(r => r.city === cityConfig.name);
        if (!t || !q) return;

        // Micro-fluctuations for realism — ±3% gives visible real-time movement
        const noise = () => 1 + (Math.random() * 0.06 - 0.03);

        // Base calculations
        let solarKw = PhysicsEngine.calculateSolarGeneration(t.shortwave_radiation, cityConfig.solar_capacity_kw, t.temperature) * currentConfig.solar_multiplier * noise();
        let windKw = PhysicsEngine.calculateWindGeneration(t.wind_speed, cityConfig.wind_capacity_kw) * currentConfig.wind_multiplier * noise();
        
        // Demand Calculation
        const baseLoad = cityConfig.base_load_kw; 
        let demandKw = PhysicsEngine.calculateDemand(currentHour, t.temperature, baseLoad, currentConfig.demand_multiplier) * noise();

        // Apply Overrides
        if (currentConfig.peaker_active) {
          solarKw += 450; // Peaker boost pseudo-added to supply
        }
        if (currentConfig.demand_shedding_active) {
          demandKw *= 0.8; // 20% shedding
        }

        // Indices
        const spi = FeatureStore.calculateSPI(t);
        const wpi = FeatureStore.calculateWPI(t);
        const dsi = FeatureStore.calculateDSI(t);
        const rai = FeatureStore.calculateRAI(spi, wpi);
        const ahi = FeatureStore.calculateAHI(t.temperature, demandKw / baseLoad);

        // BESS Dynamics (2 seconds = 2/3600 hours)
        const cityBessCapacity = BESS_CONFIG.capacity_kwh / RAJASTHAN_CITIES.length;
        const cityMaxCharge = BESS_CONFIG.max_charge_rate_kw / RAJASTHAN_CITIES.length;
        const cityMaxDischarge = BESS_CONFIG.max_discharge_rate_kw / RAJASTHAN_CITIES.length;

        const netPower = solarKw + windKw - demandKw; 
        let bessDelta = 0;
        
        if (currentConfig.bess_mode === 'CHARGE') bessDelta = cityMaxCharge;
        else if (currentConfig.bess_mode === 'DISCHARGE') bessDelta = -cityMaxDischarge;
        else bessDelta = netPower; // auto balance

        const currentSoc = bessSocRef.current[cityConfig.name] || 50;
        const bessResult = PhysicsEngine.updateBESS(
          currentSoc, 
          bessDelta, 
          2/3600,
          cityBessCapacity,
          cityMaxCharge,
          cityMaxDischarge
        );
        bessSocRef.current[cityConfig.name] = bessResult.new_soc;

        newGridStates[cityConfig.name] = {
          city: cityConfig.name,
          solar_kw: solarKw,
          wind_kw: windKw,
          demand_kw: demandKw,
          bess_net_kw: bessResult.net_power,
          bess_soc: bessResult.new_soc,
          spi,
          wpi,
          dsi,
          rai,
          ahi,
          quality: q,
          telemetry: t
        };
      });

      setGridStates(newGridStates);
      gridStatesRef.current = newGridStates;
      
      // Persist BESS SOC to local storage
      localStorage.setItem('gridpulse_bess_state', JSON.stringify(bessSocRef.current));
    }, 2000);

    // 30-second Database Sync Loop
    const syncInterval = setInterval(() => {
      if (isSupabaseConfigured()) {
        const currentStates = gridStatesRef.current;
        if (Object.keys(currentStates).length > 0) {
          syncGridStateToDatabase(currentStates).catch(err => console.error("Telemetry sync failed", err));
        }
      }
    }, 30000);

    return () => {
      clearInterval(fusionInterval);
      clearInterval(physicsInterval);
      clearInterval(syncInterval);
    };
  }, []);

  const value = useMemo(() => ({
    gridStates,
    simulationConfig,
    updateConfig,
    triggerOverride
  }), [gridStates, simulationConfig, updateConfig, triggerOverride]);

  return (
    <SimulationContext.Provider value={value}>
      {children}
    </SimulationContext.Provider>
  );
};

export const useSimulation = () => {
  const context = useContext(SimulationContext);
  if (!context) throw new Error('useSimulation must be used within a SimulationProvider');
  return context;
};
