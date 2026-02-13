import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { queryKeys } from '@/lib/queryKeys';
import { useAuth } from '@/app/context/AuthContext';

export function useUserPick(matchId: string | undefined) {
  const { user } = useAuth();

  return useQuery({
    queryKey: queryKeys.picks.byUserAndMatch(user?.id ?? '', matchId ?? ''),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('picks')
        .select('*')
        .eq('user_id', user!.id)
        .eq('match_id', matchId!)
        .maybeSingle();

      if (error) throw new Error(error.message);
      return data;
    },
    enabled: !!user && !!matchId,
  });
}
