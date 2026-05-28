import type { BadgeProps } from '@faro/ui';

import type { EstadoTarea, PrioridadTarea } from '@faro/types';

type Intent = BadgeProps['intent'];

export const ESTADO_TAREA: Record<EstadoTarea, { label: string; intent: Intent }> = {
  asignada: { label: 'Asignada', intent: 'neutral' },
  en_progreso: { label: 'En progreso', intent: 'brand' },
  hecha: { label: 'Hecha · a validar', intent: 'warn' },
  bloqueada: { label: 'Bloqueada', intent: 'risk' },
  validada: { label: 'Validada', intent: 'ok' },
  reabierta: { label: 'Reabierta', intent: 'warn' },
};

export const PRIORIDAD_TAREA: Record<PrioridadTarea, { label: string; intent: Intent }> = {
  alta: { label: 'Alta', intent: 'risk' },
  media: { label: 'Media', intent: 'warn' },
  baja: { label: 'Baja', intent: 'neutral' },
};

/** Formatea fecha corta dd/mm. */
export function fechaCorta(iso?: string): string {
  if (!iso) return '—';
  const [y, m, d] = iso.slice(0, 10).split('-');
  if (!y || !m || !d) return iso;
  return `${d}/${m}`;
}

/** ¿La tarea está vencida (pasó el límite y no está cerrada)? */
export function estaVencida(
  vencimiento: string | undefined,
  estado: EstadoTarea,
  hoy: Date,
): boolean {
  if (!vencimiento) return false;
  if (estado === 'validada') return false;
  return vencimiento.slice(0, 10) < hoy.toISOString().slice(0, 10);
}
