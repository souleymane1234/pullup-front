import { AGES, MIN_RATE, NET } from '@/domain/catalog.js';
import { avgEngagement, badge, catLabel, clamp, displayPullupScore, isListed, minPrice, pullupScore, totalFollowers } from '@/domain/metrics.js';
import { clone, getDb, saveDb } from './demo/db.js';
import { currentSession, findByHandle, findBrand, findInfluencer, notify, now, requireRole } from './demo/model.js';
import { isRemote, request } from './remote.js';

const SORTERS = {
  score: (a, b) => pullupScore(b) - pullupScore(a),
  plus: (a, b) => totalFollowers(b) - totalFollowers(a),
  moins: (a, b) => totalFollowers(a) - totalFollowers(b),
  prix: (a, b) => minPrice(a) - minPrice(b),
  eng: (a, b) => avgEngagement(b) - avgEngagement(a),
};

function favoriteIds() {
  const S = getDb();
  const session = S.session;
  return session?.role === 'brand' ? S.favs[session.id] || [] : [];
}

const withFavorite = (influencer, favs) => ({ ...clone(influencer), favorite: favs.includes(influencer.id) });

function missingStatus(error) {
  return /** @type {{ status?: number }} */ (error).status === 404;
}

function buildVitrineStats(influencer) {
  const aud = influencer.aud ?? {};
  const women = Math.round(Number(aud.f) || 0);
  const men = Math.max(0, 100 - women);
  const ages = AGES.map((label, index) => ({
    label: `${label} ans`,
    value: Number(aud.ages?.[index]) || 0,
  }));
  const cities = (aud.cities ?? []).map((entry) => (
    Array.isArray(entry)
      ? { label: String(entry[0]), value: Number(entry[1]) || 0 }
      : { label: String(entry.label ?? ''), value: Number(entry.value) || 0 }
  ));
  const done = Number(influencer.done) || 0;
  const onTime = Number(influencer.onTime) || 0;
  const value = displayPullupScore(influencer);
  return {
    networks: Object.entries(influencer.net ?? {}).map(([key, tuple]) => ({
      key,
      label: NET[key]?.l ?? key,
      followers: Number(tuple?.[0]) || 0,
      engagement: Number(tuple?.[1]) || 0,
    })),
    audience: {
      cities,
      ages,
      gender: { women, men },
    },
    score: {
      value,
      bars: [
        { key: 'engagement', label: 'Engagement', value: Math.round(clamp(avgEngagement(influencer) / 7) * 100) },
        { key: 'auth', label: 'Authenticité', value: Number(influencer.auth) || 0 },
        { key: 'creat', label: 'Créativité', value: Math.round(Number(influencer.creat) * 20) },
        { key: 'brief', label: 'Briefs', value: Number(influencer.brief) || 0 },
        { key: 'onTime', label: 'Délais', value: onTime },
      ],
      done,
      onTime,
      caption: `${done} campagnes réalisées sur PULLUP · ${onTime} % publiées à l'heure · audience auditée quotidiennement.`,
    },
  };
}

function normalizeInfluencer(influencer) {
  if (!influencer) return influencer;
  const aud = influencer.aud ?? {};
  const next = {
    ...influencer,
    city: influencer.city || '',
    cats: Array.isArray(influencer.cats) ? influencer.cats : [],
    bio: influencer.bio || '',
    net: influencer.net && typeof influencer.net === 'object' ? influencer.net : {},
    aud: {
      f: Number(aud.f) || 0,
      ages: Array.isArray(aud.ages) ? aud.ages : [0, 0, 0, 0],
      cities: Array.isArray(aud.cities) ? aud.cities : [],
    },
    rates: Array.isArray(influencer.rates) ? influencer.rates : [],
    days: Array.isArray(influencer.days) ? influencer.days : [],
    views: Array.isArray(influencer.views) ? influencer.views : [],
    accepts: influencer.accepts ?? { pub: false, partenariat: false, dedicace: false },
    photo: influencer.photo || null,
    favorite: Boolean(influencer.favorite),
  };
  const pullup = displayPullupScore(next);
  return {
    ...next,
    pullupScore: pullup,
    stats: influencer.stats?.score ? influencer.stats : buildVitrineStats({ ...next, pullupScore: pullup }),
  };
}

