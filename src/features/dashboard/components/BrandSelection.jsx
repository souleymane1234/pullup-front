import { Link } from 'react-router-dom';
import { Avatar } from '@/components/ui/Avatar/Avatar.jsx';
import { Button } from '@/components/ui/Button/Button.jsx';
import { avatarOf, avgEngagement, catLabel, displayPullupScore, minPrice, totalFollowers } from '@/domain/metrics.js';
import { useToggleFavorite } from '@/features/influencers/index.js';
import { cn } from '@/lib/cn.js';
import { formatCompact, formatFcfa, formatPercent, formatScore } from '@/lib/format.js';
import { DashHeader } from '@/components/layout/DashHeader/DashHeader.jsx';

/**
 * Critères comparés. `better` indique le sens de la meilleure valeur ; sans `value`, la ligne est informative.
 * @type {{ group: string, rows: { label: string, hint?: string, value?: (i: any) => number,
 *   show: (i: any) => import('react').ReactNode, better?: 'high'|'low' }[] }[]}
 */
const CRITERIA = [
  {
    group: 'Performance',
    rows: [
      { label: 'Score PULLUP', hint: 'Engagement, authenticité, créativité, respect des briefs et des délais', value: displayPullupScore, show: (i) => `${formatScore(displayPullupScore(i))} / 5`, better: 'high' },
      { label: 'Abonnés cumulés', value: totalFollowers, show: (i) => formatCompact(totalFollowers(i)), better: 'high' },
      { label: 'Engagement moyen', value: avgEngagement, show: (i) => formatPercent(avgEngagement(i)), better: 'high' },
    ],
  },
  {
    group: 'Audience',
    rows: [
      { label: 'Authenticité', hint: 'Part d\'abonnés réels', value: (i) => i.auth, show: (i) => `${i.auth} %`, better: 'high' },
      { label: 'Audience féminine', value: (i) => i.aud.f, show: (i) => `${i.aud.f} %` },
      { label: 'Ville principale', show: (i) => i.aud?.cities?.[0] ? `${i.aud.cities[0][0]} (${i.aud.cities[0][1]} %)` : '—' },
    ],
  },
  {
    group: 'Fiabilité et prix',
    rows: [
      { label: 'Publié à l\'heure', value: (i) => i.onTime, show: (i) => `${i.onTime} %`, better: 'high' },
      { label: 'Avis clients', value: (i) => i.rating, show: (i) => `★ ${String(i.rating).replace('.', ',')} (${i.reviews})`, better: 'high' },
      { label: 'Prix d\'entrée', value: (i) => minPrice(i), show: (i) => formatFcfa(minPrice(i)), better: 'low' },
    ],
  },
];

const ROWS = CRITERIA.flatMap((group) => group.rows);

/** Identifiants des profils en tête sur une ligne (plusieurs en cas d'égalité). */
function leaders(row, profiles) {
  if (!row.better || profiles.length < 2) return [];
  const values = profiles.map((i) => row.value(i));
  const best = row.better === 'high' ? Math.max(...values) : Math.min(...values);
  return profiles.filter((_, k) => values[k] === best).map((i) => i.id);
}

/** Largeur relative de la barre : 100 % pour la meilleure valeur. */
function share(row, profiles, i) {
  const values = profiles.map((p) => row.value(p));
  const value = row.value(i);
  if (row.better === 'low') return (Math.min(...values) / value) * 100;
  const max = Math.max(...values);
  return max ? (value / max) * 100 : 0;
}

