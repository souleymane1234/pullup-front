import { Button } from './Button.jsx';

/** @type {import('@storybook/react-vite').Meta<typeof Button>} */
const meta = {
  title: 'UI/Button',
  component: Button,
  tags: ['autodocs'],
  args: { children: 'Se connecter' },
};

export default meta;

export const Primaire = {};
export const Secondaire = { args: { variant: 'ghost', children: 'Annuler' } };
export const Or = { args: { variant: 'gold', children: 'Booster' } };
export const Danger = { args: { variant: 'danger', children: 'Retirer' } };
export const Chargement = { args: { loading: true } };
export const Desactive = { args: { disabled: true, children: 'Indisponible' } };
export const Petit = { args: { size: 'sm', children: 'Filtrer' } };
