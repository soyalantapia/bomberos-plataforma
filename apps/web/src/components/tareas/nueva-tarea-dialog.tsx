'use client';

import { useMemo, useState } from 'react';

import { Button, Dialog, Input, Label, Textarea, useToast } from '@faro/ui';

import type { PrioridadTarea } from '@faro/types';

import { selectCuartelActivo, useFaroStore } from '../../store/use-faro-store';

const selectCls =
  'focus:border-brand-400 focus:ring-brand-100 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2';

export function NuevaTareaDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const toast = useToast();
  const cuartel = useFaroStore(selectCuartelActivo);
  const sesion = useFaroStore((s) => s.sesion);
  const personas = useFaroStore((s) => s.personas);
  const sectores = useFaroStore((s) => s.sectores);
  const crearTarea = useFaroStore((s) => s.crearTarea);

  const personasCuartel = useMemo(
    () =>
      personas
        .filter((p) => p.cuartelId === cuartel?.id && p.estado === 'activo')
        .sort((a, b) => a.apellido.localeCompare(b.apellido)),
    [personas, cuartel?.id],
  );
  const sectoresCuartel = useMemo(
    () => sectores.filter((s) => s.cuartelId === cuartel?.id),
    [sectores, cuartel?.id],
  );

  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [asignadaA, setAsignadaA] = useState('');
  const [sectorId, setSectorId] = useState('');
  const [prioridad, setPrioridad] = useState<PrioridadTarea>('media');
  const [vencimiento, setVencimiento] = useState('');

  function reset() {
    setTitulo('');
    setDescripcion('');
    setAsignadaA('');
    setSectorId('');
    setPrioridad('media');
    setVencimiento('');
  }

  function handleSubmit() {
    if (!titulo.trim()) {
      toast.push({
        kind: 'warn',
        title: 'Falta el título',
        description: 'Describí qué hay que hacer.',
      });
      return;
    }
    if (!asignadaA) {
      toast.push({
        kind: 'warn',
        title: 'Falta el responsable',
        description: 'Asigná la tarea a alguien.',
      });
      return;
    }
    if (!cuartel || !sesion) return;
    crearTarea({
      cuartelId: cuartel.id,
      sectorId: sectorId || undefined,
      titulo: titulo.trim(),
      descripcion: descripcion.trim() || undefined,
      asignadaA,
      asignadaPor: sesion.personaId,
      vencimiento: vencimiento || undefined,
      prioridad,
    });
    const persona = personasCuartel.find((p) => p.id === asignadaA);
    toast.push({
      kind: 'success',
      title: 'Tarea asignada',
      description: persona ? `Se notificó a ${persona.nombre} ${persona.apellido}.` : 'Notificada.',
    });
    reset();
    onClose();
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Asignar tarea"
      description="Queda registrada con fecha, hora y quién la asignó. La persona recibe la notificación."
      size="md"
      footer={
        <div className="flex justify-end gap-2">
          <Button intent="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button intent="primary" onClick={handleSubmit}>
            Asignar tarea
          </Button>
        </div>
      }
    >
      <div className="space-y-3">
        <div>
          <Label htmlFor="t-titulo">Tarea</Label>
          <Input
            id="t-titulo"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            placeholder="Ej: cambiar las lamparitas del depósito"
            autoFocus
          />
        </div>
        <div>
          <Label htmlFor="t-desc">Detalle (opcional)</Label>
          <Textarea
            id="t-desc"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            placeholder="Aclaraciones, ubicación, materiales…"
            rows={2}
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <Label htmlFor="t-asig">Responsable</Label>
            <select
              id="t-asig"
              className={selectCls}
              value={asignadaA}
              onChange={(e) => setAsignadaA(e.target.value)}
            >
              <option value="">Elegir persona…</option>
              {personasCuartel.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.apellido}, {p.nombre}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="t-sector">Sector</Label>
            <select
              id="t-sector"
              className={selectCls}
              value={sectorId}
              onChange={(e) => setSectorId(e.target.value)}
            >
              <option value="">Sin sector</option>
              {sectoresCuartel.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nombre}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="t-prio">Prioridad</Label>
            <select
              id="t-prio"
              className={selectCls}
              value={prioridad}
              onChange={(e) => setPrioridad(e.target.value as PrioridadTarea)}
            >
              <option value="alta">Alta</option>
              <option value="media">Media</option>
              <option value="baja">Baja</option>
            </select>
          </div>
          <div>
            <Label htmlFor="t-venc">Vencimiento (opcional)</Label>
            <Input
              id="t-venc"
              type="date"
              value={vencimiento}
              onChange={(e) => setVencimiento(e.target.value)}
            />
          </div>
        </div>
      </div>
    </Dialog>
  );
}
