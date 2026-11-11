import { Table } from './Table.jsx';

/** @type {import('@storybook/react-vite').Meta<typeof Table>} */
const meta = {
  title: 'UI/Table',
  component: Table,
  tags: ['autodocs'],
  args: {
    caption: 'Campagnes',
    columns: [
      { key: 'ref', header: 'Référence' },
      { key: 'name', header: 'Campagne' },
      { key: 'status', header: 'Statut' },
    ],
  },
};
export default meta;

export const AvecLignes = {
  args: {
    rows: [
      { id: '1', ref: 'PU-2410-137', name: 'Karité Glow', status: 'En séquestre' },
      { id: '2', ref: 'PU-2409-131', name: 'Savane Men', status: 'Publiée' },
    ],
  },
};
export const Vide = { args: { rows: [], emptyTitle: 'Aucune campagne' } };
export const Chargement = { args: { status: 'loading', rows: [] } };
export const Erreur = { args: { status: 'error', rows: [], errorText: 'Réseau indisponible.' } };
