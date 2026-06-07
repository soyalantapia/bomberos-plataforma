'use client';

import { Badge, Card, CardContent, Kpi, cn } from '@faro/ui';
import { Clock, Hourglass } from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';

import {
  ORGANISMO_CORTO,
  enVentana,
  plataEnRiesgo,
  subsidiosRed,
  totalRed,
} from '../../../../components/federacion/finanzas-utils';
import { ars, arsCompact } from '../../../../components/finanzas/utils';
import { PageHero } from '../../../../components/shared/page-hero';
import type { OrganismoSubsidio } from '../../../../data/finanzas-red';

const FILTROS: { key: 'todos' | OrganismoSubsidio; label: string }[] = [
  { key: 'todos', label: 'Todos' },
  { key: 'nacional', label: 'Nacional' },
  { key: 'provincial', label: 'Provincial' },
  { key: 'municipal', label: 'Municipal' },
];

export default function SubsidiosRedPage() {
  const [org, setOrg] = useState<'todos' | OrganismoSubsidio>('todos');
  const [soloAtrasados, setSoloAtrasados] = useState(false);

  const lista = useMemo(() => {
    return subsidiosRed
      .filter((s) => s.saldo > 0)
      .filter((s) => org === 'todos' || s.organismo === org)
      .filter((s) => !soloAtrasados || s.venceEnDias <= 15)
      .sort((a, b) => a.venceEnDias - b.venceEnDias);
  }, [org, soloAtrasados]);

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <PageHero
        objetivo="Federación Bonaerense · subsidios de la red"
        titulo="Subsidios por ejecutar"
        descripcion="Cada subsidio otorgado con plata sin ejecutar, ordenado por el que vence primero. Lo que no se ejecuta, se devuelve."
        icono={<Hourglass size={26} />}
        variant={plataEnRiesgo(15) > 0 ? 'critical' : 'default'}
        meta={
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Kpi label="Por ejecutar" value={arsCompact(totalRed.porEjecutar)} intent="brand" />
            <Kpi
              label="Vence ≤15 días"
              value={arsCompact(plataEnRiesgo(15))}
              intent="risk"
              icon={<Clock size={16} />}
            />
            <Kpi label="Vence ≤30 días" value={arsCompact(plataEnRiesgo(30))} intent="warn" />
            <Kpi
              label="En riesgo"
              value={enVentana(15).length}
              hint="subsidios ≤15d"
              intent="risk"
            />
          </div>
        }
      />

      {/* Filtros */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1">
          {FILTROS.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setOrg(f.key)}
              className={cn(
                'shrink-0 whitespace-nowrap rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors',
                org === f.key
                  ? 'bg-brand-600 text-white'
                  : 'bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50',
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setSoloAtrasados((v) => !v)}
          className={cn(
            'ml-auto shrink-0 whitespace-nowrap rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors',
            soloAtrasados
              ? 'bg-status-risk text-white'
              : 'bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50',
          )}
        >
          Solo los que vencen pronto
        </button>
      </div>

      <div className="space-y-2">
        {lista.map((s) => {
          const pct = s.otorgado > 0 ? (s.ejecutado / s.otorgado) * 100 : 0;
          const urgente = s.venceEnDias <= 15;
          return (
            <Link
              key={`${s.cuartelId}-${s.organismo}`}
              href={`/federacion/cuartel/${s.cuartelId}` as never}
              className="block"
            >
              <Card
                className={cn(
                  'transition-shadow hover:shadow-md',
                  urgente && 'border-status-risk/30 border',
                )}
              >
                <CardContent className="p-3.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="truncate font-semibold text-slate-900">{s.cuartelNombre}</div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <Badge intent="neutral">{ORGANISMO_CORTO[s.organismo]}</Badge>
                        {s.region}
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      <div className="font-mono text-sm font-bold text-slate-900">
                        {ars.format(s.saldo)}
                      </div>
                      <div
                        className={cn(
                          'text-[11px] font-semibold',
                          urgente ? 'text-status-risk-fg' : 'text-slate-400',
                        )}
                      >
                        vence en {s.venceEnDias} días
                      </div>
                    </div>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={cn(
                        'h-full rounded-full',
                        pct >= 80
                          ? 'bg-status-ok'
                          : pct >= 50
                            ? 'bg-status-warn'
                            : 'bg-status-risk',
                      )}
                      style={{ width: `${Math.min(100, pct)}%` }}
                    />
                  </div>
                  <div className="mt-1 text-[11px] text-slate-500">
                    Ejecutado {pct.toFixed(0)}% de {arsCompact(s.otorgado)}
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
        {lista.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center text-sm text-slate-500">
              No hay subsidios por ejecutar con ese filtro.
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
