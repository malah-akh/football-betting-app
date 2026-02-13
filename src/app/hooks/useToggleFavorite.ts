import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { queryKeys } from '@/lib/queryKeys';
import { useAuth } from '@/app/context/AuthContext';
import { toast } from 'sonner';

interface ToggleFavoriteVars {
  matchId: string;
  isFavorite: boolean;
}

export function useToggleFavorite() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ matchId, isFavorite }: ToggleFavoriteVars) => {
      if (!user) throw new Error('Must be logged in');

      if (isFavorite) {
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('match_id', matchId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('favorites')
          .insert({ user_id: user.id, match_id: matchId });
        if (error) throw error;
      }
    },

    onMutate: async ({ matchId, isFavorite }) => {
      if (!user) return;
      const key = queryKeys.favorites.byUser(user.id);
      await queryClient.cancelQueries({ queryKey: key });

      const previous = queryClient.getQueryData<Set<string>>(key);
      queryClient.setQueryData<Set<string>>(key, (old) => {
        const next = new Set(old);
        if (isFavorite) {
          next.delete(matchId);
        } else {
          next.add(matchId);
        }
        return next;
      });

      return { previous };
    },

    onError: (_err, _vars, context) => {
      if (user && context?.previous) {
        queryClient.setQueryData(queryKeys.favorites.byUser(user.id), context.previous);
      }
      toast.error('Failed to update favorites');
    },

    onSettled: () => {
      if (!user) return;
      queryClient.invalidateQueries({ queryKey: queryKeys.favorites.byUser(user.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.favorites.withMatches(user.id) });
    },
  });
}
