'use client';

import {
  Heart,
  Megaphone,
  MessageCircle,
  Send,
  ShieldCheck,
  Smile,
  Sparkles,
  Users2,
  Wrench,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

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
  integrantes: number;
}

interface Mensaje {
  id: string;
  autor: string;
  texto: string;
  ts: string;
  mio: boolean;
  leido?: boolean;
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

const chatsInicial: Chat[] = [
  {
    id: 'ch1',
    nombre: 'Cuartel general',
    ultimoMensaje: 'Mañana 7am en Pueyrredón. Llevar EPP completo.',
    autor: 'Mariana Pereyra',
    cuando: '14:32',
    sinLeer: 3,
    tipo: 'cuartel',
    integrantes: 47,
  },
  {
    id: 'ch2',
    nombre: 'Sección Operativa',
    ultimoMensaje: 'Bien hecho con lo del incendio de Alvear, dotación impecable.',
    autor: 'Roberto González',
    cuando: 'Ayer',
    sinLeer: 0,
    tipo: 'seccion',
    integrantes: 14,
  },
  {
    id: 'ch3',
    nombre: 'Cadetes 2026',
    ultimoMensaje: 'Próxima reunión sábado a las 17hs. Confirmen asistencia.',
    autor: 'Florencia Salinas',
    cuando: 'Hace 2 días',
    sinLeer: 1,
    tipo: 'cadetes',
    integrantes: 8,
  },
  {
    id: 'ch4',
    nombre: 'Equipo Rescate',
    ultimoMensaje: 'Llegaron las pinzas nuevas, las probamos el viernes.',
    autor: 'Carolina Sosa',
    cuando: 'Hace 3 días',
    sinLeer: 0,
    tipo: 'rescate',
    integrantes: 6,
  },
];

const CHAT_STYLE: Record<Chat['tipo'], { color: string; icono: React.ReactNode }> = {
  cuartel: { color: 'bg-brand-600', icono: <Users2 size={18} /> },
  seccion: { color: 'bg-status-warn', icono: <ShieldCheck size={18} /> },
  cadetes: { color: 'bg-status-ok', icono: <Sparkles size={18} /> },
  rescate: { color: 'bg-status-risk', icono: <Heart size={18} /> },
};

const HISTORIAL: Record<string, Mensaje[]> = {
  ch1: [
    {
      id: 'm-ch1-1',
      autor: 'Roberto González',
      texto: '¿Quién puede cubrir el turno de mañana 8am? Carolina avisó que no puede.',
      ts: 'Ayer 21:14',
      mio: false,
    },
    {
      id: 'm-ch1-2',
      autor: 'Sebastián Ruiz',
      texto: 'Yo puedo. Confirmo dotación al BV-3.',
      ts: 'Ayer 21:18',
      mio: false,
    },
    {
      id: 'm-ch1-3',
      autor: 'Mariana Pereyra',
      texto: 'Mañana 7am en Pueyrredón. Llevar EPP completo.',
      ts: '14:32',
      mio: false,
    },
    {
      id: 'm-ch1-4',
      autor: 'Vos',
      texto: 'Confirmo.',
      ts: '14:35',
      mio: true,
      leido: true,
    },
  ],
  ch2: [
    {
      id: 'm-ch2-1',
      autor: 'Roberto González',
      texto: 'Bien hecho con lo del incendio de Alvear, dotación impecable.',
      ts: 'Ayer',
      mio: false,
    },
    {
      id: 'm-ch2-2',
      autor: 'Vos',
      texto: 'Gracias jefe! Lo merecido para todos.',
      ts: 'Ayer',
      mio: true,
      leido: true,
    },
  ],
  ch3: [
    {
      id: 'm-ch3-1',
      autor: 'Florencia Salinas',
      texto: 'Hola gente! El curso de combate empieza el lunes 3/6 a las 18hs.',
      ts: 'Hace 3 días',
      mio: false,
    },
    {
      id: 'm-ch3-2',
      autor: 'Camila Torres',
      texto: '¿Es obligatorio?',
      ts: 'Hace 3 días',
      mio: false,
    },
    {
      id: 'm-ch3-3',
      autor: 'Florencia Salinas',
      texto: 'Sí, parte del programa anual 2026.',
      ts: 'Hace 2 días',
      mio: false,
    },
    {
      id: 'm-ch3-4',
      autor: 'Florencia Salinas',
      texto: 'Próxima reunión sábado a las 17hs. Confirmen asistencia.',
      ts: 'Hace 2 días',
      mio: false,
    },
  ],
  ch4: [
    {
      id: 'm-ch4-1',
      autor: 'Carolina Sosa',
      texto: 'Llegaron las pinzas nuevas, las probamos el viernes.',
      ts: 'Hace 3 días',
      mio: false,
    },
    {
      id: 'm-ch4-2',
      autor: 'Vos',
      texto: '¡Genial! Voy a estar.',
      ts: 'Hace 3 días',
      mio: true,
      leido: true,
    },
  ],
};

// Respuestas automáticas según contenido
function generarRespuesta(chatId: string, _texto: string): { autor: string; texto: string } {
  const respuestasPorChat: Record<string, Array<{ autor: string; texto: string }>> = {
    ch1: [
      { autor: 'Mariana Pereyra', texto: 'Recibido 👍' },
      { autor: 'Sebastián Ruiz', texto: 'Anotado.' },
      {
        autor: 'Roberto González',
        texto: 'Perfecto. Recordá pasar el listado por Whatsapp también, gracias.',
      },
    ],
    ch2: [{ autor: 'Roberto González', texto: 'Buen punto, lo trasladamos a la próxima reunión.' }],
    ch3: [
      { autor: 'Florencia Salinas', texto: '¡Genial! Te anoto.' },
      { autor: 'Camila Torres', texto: 'Yo también voy 🚒' },
    ],
    ch4: [{ autor: 'Carolina Sosa', texto: 'Avisame qué tal te resultan, así pedimos más.' }],
  };
  const pool = respuestasPorChat[chatId] ?? [{ autor: 'Bot', texto: 'OK' }];
  const r = pool[Math.floor(Math.random() * pool.length)];
  return r ?? { autor: 'Bot', texto: 'OK' };
}

export default function ComunicacionPage() {
  const toast = useToast();
  const [seleccionado, setSeleccionado] = useState<string>('ch1');
  const [draft, setDraft] = useState('');
  const [historial, setHistorial] = useState<Record<string, Mensaje[]>>(HISTORIAL);
  const [chats, setChats] = useState<Chat[]>(chatsInicial);
  const [escribiendo, setEscribiendo] = useState<Record<string, boolean>>({});
  const scrollRef = useRef<HTMLDivElement>(null);

  const chatActivo = chats.find((c) => c.id === seleccionado)!;
  const mensajesActivo = historial[seleccionado] ?? [];
  const escribiendoActivo = escribiendo[seleccionado] ?? false;
  const totalSinLeer = chats.reduce((a, c) => a + c.sinLeer, 0);

  // Reset unread on chat select
  useEffect(() => {
    setChats((arr) => arr.map((c) => (c.id === seleccionado ? { ...c, sinLeer: 0 } : c)));
  }, [seleccionado]);

  // Auto-scroll on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [mensajesActivo.length, escribiendoActivo]);

  function enviar(texto: string) {
    if (!texto.trim()) return;
    const ahora = new Date();
    const hora = `${String(ahora.getHours()).padStart(2, '0')}:${String(ahora.getMinutes()).padStart(2, '0')}`;
    const nuevoId = `m-${seleccionado}-${Date.now()}`;
    const nuevoMensaje: Mensaje = {
      id: nuevoId,
      autor: 'Vos',
      texto: texto.trim(),
      ts: hora,
      mio: true,
      leido: false,
    };

    setHistorial((h) => ({
      ...h,
      [seleccionado]: [...(h[seleccionado] ?? []), nuevoMensaje],
    }));
    setDraft('');

    // Actualizar último mensaje del chat
    setChats((arr) =>
      arr.map((c) =>
        c.id === seleccionado
          ? { ...c, ultimoMensaje: texto.trim(), autor: 'Vos', cuando: hora }
          : c,
      ),
    );

    // Simular indicador escribiendo + respuesta automática
    setEscribiendo((e) => ({ ...e, [seleccionado]: true }));
    setTimeout(() => {
      // Marcar el mensaje como leído (✓✓)
      setHistorial((h) => ({
        ...h,
        [seleccionado]: (h[seleccionado] ?? []).map((m) =>
          m.id === nuevoId ? { ...m, leido: true } : m,
        ),
      }));
    }, 600);

    setTimeout(
      () => {
        const respuesta = generarRespuesta(seleccionado, texto);
        const horaResp = `${String(new Date().getHours()).padStart(2, '0')}:${String(new Date().getMinutes()).padStart(2, '0')}`;
        const respId = `m-${seleccionado}-${Date.now()}-resp`;
        setHistorial((h) => ({
          ...h,
          [seleccionado]: [
            ...(h[seleccionado] ?? []),
            {
              id: respId,
              autor: respuesta.autor,
              texto: respuesta.texto,
              ts: horaResp,
              mio: false,
            },
          ],
        }));
        setEscribiendo((e) => ({ ...e, [seleccionado]: false }));
        setChats((arr) =>
          arr.map((c) =>
            c.id === seleccionado
              ? { ...c, ultimoMensaje: respuesta.texto, autor: respuesta.autor, cuando: horaResp }
              : c,
          ),
        );
      },
      1500 + Math.random() * 1200,
    );
  }

  const avisosHoy = useMemo(() => avisos.filter((a) => a.cuando.startsWith('Hoy')).length, []);

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
              value={avisosHoy}
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

        <div className="grid gap-4 md:h-[540px] md:grid-cols-[280px_1fr]">
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
                <div className="text-xs text-slate-500">
                  {chatActivo.integrantes} integrantes · encriptado punta a punta
                </div>
              </div>
              <Badge intent="brand">{chatActivo.tipo}</Badge>
            </div>

            <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto bg-slate-50/50 p-4">
              {mensajesActivo.length === 0 && (
                <div className="text-center text-xs text-slate-500">
                  No hay mensajes todavía. Sé el primero en escribir.
                </div>
              )}
              {mensajesActivo.map((m) => (
                <div key={m.id} className={cn('flex', m.mio ? 'justify-end' : 'justify-start')}>
                  <div className="max-w-[80%]">
                    {!m.mio && (
                      <div className="mb-1 flex items-center gap-2">
                        <Avatar name={m.autor} size={20} />
                        <span className="text-xs font-medium text-slate-700">{m.autor}</span>
                      </div>
                    )}
                    <div
                      className={cn(
                        'rounded-2xl px-3 py-2 text-sm',
                        m.mio
                          ? 'bg-brand-600 rounded-tr-sm text-white'
                          : 'rounded-tl-sm bg-white text-slate-900 ring-1 ring-slate-100',
                      )}
                    >
                      {m.texto}
                    </div>
                    <div
                      className={cn(
                        'mt-0.5 flex items-center gap-1 text-[10px] text-slate-400',
                        m.mio ? 'justify-end' : 'justify-start',
                      )}
                    >
                      {m.mio ? 'Vos · ' + m.ts : m.ts}
                      {m.mio && (
                        <span
                          className={cn(
                            'ml-1 font-medium',
                            m.leido ? 'text-status-ok' : 'text-slate-400',
                          )}
                        >
                          ✓✓
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {escribiendoActivo && (
                <div className="flex justify-start">
                  <div className="rounded-2xl rounded-tl-sm bg-white px-3 py-2 ring-1 ring-slate-100">
                    <div className="flex items-center gap-1">
                      <span
                        className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400"
                        style={{ animationDelay: '0ms' }}
                      />
                      <span
                        className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400"
                        style={{ animationDelay: '150ms' }}
                      />
                      <span
                        className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400"
                        style={{ animationDelay: '300ms' }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                enviar(draft);
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
                type="button"
                onClick={() => setDraft((d) => d + ' 👍')}
                className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-slate-500 hover:bg-white hover:text-slate-700"
                aria-label="Emoji"
              >
                <Smile size={18} />
              </button>
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
