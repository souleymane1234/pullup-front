import { useForm } from 'react-hook-form';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/Button/Button.jsx';
import { Input } from '@/components/ui/Input/Input.jsx';
import { useResetPassword } from '../hooks/useSession.js';
import { resetSchema } from '../schemas/auth.schema.js';

export function ResetPasswordPage() {
  const [params] = useSearchParams();
  const token = params.get('token') || '';
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(resetSchema),
    defaultValues: { password: '' },
  });
  const reset = useResetPassword(() => navigate('/connexion', { replace: true }));

  if (!token) {
    return (
      <div className="wrap section empty">
        <h1 className="h4">Lien invalide</h1>
        <p>Demandez un nouveau lien de réinitialisation.</p>
        <Link className="btn" to="/mot-de-passe-oublie">Mot de passe oublié</Link>
      </div>
    );
  }

  return (
    <div className="wrap" style={{ maxWidth: 460, padding: '40px 20px 60px' }}>
      <h1 style={{ fontSize: '2rem' }}>Nouveau mot de passe</h1>
      <p className="muted">Choisissez un mot de passe d'au moins 8 caractères.</p>
      <div className="panel">
        <form noValidate onSubmit={handleSubmit((values) => reset.mutate({ token, password: values.password }))}>
          <Input
            label="Nouveau mot de passe"
            type="password"
            autoComplete="new-password"
            error={errors.password?.message}
            {...register('password')}
          />
          <Button type="submit" block loading={reset.isPending}>Enregistrer</Button>
        </form>
      </div>
    </div>
  );
}
