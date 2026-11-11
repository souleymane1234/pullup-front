# Prompts backend PULLUP, module par module

Ces prompts décrivent l'API et la base de données attendues par le frontend. Ils sont déduits du code existant (`src/services`, `src/domain`, `src/services/demo/seed.js`). Les routes, les formats de réponse et les messages sont **imposés par le front** : en les respectant, il suffit de renseigner `VITE_API_URL` pour quitter le mode démo.

## Comment les utiliser

1. Commencer une session avec `00-socle.md`.
2. Pour chaque module suivant, coller **`00-socle.md` puis le fichier du module**, dans l'ordre ci-dessous.
3. Ne passer au module suivant que lorsque les **critères de fin** du module en cours sont remplis (tests verts).

## Ordre de construction

| # | Fichier | Contenu | Dépend de |
|---|---|---|---|
| 00 | [00-socle.md](00-socle.md) | Projet NestJS, conventions d'API, référentiels, sécurité, Docker | – |
| 01 | [01-auth.md](01-auth.md) | Inscription (marque, influenceur), connexion, session, démo, mot de passe | 00 |
| 02 | [02-plateforme-notifications.md](02-plateforme-notifications.md) | Options V2/V3, accueil, centre de notifications | 00, 01 |
| 03 | [03-influenceurs.md](03-influenceurs.md) | Annuaire, accueil, vitrine, visites, favoris, contact, édition, photos | 00 à 02 |
| 04 | [04-matching.md](04-matching.md) | Matching IA, prédictions, droits selon la formule | 00 à 03 |
| 05 | [05-paiements-grand-livre.md](05-paiements-grand-livre.md) | Agrégateur mobile money, webhooks, grand livre, rapprochement | 00 à 02 |
| 06 | [06-reservation.md](06-reservation.md) | Réservation, brief, paiement, séquestre | 00 à 05 |
| 07 | [07-campagnes.md](07-campagnes.md) | Machine à états, preuve, litiges, messages, avis, tâches planifiées | 00 à 06 |
| 08 | [08-espaces.md](08-espaces.md) | « Mon espace » annonceur et influenceur | 00 à 07 |
| 09 | [09-portefeuille-facturation.md](09-portefeuille-facturation.md) | Retraits, formules (abonnements), options payantes | 00 à 08 |
| 10 | [10-administration.md](10-administration.md) | Back-office, vérification, arbitrage, finance, audit | 00 à 09 |
| 11 | [11-seed-qualite-deploiement.md](11-seed-qualite-deploiement.md) | Données de démo, tests, observabilité, production, adaptations du front | tout |

Les modules 03-04 et 05 sont indépendants : ils peuvent être confiés en parallèle à deux personnes.
