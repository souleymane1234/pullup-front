import { create } from 'zustand';

export const useToastStore = create((set, get) => ({
  toasts: /** @type {{ id: number, message: string }[]} */ ([]),
  push: (message) => {
    const id = Date.now() + Math.random();
    set({ toasts: [...get().toasts.slice(-2), { id, message }] });
    window.setTimeout(() => get().dismiss(id), 2800);
  },
  dismiss: (id) => set({ toasts: get().toasts.filter((toast) => toast.id !== id) }),
}));

/** @param {string} message */
export const toast = (message) => useToastStore.getState().push(message);
