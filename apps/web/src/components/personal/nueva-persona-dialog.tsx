'use client';

import { Check, ChevronRight, UserPlus } from 'lucide-react';
import { useState } from 'react';

import type { Jerarquia, Persona } from '@faro/types';

import { Button, Dialog, Input, Label, cn, useToast } from '@faro/ui';

import { personaSchema, validate } from '../../lib/validation/schemas';
import { useFaroStore, selectCuartelActivo } from '../../store/use-faro-store';

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated?: (persona: Persona) => void;
}

type Paso = 1 | 2 | 3;

const JERARQUIAS: Array<{ value: Jerarquia; label: string }> = [
  { value: 'cadete', label: 'Cadete' },
  { value: 'bombero', label: 'Bombero' },
  { value: 'bombero_1ra', label: 'Bombero 1ra' },
  { value: 'cabo', label: 'Cabo' },
  { value: 'sargento', label: 'Sargento' },
  { value: 'sargento_ayudante', label: 'Sargento Ayudante' },
  { value: 'oficial', label: 'Oficial' },
  { value: 'sub_comandante', label: 'Subcomandante' },
  { value: 'comandante', label: 'Comandante' },
  { value: 'jefe', label: 'Jefe' },
];

export function NuevaPersonaDialog({ open, onClose, onCreated }: Props) {
  const cuartel = useFaroStore(selectCuartelActivo);
  const crear = useFaroStore((s) => s.crearPersona);
  const toast = useToast();

  const [paso, setPaso] = useState<Paso>(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [data, setData] = useState({
    nombre: '',
    apellido: '',
    legajo: '',
    dni: '',
    email: '',
    telefono: '',
    jerarquia: 'cadete' as Jerarquia,
    funcion: 'Cadete',
    fechaIngreso: new Date().toISOString().slice(0, 10),
  });

  function reset() {
    setPaso(1);
    setErrors({});
    setData({
      nombre: '',
      apellido: '',
      legajo: '',
      dni: '',
      email: '',
      telefono: '',
      jerarquia: 'cadete',
      funcion: 'Cadete',
      fechaIngreso: new Date().toISOString().slice(0, 10),
    });
  }

  function close() {
    reset();
    onClose();
  }

  function siguiente() {
    if (paso === 1) {
      const r = validate(personaSchema, {
        nombre: data.nombre,
        apellido: data.apellido,
        legajo: data.legajo,
        email: data.email,
        telefono: data.telefono,
        dni: data.dni,
      });
      if (!r.ok) {
        setErrors(r.errors);
        return;
      }
      setErrors({});
      setPaso(2);
    } else if (paso === 2) {
      setPaso(3);
    }
  }

  function anterior() {
    if (paso > 1) setPaso(((paso as number) - 1) as Paso);
  }

  function guardar() {
    if (!cuartel) return;
    const persona = crear({
      nombre: data.nombre,
      apellido: data.apellido,
      legajo: data.legajo,
      email: data.email || '',
      telefono: data.telefono || '',
      fechaNacimiento: '1990-01-01',
      fechaIngreso: data.fechaIngreso,
      jerarquia: data.jerarquia,
      estado: 'activo',
      base: cuartel.nombre,
      funcion: data.funcion,
      cuartelId: cuartel.id,
      perfiles: ['bombero'],
      salud: {},
      cursos: [],
    });
    toast.push({
      kind: 'success',
      title: `${persona.nombre} ${persona.apellido} dado de alta`,
      description: `Legajo ${persona.legajo} · ${cuartel.nombre}`,
    });
    onCreated?.(persona);
    close();
  }

  return (
    <Dialog open={open} onClose={close} title="Nueva persona" description={`Paso ${paso} de 3`}>
      {/* Stepper */}
      <div className="mb-5 flex items-center gap-2">
        {[1, 2, 3].map((p) => (
          <div key={p} className="flex flex-1 items-center gap-2">
            <div
              className={cn(
                'grid h-7 w-7 place-items-center rounded-full text-xs font-bold',
                p < paso
                  ? 'bg-status-ok text-white'
                  : p === paso
                    ? 'bg-brand-600 text-white shadow-md'
                    : 'bg-slate-100 text-slate-500',
              )}
            >
              {p < paso ? <Check size={12} /> : p}
            </div>
            {p < 3 && (
              <div className={cn('h-0.5 flex-1', p < paso ? 'bg-status-ok' : 'bg-slate-200')} />
            )}
          </div>
        ))}
      </div>

      {/* Paso 1: Datos personales */}
      {paso === 1 && (
        <div className="space-y-3">
          <h3 className="font-bold text-slate-900">Datos personales</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Nombre *</Label>
              <Input
                value={data.nombre}
                onChange={(e) => setData({ ...data, nombre: e.target.value })}
                aria-invalid={!!errors.nombre}
              />
              {errors.nombre && (
                <p className="text-status-risk-fg mt-1 text-xs font-medium">{errors.nombre}</p>
              )}
            </div>
            <div>
              <Label>Apellido *</Label>
              <Input
                value={data.apellido}
                onChange={(e) => setData({ ...data, apellido: e.target.value })}
                aria-invalid={!!errors.apellido}
              />
              {errors.apellido && (
                <p className="text-status-risk-fg mt-1 text-xs font-medium">{errors.apellido}</p>
              )}
            </div>
            <div>
              <Label>Legajo *</Label>
              <Input
                value={data.legajo}
                onChange={(e) => setData({ ...data, legajo: e.target.value })}
                placeholder="0301"
                maxLength={4}
                aria-invalid={!!errors.legajo}
              />
              {errors.legajo && (
                <p className="text-status-risk-fg mt-1 text-xs font-medium">{errors.legajo}</p>
              )}
            </div>
            <div>
              <Label>DNI</Label>
              <Input
                value={data.dni}
                onChange={(e) => setData({ ...data, dni: e.target.value })}
                placeholder="31456789"
                aria-invalid={!!errors.dni}
              />
              {errors.dni && (
                <p className="text-status-risk-fg mt-1 text-xs font-medium">{errors.dni}</p>
              )}
            </div>
          </div>
          <div>
            <Label>Email</Label>
            <Input
              type="email"
              value={data.email}
              onChange={(e) => setData({ ...data, email: e.target.value })}
              placeholder="bombero@cuartel.bvvb.org.ar"
              aria-invalid={!!errors.email}
            />
            {errors.email && (
              <p className="text-status-risk-fg mt-1 text-xs font-medium">{errors.email}</p>
            )}
          </div>
          <div>
            <Label>Teléfono</Label>
            <Input
              value={data.telefono}
              onChange={(e) => setData({ ...data, telefono: e.target.value })}
              placeholder="+54 11 5555 0000"
              aria-invalid={!!errors.telefono}
            />
            {errors.telefono && (
              <p className="text-status-risk-fg mt-1 text-xs font-medium">{errors.telefono}</p>
            )}
          </div>
        </div>
      )}

      {/* Paso 2: Jerarquía y función */}
      {paso === 2 && (
        <div className="space-y-3">
          <h3 className="font-bold text-slate-900">Jerarquía y rol</h3>
          <div>
            <Label>Jerarquía</Label>
            <select
              value={data.jerarquia}
              onChange={(e) => setData({ ...data, jerarquia: e.target.value as Jerarquia })}
              className="focus:border-brand-400 mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2"
            >
              {JERARQUIAS.map((j) => (
                <option key={j.value} value={j.value}>
                  {j.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label>Función</Label>
            <Input
              value={data.funcion}
              onChange={(e) => setData({ ...data, funcion: e.target.value })}
              placeholder="Conductor · Operativo · Administrativo..."
            />
          </div>
          <div>
            <Label>Fecha de ingreso</Label>
            <Input
              type="date"
              value={data.fechaIngreso}
              onChange={(e) => setData({ ...data, fechaIngreso: e.target.value })}
            />
          </div>
        </div>
      )}

      {/* Paso 3: Revisar y confirmar */}
      {paso === 3 && (
        <div className="space-y-3">
          <h3 className="font-bold text-slate-900">Revisá antes de guardar</h3>
          <div className="overflow-hidden rounded-lg border border-slate-200">
            <dl className="divide-y divide-slate-100 text-sm">
              {[
                { k: 'Nombre completo', v: `${data.apellido}, ${data.nombre}` },
                { k: 'Legajo', v: data.legajo },
                { k: 'DNI', v: data.dni || '—' },
                { k: 'Email', v: data.email || '—' },
                { k: 'Teléfono', v: data.telefono || '—' },
                { k: 'Jerarquía', v: JERARQUIAS.find((j) => j.value === data.jerarquia)?.label },
                { k: 'Función', v: data.funcion },
                { k: 'Ingreso', v: data.fechaIngreso },
                { k: 'Cuartel', v: cuartel?.nombre ?? '—' },
              ].map((row) => (
                <div key={row.k} className="grid grid-cols-[120px_1fr] gap-2 px-3 py-2">
                  <dt className="text-xs text-slate-500">{row.k}</dt>
                  <dd className="text-slate-900">{row.v}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="bg-brand-50 text-brand-900 rounded-lg p-3 text-xs">
            <strong>Tip:</strong> al guardar, la persona queda como Activo. Después podés cargar su
            salud, familia, herederos, formación y cursos desde su ficha.
          </div>
        </div>
      )}

      {/* Footer navigation */}
      <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
        <Button intent="ghost" onClick={anterior} disabled={paso === 1}>
          Anterior
        </Button>
        {paso < 3 ? (
          <Button intent="primary" onClick={siguiente}>
            Siguiente <ChevronRight size={16} />
          </Button>
        ) : (
          <Button intent="success" onClick={guardar}>
            <UserPlus size={16} /> Crear persona
          </Button>
        )}
      </div>
    </Dialog>
  );
}
