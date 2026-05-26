'use client';

import { GraduationCap } from 'lucide-react';
import { useState } from 'react';

import { Button, Dialog, Input, Label, useToast } from '@faro/ui';

interface CursoNuevo {
  nombre: string;
  centro: string;
  cuposMax: number;
  fechaInicio: string;
  fechaFin: string;
  horas: number;
  modalidad: 'presencial' | 'online' | 'hibrida';
  obligatorio: boolean;
  certificadora: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated?: (curso: CursoNuevo) => void;
}

const CERTIFICADORAS = [
  'Academia Nacional de Bomberos (ANB)',
  'CEPROS',
  'IFSAC',
  'Pro Board',
  'Federación Bonaerense',
  'Federación Cordobesa',
  'Federación Santafesina',
  'Cuartel · interno',
];

export function NuevoCursoDialog({ open, onClose, onCreated }: Props) {
  const toast = useToast();
  const [errors, setErrors] = useState<Record<string, string>>({});

  const hoy = new Date().toISOString().slice(0, 10);
  const en30d = new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10);

  const [data, setData] = useState<CursoNuevo>({
    nombre: '',
    centro: 'Cuartel Villa Ballester',
    cuposMax: 16,
    fechaInicio: hoy,
    fechaFin: en30d,
    horas: 40,
    modalidad: 'presencial',
    obligatorio: false,
    certificadora: 'Academia Nacional de Bomberos (ANB)',
  });

  function close() {
    setErrors({});
    onClose();
  }

  function guardar() {
    const errs: Record<string, string> = {};
    if (data.nombre.trim().length < 5) errs.nombre = 'Nombre mínimo 5 caracteres';
    if (data.cuposMax < 1) errs.cuposMax = 'Al menos 1 cupo';
    if (data.cuposMax > 200) errs.cuposMax = 'Máximo 200 cupos';
    if (new Date(data.fechaFin) <= new Date(data.fechaInicio)) {
      errs.fechaFin = 'Debe ser posterior al inicio';
    }
    if (data.horas < 4) errs.horas = 'Mínimo 4 horas';

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      toast.push({
        kind: 'warn',
        title: 'Revisá el formulario',
        description: Object.values(errs)[0],
      });
      return;
    }
    setErrors({});
    onCreated?.(data);
    toast.push({
      kind: 'success',
      title: `Curso "${data.nombre}" creado`,
      description: `${data.cuposMax} cupos · ${data.horas} hs · inicia ${new Date(data.fechaInicio).toLocaleDateString('es-AR')}`,
    });
    close();
  }

  return (
    <Dialog
      open={open}
      onClose={close}
      title="Nuevo curso"
      description="Programá una capacitación interna o externa"
      size="lg"
      footer={
        <div className="flex justify-end gap-2">
          <Button intent="ghost" onClick={close}>
            Cancelar
          </Button>
          <Button intent="primary" onClick={guardar}>
            <GraduationCap size={14} /> Crear curso
          </Button>
        </div>
      }
    >
      <div className="space-y-3">
        <div>
          <Label>Nombre del curso *</Label>
          <Input
            value={data.nombre}
            onChange={(e) => setData({ ...data, nombre: e.target.value })}
            placeholder="Rescate vehicular avanzado"
            aria-invalid={!!errors.nombre}
          />
          {errors.nombre && (
            <p className="text-status-risk-fg mt-1 text-xs font-medium">{errors.nombre}</p>
          )}
        </div>

        <div>
          <Label>Certificadora *</Label>
          <select
            value={data.certificadora}
            onChange={(e) => setData({ ...data, certificadora: e.target.value })}
            className="focus:border-brand-400 mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2"
          >
            {CERTIFICADORAS.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <Label>Modalidad *</Label>
            <select
              value={data.modalidad}
              onChange={(e) =>
                setData({ ...data, modalidad: e.target.value as CursoNuevo['modalidad'] })
              }
              className="focus:border-brand-400 mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2"
            >
              <option value="presencial">Presencial</option>
              <option value="online">Online</option>
              <option value="hibrida">Híbrida</option>
            </select>
          </div>
          <div>
            <Label>Horas *</Label>
            <Input
              type="number"
              value={data.horas}
              onChange={(e) => setData({ ...data, horas: Number(e.target.value) })}
              aria-invalid={!!errors.horas}
            />
            {errors.horas && (
              <p className="text-status-risk-fg mt-1 text-xs font-medium">{errors.horas}</p>
            )}
          </div>
          <div>
            <Label>Cupos *</Label>
            <Input
              type="number"
              value={data.cuposMax}
              onChange={(e) => setData({ ...data, cuposMax: Number(e.target.value) })}
              aria-invalid={!!errors.cuposMax}
            />
            {errors.cuposMax && (
              <p className="text-status-risk-fg mt-1 text-xs font-medium">{errors.cuposMax}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Fecha inicio *</Label>
            <Input
              type="date"
              value={data.fechaInicio}
              onChange={(e) => setData({ ...data, fechaInicio: e.target.value })}
            />
          </div>
          <div>
            <Label>Fecha fin *</Label>
            <Input
              type="date"
              value={data.fechaFin}
              onChange={(e) => setData({ ...data, fechaFin: e.target.value })}
              aria-invalid={!!errors.fechaFin}
            />
            {errors.fechaFin && (
              <p className="text-status-risk-fg mt-1 text-xs font-medium">{errors.fechaFin}</p>
            )}
          </div>
        </div>

        <div>
          <Label>Lugar / Sede</Label>
          <Input
            value={data.centro}
            onChange={(e) => setData({ ...data, centro: e.target.value })}
            placeholder="Cuartel Villa Ballester · Av. Alvear 4250"
          />
        </div>

        <label className="bg-status-warn-bg/30 flex cursor-pointer items-start gap-2 rounded-lg p-3 text-sm">
          <input
            type="checkbox"
            checked={data.obligatorio}
            onChange={(e) => setData({ ...data, obligatorio: e.target.checked })}
            className="mt-0.5 h-4 w-4"
          />
          <span>
            <strong className="text-status-warn-fg">Curso obligatorio</strong>
            <span className="block text-xs text-slate-600">
              Bloqueante: quienes no lo completen pierden disponibilidad operativa hasta hacerlo.
            </span>
          </span>
        </label>

        <div className="bg-brand-50 text-brand-900 rounded-lg p-3 text-xs">
          <strong>Próximo paso:</strong> al crear, la app notifica por broadcast a quienes puedan
          inscribirse (según rango + skill matrix).
        </div>
      </div>
    </Dialog>
  );
}
