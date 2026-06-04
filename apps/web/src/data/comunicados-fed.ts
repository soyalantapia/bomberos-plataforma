/**
 * Comunicados de la Federación a la red de cuarteles. Store-backed: enviar uno
 * crea el registro acá + una notificación real (campanita) a cada mando con
 * cuenta activa en el sistema dentro de la audiencia elegida.
 *
 * Audiencia: "Toda la red" (region = null) o una región puntual.
 * En memoria como broadcasts/accionesFed: arranca del seed y se resetea al
 * recargar (no se persiste el mock estructural).
 */

export type CanalComunicado = 'email' | 'whatsapp' | 'push';

export interface ComunicadoFed {
  id: string;
  asunto: string;
  cuerpo: string;
  audiencia: string; // "Toda la red" o nombre de región
  region: string | null; // null = toda la red
  cuartelesAlcanzados: number;
  notificados: number; // notificaciones in-app creadas a mandos activos
  canales: CanalComunicado[];
  prioridad: 'alta' | 'normal';
  fecha: string; // ISO
}

export const comunicadosFedMock: ComunicadoFed[] = [
  {
    id: 'cf-1',
    asunto: 'Cierre del Fondo: 10 de junio',
    cuerpo:
      'Recordatorio de plazo. Revisar rendición y firmas digitales antes del cierre. Los cuarteles en amarillo, priorizar.',
    audiencia: 'Toda la red',
    region: null,
    cuartelesAlcanzados: 180,
    notificados: 1,
    canales: ['email', 'whatsapp', 'push'],
    prioridad: 'alta',
    fecha: '2026-05-25T14:30:00.000Z',
  },
  {
    id: 'cf-2',
    asunto: 'Protocolo de intervención actualizado',
    cuerpo: 'Distribuir entre todo el personal operativo y actualizar la carpeta del Pañol.',
    audiencia: 'Toda la red',
    region: null,
    cuartelesAlcanzados: 180,
    notificados: 1,
    canales: ['email', 'push'],
    prioridad: 'normal',
    fecha: '2026-05-19T09:15:00.000Z',
  },
  {
    id: 'cf-3',
    asunto: 'Capacitación regional · rescate vehicular avanzado',
    cuerpo: 'Centro de práctica Norte GBA · 12 de junio · cupos limitados, confirmar asistencia.',
    audiencia: 'Norte GBA',
    region: 'Norte GBA',
    cuartelesAlcanzados: 15,
    notificados: 1,
    canales: ['email', 'whatsapp'],
    prioridad: 'normal',
    fecha: '2026-05-16T11:00:00.000Z',
  },
];
