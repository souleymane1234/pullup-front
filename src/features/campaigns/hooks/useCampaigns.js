import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAction } from '@/hooks/useAction.js';
import { autoValidatePublished, getCampaign, getCampaignPayment, runCampaignAction, submitReview } from '../api/campaigns.api.js';

/** @param {string} id */
export function useCampaign(id) {
  return useQuery({ queryKey: ['campaign', id], queryFn: () => getCampaign(id), retry: false });
}

/** @param {string} id @param {boolean} enabled */
export function useCampaignPayment(id, enabled) {
  return useQuery({
    queryKey: ['campaign-payment', id],
    queryFn: () => getCampaignPayment(id),
    enabled,
    refetchInterval: enabled ? 2000 : false,
  });
}

/** @param {string} id @param {() => void} [onDone] */
export function useCampaignAction(id, onDone) {
  const queryClient = useQueryClient();
  return useAction(({ action, payload }) => runCampaignAction(id, action, payload), {
    onSuccess: () => onDone?.(),
    onError: (error) => {
      if (/** @type {{ status?: number }} */ (error).status === 409) {
        queryClient.invalidateQueries({ queryKey: ['campaign', id] });
      }
    },
  });
}

/** @param {string} id */
export function useSubmitReview(id) {
  return useAction((review) => submitReview(id, review));
}

export function useAutoValidate() {
  return useAction(() => autoValidatePublished());
}
