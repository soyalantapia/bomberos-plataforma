'use client';

import { Badge, Button, Card, CardContent, Kpi, cn, useToast } from '@faro/ui';
import { AlertTriangle, ArrowLeft, Clock, Flag, Send } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useMemo } from 'react';

import {
  type CuartelApurar,
  cuartelesApurar,
  ejecucionPctCuartel,
  porEjecutarCuartel,
  rollupPorRegion,
} from '../../../../../components/federacion/finanzas-utils';
import { RegionCrest } from '../../../../../components/federacion/region-crest';
import { ars, arsCompact } from '../../../../../components/finanzas/utils';
import { EmptyState } from '../../../../../components/shared/empty-state';
import { regionesMock } from '../../../../../data/regiones';
import { finanzasCuartel } from '../../../../../lib/utils/finanzas-red';
import { useFaroStore } from '../../../../../store/use-faro-store';

const ORDEN: Record<'ok' | 'warn' | 'risk', number> = { risk: 0, warn: 1, ok: 2 };
const DOT: Record<'ok' | 'warn' | 'risk', string> = {
  ok: 'bg-status-ok',
  warn: 'bg-status-warn',
  risk: 'bg-status-risk',
};

export default function RegionFederacion() {
  const params = useParams<{ id: string }>();
  const region = decodeURIComponent(params.id);
  const toast = useToast();
  const regionInfo = regionesMock.find((r) => r.nombre === region);
  const cuarteles = useFaroStore((s) => s.cuarteles);
  const enviarComunicadoFed = useFaroStore((s) => s.enviarComunicadoFed);

  const agg = useMemo(() => rollupPorRegion().find((r) => r.region === region), [region]);

  const cs = useMemo(
    () =>
      cuarteles
        .filter((c) => c.region === region)
        .map((c) => {
          const f = finanzasCuartel(c);
          return {
            id: c.id,
            nombre: c.nombre,
            salud: f.salud as 'ok' | 'warn' | 'risk',
            porEjecutar: porEjecutarCuartel(c.id),
            ejec: Math.round(ejecucionPctCuartel(c.id)),
          };
        })
        .sort((a, b) => ORDEN[a.salud] - ORDEN[b.salud] || b.porEjecutar - a.porEjecutar),
    [cuarteles, region],
  );

  const apurar = useMemo(() => cuartelesApurar(15).filter((c) => c.region === region), [region]);
  const enRiesgo = cs.filter((c) => c.salud === 'risk').length;

  function recordar(c: CuartelApurar) {
    enviarComunicadoFed({
      asunto: `Subsidio por ejecutar (vence en ${c.minDias} días)`,
      cuerpo: `Tenés ${ars.format(c.saldoEnRiesgo)} de subsidio otorgado sin ejecutar que vence en ${c.minDias} días. Lo que no se ejecuta a tiempo se devuelve — coordiná la inversión.`,
      region: c.region,
      canales: ['push'],
      prioridad: 'alta',
    });
    toast.push({ kind: 'success', title: `Recordatorio enviado a ${c.nombre}` });
  }

  if (cs.length === 0 || !agg) {
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
    <div className="mx-auto max-w-3xl space-y-4">
      <Link
        href="/federacion"
        className="hover:text-brand-700 inline-flex items-center gap-1 text-sm text-slate-500"
      >
        <ArrowLeft size={14} /> Volver a Federación
      </Link>

      <Card>
        <CardContent className="p-5">
          <div className="flex items-center gap-4">
            <RegionCrest region={region} size={56} />
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                Federación Bonaerense · economía de la región
              </p>
              <h1 className="text-2xl font-black text-slate-900">{region}</h1>
              {regionInfo?.descripcion && (
                <p className="mt-0.5 text-xs text-slate-500">{regionInfo.descripcion}</p>
              )}
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Kpi label="Cuarteles" value={agg.cuarteles} intent="brand" />
            <Kpi label="Por ejecutar" value={arsCompact(agg.porEjecutar)} intent="brand" />
            <Kpi
              label="Ejecutado"
              value={`${agg.pct.toFixed(0)}%`}
              intent={agg.pct >= 80 ? 'ok' : agg.pct >= 50 ? 'warn' : 'risk'}
            />
            <Kpi label="Caja consolidada" value={arsCompact(agg.caja)} intent="neutral" />
          </div>
        </CardContent>
      </Card>

      {/* Apurá en la región */}
      {apurar.length > 0 && (
        <Card>
          <CardContent className="p-5">
            <div className="mb-1 flex items-center gap-2">
              <AlertTriangle size={18} className="text-status-warn-fg" />
              <h3 className="font-bold text-slate-900">Apurá en la región</h3>
            </div>
            <p className="mb-3 text-sm text-slate-600">
              Plata otorgada con poco tiempo para ejecutar.
            </p>
            <ul className="space-y-1.5">
              {apurar.slice(0, 6).map((c) => (
                <li
                  key={c.cuartelId}
                  className="flex items-center gap-2.5 rounded-lg border border-slate-200 p-2.5"
                >
                  <Link
                    href={`/federacion/cuartel/${c.cuartelId}` as never}
                    className="min-w-0 flex-1"
                  >
                    <div className="truncate font-semibold text-slate-900">{c.nombre}</div>
                    <div className="text-xs text-slate-500">
                      <Clock size={11} className="-mt-0.5 mr-0.5 inline" />
                      vence en {c.minDias} días · {arsCompact(c.saldoEnRiesgo)}
                    </div>
                  </Link>
                  <Button intent="ghost" size="sm" className="shrink-0" onClick={() => recordar(c)}>
                    <Send size={13} /> Recordar
                  </Button>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Cuarteles por estado financiero */}
      <Card>
        <CardContent className="p-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-bold text-slate-900">Cuarteles</h3>
            {enRiesgo > 0 && <Badge intent="risk">{enRiesgo} en riesgo</Badge>}
          </div>
          <ul className="space-y-1.5">
            {cs.map((c) => (
              <li key={c.id}>
                <Link
                  href={`/federacion/cuartel/${c.id}` as never}
                  className="flex items-center gap-2.5 rounded-lg border border-slate-200 p-2.5 transition-colors hover:bg-slate-50"
                >
                  <span className={cn('h-2.5 w-2.5 shrink-0 rounded-full', DOT[c.salud])} />
                  <span className="min-w-0 flex-1 truncate font-semibold text-slate-900">
                    {c.nombre}
                  </span>
                  <span className="shrink-0 text-right">
                    <span className="block font-mono text-sm font-bold text-slate-900">
                      {arsCompact(c.porEjecutar)}
                    </span>
                    <span className="block text-[11px] text-slate-400">
                      por ejecutar · {c.ejec}%
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
