import { CATS, CITIES, OBJ, RECO_BY_OBJECTIVE, RELATED } from '@/domain/catalog.js';
import { getDb, saveDb, clone } from './demo/db.js';
import { requireRole } from './demo/model.js';
import { isRemote, request } from './remote.js';

export const CATALOG_KINDS = ['category', 'city', 'objective', 'contact_type'];

const GROUP_OF = {
  category: 'categories',
  city: 'cities',
  objective: 'objectives',
  contact_type: 'contactTypes',
};

const MESSAGES = {
  category: ['Catégorie créée.', 'Catégorie mise à jour.', 'Catégorie masquée.'],
  city: ['Ville créée.', 'Ville mise à jour.', 'Ville masquée.'],
  objective: ['Objectif créé.', 'Objectif mis à jour.', 'Objectif masqué.'],
  contact_type: ['Type de demande créé.', 'Type de demande mis à jour.', 'Type de demande masqué.'],
};

function normalizeItem(item, kind) {
  return {
    kind: item?.kind ?? kind,
    key: String(item?.key ?? ''),
    label: String(item?.label ?? item?.key ?? ''),
    related: Array.isArray(item?.related) ? item.related : [],
    reco: item?.reco ?? null,
    sortOrder: Number(item?.sortOrder) || 0,
    active: item?.active !== false,
  };
}

function normalizeCatalog(data) {
  const list = (group, kind) => (Array.isArray(data?.[group]) ? data[group] : [])
    .map((item) => normalizeItem(item, kind))
    .sort((a, b) => a.sortOrder - b.sortOrder || a.label.localeCompare(b.label, 'fr'));
  return {
    categories: list('categories', 'category'),
    cities: list('cities', 'city'),
    objectives: list('objectives', 'objective'),
    contactTypes: list('contactTypes', 'contact_type'),
  };
}

/** Corps POST /admin/catalog : la clé est facultative (déduite du libellé côté serveur). */
export function toCatalogCreateBody(input) {
  const body = { kind: input.kind, label: String(input.label ?? '').trim() };
  const key = String(input.key ?? '').trim();
  if (key) body.key = input.kind === 'category' ? key.toLowerCase() : key;
  if (input.kind === 'category') body.related = Array.isArray(input.related) ? input.related : [];
  if (input.kind === 'objective' && String(input.reco ?? '').trim()) body.reco = String(input.reco).trim();
  return body;
}

/** Corps PUT /admin/catalog/:kind/:key : seuls les champs pertinents pour le type. */
export function toCatalogUpdateBody(kind, input) {
  const body = {};
  if (input.label !== undefined) body.label = String(input.label).trim();
  if (kind === 'category' && input.related !== undefined) body.related = input.related;
  if (kind === 'objective' && input.reco !== undefined) body.reco = String(input.reco ?? '').trim() || null;
  if (input.active !== undefined) body.active = Boolean(input.active);
  return body;
}

function demoCatalog() {
  const S = getDb();
  if (!S.catalog) {
    const items = [
      ...Object.entries(CATS).map(([key, cat], i) => ({ kind: 'category', key, label: cat.l, related: RELATED[key] ?? [], sortOrder: i, active: true })),
      ...CITIES.map((city, i) => ({ kind: 'city', key: city, label: city, sortOrder: i, active: true })),
      ...Object.entries(OBJ).map(([key, label], i) => ({ kind: 'objective', key, label, reco: RECO_BY_OBJECTIVE[key] ?? null, sortOrder: i, active: true })),
      ...['Publicité', 'Partenariat', 'Dédicace'].map((label, i) => ({ kind: 'contact_type', key: label, label, sortOrder: i, active: true })),
    ];
    S.catalog = items;
  }
  return S.catalog;
}

function demoGrouped() {
  const groups = { categories: [], cities: [], objectives: [], contactTypes: [] };
  for (const item of demoCatalog()) groups[GROUP_OF[item.kind]].push(clone(item));
  return normalizeCatalog(groups);
}

function demoFind(kind, key) {
  const item = demoCatalog().find((row) => row.kind === kind && row.key === key);
  if (!item) throw new Error('Élément introuvable.');
  return item;
}

function demoAssertNotLast(kind, key) {
  const others = demoCatalog().filter((row) => row.kind === kind && row.active && row.key !== key);
  if (!others.length) throw new Error('Gardez au moins un élément actif.');
}

