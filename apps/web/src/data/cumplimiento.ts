import type { Calificacion, Fichaje, Reconocimiento } from '@faro/types';

import { CUARTEL_PRINCIPAL_ID } from './cuarteles';

const C = CUARTEL_PRINCIPAL_ID;
const HOY = '2026-05-28';

/**
 * Fichajes de hoy. Incluye gente presente ahora (sin egreso) y casos
 * cerrados con distinta permanencia — el ejemplo del feedback: no es lo
 * mismo el que viene 10 minutos que el que se queda 3 horas.
 */
export const fichajesMock: Fichaje[] = [
  {
    id: 'fich-001',
    cuartelId: C,
    destacamentoId: 'dest-vb-central',
    personaId: 'persona-001',
    ingreso: `${HOY}T07:30:00`,
    egreso: `${HOY}T12:00:00`,
    fuente: 'huella',
    actividad: 'Reunión de jefatura',
  },
  {
    id: 'fich-002',
    cuartelId: C,
    destacamentoId: 'dest-vb-central',
    personaId: 'persona-011',
    ingreso: `${HOY}T06:30:00`,
    fuente: 'huella',
    actividad: 'Mantenimiento de móviles',
  },
  {
    id: 'fich-003',
    cuartelId: C,
    destacamentoId: 'dest-vb-central',
    personaId: 'persona-009',
    ingreso: `${HOY}T07:45:00`,
    fuente: 'app',
    actividad: 'Guardia',
  },
  {
    id: 'fich-004',
    cuartelId: C,
    destacamentoId: 'dest-vb-central',
    personaId: 'persona-005',
    ingreso: `${HOY}T08:00:00`,
    egreso: `${HOY}T08:10:00`,
    fuente: 'huella',
    actividad: 'Pasó a dejar documentación',
  },
  {
    id: 'fich-005',
    cuartelId: C,
    destacamentoId: 'dest-vb-central',
    personaId: 'persona-006',
    ingreso: `${HOY}T09:00:00`,
    egreso: `${HOY}T12:00:00`,
    fuente: 'huella',
    actividad: 'Control de botiquines',
  },
  {
    id: 'fich-006',
    cuartelId: C,
    destacamentoId: 'dest-vb-jls',
    personaId: 'persona-008',
    ingreso: `${HOY}T08:30:00`,
    fuente: 'huella',
    actividad: 'Depósito de materiales',
  },
];

/** Premios y sanciones registrados; quedan en el legajo de cada persona. */
export const reconocimientosMock: Reconocimiento[] = [
  {
    id: 'rec-001',
    cuartelId: C,
    personaId: 'persona-001',
    tipo: 'premio',
    motivo: 'Conducción destacada en el incendio de Av. Mitre.',
    fecha: '2026-05-20',
    otorgadoPor: 'persona-001',
  },
  {
    id: 'rec-002',
    cuartelId: C,
    personaId: 'persona-006',
    tipo: 'premio',
    motivo: 'Mejor asistencia del trimestre.',
    fecha: '2026-05-15',
    otorgadoPor: 'persona-002',
  },
  {
    id: 'rec-003',
    cuartelId: C,
    personaId: 'persona-008',
    tipo: 'sancion',
    motivo: 'Faltó a 2 citaciones obligatorias sin aviso.',
    fecha: '2026-05-18',
    otorgadoPor: 'persona-001',
  },
];

/** Calificaciones del mes en curso. Privadas: cada uno ve sólo la suya. */
export const calificacionesMock: Calificacion[] = [
  {
    id: 'cal-001',
    cuartelId: C,
    personaId: 'persona-001',
    periodo: '2026-05',
    puntaje: 92,
    calificadoPor: 'persona-001',
    fecha: '2026-05-27',
  },
  {
    id: 'cal-002',
    cuartelId: C,
    personaId: 'persona-002',
    periodo: '2026-05',
    puntaje: 88,
    nota: 'Buen manejo operativo. Reforzar carga de partes en tiempo.',
    calificadoPor: 'persona-001',
    fecha: '2026-05-27',
  },
  {
    id: 'cal-004',
    cuartelId: C,
    personaId: 'persona-004',
    periodo: '2026-05',
    puntaje: 79,
    calificadoPor: 'persona-001',
    fecha: '2026-05-27',
  },
  {
    id: 'cal-005',
    cuartelId: C,
    personaId: 'persona-005',
    periodo: '2026-05',
    puntaje: 71,
    calificadoPor: 'persona-001',
    fecha: '2026-05-27',
  },
  {
    id: 'cal-006',
    cuartelId: C,
    personaId: 'persona-006',
    periodo: '2026-05',
    puntaje: 95,
    calificadoPor: 'persona-001',
    fecha: '2026-05-27',
  },
  {
    id: 'cal-009',
    cuartelId: C,
    personaId: 'persona-009',
    periodo: '2026-05',
    puntaje: 64,
    nota: 'Mejorar asistencia a academias.',
    calificadoPor: 'persona-001',
    fecha: '2026-05-27',
  },
  {
    id: 'cal-011',
    cuartelId: C,
    personaId: 'persona-011',
    periodo: '2026-05',
    puntaje: 83,
    calificadoPor: 'persona-001',
    fecha: '2026-05-27',
  },
];
