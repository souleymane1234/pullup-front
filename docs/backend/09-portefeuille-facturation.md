# Module 09 : portefeuille, retraits, formules et options payantes

> Prérequis : modules 00 à 08.

## Objectif

Permettre à l'influenceur de retirer ses gains vers son mobile money, à l'annonceur de changer de formule (abonnement mensuel), et à l'influenceur d'acheter des options de visibilité.

## Tables

```text
withdrawals      id, influencer_id, amount_fcfa, operator ENUM(om|mtn|moov|wave), phone, payout_id → payouts,
                 status ENUM(pending|sent|failed), created_at, updated_at
subscriptions    id, brand_id, plan ENUM(pro|business), status ENUM(pending|active|past_due|cancelled),
                 current_period_start, current_period_end, payment_id, created_at, updated_at
boost_purchases  id, influencer_id, boost_key ENUM(pro|certified|analytics), amount_fcfa, payment_id,
                 status ENUM(pending|active|expired), starts_at, ends_at
```

## Routes

| Méthode | Route | Droits | Entrée | Réponse |
|---|---|---|---|---|
| POST | `/wallet/withdrawals` | influenceur | `{ amount, operator, phone }` | `{ message: "<montant> envoyés sur <opérateur>." }` |
| PUT | `/billing/plan` | annonceur | `{ plan, pay?, phone? }` | `{ message, status, redirectUrl? }` |
| POST | `/billing/boosts` | influenceur | `{ key, pay, phone }` (le front envoie aujourd'hui `{ label }`, à accepter aussi le temps de la transition) | `{ message, status, redirectUrl? }` |

## Retraits

**Contrôles**
- montant entier, d'au moins 1 000 et multiple de 100 : sinon 422 `« Saisissez un montant multiple de 100, minimum 1 000 FCFA. »` ;
- montant supérieur au disponible : 422 `« Montant supérieur à votre solde disponible. »` ;
- téléphone de moins de 8 chiffres : 422 `« Saisissez votre numéro mobile money. »` ;
- opérateur parmi `om`, `mtn`, `moov`, `wave`.

**Déroulé**, dans une transaction avec verrou sur le portefeuille :
1. `walletToPayout` ;
2. création du retrait `pending` et du payout ;
3. hors transaction : `PaymentProvider.initPayout`.

Réponse immédiate : `« <montant> envoyés sur <opérateur>. »`.

**Webhooks**
- `payout.sent` : statut `sent`.
- `payout.failed` : `payoutFailed` (recrédit), statut `failed`, notification `« Votre retrait de <montant> a échoué : le montant est de retour sur votre solde. »`.

**Anti-fraude**
- 3 retraits et 500 000 FCFA maximum par jour (configurable).
- Premier retrait vers un nouveau numéro : vérification par code SMS.
- Au-delà de 1 000 000 FCFA cumulés : pièce d'identité exigée (KYC, statut sur le profil).
- Retraits bloqués tant que le profil n'est pas `verified`.

## Formules annonceur

- `free` : gratuit. Repasser en `free` annule l'abonnement à la fin de la période en cours.
- `pro` : 15 000 FCFA par mois ; `business` : 75 000 FCFA par mois.
  - Paiement via `PaymentProvider` (solde PULLUP utilisable).
  - À la réussite : abonnement `active` pour 30 jours, `brands.plan` mis à jour, `collectRevenue`.
  - Message : `« Formule <Pro|Business> activée. »`.
  - En attente : `status: 'awaiting_payment'` et message `« Confirmez le paiement sur votre téléphone. »`.
- Formule inconnue : 422 `« Formule inconnue. »`.
- **Renouvellement** : 3 jours avant l'échéance, notification et lien de paiement. Sans paiement à l'échéance : `past_due`, puis retour à `free` après 3 jours de grâce.
- Les droits de chaque formule (quotas, matching complet, prédictions, liens UTM, export CSV) sont lus depuis `PLANS`, à un seul endroit.

## Options influenceur

| Clé | Libellé | Prix | Effet pendant 30 jours |
|---|---|---|---|
| `pro` | Influenceur Pro | 5 000 | mise en avant dans l'annuaire et le matching (bonus de tri), éligible au profil vedette de l'accueil |
| `certified` | Certifié | 10 000 | `certified=true` (badge), priorité dans les recommandations ; soumis à validation admin |
| `analytics` | Analytics avancées | 15 000 | accès aux statistiques détaillées (visiteurs, clics UTM par campagne, comparaison avec la catégorie) |

- Paiement via `PaymentProvider`.
- À la réussite : option `active`, puis `collectRevenue`. Message : `« Option <libellé> activée pour 30 jours. »`.
- Tâche quotidienne d'expiration des options.

## Tests attendus

- Règles de montant des retraits ; concurrence (deux retraits simultanés ne dépassent jamais le solde).
- Retrait échoué : solde recrédité une seule fois.
- Changement de formule, quota appliqué immédiatement, expiration et retour à `free`.
- Expiration d'une option.

## Critères de fin

L'onglet portefeuille, la page tarifs, l'onglet formule et l'onglet booster du front fonctionnent avec de vrais paiements (`FakeProvider` en développement).
