import { DashHeader } from './DashHeader.jsx';

/** @type {import('@storybook/react-vite').Meta<typeof DashHeader>} */
const meta = {
  title: 'Layout/DashHeader',
  component: DashHeader,
  tags: ['autodocs'],
  args: { title: 'Mes campagnes' },
};

export default meta;

export const Simple = {};
export const AvecSousTitre = { args: { subtitle: 'Savane Cosmetics · formule Pro' } };
export const AvecActions = {
  args: { subtitle: '3 campagnes en cours', actions: <button type="button" className="btn sm ghost">Exporter (CSV)</button> },
};
