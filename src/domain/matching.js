import { formatPercent } from '@/lib/format.js';
import { NET, RELATED, RECO_BY_OBJECTIVE } from './catalog.js';
import { avgEngagement, catLabel, clamp, isListed, minPrice } from './metrics.js';

/**
 * Compatibilité marque × influenceur.
 * Pondération : thématique 40 %, engagement 30 %, qualité d'audience 20 %, historique 10 %.
 * @typedef {{ theme: string, objective: string, net: string, budget: number, age: string, gender: 'all'|'f'|'m', city: string }} MatchBrief
 * @param {any} influencer
 * @param {MatchBrief} brief
 */
export function matchOne(influencer, brief) {
  const i = influencer;
  if (brief.net !== 'any' && !i.net[brief.net]) return null;

  const themeScore = i.cats.includes(brief.theme)
    ? 1
    : (RELATED[brief.theme] || []).some((cat) => i.cats.includes(cat)) ? 0.55 : 0.1;
  const engagement = brief.net === 'any' ? avgEngagement(i) : i.net[brief.net][1];
  const engagementScore = clamp(engagement / 8);

  let fit = 1;
  if (brief.gender === 'f') fit *= clamp((i.aud.f / 100) * 1.5);
  if (brief.gender === 'm') fit *= clamp(((100 - i.aud.f) / 100) * 1.5);
  if (brief.age !== '') fit *= clamp(i.aud.ages[Number(brief.age)] / 45 + 0.3);
  let cityShare = null;
  if (brief.city) {
    const match = i.aud.cities.find((entry) => entry[0] === brief.city);
    cityShare = match ? match[1] : 3;
    fit *= clamp(cityShare / 55 + 0.3);
  }

  const audienceScore = (i.auth / 100) * clamp(fit);
  const historyScore = clamp((i.rating / 5) * 0.5 + (i.onTime / 100) * 0.3 + clamp(i.done / 60) * 0.2);
  const s = themeScore * 0.4 + engagementScore * 0.3 + audienceScore * 0.2 + historyScore * 0.1;
  const note = Math.round((3 + 2 * s) * 10) / 10;

  const followers = brief.net === 'any'
    ? Math.max(...Object.values(i.net).map((network) => network[0]))
    : i.net[brief.net][0];
  const bestNet = brief.net === 'any'
    ? Object.entries(i.net).sort((a, b) => b[1][0] - a[1][0])[0][0]
    : brief.net;
  const reach = Math.round(followers * NET[bestNet].reach * (0.75 + 0.5 * s));
  const interactions = Math.round(((reach * engagement) / 100) * (0.85 + 0.3 * s));
  const price = minPrice(i, brief.net);

  const why = [];
  if (themeScore === 1) why.push(`Thématique alignée : ${catLabel(brief.theme)}`);
  else if (themeScore > 0.5) why.push(`Thématique proche (${i.cats.map(catLabel).join(', ')})`);
  why.push(`Engagement de ${formatPercent(engagement)} ${brief.net === 'any' ? 'en moyenne' : `sur ${NET[brief.net].l}`}`);
  if (cityShare !== null && cityShare >= 10) why.push(`${cityShare} % de l'audience à ${brief.city}`);
  if (brief.gender !== 'all') {
    const share = brief.gender === 'f' ? i.aud.f : 100 - i.aud.f;
    why.push(`${share} % d'audience ${brief.gender === 'f' ? 'féminine' : 'masculine'}`);
  }
  why.push(`${i.onTime} % des campagnes publiées à l'heure, audience authentique à ${i.auth} %`);

  return {
    influencer: i,
    s,
    note,
    reach,
    interactions,
    price,
    inBudget: price <= Number(brief.budget),
    why,
    bestNet,
    reco: RECO_BY_OBJECTIVE[brief.objective],
    cpm: (price / reach) * 1000,
  };
}

/** @param {any[]} influencers @param {MatchBrief} brief */
export function rankMatches(influencers, brief) {
  return influencers
    .filter(isListed)
    .map((influencer) => matchOne(influencer, brief))
    .filter(Boolean)
    .sort((a, b) => (Number(b.inBudget) - Number(a.inBudget)) || (b.s - a.s));
}
