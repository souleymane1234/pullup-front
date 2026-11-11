# Module 07 : cycle de vie des campagnes, messages et avis

> Prérequis : modules 00 à 06.

## Objectif

Faire avancer une campagne de la réservation jusqu'au paiement de l'influenceur (acceptation, preuve de publication, validation, litige, remboursement), avec un fil de messages entre les parties et un avis final.

## Objet `Campaign` (format exact)

```json
{
  "id": "c1", "ref": "PU-2410-137", "brandId": "b1", "infId": "i1",
  "offer": { "id": "r2", "net": "ig", "fmt": "Post + carrousel", "price": 90000 },
  "amount": 90000, "fee": 13500, "payout": 76500,
  "status": "paid", "createdAt": "…", "pay": "om",
  "brief": { "title": "…", "objective": "notoriete", "theme": "beaute", "text": "…",
             "link": "https://…", "date": "…|null", "file": "url|null" },
  "log": [{ "s": "paid", "at": "…", "n": "Paiement Orange Money reçu · 90 000 FCFA bloqués en séquestre" }],
  "perf": { "views": 96400, "likes": 7310, "comments": 412, "shares": 388, "clicks": 1240 },
  "proof": { "url": "https://…", "note": "…", "at": "…" },
  "msgs": [{ "from": "brand|influencer|admin", "t": "texte", "at": "…" }],
  "review": { "stars": 5, "text": "…", "at": "…" },
  "disputeReason": "…",
  "utm": "https://…?utm_source=pullup&…",
  "influencer": { "id": "i1", "handle": "amakouassi", "name": "Ama Kouassi", "hue": 47, "photo": null, "verified": true },
  "brand": { "id": "b1", "name": "Savane Cosmetics" }
}
```

`perf`, `proof`, `review` et `disputeReason` valent `null` tant qu'ils n'existent pas. `log` est trié chronologiquement.

## Tables ajoutées

```text
campaign_messages  id, campaign_id, from_role ENUM(brand|influencer|admin), author_user_id, body (≤ 2 000), created_at
reviews            (module 03) : campaign_id UNIQUE, influencer_id, brand_name, stars, text, created_at
utm_clicks         id, campaign_id, ip_hash, user_agent, created_at
```

## Routes

| Méthode | Route | Droits | Réponse |
|---|---|---|---|
| GET | `/campaigns` | connecté | `Campaign[]` : toutes pour l'admin, sinon celles où l'on est l'annonceur ou l'influenceur |
| GET | `/campaigns/:id` | connecté | `{ access: 'ok', campaign }`, `{ access: 'forbidden' }` ou `{ access: 'missing' }` (toujours HTTP 200) |
| POST | `/campaigns/:id/:action` | selon l'action | `{ message }` |
| POST | `/campaigns/:id/review` | annonceur | `{ message: "Merci ! Votre avis est publié sur la vitrine." }` |
| POST | `/campaigns/:id/messages` | les parties et l'admin | `{ message: "Message envoyé." }` |
| POST | `/admin/campaigns/auto-validate` | admin | `{ message }` |
| GET | `/r/:ref` | public | redirection 302 vers le lien UTM, avec comptage du clic |

## Machine à états

- Toute transition absente du tableau : 409 `« Cette action n'est plus disponible. »`.
- Mauvais rôle, ou utilisateur qui n'est pas partie à la campagne (hors admin) : 403 `« Action non autorisée pour ce compte. »`.
- Action ou campagne inconnue : 404 `« Campagne introuvable. »`.
- Chaque transition ajoute une ligne au journal (`campaign_events`) et s'exécute dans **une seule transaction** avec les écritures financières.

| Action | Rôle | Depuis | Vers | Effets et message renvoyé |
|---|---|---|---|---|
| `accept` | influenceur | paid | accepted | Journal : « <nom> a accepté la campagne ». Notifie l'annonceur : « <nom> a accepté « <titre> ». ». Message : **« Campagne acceptée. Publiez à la date prévue. »** |
| `decline` | influenceur | paid | declined | `refundEscrow`. Journal : « Refusée par l'influenceur · remboursement sur le solde annonceur ». Notifie : « <nom> a refusé « <titre> ». <montant> recrédités sur votre solde. ». Message : **« Campagne refusée. L'annonceur est remboursé. »** |
| `proof` `{ url, note }` | influenceur | accepted | published | `url` doit commencer par `http(s)://`, sinon 422 « Collez le lien complet de votre publication. ». Enregistre la preuve, `published_at` et l'estimation `perf` (voir plus bas). Journal : « Preuve de publication envoyée ». Notifie : « <nom> a publié « <titre> ». Validez pour libérer les fonds. ». Message : **« Preuve envoyée. Paiement à la validation. »** |
| `cancel` | annonceur | paid, accepted | cancelled | `refundEscrow`. Journal : « Annulée par l'annonceur · remboursement sur le solde ». Notifie l'influenceur : « La campagne « <titre> » a été annulée par l'annonceur. ». Message : **« <montant> recrédités sur votre solde PULLUP. »** |
| `validate` | annonceur, admin | published | completed | `releaseEscrow`. Journal : « Validée par l'annonceur · fonds libérés », ou « Validation automatique après 72 h · fonds libérés » si admin ou tâche planifiée. Message : **« Fonds libérés à l'influenceur. »** |
| `dispute` `{ reason }` | annonceur | published | dispute | `reason` obligatoire, sinon 422 « Décrivez le problème rencontré. ». Journal : « Litige ouvert par l'annonceur ». Notifie l'admin (« Litige ouvert sur <ref>. ») et l'influenceur (« Un litige a été ouvert sur « <titre> ». »). Message : **« Litige transmis à l'équipe PULLUP. »** |
| `release` | admin | dispute | completed | `releaseEscrow`. Journal : « Litige tranché en faveur de l'influenceur · fonds libérés ». Notifie l'annonceur : « Litige <ref> clos : fonds versés à l'influenceur. ». Message : **« Fonds versés à l'influenceur. »** |
| `refund` | admin | dispute | refunded | `refundEscrow`. Journal : « Litige tranché en faveur de l'annonceur · remboursement ». Notifie l'annonceur (« Litige <ref> clos : <montant> recrédités sur votre solde. ») et l'influenceur (« Litige <ref> clos en faveur de l'annonceur. »). Message : **« Annonceur remboursé. »** |

