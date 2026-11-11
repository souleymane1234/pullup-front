import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/Button/Button.jsx';
import { Input } from '@/components/ui/Input/Input.jsx';
import { Modal } from '@/components/ui/Modal/Modal.jsx';
import { useSignupBrand } from '../hooks/useSession.js';
import { signupBrandSchema } from '../schemas/auth.schema.js';

/** @param {{ open: boolean, onClose: () => void, onCreated: () => void }} props */
export function SignupBrandDialog({ open, onClose, onCreated }) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(signupBrandSchema),
    defaultValues: { company: '', contact: '', email: '', password: '' },
  });
  const { mutate, isPending } = useSignupBrand(onCreated);

  return (
    <Modal open={open} onClose={onClose} title="Créer un compte annonceur">
      <p className="small muted">Gratuit, sans carte bancaire. Formule Découverte incluse.</p>
      <form noValidate onSubmit={handleSubmit((values) => mutate(values))}>
        <Input label="Entreprise ou marque" error={errors.company?.message} {...register('company')} />
        <Input label="Votre nom" autoComplete="name" error={errors.contact?.message} {...register('contact')} />
        <Input label="E-mail professionnel" type="email" autoComplete="email" error={errors.email?.message} {...register('email')} />
        <Input label="Mot de passe" type="password" autoComplete="new-password" error={errors.password?.message} {...register('password')} />
        <Modal.Footer>
          <Button variant="ghost" onClick={onClose}>Annuler</Button>
          <Button type="submit" loading={isPending}>Créer mon compte</Button>
        </Modal.Footer>
      </form>
    </Modal>
  );
}
