import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { queryKeys } from '@/lib/queryKeys';
import { mapMatchToUI } from '@/lib/mappers';
import type { MappedMatch } from '@/types/matches';

async function fetchAllMatches(): Promise<MappedMatch[]> {
  const { data, error } = await supabase
    .from('matches')
    .select(`
      *,
      leagues (name, country, logo_url),
      odds (*)
    `)
    .order('start_time', { ascending: true });

  if (error) throw new Error(error.message);
  return (data || []).map(mapMatchToUI);
}

export function useAllMatches() {
  return useQuery({
    queryKey: queryKeys.matches.all,
    queryFn: fetchAllMatches,
  });
}
