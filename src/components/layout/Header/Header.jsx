import { NavLink } from 'react-router-dom';

/**
 * @param {{
 *   brand: import('react').ReactNode,
 *   items: { to: string, label: import('react').ReactNode, end?: boolean }[],
 *   actions?: import('react').ReactNode,
 *   label: string,
 * }} props
 */
export function Header({ brand, items, actions = null, label }) {
  return (
    <header className="top">
      <div className="wrap">
        {brand}
        <nav className="nav" aria-label={label}>
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => (isActive ? 'on' : undefined)}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="top-actions" style={{ marginLeft: 'auto' }}>{actions}</div>
      </div>
    </header>
  );
}
