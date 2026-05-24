import type { Cuartel } from '@faro/types';

export const cuartelesMock: Cuartel[] = [
  {
    id: 'cuartel-villa-ballester',
    nombre: 'Villa Ballester',
    ciudad: 'Villa Ballester',
    provincia: 'Buenos Aires',
    region: 'Norte GBA',
    lat: -34.5476,
    lng: -58.5556,
    cumplimiento: 'warn',
    porcentajeRendicion: 78,
    fundacion: '1923-04-15',
  },
  {
    id: 'cuartel-san-martin',
    nombre: 'San Martín',
    ciudad: 'General San Martín',
    provincia: 'Buenos Aires',
    region: 'Norte GBA',
    lat: -34.5826,
    lng: -58.5374,
    cumplimiento: 'ok',
    porcentajeRendicion: 96,
    fundacion: '1908-09-21',
  },
  {
    id: 'cuartel-san-isidro',
    nombre: 'San Isidro',
    ciudad: 'San Isidro',
    provincia: 'Buenos Aires',
    region: 'Norte GBA',
    lat: -34.4711,
    lng: -58.5077,
    cumplimiento: 'risk',
    porcentajeRendicion: 42,
    fundacion: '1932-11-04',
  },
  {
    id: 'cuartel-tigre',
    nombre: 'Tigre',
    ciudad: 'Tigre',
    provincia: 'Buenos Aires',
    region: 'Norte GBA',
    lat: -34.4264,
    lng: -58.5797,
    cumplimiento: 'ok',
    porcentajeRendicion: 88,
    fundacion: '1915-03-10',
  },
];

export const CUARTEL_PRINCIPAL_ID = 'cuartel-villa-ballester';
