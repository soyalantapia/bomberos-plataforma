import type { Jerarquia } from '@faro/types';

const labels: Record<Jerarquia, string> = {
  cadete: 'Cadete', bombero: 'Bombero', bombero_1ra: 'Bombero 1ra',
  cabo: 'Cabo', sargento: 'Sargento', sargento_ayudante: 'Sargento Ayudante',
  oficial: 'Oficial', sub_comandante: 'Sub-comandante', comandante: 'Comandante', jefe: 'Jefe',
};
export function fmtJerarquia(j: Jerarquia): string { return labels[j]; }
export const jerarquiaOrden: Record<Jerarquia, number> = {
  cadete: 1, bombero: 2, bombero_1ra: 3, cabo: 4, sargento: 5,
  sargento_ayudante: 6, oficial: 7, sub_comandante: 8, comandante: 9, jefe: 10,
};
