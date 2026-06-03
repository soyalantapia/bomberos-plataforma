'use client';

import { motion } from 'framer-motion';
import {
  AlertOctagon,
  ArrowLeft,
  CheckCircle2,
  FileSearch,
  Hash,
  Loader2,
  ShieldCheck,
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

import { Badge, Button, Card, CardContent, Kpi, cn, useToast } from '@faro/ui';

import { PageHero } from '../../../../../components/shared/page-hero';
import {
  createChainEntry,
  verifyChain,
  type AuditChainEntry,
} from '../../../../../lib/utils/audit-chain';

// Cadena demo construida en vivo en el cliente
async function buildDemoChain(): Promise<AuditChainEntry[]> {
  const events: Array<Omit<AuditChainEntry, 'hash' | 'prevHash'>> = [
    {
      id: 'aud-1',
      actor: 'persona-002',
      action: 'rendicion.presentar',
      entityType: 'Rendicion',
      entityId: 'rend-2026-04',
      timestamp: '2026-04-30T10:30:00-03:00',
    },
    {
      id: 'aud-2',
      actor: 'persona-002',
      action: 'servicio.validar',
      entityType: 'Servicio',
      entityId: 'srv-001',
      timestamp: '2026-05-04T08:30:00-03:00',
    },
    {
      id: 'aud-3',
      actor: 'persona-003',
      action: 'ocr.aplicar',
      entityType: 'Persona',
      entityId: 'persona-005',
      timestamp: '2026-05-22T16:18:00-03:00',
      diff: {
        domicilio: ['Av. Cerrito 1230', 'Av. Belgrano 4520'],
      },
    },
    {
      id: 'aud-4',
      actor: 'persona-001',
      action: 'aprobacion.aprobar',
      entityType: 'Ascenso',
      entityId: 'a-3',
      timestamp: '2026-05-02T11:20:00-03:00',
      diff: { jerarquia: ['sargento', 'sargento_ayudante'] },
    },
    {
      id: 'aud-5',
      actor: 'persona-002',
      action: 'sync.ruba',
      entityType: 'Padron',
      entityId: 'sync-2026-05-24',
      timestamp: '2026-05-24T14:30:00-03:00',
    },
  ];

  const chain: AuditChainEntry[] = [];
  for (const ev of events) {
    const prev = chain[chain.length - 1];
    const entry = await createChainEntry(ev, prev);
    chain.push(entry);
  }
  return chain;
}

export default function VerificadorPage() {
  const toast = useToast();
  const [hashInput, setHashInput] = useState('');
  const [verificando, setVerificando] = useState(false);
  const [resultado, setResultado] = useState<{
    chain: AuditChainEntry[];
    valid: boolean;
    errors: string[];
    brokenAt?: number;
  } | null>(null);
  const [adulterado, setAdulterado] = useState(false);

  async function verificar() {
    setVerificando(true);
    setResultado(null);
    setTimeout(async () => {
      const chain = await buildDemoChain();

      // Si "adulterado" está activo, falseamos el evento 3
      const chainAUsar = adulterado
        ? chain.map((e, i) => (i === 2 ? { ...e, actor: 'persona-999-FALSO' } : e))
        : chain;

      const verif = await verifyChain(chainAUsar);
      setResultado({
        chain: chainAUsar,
        valid: verif.valid,
        errors: verif.errors,
        brokenAt: verif.brokenAt,
      });
      setVerificando(false);

      if (verif.valid) {
        toast.push({
          kind: 'success',
          title: 'Registro íntegro',
          description: `${chain.length} eventos verificados con comprobante único.`,
        });
      } else {
        toast.push({
          kind: 'error',
          title: 'Registro modificado',
          description: `Se rompió en el evento ${verif.brokenAt}.`,
        });
      }
    }, 1500);
  }

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <Link
          href="/gobierno/audit"
          className="hover:text-brand-700 inline-flex items-center gap-1"
        >
          <ArrowLeft size={14} /> Volver al registro permanente
        </Link>
      </div>

      <PageHero
        objetivo="Gobierno · Auditoría"
        titulo="Verificador de integridad del registro"
        descripcion="Cualquier auditor externo puede validar la integridad del registro permanente. No hace falta confiar en Vulcano."
        icono={<FileSearch size={26} />}
        meta={
          resultado ? (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <Kpi label="Eventos" value={resultado.chain.length} intent="brand" />
              <Kpi
                label="Estado"
                value={resultado.valid ? 'Íntegro' : 'Modificado'}
                intent={resultado.valid ? 'ok' : 'risk'}
              />
              <Kpi label="Verificación" value="Comprobante único" intent="neutral" />
              <Kpi label="Comienzo" value="0×0000..." hint="comprobante inicial" intent="neutral" />
            </div>
          ) : undefined
        }
      />

      <Card className="bg-brand-50/40 border-brand-100">
        <CardContent className="p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <div className="bg-brand-600 grid h-10 w-10 shrink-0 place-items-center rounded-xl text-white">
              <Hash size={20} />
            </div>
            <div className="flex-1">
              <div className="text-brand-900 font-semibold">¿Cómo funciona?</div>
              <p className="text-brand-900/80 mt-0.5 text-sm">
                Cada evento incluye el comprobante único del evento anterior más sus campos. Si
                alguien modifica un evento del pasado, su comprobante cambia y los comprobantes
                siguientes ya no coinciden. La cadena entera se rompe matemáticamente:{' '}
                <strong>cualquier modificación se detecta</strong>.
              </p>
              <p className="text-brand-900/80 mt-2 text-xs">
                Esto cumple con el Registro Nacional de Entidades 2026 sin necesidad de blockchain
                ni dependencias externas.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-5">
          <h2 className="mb-3 font-bold text-slate-900">Probar verificación</h2>
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase text-slate-500">
                Comprobante del último evento (opcional)
              </label>
              <input
                type="text"
                value={hashInput}
                onChange={(e) => setHashInput(e.target.value)}
                placeholder="Pegá el comprobante que querés validar..."
                className="focus:border-brand-400 focus:ring-brand-100 w-full rounded-lg border border-slate-200 px-3 py-2 font-mono text-xs outline-none focus:ring-2"
              />
              <p className="mt-1 text-[11px] text-slate-500">
                Si lo dejás vacío, verifica el registro actual entero.
              </p>
            </div>

            <label className="bg-status-warn-bg/40 flex cursor-pointer items-start gap-2 rounded-lg p-3 text-sm">
              <input
                type="checkbox"
                checked={adulterado}
                onChange={(e) => setAdulterado(e.target.checked)}
                className="mt-0.5 h-4 w-4"
              />
              <span>
                <strong>Probar:</strong> simular una modificación al evento #3 (cambia el actor)
                para ver cómo el verificador detecta el cambio.
              </span>
            </label>

            <Button intent="primary" onClick={verificar} disabled={verificando}>
              {verificando ? (
                <>
                  <Loader2 size={14} className="animate-spin" /> Verificando...
                </>
              ) : (
                <>
                  <ShieldCheck size={14} /> Verificar integridad
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Resultado */}
      {resultado && (
        <>
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <Card
              className={cn(
                'border-2',
                resultado.valid
                  ? 'border-status-ok/30 bg-status-ok-bg/30'
                  : 'border-status-risk/30 bg-status-risk-bg/30',
              )}
            >
              <CardContent className="flex items-start gap-3 p-5">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200 }}
                  className={cn(
                    'grid h-12 w-12 shrink-0 place-items-center rounded-full text-white',
                    resultado.valid ? 'bg-status-ok' : 'bg-status-risk',
                  )}
                >
                  {resultado.valid ? <CheckCircle2 size={24} /> : <AlertOctagon size={24} />}
                </motion.div>
                <div className="flex-1">
                  <h3
                    className={cn(
                      'text-lg font-bold',
                      resultado.valid ? 'text-status-ok-fg' : 'text-status-risk-fg',
                    )}
                  >
                    {resultado.valid ? 'Registro íntegro' : 'Registro modificado'}
                  </h3>
                  <p className="mt-1 text-sm text-slate-700">
                    {resultado.valid
                      ? `Se validaron ${resultado.chain.length} eventos. Ningún comprobante fue modificado desde su creación.`
                      : `Se detectó al menos un evento alterado. El registro se rompió en la posición ${resultado.brokenAt}.`}
                  </p>
                  {!resultado.valid && resultado.errors[0] && (
                    <code className="bg-status-risk-bg/60 text-status-risk-fg mt-2 block rounded p-2 text-xs">
                      {resultado.errors[0]}
                    </code>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Cadena visualizada */}
          <Card>
            <CardContent className="p-0">
              <div className="border-b border-slate-100 px-5 py-3">
                <h3 className="font-bold text-slate-900">Registro verificado</h3>
                <p className="mt-0.5 text-xs text-slate-500">
                  Cada eslabón contiene su comprobante + el comprobante del anterior.
                </p>
              </div>
              <ul className="divide-y divide-slate-100">
                {resultado.chain.map((entry, idx) => {
                  const broken = resultado.brokenAt === idx;
                  return (
                    <li key={entry.id} className={cn('p-4', broken && 'bg-status-risk-bg/30')}>
                      <div className="flex items-start gap-3">
                        <div
                          className={cn(
                            'grid h-8 w-8 shrink-0 place-items-center rounded-lg text-xs font-bold',
                            broken ? 'bg-status-risk text-white' : 'bg-brand-50 text-brand-700',
                          )}
                        >
                          {idx + 1}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <Badge intent={broken ? 'risk' : 'brand'}>{entry.action}</Badge>
                            <span className="text-xs text-slate-500">
                              {new Date(entry.timestamp).toLocaleString('es-AR')}
                            </span>
                          </div>
                          <div className="mt-1 text-sm text-slate-700">
                            <strong>{entry.entityType}</strong> ·{' '}
                            <code className="text-xs">{entry.entityId}</code> por{' '}
                            <code className="text-xs">{entry.actor}</code>
                          </div>
                          <div className="mt-2 grid grid-cols-1 gap-1 font-mono text-[10px]">
                            <div className="break-all rounded bg-slate-100 px-2 py-1">
                              <span className="text-slate-500">Comprobante anterior:</span>{' '}
                              <span className="text-slate-700">{entry.prevHash}</span>
                            </div>
                            <div
                              className={cn(
                                'break-all rounded px-2 py-1',
                                broken
                                  ? 'bg-status-risk-bg/60 text-status-risk-fg'
                                  : 'bg-brand-50 text-brand-700',
                              )}
                            >
                              <span className="text-slate-500">Comprobante actual:</span>{' '}
                              {entry.hash}
                            </div>
                          </div>
                          {broken && (
                            <div className="text-status-risk-fg mt-2 text-xs font-medium">
                              ⚠ El comprobante no coincide con el contenido. Modificación detectada.
                            </div>
                          )}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </CardContent>
          </Card>
        </>
      )}

      <Card className="border-slate-200 bg-slate-50">
        <CardContent className="flex items-start gap-3 p-4 text-sm text-slate-600">
          <ShieldCheck size={18} className="mt-0.5 shrink-0 text-slate-500" />
          <div>
            <strong className="text-slate-900">Auditoría reproducible:</strong> esta página calcula
            los comprobantes en tu navegador. No hay servidor. Podés descargar el código fuente y
            validarlo sin conexión con cualquier auditor externo.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
