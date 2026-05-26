'use client';

import { X } from 'lucide-react';
import { useEffect } from 'react';

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
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4"
    >
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Cerrar"
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
      />

      {/* Sheet/modal container */}
      <div
        className={cn(
          'relative flex max-h-[95vh] w-full flex-col overflow-hidden bg-white shadow-2xl',
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
            {title && <h2 className="text-lg font-bold tracking-tight text-slate-900">{title}</h2>}
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
