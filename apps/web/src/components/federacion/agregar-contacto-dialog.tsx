'use client';

import { AlertTriangle, Lock } from 'lucide-react';
import { useMemo, useState } from 'react';

import { Button, Dialog, Input, Label, cn, useToast } from '@faro/ui';

import type { CategoriaContacto, ContactoRed, NivelContactoRed } from '@faro/types';

import { selectCuartelActivo, selectPersonaActual, useFaroStore } from '../../store/use-faro-store';
import { REGION_NOMBRE_A_ID } from '../../data/regiones';

const CATEGORIAS: Array<{ value: CategoriaContacto; label: string; icon: string }> = [
  { value: 'gobierno', label: 'Gobierno', icon: '🏛️' },
  { value: 'salud', label: 'Salud', icon: '🏥' },
  { value: 'seguridad', label: 'Seguridad', icon: '🚓' },
  { value: 'servicios', label: 'Servicios', icon: '⚡' },
  { value: 'logistica', label: 'Logística', icon: '📦' },
  { value: 'medios', label: 'Medios', icon: '📰' },
  { value: 'otro', label: 'Otro', icon: '📎' },
];

interface Props {
  open: boolean;
  onClose: () => void;
}

export function AgregarContactoDialog({ open, onClose }: Props) {
  const persona = useFaroStore(selectPersonaActual);
  const cuartelActivo = useFaroStore(selectCuartelActivo);
  const contactos = useFaroStore((s) => s.contactosRed);
  const agregar = useFaroStore((s) => s.agregarContactoRed);
  const sesion = useFaroStore((s) => s.sesion);
  const toast = useToast();

  const regionId = cuartelActivo ? REGION_NOMBRE_A_ID[cuartelActivo.region] : undefined;
  const regionNombre = cuartelActivo?.region;
  const puedeNivelFederacion = sesion?.perfilActivo === 'federacion';

  const [data, setData] = useState({
    nivel: 'cuartel' as NivelContactoRed,
    nombre: '',
    cargo: '',
    organismo: '',
    telefono: '',
    telefonoSecundario: '',
    whatsapp: '',
    email: '',
    direccion: '',
    categoria: 'gobierno' as CategoriaContacto,
    tags: '' as string,
    notas: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [duplicadoConfirmado, setDuplicadoConfirmado] = useState(false);

  const telefonoLimpio = data.telefono.replace(/[^\d]/g, '');
  const duplicado = useMemo(() => {
    if (telefonoLimpio.length < 6) return null;
    return (
      contactos.find((c) => c.telefonos.some((t) => t.replace(/[^\d]/g, '') === telefonoLimpio)) ??
      null
    );
  }, [contactos, telefonoLimpio]);

  function reset() {
    setData({
      nivel: 'cuartel',
      nombre: '',
      cargo: '',
      organismo: '',
      telefono: '',
      telefonoSecundario: '',
      whatsapp: '',
      email: '',
      direccion: '',
      categoria: 'gobierno',
      tags: '',
      notas: '',
    });
    setErrors({});
    setDuplicadoConfirmado(false);
  }

  function close() {
    reset();
    onClose();
  }

  function validar(): boolean {
    const errs: Record<string, string> = {};
    if (data.nombre.trim().length < 2) errs.nombre = 'Nombre obligatorio (mín. 2 caracteres)';
    if (data.cargo.trim().length < 2) errs.cargo = 'Cargo obligatorio';
    if (telefonoLimpio.length < 8) errs.telefono = 'Teléfono inválido';
    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errs.email = 'Email inválido';
    }
    if (data.nivel === 'federacion' && !puedeNivelFederacion) {
      errs.nivel = 'Solo el perfil Federación puede agregar a este nivel';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function guardar() {
    if (!validar()) {
      toast.push({
        kind: 'warn',
        title: 'Revisá el formulario',
        description: Object.values(errors)[0] ?? 'Hay campos con error',
      });
      return;
    }
    if (duplicado && !duplicadoConfirmado) {
      toast.push({
        kind: 'warn',
        title: 'Teléfono duplicado',
        description: `Confirmá si querés agregar igual junto a "${duplicado.nombre}"`,
      });
      setDuplicadoConfirmado(true);
      return;
    }

    const telefonos = [data.telefono.trim()];
    if (data.telefonoSecundario.trim()) telefonos.push(data.telefonoSecundario.trim());

    const scope: Partial<ContactoRed> = {};
    if (data.nivel === 'cuartel' && cuartelActivo) scope.cuartelId = cuartelActivo.id;
    if (data.nivel === 'region' && regionId) scope.regionId = regionId;

    const tags = data.tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const nuevo = agregar({
      nombre: data.nombre.trim(),
      cargo: data.cargo.trim(),
      organismo: data.organismo.trim() || undefined,
      telefonos,
      email: data.email.trim() || undefined,
      whatsapp: data.whatsapp.trim() || undefined,
      direccion: data.direccion.trim() || undefined,
      nivel: data.nivel,
      categoria: data.categoria,
      tags: tags.length > 0 ? tags : undefined,
      notas: data.notas.trim() || undefined,
      ...scope,
    });

    toast.push({
      kind: 'success',
      title: 'Contacto agregado',
      description: `${nuevo.nombre} · ${nuevo.cargo}`,
    });
    close();
  }

  return (
    <Dialog
      open={open}
      onClose={close}
      size="lg"
      title="Sumar contacto externo"
      description="Periodista, intendente, comercio, hospital… cualquier contacto útil que no sea un bombero. Queda visible para todos los miembros del nivel que elijas."
      footer={
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-500">
            Agregado como{' '}
            <span className="font-medium text-slate-700">
              {persona ? `${persona.nombre} ${persona.apellido}` : 'invitado'}
            </span>
          </span>
          <div className="ml-auto flex gap-2">
            <Button intent="secondary" onClick={close}>
              Cancelar
            </Button>
            <Button intent="primary" onClick={guardar}>
              {duplicado && !duplicadoConfirmado ? 'Revisar duplicado' : 'Agregar contacto'}
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Nivel */}
        <div>
          <Label>Nivel de la red</Label>
          <div className="mt-1.5 grid gap-2 sm:grid-cols-3">
            {(
              [
                [
                  'cuartel',
                  `Mi Cuartel${cuartelActivo ? ` (BV ${cuartelActivo.nombre})` : ''}`,
                  true,
                ],
                ['region', `Mi Región${regionNombre ? ` (${regionNombre})` : ''}`, true],
                ['federacion', 'Federación', puedeNivelFederacion],
              ] as const
            ).map(([nivel, label, habilitado]) => (
              <button
                key={nivel}
                type="button"
                disabled={!habilitado}
                onClick={() => habilitado && setData((d) => ({ ...d, nivel }))}
                className={cn(
                  'flex items-start gap-2 rounded-lg border p-3 text-left transition-all',
                  data.nivel === nivel
                    ? 'border-brand-400 bg-brand-50 ring-brand-200 ring-1'
                    : 'border-slate-200 bg-white hover:border-slate-300',
                  !habilitado && 'cursor-not-allowed opacity-50',
                )}
              >
                {!habilitado && <Lock size={14} className="mt-0.5 shrink-0 text-slate-500" />}
                <div className="min-w-0">
                  <div className="text-sm font-medium text-slate-900">{label}</div>
                  {!habilitado && (
                    <div className="mt-0.5 text-[10px] text-slate-500">
                      Requiere perfil federación
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
          {errors.nivel && <p className="mt-1 text-xs text-red-600">{errors.nivel}</p>}
        </div>

        {/* Identidad */}
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <Label>Nombre completo *</Label>
            <Input
              value={data.nombre}
              onChange={(e) => setData((d) => ({ ...d, nombre: e.target.value }))}
              placeholder="Ej. Sergio Massa"
              aria-invalid={!!errors.nombre}
            />
            {errors.nombre && (
              <p className="text-status-risk-fg mt-1 text-xs font-medium">{errors.nombre}</p>
            )}
          </div>
          <div>
            <Label>Cargo *</Label>
            <Input
              value={data.cargo}
              onChange={(e) => setData((d) => ({ ...d, cargo: e.target.value }))}
              placeholder="Ej. Intendente, Director, Periodista"
              aria-invalid={!!errors.cargo}
            />
            {errors.cargo && (
              <p className="text-status-risk-fg mt-1 text-xs font-medium">{errors.cargo}</p>
            )}
          </div>
        </div>

        <div>
          <Label>Organismo / Empresa</Label>
          <Input
            value={data.organismo}
            onChange={(e) => setData((d) => ({ ...d, organismo: e.target.value }))}
            placeholder="Ej. Municipalidad de Tigre, Hospital Posadas"
          />
        </div>

        {/* Contacto */}
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <Label>Teléfono principal *</Label>
            <Input
              type="tel"
              value={data.telefono}
              onChange={(e) => {
                setData((d) => ({ ...d, telefono: e.target.value }));
                setDuplicadoConfirmado(false);
              }}
              placeholder="+54 11 4555-1234"
              aria-invalid={!!errors.telefono}
            />
            {errors.telefono && (
              <p className="text-status-risk-fg mt-1 text-xs font-medium">{errors.telefono}</p>
            )}
          </div>
          <div>
            <Label>Teléfono secundario</Label>
            <Input
              type="tel"
              value={data.telefonoSecundario}
              onChange={(e) => setData((d) => ({ ...d, telefonoSecundario: e.target.value }))}
              placeholder="opcional"
            />
          </div>
        </div>

        {duplicado && (
          <div
            className={cn(
              'flex items-start gap-2 rounded-lg border p-3',
              duplicadoConfirmado
                ? 'bg-status-warn-bg/40 border-status-warn'
                : 'border-status-warn bg-status-warn-bg/30',
            )}
          >
            <AlertTriangle size={18} className="text-status-warn-fg shrink-0" />
            <div className="min-w-0 flex-1 text-sm">
              <div className="font-medium text-slate-900">Ya hay un contacto con este teléfono</div>
              <div className="mt-0.5 text-xs text-slate-700">
                <strong>{duplicado.nombre}</strong> · {duplicado.cargo}
                {duplicado.organismo && ` · ${duplicado.organismo}`}
              </div>
              {duplicadoConfirmado && (
                <div className="text-status-warn-fg mt-1 text-xs">
                  Confirmado. Al guardar se creará un nuevo contacto separado.
                </div>
              )}
            </div>
          </div>
        )}

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <Label>WhatsApp</Label>
            <Input
              type="tel"
              value={data.whatsapp}
              onChange={(e) => setData((d) => ({ ...d, whatsapp: e.target.value }))}
              placeholder="Si difiere del teléfono"
            />
          </div>
          <div>
            <Label>Email</Label>
            <Input
              type="email"
              value={data.email}
              onChange={(e) => setData((d) => ({ ...d, email: e.target.value }))}
              placeholder="contacto@dominio.gov"
              aria-invalid={!!errors.email}
            />
            {errors.email && (
              <p className="text-status-risk-fg mt-1 text-xs font-medium">{errors.email}</p>
            )}
          </div>
        </div>

        <div>
          <Label>Dirección</Label>
          <Input
            value={data.direccion}
            onChange={(e) => setData((d) => ({ ...d, direccion: e.target.value }))}
            placeholder="Calle 123, Ciudad"
          />
        </div>

        {/* Categoría */}
        <div>
          <Label>Categoría *</Label>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {CATEGORIAS.map((c) => (
              <button
                key={c.value}
                type="button"
                onClick={() => setData((d) => ({ ...d, categoria: c.value }))}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all',
                  data.categoria === c.value
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200',
                )}
              >
                <span>{c.icon}</span>
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tags + notas */}
        <div>
          <Label>Tags (separados por coma)</Label>
          <Input
            value={data.tags}
            onChange={(e) => setData((d) => ({ ...d, tags: e.target.value }))}
            placeholder="intendente, urgencias, contacto-directo"
          />
        </div>

        <div>
          <Label>Notas (visibles para todo el nivel)</Label>
          <textarea
            value={data.notas}
            onChange={(e) => setData((d) => ({ ...d, notas: e.target.value }))}
            placeholder="Ej. Atiende solo después de las 19hs. Para urgencias llamar al jefe de gabinete."
            rows={3}
            className="focus:border-brand-400 focus:ring-brand-100 w-full resize-none rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2"
          />
        </div>
      </div>
    </Dialog>
  );
}

export { CATEGORIAS };
