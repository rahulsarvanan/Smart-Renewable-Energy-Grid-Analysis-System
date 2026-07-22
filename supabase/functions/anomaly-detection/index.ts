import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// In-memory cache for recent anomalies to prevent redundant API calls
const localCache = new Map<string, { result: any; timestamp: number }>();
const CACHE_TTL_MS = 30000; // 30 seconds cache TTL

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const geminiApiKey = Deno.env.get("GEMINI_API_KEY");

    if (!supabaseUrl || !supabaseKey || !geminiApiKey) {
      throw new Error("Missing environment variables (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, or GEMINI_API_KEY)");
    }

    const supabaseClient = createClient(supabaseUrl, supabaseKey);
    const body = await req.json();
    
    // We expect the payload from a Supabase Database Webhook:
    // { type: 'INSERT', table: 'energy_consumption', record: { ... } }
    const record = body.record || body;
    const { meter_id, voltage, current, frequency, consumption_kwh, timestamp } = record;

    if (!meter_id) {
      return new Response(JSON.stringify({ error: "Missing meter_id in payload" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 1. FAST RULE-BASED CHECK (Bypass Gemini for normal operations to reduce token usage and cost)
    // India grid standards: 230V nominal (±6% = 216.2V–243.8V), 50Hz (±0.5% = 49.75–50.25Hz)
    const isVoltageNormal = voltage >= 216 && voltage <= 244;
    const isFrequencyNormal = frequency >= 49.75 && frequency <= 50.25;
    const isCurrentNormal = current <= 14.5;

    if (isVoltageNormal && isFrequencyNormal && isCurrentNormal) {
      return new Response(
        JSON.stringify({
          anomaly: false,
          severity: "info",
          message: "Grid operating within normal parameters.",
          confidence: 1.0,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // 2. CHECK CACHE (Cache repeated anomalous telemetry profiles to speed up response time)
    const cacheKey = `${meter_id}:${Math.round(voltage)}:${Math.round(current)}:${Math.round(frequency)}`;
    const cached = localCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      console.log("Returning cached anomaly detection result...");
      return new Response(JSON.stringify(cached.result), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 3. CONCISE PROMPT ENGINEERING (Gemini 1.5 Flash query optimized for speed and low token count)
    // India grid: 230V nominal, 50Hz nominal
    const prompt = `Analyze Indian power grid telemetry: V=${voltage.toFixed(1)}V (nominal 230V, ±6% = 216–244V), I=${current.toFixed(1)}A, F=${frequency.toFixed(2)}Hz (nominal 50Hz, ±0.5% = 49.75–50.25Hz). Identify issues, root cause, and severity ('error' for critical faults, 'warning' for minor distortions). Return ONLY a JSON object: {"anomaly":true,"severity":"error"|"warning","message":"Brief summary and action","confidence":0.0-1.0}`;

    // Call Gemini API using direct HTTP request (more lightweight and faster than importing SDK)
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`;
    
    const response = await fetch(geminiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
        },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Gemini API error: ${errText}`);
    }

    const resJson = await response.json();
    const responseText = resJson.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!responseText) {
      throw new Error("Invalid response structure from Gemini API");
    }

    const aiResult = JSON.parse(responseText.trim());

    // 4. ACTIONABLE INSIGHTS INSERTS
    if (aiResult.anomaly) {
      // Write detected anomaly to alerts table
      const { error: alertErr } = await supabaseClient.from("alerts").insert({
        type: aiResult.severity === "error" ? "Critical Phase Imbalance" : "Harmonic Distortion Warning",
        source_id: meter_id,
        message: aiResult.message,
        severity: aiResult.severity === "error" ? "critical" : "warning",
        status: "active",
      });

      if (alertErr) {
        console.error("Failed to insert alert into Supabase:", alertErr);
      }
    }

    // Cache the result
    localCache.set(cacheKey, { result: aiResult, timestamp: Date.now() });

    return new Response(JSON.stringify(aiResult), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
