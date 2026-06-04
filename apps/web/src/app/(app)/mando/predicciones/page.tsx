'use client';

import { motion } from 'framer-motion';
import { BarChart3, Clock, Flame, MapPin, ShieldCheck, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useMemo } from 'react';

import type { TipoServicio } from '@faro/types';

import { Card, CardContent, Kpi, cn } from '@faro/ui';

import { PageHero } from '../../../../components/shared/page-hero';
import { selectCuartelActivo, useFaroStore } from '../../../../store/use-faro-store';
import { demoToday } from '../../../../lib/utils/demo-today';
import { fmtMesPeriodo, mesKey } from '../../../../lib/utils/date';
import { tipoServicioLabel } from '../../../../lib/utils/tipo-servicio';

const TIPOS: TipoServicio[] = ['incendio', 'rescate', 'accidente', 'forestal', 'otro'];
const DIAS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
const DIAS_LARGO = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
const FRANJAS = ['Madrugada', 'Mañana', 'Tarde', 'Noche'];
const FRANJAS_HORA = ['00–06', '06–12', '12–18', '18–24'];

const TIPO_COLOR: Record<TipoServicio, string> = {
  incendio: 'bg-fire-600',
  rescate: 'bg-brand-600',
  accidente: 'bg-status-warn',
  forestal: 'bg-status-ok',
  otro: 'bg-slate-400',
};

