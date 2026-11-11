import { useEffect } from 'react';
import { keepPreviousData, useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { useAction } from '@/hooks/useAction.js';
import {
  getDirectory, getInfluencerProfile, listCarousel, listInfluencers, recordVisit, sendContactRequest, setInfluencerPhoto, toggleFavorite,
} from '../api/influencers.api.js';

const PAGE_SIZE = 12;

/** Annuaire paginé par curseur. @param {Record<string, string>} filters */
export function useInfluencerList(filters) {
  return useInfiniteQuery({
    queryKey: ['influencers', filters],
    queryFn: ({ pageParam }) => listInfluencers({ ...filters, cursor: pageParam, limit: PAGE_SIZE }),
    initialPageParam: 0,
    getNextPageParam: (last) => last.nextCursor ?? undefined,
    placeholderData: keepPreviousData,
  });
}

export function useDirectory() {
  return useQuery({ queryKey: ['directory'], queryFn: getDirectory, retry: false });
}

/** @param {string} filter */
export function useCarouselItems(filter) {
  return useQuery({
    queryKey: ['carousel', filter],
    queryFn: () => listCarousel(filter),
    placeholderData: keepPreviousData,
    retry: false,
  });
}

/** @param {string} handle */
export function useInfluencerProfile(handle) {
  return useQuery({
    queryKey: ['influencer', handle],
    queryFn: () => getInfluencerProfile(handle),
    enabled: Boolean(handle),
    retry: false,
  });
}

const visited = new Set();

/** Compte une visite de vitrine par profil et par chargement de page. @param {string|undefined} id @param {boolean} own */
export function useRecordVisit(id, own) {
  useEffect(() => {
    if (!id || own || visited.has(id)) return;
    visited.add(id);
    recordVisit(id).catch(() => visited.delete(id));
  }, [id, own]);
}

export function useToggleFavorite() {
  return useAction((id) => toggleFavorite(id));
}

/** @param {() => void} [onDone] */
export function useContactRequest(onDone) {
  return useAction(sendContactRequest, { onSuccess: () => onDone?.() });
}

export function useSetPhoto() {
  return useAction(({ id, photo, consent }) => setInfluencerPhoto(id, photo, consent ? { consent } : {}));
}
