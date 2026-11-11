import { env } from '@/lib/env.js';
import { NET } from './catalog.js';

/** Lien de redirection qui compte le clic : `GET /r/{ref}`. */
export function trackingUrl(ref) {
  if (!ref || !env.apiUrl) return '';
  return `${env.apiUrl.replace(/\/$/, '')}/r/${encodeURIComponent(ref)}`;
}

/** @param {{ ref: string, offer: { net: string }, brief?: { link?: string } }} campaign @param {{ handle: string }} [influencer] */
export function buildUtm(campaign, influencer) {
  const base = (campaign.brief?.link || 'https://votre-site.ci').split('?')[0];
  const medium = NET[campaign.offer.net].l.toLowerCase();
  const content = influencer ? influencer.handle : 'influenceur';
  return `${base}?utm_source=pullup&utm_medium=${medium}&utm_campaign=${campaign.ref.toLowerCase()}&utm_content=${content}`;
}
