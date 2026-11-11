import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/Button/Button.jsx';
import { Input } from '@/components/ui/Input/Input.jsx';
import { useForgotPassword } from '../hooks/useSession.js';
import { forgotSchema } from '../schemas/auth.schema.js';

export function ForgotPasswordPage() {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(forgotSchema),
    defaultValues: { email: '' },
  });
  const forgot = useForgotPassword();

  return (
    <div className="wrap" style={{ maxWidth: 460, padding: '40px 20px 60px' }}>
      <h1 style={{ fontSize: '2rem' }}>Mot de passe oublié</h1>
      <p className="muted">Indiquez l'e-mail de votre compte. Si un compte existe, un lien de réinitialisation sera envoyé.</p>
      <div className="panel">
        <form noValidate onSubmit={handleSubmit((values) => forgot.mutate(values.email))}>
          <Input label="E-mail" type="email" autoComplete="email" error={errors.email?.message} {...register('email')} />
          <Button type="submit" block loading={forgot.isPending}>Envoyer le lien</Button>
        </form>
      </div>
      <p className="small" style={{ marginTop: 16 }}><Link to="/connexion">Retour à la connexion</Link></p>
    </div>
  );
}
