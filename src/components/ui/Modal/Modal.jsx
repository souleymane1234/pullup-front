import { useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';

const FOCUSABLE = 'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

/**
 * @param {HTMLElement} root
 */
function focusable(root) {
  return [...root.querySelectorAll(FOCUSABLE)].filter((node) => node instanceof HTMLElement && !node.hasAttribute('disabled'));
}

/**
 * Dialogue modal contrôlé. `open` et `onClose` viennent du parent.
 * @param {{ open: boolean, onClose: () => void, title: string, children: import('react').ReactNode }} props
 */
export function Modal({ open, onClose, title, children }) {
  const titleId = useId();
  const panelRef = useRef(null);
  const previous = useRef(/** @type {HTMLElement|null} */ (null));

  useEffect(() => {
    if (!open) return undefined;
    previous.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const panel = panelRef.current;
    const first = panel ? focusable(panel)[0] : null;
    (first ?? panel)?.focus();

    const onKey = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== 'Tab' || !panel) return;
      const items = focusable(panel);
      if (!items.length) {
        event.preventDefault();
        return;
      }
      const firstItem = items[0];
      const lastItem = items[items.length - 1];
      if (event.shiftKey && document.activeElement === firstItem) {
        event.preventDefault();
        lastItem.focus();
      } else if (!event.shiftKey && document.activeElement === lastItem) {
        event.preventDefault();
        firstItem.focus();
      }
    };

    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      previous.current?.focus();
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div className="modal-bg">
      <button type="button" className="modal-dismiss" aria-label="Fermer" onClick={onClose} />
      <div
        ref={panelRef}
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
      >
        <h2 id={titleId}>{title}</h2>
        {children}
      </div>
    </div>,
    document.body,
  );
}

/** @param {{ children: import('react').ReactNode }} props */
function ModalBody({ children }) {
  return <div>{children}</div>;
}

/** @param {{ children: import('react').ReactNode }} props */
function ModalFooter({ children }) {
  return <div className="row" style={{ justifyContent: 'flex-end' }}>{children}</div>;
}

Modal.Body = ModalBody;
Modal.Footer = ModalFooter;
