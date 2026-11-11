import { clone, getDb, resetDb, saveDb } from './demo/db.js';
import { currentSession, requireRole } from './demo/model.js';
import { isRemote, request } from './remote.js';

function authStatus(error) {
  return /** @type {{ status?: number }} */ (error).status === 401;
}

function normalizePlatform(data) {
  const flags = data?.flags && typeof data.flags === 'object' ? data.flags : {};
  return {
    flags: {
      v2: Boolean(flags.v2),
      v3: Boolean(flags.v3),
    },
    onboarded: Boolean(data?.onboarded),
  };
}

function normalizeNotifications(data) {
  if (!Array.isArray(data)) return [];
  return data.map((item) => ({
    to: item.to || '',
    t: item.t || '',
    at: item.at || '',
    r: Boolean(item.r),
    link: item.link || '/',
  }));
}

/** Corps PUT /me/preferences : seul `onboarded: true` est accepté. */
export function toPreferencesBody() {
  return { onboarded: true };
}

/** @returns {Promise<{ flags: { v2: boolean, v3: boolean }, onboarded: boolean }>} */
export async function getPlatform() {
  if (isRemote()) return normalizePlatform(await request('get', '/platform'));
  const S = getDb();
  return { flags: clone(S.flags), onboarded: Boolean(S.onboarded) };
}

/** Corps PUT /admin/flags/:key */
export function toFlagBody(value) {
  return { value: Boolean(value) };
}

/** @param {'v2'|'v3'} key @param {boolean} value */
export async function setFlag(key, value) {
  if (key !== 'v2' && key !== 'v3') throw new Error('Introuvable.');
  if (isRemote()) return request('put', `/admin/flags/${key}`, toFlagBody(value));
  requireRole('admin');
  const S = getDb();
  S.flags[key] = value;
  saveDb();
  if (key === 'v2' && !value) return { message: 'V2 désactivée : les vitrines repassent en mode demande de devis.' };
  return { message: `${key.toUpperCase()} ${value ? 'activée' : 'désactivée'} sur toute la plateforme.` };
}

export async function completeOnboarding() {
  if (isRemote()) {
    try {
      return await request('put', '/me/preferences', toPreferencesBody());
    } catch (error) {
      if (authStatus(error)) return null;
      throw error;
    }
  }
  getDb().onboarded = true;
  saveDb();
  return null;
}

export async function resetDemo() {
  if (isRemote()) throw new Error('Réinitialisation indisponible hors démonstration.');
  requireRole('admin');
  resetDb();
  return { message: 'Démo réinitialisée.' };
}

export async function listNotifications() {
  if (isRemote()) {
    try {
      return normalizeNotifications(await request('get', '/notifications'));
    } catch (error) {
      if (authStatus(error)) return [];
      throw error;
    }
  }
  const session = currentSession();
  if (!session) return [];
  const key = session.role === 'admin' ? 'admin' : session.id;
  return clone(getDb().notifs.filter((n) => n.to === key));
}

export async function markNotificationsRead() {
  if (isRemote()) {
    try {
      return await request('post', '/notifications/read');
    } catch (error) {
      if (authStatus(error)) return null;
      throw error;
    }
  }
  const session = currentSession();
  if (!session) return null;
  const key = session.role === 'admin' ? 'admin' : session.id;
  getDb().notifs.forEach((n) => {
    if (n.to === key) n.r = true;
  });
  saveDb();
  return null;
}
