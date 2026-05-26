'use client';

import {
  CalendarCheck,
  CheckCircle2,
  ClipboardList,
  Clock,
  Download,
  RefreshCw,
  Send,
  XCircle,
} from 'lucide-react';
import { useState } from 'react';

import { Avatar, Badge, Card, CardContent, Kpi, cn, useToast } from '@faro/ui';

import { PageHero } from '../../../../components/shared/page-hero';

type Estado = 'pendiente' | 'aprobada' | 'rechazada';
type Tipo = 'medica' | 'academica' | 'personal';

interface Lic {
  id: string;
  persona: string;
  legajo: string;
  tipo: Tipo;
  detalle: string;
  desde: string;
  dias: number;
  estado: Estado;
  resueltaPor?: string;
  externa?: boolean;
}

const seed: Lic[] = [
  {
    id: 'l1',
    persona: 'Iván Quiroga',
    legajo: '0269',
    tipo: 'medica',
    detalle: 'Cirugía menor',
    desde: '15/5/2026',
    dias: 7,
    estado: 'pendiente',
  },
  {
    id: 'l2',
    persona: 'Camila Torres',
    legajo: '0276',
    tipo: 'academica',
    detalle: 'Examen final',
    desde: '20/5/2026',
    dias: 1,
    estado: 'pendiente',
  },
  {
    id: 'l3',
    persona: 'Florencia Salinas',
    legajo: '0212',
    tipo: 'academica',
    detalle: 'Curso de gestión',
    desde: '8/5/2026',
    dias: 2,
    estado: 'aprobada',
    resueltaPor: 'Roberto G.',
  },
  {
    id: 'l4',
    persona: 'Bruno Acosta',
    legajo: '0301',
    tipo: 'medica',
    detalle: 'Lumbalgia',
    desde: '2/5/2026',
    dias: 4,
    estado: 'aprobada',
    resueltaPor: 'Mariana P.',
    externa: true,
  },
  {
    id: 'l5',
    persona: 'Sofía López',
    legajo: '0158',
    tipo: 'personal',
    detalle: 'Trámite familiar',
    desde: '12/5/2026',
    dias: 1,
    estado: 'aprobada',
    resueltaPor: 'Mariana P.',
  },
];

const TIPO_STYLE: Record<Tipo, { color: string; label: string }> = {
  medica: { color: 'bg-status-risk', label: 'Médica' },
  academica: { color: 'bg-brand-600', label: 'Académica' },
  personal: { color: 'bg-status-warn', label: 'Personal' },
};

const COL_STYLE = {
  pendiente: {
    label: 'Esperan resolución',
    icon: <Clock size={16} />,
    bg: 'bg-status-warn-bg/40',
    ring: 'ring-status-warn/40',
    accent: 'text-status-warn-fg',
  },
  aprobada: {
    label: 'Otorgadas',
    icon: <CheckCircle2 size={16} />,
    bg: 'bg-status-ok-bg/40',
    ring: 'ring-status-ok/40',
    accent: 'text-status-ok-fg',
  },
  rechazada: {
    label: 'Rechazadas',
    icon: <XCircle size={16} />,
    bg: 'bg-slate-100',
    ring: 'ring-slate-300',
    accent: 'text-slate-600',
  },
} as const;