export default function PrediccionesPage() {
  const cuartel = useFaroStore(selectCuartelActivo);
  const serviciosAll = useFaroStore((s) => s.servicios);
  const periodo = mesKey(demoToday());

  const intel = useMemo(() => {
    const cid = cuartel?.id;
    const servs = serviciosAll.filter(
      (s) => s.cuartelId === cid && s.horaSalida.slice(0, 7) === periodo,
    );
    const total = servs.length;
    const validados = servs.filter((s) => s.estado === 'validado').length;

    // Grid día (0=Lun..6=Dom) × franja (0..3 de 6 hs)
    const grid = Array.from({ length: 7 }, () => [0, 0, 0, 0]);
    for (const s of servs) {
      const dt = new Date(s.horaSalida);
      const dia = (dt.getDay() + 6) % 7;
      const franja = Math.min(3, Math.floor(dt.getHours() / 6));
      const row = grid[dia];
      if (row) row[franja] = (row[franja] ?? 0) + 1;
    }
    const maxCell = Math.max(1, ...grid.flat());
    let peak = { dia: 0, franja: 0, n: 0 };
    grid.forEach((row, di) =>
      row.forEach((n, fi) => {
        if (n > peak.n) peak = { dia: di, franja: fi, n };
      }),
    );

    // Por tipo
    const porTipo = TIPOS.map((t) => ({ t, n: servs.filter((s) => s.tipo === t).length }))
      .filter((x) => x.n > 0)
      .sort((a, b) => b.n - a.n);

    // Por semana del mes
    const semanas = [0, 0, 0, 0, 0];
    for (const s of servs) {
      const w = Math.min(4, Math.ceil(new Date(s.horaSalida).getDate() / 7) - 1);
      semanas[w] = (semanas[w] ?? 0) + 1;
    }
    const ultimaSemana = semanas.reduce((last, n, i) => (n > 0 ? i : last), 0);

    // Franja menos cubierta (en total)
    const franjaTot = [0, 1, 2, 3].map((f) => grid.reduce((a, row) => a + row[f]!, 0));

    return {
      total,
      validados,
      grid,
      maxCell,
      peak,
      porTipo,
      semanas: semanas.slice(0, ultimaSemana + 1),
      franjaTot,
    };
  }, [cuartel?.id, serviciosAll, periodo]);

  const domTipo = intel.porTipo[0];
  const maxSemana = Math.max(1, ...intel.semanas);
  const pct = (n: number) => (intel.total ? Math.round((n / intel.total) * 100) : 0);

  // Recomendaciones DERIVADAS de los datos reales (no hardcodeadas)
  const recomendaciones: {
    titulo: string;
    detalle: string;
    accion: string;
    href: string;
    icon: React.ReactNode;
    intent: 'risk' | 'warn' | 'brand';
  }[] = [];
  if (intel.peak.n > 0) {
    recomendaciones.push({
      titulo: `Franja más cargada: ${DIAS_LARGO[intel.peak.dia]} a la ${FRANJAS[intel.peak.franja]?.toLowerCase()}`,
      detalle: `${intel.peak.n} de los ${intel.total} servicios del período cayeron en ${DIAS_LARGO[intel.peak.dia]} ${FRANJAS_HORA[intel.peak.franja]} hs. Es la franja donde conviene reforzar la guardia.`,
      accion: 'Ver guardias',
      href: '/mando',
      icon: <Clock size={16} />,
      intent: 'warn',
    });
  }
  if (domTipo) {
    recomendaciones.push({
      titulo: `${tipoServicioLabel[domTipo.t]} es tu servicio más frecuente`,
      detalle: `${domTipo.n} servicios (${pct(domTipo.n)}% del total del período). Mantené la dotación capacitada y el equipo listo para ${tipoServicioLabel[domTipo.t].toLowerCase()}.`,
      accion: 'Ver capacitación',
      href: '/bombero/capacitacion',
      icon: <Flame size={16} />,
      intent: 'brand',
    });
  }
  const minFranjaIdx = intel.franjaTot.indexOf(Math.min(...intel.franjaTot));
  if (intel.total > 0) {
    recomendaciones.push({
      titulo: `Menor actividad: ${FRANJAS[minFranjaIdx]}`,
      detalle: `Sólo ${intel.franjaTot[minFranjaIdx] ?? 0} servicios en la franja ${FRANJAS_HORA[minFranjaIdx]} hs. Buena ventana para capacitación, mantenimiento de móviles o simulacros.`,
      accion: 'Planificar',
      href: '/mando/personal',
      icon: <ShieldCheck size={16} />,
      intent: 'brand',
    });
  }

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <PageHero
        objetivo="Vista Mando · Inteligencia operativa"
        titulo="Inteligencia operativa"
        descripcion="Patrones reales de tu historial de servicios: cuándo, qué tipo y dónde reforzar. Calculado sobre los servicios registrados del período — sin estimaciones inventadas."
        icono={<Sparkles size={26} />}
        meta={
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Kpi
              label="Servicios del mes"
              value={intel.total}
              hint={fmtMesPeriodo(periodo)}
              intent="brand"
            />
            <Kpi
              label="Franja pico"
              value={
                intel.peak.n > 0 ? `${DIAS[intel.peak.dia]} ${FRANJAS[intel.peak.franja]}` : '—'
              }
              hint={intel.peak.n > 0 ? `${intel.peak.n} servicios` : 'sin datos'}
              intent="risk"
            />
            <Kpi
              label="Tipo dominante"
              value={domTipo ? tipoServicioLabel[domTipo.t] : '—'}
              hint={domTipo ? `${pct(domTipo.n)}% del total` : 'sin datos'}
              intent="warn"
            />
            <Kpi
              label="Validados"
              value={`${intel.validados}/${intel.total}`}
              hint="con firma"
              intent="ok"
            />
          </div>
        }
      />

      {/* Heatmap día × franja — datos reales */}
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="border-b border-slate-100 px-5 py-3">
            <h3 className="font-bold text-slate-900">¿Cuándo ocurren los servicios?</h3>
            <p className="mt-0.5 text-xs text-slate-500">
              Servicios reales por día de la semana y franja horaria. Más oscuro = más servicios.
            </p>
          </div>
          <motion.div
            className="overflow-x-auto p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.35 }}
          >
            <div className="min-w-[420px]">
              <div className="flex">
                <div className="w-12 shrink-0" />
                {FRANJAS.map((f, i) => (
                  <div key={f} className="flex-1 px-1 text-center">
                    <div className="text-xs font-semibold text-slate-700">{f}</div>
                    <div className="text-[11px] text-slate-400">{FRANJAS_HORA[i]}</div>
                  </div>
                ))}
              </div>
              {intel.grid.map((row, dIdx) => (
                <div key={DIAS[dIdx]} className="flex">
                  <div className="flex w-12 shrink-0 items-center py-1 text-xs font-bold text-slate-700">
                    {DIAS[dIdx]}
                  </div>
                  {row.map((n, fIdx) => {
                    const intensity = n / intel.maxCell;
                    const isPeak =
                      intel.peak.n > 0 && dIdx === intel.peak.dia && fIdx === intel.peak.franja;
                    return (
                      <div
                        key={fIdx}
                        aria-label={`${DIAS_LARGO[dIdx]} ${FRANJAS[fIdx]} (${FRANJAS_HORA[fIdx]} hs): ${n} servicios`}
                        className={cn(
                          'mx-px my-px grid flex-1 place-items-center rounded-md text-sm font-bold',
                          isPeak && 'ring-2 ring-slate-900 ring-offset-1',
                          n === 0
                            ? 'text-slate-300'
                            : intensity > 0.5
                              ? 'text-white'
                              : 'text-slate-800',
                        )}
                        style={{
                          backgroundColor:
                            n === 0
                              ? 'rgb(241 245 249)'
                              : `rgba(220, 38, 38, ${0.18 + intensity * 0.82})`,
                          minHeight: 40,
                        }}
                      >
                        {n > 0 ? n : '·'}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </motion.div>
        </CardContent>
      </Card>

      <div className="grid gap-5 lg:grid-cols-2">
        {/* Distribución por tipo — datos reales */}
        <Card>
          <CardContent className="p-5">
            <h3 className="mb-4 flex items-center gap-2 font-bold text-slate-900">
              <Flame size={18} className="text-fire-600" />
              ¿Qué tipo de servicio predomina?
            </h3>
            {intel.porTipo.length === 0 ? (
              <p className="text-sm text-slate-500">Sin servicios en el período.</p>
            ) : (
              <div className="space-y-3">
                {intel.porTipo.map(({ t, n }) => (
                  <div key={t}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="font-medium text-slate-800">{tipoServicioLabel[t]}</span>
                      <span className="tabular-nums text-slate-500">
                        {n} · {pct(n)}%
                      </span>
                    </div>
                    <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct(n)}%` }}
                        transition={{ duration: 0.5 }}
                        className={cn('h-full rounded-full', TIPO_COLOR[t])}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Servicios por semana — datos reales */}
        <Card>
          <CardContent className="p-5">
            <h3 className="mb-4 flex items-center gap-2 font-bold text-slate-900">
              <BarChart3 size={18} className="text-brand-700" />
              Servicios por semana · {fmtMesPeriodo(periodo)}
            </h3>
            <div className="flex items-end gap-3" style={{ height: 160 }}>
              {intel.semanas.map((n, i) => (
                <div key={i} className="flex flex-1 flex-col items-center gap-1.5">
                  <div className="flex w-full flex-1 items-end">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${(n / maxSemana) * 100}%` }}
                      transition={{ delay: i * 0.06 }}
                      className="bg-brand-600 w-full rounded-t-md"
                      style={{ minHeight: n > 0 ? 6 : 0 }}
                    />
                  </div>
                  <div className="text-sm font-bold tabular-nums text-slate-900">{n}</div>
                  <div className="text-[11px] font-medium text-slate-500">S{i + 1}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recomendaciones derivadas de los datos */}
      <div>
        <h3 className="mb-3 px-1 text-sm font-bold uppercase tracking-wide text-slate-500">
          Qué hacer con esto
        </h3>
        <div className="grid gap-3 lg:grid-cols-2">
          {recomendaciones.map((r, idx) => (
            <motion.div
              key={r.titulo}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <Card
                className={cn(
                  'border-2',
                  r.intent === 'risk'
                    ? 'border-status-risk/30 bg-status-risk-bg/20'
                    : r.intent === 'warn'
                      ? 'border-status-warn/30 bg-status-warn-bg/20'
                      : 'border-brand-200 bg-brand-50/30',
                )}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div
                      className={cn(
                        'grid h-10 w-10 shrink-0 place-items-center rounded-xl text-white',
                        r.intent === 'risk'
                          ? 'bg-status-risk'
                          : r.intent === 'warn'
                            ? 'bg-status-warn'
                            : 'bg-brand-600',
                      )}
                    >
                      {r.icon}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold text-slate-900">{r.titulo}</h4>
                      <p className="mt-1 text-sm text-slate-700">{r.detalle}</p>
                      <Link
                        href={r.href}
                        className="text-brand-700 hover:text-brand-900 mt-2 inline-block text-xs font-medium underline-offset-2 hover:underline"
                      >
                        {r.accion} →
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Cómo se calcula — honesto */}
      <Card className="border-slate-200 bg-slate-50">
        <CardContent className="flex items-start gap-3 p-4 text-sm text-slate-600">
          <MapPin size={18} className="mt-0.5 shrink-0 text-slate-500" />
          <div>
            <strong className="text-slate-900">Cómo se calcula:</strong> directamente sobre los{' '}
            {intel.total} servicios reales registrados en {fmtMesPeriodo(periodo)}. No hay
            estimaciones a futuro ni datos externos: son los patrones de tu propia operación. A
            mayor historial cargado, más fino el análisis.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
