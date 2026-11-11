import { CATS } from './catalog.js';

export const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, value));

export const totalFollowers = (influencer) =>
  Object.values(influencer.net).reduce((sum, network) => sum + network[0], 0);

export function avgEngagement(influencer) {
  const networks = Object.values(influencer.net);
  const total = totalFollowers(influencer);
  if (!total) return 0;
  return networks.reduce((sum, network) => sum + network[1] * network[0], 0) / total;
}

/** @param {{ rates: { net: string, price: number }[] }} influencer @param {string} [net] */
export function minPrice(influencer, net) {
  const prices = influencer.rates
    .filter((rate) => !net || net === 'any' || rate.net === net)
    .map((rate) => rate.price);
  return Math.min(...prices, Infinity);
}

export function badge(influencer) {
  const total = totalFollowers(influencer);
  const engagement = avgEngagement(influencer);
  if (total >= 600000 && engagement >= 4) return { k: 'macro', l: 'Macro influenceur', tone: 'ok' };
  if (total >= 200000) return { k: 'montee', l: 'Influenceur en montée', tone: 'warn' };
  return { k: 'normal', l: 'Influenceur', tone: 'orange' };
}

/** Score PULLUP sur 5 : engagement 30 %, authenticité 25 %, créativité, briefs et délais 15 % chacun. */
export function pullupScore(influencer) {
  const engagement = clamp(avgEngagement(influencer) / 7);
  const score = (
    engagement * 0.3
    + (influencer.auth / 100) * 0.25
    + (influencer.creat / 5) * 0.15
    + (influencer.brief / 100) * 0.15
    + (influencer.onTime / 100) * 0.15
  ) * 5;
  return Math.round(score * 10) / 10;
}

/** Préfère le score calculé par l'API quand il est fourni. */
export function displayPullupScore(influencer) {
  const stored = influencer?.pullupScore;
  if (stored != null && stored !== '') {
    const value = Number(stored);
    if (Number.isFinite(value)) return Math.round(value * 10) / 10;
  }
  return pullupScore(influencer);
}

export const catLabel = (key) => CATS[key]?.l || key;

export const isListed = (influencer) => Boolean(influencer.verified) && influencer.status === 'active';

export const avatarOf = (influencer) => ({
  name: influencer.name,
  hue: influencer.hue ?? 220,
  photo: influencer.photo || null,
  verified: Boolean(influencer.verified),
});

export const firstName = (name = '') => name.split(' ')[0];

export const wordCount = (text = '') => {
  const trimmed = text.trim();
  return trimmed ? trimmed.split(/\s+/).length : 0;
};
