import axios from 'axios';
import { env } from './env.js';

export const http = axios.create({
  baseURL: env.apiUrl,
  timeout: 15000,
  withCredentials: true,
  headers: { Accept: 'application/json' },
});

http.interceptors.response.use(
  (response) => response,
  async (error) => {
    let message = 'Le service est indisponible.';
    const data = error.response?.data;
    if (typeof data?.message === 'string') {
      message = data.message;
    } else if (typeof Blob !== 'undefined' && data instanceof Blob) {
      try {
        const parsed = JSON.parse(await data.text());
        if (typeof parsed.message === 'string') message = parsed.message;
      } catch {
        /* garder le message par défaut */
      }
    }
    const wrapped = new Error(message);
    wrapped.status = error.response?.status;
    return Promise.reject(wrapped);
  },
);
