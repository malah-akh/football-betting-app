import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { queryKeys } from '@/lib/queryKeys';
import { useAuth } from '@/app/context/AuthContext';
import { toast } from 'sonner';

interface SavePickVars {
  matchId: string;
  selection: string;
  odds: number;
  stake: number;
  existingPickId?: string;
}

export function useSavePick() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ matchId, selection, odds, stake, existingPickId }: SavePickVars) => {
      if (!user) throw new Error('Must be logged in');

      if (existingPickId) {
        const { data, error } = await supabase
          .from('picks')
          .update({ selection, odds, stake })
          .eq('id', existingPickId)
          .select()
          .single();
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from('picks')
          .insert({
            user_id: user.id,
            match_id: matchId,
            selection,
            odds,
            stake,
            status: 'PENDING',
          })
          .select()
          .single();
        if (error) throw error;
        return data;
      }
    },
    onSuccess: (_data, vars) => {
      if (!user) return;
      toast.success(vars.existingPickId ? 'Pick updated' : 'Pick added');
      queryClient.invalidateQueries({
        queryKey: queryKeys.picks.byUserAndMatch(user.id, vars.matchId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.picks.statsByUser(user.id),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.bankroll.byUser(user.id),
      });
    },
    onError: () => {
      toast.error('Failed to save pick');
    },
  });
}
