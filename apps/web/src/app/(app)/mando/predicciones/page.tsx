'use client';

import { motion } from 'framer-motion';
import {
  AlertCircle,
  Flame,
  GraduationCap,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Users,
} from 'lucide-react';

import { Card, CardContent, Kpi, cn } from '@faro/ui';

import { PageHero } from '../../../../components/shared/page-hero';

// Demand forecast por hora (heatmap 24h x 7 días)
const HEATMAP_HORAS = Array.from({ length: 24 }, (_, h) => h);
const DIAS_SEMANA = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

function predict(dia: number, hora: number): number {
  // Mock determinístico: más servicios fin de semana noche, peak 18-22
  const baseDia = dia >= 5 ? 1.5 : 1.0;
  const baseHora = hora >= 18 && hora <= 23 ? 2.5 : hora >= 8 && hora <= 17 ? 1.2 : 0.6;
  return Math.round(baseDia * baseHora * 5 + (Math.sin(dia * hora) + 1) * 2);
}

const FORECAST_12M = [
  { mes: 'Jun', historico: 24, predicho: 26 },
  { mes: 'Jul', historico: 28, predicho: 32 },
  { mes: 'Ago', historico: 22, predicho: 24 },
  { mes: 'Sep', historico: 19, predicho: 21 },
  { mes: 'Oct', historico: 26, predicho: 29 },
  { mes: 'Nov', historico: 31, predicho: 34 },
  { mes: 'Dic', historico: 42, predicho: 48 },
  { mes: 'Ene', historico: 38, predicho: 44 },
  { mes: 'Feb', historico: 34, predicho: 38 },
  { mes: 'Mar', historico: 27, predicho: 30 },
  { mes: 'Abr', historico: 23, predicho: 25 },
  { mes: 'May', historico: 21, predicho: 23 },
];

const RECOMENDACIONES = [
  {
    titulo: 'Pico de demanda en diciembre',
    detalle:
      'Se estiman 48 servicios (+14% vs el año pasado) por temporada de incendios forestales. Recomendado: reforzar forestal con 4 cursos adicionales en el último trimestre.',
    accion: 'Programar capacitación',
    href: '/bombero/capacitacion',
    icon: <Flame size={16} />,
    intent: 'warn' as const,
  },
  {
    titulo: 'Falta cobertura · Domingo noche',
    detalle:
      'Estimación: 8 servicios promedio domingo 22-04 hs. Disponibles: 6 voluntarios. Recomendado: sumar 4 voluntarios más en esa franja.',
    accion: 'Notificar a voluntarios',
    href: '/comunicacion',
    icon: <Users size={16} />,
    intent: 'risk' as const,
  },
  {
    titulo: 'Materiales peligrosos subutilizado',
    detalle:
      '12 voluntarios capacitados, sólo 3 activos en operativos de materiales peligrosos. Recomendado: rotación obligatoria para mantener la práctica.',
    accion: 'Ajustar guardias',
    href: '/mando/personal',
    icon: <GraduationCap size={16} />,
    intent: 'brand' as const,
  },
  {
    titulo: 'Bajaron los rescates vehiculares -8%',
    detalle:
      'Tendencia a la baja por la construcción de la autopista. Se puede reasignar presupuesto a equipamiento estructural.',
    accion: 'Revisar inversión',
    href: '/mando/finanzas/presupuesto',
    icon: <TrendingDown size={16} />,
    intent: 'brand' as const,
  },
];

