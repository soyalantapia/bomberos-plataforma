'use client';

import { Activity, AlertOctagon, Eye, FileLock2, ScrollText, Sparkles } from 'lucide-react';
import { useMemo, useState } from 'react';

import type { AuditEvent } from '@faro/types';

import { Avatar, Badge, Card, CardContent, Kpi, cn } from '@faro/ui';

import { PageHero } from '../../../../components/shared/page-hero';
import { FiltersBar, type FilterChip } from '../../../../components/shared/filters-bar';
import { fmtFechaHora } from '../../../../lib/utils/date';
import { perfilLabel } from '../../../../lib/utils/perfil';
import { useFaroStore } from '../../../../store/use-faro-store';

const seedAudit: AuditEvent[] = [
  {
    id: 'aud-1',
    actor: 'persona-001',
    actorPerfil: 'mando',
    action: 'rendicion.presentar',
    entityType: 'Rendicion',
    entityId: 'rend-2025-12',
    timestamp: '2026-01-08T10:30:00-03:00',
  },
  {
    id: 'aud-2',
    actor: 'persona-002',
    actorPerfil: 'mando',
    action: 'servicio.validar',
    entityType: 'Servicio',
    entityId: 'srv-001',
    timestamp: '2026-05-04T08:30:00-03:00',
  },
  {
    id: 'aud-3',
    actor: 'persona-003',
    actorPerfil: 'administrativo',
    action: 'persona.actualizar',
    entityType: 'Persona',
    entityId: 'persona-005',
    timestamp: '2026-05-10T14:12:00-03:00',
    diff: { telefono: ['+54 11 5555 0105', '+54 11 5555 0888'] },
  },
  {
    id: 'aud-4',
    actor: 'persona-010',
    actorPerfil: 'gobierno',
    action: 'denuncia.crear',
    entityType: 'Denuncia',
    entityId: 'E-2026-014',
    timestamp: '2026-05-15T19:42:00-03:00',
  },
  {
    id: 'aud-5',
    actor: 'persona-001',
    actorPerfil: 'mando',
    action: 'aprobacion.aprobar',
    entityType: 'Licencia',
    entityId: 'lic-2026-08',
    timestamp: '2026-05-18T11:00:00-03:00',
  },
];

const ACCION_INTENT: Record<string, 'brand' | 'ok' | 'warn' | 'risk' | 'neutral'> = {
  'rendicion.presentar': 'ok',
  'servicio.validar': 'brand',
  'persona.actualizar': 'neutral',
  'denuncia.crear': 'warn',
  'aprobacion.aprobar': 'ok',
};

type FiltroPerfil = 'todos' | 'mando' | 'administrativo' | 'gobierno' | 'bombero';

