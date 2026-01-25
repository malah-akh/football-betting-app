
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://jbbexhbkdpmbwlxjyszj.supabase.co";
const supabaseKey = "sb_publishable_Qt_MaBslinuMScCXLgv6mQ_PudPH2Zc";

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkLeagues() {
  const { data, error } = await supabase
    .from('leagues')
    .select('id, name, country, external_id')
    .eq('is_active', true)
    .ilike('name', '%Champions League%');

  if (error) {
    console.error(error);
  } else {
    console.log("Leagues found:", JSON.stringify(data, null, 2));
  }
}

checkLeagues();
