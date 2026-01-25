
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env vars from backend/.env
dotenv.config({ path: path.resolve(__dirname, 'backend', '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials");
  console.log("URL:", supabaseUrl);
  // console.log("Key:", supabaseKey); 
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkLeagues() {
  const { data, error } = await supabase
    .from('leagues')
    .select('id, name, country, external_id')
    .eq('is_active', true)
    .ilike('name', '%Premier League%');

  if (error) {
    console.error(error);
  } else {
    console.log("Leagues found:", JSON.stringify(data, null, 2));
  }
}

checkLeagues();
