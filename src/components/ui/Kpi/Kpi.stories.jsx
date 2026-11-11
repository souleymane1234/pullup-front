import { Kpi, KpiGrid } from './Kpi.jsx';

/** @type {import('@storybook/react-vite').Meta<typeof Kpi>} */
const meta = {
  title: 'UI/Kpi',
  component: Kpi,
  tags: ['autodocs'],
  args: { value: '125 000 FCFA', label: 'sous séquestre' },
};

export default meta;

export const Unique = {};
export const Grille = {
  render: () => (
    <KpiGrid>
      <Kpi value="3" label="campagnes en cours" />
      <Kpi value="96 K" label="vues générées" />
      <Kpi value="1 240" label="clics UTM" />
    </KpiGrid>
  ),
};
