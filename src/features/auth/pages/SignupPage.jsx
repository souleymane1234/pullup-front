import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import filming from '@/assets/filming.jpg';
import { Avatar } from '@/components/ui/Avatar/Avatar.jsx';
import { Button } from '@/components/ui/Button/Button.jsx';
import { Chip } from '@/components/ui/Chip/Chip.jsx';
import { Orbs } from '@/components/ui/Decor/Decor.jsx';
import { Input } from '@/components/ui/Input/Input.jsx';
import { Switch } from '@/components/ui/Switch/Switch.jsx';
import { NET } from '@/domain/catalog.js';
import { usePublicCatalog } from '@/features/platform/index.js';
import { cn } from '@/lib/cn.js';
import { cropSquare } from '@/lib/browser.js';
import { toast } from '@/lib/toast.js';
import { isHandleAvailable } from '../api/auth.api.js';
import { useSignupDraft } from '../hooks/signup.store.js';
import { useSignupInfluencer } from '../hooks/useSession.js';
import { audienceSchema, identitySchema, offerSchema } from '../schemas/auth.schema.js';

const toggleCat = (cats, key) => (cats.includes(key) ? cats.filter((c) => c !== key) : [...cats, key].slice(-3));

function IdentityStep() {
  const draft = useSignupDraft();
  const { cities } = usePublicCatalog();
  const { register, handleSubmit, watch, setError, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(identitySchema),
    defaultValues: { name: draft.name, handle: draft.handle, email: draft.email, password: draft.password, phone: draft.phone, city: draft.city },
  });
  const handle = watch('handle');

  const onPhoto = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      draft.update({ photo: await cropSquare(file) });
    } catch (error) {
      toast(error.message);
    }
  };

  const onSubmit = async (values) => {
    if (!(await isHandleAvailable(values.handle))) {
      setError('handle', { message: 'Ce nom d\'utilisateur est déjà pris.' });
      return;
    }
    draft.update({ ...values, step: 2 });
  };

  return (
    <form noValidate onSubmit={handleSubmit(onSubmit)}>
      <h2 className="h3">Qui êtes-vous ?</h2>
      <div className="grid2">
        <Input label="Nom affiché" placeholder="Ex. Ama Kouassi" autoComplete="name" error={errors.name?.message} {...register('name')} />
        <Input
          label="Nom d'utilisateur"
          placeholder="amakouassi"
          hint={`Votre vitrine : pullup.net/@${(handle || 'pseudo').toLowerCase().replace(/[^a-z0-9._]/g, '') || 'pseudo'}`}
          error={errors.handle?.message}
          {...register('handle')}
        />
      </div>
      <div className="grid2">
        <Input label="E-mail" type="email" autoComplete="email" error={errors.email?.message} {...register('email')} />
        <Input label="Mot de passe" type="password" autoComplete="new-password" error={errors.password?.message} {...register('password')} />
        <Input label="Téléphone (mobile money)" type="tel" inputMode="tel" placeholder="+225 07 00 00 00 00" autoComplete="tel" {...register('phone')} />
      </div>
      <div className="field">
        <span className="f" id="su-photo-label">Photo de profil</span>
        <div className="row">
          {draft.photo
            ? <Avatar name={draft.name || '?'} photo={draft.photo} size={64} />
            : <span className="avatar" style={{ '--s': '64px', background: 'var(--surface-2)', color: 'var(--muted)' }} aria-hidden="true">?</span>}
          <label className="btn sm ghost" htmlFor="su-photo" style={{ cursor: 'pointer' }}>{draft.photo ? 'Changer' : 'Ajouter une photo'}</label>
          <input className="sr" id="su-photo" type="file" accept="image/*" aria-labelledby="su-photo-label" onChange={onPhoto} />
        </div>
        <div className="hint">Facultatif, mais une vitrine avec photo inspire confiance aux marques.</div>
      </div>
      <Input as="select" label="Ville" {...register('city')}>
        {[...cities, 'Autre'].map((city) => <option key={city}>{city}</option>)}
      </Input>
      <div className="row" style={{ justifyContent: 'flex-end' }}>
        <Button type="submit" loading={isSubmitting}>Continuer</Button>
      </div>
    </form>
  );
}

function AudienceStep() {
  const draft = useSignupDraft();
  const { cats } = usePublicCatalog();
  const { register, handleSubmit, control, getValues, formState: { errors } } = useForm({
    resolver: zodResolver(audienceSchema),
    defaultValues: { nets: draft.nets, cats: draft.cats },
  });
  const netsError = errors.nets?.message || errors.nets?.root?.message;

  return (
    <form noValidate onSubmit={handleSubmit((values) => draft.update({ ...values, step: 3 }))}>
      <h2 className="h3">Vos réseaux et votre univers</h2>
      <p className="small muted">Indiquez le nombre d'abonnés pour chaque réseau que vous utilisez. Nous vérifions ces chiffres avant publication.</p>
      <div className="grid2">
        {Object.entries(NET).map(([key, net]) => (
          <Input key={key} label={net.l} type="number" min="0" placeholder="0" {...register(`nets.${key}`)} />
        ))}
      </div>
      {netsError ? <p className="field-error" role="alert">{netsError}</p> : null}
      <fieldset className="field" style={{ border: 0, padding: 0 }}>
        <legend className="f">Thématiques (3 max.)</legend>
        <Controller
          control={control}
          name="cats"
          render={({ field }) => (
            <div className="choice">
              {Object.entries(cats).map(([key, cat]) => (
                <Chip key={key} selected={field.value.includes(key)} onClick={() => field.onChange(toggleCat(field.value, key))}>
                  {cat.e} {cat.l}
                </Chip>
              ))}
            </div>
          )}
        />
        {errors.cats ? <p className="field-error" role="alert">{errors.cats.message}</p> : null}
      </fieldset>
      <div className="row between">
        <Button variant="ghost" onClick={() => draft.update({ ...getValues(), step: 1 })}>Retour</Button>
        <Button type="submit">Continuer</Button>
      </div>
    </form>
  );
}

