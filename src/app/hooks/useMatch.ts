import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { queryKeys } from '@/lib/queryKeys';

async function fetchMatch(id: string) {
  const { data, error } = await supabase
    .from('matches')
    .select(`
      *,
      leagues (name, country, logo_url),
      odds (*),
      tips (*)
    `)
    .eq('id', id)
    .single();

  if (error) throw new Error(error.message);

  // Trigger background ingest for fresh data (fire-and-forget)
  if (data?.external_id) {
    import('@/lib/backend').then(({ ingestMatch }) => ingestMatch(data.external_id));
  }

  return data;
}

export function useMatch(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.matches.detail(id!),
    queryFn: () => fetchMatch(id!),
    enabled: !!id,
  });
}
