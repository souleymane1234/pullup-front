import { Link } from 'react-router-dom';
import { Skeleton } from '@/components/feedback/Skeleton/Skeleton.jsx';
import { Orbs } from '@/components/ui/Decor/Decor.jsx';
import { Icon } from '@/components/ui/Icon/Icon.jsx';
import { PLANS } from '@/domain/catalog.js';
import { useSession } from '@/features/auth/index.js';
import { useFlags } from '@/features/platform/index.js';
import { MatchResult } from '../components/MatchResult.jsx';
import { MatchingForm } from '../components/MatchingForm.jsx';
import { DEFAULT_BRIEF, useMatches, useMatchingStore } from '../hooks/useMatching.js';

function Results({ data, role, canEngage }) {
  const { results, plan } = data;
  const current = plan ?? 'free';
  const visible = results.filter((match) => !match.masked);
  const hidden = results.filter((match) => match.masked);
  return (
    <>
      <div className="row between" style={{ marginBottom: 14 }}>
        <div>
          <h2 className="h3" style={{ margin: 0 }} aria-live="polite">{results.length} profils classés</h2>
          <p className="small muted" style={{ margin: 0 }}>
            Note de compatibilité de 3 à 5 · {results.filter((r) => r.inBudget).length} dans votre budget
          </p>
        </div>
        <span className="pill p-info nodot">Formule {PLANS[current]?.l ?? PLANS.free.l}</span>
      </div>
      {visible.map((match) => (
        <MatchResult key={match.influencer.id} match={match} showPrediction={match.reach != null} canEngage={canEngage} />
      ))}
      {hidden.length ? (
        <div className="upsell" style={{ marginTop: 12 }}>
          <div className="blur">
            {hidden.map((match) => (
              <MatchResult key={match.influencer.id} match={match} showPrediction={false} canEngage={canEngage} hidden />
            ))}
          </div>
          <div className="overlay">
            <div className="panel">
              <h3 className="h4">{results.length - 3} autres profils compatibles</h3>
              <p className="small muted">La formule Découverte affiche les 3 premiers résultats. Passez à Pro pour voir tous les profils et la prédiction de performance.</p>
              {role === 'brand'
                ? <Link className="btn" to="/espace?tab=plan">Passer à Pro</Link>
                : <Link className="btn" to="/connexion">Créer un compte annonceur</Link>}
            </div>
          </div>
        </div>
      ) : null}
      <div className="ai-box" style={{ marginTop: 18 }}>
        <h3 className="h4" style={{ margin: '0 0 6px' }}>
          <Icon name="spark" size={18} style={{ verticalAlign: -3, marginRight: 6 }} />
          Analyse IA approfondie
        </h3>
        <p className="small muted" style={{ margin: 0 }}>
          L'analyse rédigée par l'IA (stratégie, idées de contenu, risques) arrive prochainement. Le classement ci-dessus fonctionne dès maintenant.
        </p>
      </div>
    </>
  );
}

export function MatchingPage() {
  const flags = useFlags();
  const { role, session } = useSession();
  const { brief, submit } = useMatchingStore();
  const { data, isPending, isFetching, isError, error, refetch } = useMatches(brief);

  if (!flags.v3) {
    return (
      <div className="wrap section empty">
        <h1 className="h4">Le matching IA arrive bientôt</h1>
        <p>Cette fonctionnalité fait partie de la V3 de PULLUP.</p>
        <Link className="btn" to="/influenceurs">Parcourir les influenceurs</Link>
      </div>
    );
  }

  const plan = role === 'brand' ? session?.plan ?? 'free' : 'free';
  let output;
  if (!brief) {
    output = (
      <div className="panel empty" style={{ padding: '60px 24px' }}>
        <div style={{ fontSize: '2.6rem' }} aria-hidden="true">✨</div>
        <h2 className="h4">Décrivez votre campagne</h2>
        <p style={{ maxWidth: '44ch', margin: '0 auto' }}>
          Le moteur compare chaque profil vérifié à votre brief : thématique, engagement réel, qualité de l'audience et historique de campagnes. Il prédit ensuite la portée et l'engagement.
        </p>
      </div>
    );
  } else if (isPending) {
    output = <div aria-busy="true"><Skeleton height={140} /><Skeleton height={140} /><Skeleton height={140} /></div>;
  } else if (isError) {
    output = (
      <div className="panel empty">
        <h2 className="h4">Impossible de lancer le matching</h2>
        <p>{error instanceof Error ? error.message : 'Une erreur est survenue.'}</p>
        <button type="button" className="btn ghost sm" onClick={() => refetch()}>Réessayer</button>
      </div>
    );
  } else {
    output = <div aria-busy={isFetching || undefined}><Results data={data} role={role} canEngage={flags.v2} /></div>;
  }

  return (
    <>
      <section className="vhead">
        <Orbs />
        <div className="wrap" style={{ paddingBottom: 46 }}>
          <span className="pill nodot" style={{ background: 'rgba(255,255,255,.18)', color: '#fff' }}>V3 · Matching IA</span>
          <h1 style={{ fontSize: 'clamp(1.9rem,4vw,2.8rem)', maxWidth: '22ch', marginTop: 12 }}>Les influenceurs les plus compatibles avec votre marque</h1>
          <p style={{ opacity: 0.9, margin: 0, maxWidth: '60ch' }}>
            Score sur 4 critères pondérés, prédiction de la portée et recommandations.
            {plan === 'free' ? ' Formule Découverte : 3 résultats visibles.' : ''}
          </p>
        </div>
      </section>
      <div className="wrap" style={{ padding: '26px 20px 60px' }}>
        <div className="mlayout">
          <MatchingForm defaultValues={brief ?? DEFAULT_BRIEF} onSubmit={submit} />
          <div>{output}</div>
        </div>
        <details className="faq" style={{ marginTop: 30 }}>
          <summary>Comment la note de compatibilité est-elle calculée ?</summary>
          <p>Thématique de la campagne (40 %), taux d'engagement sur le réseau choisi (30 %), qualité de l'audience : authenticité, âge, genre et ville (20 %), historique sur PULLUP : notes, ponctualité, volume (10 %). Le score obtenu est ramené sur une échelle de 3 à 5. La portée prédite combine la taille de la communauté, la portée moyenne du réseau et la compatibilité.</p>
        </details>
      </div>
    </>
  );
}
