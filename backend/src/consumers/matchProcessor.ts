import { responseConsumer, TOPICS } from "../config/redpanda.js";
import { supabaseAdmin } from "../utils/supabaseClient.js";

// TODO: In production, import types from a shared types file
// For MVP, we use 'any' where schema is loose or assume provider shape.

export async function matchProcessor() {
  console.log('🎧 Match Processor started');
  
  await responseConsumer.subscribe({ topic: TOPICS.MATCH_INGESTION, fromBeginning: false });

  await responseConsumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      try {
        if (!message.value) return;
        
        const payload = JSON.parse(message.value.toString());
        console.log(`[Processor] Received ${payload.type} with ${payload.data.length} items`);

        if (payload.type === 'MATCH_UPDATE_BATCH' || payload.type === 'LIVE_MATCH_UPDATE') {
          await processMatchBatch(payload.data);
        } else if (payload.type === 'ODDS_UPDATE_BATCH') {
          await processOddsBatch(payload.data);
        }
        
      } catch (error) {
        console.error('[Processor] Messsage processing error:', error);
      }
    },
  });
}

async function processMatchBatch(matches: any[]) {
    if (!matches.length) return;

    // 0. Upsert Leagues to satisfy FK constraints
    const leaguesMap = new Map();
    matches.forEach((m) => {
      if (m.league && m.league.id && !leaguesMap.has(m.league.id)) {
        leaguesMap.set(m.league.id, {
          external_id: m.league.id,
          name: m.league.name,
          country: m.league.country,
          logo_url: m.league.logo,
          is_active: true,
          // We can set last_updated or other fields if needed
        });
      }
    });

    if (leaguesMap.size > 0) {
        const uniqueLeagues = Array.from(leaguesMap.values());
        
        const { error: leagueError } = await supabaseAdmin
            .from('leagues')
            .upsert(uniqueLeagues, { onConflict: 'external_id' })
            .select();
        
        if (leagueError) {
             console.error('[Processor] ❌ League upsert error:', leagueError);
        } 
    }

    // 1. Transform External Match to DB Schema
    // We Map external structure to our DB structure
    // This mapping depends on ProviderFactory default provider output (ApiFootballProvider usually).
    
    // We assume the shape matches 'ExternalMatch' from types.ts approximately
    const upsertPayloads = matches.map(m => {
        const payload: any = {
            external_id: m.id,
            start_time: m.date,
            status: m.status.short, // e.g. "FT", "LIVE"
            venue: typeof m.venue === 'string' ? { name: m.venue } : m.venue, // JSONB
            home_team: m.teams.home, // JSONB
            away_team: m.teams.away, // JSONB
            score: m.score, // JSONB
            referee: m.referee,
            league_id: m.league.id, // We assume league exists or we might fail FK
            // Don't update 'analysis' or 'tips' here, strictly data sync
            last_updated_at: new Date().toISOString()
        };
        
        // Only update form if provided (undefined means ignore)
        if (m.home_form !== undefined) payload.home_form = m.home_form;
        if (m.away_form !== undefined) payload.away_form = m.away_form;
        
        return payload;
    });

    // 2. Upsert Matches
    const { data: savedMatches, error: matchError } = await supabaseAdmin
        .from('matches')
        .upsert(upsertPayloads, { onConflict: 'external_id' })
        .select('id, external_id');

    if (matchError) {
        console.error('[Processor] Match upsert error:', matchError);
         // If error is FK constraint on league, we might need to ingest leagues first.
         // For MVP, logging is sufficient.
         return;
    } else {
        console.log(`[Processor] Successfully updated ${matches.length} matches`);
    }

    // 3. Upsert Odds (if available in payload)
    if (savedMatches && savedMatches.length > 0) {
        const oddsPayloads: any[] = [];
        const savedMatchesMap = new Map(savedMatches.map((m: any) => [m.external_id, m.id]));

        for (const m of matches) {
            if (m.odds && savedMatchesMap.has(m.id)) {
                oddsPayloads.push({
                    match_id: savedMatchesMap.get(m.id),
                    provider: m.odds.bookmaker?.name || "Unknown",
                    home_win: m.odds.values?.home,
                    draw: m.odds.values?.draw,
                    away_win: m.odds.values?.away,
                    updated_at: new Date().toISOString()
                });
            }
        }

        if (oddsPayloads.length > 0) {
            // Remove existing odds for these matches to avoid duplicates (assuming simplistic schema)
            const matchIds = oddsPayloads.map(o => o.match_id);
            await supabaseAdmin.from('odds').delete().in('match_id', matchIds);

            const { error: oddsError } = await supabaseAdmin
                .from('odds')
                .insert(oddsPayloads);

             if (oddsError) {
                 console.error('[Processor] Odds insert error:', oddsError);
             } else {
                 console.log(`[Processor] Upserted odds for ${oddsPayloads.length} matches`);
             }
        }
    }
}

async function processOddsBatch(oddsList: any[]) {
    if (!oddsList.length) return;

    // 1. Get Match UUIDs for these external IDs
    const externalIds = oddsList.map(o => o.matchId);
    
    // Chunking might be needed if too many IDs, but batch size is small (5-10)
    const { data: matches, error: matchError } = await supabaseAdmin
        .from('matches')
        .select('id, external_id')
        .in('external_id', externalIds);

    if (matchError || !matches) {
        console.error('[Processor] Error fetching matching UUIDs for odds:', matchError);
        return;
    }

    // Map external_id -> uuid
    const matchMap = new Map<number, string>();
    matches.forEach(m => matchMap.set(m.external_id, m.id));

    const oddsPayloads = [];
    
    for (const odd of oddsList) {
        const uuid = matchMap.get(odd.matchId);
        if (uuid) {
            oddsPayloads.push({
                match_id: uuid,
                provider: 'API_FOOTBALL', // or odd.bookmaker.name
                home_win: odd.values.home,
                draw: odd.values.draw,
                away_win: odd.values.away,
                updated_at: new Date().toISOString()
            });
        }
    }

    if (oddsPayloads.length === 0) return;

    // 2. Upsert Odds
    // Using simple approach: delete old odds for these matches, then insert.
    const matchUuids = oddsPayloads.map(o => o.match_id);
    
    // We only delete odds from this provider ideally, but for now assuming one main provider
    await supabaseAdmin
        .from('odds')
        .delete()
        .in('match_id', matchUuids); 

    const { error } = await supabaseAdmin
        .from('odds')
        .insert(oddsPayloads);

    if (error) {
        console.error('[Processor] Odds insert error:', error);
    } else {
        console.log(`[Processor] Successfully processed odds batch for ${oddsPayloads.length} matches`);
    }
}
