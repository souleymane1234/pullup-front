import { MIN_RATE } from '@/domain/catalog.js';
import { avatarOf, firstName } from '@/domain/metrics.js';
import { getDb, saveDb } from './demo/db.js';
import { findBrand, findByHandle, findInfluencer, notify } from './demo/model.js';
import { isRemote, request } from './remote.js';

/**
 * @typedef {{ name: string, hue: number, photo?: string|null, verified?: boolean }} AvatarInfo
 * @typedef {{ role: 'brand'|'influencer'|'admin', id: string, name: string, email: string, contact?: string, plan?: string, handle?: string, avatar: AvatarInfo }} Session
 */

/** @returns {Session|null} */
function describeSession() {
  const session = getDb().session;
  if (!session) return null;
  if (session.role === 'brand') {
    const brand = findBrand(session.id);
    if (!brand) return null;
    return {
      role: 'brand', id: brand.id, name: brand.name, email: brand.email, contact: brand.contact, plan: brand.plan,
      avatar: { name: brand.name, hue: 20 },
    };
  }
  if (session.role === 'influencer') {
    const influencer = findInfluencer(session.id);
    if (!influencer) return null;
    return {
      role: 'influencer', id: influencer.id, name: influencer.name, handle: influencer.handle,
      email: influencer.email || `${influencer.handle}@mail.ci`, avatar: avatarOf(influencer),
    };
  }
  return { role: 'admin', id: 'admin', name: 'Admin PULLUP', email: 'admin@pullup.net', avatar: { name: 'Admin PULLUP', hue: 280 } };
}

/** @returns {Promise<Session|null>} */
export async function getSession() {
  if (isRemote()) {
    try {
      const session = await request('get', '/auth/session');
      return session ?? null;
    } catch (error) {
      if (error instanceof Error && /** @type {{ status?: number }} */ (error).status === 401) return null;
      throw error;
    }
  }
  return describeSession();
}

export async function listDemoAccounts() {
  const ama = findInfluencer('i1');
  return [
    { role: 'brand', id: 'b1', title: 'Savane Cosmetics', desc: 'Annonceur · formule Pro', avatar: { name: 'Savane Cosmetics', hue: 20 } },
    { role: 'brand', id: 'b2', title: 'Maquis Le Palmier', desc: 'Annonceur · formule Découverte (gratuite)', avatar: { name: 'Maquis Le Palmier', hue: 140 } },
    { role: 'brand', id: 'b3', title: 'Kalo Fintech', desc: 'Annonceur · formule Business', avatar: { name: 'Kalo Fintech', hue: 200 } },
    { role: 'influencer', id: 'i1', title: ama?.name ?? 'Ama Kouassi', desc: 'Influenceuse · portefeuille & demandes', avatar: ama ? avatarOf(ama) : { name: 'Ama Kouassi', hue: 47 } },
    { role: 'admin', id: 'admin', title: 'Administrateur', desc: 'Back-office PULLUP', avatar: { name: 'Admin PULLUP', hue: 280 } },
  ];
}

/** @param {{ role: Session['role'], id: string }} account */
export async function loginAs(account) {
  if (isRemote()) {
    try {
      return await request('post', '/auth/demo', account);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Connexion démo impossible.';
      const hint = 'Utilisez votre e-mail et votre mot de passe.';
      const status = /** @type {{ status?: number }} */ (error).status;
      throw Object.assign(new Error(message.includes(hint) ? message : `${message} ${hint}`), { status });
    }
  }
  getDb().session = { role: account.role, id: account.id };
  saveDb();
  const session = describeSession();
  return { session, message: `Connecté : ${session?.name ?? ''}` };
}

/** @param {{ email: string, password: string }} credentials */
export async function login(credentials) {
  if (isRemote()) return request('post', '/auth/login', credentials);
  const S = getDb();
  const email = credentials.email.trim().toLowerCase();
  const brand = S.brands.find((b) => b.email.toLowerCase() === email);
  const influencer = S.influencers.find((i) => (i.email || `${i.handle}@mail.ci`).toLowerCase() === email);
  if (email === 'admin@pullup.net') return loginAs({ role: 'admin', id: 'admin' });
  if (brand) return loginAs({ role: 'brand', id: brand.id });
  if (influencer) return loginAs({ role: 'influencer', id: influencer.id });
  throw new Error('Identifiants incorrects.');
}

/** @param {string} email */
export async function forgotPassword(email) {
  if (isRemote()) return request('post', '/auth/password/forgot', { email });
  return { message: "Si un compte existe, un e-mail vient d'être envoyé." };
}

/** @param {{ token: string, password: string }} input */
export async function resetPassword(input) {
  if (isRemote()) return request('post', '/auth/password/reset', input);
  return { message: 'Mot de passe modifié.' };
}

export async function logout() {
  if (isRemote()) return request('post', '/auth/logout');
  getDb().session = null;
  saveDb();
  return { message: 'Déconnecté.' };
}

