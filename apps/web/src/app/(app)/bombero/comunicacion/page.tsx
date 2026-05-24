'use client';

import {
  Heart,
  Megaphone,
  MessageCircle,
  Send,
  ShieldCheck,
  Sparkles,
  Users2,
  Wrench,
} from 'lucide-react';
import { useState } from 'react';

import { Avatar, Badge, Card, Kpi, cn, useToast } from '@faro/ui';

import { PageHero } from '../../../../components/shared/page-hero';

interface Aviso {
  id: string;
  emoji: string;
  titulo: string;
  cuerpo: string;
  cuando: string;
  prioridad: 'alta' | 'normal';
  icono: React.ReactNode;
  color: string;
}

interface Chat {
  id: string;
  nombre: string;
  ultimoMensaje: string;
  autor: string;
  cuando: string;
  sinLeer: number;
  tipo: 'cuartel' | 'seccion' | 'cadetes' | 'rescate';
}

const avisos: Aviso[] = [
  {
    id: 'av1',
    emoji: '📋',
    titulo: 'Curso de rescate vehicular',
    cuerpo: 'Inscripción abierta hasta el 30/5. 16 cupos, ya hay 12 anotados.',
    cuando: 'Hoy 14:30',
    prioridad: 'alta',
    icono: <Sparkles size={16} />,
    color: 'from-brand-500 to-brand-700',
  },
  {
    id: 'av2',
    emoji: '🔧',
    titulo: 'Mantenimiento Móvil BV-5',
    cuerpo: 'Mañana de 8 a 12 hs. El móvil queda fuera de servicio. Coordinen guardias.',
    cuando: 'Ayer 18:00',
    prioridad: 'normal',
    icono: <Wrench size={16} />,
    color: 'from-status-warn to-orange-600',
  },
  {
    id: 'av3',
    emoji: '🩸',
    titulo: 'Donación de sangre',
    cuerpo: 'Sábado 25/5 · Hospital Municipal · 9 a 13 hs. Llevá DNI.',
    cuando: 'Hace 2 días',
    prioridad: 'normal',
    icono: <Heart size={16} />,
    color: 'from-status-risk to-pink-600',
  },
];

const chats: Chat[] = [
  {
    id: 'ch1',
    nombre: 'Cuartel general',
    ultimoMensaje: 'Mañana 7am en Pueyrredón. Llevar EPP completo.',
    autor: 'Mariana Pereyra',
    cuando: '14:32',
    sinLeer: 3,
    tipo: 'cuartel',
  },
  {
    id: 'ch2',
    nombre: 'Sección Operativa',
    ultimoMensaje: 'Bien hecho con lo del incendio de Alvear, dotación impecable.',
    autor: 'Roberto González',
    cuando: 'Ayer',
    sinLeer: 0,
    tipo: 'seccion',
  },
  {
    id: 'ch3',
    nombre: 'Cadetes 2026',
    ultimoMensaje: 'Próxima reunión sábado a las 17hs. Confirmen asistencia.',
    autor: 'Florencia Salinas',
    cuando: 'Hace 2 días',
    sinLeer: 1,
    tipo: 'cadetes',
  },
  {
    id: 'ch4',
    nombre: 'Equipo Rescate',
    ultimoMensaje: 'Llegaron las pinzas nuevas, las probamos el viernes.',
    autor: 'Carolina Sosa',
    cuando: 'Hace 3 días',
    sinLeer: 0,
    tipo: 'rescate',
  },
];

const CHAT_STYLE: Record<Chat['tipo'], { color: string; icono: React.ReactNode }> = {
  cuartel: { color: 'bg-brand-600', icono: <Users2 size={18} /> },
  seccion: { color: 'bg-status-warn', icono: <ShieldCheck size={18} /> },
  cadetes: { color: 'bg-status-ok', icono: <Sparkles size={18} /> },
  rescate: { color: 'bg-status-risk', icono: <Heart size={18} /> },
};

