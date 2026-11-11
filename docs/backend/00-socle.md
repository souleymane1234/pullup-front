# Module 00 : socle technique (à faire en premier)

> **À coller avant chaque module.** Ce module pose le projet, les conventions et les référentiels partagés. Les modules suivants supposent qu'il est en place.

## Contexte

Tu es un ingénieur backend senior. Tu construis l'API REST et la base de données de **PULLUP**, une marketplace d'influence marketing en Côte d'Ivoire. Elle relie :

- des **annonceurs**, qui cherchent, comparent et réservent des influenceurs ;
- des **influenceurs**, qui publient une vitrine et sont payés après publication ;
- une **équipe PULLUP (admin)**, qui vérifie les profils, arbitre les litiges et pilote les fonctionnalités.

Le cœur métier est le **paiement sous séquestre**. L'annonceur paie à la réservation et les fonds restent bloqués. Ils sont libérés à l'influenceur, moins 15 % de commission, une fois la publication validée.

Le frontend (Vite, React 18, TanStack Query, axios) est terminé. Il appelle l'API via `VITE_API_URL` (ex. `http://localhost:3000/api`). **Aucun secret n'est dans le front** : toutes les clés restent côté serveur. Les routes, les formats de réponse et les messages décrits dans chaque module sont **imposés par le front** et doivent être respectés à l'identique.


## Ce que ce module doit livrer

1. Le projet NestJS avec une architecture **par domaine** : `src/modules/<domaine>/{controller, service, repository, dto, domain}`. La logique métier pure (calculs, règles) vit dans `domain/` et se teste sans base de données.
2. La configuration validée au démarrage (zod) depuis l'environnement, plus un `.env.example` :
   `DATABASE_URL, REDIS_URL, SESSION_SECRET, FRONT_ORIGIN, S3_ENDPOINT, S3_BUCKET, S3_ACCESS_KEY, S3_SECRET_KEY, S3_PUBLIC_URL, PAYMENT_PROVIDER, PAYMENT_API_KEY, PAYMENT_SITE_ID, PAYMENT_WEBHOOK_SECRET, MAIL_API_KEY, MAIL_FROM, DEMO_MODE, DEMO_PASSWORD`.
3. Les conventions HTTP globales décrites plus bas : préfixe, filtre d'erreurs, CORS, sécurité.
4. Les **référentiels** sous forme de constantes TypeScript partagées dans `src/common/catalog.ts`.
5. Les tables transverses : `audit_logs`, `ref_sequences`.
6. Un utilitaire de notification `notify(recipientKey, text, link)`. Il est branché sur la table du module 02 ; dans ce module, prévoir seulement l'interface.
7. `GET /api/health` (liveness et readiness, avec vérification de PostgreSQL et Redis).
8. Une CI : lint, tests, build, vérification des migrations.

## Conventions d'API (impératives)

