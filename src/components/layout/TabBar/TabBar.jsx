import { NavLink } from 'react-router-dom';

/**
 * Barre d'onglets mobile.
 * @param {{ items: { to: string, label: string, icon?: import('react').ReactNode, end?: boolean }[], label: string }} props
 */
export function TabBar({ items, label }) {
  return (
    <nav className="tabbar" aria-label={label}>
      {items.map((item) => (
        <NavLink key={`${item.to}-${item.label}`} to={item.to} end={item.end} className={({ isActive }) => (isActive ? 'on' : undefined)}>
          {item.icon}
          <span>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
