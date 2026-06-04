/**
 * Avisos masivos (broadcasts) enviados por el cuartel. Store-backed: enviar uno
 * crea el registro acá + una notificación real en la campanita del emisor.
 */

export type AudienciaBroadcast =
  | 'todos'
  | 'operativo'
  | 'mando'
  | 'cadetes'
  | 'administrativo'
  | 'custom';

export interface Broadcast {
  id: string;
  cuartelId: string;
  titulo: string;
  cuerpo?: string;
  audiencia: AudienciaBroadcast;
  fecha: string; // ISO
  destinatarios: number;
  leidos: number;
  respondieron: number;
  programadaPara?: string;
}

const C = 'cuartel-villa-ballester';

export const broadcastsMock: Broadcast[] = [
  {
    id: 'bc-1',
    cuartelId: C,
    titulo: 'Curso rescate vehicular · inscripción abierta',
    audiencia: 'operativo',
    fecha: '2026-05-23T10:00:00.000Z',
    destinatarios: 22,
    leidos: 21,
    respondieron: 12,
  },
  {
    id: 'bc-2',
    cuartelId: C,
    titulo: 'Cambio en guardia del sábado',
    audiencia: 'mando',
    fecha: '2026-05-21T18:30:00.000Z',
    destinatarios: 5,
    leidos: 5,
    respondieron: 5,
  },
  {
    id: 'bc-3',
    cuartelId: C,
    titulo: 'Reunión informativa cadetes',
    audiencia: 'cadetes',
    fecha: '2026-05-18T12:00:00.000Z',
    destinatarios: 6,
    leidos: 6,
    respondieron: 4,
  },
  {
    id: 'bc-4',
    cuartelId: C,
    titulo: 'Donación de sangre · Hospital Municipal',
    audiencia: 'todos',
    fecha: '2026-05-17T09:00:00.000Z',
    destinatarios: 38,
    leidos: 34,
    respondieron: 8,
  },
];
