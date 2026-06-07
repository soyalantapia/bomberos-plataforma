/**
 * Selectores derivados para la vista económica de la Federación.
 * Consolidan los subsidios de los 180 cuarteles (data/finanzas-red.ts).
 * SIEMPRE en términos de "ejecutar / por ejecutar / devolver" — nunca "gasto".
 */
import { cuartelesMock } from '../../data/cuarteles';
import { finanzasRedMock, type OrganismoSubsidio, type SubsidioRed } from '../../data/finanzas-red';

const cuartelById = new Map(cuartelesMock.map((c) => [c.id, c]));
/** Ventana nominal de ejecución de un subsidio (~cuatrimestre) para el marcador de plazo. */
const VENTANA_DIAS = 120;

export const ORGANISMO_LABEL: Record<OrganismoSubsidio, string> = {
  nacional: 'Nacional · Ley 25.054',
  provincial: 'Provincial · PBA',
  municipal: 'Municipal',
};
export const ORGANISMO_CORTO: Record<OrganismoSubsidio, string> = {
  nacional: 'Nacional',
  provincial: 'Provincial',
  municipal: 'Municipal',
};

export interface SubsidioConCtx extends SubsidioRed {
  cuartelId: string;
  cuartelNombre: string;
  region: string;
  saldo: number;
}

/** Todos los subsidios de la red, aplanados con contexto de cuartel/región. */
export const subsidiosRed: SubsidioConCtx[] = finanzasRedMock.flatMap((f) => {
  const c = cuartelById.get(f.cuartelId);
  return f.subsidios.map((s) => ({
    ...s,
    cuartelId: f.cuartelId,
    cuartelNombre: c?.nombre ?? f.cuartelId,
    region: c?.region ?? '—',
    saldo: Math.max(0, s.otorgado - s.ejecutado),
  }));
});

export interface AggFin {
  otorgado: number;
  ejecutado: number;
  porEjecutar: number;
  pct: number;
  pctTiempo: number;
  atrasado: boolean;
}

function aggregate(list: SubsidioConCtx[]): AggFin {
  const otorgado = list.reduce((a, s) => a + s.otorgado, 0);
  const ejecutado = list.reduce((a, s) => a + s.ejecutado, 0);
  const porEjecutar = Math.max(0, otorgado - ejecutado);
  const pct = otorgado > 0 ? (ejecutado / otorgado) * 100 : 0;
  const pctTiempo =
    otorgado > 0
      ? (list.reduce(
          (a, s) => a + s.otorgado * Math.min(1, Math.max(0, 1 - s.venceEnDias / VENTANA_DIAS)),
          0,
        ) /
          otorgado) *
        100
      : 0;
  return {
    otorgado,
    ejecutado,
    porEjecutar,
    pct,
    pctTiempo,
    atrasado: pct < pctTiempo - 6 && porEjecutar > 0,
  };
}

export const totalRed: AggFin = aggregate(subsidiosRed);

export const porOrganismo: Record<OrganismoSubsidio, AggFin> = {
  nacional: aggregate(subsidiosRed.filter((s) => s.organismo === 'nacional')),
  provincial: aggregate(subsidiosRed.filter((s) => s.organismo === 'provincial')),
  municipal: aggregate(subsidiosRed.filter((s) => s.organismo === 'municipal')),
};

/** Subsidios con saldo que vencen dentro de `dias`. */
export function enVentana(dias: number): SubsidioConCtx[] {
  return subsidiosRed.filter((s) => s.saldo > 0 && s.venceEnDias >= 0 && s.venceEnDias <= dias);
}
/** Plata que se DEVUELVE si no se ejecuta dentro de `dias`. */
export function plataEnRiesgo(dias: number): number {
  return enVentana(dias).reduce((a, s) => a + s.saldo, 0);
}

