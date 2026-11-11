import { env } from '@/lib/env.js';
import { http } from '@/lib/http.js';

/** Sans `VITE_API_URL`, les services répondent depuis la base de démonstration locale. */
export const isRemote = () => Boolean(env.apiUrl);

/**
 * @param {'get'|'post'|'put'|'patch'|'delete'} method
 * @param {string} url
 * @param {object} [payload]
 */
export async function request(method, url, payload) {
  const response = await http.request({
    method,
    url,
    params: method === 'get' ? payload : undefined,
    data: method === 'get' ? undefined : payload,
  });
  return response.data;
}
