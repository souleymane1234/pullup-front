import { Floaters, Orbs } from './Decor.jsx';

/** @type {import('@storybook/react-vite').Meta<typeof Orbs>} */
const meta = {
  title: 'UI/Decor',
  component: Orbs,
  tags: ['autodocs'],
};

export default meta;

export const Bandeau = {
  render: () => (
    <section className="vhead" style={{ minHeight: 260 }}>
      <Orbs />
      <Floaters />
      <div className="wrap"><h1>Bandeau décoratif</h1></div>
    </section>
  ),
};
