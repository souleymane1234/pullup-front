import creator from '@/assets/creator.jpg';
import { Portrait } from './Portrait.jsx';

/** @type {import('@storybook/react-vite').Meta<typeof Portrait>} */
const meta = {
  title: 'UI/Portrait',
  component: Portrait,
  tags: ['autodocs'],
  args: { name: 'Ama Kouassi', hue: 47, verified: true },
  decorators: [(Story) => <div style={{ width: 260 }}><Story /></div>],
};

export default meta;

export const AvecPhoto = { args: { photo: creator } };
export const SansPhoto = {};
export const Carre = { args: { photo: creator, ratio: '1 / 1' } };
export const PleinCadre = {
  args: { photo: creator, fill: true },
  decorators: [(Story) => <div style={{ position: 'relative', width: 260, height: 360 }}><Story /></div>],
};
