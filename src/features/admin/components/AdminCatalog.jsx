import { useState } from 'react';
import { DashHeader } from '@/components/layout/DashHeader/DashHeader.jsx';
import { Button } from '@/components/ui/Button/Button.jsx';
import { Chip } from '@/components/ui/Chip/Chip.jsx';
import { Input } from '@/components/ui/Input/Input.jsx';
import { Modal } from '@/components/ui/Modal/Modal.jsx';
import { Pill } from '@/components/ui/Pill/Pill.jsx';
import { Table } from '@/components/ui/Table/Table.jsx';
import { useAdminCatalog, useCreateCatalogItem, useHideCatalogItem, useUpdateCatalogItem } from '../hooks/useAdmin.js';

const KINDS = [
  { kind: 'category', group: 'categories', label: 'Thématiques', single: 'thématique', keyHint: 'En minuscules, sans espace (ex. cinema). Laissez vide pour la déduire du libellé.' },
  { kind: 'city', group: 'cities', label: 'Villes', single: 'ville', keyHint: 'Laissez vide : la clé reprend le nom de la ville.' },
  { kind: 'objective', group: 'objectives', label: 'Objectifs', single: 'objectif', keyHint: 'En minuscules (ex. fidelisation). Laissez vide pour la déduire du libellé.' },
  { kind: 'contact_type', group: 'contactTypes', label: 'Types de demande', single: 'type de demande', keyHint: 'Laissez vide : la clé reprend le libellé.' },
];

const COLUMNS = [
  { key: 'label', header: 'Libellé' },
  { key: 'key', header: 'Clé' },
  { key: 'extra', header: 'Détails' },
  { key: 'status', header: 'Statut' },
  { key: 'act', header: 'Actions' },
];

const emptyDraft = (kind) => ({ mode: 'create', kind, key: '', label: '', related: [], reco: '' });

