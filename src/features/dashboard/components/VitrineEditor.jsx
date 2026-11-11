import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Avatar } from '@/components/ui/Avatar/Avatar.jsx';
import { Button } from '@/components/ui/Button/Button.jsx';
import { Chip } from '@/components/ui/Chip/Chip.jsx';
import { Input } from '@/components/ui/Input/Input.jsx';
import { COMMISSION, DAYS, MIN_RATE, NET } from '@/domain/catalog.js';
import { usePublicCatalog } from '@/features/platform/index.js';
import { avatarOf } from '@/domain/metrics.js';
import { useSetPhoto } from '@/features/influencers/index.js';
import { cropSquare } from '@/lib/browser.js';
import { formatFcfa } from '@/lib/format.js';
import { toast } from '@/lib/toast.js';
import { useUpdateVitrine } from '../hooks/useSpaces.js';
import { DashHeader } from '@/components/layout/DashHeader/DashHeader.jsx';

const toggle = (list, value) => (list.includes(value) ? list.filter((x) => x !== value) : [...list, value]);

/** @param {{ influencer: any }} props */
export function VitrineEditor({ influencer: i }) {
  const { cats: catalogCats } = usePublicCatalog();
  const [bio, setBio] = useState(i.bio);
  const [cats, setCats] = useState(i.cats);
  const [days, setDays] = useState(i.days);
  const [rates, setRates] = useState(i.rates);
  const [draft, setDraft] = useState({ net: Object.keys(i.net)[0], fmt: '', price: '' });
  const save = useUpdateVitrine();
  const photo = useSetPhoto();

  const onPhoto = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    try {
      photo.mutate({ id: i.id, photo: await cropSquare(file) });
    } catch (error) {
      toast(error instanceof Error ? error.message : 'Image illisible.');
    }
  };

  const editRate = (id, patch) => setRates((list) => list.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  const removeRate = (id) => {
    if (rates.length <= 1) {
      toast('Gardez au moins un tarif.');
      return;
    }
    setRates((list) => list.filter((r) => r.id !== id));
  };
  const addRate = () => {
    const price = Number(draft.price);
    if (!draft.fmt.trim() || price < MIN_RATE) {
      toast('Format requis et prix minimum 5 000 FCFA.');
      return;
    }
    setRates((list) => [...list, { id: `${i.id}r${Date.now()}`, net: draft.net, fmt: draft.fmt.trim(), price }]);
    setDraft((d) => ({ ...d, fmt: '', price: '' }));
  };

  return (
    <>
      <DashHeader title="Ma vitrine" subtitle="Ce que les marques voient sur votre page publique." actions={<Link className="btn sm ghost" to={`/i/${i.handle}`}>Voir ma vitrine</Link>} />
      <div className="panel">
        <div className="field">
          <span className="f">Photo de profil</span>
          <div className="row">
            <Avatar {...avatarOf(i)} size={84} />
            <div>
              <label className="btn sm ghost" htmlFor="v-photo" style={{ cursor: 'pointer' }}>{i.photo ? 'Changer la photo' : 'Ajouter une photo'}</label>
              <input className="sr" id="v-photo" type="file" accept="image/*" onChange={onPhoto} />
              {i.photo ? (
                <>
                  {' '}
                  <Button size="sm" variant="danger" disabled={photo.isPending} onClick={() => photo.mutate({ id: i.id, photo: null })}>Retirer</Button>
                </>
              ) : null}
              <div className="hint">Photo nette, visage visible. Les vitrines avec photo reçoivent bien plus de demandes.</div>
            </div>
          </div>
        </div>
        <Input as="textarea" label="Présentation" maxLength={400} value={bio} onChange={(e) => setBio(e.target.value)} />
        <fieldset className="field" style={{ border: 0, padding: 0 }}>
          <legend className="f">Thématiques <span className="muted tiny">(3 maximum)</span></legend>
          <div className="choice">
            {Object.entries(catalogCats).map(([key, cat]) => (
              <Chip key={key} selected={cats.includes(key)} onClick={() => setCats((list) => toggle(list, key).slice(-3))}>
                {cat.e} {cat.l}
              </Chip>
            ))}
          </div>
        </fieldset>
        <fieldset className="field" style={{ border: 0, padding: 0 }}>
          <legend className="f">Jours de publication</legend>
          <div className="choice">
            {DAYS.map((day) => (
              <Chip key={day} selected={days.includes(day)} onClick={() => setDays((list) => toggle(list, day))}>{day}</Chip>
            ))}
          </div>
        </fieldset>
        <h3 className="h4" style={{ marginTop: 20 }}>Tarifs</h3>
        <div className="scroll-x">
          <table className="table">
            <caption className="sr">Vos tarifs</caption>
            <thead>
              <tr><th scope="col">Réseau</th><th scope="col">Format</th><th scope="col">Prix (FCFA)</th><th scope="col">Vous recevez</th><th scope="col"><span className="sr">Actions</span></th></tr>
            </thead>
            <tbody>
              {rates.map((r) => (
                <tr key={r.id}>
                  <td>{NET[r.net].l}</td>
                  <td>
                    <input className="inp" style={{ minWidth: 160 }} aria-label={`Format ${NET[r.net].l}`} value={r.fmt} onChange={(e) => editRate(r.id, { fmt: e.target.value })} />
                  </td>
                  <td>
                    <input
                      className="inp"
                      style={{ width: 130 }}
                      type="number"
                      step={500}
                      min={MIN_RATE}
                      aria-label={`Prix ${r.fmt}`}
                      value={r.price}
                      onChange={(e) => editRate(r.id, { price: Number(e.target.value) })}
                    />
                  </td>
                  <td className="small muted">{formatFcfa(r.price * (1 - COMMISSION))}</td>
                  <td><Button size="sm" variant="danger" onClick={() => removeRate(r.id)} aria-label={`Supprimer le tarif ${r.fmt}`}>×</Button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="row" style={{ marginTop: 12 }}>
          <select className="inp" style={{ width: 'auto' }} aria-label="Réseau du nouveau tarif" value={draft.net} onChange={(e) => setDraft((d) => ({ ...d, net: e.target.value }))}>
            {Object.keys(i.net).map((key) => <option key={key} value={key}>{NET[key].l}</option>)}
          </select>
          <input className="inp" placeholder="Format (ex. Story 24 h)" aria-label="Format du nouveau tarif" style={{ width: 'auto', flex: 1, minWidth: 160 }} value={draft.fmt} onChange={(e) => setDraft((d) => ({ ...d, fmt: e.target.value }))} />
          <input className="inp" type="number" step={500} placeholder="Prix" aria-label="Prix du nouveau tarif" style={{ width: 130 }} value={draft.price} onChange={(e) => setDraft((d) => ({ ...d, price: e.target.value }))} />
          <Button size="sm" variant="ghost" onClick={addRate}>Ajouter</Button>
        </div>
        <p className="tiny muted" style={{ marginTop: 8 }}>Prix minimum 5 000 FCFA. La commission PULLUP de 15 % est déduite à la libération des fonds.</p>
        <div className="row" style={{ justifyContent: 'flex-end', marginTop: 18 }}>
          <Link className="btn ghost" to={`/i/${i.handle}`}>Aperçu</Link>
          <Button loading={save.isPending} onClick={() => save.mutate({ id: i.id, bio, cats, days, rates })}>Enregistrer la vitrine</Button>
        </div>
      </div>
    </>
  );
}
