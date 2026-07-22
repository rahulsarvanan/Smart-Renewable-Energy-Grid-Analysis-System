import { supabase } from '../supabase';
import { GridState } from '../../contexts/SimulationContext';

/**
 * Persists a snapshot of the current grid state to the Supabase database.
 * We batch insert the data for all cities at once to reduce API calls.
 */
export const syncGridStateToDatabase = async (gridStates: Record<string, GridState>) => {
  if (Object.keys(gridStates).length === 0) return;

  const timestamp = new Date().toISOString();
  
  // 1. Prepare Solar Data
  const solarData = Object.values(gridStates).map(state => ({
    city: state.city,
    generation_kw: state.solar_kw,
    irradiance: state.telemetry.shortwave_radiation,
    spi_index: state.spi,
    timestamp
  }));

  // 2. Prepare Wind Data
  const windData = Object.values(gridStates).map(state => ({
    city: state.city,
    generation_kw: state.wind_kw,
    wind_speed: state.telemetry.wind_speed,
    wpi_index: state.wpi,
    timestamp
  }));

  // 3. Prepare Demand Data
  const demandData = Object.values(gridStates).map(state => ({
    city: state.city,
    demand_kw: state.demand_kw,
    dsi_index: state.dsi,
    temperature_adjustment_kw: 0, // We could calculate this from the engine, omitted for simplicity
    timestamp
  }));

  // 4. Prepare Battery Data
  const batteryData = Object.values(gridStates).map(state => ({
    city: state.city,
    net_power_kw: state.bess_net_kw,
    soc_percent: state.bess_soc,
    soh_percent: 100, // Health degrades over months/years, fixed at 100 for now
    status: state.bess_net_kw > 0 ? 'Charging' : state.bess_net_kw < 0 ? 'Discharging' : 'Idle',
    timestamp
  }));

  // 5. Prepare Feature Store / Quality
  const featureData = Object.values(gridStates).map(state => ({
    city: state.city,
    spi: state.spi,
    wpi: state.wpi,
    dsi: state.dsi,
    rai: state.rai,
    ahi: 1.0, // Calculated elsewhere
    quality_grade: state.quality.grade,
    timestamp
  }));

  // Execute Batch Inserts using Promise.allSettled to not fail the whole batch if one table fails
  await Promise.allSettled([
    supabase.from('solar_data').insert(solarData),
    supabase.from('wind_data').insert(windData),
    supabase.from('demand_data').insert(demandData),
    supabase.from('battery_data').insert(batteryData),
    supabase.from('feature_store').insert(featureData),
  ]);
};

/**
 * Logs an operator override or mitigation action to the database for audit trailing.
 */
export const logOperatorAction = async (actionType: string, targetNode: string, details: string) => {
  try {
    await supabase.from('operator_actions' as any).insert([{
      action_type: actionType,
      target_node: targetNode,
      details
    }]);
  } catch (error) {
    console.error("Failed to log operator action:", error);
  }
};

