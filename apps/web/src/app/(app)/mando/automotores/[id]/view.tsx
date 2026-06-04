'use client';

import {
  ArrowLeft,
  Camera,
  ClipboardCheck,
  Droplets,
  Fuel,
  Gauge,
  History,
  Plus,
  ShieldCheck,
  Truck,
  Users,
  Wrench,
} from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useMemo, useRef, useState } from 'react';

import {
  Badge,
  Button,
  Card,
  CardContent,
  Dialog,
  Input,
  Kpi,
  Label,
  cn,
  useToast,
} from '@faro/ui';

import { TruckIllustration } from '../../../../../components/automotores/truck-illustration';
import { EmptyState } from '../../../../../components/shared/empty-state';
import type { EstadoOperativoMovil, TipoMantenimiento } from '../../../../../data/automotores';
import { ars } from '../../../../../components/finanzas/utils';
import { fmtFechaCorta } from '../../../../../lib/utils/date';
import { demoToday } from '../../../../../lib/utils/demo-today';
import { useFaroStore } from '../../../../../store/use-faro-store';

const ESTADOS: Array<{ id: EstadoOperativoMovil; label: string }> = [
  { id: 'en_servicio', label: 'En servicio' },
  { id: 'en_taller', label: 'En taller' },
  { id: 'fuera_servicio', label: 'Fuera de servicio' },
];

const TIPO_MANT: Array<{ id: TipoMantenimiento; label: string }> = [
  { id: 'service', label: 'Service' },
  { id: 'reparacion', label: 'Reparación' },
  { id: 'cubiertas', label: 'Cubiertas' },
  { id: 'bomba', label: 'Bomba' },
  { id: 'vtv', label: 'VTV' },
  { id: 'otro', label: 'Otro' },
];

function diasHasta(iso: string): number {
  const target = new Date(iso).setHours(0, 0, 0, 0);
  const now = demoToday().setHours(0, 0, 0, 0);
  return Math.round((target - now) / 8.64e7);
}
function docEstado(iso?: string): 'ok' | 'warn' | 'risk' {
  if (!iso) return 'ok';
  const d = diasHasta(iso);
  return d < 0 ? 'risk' : d < 45 ? 'warn' : 'ok';
}

