import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button/Button.jsx';
import { Input } from '@/components/ui/Input/Input.jsx';
import { Modal } from '@/components/ui/Modal/Modal.jsx';
import { firstName } from '@/domain/metrics.js';
import { useCampaignAction } from '../hooks/useCampaigns.js';
import { disputeSchema, proofSchema } from '../schemas/campaign.schema.js';

function ProofForm({ campaign, run, pending }) {
  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(proofSchema), defaultValues: { url: '', note: '' } });
  return (
    <form className="grow" style={{ minWidth: 260 }} noValidate onSubmit={handleSubmit((payload) => run({ action: 'proof', payload }))}>
      <Input label="Lien de la publication" type="url" placeholder={`https://www.tiktok.com/@${campaign.influencer.handle}/video/…`} error={errors.url?.message} {...register('url')} />
      <Input label="Commentaire et capture" placeholder="Ex. Story en ligne depuis 14 h, capture du lien bio jointe" error={errors.note?.message} {...register('note')} />
      <input className="inp" type="file" accept="image/*" aria-label="Capture d'écran" />
      <Button type="submit" style={{ marginTop: 12 }} loading={pending}>J'ai publié, envoyer la preuve</Button>
    </form>
  );
}

function DisputeDialog({ open, onClose, run, pending }) {
  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(disputeSchema), defaultValues: { reason: '' } });
  return (
    <Modal open={open} onClose={onClose} title="Signaler un problème">
      <form noValidate onSubmit={handleSubmit((payload) => run({ action: 'dispute', payload }))}>
        <Input
          as="textarea"
          label="Décrivez le problème"
          placeholder="Publication supprimée, consignes non respectées…"
          hint="Les fonds restent bloqués pendant l'arbitrage de l'équipe PULLUP (48 h)."
          error={errors.reason?.message}
          {...register('reason')}
        />
        <Modal.Footer>
          <Button variant="ghost" onClick={onClose}>Annuler</Button>
          <Button type="submit" variant="danger" loading={pending}>Ouvrir un litige</Button>
        </Modal.Footer>
      </form>
    </Modal>
  );
}

/**
 * Actions disponibles selon le rôle et l'étape de la campagne.
 * @param {{ campaign: any, role: string }} props
 */
export function CampaignActions({ campaign: c, role }) {
  const [disputeOpen, setDisputeOpen] = useState(false);
  const { mutate, isPending } = useCampaignAction(c.id, () => setDisputeOpen(false));
  const act = (action) => () => mutate({ action, payload: {} });

  let content = null;
  if (role === 'influencer' && c.status === 'paid') {
    content = (
      <>
        <Button variant="ok" loading={isPending} onClick={act('accept')}>Accepter la campagne</Button>
        <Button variant="danger" disabled={isPending} onClick={act('decline')}>Refuser</Button>
      </>
    );
  }
  if (role === 'influencer' && c.status === 'accepted') content = <ProofForm campaign={c} run={mutate} pending={isPending} />;
  if (role === 'brand' && ['paid', 'accepted'].includes(c.status)) {
    content = <Button variant="danger" loading={isPending} onClick={act('cancel')}>Annuler et être remboursé</Button>;
  }
  if (role === 'brand' && c.status === 'published') {
    content = (
      <>
        <Button variant="ok" loading={isPending} onClick={act('validate')}>Valider et libérer les fonds</Button>
        <Button variant="danger" disabled={isPending} onClick={() => setDisputeOpen(true)}>Signaler un problème</Button>
      </>
    );
  }
  if (role === 'brand' && c.status === 'completed') {
    content = (
      <Link className="btn ghost" to={`/engager/${c.influencer.handle}`} state={{ fresh: true }}>
        Relancer une campagne avec {firstName(c.influencer.name)}
      </Link>
    );
  }
  if (role === 'admin' && c.status === 'dispute') {
    content = (
      <>
        <Button variant="ok" loading={isPending} onClick={act('release')}>Trancher : payer l'influenceur</Button>
        <Button variant="danger" disabled={isPending} onClick={act('refund')}>Trancher : rembourser l'annonceur</Button>
      </>
    );
  }
  if (role === 'admin' && c.status === 'published') {
    content = <Button loading={isPending} onClick={act('validate')}>Validation automatique (72 h écoulées)</Button>;
  }

  if (!content) return null;
  return (
    <div className="panel row" style={{ alignItems: 'flex-end' }}>
      {content}
      {role === 'brand' ? <DisputeDialog open={disputeOpen} onClose={() => setDisputeOpen(false)} run={mutate} pending={isPending} /> : null}
    </div>
  );
}
