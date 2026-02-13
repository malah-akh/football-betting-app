import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { queryKeys } from '@/lib/queryKeys';

const POPULAR_LEAGUES = [
  { name: "Premier League", country: "England" },
  { name: "La Liga", country: "Spain" },
  { name: "Bundesliga", country: "Germany" },
  { name: "Serie A", country: "Italy" },
  { name: "Ligue 1", country: "France" },
  { name: "UEFA Champions League", country: "World" },
  { name: "UEFA Europa League", country: "World" },
  { name: "Eredivisie", country: "Netherlands" },
  { name: "Primeira Liga", country: "Portugal" },
  { name: "Major League Soccer", country: "USA" },
  { name: "Championship", country: "England" },
  { name: "Brasileiro Série A", country: "Brazil" },
];

async function fetchActiveLeagues() {
  const { data, error } = await supabase.from('leagues').select('*').eq('is_active', true);
  if (error) throw new Error(error.message);

  return (data || []).sort((a: any, b: any) => {
    const indexA = POPULAR_LEAGUES.findIndex(p => p.name === a.name && p.country === a.country);
    const indexB = POPULAR_LEAGUES.findIndex(p => p.name === b.name && p.country === b.country);
    if (indexA !== -1 && indexB !== -1) return indexA - indexB;
    if (indexA !== -1) return -1;
    if (indexB !== -1) return 1;
    return a.name.localeCompare(b.name);
  });
}

export function useLeagues() {
  return useQuery({
    queryKey: queryKeys.leagues.active,
    queryFn: fetchActiveLeagues,
    staleTime: 1000 * 60 * 30,
  });
}
