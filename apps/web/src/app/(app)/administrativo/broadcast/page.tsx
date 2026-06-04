'use client';

import { motion } from 'framer-motion';
import {
  Bold,
  Calendar,
  CheckCheck,
  Clock,
  Eye,
  Italic,
  List,
  Megaphone,
  Paperclip,
  Send,
  Users,
} from 'lucide-react';
import { useMemo, useRef, useState } from 'react';

import { Avatar, Badge, Button, Card, CardContent, Kpi, cn, useToast } from '@faro/ui';

import { PageHero } from '../../../../components/shared/page-hero';
import type { AudienciaBroadcast } from '../../../../data/broadcasts';
import { broadcastSchema, validate } from '../../../../lib/validation/schemas';
import { demoToday } from '../../../../lib/utils/demo-today';
import { selectCuartelActivo, useFaroStore } from '../../../../store/use-faro-store';

const AUDIENCIAS: Array<{ id: AudienciaBroadcast; label: string; color: string }> = [
  { id: 'todos', label: 'Todo el cuartel', color: 'bg-slate-600' },
  { id: 'operativo', label: 'Sección operativa', color: 'bg-fire-600' },
  { id: 'mando', label: 'Mando', color: 'bg-status-warn' },
  { id: 'cadetes', label: 'Cadetes', color: 'bg-status-ok' },
  { id: 'administrativo', label: 'Administrativo', color: 'bg-brand-600' },
  { id: 'custom', label: 'Personalizado', color: 'bg-slate-400' },
];

function relativo(iso: string): string {
  const diff = demoToday().getTime() - new Date(iso).getTime();
  const dias = Math.floor(diff / 86400000);
  if (dias <= 0) {
    const h = Math.floor(diff / 3600000);
    return h <= 0 ? 'Recién' : `Hace ${h} h`;
  }
  if (dias === 1) return 'Ayer';
  if (dias < 7) return `Hace ${dias} días`;
  const sem = Math.floor(dias / 7);
  return sem === 1 ? 'Hace 1 sem' : `Hace ${sem} sem`;
}

