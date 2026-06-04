'use client';

import {
  AtSign,
  Bell,
  BookOpen,
  Eye,
  Globe,
  MapPin,
  Megaphone,
  MessageCircle,
  Send,
  Sparkles,
} from 'lucide-react';
import { useMemo, useState } from 'react';

import { Badge, Card, CardContent, Kpi, cn, useToast } from '@faro/ui';

import { PageHero } from '../../../../components/shared/page-hero';
import type { CanalComunicado } from '../../../../data/comunicados-fed';
import { demoToday } from '../../../../lib/utils/demo-today';
import { useFaroStore } from '../../../../store/use-faro-store';

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
  { nombre: 'Recordatorio rendición', icon: '⏰', prioridad: 'alta' as const },
  { nombre: 'Convocatoria reunión', icon: '📋', prioridad: 'normal' as const },
  { nombre: 'Alerta vencimientos', icon: '⚠️', prioridad: 'alta' as const },
  { nombre: 'Felicitaciones aniversario', icon: '🎉', prioridad: 'normal' as const },
];

const CANAL_LABEL: Record<CanalComunicado, string> = {
  email: 'Email',
  whatsapp: 'WhatsApp',
  push: 'Notificación',
};

const CANAL_ICON: Record<CanalComunicado, React.ReactNode> = {
  email: <AtSign size={11} />,
  whatsapp: <MessageCircle size={11} />,
  push: <Bell size={11} />,
};

function fmtFecha(iso: string): string {
  const hoyISO = demoToday().toISOString().slice(0, 10);
  if (iso.slice(0, 10) === hoyISO) return `Hoy ${iso.slice(11, 16)}`;
  const [y, m, d] = iso.slice(0, 10).split('-');
  return `${d}/${m}/${y?.slice(2) ?? ''}`;
}

