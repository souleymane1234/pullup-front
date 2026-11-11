export const COMMISSION = 0.15;

export const CATS = {
  humour: { l: 'Humour & divertissement', e: '😂' },
  beaute: { l: 'Mode & beauté', e: '💄' },
  tech: { l: 'Hi-tech & innovation', e: '📱' },
  sport: { l: 'Sport & bien-être', e: '⚽' },
  food: { l: 'Food & maquis', e: '🍲' },
  actu: { l: 'Actualités & médias', e: '📰' },
  musique: { l: 'Musique & danse', e: '🎶' },
  business: { l: 'Vente & entrepreneuriat', e: '💼' },
  societe: { l: 'Société & lifestyle', e: '🌆' },
  jeux: { l: 'Jeux & paris sportifs', e: '🎮' },
  amour: { l: 'Amour & rencontres', e: '💞' },
};

export const RELATED = {
  beaute: ['societe', 'business', 'amour'],
  tech: ['jeux', 'business', 'actu'],
  humour: ['societe', 'musique', 'amour'],
  sport: ['jeux', 'societe'],
  food: ['societe', 'humour'],
  actu: ['societe', 'tech'],
  musique: ['humour', 'societe'],
  business: ['tech', 'beaute', 'actu'],
  societe: ['humour', 'beaute', 'food'],
  jeux: ['tech', 'sport', 'humour'],
  amour: ['societe', 'humour'],
};

export const NET = {
  ig: { l: 'Instagram', reach: 0.3 },
  tt: { l: 'TikTok', reach: 0.42 },
  fb: { l: 'Facebook', reach: 0.16 },
  sc: { l: 'Snapchat', reach: 0.26 },
};

export const OBJ = {
  notoriete: 'Notoriété',
  engagement: 'Engagement',
  trafic: 'Trafic',
  conversion: 'Conversion',
};

export const AGES = ['13-17', '18-24', '25-34', '35+'];

export const PAY = [
  { k: 'om', l: 'Orange Money', c: '#FF7900', t: 'OM', logo: '/mobile-money/orange.png', bg: '#FFFFFF' },
  { k: 'mtn', l: 'MTN MoMo', c: '#FFCB05', t: 'MTN', ink: '#222', logo: '/mobile-money/mtn.jpg', bg: '#FFCB05' },
  { k: 'moov', l: 'Moov Money', c: '#0055A5', t: 'MV', logo: '/mobile-money/moov.png', bg: '#0066B3' },
  { k: 'wave', l: 'Wave', c: '#1DC8F2', t: 'W', logo: '/mobile-money/wave.png', bg: '#13B8EE' },
  { k: 'card', l: 'Carte Visa / MC', c: '#2A4BA0', t: 'CB' },
];

export const PLANS = {
  free: {
    l: 'Découverte',
    p: 0,
    exportCsv: false,
    feat: ['Moteur de matching IA', 'Top 3 visibles, autres résultats floutés', '3 campagnes par mois', 'Sans prédiction de performance'],
  },
  pro: {
    l: 'Pro',
    p: 15000,
    exportCsv: false,
    feat: ['Matching complet, tous les profils', "Prédiction de portée et d'engagement", '5 campagnes par mois', 'Liens UTM de suivi', 'Support standard'],
  },
  business: {
    l: 'Business',
    p: 75000,
    exportCsv: true,
    feat: ['Matching avancé + analyse IA du brief', 'Campagnes illimitées', 'Reporting complet exportable', 'Gestionnaire de compte dédié', 'Support prioritaire'],
  },
};

export const STATUS = {
  awaiting_payment: { l: 'En attente de paiement', tone: 'warn', step: 0 },
  paid: { l: "En attente de l'influenceur", tone: 'warn', step: 1 },
  accepted: { l: 'Acceptée · en préparation', tone: 'info', step: 2 },
  published: { l: 'Publiée · à valider', tone: 'orange', step: 3 },
  completed: { l: 'Terminée · fonds libérés', tone: 'ok', step: 4 },
  dispute: { l: 'Litige en cours', tone: 'danger', step: 3 },
  declined: { l: 'Refusée · remboursée', tone: 'mute', step: 0 },
  cancelled: { l: 'Annulée · remboursée', tone: 'mute', step: 0 },
  refunded: { l: 'Remboursée (litige)', tone: 'mute', step: 0 },
};

export const HELD_STATUSES = ['paid', 'accepted', 'published', 'dispute'];
export const REFUNDED_STATUSES = ['declined', 'cancelled', 'refunded'];

export const CITIES = ['Abidjan', 'Bouaké', 'Yamoussoukro', 'San-Pédro', 'Daloa', 'Korhogo'];
export const DAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

export const RECO_BY_OBJECTIVE = {
  notoriete: 'Campagnes de notoriété',
  engagement: 'Challenges et concours',
  trafic: 'Activations digitales',
  conversion: 'Lancements de produits',
};

export const BOOSTS = [
  { k: 'pro', l: 'Influenceur Pro', p: 5000, d: "Mise en avant dans l'annuaire et le matching, bandeau publicitaire sur la page d'accueil." },
  { k: 'certified', l: 'Certifié', p: 10000, d: 'Badge Certifié PULLUP sur votre vitrine et priorité dans les recommandations IA.' },
  { k: 'analytics', l: 'Analytics avancées', p: 15000, d: 'Détail des visiteurs, conversions par lien UTM et comparaison avec votre catégorie.' },
];

export const MIN_RATE = 5000;
export const MAX_BRIEF_WORDS = 160;
