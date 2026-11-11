# Module 10 : back-office administrateur

> Prérequis : modules 00 à 09.

## Objectif

Donner à l'équipe PULLUP une vue d'ensemble et les outils de pilotage :
- options de version ;
- vérification des nouveaux profils ;
- photos ;
- suivi et arbitrage des campagnes ;
- finance et modération.

## Routes utilisées par le front

| Méthode | Route | Réponse |
|---|---|---|
| GET | `/admin/dashboard` | `{ campaigns: Campaign[], influencers: Influencer[], brands: Brand[], flags: { v2, v3 } }` |
| PUT | `/admin/flags/:key` | module 02 |
| POST | `/admin/influencers/:id/verify` | `{ message: "<nom> est maintenant vérifié." }` |
| POST | `/admin/influencers/:id/reject` | `{ message: "Profil refusé." }` |
| PUT | `/influencers/:id/photo` | module 03 (avec `consent: true` pour l'admin) |
| POST | `/campaigns/:id/validate`, `/release`, `/refund` | module 07 |
| POST | `/admin/campaigns/auto-validate` | module 07 |

Contenu du tableau de bord :
- `influencers` : **tous** les statuts (`pending`, `active`, `rejected`, `suspended`), avec `email` et `phone` ;
- `brands` : tous les annonceurs, au format `{ id, name, contact, email, plan, sector, balance }` ;
- `campaigns` : toutes les campagnes, des plus récentes aux plus anciennes.

Le tableau de bord du front calcule lui-même les indicateurs (volume, commissions, litiges). Quand les volumes grossiront, ajouter `GET /admin/stats` (agrégats SQL) et paginer les listes (`?cursor&limit&status`).

## Règles

**Vérification d'un profil** (`verify`)
- `verified=true`, `status=active` ;
- notification de l'influenceur : `« Votre profil est vérifié : votre vitrine est visible dans l'annuaire. »`, lien `/i/<handle>` ;
- e-mail de bienvenue.

**Refus d'un profil** (`reject`)
- `status=rejected`, avec motif optionnel `{ reason }` ;
- e-mail à l'influenceur avec le motif.

**Traçabilité**
- Toute action admin écrit dans `audit_logs` : acteur, action, cible, données avant et après.

**Rôles internes** (optionnel)
- `admin` (tout), `support` (lecture, messages, vérification) et `finance` (finance, arbitrage).
- Accès réservé aux comptes avec double authentification (TOTP).

## Routes supplémentaires à livrer pour l'exploitation

| Méthode | Route | Rôle |
|---|---|---|
| POST | `/admin/influencers/:id/suspend` | masquer un profil (fraude, plainte), avec motif |
| PUT | `/admin/influencers/:id/scores` | ajuster `auth`, `creat`, `brief`, `onTime`, l'audience et les réseaux après audit (statistiques vérifiées) |
| POST | `/admin/influencers/:id/certify` | valider l'option « Certifié » |
| GET | `/admin/finance/summary` | séquestre total, commissions du mois, retraits en attente, écarts de rapprochement |
| GET | `/admin/finance/ledger.csv?from&to` | export comptable du grand livre |
| GET | `/admin/withdrawals?status` | suivi des retraits, relance d'un retrait échoué |
| GET | `/admin/audit?actor&target` | consultation du journal d'audit |
| POST | `/admin/brands/:id/credit` | geste commercial sur le solde annonceur (motif obligatoire, écriture au grand livre) |

## Tests attendus

- Un non-admin reçoit 403 sur toutes les routes `/admin/*`.
- La vérification rend le profil visible dans l'annuaire et envoie la notification.
- Chaque action admin crée une ligne d'audit.

## Critères de fin

Les cinq sections du back-office du front (vue d'ensemble, versions, vérification, photos, campagnes) fonctionnent avec l'API.
