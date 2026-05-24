'use client';

import { Calendar, Check, ClipboardCheck, ShieldAlert, ShieldCheck, X } from 'lucide-react';
import { useState } from 'react';

import { Avatar, Badge, Button, Card, CardContent, Kpi, cn, useToast } from '@faro/ui';

import { PageHero } from '../../../../components/shared/page-hero';

interface Solicitud {
  id: string;
  persona: string;
  legajo: string;
  tipo: string;
  detalle: string;
  fecha: string;
  prioridad: 'alta' | 'normal' | 'baja';
  estado: 'pendiente' | 'aprobada' | 'rechazada';
  categoria: 'licencia' | 'ascenso' | 'sancion';
}

const seed: Solicitud[] = [
  {
    id: 'l-1',
    persona: 'Iván Quiroga',
    legajo: '0269',
    tipo: 'Licencia médica',
    detalle: 'Cirugía menor · 7 días desde 15/5',
    fecha: '15/5/2026',
    prioridad: 'alta',
    estado: 'pendiente',
    categoria: 'licencia',
  },
  {
    id: 'l-2',
    persona: 'Camila Torres',
    legajo: '0276',
    tipo: 'Licencia académica',
    detalle: 'Examen final · 1 día (20/5)',
    fecha: '14/5/2026',
    prioridad: 'normal',
    estado: 'pendiente',
    categoria: 'licencia',
  },
  {
    id: 'a-1',
    persona: 'Carolina Sosa',
    legajo: '0078',
    tipo: 'Pliego de ascenso · a Sargento',
    detalle: 'Cumple antigüedad y cursos · Aval del Comandante',
    fecha: '10/5/2026',
    prioridad: 'normal',
    estado: 'pendiente',
    categoria: 'ascenso',
  },
  {
    id: 'la-1',
    persona: 'Florencia Salinas',
    legajo: '0212',
    tipo: 'Licencia académica',
    detalle: 'Aprobada 8/5 por R. González',
    fecha: '5/5/2026',
    prioridad: 'normal',
    estado: 'aprobada',
    categoria: 'licencia',
  },
];

const COL_STYLE = {
  pendiente: {
    label: 'En tu mesa',
    icon: <ClipboardCheck size={16} />,
    bg: 'bg-status-warn-bg/40',
    ring: 'ring-status-warn/40',
    accent: 'text-status-warn-fg',
  },
  aprobada: {
    label: 'Aprobadas',
    icon: <ShieldCheck size={16} />,
    bg: 'bg-status-ok-bg/40',
    ring: 'ring-status-ok/40',
    accent: 'text-status-ok-fg',
  },
  rechazada: {
    label: 'Rechazadas',
    icon: <ShieldAlert size={16} />,
    bg: 'bg-slate-100',
    ring: 'ring-slate-300',
    accent: 'text-slate-600',
  },
};

const CAT_COLOR: Record<Solicitud['categoria'], string> = {
  licencia: 'bg-status-warn text-white',
  ascenso: 'bg-brand-600 text-white',
  sancion: 'bg-status-risk text-white',
};

