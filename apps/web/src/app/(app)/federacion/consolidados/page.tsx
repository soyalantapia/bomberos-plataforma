'use client';

import { Activity, BarChart3, Flag, Flame, TrendingUp, Users } from 'lucide-react';
import { useMemo, useState } from 'react';

import type { TipoServicio } from '@faro/types';

import { Badge, Card, CardContent, Kpi, cn } from '@faro/ui';

import { PageHero } from '../../../../components/shared/page-hero';
import { mesKey } from '../../../../lib/utils/date';
import { demoToday } from '../../../../lib/utils/demo-today';
import { tipoServicioLabel } from '../../../../lib/utils/tipo-servicio';
import { useFaroStore } from '../../../../store/use-faro-store';

const TIPOS: TipoServicio[] = ['incendio', 'rescate', 'accidente', 'forestal', 'otro'];
const TIPO_COLOR: Record<TipoServicio, string> = {
  incendio: 'bg-status-risk',
  rescate: 'bg-brand-600',
  accidente: 'bg-status-warn',
  forestal: 'bg-status-ok',
  otro: 'bg-slate-400',
};

export default function ConsolidadosFed() {
  const cuarteles = useFaroStore((s) => s.cuarteles);
  const personas = useFaroStore((s) => s.personas);
  const servicios = useFaroStore((s) => s.servicios);
  const [vista, setVista] = useState<'cumplimiento' | 'serv' | 'personal'>('cumplimiento');

  const periodo = mesKey(demoToday());
  const d = useMemo(() => {
    const enRegla = cuarteles.filter((c) => c.cumplimiento === 'ok').length;
    const atencion = cuarteles.filter((c) => c.cumplimiento === 'warn').length;
    const enRiesgo = cuarteles.filter((c) => c.cumplimiento === 'risk').length;
    const promedio = cuarteles.length
      ? Math.round(cuarteles.reduce((a, c) => a + c.porcentajeRendicion, 0) / cuarteles.length)
      : 0;

    const byReg: Record<string, { n: number; suma: number; riesgo: number }> = {};
    cuarteles.forEach((c) => {
      const r = (byReg[c.region] ??= { n: 0, suma: 0, riesgo: 0 });
      r.n++;
      r.suma += c.porcentajeRendicion;
      if (c.cumplimiento === 'risk') r.riesgo++;
    });
    const regiones = Object.entries(byReg)
      .map(([region, r]) => ({ region, n: r.n, prom: Math.round(r.suma / r.n), riesgo: r.riesgo }))
      .sort((a, b) => b.prom - a.prom);

    const servsMes = servicios.filter((s) => s.horaSalida.slice(0, 7) === periodo);
    const porTipo = TIPOS.map((t) => ({
      t,
      n: servsMes.filter((s) => s.tipo === t).length,
    })).filter((x) => x.n > 0);

    const activos = personas.filter((p) => p.estado === 'activo');
    const operativo = activos.filter((p) => p.cuerpo !== 'administrativo').length;
    const admin = activos.length - operativo;
    const conPadron = new Set(activos.map((p) => p.cuartelId)).size;

    return {
      enRegla,
      atencion,
      enRiesgo,
      promedio,
      regiones,
      servsMes,
      porTipo,
      personalActivo: activos.length,
      operativo,
      admin,
      conPadron,
    };
  }, [cuarteles, personas, servicios, periodo]);

  const maxReg = Math.max(1, ...d.regiones.map((r) => r.prom));
  const maxTipo = Math.max(1, ...d.porTipo.map((x) => x.n));
  const totalSemaforo = d.enRegla + d.atencion + d.enRiesgo || 1;

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <PageHero
        objetivo="Federación · Consolidados"
        titulo="La red en números"
        descripcion="Lo que antes había que pedir cuartel por cuartel, sumado en vivo desde el sistema. Todo calculado de los datos cargados — sin números inventados."
        icono={<BarChart3 size={26} />}
        meta={
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Kpi label="Cuarteles" value={cuarteles.length} hint="en la red" intent="brand" />
            <Kpi
              label="Cumplimiento"
              value={`${d.promedio}%`}
              hint="promedio"
              intent={d.promedio >= 90 ? 'ok' : d.promedio >= 70 ? 'warn' : 'risk'}
            />
            <Kpi
              label="En riesgo"
              value={d.enRiesgo}
              hint="cuarteles"
              intent={d.enRiesgo > 0 ? 'risk' : 'ok'}
              icon={<Flag size={16} />}
            />
            <Kpi
              label="Personal"
              value={d.personalActivo}
              hint="activos"
              intent="neutral"
              icon={<Users size={16} />}
            />
          </div>
        }
      />

      <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1">
        {[
          { v: 'cumplimiento' as const, l: 'Cumplimiento', icon: <Flag size={14} /> },
          { v: 'serv' as const, l: 'Servicios', icon: <Flame size={14} /> },
          { v: 'personal' as const, l: 'Personal', icon: <Users size={14} /> },
        ].map((t) => (
          <button
            key={t.v}
            type="button"
            onClick={() => setVista(t.v)}
            className={cn(
              'inline-flex shrink-0 items-center gap-2 rounded-full px-3.5 py-2 text-sm font-medium transition-colors',
              vista === t.v
                ? 'bg-brand-600 text-white'
                : 'bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50',
            )}
          >
            {t.icon} {t.l}
          </button>
        ))}
      </div>

      {vista === 'cumplimiento' && (
        <div className="grid gap-5 lg:grid-cols-2">
          <Card>
            <CardContent className="p-5">
              <h3 className="mb-3 font-bold text-slate-900">Distribución de la red</h3>
              <div className="flex h-7 overflow-hidden rounded-lg">
                <div
                  className="bg-status-ok grid place-items-center text-xs font-bold text-white"
                  style={{ width: `${(d.enRegla / totalSemaforo) * 100}%` }}
                >
                  {d.enRegla}
                </div>
                <div
                  className="bg-status-warn grid place-items-center text-xs font-bold text-white"
                  style={{ width: `${(d.atencion / totalSemaforo) * 100}%` }}
                >
                  {d.atencion}
                </div>
                <div
                  className="bg-status-risk grid place-items-center text-xs font-bold text-white"
                  style={{ width: `${(d.enRiesgo / totalSemaforo) * 100}%` }}
                >
                  {d.enRiesgo}
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-3 text-xs">
                <span className="inline-flex items-center gap-1.5">
                  <span className="bg-status-ok h-2.5 w-2.5 rounded-sm" /> En regla ({d.enRegla})
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="bg-status-warn h-2.5 w-2.5 rounded-sm" /> Atención ({d.atencion})
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="bg-status-risk h-2.5 w-2.5 rounded-sm" /> En riesgo ({d.enRiesgo}
                  )
                </span>
              </div>
              <p className="mt-4 text-sm text-slate-600">
                {d.enRiesgo > 0 ? (
                  <>
                    <strong>{d.enRiesgo}</strong> cuarteles en riesgo de no llegar a la rendición.
                    Priorizar acompañamiento antes del cierre del Fondo.
                  </>
                ) : (
                  'Toda la red en regla este mes.'
                )}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <h3 className="mb-3 font-bold text-slate-900">Regiones por cumplimiento</h3>
              <div className="space-y-2.5">
                {d.regiones.map((r) => (
                  <div key={r.region}>
                    <div className="mb-1 flex items-baseline justify-between text-sm">
                      <span className="font-medium text-slate-900">{r.region}</span>
                      <span className="tabular-nums text-slate-600">
                        {r.prom}% · {r.n}
                        {r.riesgo > 0 && (
                          <span className="text-status-risk-fg ml-1">· {r.riesgo} riesgo</span>
                        )}
                      </span>
                    </div>
                    <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className={cn(
                          'h-full rounded-full',
                          r.prom >= 90
                            ? 'bg-status-ok'
                            : r.prom >= 70
                              ? 'bg-status-warn'
                              : 'bg-status-risk',
                        )}
                        style={{ width: `${(r.prom / maxReg) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {vista === 'serv' && (
        <Card>
          <CardContent className="p-5">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-bold text-slate-900">Servicios de la red · {periodo}</h3>
              <Badge intent="brand">{d.servsMes.length} servicios</Badge>
            </div>
            {d.porTipo.length === 0 ? (
              <p className="text-sm text-slate-500">Sin servicios registrados en el período.</p>
            ) : (
              <div className="space-y-2.5">
                {d.porTipo
                  .sort((a, b) => b.n - a.n)
                  .map(({ t, n }) => (
                    <div key={t}>
                      <div className="mb-1 flex items-baseline justify-between text-sm">
                        <span className="font-medium text-slate-900">{tipoServicioLabel[t]}</span>
                        <span className="tabular-nums text-slate-700">
                          {n} · {Math.round((n / d.servsMes.length) * 100)}%
                        </span>
                      </div>
                      <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className={cn('h-full rounded-full', TIPO_COLOR[t])}
                          style={{ width: `${(n / maxTipo) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
              </div>
            )}
            <p className="mt-4 flex items-center gap-1.5 text-xs text-slate-500">
              <Activity size={12} /> Agregado de los partes cargados por los cuarteles de la red.
            </p>
          </CardContent>
        </Card>
      )}

      {vista === 'personal' && (
        <div className="grid gap-5 lg:grid-cols-2">
          <Card>
            <CardContent className="p-5">
              <h3 className="mb-3 font-bold text-slate-900">Personal de la red</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-status-ok-bg/40 rounded-xl p-4">
                  <Users size={20} className="text-status-ok" />
                  <div className="mt-2 text-3xl font-bold tabular-nums text-slate-900">
                    {d.personalActivo}
                  </div>
                  <div className="text-xs text-slate-600">activos</div>
                </div>
                <div className="bg-brand-50 rounded-xl p-4">
                  <TrendingUp size={20} className="text-brand-600" />
                  <div className="mt-2 text-3xl font-bold tabular-nums text-slate-900">
                    {d.operativo}
                  </div>
                  <div className="text-xs text-slate-600">cuerpo operativo</div>
                </div>
                <div className="bg-status-warn-bg/40 rounded-xl p-4">
                  <BarChart3 size={20} className="text-status-warn-fg" />
                  <div className="mt-2 text-3xl font-bold tabular-nums text-slate-900">
                    {d.admin}
                  </div>
                  <div className="text-xs text-slate-600">administrativo</div>
                </div>
                <div className="rounded-xl bg-slate-50 p-4">
                  <Flag size={20} className="text-slate-700" />
                  <div className="mt-2 text-3xl font-bold tabular-nums text-slate-900">
                    {d.conPadron}
                  </div>
                  <div className="text-xs text-slate-600">cuarteles con padrón cargado</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex flex-col justify-center p-5 text-sm text-slate-600">
              <p>
                El padrón consolidado suma {d.personalActivo} bomberos activos de los {d.conPadron}{' '}
                cuartel{d.conPadron === 1 ? '' : 'es'} con padrón ya cargado en el sistema. A medida
                que cada cuartel sube su padrón, este consolidado se actualiza solo — sin pedirlo
                por mail ni armar planillas.
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
