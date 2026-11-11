import { useAction } from '@/hooks/useAction.js';
import { sendMessage } from '../api/messaging.api.js';

/** @param {string} campaignId @param {() => void} [onSent] */
export function useSendMessage(campaignId, onSent) {
  return useAction((text) => sendMessage(campaignId, text), { silent: true, onSuccess: () => onSent?.() });
}
