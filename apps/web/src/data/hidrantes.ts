/**
 * Hidrantes en jurisdicción del cuartel. Inventario real (store-backed):
 * alta, cambio de estado (operativo / mantenimiento / fuera de servicio /
 * caudal bajo) y registro de pruebas. El color del pin se deriva del estado.
 */

export type EstadoHidrante = 'operativo' | 'mantenimiento' | 'fuera_servicio' | 'caudal_bajo';
export type TipoHidrante = 'rojo_70mm' | 'amarillo_100mm' | 'azul_150mm' | 'verde_200mm';
export type ProveedorAgua = 'ABSA' | 'AySA' | 'Municipal';

export interface Hidrante {
  id: string;
  cuartelId: string;
  codigo: string;
  direccion: string;
  lat: number;
  lng: number;
  tipo: TipoHidrante;
  caudal: number; // litros/min
  presion: number; // bar
  estado: EstadoHidrante;
  ultimoTest: string;
  proximoTest: string;
  proveedor: ProveedorAgua;
  notas?: string;
}

const C = 'cuartel-villa-ballester';

export const hidrantesMock: Hidrante[] = [
  {
    id: 'h-001',
    cuartelId: C,
    codigo: 'H-VB-0001',
    direccion: 'Av. Alvear y Vélez Sarsfield',
    lat: -34.546,
    lng: -58.557,
    tipo: 'azul_150mm',
    caudal: 1500,
    presion: 5.5,
    estado: 'operativo',
    ultimoTest: '2026-03-15',
    proximoTest: '2026-09-15',
    proveedor: 'ABSA',
  },
  {
    id: 'h-002',
    cuartelId: C,
    codigo: 'H-VB-0002',
    direccion: 'Pueyrredón 4200',
    lat: -34.5483,
    lng: -58.5591,
    tipo: 'rojo_70mm',
    caudal: 950,
    presion: 4.2,
    estado: 'operativo',
    ultimoTest: '2026-04-01',
    proximoTest: '2026-10-01',
    proveedor: 'ABSA',
  },
  {
    id: 'h-003',
    cuartelId: C,
    codigo: 'H-VB-0003',
    direccion: 'Constituyentes 5600',
    lat: -34.541,
    lng: -58.563,
    tipo: 'amarillo_100mm',
    caudal: 1200,
    presion: 5.0,
    estado: 'caudal_bajo',
    ultimoTest: '2026-05-10',
    proximoTest: '2026-11-10',
    proveedor: 'ABSA',
    notas: 'Caudal reducido 30%, posible obstrucción.',
  },
  {
    id: 'h-004',
    cuartelId: C,
    codigo: 'H-VB-0004',
    direccion: 'Cerrito 4540',
    lat: -34.549,
    lng: -58.555,
    tipo: 'rojo_70mm',
    caudal: 0,
    presion: 0,
    estado: 'fuera_servicio',
    ultimoTest: '2025-12-20',
    proximoTest: '2026-06-20',
    proveedor: 'Municipal',
    notas: 'Roto por choque vehicular. Reclamo municipal en curso.',
  },
  {
    id: 'h-005',
    cuartelId: C,
    codigo: 'H-VB-0005',
    direccion: 'Yatay 880',
    lat: -34.5495,
    lng: -58.5538,
    tipo: 'azul_150mm',
    caudal: 1450,
    presion: 5.3,
    estado: 'operativo',
    ultimoTest: '2026-02-28',
    proximoTest: '2026-08-28',
    proveedor: 'ABSA',
  },
  {
    id: 'h-006',
    cuartelId: C,
    codigo: 'H-VB-0006',
    direccion: 'Belgrano 1234',
    lat: -34.5478,
    lng: -58.5566,
    tipo: 'rojo_70mm',
    caudal: 900,
    presion: 4.0,
    estado: 'mantenimiento',
    ultimoTest: '2026-05-20',
    proximoTest: '2026-11-20',
    proveedor: 'ABSA',
    notas: 'Mantenimiento programado en curso.',
  },
  {
    id: 'h-007',
    cuartelId: C,
    codigo: 'H-VB-0007',
    direccion: 'Tronador 2380',
    lat: -34.5455,
    lng: -58.563,
    tipo: 'verde_200mm',
    caudal: 2400,
    presion: 6.2,
    estado: 'operativo',
    ultimoTest: '2026-04-15',
    proximoTest: '2026-10-15',
    proveedor: 'AySA',
  },
  {
    id: 'h-008',
    cuartelId: C,
    codigo: 'H-VB-0008',
    direccion: 'Av. Eva Perón y Yrigoyen',
    lat: -34.5478,
    lng: -58.5482,
    tipo: 'azul_150mm',
    caudal: 1380,
    presion: 5.1,
    estado: 'operativo',
    ultimoTest: '2026-03-01',
    proximoTest: '2026-09-01',
    proveedor: 'ABSA',
  },
];
