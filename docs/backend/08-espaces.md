# Module 08 : espaces personnels (« Mon espace »)

> Prérequis : modules 00 à 07.

## Objectif

Fournir en un seul appel toutes les données de l'espace annonceur et de l'espace influenceur, pour éviter que le front enchaîne plusieurs requêtes.

## Routes

| Méthode | Route | Droits | Réponse |
|---|---|---|---|
| GET | `/me/brand-space` | annonceur | `{ brand, campaigns, favorites }` |
| GET | `/me/influencer-space` | influenceur | `{ influencer, campaigns, requests, wallet, escrow }` |
| PUT | `/me/brand` | annonceur | `{ message: "Profil enregistré." }`, entrée `{ name, contact, sector }` |
| GET | `/me/campaigns.csv` | annonceur | export CSV des campagnes (formule `business`, sinon 403) |

## Formats

**`/me/brand-space`**

```json
{
  "brand": { "id": "b1", "name": "Savane Cosmetics", "contact": "Aïcha Diomandé", "email": "marketing@savane.ci",
             "plan": "pro", "sector": "Cosmétique", "balance": 35000 },
  "campaigns": [Campaign],
  "favorites": [Influencer avec "favorite": true]
}
```

- `campaigns` : toutes les campagnes de l'annonceur, des plus récentes aux plus anciennes (format du module 07).
- `favorites` : profils de la sélection, dans l'ordre d'ajout. Les profils devenus non listés restent visibles avec leur statut, pour que l'annonceur puisse les retirer.

**`/me/influencer-space`**

```json
{
  "influencer": Influencer (avec "email" et "phone", c'est son propre profil, statut pending inclus),
  "campaigns": [Campaign],
  "requests": [{ "id": "r1", "infId": "i1", "from": "Boutique Nana Wax", "contact": "+225 07…",
                 "msg": "…", "type": "Partenariat", "at": "…" }],
  "wallet": { "available": 142500, "tx": [{ "t": "in|out", "a": 76500, "l": "Campagne PU-2409-118 libérée", "at": "…" }] },
  "escrow": 76500
}
```

- `wallet.tx` : 50 derniers mouvements du portefeuille, des plus récents aux plus anciens. Ils sont construits à partir du grand livre (crédits : campagnes libérées ; débits : retraits `Retrait <opérateur>`, retraits échoués recrédités).
- `escrow` : somme des `payout` au statut `paid`, `accepted`, `published` ou `dispute`.
- `requests` : demandes de contact reçues, des plus récentes aux plus anciennes.

## Règles

- Ces routes renvoient 403 `« Action non autorisée pour ce compte. »` si le rôle ne correspond pas.
- Temps de réponse visé : moins de 200 ms. Utiliser des requêtes groupées (pas de N+1) et la sérialisation commune des objets `Campaign` et `Influencer`.
- L'onglet « Mes statistiques » du front utilise `influencer.views`, `qr` et `contacts`, ainsi que les `perf` des campagnes : aucune route supplémentaire.

## Tests attendus

- Un annonceur ne voit que ses campagnes et favoris ; un influenceur, seulement les siennes et ses demandes.
- `escrow` et `wallet.available` sont cohérents avec le grand livre après une libération et un retrait.

## Critères de fin

Tous les onglets de « Mon espace » (marque et influenceur) se chargent depuis l'API en un seul appel chacun.
