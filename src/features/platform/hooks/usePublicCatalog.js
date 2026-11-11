import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getPublicCatalog, staticPublicCatalog } from '@/services/catalog.service.js';

/** Thématiques, villes, objectifs et types de demande issus de `GET /catalog`. */
export function usePublicCatalog() {
  const fallback = useMemo(() => staticPublicCatalog(), []);
  const query = useQuery({
    queryKey: ['catalog', 'public'],
    queryFn: getPublicCatalog,
    staleTime: 5 * 60 * 1000,
    placeholderData: fallback,
  });
  return query.data ?? fallback;
}
