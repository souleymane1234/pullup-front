import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Orbs } from '@/components/ui/Decor/Decor.jsx';
import { Skeleton } from '@/components/feedback/Skeleton/Skeleton.jsx';
import { NET } from '@/domain/catalog.js';
import { useFlags, usePublicCatalog } from '@/features/platform/index.js';
import { useDebounce } from '@/hooks/useDebounce.js';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll.js';
import { formatNumber } from '@/lib/format.js';
import { InfluencerCard } from '../components/InfluencerCard.jsx';
import { useDirectory, useInfluencerList } from '../hooks/useInfluencers.js';
import { BUDGETS, FILTER_KEYS, LEVELS, SORTS } from '../schemas/contact.schema.js';

export function ExplorePage() {
  const flags = useFlags();
  const { cats } = usePublicCatalog();
  const [params, setParams] = useSearchParams();
  const filters = useMemo(() => {
    const read = Object.fromEntries(FILTER_KEYS.map((key) => [key, params.get(key) || '']));
    return { ...read, sort: SORTS[read.sort] ? read.sort : 'score' };
  }, [params]);

  const update = useCallback((key, value) => {
    setParams((current) => {
      const next = new URLSearchParams(current);
      if (value) next.set(key, value);
      else next.delete(key);
      return next;
    }, { replace: key === 's' });
  }, [setParams]);

  const [search, setSearch] = useState(filters.s);
  const debounced = useDebounce(search, 300);
  const pushed = useRef(filters.s);
  useEffect(() => {
    if (filters.s !== pushed.current) {
      pushed.current = filters.s;
      setSearch(filters.s);
    }
  }, [filters.s]);
  useEffect(() => {
    if (debounced !== pushed.current) {
      pushed.current = debounced;
      update('s', debounced);
    }
  }, [debounced, update]);

  const { data: directory } = useDirectory();
  const { data, isPending, isError, refetch, hasNextPage, fetchNextPage, isFetchingNextPage } = useInfluencerList(filters);
  const items = useMemo(() => data?.pages.flatMap((page) => page.items) ?? [], [data]);
  const total = data?.pages[0]?.total ?? 0;
  const loadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);
  const sentinel = useInfiniteScroll({ enabled: Boolean(hasNextPage), onLoadMore: loadMore });

  const select = (key) => ({ value: filters[key], onChange: (event) => update(key, event.target.value) });

  return (
    <>
      <section className="vhead">
        <Orbs />
        <div className="wrap" style={{ paddingBottom: 46 }}>
          <h1 style={{ fontSize: 'clamp(1.9rem,4vw,2.8rem)', maxWidth: '20ch' }}>Trouvez l'influenceur qui vous correspond</h1>
          <p style={{ opacity: 0.9, margin: 0 }}>
            {directory ? `${directory.verified} profils vérifiés, classés par thématique et par réseau social.` : 'Profils vérifiés, classés par thématique et par réseau social.'}
          </p>
        </div>
      </section>
      <div className="wrap">
        <form className="filters" role="search" onSubmit={(event) => { event.preventDefault(); update('s', search); }}>
          <input className="inp search" type="search" placeholder="Nom, ville, thématique…" aria-label="Rechercher" value={search} onChange={(event) => setSearch(event.target.value)} />
          <select className="inp" aria-label="Catégorie" {...select('cat')}>
            <option value="">Toutes les catégories</option>
            {Object.entries(cats).map(([key, cat]) => <option key={key} value={key}>{cat.l}</option>)}
          </select>
          <select className="inp" aria-label="Réseau" {...select('net')}>
            <option value="">Tous les réseaux</option>
            {Object.entries(NET).map(([key, net]) => <option key={key} value={key}>{net.l}</option>)}
          </select>
          <select className="inp" aria-label="Type de profil" {...select('badge')}>
            <option value="">Tous les profils</option>
            {Object.entries(LEVELS).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
          </select>
          <select className="inp" aria-label="Budget" {...select('budget')}>
            <option value="">Tout budget</option>
            {BUDGETS.map((value) => <option key={value} value={value}>≤ {formatNumber(Number(value))} FCFA</option>)}
          </select>
          <select className="inp" aria-label="Trier par" {...select('sort')}>
            {Object.entries(SORTS).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
          </select>
        </form>

        <p className="small muted" aria-live="polite">{isPending ? 'Recherche…' : `${total} résultat${total > 1 ? 's' : ''}`}</p>

        {isPending ? (
          <div className="igrid">{[1, 2, 3, 4].map((k) => <Skeleton key={k} height={260} />)}</div>
        ) : null}
        {isError ? (
          <div className="panel empty">
            <h2 className="h4">Impossible de charger l'annuaire</h2>
            <button type="button" className="btn ghost sm" onClick={() => refetch()}>Réessayer</button>
          </div>
        ) : null}
        {!isPending && !isError && !items.length ? (
          <div className="panel empty">
            <h2 className="h4">Aucun profil ne correspond</h2>
            <p>Élargissez le budget ou retirez un filtre.</p>
            <Link className="btn ghost sm" to="/influenceurs">Réinitialiser les filtres</Link>
          </div>
        ) : null}
        {items.length ? (
          <div className="igrid">
            {items.map((influencer) => <InfluencerCard key={influencer.id} influencer={influencer} v2={flags.v2} />)}
          </div>
        ) : null}
        {hasNextPage ? (
          <div ref={sentinel} className="row" style={{ justifyContent: 'center', marginTop: 20 }}>
            <button type="button" className="btn ghost sm" onClick={loadMore} disabled={isFetchingNextPage}>
              {isFetchingNextPage ? 'Chargement…' : 'Afficher plus de profils'}
            </button>
          </div>
        ) : null}

        {flags.v3 ? (
          <div className="panel flat row between" style={{ margin: '30px 0 50px' }}>
            <div>
              <h2 className="h4" style={{ margin: 0 }}>Vous hésitez entre plusieurs profils ?</h2>
              <p className="muted small" style={{ margin: 0 }}>Décrivez votre campagne : le matching IA calcule la compatibilité et prédit la portée.</p>
            </div>
            <Link className="btn" to="/matching">Lancer le matching IA</Link>
          </div>
        ) : <div style={{ height: 50 }} />}
      </div>
    </>
  );
}
