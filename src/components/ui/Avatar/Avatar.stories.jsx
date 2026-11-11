import { Avatar } from './Avatar.jsx';

/** @type {import('@storybook/react-vite').Meta<typeof Avatar>} */
const meta = {
  title: 'UI/Avatar',
  component: Avatar,
  tags: ['autodocs'],
  args: { name: 'Ama Kouassi', hue: 47, size: 64 },
};

export default meta;

export const Initiales = {};
export const Verifie = { args: { verified: true } };
export const Petit = { args: { size: 34, name: 'Savane Cosmetics', hue: 20 } };
