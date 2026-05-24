import type { Asistencia } from '@faro/types';
import { serviciosMock } from './servicios';

function deriveFromServicios(): Asistencia[] {
  return serviciosMock.flatMap((s) => {
    const fecha = s.horaSalida.slice(0, 10);
    const horas = Math.round((new Date(s.horaRegreso).getTime() - new Date(s.horaSalida).getTime()) / 36e5);
    return s.dotacionIds.map<Asistencia>((pid, idx) => ({
      id: `asist-${s.id}-${idx}`,
      cuartelId: s.cuartelId,
      personaId: pid,
      fecha,
      tipo: 'accidental',
      horas: Math.max(1, horas),
      servicioId: s.id,
    }));
  });
}

export const asistenciasMock: Asistencia[] = [
  ...deriveFromServicios(),
  { id: 'asist-g-001', cuartelId: 'cuartel-villa-ballester', personaId: 'persona-006', fecha: '2026-05-02', tipo: 'guardia', horas: 12 },
  { id: 'asist-g-002', cuartelId: 'cuartel-villa-ballester', personaId: 'persona-009', fecha: '2026-05-04', tipo: 'guardia', horas: 12 },
  { id: 'asist-g-003', cuartelId: 'cuartel-villa-ballester', personaId: 'persona-008', fecha: '2026-05-11', tipo: 'guardia', horas: 12 },
  { id: 'asist-oi-001', cuartelId: 'cuartel-villa-ballester', personaId: 'persona-010', fecha: '2026-05-06', tipo: 'orden_interno', horas: 4 },
  { id: 'asist-oi-002', cuartelId: 'cuartel-villa-ballester', personaId: 'persona-001', fecha: '2026-05-13', tipo: 'jefatura', horas: 6 },
];
