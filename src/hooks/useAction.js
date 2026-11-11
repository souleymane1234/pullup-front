import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/lib/toast.js';

/**
 * Mutation métier : après succès, tout le cache est rafraîchi et le message renvoyé par le service est affiché.
 * Les erreurs sont présentées à l'utilisateur sous forme de toast.
 * @template TVariables, TData
 * @param {(variables: TVariables) => Promise<TData>} mutationFn
 * @param {{ onSuccess?: (data: TData, variables: TVariables) => void, onError?: (error: unknown) => void, silent?: boolean }} [options]
 */
export function useAction(mutationFn, { onSuccess, onError, silent = false } = {}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: async (data, variables) => {
      await queryClient.invalidateQueries();
      const message = /** @type {any} */ (data)?.message;
      if (message && !silent) toast(message);
      onSuccess?.(data, variables);
    },
    onError: (error) => {
      toast(error instanceof Error ? error.message : 'Une erreur est survenue.');
      onError?.(error);
    },
  });
}
