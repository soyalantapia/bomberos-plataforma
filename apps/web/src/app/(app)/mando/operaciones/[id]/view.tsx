'use client';

import {
  Activity,
  ArrowLeft,
  Camera,
  Check,
  Clock,
  Download,
  Edit,
  FileText,
  Flame,
  ShieldCheck,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';

import { Avatar, Badge, Button, Card, CardContent, Kpi, useToast } from '@faro/ui';

import { ConfirmDialog } from '../../../../../components/shared/confirm-dialog';
import { EmptyState } from '../../../../../components/shared/empty-state';
import { MapView } from '../../../../../components/shared/map-view';
import { PageHero } from '../../../../../components/shared/page-hero';
import { fmtFechaHora, fmtHora } from '../../../../../lib/utils/date';
import { tipoServicioLabel } from '../../../../../lib/utils/tipo-servicio';
import { selectPersonaActual, useFaroStore } from '../../../../../store/use-faro-store';

const TIPO_COLOR: Record<string, string> = {
  incendio: 'bg-fire-600',
  rescate: 'bg-status-warn',
  accidente: 'bg-slate-600',
  forestal: 'bg-status-ok',
  otro: 'bg-slate-400',
};

export default function FichaServicioView() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const toast = useToast();
  const servicios = useFaroStore((s) => s.servicios);
  const moviles = useFaroStore((s) => s.moviles);
  const personas = useFaroStore((s) => s.personas);
  const persona = useFaroStore(selectPersonaActual);
  const validar = useFaroStore((s) => s.validarServicio);
  const [confirmaValidar, setConfirmaValidar] = useState(false);

  const servicio = servicios.find((s) => s.id === params.id);

  if (!servicio) {
    return (
      <div className="mx-auto max-w-5xl space-y-5">
        <Link
          href="/mando/operaciones"
          className="hover:text-brand-700 inline-flex items-center gap-1 text-sm text-slate-500"
        >
          <ArrowLeft size={14} /> Volver a operaciones
        </Link>
        <EmptyState
          icon={<FileText size={28} />}
          titulo="Servicio no encontrado"
          descripcion={`No existe un servicio con id ${params.id}. Volvé al listado para buscarlo.`}
          variant="warning"
          accion={{
            label: 'Volver a operaciones',
            onClick: () => router.push('/mando/operaciones'),
          }}
        />
      </div>
    );
  }

  const movil = moviles.find((m) => m.id === servicio.movilId);
  const dotacion = servicio.dotacionIds
    .map((id) => personas.find((p) => p.id === id))
    .filter(Boolean);
  const creadoPor = personas.find((p) => p.id === servicio.creadoPor);
  const confirmadoPor = servicio.confirmadoPor
    ? personas.find((p) => p.id === servicio.confirmadoPor)
    : null;
  const duracionMin = Math.round(
    (new Date(servicio.horaRegreso).getTime() - new Date(servicio.horaSalida).getTime()) / 60_000,
  );

  function handleValidar() {
    if (!persona) return;
    validar(servicio!.id, persona.id);
    setConfirmaValidar(false);
    toast.push({
      kind: 'success',
      title: 'Servicio validado',
      description: 'Sumado al cómputo y a la rendición.',
    });
  }

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <Link
        href="/mando/operaciones"
        className="hover:text-brand-700 inline-flex items-center gap-1 text-sm text-slate-500"
      >
        <ArrowLeft size={14} /> Volver a operaciones
      </Link>

      <PageHero
        objetivo={`Servicio ${servicio.id}`}
        titulo={`${tipoServicioLabel[servicio.tipo]} · ${servicio.direccion}`}
        descripcion={`${fmtFechaHora(servicio.horaSalida)} → ${fmtHora(servicio.horaRegreso)} · ${duracionMin} min`}
        icono={<Flame size={26} />}
        variant={servicio.estado === 'pendiente_validacion' ? 'critical' : 'default'}
        meta={
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Kpi label="Tipo" value={tipoServicioLabel[servicio.tipo]} intent="brand" />
            <Kpi label="Móvil" value={movil?.codigo ?? '—'} intent="brand" />
            <Kpi
              label="Dotación"
              value={servicio.dotacionIds.length}
              hint="personas"
              intent="neutral"
            />
            <Kpi
              label="Estado"
              value={servicio.estado === 'validado' ? 'Validado' : 'Pendiente'}
              intent={servicio.estado === 'validado' ? 'ok' : 'warn'}
            />
          </div>
        }
        acciones={
          servicio.estado === 'pendiente_validacion' ? (
            <Button intent="success" onClick={() => setConfirmaValidar(true)}>
              <Check size={16} /> Validar servicio
            </Button>
          ) : (
            <Badge intent="ok">
              <ShieldCheck size={10} className="mr-1" /> Firmado y registrado
            </Badge>
          )
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Mapa */}
        <div className="lg:col-span-2">
          <Card className="overflow-hidden p-0">
            <MapView
              center={{ lat: servicio.lat, lng: servicio.lng }}
              zoom={15}
              pins={[
                {
                  id: 'servicio',
                  lat: servicio.lat,
                  lng: servicio.lng,
                  color: TIPO_COLOR[servicio.tipo] ?? 'bg-slate-500',
                  label: '🔥',
                  popup:
                    '<strong>' +
                    tipoServicioLabel[servicio.tipo] +
                    '</strong><div style="font-size:11px;color:#64748b">' +
                    servicio.direccion +
                    '</div>',
                },
              ]}
              className="h-[300px]"
            />
          </Card>

          {/* Notas */}
          {servicio.notas && (
            <Card className="mt-4">
              <CardContent className="p-4">
                <div className="mb-2 flex items-center gap-2">
                  <FileText size={14} className="text-slate-500" />
                  <span className="text-xs font-bold uppercase text-slate-500">Notas</span>
                </div>
                <p className="text-sm text-slate-700">{servicio.notas}</p>
              </CardContent>
            </Card>
          )}

          {/* Adjuntos placeholder */}
          <Card className="mt-4">
            <CardContent className="p-4">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Camera size={14} className="text-slate-500" />
                  <span className="text-xs font-bold uppercase text-slate-500">Adjuntos</span>
                </div>
                <Button intent="ghost" size="sm">
                  <Camera size={12} /> Agregar
                </Button>
              </div>
              <EmptyState
                inline
                icon={<Camera size={24} />}
                titulo="Sin fotos del operativo"
                descripcion="Subí fotos para documentar la escena. Quedan archivadas al servicio."
                variant="info"
              />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar info */}
        <div className="space-y-3">
          {/* Dotación */}
          <Card>
            <CardContent className="p-4">
              <div className="mb-2 flex items-center gap-2">
                <Users size={14} className="text-slate-500" />
                <span className="text-xs font-bold uppercase text-slate-500">Dotación</span>
              </div>
              <ul className="space-y-1.5">
                {dotacion.map((p) => (
                  <li key={p!.id} className="flex items-center gap-2">
                    <Avatar name={`${p!.nombre} ${p!.apellido}`} src={p!.fotoUrl} size={28} />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium text-slate-900">
                        {p!.nombre} {p!.apellido}
                      </div>
                      <div className="font-mono text-[11px] text-slate-500">legajo {p!.legajo}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Historia del servicio */}
          <Card>
            <CardContent className="p-4">
              <div className="mb-2 flex items-center gap-2">
                <Activity size={14} className="text-slate-500" />
                <span className="text-xs font-bold uppercase text-slate-500">Historia</span>
              </div>
              <dl className="space-y-2 text-xs">
                <div>
                  <dt className="text-slate-500">Cargado por</dt>
                  <dd className="font-medium text-slate-900">
                    {creadoPor?.nombre} {creadoPor?.apellido}
                  </dd>
                  <dd className="text-slate-500">{fmtFechaHora(servicio.creadoEn)}</dd>
                </div>
                {confirmadoPor && servicio.confirmadoEn && (
                  <div className="border-t border-slate-100 pt-2">
                    <dt className="text-slate-500">Validado por</dt>
                    <dd className="font-medium text-slate-900">
                      {confirmadoPor.nombre} {confirmadoPor.apellido}
                    </dd>
                    <dd className="text-slate-500">{fmtFechaHora(servicio.confirmadoEn)}</dd>
                  </div>
                )}
                <div className="border-t border-slate-100 pt-2">
                  <dt className="text-slate-500">Origen</dt>
                  <dd className="font-medium capitalize text-slate-900">{servicio.origen}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">GPS</dt>
                  <dd className="font-mono text-slate-900">
                    {servicio.lat.toFixed(4)}, {servicio.lng.toFixed(4)}
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          {/* Horarios */}
          <Card>
            <CardContent className="p-4">
              <div className="mb-2 flex items-center gap-2">
                <Clock size={14} className="text-slate-500" />
                <span className="text-xs font-bold uppercase text-slate-500">Horarios</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-center text-xs">
                <div className="rounded bg-slate-50 p-2">
                  <div className="text-slate-500">Salida</div>
                  <div className="mt-0.5 font-bold tabular-nums text-slate-900">
                    {fmtHora(servicio.horaSalida)}
                  </div>
                </div>
                <div className="rounded bg-slate-50 p-2">
                  <div className="text-slate-500">Regreso</div>
                  <div className="mt-0.5 font-bold tabular-nums text-slate-900">
                    {fmtHora(servicio.horaRegreso)}
                  </div>
                </div>
              </div>
              <div className="text-status-warn-fg mt-2 text-center text-xs font-bold">
                Duración: {duracionMin} min
              </div>
            </CardContent>
          </Card>

          {/* Acciones */}
          <Card>
            <CardContent className="space-y-2 p-3">
              <Button intent="secondary" size="sm" fullWidth>
                <Edit size={12} /> Editar manualmente
              </Button>
              <Button intent="secondary" size="sm" fullWidth>
                <Download size={12} /> Exportar PDF
              </Button>
              <Link href={`/mando/parte-nfirs?servicio=${servicio.id}` as never}>
                <Button intent="secondary" size="sm" fullWidth>
                  <FileText size={12} /> Generar parte de servicio
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>

      <ConfirmDialog
        open={confirmaValidar}
        onClose={() => setConfirmaValidar(false)}
        onConfirm={handleValidar}
        titulo="¿Validar este servicio?"
        descripcion="Una vez validado, se suma al cómputo y a la rendición del mes. La acción queda firmada con tu nombre."
        confirmarLabel="Sí, validar"
      />
    </div>
  );
}
