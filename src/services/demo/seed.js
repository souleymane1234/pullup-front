import { COMMISSION } from '@/domain/catalog.js';
import { buildUtm } from '@/domain/utm.js';

/* id, handle, nom, ville, catégories, bio, réseaux, audience, authenticité, créativité, briefs, ponctualité, note, avis, campagnes, tarifs, jours, visites de base */
const ROWS = [
  ['i1','amakouassi','Ama Kouassi','Abidjan · Cocody',['beaute','societe'],'Je partage mes routines beauté, mes bons plans mode et la vie à Abidjan. Audience à 74 % féminine, très active en story.',{ig:[412000,5.8],tt:[268000,7.4],fb:[96000,2.1]},{f:74,ages:[9,47,33,11],cities:[['Abidjan',64],['Bouaké',8],['Yamoussoukro',6],['Autres',22]]},94,4.6,96,98,4.8,61,47,[['ig','Story (24 h)',35000],['ig','Post + carrousel',90000],['tt','Vidéo TikTok',120000],['ig','Dédicace vidéo',25000]],['Lun','Jeu','Sam'],342],
  ['i2','legbakacomedy','Le Gbaka Comedy','Abidjan · Yopougon',['humour','societe'],'Sketchs du quotidien ivoirien, en nouchi et en français. Mes vidéos tournent dans les gbakas, les bureaux et les grins.',{tt:[1350000,9.1],fb:[820000,4.2],ig:[310000,6.0]},{f:46,ages:[14,52,25,9],cities:[['Abidjan',58],['Bouaké',11],['Daloa',7],['Autres',24]]},91,4.9,88,90,4.6,128,103,[['tt','Sketch sponsorisé',250000],['fb','Vidéo Facebook',180000],['ig','Story (24 h)',50000]],['Mar','Ven','Dim'],1210],
  ['i3','yaotech','Yao Tech','Abidjan · Plateau',['tech','business'],'Tests de smartphones, applis et services numériques made in Africa. Je vulgarise la tech pour tout le monde.',{tt:[186000,6.9],ig:[74000,4.4],fb:[52000,2.6]},{f:28,ages:[11,44,35,10],cities:[['Abidjan',71],['San-Pédro',6],['Bouaké',5],['Autres',18]]},97,4.4,99,100,4.9,34,29,[['tt','Test produit (vidéo)',90000],['ig','Post + story',60000],['fb','Live 30 min',110000]],['Mer','Sam'],268],
  ['i4','fatoubamba.fit','Fatou Bamba','Abidjan · Marcory',['sport','beaute'],'Coach sportive certifiée. Programmes maison, nutrition locale et motivation au quotidien.',{ig:[158000,6.2],tt:[121000,8.0]},{f:68,ages:[6,41,39,14],cities:[['Abidjan',60],['Grand-Bassam',9],['Bouaké',7],['Autres',24]]},95,4.3,97,97,4.7,22,18,[['ig','Story (24 h)',20000],['ig','Reel sponsorisé',70000],['tt','Défi TikTok',85000]],['Lun','Mer','Ven'],190],
  ['i5','kaderfood','Kader Food','Abidjan · Treichville',['food','societe'],'Je teste les maquis, garbadromes et restos d\'Abidjan. Note honnête, pas de chichi.',{tt:[540000,8.6],ig:[205000,5.1],fb:[160000,3.0]},{f:49,ages:[8,45,34,13],cities:[['Abidjan',77],['Bouaké',5],['Assinie',4],['Autres',14]]},90,4.7,92,94,4.5,57,41,[['tt','Visite & avis (vidéo)',140000],['ig','Story (24 h)',30000],['fb','Post Facebook',45000]],['Jeu','Sam','Dim'],455],
  ['i6','mariamstyle','Mariam Sangaré','Abidjan · Riviera',['beaute','business'],'Styliste et créatrice. Je mets en avant le pagne et les marques africaines dans des looks modernes.',{ig:[96000,4.9],tt:[48000,6.3],sc:[30000,9.2]},{f:81,ages:[7,43,38,12],cities:[['Abidjan',69],['Dakar',6],['Paris',5],['Autres',20]]},93,4.8,95,92,4.6,19,15,[['ig','Post lookbook',65000],['ig','Story (24 h)',18000],['sc','Snap privé',12000]],['Mar','Ven'],142],
  ['i7','juniorballon','Junior Ballon','Abidjan · Abobo',['sport','jeux'],'Football ivoirien, Ligue 1, CAN et pronostics. La communauté des vrais supporters.',{fb:[690000,3.6],tt:[310000,7.1]},{f:17,ages:[12,49,28,11],cities:[['Abidjan',52],['Bouaké',12],['Korhogo',8],['Autres',28]]},84,4.1,85,88,4.2,44,36,[['fb','Post Facebook',90000],['tt','Vidéo TikTok',110000],['fb','Live match',160000]],['Mer','Sam','Dim'],601],
  ['i8','awainfos225','Awa Infos','Abidjan · Plateau',['actu','societe'],'L\'actualité ivoirienne vérifiée, résumée en 60 secondes. Économie, société, culture.',{fb:[480000,2.4],ig:[134000,3.3],tt:[92000,5.0]},{f:52,ages:[4,33,40,23],cities:[['Abidjan',55],['Bouaké',9],['San-Pédro',7],['Autres',29]]},96,4.0,98,99,4.8,38,31,[['fb','Publication sponsorisée',75000],['ig','Story (24 h)',25000],['tt','Résumé vidéo',60000]],['Lun','Mar','Mer','Jeu','Ven'],233],
  ['i9','djkassi','DJ Kassi','Abidjan · Koumassi',['musique','humour'],'DJ et danseur. Je lance les challenges coupé-décalé qui font bouger tout le pays.',{tt:[890000,10.2],ig:[240000,6.4],sc:[110000,8.8]},{f:55,ages:[19,54,20,7],cities:[['Abidjan',61],['Bouaké',8],['Accra',5],['Autres',26]]},88,4.8,86,87,4.4,49,40,[['tt','Challenge de danse',200000],['ig','Reel sponsorisé',80000],['sc','Story Snapchat',30000]],['Ven','Sam'],780],
  ['i10','nadia.business','Nadia Business','Abidjan · Angré',['business','tech'],'Entrepreneuse e-commerce. Conseils pour vendre en ligne, outils de paiement et histoires de réussite.',{ig:[118000,4.1],fb:[150000,2.8],tt:[64000,5.5]},{f:63,ages:[3,30,45,22],cities:[['Abidjan',66],['Bouaké',7],['Yamoussoukro',5],['Autres',22]]},97,4.2,99,98,4.9,27,24,[['ig','Post éducatif',55000],['fb','Live Facebook',85000],['tt','Vidéo TikTok',50000]],['Mar','Jeu'],176],
  ['i11','bouakevibes','Bouaké Vibes','Bouaké',['societe','food'],'La vie à Bouaké et dans le centre du pays : événements, bons plans, rencontres.',{fb:[87000,4.8],tt:[63000,7.7]},{f:51,ages:[10,46,31,13],cities:[['Bouaké',58],['Yamoussoukro',12],['Abidjan',14],['Autres',16]]},92,4.1,93,96,4.5,12,9,[['fb','Post Facebook',25000],['tt','Vidéo TikTok',40000]],['Mer','Sam'],88],
  ['i13','reine.makeup','Reine Kacou','Abidjan · Yopougon',['beaute','amour'],'Maquilleuse professionnelle. Tutos make-up pour peaux noires, mariages et looks de soirée à petit prix.',{tt:[410000,8.3],ig:[285000,6.1]},{f:86,ages:[11,50,30,9],cities:[['Abidjan',66],['Bouaké',7],['Lomé',5],['Autres',22]]},93,4.7,94,95,4.7,41,33,[['tt','Tuto sponsorisé',110000],['ig','Story (24 h)',30000],['ig','Reel avant/après',75000]],['Mar','Jeu','Sam'],390],
  ['i14','ismael.voyage','Ismaël Voyage','Abidjan · Cocody',['societe','food'],'Je fais découvrir la Côte d\'Ivoire : Assinie, Man, Sassandra, hôtels et escapades du week-end.',{ig:[176000,5.4],tt:[220000,7.2],fb:[98000,3.1]},{f:58,ages:[4,38,41,17],cities:[['Abidjan',63],['Yamoussoukro',7],['Paris',6],['Autres',24]]},95,4.6,96,97,4.8,24,20,[['ig','Reel destination',85000],['tt','Vlog TikTok',95000],['ig','Story (24 h)',25000]],['Ven','Dim'],205],
  ['i15','grace.conseils','Grâce Conseils','Abidjan · Marcory',['amour','societe'],'Conseils de couple, vie de famille et confiance en soi. Une communauté bienveillante qui se confie.',{fb:[520000,4.5],tt:[380000,8.0],ig:[150000,5.2]},{f:71,ages:[3,36,42,19],cities:[['Abidjan',57],['Bouaké',9],['Daloa',6],['Autres',28]]},90,4.4,91,93,4.5,36,28,[['fb','Post Facebook',70000],['tt','Vidéo conseil',95000],['fb','Live questions-réponses',130000]],['Lun','Mer','Ven'],410],
  ['i16','tontonblagueur','Tonton Blagueur','Abidjan · Adjamé',['humour','musique'],'Blagues, parodies et chansons détournées. Le rire du quartier, partagé dans tout le pays.',{fb:[360000,3.9],tt:[640000,8.7]},{f:44,ages:[13,48,28,11],cities:[['Abidjan',54],['Bouaké',12],['Korhogo',7],['Autres',27]]},87,4.6,87,89,4.3,52,44,[['tt','Sketch sponsorisé',160000],['fb','Vidéo Facebook',110000]],['Mar','Sam'],690],
  ['i12','koffigaming','Koffi Gaming','Abidjan · Bingerville',['jeux','tech'],'Streams FIFA, eFootball et jeux mobiles. Tournois communautaires chaque week-end.',{tt:[142000,7.9],fb:[66000,3.9],ig:[38000,4.6]},{f:15,ages:[24,52,19,5],cities:[['Abidjan',63],['Bouaké',8],['Daloa',5],['Autres',24]]},89,4.5,90,91,4.3,15,12,[['tt','Vidéo gameplay',60000],['fb','Live tournoi',90000],['ig','Story (24 h)',15000]],['Ven','Sam','Dim'],121],
];

