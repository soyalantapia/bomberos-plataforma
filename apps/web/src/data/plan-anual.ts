/**
 * Plan del año del cuartel — lo que el jefe/administrador presenta a la Comisión
 * Directiva ~2 meses antes (objetivos + inversiones). In-memory + seeded como el
 * resto del módulo Finanzas (se resetea al recargar).
 */

export interface ObjetivoPlan {
  id: string;
  texto: string;
  cumplido: boolean;
}

export interface InversionPlan {
  id: string;
  concepto: string;
  monto: number;
  /** Trimestre tentativo de ejecución (1-4). */
  trimestre: 1 | 2 | 3 | 4;
}

export interface LineaPlan {
  id: string;
  concepto: string;
  monto: number;
}

export interface PlanAnual {
  anio: number;
  estado: 'borrador' | 'presentado' | 'aprobado';
  objetivos: ObjetivoPlan[];
  inversiones: InversionPlan[];
  /** Ingresos esperados del año, por fuente. */
  ingresos: LineaPlan[];
  /** Egresos operativos planeados del año, por categoría. */
  egresos: LineaPlan[];
}

export const planAnualMock: PlanAnual = {
  anio: 2027,
  estado: 'borrador',
  objetivos: [
    {
      id: 'obj-1',
      texto: 'Renovar la autobomba BV-2 (modelo 2008, alto costo de mantenimiento)',
      cumplido: false,
    },
    {
      id: 'obj-2',
      texto: 'Sumar 40 socios para bajar la dependencia del subsidio del 84% al 70%',
      cumplido: false,
    },
    {
      id: 'obj-3',
      texto: 'Constituir un fondo de contingencia equivalente a 2 meses de gastos',
      cumplido: false,
    },
    {
      id: 'obj-4',
      texto: 'Digitalizar el 100% de los comprobantes de egresos',
      cumplido: true,
    },
  ],
  inversiones: [
    {
      id: 'inv-1',
      concepto: 'Autobomba 0 km (anticipo + 1ª cuota)',
      monto: 9_000_000,
      trimestre: 2,
    },
    {
      id: 'inv-2',
      concepto: '8 equipos de respiración autónoma (ERA)',
      monto: 4_800_000,
      trimestre: 1,
    },
    { id: 'inv-3', concepto: 'Reparación del techo del cuartel', monto: 1_500_000, trimestre: 3 },
    {
      id: 'inv-4',
      concepto: 'Equipamiento informático para administración',
      monto: 600_000,
      trimestre: 1,
    },
  ],
  ingresos: [
    { id: 'ing-1', concepto: 'Subsidio Nacional · Ley 25.054', monto: 30_000_000 },
    { id: 'ing-2', concepto: 'Subsidio Provincial', monto: 12_000_000 },
    { id: 'ing-3', concepto: 'Subsidio Municipal', monto: 3_000_000 },
    { id: 'ing-4', concepto: 'Cuotas sociales', monto: 9_000_000 },
    { id: 'ing-5', concepto: 'Rifas y eventos', monto: 8_000_000 },
    { id: 'ing-6', concepto: 'Donaciones', monto: 4_000_000 },
    { id: 'ing-7', concepto: 'Otros ingresos', monto: 3_600_000 },
  ],
  egresos: [
    { id: 'egr-1', concepto: 'Personal rentado', monto: 38_000_000 },
    { id: 'egr-2', concepto: 'Combustible', monto: 6_000_000 },
    { id: 'egr-3', concepto: 'Mantenimiento de móviles', monto: 7_000_000 },
    { id: 'egr-4', concepto: 'Servicios públicos', monto: 5_000_000 },
    { id: 'egr-5', concepto: 'Seguros', monto: 4_000_000 },
    { id: 'egr-6', concepto: 'EPP y equipamiento', monto: 6_000_000 },
    { id: 'egr-7', concepto: 'Capacitación', monto: 2_000_000 },
    { id: 'egr-8', concepto: 'Administrativo', monto: 4_000_000 },
    { id: 'egr-9', concepto: 'Impuestos y tasas', monto: 3_000_000 },
  ],
};