export interface CuartelApurar {
  cuartelId: string;
  nombre: string;
  region: string;
  saldoEnRiesgo: number;
  minDias: number;
  nSubsidios: number;
}
/** Cuarteles con subsidios venciendo (≤dias) y poca ejecución: a quién avisarle. */
export function cuartelesApurar(dias = 15): CuartelApurar[] {
  const venc = enVentana(dias).filter((s) => s.ejecutado / Math.max(1, s.otorgado) < 0.6);
  const byCuartel = new Map<string, CuartelApurar>();
  for (const s of venc) {
    const cur =
      byCuartel.get(s.cuartelId) ??
      ({
        cuartelId: s.cuartelId,
        nombre: s.cuartelNombre,
        region: s.region,
        saldoEnRiesgo: 0,
        minDias: 999,
        nSubsidios: 0,
      } satisfies CuartelApurar);
    cur.saldoEnRiesgo += s.saldo;
    cur.minDias = Math.min(cur.minDias, s.venceEnDias);
    cur.nSubsidios += 1;
    byCuartel.set(s.cuartelId, cur);
  }
  return [...byCuartel.values()].sort(
    (a, b) => b.saldoEnRiesgo - a.saldoEnRiesgo || a.minDias - b.minDias,
  );
}

export interface RegionFin {
  region: string;
  otorgado: number;
  ejecutado: number;
  porEjecutar: number;
  pct: number;
  caja: number;
  cuarteles: number;
}
export function rollupPorRegion(): RegionFin[] {
  const map = new Map<string, RegionFin>();
  for (const s of subsidiosRed) {
    const r =
      map.get(s.region) ??
      ({
        region: s.region,
        otorgado: 0,
        ejecutado: 0,
        porEjecutar: 0,
        pct: 0,
        caja: 0,
        cuarteles: 0,
      } satisfies RegionFin);
    r.otorgado += s.otorgado;
    r.ejecutado += s.ejecutado;
    map.set(s.region, r);
  }
  for (const f of finanzasRedMock) {
    const c = cuartelById.get(f.cuartelId);
    if (!c) continue;
    const r = map.get(c.region);
    if (r) {
      r.caja += f.caja;
      r.cuarteles += 1;
    }
  }
  return [...map.values()]
    .map((r) => ({
      ...r,
      porEjecutar: Math.max(0, r.otorgado - r.ejecutado),
      pct: r.otorgado > 0 ? (r.ejecutado / r.otorgado) * 100 : 0,
    }))
    .sort((a, b) => b.porEjecutar - a.porEjecutar);
}

export const cajaTotalRed: number = finanzasRedMock.reduce((a, f) => a + f.caja, 0);

export function ejecucionPctCuartel(cuartelId: string): number {
  const f = finanzasRedMock.find((x) => x.cuartelId === cuartelId);
  if (!f) return 0;
  const ot = f.subsidios.reduce((a, s) => a + s.otorgado, 0);
  const ej = f.subsidios.reduce((a, s) => a + s.ejecutado, 0);
  return ot > 0 ? (ej / ot) * 100 : 0;
}
export function porEjecutarCuartel(cuartelId: string): number {
  const f = finanzasRedMock.find((x) => x.cuartelId === cuartelId);
  if (!f) return 0;
  return f.subsidios.reduce((a, s) => a + Math.max(0, s.otorgado - s.ejecutado), 0);
}

/** Proyección de la red: al ritmo actual, cuánto se ejecuta y cuánto se devuelve. */
export function proyeccionRed() {
  let proyEjec = 0;
  let llegan = 0;
  let noLlegan = 0;
  for (const f of finanzasRedMock) {
    const ot = f.subsidios.reduce((a, s) => a + s.otorgado, 0);
    const ej = f.subsidios.reduce((a, s) => a + s.ejecutado, 0);
    const agg = aggregate(
      f.subsidios.map((s) => ({
        ...s,
        cuartelId: f.cuartelId,
        cuartelNombre: '',
        region: '',
        saldo: Math.max(0, s.otorgado - s.ejecutado),
      })),
    );
    // proyectar ejecución final = ejecutado / %tiempo (cap a otorgado)
    const finalEjec = agg.pctTiempo > 0 ? Math.min(ot, ej / (agg.pctTiempo / 100)) : ej;
    proyEjec += finalEjec;
    if (finalEjec >= ot * 0.97) llegan += 1;
    else noLlegan += 1;
  }
  const proyDevolver = Math.max(0, totalRed.otorgado - proyEjec);
  return { proyEjec, proyDevolver, llegan, noLlegan };
}
