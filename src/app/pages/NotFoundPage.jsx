import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <div className="wrap section empty">
      <h1>Page introuvable</h1>
      <p>Cette adresse ne correspond à aucune page.</p>
      <Link className="btn" to="/">Retour à l'accueil</Link>
    </div>
  );
}
