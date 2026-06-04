'use client';

import { CalendarDays, Heart, Plus, Sparkles, Truck, Users2, Wrench } from 'lucide-react';
import { useMemo, useState } from 'react';

import { Badge, Button, Card, CardContent, Kpi, cn, useToast } from '@faro/ui';

import { PageHero } from '../../../../components/shared/page-hero';
import { demoToday } from '../../../../lib/utils/demo-today';

interface Evento {
  fecha: string;
  titulo: string;
  tipo: 'institucional' | 'interna' | 'capacitacion' | 'mantenimiento' | 'salud';
  hora?: string;
}

const eventos: Evento[] = [
  { fecha: '2026-05-25', hora: '10:00', titulo: 'Donación de sangre', tipo: 'salud' },
  { fecha: '2026-05-28', hora: '18:00', titulo: 'Reunión de jefatura', tipo: 'interna' },
  {
    fecha: '2026-06-02',
    hora: '09:00',
    titulo: 'Práctica de rescate vehicular',
    tipo: 'capacitacion',
  },
  { fecha: '2026-06-05', hora: '19:00', titulo: 'Aniversario del cuartel', tipo: 'institucional' },
  { fecha: '2026-06-08', hora: '08:00', titulo: 'VTV Móvil BV-5', tipo: 'mantenimiento' },
  {
    fecha: '2026-06-12',
    hora: '17:00',
    titulo: 'Acto institucional Federación',
    tipo: 'institucional',
  },
  {
    fecha: '2026-06-15',
    hora: '14:00',
    titulo: 'Inicio curso primeros auxilios',
    tipo: 'capacitacion',
  },
];

const TIPO_STYLE: Record<Evento['tipo'], { color: string; label: string; icon: React.ReactNode }> =
  {
    institucional: {
      color: 'bg-brand-600 text-white',
      label: 'Institucional',
      icon: <Users2 size={12} />,
    },
    interna: { color: 'bg-slate-500 text-white', label: 'Interna', icon: <Users2 size={12} /> },
    capacitacion: {
      color: 'bg-status-ok text-white',
      label: 'Capacitación',
      icon: <Sparkles size={12} />,
    },
    mantenimiento: {
      color: 'bg-status-warn text-white',
      label: 'Mantenimiento',
      icon: <Wrench size={12} />,
    },
    salud: { color: 'bg-status-risk text-white', label: 'Salud', icon: <Heart size={12} /> },
  };

function startOfMonth(y: number, m: number) {
  return new Date(y, m, 1);
}

function daysInMonth(y: number, m: number) {
  return new Date(y, m + 1, 0).getDate();
}

