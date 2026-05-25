'use client';

import {
  ArrowLeft,
  Calendar,
  ClipboardCheck,
  Download,
  Edit,
  Fuel,
  Gauge,
  History,
  Truck,
  Wrench,
} from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

import { Badge, Button, Card, CardContent, Kpi } from '@faro/ui';

import { EmptyState } from '../../../../../components/shared/empty-state';
import { PageHero } from '../../../../../components/shared/page-hero';
import { useFaroStore } from '../../../../../store/use-faro-store';

export default function FichaMovilPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const moviles = useFaroStore((s) => s.moviles);
  const servicios = useFaroStore((s) => s.servicios);
  const movil = moviles.find((m) => m.id === params.id);

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
          accion={{
            label: 'Volver al listado',
            onClick: () => router.push('/mando/automotores'),
          }}
        />
      </div>
    );
  }

  const serviciosDelMovil = servicios.filter((s) => s.movilId === movil.id);
  const kmRecorridos = serviciosDelMovil.length * 12; // estimación demo

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <Link
        href="/mando/automotores"
        className="hover:text-brand-700 inline-flex items-center gap-1 text-sm text-slate-500"
      >
        <ArrowLeft size={14} /> Volver a automotores
      </Link>

      <PageHero
        objetivo={`Móvil ${movil.codigo}`}
        titulo={`${movil.codigo} · ${movil.tipo}`}
        descripcion={`${movil.marca} ${movil.modelo} · dominio ${movil.dominio}`}
        icono={<Truck size={26} />}
        variant={movil.enServicio ? 'success' : 'critical'}
        meta={
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Kpi
              label="Estado"
              value={movil.enServicio ? 'En servicio' : 'Fuera'}
              intent={movil.enServicio ? 'ok' : 'risk'}
            />
            <Kpi label="Servicios" value={serviciosDelMovil.length} hint="totales" intent="brand" />
            <Kpi label="Km est." value={kmRecorridos} hint="último mes" intent="neutral" />
            <Kpi label="VTV" value={movil.vtvVencimiento.slice(0, 7)} hint="vence" intent="warn" />
          </div>
        }
        acciones={
          <>
            <Link href={`/mando/automotores/truck-check?movil=${movil.id}` as never}>
              <Button intent="primary">
                <ClipboardCheck size={14} /> Truck check
              </Button>
            </Link>
            <Button intent="secondary">
              <Edit size={14} /> Editar
            </Button>
          </>
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardContent className="p-5">
            <h3 className="mb-3 font-bold text-slate-900">Especificaciones</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-lg bg-slate-50 p-3">
                <div className="text-xs text-slate-500">Marca · Modelo</div>
                <div className="font-medium text-slate-900">
                  {movil.marca} {movil.modelo}
                </div>
              </div>
              <div className="rounded-lg bg-slate-50 p-3">
                <div className="text-xs text-slate-500">Año</div>
                <div className="font-medium text-slate-900">{movil.anio}</div>
              </div>
              <div className="rounded-lg bg-slate-50 p-3">
                <div className="text-xs text-slate-500">Patente</div>
                <div className="font-mono font-medium uppercase text-slate-900">
                  {movil.dominio}
                </div>
              </div>
              <div className="rounded-lg bg-slate-50 p-3">
                <div className="text-xs text-slate-500">Tipo</div>
                <div className="font-medium capitalize text-slate-900">{movil.tipo}</div>
              </div>
            </div>

            <h3 className="mb-3 mt-5 font-bold text-slate-900">Historial reciente</h3>
            {serviciosDelMovil.length === 0 ? (
              <EmptyState
                inline
                icon={<History size={24} />}
                titulo="Sin servicios"
                descripcion="Este móvil no participó en servicios todavía."
              />
            ) : (
              <ul className="divide-y divide-slate-100">
                {serviciosDelMovil.slice(0, 5).map((s) => (
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

        <div className="space-y-3">
          <Card>
            <CardContent className="p-4">
              <div className="mb-2 flex items-center gap-2">
                <Calendar size={14} className="text-slate-500" />
                <span className="text-xs font-bold uppercase text-slate-500">Vencimientos</span>
              </div>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center justify-between">
                  <span>VTV</span>
                  <Badge intent="warn">
                    {new Date(movil.vtvVencimiento).toLocaleDateString('es-AR')}
                  </Badge>
                </li>
                <li className="flex items-center justify-between">
                  <span>Seguro</span>
                  <Badge intent="ok">vigente</Badge>
                </li>
                <li className="flex items-center justify-between">
                  <span>Cédula</span>
                  <Badge intent="ok">vigente</Badge>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="mb-2 flex items-center gap-2">
                <Gauge size={14} className="text-slate-500" />
                <span className="text-xs font-bold uppercase text-slate-500">Telemetría</span>
              </div>
              <dl className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <dt className="text-slate-500">Combustible</dt>
                  <dd className="text-status-ok-fg font-bold">85%</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">Aceite</dt>
                  <dd className="text-status-ok-fg font-bold">OK</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">Tanque agua</dt>
                  <dd className="text-status-ok-fg font-bold">92%</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">Última lectura</dt>
                  <dd className="text-slate-700">Hace 12 min</dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-2 p-3">
              <Button intent="secondary" size="sm" fullWidth>
                <Wrench size={12} /> Agendar mantenimiento
              </Button>
              <Button intent="secondary" size="sm" fullWidth>
                <Fuel size={12} /> Registrar carga
              </Button>
              <Button intent="secondary" size="sm" fullWidth>
                <Download size={12} /> Exportar ficha
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
