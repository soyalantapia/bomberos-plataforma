import type { Lesion } from '@faro/types';

import { CUARTEL_PRINCIPAL_ID } from './cuarteles';

const C = CUARTEL_PRINCIPAL_ID;

/**
 * Lesiones reportadas en Villa Ballester. Cubre los estados del
 * circuito (reportada / en tratamiento / cerrada) y los casos con y
 * sin atención médica + reporte a ART.
 */
export const lesionesMock: Lesion[] = [
  {
    id: 'les-001',
    cuartelId: C,
    personaId: 'persona-009',
    fecha: '2026-05-27T23:40:00',
    descripcion: 'Torcedura de tobillo al descender de la autobomba en el incendio de Av. Mitre.',
    parteCuerpo: 'Tobillo derecho',
    gravedad: 'moderada',
    requiereAtencion: true,
    derivadoA: 'Hospital Eva Perón (San Martín)',
    art: true,
    reportadoPor: 'persona-002',
    estado: 'en_tratamiento',
  },
  {
    id: 'les-002',
    cuartelId: C,
    personaId: 'persona-005',
    fecha: '2026-05-24T16:10:00',
    descripcion:
      'Corte superficial en la mano manipulando herramienta de corte. Curación en el cuartel.',
    parteCuerpo: 'Mano izquierda',
    gravedad: 'leve',
    requiereAtencion: false,
    art: false,
    reportadoPor: 'persona-005',
    estado: 'cerrada',
  },
  {
    id: 'les-003',
    cuartelId: C,
    personaId: 'persona-011',
    fecha: '2026-05-28T08:20:00',
    descripcion: 'Dolor lumbar al cargar equipamiento pesado en el móvil.',
    parteCuerpo: 'Zona lumbar',
    gravedad: 'leve',
    requiereAtencion: true,
    art: false,
    reportadoPor: 'persona-011',
    estado: 'reportada',
  },
];
