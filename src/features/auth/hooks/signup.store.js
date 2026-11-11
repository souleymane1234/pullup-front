import { create } from 'zustand';

const EMPTY = {
  step: 1,
  photo: /** @type {string|null} */ (null),
  name: '',
  handle: '',
  email: '',
  password: '',
  phone: '',
  city: 'Abidjan',
  nets: { ig: '', tt: '', fb: '', sc: '' },
  cats: /** @type {string[]} */ ([]),
  pub: true,
  part: true,
  ded: false,
  price: '',
  promo: '',
  cgu: false,
};

/** Brouillon d'inscription influenceur, conservé pendant la navigation. */
export const useSignupDraft = create((set) => ({
  ...EMPTY,
  update: (patch) => set(patch),
  reset: () => set(EMPTY),
}));
