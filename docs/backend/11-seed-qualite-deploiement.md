# Module 11 : données de démonstration, qualité et mise en production

> Prérequis : modules 00 à 10. À faire en dernier.

## 1. Seed de démonstration (`prisma db seed`)

Recréer l'état de démo du front. Les données sources sont dans `front/src/services/demo/seed.js` : tableau `ROWS` et fonction `createSeed`.

**16 influenceurs**, vérifiés et actifs. Pour chacun : handle, ville, catégories, bio, réseaux (`[abonnés, engagement]`), audience, scores (`auth`, `creat`, `brief`, `onTime`), note, nombre d'avis, campagnes réalisées, tarifs et jours.

| id | handle | nom |
|---|---|---|
| i1 | amakouassi | Ama Kouassi |
| i2 | legbakacomedy | Le Gbaka Comedy |
| i3 | yaotech | Yao Tech |
| i4 | fatoubamba.fit | Fatou Bamba |
| i5 | kaderfood | Kader Food |
| i6 | mariamstyle | Mariam Sangaré |
| i7 | juniorballon | Junior Ballon |
| i8 | awainfos225 | Awa Infos |
| i9 | djkassi | DJ Kassi |
| i10 | nadia.business | Nadia Business |
| i11 | bouakevibes | Bouaké Vibes |
| i12 | koffigaming | Koffi Gaming |
| i13 | reine.makeup | Reine Kacou |
| i14 | ismael.voyage | Ismaël Voyage |
| i15 | grace.conseils | Grâce Conseils |
| i16 | tontonblagueur | Tonton Blagueur |

- Certifiés : i1, i3, i8, i10.
- `accepts.dedicace` vaut `true` si l'un des tarifs contient « Dédicace ».
- `hue = (numéro × 47) mod 360`.
- Visites des 30 derniers jours générées autour de la valeur de base du tableau. `qr = base × 2,4`, `contacts = base × 0,31`.
- E-mail : `<handle>@mail.ci`.

**3 annonceurs**
- Savane Cosmetics : contact Aïcha Diomandé, `marketing@savane.ci`, formule `pro`, secteur Cosmétique, solde 35 000.
- Maquis Le Palmier : contact Serge Koné, `contact@lepalmier.ci`, formule `free`, secteur Restauration.
- Kalo Fintech : contact Ines Yapo, `growth@kalo.ci`, formule `business`, secteur Fintech.

**Admin** : `admin@pullup.net`.

**Campagnes**

| Réf. | Annonceur × influenceur | Statut | Contenu |
|---|---|---|---|
| PU-2410-137 | Savane × Ama Kouassi | `paid` | offre « Post + carrousel » à 90 000 ; un message |
| PU-2409-131 | Savane × Yao Tech | `published` | preuve, performances et 2 messages |
| PU-2409-118 | Savane × Le Gbaka Comedy | `completed` | avis 5/5 |
| PU-2410-139 | Maquis Le Palmier × Ama Kouassi | `accepted` | – |
| PU-2409-125 | Kalo Fintech × Nadia Business | `dispute` | motif « Le live a duré 25 minutes au lieu des 30 prévues. » |

Écritures du grand livre cohérentes avec ces statuts : séquestre pour les campagnes en cours, libération pour la campagne terminée.

**Autres données**
- Portefeuille d'Ama Kouassi : 142 500 disponibles, avec 3 mouvements :
  - +76 500 « Campagne PU-2409-118 libérée » ;
  - −50 000 « Retrait Orange Money » ;
  - +116 000 « Campagne PU-2409-131 libérée ».
- Sélection de Savane : Yao Tech, Kader Food, Reine Kacou.
- Une demande de partenariat de « Boutique Nana Wax » pour Ama.
- Deux avis importés pour Ama : Boutique Nana Wax 5/5 et Glow Hair Abidjan 4/5.
- Trois notifications : Ama, Savane et admin.
- Options `v2` et `v3` activées. Séquence des références à 140.
- Mot de passe commun lu dans `DEMO_PASSWORD`, jamais écrit en dur.
- Commande `npm run seed:reset`, refusée si `NODE_ENV=production`.

## 2. Qualité

- **Tests unitaires** du domaine, avec **les mêmes valeurs attendues que le front** (`front/src/domain/*.test.js`) : Score PULLUP, badge, engagement, matching, commission, UTM et formatage des montants.
- **Tests d'intégration** : authentification, machine à états, libération et remboursement, retraits, webhooks (idempotence, signature), droits d'accès sur chaque route (matrice rôles × routes générée).
- **Test de contrat** : un script lance le front (`front`, `npm run test`) contre l'API locale avec `VITE_API_URL`, et rejoue le test qui ouvre chaque page (`front/src/app/pages.test.jsx`).
- Couverture visée : 90 % sur le domaine et la finance, 70 % au global.
- Lint (ESLint et Prettier), TypeScript strict, aucune dépendance vulnérable critique (`npm audit` en CI).

## 3. Observabilité

- Logs JSON (pino) avec identifiant de requête, utilisateur et durée ; téléphones et e-mails masqués.
- Sentry (erreurs et performances). Métriques Prometheus : latence par route, paiements par statut, file BullMQ.
- Alertes : webhook en échec, écart de rapprochement, file bloquée, taux d'erreurs 5xx supérieur à 1 %.

## 4. Mise en production

- `Dockerfile` multi-étapes (image distroless ou alpine), utilisateur non root.
- Migrations Prisma appliquées au déploiement (`prisma migrate deploy`), jamais `db push` en production.
- Hébergement proche de l'Afrique de l'Ouest (Europe ou Afrique), PostgreSQL managé avec sauvegardes quotidiennes et restauration testée chaque mois, Redis managé.
- Domaine `api.pullup.ci` en HTTPS, même domaine parent que le front pour les cookies.
- Variables : `DEMO_MODE=false`, `NODE_ENV=production`, secrets dans le gestionnaire de l'hébergeur.
- CI/CD : lint → tests → build → migration → déploiement → test de santé → retour arrière automatique en cas d'échec.

## 5. Documentation à livrer

- `README` :
  - installation, variables d'environnement ;
  - `docker compose up`, `npm run seed`, comptes de démo ;
  - branchement du front avec `VITE_API_URL=http://localhost:3000/api`.
- OpenAPI sur `/api/docs`, exemples de réponses issus du seed.
- Schéma de la base (diagramme généré depuis Prisma) et description du grand livre.

## 6. Adaptations du front à faire en parallèle

- `src/lib/http.js` : ajouter `withCredentials: true`.
- Formulaires d'inscription annonceur et influenceur : ajouter le champ mot de passe ; ajouter les pages « mot de passe oublié » et « réinitialisation ».
- Ajouter le statut `awaiting_payment` à `STATUS` (`src/domain/catalog.js`), avec un écran « Confirmez le paiement sur votre téléphone » qui interroge `GET /campaigns/:id/payment`.
- Pièce jointe du brief : envoi via `POST /uploads/brief` (URL présignée).
- Matching : afficher les résultats `masked` renvoyés par le serveur.
- `completeOnboarding()` → `PUT /me/preferences`.
- Options : envoyer `{ key, pay, phone }` à `/billing/boosts` ; formules : gérer `awaiting_payment` et `redirectUrl`.
- Photo par l'admin : case « J'ai l'accord écrit de l'influenceur » (`consent: true`).
