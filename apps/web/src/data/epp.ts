/**
 * Equipo de Protección Personal (EPP) por bombero.
 * El `estado` NO se guarda: se deriva del vencimiento vs hoy + el flag
 * `fueraServicio`. Las acciones (registrar exposición, fuera de servicio)
 * mutan este slice en el store.
 */

export type TipoEPP =
  | 'casco'
  | 'chaqueta'
  | 'pantalon'
  | 'botas'
  | 'guantes'
  | 'capucha'
  | 'scba'
  | 'mascara';

export type EstadoEPP = 'vigente' | 'por_vencer' | 'vencido' | 'fuera_servicio';

export interface EquipoEPP {
  id: string;
  personaId: string;
  tipo: TipoEPP;
  fabricante: string;
  modelo: string;
  fechaCompra: string;
  vencimiento: string;
  qrCode: string;
  exposiciones: number;
  ultimaExposicion?: string;
  fueraServicio: boolean;
  notas?: string;
}

export const equipoEPPMock: EquipoEPP[] = [
  // === Uniforme de la persona demo (persona-002) ===
  {
    id: 'epp-002-casco',
    personaId: 'persona-002',
    tipo: 'casco',
    fabricante: 'MSA Cairns',
    modelo: '1010 Traditional',
    fechaCompra: '2024-03-15',
    vencimiento: '2034-03-15',
    qrCode: 'VLC-EPP-31456-CASCO',
    exposiciones: 47,
    ultimaExposicion: '2026-05-22',
    fueraServicio: false,
  },
  {
    id: 'epp-002-chaqueta',
    personaId: 'persona-002',
    tipo: 'chaqueta',
    fabricante: 'Globe',
    modelo: 'GX-7 Athletix',
    fechaCompra: '2023-08-20',
    vencimiento: '2033-08-20',
    qrCode: 'VLC-EPP-31456-CHAQ',
    exposiciones: 62,
    ultimaExposicion: '2026-05-22',
    fueraServicio: false,
    notas: '2 reparaciones menores en costura del puño',
  },
  {
    id: 'epp-002-pantalon',
    personaId: 'persona-002',
    tipo: 'pantalon',
    fabricante: 'Globe',
    modelo: 'GX-7 Athletix',
    fechaCompra: '2023-08-20',
    vencimiento: '2033-08-20',
    qrCode: 'VLC-EPP-31456-PANT',
    exposiciones: 62,
    fueraServicio: false,
  },
  {
    id: 'epp-002-botas',
    personaId: 'persona-002',
    tipo: 'botas',
    fabricante: 'Haix',
    modelo: 'Fire Hero Xtreme',
    fechaCompra: '2021-07-12',
    vencimiento: '2026-07-12',
    qrCode: 'VLC-EPP-31456-BOTAS',
    exposiciones: 89,
    fueraServicio: false,
    notas: 'Suela desgastada, agendar reemplazo',
  },
  {
    id: 'epp-002-guantes',
    personaId: 'persona-002',
    tipo: 'guantes',
    fabricante: 'Pro-Tech 8',
    modelo: 'Titan',
    fechaCompra: '2025-01-15',
    vencimiento: '2030-01-15',
    qrCode: 'VLC-EPP-31456-GUAN',
    exposiciones: 28,
    fueraServicio: true,
    notas: 'En reparación: refuerzo de palma',
  },
  {
    id: 'epp-002-capucha',
    personaId: 'persona-002',
    tipo: 'capucha',
    fabricante: 'Majestic',
    modelo: 'PAC II',
    fechaCompra: '2024-06-01',
    vencimiento: '2029-06-01',
    qrCode: 'VLC-EPP-31456-CAPU',
    exposiciones: 41,
    fueraServicio: false,
  },
  {
    id: 'epp-002-scba',
    personaId: 'persona-002',
    tipo: 'scba',
    fabricante: 'Scott Safety',
    modelo: 'Air-Pak X3 Pro',
    fechaCompra: '2020-09-15',
    vencimiento: '2035-09-15',
    qrCode: 'VLC-EPP-31456-AIRE',
    exposiciones: 73,
    ultimaExposicion: '2026-05-22',
    fueraServicio: false,
    notas: 'Prueba de presión próxima: agosto 2026',
  },
  {
    id: 'epp-002-mascara',
    personaId: 'persona-002',
    tipo: 'mascara',
    fabricante: 'Scott Safety',
    modelo: 'AV-3000 HT',
    fechaCompra: '2024-02-20',
    vencimiento: '2029-02-20',
    qrCode: 'VLC-EPP-31456-MASC',
    exposiciones: 47,
    fueraServicio: false,
  },
  // === Uniforme de otro bombero (persona-001) — prueba el modelo por-persona ===
  {
    id: 'epp-001-casco',
    personaId: 'persona-001',
    tipo: 'casco',
    fabricante: 'Bullard',
    modelo: 'UST-LW',
    fechaCompra: '2022-05-10',
    vencimiento: '2032-05-10',
    qrCode: 'VLC-EPP-30122-CASCO',
    exposiciones: 58,
    fueraServicio: false,
  },
  {
    id: 'epp-001-chaqueta',
    personaId: 'persona-001',
    tipo: 'chaqueta',
    fabricante: 'Lion',
    modelo: 'V-Force',
    fechaCompra: '2021-03-01',
    vencimiento: '2026-06-15',
    qrCode: 'VLC-EPP-30122-CHAQ',
    exposiciones: 94,
    fueraServicio: false,
    notas: 'Próxima a vencer · iniciar pliego de reemplazo',
  },
  {
    id: 'epp-001-scba',
    personaId: 'persona-001',
    tipo: 'scba',
    fabricante: 'Dräger',
    modelo: 'PSS 5000',
    fechaCompra: '2019-11-20',
    vencimiento: '2034-11-20',
    qrCode: 'VLC-EPP-30122-AIRE',
    exposiciones: 110,
    ultimaExposicion: '2026-05-20',
    fueraServicio: false,
  },
];
