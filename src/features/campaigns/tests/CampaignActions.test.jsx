import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { CampaignActions } from '../components/CampaignActions.jsx';

const campaign = (status) => ({
  id: 'c1',
  status,
  influencer: { id: 'i1', name: 'Ama Kouassi', handle: 'amakouassi' },
  brand: { id: 'b1', name: 'Savane Cosmetics' },
});

function renderActions(status, role) {
  return render(
    <QueryClientProvider client={new QueryClient()}>
      <MemoryRouter>
        <CampaignActions campaign={campaign(status)} role={role} />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('CampaignActions', () => {
  it('propose accepter ou refuser à l’influenceur', () => {
    renderActions('paid', 'influencer');
    expect(screen.getByRole('button', { name: 'Accepter la campagne' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Refuser' })).toBeInTheDocument();
  });

  it('affiche le formulaire de preuve une fois la campagne acceptée', () => {
    renderActions('accepted', 'influencer');
    expect(screen.getByLabelText('Lien de la publication')).toBeInTheDocument();
  });

  it('permet à l’annonceur de valider ou de signaler un problème', () => {
    renderActions('published', 'brand');
    expect(screen.getByRole('button', { name: 'Valider et libérer les fonds' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Signaler un problème' })).toBeInTheDocument();
  });

  it('propose de relancer une campagne terminée', () => {
    renderActions('completed', 'brand');
    expect(screen.getByRole('link', { name: 'Relancer une campagne avec Ama' })).toHaveAttribute('href', '/engager/amakouassi');
  });

  it('laisse l’arbitrage du litige à l’administrateur', () => {
    renderActions('dispute', 'admin');
    expect(screen.getByRole('button', { name: 'Trancher : payer l\'influenceur' })).toBeInTheDocument();
    renderActions('dispute', 'brand');
    expect(screen.queryAllByRole('button', { name: /Trancher/ })).toHaveLength(2);
  });
});
