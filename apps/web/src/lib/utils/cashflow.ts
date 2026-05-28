import type { Caja, CuentaContable, MovimientoFinanciero, PresupuestoAnual } from '@faro/types';

/**
 * Flujo de fondos proyectado. Responde la pregunta del feedback:
 * "¿con qué dinero cuento de acá en adelante?" — proyecta el saldo mes
 * a mes a partir del saldo actual y de los ingresos/egresos esperados,
 * distinguiendo gasto operativo de inversión en bienes de uso, y avisa
 * si la proyección se vuelve negativa (runway).
 */

export interface MesProyeccion {
  mes: string; // YYYY-MM
  label: string; // 'Jun 26'
  ingresos: number;
  gasto: number;
  inversion: number;
  saldoInicial: number;
  saldoFinal: number;
  negativo: boolean;
}

export interface CashFlow {
  saldoHoy: number;
  ingresoMensual: number;
  gastoMensual: number;
  inversionMensual: number;
  /** Neto mensual (ingresos − gasto − inversión). */
  netoMensual: number;
  proyeccion: MesProyeccion[];
  /** Meses hasta quedar en rojo (null si el neto es positivo). */
  runwayMeses: number | null;
}

const MES_CORTO = [
  'Ene',
  'Feb',
  'Mar',
  'Abr',
  'May',
  'Jun',
  'Jul',
  'Ago',
  'Sep',
  'Oct',
  'Nov',
  'Dic',
];

export function calcularCashFlow(
  cajas: Caja[],
  movimientos: MovimientoFinanciero[],
  presupuesto: PresupuestoAnual | undefined,
  cuentas: CuentaContable[],
  opts?: { desde?: Date },
): CashFlow {
  const desde = opts?.desde ?? new Date();
  const saldoHoy = cajas
    .filter((c) => c.moneda === 'ARS' && c.activa)
    .reduce((a, c) => a + c.saldoActual, 0);

  const cuentaById = new Map(cuentas.map((c) => [c.id, c]));

  let ingresoMensual = 0;
  let gastoMensual = 0;
  let inversionMensual = 0;

  if (presupuesto && presupuesto.lineas.length) {
    for (const l of presupuesto.lineas) {
      const cuenta = cuentaById.get(l.cuentaId);
      if (!cuenta) continue;
      const mensual = (l.montoAnual ?? 0) / 12;
      if (cuenta.tipo === 'ingreso') ingresoMensual += mensual;
      else if (cuenta.tipo === 'egreso') {
        if (cuenta.categoria === 'inversion_bienes_uso') inversionMensual += mensual;
        else gastoMensual += mensual;
      }
    }
  } else {
    // Fallback: promedio de los movimientos conciliados.
    const conc = movimientos.filter((m) => m.estado === 'conciliado');
    const ing = conc.filter((m) => m.tipo === 'ingreso').reduce((a, m) => a + m.monto, 0);
    const egr = conc.filter((m) => m.tipo === 'egreso').reduce((a, m) => a + m.monto, 0);
    ingresoMensual = ing / 6;
    gastoMensual = egr / 6;
  }

  const netoMensual = ingresoMensual - gastoMensual - inversionMensual;
  const runwayMeses =
    netoMensual < 0 && saldoHoy > 0 ? Math.floor(saldoHoy / Math.abs(netoMensual)) : null;

  // Proyectamos suficientes meses para mostrar el quiebre (si lo hay).
  const meses = runwayMeses !== null ? Math.min(12, Math.max(6, runwayMeses + 2)) : 6;

  const proyeccion: MesProyeccion[] = [];
  let saldo = saldoHoy;
  for (let i = 1; i <= meses; i++) {
    const d = new Date(desde.getFullYear(), desde.getMonth() + i, 1);
    const mes = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const saldoInicial = saldo;
    const saldoFinal = saldoInicial + ingresoMensual - gastoMensual - inversionMensual;
    proyeccion.push({
      mes,
      label: `${MES_CORTO[d.getMonth()]} ${String(d.getFullYear()).slice(2)}`,
      ingresos: ingresoMensual,
      gasto: gastoMensual,
      inversion: inversionMensual,
      saldoInicial,
      saldoFinal,
      negativo: saldoFinal < 0,
    });
    saldo = saldoFinal;
  }

  return {
    saldoHoy,
    ingresoMensual,
    gastoMensual,
    inversionMensual,
    netoMensual,
    proyeccion,
    runwayMeses,
  };
}
