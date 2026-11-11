import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/Button/Button.jsx';
import { Input } from '@/components/ui/Input/Input.jsx';
import { useLogin } from '../hooks/useSession.js';
import { loginSchema } from '../schemas/auth.schema.js';

/** @param {{ onLoggedIn: (session: any) => void }} props */
export function LoginForm({ onLoggedIn }) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });
  const { mutate, isPending } = useLogin(onLoggedIn);

  return (
    <form noValidate onSubmit={handleSubmit((values) => mutate(values))}>
      <Input label="E-mail" type="email" autoComplete="email" error={errors.email?.message} {...register('email')} />
      <Input
        label="Mot de passe"
        type="password"
        autoComplete="current-password"
        error={errors.password?.message}
        {...register('password')}
      />
      <p className="small" style={{ margin: '-6px 0 12px', textAlign: 'right' }}>
        <Link to="/mot-de-passe-oublie">Mot de passe oublié ?</Link>
      </p>
      <Button type="submit" block loading={isPending}>Se connecter</Button>
    </form>
  );
}
