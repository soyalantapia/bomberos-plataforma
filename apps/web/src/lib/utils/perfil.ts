import type { Perfil } from '@faro/types';

export const perfilLabel: Record<Perfil, string> = {
  bombero: 'Bombero',
  mando: 'Mando del cuartel',
  administrativo: 'Cuartel',
  gobierno: 'Gobierno interno',
  federacion: 'Federación',
};
export const perfilDescription: Record<Perfil, string> = {
  bombero: 'Protocolos operativos, guardias y tu legajo — en tu bolsillo.',
  mando: 'Supervisión, decisiones y cumplimiento del cuartel.',
  administrativo: 'La gestión de tu cuartel: caja, movimientos, cuotas, presupuesto y rendición.',
  gobierno: 'Orden Interno, Ética, Género · acceso sensible.',
  federacion: 'Visión multi-cuartel y cumplimiento regional.',
};
// FASE 1 — VULCANO FINANZAS: todos los caminos llevan a Finanzas (corrala
// sesiones viejas). Backlog (otra etapa): cada perfil a su home propio →
//   bombero:/bombero · mando:/mando · administrativo:/administrativo
//   gobierno:/gobierno · federacion:/federacion
export const perfilHomePath: Record<Perfil, string> = {
  bombero: '/bombero/protocolos', // próximo lanzamiento (fuera del selector, sigue por URL)
  mando: '/mando/finanzas',
  administrativo: '/mando/finanzas', // Cuartel (vista por defecto)
  gobierno: '/mando/finanzas',
  federacion: '/federacion',
};