/** Catalogue complet, éléments masqués inclus. */
export async function getAdminCatalog() {
  if (isRemote()) return normalizeCatalog(await request('get', '/admin/catalog'));
  requireRole('admin');
  return demoGrouped();
}

/** @param {{ kind: string, key?: string, label: string, related?: string[], reco?: string }} input */
export async function createCatalogItem(input) {
  const body = toCatalogCreateBody(input);
  if (!CATALOG_KINDS.includes(body.kind)) throw new Error("Type d'élément inconnu.");
  if (body.label.length < 2) throw new Error('Indiquez un libellé.');
  if (isRemote()) return request('post', '/admin/catalog', body);
  requireRole('admin');
  const key = body.key || (body.kind === 'category'
    ? body.label.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '')
    : body.label);
  if (demoCatalog().some((row) => row.kind === body.kind && row.key === key)) throw new Error('Cette clé existe déjà.');
  const sortOrder = demoCatalog().filter((row) => row.kind === body.kind).reduce((max, row) => Math.max(max, row.sortOrder), -1) + 1;
  const item = { kind: body.kind, key, label: body.label, related: body.related ?? [], reco: body.reco ?? null, sortOrder, active: true };
  demoCatalog().push(item);
  saveDb();
  return { message: MESSAGES[body.kind][0], item: clone(item) };
}

/** @param {string} kind @param {string} key @param {{ label?: string, related?: string[], reco?: string|null, active?: boolean }} input */
export async function updateCatalogItem(kind, key, input) {
  const body = toCatalogUpdateBody(kind, input);
  if (isRemote()) return request('put', `/admin/catalog/${kind}/${encodeURIComponent(key)}`, body);
  requireRole('admin');
  const item = demoFind(kind, key);
  if (body.active === false && item.active) demoAssertNotLast(kind, key);
  Object.assign(item, body);
  saveDb();
  return { message: MESSAGES[kind][1], item: clone(item) };
}

const CONTACT_TYPES = ['Publicité', 'Partenariat', 'Dédicace'];

/** Catalogue public statique, même forme que `GET /catalog` normalisé. */
export function staticPublicCatalog() {
  return {
    cats: Object.fromEntries(Object.entries(CATS).map(([key, cat]) => [key, { l: cat.l, e: cat.e }])),
    cities: [...CITIES],
    objectives: { ...OBJ },
    related: RELATED,
    reco: RECO_BY_OBJECTIVE,
    contactTypes: [...CONTACT_TYPES],
  };
}

function normalizePublicCatalog(data) {
  const fallback = staticPublicCatalog();
  const source = data?.cats && typeof data.cats === 'object' ? data.cats : {};
  const cats = {};
  for (const [key, label] of Object.entries(source)) {
    const text = typeof label === 'string' ? label : String(label?.l ?? key);
    cats[key] = { l: text, e: CATS[key]?.e ?? '•' };
  }
  const objectives = data?.obj && typeof data.obj === 'object' && Object.keys(data.obj).length
    ? data.obj
    : fallback.objectives;
  return {
    cats: Object.keys(cats).length ? cats : fallback.cats,
    cities: Array.isArray(data?.cities) && data.cities.length ? data.cities.map(String) : fallback.cities,
    objectives,
    related: data?.related && typeof data.related === 'object' ? data.related : fallback.related,
    reco: data?.reco && typeof data.reco === 'object' ? data.reco : fallback.reco,
    contactTypes: Array.isArray(data?.contactTypes) && data.contactTypes.length
      ? data.contactTypes.map(String)
      : fallback.contactTypes,
  };
}

/** Listes actives : thématiques, villes, objectifs et types de demande. */
export async function getPublicCatalog() {
  if (isRemote()) return normalizePublicCatalog(await request('get', '/catalog'));
  return staticPublicCatalog();
}

/** Masque un élément (il n'est jamais supprimé). @param {string} kind @param {string} key */
export async function hideCatalogItem(kind, key) {
  if (isRemote()) return request('delete', `/admin/catalog/${kind}/${encodeURIComponent(key)}`);
  requireRole('admin');
  const item = demoFind(kind, key);
  if (item.active) demoAssertNotLast(kind, key);
  item.active = false;
  saveDb();
  return { message: MESSAGES[kind][2], item: clone(item) };
}