function seedInfluencers() {
  return ROWS.map((row) => {
    const [id, handle, name, city, cats, bio, net, aud, auth, creat, brief, onTime, rating, reviews, done, rates, days, base] = row;
    return {
      id, handle, name, city, cats, bio, net, aud, auth, creat, brief, onTime, rating, reviews, done,
      rates: rates.map(([n, fmt, price], k) => ({ id: `${id}r${k}`, net: n, fmt, price })),
      days,
      verified: true,
      certified: ['i1', 'i3', 'i8', 'i10'].includes(id),
      status: 'active',
      accepts: { pub: true, partenariat: true, dedicace: rates.some((rate) => /Dédicace/.test(rate[1])) },
      views: Array.from({ length: 30 }, (_, d) => Math.round(base * (0.65 + 0.5 * Math.abs(Math.sin(d * 1.7 + id.length)) + d / 60))),
      qr: Math.round(base * 2.4),
      contacts: Math.round(base * 0.31),
      hue: (parseInt(id.slice(1), 10) * 47) % 360,
      photo: null,
    };
  });
}

/** Date ISO d'il y a `daysAgo` jours (négatif = dans le futur). */
export function iso(daysAgo, hour = 10) {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  date.setHours(hour, 12, 0, 0);
  return date.toISOString();
}