function normalizeListPage(data) {
  const items = Array.isArray(data?.items) ? data.items.map(normalizeInfluencer) : [];
  return {
    items,
    nextCursor: data?.nextCursor ?? null,
    total: Number(data?.total) || items.length,
  };
}

function normalizeProfile(data) {
  if (!data?.influencer) return null;
  return {
    influencer: normalizeInfluencer(data.influencer),
    own: Boolean(data.own),
    reviews: Array.isArray(data.reviews) ? data.reviews : [],
    recent: Array.isArray(data.recent) ? data.recent : [],
  };
}

/** Query GET /influencers : n'envoie que les filtres renseignés. */
export function toListQuery(params = {}) {
  const {
    cursor = 0, limit = 12, s = '', cat = '', net = '', badge: level = '', budget = '', sort = 'score',
  } = params;
  const query = {
    cursor: Number(cursor) || 0,
    limit: Number(limit) || 12,
    sort: SORTERS[sort] ? sort : 'score',
  };
  const search = String(s).trim();
  if (search) query.s = search;
  if (cat) query.cat = cat;
  if (net) query.net = net;
  if (level) query.badge = level;
  if (budget !== '' && budget != null) query.budget = budget;
  return query;
}

/** Corps POST /influencers/:id/requests (l'id est dans l'URL). */
export function toContactRequestBody(input) {
  return {
    from: String(input.from ?? '').trim(),
    contact: String(input.contact ?? '').trim(),
    msg: String(input.msg ?? '').trim(),
    type: input.type,
  };
}

/** Corps PUT /influencers/:id/vitrine. */
export function toVitrineBody(input) {
  return {
    bio: String(input.bio ?? '').trim(),
    cats: Array.isArray(input.cats) ? input.cats.slice(0, 3) : [],
    days: Array.isArray(input.days) ? input.days : [],
    rates: (Array.isArray(input.rates) ? input.rates : []).map((rate) => ({
      ...(rate.id ? { id: rate.id } : {}),
      net: rate.net,
      fmt: String(rate.fmt ?? '').trim(),
      price: Math.round(Number(rate.price)),
    })),
  };
}

/** Corps PUT /influencers/:id/photo. L'admin doit envoyer `consent: true`. */
export function toPhotoBody(photo, extra = {}) {
  const body = { photo };
  if (typeof extra.consent === 'boolean') body.consent = extra.consent;
  return body;
}

/**
 * Annuaire paginé par curseur.
 * @param {{ cursor?: number, limit?: number, s?: string, cat?: string, net?: string, badge?: string, budget?: string|number, sort?: keyof typeof SORTERS }} [params]
 * @returns {Promise<{ items: any[], nextCursor: number|null, total: number }>}
 */
export async function listInfluencers(params = {}) {
  const { cursor = 0, limit = 12, s = '', cat = '', net = '', badge: level = '', budget = '', sort = 'score' } = params;
  if (isRemote()) return normalizeListPage(await request('get', '/influencers', toListQuery(params)));
  let list = getDb().influencers.filter(isListed);
  const search = s.trim().toLowerCase();
  if (search) list = list.filter((i) => `${i.name} ${i.handle} ${i.city} ${i.cats.map(catLabel).join(' ')} ${i.bio}`.toLowerCase().includes(search));
  if (cat) list = list.filter((i) => i.cats.includes(cat));
  if (net) list = list.filter((i) => i.net[net]);
  if (level) list = list.filter((i) => badge(i).k === level);
  if (budget) list = list.filter((i) => minPrice(i, net) <= Number(budget));
  list = [...list].sort(SORTERS[sort] || SORTERS.score);
  const start = Number(cursor) || 0;
  const favs = favoriteIds();
  return {
    items: list.slice(start, start + limit).map((i) => withFavorite(i, favs)),
    nextCursor: start + limit < list.length ? start + limit : null,
    total: list.length,
  };
}

