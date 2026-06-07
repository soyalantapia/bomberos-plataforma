/**
 * Snapshot financiero por cuartel para la VISTA FEDERACIÓN (economía de la red).
 * Villa Ballester usa sus datos reales (coinciden con la vista Cuartel); el resto
 * se deriva de forma DETERMINÍSTICA (hash del id, sin Math.random) y correlacionada
 * con el cumplimiento, para que la red tenga números plausibles y estables.
 */

import type { Cuartel } from '@faro/types';

export interface FinanzasCuartel {
  /** ARS en caja (todas las cuentas del cuartel). */
  caja: number;
  subsidioOtorgado: number;
  subsidioEjecutado: number;
  /** % del subsidio ejecutado. */
  ejecucionPct: number;
  /** Días para ejecutar el subsidio más próximo a vencer. */
  diasParaEjecutar: number;
  /** Resultado del mes (+ superávit / − déficit). */
  resultadoMes: number;
  /** Meses de aire (saldo ÷ gasto mensual). */
  mesesAire: number;
  /** % de cuotas sociales en mora. */
  morosidadPct: number;
  /** Semáforo financiero. */
  salud: 'ok' | 'warn' | 'risk';
}

const VB_ID = 'cuartel-villa-ballester';

// FNV-1a → [0,1). Determinístico y estable por string.
function hash01(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 100000) / 100000;
}

const round = (n: number, step: number) => Math.round(n / step) * step;

export function finanzasCuartel(c: Cuartel): FinanzasCuartel {
  // Villa Ballester: datos reales (coinciden con la vista Cuartel).
  if (c.id === VB_ID) {
    return {
      caja: 14_870_000,
      subsidioOtorgado: 45_000_000,
      subsidioEjecutado: 19_100_000,
      ejecucionPct: 42,
      diasParaEjecutar: 16,
      resultadoMes: -1_100_000,
      mesesAire: 3.0,
      morosidadPct: 17,
      salud: 'warn',
    };
  }

  const h = (salt: string) => hash01(c.id + '·' + salt);
  const cumpl = c.cumplimiento; // 'ok' | 'warn' | 'risk'

  // Tamaño del cuartel (cajas más grandes en algunos, más chicas en otros).
  const size = 0.35 + h('size') * 2.3; // 0.35x .. 2.65x

  const caja = round((2_500_000 + h('caja') * 11_000_000) * size, 10_000);
  const subsidioOtorgado = round((4_000_000 + h('sub') * 26_000_000) * size, 100_000);

  // Ejecución correlacionada con el cumplimiento (los flojos ejecutan menos).
  const baseEjec = cumpl === 'ok' ? 80 : cumpl === 'warn' ? 58 : 38;
  const ejecucionPct = Math.min(100, Math.max(8, Math.round(baseEjec + (h('ejec') - 0.5) * 28)));
  const subsidioEjecutado = round((subsidioOtorgado * ejecucionPct) / 100, 10_000);
  const diasParaEjecutar = Math.round(6 + h('dias') * 84);

  // Resultado del mes: tiende a déficit cuando el cumplimiento es bajo.
  const sesgo = cumpl === 'risk' ? 0.72 : cumpl === 'warn' ? 0.46 : 0.24;
  const resultadoMes = round((h('res') - sesgo) * 3_600_000 * size, 10_000);

  // Meses de aire (gasto mensual derivado del tamaño).
  const gastoMensual = Math.max(500_000, (1_300_000 + h('gasto') * 2_400_000) * size);
  const mesesAire = Math.max(0.4, Math.min(9, Math.round((caja / gastoMensual) * 10) / 10));

  const morosidadBase = cumpl === 'risk' ? 26 : cumpl === 'warn' ? 15 : 6;
  const morosidadPct = Math.max(0, Math.round(morosidadBase + (h('mor') - 0.5) * 12));

  let salud: 'ok' | 'warn' | 'risk';
  if (mesesAire < 1.5 || ejecucionPct < 30 || resultadoMes < -1_500_000) salud = 'risk';
  else if (mesesAire < 2.5 || ejecucionPct < 44 || resultadoMes < -700_000) salud = 'warn';
  else salud = 'ok';

  return {
    caja,
    subsidioOtorgado,
    subsidioEjecutado,
    ejecucionPct,
    diasParaEjecutar,
    resultadoMes,
    mesesAire,
    morosidadPct,
    salud,
  };
}

export interface ResumenRed {
  cajaRed: number;
  subsidioOtorgadoRed: number;
  subsidioEjecutadoRed: number;
  porEjecutarRed: number;
  ejecucionPctRed: number;
  cuartelesDeficit: number;
  cuartelesRiesgo: number;
  venceMasPronto: number | null;
}

/** Agrega el snapshot financiero de toda la red. */
export function resumenRed(cuarteles: Cuartel[]): ResumenRed {
  let cajaRed = 0;
  let subsidioOtorgadoRed = 0;
  let subsidioEjecutadoRed = 0;
  let cuartelesDeficit = 0;
  let cuartelesRiesgo = 0;
  let venceMasPronto: number | null = null;

  for (const c of cuarteles) {
    const f = finanzasCuartel(c);
    cajaRed += f.caja;
    subsidioOtorgadoRed += f.subsidioOtorgado;
    subsidioEjecutadoRed += f.subsidioEjecutado;
    if (f.resultadoMes < 0) cuartelesDeficit++;
    if (f.salud === 'risk') cuartelesRiesgo++;
    if (f.subsidioOtorgado - f.subsidioEjecutado > 0) {
      venceMasPronto =
        venceMasPronto === null ? f.diasParaEjecutar : Math.min(venceMasPronto, f.diasParaEjecutar);
    }
  }

  const porEjecutarRed = subsidioOtorgadoRed - subsidioEjecutadoRed;
  const ejecucionPctRed =
    subsidioOtorgadoRed > 0 ? (subsidioEjecutadoRed / subsidioOtorgadoRed) * 100 : 0;

  return {
    cajaRed,
    subsidioOtorgadoRed,
    subsidioEjecutadoRed,
    porEjecutarRed,
    ejecucionPctRed,
    cuartelesDeficit,
    cuartelesRiesgo,
    venceMasPronto,
  };
}
