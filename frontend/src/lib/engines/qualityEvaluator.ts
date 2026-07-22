import { DataQualityReport, TelemetryPayload } from '../../types/telemetry';

export class QualityEvaluator {
  /**
   * Calculates the Telemetry Data Quality Report (Grade A/B/C)
   * Freshness (40%), Completeness (30%), Reliability (20%), Latency (10%)
   */
  static evaluate(payload: Partial<TelemetryPayload>, current_time: Date, isFallback: boolean = false): DataQualityReport {
    // 1. Freshness Score (40%)
    const payloadTime = new Date(payload.timestamp || current_time.toISOString());
    const ageSeconds = (current_time.getTime() - payloadTime.getTime()) / 1000;
    // Score drops to 0 if older than 24 hours (86400s)
    let freshnessScore = 1.0 - Math.min(ageSeconds / 86400, 1.0);
    if (freshnessScore < 0) freshnessScore = 0;

    // 2. Completeness Score (30%)
    const requiredFields: (keyof TelemetryPayload)[] = [
      'temperature', 'humidity', 'wind_speed', 'wind_direction', 
      'cloud_cover', 'surface_pressure', 'shortwave_radiation'
    ];
    let nonNullCount = 0;
    requiredFields.forEach(field => {
      if (payload[field] !== undefined && payload[field] !== null) {
        nonNullCount++;
      }
    });
    const completenessScore = nonNullCount / requiredFields.length;

    // 3. Reliability Score (20%)
    // Fallback data has lower reliability than live OpenMeteo data
    const reliabilityScore = isFallback ? 0.7 : 0.95;

    // 4. Latency Score (10%)
    // Smooth monotonic decay: 1.0 at 0s, 0.0 at 10s+. No discontinuity.
    const latencyScore = Math.max(0, 1.0 - Math.min(ageSeconds / 10, 1.0));

    // Calculate overall score (0.0 to 1.0)
    let overallScore = (
      (freshnessScore * 0.40) +
      (completenessScore * 0.30) +
      (reliabilityScore * 0.20) +
      (latencyScore * 0.10)
    );

    // Fallback synthetic data must never exceed Grade C (0.69) so operators
    // are always visually warned when they are viewing simulated data.
    if (isFallback) overallScore = Math.min(overallScore, 0.69);

    // Assign Grade
    let grade: 'A' | 'B' | 'C' = 'C';
    if (overallScore >= 0.90) grade = 'A';
    else if (overallScore >= 0.70) grade = 'B';

    return {
      city: payload.city || 'Unknown',
      grade,
      status: isFallback ? 'Fallback Data' : 'Live Telemetry',
      freshness_score: freshnessScore,
      completeness_score: completenessScore,
      reliability_score: reliabilityScore,
      latency_score: latencyScore,
      overall_score: overallScore,
      timestamp: current_time.toISOString(),
    };
  }
}
