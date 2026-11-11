# Module 05 : paiements mobile money et grand livre

> Prérequis : modules 00 à 02. Ce module ne contient aucune règle de campagne : il fournit les briques financières utilisées par les modules 06, 07 et 09.

## Objectif

Encaisser (Orange Money, MTN MoMo, Moov Money, Wave, carte), décaisser (retraits vers le mobile money), et tracer **chaque franc** dans un grand livre en double entrée, fiable et rapprochable.

## Agrégateur de paiement

- Interface `PaymentProvider` avec une implémentation **CinetPay** (ou PayDunya, configurable via `PAYMENT_PROVIDER`) et une implémentation **FakeProvider** pour le développement et les tests :

```ts
interface PaymentProvider {
  initCollect(input: { reference: string; amount: number; method: 'om'|'mtn'|'moov'|'wave'|'card';
    phone?: string; description: string; customer: { name: string; email: string } }):
    Promise<{ providerRef: string; status: 'pending'|'succeeded'; redirectUrl?: string }>;
  getCollectStatus(providerRef: string): Promise<'pending'|'succeeded'|'failed'|'expired'>;
  initPayout(input: { reference: string; amount: number; operator: 'om'|'mtn'|'moov'|'wave'; phone: string }):
    Promise<{ providerRef: string; status: 'pending'|'sent' }>;
  verifyWebhook(headers: Record<string, string>, rawBody: Buffer): boolean;
}
```

- Mobile money : déclenchement d'une demande de confirmation sur le téléphone (push USSD).
- Carte : `redirectUrl` vers la page sécurisée de l'agrégateur. **PULLUP ne voit jamais les numéros de carte.**

## Tables

```text
payments        id, purpose ENUM(campaign|plan|boost), target_id (campaign / subscription / boost), payer_user_id,
                method, phone NULL, amount_fcfa (part payée chez l'agrégateur), from_balance_fcfa,
                provider, provider_ref UNIQUE NULL, status ENUM(pending|succeeded|failed|expired),
                raw_payload JSONB, created_at, updated_at
payouts         id, purpose ENUM(withdrawal), target_id, amount_fcfa, operator, phone, provider_ref UNIQUE NULL,
                status ENUM(pending|sent|failed), raw_payload JSONB, created_at, updated_at
ledger_entries  id, tx_id (regroupe les lignes d'une même opération), account_type
                ENUM(brand_balance|escrow|influencer_wallet|platform_revenue|external_psp),
                account_id NULL, campaign_id NULL, direction ENUM(debit|credit), amount_fcfa > 0, label, created_at
                -- immuable : ni UPDATE ni DELETE (trigger), Σ débits = Σ crédits par tx_id
wallets         influencer_id PK, available_fcfa INT ≥ 0, updated_at      (solde dérivable du grand livre)
webhook_events  id, provider, event_id UNIQUE, payload JSONB, processed_at NULL, created_at
```

`brands.balance_fcfa` et `wallets.available_fcfa` sont des **soldes matérialisés** pour la lecture rapide. Ils sont mis à jour dans la même transaction que les écritures, et une vérification nocturne les compare au grand livre.

## Service `LedgerService` (API interne)

Chaque méthode s'exécute dans une transaction SQL, avec verrous `SELECT … FOR UPDATE` sur les soldes touchés.

| Méthode | Écritures |
|---|---|
| `collectToEscrow(campaign, amountPsp)` | external_psp → escrow |
| `balanceToEscrow(brandId, campaign, amount)` | brand_balance → escrow (refus si solde insuffisant) |
| `releaseEscrow(campaign)` | escrow → influencer_wallet (`payout`) et escrow → platform_revenue (`fee`) |
| `refundEscrow(campaign)` | escrow → brand_balance (`amount`, commission incluse) |
| `walletToPayout(influencerId, amount, ref)` | influencer_wallet → external_psp |
| `payoutFailed(influencerId, amount, ref)` | external_psp → influencer_wallet |
| `collectRevenue(purpose, amount)` | external_psp → platform_revenue (formules et options) |

`escrowOf(influencerId)` = somme des `payout` des campagnes de l'influenceur au statut `paid`, `accepted`, `published` ou `dispute`.

## Webhooks

`POST /payments/webhook/:provider` (public, sans cookie, sans CSRF, corps brut conservé).

1. Vérifier la signature (HMAC avec `PAYMENT_WEBHOOK_SECRET`). En cas d'échec : 401 et log.
2. Idempotence : `webhook_events.event_id` unique. Un événement déjà traité renvoie 200 sans rien refaire.
3. **Ne jamais croire le corps** : revérifier le statut avec `getCollectStatus` ou l'équivalent pour les retraits.
4. Émettre un événement interne (`payment.succeeded`, `payment.failed`, `payout.sent`, `payout.failed`) que les modules 06 et 09 consomment.
5. Répondre 200 rapidement ; le traitement lourd passe en file BullMQ.

Tâche planifiée toutes les 5 minutes : relancer `getCollectStatus` pour les paiements `pending` de plus de 10 minutes, et passer en `expired` après 30 minutes.

## Rapprochement et contrôle

- Chaque nuit : comparaison des paiements et retraits avec le relevé de l'agrégateur, contrôle « Σ débits = Σ crédits », et soldes matérialisés égaux au grand livre. Toute anomalie déclenche une alerte Sentry et une notification `'admin'`.
- Exports CSV pour la comptabilité (`GET /admin/finance/ledger?from&to`, module 10).

## Sécurité

- Montants **toujours recalculés côté serveur**, jamais repris du client.
- Plafonds : 2 000 000 FCFA par paiement ; retraits limités par jour (module 09).
- Clés de l'agrégateur uniquement côté serveur. Journaux sans numéro de carte et avec téléphones masqués (`07 •• •• 12`).

## Tests attendus

- Chaque opération du grand livre est équilibrée ; un solde ne devient jamais négatif (test de concurrence avec 10 opérations simultanées).
- Webhook rejoué deux fois : un seul effet. Webhook mal signé : 401.
- `FakeProvider` permet de simuler réussite, échec et expiration.

## Critères de fin

Les modules suivants peuvent encaisser, libérer, rembourser et décaisser en appelant uniquement `LedgerService` et `PaymentProvider`.
