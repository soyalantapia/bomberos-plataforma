'use client';

import { Badge, Button, Card, CardContent, Kpi, cn } from '@faro/ui';
import {
  AlertTriangle,
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  Clock,
  Landmark,
  ShieldAlert,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useMemo } from 'react';

import { ars, arsCompact } from '../../../../../components/finanzas/utils';
import { PageHero } from '../../../../../components/shared/page-hero';
import { demoToday } from '../../../../../lib/utils/demo-today';
import { subsidiosMock, type TipoSubsidio } from '../../../../../data/subsidios';
import { selectCuartelActivo, useFaroStore } from '../../../../../store/use-faro-store';

const TIPO: Record<TipoSubsidio, { label: string; chip: string }> = {
  nacional: { label: 'Nacional', chip: 'bg-brand-100 text-brand-700' },
  provincial: { label: 'Provincial', chip: 'bg-violet-100 text-violet-700' },
  municipal: { label: 'Municipal', chip: 'bg-amber-100 text-amber-800' },
};

function dias(desde: string, hasta: string): number {
  return Math.round((new Date(hasta).getTime() - new Date(desde).getTime()) / 86400000);
}

const HOY = () => demoToday().toISOString().slice(0, 10);

type Nivel = 'vencido' | 'urgente' | 'atrasado' | 'ok' | 'completo';

const NIVEL: Record<
  Nivel,
  { label: string; intent: 'risk' | 'warn' | 'ok'; bar: string; border: string }
> = {
  vencido: {
    label: 'Vencido',
    intent: 'risk',
    bar: 'bg-status-risk',
    border: 'border-status-risk/40',
  },
  urgente: {
    label: 'Urgente',
    intent: 'risk',
    bar: 'bg-status-risk',
    border: 'border-status-risk/40',
  },
  atrasado: {
    label: 'Atrasado',
    intent: 'warn',
    bar: 'bg-status-warn',
    border: 'border-status-warn/30',
  },
  ok: { label: 'En ritmo', intent: 'ok', bar: 'bg-status-ok', border: 'border-slate-200' },
  completo: {
    label: 'Ejecutado',
    intent: 'ok',
    bar: 'bg-status-ok',
    border: 'border-status-ok/30',
  },
};

const ORDEN: Record<Nivel, number> = { vencido: 0, urgente: 1, atrasado: 2, ok: 3, completo: 4 };

