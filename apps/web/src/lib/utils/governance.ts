import type { Cuartel, EstadoSemaforo } from '@faro/types';

/**
 * Lectura de gobernanza institucional por cuartel para la Federación.
 * Responde el feedback: "la Federación necesita leer cómo se gobierna cada
 * cuartel — si el poder está repartido entre presidencia y jefatura, con qué
 * frecuencia se reúne la comisión directiva y si rinde cuentas (actas,
 * balance, elecciones al día)". Se deriva de forma determinista del nivel de
 * rendición de cada cuartel, de modo que la gobernanza acompaña al semáforo
 * de cumplimiento ya existente y permanece estable entre recargas.
 */

export type FrecuenciaReunion = 'semanal' | 'quincenal' | 'mensual' | 'bimestral' | 'irregular';
export type ConcentracionPoder = 'equilibrada' | 'presidencia' | 'jefatura';

export interface Gobernanza {
  cuartelId: string;
  nombre: string;
  ciudad: string;
  region: string;
  frecuencia: FrecuenciaReunion;
  diasUltimaReunion: number;
  actasAlDia: boolean;
  balanceAlDia: boolean;
  eleccionesAlDia: boolean;
  /** Meses para el vencimiento del mandato (negativo = vencido). */
  mandatoMeses: number;
  concentracion: ConcentracionPoder;
  miembrosCD: number;
  /** 0-100, según actas + balance + elecciones al día. */
  transparencia: number;
  riesgo: EstadoSemaforo;
  lectura: string;
}

const FREQ_LABEL: Record<FrecuenciaReunion, string> = {
  semanal: 'Semanal',
  quincenal: 'Quincenal',
  mensual: 'Mensual',
  bimestral: 'Bimestral',
  irregular: 'Irregular',
};

const CONC_LABEL: Record<ConcentracionPoder, string> = {
  equilibrada: 'Poder equilibrado',
  presidencia: 'Concentrado en presidencia',
  jefatura: 'Concentrado en jefatura',
};

export function fmtFrecuencia(f: FrecuenciaReunion): string {
  return FREQ_LABEL[f];
}
export function fmtConcentracion(c: ConcentracionPoder): string {
  return CONC_LABEL[c];
}

function hash(s: string): number {
  let n = 0;
  for (let i = 0; i < s.length; i++) n = (n * 31 + s.charCodeAt(i)) >>> 0;
  return n;
}

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));

