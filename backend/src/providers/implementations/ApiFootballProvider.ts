import axios, { AxiosInstance } from "axios";
import { ExternalMatch, ExternalOdds, ISportsProvider } from "../types.js";

export class ApiFootballProvider implements ISportsProvider {
  private client: AxiosInstance;

  constructor(apiKey: string) {
    this.client = axios.create({
      baseURL: "https://v3.football.api-sports.io",
      headers: {
        "x-apisports-key": apiKey,
      },
    });

    // Add Response Interceptor to monitor Rate Limits
    this.client.interceptors.response.use(
      (response) => {
        const remaining = response.headers["x-ratelimit-requests-remaining"];
        const limit = response.headers["x-ratelimit-requests-limit"];
        if (remaining && parseInt(remaining) < 20) {
          console.warn(`[ApiFootballProvider] ⚠️ LOW RATE LIMIT: ${remaining}/${limit} requests remaining.`);
        }
        return response;
      },
      (error) => {
        if (error.response) {
            // Check for Rate Limit Exceeded
             if (error.response.status === 429) {
                 console.error("[ApiFootballProvider] ⛔️ RATE LIMIT EXCEEDED. Blocking calls.");
                 // We could implement a circuit breaker here
             }
             if (error.response.data && error.response.data.errors) {
                 console.error("[ApiFootballProvider] API Error Details:", JSON.stringify(error.response.data.errors));
             }
        }
        return Promise.reject(error);
      }
    );
  }

  /**
   * Check current API Quota status without consuming daily requests (status endpoint is free)
   */
  async checkQuota(): Promise<{ current: number; limit: number; remaining: number } | null> {
      try {
          const response = await this.client.get("/status");
          if (response.data && response.data.response && response.data.response.requests) {
              const { current, limit_day } = response.data.response.requests;
              return {
                  current,
                  limit: limit_day,
                  remaining: limit_day - current
              };
          }
          return null;
      } catch (error) {
          console.error("[ApiFootballProvider] Failed to check quota:", error);
          return null;
      }
  }

  async getFixture(id: number): Promise<ExternalMatch | null> {
    try {
      console.log(`[ApiFootballProvider] Fetching fixture ${id}`);
      const response = await this.client.get("/fixtures", { params: { id } });
      
      // DEBUG: Log API errors if any
      if (response.data?.errors && Object.keys(response.data.errors).length > 0) {
           console.warn(`[ApiFootballProvider] API returned errors check for ID ${id}:`, JSON.stringify(response.data.errors));
      }

      const item = response.data?.response?.[0];
      if (!item) {
          console.warn(`[ApiFootballProvider] No fixture data found for ID ${id}. Response info:`, {
              results: response.data?.results,
              paging: response.data?.paging,
              errors: response.data?.errors
          });
          return null;
      }
      
      // reuse mapping logic (simplified reuse for now) or duplicate mapping
      return {
        id: item.fixture.id,
        date: item.fixture.date,
        timestamp: item.fixture.timestamp,
        venue: {
            id: item.fixture.venue.id,
            name: item.fixture.venue.name,
            city: item.fixture.venue.city
        },
        status: {
            short: item.fixture.status.short,
            long: item.fixture.status.long,
            elapsed: item.fixture.status.elapsed
        },
        league: {
            id: item.league.id,
            name: item.league.name,
            country: item.league.country,
            logo: item.league.logo,
            season: item.league.season,
            round: item.league.round
        },
        teams: {
            home: { id: item.teams.home.id, name: item.teams.home.name, logo: item.teams.home.logo, winner: item.teams.home.winner },
            away: { id: item.teams.away.id, name: item.teams.away.name, logo: item.teams.away.logo, winner: item.teams.away.winner }
        },
        goals: item.goals,
        score: item.score,
        raw: item
      };
    } catch (e) {
      console.error(`[ApiFootballProvider] Error fetching fixture ${id}`, e);
      return null;
    }
  }