export default function ComunicacionPage() {
  const toast = useToast();
  const [seleccionado, setSeleccionado] = useState<string>('ch1');
  const [draft, setDraft] = useState('');

  const chatActivo = chats.find((c) => c.id === seleccionado)!;
  const totalSinLeer = chats.reduce((a, c) => a + c.sinLeer, 0);

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <PageHero
        objetivo="Comunicación"
        titulo={
          totalSinLeer > 0
            ? `${totalSinLeer} mensaje${totalSinLeer === 1 ? '' : 's'} sin leer`
            : 'Todo al día'
        }
        descripcion="Avisos del cuartel arriba, chats por sección abajo. Sin WhatsApp informal."
        icono={<MessageCircle size={26} />}
        meta={
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            <Kpi
              label="Avisos hoy"
              value={avisos.filter((a) => a.cuando.startsWith('Hoy')).length}
              intent="warn"
              icon={<Megaphone size={16} />}
            />
            <Kpi label="Sin leer" value={totalSinLeer} intent={totalSinLeer > 0 ? 'warn' : 'ok'} />
            <Kpi label="Chats activos" value={chats.length} intent="brand" />
            <Kpi label="Tu sección" value="Operativa" hint="14 personas" intent="neutral" />
          </div>
        }
      />

      <section>
        <h2 className="mb-3 flex items-center gap-2 text-base font-bold text-slate-900">
          <Megaphone size={18} className="text-status-warn" /> Avisos del cuartel
        </h2>
        <div className="-mx-1 flex snap-x snap-mandatory gap-3 overflow-x-auto px-1 pb-1">
          {avisos.map((a) => (
            <button
              key={a.id}
              type="button"
              onClick={() => toast.push({ kind: 'info', title: a.titulo, description: a.cuerpo })}
              className={cn(
                'relative min-w-[280px] flex-1 snap-start overflow-hidden rounded-2xl bg-gradient-to-br p-5 text-left text-white shadow-md transition-shadow hover:shadow-lg',
                a.color,
              )}
            >
              {a.prioridad === 'alta' && (
                <div className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-bold uppercase backdrop-blur">
                  ● En vivo
                </div>
              )}
              <div className="mb-3 flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-white/20 text-3xl backdrop-blur">
                  {a.emoji}
                </div>
                <div className="text-xs uppercase tracking-wide text-white/80">{a.cuando}</div>
              </div>
              <div className="text-lg font-bold leading-tight">{a.titulo}</div>
              <p className="mt-1.5 text-sm text-white/85">{a.cuerpo}</p>
              <div className="mt-4 inline-flex items-center gap-1 text-xs font-semibold">
                Ver más {a.icono}
              </div>
            </button>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 flex items-center gap-2 text-base font-bold text-slate-900">
          <MessageCircle size={18} className="text-brand-600" /> Tus chats
        </h2>

        <div className="grid gap-4 md:h-[480px] md:grid-cols-[280px_1fr]">
          <div className="space-y-1.5 overflow-y-auto md:pr-2">
            {chats.map((c) => {
              const st = CHAT_STYLE[c.tipo];
              const active = seleccionado === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSeleccionado(c.id)}
                  className={cn(
                    'w-full overflow-hidden rounded-xl border bg-white p-3 text-left transition-colors',
                    active
                      ? 'border-brand-300 bg-brand-50 ring-brand-200 ring-1'
                      : 'border-slate-200 hover:border-slate-300',
                  )}
                >
                  <div className="flex items-start gap-2.5">
                    <div
                      className={cn(
                        'grid h-9 w-9 shrink-0 place-items-center rounded-lg text-white',
                        st.color,
                      )}
                    >
                      {st.icono}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline gap-2">
                        <div className="truncate font-semibold text-slate-900">{c.nombre}</div>
                        <div className="shrink-0 text-[10px] text-slate-500">{c.cuando}</div>
                      </div>
                      <div className="mt-0.5 line-clamp-1 text-xs text-slate-600">
                        <span className="font-medium">{c.autor}:</span> {c.ultimoMensaje}
                      </div>
                    </div>
                    {c.sinLeer > 0 && (
                      <span className="bg-brand-600 shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-bold tabular-nums text-white">
                        {c.sinLeer}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          <Card className="flex flex-col md:h-full">
            <div className="flex items-center gap-3 border-b border-slate-100 p-4">
              <div
                className={cn(
                  'grid h-10 w-10 place-items-center rounded-xl text-white',
                  CHAT_STYLE[chatActivo.tipo].color,
                )}
              >
                {CHAT_STYLE[chatActivo.tipo].icono}
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-bold text-slate-900">{chatActivo.nombre}</div>
                <div className="text-xs text-slate-500">14 integrantes · cifrado punto a punto</div>
              </div>
              <Badge intent="brand">{chatActivo.tipo}</Badge>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              <div className="flex justify-start">
                <div className="max-w-[80%]">
                  <div className="mb-1 flex items-center gap-2">
                    <Avatar name={chatActivo.autor} size={20} />
                    <span className="text-xs font-medium text-slate-700">{chatActivo.autor}</span>
                  </div>
                  <div className="rounded-2xl rounded-tl-sm bg-slate-100 px-3 py-2 text-sm text-slate-900">
                    {chatActivo.ultimoMensaje}
                  </div>
                  <div className="mt-0.5 text-[10px] text-slate-400">{chatActivo.cuando}</div>
                </div>
              </div>

              <div className="flex justify-end">
                <div className="max-w-[80%]">
                  <div className="bg-brand-600 rounded-2xl rounded-tr-sm px-3 py-2 text-sm text-white">
                    Recibido, mañana confirmo asistencia.
                  </div>
                  <div className="mt-0.5 text-right text-[10px] text-slate-400">Vos · 14:35</div>
                </div>
              </div>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!draft.trim()) return;
                toast.push({
                  kind: 'success',
                  title: 'Mensaje enviado',
                  description: `Para ${chatActivo.nombre}`,
                });
                setDraft('');
              }}
              className="flex items-center gap-2 border-t border-slate-100 bg-slate-50 p-3"
            >
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder={`Escribir a ${chatActivo.nombre}...`}
                className="focus:border-brand-400 focus:ring-brand-100 flex-1 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm outline-none focus:ring-2"
              />
              <button
                type="submit"
                disabled={!draft.trim()}
                className="bg-brand-600 hover:bg-brand-700 grid h-10 w-10 shrink-0 place-items-center rounded-full text-white disabled:opacity-40"
                aria-label="Enviar"
              >
                <Send size={16} />
              </button>
            </form>
          </Card>
        </div>
      </section>
    </div>
  );
}
