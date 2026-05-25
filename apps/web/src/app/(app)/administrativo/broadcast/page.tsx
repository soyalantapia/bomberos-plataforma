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
import { useState } from 'react';

import { Avatar, Badge, Button, Card, CardContent, Kpi, cn, useToast } from '@faro/ui';

import { PageHero } from '../../../../components/shared/page-hero';
import { broadcastSchema, validate } from '../../../../lib/validation/schemas';

type Audiencia = 'todos' | 'operativo' | 'mando' | 'cadetes' | 'administrativo' | 'custom';

const AUDIENCIAS: Array<{ id: Audiencia; label: string; count: number; color: string }> = [
  { id: 'todos', label: 'Todo el cuartel', count: 38, color: 'bg-slate-600' },
  { id: 'operativo', label: 'Sección operativa', count: 22, color: 'bg-fire-600' },
  { id: 'mando', label: 'Mando', count: 5, color: 'bg-status-warn' },
  { id: 'cadetes', label: 'Cadetes', count: 6, color: 'bg-status-ok' },
  { id: 'administrativo', label: 'Administrativo', count: 4, color: 'bg-brand-600' },
  { id: 'custom', label: 'Personalizado', count: 0, color: 'bg-slate-400' },
];

interface BroadcastRecent {
  id: string;
  titulo: string;
  audiencia: Audiencia;
  enviado: string;
  destinatarios: number;
  leidos: number;
  respondieron: number;
}

const RECIENTES: BroadcastRecent[] = [
  {
    id: 'b-1',
    titulo: 'Curso rescate vehicular · inscripción abierta',
    audiencia: 'operativo',
    enviado: 'Hace 2 días',
    destinatarios: 22,
    leidos: 21,
    respondieron: 12,
  },
  {
    id: 'b-2',
    titulo: 'Cambio en guardia del sábado',
    audiencia: 'mando',
    enviado: 'Hace 4 días',
    destinatarios: 5,
    leidos: 5,
    respondieron: 5,
  },
  {
    id: 'b-3',
    titulo: 'Reunión informativa cadetes',
    audiencia: 'cadetes',
    enviado: 'Hace 1 sem',
    destinatarios: 6,
    leidos: 6,
    respondieron: 4,
  },
  {
    id: 'b-4',
    titulo: 'Donación de sangre · Hospital Municipal',
    audiencia: 'todos',
    enviado: 'Hace 1 sem',
    destinatarios: 38,
    leidos: 34,
    respondieron: 8,
  },
];

export default function BroadcastPage() {
  const toast = useToast();
  const [audiencia, setAudiencia] = useState<Audiencia>('operativo');
  const [titulo, setTitulo] = useState('');
  const [cuerpo, setCuerpo] = useState('');
  const [programar, setProgramar] = useState(false);
  const [fechaProg, setFechaProg] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const audienciaSel = AUDIENCIAS.find((a) => a.id === audiencia)!;

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
    toast.push({
      kind: 'success',
      title: programar
        ? `Programado para ${fechaProg}`
        : `Enviado a ${audienciaSel.count} personas`,
      description: titulo,
    });
    setTitulo('');
    setCuerpo('');
  }

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <PageHero
        objetivo="Vista Administrativo · Broadcast"
        titulo="Enviar aviso al cuartel"
        descripcion="Composer rich-text con audiencias segmentadas. Programable. Read receipts en tiempo real."
        icono={<Megaphone size={26} />}
        meta={
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Kpi label="Hoy" value={4} hint="enviados" intent="brand" />
            <Kpi label="Esta semana" value={12} intent="neutral" />
            <Kpi label="Apertura prom." value="92%" hint="leídos" intent="ok" />
            <Kpi label="Tu sección" value="Operativa" hint="22 personas" intent="brand" />
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
                <Users size={11} className="mr-1 inline" />
                Audiencia
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
                      {a.count}
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
                  if (errors.titulo) setErrors((e) => ({ ...e, titulo: '' }));
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
                    className="grid h-7 w-7 place-items-center rounded text-slate-600 hover:bg-white"
                  >
                    <Bold size={12} />
                  </button>
                  <button
                    type="button"
                    className="grid h-7 w-7 place-items-center rounded text-slate-600 hover:bg-white"
                  >
                    <Italic size={12} />
                  </button>
                  <button
                    type="button"
                    className="grid h-7 w-7 place-items-center rounded text-slate-600 hover:bg-white"
                  >
                    <List size={12} />
                  </button>
                  <button
                    type="button"
                    className="grid h-7 w-7 place-items-center rounded text-slate-600 hover:bg-white"
                  >
                    <Paperclip size={12} />
                  </button>
                </div>
                <textarea
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
                  {cuerpo.length} caracteres · Markdown soportado · mín. 20
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
                    <Send size={16} /> Enviar a {audienciaSel.count} personas
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
              <div className="mb-2 text-xs font-bold uppercase text-slate-500">Preview</div>
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
                <div className="mt-3 text-[10px] text-slate-400">
                  Mariana Pereyra · Comandante · Hoy
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="mb-2 text-xs font-bold uppercase text-slate-500">
                Llegará a {audienciaSel.count} personas
              </div>
              <div className="flex flex-wrap -space-x-2">
                {Array.from({ length: Math.min(audienciaSel.count, 12) }).map((_, idx) => (
                  <Avatar
                    key={idx}
                    name={`Persona ${idx}`}
                    size={28}
                    className="ring-2 ring-white"
                  />
                ))}
                {audienciaSel.count > 12 && (
                  <div className="grid h-7 w-7 place-items-center rounded-full bg-slate-200 text-[10px] font-bold text-slate-700 ring-2 ring-white">
                    +{audienciaSel.count - 12}
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
            <h3 className="font-bold text-slate-900">Broadcasts recientes</h3>
          </div>
          <ul className="divide-y divide-slate-100">
            {RECIENTES.map((b, idx) => {
              const pctLeidos = Math.round((b.leidos / b.destinatarios) * 100);
              return (
                <motion.li
                  key={b.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="flex items-center gap-3 p-4"
                >
                  <div className="bg-brand-100 text-brand-700 grid h-10 w-10 shrink-0 place-items-center rounded-xl">
                    <Megaphone size={16} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-slate-900">{b.titulo}</span>
                      <Badge intent="neutral">
                        {AUDIENCIAS.find((a) => a.id === b.audiencia)?.label}
                      </Badge>
                    </div>
                    <div className="mt-0.5 flex items-center gap-2 text-xs text-slate-500">
                      <Clock size={10} />
                      <span>{b.enviado}</span>
                      <span>·</span>
                      <span>{b.destinatarios} destinatarios</span>
                    </div>
                  </div>
                  <div className="hidden shrink-0 items-center gap-3 sm:flex">
                    <div className="text-center">
                      <div className="text-status-ok-fg flex items-center gap-1 text-xs">
                        <Eye size={11} /> {pctLeidos}%
                      </div>
                      <div className="text-[10px] text-slate-500">leídos</div>
                    </div>
                    <div className="text-center">
                      <div className="text-brand-700 flex items-center gap-1 text-xs">
                        <CheckCheck size={11} /> {b.respondieron}
                      </div>
                      <div className="text-[10px] text-slate-500">respondieron</div>
                    </div>
                  </div>
                </motion.li>
              );
            })}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
