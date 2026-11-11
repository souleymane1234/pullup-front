import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Modal } from '@/components/ui/Modal/Modal.jsx';
import { formatDateTime } from '@/lib/format.js';
import { useMarkNotificationsRead, useNotifications } from '../hooks/usePlatform.js';

/**
 * Liste des notifications. Elles sont marquées comme lues à l'ouverture,
 * mais l'état « non lu » reste visible tant que la fenêtre est ouverte.
 * @param {{ open: boolean, onClose: () => void }} props
 */
export function NotificationsDialog({ open, onClose }) {
  const { data, isSuccess } = useNotifications(open);
  const { mutate: markRead } = useMarkNotificationsRead();
  const [snapshot, setSnapshot] = useState(/** @type {any[]|null} */ (null));

  useEffect(() => {
    if (!open) {
      setSnapshot(null);
      return;
    }
    if (snapshot === null && isSuccess) {
      setSnapshot(data);
      if (data.some((n) => !n.r)) markRead();
    }
  }, [open, data, isSuccess, snapshot, markRead]);

  const list = snapshot ?? data ?? [];

  return (
    <Modal open={open} onClose={onClose} title="Notifications">
      <div style={{ marginTop: 12 }}>
        {list.length ? list.map((n) => (
          <Link
            key={`${n.at}-${n.t}`}
            to={n.link || '/'}
            onClick={onClose}
            className="camp"
            style={{ gridTemplateColumns: 'auto 1fr', opacity: n.r ? 0.6 : 1 }}
          >
            <span
              aria-hidden="true"
              style={{ width: 9, height: 9, borderRadius: '50%', background: n.r ? 'var(--line)' : 'var(--wine)', marginTop: 6, alignSelf: 'start' }}
            />
            <div>
              <div className="small">{n.t}{n.r ? null : <span className="sr"> (non lue)</span>}</div>
              <div className="tiny muted">{formatDateTime(n.at)}</div>
            </div>
          </Link>
        )) : <div className="empty"><p>Rien de nouveau.</p></div>}
      </div>
      <Modal.Footer>
        <button type="button" className="btn sm ghost" onClick={onClose}>Fermer</button>
      </Modal.Footer>
    </Modal>
  );
}
