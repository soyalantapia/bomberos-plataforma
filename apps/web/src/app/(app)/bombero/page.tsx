'use client';

import {
  ArrowRight,
  CalendarCheck,
  CheckCircle2,
  Clock,
  Flame,
  GraduationCap,
  MessageSquare,
  TrendingUp,
} from 'lucide-react';
import Link from 'next/link';
import { useMemo } from 'react';

import { Avatar, Card, CardContent, Kpi, cn } from '@faro/ui';

import { PageHero } from '../../../components/shared/page-hero';
import { calcularComputoMensual } from '../../../lib/utils/computo';
import { detectarAlertasPersona } from '../../../lib/utils/cuerpo';
import { fmtMesPeriodo } from '../../../lib/utils/date';
import {
  useFaroStore,
  selectCuartelActivo,
  selectPersonaActual,
} from '../../../store/use-faro-store';

export default function BomberoInicio() {
  const persona = useFaroStore(selectPersonaActual);
  const cuartel = useFaroStore(selectCuartelActivo);
  const asistencias = useFaroStore((s) => s.asistencias);
  const servicios = useFaroStore((s) => s.servicios);

  const computo = useMemo(
    () => (cuartel ? calcularComputoMensual(asistencias, cuartel.id, '2026-05') : []),
    [asistencias, cuartel],
  );
  if (!persona) return null;

  const propio = computo.find((c) => c.personaId === persona.id);
  const alertas = detectarAlertasPersona(persona);
  const horasEsteMes = propio?.total ?? 0;
  const serviciosMios = servicios.filter((s) => s.dotacionIds.includes(persona.id)).length;
  const cursoProximo = persona.cursos.find((c) => c.vencimiento);

  const ahora = new Date();
  const hora = ahora.getHours();
  const saludo = hora < 12 ? 'Buen día' : hora < 19 ? 'Buenas tardes' : 'Buenas noches';

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <PageHero
        objetivo="Tu día en el cuartel"
        titulo={`${saludo}, ${persona.nombre}`}
        descripcion={`${cuartel?.nombre} · ${persona.funcion}. ${alertas.length > 0 ? `Tenés ${alertas.length} aviso${alertas.length === 1 ? '' : 's'} para revisar.` : 'Todo en orden.'}`}
        icono={
          <Avatar
            name={`${persona.nombre} ${persona.apellido}`}
            size={56}
            className="ring-2 ring-white/40"
          />
        }
        variant={
          alertas.some((a) => a.severidad === 'risk')
            ? 'critical'
            : alertas.length === 0
              ? 'success'
              : 'default'
        }
        meta={
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            <Kpi
              label="Tus horas"
              value={horasEsteMes}
              hint={fmtMesPeriodo('2026-05')}
              intent="brand"
              icon={<Clock size={16} />}
            />
            <Kpi
              label="Servicios"
              value={serviciosMios}
              hint="participaste"
              icon={<Flame size={16} />}
            />
            <Kpi
              label="Cursos"
              value={persona.cursos.filter((c) => c.vigente !== false).length}
              hint="vigentes"
              intent="ok"
              icon={<GraduationCap size={16} />}
            />
            <Kpi
              label="Disponible"
              value={persona.estado === 'activo' ? 'Sí' : 'No'}
              hint={persona.estado}
              intent={persona.estado === 'activo' ? 'ok' : 'warn'}
            />
          </div>
        }
      />

      <Link href="/bombero/registrar-servicio" className="block">
        <Card className="from-fire-600 to-fire-700 cursor-pointer overflow-hidden border-0 bg-gradient-to-br text-white shadow-lg transition-shadow hover:shadow-xl">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-white/20 backdrop-blur">
              <Flame size={32} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-semibold uppercase tracking-wide text-white/70">
                Acción principal
              </div>
              <div className="mt-0.5 text-2xl font-bold">Registrar servicio</div>
              <div className="mt-1 text-sm text-white/80">
                En 1 minuto, con guantes, dictando por voz si querés.
              </div>
            </div>
            <ArrowRight size={28} className="shrink-0" />
          </CardContent>
        </Card>
      </Link>

      <div className="grid gap-3 sm:grid-cols-2">
        <Link href="/bombero/asistencia">
          <Card className="h-full transition-shadow hover:shadow-md">
            <CardContent className="flex items-center gap-3 p-4">
              <div className="bg-brand-600 grid h-11 w-11 shrink-0 place-items-center rounded-xl text-white">
                <CheckCircle2 size={20} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-semibold text-slate-900">Marcar presente</div>
                <div className="text-xs text-slate-600">Check-in geolocalizado en el cuartel</div>
              </div>
              <ArrowRight size={18} className="shrink-0 text-slate-400" />
            </CardContent>
          </Card>
        </Link>

        <Link href="/bombero/legajo">
          <Card className="h-full transition-shadow hover:shadow-md">
            <CardContent className="flex items-center gap-3 p-4">
              <div
                className={cn(
                  'grid h-11 w-11 shrink-0 place-items-center rounded-xl text-white',
                  alertas.length > 0 ? 'bg-status-warn' : 'bg-slate-600',
                )}
              >
                <CalendarCheck size={20} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-semibold text-slate-900">Mi legajo</div>
                <div className="text-xs text-slate-600">
                  {alertas.length > 0
                    ? `${alertas.length} cosa${alertas.length === 1 ? '' : 's'} para revisar`
                    : 'Datos al día'}
                </div>
              </div>
              <ArrowRight size={18} className="shrink-0 text-slate-400" />
            </CardContent>
          </Card>
        </Link>
      </div>

      {alertas.length > 0 && (
        <Card className="border-l-status-warn border-l-4">
          <CardContent className="p-4">
            <h3 className="mb-2 flex items-center gap-2 font-semibold text-slate-900">
              <TrendingUp size={16} className="text-status-warn-fg" /> Tu radar
            </h3>
            <ul className="space-y-1.5">
              {alertas.slice(0, 3).map((a, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm">
                  <span
                    className={cn(
                      'mt-1.5 h-2 w-2 shrink-0 rounded-full',
                      a.severidad === 'risk' ? 'bg-status-risk' : 'bg-status-warn',
                    )}
                  />
                  <span className="text-slate-700">{a.texto}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-5">
          <h2 className="mb-3 flex items-center gap-2 text-base font-bold text-slate-900">
            <MessageSquare size={18} className="text-brand-600" /> Avisos del cuartel
          </h2>
          <ul className="space-y-2.5">
            <li className="bg-brand-50 flex items-start gap-3 rounded-lg p-3">
              <span className="text-xl">📋</span>
              <div className="flex-1">
                <div className="text-sm font-medium text-slate-900">Curso de rescate vehicular</div>
                <div className="mt-0.5 text-xs text-slate-600">Inscripción hasta el 30/5</div>
              </div>
            </li>
            <li className="flex items-start gap-3 rounded-lg bg-slate-50 p-3">
              <span className="text-xl">🔧</span>
              <div className="flex-1">
                <div className="text-sm font-medium text-slate-900">Mantenimiento Móvil BV-5</div>
                <div className="mt-0.5 text-xs text-slate-600">Mañana de 8 a 12 hs</div>
              </div>
            </li>
            <li className="flex items-start gap-3 rounded-lg bg-slate-50 p-3">
              <span className="text-xl">🩸</span>
              <div className="flex-1">
                <div className="text-sm font-medium text-slate-900">Donación de sangre</div>
                <div className="mt-0.5 text-xs text-slate-600">
                  Sábado 25/5 · Hospital Municipal
                </div>
              </div>
            </li>
          </ul>
          <Link
            href="/bombero/comunicacion"
            className="text-brand-700 hover:text-brand-900 mt-3 inline-flex items-center gap-1 text-sm font-medium"
          >
            Ver todos los avisos <ArrowRight size={14} />
          </Link>
        </CardContent>
      </Card>

      {cursoProximo && cursoProximo.vencimiento && (
        <Card className="border-slate-200 bg-slate-50">
          <CardContent className="flex items-center gap-3 p-4 text-sm text-slate-700">
            <GraduationCap size={20} className="shrink-0 text-slate-400" />
            <div>
              <strong className="text-slate-900">Próximo vencimiento de curso:</strong>{' '}
              {cursoProximo.nombre} vence el {cursoProximo.vencimiento}. Mantenerlo vigente es
              condición para servicios.{' '}
              <Link
                href="/bombero/capacitacion"
                className="text-brand-700 hover:text-brand-900 font-medium"
              >
                Ver cursos →
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
