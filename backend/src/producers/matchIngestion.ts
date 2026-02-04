import { ProviderFactory } from "../providers/ProviderFactory.js";
import { requestProducer, TOPICS } from "../config/redpanda.js";
import { format } from "date-fns";

export class MatchIngestionProducer {
  
  static async fetchAndPublishMatches(date: Date) {
    const dateStr = format(date, 'yyyy-MM-dd');
    // Fetch GLOBAL matches (no league filter) to ensure we get everything (e.g. Tercera RFEF)
    console.log(`[Producer] fetching matches for ${dateStr} (Global)`);

    try {
      const provider = ProviderFactory.getProvider();

      const matches = await provider.getFixtures(dateStr);

      if (matches.length > 0) {
        // Fetch form data for unique leagues
        const formCache = await this.fetchFormDataForMatches(matches, provider);

        // Chunk matches to avoid Kafka Message Too Large error (Default 1MB)
        const CHUNK_SIZE = 5;
        for (let i = 0; i < matches.length; i += CHUNK_SIZE) {
            const batch = matches.slice(i, i + CHUNK_SIZE).map((m: any) => {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const { raw, ...clean } = m;

                // Attach form data if available
                const homeTeamId = m.teams?.home?.id;
                const awayTeamId = m.teams?.away?.id;
                if (homeTeamId && formCache.has(homeTeamId)) {
                  clean.home_form = formCache.get(homeTeamId);
                }
                if (awayTeamId && formCache.has(awayTeamId)) {
                  clean.away_form = formCache.get(awayTeamId);
                }

                return clean;
            });
            const payload = {
                type: 'MATCH_UPDATE_BATCH',
                date: dateStr,
                timestamp: Date.now(),
                data: batch
            };

            await requestProducer.send({
                topic: TOPICS.MATCH_INGESTION,
                messages: [{ value: JSON.stringify(payload) }]
            });
            console.log(`[Producer] Published batch of ${batch.length} matches (Chunk ${Math.floor(i/CHUNK_SIZE) + 1})`);
        }
        console.log(`[Producer] Finished publishing ${matches.length} matches for ${dateStr}`);
      } else {
        console.log(`[Producer] No matches found for ${dateStr}`);
      }
    } catch (error) {
      console.error(`[Producer] Error fetching/publishing matches:`, error);
    }
  }

  private static async fetchFormDataForMatches(matches: any[], provider: any): Promise<Map<number, string>> {
    const formCache = new Map<number, string>();

    // Get unique league IDs with their seasons from match data
    const leagueSeasons = new Map<number, number>();
    for (const m of matches) {
      if (m.league?.id && m.league?.season) {
        leagueSeasons.set(m.league.id, m.league.season);
      }
    }

    console.log(`[Producer] Fetching form data for ${leagueSeasons.size} unique leagues...`);

    // Fetch standings for each league (limit to avoid API rate limits)
    const MAX_LEAGUES = 20; // Limit to top leagues to avoid excessive API calls
    let fetched = 0;

    for (const [leagueId, season] of leagueSeasons) {
      if (fetched >= MAX_LEAGUES) break;

      try {
        // Try fixture's season first, then season-1 (fixtures use current year, standings use season start year)
        let leagueForm = await provider.getLeagueStandings(leagueId, season);

        if (leagueForm.size === 0) {
          // Try previous season (e.g. 2025-2026 season might be stored as 2025)
          leagueForm = await provider.getLeagueStandings(leagueId, season - 1);
        }

        for (const [teamId, form] of leagueForm) {
          formCache.set(teamId, form);
        }
        fetched++;
      } catch (e) {
        // Silently skip leagues that fail (might not have standings)
      }
    }

    console.log(`[Producer] Fetched form data for ${formCache.size} teams from ${fetched} leagues`);
    return formCache;
  }

  static async fetchAndPublishLiveMatches() {
     console.log(`[Producer] fetching LIVE matches`);
     try {
         const provider = ProviderFactory.getProvider();
         // If provider support getLiveMatches
         // For now, I'll assume getMatchesByDate can facilitate this or specific method exists.
         // If not, I'll just use getMatchesByDate(today) for now as MVP.
         const todayStr = format(new Date(), 'yyyy-MM-dd');
         const allMatches = await provider.getFixtures(todayStr);
         
         const liveMatches = allMatches.filter(m =>  
            // Common short status for Live: 1H, 2H, HT, ET, P, BT (Break Time)
            ['1H', '2H', 'HT', 'ET', 'P', 'BT', 'LIVE'].includes(m.status.short)
         );

         if (liveMatches.length > 0) {
             const CHUNK_SIZE = 5;
             for (let i = 0; i < liveMatches.length; i += CHUNK_SIZE) {
                 const batch = liveMatches.slice(i, i + CHUNK_SIZE).map((m: any) => {
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    const { raw, ...clean } = m; 
                    return clean;
                 });
                 const payload = {
                     type: 'LIVE_MATCH_UPDATE',
                     timestamp: Date.now(),
                     data: batch
                 };
                 
                 await requestProducer.send({
                     topic: TOPICS.MATCH_INGESTION,
                     messages: [{ value: JSON.stringify(payload) }]
                 });
                 console.log(`[Producer] Published batch of ${batch.length} LIVE matches`);
             }
         }
     } catch (e) {
         console.error(`[Producer] Live fetch error`, e);
     }
  }

  static async fetchAndPublishMatch(matchId: number) {
      console.log(`[Producer] fetching Single Match: ${matchId}`);
      try {
          const provider = ProviderFactory.getProvider();
          const match = await provider.getFixture(matchId);
          if (match) {
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              const { raw, ...cleanMatch } = match;
              const payload = {
                  type: 'MATCH_UPDATE_BATCH', // Re-use batch type for simplicity or create specific
                  date: match.date.split('T')[0],
                  timestamp: Date.now(),
                  data: [cleanMatch]
              };
              await requestProducer.send({
                  topic: TOPICS.MATCH_INGESTION,
                  messages: [{ value: JSON.stringify(payload) }]
              });
              console.log(`[Producer] Published Match ${matchId}`);
          } else {
              console.log(`[Producer] Match ${matchId} not found`);
          }
      } catch (e) {
          console.error(`[Producer] Single fetch error`, e);
      }
  }

  static async fetchAndPublishOdds(date: Date) {
    const dateStr = format(date, 'yyyy-MM-dd');
    console.log(`[Producer] fetching ODDS for ${dateStr} (Global)`);
    try {
        const provider = ProviderFactory.getProvider();
        // Fetch Global Odds (Paginated by Provider)
        let odds = await provider.getOddsByDate(dateStr);

        if (odds.length > 0) {
            const CHUNK_SIZE = 50; // Increased chunk size for efficiency
            for (let i = 0; i < odds.length; i += CHUNK_SIZE) {
                const batch = odds.slice(i, i + CHUNK_SIZE);
                const payload = {
                    type: 'ODDS_UPDATE_BATCH',
                    date: dateStr,
                    timestamp: Date.now(),
                    data: batch
                };
                await requestProducer.send({
                    topic: TOPICS.MATCH_INGESTION,
                    messages: [{ value: JSON.stringify(payload) }]
                });
                console.log(`[Producer] Published batch of ${batch.length} ODDS (Total: ${i + batch.length}/${odds.length})`);
            }
            console.log(`[Producer] Finished publishing ${odds.length} odds for ${dateStr}`);
        } else {
             console.log(`[Producer] No ODDS found for ${dateStr}`);
        }
    } catch (e) {
        console.error(`[Producer] Odds fetch error`, e);
    }
  }
}
