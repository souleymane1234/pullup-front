/**
 * Variables Vite publiques. Le frontend ne contient aucun secret.
 */
export const env = {
  apiUrl: import.meta.env.VITE_API_URL || '',
  vitalsEndpoint: import.meta.env.VITE_VITALS_ENDPOINT || '',
};
