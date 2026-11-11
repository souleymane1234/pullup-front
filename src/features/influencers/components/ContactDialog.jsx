import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/Button/Button.jsx';
import { Chip } from '@/components/ui/Chip/Chip.jsx';
import { Input } from '@/components/ui/Input/Input.jsx';
import { Modal } from '@/components/ui/Modal/Modal.jsx';
import { usePublicCatalog } from '@/features/platform/index.js';
import { useContactRequest } from '../hooks/useInfluencers.js';
import { CONTACT_TYPES, contactSchema } from '../schemas/contact.schema.js';

/**
 * Demande de devis ou de partenariat envoyée dans l'espace de l'influenceur.
 * @param {{ open: boolean, onClose: () => void, influencer: { id: string, name: string }, defaultFrom?: string, v2: boolean }} props
 */
export function ContactDialog({ open, onClose, influencer, defaultFrom = '', v2 }) {
  const { contactTypes } = usePublicCatalog();
  const types = contactTypes.length ? contactTypes : CONTACT_TYPES;
  const { register, control, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(contactSchema),
    defaultValues: { type: v2 ? 'Partenariat' : 'Publicité', from: defaultFrom, contact: '', msg: '' },
  });
  const { mutate, isPending } = useContactRequest(() => {
    reset();
    onClose();
  });

  return (
    <Modal open={open} onClose={onClose} title={`Contacter ${influencer.name}`}>
      <p className="small muted">Votre demande arrive dans l'espace de l'influenceur, qui vous répond directement.</p>
      <form noValidate onSubmit={handleSubmit((values) => mutate({ ...values, infId: influencer.id }))}>
        <fieldset className="field" style={{ border: 0, padding: 0 }}>
          <legend className="f">Type de demande</legend>
          <Controller
            control={control}
            name="type"
            render={({ field }) => (
              <div className="choice">
                {types.map((type) => (
                  <Chip key={type} selected={field.value === type} onClick={() => field.onChange(type)}>{type}</Chip>
                ))}
              </div>
            )}
          />
        </fieldset>
        <Input label="Votre nom ou entreprise" autoComplete="organization" error={errors.from?.message} {...register('from')} />
        <Input label="Téléphone ou e-mail" error={errors.contact?.message} {...register('contact')} />
        <Input as="textarea" label="Message" placeholder="Présentez votre projet, vos dates et votre budget." error={errors.msg?.message} {...register('msg')} />
        <Modal.Footer>
          <Button variant="ghost" onClick={onClose}>Annuler</Button>
          <Button type="submit" loading={isPending}>Envoyer la demande</Button>
        </Modal.Footer>
      </form>
    </Modal>
  );
}
