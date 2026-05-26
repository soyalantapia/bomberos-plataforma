'use client';

import { Droplets, MapPin } from 'lucide-react';
import { useState } from 'react';

import { Button, Dialog, Input, Label, useToast } from '@faro/ui';

interface HidranteNuevo {
  codigo: string;
  direccion: string;
  lat: number;
  lng: number;
  tipo: 'rojo_70mm' | 'amarillo_100mm' | 'azul_150mm' | 'verde_200mm';
  caudal: number;
  presion: number;
  proveedor: 'ABSA' | 'AySA' | 'Municipal';
}

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated?: (h: HidranteNuevo) => void;
}

const TIPOS: Array<{ value: HidranteNuevo['tipo']; label: string; caudal: number }> = [
  { value: 'rojo_70mm', label: 'Rojo · 70mm · <500 L/m', caudal: 400 },
  { value: 'amarillo_100mm', label: 'Amarillo · 100mm · 500-1000 L/m', caudal: 800 },
  { value: 'azul_150mm', label: 'Azul · 150mm · 1000-1500 L/m', caudal: 1300 },
  { value: 'verde_200mm', label: 'Verde · 200mm · >1500 L/m', caudal: 1800 },
];

export function NuevoHidranteDialog({ open, onClose, onCreated }: Props) {
  const toast = useToast();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [data, setData] = useState<HidranteNuevo>({
    codigo: '',
    direccion: '',
    lat: -34.5476,
    lng: -58.5556,
    tipo: 'azul_150mm',
    caudal: 1300,
    presion: 5.0,
    proveedor: 'ABSA',
  });

  function reset() {
    setErrors({});
    setData({
      codigo: '',
      direccion: '',
      lat: -34.5476,
      lng: -58.5556,
      tipo: 'azul_150mm',
      caudal: 1300,
      presion: 5.0,
      proveedor: 'ABSA',
    });
  }

  function close() {
    reset();
    onClose();
  }

  function autoCoord() {
    // Mock geolocation
    const lat = -34.5476 + (Math.random() - 0.5) * 0.02;
    const lng = -58.5556 + (Math.random() - 0.5) * 0.02;
    setData({ ...data, lat, lng });
    toast.push({
      kind: 'info',
      title: 'Coordenadas detectadas',
      description: `Geolocalización aproximada · ${lat.toFixed(4)}, ${lng.toFixed(4)}`,
    });
  }

  function guardar() {
    const errs: Record<string, string> = {};
    if (!/^H-[A-Z]{2,3}-\d{3,4}$/i.test(data.codigo)) {
      errs.codigo = 'Formato H-VB-0001';
    }
    if (data.direccion.trim().length < 5) errs.direccion = 'Mínimo 5 caracteres';
    if (data.caudal < 100 || data.caudal > 3000) errs.caudal = 'Entre 100 y 3000 L/min';
    if (data.presion < 1 || data.presion > 10) errs.presion = 'Entre 1 y 10 bar';

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
      title: `Hidrante ${data.codigo} cargado`,
      description: `${data.caudal} L/min · ${data.presion} bar · ${data.proveedor}`,
    });
    close();
  }

  return (
    <Dialog
      open={open}
      onClose={close}
      title="Nuevo hidrante"
      description="Datos del hidrante para sumarlo al mapa del cuartel"
      size="lg"
      footer={
        <div className="flex justify-end gap-2">
          <Button intent="ghost" onClick={close}>
            Cancelar
          </Button>
          <Button intent="primary" onClick={guardar}>
            <Droplets size={14} /> Crear hidrante
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
              onChange={(e) => setData({ ...data, codigo: e.target.value.toUpperCase() })}
              placeholder="H-VB-0009"
              maxLength={12}
              className="font-mono uppercase"
              aria-invalid={!!errors.codigo}
            />
            {errors.codigo && (
              <p className="text-status-risk-fg mt-1 text-xs font-medium">{errors.codigo}</p>
            )}
          </div>
          <div>
            <Label>Prestadora *</Label>
            <select
              value={data.proveedor}
              onChange={(e) =>
                setData({ ...data, proveedor: e.target.value as HidranteNuevo['proveedor'] })
              }
              className="focus:border-brand-400 mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2"
            >
              <option>ABSA</option>
              <option>AySA</option>
              <option>Municipal</option>
            </select>
          </div>
        </div>

        <div>
          <Label>Dirección *</Label>
          <Input
            value={data.direccion}
            onChange={(e) => setData({ ...data, direccion: e.target.value })}
            placeholder="Av. Alvear 4250"
            aria-invalid={!!errors.direccion}
          />
          {errors.direccion && (
            <p className="text-status-risk-fg mt-1 text-xs font-medium">{errors.direccion}</p>
          )}
        </div>

        <div>
          <Label>Tipo (código NFPA 291) *</Label>
          <select
            value={data.tipo}
            onChange={(e) => {
              const tipo = e.target.value as HidranteNuevo['tipo'];
              const config = TIPOS.find((t) => t.value === tipo);
              setData({ ...data, tipo, caudal: config?.caudal ?? data.caudal });
            }}
            className="focus:border-brand-400 mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2"
          >
            {TIPOS.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Caudal (L/min) *</Label>
            <Input
              type="number"
              value={data.caudal}
              onChange={(e) => setData({ ...data, caudal: Number(e.target.value) })}
              aria-invalid={!!errors.caudal}
            />
            {errors.caudal && (
              <p className="text-status-risk-fg mt-1 text-xs font-medium">{errors.caudal}</p>
            )}
          </div>
          <div>
            <Label>Presión (bar) *</Label>
            <Input
              type="number"
              step="0.1"
              value={data.presion}
              onChange={(e) => setData({ ...data, presion: Number(e.target.value) })}
              aria-invalid={!!errors.presion}
            />
            {errors.presion && (
              <p className="text-status-risk-fg mt-1 text-xs font-medium">{errors.presion}</p>
            )}
          </div>
        </div>

        <div>
          <Label>Coordenadas GPS</Label>
          <div className="mt-1 flex items-center gap-2">
            <Input
              type="number"
              step="0.0001"
              value={data.lat}
              onChange={(e) => setData({ ...data, lat: Number(e.target.value) })}
              placeholder="-34.5476"
              className="flex-1"
            />
            <Input
              type="number"
              step="0.0001"
              value={data.lng}
              onChange={(e) => setData({ ...data, lng: Number(e.target.value) })}
              placeholder="-58.5556"
              className="flex-1"
            />
            <Button intent="secondary" size="sm" onClick={autoCoord}>
              <MapPin size={14} />
            </Button>
          </div>
        </div>

        <div className="bg-brand-50 text-brand-900 rounded-lg p-3 text-xs">
          <strong>Pista:</strong> al cargar el caudal, el color del hidrante se elige solo según el
          estándar internacional.
        </div>
      </div>
    </Dialog>
  );
}
