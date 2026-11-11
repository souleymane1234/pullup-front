import { createSeed } from './seed.js';

/** Clé partagée avec l'ancienne démo : les données déjà saisies sont conservées. */
const KEY = 'pullup_demo_v4';

/** @type {any} */
let state = null;

const toPath = (link) => (typeof link === 'string' ? link.replace(/^#/, '') : link);

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || parsed.v !== 4) return null;
    parsed.notifs = (parsed.notifs || []).map((n) => ({ ...n, link: toPath(n.link) }));
    return parsed;
  } catch {
    return null;
  }
}

export function getDb() {
  if (!state) state = load() ?? createSeed();
  return state;
}

/** @returns {boolean} `false` si le stockage du navigateur est plein. */
export function saveDb() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}

export function resetDb() {
  const onboarded = getDb().onboarded;
  state = createSeed();
  state.onboarded = onboarded;
  saveDb();
}

/** Copie profonde : les composants ne doivent jamais muter l'état de la base. */
export const clone = (value) => (value === undefined ? value : structuredClone(value));
