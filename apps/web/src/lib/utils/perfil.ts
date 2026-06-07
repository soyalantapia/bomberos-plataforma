import type { Perfil } from '@faro/types';

export const perfilLabel: Record<Perfil, string> = {
  bombero: 'Bombero',
  mando: 'Mando del cuartel',
  administrativo: 'Administrador del cuartel',
  gobierno: 'Gobierno interno',
  federacion: 'Federación',
};
export const perfilDescription: Record<Perfil, string> = {
  bombero: 'Protocolos operativos, guardias y tu legajo — en tu bolsillo.',
  mando: 'Supervisión, decisiones y cumplimiento del cuartel.',
  administrativo: 'Las finanzas del cuartel en vivo: caja, movimientos, cuotas y presupuesto.',
  gobierno: 'Orden Interno, Ética, Género · acceso sensible.',
  federacion: 'Visión multi-cuartel y cumplimiento regional.',
};
// FASE 1 — VULCANO FINANZAS: todos los caminos llevan a Finanzas (corrala
// sesiones viejas). Backlog (otra etapa): cada perfil a su home propio →
//   bombero:/bombero · mando:/mando · administrativo:/administrativo
//   gobierno:/gobierno · federacion:/federacion
export const perfilHomePath: Record<Perfil, string> = {
  bombero: '/bombero/protocolos',
  mando: '/mando/finanzas',
  administrativo: '/mando/finanzas',
  gobierno: '/mando/finanzas',
  federacion: '/mando/finanzas',
};
