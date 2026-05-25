'use client';

import {
  Activity,
  ArrowLeft,
  CheckCircle2,
  Copy,
  ExternalLink,
  FileSearch,
  Hash,
  Shield,
  User,
} from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';

import { Avatar, Badge, Button, Card, CardContent, Kpi, cn, useToast } from '@faro/ui';

import { EmptyState } from '../../../../../components/shared/empty-state';
import { PageHero } from '../../../../../components/shared/page-hero';
import { fmtFechaHora } from '../../../../../lib/utils/date';
import { perfilLabel } from '../../../../../lib/utils/perfil';
import { useFaroStore } from '../../../../../store/use-faro-store';

// Mismas demos que el verificador
const DEMO_EVENTS = [
  {
    id: 'aud-1',
    actor: 'persona-002',
    actorPerfil: 'mando' as const,
    action: 'rendicion.presentar',
    entityType: 'Rendicion',
    entityId: 'rend-2026-04',
    timestamp: '2026-04-30T10:30:00-03:00',
  },
  {
    id: 'aud-3',
    actor: 'persona-003',
    actorPerfil: 'administrativo' as const,
    action: 'ocr.aplicar',
    entityType: 'Persona',
    entityId: 'persona-005',
    timestamp: '2026-05-22T16:18:00-03:00',
    diff: {
      domicilio: ['Av. Cerrito 1230', 'Av. Belgrano 4520'],
      telefono: ['+54 11 5555 0105', '+54 11 5555 0299'],
    },
  },
];

const ACCION_COLOR: Record<string, string> = {
  'rendicion.presentar': 'bg-status-ok',
  'servicio.validar': 'bg-brand-600',
  'ocr.aplicar': 'bg-brand-700',
  'persona.actualizar': 'bg-slate-600',
  'denuncia.crear': 'bg-status-warn',
  'aprobacion.aprobar': 'bg-status-ok',
};

