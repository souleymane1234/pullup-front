import { Link } from 'react-router-dom';
import logo from '@/assets/logo.png';

export function Footer() {
  return (
    <footer className="foot">
      <div className="wrap row between">
        <div className="row">
          <img src={logo} alt="" width={28} height={28} style={{ borderRadius: 8 }} />
          <span>© {new Date().getFullYear()} PULLUP · Abidjan, Côte d'Ivoire</span>
        </div>
        <nav className="row" aria-label="Liens utiles">
          <Link to="/faq">FAQ</Link>
          <Link to="/legal/cgu">Conditions d'utilisation</Link>
          <Link to="/legal/confidentialite">Confidentialité</Link>
          <Link to="/rejoindre">Programme influenceurs</Link>
        </nav>
      </div>
    </footer>
  );
}
