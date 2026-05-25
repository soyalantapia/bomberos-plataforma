'use client';

import { motion } from 'framer-motion';

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
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        'overflow-hidden rounded-2xl border bg-gradient-to-br p-5 sm:p-6',
        variantClasses[variant],
        className,
      )}
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
        <div className="flex min-w-0 flex-1 items-start gap-4">
          {icono && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, type: 'spring', stiffness: 220, damping: 18 }}
              className={cn(
                'grid h-12 w-12 shrink-0 place-items-center rounded-xl shadow-sm sm:h-14 sm:w-14',
                iconVariant[variant],
              )}
            >
              {icono}
            </motion.div>
          )}
          <div className="min-w-0 flex-1">
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              {objetivo}
            </div>
            <h1 className="mt-1 text-2xl font-bold leading-tight text-slate-900 sm:text-3xl">
              {titulo}
            </h1>
            {descripcion && (
              <p className="mt-1.5 text-sm text-slate-700 sm:text-base">{descripcion}</p>
            )}
          </div>
        </div>
        {acciones && (
          <div className="flex flex-wrap gap-2 lg:shrink-0 lg:justify-end">{acciones}</div>
        )}
      </div>

      {meta && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.3 }}
          className="mt-4"
        >
          {meta}
        </motion.div>
      )}
    </motion.div>
  );
}
