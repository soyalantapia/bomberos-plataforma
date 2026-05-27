'use client';

import {
  Activity,
  Calendar,
  Car,
  Check,
  ChevronDown,
  ChevronUp,
  Clock,
  Flame,
  LifeBuoy,
  MapPin,
  Navigation,
  Radio,
  Trees,
  Truck,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

import type { TipoServicio } from '@faro/types';

import { Badge, Button, Card, CardContent, Kpi, cn, useToast } from '@faro/ui';

import { PageHero } from '../../../../components/shared/page-hero';
import { FiltersBar, type FilterChip } from '../../../../components/shared/filters-bar';
import { MapView } from '../../../../components/shared/map-view';
import { fmtFechaHora, fmtHora } from '../../../../lib/utils/date';
import { demoToday } from '../../../../lib/utils/demo-today';
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
  const [vista, setVista] = useState<'lista' | 'mapa' | 'vivo'>('lista');

  // ── Animación de móvil en vivo ──
  // Trayectoria simulada: cuartel → incendio en V. Devoto
  const RUTA_VIVO = useMemo(
    () => [
      { lat: cuartel?.lat ?? -34.5476, lng: cuartel?.lng ?? -58.5556 },
      { lat: -34.5495, lng: -58.5605 },
      { lat: -34.5532, lng: -58.5639 },
      { lat: -34.5571, lng: -58.5658 },
      { lat: -34.5612, lng: -58.5651 },
      { lat: -34.5644, lng: -58.561 },
      { lat: -34.567, lng: -58.5556 }, // destino: incendio
    ],
    [cuartel?.lat, cuartel?.lng],
  );
  const [vivoIdx, setVivoIdx] = useState(0);
  const [vivoCorriendo, setVivoCorriendo] = useState(true);
  const [vivoT, setVivoT] = useState(0); // 0..1 interpolación dentro del segmento

  useEffect(() => {
    if (vista !== 'vivo' || !vivoCorriendo) return;
    if (vivoIdx >= RUTA_VIVO.length - 1) return;

    const interval = setInterval(() => {
      setVivoT((t) => {
        const next = t + 0.05;
        if (next >= 1) {
          setVivoIdx((i) => Math.min(i + 1, RUTA_VIVO.length - 1));
          return 0;
        }
        return next;
      });
    }, 200);

    return () => clearInterval(interval);
  }, [vista, vivoCorriendo, vivoIdx, RUTA_VIVO.length]);

  const vivoActual = useMemo(() => {
    const a = RUTA_VIVO[vivoIdx];
    const b = RUTA_VIVO[vivoIdx + 1];
    if (!a) return RUTA_VIVO[RUTA_VIVO.length - 1] ?? { lat: 0, lng: 0 };
    if (!b) return a;
    return {
      lat: a.lat + (b.lat - a.lat) * vivoT,
      lng: a.lng + (b.lng - a.lng) * vivoT,
    };
  }, [vivoIdx, vivoT, RUTA_VIVO]);

  const vivoLlegado = vivoIdx >= RUTA_VIVO.length - 1;
  const rutaRecorrida = RUTA_VIVO.slice(0, vivoIdx + 1).concat([vivoActual]);
  const segundosTranscurridos = vivoIdx * 4 + Math.round(vivoT * 4);
  const minutosEstimados = Math.max(0, (RUTA_VIVO.length - 1) * 4 - segundosTranscurridos);

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
      label: 'Falta tu firma',
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
              label="Falta tu firma"
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
            const hoy = demoToday();
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

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setVista('lista')}
          className={cn(
            'inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-sm font-medium transition-colors',
            vista === 'lista'
              ? 'bg-brand-600 text-white'
              : 'bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50',
          )}
        >
          <Activity size={14} /> Lista
        </button>
        <button
          type="button"
          onClick={() => setVista('mapa')}
          className={cn(
            'inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-sm font-medium transition-colors',
            vista === 'mapa'
              ? 'bg-brand-600 text-white'
              : 'bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50',
          )}
        >
          <MapPin size={14} /> Mapa
        </button>
        <button
          type="button"
          onClick={() => {
            setVista('vivo');
            setVivoIdx(0);
            setVivoT(0);
            setVivoCorriendo(true);
          }}
          className={cn(
            'inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-sm font-medium transition-colors',
            vista === 'vivo'
              ? 'bg-fire-600 text-white'
              : 'bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50',
          )}
        >
          <Radio size={14} className={vista === 'vivo' ? 'animate-pulse' : ''} />
          En vivo
          {vista === 'vivo' && !vivoLlegado && (
            <span className="ml-1 h-2 w-2 animate-pulse rounded-full bg-white" />
          )}
        </button>
      </div>

      {vista === 'vivo' && (
        <>
          <Card
            className={cn(
              'border-2',
              vivoLlegado ? 'border-status-ok bg-status-ok-bg/30' : 'border-fire-300 bg-fire-50',
            )}
          >
            <CardContent className="p-4 sm:p-5">
              <div className="flex flex-wrap items-start gap-3">
                <div
                  className={cn(
                    'grid h-12 w-12 shrink-0 place-items-center rounded-xl text-white',
                    vivoLlegado ? 'bg-status-ok' : 'bg-fire-600 animate-pulse',
                  )}
                >
                  {vivoLlegado ? <Check size={24} /> : <Truck size={24} />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-lg font-bold text-slate-900">
                      {vivoLlegado ? 'Móvil BV-3 en sitio' : 'Móvil BV-3 en ruta'}
                    </span>
                    {!vivoLlegado && (
                      <Badge intent="risk">
                        <Radio size={10} className="mr-1 animate-pulse" /> EN VIVO
                      </Badge>
                    )}
                  </div>
                  <div className="mt-0.5 text-sm text-slate-700">
                    Servicio: <strong>Incendio en V. Devoto</strong> · Av. Mosconi 4521
                  </div>
                  <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
                    <div className="rounded-md bg-white/80 px-2 py-1.5">
                      <div className="text-slate-500">Recorrido</div>
                      <div className="flex items-center gap-1 font-bold text-slate-900">
                        <Navigation size={11} />
                        {Math.round((vivoIdx / (RUTA_VIVO.length - 1)) * 100)}%
                      </div>
                    </div>
                    <div className="rounded-md bg-white/80 px-2 py-1.5">
                      <div className="text-slate-500">Tiempo</div>
                      <div className="flex items-center gap-1 font-bold text-slate-900">
                        <Clock size={11} />
                        {segundosTranscurridos}s
                      </div>
                    </div>
                    <div className="rounded-md bg-white/80 px-2 py-1.5">
                      <div className="text-slate-500">{vivoLlegado ? 'Estado' : 'Llega en'}</div>
                      <div className="font-bold text-slate-900">
                        {vivoLlegado ? 'En el lugar' : `~${Math.ceil(minutosEstimados / 60)} min`}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-500">Dotación</div>
                  <div className="flex -space-x-1.5">
                    {personas.slice(0, 4).map((p) => (
                      <div
                        key={p.id}
                        className="bg-brand-600 grid h-7 w-7 place-items-center rounded-full text-[10px] font-bold text-white ring-2 ring-white"
                        title={`${p.nombre} ${p.apellido}`}
                      >
                        {p.nombre[0]}
                        {p.apellido[0]}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden p-0">
            <MapView
              center={
                cuartel ? { lat: cuartel.lat, lng: cuartel.lng } : { lat: -34.5476, lng: -58.5556 }
              }
              zoom={14}
              pins={[
                // Cuartel (origen)
                ...(cuartel
                  ? [
                      {
                        id: 'cuartel',
                        lat: cuartel.lat,
                        lng: cuartel.lng,
                        color: 'bg-brand-700',
                        label: '🏠',
                        popup:
                          '<div style="font-family:system-ui;padding:4px"><strong>' +
                          cuartel.nombre +
                          '</strong><div style="font-size:11px;color:#64748b">Origen</div></div>',
                      },
                    ]
                  : []),
                // Móvil en vivo (animado)
                {
                  id: 'movil',
                  lat: vivoActual.lat,
                  lng: vivoActual.lng,
                  color: vivoLlegado ? 'bg-status-ok' : 'bg-fire-600',
                  label: '🚒',
                  pulse: !vivoLlegado,
                },
                // Destino (incendio)
                {
                  id: 'destino',
                  lat: -34.567,
                  lng: -58.5556,
                  color: 'bg-fire-700',
                  label: '🔥',
                  popup:
                    '<div style="font-family:system-ui;padding:4px"><strong>Incendio</strong><div style="font-size:11px;color:#64748b">Av. Mosconi 4521</div></div>',
                },
              ]}
              polyline={{
                points: rutaRecorrida,
                color: '#dc2626',
                width: 4,
                dashed: false,
              }}
            />
          </Card>

          <Card className="border-slate-200 bg-slate-50">
            <CardContent className="flex items-start gap-3 p-4 text-sm text-slate-600">
              <Radio size={18} className="mt-0.5 shrink-0 text-slate-400" />
              <div>
                <strong className="text-slate-900">Operativo en vivo:</strong> seguís la posición
                del móvil con la app del jefe de servicio enviando GPS cada 30 segundos. El
                historial de la ruta queda registrado y se vincula al servicio cuando se valida.
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {vista === 'mapa' ? (
        <Card className="overflow-hidden p-0">
          <MapView
            center={
              cuartel ? { lat: cuartel.lat, lng: cuartel.lng } : { lat: -34.5476, lng: -58.5556 }
            }
            zoom={13}
            pins={filtradas.map((s) => ({
              id: s.id,
              lat: s.lat,
              lng: s.lng,
              color: TIPO_COLOR[s.tipo],
              label: s.tipo[0]?.toUpperCase() ?? '',
              popup:
                '<div style="font-family:system-ui;padding:4px 2px;min-width:180px">' +
                '<div style="font-weight:700;color:#0f172a;font-size:13px">' +
                tipoServicioLabel[s.tipo] +
                '</div>' +
                '<div style="font-size:12px;color:#475569;margin-top:2px">' +
                s.direccion +
                '</div>' +
                '<div style="font-size:11px;color:#94a3b8;margin-top:4px">' +
                fmtFechaHora(s.horaSalida) +
                ' · ' +
                s.dotacionIds.length +
                'p</div>' +
                '</div>',
            }))}
          />
        </Card>
      ) : null}

      {vista === 'lista' && (
        <>
          <FiltersBar chips={tipoChips} chipValue={tab} onChipChange={setTab} />
          <FiltersBar chips={estadoChips} chipValue={estado} onChipChange={setEstado} />
        </>
      )}

      {vista === 'lista' && (
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
                          <Badge intent="warn">Falta firma</Badge>
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
                      <Link
                        href={`/mando/operaciones/${s.id}` as never}
                        onClick={(e) => e.stopPropagation()}
                        className="text-brand-700 hover:bg-brand-50 grid h-8 w-8 place-items-center rounded text-xs font-bold"
                        aria-label={`Ver detalle del servicio ${s.direccion}`}
                      >
                        <span aria-hidden="true">→</span>
                      </Link>
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
      )}
    </div>
  );
}
