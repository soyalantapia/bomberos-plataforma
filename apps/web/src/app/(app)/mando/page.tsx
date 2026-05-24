'use client';

import { Activity, AlertTriangle, ArrowRight, TrendingUp, Users, Flame } from 'lucide-react';
import Link from 'next/link';
import { useMemo } from 'react';

import { Button, Card, CardContent, CardHeader, CardTitle, Kpi, SectionHeader, StatusPill, Badge } from '@faro/ui';

import { SemaforoRendicion } from '../../../components/rendicion/semaforo-rendicion';
import { useFaroStore, selectCuartelActivo, selectRendicionActual } from '../../../store/use-faro-store';
import { calcularComputoMensual } from '../../../lib/utils/computo';
import { fmtFecha, fmtHora, fmtMesPeriodo, mesActual } from '../../../lib/utils/date';
import { tipoServicioLabel } from '../../../lib/utils/tipo-servicio';

export default function MandoDashboard() {
  const cuartel = useFaroStore(selectCuartelActivo);
  const rendicion = useFaroStore(selectRendicionActual);
  const allAlertas = useFaroStore((s) => s.alertas);
  const allServicios = useFaroStore((s) => s.servicios);
  const allAsistencias = useFaroStore((s) => s.asistencias);
  const personas = useFaroStore((s) => s.personas);

  const alertas = useMemo(() => allAlertas.filter((a) => a.cuartelId === cuartel?.id), [allAlertas, cuartel?.id]);
  const servicios = useMemo(() => allServicios.filter((s) => s.cuartelId === cuartel?.id), [allServicios, cuartel?.id]);
  const computo = useMemo(() => cuartel ? calcularComputoMensual(allAsistencias, cuartel.id, '2026-05') : [], [allAsistencias, cuartel]);

  const personasActivas = personas.filter((p) => p.cuartelId === cuartel?.id && p.estado === 'activo').length;
  const horasMes = computo.reduce((acc, c) => acc + c.total, 0);
  const serviciosMes = servicios.length;
  const pendientes = servicios.filter((s) => s.estado === 'pendiente_validacion').length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <SectionHeader
        title="Dashboard del cuartel"
        description={`${cuartel?.nombre} · ${fmtMesPeriodo(mesActual())}`}
        actions={
          <Link href="/mando/rendicion">
            <Button>Ver rendición <ArrowRight size={16} /></Button>
          </Link>
        }
      />

      <Card className="bg-gradient-to-br from-white to-slate-50">
        <CardContent className="p-5 sm:p-6 pt-5">
          <div className="flex flex-col sm:flex-row gap-5 items-center sm:items-start">
            <SemaforoRendicion rendicion={rendicion} />
            <div className="flex-1 min-w-0 text-center sm:text-left">
              <div className="text-xs uppercase tracking-wide text-slate-500 font-semibold mb-1">Rendición al Fondo</div>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">{fmtMesPeriodo(rendicion?.periodo ?? mesActual())}</h2>
              <p className="text-slate-600 mt-1">
                {rendicion?.estado === 'presentada'
                  ? 'Ya está presentada al Fondo. ¡Excelente!'
                  : `Faltan ${rendicion?.requisitos.filter((r) => !r.completo).length ?? 0} ítems para estar lista.`}
              </p>
              <div className="flex flex-wrap gap-2 justify-center sm:justify-start mt-3">
                <Link href="/mando/rendicion">
                  <Button>Resolver pendientes <ArrowRight size={16} /></Button>
                </Link>
                <Link href="/mando/computo">
                  <Button intent="secondary">Ver cómputo</Button>
                </Link>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Kpi label="Cumplimiento" value={`${cuartel?.porcentajeRendicion ?? 0}%`} hint="del mes" icon={<TrendingUp size={18} />}
          intent={cuartel?.cumplimiento === 'ok' ? 'ok' : cuartel?.cumplimiento === 'warn' ? 'warn' : 'risk'} />
        <Kpi label="Servicios" value={serviciosMes} hint={pendientes > 0 ? `${pendientes} a validar` : 'validados'} icon={<Flame size={18} />} intent="brand" />
        <Kpi label="Horas operativas" value={horasMes} hint="del mes" intent="neutral" />
        <Kpi label="Personal" value={personasActivas} hint="activos" icon={<Users size={18} />} intent="neutral" />
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle size={18} className="text-status-warn-fg" />
              Alertas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {alertas.map((a) => (
                <li key={a.id} className="flex items-start gap-2 p-3 rounded-lg bg-slate-50">
                  <StatusPill status={a.severidad} label=" " size="sm" className="!px-1.5 !py-1.5" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-slate-900">{a.titulo}</div>
                    <div className="text-xs text-slate-600 mt-0.5">{a.descripcion}</div>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity size={18} className="text-status-ok animate-pulse" />
              Actividad en vivo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="divide-y divide-slate-100">
              {servicios.slice(0, 5).map((s) => (
                <li key={s.id} className="py-3 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-fire-100 text-fire-700 grid place-items-center font-bold text-xs uppercase">
                    {s.tipo[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-slate-900 truncate">{tipoServicioLabel[s.tipo]} · {s.direccion}</div>
                    <div className="text-xs text-slate-600">{fmtFecha(s.horaSalida)} · {fmtHora(s.horaSalida)} → {fmtHora(s.horaRegreso)} · {s.dotacionIds.length} personas</div>
                  </div>
                  {s.estado === 'pendiente_validacion' ? (
                    <Badge intent="warn">Sin validar</Badge>
                  ) : (
                    <Badge intent="ok">Validado</Badge>
                  )}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
