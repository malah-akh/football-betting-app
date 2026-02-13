import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { queryKeys } from '@/lib/queryKeys';
import { useAuth } from '@/app/context/AuthContext';

interface PickStats {
  totalBets: number;
  winRate: number;
  points: number;
}

export function useUserPicksStats() {
  const { user } = useAuth();

  return useQuery<PickStats>({
    queryKey: queryKeys.picks.statsByUser(user?.id ?? ''),
    queryFn: async () => {
      const { data: picks, error } = await supabase
        .from('picks')
        .select('status, odds, stake')
        .eq('user_id', user!.id);

      if (error) throw new Error(error.message);

      let wins = 0;
      let settled = 0;
      let totalPoints = 0;

      (picks || []).forEach(pick => {
        const status = pick.status?.toLowerCase();
        const stake = pick.stake || 1;
        if (status === 'won') {
          wins++;
          settled++;
          totalPoints += stake * (pick.odds - 1);
        } else if (status === 'lost') {
          settled++;
          totalPoints -= stake;
        }
      });

      return {
        totalBets: (picks || []).length,
        winRate: settled > 0 ? (wins / settled) * 100 : 0,
        points: totalPoints,
      };
    },
    enabled: !!user,
  });
}
