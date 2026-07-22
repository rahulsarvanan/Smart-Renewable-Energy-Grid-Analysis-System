import { Aedes } from 'aedes';
import { createServer } from 'http';
import ws from 'websocket-stream';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const port = 8888;
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

// Initialize Supabase client with custom fetch & options
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
  },
});

// Fixed UUIDs for deterministic & idempotent setup
const DEMO_SUBSTATION_ID = '11111111-1111-1111-1111-111111111111';
const DEMO_TRANSFORMER_ID = '22222222-2222-2222-2222-222222222222';
const DEMO_METER_1_ID = '33333333-3333-3333-3333-333333333333';
const DEMO_METER_2_ID = '44444444-4444-4444-4444-444444444444';
const DEMO_SOLAR_SOURCE_ID = '55555555-5555-5555-5555-555555555555';
const DEMO_WIND_SOURCE_ID = '66666666-6666-6666-6666-666666666666';

// Simulator State
const SMART_METERS = [];
const RENEWABLE_SOURCES = [];
let isInitialized = false;

async function fetchWeatherData() {
  try {
    const res = await fetch('https://api.open-meteo.com/v1/forecast?latitude=34.05&longitude=-118.24&current=temperature_2m,relative_humidity_2m,wind_speed_10m,precipitation,surface_pressure');
    const data = await res.json();
    if (data.current) {
      const { error } = await supabase.from('weather_data').insert({
        latitude: 34.05,
        longitude: -118.24,
        temperature: data.current.temperature_2m,
        humidity: data.current.relative_humidity_2m,
        wind_speed: data.current.wind_speed_10m,
        rainfall: data.current.precipitation,
        timestamp: new Date().toISOString()
      });
      if (error) {
        console.error('Error writing weather data:', error.message);
      } else {
        console.log('Weather data updated successfully.');
      }
    }
  } catch (error) {
    console.error('Failed to fetch weather:', error.message);
  }
}

async function setupTestData() {
  console.log("Setting up test data in Supabase...");
  
  try {
    // 1. Upsert Substation
    const { data: substation, error: subErr } = await supabase.from('substations').upsert({
      id: DEMO_SUBSTATION_ID,
      name: 'Central Substation Alpha',
      latitude: 34.0522,
      longitude: -118.2437,
      capacity_mw: 100,
      status: 'optimal'
    }, { onConflict: 'id' }).select().single();
    if (subErr) console.error("Error creating substation:", subErr.message);

    const subId = substation?.id || DEMO_SUBSTATION_ID;

    // 2. Upsert Transformer
    const { data: transformer, error: transErr } = await supabase.from('transformers').upsert({
      id: DEMO_TRANSFORMER_ID,
      substation_id: subId,
      name: 'Transformer T1',
      latitude: 34.0525,
      longitude: -118.2440,
      rating_kva: 5000,
      health_status: 'optimal'
    }, { onConflict: 'id' }).select().single();
    if (transErr) console.error("Error creating transformer:", transErr.message);

    const transId = transformer?.id || DEMO_TRANSFORMER_ID;

    // 3. Upsert Smart Meters
    const { data: meter1, error: m1Err } = await supabase.from('smart_meters').upsert({
      id: DEMO_METER_1_ID,
      transformer_id: transId,
      latitude: 34.0530,
      longitude: -118.2450,
      address: '123 Smart St, LA',
      status: 'ONLINE'
    }, { onConflict: 'id' }).select().single();
    if (m1Err) console.error("Error creating meter 1:", m1Err.message);
    if (meter1) SMART_METERS.push(meter1);

    const { data: meter2, error: m2Err } = await supabase.from('smart_meters').upsert({
      id: DEMO_METER_2_ID,
      transformer_id: transId,
      latitude: 34.0580,
      longitude: -118.2490,
      address: '456 Innovation Blvd, LA',
      status: 'ONLINE'
    }, { onConflict: 'id' }).select().single();
    if (m2Err) console.error("Error creating meter 2:", m2Err.message);
    if (meter2) SMART_METERS.push(meter2);

    // 4. Upsert Renewable Sources
    const { data: sourceSolar, error: s1Err } = await supabase.from('renewable_sources').upsert({
      id: DEMO_SOLAR_SOURCE_ID,
      name: 'Desert Solar Farm 1',
      type: 'solar',
      latitude: 34.1,
      longitude: -118.3,
      capacity_mw: 20,
      status: 'optimal'
    }, { onConflict: 'id' }).select().single();
    if (s1Err) console.error("Error creating solar source:", s1Err.message);
    if (sourceSolar) RENEWABLE_SOURCES.push(sourceSolar);

    const { data: sourceWind, error: s2Err } = await supabase.from('renewable_sources').upsert({
      id: DEMO_WIND_SOURCE_ID,
      name: 'Pacific Wind Ridge 2',
      type: 'wind',
      latitude: 34.2,
      longitude: -118.4,
      capacity_mw: 35,
      status: 'optimal'
    }, { onConflict: 'id' }).select().single();
    if (s2Err) console.error("Error creating wind source:", s2Err.message);
    if (sourceWind) RENEWABLE_SOURCES.push(sourceWind);

    isInitialized = true;
    console.log(`Test data setup complete: ${SMART_METERS.length} meters, ${RENEWABLE_SOURCES.length} renewable sources active.`);
    
    await fetchWeatherData();
  } catch (err) {
    console.error("Failed test data initialization:", err.message);
  }
}

