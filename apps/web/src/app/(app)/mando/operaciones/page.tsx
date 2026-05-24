'use client';

import {
  Activity,
  Calendar,
  Car,
  Check,
  ChevronDown,
  ChevronUp,
  Flame,
  LifeBuoy,
  MapPin,
  Trees,
  Users,
} from 'lucide-react';
import { useMemo, useState } from 'react';

import type { TipoServicio } from '@faro/types';

import { Badge, Button, Card, CardContent, Kpi, cn, useToast } from '@faro/ui';

import { PageHero } from '../../../../components/shared/page-hero';
import { FiltersBar, type FilterChip } from '../../../../components/shared/filters-bar';
import { fmtFechaHora, fmtHora } from '../../../../lib/utils/date';
import { tipoServicioLabel } from '../../../../lib/utils/tipo-servicio';
import {
  useFaroStore,
  selectCuartelActivo,
  selectPersonaActual,
} from '../../../../store/use-faro-store';

type TabTipo = 'todos' | TipoServicio;
type EstadoFiltro = 'todos' | 'pendientes' | 'validados';

const TIPO_ICON: Record<TipoServicio, React.ReactNode> = {
  incendio: <Flame size={16} />,
  rescate: <LifeBuoy size={16} />,
  accidente: <Car size={16} />,
  forestal: <Trees size={16} />,
  otro: <Activity size={16} />,
};

const TIPO_COLOR: Record<TipoServicio, string> = {
  incendio: 'bg-fire-600',
  rescate: 'bg-status-warn',
  accidente: 'bg-slate-600',
  forestal: 'bg-status-ok',
  otro: 'bg-slate-400',
};

