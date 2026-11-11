import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/Button/Button.jsx';
import { Chip } from '@/components/ui/Chip/Chip.jsx';
import { Input } from '@/components/ui/Input/Input.jsx';
import { MAX_BRIEF_WORDS } from '@/domain/catalog.js';
import { usePublicCatalog } from '@/features/platform/index.js';
import { wordCount } from '@/domain/metrics.js';
import { toast } from '@/lib/toast.js';
import { isRemote, request } from '@/services/remote.js';
import { MAX_FILE_SIZE, briefSchema } from '../schemas/booking.schema.js';

/** @param {{ draft: any, influencer: any, onBack: (values: any) => void, onNext: (values: any) => void }} props */
export function BriefStep({ draft, influencer, onBack, onNext }) {
  const { objectives } = usePublicCatalog();
  const { register, control, handleSubmit, watch, getValues, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(briefSchema),
    defaultValues: { title: draft.title, objective: draft.objective, text: draft.text, link: draft.link, date: draft.date, file: draft.file },
  });
  const words = wordCount(watch('text'));
  const file = watch('file');
  const fileLabel = file?.startsWith('http') ? decodeURIComponent(file.split('/').pop() || file) : file;

  const onFile = async (event) => {
    const picked = event.target.files?.[0];
    if (!picked) return;
    if (picked.size > MAX_FILE_SIZE) {
      toast('Fichier trop lourd : 9 Mo maximum.');
      event.target.value = '';
      return;
    }
    if (isRemote()) {
      try {
        const { uploadUrl, fileUrl } = await request('post', '/uploads/brief', {
          filename: picked.name,
          mime: picked.type || 'application/octet-stream',
          size: picked.size,
        });
        if (uploadUrl && uploadUrl !== fileUrl) {
          await fetch(uploadUrl, { method: 'PUT', body: picked, headers: { 'Content-Type': picked.type || 'application/octet-stream' } });
        }
        setValue('file', fileUrl);
        toast(`Fichier joint : ${picked.name}`);
      } catch (error) {
        toast(error instanceof Error ? error.message : 'Envoi du fichier impossible.');
        event.target.value = '';
      }
      return;
    }
    setValue('file', picked.name);
    toast(`Fichier joint : ${picked.name}`);
  };

  return (
    <form noValidate onSubmit={handleSubmit(onNext)}>
      <h2 className="h3">Rédigez le brief</h2>
      <Input label="Nom de la campagne" placeholder="Ex. Lancement du sérum Karité Glow" error={errors.title?.message} {...register('title')} />
      <fieldset className="field" style={{ border: 0, padding: 0 }}>
        <legend className="f">Objectif</legend>
        <Controller
          control={control}
          name="objective"
          render={({ field }) => (
            <div className="choice">
              {Object.entries(objectives).map(([key, label]) => (
                <Chip key={key} selected={field.value === key} onClick={() => field.onChange(key)}>{label}</Chip>
              ))}
            </div>
          )}
        />
      </fieldset>
      <Input
        as="textarea"
        label="Message et consignes"
        placeholder="Ce que l'influenceur doit dire ou montrer, mentions, hashtags, code promo…"
        hint={<span style={{ color: words > MAX_BRIEF_WORDS ? 'var(--danger)' : undefined }}>{words} / {MAX_BRIEF_WORDS} mots</span>}
        error={errors.text?.message}
        {...register('text')}
      />
      <div className="grid2">
        <Input label="Lien de destination" type="url" placeholder="https://votre-site.ci/offre" hint="Un lien UTM de suivi sera généré." error={errors.link?.message} {...register('link')} />
        <Input
          label="Date de publication souhaitée"
          type="date"
          min={new Date().toISOString().slice(0, 10)}
          hint={`${influencer.name} publie le ${influencer.days.join(', ')}.`}
          {...register('date')}
        />
      </div>
      <Input
        label="Visuel ou vidéo (facultatif)"
        type="file"
        accept="image/*,video/*,application/pdf"
        hint={`${fileLabel ? `${fileLabel} · ` : ''}jpg, png, gif, mp4, mov, pdf · 9 Mo max.`}
        onChange={onFile}
      />
      <div className="row between" style={{ marginTop: 8 }}>
        <Button variant="ghost" onClick={() => onBack(getValues())}>Retour</Button>
        <Button type="submit">Continuer vers le paiement</Button>
      </div>
    </form>
  );
}