async function startSimulator() {
  const aedes = new Aedes();
  const server = createServer();
  
  ws.createServer({ server }, aedes.handle);
  
  server.listen(port, function () {
    console.log('Aedes MQTT-WS broker listening on port', port);
  });

  await setupTestData();

  // Optimized telemetry simulation loop with batch inserts
  setInterval(async () => {
    if (!isInitialized) return;

    const mode = process.env.MODE || 'simulation';
    if (mode !== 'simulation') return;

    const timestamp = new Date().toISOString();
    const meterBatch = [];

    for (const meter of SMART_METERS) {
      const voltage = 220 + (Math.random() * 10 - 5);
      const current = 10 + (Math.random() * 5);
      const frequency = 60 + (Math.random() * 0.2 - 0.1);
      const consumption = (voltage * current) / 1000;

      const payload = {
        meter_id: meter.id,
        voltage: +voltage.toFixed(2),
        current: +current.toFixed(2),
        frequency: +frequency.toFixed(2),
        consumption_kwh: +consumption.toFixed(3),
        timestamp
      };

      meterBatch.push(payload);
      aedes.publish({ topic: `grid/meters/${meter.id}`, payload: JSON.stringify(payload) });
    }

    // High-performance batch insert for all meters in single database roundtrip
    if (meterBatch.length > 0) {
      const { error } = await supabase.from('energy_consumption').insert(meterBatch);
      if (error) console.error("Batch energy consumption insert error:", error.message);
    }

    const genBatch = [];
    const hour = new Date().getHours();

    for (const source of RENEWABLE_SOURCES) {
      let generation = 0;
      if (source.type === 'solar' && hour > 6 && hour < 18) {
        generation = Math.random() * source.capacity_mw * 1000;
      } else if (source.type === 'wind') {
        generation = Math.random() * source.capacity_mw * 1000 * 0.4;
      }

      const payload = {
        source_id: source.id,
        generated_kwh: +generation.toFixed(3),
        timestamp
      };

      genBatch.push(payload);
      aedes.publish({ topic: `grid/sources/${source.id}`, payload: JSON.stringify(payload) });
    }

    // High-performance batch insert for generation sources in single database roundtrip
    if (genBatch.length > 0) {
      const { error } = await supabase.from('energy_generation').insert(genBatch);
      if (error) console.error("Batch energy generation insert error:", error.message);
    }
  }, 5000);

  // Update weather every hour
  setInterval(fetchWeatherData, 60 * 60 * 1000);
}

startSimulator().catch(console.error);
