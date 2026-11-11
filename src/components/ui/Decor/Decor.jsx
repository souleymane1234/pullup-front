import { Icon } from '@/components/ui/Icon/Icon.jsx';

/** Halo de couleurs en arrière-plan des bandeaux. */
export function Orbs() {
  return <div className="orbs" aria-hidden="true"><i /><i /><i /></div>;
}

const FLOATING = ['ig', 'tt', 'heartFill', 'fb', 'play', 'coin', 'sc', 'star', 'chat', 'ig', 'tt', 'heartFill', 'play', 'sc'];

/** Pictogrammes flottants du bandeau d'accueil (positions déterministes, animation coupée par `prefers-reduced-motion`). */
export function Floaters() {
  return (
    <div className="floaters" aria-hidden="true">
      {FLOATING.map((name, n) => {
        const style = {
          '--x': `${(n * 37 + 11) % 92}%`,
          '--y': `${(n * 29 + 7) % 90}%`,
          '--s': `${34 + ((n * 13) % 5) * 9}px`,
          '--d': `${26 + ((n * 7) % 5) * 6}s`,
          '--dl': `${-((n * 53) % 40)}s`,
          '--r': `${(n % 2 ? 1 : -1) * (10 + n * 3)}deg`,
        };
        return <span key={n} className="fl" style={style}><i><Icon name={name} /></i></span>;
      })}
    </div>
  );
}
