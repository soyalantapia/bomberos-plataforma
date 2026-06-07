'use client';

import { Badge, Card, CardContent, Kpi, cn } from '@faro/ui';
import { ArrowRight, Clock, Droplets, HeartPulse, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';

import { ejecucionPctCuartel } from '../../../../components/federacion/finanzas-utils';
import { aireIntent, arsCompact } from '../../../../components/finanzas/utils';
import { PageHero } from '../../../../components/shared/page-hero';
import { cuartelesMock } from '../../../../data/cuarteles';
import { finanzasCuartel } from '../../../../lib/utils/finanzas-red';

type Salud = 'ok' | 'warn' | 'risk';

const SALUD: Record<Salud, { label: string; intent: 'ok' | 'warn' | 'risk'; dot: string }> = {
  risk: { label: 'En riesgo', intent: 'risk', dot: 'bg-status-risk' },
  warn: { label: 'Atención', intent: 'warn', dot: 'bg-status-warn' },
  ok: { label: 'Sana', intent: 'ok', dot: 'bg-status-ok' },
};
const ORDEN: Record<Salud, number> = { risk: 0, warn: 1, ok: 2 };

const AIRE_TXT: Record<'ok' | 'warn' | 'risk' | 'neutral', string> = {
  ok: 'text-status-ok-fg',
  warn: 'text-status-warn-fg',
  risk: 'text-status-risk-fg',
  neutral: 'text-slate-900',
};

export default function SaludFinancieraRed() {
  const [filtro, setFiltro] = useState<'atencion' | 'riesgo' | 'todos'>('atencion');

  const datos = useMemo(
    () =>
      cuartelesMock
        .map((c) => {
          const f = finanzasCuartel(c);
          return {
            id: c.id,
            nombre: c.nombre,
            region: c.region,
            salud: f.salud as Salud,
            mesesAire: f.mesesAire,
            morosidadPct: f.morosidadPct,
            caja: f.caja,
            ejec: Math.round(ejecucionPctCuartel(c.id)),
          };
        })
        .sort((a, b) => ORDEN[a.salud] - ORDEN[b.salud] || a.mesesAire - b.mesesAire),
    [],
  );

  const enRiesgo = datos.filter((d) => d.salud === 'risk').length;
  const atencion = datos.filter((d) => d.salud !== 'ok').length;
  const mesesProm = datos.reduce((a, d) => a + d.mesesAire, 0) / datos.length;
  const morosidadProm = Math.round(datos.reduce((a, d) => a + d.morosidadPct, 0) / datos.length);

  const FILTROS = [
    { key: 'atencion' as const, label: 'Necesitan atención', n: atencion },
    { key: 'riesgo' as const, label: 'En riesgo', n: enRiesgo },
    { key: 'todos' as const, label: 'Todos', n: datos.length },
  ];
  const visibles =
    filtro === 'riesgo'
      ? datos.filter((d) => d.salud === 'risk')
      : filtro === 'atencion'
        ? datos.filter((d) => d.salud !== 'ok')
        : datos;

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <PageHero
        objetivo="Federación Bonaerense · salud financiera de la red"
        titulo={
          enRiesgo > 0
            ? `${enRiesgo} cuarteles con la caja en riesgo`
            : 'La red, financieramente sana'
        }
        descripcion="Indicadores financieros por cuartel: meses de aire, morosidad de cuotas y ejecución de subsidios."
        icono={<HeartPulse size={26} />}
        variant={enRiesgo > 0 ? 'critical' : 'default'}
        meta={
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Kpi label="En riesgo" value={enRiesgo} intent={enRiesgo > 0 ? 'risk' : 'ok'} />
            <Kpi label="A vigilar" value={atencion} intent={atencion > 0 ? 'warn' : 'ok'} />
            <Kpi
              label="Meses de aire"
              value={mesesProm.toFixed(1).replace('.', ',')}
              hint="promedio"
              intent={aireIntent(mesesProm)}
              icon={<Clock size={16} />}
            />
            <Kpi
              label="Morosidad"
              value={`${morosidadProm}%`}
              hint="cuotas, promedio"
              intent={morosidadProm > 15 ? 'warn' : 'ok'}
            />
          </div>
        }
      />

      {/* No-HIP */}
      <Card className="border-slate-200 bg-slate-50">
        <CardContent className="flex items-start gap-3 p-4 text-sm text-slate-600">
          <ShieldCheck size={18} className="mt-0.5 shrink-0 text-slate-500" />
          <div>
            <strong className="text-slate-900">Es salud financiera, no calificación.</strong> Esto
            mide la economía del cuartel (caja, cuotas, ejecución de subsidios) — no su desempeño
            operativo ni su puntaje. La Federación ve indicadores consolidados, nunca los
            movimientos internos de cada cuartel.
          </div>
        </CardContent>
      </Card>

      {/* Filtro */}
      <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1">
        {FILTROS.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setFiltro(f.key)}
            className={cn(
              'inline-flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors',
              filtro === f.key
                ? 'bg-brand-600 text-white'
                : 'bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50',
            )}
          >
            {f.label}
            <span
              className={cn(
                'rounded-full px-1.5 text-[10px] font-bold tabular-nums',
                filtro === f.key ? 'bg-white/25' : 'bg-slate-100 text-slate-600',
              )}
            >
              {f.n}
            </span>
          </button>
        ))}
      </div>

      {/* Ranking */}
      <div className="space-y-2">
        {visibles.map((d) => {
          const cfg = SALUD[d.salud];
          return (
            <Link
              key={d.id}
              href={`/federacion/cuartel/${d.id}` as never}
              className="block transition-shadow hover:shadow-md"
            >
              <Card>
                <CardContent className="p-3.5">
                  <div className="flex items-center gap-2.5">
                    <span className={cn('h-2.5 w-2.5 shrink-0 rounded-full', cfg.dot)} />
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-semibold text-slate-900">{d.nombre}</div>
                      <div className="truncate text-xs text-slate-500">{d.region}</div>
                    </div>
                    <Badge intent={cfg.intent}>{cfg.label}</Badge>
                    <ArrowRight size={15} className="shrink-0 text-slate-300" />
                  </div>
                  <div className="mt-2.5 grid grid-cols-3 gap-2 border-t border-slate-100 pt-2.5 text-center">
                    <div>
                      <div
                        className={cn(
                          'font-mono text-sm font-bold',
                          AIRE_TXT[aireIntent(d.mesesAire)],
                        )}
                      >
                        {d.mesesAire.toFixed(1).replace('.', ',')}
                      </div>
                      <div className="text-[11px] text-slate-500">meses de aire</div>
                    </div>
                    <div>
                      <div
                        className={cn(
                          'font-mono text-sm font-bold',
                          d.morosidadPct > 15 ? 'text-status-warn-fg' : 'text-slate-900',
                        )}
                      >
                        {d.morosidadPct}%
                      </div>
                      <div className="text-[11px] text-slate-500">morosidad</div>
                    </div>
                    <div>
                      <div
                        className={cn(
                          'font-mono text-sm font-bold',
                          d.ejec < 50 ? 'text-status-risk-fg' : 'text-slate-900',
                        )}
                      >
                        {d.ejec}%
                      </div>
                      <div className="text-[11px] text-slate-500">ejecución</div>
                    </div>
                  </div>
                  <div className="mt-1.5 flex items-center justify-center gap-1 text-[11px] text-slate-400">
                    <Droplets size={11} /> {arsCompact(d.caja)} en caja
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
