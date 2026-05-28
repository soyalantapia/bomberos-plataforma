import type { Jerarquia, Persona } from '@faro/types';

import { calcularCumplimiento } from './cumplimiento';
import { fmtJerarquia, jerarquiaOrden } from './jerarquia';

/**
 * Analítica de equidad de género del cuerpo. Responde el feedback:
 * "quiero ver la composición por género y si las mujeres llegan a los
 * mandos". Lee el sexo del legajo (legajoExtra.sexo del padrón real o el
 * campo sexo del alta demo) y cruza con jerarquía y antigüedad para medir
 * representación, techo de cristal e incorporación reciente.
 */

export type Sexo = 'Masculino' | 'Femenino' | 'X';

/** Jerarquías de conducción (cuadro de oficiales). */
const UMBRAL_CONDUCCION = jerarquiaOrden.oficial; // oficial y superiores

export function sexoDe(p: Persona): Sexo | null {
  const s = p.legajoExtra?.sexo ?? p.sexo;
  return s === 'Masculino' || s === 'Femenino' || s === 'X' ? s : null;
}

export function esConduccion(j: Jerarquia): boolean {
  return jerarquiaOrden[j] >= UMBRAL_CONDUCCION;
}

export interface FilaJerarquia {
  jerarquia: Jerarquia;
  label: string;
  orden: number;
  mujeres: number;
  varones: number;
  otros: number;
  total: number;
  pctMujeres: number;
}

export interface EquidadGenero {
  /** Personas activas con sexo informado. */
  total: number;
  /** Activas sin dato de sexo (calidad del dato). */
  sinDato: number;
  mujeres: number;
  varones: number;
  otros: number;
  pctMujeres: number;
  /** Cuadro de oficiales (conducción). */
  conduccion: number;
  mujeresConduccion: number;
  pctMujeresConduccion: number;
  /** Brecha entre representación general y en conducción (puntos). */
  brechaConduccion: number;
  /** Incorporaciones de los últimos 3 años. */
  ingresosRecientes: number;
  mujeresIngresosRecientes: number;
  pctMujeresIngresosRecientes: number;
  porJerarquia: FilaJerarquia[];
}

const VENTANA_INGRESO_ANIOS = 3;

export function calcularEquidadGenero(personas: Persona[], opts?: { hoy?: Date }): EquidadGenero {
  const hoy = opts?.hoy ?? new Date();
  const activos = personas.filter((p) => p.estado === 'activo');

  let mujeres = 0;
  let varones = 0;
  let otros = 0;
  let sinDato = 0;
  let conduccion = 0;
  let mujeresConduccion = 0;
  let ingresosRecientes = 0;
  let mujeresIngresosRecientes = 0;

  const porJ = new Map<Jerarquia, FilaJerarquia>();
  const cumpleVentana = (iso?: string) => {
    if (!iso) return false;
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return false;
    const anios = (hoy.getTime() - d.getTime()) / (365.25 * 24 * 3600 * 1000);
    return anios <= VENTANA_INGRESO_ANIOS;
  };

  for (const p of activos) {
    const sx = sexoDe(p);
    if (!sx) {
      sinDato++;
      continue;
    }
    if (sx === 'Femenino') mujeres++;
    else if (sx === 'Masculino') varones++;
    else otros++;

    if (esConduccion(p.jerarquia)) {
      conduccion++;
      if (sx === 'Femenino') mujeresConduccion++;
    }

    if (cumpleVentana(p.fechaIngreso)) {
      ingresosRecientes++;
      if (sx === 'Femenino') mujeresIngresosRecientes++;
    }

    const fila =
      porJ.get(p.jerarquia) ??
      ({
        jerarquia: p.jerarquia,
        label: fmtJerarquia(p.jerarquia),
        orden: jerarquiaOrden[p.jerarquia],
        mujeres: 0,
        varones: 0,
        otros: 0,
        total: 0,
        pctMujeres: 0,
      } satisfies FilaJerarquia);
    if (sx === 'Femenino') fila.mujeres++;
    else if (sx === 'Masculino') fila.varones++;
    else fila.otros++;
    fila.total++;
    porJ.set(p.jerarquia, fila);
  }

  const total = mujeres + varones + otros;
  const pct = (n: number, d: number) => (d > 0 ? Math.round((n / d) * 100) : 0);

  const porJerarquia = [...porJ.values()]
    .map((f) => ({ ...f, pctMujeres: pct(f.mujeres, f.total) }))
    .sort((a, b) => b.orden - a.orden);

  const pctMujeres = pct(mujeres, total);
  const pctMujeresConduccion = pct(mujeresConduccion, conduccion);

  return {
    total,
    sinDato,
    mujeres,
    varones,
    otros,
    pctMujeres,
    conduccion,
    mujeresConduccion,
    pctMujeresConduccion,
    brechaConduccion: pctMujeres - pctMujeresConduccion,
    ingresosRecientes,
    mujeresIngresosRecientes,
    pctMujeresIngresosRecientes: pct(mujeresIngresosRecientes, ingresosRecientes),
    porJerarquia,
  };
}