/** Export RGPD du compte connecté. */
export async function exportMyData() {
  if (isRemote()) return request('get', '/me/export');
  const session = describeSession();
  if (!session) throw new Error('Connectez-vous pour continuer.');
  if (session.role === 'brand') {
    const brand = findBrand(session.id);
    return {
      user: { id: session.id, email: session.email, role: 'brand', createdAt: null },
      brand: brand
        ? { id: brand.id, name: brand.name, contact: brand.contact, plan: brand.plan, sector: brand.sector }
        : null,
      influencer: null,
    };
  }
  if (session.role === 'influencer') {
    const influencer = findInfluencer(session.id);
    return {
      user: { id: influencer?.id ?? session.id, email: session.email, role: 'influencer', createdAt: null },
      brand: null,
      influencer: influencer
        ? { id: influencer.id, handle: influencer.handle, name: influencer.name, phone: influencer.phone, city: influencer.city }
        : null,
    };
  }
  return {
    user: { id: 'admin', email: session.email, role: 'admin', createdAt: null },
    brand: null,
    influencer: null,
  };
}

/** Supprime le compte connecté après confirmation du mot de passe. @param {string} password */
export async function deleteMyAccount(password) {
  const secret = String(password ?? '');
  if (!secret) throw new Error('Saisissez votre mot de passe.');
  if (isRemote()) return request('delete', '/me', { password: secret });
  if (!describeSession()) throw new Error('Connectez-vous pour continuer.');
  getDb().session = null;
  saveDb();
  return { message: 'Compte supprimé.' };
}

/** @param {{ company: string, contact: string, email: string, password: string }} input */
export async function signupBrand(input) {
  if (isRemote()) return request('post', '/auth/signup/brand', input);
  const S = getDb();
  const id = `b${Date.now().toString(36)}`;
  S.brands.push({ id, name: input.company.trim(), contact: input.contact.trim(), email: input.email.trim().toLowerCase(), plan: 'free', sector: '', balance: 0 });
  S.session = { role: 'brand', id };
  saveDb();
  return { session: describeSession(), message: `Bienvenue sur PULLUP, ${firstName(input.contact.trim())} !` };
}

/** @param {string} handle */
export async function isHandleAvailable(handle) {
  if (isRemote()) return (await request('get', '/auth/handle', { handle })).available;
  return !findByHandle(handle);
}

function toInfluencerSignupBody(input) {
  const nets = Object.fromEntries(
    Object.entries(input.nets || {})
      .map(([key, value]) => [key, Number(value) || 0])
      .filter(([, value]) => value > 0),
  );
  return {
    name: input.name,
    handle: input.handle,
    email: input.email,
    password: input.password,
    phone: input.phone || '',
    city: input.city,
    bio: input.bio || '',
    photo: input.photo || null,
    nets,
    cats: input.cats,
    accepts: input.accepts,
    price: Number(input.price),
  };
}

/**
 * Crée un profil influenceur en attente de vérification.
 * @param {{ name: string, handle: string, email: string, password: string, phone: string, city: string, bio: string, photo: string|null,
 *   nets: Record<string, number>, cats: string[], accepts: { pub: boolean, partenariat: boolean, dedicace: boolean }, price: number }} input
 */
export async function signupInfluencer(input) {
  if (isRemote()) return request('post', '/auth/signup/influencer', toInfluencerSignupBody(input));
  if (findByHandle(input.handle)) throw new Error('Ce nom d\'utilisateur est déjà pris.');
  if (input.price < MIN_RATE) throw new Error('Prix minimum 5 000 FCFA.');
  const S = getDb();
  const id = `i${S.influencers.length + 1}${Date.now() % 1000}`;
  const net = Object.fromEntries(Object.entries(input.nets).filter(([, v]) => v > 0).map(([k, v]) => [k, [v, 4]]));
  const first = Object.keys(net)[0];
  const rates = [{ id: `${id}r0`, net: first, fmt: 'Story / post', price: input.price }];
  if (input.accepts.dedicace) rates.push({ id: `${id}r1`, net: first, fmt: 'Dédicace vidéo', price: Math.round((input.price * 0.6) / 500) * 500 || MIN_RATE });
  const name = input.name.trim();
  S.influencers.push({
    id, handle: input.handle, name, email: input.email.toLowerCase(), phone: input.phone, city: input.city, cats: input.cats,
    bio: 'Nouveau sur PULLUP. Présentez votre univers depuis votre espace.', net,
    aud: { f: 55, ages: [10, 45, 32, 13], cities: [[input.city === 'Autre' ? 'Abidjan' : input.city, 60], ['Autres', 40]] },
    auth: 90, creat: 4, brief: 90, onTime: 90, rating: 5, reviews: 0, done: 0, rates, days: ['Lun', 'Mer', 'Ven'],
    verified: false, certified: false, status: 'pending', accepts: input.accepts,
    views: Array(30).fill(0), qr: 0, contacts: 0, hue: Math.floor(Math.random() * 360), photo: input.photo || null,
  });
  notify('admin', `Nouvelle inscription à vérifier : ${name}.`, '/admin?tab=verif');
  S.session = { role: 'influencer', id };
  saveDb();
  return { session: describeSession(), message: 'Vitrine créée ! Vérification sous 48 h.' };
}
