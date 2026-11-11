import { http, HttpResponse } from 'msw';

const API = 'http://localhost:3000/api';

const ama = {
  id: 'i1',
  handle: 'amakouassi',
  name: 'Ama Kouassi',
  city: 'Abidjan · Cocody',
  cats: ['beaute', 'societe'],
  bio: 'Je partage mes routines beauté, mes bons plans mode et la vie à Abidjan.',
  net: { ig: [412000, 5.8], tt: [268000, 7.4] },
  aud: { f: 74, ages: [9, 47, 33, 11], cities: [['Abidjan', 64], ['Bouaké', 8]] },
  auth: 94, creat: 4.6, brief: 96, onTime: 98, rating: 4.8, reviews: 61, done: 47,
  rates: [{ id: 'i1r0', net: 'ig', fmt: 'Story (24 h)', price: 35000 }],
  days: ['Lun', 'Jeu'],
  verified: true, certified: true, featured: false, analytics: false, status: 'active',
  accepts: { pub: true, partenariat: true, dedicace: true },
  views: [378, 319, 366, 364, 345, 401, 318],
  qr: 821, contacts: 106, hue: 47, photo: null, favorite: false,
};

const yao = { ...ama, id: 'i3', handle: 'yaotech', name: 'Yao Tech', city: 'Abidjan · Plateau', cats: ['tech', 'business'] };

const influencers = [
  { id: 'i1', name: 'Ama Kouassi', handle: 'amakouassi', city: 'Abidjan', favorite: false },
  { id: 'i2', name: 'Yao Tech', handle: 'yaotech', city: 'Abidjan', favorite: false },
];

const favorites = new Set();

