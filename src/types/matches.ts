export interface MappedOdds {
  home: number;
  draw: number;
  away: number;
}

export interface MappedTip {
  selection: string;
  odds: number;
  analysis?: string;
  is_premium: boolean;
  market?: string;
  stake?: number;
  confidence?: number;
  bookmaker?: string;
  value_edge?: number;
  status?: string;
}

export interface MappedMatch {
  id: string;
  league: string;
  country: string;
  leagueLogo?: string;
  location: string;
  time: string;
  status: string;
  homeTeam: string;
  homeTeamLogo?: string;
  awayTeam: string;
  awayTeamLogo?: string;
  odds?: MappedOdds;
  tip?: MappedTip;
}
