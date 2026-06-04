'use client';

import { motion } from 'framer-motion';
import { Activity, Clock, Flame, Navigation, Radio, Truck } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { Badge, Card, CardContent, Kpi, cn } from '@faro/ui';

import { PageHero } from '../../../../components/shared/page-hero';
import { MapView } from '../../../../components/shared/map-view';
import { selectCuartelActivo, useFaroStore } from '../../../../store/use-faro-store';

type EstadoMovil =
  | 'disponible'
  | 'en_ruta'
  | 'en_escena'
  | 'regresando'
  | 'fuera_servicio'
  | 'mantenimiento';

interface MovilLive {
  id: string;
  codigo: string;
  tipo: string;
  estado: EstadoMovil;
  lat: number;
  lng: number;
  velocidad: number; // km/h
  rumbo: number; // grados
  dotacion: number;
  jefe: string;
  servicio?: string;
  desde: string; // ts del estado actual
  // Para Tiempo objetivo
  turnoutSec?: number; // tiempo de despacho (60s)
  travelSec?: number; // tiempo en ruta
}

const ESTADO_CONFIG: Record<
  EstadoMovil,
  { label: string; color: string; bg: string; pulse: boolean }
> = {
  disponible: {
    label: 'Disponible',
    color: 'bg-status-ok',
    bg: 'bg-status-ok-bg/30',
    pulse: false,
  },
  en_ruta: {
    label: 'Yendo al lugar',
    color: 'bg-fire-600',
    bg: 'bg-fire-50',
    pulse: true,
  },
  en_escena: {
    label: 'En el lugar',
    color: 'bg-status-risk',
    bg: 'bg-status-risk-bg/30',
    pulse: true,
  },
  regresando: {
    label: 'Volviendo al cuartel',
    color: 'bg-brand-600',
    bg: 'bg-brand-50',
    pulse: false,
  },
  fuera_servicio: {
    label: 'Fuera de servicio',
    color: 'bg-slate-400',
    bg: 'bg-slate-100',
    pulse: false,
  },
  mantenimiento: {
    label: 'Mantenimiento',
    color: 'bg-status-warn',
    bg: 'bg-status-warn-bg/30',
    pulse: false,
  },
};

const MOVILES_INICIAL: MovilLive[] = [
  {
    id: 'movil-bv3',
    codigo: 'BV-3',
    tipo: 'Autobomba',
    estado: 'en_ruta',
    lat: -34.5556,
    lng: -58.5602,
    velocidad: 62,
    rumbo: 135,
    dotacion: 4,
    jefe: 'Mariana Pereyra',
    servicio: 'Incendio · Av. Mosconi 4521',
    desde: '14:42',
    turnoutSec: 48,
    travelSec: 142,
  },
  {
    id: 'movil-bv5',
    codigo: 'BV-5',
    tipo: 'Rescate liviano',
    estado: 'disponible',
    lat: -34.5476,
    lng: -58.5556,
    velocidad: 0,
    rumbo: 0,
    dotacion: 3,
    jefe: 'Sebastián Ruiz',
    desde: '12:00',
  },
  {
    id: 'movil-bv7',
    codigo: 'BV-7',
    tipo: 'Forestal',
    estado: 'mantenimiento',
    lat: -34.5476,
    lng: -58.5556,
    velocidad: 0,
    rumbo: 0,
    dotacion: 0,
    jefe: '—',
    desde: '09:30',
  },
];

