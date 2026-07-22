const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  console.log("Checking tables...");
  
  const { data: alerts, error: alertsErr } = await supabase.from('alerts').select('*').limit(1);
  console.log("Alerts:", { data: alerts, error: alertsErr });

  const { data: anomalies, error: anomaliesErr } = await supabase.from('anomalies').select('*').limit(1);
  console.log("Anomalies:", { data: anomalies, error: anomaliesErr });

  const { data: energy_consumption, error: ecErr } = await supabase.from('energy_consumption').select('*').limit(1);
  console.log("Energy Consumption:", { data: energy_consumption, error: ecErr });
}
run();
