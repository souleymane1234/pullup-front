import { useQuery } from '@tanstack/react-query';
import { useAction } from '@/hooks/useAction.js';
import {
  completeOnboarding, getPlatform, listNotifications, markNotificationsRead, resetDemo, setFlag,
} from '../api/platform.api.js';

const DEFAULT_FLAGS = { v2: true, v3: true };

export function usePlatform() {
  return useQuery({ queryKey: ['platform'], queryFn: getPlatform, retry: false });
}

/** Options activées sur toute la plateforme (V2 séquestre, V3 matching IA). */
export function useFlags() {
  const { data } = usePlatform();
  return data?.flags ?? DEFAULT_FLAGS;
}

/** @param {boolean} enabled */
export function useNotifications(enabled) {
  return useQuery({ queryKey: ['notifications'], queryFn: listNotifications, enabled, retry: false });
}

export function useMarkNotificationsRead() {
  return useAction(markNotificationsRead, { silent: true });
}

export function useSetFlag() {
  return useAction(({ key, value }) => setFlag(key, value));
}

/** @param {() => void} [onDone] */
export function useResetDemo(onDone) {
  return useAction(() => resetDemo(), { onSuccess: onDone });
}

export function useCompleteOnboarding() {
  return useAction(() => completeOnboarding(), { silent: true });
}