export const handlers = [
  http.get(`${API}/influencers/directory`, () => HttpResponse.json({
    followers: 11839000,
    verified: 16,
    perNetwork: { ig: 13, tt: 16, fb: 12, sc: 2 },
    featured: { ...ama, favorite: favorites.has(ama.id) },
  })),
  http.get(`${API}/influencers/carousel`, () => HttpResponse.json([
    { ...ama, favorite: favorites.has(ama.id) },
    { ...yao, favorite: favorites.has(yao.id) },
  ])),
  http.get(`${API}/influencers/:handle`, ({ params }) => {
    if (params.handle !== 'amakouassi') return HttpResponse.json(null);
    return HttpResponse.json({
      influencer: { ...ama, favorite: favorites.has(ama.id) },
      own: false,
      reviews: [{ brand: 'Boutique Nana Wax', stars: 5, text: 'Story très soignée.', at: '2026-08-28T17:10:06.686Z' }],
      recent: [],
    });
  }),
  http.get(`${API}/influencers`, ({ request }) => {
    const s = new URL(request.url).searchParams.get('s')?.toLowerCase() ?? '';
    const items = influencers.filter((item) => !s || item.name.toLowerCase().includes(s));
    return HttpResponse.json({ items, nextCursor: null, total: items.length });
  }),
  http.post(`${API}/influencers/:id/favorite`, ({ params }) => {
    if (params.id === 'guest') {
      return HttpResponse.json({ message: "Connectez-vous en tant qu'annonceur pour créer votre sélection." }, { status: 403 });
    }
    if (favorites.has(params.id)) {
      favorites.delete(params.id);
      return HttpResponse.json({ favorite: false, message: 'Retiré de votre sélection.' });
    }
    favorites.add(params.id);
    return HttpResponse.json({ favorite: true, message: 'Ajouté à votre sélection.' });
  }),
  http.post(`${API}/influencers/:id/requests`, async ({ request, params }) => {
    if (params.id === 'missing') return HttpResponse.json({ message: 'Profil introuvable.' }, { status: 404 });
    const body = /** @type {{ from?: string, contact?: string, msg?: string, type?: string }} */ (await request.json());
    const msg = String(body.msg ?? '').trim();
    if (msg.length < 10 || msg.length > 1000) {
      return HttpResponse.json({ message: 'Le message doit contenir entre 10 et 1 000 caractères.' }, { status: 400 });
    }
    return HttpResponse.json({ message: 'Demande envoyée.' });
  }),
  http.post(`${API}/influencers/:id/visits`, () => HttpResponse.json(null)),
  http.put(`${API}/influencers/:id/photo`, async ({ request }) => {
    const body = /** @type {{ photo: string|null, consent?: boolean }} */ (await request.json());
    if (body.consent === false) {
      return HttpResponse.json(
        { message: "L'accord écrit de l'influenceur (droit à l'image) est obligatoire." },
        { status: 422 },
      );
    }
    return HttpResponse.json({ message: body.photo ? 'Photo mise à jour.' : 'Photo retirée.' });
  }),
  http.put(`${API}/influencers/:id/vitrine`, async ({ request }) => {
    const body = /** @type {{ cats?: string[], rates?: unknown[] }} */ (await request.json());
    if (!Array.isArray(body.cats) || !body.cats.length) {
      return HttpResponse.json({ message: 'Choisissez au moins une catégorie.' }, { status: 422 });
    }
    return HttpResponse.json({ message: 'Vitrine enregistrée.' });
  }),
  http.post(`${API}/matching`, async ({ request }) => {
    const body = /** @type {{ theme?: string, objective?: string, net?: string, budget?: number }} */ (await request.json());
    if (!body.theme || !body.objective) {
      return HttpResponse.json({ message: 'Required' }, { status: 400 });
    }
    const visible = {
      influencer: { ...ama, favorite: false },
      s: 0.9046,
      note: 4.8,
      reach: null,
      interactions: null,
      price: 20000,
      inBudget: true,
      why: ['Thématique alignée : Mode & beauté'],
      bestNet: 'ig',
      reco: 'Campagnes de notoriété',
      cpm: null,
    };
    const masked = {
      influencer: { id: 'masked-4', name: 'Profil réservé', hue: 251, cats: ['beaute'] },
      s: 0.8,
      note: 4.5,
      reach: null,
      interactions: null,
      price: null,
      inBudget: true,
      why: ['Thématique alignée : Mode & beauté'],
      bestNet: 'ig',
      reco: 'Campagnes de notoriété',
      cpm: null,
      masked: true,
    };
    return HttpResponse.json({
      results: [visible, { ...visible, influencer: { ...yao } }, { ...visible, influencer: { ...ama, id: 'i13', handle: 'reine.makeup', name: 'Reine Kacou' } }, masked],
      plan: null,
    });
  }),
  http.get(`${API}/platform`, () => HttpResponse.json({
    flags: { v2: true, v3: true },
    onboarded: false,
  })),
  http.get(`${API}/notifications`, () => HttpResponse.json([
    {
      to: 'i1',
      t: 'Nouvelle campagne de Savane Cosmetics : 90 000 FCFA bloqués en séquestre. Acceptez-la sous 72 h.',
      at: '2026-10-06T10:12:00.000Z',
      r: false,
      link: '/c/c1',
    },
  ])),
  http.post(`${API}/notifications/read`, () => HttpResponse.json(null)),
  http.put(`${API}/me/preferences`, async ({ request }) => {
    const body = /** @type {{ onboarded?: boolean }} */ (await request.json());
    if (body.onboarded !== true) {
      return HttpResponse.json({ message: 'Required' }, { status: 400 });
    }
    return HttpResponse.json(null);
  }),
  http.get(`${API}/auth/session`, () => HttpResponse.json(null)),
  http.get(`${API}/auth/handle`, ({ request }) => {
    const handle = new URL(request.url).searchParams.get('handle');
    return HttpResponse.json({ available: handle !== 'amakouassi' });
  }),
  http.post(`${API}/auth/login`, async ({ request }) => {
    const body = /** @type {{ email: string }} */ (await request.json());
    if (body.email === 'marketing@savane.ci') {
      return HttpResponse.json({
        session: {
          role: 'brand', id: 'b1', name: 'Savane Cosmetics', email: body.email,
          contact: 'Aïcha Diomandé', plan: 'pro', avatar: { name: 'Savane Cosmetics', hue: 20 },
        },
        message: 'Connecté : Savane Cosmetics',
      });
    }
    return HttpResponse.json({ message: 'Identifiants incorrects.' }, { status: 401 });
  }),
  http.post(`${API}/auth/logout`, () => HttpResponse.json({ message: 'Déconnecté.' })),
  http.post(`${API}/auth/password/forgot`, () => (
    HttpResponse.json({ message: "Si un compte existe, un e-mail vient d'être envoyé." })
  )),
  http.post(`${API}/auth/password/reset`, async ({ request }) => {
    const body = /** @type {{ token: string }} */ (await request.json());
    if (!body.token || body.token === 'expired') {
      return HttpResponse.json({ message: 'Ce lien n’est plus valable.' }, { status: 400 });
    }
    return HttpResponse.json({ message: 'Mot de passe modifié.' });
  }),
  http.post(`${API}/auth/signup/brand`, async ({ request }) => {
    const body = /** @type {{ company: string, contact: string, email: string }} */ (await request.json());
    return HttpResponse.json({
      session: {
        role: 'brand', id: 'b-new', name: body.company, email: body.email,
        contact: body.contact, plan: 'free', avatar: { name: body.company, hue: 20 },
      },
      message: `Bienvenue sur PULLUP, ${body.contact.split(' ')[0]} !`,
    });
  }),
  http.post(`${API}/auth/demo`, async ({ request }) => {
    const body = /** @type {{ role: string, id: string }} */ (await request.json());
    return HttpResponse.json({
      session: { role: body.role, id: body.id, name: 'Compte démo', email: 'demo@pullup.net', avatar: { name: 'Compte démo', hue: 20 } },
      message: 'Connecté : Compte démo',
    });
  }),
  http.get(`${API}/catalog`, () => HttpResponse.json({
    cats: {
      humour: 'Humour & divertissement',
      beaute: 'Mode & beauté',
      tech: 'Hi-tech & innovation',
    },
    related: { beaute: ['societe'] },
    cities: ['Abidjan', 'Bouaké'],
    obj: { notoriete: 'Notoriété', engagement: 'Engagement', trafic: 'Trafic', conversion: 'Conversion' },
    reco: { notoriete: 'Campagnes de notoriété' },
    contactTypes: ['Publicité', 'Partenariat', 'Dédicace'],
  })),
  http.delete(`${API}/me`, async ({ request }) => {
    const body = /** @type {{ password?: string }} */ (await request.json());
    if (!body.password) return HttpResponse.json({ message: 'Saisissez votre mot de passe.' }, { status: 401 });
    if (body.password === 'mauvais') return HttpResponse.json({ message: 'Identifiants incorrects.' }, { status: 401 });
    return HttpResponse.json({ message: 'Compte supprimé.' });
  }),
  http.put(`${API}/billing/plan`, async ({ request }) => {
    const body = /** @type {{ plan?: string, pay?: string, phone?: string }} */ (await request.json());
    if (body.plan === 'free') {
      return HttpResponse.json({ status: 'cancelled', message: 'Votre formule Pro reste active jusqu\'au 18/11/2026.' });
    }
    if (!body.pay || (body.pay !== 'card' && !body.phone)) {
      return HttpResponse.json({ message: 'Saisissez votre numéro mobile money.' }, { status: 422 });
    }
    if (body.plan === 'business') {
      return HttpResponse.json({
        status: 'awaiting_payment',
        message: 'Confirmez le paiement sur votre téléphone.',
        redirectUrl: 'https://pay.example/plan',
      });
    }
    return HttpResponse.json({ status: 'active', message: 'Formule Pro activée.' });
  }),
  http.post(`${API}/billing/boosts`, async ({ request }) => {
    const body = /** @type {{ key?: string, pay?: string }} */ (await request.json());
    if (!body.key || !body.pay) return HttpResponse.json({ message: 'Option inconnue.' }, { status: 422 });
    return HttpResponse.json({
      status: 'awaiting_payment',
      message: 'Confirmez le paiement sur votre téléphone.',
      redirectUrl: 'https://pay.example/boost',
    });
  }),
  http.get(`${API}/me/export`, () => HttpResponse.json({
    user: { id: 'u1', email: 'marketing@savane.ci', role: 'brand', createdAt: '2026-10-07T17:11:10.959Z' },
    brand: { id: 'b1', name: 'Savane Cosmetics', contact: 'Aïcha Diomandé', plan: 'pro', sector: 'Cosmétique' },
    influencer: null,
  })),
  http.get(`${API}/me/brand-space`, () => HttpResponse.json({
    brand: { id: 'b1', name: 'Savane Cosmetics', contact: 'Aïcha Diomandé', email: 'marketing@savane.ci', plan: 'pro', sector: 'Cosmétique', balance: 35000 },
    campaigns: [{ id: 'c1', ref: 'PU-2410-137', status: 'paid', amount: 90000, brief: { title: 'Sérum' }, influencer: { name: 'Ama Kouassi' }, offer: { net: 'ig', fmt: 'Post' } }],
    favorites: [{ id: 'i13', handle: 'reine.makeup', name: 'Reine Kacou', favorite: true }],
  })),
  http.get(`${API}/me/influencer-space`, () => HttpResponse.json({
    influencer: { id: 'i1', handle: 'amakouassi', name: 'Ama Kouassi', views: [378, 319, 366], email: 'amakouassi@mail.ci', phone: '+225 07 00 00 00 00' },
    campaigns: [{ id: 'c1', ref: 'PU-2410-137', status: 'accepted', payout: 76500 }],
    requests: [{ id: 'r1', from: 'Boutique Nana Wax', contact: '+225 07 48 22 19 03', msg: 'Partenariat', type: 'Partenariat', at: '2026-10-05T17:10:06.689Z' }],
    wallet: { available: 142500, tx: [{ t: 'in', a: 116000, l: 'Campagne libérée', at: '2026-10-07T17:10:06.792Z' }] },
    escrow: 182750,
  })),
  http.put(`${API}/me/brand`, () => HttpResponse.json({ message: 'Profil enregistré.' })),
  http.get(`${API}/me/campaigns.csv`, () => new HttpResponse(
    'Référence,Campagne\nPU-2409-125,Ouvrir un compte Kalo',
    { headers: { 'Content-Type': 'text/csv; charset=utf-8' } },
  )),
  http.get(`${API}/booking/:handle`, ({ params }) => {
    if (params.handle !== 'amakouassi') return HttpResponse.json(null);
    return HttpResponse.json({
      influencer: {
        id: 'i1', handle: 'amakouassi', name: 'Ama Kouassi', city: 'Abidjan · Cocody',
        cats: ['beaute'], rates: [{ id: 'i1r1', net: 'ig', fmt: 'Post + carrousel', price: 90000 }],
        days: ['Lun', 'Jeu'], net: { ig: [412000, 5.8] },
      },
      balance: 35000,
    });
  }),
  http.post(`${API}/uploads/brief`, () => HttpResponse.json({
    uploadUrl: 'https://cdn.pullup.local/briefs/moodboard.pdf',
    fileUrl: 'https://cdn.pullup.local/briefs/moodboard.pdf',
  })),
  http.post(`${API}/campaigns`, async ({ request }) => {
    const body = /** @type {{ infId: string, rateId: string }} */ (await request.json());
    if (!body.rateId) return HttpResponse.json({ message: 'Choisissez une offre.' }, { status: 422 });
    return HttpResponse.json({ id: 'c-new', status: 'paid', message: 'Paiement reçu. Les fonds sont sous séquestre.' });
  }),
  http.get(`${API}/campaigns`, () => HttpResponse.json([
    {
      id: 'c1', ref: 'PU-2410-137', brandId: 'b1', infId: 'i1', status: 'paid', amount: 90000, fee: 13500, payout: 76500,
      offer: { id: 'i1r1', net: 'ig', fmt: 'Post + carrousel', price: 90000 },
      brief: { title: 'Lancement du sérum Karité Glow' },
      influencer: { id: 'i1', handle: 'amakouassi', name: 'Ama Kouassi', hue: 47, photo: null, verified: true },
      brand: { id: 'b1', name: 'Savane Cosmetics' },
    },
  ])),
  http.get(`${API}/campaigns/:id/payment`, ({ params }) => {
    if (params.id === 'missing') return HttpResponse.json({ message: 'Introuvable.' }, { status: 404 });
    return HttpResponse.json({ status: 'paid' });
  }),
  http.get(`${API}/campaigns/:id`, ({ params }) => {
    if (params.id === 'missing') return HttpResponse.json({ access: 'missing' });
    if (params.id === 'forbidden') return HttpResponse.json({ access: 'forbidden' });
    return HttpResponse.json({
      access: 'ok',
      campaign: {
        id: params.id, ref: 'PU-2410-137', status: 'paid',
        influencer: { id: 'i1', handle: 'amakouassi', name: 'Ama Kouassi' },
        brand: { id: 'b1', name: 'Savane Cosmetics' },
      },
    });
  }),
  http.post(`${API}/campaigns/:id/messages`, () => HttpResponse.json({ message: 'Message envoyé.' })),
  http.post(`${API}/campaigns/:id/review`, () => HttpResponse.json({ message: 'Merci ! Votre avis est publié sur la vitrine.' })),
  http.post(`${API}/campaigns/:id/:action`, ({ params }) => {
    if (params.action === 'accept') return HttpResponse.json({ message: 'Campagne acceptée. Publiez à la date prévue.' });
    if (params.action === 'dispute') return HttpResponse.json({ message: 'Décrivez le problème rencontré.' }, { status: 422 });
    return HttpResponse.json({ message: 'Action non autorisée pour ce compte.' }, { status: 403 });
  }),
  http.get(`${API}/admin/dashboard`, () => HttpResponse.json({
    campaigns: [{
      id: 'c1', ref: 'PU-2410-137', status: 'paid', amount: 90000, fee: 13500,
      influencer: { id: 'i1', handle: 'amakouassi', name: 'Ama Kouassi' },
      brand: { id: 'b1', name: 'Savane Cosmetics' },
    }],
    influencers: [{
      id: 'i1', handle: 'amakouassi', name: 'Ama Kouassi', status: 'active', verified: true,
      certified: true, auth: 94, creat: 4.6, brief: 96, onTime: 98, cats: ['beaute'], net: { ig: [412000, 5.8] },
      email: 'amakouassi@mail.ci', phone: '',
    }],
    brands: [{ id: 'b1', name: 'Savane Cosmetics', contact: 'Aïcha Diomandé', email: 'marketing@savane.ci', plan: 'pro', sector: 'Cosmétique', balance: 35000 }],
    flags: { v2: true, v3: true },
  })),
  http.get(`${API}/admin/finance/summary`, () => HttpResponse.json({
    escrow: 390000, commissionsMonth: 97500, pendingWithdrawals: 0, gaps: [],
  })),
  http.get(`${API}/admin/finance/ledger.csv`, () => new HttpResponse(
    'Date,Écriture,Compte,Compte id,Campagne,Sens,Montant FCFA,Libellé\n2026-10-07T17:10:06.768Z,seed-b1,brand_balance,b1,,credit,35000,Solde initial démo',
    { headers: { 'Content-Type': 'text/csv; charset=utf-8' } },
  )),
  http.get(`${API}/admin/withdrawals`, () => HttpResponse.json([
    {
      id: 'w1', influencerId: 'i1', influencer: { id: 'i1', name: 'Ama Kouassi', handle: 'amakouassi' },
      amount: 50000, operator: 'om', phone: '0700000000', status: 'sent', payoutId: 'p1', createdAt: '2026-10-07T17:10:07.494Z',
    },
    {
      id: 'w-fail', influencerId: 'i1', influencer: { id: 'i1', name: 'Ama Kouassi', handle: 'amakouassi' },
      amount: 20000, operator: 'om', phone: '0700000000', status: 'failed', payoutId: 'p2', createdAt: '2026-10-01T10:12:00.000Z',
    },
  ])),
  http.get(`${API}/admin/audit`, () => HttpResponse.json([
    {
      id: 'a1', actorUserId: 'admin', action: 'influencer_reject', targetType: 'Influencer', targetId: 'i10',
      data: { reason: 'Profil incomplet.', before: { status: 'active' }, after: { status: 'rejected' } },
      ip: '::1', createdAt: '2026-10-07T17:10:07.586Z',
    },
  ])),
  http.post(`${API}/admin/influencers/:id/verify`, () => HttpResponse.json({ message: 'Ama Kouassi est maintenant vérifié.' })),
  http.post(`${API}/admin/influencers/:id/reject`, () => HttpResponse.json({ message: 'Profil refusé.' })),
  http.post(`${API}/admin/influencers/:id/suspend`, async ({ request }) => {
    const body = /** @type {{ reason?: string }} */ (await request.json());
    if (!body.reason) return HttpResponse.json({ message: 'Indiquez le motif de la suspension.' }, { status: 400 });
    return HttpResponse.json({ message: 'Profil masqué.' });
  }),
  http.post(`${API}/admin/influencers/:id/certify`, () => HttpResponse.json({ message: 'Ama Kouassi est maintenant certifié.' })),
  http.put(`${API}/admin/influencers/:id/scores`, () => HttpResponse.json({ message: 'Statistiques mises à jour.' })),
  http.post(`${API}/admin/withdrawals/:id/retry`, ({ params }) => {
    if (params.id !== 'w-fail') return HttpResponse.json({ message: 'Seuls les retraits échoués peuvent être relancés.' }, { status: 422 });
    return HttpResponse.json({ message: 'Retrait relancé.' });
  }),
  http.post(`${API}/admin/brands/:id/credit`, async ({ request }) => {
    const body = /** @type {{ amount?: number, reason?: string }} */ (await request.json());
    if (!body.reason) return HttpResponse.json({ message: 'Indiquez le motif du geste commercial.' }, { status: 422 });
    return HttpResponse.json({ message: '10 000 FCFA crédités.' });
  }),
  http.put(`${API}/admin/flags/:key`, () => HttpResponse.json({ message: 'V3 activée sur toute la plateforme.' })),
  http.post(`${API}/admin/campaigns/auto-validate`, () => HttpResponse.json({ message: 'Aucune publication en attente de validation.' })),
  http.get(`${API}/admin/catalog`, () => HttpResponse.json({
    categories: [
      { kind: 'category', key: 'humour', label: 'Humour & divertissement', related: ['societe'], sortOrder: 0, active: true },
      { kind: 'category', key: 'beaute', label: 'Mode & beauté', related: ['societe', 'business', 'amour'], sortOrder: 1, active: true },
      { kind: 'category', key: 'cinema', label: 'Cinéma & séries', related: ['actu'], sortOrder: 11, active: false },
    ],
    cities: [{ kind: 'city', key: 'Abidjan', label: 'Abidjan', sortOrder: 0, active: true }],
    objectives: [{ kind: 'objective', key: 'notoriete', label: 'Notoriété', reco: 'Campagnes de notoriété', sortOrder: 0, active: true }],
    contactTypes: [{ kind: 'contact_type', key: 'Publicité', label: 'Publicité', sortOrder: 0, active: true }],
  })),
  http.post(`${API}/admin/catalog`, async ({ request }) => {
    const body = /** @type {{ kind: string, key?: string, label: string, related?: string[] }} */ (await request.json());
    if (body.key === 'beaute') return HttpResponse.json({ message: 'Cette clé existe déjà.' }, { status: 409 });
    return HttpResponse.json({
      message: 'Catégorie créée.',
      item: { kind: body.kind, key: body.key ?? 'cinema', label: body.label, related: body.related ?? [], sortOrder: 11, active: true },
    });
  }),
  http.put(`${API}/admin/catalog/:kind/:key`, async ({ request, params }) => {
    const body = /** @type {{ label?: string, related?: string[], active?: boolean }} */ (await request.json());
    return HttpResponse.json({
      message: 'Catégorie mise à jour.',
      item: { kind: params.kind, key: params.key, label: body.label ?? 'Cinéma & séries', related: body.related ?? [], sortOrder: 11, active: body.active ?? true },
    });
  }),
  http.delete(`${API}/admin/catalog/:kind/:key`, ({ params }) => {
    if (params.key === 'Abidjan') return HttpResponse.json({ message: 'Gardez au moins un élément actif.' }, { status: 409 });
    return HttpResponse.json({
      message: 'Catégorie masquée.',
      item: { kind: params.kind, key: params.key, label: 'Cinéma & séries', related: ['actu'], sortOrder: 11, active: false },
    });
  }),
];
