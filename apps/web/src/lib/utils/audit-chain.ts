/**
 * Audit hash-chain SHA-256
 *
 * Cada evento del audit log incluye `prevHash` (el hash del evento anterior)
 * + sus campos canonicalizados. El hash de un evento se computa sobre todo
 * el contenido. Cualquier modificación rompe la cadena (tamper-evident).
 *
 * No es blockchain - no hay PoW, no hay ledger distribuido. Es un Merkle
 * chain simple verificable con SHA-256 puro.
 */

export interface AuditChainEntry {
  id: string;
  actor: string;
  action: string;
  entityType: string;
  entityId: string;
  timestamp: string;
  diff?: Record<string, [unknown, unknown]>;
  prevHash: string;
  hash: string;
}

const GENESIS_HASH = '0000000000000000000000000000000000000000000000000000000000000000';

function canonicalize(obj: Record<string, unknown>): string {
  // JSON.stringify con claves ordenadas para hash determinístico
  return JSON.stringify(obj, Object.keys(obj).sort());
}

async function sha256(input: string): Promise<string> {
  // Web Crypto API · funciona en browser y Node 20+
  const buf = new TextEncoder().encode(input);
  const hash = await crypto.subtle.digest('SHA-256', buf);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function hashEntry(entry: Omit<AuditChainEntry, 'hash'>): Promise<string> {
  const canonical = canonicalize({
    id: entry.id,
    actor: entry.actor,
    action: entry.action,
    entityType: entry.entityType,
    entityId: entry.entityId,
    timestamp: entry.timestamp,
    diff: entry.diff ?? null,
    prevHash: entry.prevHash,
  });
  return await sha256(canonical);
}

/**
 * Verifica que toda la cadena sea íntegra: cada hash matchea el contenido
 * + el prevHash apunta al hash anterior.
 */
export async function verifyChain(
  entries: AuditChainEntry[],
): Promise<{ valid: boolean; brokenAt?: number; errors: string[] }> {
  const errors: string[] = [];
  let lastHash = GENESIS_HASH;

  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i]!;

    if (entry.prevHash !== lastHash) {
      errors.push(
        `Evento ${i} (${entry.id}): prevHash no coincide. Esperado ${lastHash}, recibido ${entry.prevHash}.`,
      );
      return { valid: false, brokenAt: i, errors };
    }

    const expectedHash = await hashEntry({
      id: entry.id,
      actor: entry.actor,
      action: entry.action,
      entityType: entry.entityType,
      entityId: entry.entityId,
      timestamp: entry.timestamp,
      diff: entry.diff,
      prevHash: entry.prevHash,
    });

    if (entry.hash !== expectedHash) {
      errors.push(`Evento ${i} (${entry.id}): hash no coincide. Posible adulteración.`);
      return { valid: false, brokenAt: i, errors };
    }

    lastHash = entry.hash;
  }

  return { valid: true, errors };
}

/** Crea una nueva entrada hash-chained dada la última entrada anterior */
export async function createChainEntry(
  raw: Omit<AuditChainEntry, 'hash' | 'prevHash'>,
  previousEntry?: AuditChainEntry,
): Promise<AuditChainEntry> {
  const prevHash = previousEntry?.hash ?? GENESIS_HASH;
  const hash = await hashEntry({ ...raw, prevHash });
  return { ...raw, prevHash, hash };
}

/** Calcula el root de Merkle de la cadena entera (sello de período) */
export async function chainRoot(entries: AuditChainEntry[]): Promise<string> {
  if (entries.length === 0) return GENESIS_HASH;
  const last = entries[entries.length - 1]!;
  return last.hash;
}
