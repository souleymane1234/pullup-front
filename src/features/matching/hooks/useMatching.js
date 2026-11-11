import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { create } from 'zustand';
import { matchInfluencers } from '../api/matching.api.js';

export const DEFAULT_BRIEF = {
  theme: 'beaute',
  objective: 'notoriete',
  net: 'any',
  budget: 150000,
  age: '1',
  gender: 'all',
  city: 'Abidjan',
  desc: '',
};

/** Dernier brief soumis : conservé pendant la navigation pour retrouver les résultats. */
export const useMatchingStore = create((set) => ({
  brief: /** @type {typeof DEFAULT_BRIEF|null} */ (null),
  submit: (brief) => set({ brief: { ...brief, budget: Number(brief.budget) } }),
}));

/** @param {typeof DEFAULT_BRIEF|null} brief */
export function useMatches(brief) {
  return useQuery({
    queryKey: ['matching', brief],
    queryFn: () => matchInfluencers(brief),
    enabled: Boolean(brief),
    placeholderData: keepPreviousData,
    retry: false,
  });
}
