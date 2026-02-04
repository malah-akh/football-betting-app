import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function main() {
  const today = new Date().toISOString().split('T')[0];

  // Find a match with odds for today
  console.log(`Looking for matches with odds on ${today}...`);

  const { data: matches, error } = await supabase
    .from('matches')
    .select(`
      id,
      external_id,
      home_team,
      away_team,
      start_time,
      odds (*)
    `)
    .gte('start_time', `${today}T00:00:00`)
    .lte('start_time', `${today}T23:59:59`)
    .limit(50);

  if (error) {
    console.error('Error fetching matches:', error);
    return;
  }

  // Filter to matches that actually have odds
  const matchesWithOdds = matches?.filter(m => m.odds && m.odds.length > 0) || [];

  console.log(`Found ${matchesWithOdds.length} matches with odds`);

  if (matchesWithOdds.length === 0) {
    console.log('No matches with odds found for today');
    return;
  }

  // Show first few matches
  for (const m of matchesWithOdds.slice(0, 5)) {
    const homeTeam = m.home_team as any;
    const awayTeam = m.away_team as any;
    const odds = m.odds[0] as any;
    console.log(`- ${homeTeam.name} vs ${awayTeam.name} (${m.start_time})`);
    console.log(`  Odds: Home ${odds?.home_win}, Draw ${odds?.draw}, Away ${odds?.away_win}`);
  }

  // Pick first match and create a tip
  const match = matchesWithOdds[0];
  const homeTeam = match.home_team as any;
  const awayTeam = match.away_team as any;
  const odds = match.odds[0] as any;

  console.log(`\nCreating tip for: ${homeTeam.name} vs ${awayTeam.name}`);

  // Check if tip already exists
  const { data: existingTip } = await supabase
    .from('tips')
    .select('id')
    .eq('match_id', match.id)
    .single();

  if (existingTip) {
    console.log('Tip already exists for this match');
    return;
  }

  const tipData = {
    match_id: match.id,
    market: 'Match Winner',
    selection: 'HOME_WIN',
    odds: odds?.home_win || 1.5,
    stake: 3,
    confidence: 75,
    real_probability: 0.6,
    value_edge: 0.1,
    analysis: `${homeTeam.name} is favored to win this match based on current form and home advantage.`,
    is_premium: false,
    status: 'PENDING'
  };

  const { error: insertError } = await supabase
    .from('tips')
    .insert(tipData);

  if (insertError) {
    console.error('Error creating tip:', insertError);
    return;
  }

  console.log('✅ Tip created successfully!');
}

main();
