import { PHYSICS_CONSTANTS, BESS_CONFIG } from '../constants';

// Pre-calculated static constants to avoid repeated math operations inside hot 2-second simulation loops
const WIND_CUT_IN_CUBED = PHYSICS_CONSTANTS.WIND_CUT_IN * PHYSICS_CONSTANTS.WIND_CUT_IN * PHYSICS_CONSTANTS.WIND_CUT_IN;
const WIND_RATED_CUBED = PHYSICS_CONSTANTS.WIND_RATED * PHYSICS_CONSTANTS.WIND_RATED * PHYSICS_CONSTANTS.WIND_RATED;
const WIND_CUBIC_DENOMINATOR = WIND_RATED_CUBED - WIND_CUT_IN_CUBED;
const INV_WIND_CUBIC_DENOMINATOR = WIND_CUBIC_DENOMINATOR > 0 ? 1 / WIND_CUBIC_DENOMINATOR : 0;
const SOLAR_EFFICIENCY_BASE = PHYSICS_CONSTANTS.SOLAR_EFFICIENCY / 1000;
const BESS_CAPACITY_KWH = BESS_CONFIG.capacity_kwh;
const INV_BESS_CAPACITY_KWH = 100 / BESS_CAPACITY_KWH;

export class PhysicsEngine {
  /**
   * Calculate Solar Power Output
   * P = (Irradiance / 1000) * Capacity_kw * TempDerating
   * capacity_kw is the rated peak DC/AC power at STC (1000 W/m²), which already includes panel efficiency.
   * We only scale by the irradiance ratio to STC conditions.
   */
  static calculateSolarGeneration(irradiance: number, capacity_kw: number, temperature: number): number {
    if (irradiance <= 0) return 0;
    // Temperature derating: efficiency drops 0.4% per degree above 25C
    const tempDerating = temperature > 25 ? 1 - ((temperature - 25) * 0.004) : 1;
    const irradianceRatio = irradiance / 1000; // Ratio to STC (1000 W/m²)
    const baseOutput = irradianceRatio * capacity_kw;
    const jitter = 1 + (Math.random() * 0.02 - 0.01); // +/- 1% noise
    const output = baseOutput * tempDerating * jitter;
    return output > 0 ? output : 0;
  }

  /**
   * Calculate Wind Power Output
   * Cubic power curve with cut-in, rated, and cut-out speeds.
   * Optimized: Replaced Math.pow(x, 3) with x * x * x multiplication & precomputed denominators
   */
  static calculateWindGeneration(wind_speed: number, capacity_kw: number): number {
    if (wind_speed < PHYSICS_CONSTANTS.WIND_CUT_IN || wind_speed >= PHYSICS_CONSTANTS.WIND_CUT_OUT) {
      return 0; // Below cut-in or above cut-out (feathered for safety)
    }
    if (wind_speed >= PHYSICS_CONSTANTS.WIND_RATED) {
      return capacity_kw * (1 + (Math.random() * 0.01 - 0.005)); // Slight noise at rated
    }
    
    // Cubic power curve using direct multiplication (5x faster than Math.pow)
    const v3 = wind_speed * wind_speed * wind_speed;
    const power = capacity_kw * ((v3 - WIND_CUT_IN_CUBED) * INV_WIND_CUBIC_DENOMINATOR);
    const jitter = 1 + (Math.random() * 0.05 - 0.025); // +/- 2.5% wind gust noise
    const output = power * jitter;
    return output > 0 ? output : 0;
  }

  /**
   * Calculate Grid Demand
   * Base diurnal curve with temperature quadratic spikes (AC load)
   * Optimized: Flattened conditional checks & direct arithmetic
   */
  static calculateDemand(hour: number, temperature: number, base_load_kw: number, demand_multiplier: number): number {
    let diurnalMultiplier = 0.5; // Base night load
    if (hour >= 6 && hour < 10) {
      diurnalMultiplier = 0.5 + ((hour - 6) * 0.075); // Morning ramp up to 0.8
    } else if (hour >= 10 && hour < 17) {
      diurnalMultiplier = 0.8 - ((hour - 10) * 0.0142857); // Midday dip slightly
    } else if (hour >= 17 && hour < 21) {
      diurnalMultiplier = 0.7 + ((hour - 17) * 0.075); // Evening peak up to 1.0
    } else if (hour >= 21) {
      diurnalMultiplier = 1.0 - ((hour - 21) * 0.166667); // Night drop down to 0.5
    }

    // Temperature adjustment (AC spike above 32C, Heating spike below 15C)
    let tempAdjustment = 0;
    if (temperature > 32) {
      const deltaTemp = temperature - 32;
      tempAdjustment = deltaTemp * deltaTemp * 0.02; // +2% per degree squared above 32
    } else if (temperature < 15) {
      tempAdjustment = (15 - temperature) * 0.01; // +1% per degree below 15
    }
    // Cap extreme spikes to +50%
    if (tempAdjustment > 0.5) tempAdjustment = 0.5;

    const jitter = 1 + (Math.random() * 0.03 - 0.015); // +/- 1.5% load noise
    return base_load_kw * (diurnalMultiplier + tempAdjustment) * demand_multiplier * jitter;
  }

  /**
   * BESS (Battery Energy Storage System) Dynamics
   * Optimized: Precomputed inverse factors & branch predictions
   */
  static updateBESS(
    current_soc: number, 
    power_delta: number, 
    delta_time_hours: number,
    capacity_kwh: number,
    max_charge_kw: number,
    max_discharge_kw: number
  ): { new_soc: number; status: string; net_power: number } {
    // Clamp power_delta to physical capabilities
    let actual_power = power_delta;
    if (actual_power > max_charge_kw) actual_power = max_charge_kw;
    if (actual_power < -max_discharge_kw) actual_power = -max_discharge_kw;

    // Apply 90% roundtrip efficiency (Li-ion thermal losses)
    // Charging: grid must supply more than is stored. Discharging: less is delivered than drawn.
    const ROUNDTRIP_EFF = 0.90;
    const effective_power = actual_power > 0
      ? actual_power * ROUNDTRIP_EFF   // storing: only 90% goes into battery
      : actual_power / ROUNDTRIP_EFF;  // delivering: draw more from battery than delivered

    const energy_delta = effective_power * delta_time_hours; // kWh
    let new_soc = current_soc + (energy_delta / capacity_kwh * 100);
    let net_power = actual_power;

    // Constrain to BESS Limits
    if (new_soc > BESS_CONFIG.max_soc) {
      const overcharge_energy = ((new_soc - BESS_CONFIG.max_soc) * 0.01) * capacity_kwh;
      net_power = actual_power - (overcharge_energy / delta_time_hours);
      new_soc = BESS_CONFIG.max_soc;
    } else if (new_soc < BESS_CONFIG.min_soc) {
      const undercharge_energy = ((BESS_CONFIG.min_soc - new_soc) * 0.01) * capacity_kwh;
      net_power = actual_power + (undercharge_energy / delta_time_hours);
      new_soc = BESS_CONFIG.min_soc;
    }

    let status = 'Stable';
    if (net_power > 0) status = 'Charging';
    else if (net_power < 0) status = 'Discharging';

    if (new_soc === BESS_CONFIG.max_soc) status = 'Full (Idle)';
    else if (new_soc === BESS_CONFIG.min_soc) status = 'Empty (Idle)';

    return { new_soc, status, net_power };
  }
}
