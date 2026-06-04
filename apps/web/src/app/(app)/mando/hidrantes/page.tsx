'use client';

import {
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Droplets,
  MapPin,
  Search,
  Wrench,
  X,
} from 'lucide-react';
import { useMemo, useState } from 'react';

import { Badge, Button, Card, CardContent, Kpi, cn, useToast } from '@faro/ui';

import { NuevoHidranteDialog } from '../../../../components/hidrantes/nuevo-hidrante-dialog';
import { PageHero } from '../../../../components/shared/page-hero';
import { MapView } from '../../../../components/shared/map-view';
import type { EstadoHidrante, Hidrante } from '../../../../data/hidrantes';
import { selectCuartelActivo, useFaroStore } from '../../../../store/use-faro-store';
import { fmtFechaCorta } from '../../../../lib/utils/date';
import { demoToday } from '../../../../lib/utils/demo-today';

type HidranteAlta = Pick<
  Hidrante,
  'codigo' | 'direccion' | 'lat' | 'lng' | 'tipo' | 'caudal' | 'presion' | 'proveedor'
>;

const ESTADO_CONFIG: Record<EstadoHidrante, { color: string; bg: string; label: string }> = {
  operativo: { color: 'bg-status-ok', bg: 'bg-status-ok-bg/30', label: 'Operativo' },
  caudal_bajo: { color: 'bg-status-warn', bg: 'bg-status-warn-bg/30', label: 'Caudal bajo' },
  mantenimiento: { color: 'bg-brand-600', bg: 'bg-brand-50', label: 'En mantenimiento' },
  fuera_servicio: {
    color: 'bg-status-risk',
    bg: 'bg-status-risk-bg/30',
    label: 'Fuera de servicio',
  },
};

const TIPO_DOT: Record<Hidrante['tipo'], { color: string; size: string }> = {
  rojo_70mm: { color: 'bg-red-600', size: '70mm' },
  amarillo_100mm: { color: 'bg-yellow-500', size: '100mm' },
  azul_150mm: { color: 'bg-blue-600', size: '150mm' },
  verde_200mm: { color: 'bg-green-600', size: '200mm' },
};

const ESTADOS_MANUALES: EstadoHidrante[] = ['operativo', 'mantenimiento', 'fuera_servicio'];

