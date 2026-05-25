'use client';

import {
  Activity,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Flame,
  LayoutDashboard,
  ShieldAlert,
  TrendingUp,
  Users,
  Calendar,
  Sun,
  Moon,
  Sunset,
} from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';

import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Kpi,
  StatusPill,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  cn,
} from '@faro/ui';

import { PageHero } from '../../../components/shared/page-hero';
import { SemaforoRendicion } from '../../../components/rendicion/semaforo-rendicion';
import {
  useFaroStore,
  selectCuartelActivo,
  selectRendicionActual,
} from '../../../store/use-faro-store';
import { calcularComputoMensual } from '../../../lib/utils/computo';
import { fmtFecha, fmtHora, fmtMesPeriodo, mesActual } from '../../../lib/utils/date';
import { tipoServicioLabel } from '../../../lib/utils/tipo-servicio';

type Turno = 'manana' | 'tarde' | 'noche';
interface CeldaGuardia {
  cubierta: boolean;
  movil: string;
  dotacion: number;
  jefe: string;
  notas?: string;
}
interface DiaGuardia {
  fecha: string;
  diaSemana: string;
  diaNum: number;
  esHoy?: boolean;
  manana: CeldaGuardia;
  tarde: CeldaGuardia;
  noche: CeldaGuardia;
}

const SEMANA_GUARDIAS: DiaGuardia[] = [
  {
    fecha: '24 may',
    diaSemana: 'Dom',
    diaNum: 24,
    esHoy: true,
    manana: { cubierta: true, movil: 'BV-3', dotacion: 4, jefe: 'Carolina' },
    tarde: { cubierta: true, movil: 'BV-5', dotacion: 5, jefe: 'Mariana' },
    noche: { cubierta: true, movil: 'BV-3', dotacion: 3, jefe: 'Sebastián' },
  },
  {
    fecha: '25 may',
    diaSemana: 'Lun',
    diaNum: 25,
    manana: { cubierta: true, movil: 'BV-3', dotacion: 4, jefe: 'Federico' },
    tarde: { cubierta: true, movil: 'BV-5', dotacion: 5, jefe: 'Lucía' },
    noche: { cubierta: true, movil: 'BV-3', dotacion: 3, jefe: 'Mariana', notas: 'Refuerzo BV-7' },
  },
  {
    fecha: '26 may',
    diaSemana: 'Mar',
    diaNum: 26,
    manana: { cubierta: true, movil: 'BV-3', dotacion: 4, jefe: 'Iván' },
    tarde: { cubierta: false, movil: 'BV-5', dotacion: 2, jefe: 'Sin jefe asignado' },
    noche: { cubierta: true, movil: 'BV-3', dotacion: 3, jefe: 'Carolina' },
  },
  {
    fecha: '27 may',
    diaSemana: 'Mié',
    diaNum: 27,
    manana: { cubierta: true, movil: 'BV-3', dotacion: 5, jefe: 'Sebastián' },
    tarde: { cubierta: true, movil: 'BV-5', dotacion: 4, jefe: 'Federico' },
    noche: { cubierta: false, movil: 'BV-3', dotacion: 1, jefe: 'Sin jefe asignado' },
  },
  {
    fecha: '28 may',
    diaSemana: 'Jue',
    diaNum: 28,
    manana: { cubierta: true, movil: 'BV-3', dotacion: 4, jefe: 'Mariana' },
    tarde: { cubierta: true, movil: 'BV-5', dotacion: 5, jefe: 'Lucía' },
    noche: { cubierta: true, movil: 'BV-3', dotacion: 3, jefe: 'Iván' },
  },
  {
    fecha: '29 may',
    diaSemana: 'Vie',
    diaNum: 29,
    manana: { cubierta: true, movil: 'BV-3', dotacion: 4, jefe: 'Carolina' },
    tarde: { cubierta: true, movil: 'BV-5', dotacion: 5, jefe: 'Tomás' },
    noche: {
      cubierta: true,
      movil: 'BV-3',
      dotacion: 4,
      jefe: 'Federico',
      notas: 'Operativo noche',
    },
  },
  {
    fecha: '30 may',
    diaSemana: 'Sáb',
    diaNum: 30,
    manana: { cubierta: true, movil: 'BV-3', dotacion: 4, jefe: 'Sebastián' },
    tarde: { cubierta: true, movil: 'BV-5', dotacion: 5, jefe: 'Mariana' },
    noche: { cubierta: true, movil: 'BV-3', dotacion: 3, jefe: 'Brenda' },
  },
];

