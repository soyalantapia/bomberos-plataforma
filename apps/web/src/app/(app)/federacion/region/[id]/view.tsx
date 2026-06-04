'use client';

import { AlertTriangle, ArrowLeft, Flag, Users } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useMemo } from 'react';

import { Badge, Card, CardContent, CardHeader, CardTitle, Kpi, StatusPill, cn } from '@faro/ui';

import { RegionCrest } from '../../../../../components/federacion/region-crest';
import { EmptyState } from '../../../../../components/shared/empty-state';
import { regionesMock } from '../../../../../data/regiones';
import { useFaroStore } from '../../../../../store/use-faro-store';

export default function RegionFederacion() {
  const params = useParams<{ id: string }>();
  const region = decodeURIComponent(params.id);
  const regionInfo = regionesMock.find((r) => r.nombre === region);
  const cuarteles = useFaroStore((s) => s.cuarteles);
  const personas = useFaroStore((s) => s.personas);
  const accionesFed = useFaroStore((s) => s.accionesFed);

  const cs = useMemo(
    () =>
      cuarteles
        .filter((c) => c.region === region)
        .sort((a, b) => b.porcentajeRendicion - a.porcentajeRendicion),
    [cuarteles, region],
  );

  const enRiesgo = cs.filter((c) => c.cumplimiento === 'risk');
  const atencion = cs.filter((c) => c.cumplimiento === 'warn');
  const enRegla = cs.filter((c) => c.cumplimiento === 'ok');
  const promedio = cs.length
    ? Math.round(cs.reduce((a, c) => a + c.porcentajeRendicion, 0) / cs.length)
    : 0;
  const idsRegion = new Set(cs.map((c) => c.id));
  const personal = personas.filter(
    (p) => idsRegion.has(p.cuartelId) && p.estado === 'activo',
  ).length;
  const accionesAbiertas = accionesFed.filter(
    (a) => idsRegion.has(a.cuartelId) && a.estado !== 'resuelta',
  ).length;

  if (cs.length === 0) {
    return (
      <div className="mx-auto max-w-4xl space-y-5">
        <Link
          href="/federacion"
          className="hover:text-brand-700 inline-flex items-center gap-1 text-sm text-slate-500"
        >
          <ArrowLeft size={14} /> Volver a Federación
        </Link>
        <EmptyState
          icon={<Flag size={28} />}
          titulo="Región sin cuarteles"
          descripcion={`No hay cuarteles en "${region}".`}
          variant="warning"
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <Link
        href="/federacion"
        className="hover:text-brand-700 inline-flex items-center gap-1 text-sm text-slate-500"
      >
        <ArrowLeft size={14} /> Volver a Federación
      </Link>

      <Card>
        <CardContent className="p-5">
          <div className="flex items-center gap-4">
            <RegionCrest region={region} size={64} />
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                Federación Bonaerense · Buenos Aires
              </p>
              <h1 className="text-2xl font-black text-slate-900">{region}</h1>
              <p className="text-sm text-slate-600">
                {cs.length} cuarteles · promedio {promedio}%
                {accionesAbiertas > 0 ? ` · ${accionesAbiertas} acciones abiertas` : ''}
              </p>
              {regionInfo?.descripcion && (
                <p className="mt-0.5 text-xs text-slate-500">{regionInfo.descripcion}</p>
              )}
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Kpi label="Cuarteles" value={cs.length} intent="brand" />
            <Kpi
              label="Promedio"
              value={`${promedio}%`}
              intent={promedio >= 90 ? 'ok' : promedio >= 70 ? 'warn' : 'risk'}
            />
            <Kpi
              label="En riesgo"
              value={enRiesgo.length}
              intent={enRiesgo.length > 0 ? 'risk' : 'ok'}
            />
            <Kpi
              label="Personal activo"
              value={personal}
              icon={<Users size={16} />}
              intent="neutral"
            />
          </div>
        </CardContent>
      </Card>

      {/* Semáforo de la región */}
      <Card>
        <CardHeader>
          <CardTitle>Cuarteles · Semáforo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {cs.map((c) => {
              const mostrarCiudad = c.ciudad && c.ciudad.toLowerCase() !== c.nombre.toLowerCase();
              return (
                <Link
                  key={c.id}
                  href={`/federacion/cuartel/${c.id}` as never}
                  className="focus:ring-brand-400 flex flex-col items-center rounded-xl border border-slate-200 p-4 text-center transition-all hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2"
                >
                  <div
                    className={cn(
                      'mb-2 grid h-16 w-16 place-items-center rounded-full text-lg font-bold text-white shadow-sm',
                      c.cumplimiento === 'ok' && 'bg-status-ok',
                      c.cumplimiento === 'warn' && 'bg-status-warn',
                      c.cumplimiento === 'risk' && 'bg-status-risk',
                      c.cumplimiento === 'neutral' && 'bg-status-neutral',
                    )}
                  >
                    {c.porcentajeRendicion}
                  </div>
                  <div className="font-semibold text-slate-900">{c.nombre}</div>
                  {mostrarCiudad && <div className="text-xs text-slate-500">{c.ciudad}</div>}
                </Link>
              );
            })}
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-4 border-t border-slate-100 px-1 py-3 text-sm">
            <span className="flex items-center gap-1.5">
              <span className="bg-status-ok h-3 w-3 rounded-full" /> En regla ({enRegla.length})
            </span>
            <span className="flex items-center gap-1.5">
              <span className="bg-status-warn h-3 w-3 rounded-full" /> Atención ({atencion.length})
            </span>
            <span className="flex items-center gap-1.5">
              <span className="bg-status-risk h-3 w-3 rounded-full" /> En riesgo ({enRiesgo.length})
            </span>
          </div>
        </CardContent>
      </Card>

      {(enRiesgo.length > 0 || atencion.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle size={18} className="text-status-risk" /> Necesitan acción en la región
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {[...enRiesgo, ...atencion].map((c) => (
                <li key={c.id}>
                  <Link
                    href={`/federacion/cuartel/${c.id}` as never}
                    className={cn(
                      'flex items-center gap-2 rounded-lg p-3 transition hover:brightness-95',
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
                    <Badge intent={c.cumplimiento === 'risk' ? 'risk' : 'warn'}>
                      {c.cumplimiento === 'risk' ? 'En riesgo' : 'Atención'}
                    </Badge>
                  </Link>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
