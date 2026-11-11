/**
 * Zone de notifications. Le parent fournit les messages.
 * @param {{ toasts?: { id: string|number, message: string }[] }} props
 */
export function ToastViewport({ toasts = [] }) {
  if (!toasts.length) return null;
  return (
    <div className="toast-stack">
      {toasts.map((toast) => (
        <div key={toast.id} className="toast show" role="status">
          {toast.message}
        </div>
      ))}
    </div>
  );
}
