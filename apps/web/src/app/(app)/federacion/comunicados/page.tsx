'use client';

import {
  AtSign,
  Bell,
  BookOpen,
  Eye,
  FileText,
  Megaphone,
  MessageCircle,
  Paperclip,
  Send,
  Sparkles,
} from 'lucide-react';
import { useState } from 'react';

import { Badge, Card, CardContent, Kpi, cn, useToast } from '@faro/ui';

import { PageHero } from '../../../../components/shared/page-hero';

interface Comunicado {
  id: string;
  asunto: string;
  cuerpo: string;
  enviado: string;
  destinatarios: number;
  leidos: number;
  canal: ('email' | 'whatsapp' | 'push')[];
  prioridad: 'alta' | 'normal';
}

const enviados: Comunicado[] = [
  {
    id: 'c1',
    asunto: 'Cierre del Fondo: 10 de junio',
    cuerpo: 'Recordatorio de plazo · revisar rendición + firmas digitales.',
    enviado: 'Hoy 14:30',
    destinatarios: 4,
    leidos: 3,
    canal: ['email', 'whatsapp', 'push'],
    prioridad: 'alta',
  },
  {
    id: 'c2',
    asunto: 'Nuevo protocolo COVID actualizado',
    cuerpo: 'Distribuir entre todo el personal · actualizar Pañol.',
    enviado: '5/5/2026',
    destinatarios: 4,
    leidos: 4,
    canal: ['email', 'push'],
    prioridad: 'normal',
  },
  {
    id: 'c3',
    asunto: 'Capacitación regional · 12 de junio',
    cuerpo: 'Rescate vehicular avanzado · Centro de práctica Norte · cupos limitados.',
    enviado: '2/5/2026',
    destinatarios: 4,
    leidos: 4,
    canal: ['email', 'whatsapp'],
    prioridad: 'normal',
  },
];

const normativa = [
  {
    titulo: 'Ley 25.054',
    subtitulo: 'Servicio Nacional Bomberos Voluntarios',
    tipo: 'Ley',
    destacado: true,
  },
  {
    titulo: 'Resolución 24/26',
    subtitulo: 'Actualización del cómputo · 1/4/2026',
    tipo: 'Resolución',
    destacado: true,
  },
  { titulo: 'Disposición 03/26', subtitulo: 'Calendario de rendiciones 2026', tipo: 'Disposición' },
];

const plantillas = [
  { nombre: 'Recordatorio rendición', icon: '⏰' },
  { nombre: 'Convocatoria reunión', icon: '📋' },
  { nombre: 'Alerta vencimientos', icon: '⚠️' },
  { nombre: 'Felicitaciones aniversario', icon: '🎉' },
];

const CANAL_LABEL: Record<string, string> = {
  email: 'Email',
  whatsapp: 'WhatsApp',
  push: 'Notificación',
};

const CANAL_ICON: Record<string, React.ReactNode> = {
  email: <AtSign size={11} />,
  whatsapp: <MessageCircle size={11} />,
  push: <Bell size={11} />,
};

