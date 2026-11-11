import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { AdminPage } from '@/features/admin/pages/AdminPage.jsx';
import { EngagePage } from '@/features/booking/pages/EngagePage.jsx';
import { CampaignPage } from '@/features/campaigns/pages/CampaignPage.jsx';
import { BrandSpacePage } from '@/features/dashboard/pages/BrandSpacePage.jsx';
import { InfluencerSpacePage } from '@/features/dashboard/pages/InfluencerSpacePage.jsx';
import { VitrinePage } from '@/features/influencers/pages/VitrinePage.jsx';
import { HomePage } from '@/features/marketing/pages/HomePage.jsx';
import { PricingPage } from '@/features/marketing/pages/PricingPage.jsx';
import { MatchingPage } from '@/features/matching/pages/MatchingPage.jsx';
import { env } from '@/lib/env.js';
import { loginAs, logout } from '@/services/auth.service.js';
import { resetDb } from '@/services/demo/db.js';

function renderAt(path, pattern, element) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={[path]}>
        <Routes><Route path={pattern} element={element} /></Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('pages migrées (mode démonstration)', () => {
  const apiUrl = env.apiUrl;
  beforeAll(() => { env.apiUrl = ''; });
  afterAll(() => { env.apiUrl = apiUrl; });
  beforeEach(async () => {
    resetDb();
    await logout();
  });

  it('accueil', async () => {
    renderAt('/', '/', <HomePage />);
    expect(await screen.findByText('Voir la vitrine complète')).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Les mieux notés' })).toHaveAttribute('aria-selected', 'true');
  });

  it('tarifs et vitrine publique', async () => {
    renderAt('/tarifs', '/tarifs', <PricingPage />);
    expect(screen.getByRole('heading', { name: 'Des tarifs simples' })).toBeInTheDocument();
    renderAt('/i/amakouassi', '/i/:handle', <VitrinePage />);
    expect(await screen.findAllByText(/Ama Kouassi/)).not.toHaveLength(0);
  });

  it('matching et réservation pour un annonceur', async () => {
    await loginAs({ role: 'brand', id: 'b1' });
    renderAt('/matching', '/matching', <MatchingPage />);
    expect(await screen.findByRole('button', { name: /Trouver les meilleurs profils/ })).toBeInTheDocument();
    renderAt('/engager/amakouassi', '/engager/:handle', <EngagePage />);
    expect(await screen.findByRole('heading', { name: 'Choisissez l\'offre' })).toBeInTheDocument();
  });

  it('détail de campagne et espace annonceur', async () => {
    await loginAs({ role: 'brand', id: 'b1' });
    renderAt('/c/c1', '/c/:id', <CampaignPage />);
    expect(await screen.findByText('Brief')).toBeInTheDocument();
    renderAt('/espace?tab=selection', '/espace', <BrandSpacePage />);
    expect(await screen.findByRole('heading', { name: 'Ma sélection' })).toBeInTheDocument();
  });

  it('espace influenceur', async () => {
    await loginAs({ role: 'influencer', id: 'i1' });
    renderAt('/espace?tab=vitrine', '/espace', <InfluencerSpacePage />);
    expect(await screen.findByRole('button', { name: 'Enregistrer la vitrine' })).toBeInTheDocument();
  });

  it('administration', async () => {
    await loginAs({ role: 'admin', id: 'admin' });
    renderAt('/admin?tab=camps', '/admin', <AdminPage />);
    expect(await screen.findByRole('heading', { name: 'Toutes les campagnes' })).toBeInTheDocument();
  });
});
