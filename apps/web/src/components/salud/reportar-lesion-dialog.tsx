'use client';

import { useMemo, useState } from 'react';

import { Button, Dialog, Input, Label, Textarea, cn, useToast } from '@faro/ui';

import type { GravedadLesion } from '@faro/types';

import { selectCuartelActivo, useFaroStore } from '../../store/use-faro-store';

const selectCls =
  'focus:border-brand-400 focus:ring-brand-100 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2';

const GRAVEDADES: { id: GravedadLesion; label: string }[] = [
  { id: 'leve', label: 'Leve' },
  { id: 'moderada', label: 'Moderada' },
  { id: 'grave', label: 'Grave' },
];

export function ReportarLesionDialog({
  open,
  onClose,
  personaIdFijo,
}: {
  open: boolean;
  onClose: () => void;
  /** Si viene, el reporte es para esa persona (autorreporte del bombero). */
  personaIdFijo?: string;
}) {
  const toast = useToast();
  const cuartel = useFaroStore(selectCuartelActivo);
  const personas = useFaroStore((s) => s.personas);
  const servicios = useFaroStore((s) => s.servicios);
  const reportarLesion = useFaroStore((s) => s.reportarLesion);

  const personasCuartel = useMemo(
    () =>
      personas
        .filter((p) => p.cuartelId === cuartel?.id && p.estado === 'activo')
        .sort((a, b) => a.apellido.localeCompare(b.apellido)),
    [personas, cuartel?.id],
  );
  const serviciosCuartel = useMemo(
    () =>
      servicios
        .filter((s) => s.cuartelId === cuartel?.id)
        .sort((a, b) => b.horaSalida.localeCompare(a.horaSalida))
        .slice(0, 15),
    [servicios, cuartel?.id],
  );

  const [personaId, setPersonaId] = useState(personaIdFijo ?? '');
  const [servicioId, setServicioId] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [parteCuerpo, setParteCuerpo] = useState('');
  const [gravedad, setGravedad] = useState<GravedadLesion>('leve');
  const [requiereAtencion, setRequiereAtencion] = useState(false);
  const [art, setArt] = useState(false);
  const [derivadoA, setDerivadoA] = useState('');

  function reset() {
    setPersonaId(personaIdFijo ?? '');
    setServicioId('');
    setDescripcion('');
    setParteCuerpo('');
    setGravedad('leve');
    setRequiereAtencion(false);
    setArt(false);
    setDerivadoA('');
  }

  function handleSubmit() {
    const pid = personaIdFijo ?? personaId;
    if (!pid) {
      toast.push({ kind: 'warn', title: 'Falta el lesionado', description: 'Elegí a la persona.' });
      return;
    }
    if (descripcion.trim().length < 8) {
      toast.push({ kind: 'warn', title: 'Contá qué pasó', description: 'Describí la lesión.' });
      return;
    }
    if (!cuartel) return;
    reportarLesion({
      cuartelId: cuartel.id,
      personaId: pid,
      servicioId: servicioId || undefined,
      descripcion: descripcion.trim(),
      parteCuerpo: parteCuerpo.trim() || undefined,
      gravedad,
      requiereAtencion,
      art,
      derivadoA: derivadoA.trim() || undefined,
    });
    toast.push({
      kind: 'success',
      title: 'Lesión registrada',
      description: 'Queda la constancia y se avisa a la jefatura.',
    });
    reset();
    onClose();
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Reportar lesión"
      description="Queda una constancia con fecha y hora. Se avisa a la jefatura del cuerpo."
      size="md"
      footer={
        <div className="flex justify-end gap-2">
          <Button intent="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button intent="primary" onClick={handleSubmit}>
            Registrar
          </Button>
        </div>
      }
    >
      <div className="space-y-3">
        {!personaIdFijo && (
          <div>
            <Label htmlFor="l-persona">Lesionado</Label>
            <select
              id="l-persona"
              className={selectCls}
              value={personaId}
              onChange={(e) => setPersonaId(e.target.value)}
            >
              <option value="">Elegir persona…</option>
              {personasCuartel.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.apellido}, {p.nombre}
                </option>
              ))}
            </select>
          </div>
        )}
        <div>
          <Label htmlFor="l-desc">¿Qué pasó?</Label>
          <Textarea
            id="l-desc"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            rows={2}
            placeholder="Ej: torcedura al bajar de la autobomba"
            autoFocus
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <Label htmlFor="l-parte">Parte del cuerpo</Label>
            <Input
              id="l-parte"
              value={parteCuerpo}
              onChange={(e) => setParteCuerpo(e.target.value)}
              placeholder="Ej: tobillo derecho"
            />
          </div>
          <div>
            <Label htmlFor="l-serv">Intervención (opcional)</Label>
            <select
              id="l-serv"
              className={selectCls}
              value={servicioId}
              onChange={(e) => setServicioId(e.target.value)}
            >
              <option value="">Sin intervención</option>
              {serviciosCuartel.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.direccion} · {s.horaSalida.slice(0, 10)}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <Label>Gravedad</Label>
          <div className="flex gap-1 rounded-lg bg-slate-100 p-1">
            {GRAVEDADES.map((g) => (
              <button
                key={g.id}
                type="button"
                onClick={() => setGravedad(g.id)}
                className={cn(
                  'flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                  gravedad === g.id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600',
                )}
              >
                {g.label}
              </button>
            ))}
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => setRequiereAtencion((v) => !v)}
            className={cn(
              'flex items-center justify-between rounded-lg border px-3 py-2 text-sm transition-colors',
              requiereAtencion
                ? 'border-status-warn bg-status-warn-bg/40 text-status-warn-fg'
                : 'border-slate-200 text-slate-600',
            )}
          >
            Requiere atención médica
            <span className="font-semibold">{requiereAtencion ? 'Sí' : 'No'}</span>
          </button>
          <button
            type="button"
            onClick={() => setArt((v) => !v)}
            className={cn(
              'flex items-center justify-between rounded-lg border px-3 py-2 text-sm transition-colors',
              art
                ? 'border-brand-400 bg-brand-50 text-brand-700'
                : 'border-slate-200 text-slate-600',
            )}
          >
            Reportado a ART
            <span className="font-semibold">{art ? 'Sí' : 'No'}</span>
          </button>
        </div>
        {requiereAtencion && (
          <div>
            <Label htmlFor="l-deriv">Derivado a (opcional)</Label>
            <Input
              id="l-deriv"
              value={derivadoA}
              onChange={(e) => setDerivadoA(e.target.value)}
              placeholder="Hospital / centro médico"
            />
          </div>
        )}
      </div>
    </Dialog>
  );
}
