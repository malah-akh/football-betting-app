import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { queryKeys } from '@/lib/queryKeys';
import { useAuth } from '@/app/context/AuthContext';

export interface ChartDataPoint {
  date: string;
  bankroll: number;
}

export interface BetHistoryItem {
  id: string;
  created_at: string;
  match_id: string;
  odds: number;
  stake: number;
  status: string | null;
  selection: string;
  profit: number | null;
  match_name: string;
}

export interface BankrollData {
  startingBankroll: number;
  currency: string;
  currentBankroll: number;
  totalProfit: number;
  roi: number;
  yieldVal: number;
  chartData: ChartDataPoint[];
  history: BetHistoryItem[];
}

export function useBankrollData() {
  const { user } = useAuth();

  return useQuery<BankrollData>({
    queryKey: queryKeys.bankroll.byUser(user?.id ?? ''),
    queryFn: async () => {
      const { data: profile, error: profileErr } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user!.id)
        .single();
      if (profileErr) throw new Error(profileErr.message);

      const startingBankroll = profile?.starting_bankroll || 1000;
      const currency = profile?.currency || 'EUR';

      const { data: picks, error: picksErr } = await supabase
        .from('picks')
        .select(`*, match:matches (home_team, away_team, score, status)`)
        .eq('user_id', user!.id)
        .order('created_at', { ascending: true });
      if (picksErr) throw new Error(picksErr.message);

      let runningBankroll = startingBankroll;
      let totalStaked = 0;
      const chartData: ChartDataPoint[] = [{ date: 'Start', bankroll: runningBankroll }];
      const historyData: BetHistoryItem[] = [];

      (picks || []).forEach((pick: any) => {
        const stake = Number(pick.stake) || 0;
        const odds = Number(pick.odds) || 1;
        let profit = 0;

        if (pick.status === 'WON') profit = (stake * odds) - stake;
        else if (pick.status === 'LOST') profit = -stake;

        if (pick.status && pick.status !== 'PENDING') {
          runningBankroll += profit;
          totalStaked += stake;
          chartData.push({
            date: new Date(pick.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
            bankroll: runningBankroll,
          });
        }

        const match = pick.match;
        const homeTeam = match?.home_team as { name: string } | undefined;
        const awayTeam = match?.away_team as { name: string } | undefined;

        historyData.push({
          id: pick.id,
          created_at: pick.created_at,
          match_id: pick.match_id,
          odds: pick.odds,
          stake: pick.stake,
          status: pick.status,
          selection: pick.selection,
          profit: pick.status === 'PENDING' ? null : profit,
          match_name: match ? `${homeTeam?.name || 'Home'} vs ${awayTeam?.name || 'Away'}` : 'Unknown Match',
        });
      });

      const totalProfit = runningBankroll - startingBankroll;
      return {
        startingBankroll,
        currency,
        currentBankroll: runningBankroll,
        totalProfit,
        roi: startingBankroll > 0 ? (totalProfit / startingBankroll) * 100 : 0,
        yieldVal: totalStaked > 0 ? (totalProfit / totalStaked) * 100 : 0,
        chartData,
        history: historyData.reverse(),
      };
    },
    enabled: !!user,
  });
}
