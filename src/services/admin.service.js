import { HELD_STATUSES, REFUNDED_STATUSES } from '@/domain/catalog.js';
import { formatFcfa } from '@/lib/format.js';
import { http } from '@/lib/http.js';
import { clone, getDb, saveDb } from './demo/db.js';
import { findBrand, findInfluencer, joinCampaign, now, notify, requireRole } from './demo/model.js';
import { isRemote, request } from './remote.js';

function compactQuery(params) {
  return Object.fromEntries(Object.entries(params).filter(([, value]) => value !== '' && value != null));
}

/** Corps POST /admin/influencers/:id/suspend */
export function toSuspendBody(reason) {
  return { reason: String(reason ?? '').trim() };
}

/** Corps PUT /admin/influencers/:id/scores */
export function toScoresBody(scores = {}) {
  const payload = {};
  if (scores.auth != null && scores.auth !== '') payload.auth = Math.round(Number(scores.auth));
  if (scores.creat != null && scores.creat !== '') payload.creat = Number(scores.creat);
  if (scores.brief != null && scores.brief !== '') payload.brief = Math.round(Number(scores.brief));
  if (scores.onTime != null && scores.onTime !== '') payload.onTime = Math.round(Number(scores.onTime));
  return payload;
}

/** Corps POST /admin/brands/:id/credit */
export function toCreditBody(input) {
  return {
    amount: Math.round(Number(input.amount)),
    reason: String(input.reason ?? '').trim(),
  };
}

function demoAudit() {
  const S = getDb();
  if (!Array.isArray(S.audit)) S.audit = [];
  return S.audit;
}

function recordAudit(action, targetType, targetId, data = {}) {
  demoAudit().unshift({
    id: `a${Date.now().toString(36)}`,
    actorUserId: 'admin',
    action,
    targetType,
    targetId,
    data,
    ip: null,
    createdAt: now(),
  });
}

function demoWithdrawals() {
  const S = getDb();
  if (!Array.isArray(S.withdrawals)) S.withdrawals = [];
  return S.withdrawals;
}

function normalizeDashboard(data) {
  return {
    campaigns: Array.isArray(data?.campaigns) ? data.campaigns : [],
    influencers: Array.isArray(data?.influencers) ? data.influencers : [],
    brands: Array.isArray(data?.brands) ? data.brands : [],
    flags: {
      v2: Boolean(data?.flags?.v2),
      v3: Boolean(data?.flags?.v3),
    },
  };
}

function normalizeWithdrawal(row) {
  return {
    ...row,
    influencer: row.influencer ?? { id: row.influencerId, name: 'Influenceur', handle: '' },
    amount: Number(row.amount) || 0,
    status: row.status || 'pending',
  };
}

function normalizeAudit(row) {
  return {
    id: row.id,
    actorUserId: row.actorUserId || '',
    action: row.action || '',
    targetType: row.targetType || '',
    targetId: row.targetId || '',
    data: row.data && typeof row.data === 'object' ? row.data : {},
    ip: row.ip || '',
    createdAt: row.createdAt || '',
  };
}

/** Vue d'ensemble du back-office : campagnes, profils, annonceurs et options. */
export async function getAdminDashboard() {
  if (isRemote()) return normalizeDashboard(await request('get', '/admin/dashboard'));
  requireRole('admin');
  const S = getDb();
  return normalizeDashboard({
    campaigns: S.campaigns.map(joinCampaign),
    influencers: clone(S.influencers),
    brands: clone(S.brands),
    flags: clone(S.flags),
  });
}

/** @param {string} id @param {string} reason */
export async function suspendInfluencer(id, reason) {
  const { reason: motif } = toSuspendBody(reason);
  if (!motif) throw new Error('Indiquez le motif de la suspension.');
  if (isRemote()) return request('post', `/admin/influencers/${id}/suspend`, { reason: motif });
  requireRole('admin');
  const influencer = findInfluencer(id);
  if (!influencer) throw new Error('Profil introuvable.');
  const before = influencer.status;
  influencer.status = 'suspended';
  notify(id, `Votre vitrine a été masquée. Motif : ${motif}`, '/espace');
  recordAudit('influencer_suspend', 'Influencer', id, { before: { status: before }, after: { status: 'suspended' }, reason: motif });
  saveDb();
  return { message: 'Profil masqué.' };
}

/** @param {string} id */
export async function certifyInfluencer(id) {
  if (isRemote()) return request('post', `/admin/influencers/${id}/certify`);
  requireRole('admin');
  const influencer = findInfluencer(id);
  if (!influencer) throw new Error('Profil introuvable.');
  influencer.certified = true;
  notify(id, 'Votre badge Certifié est activé.', `/i/${influencer.handle}`);
  recordAudit('influencer_certify', 'Influencer', id, { before: { certified: false }, after: { certified: true } });
  saveDb();
  return { message: `${influencer.name} est maintenant certifié.` };
}

/** @param {string} id @param {{ auth?: number, creat?: number, brief?: number, onTime?: number }} scores */
export async function updateInfluencerScores(id, scores) {
  const payload = toScoresBody(scores);
  if (isRemote()) return request('put', `/admin/influencers/${id}/scores`, payload);
  requireRole('admin');
  const influencer = findInfluencer(id);
  if (!influencer) throw new Error('Profil introuvable.');
  const before = { auth: influencer.auth, creat: influencer.creat, brief: influencer.brief, onTime: influencer.onTime };
  Object.assign(influencer, payload);
  recordAudit('influencer_scores', 'Influencer', id, { before, after: { auth: influencer.auth, creat: influencer.creat, brief: influencer.brief, onTime: influencer.onTime } });
  saveDb();
  return { message: 'Statistiques mises à jour.' };
}

