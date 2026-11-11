import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/Button/Button.jsx';
import { Input } from '@/components/ui/Input/Input.jsx';
import { useUpdateBrandProfile } from '../hooks/useSpaces.js';
import { brandProfileSchema } from '../schemas/brand.schema.js';

/** @param {{ brand: { name: string, contact: string, sector: string, email?: string } }} props */
export function BrandProfile({ brand }) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(brandProfileSchema),
    defaultValues: { name: brand.name, contact: brand.contact, sector: brand.sector || '' },
  });
  const save = useUpdateBrandProfile();
  return (
    <form className="panel" noValidate onSubmit={handleSubmit((values) => save.mutate(values))} style={{ marginBottom: 18 }}>
      <h3 className="h4">Marque</h3>
      <Input label="Nom de la marque" error={errors.name?.message} {...register('name')} />
      {brand.email ? <Input label="E-mail" type="email" defaultValue={brand.email} readOnly /> : null}
      <div className="grid2">
        <Input label="Contact" error={errors.contact?.message} {...register('contact')} />
        <Input label="Secteur" error={errors.sector?.message} {...register('sector')} />
      </div>
      <div className="row" style={{ justifyContent: 'flex-end' }}>
        <Button type="submit" loading={save.isPending}>Enregistrer la marque</Button>
      </div>
    </form>
  );
}
