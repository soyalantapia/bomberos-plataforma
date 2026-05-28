import type { Destacamento, MiembroConsejo, Sector } from '@faro/types';

import { CUARTEL_PRINCIPAL_ID } from './cuarteles';

const SAN_PEDRO_ID = 'cuartel-san-pedro';

/**
 * Consejo Directivo de Villa Ballester. Órgano administrativo — la
 * autoridad máxima del cuartel es el Presidente. Estos miembros suelen
 * ser civiles que no integran el cuerpo activo; por eso van como
 * MiembroConsejo y no como Persona del padrón.
 */
export const consejoMock: MiembroConsejo[] = [
  {
    id: 'cd-vb-01',
    cuartelId: CUARTEL_PRINCIPAL_ID,
    nombre: 'Dr. Alberto Sosa',
    cargo: 'presidente',
    desde: '2024-04-01',
    telefono: '+54 11 5555 0301',
    email: 'presidencia@bv-vballester.org',
  },
  {
    id: 'cd-vb-02',
    cuartelId: CUARTEL_PRINCIPAL_ID,
    nombre: 'Cra. Mónica Ledesma',
    cargo: 'vicepresidente',
    desde: '2024-04-01',
    telefono: '+54 11 5555 0302',
  },
  {
    id: 'cd-vb-03',
    cuartelId: CUARTEL_PRINCIPAL_ID,
    nombre: 'Esc. Jorge Maidana',
    cargo: 'secretario',
    desde: '2024-04-01',
    telefono: '+54 11 5555 0303',
  },
  {
    id: 'cd-vb-04',
    cuartelId: CUARTEL_PRINCIPAL_ID,
    nombre: 'Cra. Liliana Paz',
    cargo: 'tesorero',
    desde: '2024-04-01',
    telefono: '+54 11 5555 0304',
    email: 'tesoreria@bv-vballester.org',
  },
  {
    id: 'cd-vb-05',
    cuartelId: CUARTEL_PRINCIPAL_ID,
    nombre: 'Sr. Raúl Quiroga',
    cargo: 'protesorero',
    desde: '2024-04-01',
  },
  {
    id: 'cd-vb-06',
    cuartelId: CUARTEL_PRINCIPAL_ID,
    nombre: 'Sra. Norma Vega',
    cargo: 'vocal',
    desde: '2024-04-01',
    telefono: '+54 11 5555 0306',
  },
  {
    id: 'cd-vb-07',
    cuartelId: CUARTEL_PRINCIPAL_ID,
    nombre: 'Sr. Hugo Benítez',
    cargo: 'vocal',
    desde: '2024-04-01',
  },
  {
    id: 'cd-vb-08',
    cuartelId: CUARTEL_PRINCIPAL_ID,
    nombre: 'Dr. Esteban Ferrari',
    cargo: 'revisor_cuentas',
    desde: '2024-04-01',
  },
];

/**
 * Sectores funcionales de Villa Ballester. Cada uno tiene un responsable
 * (jefe de área) del cuerpo activo. Resuelve el caso "¿a quién aviso que
 * el baño está roto?": buscás el sector y aparece el responsable.
 */
export const sectoresMock: Sector[] = [
  {
    id: 'sec-vb-automotores',
    cuartelId: CUARTEL_PRINCIPAL_ID,
    nombre: 'Automotores',
    icono: 'truck',
    responsableId: 'persona-011',
    descripcion: 'Móviles, autobombas, mantenimiento mecánico y combustible.',
  },
  {
    id: 'sec-vb-materiales',
    cuartelId: CUARTEL_PRINCIPAL_ID,
    nombre: 'Materiales',
    icono: 'package',
    responsableId: 'persona-008',
    descripcion: 'EPP, equipos, mangueras, herramientas de intervención.',
  },
  {
    id: 'sec-vb-intendencia',
    cuartelId: CUARTEL_PRINCIPAL_ID,
    nombre: 'Intendencia',
    icono: 'warehouse',
    responsableId: 'persona-004',
    descripcion: 'Uniformes, insumos, depósito y abastecimiento.',
  },
  {
    id: 'sec-vb-mantenimiento',
    cuartelId: CUARTEL_PRINCIPAL_ID,
    nombre: 'Mantenimiento',
    icono: 'wrench',
    responsableId: 'persona-005',
    descripcion: 'Edificio, instalaciones, limpieza y obras menores.',
  },
  {
    id: 'sec-vb-comunicaciones',
    cuartelId: CUARTEL_PRINCIPAL_ID,
    nombre: 'Comunicaciones',
    icono: 'antenna',
    responsableId: 'persona-007',
    descripcion: 'Radio, central de alarmas y enlace operativo.',
  },
  {
    id: 'sec-vb-sanidad',
    cuartelId: CUARTEL_PRINCIPAL_ID,
    nombre: 'Sanidad',
    icono: 'stethoscope',
    responsableId: 'persona-006',
    descripcion: 'Botiquín, aptitud médica y primeros auxilios del personal.',
  },
];

/**
 * Destacamentos. Villa Ballester tiene su central + el destacamento de
 * José León Suárez. Se incluye además San Pedro (central + Gobernador
 * Castro + Río Tala) como ejemplo del modelo de cuarteles con varios
 * destacamentos, tal como lo planteó el feedback.
 */
export const destacamentosMock: Destacamento[] = [
  {
    id: 'dest-vb-central',
    cuartelId: CUARTEL_PRINCIPAL_ID,
    nombre: 'Cuartel Central',
    esCentral: true,
    direccion: 'Lacroze 778, Villa Ballester',
    jefeId: 'persona-001',
  },
  {
    id: 'dest-vb-jls',
    cuartelId: CUARTEL_PRINCIPAL_ID,
    nombre: 'Destacamento José León Suárez',
    esCentral: false,
    direccion: 'Esquiú 1270, José León Suárez',
    jefeId: 'persona-005',
  },
  {
    id: 'dest-sp-central',
    cuartelId: SAN_PEDRO_ID,
    nombre: 'Cuartel Central',
    esCentral: true,
    direccion: 'San Pedro centro',
  },
  {
    id: 'dest-sp-castro',
    cuartelId: SAN_PEDRO_ID,
    nombre: 'Destacamento Gobernador Castro',
    esCentral: false,
    direccion: 'Gobernador Castro',
  },
  {
    id: 'dest-sp-tala',
    cuartelId: SAN_PEDRO_ID,
    nombre: 'Destacamento Río Tala',
    esCentral: false,
    direccion: 'Río Tala',
  },
];