/** @param {{ favorites: any[], v2: boolean }} props */
export function BrandSelection({ favorites, v2 }) {
  const toggle = useToggleFavorite();

  if (!favorites.length) {
    return (
      <>
        <DashHeader title="Ma sélection" subtitle="Comparez les profils mis de côté avant de lancer une campagne." />
        <div className="panel empty">
          <h3 className="h4">Votre sélection est vide</h3>
          <p>Touchez le cœur sur une carte d'influenceur pour l'ajouter ici.</p>
          <Link className="btn sm" to="/influenceurs">Parcourir les influenceurs</Link>
        </div>
      </>
    );
  }

  const best = Object.fromEntries(ROWS.map((row) => [row.label, leaders(row, favorites)]));
  const wins = Object.fromEntries(favorites.map((i) => [i.id, ROWS.filter((row) => best[row.label].includes(i.id)).length]));
  const recommended = favorites.length > 1
    ? [...favorites].sort((a, b) => (wins[b.id] - wins[a.id]) || (displayPullupScore(b) - displayPullupScore(a)))[0]
    : null;

  return (
    <>
      <DashHeader
        title="Ma sélection"
        subtitle={`${favorites.length} profil${favorites.length > 1 ? 's' : ''} à comparer. La meilleure valeur de chaque critère est mise en évidence.`}
        actions={<Link className="btn sm ghost" to="/influenceurs">Ajouter des profils</Link>}
      />

      {recommended ? (
        <div className="cmp-reco">
          <Avatar {...avatarOf(recommended)} size={48} />
          <div className="grow">
            <div className="tiny" style={{ fontWeight: 700, letterSpacing: '.04em', textTransform: 'uppercase', opacity: 0.8 }}>Notre recommandation</div>
            <b>{recommended.name}</b> arrive en tête sur {wins[recommended.id]} critère{wins[recommended.id] > 1 ? 's' : ''} sur {ROWS.filter((r) => r.better).length}.
          </div>
          {v2 ? <Link className="btn sm gold" to={`/engager/${recommended.handle}`} state={{ fresh: true }}>Engager {recommended.name.split(' ')[0]}</Link> : null}
        </div>
      ) : null}

      <div className="panel cmp-wrap">
        <table className="cmp2">
          <caption className="sr">Comparaison des profils sélectionnés. La meilleure valeur de chaque critère est signalée par « Meilleur ».</caption>
          <thead>
            <tr>
              <td className="cmp-corner" />
              {favorites.map((i) => (
                <th key={i.id} scope="col" className={cn(recommended?.id === i.id && 'is-reco')}>
                  <div className="cmp-head">
                    {recommended?.id === i.id ? <span className="cmp-ribbon">Recommandé</span> : null}
                    <Avatar {...avatarOf(i)} size={72} />
                    <Link className="cmp-name" to={`/i/${i.handle}`}>{i.name}</Link>
                    <span className="cmp-sub">{i.cats.slice(0, 2).map(catLabel).join(' · ')}</span>
                    <span className="cmp-wins">{wins[i.id]} atout{wins[i.id] > 1 ? 's' : ''}</span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          {CRITERIA.map((group) => (
            <tbody key={group.group}>
              <tr className="cmp-group">
                <th scope="rowgroup" colSpan={favorites.length + 1}>{group.group}</th>
              </tr>
              {group.rows.map((row) => (
                <tr key={row.label}>
                  <th scope="row">
                    {row.label}
                    {row.hint ? <span className="cmp-hint">{row.hint}</span> : null}
                  </th>
                  {favorites.map((i) => {
                    const top = best[row.label].includes(i.id);
                    return (
                      <td key={i.id} className={cn(top && 'is-best', recommended?.id === i.id && 'is-reco')}>
                        <div className="cmp-val">
                          <span>{row.show(i)}</span>
                          {top ? <span className="cmp-best">Meilleur</span> : null}
                        </div>
                        {row.value ? (
                          <span className="cmp-bar" aria-hidden="true"><i style={{ width: `${Math.max(6, share(row, favorites, i))}%` }} /></span>
                        ) : null}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          ))}
          <tfoot>
            <tr>
              <td />
              {favorites.map((i) => (
                <td key={i.id} className={cn(recommended?.id === i.id && 'is-reco')}>
                  <div className="cmp-actions">
                    {v2 ? <Link className="btn sm block" to={`/engager/${i.handle}`} state={{ fresh: true }}>Engager</Link> : null}
                    <Link className="btn sm ghost block" to={`/i/${i.handle}`}>Voir la vitrine</Link>
                    <Button size="sm" variant="ghost" className="cmp-remove" disabled={toggle.isPending} onClick={() => toggle.mutate(i.id)} aria-label={`Retirer ${i.name} de la sélection`}>
                      Retirer
                    </Button>
                  </div>
                </td>
              ))}
            </tr>
          </tfoot>
        </table>
      </div>
    </>
  );
}