export default function PrediccionesPage() {
  const maxHist = Math.max(...FORECAST_12M.map((f) => f.historico));
  const maxPred = Math.max(...FORECAST_12M.map((f) => f.predicho));
  const max = Math.max(maxHist, maxPred);

  // Hottest day/hour para mostrar
  let hotMax = 0;
  let hotDia = 0;
  let hotHora = 0;
  for (let d = 0; d < 7; d++) {
    for (let h = 0; h < 24; h++) {
      const v = predict(d, h);
      if (v > hotMax) {
        hotMax = v;
        hotDia = d;
        hotHora = h;
      }
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <PageHero
        objetivo="Vista Mando · Predicciones"
        titulo="Predicciones y estimación a futuro"
        descripcion="Análisis automático sobre tu historial. Estima volumen de servicios, faltantes de cobertura y recomienda acciones."
        icono={<Sparkles size={26} />}
        meta={
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Kpi
              label="Próx 30 días"
              value="+18%"
              hint="vs mes ant. · 36m historial"
              intent="warn"
            />
            <Kpi label="Próx 12 meses" value="318" hint="serv. estimados · 36m" intent="brand" />
            <Kpi
              label="Pico horario"
              value={`${DIAS_SEMANA[hotDia]} ${hotHora}h`}
              hint={`${hotMax} serv/sem`}
              intent="risk"
            />
            <Kpi label="Precisión" value="87%" hint="basado en 36 meses" intent="ok" />
          </div>
        }
      />

      {/* Heatmap 24x7 */}
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="border-b border-slate-100 px-5 py-3">
            <h3 className="font-bold text-slate-900">
              Mapa de calor · Servicios por hora del día y día de la semana
            </h3>
            <p className="mt-0.5 text-xs text-slate-500">
              Más oscuro = más servicios estimados. Tocá para detalle.
            </p>
          </div>
          {/* F26: anima el contenedor una sola vez en lugar de 168 motion.div */}
          <motion.div
            className="overflow-x-auto p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.35 }}
          >
            <div className="min-w-[600px]">
              <div className="flex">
                <div className="w-12 shrink-0" />
                {HEATMAP_HORAS.map((h) => (
                  <div key={h} className="flex-1 text-center text-[9px] font-medium text-slate-500">
                    {h.toString().padStart(2, '0')}
                  </div>
                ))}
              </div>
              {DIAS_SEMANA.map((dia, dIdx) => (
                <div key={dia} className="flex">
                  <div className="w-12 shrink-0 py-1 text-xs font-bold text-slate-700">{dia}</div>
                  {HEATMAP_HORAS.map((h) => {
                    const v = predict(dIdx, h);
                    const intensity = Math.min(1, v / 18);
                    return (
                      /* F27: celda accesible como button con aria-label */
                      <button
                        key={h}
                        type="button"
                        aria-label={`${dia} a las ${h}h — ${v} servicios estimados por semana`}
                        className="mx-px my-px flex-1 rounded-sm text-center text-[9px] font-bold text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-500"
                        style={{
                          backgroundColor: `rgba(220, 38, 38, ${intensity})`,
                          minHeight: 22,
                          paddingTop: 4,
                        }}
                      >
                        {v >= 12 ? v : ''}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </motion.div>
        </CardContent>
      </Card>

      {/* Forecast 12 meses */}
      <Card>
        <CardContent className="p-5">
          <h3 className="mb-3 flex items-center gap-2 font-bold text-slate-900">
            <TrendingUp size={18} className="text-brand-700" />
            Estimación a 12 meses · servicios por mes
          </h3>
          <div className="overflow-x-auto">
            <div className="flex min-w-[500px] items-end gap-2" style={{ height: 200 }}>
              {FORECAST_12M.map((f, idx) => (
                <div key={f.mes} className="flex flex-1 flex-col items-center gap-1">
                  <div className="flex w-full items-end justify-around" style={{ height: 160 }}>
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${(f.historico / max) * 100}%` }}
                      transition={{ delay: idx * 0.04 }}
                      className="w-2 rounded-t bg-slate-400"
                      title={`Hist: ${f.historico}`}
                    />
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${(f.predicho / max) * 100}%` }}
                      transition={{ delay: idx * 0.04 + 0.1 }}
                      className="bg-fire-600 w-2 rounded-t"
                      title={`Predicho: ${f.predicho}`}
                    />
                  </div>
                  <div className="text-[10px] font-medium text-slate-600">{f.mes}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-3 flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded bg-slate-400" />
              <span>Histórico (mismo mes año pasado)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="bg-fire-600 h-3 w-3 rounded" />
              <span>Estimado (análisis automático)</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recomendaciones */}
      <div className="grid gap-3 lg:grid-cols-2">
        {RECOMENDACIONES.map((r, idx) => (
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
                    <a
                      href={r.href}
                      className="text-brand-700 hover:text-brand-900 mt-2 inline-block text-xs font-medium underline-offset-2 hover:underline"
                    >
                      {r.accion} →
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Cómo funciona */}
      <Card className="border-slate-200 bg-slate-50">
        <CardContent className="flex items-start gap-3 p-4 text-sm text-slate-600">
          <AlertCircle size={18} className="mt-0.5 shrink-0 text-slate-500" />
          <div>
            <strong className="text-slate-900">Cómo se hacen las estimaciones:</strong> el sistema
            analiza 36 meses de tu historial de servicios, datos del clima y calendario de eventos
            locales. Se actualiza cada 30 días. Las estimaciones son orientativas y siempre las
            valida el jefe del cuartel.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
