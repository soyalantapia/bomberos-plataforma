/**
 * Cliente Dexie (IndexedDB) para almacenamiento offline.
 * Andamiaje: las tablas reales (servicios, asistencias, partes pendientes
 * de sincronizar) se definen cuando arranque la implementación.
 *
 * Patrón previsto: cada mutación se persiste local primero, se encola en
 * una tabla `pending_sync`, y un worker la reintenta cuando vuelve la red.
 */
import Dexie, { type EntityTable } from 'dexie';

interface PendingMutation {
  id?: number;
  endpoint: string;
  payload: unknown;
  createdAt: number;
  attempts: number;
}

const db = new Dexie('faro-offline') as Dexie & {
  pendingMutations: EntityTable<PendingMutation, 'id'>;
};

db.version(1).stores({
  pendingMutations: '++id, endpoint, createdAt',
});

export { db };
export type { PendingMutation };