- Préfixe `/api`, JSON UTF-8.
- **Authentification par cookie de session HttpOnly**, `Secure` en production, `SameSite=Lax`. Jamais de jeton lisible en JavaScript.
- **CORS** : uniquement `FRONT_ORIGIN`, avec `credentials: true`.
- **Erreurs** : statut HTTP adapté (400, 401, 403, 404, 409, 422, 429, 500) et corps `{ "message": "…" }` **en français**. Le front affiche `message` tel quel dans un toast. Erreur inattendue : `{ "message": "Le service est indisponible." }`, sans fuite technique.
- **Actions** (POST, PUT) : renvoyer `{ "message": "…" }` (confirmation affichée à l'utilisateur), plus les champs spécifiques indiqués par chaque module.
- **Droits refusés** : 403 avec `{ "message": "Action non autorisée pour ce compte." }`.
- **Montants** : entiers en **FCFA**, sans décimales. Jamais de flottant pour de l'argent.
- **Dates** : ISO 8601 UTC.
- **Identifiants** : chaînes (cuid ou uuid). Le front ne fait aucune hypothèse sur leur format.
- **Noms de champs des réponses** : courts et imposés par le front (`net`, `aud`, `cats`, `t`, `a`, `l`…). La base garde des noms explicites, une couche de sérialisation par module fait la correspondance.
- **Sécurité** : helmet, HTTPS et HSTS en production, corps JSON limité à 100 Ko (3 Mo pour les routes de photo), limitation de débit globale (Redis) et renforcée par route sensible, protection CSRF (vérification de l'en-tête `Origin` sur les requêtes qui modifient des données).

## Référentiels (`src/common/catalog.ts`)

```ts
export const COMMISSION = 0.15;
export const MIN_RATE = 5000;
export const MAX_BRIEF_WORDS = 160;
export const MAX_FILE_SIZE = 9 * 1024 * 1024;
export const AUTO_VALIDATE_HOURS = 72;

export const CATS = {
  humour: 'Humour & divertissement', beaute: 'Mode & beauté', tech: 'Hi-tech & innovation',
  sport: 'Sport & bien-être', food: 'Food & maquis', actu: 'Actualités & médias',
  musique: 'Musique & danse', business: 'Vente & entrepreneuriat', societe: 'Société & lifestyle',
  jeux: 'Jeux & paris sportifs', amour: 'Amour & rencontres',
} as const;

export const RELATED = {
  beaute: ['societe', 'business', 'amour'], tech: ['jeux', 'business', 'actu'],
  humour: ['societe', 'musique', 'amour'], sport: ['jeux', 'societe'], food: ['societe', 'humour'],
  actu: ['societe', 'tech'], musique: ['humour', 'societe'], business: ['tech', 'beaute', 'actu'],
  societe: ['humour', 'beaute', 'food'], jeux: ['tech', 'sport', 'humour'], amour: ['societe', 'humour'],
};

export const NET = {
  ig: { l: 'Instagram', reach: 0.3 }, tt: { l: 'TikTok', reach: 0.42 },
  fb: { l: 'Facebook', reach: 0.16 }, sc: { l: 'Snapchat', reach: 0.26 },
};

export const OBJ = { notoriete: 'Notoriété', engagement: 'Engagement', trafic: 'Trafic', conversion: 'Conversion' };
export const AGES = ['13-17', '18-24', '25-34', '35+'];

export const PAY = {
  om: 'Orange Money', mtn: 'MTN MoMo', moov: 'Moov Money', wave: 'Wave', card: 'Carte Visa / MC',
};
export const WITHDRAW_OPERATORS = ['om', 'mtn', 'moov', 'wave'];

export const PLANS = {
  free: { l: 'Découverte', p: 0, monthlyCampaigns: 3, fullMatching: false, predictions: false },
  pro: { l: 'Pro', p: 15000, monthlyCampaigns: 5, fullMatching: true, predictions: true },
  business: { l: 'Business', p: 75000, monthlyCampaigns: Infinity, fullMatching: true, predictions: true },
};

export const BOOSTS = {
  pro: { l: 'Influenceur Pro', p: 5000 },
  certified: { l: 'Certifié', p: 10000 },
  analytics: { l: 'Analytics avancées', p: 15000 },
};

export const CITIES = ['Abidjan', 'Bouaké', 'Yamoussoukro', 'San-Pédro', 'Daloa', 'Korhogo'];
export const DAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
export const CONTACT_TYPES = ['Publicité', 'Partenariat', 'Dédicace'];

export const HELD_STATUSES = ['paid', 'accepted', 'published', 'dispute'];
export const REFUNDED_STATUSES = ['declined', 'cancelled', 'refunded'];
```

## Tables transverses

```text
audit_logs      id, actor_user_id NULL, action, target_type, target_id, data JSONB, ip, created_at
ref_sequences   name (PK), value INT          -- compteur atomique des références PU-AAMM-NNN
```

## Conformité

- Données personnelles : loi ivoirienne n° 2013-450 (ARTCI) et RGPD pour la diaspora. Minimisation des données, export et suppression de compte (module 01), consentement pour les photos, journal des accès admin.
- Secrets uniquement en variables d'environnement serveur. `DEMO_MODE=false` en production.

## Critères de fin

- `docker compose up` démarre l'API, PostgreSQL, Redis et MinIO ; `GET /api/health` répond 200.
- Une route de test qui lève une erreur métier renvoie `{ message }` avec le bon statut.
- Une requête provenant d'une autre origine que `FRONT_ORIGIN` est refusée.
- Lint, tests et build passent en CI.
