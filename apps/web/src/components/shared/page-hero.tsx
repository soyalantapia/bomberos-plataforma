'use client';

import { cn } from '@faro/ui';

interface PageHeroProps {
  objetivo: string;
  titulo: string;
  descripcion?: string;
  icono?: React.ReactNode;
  acciones?: React.ReactNode;
  meta?: React.ReactNode;
  variant?: 'default' | 'critical' | 'success';
  className?: string;
}

/**
 * Header rico que sustituye al SectionHeader cuando una página necesita comunicar
 * su objetivo + estado + acciones primarias en un solo bloque.
 */
export function PageHero({
  objetivo,
  titulo,
  descripcion,
  icono,
  acciones,
  meta,
  variant = 'default',
  className,
}: PageHeroProps) {
  const variantClasses = {
    default: 'from-brand-50 to-white border-brand-100',
    critical: 'from-status-risk-bg/40 to-white border-status-risk/20',
    success: 'from-status-ok-bg/40 to-white border-status-ok/20',
  };

  const iconVariant = {
    default: 'bg-brand-600 text-white',
    critical: 'bg-status-risk text-white',
    success: 'bg-status-ok text-white',
  };

  return (
    <div
      className={cn(
        'overflow-hidden rounded-2xl border bg-gradient-to-br p-5 sm:p-6',
        variantClasses[variant],
        className,
      )}
    >
      <div className="flex items-start gap-4">
        {icono && (
          <div
            className={cn(
              'grid h-12 w-12 shrink-0 place-items-center rounded-xl shadow-sm sm:h-14 sm:w-14',
              iconVariant[variant],
            )}
          >
            {icono}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            {objetivo}
          </div>
          <h1 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">{titulo}</h1>
          {descripcion && (
            <p className="mt-1.5 text-sm text-slate-700 sm:text-base">{descripcion}</p>
          )}
        </div>
        {acciones && <div className="hidden shrink-0 gap-2 sm:flex">{acciones}</div>}
      </div>

      {meta && <div className="mt-4">{meta}</div>}

      {acciones && <div className="mt-4 flex flex-wrap gap-2 sm:hidden">{acciones}</div>}
    </div>
  );
}
