/**
 * Generador de CSV simple para descargas del demo.
 * No incluye librerías externas — usa Blob + URL.createObjectURL.
 *
 * Las descargas son reales (genera un archivo .csv que el usuario puede abrir en Excel/Numbers),
 * pero los datos vienen de los mocks/store y NO del backend.
 */

function escapeCell(value: string | number | boolean | null | undefined): string {
  if (value === null || value === undefined) return '';
  const str = String(value);
  // Si contiene coma, comillas o salto de línea → envolver en comillas dobles
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Genera un CSV en memoria y dispara la descarga en el navegador.
 *
 * @example
 *   exportarCsv('movimientos-2026-05', ['Fecha', 'Descripción', 'Monto'], [
 *     ['2026-05-01', 'Sueldo mayo', 350000],
 *     ['2026-05-02', 'YPF combustible', 58000],
 *   ]);
 */
export function exportarCsv(
  nombreArchivo: string,
  headers: string[],
  rows: Array<Array<string | number | boolean | null | undefined>>,
): void {
  if (typeof window === 'undefined') return; // safety SSR

  const lines = [headers.map(escapeCell).join(',')];
  for (const row of rows) {
    lines.push(row.map(escapeCell).join(','));
  }
  // BOM UTF-8 para que Excel detecte tildes correctamente
  const csv = '﻿' + lines.join('\r\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = nombreArchivo.endsWith('.csv') ? nombreArchivo : `${nombreArchivo}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
