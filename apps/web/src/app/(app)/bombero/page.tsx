'use client';

import {
  ArrowRight,
  Calendar,
  CalendarCheck,
  CheckCircle2,
  Clock,
  Flame,
  GraduationCap,
  MessageSquare,
  Shield,
  Sun,
  TrendingUp,
} from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';

import {
  Avatar,
  Badge,
  Card,
  CardContent,
  Kpi,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  cn,
} from '@faro/ui';

import { InicioSimple } from '../../../components/bombero/inicio-simple';
import { FeaturesGrid } from '../../../components/shared/features-grid';
import { PageHero } from '../../../components/shared/page-hero';
import { calcularComputoMensual } from '../../../lib/utils/computo';
import { detectarAlertasPersona } from '../../../lib/utils/cuerpo';
import { fmtMesPeriodo, mesActual } from '../../../lib/utils/date';
import { demoToday } from '../../../lib/utils/demo-today';
import {
  useFaroStore,
  selectCuartelActivo,
  selectPersonaActual,
} from '../../../store/use-faro-store';

interface Guardia {
  fecha: string;
  diaSemana: string;
  diaNum: number;
  turno: string;
  movil: string;
  dotacion: string[];
  estado: 'confirmada' | 'pendiente' | 'pasada';
}

// TODO: pull from store cuando exista slice de guardias
const PROXIMAS_GUARDIAS: Guardia[] = [
  {
    fecha: '25 may',
    diaSemana: 'Lun',
    diaNum: 25,
    turno: '20-08 hs',
    movil: 'BV-3',
    dotacion: ['Mariana', 'Carolina', 'Sebastián'],
    estado: 'confirmada',
  },
  {
    fecha: '28 may',
    diaSemana: 'Jue',
    diaNum: 28,
    turno: '08-20 hs',
    movil: 'BV-5',
    dotacion: ['Mariana', 'Iván', 'Federico'],
    estado: 'pendiente',
  },
];

// TODO: pull from store cuando exista slice de avisos
const AVISOS_FULL = [
  {
    emoji: '📋',
    titulo: 'Curso de rescate vehicular',
    cuerpo: 'Inscripción hasta el 30/5. 12 anotados de 16 cupos.',
    cuando: 'Hoy 14:30',
    prioridad: 'alta',
  },
  {
    emoji: '🔧',
    titulo: 'Mantenimiento Móvil BV-5',
    cuerpo: 'Mañana de 8 a 12 hs. El móvil queda fuera de servicio.',
    cuando: 'Ayer 18:00',
    prioridad: 'normal',
  },
];

