'use client';

import { CalendarClock, CheckCircle2, Clock, Gavel, Scale, ShieldCheck, Users } from 'lucide-react';
import { useMemo, useState } from 'react';

import { Badge, Card, CardContent, Kpi, StatusPill, cn, useToast } from '@faro/ui';

import { PageHero } from '../../../../components/shared/page-hero';
import {
  fmtConcentracion,
  fmtFrecuencia,
  leerGobernanza,
  resumenGobernanza,
  type Gobernanza,
} from '../../../../lib/utils/governance';
import { useFaroStore } from '../../../../store/use-faro-store';

const RIESGO_ORDEN: Record<Gobernanza['riesgo'], number> = { risk: 0, warn: 1, ok: 2, neutral: 3 };
const RIESGO_LABEL: Record<Gobernanza['riesgo'], string> = {
  risk: 'En riesgo',
  warn: 'Atención',
  ok: 'En regla',
  neutral: 'Sin dato',
};

function intentTransparencia(t: number): 'ok' | 'warn' | 'risk' {
  return t >= 80 ? 'ok' : t >= 60 ? 'warn' : 'risk';
}

function MandatoChip({ meses }: { meses: number }) {
  if (meses < 0)
    return (
      <Badge intent="risk">
        <CalendarClock size={11} /> Mandato vencido
      </Badge>
    );
  if (meses < 4)
    return (
      <Badge intent="warn">
        <CalendarClock size={11} /> Vence en {meses} {meses === 1 ? 'mes' : 'meses'}
      </Badge>
    );
  return (
    <span className="inline-flex items-center gap-1 text-xs text-slate-500">
      <CalendarClock size={11} /> Mandato vigente
    </span>
  );
}

