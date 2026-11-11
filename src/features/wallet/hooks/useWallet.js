import { useQueryClient } from '@tanstack/react-query';
import { useAction } from '@/hooks/useAction.js';
import { purchaseBoost, setPlan, withdraw } from '../api/wallet.api.js';

/** Le paiement mobile money se confirme après le toast : on relit l'espace un peu plus tard. */
function refreshAfterPayment(queryClient, data) {
  if (data?.status !== 'awaiting_payment') return undefined;
  return window.setTimeout(() => {
    queryClient.invalidateQueries({ queryKey: ['space'] });
    queryClient.invalidateQueries({ queryKey: ['session'] });
  }, 4000);
}

/** @param {() => void} [onDone] */
export function useWithdraw(onDone) {
  return useAction(withdraw, { onSuccess: () => onDone?.() });
}

export function useSetPlan() {
  const queryClient = useQueryClient();
  return useAction(setPlan, { onSuccess: (data) => refreshAfterPayment(queryClient, data) });
}

export function usePurchaseBoost() {
  const queryClient = useQueryClient();
  return useAction(purchaseBoost, { onSuccess: (data) => refreshAfterPayment(queryClient, data) });
}
