# Module 02 : plateforme, options de version et notifications

> Prérequis : modules 00 et 01.

## Objectif

Exposer les options de version (feature flags) qui pilotent le site, l'état d'accueil (onboarding) de l'utilisateur et le centre de notifications utilisé par tous les autres modules.

## Tables

```text
feature_flags     key (PK : 'v2' | 'v3'), value BOOL, updated_by → users NULL, updated_at
user_preferences  user_id (PK) → users, onboarded BOOL DEFAULT false
notifications     id, recipient_key (id de profil brand/influencer, ou 'admin'), text, link, read_at NULL, created_at
                  INDEX (recipient_key, created_at DESC)
```

Signification des options :
- **v2** : réservation en ligne et paiement sous séquestre. Désactivée, les vitrines repassent en simple demande de devis.
- **v3** : matching IA.

## Objet `Notification`

```json
{ "to": "b1", "t": "Yao Tech a publié votre campagne. Validez-la pour libérer les fonds.", "at": "…", "r": false, "link": "/c/c2" }
```

`r` vaut `true` si `read_at` est renseigné.

## Routes

| Méthode | Route | Droits | Entrée | Réponse |
|---|---|---|---|---|
| GET | `/platform` | public | – | `{ flags: { v2, v3 }, onboarded }` (`onboarded=false` pour un visiteur) |
| PUT | `/me/preferences` | connecté | `{ onboarded: true }` | `null` |
| PUT | `/admin/flags/:key` | admin | `{ value: boolean }` | `{ message }` |
| GET | `/notifications` | connecté | – | `Notification[]`, des plus récentes aux plus anciennes, 50 maximum |
| POST | `/notifications/read` | connecté | – | `null` (marque toutes les notifications du destinataire comme lues) |

## Règles

- `PUT /admin/flags/:key` :
  - `key` hors de `v2` et `v3` : 404.
  - Messages :
    - `v2` désactivée : `« V2 désactivée : les vitrines repassent en mode demande de devis. »` ;
    - sinon : `« <V2|V3> <activée|désactivée> sur toute la plateforme. »`.
  - Trace dans `audit_logs`.
  - Les autres modules lisent les options via un service mis en cache (Redis, 30 s) et refusent les routes concernées si l'option est coupée : 403 `« Cette fonctionnalité n'est pas encore disponible. »`.
- **Destinataire** : `recipient_key` vaut l'identifiant de profil (brand ou influencer), ou `'admin'` pour l'équipe. Tous les admins voient les notifications `'admin'`.
- **Service `notify(to, text, link)`** :
  - insère en base ;
  - optionnellement, met en file un e-mail ou un SMS pour les événements importants (nouvelle campagne, fonds libérés, litige) ;
  - doit pouvoir s'exécuter dans la même transaction que l'action métier, ou juste après sa validation (pattern outbox).
- Purge des notifications lues de plus de 90 jours (tâche planifiée).
- Optionnel : flux temps réel en SSE (`GET /notifications/stream`). Sinon, le front interroge.

## Tests attendus

- Un visiteur reçoit les options et `onboarded=false`.
- Un annonceur ne voit que ses notifications ; un admin voit les notifications `'admin'`.
- `POST /notifications/read` passe toutes les notifications du destinataire à `r=true`.
- Un non-admin reçoit 403 sur `/admin/flags/v2`.

## Critères de fin

La cloche du front affiche le nombre de non lues et les marque comme lues. Le basculement de V2 ou V3 depuis l'admin change le comportement du site.
