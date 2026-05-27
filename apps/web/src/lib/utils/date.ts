const meses = [
  'enero',
  'febrero',
  'marzo',
  'abril',
  'mayo',
  'junio',
  'julio',
  'agosto',
  'septiembre',
  'octubre',
  'noviembre',
  'diciembre',
];
const mesesAbrev = [
  'ene',
  'feb',
  'mar',
  'abr',
  'may',
  'jun',
  'jul',
  'ago',
  'sep',
  'oct',
  'nov',
  'dic',
];

export function fmtFecha(iso: string): string {
  const d = new Date(iso);
  return `${d.getDate()} ${mesesAbrev[d.getMonth()]}`;
}
export function fmtFechaCorta(iso: string): string {
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
}
export function fmtHora(iso: string): string {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}
export function fmtFechaHora(iso: string): string {
  return `${fmtFecha(iso)} · ${fmtHora(iso)}`;
}
export function fmtMesPeriodo(periodo: string): string {
  const [anio, mes] = periodo.split('-');
  const idx = Number(mes) - 1;
  return `${meses[idx] ?? mes} ${anio}`;
}
export function mesActual(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

/** Devuelve la clave 'YYYY-MM' a partir de una fecha cualquiera (ej: demoToday()) */
export function mesKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

/** Devuelve la clave del mes anterior 'YYYY-MM' a partir de una fecha */
export function mesAnteriorKey(date: Date): string {
  const d = new Date(date.getFullYear(), date.getMonth() - 1, 1);
  return mesKey(d);
}

/** Nombre corto del mes ('mayo', 'abril', ...) a partir de una clave 'YYYY-MM' */
export function nombreMes(periodo: string): string {
  const [, mes] = periodo.split('-');
  return meses[Number(mes) - 1] ?? mes ?? '';
}
