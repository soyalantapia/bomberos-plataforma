'use client';

import { ArrowUpRight, PieChart, TrendingUp, Triangle, Users } from 'lucide-react';
import { useMemo } from 'react';

import { Badge, Card, CardContent, Kpi, cn, useToast } from '@faro/ui';

import { PageHero } from '../../../../components/shared/page-hero';
import { calcularEquidadGenero } from '../../../../lib/utils/genero';
import { useFaroStore } from '../../../../store/use-faro-store';

export default function EquidadGeneroPage() {
  const toast = useToast();
  const personas = useFaroStore((s) => s.personas);
  const eq = useMemo(() => calcularEquidadGenero(personas), [personas]);

  const brechaAlta = eq.brechaConduccion >= 5;
  const maxFila = Math.max(...eq.porJerarquia.map((f) => f.total), 1);

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <PageHero
        objetivo="Gobierno interno · Equidad"
        titulo="Composición por género del cuerpo"
        descripcion="Cómo está integrado el cuerpo activo y si la representación se sostiene al subir en la jerarquía. Base: legajo del padrón, personal en actividad."
        icono={<PieChart size={26} />}
        variant={brechaAlta ? 'critical' : 'default'}
        meta={
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Kpi label="Activos" value={eq.total} hint="con dato de sexo" intent="brand" />
            <Kpi
              label="Mujeres"
              value={`${eq.pctMujeres}%`}
              hint={`${eq.mujeres} de ${eq.total}`}
              intent="neutral"
            />
            <Kpi
              label="En conducción"
              value={`${eq.pctMujeresConduccion}%`}
              hint="mujeres oficiales"
              intent={brechaAlta ? 'risk' : 'ok'}
            />
            <Kpi
              label="Ingreso reciente"
              value={`${eq.pctMujeresIngresosRecientes}%`}
              hint="mujeres · últ. 3 años"
              intent="neutral"
              icon={<TrendingUp size={16} />}
            />
          </div>
        }
      />

      {/* Lectura accionable */}
      <Card
        className={cn(
          'border-2',
          brechaAlta
            ? 'border-status-warn/30 bg-status-warn-bg/20'
            : 'border-status-ok/30 bg-status-ok-bg/20',
        )}
      >
        <CardContent className="flex items-start gap-3 p-4">
          <Triangle
            size={20}
            className={cn(
              'mt-0.5 shrink-0',
              brechaAlta ? 'text-status-warn-fg' : 'text-status-ok-fg',
            )}
          />
          <div className="space-y-3 text-sm text-slate-700">
            <p>
              Las mujeres son el <strong>{eq.pctMujeres}%</strong> del cuerpo activo ({eq.mujeres}{' '}
              de {eq.total}), pero en el cuadro de oficiales representan el{' '}
              <strong>{eq.pctMujeresConduccion}%</strong>.{' '}
              {brechaAlta ? (
                <>
                  Hay una brecha de <strong>{eq.brechaConduccion} puntos</strong> entre la base y la
                  conducción: la representación se diluye al ascender.
                </>
              ) : (
                <>La representación se sostiene razonablemente al subir en la jerarquía.</>
              )}{' '}
              En las incorporaciones de los últimos 3 años las mujeres fueron el{' '}
              <strong>{eq.pctMujeresIngresosRecientes}%</strong>
              {eq.pctMujeresIngresosRecientes > eq.pctMujeres
                ? ' — la tendencia mejora.'
                : eq.pctMujeresIngresosRecientes < eq.pctMujeres
                  ? ' — la tendencia no acompaña.'
                  : '.'}
            </p>
            <button
              type="button"
              onClick={() =>
                toast.push({
                  kind: 'success',
                  title: 'Convocatoria con perspectiva de género',
                  description:
                    'Se registró la iniciativa de incorporación con cupo. Quedó en la agenda de comisión.',
                })
              }
              className="bg-brand-700 hover:bg-brand-800 inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-semibold text-white"
            >
              <ArrowUpRight size={15} /> Impulsar convocatoria con perspectiva de género
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Composición global */}
      <Card>
        <CardContent className="p-4">
          <div className="mb-3 flex items-center gap-2">
            <Users size={18} className="text-slate-700" />
            <h3 className="font-bold text-slate-900">Composición del cuerpo activo</h3>
          </div>
          <div className="flex h-4 overflow-hidden rounded-full bg-slate-100">
            <div
              className="bg-brand-500 h-full"
              style={{ width: `${eq.total ? (eq.mujeres / eq.total) * 100 : 0}%` }}
              title={`Mujeres: ${eq.mujeres}`}
            />
            <div
              className="h-full bg-slate-400"
              style={{ width: `${eq.total ? (eq.varones / eq.total) * 100 : 0}%` }}
              title={`Varones: ${eq.varones}`}
            />
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
            <div className="rounded-xl bg-slate-50 p-3">
              <div className="text-brand-700 inline-flex items-center gap-1.5 text-xs font-medium">
                <span className="bg-brand-500 h-2.5 w-2.5 rounded-full" /> Mujeres
              </div>
              <div className="mt-1 text-xl font-bold text-slate-900">
                {eq.mujeres}{' '}
                <span className="text-sm font-medium text-slate-500">· {eq.pctMujeres}%</span>
              </div>
            </div>
            <div className="rounded-xl bg-slate-50 p-3">
              <div className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600">
                <span className="h-2.5 w-2.5 rounded-full bg-slate-400" /> Varones
              </div>
              <div className="mt-1 text-xl font-bold text-slate-900">
                {eq.varones}{' '}
                <span className="text-sm font-medium text-slate-500">
                  · {eq.total ? Math.round((eq.varones / eq.total) * 100) : 0}%
                </span>
              </div>
            </div>
            <div className="rounded-xl bg-slate-50 p-3">
              <div className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600">
                <span className="h-2.5 w-2.5 rounded-full bg-slate-300" /> Sin dato
              </div>
              <div className="mt-1 text-xl font-bold text-slate-900">{eq.sinDato}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pirámide por jerarquía */}
      <Card>
        <CardContent className="p-4">
          <h3 className="mb-1 font-bold text-slate-900">Representación por jerarquía</h3>
          <p className="mb-3 text-xs text-slate-500">
            De mayor a menor rango. La franja{' '}
            <span className="text-brand-700 font-semibold">azul</span> es la proporción de mujeres.
          </p>
          <div className="space-y-2.5">
            {eq.porJerarquia.map((f) => (
              <div key={f.jerarquia} className="flex items-center gap-3">
                <div className="w-28 shrink-0 text-right text-xs font-medium text-slate-700">
                  {f.label}
                </div>
                <div className="flex-1">
                  <div
                    className="flex h-5 overflow-hidden rounded-md bg-slate-100"
                    style={{ width: `${Math.max((f.total / maxFila) * 100, 6)}%` }}
                  >
                    {f.mujeres > 0 && (
                      <div
                        className="bg-brand-500 grid h-full place-items-center text-[10px] font-bold text-white"
                        style={{ width: `${(f.mujeres / f.total) * 100}%` }}
                      >
                        {f.mujeres}
                      </div>
                    )}
                    {f.varones + f.otros > 0 && (
                      <div
                        className="grid h-full flex-1 place-items-center bg-slate-400 text-[10px] font-bold text-white"
                        title={`Varones/otros: ${f.varones + f.otros}`}
                      >
                        {f.varones + f.otros}
                      </div>
                    )}
                  </div>
                </div>
                <div className="w-14 shrink-0 text-xs tabular-nums text-slate-500">
                  {f.pctMujeres}% M
                </div>
              </div>
            ))}
          </div>
          {eq.conduccion > 0 && (
            <div className="mt-4 flex items-center gap-2 border-t border-slate-100 pt-3 text-xs text-slate-600">
              <Badge intent={brechaAlta ? 'warn' : 'ok'}>Conducción</Badge>
              <span>
                {eq.mujeresConduccion} de {eq.conduccion} oficiales son mujeres (
                {eq.pctMujeresConduccion}%).
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
