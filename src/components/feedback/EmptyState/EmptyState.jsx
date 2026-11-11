/**
 * @param {{ title?: string, text?: string, action?: import('react').ReactNode }} props
 */
export function EmptyState({ title = 'Rien à afficher', text = 'Aucun élément ne correspond à cette vue.', action = null }) {
  return (
    <div className="empty">
      <h2>{title}</h2>
      <p>{text}</p>
      {action}
    </div>
  );
}
