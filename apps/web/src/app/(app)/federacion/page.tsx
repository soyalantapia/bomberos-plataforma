'use client';

import { Badge, Button, Card, CardContent, Kpi, cn, useToast } from '@faro/ui';
import { AlertTriangle, CalendarClock, Clock, Send } from 'lucide-react';
import Link from 'next/link';
import { useMemo } from 'react';

import {
  ORGANISMO_LABEL,
  type CuartelApurar,
  cuartelesApurar,
  plataEnRiesgo,
  porOrganismo,
  rollupPorRegion,
  totalRed,
} from '../../../components/federacion/finanzas-utils';
import { RegionCrest } from '../../../components/federacion/region-crest';
import { ars, arsCompact } from '../../../components/finanzas/utils';
import { PageHero } from '../../../components/shared/page-hero';
import type { OrganismoSubsidio } from '../../../data/finanzas-red';
import { useFaroStore } from '../../../store/use-faro-store';

const ORGS: OrganismoSubsidio[] = ['nacional', 'provincial', 'municipal'];

export default function TableroFederacion() {
  const toast = useToast();
  const enviarComunicadoFed = useFaroStore((s) => s.enviarComunicadoFed);

  const apurar = useMemo(() => cuartelesApurar(15), []);
  const riesgo15 = useMemo(() => plataEnRiesgo(15), []);
  const regiones = useMemo(() => rollupPorRegion(), []);

  const critico = riesgo15 > 0;
  const pct = totalRed.pct;

  function recordar(c: CuartelApurar) {
    enviarComunicadoFed({
      asunto: `Recordatorio: subsidio por ejecutar (vence en ${c.minDias} días)`,
      cuerpo: `Tenés ${ars.format(c.saldoEnRiesgo)} de subsidio otorgado sin ejecutar que vence en ${c.minDias} días. Lo que no se ejecuta a tiempo se devuelve — coordiná la inversión.`,
      region: c.region,
      canales: ['push'],
      prioridad: 'alta',
    });
    toast.push({
      kind: 'success',
      title: `Recordatorio enviado a ${c.nombre}`,
      description: `Vence en ${c.minDias} días · ${ars.format(c.saldoEnRiesgo)} por ejecutar`,
    });
  }

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <PageHero
        objetivo="Federación Bonaerense · 180 cuarteles · 7 regiones"
        titulo={
          critico
            ? `${arsCompact(riesgo15)} en juego: vencen en 15 días`
            : `La red ejecutó el ${pct.toFixed(0)}%`
        }
        descripcion="Lo que no se ejecuta, se devuelve. Estos son los subsidios de toda la red y cuánto falta invertir."
        icono={<CalendarClock size={26} />}
        variant={critico ? 'critical' : pct >= 80 ? 'success' : 'default'}
        meta={
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Kpi label="Por ejecutar" value={arsCompact(totalRed.porEjecutar)} intent="brand" />
            <Kpi
              label="Ejecutado"
              value={`${pct.toFixed(0)}%`}
              intent={pct >= 80 ? 'ok' : pct >= 50 ? 'warn' : 'risk'}
            />
            <Kpi
              label="Vence en 15 días"
              value={arsCompact(riesgo15)}
              intent={riesgo15 > 0 ? 'risk' : 'ok'}
              icon={<Clock size={16} />}
            />
            <Kpi
              label="Cuarteles a apurar"
              value={apurar.length}
              intent={apurar.length > 0 ? 'warn' : 'ok'}
            />
          </div>
        }
      />

      {/* 3 relojes por organismo */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {ORGS.map((org) => {
          const a = porOrganismo[org];
          return (
            <Card
              key={org}
              className={cn('border', a.atrasado ? 'border-status-warn/40' : 'border-slate-200')}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-sm font-bold text-slate-900">{ORGANISMO_LABEL[org]}</h3>
                  <Badge intent={a.atrasado ? 'warn' : 'ok'}>
                    {a.atrasado ? 'Atrasado' : 'En ritmo'}
                  </Badge>
                </div>
                <div className="mt-2 font-mono text-xl font-black text-slate-900">
                  {ars.format(a.porEjecutar)}
                </div>
                <div className="text-xs text-slate-500">por ejecutar</div>
                <div className="mt-3">
                  <div className="relative h-2.5 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="absolute top-0 z-10 h-full w-0.5 bg-slate-500"
                      style={{ left: `${a.pctTiempo}%` }}
                      title={`${a.pctTiempo.toFixed(0)}% del plazo transcurrido`}
                    />
                    <div
                      className={cn(
                        'h-full rounded-full',
                        a.atrasado ? 'bg-status-warn' : 'bg-status-ok',
                      )}
                      style={{ width: `${Math.min(100, a.pct)}%` }}
                    />
                  </div>
                  <div className="mt-1 flex justify-between text-[11px]">
                    <span className="text-slate-600">
                      Ejecutado <strong className="text-slate-900">{a.pct.toFixed(0)}%</strong>
                    </span>
                    <span className="text-slate-500">| {a.pctTiempo.toFixed(0)}% del plazo</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Apurá a estos cuarteles */}
      <Card>
        <CardContent className="p-5">
          <div className="mb-1 flex items-center gap-2">
            <AlertTriangle size={18} className="text-status-warn-fg" />
            <h3 className="font-bold text-slate-900">Apurá a estos cuarteles</h3>
          </div>
          <p className="mb-3 text-sm text-slate-600">
            Tienen plata otorgada con poco tiempo. Un recordatorio les avisa el plazo.
          </p>
          {apurar.length === 0 ? (
            <p className="bg-status-ok-bg/30 rounded-lg p-3 text-sm text-slate-700">
              Toda la red al día: no hay subsidios en riesgo de devolución.
            </p>
          ) : (
            <ul className="space-y-1.5">
              {apurar.slice(0, 8).map((c) => (
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
                      {c.region} · vence en {c.minDias} días
                    </div>
                  </Link>
                  <div className="hidden shrink-0 text-right sm:block">
                    <div className="font-mono text-sm font-bold text-slate-900">
                      {arsCompact(c.saldoEnRiesgo)}
                    </div>
                    <div className="text-[11px] text-slate-400">por ejecutar</div>
                  </div>
                  <Button intent="ghost" size="sm" className="shrink-0" onClick={() => recordar(c)}>
                    <Send size={13} /> Recordar
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Ejecución por región */}
      <Card>
        <CardContent className="p-5">
          <h3 className="mb-3 font-bold text-slate-900">Ejecución por región</h3>
          <ul className="space-y-2">
            {regiones.map((r) => (
              <li key={r.region}>
                <Link
                  href={`/federacion/region/${encodeURIComponent(r.region)}` as never}
                  className="flex items-center gap-3 rounded-lg border border-slate-200 p-2.5 transition-colors hover:bg-slate-50"
                >
                  <RegionCrest region={r.region} size={36} />
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-semibold text-slate-900">{r.region}</div>
                    <div className="text-xs text-slate-500">
                      {r.cuarteles} cuarteles · {arsCompact(r.porEjecutar)} por ejecutar
                    </div>
                    <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className={cn(
                          'h-full rounded-full',
                          r.pct >= 80
                            ? 'bg-status-ok'
                            : r.pct >= 50
                              ? 'bg-status-warn'
                              : 'bg-status-risk',
                        )}
                        style={{ width: `${Math.min(100, r.pct)}%` }}
                      />
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <div className="font-bold text-slate-900">{r.pct.toFixed(0)}%</div>
                    <div className="text-[11px] text-slate-400">ejecutado</div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Cierre */}
      <Card className="border-brand-100 from-brand-50 bg-gradient-to-br to-white">
        <CardContent className="p-5 text-sm text-slate-700">
          La red tiene <strong>{ars.format(totalRed.otorgado)} otorgados</strong> y ya ejecutó el{' '}
          <strong>{pct.toFixed(0)}%</strong>. Si los cuarteles mantienen el ritmo, se aprovecha casi
          todo.{' '}
          {apurar.length > 0 ? (
            <>
              <strong>{apurar.length} cuarteles</strong> necesitan un empujón antes de fin de mes
              para no devolver plata.
            </>
          ) : (
            <>Ningún cuartel está en riesgo de devolver plata este mes.</>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