function OfferStep() {
  const navigate = useNavigate();
  const draft = useSignupDraft();
  const { mutate, isPending } = useSignupInfluencer(() => {
    draft.reset();
    navigate('/espace', { replace: true });
  });
  const { register, handleSubmit, control, getValues, formState: { errors } } = useForm({
    resolver: zodResolver(offerSchema),
    defaultValues: { pub: draft.pub, part: draft.part, ded: draft.ded, price: draft.price, promo: draft.promo, cgu: draft.cgu },
  });

  const onSubmit = (values) => {
    const nets = Object.fromEntries(Object.entries(draft.nets).map(([k, v]) => [k, Number(v) || 0]));
    mutate({
      name: draft.name, handle: draft.handle, email: draft.email, password: draft.password, phone: draft.phone, city: draft.city, bio: '',
      photo: draft.photo, nets, cats: draft.cats, price: values.price,
      accepts: { pub: values.pub, partenariat: values.part, dedicace: values.ded },
    });
  };

  return (
    <form noValidate onSubmit={handleSubmit(onSubmit)}>
      <h2 className="h3">Vos offres</h2>
      {[['pub', 'les publicités'], ['part', 'les partenariats'], ['ded', 'les dédicaces personnelles']].map(([key, label]) => (
        <div className="flag" style={{ padding: '12px 0' }} key={key}>
          <div className="grow">Acceptez-vous {label} ?</div>
          <Controller
            control={control}
            name={key}
            render={({ field }) => <Switch checked={field.value} onChange={field.onChange} label={`J'accepte ${label}`} />}
          />
        </div>
      ))}
      <Input
        label="Prix de votre story ou post de base (FCFA)"
        type="number"
        min="5000"
        step="500"
        placeholder="Ex. 25 000"
        hint="Vous pourrez ajouter d'autres formats depuis votre espace."
        error={errors.price?.message}
        fieldStyle={{ marginTop: 14 }}
        {...register('price')}
      />
      <Input label="Code promo (facultatif)" {...register('promo')} />
      <label className="row small" style={{ gap: 8, margin: '6px 0 4px' }}>
        <input type="checkbox" {...register('cgu')} />
        J'accepte les <Link to="/legal/cgu" target="_blank">conditions générales d'utilisation</Link>
      </label>
      {errors.cgu ? <p className="field-error" role="alert">{errors.cgu.message}</p> : null}
      <div className="row between" style={{ marginTop: 18 }}>
        <Button variant="ghost" onClick={() => draft.update({ ...getValues(), step: 2 })}>Retour</Button>
        <Button type="submit" variant="wine" loading={isPending}>Créer ma vitrine</Button>
      </div>
    </form>
  );
}

export function SignupPage() {
  const step = useSignupDraft((state) => state.step);
  return (
    <>
      <section className="vhead">
        <Orbs />
        <div className="wrap signup-hero">
          <div>
            <h1 style={{ fontSize: 'clamp(1.9rem,4vw,2.8rem)', maxWidth: '20ch' }}>Créez votre vitrine d'influenceur</h1>
            <p style={{ opacity: 0.9, margin: 0, maxWidth: '56ch' }}>
              Affichez vos tarifs, partagez votre QR code et recevez des campagnes payées. Inscription gratuite en 3 étapes.
            </p>
          </div>
          <img
            className="hide-m"
            src={filming}
            alt="Une créatrice se filme avec son téléphone"
            width={420}
            height={300}
            style={{ borderRadius: 24, boxShadow: '0 20px 40px -18px rgba(0,0,0,.5)', transform: 'rotate(-2deg)', width: '100%', height: 'auto' }}
          />
        </div>
      </section>
      <div className="wrap vbody" style={{ maxWidth: 760, paddingBottom: 60 }}>
        <div className="panel">
          <div className="wizard" aria-hidden="true">
            {[1, 2, 3].map((k) => <span key={k} className={cn(k <= step && 'on')} />)}
          </div>
          <p className="tiny muted" style={{ marginTop: -12 }} aria-live="polite">Étape {step} sur 3</p>
          {step === 1 ? <IdentityStep /> : null}
          {step === 2 ? <AudienceStep /> : null}
          {step === 3 ? <OfferStep /> : null}
        </div>
      </div>
    </>
  );
}