**Effets de la libération des fonds** (`validate`, `release`, validation automatique) :
- `done_count += 1` pour l'influenceur ;
- mouvement de portefeuille `{ t: 'in', a: payout, l: 'Campagne <ref> libérée' }` ;
- notification de l'influenceur : `« <payout> ajoutés à votre solde disponible (<ref>). »`, lien `/espace?tab=wallet` ;
- `completed_at` renseigné.

**Liens des notifications** : `/c/<id>`.

## Performances (`perf`)

- À la preuve, initialiser une estimation à partir du réseau de l'offre (`followers`, `engagement`) :
  - `views = round(followers × NET.reach × aléa[0,8 ; 1,2])` ;
  - `likes = round(views × eng/100 × 0,8)` ;
  - `comments = round(views × eng/100 × 0,08)` ;
  - `shares = round(views × eng/100 × 0,06)` ;
  - `clicks = round(views × 0,012)`.
- **Clics réels** : `GET /r/:ref` compte chaque clic (dédoublonné par IP et jour) et remplace l'estimation de `perf_clicks` dès qu'il y a des clics réels.
- Plus tard : import des statistiques des réseaux (API Meta, TikTok), sans changer le format.

## Messages `POST /campaigns/:id/messages`

- Entrée : `{ text }`. Texte vide : 422 `« Écrivez un message. »`. 2 000 caractères maximum.
- `from` = rôle de l'auteur.
- Notifications :
  - de l'annonceur vers l'influenceur : `« Nouveau message de <marque> sur « <titre> ». »` ;
  - de l'influenceur vers l'annonceur : `« Nouveau message de <nom> sur « <titre> ». »` ;
  - de l'admin vers les deux parties : `« Message de l'équipe PULLUP sur <ref>. »`.
- Optionnel : temps réel en SSE ou WebSocket.
- Limite : 30 messages par minute.
- Modération : masquer les numéros de téléphone et les e-mails dans les messages avant le statut `accepted`, pour éviter de contourner la plateforme.

## Avis `POST /campaigns/:id/review`

- Entrée : `{ stars: 1-5, text }`.
- Conditions : être l'annonceur de la campagne, statut `completed`, aucun avis existant. Sinon 403.
- Recalcul : `rating = round1((rating × reviews + stars) / (reviews + 1))`, puis `reviews += 1`, puis le Score PULLUP.
- Notification de l'influenceur : `« <marque> vous a laissé un avis <stars>/5. »`, lien `/i/<handle>`.

## Tâches planifiées (BullMQ, idempotentes)

- **Toutes les heures** : campagnes `published` depuis au moins 72 h → `validate` automatique (journal « Validation automatique après 72 h · fonds libérés »).
- **`POST /admin/campaigns/auto-validate`** exécute immédiatement la même tâche. Messages : `« <n> campagne(s) validée(s) automatiquement. »` ou `« Aucune publication en attente de validation. »`.
- **Campagnes `paid` sans réponse** : relance à 48 h, puis remboursement automatique à 72 h (journal « Sans réponse de l'influenceur sous 72 h · remboursement »).
- **Rappel** à l'influenceur la veille de `brief.date`.
- **Mise à jour des scores** de l'influenceur après chaque campagne terminée : `on_time` selon `published_at ≤ brief_date + 24 h`, `brief_score` selon l'absence de litige.

## Tests attendus

- Chaque transition autorisée ou refusée (matrice complète rôles × statuts).
- Libération et remboursement : soldes et grand livre exacts, une seule fois, même en double clic simultané.
- Validation automatique à 72 h. Avis unique et note recalculée (4,8 avec 61 avis + 5 → 4,8).
- `GET /campaigns/:id` renvoie bien `forbidden` ou `missing`.

## Critères de fin

La page campagne du front (suivi, actions, preuve, litige, messages, avis) et l'onglet campagnes des deux espaces fonctionnent de bout en bout.
