import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { queryKeys } from '@/lib/queryKeys';
import { useAuth } from '@/app/context/AuthContext';
import { toast } from 'sonner';

export function useUpdateBankrollSettings() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (startingBankroll: number) => {
      if (!user) throw new Error('Must be logged in');
      const { error } = await supabase
        .from('profiles')
        .update({ starting_bankroll: startingBankroll })
        .eq('id', user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      if (!user) return;
      toast.success('Bankroll settings saved');
      queryClient.invalidateQueries({ queryKey: queryKeys.bankroll.byUser(user.id) });
    },
    onError: () => {
      toast.error('Failed to update settings');
    },
  });
}
