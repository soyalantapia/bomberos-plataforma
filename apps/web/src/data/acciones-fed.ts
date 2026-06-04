/**
 * Acciones de la Federación sobre un cuartel: comunicados, observaciones,
 * intervenciones, auditorías y objetivos. Es la bitácora que convierte el
 * monitoreo en control real (persiste en el store).
 */

export type TipoAccionFed =
  | 'comunicado'
  | 'observacion'
  | 'intervencion'
  | 'auditoria'
  | 'objetivo';

export type EstadoAccionFed = 'abierta' | 'en_curso' | 'resuelta';

export interface AccionFed {
  id: string;
  cuartelId: string;
  region: string;
  tipo: TipoAccionFed;
  asunto: string;
  detalle?: string;
  fecha: string; // ISO (YYYY-MM-DD)
  autor: string;
  estado: EstadoAccionFed;
}

export const accionesFedMock: AccionFed[] = [
  {
    id: 'af-1',
    cuartelId: 'cuartel-san-isidro',
    region: 'Norte GBA',
    tipo: 'intervencion',
    asunto: 'Cumplimiento en riesgo · plan de regularización',
    detalle: 'Rendición muy por debajo del objetivo. Se asigna mentoría y plazo al 08/06.',
    fecha: '2026-05-22',
    autor: 'Patricia Méndez · Federación',
    estado: 'en_curso',
  },
  {
    id: 'af-2',
    cuartelId: 'cuartel-tres-de-febrero',
    region: 'Norte GBA',
    tipo: 'auditoria',
    asunto: 'Auditoría de gobernanza solicitada',
    detalle: 'Actas y balance pendientes de presentación. Auditoría programada.',
    fecha: '2026-05-20',
    autor: 'Patricia Méndez · Federación',
    estado: 'abierta',
  },
  {
    id: 'af-3',
    cuartelId: 'cuartel-villa-ballester',
    region: 'Norte GBA',
    tipo: 'comunicado',
    asunto: 'Recordatorio: cierre del Fondo 10/06',
    detalle: 'Faltan partes médicos y firmas para llegar al 100% de la rendición.',
    fecha: '2026-05-24',
    autor: 'Patricia Méndez · Federación',
    estado: 'resuelta',
  },
  {
    id: 'af-4',
    cuartelId: 'cuartel-villa-ballester',
    region: 'Norte GBA',
    tipo: 'observacion',
    asunto: 'Móviles con VTV próxima a vencer',
    detalle: 'Coordinar la inspección antes del cierre para no perder cómputo.',
    fecha: '2026-05-25',
    autor: 'Patricia Méndez · Federación',
    estado: 'abierta',
  },
];
