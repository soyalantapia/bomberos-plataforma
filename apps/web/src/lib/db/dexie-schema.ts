/**
 * Schema Dexie (IndexedDB) para Faro offline-first
 *
 * Esto materializa el SyncStatusPill que ya tenemos visual. Cada mutación
 * en el cliente crea un evento en `sync_queue`. Un background loop drena
 * la queue cuando hay conexión.
 */

import Dexie, { type EntityTable } from 'dexie';

export interface SyncQueueItem {
  id?: number;
  tipo: 'servicio' | 'asistencia' | 'persona' | 'foto' | 'mensaje' | 'parte';
  metodo: 'POST' | 'PUT' | 'DELETE';
  ruta: string;
  payload: unknown;
  intentos: number;
  estado: 'pendiente' | 'en_curso' | 'completado' | 'fallido';
  creado: string;
  ultimoIntento?: string;
  error?: string;
}

export interface CachedServicio {
  id: string;
  cuartelId: string;
  data: unknown;
  ultimaSync: string;
}

export interface CachedPersona {
  id: string;
  legajo: string;
  data: unknown;
  ultimaSync: string;
}

export interface AuditChainCached {
  id: string;
  prevHash: string;
  hash: string;
  data: unknown;
  ts: string;
}

class FaroDB extends Dexie {
  sync_queue!: EntityTable<SyncQueueItem, 'id'>;
  servicios!: EntityTable<CachedServicio, 'id'>;
  personas!: EntityTable<CachedPersona, 'id'>;
  audit_chain!: EntityTable<AuditChainCached, 'id'>;

  constructor() {
    super('faro_db');
    this.version(1).stores({
      sync_queue: '++id, tipo, estado, creado',
      servicios: 'id, cuartelId, ultimaSync',
      personas: 'id, legajo, ultimaSync',
      audit_chain: 'id, ts',
    });
  }
}

let _db: FaroDB | null = null;

export function getDB(): FaroDB {
  if (typeof window === 'undefined') {
    throw new Error('Dexie no disponible en server. Usar dentro de "use client".');
  }
  if (!_db) _db = new FaroDB();
  return _db;
}

/** Encolar una mutación para sync cuando vuelva conexión */
export async function enqueue(item: Omit<SyncQueueItem, 'id' | 'estado' | 'intentos' | 'creado'>) {
  const db = getDB();
  await db.sync_queue.add({
    ...item,
    estado: 'pendiente',
    intentos: 0,
    creado: new Date().toISOString(),
  });
}

/** Drenar la queue cuando hay conexión (background) */
export async function drainQueue(): Promise<{ ok: number; fail: number }> {
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return { ok: 0, fail: 0 };
  }
  const db = getDB();
  const pendientes = await db.sync_queue.where('estado').equals('pendiente').toArray();
  let ok = 0;
  let fail = 0;
  for (const item of pendientes) {
    try {
      await db.sync_queue.update(item.id!, { estado: 'en_curso' });
      // En demo, simulamos éxito 80% del tiempo
      const success = Math.random() > 0.2;
      if (success) {
        await db.sync_queue.update(item.id!, {
          estado: 'completado',
          ultimoIntento: new Date().toISOString(),
        });
        ok++;
      } else {
        await db.sync_queue.update(item.id!, {
          estado: 'pendiente',
          intentos: item.intentos + 1,
          ultimoIntento: new Date().toISOString(),
          error: 'Network error (simulado)',
        });
        fail++;
      }
    } catch (e) {
      console.error('[sync queue]', e);
      fail++;
    }
  }
  return { ok, fail };
}

/** Contar pendientes para el SyncStatusPill */
export async function countPending(): Promise<number> {
  if (typeof window === 'undefined') return 0;
  try {
    const db = getDB();
    return await db.sync_queue.where('estado').equals('pendiente').count();
  } catch {
    return 0;
  }
}