export function leerGobernanza(c: Cuartel): Gobernanza {
  const h = hash(c.id);
  const base = c.porcentajeRendicion; // 0-100
  const score = clamp(base + ((h % 25) - 12), 5, 99);

  const actasAlDia = score >= 55;
  const balanceAlDia = score >= 45;
  const eleccionesAlDia = score >= 66 || h % 4 === 0;
  const transparencia = Math.round(
    ((Number(actasAlDia) + Number(balanceAlDia) + Number(eleccionesAlDia)) / 3) * 100,
  );

  const frecuencia: FrecuenciaReunion =
    score >= 80 ? 'quincenal' : score >= 60 ? 'mensual' : score >= 42 ? 'bimestral' : 'irregular';

  const diasBase: Record<FrecuenciaReunion, number> = {
    semanal: 7,
    quincenal: 15,
    mensual: 30,
    bimestral: 60,
    irregular: 95,
  };
  const diasUltimaReunion = diasBase[frecuencia] + (h % 18);

  const mandatoMeses = (h % 28) - 4; // -4..23 ; negativo = vencido

  let concentracion: ConcentracionPoder = 'equilibrada';
  if (score < 45) concentracion = h % 2 === 0 ? 'presidencia' : 'jefatura';
  else if (score < 70 && h % 3 === 0) concentracion = h % 2 === 0 ? 'presidencia' : 'jefatura';

  const miembrosCD = 7 + (h % 6); // 7..12

  // Riesgo institucional combinado.
  let riesgo: EstadoSemaforo = 'ok';
  const mandatoVencido = mandatoMeses < 0;
  const mandatoPorVencer = mandatoMeses >= 0 && mandatoMeses < 4;
  if (
    frecuencia === 'irregular' ||
    mandatoVencido ||
    transparencia < 40 ||
    (concentracion !== 'equilibrada' && transparencia < 67)
  ) {
    riesgo = 'risk';
  } else if (
    frecuencia === 'bimestral' ||
    mandatoPorVencer ||
    transparencia < 67 ||
    concentracion !== 'equilibrada'
  ) {
    riesgo = 'warn';
  }

  // Lectura accionable: el primer problema relevante, o el buen estado.
  let lectura: string;
  if (mandatoVencido) {
    lectura = `Mandato vencido hace ${Math.abs(mandatoMeses)} ${Math.abs(mandatoMeses) === 1 ? 'mes' : 'meses'}: corresponde convocar a elecciones.`;
  } else if (frecuencia === 'irregular') {
    lectura = `La comisión no se reúne con regularidad (última hace ${diasUltimaReunion} días). Sin cadencia de gobierno.`;
  } else if (concentracion !== 'equilibrada') {
    lectura =
      concentracion === 'presidencia'
        ? 'Decisiones concentradas en la presidencia; la jefatura del cuerpo queda subordinada.'
        : 'Decisiones concentradas en la jefatura del cuerpo; la comisión directiva pierde control.';
  } else if (!balanceAlDia) {
    lectura = 'Balance económico sin presentar. Falta rendición de cuentas a la asamblea.';
  } else if (!actasAlDia) {
    lectura = 'Actas de comisión sin asentar al día. Trazabilidad de decisiones incompleta.';
  } else if (mandatoPorVencer) {
    lectura = `Gobierno sano, pero el mandato vence en ${mandatoMeses} ${mandatoMeses === 1 ? 'mes' : 'meses'}: ir preparando el recambio.`;
  } else if (frecuencia === 'bimestral') {
    lectura =
      'Documentación al día y poder equilibrado, pero la comisión se reúne solo cada dos meses: poca cadencia de gobierno.';
  } else {
    lectura = `Gobernanza saludable: poder equilibrado, reunión ${FREQ_LABEL[frecuencia].toLowerCase()} y documentación al día.`;
  }

  return {
    cuartelId: c.id,
    nombre: c.nombre,
    ciudad: c.ciudad,
    region: c.region,
    frecuencia,
    diasUltimaReunion,
    actasAlDia,
    balanceAlDia,
    eleccionesAlDia,
    mandatoMeses,
    concentracion,
    miembrosCD,
    transparencia,
    riesgo,
    lectura,
  };
}

export interface ResumenGobernanza {
  total: number;
  enRegla: number;
  atencion: number;
  enRiesgo: number;
  transparenciaPromedio: number;
  poderConcentrado: number;
  mandatosPorVencer: number;
  sinReunionRegular: number;
}

export function resumenGobernanza(lecturas: Gobernanza[]): ResumenGobernanza {
  const total = lecturas.length || 1;
  const transparenciaPromedio = Math.round(
    lecturas.reduce((a, g) => a + g.transparencia, 0) / total,
  );
  return {
    total: lecturas.length,
    enRegla: lecturas.filter((g) => g.riesgo === 'ok').length,
    atencion: lecturas.filter((g) => g.riesgo === 'warn').length,
    enRiesgo: lecturas.filter((g) => g.riesgo === 'risk').length,
    transparenciaPromedio,
    poderConcentrado: lecturas.filter((g) => g.concentracion !== 'equilibrada').length,
    mandatosPorVencer: lecturas.filter((g) => g.mandatoMeses >= 0 && g.mandatoMeses < 4).length,
    sinReunionRegular: lecturas.filter(
      (g) => g.frecuencia === 'irregular' || g.frecuencia === 'bimestral',
    ).length,
  };
}
