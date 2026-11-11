import { useState } from 'react';
import { ToastViewport } from './Toast.jsx';

function Demo() {
  const [toasts, setToasts] = useState(/** @type {{id:number,message:string}[]} */ ([]));
  return (
    <>
      <button
        type="button"
        onClick={() => setToasts((current) => [...current, { id: Date.now(), message: 'Campagne enregistrée.' }])}
      >
        Afficher un toast
      </button>
      <ToastViewport toasts={toasts} />
    </>
  );
}

/** @type {import('@storybook/react-vite').Meta<typeof Demo>} */
const meta = { title: 'UI/Toast', component: Demo };
export default meta;
export const Message = {};
