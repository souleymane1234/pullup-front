import { Pill } from '@/components/ui/Pill/Pill.jsx';
import { STATUS } from '@/domain/catalog.js';

/** @param {{ status: keyof typeof STATUS }} props */
export function CampaignStatus({ status }) {
  const meta = STATUS[status];
  return <Pill tone={meta?.tone ?? 'mute'}>{meta?.l ?? status}</Pill>;
}