export default function ComunicadosFed() {
  const toast = useToast();
  const cuarteles = useFaroStore((s) => s.cuarteles);
  const comunicados = useFaroStore((s) => s.comunicadosFed);
  const enviarComunicadoFed = useFaroStore((s) => s.enviarComunicadoFed);

  const [asunto, setAsunto] = useState('');
  const [cuerpo, setCuerpo] = useState('');
  const [region, setRegion] = useState<string | null>(null);
  const [prioridad, setPrioridad] = useState<'alta' | 'normal'>('normal');
  const [canales, setCanales] = useState<Set<CanalComunicado>>(new Set(['email', 'push']));

  const regiones = useMemo(() => [...new Set(cuarteles.map((c) => c.region))].sort(), [cuarteles]);
  const alcance = useMemo(
    () => (region ? cuarteles.filter((c) => c.region === region).length : cuarteles.length),
    [cuarteles, region],
  );
  function toggleCanal(c: CanalComunicado) {
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
    if (canales.size === 0) {
      toast.push({ kind: 'warn', title: 'Elegí al menos un canal' });
      return;
    }
    const res = enviarComunicadoFed({
      asunto: asunto.trim(),
      cuerpo: cuerpo.trim(),
      region,
      canales: [...canales],
      prioridad,
    });
    toast.push({
      kind: 'success',
      title: 'Comunicado enviado',
      description: `${res.cuartelesAlcanzados} cuarteles · ${res.notificados} con aviso in-app en la campanita`,
    });
    setAsunto('');
    setCuerpo('');
    setPrioridad('normal');
  }

  const alcanceAcumulado = comunicados.reduce((a, c) => a + c.cuartelesAlcanzados, 0);

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <PageHero
        objetivo="Federación · Comunicados"
        titulo={`Hablás con ${cuarteles.length} cuarteles a la vez`}
        descripcion="Elegís la audiencia —toda la red o una región— y el sistema deja un aviso real en la campanita de cada mando con cuenta activa. Queda registrado, no se pierde."
        icono={<Megaphone size={26} />}
        meta={
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Kpi
              label="Enviados"
              value={comunicados.length}
              hint="registrados"
              intent="brand"
              icon={<Send size={16} />}
            />
            <Kpi
              label="Red"
              value={cuarteles.length}
              hint="cuarteles"
              intent="neutral"
              icon={<Globe size={16} />}
            />
            <Kpi
              label="Alcance acum."
              value={alcanceAcumulado.toLocaleString('es-AR')}
              hint="impactos"
              intent="ok"
              icon={<Eye size={16} />}
            />
            <Kpi
              label="Normativa"
              value={normativa.length}
              hint="leyes y resoluciones"
              icon={<BookOpen size={16} />}
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
                  Llega a {alcance} cuartel{alcance === 1 ? '' : 'es'}
                </Badge>
              </div>
            </div>

            <div className="space-y-4 p-5">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Audiencia
                </label>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => setRegion(null)}
                    className={cn(
                      'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors',
                      region === null
                        ? 'bg-brand-600 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200',
                    )}
                  >
                    <Globe size={13} /> Toda la red
                  </button>
                  {regiones.map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRegion(r)}
                      className={cn(
                        'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors',
                        region === r
                          ? 'bg-brand-600 text-white'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200',
                      )}
                    >
                      <MapPin size={13} /> {r}
                    </button>
                  ))}
                </div>
              </div>

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

              <div className="grid gap-4 sm:grid-cols-2">
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
                          title={CANAL_LABEL[c]}
                          className={cn(
                            'inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border-2 px-2 py-2 text-xs font-semibold transition-colors',
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
                    Prioridad
                  </label>
                  <div className="mt-2 flex gap-2">
                    {(['normal', 'alta'] as const).map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setPrioridad(p)}
                        className={cn(
                          'inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border-2 px-2 py-2 text-xs font-semibold capitalize transition-colors',
                          prioridad === p
                            ? p === 'alta'
                              ? 'border-status-risk bg-status-risk-bg/40 text-status-risk-fg'
                              : 'border-brand-600 bg-brand-50 text-brand-700'
                            : 'border-slate-200 bg-white text-slate-500',
                        )}
                      >
                        {p === 'alta' ? 'Urgente' : 'Normal'}
                      </button>
                    ))}
                  </div>
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
                      onClick={() => {
                        setAsunto(p.nombre);
                        setPrioridad(p.prioridad);
                      }}
                      className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-700 hover:bg-slate-200"
                    >
                      {p.icon} {p.nombre}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 border-t border-slate-100 pt-4">
                <p className="text-xs text-slate-500">
                  {region ? `Región ${region}` : 'Toda la red'} ·{' '}
                  <strong className="text-slate-700">{alcance}</strong> cuarteles
                </p>
                <button
                  type="button"
                  onClick={enviar}
                  disabled={!asunto.trim() || canales.size === 0}
                  className="bg-brand-600 hover:bg-brand-700 ml-auto inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold text-white disabled:opacity-40"
                >
                  <Send size={14} /> Enviar a {alcance} cuartel{alcance === 1 ? '' : 'es'}
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
        {comunicados.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-sm text-slate-500">
              Todavía no enviaste comunicados. Componé el primero arriba.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {comunicados.map((c) => (
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
                        <Badge intent={c.region ? 'neutral' : 'brand'} className="gap-1">
                          {c.region ? <MapPin size={10} /> : <Globe size={10} />} {c.audiencia}
                        </Badge>
                      </div>
                      {c.cuerpo && (
                        <div className="mt-0.5 line-clamp-1 text-xs text-slate-600">{c.cuerpo}</div>
                      )}
                      <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
                        <span>{fmtFecha(c.fecha)}</span>
                        <span className="flex items-center gap-1.5">
                          {c.canales.map((ch) => (
                            <span
                              key={ch}
                              title={CANAL_LABEL[ch]}
                              className="inline-flex items-center gap-0.5"
                            >
                              {CANAL_ICON[ch]}
                            </span>
                          ))}
                        </span>
                        {c.notificados > 0 && (
                          <span className="inline-flex items-center gap-1">
                            <Bell size={10} /> {c.notificados} aviso
                            {c.notificados === 1 ? '' : 's'} in-app
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      <div className="text-lg font-bold tabular-nums text-slate-900">
                        {c.cuartelesAlcanzados}
                      </div>
                      <div className="text-[11px] uppercase tracking-wide text-slate-500">
                        cuarteles
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        <p className="mt-3 flex items-center gap-1.5 text-[11px] text-slate-400">
          <Bell size={11} /> El aviso in-app llega a la campanita de cada mando con cuenta activa en
          el sistema. Email y WhatsApp se integran con el proveedor de envío en producción.
        </p>
      </section>
    </div>
  );
}
