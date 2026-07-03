'use client';
// Accessible modal primitive (audit M7).
//
// Replaces the ~22 hand-rolled `fixed inset-0` overlays that had no role="dialog",
// no aria-modal, no focus trap and no Escape handling. Drop-in: render it
// conditionally and pass the dialog body as children; bring your own card sizing
// / padding via `className`.
//
//   {open && (
//     <Modal onClose={() => setOpen(false)} labelledBy="msg-title" className="max-w-md p-5">
//       <h3 id="msg-title">…</h3>
//       …
//     </Modal>
//   )}
//
// Provides: role="dialog" + aria-modal, focus moved into the dialog on open and
// restored on close, Tab/Shift+Tab focus trap, Escape + backdrop-click to close,
// body scroll lock, and prefers-reduced-motion respected for the fade-in.
import { useEffect, useRef } from 'react';

const FOCUSABLE =
  'a[href],button:not([disabled]),textarea:not([disabled]),input:not([disabled]),select:not([disabled]),[tabindex]:not([tabindex="-1"])';

export default function Modal({
  onClose,
  children,
  labelledBy,
  className = 'w-full max-w-md p-5',
}: {
  onClose: () => void;
  children: React.ReactNode;
  /** id of the element that titles the dialog (for aria-labelledby). */
  labelledBy?: string;
  /** sizing / padding for the dialog card (e.g. "max-w-lg p-6"). */
  className?: string;
}) {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prevActive = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const card = cardRef.current;
    // Move focus into the dialog (first focusable, else the card itself).
    const first = card?.querySelector<HTMLElement>(FOCUSABLE);
    (first ?? card)?.focus();

    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
        return;
      }
      if (e.key === 'Tab' && card) {
        const nodes = Array.from(card.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
          (n) => n.offsetParent !== null || n === document.activeElement
        );
        if (nodes.length === 0) {
          e.preventDefault();
          card.focus();
          return;
        }
        const firstN = nodes[0];
        const lastN = nodes[nodes.length - 1];
        if (e.shiftKey && document.activeElement === firstN) {
          e.preventDefault();
          lastN.focus();
        } else if (!e.shiftKey && document.activeElement === lastN) {
          e.preventDefault();
          firstN.focus();
        }
      }
    }

    document.addEventListener('keydown', onKey, true);
    return () => {
      document.removeEventListener('keydown', onKey, true);
      document.body.style.overflow = prevOverflow;
      // Restore focus to whatever opened the modal.
      prevActive?.focus?.();
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 motion-safe:animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={cardRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        className={`bg-surface rounded-2xl shadow-floaty outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${className}`}
      >
        {children}
      </div>
    </div>
  );
}
