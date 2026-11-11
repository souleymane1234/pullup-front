import { useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/Button/Button.jsx';
import { cn } from '@/lib/cn.js';
import { formatDateTime } from '@/lib/format.js';
import { useSendMessage } from '../hooks/useSendMessage.js';
import { messageSchema } from '../schemas/message.schema.js';

/**
 * Fil de discussion d'une campagne, lisible par l'équipe PULLUP en cas de litige.
 * @param {{ campaignId: string, messages: { from: string, t: string, at: string }[], role: string,
 *   names: { brand: string, influencer: string } }} props
 */
export function CampaignMessages({ campaignId, messages, role, names }) {
  const listRef = useRef(/** @type {HTMLDivElement|null} */ (null));
  const { register, handleSubmit, reset, setFocus } = useForm({ resolver: zodResolver(messageSchema), defaultValues: { text: '' } });
  const { mutate, isPending } = useSendMessage(campaignId, () => {
    reset();
    setFocus('text');
  });

  useEffect(() => {
    const list = listRef.current;
    if (list) list.scrollTop = list.scrollHeight;
  }, [messages.length]);

  const author = (from) => {
    if (from === 'brand') return names.brand;
    if (from === 'influencer') return names.influencer;
    return 'Équipe PULLUP';
  };

  return (
    <div className="panel">
      <h2 className="h4">Messages</h2>
      <p className="small muted" style={{ marginTop: -4 }}>Échangez sur le brief. L'équipe PULLUP peut lire ce fil en cas de litige.</p>
      <div className="msgs" ref={listRef} role="log" aria-live="polite" aria-label="Fil de discussion">
        {messages.length ? messages.map((message) => {
          const mine = message.from === role;
          return (
            <div key={`${message.at}-${message.t}`} className={cn('msg', mine && 'me')}>
              {message.t}
              <small>{mine ? 'Vous' : author(message.from)} · {formatDateTime(message.at)}</small>
            </div>
          );
        }) : <div className="msg sys">Aucun message. Posez vos questions ici plutôt qu'en privé : tout reste tracé.</div>}
      </div>
      <form className="row" style={{ flexWrap: 'nowrap', marginTop: 10 }} onSubmit={handleSubmit(({ text }) => mutate(text))}>
        <input className="inp" placeholder="Votre message…" aria-label="Votre message" autoComplete="off" {...register('text')} />
        <Button type="submit" loading={isPending}>Envoyer</Button>
      </form>
    </div>
  );
}
