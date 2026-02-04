import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function main() {
  // Check if any matches have form data
  const { data: matches } = await supabase
    .from('matches')
    .select('home_team, away_team, home_form, away_form')
    .not('home_form', 'is', null)
    .limit(5);

  if (matches && matches.length > 0) {
    console.log(`Found ${matches.length} matches with form data:`);
    for (const m of matches) {
      const home = m.home_team as any;
      const away = m.away_team as any;
      console.log(`- ${home.name} (${m.home_form}) vs ${away.name} (${m.away_form})`);
    }
  } else {
    console.log('No matches with form data found yet');
  }
}

main().catch(console.error);
