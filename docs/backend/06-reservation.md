# Module 06 : réservation d'un influenceur (V2)

> Prérequis : modules 00 à 05. Actif seulement si l'option `v2` est activée.

## Objectif

Permettre à un annonceur de réserver une offre d'un influenceur avec un brief, de payer (solde PULLUP en priorité, puis mobile money ou carte), et de créer la campagne avec les fonds sous séquestre.

## Tables

```text
campaigns   id, ref UNIQUE (PU-AAMM-NNN), brand_id, influencer_id,
            offer_rate_id, offer_net, offer_format, offer_price       -- copie figée de l'offre
            amount_fcfa, fee_fcfa, payout_fcfa, pay_method,
            status ENUM(awaiting_payment|paid|accepted|published|completed|dispute|declined|cancelled|refunded),
            brief_title, brief_objective, brief_theme, brief_text, brief_link, brief_date NULL, brief_file_url NULL,
            utm_url, proof_url NULL, proof_note NULL, proof_at NULL,
            perf_views, perf_likes, perf_comments, perf_shares, perf_clicks (NULL tant que non publiée),
            dispute_reason NULL, accepted_at, published_at, completed_at, created_at, updated_at
            INDEX (brand_id, created_at DESC), (influencer_id, status), (status, published_at)
campaign_events  id, campaign_id, status, note, actor_user_id NULL, created_at     -- le « log » affiché
uploads     id, owner_user_id, key S3, mime, size, purpose ENUM(brief), created_at
```

## Routes

| Méthode | Route | Droits | Entrée | Réponse |
|---|---|---|---|---|
| GET | `/booking/:handle` | public | – | `{ influencer: Influencer, balance }` ou `null` |
| POST | `/uploads/brief` | annonceur | `{ filename, mime, size }` | `{ uploadUrl, fileUrl }` (URL présignée S3, 10 min) |
| POST | `/campaigns` | annonceur | voir plus bas | `{ id, message, status, redirectUrl? }` |
| GET | `/campaigns/:id/payment` | parties | – | `{ status: 'awaiting_payment'\|'paid'\|'cancelled' }` (interrogé par le front pendant la confirmation) |

`GET /booking/:handle` :
- `null` si le profil n'est pas listé ;
- `balance` = solde de l'annonceur connecté, 0 sinon.

Entrée de `POST /campaigns` :

```json
{
  "infId": "i1", "rateId": "r2", "pay": "om|mtn|moov|wave|card", "phone": "07 00 00 00 00",
  "brief": { "title": "…", "objective": "notoriete", "theme": "beaute", "text": "…",
             "link": "https://…", "date": "2026-10-10", "file": "https://cdn…/brief.pdf" }
}
```

## Déroulé serveur

1. **Contrôles**
   - option `v2` active ;
   - session annonceur ;
   - profil listé ;
   - `rateId` appartient à l'influenceur et n'est pas archivé : sinon 422 `« Choisissez une offre. »` ;
   - quota mensuel de la formule (free 3, pro 5, business illimité ; campagnes créées ce mois-ci hors `cancelled` pour cause d'échec de paiement) : sinon 403 `« Quota de campagnes atteint pour votre formule. »`.
2. **Validation du brief**
   - titre requis : `« Donnez un nom à la campagne. »` ;
   - texte de 5 mots minimum : `« Ajoutez quelques consignes pour l'influenceur. »` ;
   - 160 mots maximum : `« 160 mots maximum. »` ;
   - lien vide ou commençant par `http(s)://` : `« Le lien doit commencer par https:// »` ;
   - date vide ou future ;
   - `file` vide ou URL issue de `/uploads/brief` appartenant à cet annonceur ;
   - téléphone d'au moins 8 chiffres si `pay ≠ card` : `« Saisissez un numéro de téléphone valide. »`.
3. **Montants**
   - `amount = offer_price` ;
   - `fee = round(amount × 0,15)` ;
   - `payout = amount − fee` ;
   - `fromBalance = min(solde annonceur, amount)` ;
   - `toCollect = amount − fromBalance`.
4. **Création** de la campagne, dans une transaction :
   - `ref` via `ref_sequences` (atomique) : `PU-<AA><MM>-<n>` ;
   - lien de suivi : `utm = <lien sans query, ou https://votre-site.ci>?utm_source=pullup&utm_medium=<libellé du réseau en minuscules>&utm_campaign=<ref en minuscules>&utm_content=<handle>`.
5. **Paiement**
   - Si `toCollect = 0` : `LedgerService.balanceToEscrow`, statut `paid`, puis l'étape 6.
   - Sinon :
     - réserver la part payée par le solde (`balanceToEscrow`) ;
     - créer `payments` (`pending`) et appeler `PaymentProvider.initCollect` ;
     - statut `awaiting_payment` ;
     - répondre `{ id, status: 'awaiting_payment', message: "Confirmez le paiement sur votre téléphone.", redirectUrl? }`.
6. **À la réussite** (immédiate ou via l'événement `payment.succeeded`) :
   - `collectToEscrow` ;
   - statut `paid` ;
   - événement au journal : `« Paiement <opérateur> reçu · <montant formaté> bloqués en séquestre »` ;
   - notification de l'influenceur : `« Nouvelle campagne de <marque> : <montant> bloqués en séquestre. Acceptez-la sous 72 h. »`, lien `/c/<id>` ;
   - réponse (cas immédiat) : `{ id, status: 'paid', message: "Paiement reçu. Les fonds sont sous séquestre." }`.
7. **À l'échec ou à l'expiration** (`payment.failed`) :
   - rembourser la part prise sur le solde ;
   - statut `cancelled` ;
   - événement au journal : `« Paiement non abouti »` ;
   - notification de l'annonceur.

Formatage des montants dans les textes : `90 000 FCFA` (espace fine insécable comme séparateur de milliers, à l'identique du front `formatFcfa`).

## Tests attendus

- Montants et commission (90 000 → frais 13 500 → net 76 500).
- Solde suffisant : `paid` immédiat. Solde partiel : `awaiting_payment`, puis `paid` après le webhook ; en cas d'échec, solde restauré.
- Quota free dépassé : 403. Offre d'un autre influenceur : 422.
- Référence unique sous forte concurrence. Lien UTM exact.

## Critères de fin

Le parcours « Engager » du front (brief, paiement, confirmation) crée une vraie campagne visible dans les deux espaces.