/** Chiffres de l'annuaire et profil mis en avant sur l'accueil. */
export async function getDirectory() {
  if (isRemote()) {
    const data = await request('get', '/influencers/directory');
    return {
      followers: Number(data?.followers) || 0,
      verified: Number(data?.verified) || 0,
      perNetwork: data?.perNetwork && typeof data.perNetwork === 'object' ? data.perNetwork : Object.fromEntries(Object.keys(NET).map((k) => [k, 0])),
      featured: data?.featured ? normalizeInfluencer(data.featured) : null,
    };
  }
  const list = getDb().influencers.filter(isListed);
  const perNetwork = Object.fromEntries(Object.keys(NET).map((k) => [k, list.filter((i) => i.net[k]).length]));
  const featured = findInfluencer('i1') ?? list[0];
  return {
    followers: list.reduce((sum, i) => sum + totalFollowers(i), 0),
    verified: list.length,
    perNetwork,
    featured: featured ? withFavorite(featured, favoriteIds()) : null,
  };
}

/**
 * Carrousel d'accueil. `reco` pondère Score PULLUP et portée ; pour un annonceur connecté,
 * bonus sur ses thématiques et ses favoris, malus sur les profils déjà engagés.
 * @param {string} filter `reco`, `montee` ou une clé de catégorie.
 */
export async function listCarousel(filter) {
  if (isRemote()) {
    const items = await request('get', '/influencers/carousel', { filter: filter || 'reco' });
    return Array.isArray(items) ? items.map(normalizeInfluencer) : [];
  }
  const S = getDb();
  const list = S.influencers.filter(isListed);
  const favs = favoriteIds();
  const done = (items) => items.map((i) => withFavorite(i, favs));
  if (filter === 'montee') return done(list.filter((i) => badge(i).k === 'montee').sort((a, b) => avgEngagement(b) - avgEngagement(a)));
  if (filter !== 'reco') return done(list.filter((i) => i.cats.includes(filter)).sort((a, b) => pullupScore(b) - pullupScore(a)));
  const session = S.session;
  const mine = session?.role === 'brand' ? S.campaigns.filter((c) => c.brandId === session.id) : [];
  const themes = new Set(mine.map((c) => c.brief?.theme).filter(Boolean));
  const used = new Set(mine.map((c) => c.infId));
  const weight = (i) => pullupScore(i)
    + Math.log10(totalFollowers(i)) * 0.35
    + (i.cats.some((c) => themes.has(c)) ? 0.6 : 0)
    + (favs.includes(i.id) ? 0.4 : 0)
    - (used.has(i.id) ? 0.3 : 0);
  return done([...list].sort((a, b) => weight(b) - weight(a)).slice(0, 12));
}

/** Vitrine publique. Renvoie `null` si le profil n'existe pas ou n'est pas encore visible. @param {string} handle */
export async function getInfluencerProfile(handle) {
  if (isRemote()) {
    try {
      return normalizeProfile(await request('get', `/influencers/${handle}`));
    } catch (error) {
      if (missingStatus(error)) return null;
      throw error;
    }
  }
  const S = getDb();
  const influencer = findByHandle(handle);
  const session = S.session;
  const own = session?.role === 'influencer' && session.id === influencer?.id;
  if (!influencer || (!isListed(influencer) && !own && session?.role !== 'admin')) return null;
  const done = S.campaigns.filter((c) => c.infId === influencer.id && c.status === 'completed');
  const reviews = [
    ...S.reviews.filter((r) => r.infId === influencer.id),
    ...done.filter((c) => c.review).map((c) => ({ brand: findBrand(c.brandId)?.name ?? 'Annonceur', stars: c.review.stars, text: c.review.text, at: c.review.at })),
  ].sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());
  const recent = done.map((c) => ({ id: c.id, brand: findBrand(c.brandId)?.name ?? 'Annonceur', fmt: c.offer.fmt, net: c.offer.net, createdAt: c.createdAt, perf: clone(c.perf) }));
  return { influencer: withFavorite(influencer, favoriteIds()), own, reviews: clone(reviews), recent };
}

/** @param {string} id */
export async function recordVisit(id) {
  if (isRemote()) return request('post', `/influencers/${id}/visits`);
  const influencer = findInfluencer(id);
  const session = currentSession();
  if (!influencer || (session?.role === 'influencer' && session.id === id)) return null;
  influencer.views[29] += 1;
  saveDb();
  return null;
}