  async getFixtures(date: string, leagueId?: number): Promise<ExternalMatch[]> {
    try {
      console.log(`[ApiFootballProvider] Fetching fixtures for ${date} ${leagueId ? `(League: ${leagueId})` : ''}`);
      
      const params: any = { date };
      if (leagueId) {
          params.league = leagueId;
          // For API-Football, when filtering by league, we might also need 'season'. 
          // However, 'fixtures' endpoint usually works with date alone or date+league+season. 
          // If we provide league, we usually need season.
          // Let's current year as default season if league is present? 
          // Or API-Football allows date + league?
          // According to docs: "Get all available fixtures for a league id and a season". 
          // BUT "Get all available fixtures for a date". 
          // Can we combine date + league? Yes, "fixtures?date=2021-02-12&league=39&season=2020"
          // We need to determine the season. 
          // For simplicity, let's assume the provider handles current season logic OR we just rely on date for now?
          // If I pass league, I MUST pass season according to some docs, but let's try without first or fetch current season.
          // But wait, the date implies the season usually.
          // Let's try passing just league and see. If it fails, we default to 2025/2026 based on date.
          
          // Actually, let's look at the docs usage in this file pattern.
          // I will use 2025 as the season if league is provided, since the date is 2026...
          // Wait, date is 2026-01-24. That is likely 2025 season (2025-2026).
          const year = parseInt(date.split('-')[0]);
          // If month is before July, it's probably part of previous year's start season? 
          // Premier league starts in Aug. So Jan 2026 is 2025 season.
          // Simple logic: if month < 7, season = year - 1. Else season = year.
          const month = parseInt(date.split('-')[1]);
          const season = month < 7 ? year - 1 : year;
          params.season = season;
      }

      const response = await this.client.get("/fixtures", {
        params,
      });

      if (!response.data || !Array.isArray(response.data.response)) {
        console.error("Invalid response from API-Football", response.data);
        return [];
      }

      // Map API-Football specific response to our generic interface
      const matches: ExternalMatch[] = response.data.response.map((item: any) => ({
        id: item.fixture.id,
        date: item.fixture.date,
        timestamp: item.fixture.timestamp,
        referee: item.fixture.referee, // Extract referee
        venue: {
          id: item.fixture.venue.id,
          name: item.fixture.venue.name,
          city: item.fixture.venue.city
        },
        status: {
          short: item.fixture.status.short,
          long: item.fixture.status.long,
          elapsed: item.fixture.status.elapsed,
        },
        league: {
          id: item.league.id,
          name: item.league.name,
          country: item.league.country,
          logo: item.league.logo,
          season: item.league.season,
          flag: item.league.flag,
          round: item.league.round // Extract round
        },
        teams: {
          home: {
            id: item.teams.home.id,
            name: item.teams.home.name,
            logo: item.teams.home.logo,
            winner: item.teams.home.winner
          },
          away: {
            id: item.teams.away.id,
            name: item.teams.away.name,
            logo: item.teams.away.logo,
            winner: item.teams.away.winner
          }
        },
        goals: {
          home: item.goals.home,
          away: item.goals.away,
        },
        score: item.score,
        raw: item, // Store full object just in case
      }));

      // FALLBACK: If leagueId was provided but 0 matches found, try global fetch and filter in-memory.
      if (leagueId && matches.length === 0) {
          console.warn(`[ApiFootballProvider] ⚠️ Filter returned 0 matches for League ${leagueId}. Attempting global fetch fallback...`);
          // Recursively call getFixtures without leagueId (global fetch)
          const globalMatches = await this.getFixtures(date);
          const filtered = globalMatches.filter(m => m.league.id === leagueId);
          if (filtered.length > 0) {
             console.log(`[ApiFootballProvider] ℹ️ Global fallback found ${filtered.length} matches for League ${leagueId}`);
             return filtered;
          }
      }

      return matches;
    } catch (error) {
      console.error("Error fetching fixtures from API-Football:", error);
      throw error;
    }
  }

  async getOdds(matchId: number): Promise<ExternalOdds | null> {
    try {
      console.log(`[ApiFootballProvider] Fetching odds for ${matchId}`);
      
      const response = await this.client.get("/odds", {
        params: { fixture: matchId },
      });

      if (
        !response.data ||
        !Array.isArray(response.data.response) ||
        response.data.response.length === 0
      ) {
        return null;
      }

      const oddsData = response.data.response[0];
      const bookmaker = oddsData.bookmakers.find((b: any) => b.id === 6) || oddsData.bookmakers[0]; // Prefer Bwin (id 6) or take first

      if (!bookmaker) return null;

      const bet = bookmaker.bets.find((b: any) => b.id === 1); // 1 = Match Winner
      if (!bet) return null;

      // Extract values
      const homeOdd = bet.values.find((v: any) => v.value === "Home")?.odd;
      const drawOdd = bet.values.find((v: any) => v.value === "Draw")?.odd;
      const awayOdd = bet.values.find((v: any) => v.value === "Away")?.odd;

      if (!homeOdd || !drawOdd || !awayOdd) return null;

      return {
        matchId,
        bookmaker: { id: bookmaker.id, name: bookmaker.name },
        label: "Match Winner",
        values: {
          home: parseFloat(homeOdd),
          draw: parseFloat(drawOdd),
          away: parseFloat(awayOdd),
        },
      };
    } catch (error) {
      console.error("Error fetching odds from API-Football:", error);
      return null;
    }
  }