export default function AgendaPage() {
  const today = demoToday();
  const [refYear, setRefYear] = useState(today.getFullYear());
  const [refMonth, setRefMonth] = useState(today.getMonth());
  const toast = useToast();

  const eventosPorFecha = useMemo(() => {
    const m = new Map<string, Evento[]>();
    for (const e of eventos) {
      const arr = m.get(e.fecha) ?? [];
      arr.push(e);
      m.set(e.fecha, arr);
    }
    return m;
  }, []);

  const inicio = startOfMonth(refYear, refMonth);
  const offset = (inicio.getDay() + 6) % 7;
  const totalDias = daysInMonth(refYear, refMonth);
  const cells = Array.from({ length: offset + totalDias }).map((_, i) => {
    if (i < offset) return null;
    return i - offset + 1;
  });
  while (cells.length % 7 !== 0) cells.push(null);

  const mesLabel = new Date(refYear, refMonth, 1).toLocaleDateString('es-AR', {
    month: 'long',
    year: 'numeric',
  });

  function prev() {
    if (refMonth === 0) {
      setRefYear((y) => y - 1);
      setRefMonth(11);
    } else setRefMonth((m) => m - 1);
  }
  function next() {
    if (refMonth === 11) {
      setRefYear((y) => y + 1);
      setRefMonth(0);
    } else setRefMonth((m) => m + 1);
  }

  const proximos = [...eventos]
    .filter((e) => new Date(e.fecha) >= new Date(today.toDateString()))
    .sort((a, b) => a.fecha.localeCompare(b.fecha))
    .slice(0, 5);

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <PageHero
        objetivo="Administrativo · Agenda"
        titulo="Calendario institucional del cuartel"
        descripcion="Eventos, prácticas, mantenimientos y actos. Lo que falta no se planifica — todo se ve."
        icono={<CalendarDays size={26} />}
        meta={
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Kpi label="Próximos 30d" value={proximos.length} hint="eventos" intent="brand" />
            <Kpi
              label="Mantenimientos"
              value={eventos.filter((e) => e.tipo === 'mantenimiento').length}
              hint="programados"
              intent="warn"
              icon={<Wrench size={16} />}
            />
            <Kpi
              label="Capacitaciones"
              value={eventos.filter((e) => e.tipo === 'capacitacion').length}
              intent="ok"
            />
            <Kpi
              label="VTV próximas"
              value={eventos.filter((e) => e.titulo.includes('VTV')).length}
              hint="ojo plazos"
              intent="warn"
              icon={<Truck size={16} />}
            />
          </div>
        }
        acciones={
          <Button
            intent="primary"
            size="md"
            onClick={() =>
              toast.push({
                kind: 'info',
                title: 'Nuevo evento',
                description: 'Elegí el día en el calendario.',
              })
            }
          >
            <Plus size={16} /> Nuevo evento
          </Button>
        }
      />

      <Card>
        <CardContent className="p-4 sm:p-5">
          <div className="mb-4 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={prev}
              className="rounded-md border border-slate-200 px-2.5 py-1.5 text-sm hover:bg-slate-50"
            >
              ←
            </button>
            <h2 className="text-base font-bold capitalize text-slate-900 sm:text-lg">{mesLabel}</h2>
            <button
              type="button"
              onClick={next}
              className="rounded-md border border-slate-200 px-2.5 py-1.5 text-sm hover:bg-slate-50"
            >
              →
            </button>
          </div>

          <div className="mb-1 grid grid-cols-7 gap-px text-center text-[11px] font-semibold uppercase text-slate-500">
            {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((d) => (
              <div key={d}>{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {cells.map((d, idx) => {
              if (d === null) return <div key={idx} />;
              const fecha = `${refYear}-${String(refMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
              const evs = eventosPorFecha.get(fecha) ?? [];
              const isToday =
                refYear === today.getFullYear() &&
                refMonth === today.getMonth() &&
                d === today.getDate();
              return (
                <div
                  key={idx}
                  className={cn(
                    'min-h-[78px] rounded-md border p-1.5 text-left transition-colors',
                    isToday
                      ? 'border-brand-600 bg-brand-50'
                      : 'border-slate-100 hover:border-slate-200',
                  )}
                >
                  <div
                    className={cn(
                      'text-xs font-semibold',
                      isToday ? 'text-brand-700' : 'text-slate-700',
                    )}
                  >
                    {d}
                  </div>
                  {evs.slice(0, 2).map((e, i) => {
                    const st = TIPO_STYLE[e.tipo];
                    return (
                      <div
                        key={i}
                        className={cn(
                          'mt-1 truncate rounded px-1 py-0.5 text-[11px] font-medium',
                          st.color,
                        )}
                        title={e.titulo}
                      >
                        {e.titulo}
                      </div>
                    );
                  })}
                  {evs.length > 2 && (
                    <div className="mt-0.5 text-[11px] text-slate-500">+{evs.length - 2}</div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3 text-xs">
            {(Object.keys(TIPO_STYLE) as Evento['tipo'][]).map((t) => {
              const st = TIPO_STYLE[t];
              return (
                <span key={t} className="inline-flex items-center gap-1.5">
                  <span className={cn('h-2.5 w-2.5 rounded-sm', st.color)} />
                  {st.label}
                </span>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-5">
          <h2 className="mb-3 text-lg font-bold text-slate-900">Próximos eventos</h2>
          <ul className="divide-y divide-slate-100">
            {proximos.map((e, idx) => {
              const st = TIPO_STYLE[e.tipo];
              const d = new Date(e.fecha);
              return (
                <li key={idx} className="flex items-center gap-3 py-3">
                  <div
                    className={cn(
                      'grid h-12 w-12 shrink-0 place-items-center rounded-lg text-white',
                      st.color,
                    )}
                  >
                    <div className="text-xs leading-none">
                      {d.toLocaleDateString('es-AR', { month: 'short' })}
                    </div>
                    <div className="mt-0.5 text-lg font-bold leading-none">{d.getDate()}</div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-slate-900">{e.titulo}</div>
                    <div className="mt-0.5 flex items-center gap-2 text-xs text-slate-500">
                      <span className="inline-flex items-center gap-1">
                        {st.icon} {st.label}
                      </span>
                      {e.hora && <span>· {e.hora}</span>}
                    </div>
                  </div>
                  <Badge intent="neutral">{e.hora}</Badge>
                </li>
              );
            })}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
