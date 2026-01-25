import { InternalMatch, InsertMatchSchema } from "../domain/schemas.js";
import { ProviderFactory } from "../providers/ProviderFactory.js";
import { supabaseAdmin } from "../utils/supabaseClient.js";

const STALE_THRESHOLD_MINUTES = 15;

export class MatchService {
  /**
   * Get matches for a specific date. 
   * Implements "Repair-on-Read": Fetches from API if DB is empty or stale.
   * @param dateStr Format YYYY-MM-DD
   */
  static async getMatchesForDate(dateStr: string): Promise<InternalMatch[]> {
    console.log(`[MatchService] Request for date: ${dateStr}`);

    // 1. Check DB first
    const { data: existingMatches, error } = await supabaseAdmin
      .from("matches")
      .select("*, odds(*)")
      .filter("start_time", "gte", `${dateStr}T00:00:00`)
      .filter("start_time", "lte", `${dateStr}T23:59:59`);

    if (error) {
      console.error("Supabase select error:", error);
      throw error;
    }
    
    console.log(`[MatchService] Found ${existingMatches?.length || 0} matches in DB`);

    // Check if we need to refresh data
    const isStale = this.checkIfStale(existingMatches);

    if (!existingMatches || existingMatches.length === 0 || isStale) {
      // Avoid fetching past dates to save requests
      if (!this.isDateTodayOrFuture(dateStr)) {
        console.log(`[MatchService] Date ${dateStr} is in the past. Skipping external fetch.`);
        return (existingMatches as InternalMatch[]) || [];
      }

      console.log(`[MatchService] Data missing or stale. Fetching from provider...`);
      return await this.repairData(dateStr, existingMatches as InternalMatch[]);
    }

    console.log(`[MatchService] Returning cached data from DB.`);
    return existingMatches as InternalMatch[];
  }

  private static checkIfStale(matches: any[] | null): boolean {
    if (!matches || matches.length === 0) return true;

    // Check if odds are missing (assuming we want odds for all matches)
    // If the first match (that hasn't started or is recently finished) has no odds, trigger refresh
    if (!matches[0].odds || matches[0].odds.length === 0) {
       console.log("[MatchService] Stale trigger: Missing odds.");
       return true;
    }

    // Check if new fields are missing (migration backfill trigger)
    // If we have matches but 'round' is missing (and we know API usually provides it), trigger refresh
    if (matches[0].round === undefined || matches[0].round === null) {
        console.log("[MatchService] Stale trigger: Missing 'round' field (schema update).");
        return true;
    }

    // Check if form data is missing (force fetch)
    // We check the first match as a sample to avoid performance hit of iterating all
    if (matches[0].home_form === null || matches[0].away_form === null) {
        console.log("[MatchService] Stale trigger: Missing form data.");
        return true;
    }

    // Check the age of the first record (assuming batch updates)
    const lastUpdate = new Date(matches[0].last_updated_at).getTime();
    const now = new Date().getTime();
    const diffMinutes = (now - lastUpdate) / 1000 / 60;

    return diffMinutes > STALE_THRESHOLD_MINUTES;
  }

  private static isDateTodayOrFuture(dateStr: string): boolean {
    const todayStr = new Date().toISOString().split("T")[0];
    return dateStr >= todayStr;
  }