export default function HidrantesPage() {
  const toast = useToast();
  const cuartel = useFaroStore(selectCuartelActivo);
  const hidrantesAll = useFaroStore((s) => s.hidrantes);
  const agregarHidrante = useFaroStore((s) => s.agregarHidrante);
  const actualizarHidrante = useFaroStore((s) => s.actualizarHidrante);
  const [filtro, setFiltro] = useState<'todos' | EstadoHidrante>('todos');
  const [search, setSearch] = useState('');
  const [seleccionado, setSeleccionado] = useState<string | null>(null);
  const [nuevoOpen, setNuevoOpen] = useState(false);

  const hidrantes = useMemo(
    () => hidrantesAll.filter((h) => h.cuartelId === cuartel?.id),
    [hidrantesAll, cuartel?.id],
  );

  const filtrados = useMemo(() => {
    return hidrantes.filter((h) => {
      if (filtro !== 'todos' && h.estado !== filtro) return false;
      if (search.trim().length > 0) {
        const q = search.toLowerCase();
        if (!(h.direccion + h.codigo).toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [filtro, search, hidrantes]);

  const conteo = {
    operativo: hidrantes.filter((h) => h.estado === 'operativo').length,
    caudal_bajo: hidrantes.filter((h) => h.estado === 'caudal_bajo').length,
    mantenimiento: hidrantes.filter((h) => h.estado === 'mantenimiento').length,
    fuera_servicio: hidrantes.filter((h) => h.estado === 'fuera_servicio').length,
  };

  function agregar(h: HidranteAlta) {
    if (!cuartel) return;
    const hoy = demoToday();
    const prox = new Date(hoy);
    prox.setMonth(prox.getMonth() + 6);
    agregarHidrante({
      ...h,
      cuartelId: cuartel.id,
      ultimoTest: hoy.toISOString().slice(0, 10),
      proximoTest: prox.toISOString().slice(0, 10),
    });
  }

  function probar(h: Hidrante) {
    const hoy = demoToday();
    const prox = new Date(hoy);
    prox.setMonth(prox.getMonth() + 6);
    actualizarHidrante(h.id, {
      ultimoTest: hoy.toISOString().slice(0, 10),
      proximoTest: prox.toISOString().slice(0, 10),
    });
    toast.push({
      kind: 'success',
      title: `${h.codigo} probado`,
      description: `${h.caudal} L/m · ${h.presion} bar · ${hoy.toISOString().slice(0, 10)}`,
    });
  }

  function cambiarEstado(h: Hidrante, estado: EstadoHidrante) {
    if (h.estado === estado) return;
    actualizarHidrante(h.id, { estado });
    toast.push({
      kind: estado === 'operativo' ? 'success' : 'info',
      title: `${h.codigo} · ${ESTADO_CONFIG[estado].label}`,
      description: 'Estado actualizado en el registro del cuartel.',
    });
  }

  function reportarMunicipio(h: Hidrante) {
    toast.push({
      kind: 'success',
      title: `Reclamo enviado · ${h.codigo}`,
      description: `Notificado a ${h.proveedor} · turno 72h`,
    });
  }

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <PageHero
        objetivo="Vista Mando · Hidrantes municipales"
        titulo={`${hidrantes.length} hidrantes en jurisdicción`}
        descripcion="Mapeados con caudal, presión y estado. El registro es del cuartel: cargá nuevos, cambiá el estado y dejá constancia de cada prueba."
        icono={<Droplets size={26} />}
        meta={
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Kpi label="Operativos" value={conteo.operativo} intent="ok" />
            <Kpi
              label="Caudal bajo"
              value={conteo.caudal_bajo}
              intent={conteo.caudal_bajo > 0 ? 'warn' : 'neutral'}
            />
            <Kpi label="Mantenimiento" value={conteo.mantenimiento} intent="brand" />
            <Kpi
              label="Fuera servicio"
              value={conteo.fuera_servicio}
              intent={conteo.fuera_servicio > 0 ? 'risk' : 'ok'}
            />
          </div>
        }
        acciones={
          <button
            type="button"
            onClick={() => setNuevoOpen(true)}
            className="bg-brand-600 hover:bg-brand-700 inline-flex h-10 items-center gap-1.5 rounded-lg px-3 text-sm font-medium text-white"
          >
            <Droplets size={14} /> Nuevo hidrante
          </button>
        }
      />

      {/* Filtros */}
      <Card>
        <CardContent className="flex flex-wrap items-center gap-2 p-3">
          <div className="relative min-w-[200px] flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por dirección o código..."
              className="focus:border-brand-400 w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:ring-2"
            />
          </div>
          {(['todos', 'operativo', 'caudal_bajo', 'mantenimiento', 'fuera_servicio'] as const).map(
            (f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFiltro(f)}
                className={cn(
                  'rounded-full px-3 py-1 text-xs font-medium transition-colors',
                  filtro === f
                    ? 'bg-brand-600 text-white'
                    : 'bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50',
                )}
              >
                {f === 'todos' ? 'Todos' : ESTADO_CONFIG[f].label}
              </button>
            ),
          )}
        </CardContent>
      </Card>

      {/* Mapa */}
      <Card className="overflow-hidden p-0">
        <MapView
          center={
            cuartel ? { lat: cuartel.lat, lng: cuartel.lng } : { lat: -34.5476, lng: -58.5556 }
          }
          zoom={14}
          pins={[
            ...(cuartel
              ? [
                  {
                    id: 'cuartel',
                    lat: cuartel.lat,
                    lng: cuartel.lng,
                    color: 'bg-brand-700',
                    label: '🏠',
                  },
                ]
              : []),
            ...filtrados.map((h) => ({
              id: h.id,
              lat: h.lat,
              lng: h.lng,
              color: ESTADO_CONFIG[h.estado].color,
              label: '💧',
              popup:
                '<strong>' +
                h.codigo +
                '</strong><div style="font-size:11px;color:#64748b">' +
                h.direccion +
                '</div><div style="font-size:11px;color:#64748b">' +
                h.caudal +
                ' L/min · ' +
                h.presion +
                ' bar</div>',
            })),
          ]}
        />
      </Card>

      {/* Lista */}
      <div className="grid gap-3 sm:grid-cols-2">
        {filtrados.map((h) => {
          const cfg = ESTADO_CONFIG[h.estado];
          const tipoCfg = TIPO_DOT[h.tipo];
          return (
            <Card
              key={h.id}
              className={cn(
                'cursor-pointer overflow-hidden border-2 transition-colors hover:shadow-md',
                seleccionado === h.id ? 'border-brand-400' : 'border-slate-200',
              )}
              onClick={() => setSeleccionado(seleccionado === h.id ? null : h.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div
                    className={cn(
                      'grid h-12 w-12 shrink-0 place-items-center rounded-xl text-white',
                      tipoCfg.color,
                    )}
                  >
                    <Droplets size={20} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900">{h.codigo}</span>
                      <Badge
                        intent={
                          h.estado === 'operativo'
                            ? 'ok'
                            : h.estado === 'fuera_servicio'
                              ? 'risk'
                              : 'warn'
                        }
                      >
                        {cfg.label}
                      </Badge>
                    </div>
                    <div className="mt-0.5 flex items-center gap-1 text-xs text-slate-600">
                      <MapPin size={11} />
                      <span className="truncate">{h.direccion}</span>
                    </div>

                    <div className="mt-2 grid grid-cols-3 gap-1.5 text-xs">
                      <div className={cn('rounded-md p-1.5', cfg.bg)}>
                        <div className="text-[10px] text-slate-500">Caudal</div>
                        <div className="font-bold tabular-nums">{h.caudal} L/m</div>
                      </div>
                      <div className={cn('rounded-md p-1.5', cfg.bg)}>
                        <div className="text-[10px] text-slate-500">Presión</div>
                        <div className="font-bold tabular-nums">{h.presion} bar</div>
                      </div>
                      <div className={cn('rounded-md p-1.5', cfg.bg)}>
                        <div className="text-[10px] text-slate-500">Boca</div>
                        <div className="font-bold tabular-nums">{tipoCfg.size}</div>
                      </div>
                    </div>

                    {h.notas && (
                      <div className="bg-status-warn-bg/40 text-status-warn-fg mt-2 flex items-start gap-2 rounded p-2 text-xs">
                        <AlertTriangle size={11} className="mt-0.5 shrink-0" />
                        <span>{h.notas}</span>
                      </div>
                    )}

                    {seleccionado === h.id && (
                      <div className="mt-3 space-y-2 border-t border-slate-100 pt-3 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">
                            <Calendar size={11} className="mr-1 inline" />
                            Último test
                          </span>
                          <span className="font-medium">{fmtFechaCorta(h.ultimoTest)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">
                            <Calendar size={11} className="mr-1 inline" />
                            Próximo
                          </span>
                          <span className="font-medium">{fmtFechaCorta(h.proximoTest)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">Prestadora</span>
                          <span className="font-medium">{h.proveedor}</span>
                        </div>

                        {/* Cambiar estado — persiste en el registro del cuartel */}
                        <div className="flex flex-wrap items-center gap-1.5 pt-1">
                          <span className="text-slate-500">Estado:</span>
                          {ESTADOS_MANUALES.map((e) => (
                            <button
                              key={e}
                              type="button"
                              onClick={(ev) => {
                                ev.stopPropagation();
                                cambiarEstado(h, e);
                              }}
                              className={cn(
                                'rounded-full px-2 py-0.5 text-[11px] font-medium transition-colors',
                                h.estado === e
                                  ? 'bg-brand-600 text-white'
                                  : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50',
                              )}
                            >
                              {ESTADO_CONFIG[e].label}
                            </button>
                          ))}
                        </div>

                        <div className="flex flex-wrap gap-2 pt-2">
                          {h.estado !== 'operativo' && (
                            <Button
                              intent="primary"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                reportarMunicipio(h);
                              }}
                            >
                              <Wrench size={12} /> Reclamar a {h.proveedor}
                            </Button>
                          )}
                          <Button
                            intent="secondary"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              probar(h);
                            }}
                          >
                            <CheckCircle2 size={12} /> Marcar como probado
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Leyenda */}
      <Card>
        <CardContent className="p-4">
          <div className="mb-2 text-xs font-semibold uppercase text-slate-500">
            Código de colores por caudal
          </div>
          <div className="flex flex-wrap gap-3 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="grid h-5 w-5 place-items-center rounded bg-red-600">
                <X size={10} className="text-white" />
              </span>
              <span>&lt;500 L/m · Rojo · 70mm</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="grid h-5 w-5 place-items-center rounded bg-yellow-500" />
              <span>500-1000 L/m · Amarillo · 100mm</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="grid h-5 w-5 place-items-center rounded bg-blue-600" />
              <span>1000-1500 L/m · Azul · 150mm</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="grid h-5 w-5 place-items-center rounded bg-green-600" />
              <span>&gt;1500 L/m · Verde · 200mm+</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <NuevoHidranteDialog
        open={nuevoOpen}
        onClose={() => setNuevoOpen(false)}
        onCreated={agregar}
      />
    </div>
  );
}
