/**
 * En-tête commun des sections d'un tableau de bord : même hauteur et mêmes marges sur tous les onglets.
 * @param {{ title: import('react').ReactNode, subtitle?: import('react').ReactNode, actions?: import('react').ReactNode }} props
 */
export function DashHeader({ title, subtitle = null, actions = null }) {
  return (
    <header className="dash-head">
      <div className="dash-head-text">
        <h2>{title}</h2>
        {subtitle ? <p>{subtitle}</p> : null}
      </div>
      {actions ? <div className="dash-head-actions">{actions}</div> : null}
    </header>
  );
}
