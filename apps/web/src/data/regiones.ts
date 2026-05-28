import type { RegionInfo } from '@faro/types';

export const regionesMock: RegionInfo[] = [
  {
    id: 'norte-gba',
    nombre: 'Norte GBA',
    responsableId: 'sm-001',
    descripcion:
      'Cuarteles del norte del Gran Buenos Aires: San Martín, San Isidro, Tigre, Villa Ballester.',
  },
  {
    id: 'sur-gba',
    nombre: 'Sur GBA',
    responsableId: 'qm-001',
    descripcion: 'Cuarteles del sur del Gran Buenos Aires: Quilmes, Lomas de Zamora, Lanús.',
  },
  {
    id: 'oeste-gba',
    nombre: 'Oeste GBA',
    responsableId: 'mo-001',
    descripcion: 'Cuarteles del oeste del Gran Buenos Aires: Morón, Tres de Febrero, Ituzaingó.',
  },
];

export const REGION_NOMBRE_A_ID: Record<string, string> = {
  'Norte GBA': 'norte-gba',
  'Sur GBA': 'sur-gba',
  'Oeste GBA': 'oeste-gba',
};

export const REGION_ID_A_NOMBRE: Record<string, string> = {
  'norte-gba': 'Norte GBA',
  'sur-gba': 'Sur GBA',
  'oeste-gba': 'Oeste GBA',
};
