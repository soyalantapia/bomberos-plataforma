'use client';

import { AlertTriangle, Check, ShieldAlert, Trash2 } from 'lucide-react';

import { Button, Dialog, cn } from '@faro/ui';

interface Props {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  titulo: string;
  descripcion: string;
  /** Texto del botón de confirmar (e.g. "Eliminar", "Aprobar") */
  confirmarLabel?: string;
  /** Texto del botón de cancelar */
  cancelarLabel?: string;
  /** Tono visual */
  variant?: 'default' | 'destructive' | 'warning';
  /** Loading state */
  loading?: boolean;
}

const VARIANT_CONFIG = {
  default: {
    icon: <Check size={22} />,
    iconBg: 'bg-brand-100 text-brand-700',
    confirmIntent: 'primary' as const,
  },
  destructive: {
    icon: <Trash2 size={22} />,
    iconBg: 'bg-status-risk-bg text-status-risk-fg',
    confirmIntent: 'danger' as const,
  },
  warning: {
    icon: <AlertTriangle size={22} />,
    iconBg: 'bg-status-warn-bg text-status-warn-fg',
    confirmIntent: 'primary' as const,
  },
};

/**
 * Modal de confirmación reutilizable. Usado para acciones destructivas
 * (eliminar, archivar) o irreversibles (presentar rendición, firmar).
 *
 * @example
 * const [open, setOpen] = useState(false);
 * <ConfirmDialog
 *   open={open}
 *   onClose={() => setOpen(false)}
 *   onConfirm={() => { eliminar(); setOpen(false); }}
 *   titulo="¿Eliminar adjunto?"
 *   descripcion="Esta acción no se puede deshacer. El archivo se borra cifrado."
 *   variant="destructive"
 *   confirmarLabel="Eliminar definitivo"
 * />
 */
export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  titulo,
  descripcion,
  confirmarLabel = 'Confirmar',
  cancelarLabel = 'Cancelar',
  variant = 'default',
  loading = false,
}: Props) {
  const cfg = VARIANT_CONFIG[variant];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      size="sm"
      footer={
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button intent="ghost" onClick={onClose} disabled={loading}>
            {cancelarLabel}
          </Button>
          <Button
            intent={cfg.confirmIntent}
            onClick={onConfirm}
            disabled={loading}
            className={variant === 'destructive' ? 'bg-status-risk hover:bg-status-risk/90' : ''}
          >
            {loading ? 'Procesando...' : confirmarLabel}
          </Button>
        </div>
      }
    >
      <div className="text-center">
        <div className={cn('mx-auto grid h-14 w-14 place-items-center rounded-full', cfg.iconBg)}>
          {variant === 'destructive' ? <ShieldAlert size={22} /> : cfg.icon}
        </div>
        <h3 className="mt-3 text-lg font-bold text-slate-900">{titulo}</h3>
        <p className="mt-1 text-sm text-slate-600">{descripcion}</p>
      </div>
    </Dialog>
  );
}
