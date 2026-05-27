'use client';

import { Badge, Button, Card, CardContent, Kpi, cn, useToast } from '@faro/ui';
import { motion } from 'framer-motion';
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  CheckCircle2,
  Download,
  Target,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import { useMemo } from 'react';

import { ars, arsCompact } from '../../../../../components/finanzas/utils';
import { PageHero } from '../../../../../components/shared/page-hero';
import { demoToday } from '../../../../../lib/utils/demo-today';
import { useFaroStore } from '../../../../../store/use-faro-store';

export default function PresupuestoPage() {
  const toast = useToast();
  const cuentas = useFaroStore((s) => s.cuentas);
  const movimientos = useFaroStore((s) => s.movimientos);
  const presupuestos = useFaroStore((s) => s.presupuestos);

  const presupuesto = presupuestos[0];

  // Ejecutado por cuenta (YTD)
  const ejecutadoMap = useMemo(() => {
    const map = new Map<string, number>();
    for (const m of movimientos.filter((m) => m.estado === 'conciliado')) {
      map.set(m.cuentaId, (map.get(m.cuentaId) ?? 0) + m.monto);
    }
    return map;
  }, [movimientos]);

  // % del año transcurrido
  const hoy = demoToday();
  const inicioAnio = new Date(hoy.getFullYear(), 0, 1);
  const finAnio = new Date(hoy.getFullYear(), 11, 31);
  const pctAnio =
    ((hoy.getTime() - inicioAnio.getTime()) / (finAnio.getTime() - inicioAnio.getTime())) * 100;

  const lineasIngresos = useMemo(() => {
    if (!presupuesto) return [];
    return presupuesto.lineas
      .map((l) => {
        const cuenta = cuentas.find((c) => c.id === l.cuentaId);
        if (!cuenta || cuenta.tipo !== 'ingreso') return null;
        const ejec = ejecutadoMap.get(l.cuentaId) ?? 0;
        const pctEjec = l.montoAnual > 0 ? (ejec / l.montoAnual) * 100 : 0;
        const desvio = pctEjec - pctAnio;
        return { cuenta, presupuesto: l.montoAnual, ejecutado: ejec, pctEjec, desvio };
      })
      .filter((x): x is NonNullable<typeof x> => x !== null);
  }, [presupuesto, cuentas, ejecutadoMap, pctAnio]);

  const lineasEgresos = useMemo(() => {
    if (!presupuesto) return [];
    return presupuesto.lineas
      .map((l) => {
        const cuenta = cuentas.find((c) => c.id === l.cuentaId);
        if (!cuenta || cuenta.tipo !== 'egreso') return null;
        const ejec = ejecutadoMap.get(l.cuentaId) ?? 0;
        const pctEjec = l.montoAnual > 0 ? (ejec / l.montoAnual) * 100 : 0;
        const desvio = pctEjec - pctAnio;
        return { cuenta, presupuesto: l.montoAnual, ejecutado: ejec, pctEjec, desvio };
      })
      .filter((x): x is NonNullable<typeof x> => x !== null);
  }, [presupuesto, cuentas, ejecutadoMap, pctAnio]);

  const totalIngEjec = lineasIngresos.reduce((s, l) => s + l.ejecutado, 0);
  const totalEgrEjec = lineasEgresos.reduce((s, l) => s + l.ejecutado, 0);
  const totalIngPres = presupuesto?.totalIngresos ?? 0;
  const totalEgrPres = presupuesto?.totalEgresos ?? 0;

  const pctIngresos = totalIngPres > 0 ? (totalIngEjec / totalIngPres) * 100 : 0;
  const pctEgresos = totalEgrPres > 0 ? (totalEgrEjec / totalEgrPres) * 100 : 0;

  if (!presupuesto) {
    return (
      <div className="mx-auto max-w-4xl space-y-5">
        <PageHero
          objetivo="Vista Mando · Tesorería"
          titulo="Presupuesto anual"
          descripcion="Aún no hay presupuesto cargado para el año."
          icono={<Target size={26} />}
        />
        <Card>
          <CardContent className="p-8 text-center text-slate-500">
            Cargá las líneas de presupuesto desde el plan de cuentas.
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <PageHero
        objetivo="Vista Mando · Tesorería"
        titulo={`Presupuesto ${presupuesto.anio} vs ejecución`}
        descripcion={`Llevamos ${pctAnio.toFixed(0)}% del año. Te muestra cuánto pensaste gastar/cobrar y cuánto va realmente.`}
        icono={<Target size={26} />}
        variant={pctEgresos > pctIngresos + 10 ? 'critical' : 'default'}
        meta={
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Kpi label="Ingresos planificados" value={arsCompact(totalIngPres)} intent="neutral" />
            <Kpi
              label="Ingresos ejecutados"
              value={arsCompact(totalIngEjec)}
              hint={`${pctIngresos.toFixed(0)}%`}
              intent={pctIngresos >= pctAnio ? 'ok' : 'warn'}
            />
            <Kpi label="Egresos planificados" value={arsCompact(totalEgrPres)} intent="neutral" />
            <Kpi
              label="Egresos ejecutados"
              value={arsCompact(totalEgrEjec)}
              hint={`${pctEgresos.toFixed(0)}%`}
              intent={pctEgresos <= pctAnio + 5 ? 'ok' : 'risk'}
            />
          </div>
        }
        acciones={
          <Button
            intent="ghost"
            size="sm"
            onClick={() => toast.push({ kind: 'info', title: 'Exportando presupuesto Excel' })}
          >
            <Download size={12} /> Exportar
          </Button>
        }
      />

      {/* Resumen ejecución vs % año */}
      <Card>
        <CardContent className="p-5">
          <h3 className="mb-3 font-bold text-slate-900">Cómo va el año</h3>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-status-ok-fg text-sm font-semibold">
                  <ArrowUpRight size={14} className="mr-1 inline" /> Ingresos
                </span>
                <Badge intent={pctIngresos >= pctAnio ? 'ok' : 'warn'}>
                  {pctIngresos >= pctAnio ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                  {(pctIngresos - pctAnio).toFixed(0)}% vs lo previsto
                </Badge>
              </div>
              <div className="relative h-8 overflow-hidden rounded-lg bg-slate-100">
                {/* Marca % año */}
                <div
                  className="absolute top-0 h-full w-px bg-slate-400"
                  style={{ left: `${pctAnio}%` }}
                />
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, pctIngresos)}%` }}
                  className="bg-status-ok h-full"
                />
                <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white mix-blend-difference">
                  {ars.format(totalIngEjec)} de {ars.format(totalIngPres)}
                </div>
              </div>
              <div className="mt-1 flex justify-between text-xs text-slate-500">
                <span>0%</span>
                <span className="font-semibold">| {pctAnio.toFixed(0)}% del año</span>
                <span>100%</span>
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-status-risk-fg text-sm font-semibold">
                  <ArrowDownRight size={14} className="mr-1 inline" /> Egresos
                </span>
                <Badge
                  intent={
                    pctEgresos <= pctAnio + 5 ? 'ok' : pctEgresos > pctAnio + 10 ? 'risk' : 'warn'
                  }
                >
                  {pctEgresos <= pctAnio + 5 ? (
                    <CheckCircle2 size={10} />
                  ) : (
                    <AlertTriangle size={10} />
                  )}
                  {(pctEgresos - pctAnio).toFixed(0)}% vs lo previsto
                </Badge>
              </div>
              <div className="relative h-8 overflow-hidden rounded-lg bg-slate-100">
                <div
                  className="absolute top-0 h-full w-px bg-slate-400"
                  style={{ left: `${pctAnio}%` }}
                />
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, pctEgresos)}%` }}
                  className={cn(
                    'h-full',
                    pctEgresos > pctAnio + 10 ? 'bg-status-risk' : 'bg-status-warn',
                  )}
                />
                <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white mix-blend-difference">
                  {ars.format(totalEgrEjec)} de {ars.format(totalEgrPres)}
                </div>
              </div>
              <div className="mt-1 flex justify-between text-xs text-slate-500">
                <span>0%</span>
                <span className="font-semibold">| {pctAnio.toFixed(0)}% del año</span>
                <span>100%</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Ingresos por cuenta */}
        <Card>
          <CardContent className="p-5">
            <h3 className="text-status-ok-fg mb-3 font-bold">
              <ArrowUpRight size={14} className="mr-1 inline" /> Ingresos por cuenta
            </h3>
            <ul className="space-y-3">
              {lineasIngresos
                .sort((a, b) => b.presupuesto - a.presupuesto)
                .map((l) => (
                  <li key={l.cuenta.id}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="font-medium text-slate-900">{l.cuenta.nombre}</span>
                      <span className="text-xs">
                        <span className="font-mono font-bold text-slate-900">
                          {arsCompact(l.ejecutado)}
                        </span>
                        <span className="text-slate-500"> / {arsCompact(l.presupuesto)}</span>
                      </span>
                    </div>
                    <div className="relative h-2 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="absolute top-0 z-10 h-full w-px bg-slate-400"
                        style={{ left: `${pctAnio}%` }}
                      />
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(100, l.pctEjec)}%` }}
                        className={cn(
                          'h-full',
                          l.pctEjec >= pctAnio
                            ? 'bg-status-ok'
                            : l.pctEjec >= pctAnio - 10
                              ? 'bg-status-warn'
                              : 'bg-status-risk',
                        )}
                      />
                    </div>
                    <div className="mt-0.5 flex justify-between text-xs">
                      <span className="text-slate-500">{l.pctEjec.toFixed(0)}% ejecutado</span>
                      <span
                        className={cn(
                          'font-semibold',
                          l.desvio >= 0 ? 'text-status-ok-fg' : 'text-status-warn-fg',
                        )}
                      >
                        {l.desvio >= 0 ? '+' : ''}
                        {l.desvio.toFixed(0)}%
                      </span>
                    </div>
                  </li>
                ))}
            </ul>
          </CardContent>
        </Card>

        {/* Egresos por cuenta */}
        <Card>
          <CardContent className="p-5">
            <h3 className="text-status-risk-fg mb-3 font-bold">
              <ArrowDownRight size={14} className="mr-1 inline" /> Egresos por cuenta
            </h3>
            <ul className="space-y-3">
              {lineasEgresos
                .sort((a, b) => b.presupuesto - a.presupuesto)
                .map((l) => (
                  <li key={l.cuenta.id}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="font-medium text-slate-900">{l.cuenta.nombre}</span>
                      <span className="text-xs">
                        <span className="font-mono font-bold text-slate-900">
                          {arsCompact(l.ejecutado)}
                        </span>
                        <span className="text-slate-500"> / {arsCompact(l.presupuesto)}</span>
                      </span>
                    </div>
                    <div className="relative h-2 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="absolute top-0 z-10 h-full w-px bg-slate-400"
                        style={{ left: `${pctAnio}%` }}
                      />
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(100, l.pctEjec)}%` }}
                        className={cn(
                          'h-full',
                          l.pctEjec > pctAnio + 10
                            ? 'bg-status-risk'
                            : l.pctEjec > pctAnio + 5
                              ? 'bg-status-warn'
                              : 'bg-status-ok',
                        )}
                      />
                    </div>
                    <div className="mt-0.5 flex justify-between text-xs">
                      <span className="text-slate-500">{l.pctEjec.toFixed(0)}% ejecutado</span>
                      <span
                        className={cn(
                          'font-semibold',
                          l.desvio > 5
                            ? 'text-status-risk-fg'
                            : l.desvio > 0
                              ? 'text-status-warn-fg'
                              : 'text-status-ok-fg',
                        )}
                      >
                        {l.desvio >= 0 ? '+' : ''}
                        {l.desvio.toFixed(0)}%
                      </span>
                    </div>
                  </li>
                ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card className="border-slate-200 bg-slate-50">
        <CardContent className="flex items-start gap-3 p-4 text-sm text-slate-600">
          <Target size={18} className="mt-0.5 shrink-0 text-slate-400" />
          <div>
            <strong className="text-slate-900">Cómo leer:</strong> la barra vertical marca el % del
            año transcurrido ({pctAnio.toFixed(0)}%). Si una cuenta tiene la barra a ese nivel o por
            encima, va al ritmo esperado. Más alto = se está usando más rápido de lo previsto. Para
            ingresos eso es bueno (verde), para egresos puede ser problema (amarillo/rojo).
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
