# Module 01 : authentification et comptes

> Prérequis : module 00. Coller `00-socle.md` avant ce prompt.

## Objectif

Gérer les trois rôles (`brand`, `influencer`, `admin`) : inscription, connexion, déconnexion, session courante, disponibilité d'un nom d'utilisateur et connexion de démonstration. Ce module crée aussi les comptes annonceur et influenceur. Le profil détaillé de l'influenceur (vitrine) est enrichi au module 03.

## Tables

```text
users            id, email (unique, citext), password_hash (argon2id), role ENUM(brand|influencer|admin),
                 email_verified_at NULL, last_login_at, created_at, updated_at, deleted_at NULL
sessions         id, user_id → users, expires_at, ip, user_agent, created_at      (ou stockage Redis)
password_resets  id, user_id, token_hash, expires_at, used_at
brands           id, user_id → users (unique), name, contact_name, sector, plan ENUM(free|pro|business) DEFAULT free,
                 plan_renews_at NULL, balance_fcfa INT ≥ 0 DEFAULT 0, created_at, updated_at
influencers      créée ici avec les colonnes minimales (id, user_id unique, handle unique, name, phone, city, bio,
                 hue, photo_url, verified, certified, status, accepts_*, scores) ; détail au module 03
```

## Objet `Session` renvoyé au front (`null` si non connecté)

```json
{
  "role": "brand|influencer|admin",
  "id": "id du profil brand / influencer, ou 'admin'",
  "name": "…", "email": "…",
  "contact": "(brand) nom du contact", "plan": "(brand) free|pro|business",
  "handle": "(influencer)",
  "avatar": { "name": "…", "hue": 20, "photo": null, "verified": false }
}
```

Pour l'annonceur, `avatar = { name, hue: 20 }`. Pour l'influenceur, `avatar = { name, hue, photo, verified }`. Pour l'admin, `{ name: 'Admin PULLUP', hue: 280 }`. **`id` est l'identifiant du profil** (brand ou influencer), pas celui de `users`.

## Routes

| Méthode | Route | Droits | Entrée | Réponse |
|---|---|---|---|---|
| GET | `/auth/session` | public | – | `Session` ou `null` (toujours 200) |
| POST | `/auth/login` | public | `{ email, password }` | `{ session, message: "Connecté : <nom>" }` |
| POST | `/auth/logout` | connecté | – | `{ message: "Déconnecté." }` |
| POST | `/auth/signup/brand` | public | `{ company, contact, email, password }` | `{ session, message: "Bienvenue sur PULLUP, <prénom du contact> !" }` |
| GET | `/auth/handle?handle=` | public | – | `{ available: boolean }` |
| POST | `/auth/signup/influencer` | public | voir plus bas | `{ session, message: "Vitrine créée ! Vérification sous 48 h." }` |
| POST | `/auth/demo` | public, **seulement si `DEMO_MODE=true`** (sinon 404) | `{ role, id }` | `{ session, message: "Connecté : <nom>" }` |
| POST | `/auth/password/forgot` | public | `{ email }` | `{ message: "Si un compte existe, un e-mail vient d'être envoyé." }` |
| POST | `/auth/password/reset` | public | `{ token, password }` | `{ message: "Mot de passe modifié." }` |
| GET | `/me/export` | connecté | – | export JSON des données personnelles |
| DELETE | `/me` | connecté | `{ password }` | `{ message: "Compte supprimé." }` (anonymisation, conservation comptable) |

## Règles

**Connexion**
- E-mail normalisé (trim, minuscules).
- E-mail inconnu ou mot de passe faux : 401 `« Identifiants incorrects. »`, avec un message unique pour ne pas révéler l'existence d'un compte.
- 5 tentatives maximum par 15 minutes, par IP et par e-mail (429 `« Trop de tentatives, réessayez dans quelques minutes. »`).
- Nouvel identifiant de session à chaque connexion. Mise à jour de `last_login_at`.

**Inscription annonceur**
- `company`, `contact` requis ; e-mail valide et unique (409 `« Un compte existe déjà avec cet e-mail. »`) ; mot de passe de 8 caractères minimum.
- Crée `users` (role `brand`) et `brands` (`plan=free`, `balance=0`, `sector=''`), puis ouvre la session.

**Disponibilité du nom d'utilisateur**
- Normalisation : minuscules, seuls `[a-z0-9._]` sont gardés.
- Disponible si aucun influenceur n'a ce handle.

**Inscription influenceur**
Entrée :

```json
{
  "name": "…", "handle": "…", "email": "…", "password": "…", "phone": "…", "city": "Abidjan|…|Autre",
  "bio": "…", "photo": "data URL ou null",
  "nets": { "ig": 12000, "tt": 0, "fb": "", "sc": "" },
  "cats": ["beaute"],
  "accepts": { "pub": true, "partenariat": true, "dedicace": false },
  "price": 15000
}
```

- Handle normalisé et unique : 409 `« Ce nom d'utilisateur est déjà pris. »`.
- 1 à 3 réseaux avec plus de 0 abonné ; 1 à 3 catégories valides.
- `price` < 5 000 : 422 `« Prix minimum 5 000 FCFA. »`.
- Valeurs créées :
  - `status=pending`, `verified=false`, `certified=false` ;
  - `bio` par défaut : « Nouveau sur PULLUP. Présentez votre univers depuis votre espace. » (la bio saisie sert de brouillon) ;
  - `hue` aléatoire entre 0 et 359 ;
  - réseaux avec engagement initial à 4 % ;
  - audience par défaut : `f=55`, âges `[10,45,32,13]`, villes `[[ville ou Abidjan si « Autre », 60], ["Autres", 40]]` ;
  - scores : `auth 90, creat 4, brief 90, onTime 90, rating 5, reviews 0, done 0` ;
  - jours `["Lun","Mer","Ven"]`.
- Tarifs créés sur le premier réseau renseigné :
  - « Story / post » au prix donné ;
  - si `dedicace` : « Dédicace vidéo » à 60 % du prix, arrondi à 500, minimum 5 000.
- Photo : déléguer au service photo du module 03.
- Notifier l'admin : `« Nouvelle inscription à vérifier : <nom>. »`, lien `/admin?tab=verif`.
- Ouvrir la session.

**Connexion de démonstration**
- Ne fonctionne que si `DEMO_MODE=true`.
- Connecte le compte du seed correspondant à `role` et `id`.

**Admin**
- Comptes admin créés uniquement par le seed ou une commande CLI (`npm run admin:create`), jamais par l'API publique.

**Garde d'accès réutilisable**
- `@Roles('brand'|'influencer'|'admin')` et un décorateur `@CurrentUser()` qui expose `{ userId, role, profileId }`.
- 401 `« Connectez-vous pour continuer. »` si pas de session.

## Tests attendus

- Connexion réussie et échouée (message unique), limitation de débit.
- Inscription annonceur et influenceur : doublons, prix minimum, tarif dédicace calculé (ex. 15 000 → 9 000 ; 6 000 → 5 000).
- `GET /auth/session` renvoie `null`, puis la bonne session après connexion.
- `/auth/demo` renvoie 404 quand `DEMO_MODE=false`.

## Critères de fin

Le front peut s'inscrire, se connecter, se déconnecter et afficher l'avatar de chaque rôle avec `VITE_API_URL` renseignée.
