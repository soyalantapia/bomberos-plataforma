'use client';

import { motion } from 'framer-motion';
import {
  AlertTriangle,
  Calendar,
  Flame,
  PauseCircle,
  PlayCircle,
  QrCode,
  Shield,
  ShieldCheck,
  Wind,
} from 'lucide-react';
import { useMemo, useState } from 'react';

import { Avatar, Badge, Button, Card, CardContent, Kpi, cn, useToast } from '@faro/ui';

import { PageHero } from '../../../../components/shared/page-hero';
import type { EquipoEPP, EstadoEPP, TipoEPP } from '../../../../data/epp';
import { demoToday } from '../../../../lib/utils/demo-today';
import { selectPersonaActual, useFaroStore } from '../../../../store/use-faro-store';

const TIPOS_EPP: Record<TipoEPP, { label: string; icon: React.ReactNode; color: string }> = {
  casco: { label: 'Casco', icon: <Shield size={16} />, color: 'bg-fire-700' },
  chaqueta: { label: 'Chaqueta de bombero', icon: <Shield size={16} />, color: 'bg-fire-600' },
  pantalon: { label: 'Pantalón de bombero', icon: <Shield size={16} />, color: 'bg-fire-600' },
  botas: { label: 'Botas para incendios', icon: <Shield size={16} />, color: 'bg-slate-700' },
  guantes: { label: 'Guantes', icon: <Shield size={16} />, color: 'bg-slate-600' },
  capucha: { label: 'Capucha ignífuga', icon: <Shield size={16} />, color: 'bg-slate-500' },
  scba: { label: 'Equipo respiratorio', icon: <Wind size={16} />, color: 'bg-brand-700' },
  mascara: { label: 'Máscara facial', icon: <Wind size={16} />, color: 'bg-brand-600' },
};

const ESTADO_BADGE: Record<
  EstadoEPP,
  { label: string; intent: 'ok' | 'warn' | 'risk' | 'neutral' }
> = {
  vigente: { label: 'Vigente', intent: 'ok' },
  por_vencer: { label: 'Por vencer', intent: 'warn' },
  vencido: { label: 'Vencido', intent: 'risk' },
  fuera_servicio: { label: 'Fuera de servicio', intent: 'neutral' },
};

function diasHasta(fecha: string) {
  return Math.round((new Date(fecha).getTime() - demoToday().getTime()) / 86400000);
}

/** El estado se DERIVA: fuera de servicio > vencimiento vs hoy. No se guarda. */
function estadoDe(item: EquipoEPP): EstadoEPP {
  if (item.fueraServicio) return 'fuera_servicio';
  const dias = diasHasta(item.vencimiento);
  if (dias < 0) return 'vencido';
  if (dias < 60) return 'por_vencer';
  return 'vigente';
}

