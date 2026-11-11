import { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';

/**
 * Onglet courant stocké dans `?tab=`, borné aux clés autorisées (la première sert de défaut).
 * @param {string[]} keys
 * @returns {[string, (key: string) => void]}
 */
export function useTabParam(keys) {
  const [params, setParams] = useSearchParams();
  const wanted = params.get('tab');
  const tab = wanted && keys.includes(wanted) ? wanted : keys[0];
  const select = useCallback((key) => {
    setParams((current) => {
      const next = new URLSearchParams(current);
      next.set('tab', key);
      return next;
    });
    window.scrollTo({ top: 0 });
  }, [setParams]);
  return [tab, select];
}
