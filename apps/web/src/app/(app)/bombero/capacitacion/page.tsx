'use client';

import {
  Award,
  CalendarClock,
  ChevronRight,
  Download,
  Flame,
  GraduationCap,
  LifeBuoy,
  Sparkles,
  Trophy,
  Users2,
} from 'lucide-react';

import { Badge, Button, Card, CardContent, Kpi, cn, useToast } from '@faro/ui';

import { PageHero } from '../../../../components/shared/page-hero';

interface CursoMio {
  id: string;
  nombre: string;
  centro: string;
  vencimiento: string;
  diasRestantes: number;
  progreso: number;
  icono: React.ReactNode;
}

interface CursoDisponible {
  id: string;
  nombre: string;
  centro: string;
  inicio: string;
  inscriptos: number;
  cupos: number;
  fee: 'gratis' | 'pago';
  destacado?: boolean;
}

interface Certificado {
  id: string;
  nombre: string;
  emitido: string;
  folio: string;
}

const misCursos: CursoMio[] = [
  {
    id: 'c-1',
    nombre: 'Rescate vehicular',
    centro: 'Escuela Federación',
    vencimiento: '30/9/2026',
    diasRestantes: 129,
    progreso: 65,
    icono: <LifeBuoy size={20} />,
  },
  {
    id: 'c-2',
    nombre: 'Primeros auxilios',
    centro: 'CEPROS Norte',
    vencimiento: '22/5/2026',
    diasRestantes: -2,
    progreso: 100,
    icono: <Trophy size={20} />,
  },
];

const disponibles: CursoDisponible[] = [
  {
    id: 'd-1',
    nombre: 'Rescate vehicular avanzado',
    centro: 'Escuela Federación',
    inicio: '12 jun 2026',
    inscriptos: 12,
    cupos: 16,
    fee: 'gratis',
    destacado: true,
  },
  {
    id: 'd-2',
    nombre: 'Manejo víctimas múltiples',
    centro: 'CEPROS Norte',
    inicio: '20 jun 2026',
    inscriptos: 14,
    cupos: 24,
    fee: 'gratis',
  },
  {
    id: 'd-3',
    nombre: 'Incendios estructurales II',
    centro: 'CEPROS Norte',
    inicio: '5 jul 2026',
    inscriptos: 5,
    cupos: 18,
    fee: 'gratis',
  },
];

const certificados: Certificado[] = [
  { id: 'cert-1', nombre: 'Rescate vehicular', emitido: '1/10/2024', folio: '2024/132' },
  { id: 'cert-2', nombre: 'Primeros auxilios', emitido: '22/5/2024', folio: '2024/078' },
];

function vigenciaIntent(diasRestantes: number, progreso: number) {
  if (diasRestantes < 0 || progreso >= 100)
    return { color: 'risk', label: 'Vencido', bg: 'bg-status-risk', track: 'bg-status-risk-bg' };
  if (diasRestantes < 30)
    return { color: 'warn', label: 'Por vencer', bg: 'bg-status-warn', track: 'bg-status-warn-bg' };
  return { color: 'ok', label: 'Vigente', bg: 'bg-status-ok', track: 'bg-status-ok-bg' };
}