export default function AVLPage() {
  const cuartel = useFaroStore(selectCuartelActivo);
  const [moviles, setMoviles] = useState<MovilLive[]>(MOVILES_INICIAL);
  const [seleccionado, setSeleccionado] = useState<string>('movil-bv3');

  // Simular movimiento del BV-3
  useEffect(() => {
    const id = setInterval(() => {
      setMoviles((arr) =>
        arr.map((m) => {
          if (m.id !== 'movil-bv3' || m.estado !== 'en_ruta') return m;
          // Avanzar 0.0003 lat hacia destino
          return {
            ...m,
            lat: m.lat - 0.00018,
            lng: m.lng + 0.0001,
            travelSec: (m.travelSec ?? 0) + 1,
          };
        }),
      );
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const movilSel = moviles.find((m) => m.id === seleccionado)!;
  const conteoPorEstado = useMemo(() => {
    const ret: Record<EstadoMovil, number> = {
      disponible: 0,
      en_ruta: 0,
      en_escena: 0,
      regresando: 0,
      fuera_servicio: 0,
      mantenimiento: 0,
    };
    for (const m of moviles) ret[m.estado]++;
    return ret;
  }, [moviles]);

  const en_emergencia = conteoPorEstado.en_ruta + conteoPorEstado.en_escena;

  // Tiempo objetivo thresholds
  const nfpa1710 = (sec: number) => (sec <= 60 ? 'ok' : sec <= 90 ? 'warn' : 'risk');

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <PageHero
        objetivo="Vista Mando · Móviles en vivo"
        titulo={
          en_emergencia > 0
            ? `${en_emergencia} móvil${en_emergencia === 1 ? '' : 'es'} en emergencia`
            : 'Flota lista para despacho'
        }
        descripcion="Posición y estado de la flota en vivo (simulación de demo — sin GPS conectado). Mide el tiempo de salida del cuartel (objetivo: 1 min) y el de viaje hasta llegar (objetivo: 4 min al 90% de los servicios)."
        icono={<Radio size={26} className={en_emergencia > 0 ? 'animate-pulse' : ''} />}
        variant={en_emergencia > 0 ? 'critical' : 'default'}
        meta={
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Kpi label="Disponibles" value={conteoPorEstado.disponible} hint="listos" intent="ok" />
            <Kpi
              label="En operativo"
              value={en_emergencia}
              hint="ruta + escena"
              intent={en_emergencia > 0 ? 'risk' : 'neutral'}
            />
            <Kpi
              label="Mantenimiento"
              value={conteoPorEstado.mantenimiento}
              intent={conteoPorEstado.mantenimiento > 0 ? 'warn' : 'neutral'}
            />
            <Kpi
              label="Cobertura"
              value={`${Math.round((conteoPorEstado.disponible / moviles.length) * 100)}%`}
              hint="de flota total"
              intent="brand"
            />
          </div>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
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
                      popup:
                        '<strong>' +
                        cuartel.nombre +
                        '</strong><div style="font-size:11px;color:#64748b">Cuartel base</div>',
                    },
                  ]
                : []),
              ...moviles.map((m) => ({
                id: m.id,
                lat: m.lat,
                lng: m.lng,
                color: ESTADO_CONFIG[m.estado].color,
                label: '🚒',
                pulse: ESTADO_CONFIG[m.estado].pulse,
                popup:
                  '<strong>' +
                  m.codigo +
                  ' · ' +
                  m.tipo +
                  '</strong><div style="font-size:11px;color:#64748b">' +
                  ESTADO_CONFIG[m.estado].label +
                  '</div>',
              })),
            ]}
          />
        </Card>

        {/* Panel detalle */}
        <div className="space-y-3">
          {/* Lista de móviles */}
          <Card>
            <CardContent className="p-3">
              <div className="mb-2 px-1 text-xs font-bold uppercase text-slate-500">Flota</div>
              <ul className="space-y-1.5">
                {moviles.map((m) => {
                  const cfg = ESTADO_CONFIG[m.estado];
                  const activo = seleccionado === m.id;
                  return (
                    <li key={m.id}>
                      <button
                        type="button"
                        onClick={() => setSeleccionado(m.id)}
                        className={cn(
                          'flex w-full items-center gap-2.5 rounded-lg p-2 text-left transition-colors',
                          activo
                            ? 'border-brand-300 bg-brand-50 ring-brand-200 border ring-1'
                            : 'hover:bg-slate-50',
                        )}
                      >
                        <div
                          className={cn(
                            'grid h-8 w-8 shrink-0 place-items-center rounded-lg text-white',
                            cfg.color,
                          )}
                        >
                          <Truck size={14} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-900">{m.codigo}</span>
                            <Badge
                              intent={
                                m.estado === 'disponible'
                                  ? 'ok'
                                  : m.estado === 'en_ruta' || m.estado === 'en_escena'
                                    ? 'risk'
                                    : m.estado === 'mantenimiento'
                                      ? 'warn'
                                      : 'neutral'
                              }
                            >
                              {cfg.label}
                            </Badge>
                          </div>
                          <div className="text-[11px] text-slate-500">{m.tipo}</div>
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </CardContent>
          </Card>

          {/* Detalle del móvil seleccionado */}
          <motion.div
            key={movilSel.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card>
              <CardContent className="p-4">
                <div className="mb-3 flex items-center gap-2">
                  <div
                    className={cn(
                      'grid h-10 w-10 place-items-center rounded-xl text-white',
                      ESTADO_CONFIG[movilSel.estado].color,
                    )}
                  >
                    <Truck size={18} />
                  </div>
                  <div>
                    <div className="text-lg font-bold text-slate-900">{movilSel.codigo}</div>
                    <div className="text-xs text-slate-500">{movilSel.tipo}</div>
                  </div>
                </div>

                {movilSel.servicio && (
                  <div className="bg-fire-50 mb-3 rounded-lg p-2 text-xs">
                    <div className="text-fire-700 flex items-center gap-1 font-bold">
                      <Flame size={11} /> En operativo
                    </div>
                    <div className="mt-0.5 text-slate-700">{movilSel.servicio}</div>
                  </div>
                )}

                <div className="space-y-2 text-xs">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="rounded-md bg-slate-50 p-2">
                      <div className="text-slate-500">Velocidad</div>
                      <div className="flex items-center gap-1 font-bold text-slate-900">
                        <Navigation size={11} />
                        {movilSel.velocidad} km/h
                      </div>
                    </div>
                    <div className="rounded-md bg-slate-50 p-2">
                      <div className="text-slate-500">Desde</div>
                      <div className="flex items-center gap-1 font-bold text-slate-900">
                        <Clock size={11} />
                        {movilSel.desde}
                      </div>
                    </div>
                  </div>

                  {movilSel.turnoutSec !== undefined && (
                    <div
                      className={cn(
                        'rounded-md p-2',
                        nfpa1710(movilSel.turnoutSec) === 'ok'
                          ? 'bg-status-ok-bg/30'
                          : nfpa1710(movilSel.turnoutSec) === 'warn'
                            ? 'bg-status-warn-bg/30'
                            : 'bg-status-risk-bg/30',
                      )}
                    >
                      <div className="text-slate-500">Tiempo de salida del cuartel</div>
                      <div className="flex items-center justify-between font-bold">
                        <span
                          className={cn(
                            nfpa1710(movilSel.turnoutSec) === 'ok'
                              ? 'text-status-ok-fg'
                              : nfpa1710(movilSel.turnoutSec) === 'warn'
                                ? 'text-status-warn-fg'
                                : 'text-status-risk-fg',
                          )}
                        >
                          {movilSel.turnoutSec} seg
                        </span>
                        <span className="text-[11px] text-slate-500">meta 1 min</span>
                      </div>
                    </div>
                  )}

                  {movilSel.travelSec !== undefined && (
                    <div className="bg-fire-50 rounded-md p-2">
                      <div className="text-slate-500">Tiempo de viaje hasta el lugar</div>
                      <div className="text-fire-700 flex items-center justify-between font-bold">
                        <span>
                          {Math.floor(movilSel.travelSec / 60)}:
                          {(movilSel.travelSec % 60).toString().padStart(2, '0')} min
                        </span>
                        <span className="text-[11px] text-slate-500">meta 4 min</span>
                      </div>
                    </div>
                  )}

                  <div className="border-t border-slate-100 pt-2">
                    <div className="text-slate-500">Dotación</div>
                    <div className="font-medium text-slate-900">
                      {movilSel.dotacion} pers. · Jefe: {movilSel.jefe}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      <Card className="border-slate-200 bg-slate-50">
        <CardContent className="flex items-start gap-3 p-4 text-sm text-slate-600">
          <Activity size={18} className="mt-0.5 shrink-0 text-slate-500" />
          <div>
            <strong className="text-slate-900">¿Cómo funciona?</strong> Los móviles mandan su
            ubicación cada 30 segundos desde el celular del jefe de servicio. El estado cambia solo
            cuando el móvil sale del cuartel, llega al lugar y vuelve.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
