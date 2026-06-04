import type { RegionInfo } from '@faro/types';

export const regionesMock: RegionInfo[] = [
  {
    id: 'norte-gba',
    nombre: 'Norte GBA',
    responsableId: 'sm-001',
    descripcion: 'San Martín, San Isidro, Tigre, Villa Ballester y cercanías.',
  },
  {
    id: 'oeste-gba',
    nombre: 'Oeste GBA',
    responsableId: 'mo-001',
    descripcion: 'Morón, Tres de Febrero, Ituzaingó, Hurlingham, Merlo y zonas vecinas.',
  },
  {
    id: 'sur-gba',
    nombre: 'Sur GBA',
    responsableId: 'qm-001',
    descripcion: 'Quilmes, Lomas de Zamora, Lanús, Avellaneda y cercanías.',
  },
  {
    id: 'la-plata-y-sudeste',
    nombre: 'La Plata y Sudeste',
    descripcion: 'La Plata, Berisso, Ensenada, Magdalena, Chascomús y zona sur del conurbano.',
  },
  {
    id: 'costa-atlantica',
    nombre: 'Costa Atlántica',
    descripcion: 'Mar del Plata, Pinamar, Villa Gesell, San Bernardo y resto de la costa.',
  },
  {
    id: 'interior-pba-norte',
    nombre: 'Interior PBA Norte',
    descripcion: 'Pilar, Zárate, San Pedro, Junín, Pergamino, Mercedes, Luján y región norte.',
  },
  {
    id: 'interior-pba-sur',
    nombre: 'Interior PBA Sur',
    descripcion: 'Bahía Blanca, Olavarría, Azul, Tres Arroyos, Coronel Suárez y región sur.',
  },
];

export const REGION_NOMBRE_A_ID: Record<string, string> = {
  'Norte GBA': 'norte-gba',
  'Oeste GBA': 'oeste-gba',
  'Sur GBA': 'sur-gba',
  'La Plata y Sudeste': 'la-plata-y-sudeste',
  'Costa Atlántica': 'costa-atlantica',
  'Interior PBA Norte': 'interior-pba-norte',
  'Interior PBA Sur': 'interior-pba-sur',
};

export const REGION_ID_A_NOMBRE: Record<string, string> = {
  'norte-gba': 'Norte GBA',
  'oeste-gba': 'Oeste GBA',
  'sur-gba': 'Sur GBA',
  'la-plata-y-sudeste': 'La Plata y Sudeste',
  'costa-atlantica': 'Costa Atlántica',
  'interior-pba-norte': 'Interior PBA Norte',
  'interior-pba-sur': 'Interior PBA Sur',
};
