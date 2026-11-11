import { useQueryClient } from '@tanstack/react-query';
import { useAction } from '@/hooks/useAction.js';
import { setPlan } from '../api/marketing.api.js';

/** Le paiement mobile money se confirme après le toast : on relit l'espace un peu plus tard. */
function refreshAfterPayment(queryClient, data) {
  if (data?.status !== 'awaiting_payment') return undefined;
  return window.setTimeout(() => {
    queryClient.invalidateQueries({ queryKey: ['space'] });
    queryClient.invalidateQueries({ queryKey: ['session'] });
  }, 4000);
}

export function usePickPlan() {
  const queryClient = useQueryClient();
  return useAction(setPlan, { onSuccess: (data) => refreshAfterPayment(queryClient, data) });
}
