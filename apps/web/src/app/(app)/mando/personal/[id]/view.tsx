'use client';

import {
  ArrowLeft,
  Award,
  Calendar,
  ExternalLink,
  Flame,
  GraduationCap,
  Mail,
  Phone,
  Shield,
  Stethoscope,
  TrendingUp,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

import { Avatar, Badge, Card, CardContent, Kpi, cn } from '@faro/ui';

import { EmptyState } from '../../../../../components/shared/empty-state';
import { PageHero } from '../../../../../components/shared/page-hero';
import {
  clasificarCuerpo,
  cuerpoLabel,
  detectarAlertasPersona,
  disponibleAhora,
} from '../../../../../lib/utils/cuerpo';
import { fmtFechaCorta } from '../../../../../lib/utils/date';
import { demoToday } from '../../../../../lib/utils/demo-today';
import { fmtJerarquia } from '../../../../../lib/utils/jerarquia';
import { useFaroStore } from '../../../../../store/use-faro-store';

export default function FichaPersonaMandoView() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const personas = useFaroStore((s) => s.personas);
  const servicios = useFaroStore((s) => s.servicios);
  const asistencias = useFaroStore((s) => s.asistencias);

  const persona = personas.find((p) => p.id === params.id);

  if (!persona) {
    return (
      <div className="mx-auto max-w-5xl space-y-5">
        <Link
          href="/mando/personal"
          className="hover:text-brand-700 inline-flex items-center gap-1 text-sm text-slate-500"
        >
          <ArrowLeft size={14} /> Volver
        </Link>
        <EmptyState
          icon={<Users size={28} />}
          titulo="Persona no encontrada"
          descripcion={`No existe una persona con id ${params.id}.`}
          variant="warning"
          accion={{
            label: 'Volver al listado',
            onClick: () => router.push('/mando/personal'),
          }}
        />
      </div>
    );
  }

  const cuerpo = clasificarCuerpo(persona);
  const alertas = detectarAlertasPersona(persona);
  const disponible = disponibleAhora(persona);
  const serviciosTotal = servicios.filter((s) => s.dotacionIds.includes(persona.id)).length;
  const horasMes = asistencias
    .filter((a) => a.personaId === persona.id)
    .reduce((acc, a) => acc + a.horas, 0);
  const cursosVigentes = persona.cursos?.filter((c) => c.vigente).length ?? 0;
  const cursosVencidos = persona.cursos?.filter((c) => !c.vigente).length ?? 0;

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <Link
        href="/mando/personal"
        className="hover:text-brand-700 inline-flex items-center gap-1 text-sm text-slate-500"
      >
        <ArrowLeft size={14} /> Volver a personal
      </Link>

      <PageHero
        objetivo={`Personal · ${cuerpoLabel[cuerpo]}`}
        titulo={`${persona.apellido}, ${persona.nombre}`}
        descripcion={`Legajo ${persona.legajo} · ${fmtJerarquia(persona.jerarquia)} · ${persona.funcion}`}
        icono={<Users size={26} />}
        variant={alertas.length > 0 ? 'critical' : disponible ? 'success' : 'default'}
        meta={
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Kpi
              label="Estado"
              value={persona.estado === 'activo' ? 'Activo' : persona.estado}
              intent={persona.estado === 'activo' ? 'ok' : 'warn'}
            />
            <Kpi label="Servicios" value={serviciosTotal} hint="totales" intent="brand" />
            <Kpi label="Horas mes" value={Math.round(horasMes)} hint="hs" intent="brand" />
            <Kpi
              label="Cursos"
              value={`${cursosVigentes}/${cursosVigentes + cursosVencidos}`}
              hint="vigentes"
              intent={cursosVencidos > 0 ? 'warn' : 'ok'}
            />
          </div>
        }
        acciones={
          <Link
            href={`/administrativo/personas/${persona.id}` as never}
            className="bg-brand-600 hover:bg-brand-700 inline-flex h-10 items-center gap-1.5 rounded-lg px-3 text-sm font-medium text-white"
          >
            <ExternalLink size={14} /> Ficha administrativa completa
          </Link>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
        {/* Sidebar avatar + datos */}
        <div className="space-y-3">
          <Card>
            <CardContent className="p-5 text-center">
              <Avatar
                name={`${persona.nombre} ${persona.apellido}`}
                src={persona.fotoUrl}
                size={96}
                className="mx-auto"
              />
              <h3 className="mt-3 font-bold text-slate-900">
                {persona.nombre} {persona.apellido}
              </h3>
              <p className="text-sm text-slate-500">{fmtJerarquia(persona.jerarquia)}</p>
              <div className="mt-3 flex flex-wrap justify-center gap-2">
                <Badge intent="brand">{cuerpoLabel[cuerpo]}</Badge>
                {disponible && <Badge intent="ok">Disponible</Badge>}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <h4 className="mb-2 text-xs font-bold uppercase text-slate-500">Contacto</h4>
              <dl className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Mail size={12} className="text-slate-400" />
                  <a
                    href={`mailto:${persona.email}`}
                    className="text-brand-700 truncate hover:underline"
                  >
                    {persona.email || '—'}
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <Phone size={12} className="text-slate-400" />
                  <a
                    href={`tel:${persona.telefono}`}
                    className="text-brand-700 truncate hover:underline"
                  >
                    {persona.telefono || '—'}
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar size={12} className="text-slate-400" />
                  <span className="text-slate-700">
                    Ingreso {new Date(persona.fechaIngreso).toLocaleDateString('es-AR')}
                  </span>
                </div>
              </dl>
            </CardContent>
          </Card>

          {/* Salud */}
          <Card>
            <CardContent className="p-4">
              <h4 className="mb-2 flex items-center gap-1 text-xs font-bold uppercase text-slate-500">
                <Stethoscope size={11} /> Salud
              </h4>
              <dl className="space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <dt className="text-slate-500">Grupo sanguíneo</dt>
                  <dd className="font-bold">{persona.salud?.grupoSanguineo ?? '—'}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">Aptitud vence</dt>
                  <dd
                    className={cn(
                      'font-medium',
                      persona.salud?.aptitudVencimiento &&
                        new Date(persona.salud.aptitudVencimiento).getTime() <
                          demoToday().getTime() + 60 * 86400000 &&
                        'text-status-warn-fg',
                    )}
                  >
                    {persona.salud?.aptitudVencimiento
                      ? fmtFechaCorta(persona.salud.aptitudVencimiento)
                      : '—'}
                  </dd>
                </div>
                {persona.salud?.alerta && (
                  <div className="bg-status-risk-bg/40 text-status-risk-fg rounded p-2 text-xs">
                    ⚠ {persona.salud.alerta}
                  </div>
                )}
              </dl>
            </CardContent>
          </Card>
        </div>

        {/* Main · alertas + cursos + servicios */}
        <div className="space-y-3">
          {/* Alertas */}
          {alertas.length > 0 && (
            <Card className="border-status-risk/30 bg-status-risk-bg/20 border-2">
              <CardContent className="p-4">
                <h3 className="text-status-risk-fg mb-2 flex items-center gap-2 font-bold">
                  <Shield size={16} /> Alertas activas
                </h3>
                <ul className="space-y-1.5">
                  {alertas.map((a, idx) => (
                    <li
                      key={idx}
                      className="bg-status-risk-bg/40 flex items-start gap-2 rounded-lg p-2.5 text-sm"
                    >
                      <span
                        className={cn(
                          'mt-1.5 h-2 w-2 shrink-0 rounded-full',
                          a.severidad === 'risk' ? 'bg-status-risk' : 'bg-status-warn',
                        )}
                      />
                      <span className="text-slate-900">{a.texto}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Cursos */}
          <Card>
            <CardContent className="p-0">
              <div className="border-b border-slate-100 px-4 py-3">
                <h3 className="flex items-center gap-2 font-bold text-slate-900">
                  <GraduationCap size={16} className="text-brand-700" />
                  Cursos y certificaciones
                </h3>
              </div>
              {(persona.cursos?.length ?? 0) === 0 ? (
                <EmptyState
                  inline
                  icon={<GraduationCap size={24} />}
                  titulo="Sin cursos cargados"
                  descripcion="Esta persona no tiene certificaciones registradas todavía."
                />
              ) : (
                <ul className="divide-y divide-slate-100">
                  {persona.cursos!.map((c) => (
                    <li key={c.id} className="flex items-center gap-3 p-3 text-sm">
                      <Award size={14} className="shrink-0 text-slate-400" />
                      <div className="min-w-0 flex-1">
                        <div className="truncate font-medium text-slate-900">{c.nombre}</div>
                        <div className="text-xs text-slate-500">
                          {c.centro ?? '—'}
                          {c.vencimiento &&
                            ` · vence ${new Date(c.vencimiento).toLocaleDateString('es-AR')}`}
                        </div>
                      </div>
                      <Badge intent={c.vigente ? 'ok' : 'risk'}>
                        {c.vigente ? 'Vigente' : 'Vencido'}
                      </Badge>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          {/* Últimos servicios */}
          <Card>
            <CardContent className="p-0">
              <div className="border-b border-slate-100 px-4 py-3">
                <h3 className="flex items-center gap-2 font-bold text-slate-900">
                  <Flame size={16} className="text-fire-600" />
                  Últimos servicios
                </h3>
              </div>
              {serviciosTotal === 0 ? (
                <EmptyState
                  inline
                  icon={<Flame size={24} />}
                  titulo="Sin servicios"
                  descripcion="Esta persona no participó en servicios todavía."
                />
              ) : (
                <ul className="divide-y divide-slate-100">
                  {servicios
                    .filter((s) => s.dotacionIds.includes(persona.id))
                    .slice(0, 5)
                    .map((s) => (
                      <li key={s.id} className="flex items-center gap-3 p-3 text-sm">
                        <div className="bg-fire-100 text-fire-700 grid h-8 w-8 shrink-0 place-items-center rounded text-xs font-bold uppercase">
                          {s.tipo[0]}
                        </div>
                        <div className="min-w-0 flex-1">
                          <Link
                            href={`/mando/operaciones/${s.id}` as never}
                            className="hover:text-brand-700 block truncate font-medium text-slate-900"
                          >
                            {s.direccion}
                          </Link>
                          <div className="text-xs text-slate-500">
                            {new Date(s.horaSalida).toLocaleDateString('es-AR')}
                          </div>
                        </div>
                        <Badge intent={s.estado === 'validado' ? 'ok' : 'warn'}>
                          {s.estado === 'validado' ? 'OK' : 'Pendiente'}
                        </Badge>
                      </li>
                    ))}
                </ul>
              )}
            </CardContent>
          </Card>

          {/* Quick stats */}
          <Card className="bg-brand-50/40 border-brand-100">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="bg-brand-600 grid h-10 w-10 shrink-0 place-items-center rounded-xl text-white">
                  <TrendingUp size={18} />
                </div>
                <div className="flex-1 text-sm">
                  <strong className="text-brand-900">Actividad del mes:</strong> promedio de{' '}
                  {Math.round(horasMes / 4)} hs/semana en el cuartel.
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
