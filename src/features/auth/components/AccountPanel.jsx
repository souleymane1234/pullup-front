import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUiStore } from '@/app/store/ui.store.js';
import { DashHeader } from '@/components/layout/DashHeader/DashHeader.jsx';
import { Button } from '@/components/ui/Button/Button.jsx';
import { Input } from '@/components/ui/Input/Input.jsx';
import { Modal } from '@/components/ui/Modal/Modal.jsx';
import { toast } from '@/lib/toast.js';
import { useDeleteAccount, useExportMyData, useLogout, useSession } from '../hooks/useSession.js';

/** Profil du compte connecté : coordonnées, thème et déconnexion. */
export function AccountPanel() {
  const navigate = useNavigate();
  const { session } = useSession();
  const toggleTheme = useUiStore((state) => state.toggleTheme);
  const { mutate: logout, isPending } = useLogout(() => navigate('/'));
  const { mutate: downloadData, isPending: exporting } = useExportMyData();
  const { mutate: removeAccount, isPending: deleting } = useDeleteAccount(() => navigate('/'));
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmed, setConfirmed] = useState(false);

  if (!session) return null;

  const closeDelete = () => {
    setDeleteOpen(false);
    setPassword('');
    setConfirmed(false);
  };

  const onDelete = (event) => {
    event.preventDefault();
    if (!confirmed) {
      toast('Confirmez la suppression du compte.');
      return;
    }
    removeAccount(password);
  };

  const save = (event) => {
    event.preventDefault();
    toast('Profil enregistré.');
  };

  return (
    <>
      <DashHeader title="Mon profil" subtitle="Vos coordonnées et vos préférences d'affichage." />
      <form className="panel" onSubmit={save}>
        <div className="grid2">
          <Input label="Nom" defaultValue={session.name} autoComplete="name" />
          <Input label="E-mail" type="email" defaultValue={session.email} autoComplete="email" />
        </div>
        <Input label="Téléphone" type="tel" placeholder="+225 07 00 00 00 00" autoComplete="tel" />
        <div className="row between">
          <Button variant="ghost" onClick={toggleTheme}>Thème clair / sombre</Button>
          <div className="row">
            <Button variant="ghost" type="button" loading={exporting} onClick={() => downloadData()}>Télécharger mes données</Button>
            <Button variant="danger" loading={isPending} onClick={() => logout()}>Se déconnecter</Button>
            <Button type="submit">Enregistrer</Button>
          </div>
        </div>
      </form>
      <div className="panel flat" style={{ marginTop: 18 }}>
        <h3 className="h4">Supprimer mon compte</h3>
        <p className="small muted">Vos données personnelles sont anonymisées. Cette action est définitive.</p>
        <Button size="sm" variant="danger" type="button" onClick={() => setDeleteOpen(true)}>Supprimer mon compte</Button>
      </div>
      <Modal open={deleteOpen} onClose={closeDelete} title="Supprimer mon compte">
        <form noValidate onSubmit={onDelete}>
          <p className="small muted">Saisissez votre mot de passe pour confirmer. Vous serez déconnecté.</p>
          <Input
            label="Mot de passe"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
          <label className="row small" style={{ gap: 8 }}>
            <input type="checkbox" checked={confirmed} onChange={(event) => setConfirmed(event.target.checked)} />
            Je confirme la suppression définitive de mon compte
          </label>
          <Modal.Footer>
            <Button variant="ghost" onClick={closeDelete}>Annuler</Button>
            <Button type="submit" variant="danger" loading={deleting}>Supprimer</Button>
          </Modal.Footer>
        </form>
      </Modal>
    </>
  );
}