  private static async repairData(dateStr: string, existingMatches: InternalMatch[] = []): Promise<InternalMatch[]> {
    const provider = ProviderFactory.getProvider();
    const externalMatches = await provider.getFixtures(dateStr);

    if (externalMatches.length === 0) {
      console.log("[MatchService] No matches found from provider.");
      return [];
    }

    // 1. Upsert Leagues first (to satisfy FK constraints)
    // Extract unique leagues using a Map
    const leaguesMap = new Map();
    externalMatches.forEach((m) => {
      if (!leaguesMap.has(m.league.id)) {
        leaguesMap.set(m.league.id, {
          external_id: m.league.id,
          name: m.league.name,
          country: m.league.country,
          logo_url: m.league.logo,
          is_active: true,
        });
      }
    });
    
    const uniqueLeagues = Array.from(leaguesMap.values());
    
    if (uniqueLeagues.length > 0) {
        console.log(`[MatchService] Upserting ${uniqueLeagues.length} leagues...`);
        // We only upsert basic info. last_form_updated_at is updated separately when we fetch form.
        const { error: leagueError } = await supabaseAdmin
            .from("leagues")
            .upsert(uniqueLeagues, { onConflict: "external_id", ignoreDuplicates: false }); // Update info but don't touch last_form_updated_at yet
        
        if (leagueError) {
            console.error("Supabase league upsert error:", leagueError);
            throw leagueError;
        }
        console.log(`[MatchService] Successfully upserted ${uniqueLeagues.length} leagues.`);
    }

    // 2. Fetch and Map Team Forms (OPTIMIZED)
    const formsMap = new Map<number, string>();
    try {
        // Check which leagues need form update (stale > 24h)
        const leagueIds = uniqueLeagues.map((l: any) => l.external_id);
        const { data: dbLeagues } = await supabaseAdmin
            .from("leagues")
            .select("external_id, last_form_updated_at")
            .in("external_id", leagueIds);

        const staleLeagues = uniqueLeagues.filter((l: any) => {
            const dbLeague = dbLeagues?.find((dbl: any) => dbl.external_id === l.external_id);
            if (!dbLeague?.last_form_updated_at) return true; // Never updated
            const diff = Date.now() - new Date(dbLeague.last_form_updated_at).getTime();
            return diff > 24 * 60 * 60 * 1000; // > 24 hours
        });

        console.log(`[MatchService] Fetching standings/form for ${staleLeagues.length} stale leagues (out of ${uniqueLeagues.length})...`);
        
        // Use staleLeagues for fetching
        const activeLeagues = staleLeagues.slice(0, 100); 
        
        const currentYear = parseInt(dateStr.split('-')[0]);
        const leagueSeasons = new Map<number, number>();
        externalMatches.forEach(m => leagueSeasons.set(m.league.id, m.league.season));

        // BATCH PROCESSING
        const BATCH_SIZE = 3; 
        const DELAY_MS = 1000;

        for (let i = 0; i < activeLeagues.length; i += BATCH_SIZE) {
            const batch = activeLeagues.slice(i, i + BATCH_SIZE);
            console.log(`[MatchService] Fetching batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(activeLeagues.length / BATCH_SIZE)}`);

            await Promise.all(batch.map(async (league) => {
                try {
                    const season = leagueSeasons.get(league.external_id) || currentYear;
                    let standings = await provider.getLeagueStandings(league.external_id, season);
                    
                    if (standings.size === 0) {
                        console.log(`[MatchService] No standings for League ${league.external_id}. Retrying with prev season.`);
                        standings = await provider.getLeagueStandings(league.external_id, season - 1);
                    }

                    standings.forEach((form, teamId) => formsMap.set(teamId, form));
                } catch (innerErr) {
                    console.error(`Failed to fetch standings for league ${league.external_id}:`, innerErr);
                }
            }));

            if (i + BATCH_SIZE < activeLeagues.length) {
                await new Promise(resolve => setTimeout(resolve, DELAY_MS));
            }
        }

        // Update last_form_updated_at for leagues we successfully fetched (or attempted)
        if (activeLeagues.length > 0) {
            const now = new Date().toISOString();
            const leagueUpdates = activeLeagues.map(l => ({
                external_id: l.external_id,
                name: l.name, // Required for upsert if not partial? Supabase upsert requires PK
                last_form_updated_at: now
            }));
            // Upsert only specialized columns if possible? No, upsert needs full row or constrained. 
            // We can just update the timestamp.
            await supabaseAdmin.from("leagues").upsert(leagueUpdates, { onConflict: "external_id" });
        }
        
        console.log(`[MatchService] Retrieved form data for ${formsMap.size} teams.`);
    } catch (err) {
        console.error("Error fetching standings:", err);
    }

    console.log(`[MatchService] Preparing to upsert ${externalMatches.length} matches...`);

    // Prepare helper Map for existing matches
    const existingMatchesMap = new Map(existingMatches.map(m => [m.external_id, m]));

    // Transform and Validate Matches
    const upsertData = externalMatches.map((m) => {
      // Logic for preserving form data if we didn't fetch it
      const newHomeForm = formsMap.get(m.teams.home.id);
      const newAwayForm = formsMap.get(m.teams.away.id);
      const existingMatch = existingMatchesMap.get(m.id);

      // If we have new form, use it. If not, fallback to existing. If neither, null.
      // NOTE: If formsMap doesn't have it, it returns undefined.
      const resolvedHomeForm = newHomeForm !== undefined ? newHomeForm : (existingMatch?.home_form || null);
      const resolvedAwayForm = newAwayForm !== undefined ? newAwayForm : (existingMatch?.away_form || null);

      const parsed = InsertMatchSchema.safeParse({
        external_id: m.id,
        start_time: m.date,
        status: m.status.short, // "NS", "FT"
        venue: m.venue,
        referee: m.referee,
        round: m.league.round,
        league_id: m.league.id,
        home_team: {
          id: m.teams.home.id,
          name: m.teams.home.name,
          logo: m.teams.home.logo,
        },
        away_team: {
          id: m.teams.away.id,
          name: m.teams.away.name,
          logo: m.teams.away.logo,
        },
        home_form: resolvedHomeForm,
        away_form: resolvedAwayForm,
        score: m.goals,
        raw_data: m,
        last_updated_at: new Date().toISOString()
      });

      if (!parsed.success) {
        console.warn(`[MatchService] Validation failed for match ${m.id}`, parsed.error);
        return null;
      }
      return parsed.data;
    }).filter((m): m is NonNullable<typeof m> => m !== null);

    if (upsertData.length === 0) return [];

    // Upsert to Supabase
    // We map 'external_id' to unique constraint to update if exists
    const { data, error } = await supabaseAdmin
      .from("matches")
      .upsert(upsertData, { onConflict: "external_id" })
      .select();

    if (error) {
      console.error("Supabase upsert error:", error);
      throw error;
    }

    // 3. Fetch and Upsert Odds (Best Effort)
    try {
        console.log(`[MatchService] Fetching odds for ${dateStr}...`);
        let oddsList = await provider.getOddsByDate(dateStr);

        // Fallback: If no odds found and we have SportMonks configured (and it's not already the primary), try it.
        const activeProvider = process.env.ACTIVE_PROVIDER || "MOCK";
        if (oddsList.length === 0 && activeProvider !== "SPORTMONKS" && process.env.SPORTMONKS_API_TOKEN) {
             console.log("[MatchService] No odds from primary provider. Falling back to SportMonks...");
             try {
                 const smProvider = ProviderFactory.create("SPORTMONKS");
                 const smOdds = await smProvider.getOddsByDate(dateStr);
                 if (smOdds.length > 0) {
                     console.log(`[MatchService] Found ${smOdds.length} odds from SportMonks fallback.`);
                     oddsList = smOdds;
                 }
             } catch (fallbackErr) {
                 console.error("[MatchService] SportMonks fallback failed:", fallbackErr);
             }
        }
        
        if (oddsList.length > 0) {
             const oddsUpsertData = oddsList.map(o => {
                  // Find internal match ID for this external match ID
                  const match = data.find((m: any) => m.external_id === o.matchId);
                  if (!match) return null;

                  return {
                      match_id: match.id,
                      provider: o.bookmaker.name,
                      home_win: o.values.home,
                      draw: o.values.draw,
                      away_win: o.values.away,
                      last_updated_at: new Date().toISOString()
                  };
             }).filter((o): o is NonNullable<typeof o> => o !== null);

             if (oddsUpsertData.length > 0) {
                 // First clean up old odds for these matches to avoid duplication if we don't have a unique constraint on (match_id, provider)
                 // actually schema.sql doesn't specify unique constraint on odds table for match+provider, 
                 // but let's assume one set of odds per match for simplicity or just insert.
                 // A better approach is usually to delete existing odds for these matches and insert new ones.
                 
                 const matchIds = oddsUpsertData.map(o => o.match_id);
                 await supabaseAdmin.from("odds").delete().in("match_id", matchIds);

                 const { error: oddsError } = await supabaseAdmin
                    .from("odds")
                    .insert(oddsUpsertData);
                 
                 if (oddsError) {
                     console.error("Supabase odds insert error:", oddsError);
                 } else {
                     console.log(`[MatchService] Upserted odds for ${oddsUpsertData.length} matches.`);
                 }
             }
        } else {
            console.log(`[MatchService] No odds found for ${dateStr}.`);
        }
    } catch (err) {
        console.error("Error fetching/saving odds:", err);
        // Don't fail the whole request just because odds failed
    }

    console.log(`[MatchService] Successfully repaired ${data.length} matches.`);
    return data as InternalMatch[];
  }
}
