import { Navigate } from 'react-router-dom';
import { PageSkeleton } from '@/components/feedback/Skeleton/Skeleton.jsx';
import { AccountPanel, useSession } from '@/features/auth/index.js';

/** `/compte` : onglet profil de l'espace, ou panneau seul pour l'administrateur. */
export function AccountPage() {
  const { role, isPending } = useSession();
  if (isPending) return <PageSkeleton />;
  if (role === 'visitor') return <Navigate to="/connexion?next=%2Fcompte" replace />;
  if (role !== 'admin') return <Navigate to="/espace?tab=profil" replace />;
  return (
    <div className="wrap" style={{ padding: '30px 20px' }}>
      <AccountPanel />
    </div>
  );
}
