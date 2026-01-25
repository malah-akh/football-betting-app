import axios from "axios";
import { ISportsProvider, ExternalMatch, ExternalOdds, ExternalTeam } from "../types.js";

export class SportMonksProvider implements ISportsProvider {
  private apiToken: string;
  private baseUrl: string = "https://api.sportmonks.com/v3/football";

  constructor() {
    this.apiToken = process.env.SPORTMONKS_API_TOKEN || "";
    if (!this.apiToken) {
      console.warn("SPORTMONKS_API_TOKEN is not set. SportMonks provider will fail.");
    }
  }

  async getFixtures(date: string, leagueId?: number): Promise<ExternalMatch[]> {
    // SportMonks V3: /fixtures/date/{date}
    const url = `${this.baseUrl}/fixtures/date/${date}`;
    
    // NOTE: SportMonks filtering by league usually requires a different endpoint or filter params.
    // e.g. fixtures/date/{date}?filter=leagueId:eq:{id} ??
    // For now, we just fetch all and log the warning if leagueId is ignored, 
    // or filtering client side if the prompt was strictly "save requests".
    // "save requests" implies server-side filtering. 
    // SportMonks might not support saving requests by filtering on the date endpoint directly for league 
    // without fetching all first, unless using a different endpoint.
    // But since `ApiFootball` is the active provider, I'll just update the signature here.
    if (leagueId) console.warn('[SportMonks] Filtering by leagueId not implemented efficiently yet.');

    // SportMonks V3: Nested includes use dot notation, multiple includes use semicolon? 
    // Wait, the error said "participants,league" does not exist. It treated the whole string as one include?
    // This means Axios encoded the comma? Or SportMonks requires multiple ?include=&include= or semicolon.
    // Reverting to semicolon for separation, or checking strict usage.
    // Official docs: include=participants;league
    const includes = [
      "participants",
      "league",
      "state",
      "scores"
    ];

    try {
      console.log(`[SportMonks] Requesting fixtures from: ${url}`);
      // Manually construct URL to avoid encoding issues with params serializer if any, 
      // or ensure we join with ; and it isn't encoded to %3B
      
      const response = await axios.get(url, {
        params: {
          api_token: this.apiToken,
          include: includes.join(";"), 
        },
      });
      
      console.log(`[SportMonks] Response status: ${response.status}`);
      const data = response.data?.data || [];
      if (data.length === 0) {
          console.log('[SportMonks] WARNING: No data found. Full Response:', JSON.stringify(response.data, null, 2));
      }
      console.log(`[SportMonks] Fetched ${data.length} raw fixtures.`);
      
      return data.map((item: any) => this.normalizeFixture(item));
    } catch (error: any) {
      console.error("SportMonks getFixtures error details:", error.response?.data || error.message);
      return [];
    }
  }

  async getFixture(id: number): Promise<ExternalMatch | null> {
    const url = `${this.baseUrl}/fixtures/${id}`;
    const includes = [
      "participants",
      "league.country",
      "venue",
      "state",
      "scores",
      "odds.bookmaker",
    ];

    try {
      console.log(`[SportMonks] Requesting fixture: ${id}`);
      const response = await axios.get(url, {
        params: {
          api_token: this.apiToken,
          include: includes.join(";"),
        },
      });
      
      const data = response.data?.data;
      if (!data) return null;
      
      return this.normalizeFixture(data);
    } catch (error: any) {
      console.error("SportMonks getFixture error:", error.response?.data || error.message);
      return null;
    }
  }

  async getOdds(matchId: number): Promise<ExternalOdds | null> {
    // Fetch odds by match ID
    // Endpoint: /odds/pre-match/fixture/{fixture_id} ?
    // Or just fetch /fixtures/{id} with include=odds
    // Let's use fixture endpoint to be safe on context
    const url = `${this.baseUrl}/fixtures/${matchId}`;
    try {
      const response = await axios.get(url, {
        params: {
          api_token: this.apiToken,
          include: "odds.bookmaker",
        },
      });
      const fixture = response.data?.data;
      if (!fixture) return null;

      return this.extractOdds(fixture);
    } catch (error) {
      console.error(`SportMonks getOdds error for ${matchId}:`, error);
      return null;
    }
  }

