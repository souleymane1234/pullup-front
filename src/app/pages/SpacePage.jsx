import { lazy } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { PageSkeleton } from '@/components/feedback/Skeleton/Skeleton.jsx';
import { useSession } from '@/features/auth/index.js';

const BrandSpacePage = lazy(() => import('@/features/dashboard/pages/BrandSpacePage.jsx').then((m) => ({ default: m.BrandSpacePage })));
const InfluencerSpacePage = lazy(() => import('@/features/dashboard/pages/InfluencerSpacePage.jsx').then((m) => ({ default: m.InfluencerSpacePage })));
const AdminPage = lazy(() => import('@/features/admin/pages/AdminPage.jsx').then((m) => ({ default: m.AdminPage })));

/** `/espace` : tableau de bord selon le rôle, ou connexion pour un visiteur. */
export function SpacePage() {
  const { role, isPending } = useSession();
  const location = useLocation();
  if (isPending) return <PageSkeleton />;
  if (role === 'brand') return <BrandSpacePage />;
  if (role === 'influencer') return <InfluencerSpacePage />;
  if (role === 'admin') return <AdminPage />;
  return <Navigate to={`/connexion?next=${encodeURIComponent(location.pathname + location.search)}`} replace />;
}

/** `/admin` : réservé à l'équipe PULLUP. */
export function AdminRoute() {
  const { role, isPending } = useSession();
  const location = useLocation();
  if (isPending) return <PageSkeleton />;
  if (role === 'admin') return <AdminPage />;
  return <Navigate to={`/connexion?next=${encodeURIComponent(location.pathname + location.search)}`} replace />;
}
