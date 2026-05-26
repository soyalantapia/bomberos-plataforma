'use client';

import { Truck } from 'lucide-react';
import { useState } from 'react';

import type { Movil } from '@faro/types';

import { Button, Dialog, Input, Label, useToast } from '@faro/ui';

import { selectCuartelActivo, useFaroStore } from '../../store/use-faro-store';

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated?: (movil: Movil) => void;
}

const TIPOS: Array<{ value: Movil['tipo']; label: string }> = [
  { value: 'autobomba', label: 'Autobomba' },
  { value: 'rescate', label: 'Rescate' },
  { value: 'forestal', label: 'Forestal' },
  { value: 'ambulancia', label: 'Ambulancia' },
  { value: 'utilitario', label: 'Utilitario' },
];

export function NuevoMovilDialog({ open, onClose, onCreated }: Props) {
  const cuartel = useFaroStore(selectCuartelActivo);
  const crear = useFaroStore((s) => s.crearMovil);
  const toast = useToast();

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [data, setData] = useState({
    codigo: '',
    tipo: 'autobomba' as Movil['tipo'],
    marca: '',
    modelo: '',
    dominio: '',
    anio: new Date().getFullYear(),
    vtvVencimiento: new Date(Date.now() + 365 * 86400000).toISOString().slice(0, 10),
  });

  function reset() {
    setErrors({});
    setData({
      codigo: '',
      tipo: 'autobomba',
      marca: '',
      modelo: '',
      dominio: '',
      anio: new Date().getFullYear(),
      vtvVencimiento: new Date(Date.now() + 365 * 86400000).toISOString().slice(0, 10),
    });
  }

  function close() {
    reset();
    onClose();
  }

  function validar(): boolean {
    const errs: Record<string, string> = {};
    if (!/^[A-Z]{2,3}-?\d{1,4}$/i.test(data.codigo)) {
      errs.codigo = 'Formato BV-3 o BV3 (siglas + número)';
    }
    if (data.marca.trim().length < 2) errs.marca = 'Mínimo 2 caracteres';
    if (data.modelo.trim().length < 2) errs.modelo = 'Mínimo 2 caracteres';
    if (!/^(([A-Z]{3}\d{3})|([A-Z]{2}\d{3}[A-Z]{2}))$/i.test(data.dominio.replace(/\s+/g, ''))) {
      errs.dominio = 'Formato AAA111 o AA111AA';
    }
    if (data.anio < 1980 || data.anio > new Date().getFullYear() + 1) {
      errs.anio = `Año entre 1980 y ${new Date().getFullYear() + 1}`;
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function guardar() {
    if (!cuartel) return;
    if (!validar()) {
      toast.push({
        kind: 'warn',
        title: 'Revisá el formulario',
        description: Object.values(errors)[0] ?? 'Hay campos con error',
      });
      return;
    }
    const movil = crear({
      ...data,
      dominio: data.dominio.toUpperCase().replace(/\s+/g, ''),
      cuartelId: cuartel.id,
      enServicio: true,
      horasServicio: 0,
    });
    toast.push({
      kind: 'success',
      title: `Móvil ${movil.codigo} dado de alta`,
      description: `${movil.marca} ${movil.modelo} · ${movil.dominio}`,
    });
    onCreated?.(movil);
    close();
  }

  return (
    <Dialog
      open={open}
      onClose={close}
      title="Nuevo móvil"
      description="Datos básicos del móvil que se suma a la flota"
      size="lg"
      footer={
        <div className="flex justify-end gap-2">
          <Button intent="ghost" onClick={close}>
            Cancelar
          </Button>
          <Button intent="primary" onClick={guardar}>
            <Truck size={14} /> Crear móvil
          </Button>
        </div>
      }
    >
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Código *</Label>
            <Input
              value={data.codigo}
              onChange={(e) => setData({ ...data, codigo: e.target.value })}
              placeholder="BV-3"
              maxLength={6}
              aria-invalid={!!errors.codigo}
            />
            {errors.codigo && (
              <p className="text-status-risk-fg mt-1 text-xs font-medium">{errors.codigo}</p>
            )}
          </div>
          <div>
            <Label>Tipo *</Label>
            <select
              value={data.tipo}
              onChange={(e) => setData({ ...data, tipo: e.target.value as Movil['tipo'] })}
              className="focus:border-brand-400 mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2"
            >
              {TIPOS.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Marca *</Label>
            <Input
              value={data.marca}
              onChange={(e) => setData({ ...data, marca: e.target.value })}
              placeholder="Mercedes-Benz"
              aria-invalid={!!errors.marca}
            />
            {errors.marca && (
              <p className="text-status-risk-fg mt-1 text-xs font-medium">{errors.marca}</p>
            )}
          </div>
          <div>
            <Label>Modelo *</Label>
            <Input
              value={data.modelo}
              onChange={(e) => setData({ ...data, modelo: e.target.value })}
              placeholder="Atego 1725"
              aria-invalid={!!errors.modelo}
            />
            {errors.modelo && (
              <p className="text-status-risk-fg mt-1 text-xs font-medium">{errors.modelo}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Dominio *</Label>
            <Input
              value={data.dominio}
              onChange={(e) => setData({ ...data, dominio: e.target.value.toUpperCase() })}
              placeholder="AB123CD"
              maxLength={7}
              className="font-mono uppercase"
              aria-invalid={!!errors.dominio}
            />
            {errors.dominio && (
              <p className="text-status-risk-fg mt-1 text-xs font-medium">{errors.dominio}</p>
            )}
          </div>
          <div>
            <Label>Año *</Label>
            <Input
              type="number"
              value={data.anio}
              onChange={(e) => setData({ ...data, anio: Number(e.target.value) })}
              aria-invalid={!!errors.anio}
            />
            {errors.anio && (
              <p className="text-status-risk-fg mt-1 text-xs font-medium">{errors.anio}</p>
            )}
          </div>
        </div>

        <div>
          <Label>Vencimiento VTV</Label>
          <Input
            type="date"
            value={data.vtvVencimiento}
            onChange={(e) => setData({ ...data, vtvVencimiento: e.target.value })}
          />
        </div>

        <div className="bg-brand-50 text-brand-900 rounded-lg p-3 text-xs">
          <strong>Tip:</strong> después de crear el móvil, podés cargar las revisiones de
          pre-servicio, programar mantenimientos y ver su historia desde la ficha.
        </div>
      </div>
    </Dialog>
  );
}