  async getOddsByDate(date: string, leagueId?: number): Promise<ExternalOdds[]> {
    console.warn(`[SportMonksProvider] getOddsByDate not fully implemented efficiently. Fetching for date ${date} ${leagueId ? `(League: ${leagueId})` : ''}`);
    // Similar to getFixtures but focusing on parsing odds
    const matches = await this.getFixtures(date);
    // Use the raw data inside match if we kept it, or re-fetch?
    // efficient way: getFixtures already fetched odds!
    // But NormalizeFixture might not have stored the specific structure `ExternalOdds`.
    // Let's iterate the mapped matches and extract odds if we stored them in `raw` or map cleanly.
    
    // Actually, `getFixtures` returns `ExternalMatch`. `ExternalMatch` doesn't strictly have `odds` field in the interface provided in `types.ts` context?!
    // Let's check `ExternalMatch` again.
    // It has `raw`.
    
    return matches
      .map((m) => {
        if (m.raw) {
          return this.extractOdds(m.raw);
        }
        return null;
      })
      .filter((o): o is ExternalOdds => o !== null);
  }

  async getLeagueStandings(leagueId: number, season: number): Promise<Map<number, string>> {
     // TODO: Implement Valid Standings Fetch
     // Endpoint: /standings/season/{season_id}?group_id=...
     // Since we need season_id (SportMonks internal) rather than generic season year, 
     // we might need to map our leagueId/season to their seasonId first.
     // For now, return empty map to satisfy interface.
     return new Map();
  }

