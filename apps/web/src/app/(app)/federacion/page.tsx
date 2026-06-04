'use client';

import {
  AlertTriangle,
  ArrowRight,
  BookMarked,
  Flag,
  Map,
  MapPin,
  TrendingUp,
  Users,
  UsersRound,
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

import { Badge, Card, CardContent, CardHeader, CardTitle, cn, Kpi, StatusPill } from '@faro/ui';

import { FeaturesGrid } from '../../../components/shared/features-grid';
import { MapView } from '../../../components/shared/map-view';
import { PageHero } from '../../../components/shared/page-hero';
import { useFaroStore } from '../../../store/use-faro-store';

export default function TableroFederacion() {
  const [vista, setVista] = useState<'semaforo' | 'mapa'>('semaforo');
  const cuarteles = useFaroStore((s) => s.cuarteles);
  const servicios = useFaroStore((s) => s.servicios);
  const personas = useFaroStore((s) => s.personas);

  const enRiesgo = cuarteles.filter((c) => c.cumplimiento === 'risk');
  const atencion = cuarteles.filter((c) => c.cumplimiento === 'warn');
  const enRegla = cuarteles.filter((c) => c.cumplimiento === 'ok');
  const totalServicios = servicios.length;
  const totalPersonal = personas.filter((p) => p.estado === 'activo').length;
  const promedio = cuarteles.length
    ? Math.round(cuarteles.reduce((acc, c) => acc + c.porcentajeRendicion, 0) / cuarteles.length)
    : 0;
  const peorCuartel = [...cuarteles].sort(
    (a, b) => a.porcentajeRendicion - b.porcentajeRendicion,
  )[0];
  const segundoPeor = [...cuarteles].sort(
    (a, b) => a.porcentajeRendicion - b.porcentajeRendicion,
  )[1];

  // Rollup por región (Nación → Región) y los cuarteles más críticos del país.
  const byReg: Record<string, { n: number; suma: number; riesgo: number }> = {};
  cuarteles.forEach((c) => {
    const r = (byReg[c.region] ??= { n: 0, suma: 0, riesgo: 0 });
    r.n++;
    r.suma += c.porcentajeRendicion;
    if (c.cumplimiento === 'risk') r.riesgo++;
  });
  const regiones = Object.entries(byReg)
    .map(([region, r]) => {
      const prom = Math.round(r.suma / r.n);
      return {
        region,
        n: r.n,
        prom,
        riesgo: r.riesgo,
        sem: (prom >= 90 ? 'ok' : prom >= 70 ? 'warn' : 'risk') as 'risk' | 'ok' | 'warn',
      };
    })
    .sort((a, b) => a.prom - b.prom);
  const criticos = [...cuarteles]
    .sort((a, b) => a.porcentajeRendicion - b.porcentajeRendicion)
    .slice(0, 8);

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <PageHero
        objetivo="Federación · Norte GBA"
        titulo={
          enRiesgo.length > 0
            ? `${enRiesgo.length} cuartel${enRiesgo.length === 1 ? '' : 'es'} en riesgo`
            : `Región al ${promedio}%`
        }
        descripcion="Estado del mes y los cuarteles que necesitan acción."
        icono={<Flag size={26} />}
        variant={enRiesgo.length > 0 ? 'critical' : promedio >= 90 ? 'success' : 'default'}
        meta={
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Kpi
              label="Cuarteles"
              value={cuarteles.length}
              hint="bajo gestión"
              icon={<TrendingUp size={16} />}
              intent="brand"
            />
            <Kpi
              label="Promedio"
              value={`${promedio}%`}
              hint="cumplimiento"
              intent={promedio >= 90 ? 'ok' : promedio >= 70 ? 'warn' : 'risk'}
            />
            <Kpi label="Servicios" value={totalServicios} hint="acumulados" intent="neutral" />
            <Kpi
              label="Personal"
              value={totalPersonal}
              hint={`${totalPersonal === 1 ? 'activo' : 'activos'}`}
              intent="neutral"
              icon={<Users size={16} />}
            />
          </div>
        }
      />

      {/* Atajos a Red de la Federación */}
      <div className="grid gap-3 sm:grid-cols-2">
        <Link
          href="/directorio"
          className="hover:border-brand-300 group flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 transition-all hover:shadow-md"
        >
          <div className="bg-brand-50 text-brand-700 grid h-12 w-12 shrink-0 place-items-center rounded-xl">
            <UsersRound size={22} />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-bold text-slate-900">Directorio</h3>
            <p className="text-xs text-slate-500">Personal de toda la federación</p>
          </div>
        </Link>
        <Link
          href="/agenda"
          className="hover:border-brand-300 group flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 transition-all hover:shadow-md"
        >
          <div className="bg-fire-50 text-fire-700 grid h-12 w-12 shrink-0 place-items-center rounded-xl">
            <BookMarked size={22} />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-bold text-slate-900">Agenda</h3>
            <p className="text-xs text-slate-500">Contactos externos por nivel</p>
          </div>
        </Link>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setVista('semaforo')}
          className={cn(
            'inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-sm font-medium transition-colors',
            vista === 'semaforo'
              ? 'bg-brand-600 text-white'
              : 'bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50',
          )}
        >
          <Flag size={14} /> Semáforo
        </button>
        <button
          type="button"
          onClick={() => setVista('mapa')}
          className={cn(
            'inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-sm font-medium transition-colors',
            vista === 'mapa'
              ? 'bg-brand-600 text-white'
              : 'bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50',
          )}
        >
          <MapPin size={14} /> Mapa
        </button>
      </div>

      {vista === 'mapa' && (
        <Card className="overflow-hidden p-0">
          <MapView
            center={{ lat: -34.5, lng: -58.55 }}
            zoom={10}
            pins={cuarteles.map((c) => ({
              id: c.id,
              lat: c.lat,
              lng: c.lng,
              color:
                c.cumplimiento === 'ok'
                  ? 'bg-status-ok'
                  : c.cumplimiento === 'warn'
                    ? 'bg-status-warn'
                    : 'bg-status-risk',
              label: String(c.porcentajeRendicion),
              popup:
                '<div style="font-family:system-ui;padding:4px 2px;min-width:200px">' +
                '<div style="font-weight:700;color:#0f172a;font-size:14px">' +
                c.nombre +
                '</div>' +
                '<div style="font-size:12px;color:#475569;margin-top:2px">' +
                c.ciudad +
                ', ' +
                c.provincia +
                '</div>' +
                '<div style="margin-top:6px;padding-top:6px;border-top:1px solid #e2e8f0;font-size:11px;color:#94a3b8">Cumplimiento: <strong style="color:#0f172a">' +
                c.porcentajeRendicion +
                '%</strong></div>' +
                '</div>',
            }))}
          />
        </Card>
      )}

      {vista === 'semaforo' && (
        <Card>
          <CardHeader>
            <CardTitle>Regiones · {regiones.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {regiones.map((r) => (
                <Link
                  key={r.region}
                  href={`/federacion/region/${encodeURIComponent(r.region)}` as never}
                  className="hover:border-brand-300 group flex items-center gap-3 rounded-xl border border-slate-200 p-3 transition-all hover:shadow-md"
                >
                  <div
                    className={cn(
                      'grid h-12 w-12 shrink-0 place-items-center rounded-xl text-sm font-bold text-white shadow-sm',
                      r.sem === 'ok' && 'bg-status-ok',
                      r.sem === 'warn' && 'bg-status-warn',
                      r.sem === 'risk' && 'bg-status-risk',
                    )}
                  >
                    {r.prom}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-bold text-slate-900">{r.region}</div>
                    <div className="text-xs text-slate-500">
                      {r.n} cuarteles{r.riesgo > 0 ? ` · ${r.riesgo} en riesgo` : ''}
                    </div>
                  </div>
                  <ArrowRight
                    size={18}
                    className="group-hover:text-brand-600 shrink-0 text-slate-300 transition-colors"
                  />
                </Link>
              ))}
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-4 border-t border-slate-100 px-1 py-3 text-sm">
              <div className="flex items-center gap-1.5">
                <span className="bg-status-ok h-3 w-3 rounded-full" />
                En regla ({enRegla.length})
              </div>
              <div className="flex items-center gap-1.5">
                <span className="bg-status-warn h-3 w-3 rounded-full" />
                Atención ({atencion.length})
              </div>
              <div className="flex items-center gap-1.5">
                <span className="bg-status-risk h-3 w-3 rounded-full" />
                En riesgo ({enRiesgo.length})
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle size={18} className="text-status-risk" /> Necesitan acción
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {[...enRiesgo, ...atencion].slice(0, 6).map((c) => (
                <li key={c.id}>
                  <Link
                    href={`/federacion/cuartel/${c.id}` as never}
                    className={cn(
                      'flex items-start gap-2 rounded-lg p-3 transition hover:brightness-95',
                      c.cumplimiento === 'risk' ? 'bg-status-risk-bg/40' : 'bg-status-warn-bg/40',
                    )}
                  >
                    <StatusPill
                      status={c.cumplimiento}
                      label={`${c.porcentajeRendicion}%`}
                      size="sm"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-slate-900">{c.nombre}</div>
                      <div className="text-xs text-slate-600">Tocá para consolidar y decidir</div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Cuarteles más críticos del país</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[500px] text-sm">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    <th className="w-12 px-4 py-2.5 text-left">#</th>
                    <th className="px-4 py-2.5 text-left">Cuartel</th>
                    <th className="px-4 py-2.5 text-left">Ciudad</th>
                    <th className="px-4 py-2.5 text-right">Rendición</th>
                    <th className="px-4 py-2.5 text-right">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {criticos.map((c, idx) => (
                    <tr key={c.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium text-slate-500">{idx + 1}</td>
                      <td className="px-4 py-3 font-semibold">
                        <Link
                          href={`/federacion/cuartel/${c.id}` as never}
                          className="hover:text-brand-700 text-slate-900 hover:underline"
                        >
                          {c.nombre}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{c.ciudad}</td>
                      <td className="px-4 py-3 text-right tabular-nums">
                        {c.porcentajeRendicion}%
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Badge
                          intent={
                            c.cumplimiento === 'ok'
                              ? 'ok'
                              : c.cumplimiento === 'warn'
                                ? 'warn'
                                : 'risk'
                          }
                        >
                          {c.cumplimiento === 'ok'
                            ? 'En regla'
                            : c.cumplimiento === 'warn'
                              ? 'Atención'
                              : 'En riesgo'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="from-brand-50 border-brand-100 bg-gradient-to-br to-white">
        <CardContent className="p-5">
          <div className="flex items-start gap-3">
            <div className="bg-brand-600 grid h-10 w-10 shrink-0 place-items-center rounded-xl text-white">
              <TrendingUp size={20} />
            </div>
            <div className="flex-1">
              <div className="text-brand-900 font-semibold">Resumen de la región</div>
              <p className="text-brand-900/90 mt-1 text-sm">
                Norte GBA con {cuarteles.length} cuarteles y un cumplimiento promedio del {promedio}
                %.{' '}
                {peorCuartel && (
                  <>
                    <strong>{peorCuartel.nombre}</strong>
                    {peorCuartel.cumplimiento === 'risk'
                      ? ' está en riesgo de no llegar a la rendición'
                      : peorCuartel.cumplimiento === 'warn'
                        ? ' necesita atención para llegar al objetivo'
                        : ` lidera el ranking con ${peorCuartel.porcentajeRendicion}%`}
                    .
                  </>
                )}
                {segundoPeor && segundoPeor.cumplimiento !== 'ok' && (
                  <>
                    {' '}
                    <strong>{segundoPeor.nombre}</strong> avanza pero todavía está al{' '}
                    {segundoPeor.porcentajeRendicion}%.
                  </>
                )}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Acceso rápido a herramientas nuevas */}
      <FeaturesGrid
        titulo="Análisis regional"
        descripcion="Para ver todo el conurbano de un vistazo"
        columnas={2}
        cards={[
          {
            href: '/federacion/mapa',
            icon: <Map size={18} />,
            titulo: 'Mapa provincial',
            descripcion: `${cuarteles.length} cuarteles · ranking · exportar PDF`,
            color: 'bg-brand-700',
            nuevo: true,
          },
          {
            href: '/federacion/consolidados',
            icon: <TrendingUp size={18} />,
            titulo: 'Consolidados regionales',
            descripcion: 'Indicadores operativos consolidados',
            color: 'bg-status-ok',
          },
        ]}
      />
    </div>
  );
}