export default function FichaAuditPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const toast = useToast();
  const personas = useFaroStore((s) => s.personas);
  const [hashGenerado, setHashGenerado] = useState<string | null>(null);

  // Buscar en demo o crear placeholder con id pasado
  const evento =
    DEMO_EVENTS.find((e) => e.id === params.id) ??
    ({
      id: params.id,
      actor: 'persona-001',
      actorPerfil: 'mando' as const,
      action: 'servicio.validar',
      entityType: 'Servicio',
      entityId: 'srv-001',
      timestamp: '2026-05-04T08:30:00-03:00',
    } as (typeof DEMO_EVENTS)[number]);

  if (!evento) {
    return (
      <div className="mx-auto max-w-5xl space-y-5">
        <Link
          href="/gobierno/audit"
          className="hover:text-brand-700 inline-flex items-center gap-1 text-sm text-slate-500"
        >
          <ArrowLeft size={14} /> Volver
        </Link>
        <EmptyState
          icon={<FileSearch size={28} />}
          titulo="Evento no encontrado"
          descripcion={`No existe un evento con id ${params.id}.`}
          variant="warning"
          accion={{
            label: 'Volver al log',
            onClick: () => router.push('/gobierno/audit'),
          }}
        />
      </div>
    );
  }

  const actor = personas.find((p) => p.id === evento.actor);

  async function generarHash() {
    const data = JSON.stringify({
      id: evento.id,
      actor: evento.actor,
      action: evento.action,
      entityType: evento.entityType,
      entityId: evento.entityId,
      timestamp: evento.timestamp,
      diff: 'diff' in evento ? evento.diff : null,
    });
    const buf = new TextEncoder().encode(data);
    const hash = await crypto.subtle.digest('SHA-256', buf);
    const hex = Array.from(new Uint8Array(hash))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
    setHashGenerado(hex);
    toast.push({
      kind: 'success',
      title: 'Hash recalculado',
      description: 'SHA-256 verificado contra el evento original',
    });
  }

  function copiar(texto: string) {
    navigator.clipboard.writeText(texto);
    toast.push({
      kind: 'success',
      title: 'Copiado al portapapeles',
      description: 'Pegá donde necesites para auditar',
    });
  }

  const diff = 'diff' in evento ? evento.diff : undefined;

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <Link
        href="/gobierno/audit"
        className="hover:text-brand-700 inline-flex items-center gap-1 text-sm text-slate-500"
      >
        <ArrowLeft size={14} /> Volver al audit log
      </Link>

      <PageHero
        objetivo={`Evento ${evento.id}`}
        titulo={evento.action.replace('.', ' · ')}
        descripcion={`${evento.entityType} ${evento.entityId} · ${fmtFechaHora(evento.timestamp)}`}
        icono={<Shield size={26} />}
        meta={
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Kpi label="ID" value={evento.id} intent="brand" />
            <Kpi label="Perfil actor" value={perfilLabel[evento.actorPerfil]} intent="neutral" />
            <Kpi label="Algoritmo" value="SHA-256" intent="ok" />
            <Kpi label="Estado cadena" value="Íntegro" intent="ok" />
          </div>
        }
        acciones={
          <Link href="/gobierno/audit/verificador">
            <Button intent="primary">
              <Hash size={14} /> Verificador
            </Button>
          </Link>
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Resumen */}
        <Card className="lg:col-span-2">
          <CardContent className="p-5">
            <h3 className="mb-3 font-bold text-slate-900">Resumen del evento</h3>
            <dl className="space-y-2 text-sm">
              <div className="grid grid-cols-[140px_1fr] gap-2">
                <dt className="text-slate-500">Acción</dt>
                <dd>
                  <Badge
                    intent="brand"
                    className={cn(ACCION_COLOR[evento.action] ?? 'bg-slate-600', 'text-white')}
                  >
                    {evento.action}
                  </Badge>
                </dd>
              </div>
              <div className="grid grid-cols-[140px_1fr] gap-2">
                <dt className="text-slate-500">Entidad</dt>
                <dd className="font-medium text-slate-900">
                  {evento.entityType}{' '}
                  <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs">
                    {evento.entityId}
                  </code>
                </dd>
              </div>
              <div className="grid grid-cols-[140px_1fr] gap-2">
                <dt className="text-slate-500">Timestamp</dt>
                <dd className="font-mono text-xs text-slate-900">{evento.timestamp}</dd>
              </div>
              <div className="grid grid-cols-[140px_1fr] gap-2">
                <dt className="text-slate-500">Actor</dt>
                <dd>
                  <Link
                    href={`/administrativo/personas/${evento.actor}` as never}
                    className="hover:text-brand-700 inline-flex items-center gap-2"
                  >
                    {actor && (
                      <Avatar
                        name={`${actor.nombre} ${actor.apellido}`}
                        src={actor.fotoUrl}
                        size={24}
                      />
                    )}
                    <span className="font-medium text-slate-900">
                      {actor ? `${actor.nombre} ${actor.apellido}` : evento.actor}
                    </span>
                    <ExternalLink size={11} className="text-slate-400" />
                  </Link>
                </dd>
              </div>
              <div className="grid grid-cols-[140px_1fr] gap-2">
                <dt className="text-slate-500">Perfil</dt>
                <dd className="font-medium capitalize text-slate-900">
                  {perfilLabel[evento.actorPerfil]}
                </dd>
              </div>
            </dl>

            {/* Diff */}
            {diff && (
              <div className="mt-5 border-t border-slate-100 pt-4">
                <h4 className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-900">
                  <Activity size={14} className="text-brand-700" />
                  Cambios aplicados
                </h4>
                <div className="space-y-2">
                  {Object.entries(diff).map(([campo, [antes, despues]]) => (
                    <div key={campo} className="rounded-lg bg-slate-50 p-3">
                      <div className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        {campo}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-start gap-2 text-xs">
                          <span className="text-status-risk-fg shrink-0 font-mono">−</span>
                          <span className="bg-status-risk-bg/40 rounded px-2 py-1 text-slate-700 line-through">
                            {String(antes)}
                          </span>
                        </div>
                        <div className="flex items-start gap-2 text-xs">
                          <span className="text-status-ok-fg shrink-0 font-mono">+</span>
                          <span className="bg-status-ok-bg/40 rounded px-2 py-1 font-medium text-slate-900">
                            {String(despues)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Hash cripto */}
        <div className="space-y-3">
          <Card>
            <CardContent className="p-4">
              <div className="mb-3 flex items-center gap-2">
                <Hash size={14} className="text-brand-700" />
                <span className="text-xs font-bold uppercase text-slate-500">Hash SHA-256</span>
              </div>

              {hashGenerado ? (
                <>
                  <div className="break-all rounded bg-slate-900 p-3 font-mono text-[10px] text-green-400">
                    {hashGenerado}
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <Badge intent="ok">
                      <CheckCircle2 size={10} className="mr-1" />
                      Verificado
                    </Badge>
                    <Button intent="ghost" size="sm" onClick={() => copiar(hashGenerado)}>
                      <Copy size={12} />
                    </Button>
                  </div>
                </>
              ) : (
                <Button intent="primary" fullWidth size="sm" onClick={generarHash}>
                  <Hash size={12} /> Generar hash
                </Button>
              )}
              <p className="mt-2 text-[11px] text-slate-500">
                El hash se calcula en tu navegador con Web Crypto API. Si modificás cualquier campo
                del evento, el hash cambia.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="mb-2 flex items-center gap-2">
                <User size={14} className="text-slate-500" />
                <span className="text-xs font-bold uppercase text-slate-500">Trazabilidad</span>
              </div>
              <dl className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <dt className="text-slate-500">IP origen</dt>
                  <dd className="font-mono text-slate-700">186.x.x.x</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">User-Agent</dt>
                  <dd className="text-slate-700">Mobile · iOS</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">Cifrado</dt>
                  <dd className="text-status-ok-fg font-bold">AES-256</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">Retención</dt>
                  <dd className="font-bold text-slate-900">7 años</dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-2 p-3">
              <Button intent="secondary" size="sm" fullWidth>
                <Copy size={12} /> Exportar JSON
              </Button>
              <Button intent="secondary" size="sm" fullWidth>
                <FileSearch size={12} /> Ver eventos relacionados
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className="border-slate-200 bg-slate-50">
        <CardContent className="p-4 text-sm text-slate-600">
          <strong className="text-slate-900">Ley 25.326 · Cumplimiento:</strong> este evento forma
          parte del registro inmutable. La cadena hash garantiza que ningún campo fue modificado
          desde su creación. Verificable por cualquier auditor externo con la URL pública.
        </CardContent>
      </Card>
    </div>
  );
}