export default function EquipoPage() {
  const toast = useToast();
  const persona = useFaroStore(selectPersonaActual);
  const equipoEPP = useFaroStore((s) => s.equipoEPP);
  const registrarExposicion = useFaroStore((s) => s.registrarExposicionEpp);
  const marcarFueraDeServicio = useFaroStore((s) => s.marcarEppFueraDeServicio);
  const [qrAbierto, setQrAbierto] = useState<string | null>(null);

  const items = useMemo(
    () => equipoEPP.filter((e) => e.personaId === persona?.id),
    [equipoEPP, persona?.id],
  );

  const totalExpos = items.reduce((a, e) => a + e.exposiciones, 0);
  const vigentes = items.filter((e) => estadoDe(e) === 'vigente').length;
  const conAlertas = items.filter((e) => {
    const est = estadoDe(e);
    return est === 'por_vencer' || est === 'vencido' || est === 'fuera_servicio';
  }).length;

  function exponer(item: EquipoEPP) {
    registrarExposicion(item.id);
    toast.push({
      kind: 'success',
      title: 'Exposición registrada',
      description: `${TIPOS_EPP[item.tipo].label} · ${item.exposiciones + 1} acumuladas.`,
    });
  }

  function toggleServicio(item: EquipoEPP) {
    const nuevo = !item.fueraServicio;
    marcarFueraDeServicio(item.id, nuevo);
    toast.push({
      kind: nuevo ? 'info' : 'success',
      title: nuevo ? 'Marcado fuera de servicio' : 'De vuelta en servicio',
      description: `${TIPOS_EPP[item.tipo].label}.`,
    });
  }

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <PageHero
        objetivo="Bombero · Tu equipo"
        titulo="Tu uniforme individual"
        descripcion="Cada pieza con su vencimiento (10 años de vida útil). El estado se calcula solo. Cada exposición a fuego queda registrada. QR único por pieza."
        icono={<Shield size={26} />}
        meta={
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Kpi label="Items" value={items.length} intent="brand" />
            <Kpi label="Vigentes" value={vigentes} intent="ok" />
            <Kpi label="Alertas" value={conAlertas} intent={conAlertas > 0 ? 'warn' : 'ok'} />
            <Kpi label="Exposiciones" value={totalExpos} hint="acumuladas" intent="neutral" />
          </div>
        }
      />

      {/* Resumen del bombero */}
      <Card className="bg-brand-50/40 border-brand-100">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Avatar
              name={`${persona?.nombre} ${persona?.apellido}`}
              src={persona?.fotoUrl}
              size={48}
            />
            <div className="flex-1">
              <div className="text-brand-900 font-bold">
                {persona?.apellido}, {persona?.nombre}
              </div>
              <p className="text-brand-900/80 mt-0.5 text-sm">
                Legajo {persona?.legajo} · {items.length} piezas · {totalExpos} exposiciones
                registradas
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {items.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-slate-500">
            No tenés equipo cargado todavía. Pedile a tu jefe de material que registre tu uniforme.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {items.map((item, idx) => {
            const cfg = TIPOS_EPP[item.tipo];
            const estado = estadoDe(item);
            const badge = ESTADO_BADGE[estado];
            const dias = diasHasta(item.vencimiento);
            const meses = Math.round(dias / 30);
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04 }}
              >
                <Card
                  className={cn(
                    'border-2',
                    estado === 'por_vencer'
                      ? 'border-status-warn/30'
                      : estado === 'vencido'
                        ? 'border-status-risk/40'
                        : estado === 'fuera_servicio'
                          ? 'border-slate-300 bg-slate-50/60'
                          : 'border-slate-200',
                  )}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div
                        className={cn(
                          'grid h-12 w-12 shrink-0 place-items-center rounded-xl text-white',
                          estado === 'fuera_servicio' ? 'bg-slate-400' : cfg.color,
                        )}
                      >
                        {cfg.icon}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">{cfg.label}</span>
                          <Badge intent={badge.intent}>{badge.label}</Badge>
                        </div>
                        <div className="mt-0.5 text-xs text-slate-600">
                          {item.fabricante} · {item.modelo}
                        </div>

                        <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                          <div className="rounded-md bg-slate-50 p-2">
                            <div className="text-slate-500">Vence</div>
                            <div
                              className={cn(
                                'font-bold',
                                dias < 60 && dias >= 0 && 'text-status-warn-fg',
                                dias < 0 && 'text-status-risk-fg',
                              )}
                            >
                              {dias < 0
                                ? 'Vencido'
                                : meses > 12
                                  ? `${Math.floor(meses / 12)} años`
                                  : `${meses} meses`}
                            </div>
                          </div>
                          <div className="rounded-md bg-slate-50 p-2">
                            <div className="text-slate-500">Exposiciones</div>
                            <div className="flex items-center gap-1 font-bold text-slate-900">
                              <Flame size={11} className="text-fire-600" />
                              {item.exposiciones}
                            </div>
                          </div>
                        </div>

                        {item.ultimaExposicion && (
                          <div className="mt-2 text-[11px] text-slate-500">
                            <Calendar size={10} className="mr-1 inline" />
                            Última exposición:{' '}
                            {new Date(item.ultimaExposicion).toLocaleDateString('es-AR')}
                          </div>
                        )}

                        {item.notas && (
                          <div className="bg-status-warn-bg/40 text-status-warn-fg mt-2 flex items-start gap-2 rounded p-2 text-xs">
                            <AlertTriangle size={11} className="mt-0.5 shrink-0" />
                            <span>{item.notas}</span>
                          </div>
                        )}

                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setQrAbierto(qrAbierto === item.id ? null : item.id)}
                            className="bg-brand-50 text-brand-700 hover:bg-brand-100 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium"
                          >
                            <QrCode size={12} /> Ver QR
                          </button>
                          <Button
                            intent="ghost"
                            size="sm"
                            onClick={() => exponer(item)}
                            disabled={item.fueraServicio}
                          >
                            <Flame size={12} /> Registrar exposición
                          </Button>
                          <Button intent="ghost" size="sm" onClick={() => toggleServicio(item)}>
                            {item.fueraServicio ? (
                              <>
                                <PlayCircle size={12} /> Volver a servicio
                              </>
                            ) : (
                              <>
                                <PauseCircle size={12} /> Fuera de servicio
                              </>
                            )}
                          </Button>
                        </div>

                        {qrAbierto === item.id && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            className="mt-3 overflow-hidden"
                          >
                            <div className="flex items-center gap-3 rounded-lg bg-white p-3 ring-1 ring-slate-200">
                              <div className="grid h-20 w-20 shrink-0 place-items-center rounded bg-slate-900 text-white">
                                <QrCode size={48} />
                              </div>
                              <div className="min-w-0 flex-1 text-xs">
                                <div className="font-mono font-bold text-slate-900">
                                  {item.qrCode}
                                </div>
                                <div className="mt-1 text-slate-600">
                                  Escaneá al entrar y salir del fuego para registrar la exposición
                                  de forma automática.
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      <Card className="bg-brand-50/40 border-brand-100">
        <CardContent className="flex items-start gap-3 p-4">
          <div className="bg-brand-600 grid h-10 w-10 shrink-0 place-items-center rounded-xl text-white">
            <ShieldCheck size={18} />
          </div>
          <div className="text-sm">
            <strong className="text-brand-900">Vida útil del traje: 10 años</strong>
            <p className="text-brand-900/80 mt-0.5">
              El traje se reemplaza cada 10 años desde su fabricación. El estado de cada pieza se
              calcula solo según el vencimiento; te avisamos con 60 días de anticipación. El
              registro de exposiciones sirve para auditorías después de un siniestro y reclamos a
              aseguradoras.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
