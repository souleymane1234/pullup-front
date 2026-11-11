# Module 03 : influenceurs (annuaire, vitrines, favoris, demandes de contact)

> Prérequis : modules 00, 01 et 02.

## Objectif

Annuaire public paginé avec filtres et tris, chiffres et carrousel de l'accueil, vitrine publique, statistiques de visites, sélection (favoris) des annonceurs, demandes de contact, édition de la vitrine et gestion des photos.

## Tables

```text
influencers           (complète celle du module 01)
                      id, user_id unique, handle unique ^[a-z0-9._]+$, name, phone, city, bio, hue SMALLINT,
                      photo_url NULL, verified BOOL, certified BOOL, status ENUM(pending|active|rejected|suspended),
                      accepts_pub, accepts_partenariat, accepts_dedicace BOOL,
                      auth_score SMALLINT 0-100, creat_score NUMERIC(2,1) 0-5, brief_score SMALLINT 0-100,
                      on_time SMALLINT 0-100, rating NUMERIC(2,1), reviews_count INT, done_count INT,
                      qr_scans INT, contacts_count INT, days TEXT[],
                      -- colonnes dérivées (mises à jour à chaque modification réseaux/scores) :
                      total_followers INT, avg_engagement NUMERIC(4,2), min_price INT, badge_key TEXT, pullup_score NUMERIC(2,1),
                      search_vector TSVECTOR, created_at, updated_at
influencer_categories influencer_id, category_key                 PK composite, 3 maximum
influencer_networks   influencer_id, net ENUM(ig|tt|fb|sc), followers INT, engagement NUMERIC(4,1), url NULL
                      PK (influencer_id, net), 3 maximum
audiences             influencer_id PK, female_pct SMALLINT, ages SMALLINT[4]
audience_cities       influencer_id, city, pct SMALLINT, position
rates                 id, influencer_id, net, format, price_fcfa INT ≥ 5000, position, archived_at NULL
profile_views_daily   influencer_id, day DATE, views INT          PK (influencer_id, day)
favorites             brand_id, influencer_id, created_at          PK composite
contact_requests      id, influencer_id, from_name, contact, message, type ENUM(Publicité|Partenariat|Dédicace),
                      sender_user_id NULL, ip, created_at
reviews               id, campaign_id NULL UNIQUE, influencer_id, brand_name, stars 1-5, text, created_at
```

Index : `influencers(status, verified)`, `influencer_categories(category_key)`, `influencer_networks(net)`, `influencers(pullup_score)`, GIN sur `search_vector` (configuration `french` + `unaccent`) et `pg_trgm` sur `name` et `handle`.

## Objet `Influencer` (format exact)

```json
{
  "id": "i1", "handle": "amakouassi", "name": "Ama Kouassi", "city": "Abidjan · Cocody",
  "cats": ["beaute", "societe"], "bio": "…",
  "net": { "ig": [412000, 5.8], "tt": [268000, 7.4] },
  "aud": { "f": 74, "ages": [9, 47, 33, 11], "cities": [["Abidjan", 64], ["Bouaké", 8], ["Autres", 28]] },
  "auth": 94, "creat": 4.6, "brief": 96, "onTime": 98,
  "rating": 4.8, "reviews": 61, "done": 47,
  "rates": [{ "id": "r1", "net": "ig", "fmt": "Story (24 h)", "price": 35000 }],
  "days": ["Lun", "Jeu", "Sam"],
  "verified": true, "certified": true, "status": "active",
  "accepts": { "pub": true, "partenariat": true, "dedicace": true },
  "views": [30 entiers, visites des 30 derniers jours, le dernier étant aujourd'hui],
  "qr": 820, "contacts": 106, "hue": 47, "photo": "https://cdn…/i1.webp",
  "favorite": false
}
```

