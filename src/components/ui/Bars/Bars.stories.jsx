import { Bars } from './Bars.jsx';

/** @type {import('@storybook/react-vite').Meta<typeof Bars>} */
const meta = {
  title: 'UI/Bars',
  component: Bars,
  tags: ['autodocs'],
  args: {
    items: [
      { label: 'Abidjan', value: 64 },
      { label: 'Bouaké', value: 8 },
      { label: 'Yamoussoukro', value: 6 },
      { label: 'Autres', value: 22 },
    ],
  },
};

export default meta;

export const Audience = {};
