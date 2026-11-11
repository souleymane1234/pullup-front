import { rankMatches } from '@/domain/matching.js';
import { clone, getDb } from './demo/db.js';
import { findBrand } from './demo/model.js';
import { isRemote, request } from './remote.js';

/** Corps POST /matching : brief V3, sans champs vides inutiles. */
export function toMatchingBody(brief) {
  const body = {
    theme: brief.theme,
    objective: brief.objective,
    net: brief.net || 'any',
    budget: Number(brief.budget),
    gender: brief.gender || 'all',
  };
  if (brief.age !== undefined && brief.age !== null && brief.age !== '') body.age = String(brief.age);
  if (brief.city) body.city = brief.city;
  const desc = String(brief.desc ?? '').trim();
  if (desc) body.desc = desc;
  return body;
}

function normalizeMatch(match) {
  const influencer = match?.influencer ?? {};
  return {
    ...match,
    influencer: {
      ...influencer,
      id: influencer.id || 'masked',
      name: influencer.name || 'Profil réservé',
      cats: Array.isArray(influencer.cats) ? influencer.cats : [],
      hue: influencer.hue ?? 220,
      photo: influencer.photo || null,
      handle: influencer.handle || undefined,
    },
    note: Number(match?.note) || 0,
    why: Array.isArray(match?.why) ? match.why : [],
    inBudget: Boolean(match?.inBudget),
    masked: Boolean(match?.masked),
    reach: match?.reach ?? null,
    interactions: match?.interactions ?? null,
    cpm: match?.cpm ?? null,
    price: match?.price ?? null,
    reco: match?.reco || '',
    bestNet: match?.bestNet || '',
  };
}

function normalizeMatching(data) {
  return {
    results: Array.isArray(data?.results) ? data.results.map(normalizeMatch) : [],
    plan: data?.plan ?? null,
  };
}

/**
 * @param {import('@/domain/matching.js').MatchBrief} brief
 * @returns {Promise<{ results: ReturnType<typeof rankMatches>, plan: 'free'|'pro'|'business'|null }>}
 */
export async function matchInfluencers(brief) {
  if (isRemote()) return normalizeMatching(await request('post', '/matching', toMatchingBody(brief)));
  const S = getDb();
  const session = S.session;
  const plan = session?.role === 'brand' ? findBrand(session.id)?.plan ?? 'free' : null;
  const favs = session?.role === 'brand' ? S.favs[session.id] || [] : [];
  const ranked = rankMatches(S.influencers, brief).map((match) => ({
    ...match,
    influencer: { ...clone(match.influencer), favorite: favs.includes(match.influencer.id) },
  }));
  const unlocked = plan === 'pro' || plan === 'business';
  const results = ranked.map((match, index) => {
    if (unlocked) return match;
    if (index < 3) return { ...match, reach: null, interactions: null, cpm: null };
    return {
      ...match,
      influencer: { id: `masked-${index + 1}`, name: 'Profil réservé', hue: match.influencer.hue, cats: match.influencer.cats },
      price: null,
      reach: null,
      interactions: null,
      cpm: null,
      masked: true,
    };
  });
  return { results, plan };
}