export default function ComunicadosFed() {
  const toast = useToast();
  const [asunto, setAsunto] = useState('');
  const [cuerpo, setCuerpo] = useState('');
  const [canales, setCanales] = useState<Set<string>>(new Set(['email', 'push']));

  function toggleCanal(c: string) {
    setCanales((s) => {
      const n = new Set(s);
      if (n.has(c)) n.delete(c);
      else n.add(c);
      return n;
    });
  }

  function enviar() {
    if (!asunto.trim()) {
      toast.push({ kind: 'warn', title: 'Falta el asunto' });
      return;
    }
    toast.push({
      kind: 'success',
      title: 'Comunicado enviado',
      description: `4 cuarteles · canales: ${[...canales].join(', ')}`,
    });
    setAsunto('');
    setCuerpo('');
  }

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <PageHero
        objetivo="Federación · Comunicados"
        titulo="Hablás con 4 cuarteles a la vez"
        descripcion="Email, WhatsApp y notificación de la app en un solo envío. Confirmás recepción y tasa de lectura."
        icono={<Megaphone size={26} />}
        meta={
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Kpi
              label="Enviados mes"
              value={enviados.length}
              intent="brand"
              icon={<Send size={16} />}
            />
            <Kpi
              label="Tasa lectura"
              value="92%"
              hint="promedio"
              intent="ok"
              icon={<Eye size={16} />}
            />
            <Kpi
              label="Normativa"
              value={normativa.length}
              hint="leyes y resoluciones"
              icon={<BookOpen size={16} />}
            />
            <Kpi
              label="Plantillas"
              value={plantillas.length}
              hint="listas para usar"
              icon={<FileText size={16} />}
            />
          </div>
        }
      />

      <div className="grid gap-5 lg:grid-cols-[1.2fr_1fr]">
        <Card className="border-brand-200 overflow-hidden border-2">
          <CardContent className="p-0">
            <div className="bg-brand-600 px-5 py-3 text-white">
              <div className="flex items-center gap-2">
                <Sparkles size={16} />
                <span className="font-bold">Componer comunicado nuevo</span>
                <Badge intent="ok" className="ml-auto">
                  Llega a 4 cuarteles
                </Badge>
              </div>
            </div>

            <div className="space-y-4 p-5">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Asunto
                </label>
                <input
                  value={asunto}
                  onChange={(e) => setAsunto(e.target.value)}
                  placeholder="Ej: Recordatorio · cierre rendición 10 de junio"
                  className="focus:border-brand-400 focus:ring-brand-100 mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:ring-2"
                />
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Mensaje
                </label>
                <textarea
                  value={cuerpo}
                  onChange={(e) => setCuerpo(e.target.value)}
                  rows={4}
                  placeholder="Escribí el mensaje completo. Faltan 17 días para el cierre del Fondo..."
                  className="focus:border-brand-400 focus:ring-brand-100 mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:ring-2"
                />
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Canales
                </label>
                <div className="mt-2 flex gap-2">
                  {(['email', 'whatsapp', 'push'] as const).map((c) => {
                    const active = canales.has(c);
                    return (
                      <button
                        key={c}
                        type="button"
                        onClick={() => toggleCanal(c)}
                        className={cn(
                          'inline-flex flex-1 items-center justify-center gap-2 rounded-lg border-2 px-3 py-2 text-sm font-semibold transition-colors',
                          active
                            ? 'border-brand-600 bg-brand-50 text-brand-700'
                            : 'border-slate-200 bg-white text-slate-500',
                        )}
                      >
                        {CANAL_ICON[c]} {CANAL_LABEL[c]}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Plantillas rápidas
                </label>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {plantillas.map((p) => (
                    <button
                      key={p.nombre}
                      type="button"
                      onClick={() => setAsunto(p.nombre)}
                      className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-700 hover:bg-slate-200"
                    >
                      {p.icon} {p.nombre}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => toast.push({ kind: 'info', title: 'Adjuntar archivo' })}
                  className="grid h-10 w-10 place-items-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
                >
                  <Paperclip size={16} />
                </button>
                <button
                  type="button"
                  onClick={enviar}
                  disabled={!asunto.trim()}
                  className="bg-brand-600 hover:bg-brand-700 ml-auto inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold text-white disabled:opacity-40"
                >
                  <Send size={14} /> Enviar a 4 cuarteles
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardContent className="p-5">
              <h3 className="mb-3 flex items-center gap-2 font-bold text-slate-900">
                <BookOpen size={18} className="text-brand-600" /> Normativa vigente
              </h3>
              <div className="space-y-2">
                {normativa.map((n) => (
                  <button
                    key={n.titulo}
                    type="button"
                    onClick={() =>
                      toast.push({ kind: 'info', title: n.titulo, description: n.subtitulo })
                    }
                    className="flex w-full items-start gap-3 rounded-lg border border-slate-200 bg-white p-3 text-left hover:border-slate-300"
                  >
                    <div
                      className={cn(
                        'h-9 w-1.5 shrink-0 rounded-full',
                        n.destacado ? 'bg-brand-600' : 'bg-slate-300',
                      )}
                    />
                    <div className="flex-1">
                      <div className="font-semibold text-slate-900">{n.titulo}</div>
                      <div className="mt-0.5 text-xs text-slate-600">{n.subtitulo}</div>
                    </div>
                    <Badge intent={n.destacado ? 'brand' : 'neutral'}>{n.tipo}</Badge>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <section>
        <h2 className="mb-3 flex items-center gap-2 text-base font-bold text-slate-900">
          <Send size={18} className="text-status-ok" /> Comunicados enviados
        </h2>
        <div className="space-y-2">
          {enviados.map((c) => {
            const pctLeido = Math.round((c.leidos / c.destinatarios) * 100);
            return (
              <Card key={c.id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex flex-wrap items-start gap-3">
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-slate-100">
                      <Megaphone size={16} className="text-slate-700" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-slate-900">{c.asunto}</span>
                        {c.prioridad === 'alta' && <Badge intent="risk">Urgente</Badge>}
                      </div>
                      <div className="mt-0.5 line-clamp-1 text-xs text-slate-600">{c.cuerpo}</div>
                      <div className="mt-2 flex items-center gap-3 text-[11px] text-slate-500">
                        <span>{c.enviado}</span>
                        <span className="flex items-center gap-1">
                          {c.canal.map((ch) => (
                            <span key={ch} title={ch} className="inline-flex items-center gap-0.5">
                              {CANAL_ICON[ch]}
                            </span>
                          ))}
                        </span>
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      <div className="font-bold tabular-nums text-slate-900">
                        {c.leidos}/{c.destinatarios}
                      </div>
                      <div className="text-[10px] uppercase tracking-wide text-slate-500">
                        leído
                      </div>
                      <div className="mt-1 h-1 w-16 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className={cn(
                            'h-full',
                            pctLeido === 100 ? 'bg-status-ok' : 'bg-status-warn',
                          )}
                          style={{ width: `${pctLeido}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>
    </div>
  );
}
