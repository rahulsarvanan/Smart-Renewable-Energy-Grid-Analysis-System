const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  console.log("Testing RPC sql...");
  const { data, error } = await supabase.rpc('exec_sql', { sql_query: 'select version();' });
  console.log("exec_sql (sql_query):", { data, error });

  const { data: data2, error: error2 } = await supabase.rpc('run_sql', { sql: 'select version();' });
  console.log("run_sql (sql):", { data: data2, error: error2 });
}
run();