export default function LicenciasNovedades() {
  const [items, setItems] = useState<Lic[]>(seed);
  const toast = useToast();
  const [vista, setVista] = useState<'flujo' | 'importacion'>('flujo');

  function decidir(id: string, e: Estado) {
    setItems((arr) =>
      arr.map((x) => (x.id === id ? { ...x, estado: e, resueltaPor: 'Mariana P.' } : x)),
    );
    toast.push({
      kind: e === 'aprobada' ? 'success' : 'info',
      title: e === 'aprobada' ? 'Licencia otorgada' : 'Licencia rechazada',
      description: 'Quedó en el flujo de Aprobaciones del Mando.',
    });
  }

  const pendientes = items.filter((s) => s.estado === 'pendiente');
  const aprobadas = items.filter((s) => s.estado === 'aprobada');
  const rechazadas = items.filter((s) => s.estado === 'rechazada');

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <PageHero
        objetivo="Administrativo · Licencias"
        titulo={
          pendientes.length > 0
            ? `${pendientes.length} solicitud${pendientes.length === 1 ? '' : 'es'} esperan resolución`
            : 'Sin pendientes'
        }
        descripcion="Recibís solicitudes, las pasás al Mando para que decida (doble check), y actualizás con Aquarii."
        icono={<CalendarCheck size={26} />}
        variant={pendientes.length > 0 ? 'default' : 'success'}
        meta={
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Kpi
              label="Pendientes"
              value={pendientes.length}
              intent={pendientes.length > 0 ? 'warn' : 'ok'}
              icon={<ClipboardList size={16} />}
            />
            <Kpi label="Otorgadas mes" value={aprobadas.length} intent="ok" />
            <Kpi label="Rechazadas" value={rechazadas.length} intent="neutral" />
            <Kpi
              label="Actualización Aquarii"
              value="21/5 03:00"
              hint="OK"
              intent="brand"
              icon={<RefreshCw size={16} />}
            />
          </div>
        }
      />

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setVista('flujo')}
          className={cn(
            'inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-sm font-medium transition-colors',
            vista === 'flujo'
              ? 'bg-brand-600 text-white'
              : 'bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50',
          )}
        >
          <ClipboardList size={14} /> Flujo de licencias
        </button>
        <button
          type="button"
          onClick={() => setVista('importacion')}
          className={cn(
            'inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-sm font-medium transition-colors',
            vista === 'importacion'
              ? 'bg-brand-600 text-white'
              : 'bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50',
          )}
        >
          <RefreshCw size={14} /> Importar desde Aquarii
        </button>
      </div>

      {vista === 'flujo' && (
        <div className="-mx-4 grid snap-x snap-mandatory auto-cols-[85%] grid-flow-col gap-3 overflow-x-auto px-4 pb-2 sm:auto-cols-[60%] lg:mx-0 lg:auto-cols-auto lg:grid-flow-row lg:grid-cols-3 lg:gap-4 lg:px-0 lg:pb-0">
          {(['pendiente', 'aprobada', 'rechazada'] as const).map((estado) => {
            const col = COL_STYLE[estado];
            const lista = items.filter((s) => s.estado === estado);
            return (
              <div
                key={estado}
                className={cn('snap-start rounded-2xl p-3 ring-1 lg:snap-none', col.bg, col.ring)}
              >
                <div
                  className={cn('mb-3 flex items-center gap-2 px-1 text-sm font-bold', col.accent)}
                >
                  {col.icon}
                  <span>{col.label}</span>
                  <span className="ml-auto rounded-full bg-white/80 px-2 py-0.5 text-xs tabular-nums text-slate-700">
                    {lista.length}
                  </span>
                </div>

                <div className="space-y-2">
                  {lista.length === 0 && (
                    <div className="rounded-xl border border-dashed border-slate-300 bg-white/50 p-6 text-center text-xs text-slate-500">
                      Sin items en esta columna.
                    </div>
                  )}

                  {lista.map((s) => (
                    <Card key={s.id} className="overflow-hidden bg-white">
                      <CardContent className="p-3">
                        <div className="mb-2 flex items-center gap-2">
                          <span
                            className={cn(
                              'inline-flex h-5 items-center rounded px-1.5 text-[10px] font-semibold uppercase text-white',
                              TIPO_STYLE[s.tipo].color,
                            )}
                          >
                            {TIPO_STYLE[s.tipo].label}
                          </span>
                          <span className="text-[11px] font-bold tabular-nums text-slate-700">
                            {s.dias} {s.dias === 1 ? 'día' : 'días'}
                          </span>
                          {s.externa && (
                            <span className="inline-flex items-center gap-0.5 rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] text-slate-600">
                              Aquarii
                            </span>
                          )}
                        </div>

                        <div className="flex items-start gap-2.5">
                          <Avatar name={s.persona} size={32} />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-baseline gap-2">
                              <span className="truncate font-semibold text-slate-900">
                                {s.persona}
                              </span>
                              <span className="shrink-0 font-mono text-[11px] text-slate-500">
                                {s.legajo}
                              </span>
                            </div>
                            <div className="mt-0.5 text-xs text-slate-600">{s.detalle}</div>
                            <div className="mt-1 inline-flex items-center gap-1 text-[11px] text-slate-500">
                              <CalendarCheck size={10} /> Desde {s.desde}
                            </div>
                          </div>
                        </div>

                        {estado === 'pendiente' && (
                          <div className="mt-3 flex gap-2 border-t border-slate-100 pt-2">
                            <button
                              type="button"
                              onClick={() => decidir(s.id, 'aprobada')}
                              className="bg-status-ok flex-1 rounded-md px-2.5 py-1.5 text-xs font-semibold text-white hover:opacity-90"
                            >
                              <CheckCircle2 size={12} className="mr-1 inline" /> Otorgar
                            </button>
                            <button
                              type="button"
                              onClick={() => decidir(s.id, 'rechazada')}
                              className="rounded-md bg-slate-100 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200"
                            >
                              <XCircle size={12} className="mr-1 inline" /> No
                            </button>
                          </div>
                        )}

                        {s.resueltaPor && estado !== 'pendiente' && (
                          <div className="mt-2 flex items-center gap-1 text-[10px] text-slate-500">
                            <CheckCircle2 size={9} /> Resuelta por {s.resueltaPor}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {vista === 'importacion' && (
        <Card>
          <CardContent className="p-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-bold text-slate-900">Actualización con Aquarii</h3>
              <Badge intent="ok">Conectado</Badge>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl bg-slate-50 p-4">
                <div className="text-xs text-slate-500">Última actualización</div>
                <div className="mt-1 text-xl font-bold text-slate-900">21/5 03:00</div>
                <div className="mt-1 text-[11px] text-slate-500">automática diaria</div>
              </div>
              <div className="bg-status-ok-bg/30 rounded-xl p-4">
                <div className="text-xs text-slate-500">Novedades importadas</div>
                <div className="text-status-ok-fg mt-1 text-xl font-bold">12</div>
                <div className="mt-1 text-[11px] text-slate-500">en mayo</div>
              </div>
              <div className="bg-brand-50 rounded-xl p-4">
                <div className="text-xs text-slate-500">Próxima actualización</div>
                <div className="text-brand-700 mt-1 text-xl font-bold">Hoy 23:00</div>
                <div className="mt-1 text-[11px] text-slate-500">automática</div>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => toast.push({ kind: 'info', title: 'Actualizando con Aquarii...' })}
                className="bg-brand-600 hover:bg-brand-700 inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-semibold text-white"
              >
                <RefreshCw size={14} /> Actualizar ahora
              </button>
              <button
                type="button"
                onClick={() => toast.push({ kind: 'info', title: 'Descargando registro' })}
                className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:border-slate-300"
              >
                <Download size={14} /> Registro de importaciones
              </button>
              <button
                type="button"
                onClick={() =>
                  toast.push({ kind: 'info', title: 'Enviando comentario al equipo Aquarii' })
                }
                className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:border-slate-300"
              >
                <Send size={14} /> Reportar problema
              </button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