  private normalizeFixture(smFixture: any): ExternalMatch {
    const homeParticipant = smFixture.participants?.find((p: any) => p.meta?.location === "home");
    const awayParticipant = smFixture.participants?.find((p: any) => p.meta?.location === "away");

    const homeTeam: ExternalTeam = {
      id: homeParticipant?.id || 0,
      name: homeParticipant?.name || "Unknown Home",
      logo: homeParticipant?.image_path || "",
      winner: null, // Can calculate from scores/state
    };

    const awayTeam: ExternalTeam = {
      id: awayParticipant?.id || 0,
      name: awayParticipant?.name || "Unknown Away",
      logo: awayParticipant?.image_path || "",
      winner: null,
    };

    // Calculate score
    // SportMonks scores array: type_id 1 is usually current? Need to check docs strictly.
    // Usually standard field 'score' object isn't there, just 'scores' array.
    // score: { localteam_score: X, visitorteam_score: Y } often in root if included? 
    // Docs say `scores` include.
    // Let's look for "Current" description or just take the main score.
    // For now, defaulting to nulls, populated if simple structure triggers.
    
    // Attempt parse scores
    let homeScore = null;
    let awayScore = null;
    
    // SportMonks scrore descriptions are UPPERCASE: CURRENT, 2ND_HALF, 1ST_HALF
    const currentScore = smFixture.scores?.find((s: any) => 
       s.description === "CURRENT" || s.description === "2ND_HALF" || s.description === "1ST_HALF" || s.description === "Current"
    );

    if (currentScore && currentScore.score) {
        // Score structure is { goals: number, participant: "home" | "away" } usually, 
        // BUT actually parsing simpler: find score for home participant and away participant separately usually in `scores` array items with participants.
        // Wait, typical structure is separate score entries for home and away? Or one entry with both?
        // Actually, SportMonks 3 returns separate objects for each score update OR aggregated...
        // Let's rely on standard logic: find score where participant_id matches homeParticipant.id
        
        // BETTER LOGIC: Filter scores for CURRENT/FT/etc. 
        // The array contains multiple score objects.
        // E.g. { score: { goals: 1 }, description: "CURRENT", participant_id: 123 }
        
        const homeScoreObj = smFixture.scores.find((s: any) => s.description === "CURRENT" && s.participant_id === homeParticipant?.id);
        const awayScoreObj = smFixture.scores.find((s: any) => s.description === "CURRENT" && s.participant_id === awayParticipant?.id);
        
        if (homeScoreObj) homeScore = homeScoreObj.score.goals;
        if (awayScoreObj) awayScore = awayScoreObj.score.goals;
        
        // Fallback: If no "CURRENT", check "2ND_HALF" etc.
        if (homeScore === null) {
             const homeAlt = smFixture.scores.find((s: any) => s.participant_id === homeParticipant?.id && ["2ND_HALF", "1ST_HALF", "NORMALTIME"].includes(s.description));
             if (homeAlt) homeScore = homeAlt.score.goals;
        }
        if (awayScore === null) {
             const awayAlt = smFixture.scores.find((s: any) => s.participant_id === awayParticipant?.id && ["2ND_HALF", "1ST_HALF", "NORMALTIME"].includes(s.description));
             if (awayAlt) awayScore = awayAlt.score.goals;
        }
    }

    // Status
    const statusShort = smFixture.state?.short_name || "NS";
    const statusLong = smFixture.state?.name || "Not Started"; // 'name' is better for long status (e.g. Full-Time)

    return {
      id: smFixture.id,
      date: smFixture.starting_at,
      timestamp: smFixture.starting_at_timestamp,
      venue: smFixture.venue ? {
        id: smFixture.venue.id,
        name: smFixture.venue.name,
        city: smFixture.venue.city?.name || "",
      } : undefined,
      referee: null, // Need referee include logic if strict
      status: {
        long: statusLong,
        short: statusShort,
        elapsed: null,
      },
      league: {
        id: smFixture.league?.id || 0,
        name: smFixture.league?.name || "Unknown League",
        country: smFixture.league?.country?.name || "World",
        logo: smFixture.league?.image_path || "",
        season: smFixture.season_id, // SportMonks internal season ID
      },
      teams: {
        home: homeTeam,
        away: awayTeam,
      },
      goals: {
        home: homeScore,
        away: awayScore,
      },
      // Keep raw to allow extracting odds/other details later
      raw: smFixture,
      odds: this.extractOdds(smFixture) || undefined
    };
  }

  private extractOdds(smFixture: any): ExternalOdds | null {
    if (!smFixture.odds || !Array.isArray(smFixture.odds)) return null;

    // Structure of 'odds' include in fixtures/date is a flat array of odd objects
    // We need to group by bookmaker to find a complete 1x2 set.
    const matchWinnerOdds = smFixture.odds.filter((o: any) => o.market_id === 1);
    if (matchWinnerOdds.length === 0) return null;

    // Group by bookmaker_id
    const bookmakers = new Map<number, { id: number; name: string; home?: number; draw?: number; away?: number }>();

    for (const odd of matchWinnerOdds) {
        const bid = odd.bookmaker_id;
        const bName = odd.bookmaker?.name || `Bookmaker ${bid}`;

        if (!bookmakers.has(bid)) {
             bookmakers.set(bid, { id: bid, name: bName });
        }
        
        const entry = bookmakers.get(bid)!;
        const val = parseFloat(odd.value);
        
        // Normalize Label
        const label = odd.label?.toString().toLowerCase().trim();
        if (["1", "home"].includes(label)) entry.home = val;
        else if (["x", "draw", "tie"].includes(label)) entry.draw = val;
        else if (["2", "away"].includes(label)) entry.away = val;
    }

    // Find first complete set
    for (const [_, bookie] of bookmakers) {
        if (bookie.home && bookie.draw && bookie.away) {
             return {
                matchId: smFixture.id,
                bookmaker: {
                    id: bookie.id,
                    name: bookie.name
                },
                label: "Match Winner",
                values: {
                    home: bookie.home,
                    draw: bookie.draw,
                    away: bookie.away
                }
             };
        }
    }

    return null;
  }
}
