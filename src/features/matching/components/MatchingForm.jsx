import { Controller, useForm } from 'react-hook-form';
import { Button } from '@/components/ui/Button/Button.jsx';
import { Chip } from '@/components/ui/Chip/Chip.jsx';
import { Icon } from '@/components/ui/Icon/Icon.jsx';
import { Input } from '@/components/ui/Input/Input.jsx';
import { AGES, NET } from '@/domain/catalog.js';
import { usePublicCatalog } from '@/features/platform/index.js';
import { formatFcfa } from '@/lib/format.js';

const BUDGETS = [25000, 50000, 100000, 150000, 250000, 500000];

/** @param {{ defaultValues: any, onSubmit: (brief: any) => void }} props */
export function MatchingForm({ defaultValues, onSubmit }) {
  const { cats, cities, objectives } = usePublicCatalog();
  const { register, control, handleSubmit } = useForm({ defaultValues });

  return (
    <form className="panel" onSubmit={handleSubmit(onSubmit)}>
      <h2 className="h3">Votre campagne</h2>
      <Input as="select" label="Thématique" {...register('theme')}>
        {Object.entries(cats).map(([key, cat]) => <option key={key} value={key}>{cat.l}</option>)}
      </Input>
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
      <div className="grid2">
        <Input as="select" label="Réseau" {...register('net')}>
          <option value="any">Peu importe</option>
          {Object.entries(NET).map(([key, net]) => <option key={key} value={key}>{net.l}</option>)}
        </Input>
        <Input as="select" label="Budget max." {...register('budget')}>
          {BUDGETS.map((value) => <option key={value} value={value}>{formatFcfa(value)}</option>)}
        </Input>
      </div>
      <div className="grid2">
        <Input as="select" label="Âge de la cible" {...register('age')}>
          <option value="">Tous âges</option>
          {AGES.map((age, k) => <option key={age} value={String(k)}>{age} ans</option>)}
        </Input>
        <Input as="select" label="Genre" {...register('gender')}>
          <option value="all">Mixte</option>
          <option value="f">Plutôt femmes</option>
          <option value="m">Plutôt hommes</option>
        </Input>
      </div>
      <Input as="select" label="Zone géographique" {...register('city')}>
        <option value="">Toute la Côte d'Ivoire</option>
        {cities.map((city) => <option key={city} value={city}>{city}</option>)}
      </Input>
      <Input
        as="textarea"
        label="Décrivez votre marque et votre offre"
        placeholder="Ex. Marque ivoirienne de cosmétiques naturels au karité, lancement d'un sérum pour peaux noires, cible jeunes actives d'Abidjan."
        hint="Utilisée par l'analyse IA approfondie."
        {...register('desc')}
      />
      <Button type="submit" block><Icon name="spark" size={18} /> Trouver les meilleurs profils</Button>
    </form>
  );
}
