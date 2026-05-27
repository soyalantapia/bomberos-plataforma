/**
 * Fecha "actual" del demo. TODA la app usa esto en vez de `new Date()` para que
 * los mocks (guardias, asistencias, vencimientos) muestren fechas relativas
 * consistentes sin importar cuándo se mire la demo.
 *
 * En producción real, reemplazar por `() => new Date()`.
 */
export const DEMO_TODAY = new Date('2026-05-25T12:00:00');

export function demoToday(): Date {
  return new Date(DEMO_TODAY);
}

/** Suma días al DEMO_TODAY */
export function demoTodayPlus(days: number): Date {
  const d = new Date(DEMO_TODAY);
  d.setDate(d.getDate() + days);
  return d;
}

/** Resta días al DEMO_TODAY */
export function demoTodayMinus(days: number): Date {
  return demoTodayPlus(-days);
}

/** Inicio de mes del DEMO_TODAY */
export function demoMonthStart(): Date {
  const d = new Date(DEMO_TODAY);
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d;
}
