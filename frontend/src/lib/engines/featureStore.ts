import { TelemetryPayload } from '../../types/telemetry';

export class FeatureStore {
  /**
   * Calculates the Solar Potential Index (SPI)
   * Formula: SPI = (Shortwave Radiation / 1000) * (1 - (Cloud Cover / 100))
   * Returns a value between 0.0 and 1.0
   */
  static calculateSPI(payload: TelemetryPayload): number {
    // shortwave_radiation from Open-Meteo already accounts for cloud attenuation.
    // We only normalize by 1000 W/m² (STC irradiance). No separate cloud penalty needed.
    const radiationFactor = Math.min(payload.shortwave_radiation / 1000, 1.0);
    return Math.max(0, radiationFactor);
  }

  /**
   * Calculates the Wind Potential Index (WPI)
   * Formula: WPI = (Wind Speed / 12)^3 (Capped at 1.0)
   */
  static calculateWPI(payload: TelemetryPayload): number {
    const CUT_IN = 3;    // m/s - turbine starts generating
    const RATED = 12;   // m/s - turbine at full capacity
    const CUT_OUT = 25; // m/s - turbine feathers blades for safety → output = 0
    if (payload.wind_speed < CUT_IN || payload.wind_speed >= CUT_OUT) return 0.0;
    const wpi = Math.pow(Math.min(payload.wind_speed, RATED) / RATED, 3);
    return Math.max(0, Math.min(wpi, 1.0));
  }

  /**
   * Calculates the Demand Surge Index (DSI)
   * Formula: DSI = max(0, (Temperature - 32) / 10) for cooling, or max(0, (15 - Temperature) / 10) for heating
   */
  static calculateDSI(payload: TelemetryPayload): number {
    if (payload.temperature > 32) {
      return Math.min((payload.temperature - 32) / 10, 1.0);
    } else if (payload.temperature < 15) {
      return Math.min((15 - payload.temperature) / 10, 1.0);
    }
    return 0.0;
  }

  /**
   * Calculates the Renewable Availability Index (RAI)
   * Weighted average of SPI and WPI based on typical capacity mix
   */
  static calculateRAI(spi: number, wpi: number): number {
    // Dynamic weighting based on actual installed capacity in Rajasthan
    // Total Solar: 30000 kW, Total Wind: 15500 kW → Solar is ~66%, Wind ~34%
    const SOLAR_WEIGHT = 0.66;
    const WIND_WEIGHT = 0.34;
    return (spi * SOLAR_WEIGHT) + (wpi * WIND_WEIGHT);
  }

  /**
   * Calculates Asset Health Index (AHI)
   * Based on temperature extremes and load
   */
  static calculateAHI(temperature: number, load_ratio: number): number {
    let health = 1.0;
    // Thermal stress
    if (temperature > 40) health -= (temperature - 40) * 0.05;
    else if (temperature < 5) health -= (5 - temperature) * 0.02;
    
    // Load stress
    if (load_ratio > 0.9) health -= (load_ratio - 0.9) * 0.5;
    
    return Math.max(0.0, Math.min(health, 1.0));
  }
}