export default function BomberoInicio() {
  const persona = useFaroStore(selectPersonaActual);
  const cuartel = useFaroStore(selectCuartelActivo);
  const asistencias = useFaroStore((s) => s.asistencias);
  const servicios = useFaroStore((s) => s.servicios);
  const modoSimple = useFaroStore((s) => s.modoSimple);
  const setModoSimple = useFaroStore((s) => s.setModoSimple);
  const [tab, setTab] = useState('hoy');

  const computo = useMemo(
    () => (cuartel ? calcularComputoMensual(asistencias, cuartel.id, mesActual()) : []),
    [asistencias, cuartel],
  );
  if (!persona) return null;
  if (modoSimple) return <InicioSimple persona={persona} />;

  const propio = computo.find((c) => c.personaId === persona.id);
  const alertas = detectarAlertasPersona(persona);
  const horasEsteMes = propio?.total ?? 0;
  const serviciosMios = servicios.filter((s) => s.dotacionIds.includes(persona.id)).length;

  const ahora = demoToday();
  const hora = ahora.getHours();
  const saludo = hora < 12 ? 'Buen día' : hora < 19 ? 'Buenas tardes' : 'Buenas noches';

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setModoSimple(true)}
          className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-medium text-slate-600 ring-1 ring-slate-200 transition-colors hover:bg-slate-50"
        >
          <span className="bg-status-ok h-1.5 w-1.5 rounded-full" />
          Cambiar a modo simple
        </button>
      </div>
      <PageHero
        objetivo="Tu día en el cuartel"
        titulo={`${saludo}, ${persona.nombre}`}
        descripcion={`${cuartel?.nombre} · ${persona.funcion}. ${alertas.length > 0 ? `Tenés ${alertas.length} aviso${alertas.length === 1 ? '' : 's'} para revisar` : `${horasEsteMes}hs trabajadas este mes · ${serviciosMios} servicios atendidos`}.`}
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
              hint={fmtMesPeriodo(mesActual())}
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

      <Tabs value={tab} onChange={setTab}>
        <TabsList>
          <TabsTrigger value="hoy">
            <Sun size={13} className="mr-1" /> Hoy
          </TabsTrigger>
          <TabsTrigger value="proximas">
            <Calendar size={13} className="mr-1" /> Próximas guardias
            <span className="ml-1 rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] tabular-nums">
              {PROXIMAS_GUARDIAS.length}
            </span>
          </TabsTrigger>
          <TabsTrigger value="avisos">
            <MessageSquare size={13} className="mr-1" /> Avisos
            <span className="bg-status-warn-bg text-status-warn-fg ml-1 rounded-full px-1.5 py-0.5 text-[10px] tabular-nums">
              {AVISOS_FULL.length}
            </span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="hoy">
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

          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <Link href="/bombero/asistencia">
              <Card className="h-full transition-shadow hover:shadow-md">
                <CardContent className="flex items-center gap-3 p-4">
                  <div className="bg-brand-600 grid h-11 w-11 shrink-0 place-items-center rounded-xl text-white">
                    <CheckCircle2 size={20} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-slate-900">Marcar presente</div>
                    <div className="text-xs text-slate-600">
                      Check-in geolocalizado en el cuartel
                    </div>
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
            <Card className="border-l-status-warn mt-3 border-l-4">
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

          {/* Acceso rápido a herramientas nuevas */}
          <FeaturesGrid
            titulo="Tus nuevas herramientas"
            descripcion="Sumá tu información para mejorar el cuartel"
            columnas={2}
            cards={[
              {
                href: '/bombero/equipo',
                icon: <Shield size={18} />,
                titulo: 'Mi equipo (uniforme)',
                descripcion: '8 ítems con vencimientos + QR',
                color: 'bg-fire-700',
                nuevo: true,
              },
              {
                href: '/bombero/disponibilidad',
                icon: <Calendar size={18} />,
                titulo: 'Disponibilidad semanal',
                descripcion: 'Declarás cuándo estás · cubre los huecos',
                color: 'bg-brand-600',
                nuevo: true,
              },
            ]}
          />
        </TabsContent>

        <TabsContent value="proximas">
          <Card>
            <CardContent className="p-5">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-bold text-slate-900">Mis próximas guardias</h3>
                <Badge intent="brand">{PROXIMAS_GUARDIAS.length} programadas</Badge>
              </div>
              <div className="space-y-2.5">
                {PROXIMAS_GUARDIAS.map((g, idx) => (
                  <div
                    key={idx}
                    className={cn(
                      'flex items-center gap-3 rounded-xl border p-3.5',
                      g.estado === 'confirmada'
                        ? 'border-status-ok/40 bg-status-ok-bg/20'
                        : 'border-status-warn/40 bg-status-warn-bg/20',
                    )}
                  >
                    <div className="grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-white text-center shadow-sm ring-1 ring-slate-200">
                      <div className="text-[10px] uppercase tracking-wide text-slate-500">
                        {g.diaSemana}
                      </div>
                      <div className="text-xl font-bold leading-none text-slate-900">
                        {g.diaNum}
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-slate-900">{g.turno}</span>
                        <Badge intent={g.estado === 'confirmada' ? 'ok' : 'warn'}>
                          {g.estado === 'confirmada' ? 'Confirmada' : 'Pendiente'}
                        </Badge>
                      </div>
                      <div className="mt-0.5 text-xs text-slate-600">
                        Móvil <strong>{g.movil}</strong> · con {g.dotacion.join(', ')}
                      </div>
                    </div>
                    {g.estado === 'pendiente' && (
                      <button
                        type="button"
                        className="bg-status-ok shrink-0 rounded-md px-2.5 py-1.5 text-xs font-semibold text-white hover:opacity-90"
                      >
                        Confirmar
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <p className="mt-4 text-xs text-slate-500">
                Las guardias se asignan automáticamente respetando descansos, capacidades y
                preferencias declaradas. Si necesitás un cambio, pedilo desde acá.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="avisos">
          <Card>
            <CardContent className="p-5">
              <h3 className="mb-3 flex items-center gap-2 font-bold text-slate-900">
                <MessageSquare size={18} className="text-brand-600" /> Avisos del cuartel y de tu
                sección
              </h3>
              <ul className="space-y-2.5">
                {AVISOS_FULL.map((a, idx) => (
                  <li
                    key={idx}
                    className={cn(
                      'flex items-start gap-3 rounded-lg p-3',
                      a.prioridad === 'alta' ? 'bg-brand-50 ring-brand-200 ring-1' : 'bg-slate-50',
                    )}
                  >
                    <span className="text-2xl">{a.emoji}</span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-slate-900">{a.titulo}</span>
                        {a.prioridad === 'alta' && <Badge intent="brand">Nuevo</Badge>}
                      </div>
                      <div className="mt-0.5 text-sm text-slate-700">{a.cuerpo}</div>
                      <div className="mt-1 text-[11px] text-slate-500">{a.cuando}</div>
                    </div>
                  </li>
                ))}
              </ul>
              <Link
                href="/bombero/comunicacion"
                className="text-brand-700 hover:text-brand-900 mt-3 inline-flex items-center gap-1 text-sm font-medium"
              >
                Ir al chat completo <ArrowRight size={14} />
              </Link>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
