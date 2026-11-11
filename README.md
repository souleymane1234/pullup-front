# PULLUP — frontend

Vite, React 18, organisation par domaine métier.

```bash
npm install
npm run dev          # http://localhost:6010
npm test
npm run lint
npm run storybook    # documentation du design system
npm run build        # vérifie aussi le budget du chemin critique (< 200 kB gzip)
```

L’accueil `/` reste la démo actuelle. Les pages React (connexion, influenceurs, campagnes, matching, réservation, portefeuille, messages, admin) sont chargées à la demande.

Copier `.env.example` vers `.env` pour pointer `VITE_API_URL` vers l’API (`http://localhost:6000/api` en local). Sans cette variable, les pages utilisent des données de démonstration. Aucun secret ne va dans le frontend : uniquement des variables `VITE_` publiques.

La session voyage dans le cookie HttpOnly `pullup.sid`. Relancer `npm run dev` après tout changement de `.env`.