export default function SubsidiosPage() {
  const router = useRouter();
  const cuartel = useFaroStore(selectCuartelActivo);
  const hoy = HOY();

  const subsidios = useMemo(
    () =>
      subsidiosMock
        .map((s) => {
          const disponible = Math.max(0, s.montoOtorgado - s.ejecutado);
          const pctEjec = s.montoOtorgado > 0 ? (s.ejecutado / s.montoOtorgado) * 100 : 0;
          const ventana = Math.max(1, dias(s.fechaCobro, s.fechaLimiteEjecucion));
          const transcurrido = dias(s.fechaCobro, hoy);
          const pctTiempo = Math.min(100, Math.max(0, (transcurrido / ventana) * 100));
          const diasRestantes = dias(hoy, s.fechaLimiteEjecucion);
          let nivel: Nivel;
          if (pctEjec >= 99) nivel = 'completo';
          else if (diasRestantes <= 0) nivel = 'vencido';
          else if (diasRestantes < 15) nivel = 'urgente';
          else if (pctEjec < pctTiempo - 8) nivel = 'atrasado';
          else nivel = 'ok';
          return { ...s, disponible, pctEjec, pctTiempo, diasRestantes, nivel };
        })
        .sort((a, b) => ORDEN[a.nivel] - ORDEN[b.nivel] || a.diasRestantes - b.diasRestantes),
    [hoy],
  );

  const totalOtorgado = subsidios.reduce((a, s) => a + s.montoOtorgado, 0);
  const totalEjecutado = subsidios.reduce((a, s) => a + s.ejecutado, 0);
  const totalDisponible = subsidios.reduce((a, s) => a + s.disponible, 0);
  const pctGlobal = totalOtorgado > 0 ? (totalEjecutado / totalOtorgado) * 100 : 0;
  const proximos = subsidios.filter((s) => s.disponible > 0 && s.diasRestantes > 0);
  const venceMasPronto = proximos.length ? Math.min(...proximos.map((s) => s.diasRestantes)) : null;
  const hayUrgente = subsidios.some(
    (s) => (s.nivel === 'urgente' || s.nivel === 'vencido') && s.disponible > 0,
  );

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <PageHero
        objetivo={`Tesorería · ${cuartel?.nombre ?? 'Cuartel'}`}
        titulo={
          totalDisponible > 0
            ? `Tenés ${arsCompact(totalDisponible)} de subsidio para ejecutar`
            : 'Subsidios al día'
        }
        descripcion="Lo que el Estado te dio y cuánto tiempo te queda para ejecutarlo. Lo que no se ejecuta a tiempo se rinde mal o se devuelve."
        icono={<CalendarClock size={26} />}
        variant={hayUrgente ? 'critical' : totalDisponible === 0 ? 'success' : 'default'}
        meta={
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Kpi
              label="Otorgado"
              value={arsCompact(totalOtorgado)}
              hint={`${subsidios.length} subsidios`}
              intent="brand"
            />
            <Kpi
              label="Ejecutado"
              value={`${pctGlobal.toFixed(0)}%`}
              hint={arsCompact(totalEjecutado)}
              intent={pctGlobal >= 70 ? 'ok' : 'warn'}
            />
            <Kpi
              label="Por ejecutar"
              value={arsCompact(totalDisponible)}
              intent={totalDisponible > 0 ? 'warn' : 'ok'}
            />
            <Kpi
              label="Vence más pronto"
              value={venceMasPronto !== null ? `${venceMasPronto} días` : '—'}
              intent={venceMasPronto !== null && venceMasPronto < 15 ? 'risk' : 'neutral'}
              icon={<Clock size={16} />}
            />
          </div>
        }
      />

      <div className="space-y-4">
        {subsidios.map((s) => {
          const cfg = NIVEL[s.nivel];
          const apurar = (s.nivel === 'urgente' || s.nivel === 'atrasado') && s.disponible > 0;
          return (
            <Card key={s.id} className={cn('overflow-hidden border', cfg.border)}>
              <CardContent className="p-5">
                {/* Encabezado */}
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          'rounded-full px-2 py-0.5 text-[11px] font-bold',
                          TIPO[s.tipo].chip,
                        )}
                      >
                        {TIPO[s.tipo].label}
                      </span>
                      <span className="text-xs text-slate-500">{s.periodo}</span>
                    </div>
                    <h3 className="mt-1 font-bold text-slate-900">{s.nombre}</h3>
                    <div className="flex items-center gap-1 text-xs text-slate-500">
                      <Landmark size={12} /> {s.organismo}
                    </div>
                  </div>
                  <Badge intent={cfg.intent}>
                    {s.nivel === 'completo' ? (
                      <CheckCircle2 size={11} />
                    ) : (
                      <AlertTriangle size={11} />
                    )}
                    {cfg.label}
                  </Badge>
                </div>

                {/* El reloj: días + disponible */}
                <div className="mt-4 flex flex-wrap items-end justify-between gap-2">
                  <div>
                    <div
                      className={cn(
                        'text-3xl font-black tabular-nums',
                        s.diasRestantes <= 0
                          ? 'text-status-risk-fg'
                          : s.diasRestantes < 15
                            ? 'text-status-risk-fg'
                            : s.diasRestantes < 30
                              ? 'text-status-warn-fg'
                              : 'text-slate-900',
                      )}
                    >
                      {s.diasRestantes <= 0 ? 'Plazo vencido' : `${s.diasRestantes} días`}
                    </div>
                    <div className="text-xs text-slate-500">
                      para ejecutar · hasta el {s.fechaLimiteEjecucion}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-xl font-bold text-slate-900">
                      {ars.format(s.disponible)}
                    </div>
                    <div className="text-xs text-slate-500">sin ejecutar</div>
                  </div>
                </div>

                {/* Barra ejecución vs plazo transcurrido */}
                <div className="mt-3">
                  <div className="relative h-3 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="absolute top-0 z-10 h-full w-0.5 bg-slate-500"
                      style={{ left: `${s.pctTiempo}%` }}
                      title={`${s.pctTiempo.toFixed(0)}% del plazo transcurrido`}
                    />
                    <div
                      className={cn('h-full rounded-full transition-[width]', cfg.bar)}
                      style={{ width: `${Math.min(100, s.pctEjec)}%` }}
                    />
                  </div>
                  <div className="mt-1 flex justify-between text-xs">
                    <span className="text-slate-600">
                      Ejecutado <strong className="text-slate-900">{s.pctEjec.toFixed(0)}%</strong>
                    </span>
                    <span className="text-slate-500">| {s.pctTiempo.toFixed(0)}% del plazo</span>
                  </div>
                </div>

                {/* Veredicto */}
                <p
                  className={cn(
                    'mt-3 rounded-lg p-2.5 text-sm',
                    apurar || s.nivel === 'vencido'
                      ? 'bg-status-risk-bg/30 text-slate-700'
                      : 'bg-slate-50 text-slate-600',
                  )}
                >
                  {s.nivel === 'completo' ? (
                    <>Subsidio ejecutado y rendido a tiempo. Nada pendiente.</>
                  ) : s.nivel === 'vencido' ? (
                    <>
                      <strong className="text-status-risk-fg">El plazo venció</strong> con{' '}
                      {ars.format(s.disponible)} sin ejecutar. Hablá con el organismo antes de
                      devolverlo.
                    </>
                  ) : apurar ? (
                    <>
                      <strong className="text-status-risk-fg">Apurate:</strong> te quedan{' '}
                      {ars.format(s.disponible)} para ejecutar y solo{' '}
                      <strong>{s.diasRestantes} días</strong>. Vas al {s.pctEjec.toFixed(0)}% cuando
                      el plazo va al {s.pctTiempo.toFixed(0)}%.
                    </>
                  ) : (
                    <>
                      Vas en ritmo: {s.pctEjec.toFixed(0)}% ejecutado con {s.diasRestantes} días por
                      delante.
                    </>
                  )}
                </p>

                {/* Ley 25.054 */}
                {s.requiere70Sueldos && (
                  <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                    <ShieldAlert size={13} className="text-status-warn-fg shrink-0" />
                    Ley 25.054: al menos el 70% debe aplicarse a sueldos del personal rentado.
                  </div>
                )}

                {/* Acciones */}
                <div className="mt-3 flex flex-wrap gap-2 border-t border-slate-100 pt-3">
                  <Button
                    intent={apurar ? 'primary' : 'ghost'}
                    size="sm"
                    onClick={() => router.push('/mando/finanzas/movimientos')}
                  >
                    Registrar ejecución <ArrowRight size={14} />
                  </Button>
                  {s.requiere70Sueldos && (
                    <Button
                      intent="ghost"
                      size="sm"
                      onClick={() => router.push('/mando/finanzas/reportes')}
                    >
                      Ver cumplimiento Ley 25.054
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="border-slate-200 bg-slate-50">
        <CardContent className="flex items-start gap-3 p-4 text-sm text-slate-600">
          <CalendarClock size={18} className="mt-0.5 shrink-0 text-slate-500" />
          <div>
            <strong className="text-slate-900">¿Por qué importa el reloj?</strong> Los subsidios
            tienen fecha de ejecución: lo que no gastás/invertís a tiempo se rinde mal o se
            devuelve. La barra te muestra si vas al ritmo del plazo — si está por detrás de la línea
            gris, estás atrasado y conviene apurar gastos o inversiones elegibles.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
