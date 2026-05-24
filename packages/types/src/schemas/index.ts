import { z } from 'zod';

export const TipoServicioSchema = z.enum([
  'incendio',
  'rescate',
  'accidente',
  'forestal',
  'otro',
]);

export const CrearServicioSchema = z.object({
  tipo: TipoServicioSchema,
  direccion: z.string().min(3, 'Indicá una dirección'),
  lat: z.number(),
  lng: z.number(),
  movilId: z.string().min(1, 'Elegí un móvil'),
  dotacionIds: z.array(z.string()).min(1, 'Tiene que ir al menos una persona'),
  horaSalida: z.string().min(1, 'Ingresá la hora de salida'),
  horaRegreso: z.string().min(1, 'Ingresá la hora de regreso'),
  notas: z.string().optional(),
});

export type CrearServicioInput = z.infer<typeof CrearServicioSchema>;
