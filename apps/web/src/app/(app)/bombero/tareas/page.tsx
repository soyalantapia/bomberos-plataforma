'use client';

import { motion } from 'framer-motion';
import { Ban, CheckCircle2, ClipboardList, Hand, Play } from 'lucide-react';
import { useMemo, useState } from 'react';

import { Badge, Button, Card, CardContent, Dialog, Textarea, cn, useToast } from '@faro/ui';

import {
  ESTADO_TAREA,
  PRIORIDAD_TAREA,
  estaVencida,
  fechaCorta,
} from '../../../../components/tareas/utils';
import { demoToday } from '../../../../lib/utils/demo-today';
import { selectPersonaActual, useFaroStore } from '../../../../store/use-faro-store';

type AccionDialog = { tareaId: string; modo: 'hecha' | 'bloqueo' } | null;

export default function MisTareasPage() {
  const toast = useToast();
  const yo = useFaroStore(selectPersonaActual);
  const tareas = useFaroStore((s) => s.tareas);
  const sectores = useFaroStore((s) => s.sectores);
  const tomarTarea = useFaroStore((s) => s.tomarTarea);
  const marcarTareaHecha = useFaroStore((s) => s.marcarTareaHecha);
  const bloquearTarea = useFaroStore((s) => s.bloquearTarea);

  const [accion, setAccion] = useState<AccionDialog>(null);
  const [texto, setTexto] = useState('');

  const hoy = useMemo(() => demoToday(), []);
  const sectorById = useMemo(() => new Map(sectores.map((s) => [s.id, s])), [sectores]);

  const mias = useMemo(
    () =>
      tareas
        .filter((t) => t.asignadaA === yo?.id)
        .sort((a, b) => b.creadaEn.localeCompare(a.creadaEn)),
    [tareas, yo?.id],
  );
  const pendientes = mias.filter((t) => t.estado !== 'validada' && t.estado !== 'hecha');
  const enRevision = mias.filter((t) => t.estado === 'hecha');
  const cerradas = mias.filter((t) => t.estado === 'validada');

  function confirmar() {
    if (!accion) return;
    if (accion.modo === 'bloqueo') {
      if (texto.trim().length < 5) {
        toast.push({
          kind: 'warn',
          title: 'Contá qué pasó',
          description: 'Escribí el motivo del bloqueo.',
        });
        return;
      }
      bloquearTarea(accion.tareaId, texto.trim());
      toast.push({
        kind: 'warn',
        title: 'Reportaste el bloqueo',
        description: 'Se avisó a quien te asignó la tarea.',
      });
    } else {
      marcarTareaHecha(accion.tareaId, texto.trim() || undefined);
      toast.push({
        kind: 'success',
        title: 'Marcada como hecha',
        description: 'Queda pendiente de validación del jefe.',
      });
    }
    setAccion(null);
    setTexto('');
  }

  function CardTarea({ tareaId }: { tareaId: string }) {
    const t = mias.find((x) => x.id === tareaId)!;
    const sector = t.sectorId ? sectorById.get(t.sectorId) : undefined;
    const est = ESTADO_TAREA[t.estado];
    const prio = PRIORIDAD_TAREA[t.prioridad];
    const vencida = estaVencida(t.vencimiento, t.estado, hoy);
    const puedeTomar = t.estado === 'asignada' || t.estado === 'reabierta';
    const puedeAvanzar = t.estado !== 'validada';
    return (
      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
        <Card>
          <CardContent className="p-3.5">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <div className="font-semibold text-slate-900">{t.titulo}</div>
                {t.descripcion && (
                  <div className="mt-0.5 text-xs text-slate-500">{t.descripcion}</div>
                )}
              </div>
              <Badge intent={est.intent}>{est.label}</Badge>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
              {sector && <span className="font-medium text-slate-600">{sector.nombre}</span>}
              {t.vencimiento && (
                <span className={cn(vencida && 'text-status-risk-fg font-semibold')}>
                  vence {fechaCorta(t.vencimiento)}
                  {vencida && ' (vencida)'}
                </span>
              )}
              <Badge intent={prio.intent}>{prio.label}</Badge>
            </div>

            {t.estado === 'bloqueada' && t.motivoBloqueo && (
              <div className="bg-status-risk-bg/40 text-status-risk-fg mt-2 rounded-lg px-2.5 py-1.5 text-xs">
                <strong>Reportaste:</strong> {t.motivoBloqueo}
              </div>
            )}
            {t.estado === 'reabierta' && (
              <div className="bg-status-warn-bg/40 text-status-warn-fg mt-2 rounded-lg px-2.5 py-1.5 text-xs">
                El jefe la reabrió. Revisá y volvé a marcarla.
              </div>
            )}

            {puedeAvanzar && (
              <div className="mt-2.5 flex flex-wrap gap-2">
                {puedeTomar && (
                  <Button intent="secondary" size="sm" onClick={() => tomarTarea(t.id)}>
                    <Play size={14} /> Tomar
                  </Button>
                )}
                <Button
                  intent="primary"
                  size="sm"
                  onClick={() => {
                    setTexto('');
                    setAccion({ tareaId: t.id, modo: 'hecha' });
                  }}
                >
                  <CheckCircle2 size={14} /> Marcar hecha
                </Button>
                {t.estado !== 'bloqueada' && (
                  <Button
                    intent="ghost"
                    size="sm"
                    onClick={() => {
                      setTexto('');
                      setAccion({ tareaId: t.id, modo: 'bloqueo' });
                    }}
                  >
                    <Hand size={14} /> Me falta algo
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <>
      <div className="mx-auto max-w-3xl space-y-5">
        <header className="flex items-center gap-3">
          <div className="bg-fire-50 text-fire-700 grid h-11 w-11 place-items-center rounded-xl">
            <ClipboardList size={22} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Mis tareas</h1>
            <p className="text-xs text-slate-500">
              {pendientes.length} por hacer · {enRevision.length} a validar
            </p>
          </div>
        </header>

        {mias.length === 0 && (
          <Card>
            <CardContent className="grid place-items-center gap-2 py-12 text-center">
              <CheckCircle2 size={28} className="text-status-ok" />
              <div className="text-sm text-slate-500">No tenés tareas asignadas. ¡Al día!</div>
            </CardContent>
          </Card>
        )}

        {pendientes.length > 0 && (
          <section className="space-y-2">
            <h2 className="px-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Por hacer
            </h2>
            {pendientes.map((t) => (
              <CardTarea key={t.id} tareaId={t.id} />
            ))}
          </section>
        )}

        {enRevision.length > 0 && (
          <section className="space-y-2">
            <h2 className="px-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Esperando validación
            </h2>
            {enRevision.map((t) => (
              <CardTarea key={t.id} tareaId={t.id} />
            ))}
          </section>
        )}

        {cerradas.length > 0 && (
          <section className="space-y-2">
            <h2 className="px-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Validadas
            </h2>
            {cerradas.map((t) => (
              <CardTarea key={t.id} tareaId={t.id} />
            ))}
          </section>
        )}
      </div>

      <Dialog
        open={!!accion}
        onClose={() => setAccion(null)}
        title={accion?.modo === 'bloqueo' ? '¿Qué te falta?' : 'Marcar como hecha'}
        description={
          accion?.modo === 'bloqueo'
            ? 'Contá qué necesitás (herramientas, materiales, una orden). Queda registrado y se avisa a quien te asignó la tarea.'
            : 'Podés dejar un comentario de cómo quedó (opcional). El jefe la valida.'
        }
        size="sm"
        footer={
          <div className="flex justify-end gap-2">
            <Button intent="ghost" onClick={() => setAccion(null)}>
              Cancelar
            </Button>
            <Button
              intent={accion?.modo === 'bloqueo' ? 'secondary' : 'primary'}
              onClick={confirmar}
            >
              {accion?.modo === 'bloqueo' ? (
                <>
                  <Ban size={14} /> Reportar bloqueo
                </>
              ) : (
                <>
                  <CheckCircle2 size={14} /> Confirmar
                </>
              )}
            </Button>
          </div>
        }
      >
        <Textarea
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          rows={3}
          placeholder={
            accion?.modo === 'bloqueo'
              ? 'Ej: falta el repuesto / no tengo la orden de compra'
              : 'Ej: listo, quedó probado'
          }
          autoFocus
        />
      </Dialog>
    </>
  );
}
