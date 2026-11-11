import { Chip } from './Chip.jsx';

/** @type {import('@storybook/react-vite').Meta<typeof Chip>} */
const meta = {
  title: 'UI/Chip',
  component: Chip,
  tags: ['autodocs'],
  args: { children: 'Engagement' },
};

export default meta;

export const Inactive = {};
export const Selectionnee = { args: { selected: true } };
export const Groupe = {
  render: () => (
    <div className="choice">
      <Chip selected>Notoriété</Chip>
      <Chip>Engagement</Chip>
      <Chip>Trafic</Chip>
    </div>
  ),
};