/** @param {string} id */
export async function toggleFavorite(id) {
  if (isRemote()) return request('post', `/influencers/${id}/favorite`);
  const session = currentSession();
  if (session?.role !== 'brand') throw new Error('Connectez-vous en tant qu\'annonceur pour créer votre sélection.');
  const S = getDb();
  const list = S.favs[session.id] || (S.favs[session.id] = []);
  const index = list.indexOf(id);
  if (index >= 0) list.splice(index, 1);
  else list.push(id);
  saveDb();
  const favorite = index < 0;
  return { favorite, message: favorite ? 'Ajouté à votre sélection.' : 'Retiré de votre sélection.' };
}

/** @param {{ infId: string, from: string, contact: string, msg: string, type: string }} input */
export async function sendContactRequest(input) {
  if (isRemote()) return request('post', `/influencers/${input.infId}/requests`, toContactRequestBody(input));
  const S = getDb();
  const influencer = findInfluencer(input.infId);
  if (!influencer) throw new Error('Profil introuvable.');
  S.requests.unshift({ id: `r${Date.now().toString(36)}`, ...input, at: now() });
  influencer.contacts += 1;
  notify(influencer.id, `Nouvelle demande de ${input.type.toLowerCase()} de ${input.from}.`, '/espace?tab=demandes');
  saveDb();
  return { message: 'Demande envoyée.' };
}

/** @param {string} id @param {{ bio: string, cats: string[], days: string[], rates: { id: string, net: string, fmt: string, price: number }[] }} input */
export async function updateVitrine(id, input) {
  if (isRemote()) return request('put', `/influencers/${id}/vitrine`, toVitrineBody(input));
  const session = requireRole('influencer');
  if (session.id !== id) throw new Error('Action non autorisée pour ce compte.');
  const influencer = findInfluencer(id);
  if (!input.cats.length) throw new Error('Choisissez au moins une catégorie.');
  if (!input.rates.length) throw new Error('Gardez au moins un tarif.');
  if (input.rates.some((rate) => !rate.fmt.trim() || rate.price < MIN_RATE)) throw new Error('Chaque tarif doit avoir un format et coûter au moins 5 000 FCFA.');
  influencer.bio = input.bio.trim() || influencer.bio;
  influencer.cats = input.cats.slice(0, 3);
  influencer.days = input.days;
  influencer.rates = input.rates.map((rate) => ({ ...rate, fmt: rate.fmt.trim(), price: Math.round(rate.price) }));
  saveDb();
  return { message: 'Vitrine enregistrée.' };
}

/** @param {string} id @param {string|null} photo Data URL recadrée, ou `null` pour retirer la photo. @param {{ consent?: boolean }} [extra] */
export async function setInfluencerPhoto(id, photo, extra = {}) {
  if (isRemote()) return request('put', `/influencers/${id}/photo`, toPhotoBody(photo, extra));
  const session = currentSession();
  const allowed = session?.role === 'admin' || (session?.role === 'influencer' && session.id === id);
  if (!allowed) throw new Error('Action non autorisée pour ce compte.');
  if (session?.role === 'admin' && extra.consent !== true) {
    throw new Error("L'accord écrit de l'influenceur (droit à l'image) est obligatoire.");
  }
  const influencer = findInfluencer(id);
  const previous = influencer.photo;
  influencer.photo = photo;
  if (!saveDb()) {
    influencer.photo = previous;
    throw new Error('Stockage du navigateur plein : retirez quelques photos.');
  }
  return { message: photo ? 'Photo mise à jour.' : 'Photo retirée.' };
}

/** @param {string} id */
export async function verifyInfluencer(id) {
  if (isRemote()) return request('post', `/admin/influencers/${id}/verify`);
  requireRole('admin');
  const influencer = findInfluencer(id);
  influencer.verified = true;
  influencer.status = 'active';
  notify(id, 'Votre profil est vérifié : votre vitrine est visible dans l\'annuaire.', `/i/${influencer.handle}`);
  saveDb();
  return { message: `${influencer.name} est maintenant vérifié.` };
}

/** Corps POST /admin/influencers/:id/reject */
export function toRejectBody(reason) {
  const motif = String(reason ?? '').trim();
  return motif ? { reason: motif } : {};
}

/** @param {string} id @param {string} [reason] */
export async function rejectInfluencer(id, reason) {
  if (isRemote()) return request('post', `/admin/influencers/${id}/reject`, toRejectBody(reason));
  requireRole('admin');
  const influencer = findInfluencer(id);
  influencer.status = 'rejected';
  saveDb();
  return { message: 'Profil refusé.' };
}
