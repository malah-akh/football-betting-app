import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { ingestMatches } from '@/lib/backend';
import { queryKeys } from '@/lib/queryKeys';
import { mapMatchToUI } from '@/lib/mappers';
import type { MappedMatch } from '@/types/matches';

async function fetchMatchesByDate(dateStr: string): Promise<MappedMatch[]> {
  const buildQuery = () =>
    supabase
      .from('matches')
      .select(`
        *,
        leagues (name, country, logo_url),
        odds (*),
        tips!inner (selection, odds, analysis, is_premium, status)
      `)
      .gte('start_time', `${dateStr}T00:00:00`)
      .lte('start_time', `${dateStr}T23:59:59`)
      .order('start_time', { ascending: true });

  let { data, error } = await buildQuery();

  if (error) throw new Error(error.message);

  if (!data || data.length === 0) {
    await ingestMatches(dateStr);
    const retry = await buildQuery();
    data = retry.data;
    if (retry.error) throw new Error(retry.error.message);
  }

  return (data || []).map(mapMatchToUI);
}

export function useMatchesByDate(date: Date) {
  const dateStr = date.toISOString().split('T')[0];

  return useQuery({
    queryKey: queryKeys.matches.byDate(dateStr),
    queryFn: () => fetchMatchesByDate(dateStr),
  });
}