export default function CapacitacionBombero() {
  const toast = useToast();
  const proximoVencer = misCursos.reduce(
    (a, c) => (c.diasRestantes < a.diasRestantes ? c : a),
    misCursos[0]!,
  );
  const vigentes = misCursos.filter((c) => c.diasRestantes > 30).length;
  const porVencer = misCursos.filter((c) => c.diasRestantes >= 0 && c.diasRestantes <= 30).length;
  const vencidos = misCursos.filter((c) => c.diasRestantes < 0).length;

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <PageHero
        objetivo="Tu capacitación"
        titulo={
          vencidos > 0
            ? `${vencidos} curso vencido — actualizá ya`
            : porVencer > 0
              ? `${proximoVencer.nombre} vence en ${proximoVencer.diasRestantes}d`
              : 'Tu formación está al día'
        }
        descripcion="Acá tenés tu progreso, los cursos abiertos para inscribirte y tus certificados firmados."
        icono={<GraduationCap size={26} />}
        variant={vencidos > 0 ? 'critical' : porVencer > 0 ? 'default' : 'success'}
        meta={
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            <Kpi label="Vigentes" value={vigentes} intent="ok" icon={<Award size={16} />} />
            <Kpi
              label="Por vencer"
              value={porVencer}
              hint="< 30d"
              intent={porVencer > 0 ? 'warn' : 'neutral'}
            />
            <Kpi label="Vencidos" value={vencidos} intent={vencidos > 0 ? 'risk' : 'neutral'} />
            <Kpi label="Disponibles" value={disponibles.length} hint="para vos" intent="brand" />
          </div>
        }
      />

      <section>
        <h2 className="mb-3 flex items-center gap-2 text-base font-bold text-slate-900">
          <Award size={18} className="text-brand-600" /> Tus cursos
        </h2>

        <div className="grid gap-3 sm:grid-cols-2">
          {misCursos.map((c) => {
            const v = vigenciaIntent(c.diasRestantes, c.progreso);
            const pctBar =
              c.diasRestantes < 0
                ? 100
                : Math.max(0, Math.min(100, ((365 - Math.min(c.diasRestantes, 365)) / 365) * 100));
            return (
              <Card
                key={c.id}
                className={cn(
                  'relative overflow-hidden border-l-4',
                  v.color === 'risk' && 'border-l-status-risk',
                  v.color === 'warn' && 'border-l-status-warn',
                  v.color === 'ok' && 'border-l-status-ok',
                )}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div
                      className={cn(
                        'grid h-12 w-12 shrink-0 place-items-center rounded-xl text-white',
                        v.bg,
                      )}
                    >
                      {c.icono}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-slate-900">{c.nombre}</div>
                      <div className="mt-0.5 text-xs text-slate-600">{c.centro}</div>
                      <div className="mt-2 flex items-center gap-2 text-xs">
                        <CalendarClock size={11} className="text-slate-400" />
                        <span className="text-slate-600">Vence {c.vencimiento}</span>
                        <Badge intent={v.color as 'ok' | 'warn' | 'risk'}>
                          {c.diasRestantes < 0
                            ? `Vencido hace ${-c.diasRestantes}d`
                            : `${c.diasRestantes}d restantes`}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="mb-1 flex items-center justify-between text-[10px] uppercase tracking-wide text-slate-500">
                      <span>Vigencia consumida</span>
                      <span className="tabular-nums">{Math.round(pctBar)}%</span>
                    </div>
                    <div className={cn('h-1.5 overflow-hidden rounded-full', v.track)}>
                      <div
                        className={cn('h-full transition-all', v.bg)}
                        style={{ width: `${pctBar}%` }}
                      />
                    </div>
                  </div>

                  {c.diasRestantes < 0 && (
                    <Button
                      intent="primary"
                      size="sm"
                      fullWidth
                      className="mt-3"
                      onClick={() =>
                        toast.push({ kind: 'info', title: 'Renovación enviada al centro' })
                      }
                    >
                      Solicitar renovación <ChevronRight size={14} />
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      <section>
        <h2 className="mb-3 flex items-center gap-2 text-base font-bold text-slate-900">
          <Sparkles size={18} className="text-status-warn" /> Abiertos para inscribirte
        </h2>

        <div className="-mx-1 flex snap-x snap-mandatory gap-3 overflow-x-auto px-1 pb-2">
          {disponibles.map((d) => (
            <div
              key={d.id}
              className={cn(
                'min-w-[260px] flex-1 snap-start overflow-hidden rounded-2xl border bg-white',
                d.destacado ? 'border-brand-300 ring-brand-100 ring-2' : 'border-slate-200',
              )}
            >
              {d.destacado && (
                <div className="bg-brand-600 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
                  ⭐ Recomendado para vos
                </div>
              )}
              <div className="p-4">
                <div className="bg-status-warn-bg text-status-warn-fg mb-2 inline-flex h-9 w-9 items-center justify-center rounded-lg">
                  <Flame size={16} />
                </div>
                <div className="font-bold text-slate-900">{d.nombre}</div>
                <div className="mt-0.5 text-xs text-slate-600">{d.centro}</div>

                <div className="mt-3 flex items-center gap-1.5 text-xs">
                  <CalendarClock size={11} className="text-slate-400" />
                  <span className="font-medium text-slate-700">Inicia {d.inicio}</span>
                </div>

                <div className="mt-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-600">
                      <Users2 size={11} className="mr-0.5 inline" />
                      {d.inscriptos} / {d.cupos} cupos
                    </span>
                    <Badge intent={d.fee === 'gratis' ? 'ok' : 'warn'}>
                      {d.fee === 'gratis' ? 'Gratis' : 'Pago'}
                    </Badge>
                  </div>
                  <div className="mt-1 h-1 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="bg-brand-600 h-full"
                      style={{ width: `${(d.inscriptos / d.cupos) * 100}%` }}
                    />
                  </div>
                </div>

                <Button
                  intent="primary"
                  size="sm"
                  fullWidth
                  className="mt-3"
                  onClick={() =>
                    toast.push({
                      kind: 'success',
                      title: `Inscripto a ${d.nombre}`,
                      description: 'El centro confirma tu cupo en 48hs.',
                    })
                  }
                >
                  Inscribirme
                </Button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 flex items-center gap-2 text-base font-bold text-slate-900">
          <Trophy size={18} className="text-status-ok" /> Tus certificados
        </h2>

        <div className="grid gap-3 sm:grid-cols-2">
          {certificados.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() =>
                toast.push({ kind: 'info', title: 'Descargando PDF', description: c.nombre })
              }
              className="group relative overflow-hidden rounded-xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-4 text-left hover:shadow-md"
            >
              <div className="bg-status-ok-bg absolute -right-4 -top-4 h-24 w-24 rotate-12 rounded-3xl opacity-40" />
              <div className="relative flex items-start gap-3">
                <div className="bg-status-ok grid h-12 w-12 shrink-0 place-items-center rounded-xl text-white">
                  <Trophy size={20} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-slate-900">{c.nombre}</div>
                  <div className="mt-0.5 text-xs text-slate-600">Emitido {c.emitido}</div>
                  <div className="mt-1 inline-flex items-center gap-1 rounded-md bg-white/80 px-1.5 py-0.5 font-mono text-[10px] text-slate-600">
                    Folio {c.folio}
                  </div>
                </div>
                <Download
                  size={16}
                  className="group-hover:text-brand-600 shrink-0 text-slate-400 transition-colors"
                />
              </div>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
