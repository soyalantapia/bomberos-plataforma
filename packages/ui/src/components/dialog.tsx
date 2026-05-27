'use client';

import { X } from 'lucide-react';
import { useEffect, useId, useRef } from 'react';

import { cn } from '../lib/cn';

type DialogSize = 'sm' | 'md' | 'lg' | 'xl';

const SIZE_MAX_W: Record<DialogSize, string> = {
  sm: 'sm:max-w-md',
  md: 'sm:max-w-lg',
  lg: 'sm:max-w-2xl',
  xl: 'sm:max-w-4xl',
};

export function Dialog({
  open,
  onClose,
  children,
  title,
  description,
  size = 'md',
  footer,
  className,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  description?: string;
  /** Ancho del modal: sm=400, md=520, lg=680, xl=900 */
  size?: DialogSize;
  /** Footer sticky inferior (botones de acción) */
  footer?: React.ReactNode;
  className?: string;
}) {
  const titleId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;

    // Guardar foco previo y mover foco al dialog
    previousFocusRef.current = document.activeElement as HTMLElement | null;
    const container = containerRef.current;
    if (container) {
      // Foco al primer elemento enfocable o al container
      const focusables = container.querySelectorAll<HTMLElement>(
        'a, button, input, textarea, select, [tabindex]:not([tabindex="-1"])',
      );
      const first = focusables[0];
      if (first) first.focus();
      else container.focus();
    }

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
        return;
      }
      // Focus trap básico con Tab
      if (e.key === 'Tab' && container) {
        const focusables = Array.from(
          container.querySelectorAll<HTMLElement>(
            'a, button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
          ),
        ).filter((el) => el.offsetParent !== null);
        if (focusables.length === 0) return;
        const first = focusables[0]!;
        const last = focusables[focusables.length - 1]!;
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
      // Restaurar foco al cerrar
      previousFocusRef.current?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? titleId : undefined}
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4"
    >
      {/* Backdrop (oculto para screen readers, clic cierra) */}
      <div
        aria-hidden="true"
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
      />

      {/* Sheet/modal container */}
      <div
        ref={containerRef}
        tabIndex={-1}
        className={cn(
          'relative flex max-h-[95vh] w-full flex-col overflow-hidden bg-white shadow-2xl focus:outline-none',
          // Mobile: sheet desde abajo con esquinas redondeadas arriba
          'rounded-t-3xl',
          // Desktop: card centrado con todas las esquinas redondeadas
          'sm:max-h-[90vh] sm:rounded-3xl',
          SIZE_MAX_W[size],
          className,
        )}
      >
        {/* Header sticky */}
        {(title || description) && (
          <div className="shrink-0 border-b border-slate-100 px-6 py-5 pr-14">
            {title && (
              <h2 id={titleId} className="text-lg font-bold tracking-tight text-slate-900">
                {title}
              </h2>
            )}
            {description && (
              <p className="mt-1 text-sm leading-relaxed text-slate-600">{description}</p>
            )}
          </div>
        )}

        {/* Botón cerrar */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar"
          className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
        >
          <X size={18} />
        </button>

        {/* Contenido scrolleable */}
        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">{children}</div>

        {/* Footer sticky */}
        {footer && (
          <div className="shrink-0 border-t border-slate-100 bg-slate-50/50 px-6 py-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
