'use client';

import { X } from 'lucide-react';
import { useEffect } from 'react';

import { cn } from '../lib/cn';

export function Dialog({
  open,
  onClose,
  children,
  title,
  description,
  className,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  description?: string;
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
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
      <div className={cn('relative bg-white w-full max-w-lg rounded-t-2xl sm:rounded-2xl shadow-xl max-h-[90vh] overflow-y-auto', className)}>
        {(title || description) && (
          <div className="px-5 pt-5 pb-3 border-b border-slate-100">
            {title && <h2 className="text-lg font-semibold text-slate-900">{title}</h2>}
            {description && <p className="text-sm text-slate-600 mt-1">{description}</p>}
          </div>
        )}
        <button type="button" onClick={onClose} className="absolute top-3 right-3 p-2 rounded-full text-slate-500 hover:bg-slate-100" aria-label="Cerrar">
          <X size={20} />
        </button>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}
