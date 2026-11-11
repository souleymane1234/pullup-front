import { Navigate, createBrowserRouter } from 'react-router-dom';
import { AppShell } from '@/app/layout/AppShell.jsx';

/** @param {() => Promise<Record<string, unknown>>} load @param {string} name */
function page(load, name) {
  return async () => {
    const module = await load();
    return { Component: /** @type {import('react').ComponentType} */ (module[name]) };
  };
}

/** Les anciens liens `#/chemin?x` (favoris, QR codes imprimés) deviennent `/chemin?x`. */
function redirectLegacyHash() {
  const { hash } = window.location;
  if (hash.startsWith('#/')) window.history.replaceState(null, '', hash.slice(1) || '/');
}

redirectLegacyHash();

export const router = createBrowserRouter([
  {
    Component: AppShell,
    children: [
      { index: true, lazy: page(() => import('@/features/marketing/pages/HomePage.jsx'), 'HomePage') },
      { path: 'influenceurs', lazy: page(() => import('@/features/influencers/pages/ExplorePage.jsx'), 'ExplorePage') },
      { path: 'i/:handle', lazy: page(() => import('@/features/influencers/pages/VitrinePage.jsx'), 'VitrinePage') },
      { path: 'engager/:handle', lazy: page(() => import('@/features/booking/pages/EngagePage.jsx'), 'EngagePage') },
      { path: 'c/:id', lazy: page(() => import('@/features/campaigns/pages/CampaignPage.jsx'), 'CampaignPage') },
      { path: 'matching', lazy: page(() => import('@/features/matching/pages/MatchingPage.jsx'), 'MatchingPage') },
      { path: 'tarifs', lazy: page(() => import('@/features/marketing/pages/PricingPage.jsx'), 'PricingPage') },
      { path: 'faq', lazy: page(() => import('@/features/marketing/pages/FaqPage.jsx'), 'FaqPage') },
      { path: 'legal/:doc', lazy: page(() => import('@/features/marketing/pages/LegalPage.jsx'), 'LegalPage') },
      { path: 'connexion', lazy: page(() => import('@/features/auth/pages/LoginPage.jsx'), 'LoginPage') },
      { path: 'mot-de-passe-oublie', lazy: page(() => import('@/features/auth/pages/ForgotPasswordPage.jsx'), 'ForgotPasswordPage') },
      { path: 'mot-de-passe', lazy: page(() => import('@/features/auth/pages/ResetPasswordPage.jsx'), 'ResetPasswordPage') },
      { path: 'rejoindre', lazy: page(() => import('@/features/auth/pages/SignupPage.jsx'), 'SignupPage') },
      { path: 'espace', lazy: page(() => import('@/app/pages/SpacePage.jsx'), 'SpacePage') },
      { path: 'admin', lazy: page(() => import('@/app/pages/SpacePage.jsx'), 'AdminRoute') },
      { path: 'compte', lazy: page(() => import('@/app/pages/AccountPage.jsx'), 'AccountPage') },
      { path: 'campagnes', element: <Navigate to="/espace?tab=campagnes" replace /> },
      { path: 'portefeuille', element: <Navigate to="/espace?tab=wallet" replace /> },
      { path: 'reservation', element: <Navigate to="/influenceurs" replace /> },
      { path: 'messages', element: <Navigate to="/espace?tab=campagnes" replace /> },
      { path: '*', lazy: page(() => import('@/app/pages/NotFoundPage.jsx'), 'NotFoundPage') },
    ],
  },
]);
