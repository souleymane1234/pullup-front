import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/Button/Button.jsx';
import { Input } from '@/components/ui/Input/Input.jsx';
import { StarRating } from '@/components/ui/StarRating/StarRating.jsx';
import { useSubmitReview } from '../hooks/useCampaigns.js';
import { reviewSchema } from '../schemas/campaign.schema.js';

/** @param {{ campaignId: string, influencerName: string }} props */
export function ReviewForm({ campaignId, influencerName }) {
  const { control, register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(reviewSchema),
    defaultValues: { stars: 5, text: '' },
  });
  const { mutate, isPending } = useSubmitReview(campaignId);

  return (
    <form className="panel" noValidate onSubmit={handleSubmit((values) => mutate(values))}>
      <h2 className="h4">Notez la collaboration avec {influencerName}</h2>
      <p className="small muted" style={{ marginTop: -4 }}>Votre avis apparaît sur sa vitrine et alimente son Score PULLUP.</p>
      <Controller
        control={control}
        name="stars"
        render={({ field }) => <StarRating value={field.value} onChange={field.onChange} label="Note" />}
      />
      <Input
        as="textarea"
        label="Votre avis"
        placeholder="Qualité du contenu, ponctualité, résultats…"
        style={{ minHeight: 80 }}
        error={errors.text?.message}
        fieldStyle={{ marginTop: 10 }}
        {...register('text')}
      />
      <Button type="submit" loading={isPending}>Publier mon avis</Button>
    </form>
  );
}
