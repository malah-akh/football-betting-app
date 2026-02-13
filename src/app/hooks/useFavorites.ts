import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { queryKeys } from '@/lib/queryKeys';
import { useAuth } from '@/app/context/AuthContext';

async function fetchFavoriteIds(userId: string): Promise<Set<string>> {
  const { data, error } = await supabase
    .from('favorites')
    .select('match_id')
    .eq('user_id', userId);

  if (error) throw new Error(error.message);
  return new Set(data.map(f => f.match_id));
}

export function useFavorites() {
  const { user } = useAuth();

  const query = useQuery({
    queryKey: queryKeys.favorites.byUser(user?.id ?? ''),
    queryFn: () => fetchFavoriteIds(user!.id),
    enabled: !!user,
    staleTime: 1000 * 60 * 5,
  });

  return {
    favoriteIds: query.data ?? new Set<string>(),
    ...query,
  };
}
