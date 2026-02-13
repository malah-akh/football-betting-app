import { useState, useMemo } from 'react';
import type { FilterState } from '@/app/components/FilterDrawer';
import type { MappedMatch } from '@/types/matches';

const DEFAULT_FILTERS: FilterState = {
  status: 'ALL',
  country: [],
  league: null,
  hasTip: false,
  premiumOnly: false,
};

export function useMatchFilters(matches: MappedMatch[]) {
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);

  const availableCountries = useMemo(() => {
    return Array.from(new Set(matches.map(m => m.country))).sort();
  }, [matches]);

  const availableLeagues = useMemo(() => {
    const leaguesMap = new Map<string, string>();
    matches.forEach(m => leaguesMap.set(m.league, m.country));
    return Array.from(leaguesMap.entries())
      .map(([name, country]) => ({ name, country }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [matches]);

  const filteredMatches = useMemo(() => {
    return matches.filter(match => {
      if (filters.status !== 'ALL') {
        const statusMap: Record<string, string[]> = {
          UPCOMING: ['NS', 'TBD'],
          LIVE: ['1H', '2H', 'HT', 'ET', 'P', 'LIVE'],
          FINISHED: ['FT', 'AET', 'PEN'],
        };
        const allowed = statusMap[filters.status];
        if (allowed && !allowed.includes(match.status)) return false;
      }
      if (filters.country.length > 0 && !filters.country.includes(match.country)) return false;
      if (filters.league && match.league !== filters.league) return false;
      if (filters.hasTip && !match.tip) return false;
      if (filters.premiumOnly && (!match.tip || !match.tip.is_premium)) return false;
      return true;
    });
  }, [matches, filters]);

  const resetFilters = () => setFilters(DEFAULT_FILTERS);

  return {
    filters,
    setFilters,
    resetFilters,
    filteredMatches,
    availableCountries,
    availableLeagues,
  };
}