export default function OperacionesPage() {
  const cuartel = useFaroStore(selectCuartelActivo);
  const allServicios = useFaroStore((s) => s.servicios);
  const moviles = useFaroStore((s) => s.moviles);
  const personas = useFaroStore((s) => s.personas);
  const persona = useFaroStore(selectPersonaActual);
  const validar = useFaroStore((s) => s.validarServicio);
  const toast = useToast();

  const [tab, setTab] = useState<TabTipo>('todos');
  const [estado, setEstado] = useState<EstadoFiltro>('todos');
  const [expandido, setExpandido] = useState<string | null>(null);

  const servicios = useMemo(
    () =>
      allServicios
        .filter((s) => s.cuartelId === cuartel?.id)
        .sort((a, b) => b.horaSalida.localeCompare(a.horaSalida)),
    [allServicios, cuartel?.id],
  );

  const pendientes = servicios.filter((s) => s.estado === 'pendiente_validacion');
  const validados = servicios.filter((s) => s.estado === 'validado');

  const filtradas = useMemo(() => {
    return servicios.filter((s) => {
      if (tab !== 'todos' && s.tipo !== tab) return false;
      if (estado === 'pendientes' && s.estado !== 'pendiente_validacion') return false;
      if (estado === 'validados' && s.estado !== 'validado') return false;
      return true;
    });
  }, [servicios, tab, estado]);

  const tipoCounts: Record<TipoServicio, number> = {
    incendio: 0,
    rescate: 0,
    accidente: 0,
    forestal: 0,
    otro: 0,
  };
  for (const s of servicios) tipoCounts[s.tipo] += 1;

  const tipoChips: FilterChip<TabTipo>[] = [
    { value: 'todos', label: 'Todos', count: servicios.length },
    { value: 'incendio', label: 'Incendio', count: tipoCounts.incendio, intent: 'risk' },
    { value: 'rescate', label: 'Rescate', count: tipoCounts.rescate, intent: 'warn' },
    { value: 'accidente', label: 'Accidente', count: tipoCounts.accidente },
    { value: 'forestal', label: 'Forestal', count: tipoCounts.forestal, intent: 'ok' },
  ];

  const estadoChips: FilterChip<EstadoFiltro>[] = [
    { value: 'todos', label: 'Cualquier estado' },
    {
      value: 'pendientes',
      label: 'Esperan validación',
      count: pendientes.length,
      intent: 'warn',
    },
    { value: 'validados', label: 'Ya validados', count: validados.length, intent: 'ok' },
  ];

  const horasMes = servicios.reduce((acc, s) => {
    const h = (new Date(s.horaRegreso).getTime() - new Date(s.horaSalida).getTime()) / 3.6e6;
    return acc + Math.max(0, h);
  }, 0);

  function handleValidar(id: string) {
    if (!persona) return;
    validar(id, persona.id);
    toast.push({
      kind: 'success',
      title: 'Servicio validado',
      description: 'Sumado al cómputo y a la rendición.',
    });
  }

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <PageHero
        objetivo="Vista Mando · Operaciones"
        titulo={
          pendientes.length > 0
            ? `${pendientes.length} servicio${pendientes.length === 1 ? '' : 's'} esperan tu validación`
            : 'Operativo del cuartel'
        }
        descripcion="Validás los servicios que cargaron los bomberos, ves la actividad y el estado de las dotaciones. Doble check humano antes de sumar al cómputo."
        icono={<Activity size={26} />}
        variant={pendientes.length > 0 ? 'critical' : 'default'}
        meta={
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Kpi
              label="Servicios del mes"
              value={servicios.length}
              intent="brand"
              icon={<Flame size={16} />}
            />
            <Kpi
              label="Esperan validación"
              value={pendientes.length}
              intent={pendientes.length > 0 ? 'warn' : 'ok'}
            />
            <Kpi
              label="Horas operativas"
              value={Math.round(horasMes)}
              hint="acumuladas"
              intent="neutral"
            />
            <Kpi
              label="Cargados vía app"
              value={servicios.filter((s) => s.origen === 'app').length}
              hint="en tiempo real"
              intent="ok"
              icon={<Calendar size={16} />}
            />
          </div>
        }
      />

      <Card className="overflow-hidden">
        <div className="border-b border-slate-100 px-4 py-3 sm:px-5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Últimos 7 días</h3>
            <span className="text-[11px] text-slate-500">hoy a la derecha</span>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-px bg-slate-100 sm:gap-1 sm:bg-transparent sm:p-1.5">
          {(() => {
            const hoy = new Date('2026-05-24');
            const dias = Array.from({ length: 7 }).map((_, i) => {
              const d = new Date(hoy);
              d.setDate(hoy.getDate() - (6 - i));
              return d;
            });
            return dias.map((d, idx) => {
              const ymd = d.toISOString().slice(0, 10);
              const enDia = servicios.filter((s) => s.horaSalida.slice(0, 10) === ymd);
              const isToday = idx === dias.length - 1;
              const principal = enDia[0];
              return (
                <div
                  key={ymd}
                  className={cn(
                    'flex flex-col items-center bg-white p-2 sm:rounded-lg sm:border sm:p-2.5',
                    isToday ? 'sm:border-brand-300 sm:bg-brand-50' : 'sm:border-slate-100',
                  )}
                >
                  <div
                    className={cn(
                      'text-[10px] uppercase tracking-wide',
                      isToday ? 'text-brand-700 font-bold' : 'text-slate-500',
                    )}
                  >
                    {d.toLocaleDateString('es-AR', { weekday: 'short' })}
                  </div>
                  <div
                    className={cn(
                      'mt-0.5 text-base font-bold sm:text-lg',
                      isToday ? 'text-brand-700' : 'text-slate-900',
                    )}
                  >
                    {d.getDate()}
                  </div>
                  {principal ? (
                    <div className="relative mt-1.5">
                      <div
                        className={cn(
                          'grid h-6 w-6 place-items-center rounded-full text-white sm:h-7 sm:w-7',
                          TIPO_COLOR[principal.tipo],
                        )}
                      >
                        {TIPO_ICON[principal.tipo]}
                      </div>
                      {enDia.length > 1 && (
                        <span className="absolute -right-1 -top-1 grid h-3.5 min-w-3.5 place-items-center rounded-full bg-slate-900 px-0.5 text-[9px] font-bold tabular-nums text-white">
                          {enDia.length}
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="mt-1.5 h-6 w-6 rounded-full border border-dashed border-slate-200 sm:h-7 sm:w-7" />
                  )}
                </div>
              );
            });
          })()}
        </div>
      </Card>

      <FiltersBar chips={tipoChips} chipValue={tab} onChipChange={setTab} />
      <FiltersBar chips={estadoChips} chipValue={estado} onChipChange={setEstado} />

      <div className="space-y-3">
        {filtradas.map((s) => {
          const movil = moviles.find((m) => m.id === s.movilId);
          const dotacion = s.dotacionIds
            .map((id) => personas.find((p) => p.id === id))
            .filter(Boolean);
          const dur = Math.round(
            (new Date(s.horaRegreso).getTime() - new Date(s.horaSalida).getTime()) / 60_000,
          );
          const isExpanded = expandido === s.id;
          return (
            <Card key={s.id} className="overflow-hidden">
              <button
                type="button"
                onClick={() => setExpandido(isExpanded ? null : s.id)}
                className="w-full p-4 text-left hover:bg-slate-50"
              >
                <div className="flex items-start gap-3">
                  <div
                    className={cn(
                      'grid h-12 w-12 shrink-0 place-items-center rounded-xl text-white',
                      TIPO_COLOR[s.tipo],
                    )}
                  >
                    {TIPO_ICON[s.tipo]}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-slate-900">
                        {tipoServicioLabel[s.tipo]}
                      </span>
                      <Badge intent={s.origen === 'app' ? 'brand' : 'neutral'}>
                        {s.origen === 'app' ? 'vía app' : 'manual'}
                      </Badge>
                      {s.estado === 'pendiente_validacion' && (
                        <Badge intent="warn">Sin validar</Badge>
                      )}
                      {s.estado === 'validado' && <Badge intent="ok">Validado</Badge>}
                    </div>
                    <div className="mt-1 flex items-center gap-1 text-sm text-slate-700">
                      <MapPin size={12} className="shrink-0 text-slate-400" />
                      <span className="truncate">{s.direccion}</span>
                    </div>
                    <div className="mt-1 text-xs text-slate-500">
                      {fmtFechaHora(s.horaSalida)} → {fmtHora(s.horaRegreso)} · {dur} min ·{' '}
                      {dotacion.length} persona{dotacion.length === 1 ? '' : 's'} ·{' '}
                      {movil?.codigo ?? '—'}
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    {s.estado === 'pendiente_validacion' && (
                      <Button
                        intent="success"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleValidar(s.id);
                        }}
                      >
                        <Check size={14} /> Validar
                      </Button>
                    )}
                    {isExpanded ? (
                      <ChevronUp size={18} className="text-slate-400" />
                    ) : (
                      <ChevronDown size={18} className="text-slate-400" />
                    )}
                  </div>
                </div>
              </button>

              {isExpanded && (
                <div className="border-t border-slate-100 bg-slate-50 px-4 py-3 text-sm">
                  <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-wide text-slate-500">
                    <Users size={12} /> Dotación
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {dotacion.map((p) => (
                      <span
                        key={p!.id}
                        className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs"
                      >
                        <span className="font-medium text-slate-900">
                          {p!.nombre} {p!.apellido}
                        </span>
                        <span className="font-mono text-slate-500">{p!.legajo}</span>
                      </span>
                    ))}
                  </div>
                  {s.notas && (
                    <div className="mt-3 rounded-md bg-white p-2 text-slate-700">
                      <span className="text-xs font-semibold text-slate-500">NOTAS · </span>
                      {s.notas}
                    </div>
                  )}
                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-600 sm:grid-cols-4">
                    <div>
                      <div className="text-slate-500">GPS</div>
                      <div className="font-mono">
                        {s.lat.toFixed(4)}, {s.lng.toFixed(4)}
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-500">Móvil</div>
                      <div className="font-medium">
                        {movil?.codigo} · {movil?.tipo}
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-500">Duración</div>
                      <div className="font-medium">{dur} min</div>
                    </div>
                    <div>
                      <div className="text-slate-500">Origen</div>
                      <div className="font-medium capitalize">{s.origen}</div>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          );
        })}

        {filtradas.length === 0 && (
          <Card>
            <CardContent className="p-6 text-center text-sm text-slate-500">
              Sin servicios con esos filtros.
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
