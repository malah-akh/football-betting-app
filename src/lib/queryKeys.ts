export const queryKeys = {
  matches: {
    all: ['matches'] as const,
    byDate: (dateStr: string) => ['matches', 'byDate', dateStr] as const,
    detail: (id: string) => ['matches', 'detail', id] as const,
  },
  favorites: {
    byUser: (userId: string) => ['favorites', userId] as const,
    withMatches: (userId: string) => ['favorites', 'withMatches', userId] as const,
  },
  picks: {
    byUserAndMatch: (userId: string, matchId: string) => ['picks', userId, matchId] as const,
    statsByUser: (userId: string) => ['picks', 'stats', userId] as const,
  },
  bankroll: {
    byUser: (userId: string) => ['bankroll', userId] as const,
  },
  leagues: {
    active: ['leagues', 'active'] as const,
  },
  missionControl: {
    matches: (dateStr: string, leagueId: string) => ['missionControl', dateStr, leagueId] as const,
  },
} as const;
