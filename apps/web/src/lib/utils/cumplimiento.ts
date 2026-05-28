/**
 * Cálculo de cumplimiento por bombero. Mide la asistencia a las
 * convocatorias obligatorias del cuartel (academias, citaciones, actos
 * oficiales, orden interno) más el estado del certificado médico.
 *
 * Determinístico a partir del id de la persona (mock estable) para que
 * el ranking sea reproducible en la demo.
 */

export interface CumplimientoCategoria {
  id: string;
  label: string;
  asistio: number;
  total: number;
  pct: number;
}

export interface CumplimientoPersona {
  personaId: string;
  categorias: CumplimientoCategoria[];
  /** Promedio global 0–100. */
  global: number;
  /** Certificado de aptitud médica vigente. */
  certificadoMedico: boolean;
}

const CATEGORIAS: { id: string; label: string; total: number }[] = [
  { id: 'academia', label: 'Academias', total: 8 },
  { id: 'citacion', label: 'Citaciones obligatorias', total: 12 },
  { id: 'acto', label: 'Actos oficiales', total: 4 },
  { id: 'orden_interno', label: 'Orden interno', total: 6 },
];

function seed(s: string): number {
  return Array.from(s).reduce((a, c) => a + c.charCodeAt(0), 0);
}

export function calcularCumplimiento(personaId: string): CumplimientoPersona {
  const base = seed(personaId);
  const categorias = CATEGORIAS.map((cat, idx) => {
    const r = (base * (idx + 3) + cat.total * 7) % 100;
    // factor 0.45–1.0 → asistencia
    const factor = 0.45 + (r / 100) * 0.55;
    const asistio = Math.min(cat.total, Math.round(cat.total * factor));
    const pct = Math.round((asistio / cat.total) * 100);
    return { id: cat.id, label: cat.label, asistio, total: cat.total, pct };
  });
  const global = Math.round(categorias.reduce((a, c) => a + c.pct, 0) / categorias.length);
  const certificadoMedico = base % 100 >= 16; // ~16% sin certificado vigente
  return { personaId, categorias, global, certificadoMedico };
}

/** Intent de color según el % de cumplimiento. */
export function intentCumplimiento(pct: number): 'ok' | 'warn' | 'risk' {
  if (pct >= 80) return 'ok';
  if (pct >= 60) return 'warn';
  return 'risk';
}
