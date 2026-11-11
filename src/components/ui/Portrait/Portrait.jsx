import { Icon } from '@/components/ui/Icon/Icon.jsx';

/**
 * Photo de couverture d'une carte de profil. Sans photo : initiales sur le dégradé dérivé de `hue`.
 * Décorative : le nom est toujours affiché à côté par le parent.
 * `fill` : occupe tout le parent positionné (le ratio est alors ignoré).
 * @param {{ name: string, hue?: number, photo?: string|null, verified?: boolean, ratio?: string, fill?: boolean,
 *   children?: import('react').ReactNode }} props
 */
export function Portrait({ name, hue = 220, photo = null, verified = false, ratio = '4 / 3', fill = false, children = null }) {
  const initials = name.split(' ').map((word) => word[0]).slice(0, 2).join('').toUpperCase();
  const background = photo
    ? 'var(--surface-2)'
    : `linear-gradient(140deg,hsl(${hue} 62% 46%),hsl(${(hue + 50) % 360} 55% 36%))`;
  return (
    <div className={fill ? 'portrait fill' : 'portrait'} style={{ aspectRatio: fill ? undefined : ratio, background }}>
      {photo
        ? <img src={photo} alt="" loading="lazy" decoding="async" />
        : <span className="portrait-initials" aria-hidden="true">{initials}</span>}
      {verified ? <span className="portrait-vf" title="Profil vérifié"><Icon name="verified" /></span> : null}
      {children}
    </div>
  );
}
