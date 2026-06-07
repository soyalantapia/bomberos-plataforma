import type {
  CategoriaEgreso,
  CategoriaIngreso,
  CuentaContable,
  MedioPago,
  MovimientoFinanciero,
  TipoCaja,
} from '@faro/types';

import { demoToday } from '../../lib/utils/demo-today';

/** Formateador de moneda ARS */
export const ars = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  maximumFractionDigits: 0,
});

/** Versión compacta para KPIs (1.2M / 850K) */
export function arsCompact(n: number): string {
  const abs = Math.abs(n);
  const sign = n < 0 ? '-' : '';
  if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `${sign}$${(abs / 1_000).toFixed(0)}K`;
  return `${sign}$${abs.toFixed(0)}`;
}

/** Fecha en formato corto AR */
export function fechaCorta(iso: string): string {
  return new Date(iso).toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
  });
}

export function fechaLarga(iso: string): string {
  return new Date(iso).toLocaleDateString('es-AR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/** Etiqueta amigable para medios de pago */
export const MEDIO_LABEL: Record<MedioPago, string> = {
  efectivo: 'Efectivo',
  transferencia: 'Transferencia',
  cheque: 'Cheque',
  tarjeta_debito: 'Tarjeta débito',
  tarjeta_credito: 'Tarjeta crédito',
  mercadopago: 'MercadoPago',
  debito_automatico: 'Débito automático',
};

export const TIPO_CAJA_LABEL: Record<TipoCaja, string> = {
  caja_chica: 'Caja chica',
  caja_principal: 'Caja principal',
  banco_cc: 'Cuenta corriente',
  banco_ca: 'Caja de ahorro',
  mercadopago: 'MercadoPago',
  plazo_fijo: 'Plazo fijo',
};

export const CATEGORIA_INGRESO_LABEL: Record<CategoriaIngreso, string> = {
  subsidio_nacional: 'Subsidio Nacional (Ley 25.054)',
  subsidio_provincial: 'Subsidio Provincial',
  subsidio_municipal: 'Subsidio Municipal',
  cuota_social: 'Cuotas sociales',
  donacion: 'Donaciones',
  servicio_facturado: 'Servicios facturados',
  rifa_evento: 'Rifas y eventos',
  rendimiento_financiero: 'Rendimientos financieros',
  otro_ingreso: 'Otros ingresos',
};

export const CATEGORIA_EGRESO_LABEL: Record<CategoriaEgreso, string> = {
  personal_rentado: 'Personal rentado',
  combustible: 'Combustible',
  mantenimiento_movil: 'Mantenimiento móviles',
  epp_equipamiento: 'EPP y equipamiento',
  capacitacion: 'Capacitación',
  servicios_publicos: 'Servicios públicos',
  seguros: 'Seguros',
  insumos_medicos: 'Insumos médicos',
  administrativo: 'Administrativo',
  impuestos_tasas: 'Impuestos y tasas',
  inversion_bienes_uso: 'Inversión en bienes',
  otro_egreso: 'Otros egresos',
};

/** Para gráficos: agrupar movimientos por mes */
export function agruparPorMes(
  movs: MovimientoFinanciero[],
  meses: number = 6,
): Array<{ mes: string; ingresos: number; egresos: number; saldo: number }> {
  const hoy = demoToday();
  const resultado: Array<{ mes: string; ingresos: number; egresos: number; saldo: number }> = [];
  for (let i = meses - 1; i >= 0; i--) {
    const d = new Date(hoy.getFullYear(), hoy.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const inMes = movs.filter((m) => m.fecha.startsWith(key) && m.estado === 'conciliado');
    const ingresos = inMes.filter((m) => m.tipo === 'ingreso').reduce((s, m) => s + m.monto, 0);
    const egresos = inMes.filter((m) => m.tipo === 'egreso').reduce((s, m) => s + m.monto, 0);
    resultado.push({
      mes: d.toLocaleDateString('es-AR', { month: 'short' }),
      ingresos,
      egresos,
      saldo: ingresos - egresos,
    });
  }
  return resultado;
}

// ─────────────────────────────────────────────────────────────────────────────
// Selectores derivados compartidos — UNA sola fuente de verdad para métricas que
// antes cada pantalla recalculaba distinto (runway/meses de aire, Ley 25.054).
// ─────────────────────────────────────────────────────────────────────────────

/** Promedio mensual de egresos reales (meses con datos). Base del "meses de aire". */
export function egresoMensualPromedio(movs: MovimientoFinanciero[], meses = 6): number {
  const conDatos = agruparPorMes(movs, meses).filter((s) => s.egresos > 0);
  return conDatos.length ? conDatos.reduce((s, x) => s + x.egresos, 0) / conDatos.length : 0;
}

/** Meses de aire: cuántos meses cubre el saldo al ritmo de gasto real. null si no hay datos. */
export function mesesDeAire(saldoTotal: number, egrPromMensual: number): number | null {
  return egrPromMensual > 0 ? saldoTotal / egrPromMensual : null;
}

/** Semáforo del "meses de aire", consistente en todas las pantallas. */
export function aireIntent(meses: number | null): 'neutral' | 'ok' | 'warn' | 'risk' {
  if (meses === null) return 'neutral';
  return meses >= 6 ? 'ok' : meses >= 3 ? 'warn' : 'risk';
}

/**
 * Ley 25.054: porcentaje del subsidio nacional (cuenta c-4-1-01) aplicado a
 * personal rentado en el mes. Usa TODAS las cuentas categoría 'personal_rentado'
 * (sueldos + cargas sociales) — misma base en Resumen, Acciones y Reportes.
 */
export function calcLey25054(
  movsConciliados: MovimientoFinanciero[],
  cuentas: CuentaContable[],
  mesKey: string,
): { subsidioMes: number; sueldosMes: number; pct: number; cumple: boolean; falta: number } {
  const cuentasPersonal = cuentas
    .filter((c) => c.categoria === 'personal_rentado')
    .map((c) => c.id);
  const sueldosMes = movsConciliados
    .filter(
      (m) =>
        m.tipo === 'egreso' && m.fecha.startsWith(mesKey) && cuentasPersonal.includes(m.cuentaId),
    )
    .reduce((s, m) => s + m.monto, 0);
  const subsidioMes = movsConciliados
    .filter((m) => m.tipo === 'ingreso' && m.fecha.startsWith(mesKey) && m.cuentaId === 'c-4-1-01')
    .reduce((s, m) => s + m.monto, 0);
  const pct = subsidioMes > 0 ? (sueldosMes / subsidioMes) * 100 : 0;
  return {
    subsidioMes,
    sueldosMes,
    pct,
    cumple: subsidioMes === 0 || pct >= 70,
    falta: Math.max(0, subsidioMes * 0.7 - sueldosMes),
  };
}
