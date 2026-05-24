import { describe, expect, it } from 'vitest';

import { fmtFecha, fmtFechaCorta, fmtHora, fmtMesPeriodo, mesActual } from '../date';

describe('date utils', () => {
  it('fmtFecha devuelve "dd mes" abreviado', () => {
    expect(fmtFecha('2026-05-15T10:00:00-03:00')).toBe('15 may');
  });

  it('fmtFechaCorta devuelve dd/mm/yyyy con padding', () => {
    expect(fmtFechaCorta('2026-05-15T10:00:00-03:00')).toBe('15/05/2026');
    expect(fmtFechaCorta('2026-01-03T10:00:00-03:00')).toBe('03/01/2026');
  });

  it('fmtHora pad-cero en HH:MM', () => {
    expect(fmtHora('2026-05-15T09:05:00-03:00')).toBe('09:05');
    expect(fmtHora('2026-05-15T23:59:00-03:00')).toBe('23:59');
  });

  it('fmtMesPeriodo expande "2026-05" a "mayo 2026"', () => {
    expect(fmtMesPeriodo('2026-05')).toBe('mayo 2026');
    expect(fmtMesPeriodo('2026-12')).toBe('diciembre 2026');
  });

  it('mesActual devuelve formato YYYY-MM', () => {
    const m = mesActual();
    expect(m).toMatch(/^\d{4}-\d{2}$/);
  });
});