/** @param {{ active: boolean }} props */
export function AdminCatalog({ active }) {
  const [kind, setKind] = useState('category');
  const [draft, setDraft] = useState(/** @type {any} */ (null));
  const { data, isPending, isError, refetch } = useAdminCatalog(active);
  const close = () => setDraft(null);
  const create = useCreateCatalogItem({ onSuccess: close });
  const update = useUpdateCatalogItem({ onSuccess: close });
  const hide = useHideCatalogItem();

  const meta = KINDS.find((k) => k.kind === kind) ?? KINDS[0];
  const items = data?.[meta.group] ?? [];
  const categories = data?.categories ?? [];
  const labelOfCat = (key) => categories.find((c) => c.key === key)?.label ?? key;
  const busy = hide.isPending || update.isPending;

  const onHide = (item) => {
    if (window.confirm(`Masquer « ${item.label} » ? Il ne sera plus proposé sur le site.`)) hide.mutate({ kind: item.kind, key: item.key });
  };

  const rows = items.map((item) => ({
    id: `${item.kind}:${item.key}`,
    label: <b>{item.label}</b>,
    key: <code className="small">{item.key}</code>,
    extra: item.kind === 'category'
      ? (item.related.length ? <span className="small muted">Liées : {item.related.map(labelOfCat).join(', ')}</span> : '—')
      : item.kind === 'objective'
        ? (item.reco ? <span className="small muted">Reco : {item.reco}</span> : '—')
        : '—',
    status: item.active ? <Pill tone="ok">Visible</Pill> : <Pill tone="mute">Masqué</Pill>,
    act: (
      <div className="row" style={{ gap: 6, flexWrap: 'nowrap' }}>
        <Button
          size="sm"
          variant="ghost"
          disabled={busy}
          onClick={() => setDraft({ mode: 'edit', kind: item.kind, key: item.key, label: item.label, related: item.related, reco: item.reco ?? '' })}
        >
          Modifier
        </Button>
        {item.active
          ? <Button size="sm" variant="danger" disabled={busy} onClick={() => onHide(item)}>Masquer</Button>
          : <Button size="sm" variant="ok" disabled={busy} onClick={() => update.mutate({ kind: item.kind, key: item.key, active: true })}>Réactiver</Button>}
      </div>
    ),
  }));

  const onSubmit = (event) => {
    event.preventDefault();
    if (draft.mode === 'create') {
      create.mutate({ kind: draft.kind, key: draft.key, label: draft.label, related: draft.related, reco: draft.reco });
    } else {
      update.mutate({ kind: draft.kind, key: draft.key, label: draft.label, related: draft.related, reco: draft.reco });
    }
  };

  const toggleRelated = (key) => setDraft((d) => ({
    ...d,
    related: d.related.includes(key) ? d.related.filter((k) => k !== key) : [...d.related, key],
  }));

  const draftMeta = draft ? KINDS.find((k) => k.kind === draft.kind) : null;

  return (
    <>
      <DashHeader
        title="Catalogue"
        subtitle="Thématiques, villes, objectifs et types de demande proposés sur le site. Un élément masqué reste en base."
        actions={<Button size="sm" onClick={() => setDraft(emptyDraft(kind))}>Ajouter</Button>}
      />
      <div className="choice" role="tablist" aria-label="Type d'élément" style={{ marginBottom: 14 }}>
        {KINDS.map((k) => (
          <Chip key={k.kind} role="tab" selected={k.kind === kind} onClick={() => setKind(k.kind)}>
            {k.label}{data ? ` (${data[k.group].length})` : ''}
          </Chip>
        ))}
      </div>
      {isError ? (
        <div className="panel empty">
          <h3 className="h4">Impossible de charger le catalogue</h3>
          <Button size="sm" variant="ghost" onClick={() => refetch()}>Réessayer</Button>
        </div>
      ) : (
        <div className="panel">
          <Table
            columns={COLUMNS}
            rows={rows}
            caption={meta.label}
            status={isPending ? 'loading' : 'idle'}
            emptyText="Aucun élément."
          />
        </div>
      )}
      <Modal
        open={Boolean(draft)}
        onClose={close}
        title={draft ? `${draft.mode === 'create' ? 'Nouvelle entrée' : 'Modifier'} · ${draftMeta?.single}` : 'Catalogue'}
      >
        {draft ? (
          <form onSubmit={onSubmit}>
            {draft.mode === 'create' ? (
              <Input as="select" label="Type" value={draft.kind} onChange={(e) => setDraft((d) => ({ ...d, kind: e.target.value, related: [], reco: '' }))}>
                {KINDS.map((k) => <option key={k.kind} value={k.kind}>{k.label}</option>)}
              </Input>
            ) : null}
            <Input
              label="Libellé"
              value={draft.label}
              onChange={(e) => setDraft((d) => ({ ...d, label: e.target.value }))}
              required
              minLength={2}
            />
            {draft.mode === 'create' ? (
              <Input
                label="Clé (facultatif)"
                value={draft.key}
                hint={draftMeta?.keyHint}
                onChange={(e) => setDraft((d) => ({ ...d, key: e.target.value }))}
              />
            ) : (
              <p className="small muted">Clé : <code>{draft.key}</code> (non modifiable)</p>
            )}
            {draft.kind === 'objective' ? (
              <Input
                label="Recommandation affichée"
                placeholder="Ex. Campagnes de notoriété"
                value={draft.reco}
                onChange={(e) => setDraft((d) => ({ ...d, reco: e.target.value }))}
              />
            ) : null}
            {draft.kind === 'category' ? (
              <fieldset className="field" style={{ border: 0, padding: 0 }}>
                <legend className="f">Thématiques liées</legend>
                <div className="choice">
                  {categories.filter((c) => c.key !== draft.key).map((c) => (
                    <Chip key={c.key} selected={draft.related.includes(c.key)} onClick={() => toggleRelated(c.key)}>
                      {c.label}
                    </Chip>
                  ))}
                </div>
              </fieldset>
            ) : null}
            <Modal.Footer>
              <Button variant="ghost" onClick={close}>Annuler</Button>
              <Button type="submit" loading={create.isPending || update.isPending}>
                {draft.mode === 'create' ? 'Créer' : 'Enregistrer'}
              </Button>
            </Modal.Footer>
          </form>
        ) : null}
      </Modal>
    </>
  );
}