export function createSeed() {
  const influencers = seedInfluencers();
  const S = {
    v: 4,
    flags: { v2: true, v3: true },
    session: null,
    onboarded: false,
    influencers,
    brands: [
      { id: 'b1', name: 'Savane Cosmetics', contact: 'Aïcha Diomandé', email: 'marketing@savane.ci', plan: 'pro', sector: 'Cosmétique', balance: 35000 },
      { id: 'b2', name: 'Maquis Le Palmier', contact: 'Serge Koné', email: 'contact@lepalmier.ci', plan: 'free', sector: 'Restauration', balance: 0 },
      { id: 'b3', name: 'Kalo Fintech', contact: 'Ines Yapo', email: 'growth@kalo.ci', plan: 'business', sector: 'Fintech', balance: 0 },
    ],
    wallets: {
      i1: {
        available: 142500,
        tx: [
          { t: 'in', a: 76500, l: 'Campagne PU-2409-118 libérée', at: iso(9) },
          { t: 'out', a: 50000, l: 'Retrait Orange Money', at: iso(6) },
          { t: 'in', a: 116000, l: 'Campagne PU-2409-131 libérée', at: iso(3) },
        ],
      },
    },
    campaigns: [],
    requests: [],
    notifs: [],
    seq: 140,
    favs: { b1: ['i3', 'i5', 'i13'] },
    reviews: [
      { infId: 'i1', brand: 'Boutique Nana Wax', stars: 5, text: 'Story très soignée, nos ventes en ligne ont doublé le week-end suivant.', at: iso(40) },
      { infId: 'i1', brand: 'Glow Hair Abidjan', stars: 4, text: 'Contenu de qualité, publié avec un jour de retard mais bien prévenu.', at: iso(70) },
    ],
  };

  const mk = (id, ref, brandId, infId, rateIndex, status, daysAgo, brief, extra = {}) => {
    const influencer = influencers.find((x) => x.id === infId);
    const rate = influencer.rates[rateIndex];
    const fee = Math.round(rate.price * COMMISSION);
    const campaign = {
      id, ref, brandId, infId,
      offer: { ...rate },
      amount: rate.price,
      fee,
      payout: rate.price - fee,
      status,
      createdAt: iso(daysAgo),
      pay: 'om',
      brief,
      log: [{ s: 'paid', at: iso(daysAgo), n: 'Paiement reçu · fonds bloqués en séquestre' }],
      perf: null,
      proof: null,
      msgs: [],
      ...extra,
    };
    campaign.utm = buildUtm(campaign, influencer);
    return campaign;
  };

  S.campaigns.push(
    mk('c1', 'PU-2410-137', 'b1', 'i1', 1, 'paid', 1, { title: 'Lancement du sérum Karité Glow', objective: 'notoriete', theme: 'beaute', text: 'Présenter le nouveau sérum au karité dans une routine du matin. Mentionner @savanecosmetics et le code GLOW10.', link: 'https://savane.ci/glow', date: iso(-3) }),
    mk('c2', 'PU-2409-131', 'b1', 'i3', 0, 'published', 6, { title: 'Test du nouveau coffret Savane Men', objective: 'engagement', theme: 'beaute', text: 'Test honnête du coffret homme, focus sur la barbe et la peau.', link: 'https://savane.ci/men', date: iso(2) }, { proof: { url: 'https://www.tiktok.com/@yaotech/video/7421', note: 'Vidéo en ligne depuis 26 h, épinglée sur le profil.', at: iso(1) }, perf: { views: 96400, likes: 7310, comments: 412, shares: 388, clicks: 1240 } }),
    mk('c3', 'PU-2409-118', 'b1', 'i2', 2, 'completed', 14, { title: 'Promo rentrée Savane', objective: 'trafic', theme: 'humour', text: 'Story humoristique sur la routine des élèves, lien vers la boutique.', link: 'https://savane.ci/rentree', date: iso(11) }, { proof: { url: 'https://instagram.com/stories/legbakacomedy/31', note: 'Story + mise en avant.', at: iso(10) }, perf: { views: 118200, likes: 9400, comments: 520, shares: 210, clicks: 2130 } }),
    mk('c4', 'PU-2410-139', 'b2', 'i1', 0, 'accepted', 2, { title: 'Brunch du dimanche au Palmier', objective: 'conversion', theme: 'food', text: 'Story au brunch, avec le menu et la réservation par WhatsApp.', link: 'https://wa.me/2250700000000', date: iso(-1) }),
    mk('c5', 'PU-2409-125', 'b3', 'i10', 1, 'dispute', 8, { title: 'Ouvrir un compte Kalo en 2 minutes', objective: 'conversion', theme: 'business', text: 'Live démonstration de l\'ouverture de compte, avec lien de parrainage.', link: 'https://kalo.ci/app', date: iso(5) }, { proof: { url: 'https://facebook.com/nadia.business/live/88', note: 'Live réalisé, 25 min au lieu de 30.', at: iso(4) }, perf: { views: 21400, likes: 880, comments: 210, shares: 64, clicks: 610 }, disputeReason: 'Le live a duré 25 minutes au lieu des 30 prévues.' }),
  );

  const [c1, c2, c3, c4, c5] = S.campaigns;
  c1.log = [{ s: 'paid', at: iso(1), n: 'Paiement reçu · 90 000 FCFA bloqués en séquestre' }];
  c2.log.push({ s: 'accepted', at: iso(5), n: 'Yao Tech a accepté la campagne' }, { s: 'published', at: iso(1), n: 'Preuve de publication envoyée' });
  c3.log.push({ s: 'accepted', at: iso(13), n: 'Acceptée' }, { s: 'published', at: iso(10), n: 'Publiée' }, { s: 'completed', at: iso(9), n: 'Validée par l\'annonceur · fonds libérés' });
  c4.log.push({ s: 'accepted', at: iso(1), n: 'Ama Kouassi a accepté la campagne' });
  c5.log.push({ s: 'accepted', at: iso(7), n: 'Acceptée' }, { s: 'published', at: iso(4), n: 'Publiée' }, { s: 'dispute', at: iso(3), n: 'Litige ouvert par l\'annonceur' });
  c3.review = { stars: 5, text: 'Sketch hilarant, plus de 2 000 clics sur notre lien. On refait vite !', at: iso(9) };
  c2.msgs = [
    { from: 'brand', t: 'Bonjour Yao, pensez à montrer le baume à barbe en gros plan, c\'est notre produit phare.', at: iso(5, 11) },
    { from: 'influencer', t: 'Bien noté ! Je tourne demain matin avec une lumière naturelle.', at: iso(5, 15) },
  ];
  c1.msgs = [{ from: 'brand', t: 'Bonjour Ama, le colis avec le sérum arrive chez vous demain avant 12 h.', at: iso(1, 12) }];

  S.requests.push({ id: 'r1', infId: 'i1', from: 'Boutique Nana Wax', contact: '+225 07 48 22 19 03', msg: 'Bonjour Ama, nous aimerions un partenariat de 3 mois pour notre nouvelle collection.', at: iso(2), type: 'Partenariat' });
  S.notifs.push(
    { to: 'i1', t: 'Nouvelle campagne de Savane Cosmetics : 90 000 FCFA bloqués en séquestre. Acceptez-la sous 72 h.', at: iso(1), r: false, link: '/c/c1' },
    { to: 'b1', t: 'Yao Tech a publié votre campagne. Validez-la pour libérer les fonds.', at: iso(1), r: false, link: '/c/c2' },
    { to: 'admin', t: 'Litige ouvert sur PU-2409-125 (Kalo Fintech × Nadia Business).', at: iso(3), r: false, link: '/c/c5' },
  );
  return S;
}
