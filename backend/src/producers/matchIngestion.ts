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
        // Chunk matches to avoid Kafka Message Too Large error (Default 1MB)
        const CHUNK_SIZE = 5; 
        for (let i = 0; i < matches.length; i += CHUNK_SIZE) {
            const batch = matches.slice(i, i + CHUNK_SIZE).map((m: any) => {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const { raw, ...clean } = m; 
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
