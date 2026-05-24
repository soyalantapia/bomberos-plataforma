import type { Movil } from '@faro/types';
import { CUARTEL_PRINCIPAL_ID } from './cuarteles';

export const movilesMock: Movil[] = [
  { id: 'movil-bv3', cuartelId: CUARTEL_PRINCIPAL_ID, codigo: 'BV-3', tipo: 'autobomba', marca: 'Mercedes-Benz', modelo: 'Atego 1726', dominio: 'AA 245 BV', anio: 2019, enServicio: true, vtvVencimiento: '2026-07-12', horasServicio: 1245 },
  { id: 'movil-bv5', cuartelId: CUARTEL_PRINCIPAL_ID, codigo: 'BV-5', tipo: 'rescate', marca: 'Iveco', modelo: 'Daily 70C17', dominio: 'BD 812 KY', anio: 2017, enServicio: true, vtvVencimiento: '2026-06-08', horasServicio: 2102 },
  { id: 'movil-bv7', cuartelId: CUARTEL_PRINCIPAL_ID, codigo: 'BV-7', tipo: 'forestal', marca: 'Toyota', modelo: 'Hilux 4x4', dominio: 'AC 478 GH', anio: 2021, enServicio: true, vtvVencimiento: '2027-02-15', horasServicio: 678 },
];