export default function BroadcastPage() {
  const toast = useToast();
  const cuartel = useFaroStore(selectCuartelActivo);
  const personas = useFaroStore((s) => s.personas);
  const broadcasts = useFaroStore((s) => s.broadcasts);
  const enviarBroadcast = useFaroStore((s) => s.enviarBroadcast);

  const [audiencia, setAudiencia] = useState<AudienciaBroadcast>('operativo');
  const [titulo, setTitulo] = useState('');
  const [cuerpo, setCuerpo] = useState('');
  const [programar, setProgramar] = useState(false);
  const [fechaProg, setFechaProg] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Conteo de cada audiencia desde las personas reales del cuartel.
  const counts = useMemo(() => {
    const activas = personas.filter((p) => p.cuartelId === cuartel?.id && p.estado === 'activo');
    return {
      todos: activas.length,
      operativo: activas.filter((p) => p.cuerpo !== 'administrativo').length,
      administrativo: activas.filter((p) => p.cuerpo === 'administrativo').length,
      mando: activas.filter((p) => p.perfiles.includes('mando')).length,
      cadetes: activas.filter((p) => p.jerarquia === 'cadete').length,
      custom: 0,
    } as Record<AudienciaBroadcast, number>;
  }, [personas, cuartel?.id]);

  const recientes = useMemo(
    () =>
      broadcasts
        .filter((b) => b.cuartelId === cuartel?.id)
        .slice()
        .sort((a, b) => b.fecha.localeCompare(a.fecha)),
    [broadcasts, cuartel?.id],
  );

  const kpis = useMemo(() => {
    const hoyKey = demoToday().toISOString().slice(0, 10);
    const haceSemana = demoToday().getTime() - 7 * 86400000;
    return {
      hoy: recientes.filter((b) => b.fecha.slice(0, 10) === hoyKey).length,
      semana: recientes.filter((b) => new Date(b.fecha).getTime() >= haceSemana).length,
    };
  }, [recientes]);

  const audienciaSel = AUDIENCIAS.find((a) => a.id === audiencia)!;
  const destinatarios = counts[audiencia];

  function insertarFormato(prefijo: string, sufijo = prefijo) {
    const ta = textareaRef.current;
    if (!ta) {
      setCuerpo((c) => c + prefijo + sufijo);
      return;
    }
    const start = ta.selectionStart ?? cuerpo.length;
    const end = ta.selectionEnd ?? cuerpo.length;
    const selected = cuerpo.slice(start, end);
    const nuevo = cuerpo.slice(0, start) + prefijo + selected + sufijo + cuerpo.slice(end);
    setCuerpo(nuevo);
    requestAnimationFrame(() => {
      ta.focus();
      const pos = start + prefijo.length + selected.length;
      ta.setSelectionRange(pos, pos);
    });
  }

  function insertarLineaPrefijo(prefijo: string) {
    const ta = textareaRef.current;
    if (!ta) {
      setCuerpo((c) => (c.length > 0 && !c.endsWith('\n') ? c + '\n' : c) + prefijo);
      return;
    }
    const start = ta.selectionStart ?? cuerpo.length;
    const before = cuerpo.slice(0, start);
    const after = cuerpo.slice(start);
    const sep = before.length === 0 || before.endsWith('\n') ? '' : '\n';
    const nuevo = before + sep + prefijo + after;
    setCuerpo(nuevo);
    requestAnimationFrame(() => {
      ta.focus();
      const pos = before.length + sep.length + prefijo.length;
      ta.setSelectionRange(pos, pos);
    });
  }

  function enviar() {
    const result = validate(broadcastSchema, {
      audiencia,
      titulo,
      cuerpo,
      fechaProgramada: programar ? fechaProg : undefined,
    });
    if (!result.ok) {
      setErrors(result.errors);
      const firstError = Object.values(result.errors)[0];
      toast.push({
        kind: 'warn',
        title: 'Revisá el formulario',
        description: firstError ?? 'Hay campos sin completar',
      });
      return;
    }
    setErrors({});
    enviarBroadcast({
      audiencia,
      titulo,
      cuerpo,
      destinatarios,
      programadaPara: programar ? fechaProg : undefined,
    });
    toast.push({
      kind: 'success',
      title: programar ? `Programado para ${fechaProg}` : `Enviado a ${destinatarios} personas`,
      description: titulo,
    });
    setTitulo('');
    setCuerpo('');
    setProgramar(false);
    setFechaProg('');
  }

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <PageHero
        objetivo="Administrativo · Avisos masivos"
        titulo="Enviar aviso al cuartel"
        descripcion="Editor con formato, eligiendo a quién le llega. Podés programarlo. Cada envío queda registrado y le llega una notificación al destinatario."
        icono={<Megaphone size={26} />}
        meta={
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Kpi label="Hoy" value={kpis.hoy} hint="enviados" intent="brand" />
            <Kpi label="Esta semana" value={kpis.semana} intent="neutral" />
            <Kpi label="Enviados total" value={recientes.length} intent="neutral" />
            <Kpi label="Tu sección" value={counts.operativo} hint="operativos" intent="brand" />
          </div>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        {/* Composer */}
        <Card>
          <CardContent className="space-y-4 p-5">
            {/* Audiencia */}
            <div>
              <label className="mb-2 block text-xs font-bold uppercase text-slate-500">
                <Users size={11} className="mr-1 inline" />A quién le llega
              </label>
              <div className="flex flex-wrap gap-2">
                {AUDIENCIAS.map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => setAudiencia(a.id)}
                    className={cn(
                      'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors',
                      audiencia === a.id
                        ? cn(a.color, 'text-white')
                        : 'bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50',
                    )}
                  >
                    {a.label}
                    <span
                      className={cn(
                        'rounded-full px-1.5 py-0.5 text-[10px]',
                        audiencia === a.id ? 'bg-white/20' : 'bg-slate-100',
                      )}
                    >
                      {counts[a.id]}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Título */}
            <div>
              <label className="mb-1 block text-xs font-bold uppercase text-slate-500">
                Título
              </label>
              <input
                type="text"
                value={titulo}
                onChange={(e) => {
                  setTitulo(e.target.value);
                  if (errors.titulo) setErrors((er) => ({ ...er, titulo: '' }));
                }}
                placeholder="Ej: Asamblea ordinaria del 15/6"
                className={cn(
                  'w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2',
                  errors.titulo
                    ? 'border-status-risk focus:border-status-risk focus:ring-status-risk-bg'
                    : 'focus:border-brand-400 border-slate-200',
                )}
              />
              {errors.titulo && (
                <p className="text-status-risk-fg mt-1 text-xs font-medium">{errors.titulo}</p>
              )}
            </div>

            {/* Toolbar + cuerpo */}
            <div>
              <label className="mb-1 block text-xs font-bold uppercase text-slate-500">
                Mensaje
              </label>
              <div className="overflow-hidden rounded-lg border border-slate-200">
                <div className="flex items-center gap-1 border-b border-slate-100 bg-slate-50 px-2 py-1">
                  <button
                    type="button"
                    onClick={() => insertarFormato('**')}
                    aria-label="Negrita"
                    className="grid h-7 w-7 place-items-center rounded text-slate-600 hover:bg-white"
                  >
                    <Bold size={12} />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertarFormato('*')}
                    aria-label="Cursiva"
                    className="grid h-7 w-7 place-items-center rounded text-slate-600 hover:bg-white"
                  >
                    <Italic size={12} />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertarLineaPrefijo('- ')}
                    aria-label="Lista"
                    className="grid h-7 w-7 place-items-center rounded text-slate-600 hover:bg-white"
                  >
                    <List size={12} />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertarLineaPrefijo('[Adjunto] ')}
                    aria-label="Adjuntar"
                    className="grid h-7 w-7 place-items-center rounded text-slate-600 hover:bg-white"
                  >
                    <Paperclip size={12} />
                  </button>
                </div>
                <textarea
                  ref={textareaRef}
                  value={cuerpo}
                  onChange={(e) => {
                    setCuerpo(e.target.value);
                    if (errors.cuerpo) setErrors((er) => ({ ...er, cuerpo: '' }));
                  }}
                  rows={6}
                  placeholder="Escribí el aviso..."
                  className={cn(
                    'w-full px-3 py-2 text-sm outline-none',
                    errors.cuerpo ? 'border-status-risk border-t-2' : 'focus:border-brand-400',
                  )}
                />
              </div>
              {errors.cuerpo ? (
                <p className="text-status-risk-fg mt-1 text-xs font-medium">{errors.cuerpo}</p>
              ) : (
                <p className="mt-1 text-xs text-slate-500">
                  {cuerpo.length} caracteres · admite texto formateado · mín. 20
                </p>
              )}
            </div>

            {/* Programar */}
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={programar}
                onChange={(e) => setProgramar(e.target.checked)}
                className="h-4 w-4"
              />
              <span>Programar envío</span>
            </label>
            {programar && (
              <input
                type="datetime-local"
                value={fechaProg}
                onChange={(e) => setFechaProg(e.target.value)}
                className="focus:border-brand-400 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2"
              />
            )}

            <div className="flex justify-end">
              <Button intent="primary" size="lg" onClick={enviar}>
                {programar ? (
                  <>
                    <Calendar size={16} /> Programar
                  </>
                ) : (
                  <>
                    <Send size={16} /> Enviar a {destinatarios} personas
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Preview */}
        <div className="space-y-3">
          <Card>
            <CardContent className="p-4">
              <div className="mb-2 text-xs font-bold uppercase text-slate-500">Vista previa</div>
              <div className="rounded-lg bg-slate-50 p-3">
                <div className="flex items-center gap-1 text-xs text-slate-500">
                  <Megaphone size={10} />
                  <Badge intent="neutral">{audienciaSel.label}</Badge>
                </div>
                <h4 className="mt-2 font-bold text-slate-900">
                  {titulo || 'Tu título aparecerá aquí'}
                </h4>
                <p className="mt-1 whitespace-pre-wrap text-sm text-slate-700">
                  {cuerpo || 'El cuerpo del mensaje aparecerá aquí...'}
                </p>
                <div className="mt-3 text-[11px] text-slate-500">
                  Mariana Pereyra · Comandante · Hoy
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="mb-2 text-xs font-bold uppercase text-slate-500">
                Llegará a {destinatarios} personas
              </div>
              <div className="flex flex-wrap -space-x-2">
                {Array.from({ length: Math.min(destinatarios, 12) }).map((_, idx) => (
                  <Avatar
                    key={idx}
                    name={`Persona ${idx}`}
                    size={28}
                    className="ring-2 ring-white"
                  />
                ))}
                {destinatarios > 12 && (
                  <div className="grid h-7 w-7 place-items-center rounded-full bg-slate-200 text-[11px] font-bold text-slate-700 ring-2 ring-white">
                    +{destinatarios - 12}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recientes */}
      <Card>
        <CardContent className="p-0">
          <div className="border-b border-slate-100 px-5 py-3">
            <h3 className="font-bold text-slate-900">Avisos enviados recientes</h3>
          </div>
          {recientes.length === 0 ? (
            <div className="px-5 py-8 text-center text-sm text-slate-500">
              Todavía no enviaste ningún aviso.
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {recientes.map((b, idx) => {
                const pctLeidos =
                  b.destinatarios > 0 ? Math.round((b.leidos / b.destinatarios) * 100) : 0;
                return (
                  <motion.li
                    key={b.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(idx, 6) * 0.05 }}
                    className="flex items-center gap-3 p-4"
                  >
                    <div className="bg-brand-100 text-brand-700 grid h-10 w-10 shrink-0 place-items-center rounded-xl">
                      <Megaphone size={16} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-slate-900">{b.titulo}</span>
                        <Badge intent="neutral">
                          {AUDIENCIAS.find((a) => a.id === b.audiencia)?.label ?? b.audiencia}
                        </Badge>
                      </div>
                      <div className="mt-0.5 flex items-center gap-2 text-xs text-slate-500">
                        <Clock size={10} />
                        <span>
                          {b.programadaPara
                            ? `Programado · ${relativo(b.fecha)}`
                            : relativo(b.fecha)}
                        </span>
                        <span>·</span>
                        <span>{b.destinatarios} destinatarios</span>
                      </div>
                    </div>
                    <div className="hidden shrink-0 items-center gap-3 sm:flex">
                      <div className="text-center">
                        <div className="text-status-ok-fg flex items-center gap-1 text-xs">
                          <Eye size={11} /> {pctLeidos}%
                        </div>
                        <div className="text-[11px] text-slate-500">leídos</div>
                      </div>
                      <div className="text-center">
                        <div className="text-brand-700 flex items-center gap-1 text-xs">
                          <CheckCheck size={11} /> {b.respondieron}
                        </div>
                        <div className="text-[11px] text-slate-500">respondieron</div>
                      </div>
                    </div>
                  </motion.li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
