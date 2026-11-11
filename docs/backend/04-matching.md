# Module 04 : matching IA (V3)

> Prérequis : modules 00 à 03. Actif seulement si l'option `v3` est activée (module 02).

## Objectif

À partir d'un brief annonceur, classer les influenceurs listés par compatibilité, estimer la portée et les interactions, expliquer chaque recommandation, et respecter les droits de la formule de l'annonceur.

## Route

`POST /matching` (public).

Entrée :

```json
{ "theme": "beaute", "objective": "notoriete", "net": "any|ig|tt|fb|sc", "budget": 100000,
  "age": "|0|1|2|3", "gender": "all|f|m", "city": "|Abidjan|…" }
```

Réponse : `{ "results": Match[], "plan": "free|pro|business|null" }`. `plan` vaut `null` pour un visiteur ou un compte non annonceur.

```json
{
  "influencer": Influencer,
  "s": 0.82, "note": 4.6, "reach": 51200, "interactions": 3100, "price": 35000,
  "inBudget": true, "why": ["Thématique alignée : Mode & beauté", "…"],
  "bestNet": "ig", "reco": "Campagnes de notoriété", "cpm": 683.6
}
```

## Algorithme (à reproduire exactement, dans `domain/matching.ts`)

Pour chaque profil **listé** ; ignorer le profil si `net ≠ any` et qu'il n'a pas ce réseau.

```text
thème        = 1 si brief.theme ∈ cats ; 0,55 si une catégorie ∈ RELATED[theme] ; sinon 0,1
engagement   = net = any ? engagement moyen : engagement du réseau
scoreEng     = clamp(engagement / 8)

fit = 1
  gender f : fit ×= clamp(f/100 × 1,5)
  gender m : fit ×= clamp((100 − f)/100 × 1,5)
  age ≠ '' : fit ×= clamp(ages[age] / 45 + 0,3)
  city ≠ '': part = % de cette ville dans l'audience (3 si absente) ; fit ×= clamp(part/55 + 0,3)

audience     = auth/100 × clamp(fit)
historique   = clamp(rating/5 × 0,5 + onTime/100 × 0,3 + clamp(done/60) × 0,2)
s            = thème×0,4 + scoreEng×0,3 + audience×0,2 + historique×0,1
note         = round1(3 + 2s)

abonnés      = net = any ? max des abonnés par réseau : abonnés du réseau
bestNet      = net = any ? réseau ayant le plus d'abonnés : net
reach        = round(abonnés × NET[bestNet].reach × (0,75 + 0,5s))
interactions = round(reach × engagement/100 × (0,85 + 0,3s))
price        = min_price(net) ; inBudget = price ≤ budget ; cpm = price / reach × 1000
reco         = notoriete → « Campagnes de notoriété » · engagement → « Challenges et concours »
               trafic → « Activations digitales » · conversion → « Lancements de produits »
```

Phrases `why`, dans l'ordre :
1. thème identique : `« Thématique alignée : <libellé> »` ; thème proche : `« Thématique proche (<libellés des catégories>) »` ;
2. `« Engagement de <x,x> % en moyenne »` ou `« … sur <Réseau> »` ;
3. si la ville est demandée et pèse au moins 10 % : `« <part> % de l'audience à <ville> »` ;
4. si un genre est demandé : `« <part> % d'audience féminine|masculine »` ;
5. `« <onTime> % des campagnes publiées à l'heure, audience authentique à <auth> % »`.

Tri : `inBudget` d'abord, puis `s` décroissant.

## Droits selon la formule (appliqués côté serveur)

Le flou CSS du front ne protège rien : le serveur ne doit pas envoyer les données réservées.

- **Visiteur ou formule `free`** :
  - les 3 premiers résultats sont complets, mais sans prédictions (`reach`, `interactions` et `cpm` à `null`) ;
  - les résultats suivants (affichés floutés) sont **masqués** : `influencer` réduit à `{ id: 'masked-<n>', name: 'Profil réservé', hue, cats }`, sans handle, photo ni prix ; `masked: true`.
- **`pro`** : tous les résultats et les prédictions.
- **`business`** : idem, plus une analyse du brief (champ optionnel `insights`), à prévoir pour plus tard.

## Évolutions prévues

- Journaliser chaque brief et ses résultats (`matching_queries` : `brand_id`, `brief` JSONB, ids proposés, `created_at`). Puis relier les campagnes réservées depuis le matching pour mesurer la conversion.
- Remplacer ou compléter le score par un modèle entraîné sur les performances réelles des campagnes (module 07), **sans changer l'interface**.
- Limitation de débit : 30 requêtes par minute et par IP.

## Tests attendus

- Même classement et mêmes notes que `front/src/domain/matching.js` pour 3 briefs types (beauté à Abidjan sur Instagram ; tech sur TikTok ; humour sans filtre).
- Masquage correct pour `free` et visiteur ; données complètes pour `pro`.
- 403 si `v3` est désactivée.

## Critères de fin

La page Matching IA du front affiche les résultats, les explications, le flou et l'invitation à changer de formule selon le compte.
