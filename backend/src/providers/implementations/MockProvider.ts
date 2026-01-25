import { ExternalMatch, ExternalOdds, ISportsProvider } from "../types.js";

export class MockProvider implements ISportsProvider {
  async getFixture(id: number): Promise<ExternalMatch | null> {
    console.log(`[MockProvider] Fetching fixture: ${id}`);
    await new Promise((resolve) => setTimeout(resolve, 500));
    // Return a dummy match with requested ID
    return {
        id: id,
        date: new Date().toISOString(),
        timestamp: Date.now() / 1000,
        status: { short: "NS", long: "Not Started" },
        league: {
          id: 39,
          name: "Premier League",
          country: "England",
          logo: "https://media.api-sports.io/football/leagues/39.png",
          season: 2023,
        },
        teams: {
          home: { id: 33, name: "Manchester United", logo: "https://media.api-sports.io/football/teams/33.png" },
          away: { id: 40, name: "Liverpool", logo: "https://media.api-sports.io/football/teams/40.png" },
        },
        goals: { home: null, away: null },
    };
  }

  async getFixtures(date: string, leagueId?: number): Promise<ExternalMatch[]> {
    console.log(`[MockProvider] Fetching fixtures for date: ${date} ${leagueId ? `League: ${leagueId}` : ''}`);
    
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Return some dummy data
    return [
      {
        id: 1001,
        date: `${date}T19:45:00+00:00`,
        timestamp: new Date(`${date}T19:45:00+00:00`).getTime() / 1000,
        status: { short: "NS", long: "Not Started" },
        league: {
          id: 39,
          name: "Premier League",
          country: "England",
          logo: "https://media.api-sports.io/football/leagues/39.png",
          season: 2023,
        },
        teams: {
          home: { id: 33, name: "Manchester United", logo: "https://media.api-sports.io/football/teams/33.png" },
          away: { id: 40, name: "Liverpool", logo: "https://media.api-sports.io/football/teams/40.png" },
        },
        goals: { home: null, away: null },
      },
      {
        id: 1002,
        date: `${date}T20:00:00+00:00`,
        timestamp: new Date(`${date}T20:00:00+00:00`).getTime() / 1000,
        status: { short: "FT", long: "Match Finished" },
        league: {
          id: 140,
          name: "La Liga",
          country: "Spain",
          logo: "https://media.api-sports.io/football/leagues/140.png",
          season: 2023,
        },
        teams: {
          home: { id: 529, name: "Barcelona", logo: "https://media.api-sports.io/football/teams/529.png", winner: true },
          away: { id: 541, name: "Real Madrid", logo: "https://media.api-sports.io/football/teams/541.png", winner: false },
        },
        goals: { home: 2, away: 1 },
      },
    ];
  }

  async getOdds(matchId: number): Promise<ExternalOdds | null> {
    return {
      matchId,
      bookmaker: { id: 6, name: "Bwin" },
      label: "Match Winner",
      values: { home: 1.5, draw: 3.2, away: 4.0 },
    };
  }

  async getOddsByDate(date: string, leagueId?: number): Promise<ExternalOdds[]> {
     console.log(`[MockProvider] Generating mock odds for ${date} ${leagueId ? `(League: ${leagueId})` : ''}`);
     // Return dummy odds for the dummy matches 1001 and 1002
     return [
       {
         matchId: 1001,
         bookmaker: { id: 6, name: "Bwin" },
         label: "Match Winner",
         values: { home: 2.1, draw: 3.4, away: 3.1 },
       },
       {
         matchId: 1002,
         bookmaker: { id: 6, name: "Bwin" },
         label: "Match Winner",
         values: { home: 1.8, draw: 3.8, away: 4.2 },
       },
     ];
  }

  async getLeagueStandings(leagueId: number, season: number): Promise<Map<number, string>> {
     return new Map();
  }
}