/**
 * Efectividad (cumplimiento) cruzada por género. Responde el punto del
 * feedback: "sacar la estadística del cumplimiento por varones y mujeres
 * para entender que el hombre es más efectivo en algunas cuestiones y la
 * mujer en otras". Promedia la asistencia a las convocatorias obligatorias
 * por sexo, global y por categoría.
 */
export interface EfectividadCategoria {
  id: string;
  label: string;
  mujeres: number;
  varones: number;
  /** Diferencia mujeres − varones (positiva: lideran mujeres). */
  dif: number;
}

export interface EfectividadPorGenero {
  globalMujeres: number;
  globalVarones: number;
  nMujeres: number;
  nVarones: number;
  categorias: EfectividadCategoria[];
  /** Categoría donde las mujeres más superan a los varones (si existe). */
  mejorMujeres: EfectividadCategoria | null;
  /** Categoría donde los varones más superan a las mujeres (si existe). */
  mejorVarones: EfectividadCategoria | null;
}

export function calcularEfectividadPorGenero(personas: Persona[]): EfectividadPorGenero {
  const activos = personas.filter((p) => p.estado === 'activo');

  const catM = new Map<string, { sum: number; n: number; label: string }>();
  const catV = new Map<string, { sum: number; n: number; label: string }>();
  let gM = 0;
  let nM = 0;
  let gV = 0;
  let nV = 0;

  for (const p of activos) {
    const sx = sexoDe(p);
    if (sx !== 'Femenino' && sx !== 'Masculino') continue;
    const c = calcularCumplimiento(p.id);
    const acc = sx === 'Femenino' ? catM : catV;
    if (sx === 'Femenino') {
      gM += c.global;
      nM++;
    } else {
      gV += c.global;
      nV++;
    }
    for (const cat of c.categorias) {
      const e = acc.get(cat.id) ?? { sum: 0, n: 0, label: cat.label };
      e.sum += cat.pct;
      e.n++;
      acc.set(cat.id, e);
    }
  }

  const round = (n: number) => Math.round(n);
  const avg = (e?: { sum: number; n: number }) => (e && e.n ? e.sum / e.n : 0);

  const ids = [...new Set([...catM.keys(), ...catV.keys()])];
  const categorias: EfectividadCategoria[] = ids.map((id) => {
    const m = round(avg(catM.get(id)));
    const v = round(avg(catV.get(id)));
    return {
      id,
      label: catM.get(id)?.label ?? catV.get(id)?.label ?? id,
      mujeres: m,
      varones: v,
      dif: m - v,
    };
  });

  const conDato = nM > 0 && nV > 0 ? categorias : [];
  const mejorMujeres =
    conDato.length > 0 ? conDato.reduce((best, c) => (c.dif > best.dif ? c : best)) : null;
  const mejorVarones =
    conDato.length > 0 ? conDato.reduce((best, c) => (c.dif < best.dif ? c : best)) : null;

  return {
    globalMujeres: round(nM ? gM / nM : 0),
    globalVarones: round(nV ? gV / nV : 0),
    nMujeres: nM,
    nVarones: nV,
    categorias,
    mejorMujeres: mejorMujeres && mejorMujeres.dif > 0 ? mejorMujeres : null,
    mejorVarones: mejorVarones && mejorVarones.dif < 0 ? mejorVarones : null,
  };
}
