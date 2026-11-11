import { useParams } from 'react-router-dom';

export function LegalPage() {
  const { doc } = useParams();
  const title = doc === 'confidentialite' ? 'Politique de confidentialité' : 'Conditions générales d\'utilisation';
  return (
    <div className="wrap" style={{ maxWidth: 820, padding: '40px 20px 60px' }}>
      <h1 style={{ fontSize: '2.2rem' }}>{title}</h1>
      <div className="panel">
        <p>Ce document est disponible dans son intégralité dans le dossier du projet PULLUP. Cette page affichera la version officielle une fois la plateforme connectée à son serveur.</p>
        <p className="muted small" style={{ margin: 0 }}>
          Points clés : paiements conservés en séquestre jusqu'à validation ; données personnelles traitées conformément à la loi ivoirienne n° 2013-450 relative à la protection des données à caractère personnel ; droit d'accès, de rectification et de suppression sur demande à l'équipe PULLUP.
        </p>
      </div>
    </div>
  );
}