export default function FichaMovilView() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const toast = useToast();
  const moviles = useFaroStore((s) => s.moviles);
  const fichas = useFaroStore((s) => s.fichasMovil);
  const servicios = useFaroStore((s) => s.servicios);
  const personas = useFaroStore((s) => s.personas);
  const setFotoMovil = useFaroStore((s) => s.setFotoMovil);
  const setEstadoOperativoMovil = useFaroStore((s) => s.setEstadoOperativoMovil);
  const registrarCargaCombustible = useFaroStore((s) => s.registrarCargaCombustible);
  const registrarMantenimientoMovil = useFaroStore((s) => s.registrarMantenimientoMovil);

  const movil = moviles.find((m) => m.id === params.id);
  const ficha = fichas.find((f) => f.movilId === params.id);
  const fotoInput = useRef<HTMLInputElement>(null);

  const [mantOpen, setMantOpen] = useState(false);
  const [mant, setMant] = useState({
    tipo: 'service' as TipoMantenimiento,
    detalle: '',
    taller: '',
    km: ficha?.odometroKm ?? 0,
    costo: 0,
  });

  const serviciosDelMovil = useMemo(
    () => servicios.filter((s) => s.movilId === params.id),
    [servicios, params.id],
  );

  if (!movil) {
    return (
      <div className="mx-auto max-w-5xl space-y-5">
        <Link
          href="/mando/automotores"
          className="hover:text-brand-700 inline-flex items-center gap-1 text-sm text-slate-500"
        >
          <ArrowLeft size={14} /> Volver
        </Link>
        <EmptyState
          icon={<Truck size={28} />}
          titulo="Móvil no encontrado"
          descripcion={`No existe un móvil con id ${params.id}.`}
          variant="warning"
          accion={{ label: 'Volver al listado', onClick: () => router.push('/mando/automotores') }}
        />
      </div>
    );
  }

  const estadoOp = ficha?.estadoOperativo ?? (movil.enServicio ? 'en_servicio' : 'fuera_servicio');
  const nombrePersona = (id: string) => {
    const p = personas.find((x) => x.id === id);
    return p ? `${p.nombre} ${p.apellido}` : id;
  };

  function onFoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 4 * 1024 * 1024) {
      toast.push({ kind: 'warn', title: 'Foto muy pesada', description: 'Máximo 4 MB.' });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setFotoMovil(movil!.id, reader.result as string);
      toast.push({ kind: 'success', title: 'Foto actualizada', description: movil!.codigo });
    };
    reader.readAsDataURL(file);
  }

  function cambiarEstado(e: EstadoOperativoMovil) {
    if (e === estadoOp) return;
    setEstadoOperativoMovil(movil!.id, e);
    toast.push({
      kind: 'info',
      title: `${movil!.codigo} · ${ESTADOS.find((x) => x.id === e)?.label}`,
    });
  }

  function cargarTanque() {
    registrarCargaCombustible(movil!.id, 100);
    toast.push({ kind: 'success', title: 'Carga registrada', description: 'Tanque al 100%.' });
  }

  function guardarMant() {
    if (mant.detalle.trim().length < 3) {
      toast.push({ kind: 'warn', title: 'Falta el detalle', description: 'Escribí qué se hizo.' });
      return;
    }
    registrarMantenimientoMovil(movil!.id, {
      fecha: demoToday().toISOString().slice(0, 10),
      tipo: mant.tipo,
      detalle: mant.detalle.trim(),
      taller: mant.taller.trim() || 'Sin especificar',
      km: mant.km,
      costo: mant.costo,
    });
    toast.push({ kind: 'success', title: 'Mantenimiento registrado', description: movil!.codigo });
    setMantOpen(false);
    setMant({ tipo: 'service', detalle: '', taller: '', km: ficha?.odometroKm ?? 0, costo: 0 });
  }

  const kmAlService = ficha ? ficha.proximoServiceKm - ficha.odometroKm : 0;

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <Link
        href="/mando/automotores"
        className="hover:text-brand-700 inline-flex items-center gap-1 text-sm text-slate-500"
      >
        <ArrowLeft size={14} /> Volver a automotores
      </Link>

      {/* HERO: foto + identidad + estado + acciones */}
      <Card className="overflow-hidden">
        <div className="grid lg:grid-cols-[1.15fr_1fr]">
          {/* Foto */}
          <div className="relative aspect-video bg-slate-100 lg:aspect-auto">
            {ficha?.fotoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={ficha.fotoUrl}
                alt={`Móvil ${movil.codigo}`}
                className="h-full w-full object-cover"
              />
            ) : (
              <TruckIllustration
                codigo={movil.codigo}
                tipo={movil.tipo}
                className="h-full w-full"
              />
            )}
            <input
              ref={fotoInput}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={onFoto}
            />
            <button
              type="button"
              onClick={() => fotoInput.current?.click()}
              className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-full bg-black/55 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm transition-colors hover:bg-black/70"
            >
              <Camera size={13} /> {ficha?.fotoUrl ? 'Cambiar foto' : 'Subir foto'}
            </button>
          </div>

          {/* Identidad + acciones */}
          <CardContent className="p-5">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="text-2xl font-black text-slate-900">{movil.codigo}</div>
                <div className="text-sm capitalize text-slate-600">
                  {movil.tipo} · {movil.marca} {movil.modelo} · {movil.anio}
                </div>
              </div>
              <span className="inline-flex shrink-0 items-center rounded-md bg-slate-900 px-2.5 py-1.5 font-mono text-xs font-bold tracking-wider text-white">
                {movil.dominio.toUpperCase()}
              </span>
            </div>

            {/* Estado operativo */}
            <div className="mt-4">
              <div className="mb-1.5 text-xs font-bold uppercase tracking-wide text-slate-500">
                Estado operativo
              </div>
              <div className="flex flex-wrap gap-1.5">
                {ESTADOS.map((e) => (
                  <button
                    key={e.id}
                    type="button"
                    onClick={() => cambiarEstado(e.id)}
                    className={cn(
                      'rounded-full px-3 py-1 text-xs font-medium transition-colors',
                      estadoOp === e.id
                        ? e.id === 'en_servicio'
                          ? 'bg-status-ok text-white'
                          : e.id === 'en_taller'
                            ? 'bg-status-warn text-white'
                            : 'bg-slate-700 text-white'
                        : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50',
                    )}
                  >
                    {e.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Acciones */}
            <div className="mt-4 flex flex-wrap gap-2">
              <Link href={`/mando/automotores/truck-check?movil=${movil.id}` as never}>
                <Button intent="primary" size="sm">
                  <ClipboardCheck size={14} /> Truck check
                </Button>
              </Link>
              <Button intent="secondary" size="sm" onClick={cargarTanque}>
                <Fuel size={14} /> Registrar carga
              </Button>
              <Button intent="secondary" size="sm" onClick={() => setMantOpen(true)}>
                <Wrench size={14} /> Mantenimiento
              </Button>
            </div>
          </CardContent>
        </div>
      </Card>

      {/* KPIs rápidos */}
      {ficha && (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <Kpi
            label="Combustible"
            value={`${ficha.combustiblePct}%`}
            intent={ficha.combustiblePct < 25 ? 'risk' : ficha.combustiblePct < 50 ? 'warn' : 'ok'}
            icon={<Fuel size={16} />}
          />
          {ficha.aguaPct != null ? (
            <Kpi
              label="Tanque agua"
              value={`${ficha.aguaPct}%`}
              intent="brand"
              icon={<Droplets size={16} />}
            />
          ) : (
            <Kpi label="Servicios" value={serviciosDelMovil.length} hint="totales" intent="brand" />
          )}
          <Kpi
            label="Odómetro"
            value={ficha.odometroKm.toLocaleString('es-AR')}
            hint="km"
            intent="neutral"
            icon={<Gauge size={16} />}
          />
          <Kpi
            label="Próximo service"
            value={kmAlService > 0 ? `${kmAlService.toLocaleString('es-AR')} km` : 'Vencido'}
            hint="restantes"
            intent={kmAlService <= 0 ? 'risk' : kmAlService < 2000 ? 'warn' : 'ok'}
          />
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {/* Capacidades */}
          {ficha && (
            <Card>
              <CardContent className="p-5">
                <h3 className="mb-3 flex items-center gap-2 font-bold text-slate-900">
                  <Truck size={18} className="text-brand-700" /> Capacidades operativas
                </h3>
                <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
                  {ficha.aguaLitros != null && (
                    <div className="rounded-lg bg-slate-50 p-3">
                      <div className="text-xs text-slate-500">Tanque agua</div>
                      <div className="font-bold text-slate-900">{ficha.aguaLitros} L</div>
                    </div>
                  )}
                  {ficha.bombaLpm != null && (
                    <div className="rounded-lg bg-slate-50 p-3">
                      <div className="text-xs text-slate-500">Bomba</div>
                      <div className="font-bold text-slate-900">{ficha.bombaLpm} L/min</div>
                    </div>
                  )}
                  <div className="rounded-lg bg-slate-50 p-3">
                    <div className="text-xs text-slate-500">Tripulación</div>
                    <div className="font-bold text-slate-900">{ficha.tripulacion} plazas</div>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-3">
                    <div className="text-xs text-slate-500">Tracción</div>
                    <div className="font-bold uppercase text-slate-900">{ficha.traccion}</div>
                  </div>
                </div>
                <div className="mt-3">
                  <div className="mb-1.5 text-xs font-bold uppercase tracking-wide text-slate-500">
                    Equipamiento a bordo
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {ficha.equipamiento.map((eq) => (
                      <span
                        key={eq}
                        className="bg-brand-50 text-brand-800 rounded-md px-2 py-1 text-xs font-medium"
                      >
                        {eq}
                      </span>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Mantenimiento */}
          {ficha && (
            <Card>
              <CardContent className="p-5">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="flex items-center gap-2 font-bold text-slate-900">
                    <Wrench size={18} className="text-brand-700" /> Historial de mantenimiento
                  </h3>
                  <Button intent="ghost" size="sm" onClick={() => setMantOpen(true)}>
                    <Plus size={14} /> Registrar
                  </Button>
                </div>
                {ficha.mantenimientos.length === 0 ? (
                  <EmptyState
                    inline
                    icon={<Wrench size={24} />}
                    titulo="Sin registros"
                    descripcion="Todavía no se cargó mantenimiento."
                  />
                ) : (
                  <ul className="divide-y divide-slate-100">
                    {ficha.mantenimientos.map((mn) => (
                      <li key={mn.id} className="flex items-start gap-3 py-2.5">
                        <div className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-slate-100 text-slate-600">
                          <Wrench size={14} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-slate-900">{mn.detalle}</span>
                            <Badge intent="neutral">
                              {TIPO_MANT.find((t) => t.id === mn.tipo)?.label ?? mn.tipo}
                            </Badge>
                          </div>
                          <div className="text-xs text-slate-500">
                            {fmtFechaCorta(mn.fecha)} · {mn.taller} ·{' '}
                            {mn.km.toLocaleString('es-AR')} km
                          </div>
                        </div>
                        <div className="shrink-0 text-right text-sm font-semibold tabular-nums text-slate-900">
                          {ars.format(mn.costo)}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          )}

          {/* Historial operativo */}
          <Card>
            <CardContent className="p-5">
              <h3 className="mb-3 flex items-center gap-2 font-bold text-slate-900">
                <History size={18} className="text-brand-700" /> Servicios recientes
              </h3>
              {serviciosDelMovil.length === 0 ? (
                <EmptyState
                  inline
                  icon={<History size={24} />}
                  titulo="Sin servicios"
                  descripcion="Este móvil no participó en servicios todavía."
                />
              ) : (
                <ul className="divide-y divide-slate-100">
                  {serviciosDelMovil.slice(0, 6).map((s) => (
                    <li key={s.id} className="flex items-center gap-3 py-2.5">
                      <div className="bg-fire-100 text-fire-700 grid h-8 w-8 place-items-center rounded-lg text-xs font-bold uppercase">
                        {s.tipo[0]}
                      </div>
                      <div className="min-w-0 flex-1">
                        <Link
                          href={`/mando/operaciones/${s.id}` as never}
                          className="hover:text-brand-700 block truncate text-sm font-medium text-slate-900"
                        >
                          {s.direccion}
                        </Link>
                        <div className="text-xs text-slate-500">
                          {new Date(s.horaSalida).toLocaleDateString('es-AR')}
                        </div>
                      </div>
                      <Badge intent={s.estado === 'validado' ? 'ok' : 'warn'}>
                        {s.estado === 'validado' ? 'Validado' : 'Pendiente'}
                      </Badge>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Columna derecha */}
        <div className="space-y-4">
          {/* Documentación */}
          <Card>
            <CardContent className="p-4">
              <div className="mb-2 flex items-center gap-2">
                <ShieldCheck size={14} className="text-slate-500" />
                <span className="text-xs font-bold uppercase text-slate-500">Documentación</span>
              </div>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center justify-between">
                  <span className="text-slate-600">VTV</span>
                  <Badge intent={docEstado(movil.vtvVencimiento)}>
                    {fmtFechaCorta(movil.vtvVencimiento)}
                  </Badge>
                </li>
                {ficha && (
                  <>
                    <li className="flex items-center justify-between gap-2">
                      <span className="min-w-0 text-slate-600">
                        Seguro
                        <span className="block truncate text-xs text-slate-400">
                          {ficha.seguroCompania} · {ficha.seguroPoliza}
                        </span>
                      </span>
                      <Badge intent={docEstado(ficha.seguroVencimiento)}>
                        {fmtFechaCorta(ficha.seguroVencimiento)}
                      </Badge>
                    </li>
                    <li className="flex items-center justify-between">
                      <span className="text-slate-600">Cédula verde</span>
                      <Badge intent={docEstado(ficha.cedulaVencimiento)}>
                        {fmtFechaCorta(ficha.cedulaVencimiento)}
                      </Badge>
                    </li>
                    {ficha.rtoVencimiento && (
                      <li className="flex items-center justify-between">
                        <span className="text-slate-600">RTO</span>
                        <Badge intent={docEstado(ficha.rtoVencimiento)}>
                          {fmtFechaCorta(ficha.rtoVencimiento)}
                        </Badge>
                      </li>
                    )}
                  </>
                )}
              </ul>
            </CardContent>
          </Card>

          {/* Telemetría */}
          {ficha && (
            <Card>
              <CardContent className="p-4">
                <div className="mb-3 flex items-center gap-2">
                  <Gauge size={14} className="text-slate-500" />
                  <span className="text-xs font-bold uppercase text-slate-500">
                    Estado / telemetría
                  </span>
                </div>
                <div className="space-y-3">
                  <Barra label="Combustible" pct={ficha.combustiblePct} />
                  {ficha.aguaPct != null && (
                    <Barra label="Tanque de agua" pct={ficha.aguaPct} brand />
                  )}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Odómetro</span>
                    <span className="font-bold tabular-nums text-slate-900">
                      {ficha.odometroKm.toLocaleString('es-AR')} km
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Conductores habilitados */}
          {ficha && ficha.conductores.length > 0 && (
            <Card>
              <CardContent className="p-4">
                <div className="mb-2 flex items-center gap-2">
                  <Users size={14} className="text-slate-500" />
                  <span className="text-xs font-bold uppercase text-slate-500">
                    Conductores habilitados
                  </span>
                </div>
                <ul className="space-y-1.5">
                  {ficha.conductores.map((id) => (
                    <li key={id} className="flex items-center gap-2 text-sm text-slate-700">
                      <span className="bg-brand-100 text-brand-700 grid h-6 w-6 place-items-center rounded-full text-[11px] font-bold">
                        {nombrePersona(id)
                          .split(' ')
                          .map((w) => w[0])
                          .slice(0, 2)
                          .join('')}
                      </span>
                      {nombrePersona(id)}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Dialog registrar mantenimiento */}
      <Dialog
        open={mantOpen}
        onClose={() => setMantOpen(false)}
        title={`Registrar mantenimiento · ${movil.codigo}`}
        description="Queda en el historial del móvil."
        size="md"
        footer={
          <div className="flex justify-end gap-2">
            <Button intent="ghost" onClick={() => setMantOpen(false)}>
              Cancelar
            </Button>
            <Button intent="primary" onClick={guardarMant}>
              <Wrench size={14} /> Guardar
            </Button>
          </div>
        }
      >
        <div className="space-y-3">
          <div>
            <Label>Tipo</Label>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {TIPO_MANT.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setMant((m) => ({ ...m, tipo: t.id }))}
                  className={cn(
                    'rounded-full px-2.5 py-1 text-xs font-medium',
                    mant.tipo === t.id
                      ? 'bg-brand-600 text-white'
                      : 'bg-white text-slate-600 ring-1 ring-slate-200',
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <Label>Detalle *</Label>
            <Input
              value={mant.detalle}
              onChange={(e) => setMant((m) => ({ ...m, detalle: e.target.value }))}
              placeholder="Ej: Cambio de aceite y filtros"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Taller</Label>
              <Input
                value={mant.taller}
                onChange={(e) => setMant((m) => ({ ...m, taller: e.target.value }))}
                placeholder="Taller / proveedor"
              />
            </div>
            <div>
              <Label>Km</Label>
              <Input
                type="number"
                value={mant.km}
                onChange={(e) => setMant((m) => ({ ...m, km: Number(e.target.value) }))}
              />
            </div>
          </div>
          <div>
            <Label>Costo (ARS)</Label>
            <Input
              type="number"
              value={mant.costo}
              onChange={(e) => setMant((m) => ({ ...m, costo: Number(e.target.value) }))}
            />
          </div>
        </div>
      </Dialog>
    </div>
  );
}

function Barra({ label, pct, brand }: { label: string; pct: number; brand?: boolean }) {
  const color = brand
    ? 'bg-brand-600'
    : pct < 25
      ? 'bg-status-risk'
      : pct < 50
        ? 'bg-status-warn'
        : 'bg-status-ok';
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className="text-slate-500">{label}</span>
        <span className="font-bold tabular-nums text-slate-900">{pct}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
        <div className={cn('h-full rounded-full', color)} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
