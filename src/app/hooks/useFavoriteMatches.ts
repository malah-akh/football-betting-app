import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { queryKeys } from '@/lib/queryKeys';
import { mapMatchToUI } from '@/lib/mappers';
import { useAuth } from '@/app/context/AuthContext';
import type { MappedMatch } from '@/types/matches';

async function fetchFavoriteMatches(userId: string): Promise<MappedMatch[]> {
  const { data, error } = await supabase
    .from('favorites')
    .select(`
      match_id,
      matches (
        *,
        leagues (name, country, logo_url),
        odds (*)
      )
    `)
    .eq('user_id', userId);

  if (error) throw new Error(error.message);

  return (data || [])
    .map((item: any) => item.matches)
    .filter(Boolean)
    .map(mapMatchToUI);
}

export function useFavoriteMatches() {
  const { user } = useAuth();

  return useQuery({
    queryKey: queryKeys.favorites.withMatches(user?.id ?? ''),
    queryFn: () => fetchFavoriteMatches(user!.id),
    enabled: !!user,
  });
}
