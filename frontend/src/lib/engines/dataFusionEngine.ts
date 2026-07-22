import { RAJASTHAN_CITIES } from '../constants';
import { QualityEvaluator } from './qualityEvaluator';
import { TelemetryPayload, DataQualityReport } from '../../types/telemetry';

export class DataFusionEngine {
  /**
   * Fetches real-time telemetry from Open-Meteo for all Rajasthan cities in a single batched request.
   * Uses AbortController with 5-second timeout to prevent hanging connections.
   * If API fails, generates fallback simulated data based on hour of day.
   */
  static async fetchTelemetry(): Promise<{ payloads: TelemetryPayload[]; qualityReports: DataQualityReport[] }> {
    const currentTime = new Date();

    const lats = RAJASTHAN_CITIES.map(c => c.lat).join(',');
    const lons = RAJASTHAN_CITIES.map(c => c.lon).join(',');
    
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lats}&longitude=${lons}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,wind_direction_10m,cloud_cover,surface_pressure,shortwave_radiation`;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    let apiData: any = null;
    let isFallback = false;

    try {
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      apiData = await response.json();
      
      // If only one city is requested, Open-Meteo returns an object instead of an array.
      // We always request 7, so it should be an array.
      if (!Array.isArray(apiData)) {
         apiData = [apiData];
      }
    } catch (error: any) {
      clearTimeout(timeoutId);
      isFallback = true;
    }

    const payloads: TelemetryPayload[] = [];
    const qualityReports: DataQualityReport[] = [];

    RAJASTHAN_CITIES.forEach((city, index) => {
      let payload: TelemetryPayload;

      if (!isFallback && apiData && apiData[index] && apiData[index].current) {
        const data = apiData[index].current;
        payload = {
          city: city.name,
          temperature: data.temperature_2m,
          humidity: data.relative_humidity_2m,
          wind_speed: data.wind_speed_10m,
          wind_direction: data.wind_direction_10m,
          cloud_cover: data.cloud_cover,
          surface_pressure: data.surface_pressure,
          shortwave_radiation: data.shortwave_radiation,
          timestamp: data.time,
          isFallback: false
        };
      } else {
        // Fallback generator
        const hour = currentTime.getHours();
        const minutes = currentTime.getMinutes();
        const seconds = currentTime.getSeconds();
        const fractionalHour = hour + (minutes / 60) + (seconds / 3600);
        const isDaytime = hour > 6 && hour < 19;
        const simulatedIrradiance = isDaytime ? Math.max(0, Math.sin((fractionalHour - 6) * Math.PI / 13)) * 1000 : 0;
        
        // Per-city variation using lat/lon as seed
        const cityVariation = (city.lat * 7 + city.lon * 3) % 5;
        
        payload = {
          city: city.name,
          temperature: 25 - Math.cos((fractionalHour - 16) * Math.PI / 12) * 10 + cityVariation,
          humidity: 40 + Math.random() * 20,
          wind_speed: 5 + Math.random() * 10 + (cityVariation * 0.5),
          wind_direction: Math.random() * 360,
          cloud_cover: Math.random() * 50,
          surface_pressure: 1010 + Math.random() * 10,
          shortwave_radiation: simulatedIrradiance * (0.85 + Math.random() * 0.3),
          timestamp: currentTime.toISOString(),
          isFallback: true
        };
      }

      const quality = QualityEvaluator.evaluate(payload, currentTime, payload.isFallback);
      payloads.push(payload);
      qualityReports.push(quality);
    });

    return { payloads, qualityReports };
  }
}