export default function AuditLogPage() {
  const auditStore = useFaroStore((s) => s.audit);
  const personas = useFaroStore((s) => s.personas);

  const audit = useMemo(
    () => [...auditStore, ...seedAudit].sort((a, b) => b.timestamp.localeCompare(a.timestamp)),
    [auditStore],
  );

  const [filtroPerfil, setFiltroPerfil] = useState<FiltroPerfil>('todos');
  const [search, setSearch] = useState('');
  const [soloAnomalias, setSoloAnomalias] = useState(false);

  const anomalias = audit.filter((e) => e.action.includes('denuncia'));

  const perfilChips: FilterChip<FiltroPerfil>[] = [
    { value: 'todos', label: 'Todos los perfiles', count: audit.length },
    {
      value: 'mando',
      label: 'Mando',
      count: audit.filter((e) => e.actorPerfil === 'mando').length,
    },
    {
      value: 'administrativo',
      label: 'Administrativo',
      count: audit.filter((e) => e.actorPerfil === 'administrativo').length,
    },
    {
      value: 'gobierno',
      label: 'Gobierno',
      count: audit.filter((e) => e.actorPerfil === 'gobierno').length,
      intent: 'warn',
    },
    {
      value: 'bombero',
      label: 'Bombero',
      count: audit.filter((e) => e.actorPerfil === 'bombero').length,
    },
  ];

  const filtrados = audit.filter((e) => {
    if (filtroPerfil !== 'todos' && e.actorPerfil !== filtroPerfil) return false;
    if (soloAnomalias && !e.action.includes('denuncia')) return false;
    if (search.trim().length > 0) {
      const persona = personas.find((p) => p.id === e.actor);
      const haystack =
        `${e.action} ${e.entityType} ${e.entityId} ${persona?.nombre ?? ''} ${persona?.apellido ?? ''}`.toLowerCase();
      if (!haystack.includes(search.toLowerCase())) return false;
    }
    return true;
  });

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <PageHero
        objetivo="Gobierno interno · Audit"
        titulo="Quién cambió qué y cuándo"
        descripcion="Registro inmutable que cumple Ley 25.326. Todo lo sensible queda acá: alta, baja, edición, rendición, denuncias, aprobaciones."
        icono={<ScrollText size={26} />}
        meta={
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Kpi
              label="Eventos"
              value={audit.length}
              hint="últimos 30d"
              intent="brand"
              icon={<Activity size={16} />}
            />
            <Kpi
              label="Anomalías IA"
              value={anomalias.length}
              hint="para revisar"
              intent={anomalias.length > 0 ? 'warn' : 'ok'}
              icon={<AlertOctagon size={16} />}
            />
            <Kpi label="Trazabilidad" value="100%" hint="cumplimiento Ley 25.326" intent="ok" />
            <Kpi
              label="Cifrado"
              value="AES-256"
              hint="campos sensibles"
              intent="ok"
              icon={<FileLock2 size={16} />}
            />
          </div>
        }
      />

      <Card className="bg-brand-50 border-brand-100">
        <CardContent className="flex items-start gap-3 p-4 sm:p-5">
          <div className="bg-brand-600 grid h-10 w-10 shrink-0 place-items-center rounded-xl text-white">
            <Sparkles size={20} />
          </div>
          <div className="flex-1">
            <div className="text-brand-900 font-semibold">Detección de anomalías (IA)</div>
            <p className="text-brand-900/80 text-sm">
              La IA escanea el log cada hora buscando patrones inusuales: ediciones masivas a un
              legajo, cambios fuera de horario, mismo actor modificando varias entidades sensibles.
              Te muestra lo que vale la pena revisar.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setSoloAnomalias((s) => !s)}
            className={cn(
              'shrink-0 rounded-md border px-3 py-1.5 text-xs font-semibold transition-colors',
              soloAnomalias
                ? 'border-brand-600 bg-brand-600 text-white'
                : 'border-brand-200 text-brand-700 hover:bg-brand-100 bg-white',
            )}
          >
            {soloAnomalias
              ? 'Ver todos'
              : `Ver ${anomalias.length} anomalía${anomalias.length === 1 ? '' : 's'}`}
          </button>
        </CardContent>
      </Card>

      <FiltersBar
        search={search}
        onSearch={setSearch}
        searchPlaceholder="Buscar por acción, entidad, usuario..."
        chips={perfilChips}
        chipValue={filtroPerfil}
        onChipChange={setFiltroPerfil}
      />

      <Card>
        <CardContent className="p-0">
          {filtrados.length === 0 ? (
            <div className="p-8 text-center">
              <Eye size={32} className="mx-auto text-slate-300" />
              <p className="mt-2 text-sm text-slate-500">Sin eventos con esos filtros.</p>
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {filtrados.map((e) => {
                const persona = personas.find((p) => p.id === e.actor);
                const isAnomalia = e.action.includes('denuncia');
                return (
                  <li
                    key={e.id}
                    className={cn(
                      'flex items-start gap-3 p-4 hover:bg-slate-50',
                      isAnomalia && 'bg-status-warn-bg/30',
                    )}
                  >
                    <div className="shrink-0">
                      {persona ? (
                        <Avatar name={`${persona.nombre} ${persona.apellido}`} size={36} />
                      ) : (
                        <div className="grid h-9 w-9 place-items-center rounded-full bg-slate-200 text-slate-500">
                          <Activity size={16} />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge intent={ACCION_INTENT[e.action] ?? 'neutral'}>{e.action}</Badge>
                        {isAnomalia && (
                          <span className="bg-status-warn-bg text-status-warn-fg inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold">
                            <Sparkles size={10} /> Marcada por IA
                          </span>
                        )}
                      </div>
                      <div className="mt-1 text-sm text-slate-900">
                        <strong>
                          {persona ? `${persona.nombre} ${persona.apellido}` : e.actor}
                        </strong>{' '}
                        <span className="text-slate-500">({perfilLabel[e.actorPerfil]})</span> tocó{' '}
                        <span className="font-mono text-slate-700">
                          {e.entityType}/{e.entityId}
                        </span>
                      </div>
                      {e.diff && (
                        <div className="mt-1.5 rounded-md bg-slate-50 p-2 font-mono text-xs">
                          {Object.entries(e.diff).map(([k, [a, b]]) => (
                            <div key={k}>
                              <span className="text-slate-500">{k}:</span>{' '}
                              <span className="text-status-risk-fg line-through">{String(a)}</span>{' '}
                              → <span className="text-status-ok-fg">{String(b)}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="shrink-0 text-right text-xs text-slate-500">
                      {fmtFechaHora(e.timestamp)}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card className="border-slate-200 bg-slate-50">
        <CardContent className="p-4 text-sm text-slate-600">
          <strong className="text-slate-900">El audit log es inmutable.</strong> No se puede editar
          ni borrar ningún evento. Si necesitás exportar para una auditoría externa, usá{' '}
          <em>Exportar a CSV firmado</em> — incluye hash SHA-256 del bloque.
        </CardContent>
      </Card>
    </div>
  );
}
