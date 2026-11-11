import { Vault } from './Vault.jsx';

/** @type {import('@storybook/react-vite').Meta<typeof Vault>} */
const meta = {
  title: 'UI/Vault',
  component: Vault,
  tags: ['autodocs'],
  args: {
    title: 'Montant mis sous séquestre',
    amount: '90 000 FCFA',
    lines: [
      { label: 'Post + carrousel · Instagram', value: '90 000 FCFA' },
      { label: 'Reversé à Ama à la validation', value: '76 500 FCFA' },
      { label: 'Commission PULLUP (15 %)', value: '13 500 FCFA' },
    ],
  },
};

export default meta;

export const Sequestre = {};
