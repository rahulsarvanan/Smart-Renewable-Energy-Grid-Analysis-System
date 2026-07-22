import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { ChatGoogleGenerativeAI } from 'npm:@langchain/google-genai'
import { HumanMessage, SystemMessage } from 'npm:@langchain/core/messages'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { query, city } = await req.json()

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error("Missing Authorization header")
    }

    // Initialize Supabase Client using Service Role to bypass RLS for telemetry reads
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    const supabase = createClient(supabaseUrl, supabaseKey)

    // We skip strict JWT verification for the demo dashboard to ensure Copilot works
    // even if the user skipped login or uses anonymous sessions.

    // Fetch latest context for the requested city (or state-wide if null)
    let gridContext = "Current Grid Status:\n";
    if (city) {
      const { data } = await supabase.from('feature_store').select('*').eq('city', city).order('timestamp', { ascending: false }).limit(1).single();
      const { data: solar } = await supabase.from('solar_data').select('*').eq('city', city).order('timestamp', { ascending: false }).limit(1).single();
      const { data: wind } = await supabase.from('wind_data').select('*').eq('city', city).order('timestamp', { ascending: false }).limit(1).single();
      const { data: demand } = await supabase.from('demand_data').select('*').eq('city', city).order('timestamp', { ascending: false }).limit(1).single();
      
      gridContext += `City: ${city}\n`;
      gridContext += `Solar Generation: ${solar?.generation_kw || 0} kW\n`;
      gridContext += `Wind Generation: ${wind?.generation_kw || 0} kW\n`;
      gridContext += `Demand: ${demand?.demand_kw || 0} kW\n`;
      gridContext += `Asset Health Index: ${data?.ahi || 'N/A'}\n`;
    } else {
      gridContext += "State-wide query context required. Ensure you specify a city for precise telemetry.\n";
    }

    const apiKey = Deno.env.get('GEMINI_API_KEY');
    if (!apiKey) throw new Error("Missing Gemini API Key");

    const chat = new ChatGoogleGenerativeAI({
      modelName: "gemini-1.5-pro",
      maxOutputTokens: 2048,
      apiKey: apiKey,
    });

    const systemPrompt = `You are the AI Copilot for the Rajasthan Smart Energy Grid Operations Center.
You assist human operators with grid balancing, predictive maintenance, and scenario analysis.
Use the following real-time telemetry to inform your answers:
${gridContext}

Provide concise, analytical, and professional responses. Use metric units (MW/kW) and summarize clearly.`;

    const response = await chat.invoke([
      new SystemMessage(systemPrompt),
      new HumanMessage(query)
    ]);

    return new Response(
      JSON.stringify({ response: response.content }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  } catch (error: any) {
    console.error("Copilot Error:", error.message, error.stack);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
