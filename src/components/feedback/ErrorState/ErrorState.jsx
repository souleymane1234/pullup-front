/**
 * @param {{ title?: string, text?: string, onRetry?: () => void }} props
 */
export function ErrorState({
  title = 'Impossible de charger',
  text = 'La requête n\'a pas abouti.',
  onRetry,
}) {
  return (
    <div className="empty" role="alert">
      <h2>{title}</h2>
      <p>{text}</p>
      {onRetry ? <button type="button" className="btn" onClick={onRetry}>Réessayer</button> : null}
    </div>
  );
}
