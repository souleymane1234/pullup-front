import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { LoginForm } from '../components/LoginForm.jsx';
import { SignupBrandDialog } from '../components/SignupBrandDialog.jsx';

/** Seuls les chemins internes sont acceptés comme destination après connexion. */
const safeNext = (value) => (value && value.startsWith('/') && !value.startsWith('//') ? value : null);

export function LoginPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [signupOpen, setSignupOpen] = useState(false);
  const next = safeNext(params.get('next'));

  const onLoggedIn = (session) => {
    navigate(next || (session?.role === 'admin' ? '/admin' : '/espace'), { replace: true });
  };

  return (
    <div className="wrap" style={{ maxWidth: 520, padding: '40px 20px 60px' }}>
      <h1 style={{ fontSize: '2.2rem' }}>Se connecter</h1>
      <p className="muted">Accédez à votre espace PULLUP.</p>
      <div className="panel">
        <LoginForm onLoggedIn={onLoggedIn} />
        <p className="small muted" style={{ margin: '14px 0 0', textAlign: 'center' }}>
          Nouvelle marque ?{' '}
          <button type="button" className="linklike" onClick={() => setSignupOpen(true)}>Créer un compte annonceur gratuit</button>
        </p>
      </div>
      <div className="panel" style={{ marginTop: 16, background: 'var(--wine)', color: '#fff', border: 0 }}>
        <p style={{ margin: '0 0 12px' }}>Vous êtes créateur de contenu ? Créez votre vitrine et gagnez de l'argent grâce à votre notoriété.</p>
        <Link className="btn light block" to="/rejoindre">Je suis influenceur</Link>
      </div>
      <SignupBrandDialog
        open={signupOpen}
        onClose={() => setSignupOpen(false)}
        onCreated={() => navigate('/espace', { replace: true })}
      />
    </div>
  );
}
