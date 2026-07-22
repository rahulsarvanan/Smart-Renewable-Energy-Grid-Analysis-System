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
    const { eventType, tempOffset, loadSurge, bessAvailability, baseDemand, baseSolar, baseWind } = await req.json()

    // Simplified Monte Carlo Simulation Logic
    const iterations = 1000;
    const results = [];

    for (let i = 0; i < iterations; i++) {
      // Add random noise based on standard normal distribution
      const u1 = Math.random();
      const u2 = Math.random();
      const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
      
      // Apply noise and scenario offsets
      const simTempOffset = tempOffset + (z0 * 2); // 2 degree std dev
      
      let simDemand = baseDemand * (1 + (loadSurge / 100));
      // Heatwave increases demand heavily
      if (eventType === 'Heatwave') simDemand *= (1 + (simTempOffset * 0.02)); 
      
      let simSolar = baseSolar;
      let simWind = baseWind;

      if (eventType === 'Monsoon') {
        simSolar *= 0.4;
        simWind *= 1.3;
      } else if (eventType === 'Sandstorm') {
        simSolar *= 0.2;
        simWind *= 0.5;
      } else if (eventType === 'Low Wind') {
        simWind *= 0.1;
      }

      // Add general noise
      simDemand *= (1 + (z0 * 0.05));
      simSolar *= (1 + (z0 * 0.08));
      simWind *= (1 + (z0 * 0.12));

      const netLoad = simDemand - (simSolar + simWind);
      
      results.push({
        netLoad,
        demand: simDemand,
        solar: simSolar,
        wind: simWind
      });
    }

    // Sort results by net load to find percentiles
    results.sort((a, b) => a.netLoad - b.netLoad);

    const p10 = results[Math.floor(iterations * 0.1)];
    const p50 = results[Math.floor(iterations * 0.5)];
    const p90 = results[Math.floor(iterations * 0.9)];

    return new Response(
      JSON.stringify({
        status: 'success',
        scenarios: {
          optimistic: p10,
          expected: p50,
          pessimistic: p90
        }
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
