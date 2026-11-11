import { Input } from './Input.jsx';

/** @type {import('@storybook/react-vite').Meta<typeof Input>} */
const meta = {
  title: 'UI/Input',
  component: Input,
  tags: ['autodocs'],
  args: { label: 'E-mail', placeholder: 'vous@marque.ci' },
};

export default meta;

export const Vide = {};
export const AvecAide = { args: { hint: 'Nous ne partagerons pas cette adresse.' } };
export const Erreur = { args: { error: 'Saisissez un e-mail valide.', defaultValue: 'pas-un-email' } };
export const Desactive = { args: { disabled: true, defaultValue: 'compte verrouillé' } };
export const ZoneDeTexte = { args: { as: 'textarea', label: 'Message', placeholder: 'Présentez votre projet…' } };
export const Liste = {
  args: { as: 'select', label: 'Réseau', children: [<option key="ig">Instagram</option>, <option key="tt">TikTok</option>] },
};
