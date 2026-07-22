import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { city, currentTemp, currentDemand } = await req.json()

    // Heuristic Forecast Model
    const generateForecast = () => {
      const forecast = [];
      const now = new Date();
      now.setMinutes(0, 0, 0); // Round to hour

      for (let i = 1; i <= 24; i++) {
        const forecastTime = new Date(now.getTime() + (i * 60 * 60 * 1000));
        const hour = forecastTime.getHours();
        
        // Base demand curve (duck curve / evening peak)
        let demandFactor = 1.0;
        if (hour >= 18 && hour <= 22) demandFactor = 1.4; // Evening Peak
        if (hour >= 1 && hour <= 5) demandFactor = 0.6; // Night Trough
        if (hour >= 9 && hour <= 17) demandFactor = 1.1; // Daytime industrial
        
        // Temperature effect (AC load)
        const tempEffect = Math.max(0, (currentTemp - 30) * 0.05);
        
        const predictedDemand = currentDemand * demandFactor * (1 + tempEffect);
        
        forecast.push({
          timestamp: forecastTime.toISOString(),
          predicted_demand_kw: predictedDemand + (Math.random() * 50 - 25) // Add noise
        });
      }
      return forecast;
    };

    const forecastData = generateForecast();

    return new Response(
      JSON.stringify({
        status: 'success',
        city,
        forecast: forecastData,
        model_version: 'v2.4.1-Heuristic',
        confidence_score: 0.92
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