export default function GovernanceFederacionPage() {
  const toast = useToast();
  const cuarteles = useFaroStore((s) => s.cuarteles);
  const solicitar = useFaroStore((s) => s.solicitarInformeGobernanza);
  const [solicitados, setSolicitados] = useState<Set<string>>(new Set());

  const regiones = useMemo(() => [...new Set(cuarteles.map((c) => c.region))].sort(), [cuarteles]);
  const [region, setRegion] = useState<string>(
    regiones.includes('Norte GBA') ? 'Norte GBA' : (regiones[0] ?? ''),
  );

  const lecturas = useMemo(() => {
    return cuarteles
      .filter((c) => c.region === region)
      .map(leerGobernanza)
      .sort(
        (a, b) =>
          RIESGO_ORDEN[a.riesgo] - RIESGO_ORDEN[b.riesgo] || b.transparencia - a.transparencia,
      );
  }, [cuarteles, region]);

  const resumen = useMemo(() => resumenGobernanza(lecturas), [lecturas]);

  const pedirInforme = (g: Gobernanza) => {
    solicitar(g.cuartelId, g.nombre);
    setSolicitados((prev) => new Set(prev).add(g.cuartelId));
    toast.push({
      kind: 'success',
      title: 'Informe solicitado',
      description: `${g.nombre} recibió el pedido de informe de gobernanza.`,
    });
  };

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <PageHero
        objetivo="Federación · Gobernanza"
        titulo="Lectura de gobernanza institucional"
        descripcion="Cómo se gobierna cada cuartel: reparto de poder entre comisión directiva y jefatura, cadencia de reuniones y rendición de cuentas (actas, balance, elecciones)."
        icono={<Gavel size={26} />}
        variant={resumen.enRiesgo > 0 ? 'critical' : 'default'}
        meta={
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Kpi label="Cuarteles" value={resumen.total} hint={region} intent="brand" />
            <Kpi
              label="Transparencia"
              value={`${resumen.transparenciaPromedio}%`}
              hint="promedio región"
              intent={
                resumen.transparenciaPromedio >= 80
                  ? 'ok'
                  : resumen.transparenciaPromedio >= 60
                    ? 'warn'
                    : 'risk'
              }
            />
            <Kpi
              label="Poder concentrado"
              value={resumen.poderConcentrado}
              hint="sin equilibrio CD/jefatura"
              intent={resumen.poderConcentrado > 0 ? 'warn' : 'ok'}
              icon={<Scale size={16} />}
            />
            <Kpi
              label="Mandatos"
              value={resumen.mandatosPorVencer}
              hint="por vencer (<4 meses)"
              intent={resumen.mandatosPorVencer > 0 ? 'warn' : 'ok'}
            />
          </div>
        }
      />

      {/* Selector de región */}
      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        {regiones.map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => setRegion(r)}
            className={cn(
              'shrink-0 rounded-full px-3.5 py-2 text-sm font-medium transition-colors',
              r === region
                ? 'bg-brand-600 text-white'
                : 'bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50',
            )}
          >
            {r}
          </button>
        ))}
      </div>

      {/* Lecturas por cuartel */}
      <div className="space-y-3">
        {lecturas.map((g) => {
          const pedido = solicitados.has(g.cuartelId);
          return (
            <Card
              key={g.cuartelId}
              className={cn(
                g.riesgo === 'risk' && 'border-status-risk/40',
                g.riesgo === 'warn' && 'border-status-warn/40',
              )}
            >
              <CardContent className="p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <StatusPill
                      status={g.riesgo}
                      label={RIESGO_LABEL[g.riesgo]}
                      size="sm"
                      className="mt-0.5 shrink-0"
                    />
                    <div>
                      <div className="font-bold text-slate-900">{g.nombre}</div>
                      <div className="text-xs text-slate-500">
                        {g.ciudad} · {g.miembrosCD} miembros en comisión
                      </div>
                    </div>
                  </div>
                  {g.riesgo === 'ok' ? (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-500">
                      <ShieldCheck size={14} /> Sin observaciones
                    </span>
                  ) : pedido ? (
                    <span className="text-status-ok-fg inline-flex items-center gap-1 text-sm font-semibold">
                      <CheckCircle2 size={15} /> Informe solicitado
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => pedirInforme(g)}
                      className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                    >
                      Solicitar informe
                    </button>
                  )}
                </div>

                {/* Indicadores */}
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <Badge intent={intentTransparencia(g.transparencia)}>
                    Transparencia {g.transparencia}%
                  </Badge>
                  <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                    <Clock size={11} /> Reunión {fmtFrecuencia(g.frecuencia).toLowerCase()}
                  </span>
                  <Badge intent={g.concentracion === 'equilibrada' ? 'ok' : 'warn'}>
                    <Scale size={11} /> {fmtConcentracion(g.concentracion)}
                  </Badge>
                  <MandatoChip meses={g.mandatoMeses} />
                </div>

                {/* Rendición de cuentas */}
                <div className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1 text-xs">
                  <DocFlag ok={g.actasAlDia} label="Actas" />
                  <DocFlag ok={g.balanceAlDia} label="Balance" />
                  <DocFlag ok={g.eleccionesAlDia} label="Elecciones" />
                </div>

                <p className="mt-2.5 text-sm text-slate-600">{g.lectura}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="from-brand-50 border-brand-100 bg-gradient-to-br to-white">
        <CardContent className="flex items-start gap-3 p-4">
          <div className="bg-brand-600 grid h-9 w-9 shrink-0 place-items-center rounded-xl text-white">
            <Users size={18} />
          </div>
          <p className="text-brand-900/90 text-sm">
            En <strong>{region}</strong>: {resumen.enRegla} en regla, {resumen.atencion} con
            atención y {resumen.enRiesgo} en riesgo institucional.{' '}
            {resumen.sinReunionRegular > 0 && (
              <>{resumen.sinReunionRegular} sin cadencia regular de comisión. </>
            )}
            Pedir el informe deja constancia en la bandeja del cuartel.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function DocFlag({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 font-medium',
        ok ? 'text-status-ok-fg' : 'text-status-risk-fg',
      )}
    >
      <span
        className={cn('h-2 w-2 rounded-full', ok ? 'bg-status-ok' : 'bg-status-risk')}
        aria-hidden
      />
      {label} {ok ? 'al día' : 'pendiente'}
    </span>
  );
}
