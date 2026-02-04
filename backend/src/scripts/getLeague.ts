import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function main() {
  const { data } = await supabase
    .from('tips')
    .select('matches(home_team, away_team, leagues(name, country))')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  const match = (data as any)?.matches;
  if (match) {
    console.log(`${match.home_team.name} vs ${match.away_team.name}`);
    console.log(`League: ${match.leagues?.name || 'Unknown'} (${match.leagues?.country || 'Unknown'})`);
  }
}

main();