export default function AprobacionesPage() {
  const [items, setItems] = useState<Solicitud[]>(seed);
  const toast = useToast();

  function decidir(id: string, accion: 'aprobar' | 'rechazar') {
    setItems((arr) =>
      arr.map((s) =>
        s.id === id ? { ...s, estado: accion === 'aprobar' ? 'aprobada' : 'rechazada' } : s,
      ),
    );
    toast.push({
      kind: accion === 'aprobar' ? 'success' : 'info',
      title: accion === 'aprobar' ? 'Aprobada' : 'Rechazada',
      description: 'Quedó en el audit log con tu firma.',
    });
  }

  const pendientes = items.filter((s) => s.estado === 'pendiente');
  const aprobadas = items.filter((s) => s.estado === 'aprobada');
  const rechazadas = items.filter((s) => s.estado === 'rechazada');
  const alta = pendientes.filter((s) => s.prioridad === 'alta').length;

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <PageHero
        objetivo="Vista Mando · Aprobaciones"
        titulo={
          pendientes.length === 0
            ? 'Nada para decidir hoy'
            : `${pendientes.length} ${pendientes.length === 1 ? 'decisión espera' : 'decisiones esperan'} tu firma`
        }
        descripcion="Cada decisión queda firmada en audit log con tu nombre, fecha y motivo. Doble check obligatorio en sanciones."
        icono={<ClipboardCheck size={26} />}
        variant={alta > 0 ? 'critical' : pendientes.length === 0 ? 'success' : 'default'}
        meta={
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Kpi
              label="En tu mesa"
              value={pendientes.length}
              hint="esperan"
              intent={pendientes.length > 0 ? 'warn' : 'ok'}
            />
            <Kpi
              label="Alta prioridad"
              value={alta}
              hint="médicas/urgentes"
              intent={alta > 0 ? 'risk' : 'ok'}
            />
            <Kpi label="Aprobadas mes" value={aprobadas.length} intent="ok" />
            <Kpi label="Tiempo medio" value={14} hint="min por decisión" intent="brand" />
          </div>
        }
      />

      <div className="-mx-4 grid snap-x snap-mandatory auto-cols-[85%] grid-flow-col gap-3 overflow-x-auto px-4 pb-2 sm:auto-cols-[60%] lg:mx-0 lg:auto-cols-auto lg:grid-flow-row lg:grid-cols-3 lg:gap-4 lg:px-0 lg:pb-0">
        {(['pendiente', 'aprobada', 'rechazada'] as const).map((estado) => {
          const col = COL_STYLE[estado];
          const lista =
            estado === 'pendiente' ? pendientes : estado === 'aprobada' ? aprobadas : rechazadas;
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
                    {estado === 'pendiente' && '🎉 Sin pendientes — todo decidido.'}
                    {estado === 'aprobada' && 'Sin aprobadas este mes.'}
                    {estado === 'rechazada' && 'Sin rechazos. Bien.'}
                  </div>
                )}

                {lista.map((s) => (
                  <Card key={s.id} className="overflow-hidden bg-white">
                    <CardContent className="p-3">
                      <div className="flex items-start gap-2.5">
                        <Avatar name={s.persona} size={36} />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-baseline gap-2">
                            <span className="truncate font-semibold text-slate-900">
                              {s.persona}
                            </span>
                            <span className="shrink-0 font-mono text-[11px] text-slate-500">
                              {s.legajo}
                            </span>
                          </div>
                          <div className="mt-0.5 flex items-center gap-1.5">
                            <span
                              className={cn(
                                'inline-flex h-5 items-center rounded px-1.5 text-[10px] font-semibold uppercase',
                                CAT_COLOR[s.categoria],
                              )}
                            >
                              {s.categoria}
                            </span>
                            {s.prioridad === 'alta' && estado === 'pendiente' && (
                              <span className="bg-status-risk-bg text-status-risk-fg inline-flex h-5 items-center rounded px-1.5 text-[10px] font-semibold uppercase">
                                Urgente
                              </span>
                            )}
                          </div>
                          <div className="mt-1.5 text-sm text-slate-700">{s.tipo}</div>
                          <div className="mt-0.5 text-xs text-slate-600">{s.detalle}</div>
                          <div className="mt-1.5 flex items-center gap-1 text-[11px] text-slate-500">
                            <Calendar size={10} /> Presentada {s.fecha}
                          </div>
                        </div>
                      </div>

                      {estado === 'pendiente' && (
                        <div className="mt-3 flex gap-2 border-t border-slate-100 pt-3">
                          <Button
                            intent="success"
                            size="sm"
                            fullWidth
                            onClick={() => decidir(s.id, 'aprobar')}
                          >
                            <Check size={14} /> Aprobar
                          </Button>
                          <Button
                            intent="ghost"
                            size="sm"
                            onClick={() => decidir(s.id, 'rechazar')}
                          >
                            <X size={14} />
                          </Button>
                        </div>
                      )}

                      {estado !== 'pendiente' && (
                        <div className="mt-2 flex items-center gap-1.5 text-[11px] text-slate-500">
                          <ShieldCheck size={10} className={col.accent} /> Firmado en audit log
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

      <Card className="border-slate-200 bg-slate-50">
        <CardContent className="flex items-start gap-3 p-4 text-sm text-slate-700">
          <Badge intent="brand">Doble validación</Badge>
          <div>
            Toda aprobación queda con <strong>tu nombre</strong>, fecha exacta y motivo opcional. Si
            rechazás, podés escribir el motivo y la persona lo recibe por notificación. Las
            sanciones requieren además aprobación del Comandante.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
