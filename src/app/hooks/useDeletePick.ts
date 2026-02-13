import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { queryKeys } from '@/lib/queryKeys';
import { useAuth } from '@/app/context/AuthContext';
import { toast } from 'sonner';

export function useDeletePick() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (pickId: string) => {
      const { error } = await supabase.from('picks').delete().eq('id', pickId);
      if (error) throw error;
    },
    onSuccess: () => {
      if (!user) return;
      toast.success('Pick deleted');
      queryClient.invalidateQueries({ queryKey: ['picks', user.id] });
      queryClient.invalidateQueries({ queryKey: queryKeys.bankroll.byUser(user.id) });
    },
    onError: () => {
      toast.error('Failed to delete pick');
    },
  });
}
