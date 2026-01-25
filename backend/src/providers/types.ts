export interface ExternalTeam {
  id: number;
  name: string;
  logo: string;
  winner?: boolean | null;
}

export interface ExternalMatch {
  id: number;
  date: string; // ISO string
  timestamp: number;
  referee?: string | null;
  venue?: {
    id: number | null;
    name: string;
    city: string;
  };
  status: {
    long: string;
    short: string; // "NS", "FT", "1H", etc.
    elapsed?: number | null;
  };
  league: {
    id: number;
    name: string;
    country: string;
    logo: string;
    flag?: string | null;
    season: number;
    round?: string;
  };
  teams: {
    home: ExternalTeam;
    away: ExternalTeam;
  };
  goals: {
    home: number | null;
    away: number | null;
  };
  score?: {
    halftime: { home: number | null; away: number | null };
    fulltime: { home: number | null; away: number | null };
    extratime: { home: number | null; away: number | null };
    penalty: { home: number | null; away: number | null };
  };
  raw?: any; // To store the full original object if needed
  odds?: ExternalOdds; // Optional odds included in the match data
}

export interface ExternalOdds {
  matchId: number;
  bookmaker: {
    id: number;
    name: string;
  };
  label: string; // e.g. "Match Winner"
  values: {
    home: number;
    draw: number;
    away: number;
  };
}

export interface ISportsProvider {
  /**
   * Fetch a single match by ID
   */
  getFixture(id: number): Promise<ExternalMatch | null>;

  /**
   * Fetch matches for a specific date (YYYY-MM-DD)
   * Optional leagueId to filter by league
   */
  getFixtures(date: string, leagueId?: number): Promise<ExternalMatch[]>;
  
  /**
   * Fetch odds for a specific match ID
   */
  getOdds(matchId: number): Promise<ExternalOdds | null>;

  /**
   * Fetch odds for a specific date (YYYY-MM-DD)
   * Optional leagueId to filter
   */
  getOddsByDate(date: string, leagueId?: number): Promise<ExternalOdds[]>;

  /**
   * Fetch standings for a specific league and season
   * Returns a Map of TeamID -> Form String (e.g. "WWWDL")
   */
  getLeagueStandings(leagueId: number, season: number): Promise<Map<number, string>>;
}
