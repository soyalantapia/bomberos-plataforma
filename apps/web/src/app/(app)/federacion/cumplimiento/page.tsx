'use client';

import { AlertTriangle, CalendarClock, CheckCircle2, Flag, Send, Sparkles } from 'lucide-react';
import { useMemo } from 'react';

import { Badge, Card, CardContent, Kpi, StatusPill, cn, useToast } from '@faro/ui';

import { PageHero } from '../../../../components/shared/page-hero';
import { useFaroStore } from '../../../../store/use-faro-store';

const PLAZO_LIMITE = '10/06/2026';

export default function CumplimientoFed() {
  const cuarteles = useFaroStore((s) => s.cuarteles);
  const toast = useToast();

  const ranking = useMemo(
    () => [...cuarteles].sort((a, b) => a.porcentajeRendicion - b.porcentajeRendicion),
    [cuarteles],
  );

  const promedio = Math.round(
    cuarteles.reduce((acc, c) => acc + c.porcentajeRendicion, 0) / cuarteles.length,
  );
  const enRiesgo = cuarteles.filter((c) => c.cumplimiento === 'risk').length;
  const atencion = cuarteles.filter((c) => c.cumplimiento === 'warn').length;
  const enRegla = cuarteles.filter((c) => c.cumplimiento === 'ok').length;

  const diasAlPlazo = 17;

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <PageHero
        objetivo="Federación · Cumplimiento"
        titulo={`${diasAlPlazo} días al cierre del Fondo`}
        descripcion={`Plazo: ${PLAZO_LIMITE}. Hoy hay ${enRiesgo} cuartel${enRiesgo === 1 ? '' : 'es'} en riesgo de no llegar.`}
        icono={<CalendarClock size={26} />}
        variant={enRiesgo > 0 ? 'critical' : promedio >= 90 ? 'success' : 'default'}
        meta={
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Kpi
              label="Promedio región"
              value={`${promedio}%`}
              intent={promedio >= 90 ? 'ok' : promedio >= 70 ? 'warn' : 'risk'}
            />
            <Kpi
              label="En regla"
              value={enRegla}
              hint={`de ${cuarteles.length}`}
              intent="ok"
              icon={<CheckCircle2 size={16} />}
            />
            <Kpi label="Atención" value={atencion} hint="amarillos" intent="warn" />
            <Kpi
              label="En riesgo"
              value={enRiesgo}
              hint="rojos"
              intent={enRiesgo > 0 ? 'risk' : 'ok'}
              icon={<AlertTriangle size={16} />}
            />
          </div>
        }
      />

      <Card className="bg-brand-50 border-brand-100">
        <CardContent className="flex items-start gap-3 p-4 sm:p-5">
          <div className="bg-brand-600 grid h-10 w-10 shrink-0 place-items-center rounded-xl text-white">
            <Sparkles size={20} />
          </div>
          <div className="flex-1">
            <div className="text-brand-900 font-semibold">Sugerencia regional</div>
            <p className="text-brand-900/80 text-sm">
              {enRiesgo > 0 ? (
                <>
                  Priorizá <strong>{ranking[0]?.nombre}</strong> ({ranking[0]?.porcentajeRendicion}
                  %) — al ritmo actual no llega al plazo. Sugerencia: reunión virtual esta semana
                  más soporte de Federación para completar firmas y nómina.
                </>
              ) : (
                'Todos los cuarteles van encaminados. Mantené el seguimiento y enviá recordatorios a los amarillos antes del 5/6.'
              )}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 sm:p-5">
          <h2 className="mb-3 text-base font-bold text-slate-900">Timeline al cierre</h2>
          <div className="relative">
            <div className="absolute bottom-2 left-3 top-2 w-px bg-slate-200" />
            {[
              {
                fecha: '24 may',
                titulo: 'Hoy',
                estado: 'actual',
                texto: `Promedio región ${promedio}%`,
              },
              {
                fecha: '01 jun',
                titulo: 'Recordatorio automático',
                estado: 'futuro',
                texto: 'Email + WhatsApp + notificación a los cuarteles atrasados',
              },
              {
                fecha: '05 jun',
                titulo: 'Última semana',
                estado: 'futuro',
                texto: 'Llamada directa de Federación a cuarteles en riesgo',
              },
              {
                fecha: '10 jun',
                titulo: 'Cierre del Fondo',
                estado: 'limite',
                texto: 'Última fecha para presentar al Fondo Nacional',
              },
              {
                fecha: '12 jun',
                titulo: 'Reporte final',
                estado: 'futuro',
                texto: 'Consolidado regional · entrega a la Federación Nacional',
              },
            ].map((p, idx) => (
              <div key={idx} className="relative pb-4 pl-9 last:pb-0">
                <div
                  className={cn(
                    'absolute left-0 grid h-6 w-6 place-items-center rounded-full text-[10px] font-bold text-white ring-4 ring-white',
                    p.estado === 'actual'
                      ? 'bg-brand-600'
                      : p.estado === 'limite'
                        ? 'bg-status-risk'
                        : 'bg-slate-300',
                  )}
                >
                  {p.estado === 'actual' ? '●' : p.estado === 'limite' ? '⚑' : ''}
                </div>
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {p.fecha}
                </div>
                <div
                  className={cn(
                    'mt-0.5 text-sm font-semibold',
                    p.estado === 'limite' ? 'text-status-risk-fg' : 'text-slate-900',
                  )}
                >
                  {p.titulo}
                </div>
                <div className="mt-0.5 text-xs text-slate-600">{p.texto}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <div className="border-b border-slate-100 p-4 sm:p-5">
            <h2 className="text-base font-bold text-slate-900">Estado por cuartel</h2>
            <p className="text-sm text-slate-600">
              Ordenados de menor a mayor cumplimiento. Tocá un cuartel para abrirlo o disparar
              acciones.
            </p>
          </div>

          <ul className="divide-y divide-slate-100">
            {ranking.map((c) => {
              const dias = diasAlPlazo;
              const riskEstimate =
                c.cumplimiento === 'risk'
                  ? 'Necesita 3+ puntos por día'
                  : c.cumplimiento === 'warn'
                    ? 'Necesita acción esta semana'
                    : 'En ritmo';
              return (
                <li key={c.id} className="p-4 sm:p-5">
                  <div className="flex flex-wrap items-center gap-3">
                    <StatusPill
                      status={c.cumplimiento}
                      label={`${c.porcentajeRendicion}%`}
                      size="sm"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="font-semibold text-slate-900">{c.nombre}</div>
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
                      </div>
                      <div className="mt-1 text-xs text-slate-600">
                        {c.ciudad} · Plazo a {dias}d · {riskEstimate}
                      </div>
                    </div>
                    <div className="flex shrink-0 gap-2">
                      {c.cumplimiento !== 'ok' && (
                        <button
                          type="button"
                          onClick={() =>
                            toast.push({
                              kind: 'info',
                              title: `Recordatorio enviado a ${c.nombre}`,
                              description:
                                'Email + WhatsApp + notificación al Mando y al Administrativo.',
                            })
                          }
                          className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:border-slate-300"
                        >
                          <Send size={12} /> Recordar
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() =>
                          toast.push({
                            kind: 'info',
                            title: `Abriendo ${c.nombre}`,
                            description: 'Salto al detalle del cuartel.',
                          })
                        }
                        className="bg-brand-600 hover:bg-brand-700 inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-semibold text-white"
                      >
                        <Flag size={12} /> Detalle
                      </button>
                    </div>
                  </div>

                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={cn(
                        'h-full transition-all duration-500',
                        c.cumplimiento === 'ok'
                          ? 'bg-status-ok'
                          : c.cumplimiento === 'warn'
                            ? 'bg-status-warn'
                            : 'bg-status-risk',
                      )}
                      style={{ width: `${c.porcentajeRendicion}%` }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
