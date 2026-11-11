import { useQuery } from '@tanstack/react-query';
import { useAction } from '@/hooks/useAction.js';
import { getBrandSpace, getInfluencerSpace, updateBrandProfile, updateVitrine } from '../api/dashboard.api.js';

export function useBrandSpace() {
  return useQuery({ queryKey: ['space', 'brand'], queryFn: getBrandSpace, retry: false });
}

export function useInfluencerSpace() {
  return useQuery({ queryKey: ['space', 'influencer'], queryFn: getInfluencerSpace, retry: false });
}

export function useUpdateVitrine() {
  return useAction(({ id, ...input }) => updateVitrine(id, input));
}

export function useUpdateBrandProfile() {
  return useAction(updateBrandProfile);
}
