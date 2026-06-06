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

export interface PlanAnual {
  anio: number;
  estado: 'borrador' | 'presentado' | 'aprobado';
  objetivos: ObjetivoPlan[];
  inversiones: InversionPlan[];
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
};
