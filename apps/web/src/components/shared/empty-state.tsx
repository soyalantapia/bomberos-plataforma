'use client';

import { motion } from 'framer-motion';

import { Button, Card, CardContent, cn } from '@faro/ui';

interface Props {
  /** Ícono central */
  icon: React.ReactNode;
  /** Título principal */
  titulo: string;
  /** Descripción amigable */
  descripcion: string;
  /** Acción primaria opcional */
  accion?: {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
  };
  /** Acción secundaria opcional */
  accionSecundaria?: {
    label: string;
    onClick: () => void;
  };
  /** Tono visual */
  variant?: 'default' | 'success' | 'warning' | 'info';
  /** Sin card wrapper (para usar dentro de cards existentes) */
  inline?: boolean;
  className?: string;
}

const VARIANT_CONFIG = {
  default: {
    iconBg: 'bg-slate-100 text-slate-400',
    cardBg: '',
  },
  success: {
    iconBg: 'bg-status-ok-bg text-status-ok-fg',
    cardBg: 'bg-status-ok-bg/30 border-status-ok/20',
  },
  warning: {
    iconBg: 'bg-status-warn-bg text-status-warn-fg',
    cardBg: 'bg-status-warn-bg/30 border-status-warn/20',
  },
  info: {
    iconBg: 'bg-brand-50 text-brand-700',
    cardBg: 'bg-brand-50/30 border-brand-200',
  },
};

/**
 * EmptyState reutilizable · siempre que no haya datos para mostrar.
 *
 * @example
 * <EmptyState
 *   icon={<Users size={28} />}
 *   titulo="Sin personas"
 *   descripcion="Aún no hay personas cargadas. Empezá agregando una nueva."
 *   accion={{ label: 'Nueva persona', icon: <Plus size={14} />, onClick: openModal }}
 * />
 */
export function EmptyState({
  icon,
  titulo,
  descripcion,
  accion,
  accionSecundaria,
  variant = 'default',
  inline = false,
  className,
}: Props) {
  const cfg = VARIANT_CONFIG[variant];
  const content = (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={cn('p-8 text-center', className)}
    >
      <motion.div
        initial={{ scale: 0, rotate: -10 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
        className={cn('mx-auto grid h-14 w-14 place-items-center rounded-full', cfg.iconBg)}
      >
        {icon}
      </motion.div>
      <h3 className="mt-3 font-semibold text-slate-900">{titulo}</h3>
      <p className="mx-auto mt-1 max-w-sm text-sm text-slate-600">{descripcion}</p>
      {(accion || accionSecundaria) && (
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {accion && (
            <Button intent="primary" size="sm" onClick={accion.onClick}>
              {accion.icon}
              {accion.label}
            </Button>
          )}
          {accionSecundaria && (
            <Button intent="ghost" size="sm" onClick={accionSecundaria.onClick}>
              {accionSecundaria.label}
            </Button>
          )}
        </div>
      )}
    </motion.div>
  );

  if (inline) return content;
  return (
    <Card className={cfg.cardBg}>
      <CardContent>{content}</CardContent>
    </Card>
  );
}
