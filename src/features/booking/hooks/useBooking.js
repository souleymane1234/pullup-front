import { useQuery } from '@tanstack/react-query';
import { create } from 'zustand';
import { useAction } from '@/hooks/useAction.js';
import { createBooking, getBookingContext } from '../api/booking.api.js';

/** @param {string} handle */
export function useBookingContext(handle) {
  return useQuery({ queryKey: ['booking', handle], queryFn: () => getBookingContext(handle) });
}

/** @param {(id: string) => void} onCreated */
export function useCreateBooking(onCreated) {
  return useAction(createBooking, { onSuccess: (data) => onCreated(data.id) });
}

const emptyDraft = (infId, rate, theme) => ({
  infId, step: 1, rate, theme, title: '', objective: 'notoriete', text: '', link: '', date: '', file: '', pay: 'om', phone: '',
});

/** Brouillon de réservation, conservé en mémoire pendant la navigation. */
export const useBookingDraft = create((set) => ({
  draft: /** @type {ReturnType<typeof emptyDraft>|null} */ (null),
  start: (infId, rate, theme) => set({ draft: emptyDraft(infId, rate, theme) }),
  update: (patch) => set((state) => ({ draft: state.draft ? { ...state.draft, ...patch } : null })),
  clear: () => set({ draft: null }),
}));
