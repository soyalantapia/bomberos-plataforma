'use client';

import { Award, Ban, Lock, Star, TrendingUp } from 'lucide-react';
import { useMemo } from 'react';

import { Badge, Card, CardContent, cn } from '@faro/ui';

import { calcularCumplimiento, intentCumplimiento } from '../../../../lib/utils/cumplimiento';
import { fmtMesPeriodo, mesActual } from '../../../../lib/utils/date';
import { selectPersonaActual, useFaroStore } from '../../../../store/use-faro-store';

export default function MiDesempenoPage() {
  const yo = useFaroStore(selectPersonaActual);
  const calificaciones = useFaroStore((s) => s.calificaciones);
  const reconocimientos = useFaroStore((s) => s.reconocimientos);

  const periodo = mesActual();
  const cumpl = useMemo(() => (yo ? calcularCumplimiento(yo.id) : null), [yo]);

  if (!yo || !cumpl) return null;

  // Calificación: SÓLO la propia (privada).
  const miCalif = calificaciones.find((c) => c.personaId === yo.id && c.periodo === periodo);
  const misRecs = reconocimientos
    .filter((r) => r.personaId === yo.id)
    .sort((a, b) => b.fecha.localeCompare(a.fecha));

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <header className="flex items-center gap-3">
        <div className="bg-brand-50 text-brand-700 grid h-11 w-11 place-items-center rounded-xl">
          <TrendingUp size={22} />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900">Mi desempeño</h1>
          <p className="text-xs text-slate-500">
            {yo.nombre}, esto es privado: sólo lo ven vos y la jefatura.
          </p>
        </div>
      </header>

      {/* Mi calificación (privada) */}
      <Card className="overflow-hidden">
        <CardContent className="p-5">
          <div className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <Lock size={12} /> Calificación · {fmtMesPeriodo(periodo)}
          </div>
          {miCalif ? (
            <div className="flex items-center gap-4">
              <div
                className={cn(
                  'grid h-20 w-20 shrink-0 place-items-center rounded-2xl text-white',
                  miCalif.puntaje >= 80
                    ? 'bg-status-ok'
                    : miCalif.puntaje >= 60
                      ? 'bg-status-warn'
                      : 'bg-status-risk',
                )}
              >
                <span className="text-3xl font-black tabular-nums">{miCalif.puntaje}</span>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1">
                  <Star size={16} className="text-status-warn-fg" />
                  <span className="font-semibold text-slate-900">
                    {miCalif.puntaje >= 80
                      ? 'Muy bien'
                      : miCalif.puntaje >= 60
                        ? 'Bien'
                        : 'A mejorar'}
                  </span>
                </div>
                {miCalif.nota && <p className="mt-1 text-sm text-slate-600">“{miCalif.nota}”</p>}
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-500">
              Tu jefe todavía no cargó tu calificación de este mes.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Mi cumplimiento */}
      <Card>
        <CardContent className="p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-bold text-slate-900">Mi cumplimiento</h2>
            <Badge intent={intentCumplimiento(cumpl.global)}>{cumpl.global}% global</Badge>
          </div>
          <div className="space-y-3">
            {cumpl.categorias.map((cat) => (
              <div key={cat.id}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="text-slate-700">{cat.label}</span>
                  <span className="tabular-nums text-slate-500">
                    {cat.asistio}/{cat.total} · {cat.pct}%
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={cn(
                      'h-full rounded-full',
                      cat.pct >= 80
                        ? 'bg-status-ok'
                        : cat.pct >= 60
                          ? 'bg-status-warn'
                          : 'bg-status-risk',
                    )}
                    style={{ width: `${cat.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center gap-2 rounded-lg bg-slate-50 p-2.5 text-sm">
            <span
              className={cn(
                'h-2.5 w-2.5 rounded-full',
                cumpl.certificadoMedico ? 'bg-status-ok' : 'bg-status-risk',
              )}
            />
            <span className="text-slate-700">
              Certificado médico:{' '}
              <strong>{cumpl.certificadoMedico ? 'vigente' : 'vencido / sin presentar'}</strong>
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Mis reconocimientos */}
      {misRecs.length > 0 && (
        <Card>
          <CardContent className="p-5">
            <h2 className="mb-3 font-bold text-slate-900">Premios y sanciones</h2>
            <ul className="space-y-2">
              {misRecs.map((r) => (
                <li key={r.id} className="flex items-start gap-2.5">
                  <div
                    className={cn(
                      'mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg',
                      r.tipo === 'premio'
                        ? 'bg-status-ok-bg text-status-ok-fg'
                        : 'bg-status-risk-bg text-status-risk-fg',
                    )}
                  >
                    {r.tipo === 'premio' ? <Award size={16} /> : <Ban size={16} />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm text-slate-900">{r.motivo}</div>
                    <div className="text-xs text-slate-500">
                      {r.tipo === 'premio' ? 'Premio' : 'Sanción'} · {r.fecha}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
