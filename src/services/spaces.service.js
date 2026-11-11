import { PLANS } from '@/domain/catalog.js';
import { http } from '@/lib/http.js';
import { clone, getDb, saveDb } from './demo/db.js';
import { escrowOf, findBrand, findInfluencer, joinCampaign, requireRole, walletOf } from './demo/model.js';
import { isRemote, request } from './remote.js';

function padViews(views) {
  const list = Array.isArray(views) ? views.map(Number) : [];
  if (list.length >= 30) return list.slice(-30);
  return [...Array(30 - list.length).fill(0), ...list];
}

function normalizeBrandSpace(data) {
  return {
    brand: data?.brand ?? null,
    campaigns: Array.isArray(data?.campaigns) ? data.campaigns : [],
    favorites: Array.isArray(data?.favorites)
      ? data.favorites.map((item) => ({ ...item, favorite: true }))
      : [],
  };
}

function normalizeInfluencerSpace(data) {
  const influencer = data?.influencer
    ? { ...data.influencer, views: padViews(data.influencer.views) }
    : null;
  return {
    influencer,
    campaigns: Array.isArray(data?.campaigns) ? data.campaigns : [],
    requests: Array.isArray(data?.requests) ? data.requests : [],
    wallet: {
      available: data?.wallet?.available ?? 0,
      tx: Array.isArray(data?.wallet?.tx) ? data.wallet.tx : [],
    },
    escrow: data?.escrow ?? 0,
  };
}

/** Espace annonceur : compte, campagnes et sélection. */
export async function getBrandSpace() {
  if (isRemote()) return normalizeBrandSpace(await request('get', '/me/brand-space'));
  const session = requireRole('brand');
  const S = getDb();
  const favs = S.favs[session.id] || [];
  return normalizeBrandSpace({
    brand: clone(findBrand(session.id)),
    campaigns: S.campaigns.filter((c) => c.brandId === session.id).map(joinCampaign),
    favorites: favs.map(findInfluencer).filter(Boolean).map((i) => ({ ...clone(i), favorite: true })),
  });
}

/** Espace influenceur : profil, campagnes, demandes et portefeuille. */
export async function getInfluencerSpace() {
  if (isRemote()) return normalizeInfluencerSpace(await request('get', '/me/influencer-space'));
  const session = requireRole('influencer');
  const S = getDb();
  return normalizeInfluencerSpace({
    influencer: clone(findInfluencer(session.id)),
    campaigns: S.campaigns.filter((c) => c.infId === session.id).map(joinCampaign),
    requests: clone(S.requests.filter((r) => r.infId === session.id)),
    wallet: clone(walletOf(session.id)),
    escrow: escrowOf(session.id),
  });
}

/** @param {{ name: string, contact: string, sector: string }} input */
export async function updateBrandProfile(input) {
  const payload = {
    name: input.name.trim(),
    contact: input.contact.trim(),
    sector: (input.sector || '').trim(),
  };
  if (isRemote()) return request('put', '/me/brand', payload);
  const session = requireRole('brand');
  const brand = findBrand(session.id);
  brand.name = payload.name;
  brand.contact = payload.contact;
  brand.sector = payload.sector;
  saveDb();
  return { message: 'Profil enregistré.' };
}

/** Export CSV des campagnes (formule Business côté API). @returns {Promise<Blob>} */
export async function downloadCampaignsCsv() {
  const response = await http.request({
    method: 'get',
    url: '/me/campaigns.csv',
    responseType: 'blob',
    headers: { Accept: 'text/csv' },
  });
  const type = String(response.headers['content-type'] || '');
  if (type.includes('application/json')) {
    const parsed = JSON.parse(await response.data.text());
    throw Object.assign(new Error(parsed.message || 'Export réservé à la formule Business.'), { status: 403 });
  }
  return response.data;
}

export const canExportCampaignsCsv = (plan) => Boolean(PLANS[plan]?.exportCsv);