- `net[k]` vaut `[abonnés, engagement en %]`.
- `rates` exclut les tarifs archivés.
- `favorite` est calculé pour l'annonceur connecté, `false` sinon.
- **`email` et `phone` ne sont jamais exposés** hors de l'espace de l'influenceur lui-même (module 08) et de l'admin (module 10).

## Calculs dérivés (identiques au front, dans `domain/metrics.ts`)

```text
total_followers = Σ net[k].followers
avg_engagement  = Σ (engagement × followers) / total_followers      (0 si aucun abonné)
min_price(net?) = min(price des tarifs actifs, filtrés par réseau si demandé ; 'any' = tous)
badge           = macro  si total ≥ 600 000 et engagement ≥ 4  → { k:'macro',  l:'Macro influenceur',     tone:'ok' }
                  montee si total ≥ 200 000                     → { k:'montee', l:'Influenceur en montée', tone:'warn' }
                  sinon                                          → { k:'normal', l:'Influenceur',           tone:'orange' }
pullup_score    = round1( ( clamp(avg_engagement/7)×0,30 + auth/100×0,25 + creat/5×0,15
                            + brief/100×0,15 + onTime/100×0,15 ) × 5 )
listé           = verified && status = 'active'
```

## Routes

| Méthode | Route | Droits | Entrée | Réponse |
|---|---|---|---|---|
| GET | `/influencers` | public | `cursor=0, limit=12, s, cat, net, badge, budget, sort` | `{ items: Influencer[], nextCursor: number\|null, total }` |
| GET | `/influencers/directory` | public | – | `{ followers, verified, perNetwork: { ig, tt, fb, sc }, featured: Influencer\|null }` |
| GET | `/influencers/carousel` | public | `filter` | `Influencer[]` |
| GET | `/influencers/:handle` | public | – | `{ influencer, own, reviews, recent }` ou `null` |
| POST | `/influencers/:id/visits` | public | – | `null` |
| POST | `/influencers/:id/favorite` | annonceur | – | `{ favorite, message }` |
| POST | `/influencers/:id/requests` | public | `{ infId, from, contact, msg, type }` | `{ message: "Demande envoyée." }` |
| PUT | `/influencers/:id/vitrine` | influenceur (lui-même) | `{ bio, cats, days, rates }` | `{ message: "Vitrine enregistrée." }` |
| PUT | `/influencers/:id/photo` | influenceur (lui-même) ou admin | `{ photo: dataURL\|null }` | `{ message }` |

## Règles détaillées

**Annuaire `GET /influencers`**
- Uniquement les profils listés.
- `s` : recherche insensible à la casse et aux accents sur nom, handle, ville, libellés de catégories et bio.
- `cat` : possède la catégorie. `net` : possède le réseau. `badge` : `macro`, `montee` ou `normal`.
- `budget` : `min_price(net) ≤ budget`.
- `sort` :
  - `score` (défaut) : Score PULLUP décroissant ;
  - `plus` / `moins` : abonnés cumulés décroissants / croissants ;
  - `prix` : prix minimum croissant ;
  - `eng` : engagement moyen décroissant.
- `cursor` est un **décalage numérique** (le front envoie `0`, `12`, `24`…). `nextCursor = cursor + limit` s'il reste des résultats, sinon `null`. `limit` est plafonné à 48.
- Réponse mise en cache 60 s par combinaison de paramètres, sauf le champ `favorite`, calculé à part.

**Annuaire `GET /influencers/directory`**
- `followers` : somme des abonnés des profils listés.
- `verified` : nombre de profils listés.
- `perNetwork` : nombre de profils par réseau.
- `featured` : profil mis en avant, choisi par l'admin (option `pro` du module 09), sinon le meilleur score.

**Carrousel `GET /influencers/carousel?filter=`**
- `reco` : 12 profils triés par poids :
  `score + log10(abonnés) × 0,35 + 0,6 si une catégorie correspond à un thème déjà utilisé par l'annonceur connecté + 0,4 si favori − 0,3 si déjà engagé par cet annonceur`.