  async getOddsByDate(date: string, leagueId?: number): Promise<ExternalOdds[]> {
    try {
      console.log(`[ApiFootballProvider] Fetching odds for date ${date} ${leagueId ? `(League: ${leagueId})` : ''}`);
      
      const params: any = {
        date, 
        bet: 1, // Match Winner
        page: 1
      };

      if (leagueId) {
          params.league = leagueId;
          const year = parseInt(date.split('-')[0]);
          const month = parseInt(date.split('-')[1]);
          const season = month < 7 ? year - 1 : year; // Odds endpoint also typically requires season if league is present
          params.season = season;
      }
      
      console.log(`[ApiFootballProvider] Requesting odds with base params:`, JSON.stringify(params));

      let allResponses: any[] = [];
      let totalPages = 1;
      let currentPage = 1;

      do {
          if (currentPage > 1) {
            console.log(`[ApiFootballProvider] Requesting odds page ${currentPage}/${totalPages}...`);
          }
          params.page = currentPage;
          
          const response = await this.client.get("/odds", { params });
          
          if (!response.data || !Array.isArray(response.data.response)) {
              console.warn(`[ApiFootballProvider] Empty response on page ${currentPage}`);
              break;
          }

          allResponses = allResponses.concat(response.data.response);
          
          if (response.data.paging) {
              totalPages = response.data.paging.total;
          }
          currentPage++;
          
          // Safety break to prevent infinite loops or burning quota on huge days
          // Increased to 150 to accommodate "No Bookmaker Filter" which returns 1 match per item, 
          // allowing up to ~1500 matches per day (10 items/page).
          if (currentPage > 150) {
              console.warn("[ApiFootballProvider] Reached max page safety limit (150) for odds fetch.");
              break;
          }
      } while (currentPage <= totalPages);

      console.log(`[ApiFootballProvider] Retrieved ${allResponses.length} odds records across ${currentPage-1} pages.`);

      const oddsList: ExternalOdds[] = [];

      for (const item of allResponses) {
         if (item.bookmakers && item.bookmakers.length > 0) {
             // Prefer Bwin (6), then Bet365 (1), then just the first one
             const bookmaker = item.bookmakers.find((b: any) => b.id === 6) 
                            || item.bookmakers.find((b: any) => b.id === 1) 
                            || item.bookmakers[0];
             
             const bet = bookmaker.bets.find((b: any) => b.id === 1);
             
             if (bet) {
                 const homeOdd = bet.values.find((v: any) => v.value === "Home")?.odd;
                 const drawOdd = bet.values.find((v: any) => v.value === "Draw")?.odd;
                 const awayOdd = bet.values.find((v: any) => v.value === "Away")?.odd;
                 
                  if (homeOdd && drawOdd && awayOdd) {
                      oddsList.push({
                          matchId: item.fixture.id,
                          bookmaker: { id: bookmaker.id, name: bookmaker.name },
                          label: "Match Winner",
                          values: {
                             home: parseFloat(homeOdd),
                             draw: parseFloat(drawOdd),
                             away: parseFloat(awayOdd),
                          }
                      });
                  }
             }
         }
      }

      return oddsList;
    } catch (error) {
      console.error("Error fetching odds by date from API-Football:", error);
      return [];
    }
  }

  async getLeagueStandings(leagueId: number, season: number): Promise<Map<number, string>> {
     try {
         console.log(`[ApiFootballProvider] Fetching standings for League ${leagueId}, Season ${season}`);
         const response = await this.client.get("/standings", {
             params: { league: leagueId, season: season }
         });

         const formMap = new Map<number, string>();
         
         if (!response.data || !Array.isArray(response.data.response) || response.data.response.length === 0) {
             console.log(`[ApiFootballProvider] No standings found for League ${leagueId}, Season ${season}. Check if season is correct or data exists.`);
             return formMap;
         }

         const leagueData = response.data.response[0].league;
         if (leagueData && leagueData.standings) {
             // Standings can be nested arrays (groups), flatten them
             const allStandings = leagueData.standings.flat();
             for (const standing of allStandings) {
                 if (standing.team && standing.team.id && standing.form) {
                     formMap.set(standing.team.id, standing.form);
                 }
             }
         }
         
         return formMap;
     } catch (error) {
         console.error(`Error fetching standings for League ${leagueId}:`, error);
         return new Map();
     }
  }
}
