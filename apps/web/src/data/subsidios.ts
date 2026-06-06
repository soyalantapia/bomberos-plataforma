/**
 * Subsidios OTORGADOS al cuartel y su plazo de ejecución — el "reloj" que pidió
 * Osvaldo: cuánto te dieron, cuánto ejecutaste y cuántos días te quedan antes de
 * que se venza (lo no ejecutado se rinde mal o se devuelve).
 * Ilustrativo + seeded como el resto del módulo Finanzas.
 */

export type TipoSubsidio = 'nacional' | 'provincial' | 'municipal';

export interface SubsidioOtorgado {
  id: string;
  tipo: TipoSubsidio;
  nombre: string;
  organismo: string;
  periodo: string;
  /** Monto total otorgado para el período. */
  montoOtorgado: number;
  /** Cuánto se ejecutó/rindió hasta hoy. */
  ejecutado: number;
  /** Cuándo entró la plata. */
  fechaCobro: string;
  /** Hasta cuándo hay tiempo de ejecutar/rendir. */
  fechaLimiteEjecucion: string;
  /** Ley 25.054: ≥70% debe ir a sueldos del personal rentado. */
  requiere70Sueldos?: boolean;
}

// Montos y plazos relativos al día de la demo (2026-05-25).
export const subsidiosMock: SubsidioOtorgado[] = [
  {
    id: 'sub-nac',
    tipo: 'nacional',
    nombre: 'Subsidio Nacional Ley 25.054',
    organismo: 'Superintendencia de Seguros de la Nación',
    periodo: '2026 · 1.er semestre',
    montoOtorgado: 30_000_000,
    ejecutado: 9_300_000,
    fechaCobro: '2026-03-10',
    fechaLimiteEjecucion: '2026-06-30',
    requiere70Sueldos: true,
  },
  {
    id: 'sub-prov',
    tipo: 'provincial',
    nombre: 'Subsidio Provincial PBA',
    organismo: 'Ministerio de Seguridad de la Provincia de Buenos Aires',
    periodo: '2026 · 1.er cuatrimestre',
    montoOtorgado: 12_000_000,
    ejecutado: 7_000_000,
    fechaCobro: '2026-02-15',
    fechaLimiteEjecucion: '2026-06-10',
  },
  {
    id: 'sub-mun',
    tipo: 'municipal',
    nombre: 'Aporte Municipal',
    organismo: 'Municipalidad de General San Martín',
    periodo: '2026 · anual',
    montoOtorgado: 3_000_000,
    ejecutado: 2_800_000,
    fechaCobro: '2026-01-20',
    fechaLimiteEjecucion: '2026-08-31',
  },
];