- `montee` : profils de niveau « montée », triés par engagement décroissant.
- Une clé de catégorie : profils de cette catégorie, triés par score.

**Vitrine `GET /influencers/:handle`**
- `null` (HTTP 200) si le profil n'existe pas ou n'est pas listé, **sauf** pour le propriétaire (`own: true`) et l'admin.
- `reviews` : avis importés et avis de campagnes, triés par date décroissante, au format `[{ brand, stars, text, at }]`.
- `recent` : campagnes terminées, au format `[{ id, brand, fmt, net, createdAt, perf }]`.

**Visites `POST /influencers/:id/visits`**
- Incrémente `profile_views_daily` du jour.
- Ignoré si l'influenceur visite sa propre vitrine.
- Dédoublonné par IP et user-agent haché, par jour (Redis).
- `views` dans l'objet = 30 derniers jours, complétés par des 0.

**Favoris `POST /influencers/:id/favorite`**
- Bascule l'état.
- Messages : `« Ajouté à votre sélection. »` / `« Retiré de votre sélection. »`.
- Si l'utilisateur n'est pas annonceur : 403 `« Connectez-vous en tant qu'annonceur pour créer votre sélection. »`.

**Demandes de contact `POST /influencers/:id/requests`**
- `from` et `contact` requis, `msg` de 10 à 1 000 caractères, `type` parmi `CONTACT_TYPES`.
- Profil inexistant : 404 `« Profil introuvable. »`.
- Incrémente `contacts_count`.
- Notifie l'influenceur : `« Nouvelle demande de <type en minuscules> de <from>. »`, lien `/espace?tab=demandes`.
- Anti-spam : 5 demandes par heure et par IP ; captcha invisible (Cloudflare Turnstile) pour les visiteurs.

**Vitrine `PUT /influencers/:id/vitrine`**
- Seul le propriétaire, sinon 403.
- Erreurs :
  - `cats` vide : 422 `« Choisissez au moins une catégorie. »` (3 catégories gardées au maximum) ;
  - `rates` vide : 422 `« Gardez au moins un tarif. »` ;
  - un tarif sans format ou sous 5 000 : 422 `« Chaque tarif doit avoir un format et coûter au moins 5 000 FCFA. »`.
- Bio vide : l'ancienne est conservée.
- Prix arrondis à l'entier.
- Les tarifs absents de la liste sont **archivés**, jamais supprimés (les campagnes gardent une copie figée de l'offre).
- Recalcul des colonnes dérivées.

**Photo `PUT /influencers/:id/photo`**
- Data URL JPEG, PNG ou WebP, 2 Mo maximum une fois décodée ; vérification du type réel (magic bytes).
- Recadrage carré à 800 px, conversion en WebP (sharp), envoi sur S3 avec un nom aléatoire.
- `photo_url` reçoit l'URL publique ; l'ancien fichier est supprimé.
- `null` retire la photo.
- Messages : `« Photo mise à jour. »` / `« Photo retirée. »`.
- Si c'est l'admin : trace dans `audit_logs`. L'accord écrit de l'influenceur (droit à l'image) est obligatoire ; ajouter un champ `consent: true` exigé pour l'admin.

## Tests attendus

- Score PULLUP, badge et engagement moyen : mêmes valeurs que le front sur les profils du seed (ex. Ama Kouassi).
- Pagination : 12 + 12 + reste, puis `nextCursor=null`.
- Filtres combinés, recherche accentuée (« beaute » trouve « Mode & beauté »).
- Une vitrine non listée renvoie `null` à un visiteur et le profil à son propriétaire.
- Validation de vitrine et archivage des tarifs ; rejet d'une photo trop lourde ou d'un faux PNG.

## Critères de fin

L'accueil, l'annuaire, la vitrine, le bouton favori, la demande de contact, l'éditeur de vitrine et l'ajout de photo fonctionnent avec l'API.
