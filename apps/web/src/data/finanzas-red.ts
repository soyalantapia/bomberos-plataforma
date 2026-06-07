/**
 * Resumen financiero por cuartel para la vista económica de la Federación.
 * Determinístico (hash del idx, estilo cumpFor) → estable en export estático, sin
 * Math.random. Villa Ballester se overridea con sus valores reales de subsidios.ts.
 * NO se persiste en el store (igual que los mocks estructurales).
 */
import type { Cuartel } from '@faro/types';

import { cuartelesMock } from './cuarteles';
import { subsidiosMock } from './subsidios';

export type OrganismoSubsidio = 'nacional' | 'provincial' | 'municipal';

export interface SubsidioRed {
  organismo: OrganismoSubsidio;
  otorgado: number;
  ejecutado: number;
  /** Días desde el día de la demo (2026-05-25) hasta el límite de ejecución. */
  venceEnDias: number;
}

export interface FinanzasCuartel {
  cuartelId: string;
  /** Plata disponible en caja (consolidable a nivel red). */
  caja: number;
  subsidios: SubsidioRed[];
}

// Hash determinístico estilo cumpFor(): 0..1, estable build-a-build.
const h = (idx: number, salt: number) => ((idx * 31 + salt * 7 + 13) % 100) / 100;

export function finanzasFor(idx: number, c: Cuartel): Omit<FinanzasCuartel, 'cuartelId'> {
  const escala = 0.6 + h(idx, 3) * 1.8; // 0.6x..2.4x por "tamaño" del cuartel
  const round5 = (n: number) => Math.round(n / 1e5) * 1e5;

  // % ejecutado sesgado por cumplimiento (uso INTERNO para variar el seed; nunca
  // se muestra como puntaje — eso es terreno del HIP).
  const sesgo = c.cumplimiento === 'ok' ? 0.78 : c.cumplimiento === 'warn' ? 0.5 : 0.28;
  const ejec = (s: number) => Math.min(0.99, Math.max(0.05, sesgo + (h(idx, s) - 0.5) * 0.3));
  // los más flojos tienden a tener subsidios venciendo antes
  const dias = (s: number) => Math.round(h(idx, s) * 110) + (c.cumplimiento === 'risk' ? 2 : 8);

  const nacOt = round5((18_000_000 + h(idx, 1) * 22_000_000) * escala);
  const provOt = round5((7_000_000 + h(idx, 2) * 9_000_000) * escala);
  const munOt = round5((1_500_000 + h(idx, 4) * 3_500_000) * escala);

  return {
    caja: round5((4_000_000 + h(idx, 11) * 20_000_000) * escala),
    subsidios: [
      {
        organismo: 'nacional',
        otorgado: nacOt,
        ejecutado: Math.round(nacOt * ejec(5)),
        venceEnDias: dias(6),
      },
      {
        organismo: 'provincial',
        otorgado: provOt,
        ejecutado: Math.round(provOt * ejec(7)),
        venceEnDias: dias(8),
      },
      {
        organismo: 'municipal',
        otorgado: munOt,
        ejecutado: Math.round(munOt * ejec(9)),
        venceEnDias: dias(10),
      },
    ],
  };
}

// Villa Ballester con los valores REALES de subsidios.ts para que cuadre con su
// propia pantalla /mando/finanzas/subsidios.
const VB_ID = 'cuartel-villa-ballester';
const diasDesdeDemo = (iso: string) =>
  Math.round((new Date(iso).getTime() - new Date('2026-05-25T12:00:00').getTime()) / 86_400_000);

export const finanzasRedMock: FinanzasCuartel[] = cuartelesMock.map((c, i) => {
  if (c.id === VB_ID) {
    return {
      cuartelId: c.id,
      caja: 14_900_000,
      subsidios: subsidiosMock.map((s) => ({
        organismo: s.tipo as OrganismoSubsidio,
        otorgado: s.montoOtorgado,
        ejecutado: s.ejecutado,
        venceEnDias: diasDesdeDemo(s.fechaLimiteEjecucion),
      })),
    };
  }
  return { cuartelId: c.id, ...finanzasFor(i + 1, c) };
});
