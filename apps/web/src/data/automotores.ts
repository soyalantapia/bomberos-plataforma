/**
 * Ficha rica de cada móvil (el "legajo del camión"). Extiende el `Movil` base
 * con capacidades, documentación, telemetría, mantenimientos y conductores.
 * Store-backed: subir foto, registrar carga/mantenimiento y cambiar estado
 * mutan este slice (keyed por movilId).
 */

export type EstadoOperativoMovil = 'en_servicio' | 'fuera_servicio' | 'en_taller';
export type TraccionMovil = '4x2' | '4x4' | '6x4';
export type TipoMantenimiento = 'service' | 'reparacion' | 'vtv' | 'cubiertas' | 'bomba' | 'otro';

export interface MantenimientoMovil {
  id: string;
  fecha: string;
  tipo: TipoMantenimiento;
  detalle: string;
  taller: string;
  km: number;
  costo: number;
}

export interface MovilFicha {
  movilId: string;
  /** Foto real subida por el cuartel (base64). Si falta, se usa la ilustración por tipo. */
  fotoUrl?: string;
  estadoOperativo: EstadoOperativoMovil;
  // Capacidades operativas
  aguaLitros?: number;
  bombaLpm?: number;
  tripulacion: number;
  traccion: TraccionMovil;
  equipamiento: string[];
  // Documentación
  seguroCompania: string;
  seguroPoliza: string;
  seguroVencimiento: string;
  cedulaVencimiento: string;
  rtoVencimiento?: string;
  // Telemetría / estado
  combustiblePct: number;
  aguaPct?: number;
  odometroKm: number;
  proximoServiceKm: number;
  // Conductores habilitados (personaIds)
  conductores: string[];
  // Historial de mantenimiento (más reciente primero)
  mantenimientos: MantenimientoMovil[];
}

export const fichasMovilMock: MovilFicha[] = [
  {
    movilId: 'movil-bv3',
    estadoOperativo: 'en_servicio',
    aguaLitros: 4000,
    bombaLpm: 3000,
    tripulacion: 6,
    traccion: '4x2',
    equipamiento: [
      'Bomba centrífuga 3000 L/min',
      'Tanque espuma AFFF 200 L',
      'Escalera corrediza 7,5 m',
      'Mangotes 2×',
      'Generador + torre de luz',
    ],
    seguroCompania: 'Federación Patronal',
    seguroPoliza: 'FP-9841237',
    seguroVencimiento: '2026-11-30',
    cedulaVencimiento: '2028-03-15',
    rtoVencimiento: '2026-07-12',
    combustiblePct: 85,
    aguaPct: 92,
    odometroKm: 84210,
    proximoServiceKm: 90000,
    conductores: ['persona-001', 'persona-002'],
    mantenimientos: [
      {
        id: 'mant-bv3-1',
        fecha: '2026-04-18',
        tipo: 'service',
        detalle: 'Service completo 80.000 km · aceite, filtros, frenos',
        taller: 'Taller Hermanos Díaz',
        km: 80120,
        costo: 485000,
      },
      {
        id: 'mant-bv3-2',
        fecha: '2026-02-02',
        tipo: 'bomba',
        detalle: 'Prueba de presión y mantenimiento de bomba',
        taller: 'Servicio Oficial',
        km: 76800,
        costo: 142000,
      },
      {
        id: 'mant-bv3-3',
        fecha: '2025-11-10',
        tipo: 'cubiertas',
        detalle: 'Cambio de cubiertas delanteras',
        taller: 'Neumáticos del Oeste',
        km: 71500,
        costo: 380000,
      },
    ],
  },
  {
    movilId: 'movil-bv5',
    estadoOperativo: 'en_servicio',
    tripulacion: 4,
    traccion: '4x2',
    equipamiento: [
      'Equipo de rescate hidráulico (cizalla + separador)',
      'Set de puntales',
      'Camillas y tabla espinal',
      'Grupo electrógeno portátil',
    ],
    seguroCompania: 'Federación Patronal',
    seguroPoliza: 'FP-9841238',
    seguroVencimiento: '2026-09-30',
    cedulaVencimiento: '2027-08-20',
    rtoVencimiento: '2026-06-08',
    combustiblePct: 64,
    odometroKm: 142800,
    proximoServiceKm: 150000,
    conductores: ['persona-002', 'persona-003'],
    mantenimientos: [
      {
        id: 'mant-bv5-1',
        fecha: '2026-03-22',
        tipo: 'reparacion',
        detalle: 'Reparación de sistema hidráulico de rescate',
        taller: 'Servicio Oficial Iveco',
        km: 140200,
        costo: 295000,
      },
      {
        id: 'mant-bv5-2',
        fecha: '2025-12-05',
        tipo: 'service',
        detalle: 'Service 138.000 km',
        taller: 'Taller Hermanos Díaz',
        km: 138400,
        costo: 210000,
      },
    ],
  },
  {
    movilId: 'movil-bv7',
    estadoOperativo: 'en_servicio',
    aguaLitros: 600,
    bombaLpm: 400,
    tripulacion: 4,
    traccion: '4x4',
    equipamiento: [
      'Tanque forestal 600 L',
      'Bomba de impulsión 400 L/min',
      'Batefuegos y herramienta manual',
      'Mochilas de agua 5×',
    ],
    seguroCompania: 'Federación Patronal',
    seguroPoliza: 'FP-9841240',
    seguroVencimiento: '2027-01-20',
    cedulaVencimiento: '2029-02-15',
    rtoVencimiento: '2027-02-15',
    combustiblePct: 78,
    aguaPct: 100,
    odometroKm: 38600,
    proximoServiceKm: 40000,
    conductores: ['persona-001', 'persona-003'],
    mantenimientos: [
      {
        id: 'mant-bv7-1',
        fecha: '2026-01-28',
        tipo: 'service',
        detalle: 'Service 36.000 km · 4x4 revisado',
        taller: 'Toyota Villa Ballester',
        km: 36100,
        costo: 165000,
      },
    ],
  },
];
