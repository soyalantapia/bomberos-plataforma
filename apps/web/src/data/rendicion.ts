import type { Rendicion } from '@faro/types';
import { CUARTEL_PRINCIPAL_ID } from './cuarteles';

/** Histórico de rendiciones presentadas en meses anteriores (referencia para la pantalla Mando · Rendición). */
export interface RendicionHistorica {
  periodo: string;
  pct: number;
  estado: string;
  fecha: string;
  por: string;
  cuartelId: string;
}

export const rendicionesHistoricasMock: RendicionHistorica[] = [
  {
    periodo: '2026-04',
    pct: 100,
    estado: 'Presentada',
    fecha: '2026-05-08',
    por: 'Mariana P.',
    cuartelId: CUARTEL_PRINCIPAL_ID,
  },
  {
    periodo: '2026-03',
    pct: 100,
    estado: 'Presentada',
    fecha: '2026-04-08',
    por: 'Roberto G.',
    cuartelId: CUARTEL_PRINCIPAL_ID,
  },
  {
    periodo: '2026-02',
    pct: 95,
    estado: 'Presentada · con observación',
    fecha: '2026-03-08',
    por: 'Roberto G.',
    cuartelId: CUARTEL_PRINCIPAL_ID,
  },
  {
    periodo: '2026-01',
    pct: 100,
    estado: 'Presentada',
    fecha: '2026-02-07',
    por: 'Roberto G.',
    cuartelId: CUARTEL_PRINCIPAL_ID,
  },
  {
    periodo: '2025-12',
    pct: 100,
    estado: 'Presentada',
    fecha: '2026-01-08',
    por: 'Roberto G.',
    cuartelId: CUARTEL_PRINCIPAL_ID,
  },
];

export const rendicionMayoMock: Rendicion = {
  id: 'rend-2026-05',
  cuartelId: CUARTEL_PRINCIPAL_ID,
  periodo: '2026-05',
  estado: 'borrador',
  porcentaje: 78,
  requisitos: [
    {
      id: 'req-servicios',
      titulo: 'Servicios del mes cargados',
      descripcion: '10 servicios registrados — 2 pendientes de validación del Mando.',
      completo: false,
      avance: 80,
      linkPagina: '/mando/operaciones',
      importanciaTexto: 'El Fondo audita los servicios para liquidar el subsidio mensual.',
    },
    {
      id: 'req-nomina',
      titulo: 'Nómina actualizada',
      descripcion: '17 personas activas + 1 en licencia, todas con datos al día.',
      completo: true,
      avance: 100,
      importanciaTexto:
        'La nómina firme garantiza que el cálculo de horas y el cómputo sean válidos.',
    },
    {
      id: 'req-partes-medicos',
      titulo: 'Partes médicos vigentes',
      descripcion: '1 parte médico vence en 7 días (Federico Ruiz).',
      completo: false,
      avance: 95,
      linkPagina: '/administrativo',
      importanciaTexto: 'Sin aptitud médica vigente, las horas no se computan al subsidio.',
    },
    {
      id: 'req-computo',
      titulo: 'Cómputo mensual cerrado',
      descripcion: 'Cómputo calculado y conciliado.',
      completo: true,
      avance: 100,
      linkPagina: '/mando/computo',
      importanciaTexto: 'Documento principal que rinde horas al Fondo.',
    },
    {
      id: 'req-firmas',
      titulo: 'Firmas digitales del jefe',
      descripcion: 'Firma del Comandante pendiente.',
      completo: false,
      avance: 0,
      importanciaTexto: 'Sin la firma del Comandante el paquete no se considera presentado.',
    },
  ],
};
