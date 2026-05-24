import { describe, expect, it } from 'vitest';

import type { Asistencia } from '@faro/types';

import { calcularComputoMensual } from '../computo';

describe('calcularComputoMensual', () => {
  const cuartelId = 'cuartel-vb';
  const otrocuartelId = 'cuartel-sm';

  const a = (over: Partial<Asistencia>): Asistencia => ({
    id: 'x',
    cuartelId,
    personaId: 'p1',
    fecha: '2026-05-01',
    tipo: 'accidental',
    horas: 1,
    ...over,
  });

  it('devuelve vacío si no hay asistencias', () => {
    expect(calcularComputoMensual([], cuartelId, '2026-05')).toEqual([]);
  });

  it('suma horas por tipo y total', () => {
    const result = calcularComputoMensual(
      [
        a({ id: '1', tipo: 'accidental', horas: 2 }),
        a({ id: '2', tipo: 'guardia', horas: 12 }),
        a({ id: '3', tipo: 'jefatura', horas: 4, fecha: '2026-05-15' }),
        a({ id: '4', tipo: 'orden_interno', horas: 3 }),
      ],
      cuartelId,
      '2026-05',
    );
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      personaId: 'p1',
      accidental: 2,
      guardia: 12,
      jefatura: 4,
      ordenInterno: 3,
      total: 21,
    });
  });

  it('filtra por cuartel', () => {
    const result = calcularComputoMensual(
      [a({ id: '1', cuartelId: otrocuartelId }), a({ id: '2' })],
      cuartelId,
      '2026-05',
    );
    expect(result).toHaveLength(1);
  });

  it('filtra por mes', () => {
    const result = calcularComputoMensual(
      [
        a({ id: '1', fecha: '2026-04-28' }),
        a({ id: '2', fecha: '2026-05-01' }),
        a({ id: '3', fecha: '2026-06-02' }),
      ],
      cuartelId,
      '2026-05',
    );
    expect(result).toHaveLength(1);
    expect(result[0]?.total).toBe(1);
  });

  it('separa personas distintas', () => {
    const result = calcularComputoMensual(
      [a({ id: '1', personaId: 'p1', horas: 5 }), a({ id: '2', personaId: 'p2', horas: 3 })],
      cuartelId,
      '2026-05',
    );
    expect(result).toHaveLength(2);
    expect(result.find((c) => c.personaId === 'p1')?.total).toBe(5);
    expect(result.find((c) => c.personaId === 'p2')?.total).toBe(3);
  });
});
