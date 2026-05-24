import type { Perfil } from '@faro/types';

export const perfilLabel: Record<Perfil, string> = {
  bombero: 'Bombero',
  mando: 'Mando del cuartel',
  administrativo: 'Administrativo',
  gobierno: 'Gobierno interno',
  federacion: 'Federación',
};
export const perfilDescription: Record<Perfil, string> = {
  bombero: 'Registrá lo que pasa en la calle y consultá tu legajo.',
  mando: 'Supervisión, decisiones y cumplimiento del cuartel.',
  administrativo: 'Padrón, materiales, documentos y capacitación.',
  gobierno: 'Orden Interno, Ética, Género · acceso sensible.',
  federacion: 'Visión multi-cuartel y cumplimiento regional.',
};
export const perfilHomePath: Record<Perfil, string> = {
  bombero: '/bombero',
  mando: '/mando',
  administrativo: '/administrativo',
  gobierno: '/gobierno',
  federacion: '/federacion',
};