/** Synthèse financière : séquestre, commissions du mois, retraits, écarts. */
export async function getFinanceSummary() {
  if (isRemote()) {
    const data = await request('get', '/admin/finance/summary');
    return {
      escrow: Number(data?.escrow) || 0,
      commissionsMonth: Number(data?.commissionsMonth) || 0,
      pendingWithdrawals: Number(data?.pendingWithdrawals) || 0,
      gaps: Array.isArray(data?.gaps) ? data.gaps : [],
    };
  }
  requireRole('admin');
  const S = getDb();
  const campaigns = S.campaigns;
  const month = new Date().getMonth();
  const year = new Date().getFullYear();
  return {
    escrow: campaigns.filter((c) => HELD_STATUSES.includes(c.status)).reduce((sum, c) => sum + c.amount, 0),
    commissionsMonth: campaigns
      .filter((c) => c.status === 'completed' && new Date(c.log?.at(-1)?.at || c.createdAt).getMonth() === month && new Date(c.log?.at(-1)?.at || c.createdAt).getFullYear() === year)
      .reduce((sum, c) => sum + c.fee, 0),
    pendingWithdrawals: demoWithdrawals().filter((w) => w.status === 'pending').reduce((sum, w) => sum + w.amount, 0),
    gaps: [],
  };
}

/** Export CSV du grand livre. @param {{ from?: string, to?: string }} [range] @returns {Promise<Blob>} */
export async function downloadLedgerCsv(range = {}) {
  if (isRemote()) {
    const response = await http.request({
      method: 'get',
      url: '/admin/finance/ledger.csv',
      params: compactQuery(range),
      responseType: 'blob',
      headers: { Accept: 'text/csv' },
    });
    const type = String(response.headers['content-type'] || '');
    if (type.includes('application/json')) {
      const parsed = JSON.parse(await response.data.text());
      throw Object.assign(new Error(parsed.message || 'Export impossible.'), { status: 403 });
    }
    return response.data;
  }
  requireRole('admin');
  const header = 'Date,Écriture,Compte,Compte id,Campagne,Sens,Montant FCFA,Libellé';
  const lines = getDb().campaigns
    .filter((c) => !REFUNDED_STATUSES.includes(c.status))
    .map((c) => `${c.createdAt},${c.id},escrow,${c.id},${c.id},credit,${c.amount},"Campagne ${c.ref}"`);
  return new Blob([`${header}\n${lines.join('\n')}`], { type: 'text/csv;charset=utf-8' });
}

/** @param {'pending'|'sent'|'failed'|''} [status] */
export async function listWithdrawals(status) {
  if (isRemote()) {
    const rows = await request('get', '/admin/withdrawals', compactQuery({ status: status || undefined }));
    return Array.isArray(rows) ? rows.map(normalizeWithdrawal) : [];
  }
  requireRole('admin');
  const list = clone(demoWithdrawals());
  const filtered = status ? list.filter((row) => row.status === status) : list;
  return filtered.map(normalizeWithdrawal);
}

/** @param {string} id */
export async function retryWithdrawal(id) {
  if (isRemote()) return request('post', `/admin/withdrawals/${id}/retry`);
  requireRole('admin');
  const withdrawal = demoWithdrawals().find((row) => row.id === id);
  if (!withdrawal) throw new Error('Introuvable.');
  if (withdrawal.status !== 'failed') throw new Error('Seuls les retraits échoués peuvent être relancés.');
  withdrawal.status = 'pending';
  recordAudit('withdrawal_retry', 'Withdrawal', id, { before: { status: 'failed' }, after: { status: 'pending' } });
  saveDb();
  return { message: 'Retrait relancé.' };
}

/** @param {{ actor?: string, target?: string }} [filters] */
export async function listAuditLog(filters = {}) {
  if (isRemote()) {
    const rows = await request('get', '/admin/audit', compactQuery({ actor: filters.actor, target: filters.target }));
    return Array.isArray(rows) ? rows.map(normalizeAudit) : [];
  }
  requireRole('admin');
  let list = clone(demoAudit());
  if (filters.actor) list = list.filter((row) => row.actorUserId.includes(filters.actor));
  if (filters.target) list = list.filter((row) => row.targetId.includes(filters.target) || row.targetType.toLowerCase().includes(filters.target.toLowerCase()));
  return list.map(normalizeAudit);
}

/** @param {string} id @param {{ amount: number, reason: string }} input */
export async function creditBrand(id, input) {
  const { amount, reason } = toCreditBody(input);
  if (!Number.isInteger(amount) || amount <= 0) throw new Error('Le montant doit être un entier en FCFA.');
  if (!reason) throw new Error('Indiquez le motif du geste commercial.');
  if (isRemote()) return request('post', `/admin/brands/${id}/credit`, { amount, reason });
  requireRole('admin');
  const brand = findBrand(id);
  if (!brand) throw new Error('Profil introuvable.');
  const before = brand.balance;
  brand.balance += amount;
  recordAudit('brand_credit', 'Brand', id, { before: { balance: before }, after: { balance: brand.balance }, reason, amount });
  saveDb();
  return { message: `${formatFcfa(amount)} crédités.` };
}