const turnoLabel: Record<Turno, { label: string; horario: string; icon: React.ReactNode }> = {
  manana: { label: 'Mañana', horario: '08-14 hs', icon: <Sun size={14} /> },
  tarde: { label: 'Tarde', horario: '14-20 hs', icon: <Sunset size={14} /> },
  noche: { label: 'Noche', horario: '20-08 hs', icon: <Moon size={14} /> },
};

type Severidad = 'risk' | 'warn' | 'ok';
const severidadColor: Record<Severidad, { bg: string; text: string; border: string }> = {
  risk: { bg: 'bg-status-risk-bg', text: 'text-status-risk-fg', border: 'border-status-risk/30' },
  warn: { bg: 'bg-status-warn-bg', text: 'text-status-warn-fg', border: 'border-status-warn/30' },
  ok: { bg: 'bg-status-ok-bg', text: 'text-status-ok-fg', border: 'border-status-ok/30' },
};

export default function MandoDashboard() {
  const cuartel = useFaroStore(selectCuartelActivo);
  const rendicion = useFaroStore(selectRendicionActual);
  const allAlertas = useFaroStore((s) => s.alertas);
  const allServicios = useFaroStore((s) => s.servicios);
  const allAsistencias = useFaroStore((s) => s.asistencias);
  const personas = useFaroStore((s) => s.personas);
  const [tab, setTab] = useState('resumen');
  const [sevFiltro, setSevFiltro] = useState<'todas' | 'risk' | 'warn' | 'ok'>('todas');

  const alertas = useMemo(
    () => allAlertas.filter((a) => a.cuartelId === cuartel?.id),
    [allAlertas, cuartel?.id],
  );
  const servicios = useMemo(
    () => allServicios.filter((s) => s.cuartelId === cuartel?.id),
    [allServicios, cuartel?.id],
  );
  const computo = useMemo(
    () => (cuartel ? calcularComputoMensual(allAsistencias, cuartel.id, '2026-05') : []),
    [allAsistencias, cuartel],
  );

  const personasActivas = personas.filter(
    (p) => p.cuartelId === cuartel?.id && p.estado === 'activo',
  ).length;
  const horasMes = computo.reduce((acc, c) => acc + c.total, 0);
  const serviciosMes = servicios.length;
  const pendientes = servicios.filter((s) => s.estado === 'pendiente_validacion').length;

  const alertasRisk = alertas.filter((a) => a.severidad === 'risk').length;
  const alertasWarn = alertas.filter((a) => a.severidad === 'warn').length;
  const alertasOk = alertas.filter((a) => a.severidad === 'ok').length;
  const alertasFiltradas =
    sevFiltro === 'todas' ? alertas : alertas.filter((a) => a.severidad === sevFiltro);

  const turnos: Turno[] = ['manana', 'tarde', 'noche'];
  const totalCeldas = SEMANA_GUARDIAS.length * 3;
  const cubiertas = SEMANA_GUARDIAS.reduce(
    (acc, d) =>
      acc + (d.manana.cubierta ? 1 : 0) + (d.tarde.cubierta ? 1 : 0) + (d.noche.cubierta ? 1 : 0),
    0,
  );
  const porcCobertura = Math.round((cubiertas / totalCeldas) * 100);

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <PageHero
        objetivo="Vista Mando · Dashboard"
        titulo="Cuartel en tiempo real"
        descripcion={`${cuartel?.nombre} · ${fmtMesPeriodo(mesActual())} · ${personasActivas} activos, ${serviciosMes} servicios este mes`}
        icono={<LayoutDashboard size={26} />}
        meta={
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Kpi
              label="Cumplimiento"
              value={`${cuartel?.porcentajeRendicion ?? 0}%`}
              hint="del mes"
              icon={<TrendingUp size={18} />}
              intent={
                cuartel?.cumplimiento === 'ok'
                  ? 'ok'
                  : cuartel?.cumplimiento === 'warn'
                    ? 'warn'
                    : 'risk'
              }
            />
            <Kpi
              label="Servicios"
              value={serviciosMes}
              hint={pendientes > 0 ? `${pendientes} a validar` : 'validados'}
              icon={<Flame size={18} />}
              intent="brand"
            />
            <Kpi label="Horas op." value={horasMes} hint="del mes" intent="neutral" />
            <Kpi
              label="Personal"
              value={personasActivas}
              hint="activos"
              icon={<Users size={18} />}
              intent="neutral"
            />
          </div>
        }
        acciones={
          <Link href="/mando/rendicion">
            <Button intent="primary">
              Ver rendición <ArrowRight size={16} />
            </Button>
          </Link>
        }
      />

      <Tabs value={tab} onChange={setTab}>
        <TabsList>
          <TabsTrigger value="resumen">Resumen</TabsTrigger>
          <TabsTrigger value="guardias">Guardias ({porcCobertura}%)</TabsTrigger>
          <TabsTrigger value="alertas">
            Alertas ({alertas.length}
            {alertasRisk > 0 ? ` · ${alertasRisk} críticas` : ''})
          </TabsTrigger>
        </TabsList>

        {/* ───────── RESUMEN ───────── */}
        <TabsContent value="resumen" className="space-y-5">
          <Card className="bg-gradient-to-br from-white to-slate-50">
            <CardContent className="p-5 sm:p-6">
              <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-start">
                <SemaforoRendicion rendicion={rendicion} />
                <div className="min-w-0 flex-1 text-center sm:text-left">
                  <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Rendición al Fondo
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">
                    {fmtMesPeriodo(rendicion?.periodo ?? mesActual())}
                  </h2>
                  <p className="mt-1 text-slate-600">
                    {rendicion?.estado === 'presentada'
                      ? 'Ya está presentada al Fondo. ¡Excelente!'
                      : `Faltan ${rendicion?.requisitos.filter((r) => !r.completo).length ?? 0} ítems para estar lista.`}
                  </p>
                  <div className="mt-3 flex flex-wrap justify-center gap-2 sm:justify-start">
                    <Link href="/mando/rendicion">
                      <Button>
                        Resolver pendientes <ArrowRight size={16} />
                      </Button>
                    </Link>
                    <Link href="/mando/computo">
                      <Button intent="secondary">Ver cómputo</Button>
                    </Link>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity size={18} className="text-status-ok animate-pulse" />
                Actividad en vivo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="divide-y divide-slate-100">
                {servicios.slice(0, 6).map((s) => (
                  <li key={s.id} className="flex items-center gap-3 py-3">
                    <div className="bg-fire-100 text-fire-700 grid h-10 w-10 place-items-center rounded-lg text-xs font-bold uppercase">
                      {s.tipo[0]}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-medium text-slate-900">
                        {tipoServicioLabel[s.tipo]} · {s.direccion}
                      </div>
                      <div className="text-xs text-slate-600">
                        {fmtFecha(s.horaSalida)} · {fmtHora(s.horaSalida)} →{' '}
                        {fmtHora(s.horaRegreso)} · {s.dotacionIds.length} personas
                      </div>
                    </div>
                    {s.estado === 'pendiente_validacion' ? (
                      <Badge intent="warn">Sin validar</Badge>
                    ) : (
                      <Badge intent="ok">Validado</Badge>
                    )}
                  </li>
                ))}
              </ul>
              <div className="mt-3 border-t border-slate-100 pt-3">
                <Link
                  href="/mando/operaciones"
                  className="text-brand-700 hover:text-brand-900 inline-flex items-center gap-1 text-sm font-medium"
                >
                  Ver todos los servicios <ArrowRight size={14} />
                </Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ───────── GUARDIAS ───────── */}
        <TabsContent value="guardias" className="space-y-5">
          <Card className="bg-brand-50/60 border-brand-100">
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-start gap-3">
                <div className="bg-brand-600 grid h-10 w-10 shrink-0 place-items-center rounded-xl text-white">
                  <Calendar size={20} />
                </div>
                <div className="flex-1">
                  <div className="text-brand-900 font-semibold">
                    Cobertura semanal · {cubiertas}/{totalCeldas} turnos cubiertos ({porcCobertura}
                    %)
                  </div>
                  <p className="text-brand-900/80 text-sm">
                    Si un turno queda sin cubrir, la IA notifica a quienes tienen disponibilidad
                    declarada esa franja horaria.
                  </p>
                </div>
                <Button intent="primary" size="sm">
                  Nueva guardia
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Tabla semana × turnos */}
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px] text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50">
                      <th className="px-4 py-3 text-left font-semibold text-slate-700">Día</th>
                      {turnos.map((t) => (
                        <th key={t} className="px-4 py-3 text-left font-semibold text-slate-700">
                          <div className="flex items-center gap-1.5">
                            {turnoLabel[t].icon}
                            <span>{turnoLabel[t].label}</span>
                            <span className="text-xs font-normal text-slate-500">
                              {turnoLabel[t].horario}
                            </span>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {SEMANA_GUARDIAS.map((dia) => (
                      <tr
                        key={dia.fecha}
                        className={cn(
                          'border-b border-slate-100 last:border-0',
                          dia.esHoy && 'bg-brand-50/40',
                        )}
                      >
                        <td className="px-4 py-3 align-top">
                          <div className="flex flex-col">
                            <span className="text-xs uppercase text-slate-500">
                              {dia.diaSemana}
                            </span>
                            <span className="text-lg font-bold text-slate-900">{dia.diaNum}</span>
                            {dia.esHoy && (
                              <span className="text-brand-700 text-[10px] font-semibold uppercase">
                                Hoy
                              </span>
                            )}
                          </div>
                        </td>
                        {turnos.map((t) => {
                          const celda = dia[t];
                          return (
                            <td key={t} className="px-4 py-3 align-top">
                              <div
                                className={cn(
                                  'rounded-lg border p-2.5',
                                  celda.cubierta
                                    ? 'bg-status-ok-bg/40 border-status-ok/20'
                                    : 'bg-status-warn-bg/40 border-status-warn/30',
                                )}
                              >
                                <div className="flex items-center justify-between gap-2">
                                  <span className="text-xs font-semibold text-slate-700">
                                    {celda.movil}
                                  </span>
                                  {celda.cubierta ? (
                                    <Badge intent="ok">{celda.dotacion} dot.</Badge>
                                  ) : (
                                    <Badge intent="warn">Falta jefe</Badge>
                                  )}
                                </div>
                                <div
                                  className={cn(
                                    'mt-1 truncate text-xs',
                                    celda.cubierta
                                      ? 'text-slate-700'
                                      : 'text-status-warn-fg italic',
                                  )}
                                >
                                  {celda.jefe}
                                </div>
                                {celda.notas && (
                                  <div className="text-brand-700 mt-1 text-[11px] font-medium">
                                    {celda.notas}
                                  </div>
                                )}
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 bg-slate-50">
            <CardContent className="flex items-start gap-3 p-4 text-sm text-slate-600">
              <Calendar size={18} className="mt-0.5 shrink-0 text-slate-400" />
              <div>
                <strong className="text-slate-900">Próximamente:</strong> al hacer click en una
                celda se abre el detalle con la dotación completa, posibilidad de pedir cobertura, y
                reasignación drag-and-drop.
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ───────── ALERTAS ───────── */}
        <TabsContent value="alertas" className="space-y-5">
          {/* KPI severidad */}
          <div className="grid grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => setSevFiltro(sevFiltro === 'risk' ? 'todas' : 'risk')}
              className={cn(
                'rounded-xl border-2 p-3 text-left transition-colors',
                sevFiltro === 'risk'
                  ? 'border-status-risk bg-status-risk-bg/60'
                  : 'border-status-risk/20 bg-status-risk-bg/30 hover:border-status-risk/40',
              )}
            >
              <div className="flex items-center gap-2">
                <ShieldAlert size={16} className="text-status-risk-fg" />
                <span className="text-status-risk-fg text-xs font-semibold uppercase tracking-wide">
                  Críticas
                </span>
              </div>
              <div className="text-status-risk-fg mt-1 text-2xl font-bold">{alertasRisk}</div>
            </button>
            <button
              type="button"
              onClick={() => setSevFiltro(sevFiltro === 'warn' ? 'todas' : 'warn')}
              className={cn(
                'rounded-xl border-2 p-3 text-left transition-colors',
                sevFiltro === 'warn'
                  ? 'border-status-warn bg-status-warn-bg/60'
                  : 'border-status-warn/20 bg-status-warn-bg/30 hover:border-status-warn/40',
              )}
            >
              <div className="flex items-center gap-2">
                <AlertTriangle size={16} className="text-status-warn-fg" />
                <span className="text-status-warn-fg text-xs font-semibold uppercase tracking-wide">
                  Advertencias
                </span>
              </div>
              <div className="text-status-warn-fg mt-1 text-2xl font-bold">{alertasWarn}</div>
            </button>
            <button
              type="button"
              onClick={() => setSevFiltro(sevFiltro === 'ok' ? 'todas' : 'ok')}
              className={cn(
                'rounded-xl border-2 p-3 text-left transition-colors',
                sevFiltro === 'ok'
                  ? 'border-status-ok bg-status-ok-bg/60'
                  : 'border-status-ok/20 bg-status-ok-bg/30 hover:border-status-ok/40',
              )}
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-status-ok-fg" />
                <span className="text-status-ok-fg text-xs font-semibold uppercase tracking-wide">
                  Informativas
                </span>
              </div>
              <div className="text-status-ok-fg mt-1 text-2xl font-bold">{alertasOk}</div>
            </button>
          </div>

          {sevFiltro !== 'todas' && (
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>
                Mostrando {alertasFiltradas.length} de {alertas.length} alertas
              </span>
              <button
                type="button"
                onClick={() => setSevFiltro('todas')}
                className="text-brand-700 hover:text-brand-900 font-medium"
              >
                Quitar filtro
              </button>
            </div>
          )}

          {alertasFiltradas.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="bg-status-ok-bg text-status-ok-fg mx-auto grid h-12 w-12 place-items-center rounded-full">
                  <CheckCircle2 size={24} />
                </div>
                <h3 className="mt-3 font-semibold text-slate-900">Sin alertas</h3>
                <p className="mt-1 text-sm text-slate-600">
                  Todo está bajo control en este filtro.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-3 lg:grid-cols-2">
              {alertasFiltradas.map((a) => {
                const sev = (a.severidad as Severidad) ?? 'ok';
                const colors = severidadColor[sev];
                return (
                  <Card key={a.id} className={cn(colors.bg, colors.border, 'border-2')}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <StatusPill
                          status={a.severidad}
                          label=" "
                          size="sm"
                          className="!px-1.5 !py-1.5"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className={cn('text-xs font-bold uppercase', colors.text)}>
                              {a.tipo}
                            </span>
                            {a.fechaLimite && (
                              <span className="text-xs text-slate-500">
                                · vence {fmtFecha(a.fechaLimite)}
                              </span>
                            )}
                          </div>
                          <div className="mt-1 font-semibold text-slate-900">{a.titulo}</div>
                          <p className="mt-1 text-sm text-slate-700">{a.descripcion}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
