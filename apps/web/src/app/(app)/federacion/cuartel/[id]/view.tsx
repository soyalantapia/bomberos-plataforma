'use client';

import {
  ArrowLeft,
  ClipboardCheck,
  Eye,
  FileCheck2,
  Flag,
  Gauge,
  Megaphone,
  ShieldAlert,
  Target,
  Truck,
  Users,
  Wrench,
  type LucideIcon,
} from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';

import {
  Badge,
  Button,
  Card,
  CardContent,
  Dialog,
  Input,
  Kpi,
  Label,
  Textarea,
  cn,
  useToast,
} from '@faro/ui';

import { EmptyState } from '../../../../../components/shared/empty-state';
import type { TipoAccionFed } from '../../../../../data/acciones-fed';
import { fmtFechaCorta, mesKey } from '../../../../../lib/utils/date';
import { demoToday } from '../../../../../lib/utils/demo-today';
import { tipoServicioLabel } from '../../../../../lib/utils/tipo-servicio';
import { useFaroStore } from '../../../../../store/use-faro-store';

const TIPOS: Array<{
  id: TipoAccionFed;
  label: string;
  icon: LucideIcon;
  desc: string;
  tone: string;
}> = [
  {
    id: 'comunicado',
    label: 'Comunicar',
    icon: Megaphone,
    desc: 'Mensaje al mando del cuartel',
    tone: 'bg-brand-600',
  },
  {
    id: 'observacion',
    label: 'Observación',
    icon: Eye,
    desc: 'Dejar registro',
    tone: 'bg-slate-600',
  },
  {
    id: 'intervencion',
    label: 'Intervención',
    icon: ShieldAlert,
    desc: 'Plan de regularización',
    tone: 'bg-status-risk',
  },
  {
    id: 'auditoria',
    label: 'Auditoría',
    icon: ClipboardCheck,
    desc: 'Solicitar / programar',
    tone: 'bg-status-warn',
  },
  {
    id: 'objetivo',
    label: 'Objetivo',
    icon: Target,
    desc: 'Fijar meta con plazo',
    tone: 'bg-status-ok',
  },
];
const TIPO_LABEL: Record<TipoAccionFed, string> = {
  comunicado: 'Comunicado',
  observacion: 'Observación',
  intervencion: 'Intervención',
  auditoria: 'Auditoría',
  objetivo: 'Objetivo',
};

function diasHasta(iso: string) {
  return Math.round(
    (new Date(iso).setHours(0, 0, 0, 0) - demoToday().setHours(0, 0, 0, 0)) / 8.64e7,
  );
}

export default function FichaCuartelFederacion() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const toast = useToast();
  const cuarteles = useFaroStore((s) => s.cuarteles);
  const personas = useFaroStore((s) => s.personas);
  const servicios = useFaroStore((s) => s.servicios);
  const moviles = useFaroStore((s) => s.moviles);
  const rendiciones = useFaroStore((s) => s.rendiciones);
  const accionesFed = useFaroStore((s) => s.accionesFed);
  const registrarAccionFed = useFaroStore((s) => s.registrarAccionFed);
  const resolverAccionFed = useFaroStore((s) => s.resolverAccionFed);

  const cuartel = cuarteles.find((c) => c.id === params.id);
  const [dlg, setDlg] = useState<TipoAccionFed | null>(null);
  const [asunto, setAsunto] = useState('');
  const [detalle, setDetalle] = useState('');

  const periodo = mesKey(demoToday());
  const d = useMemo(() => {
    const id = params.id;
    const personal = personas.filter((p) => p.cuartelId === id && p.estado === 'activo');
    const servs = servicios.filter(
      (s) => s.cuartelId === id && s.horaSalida.slice(0, 7) === periodo,
    );
    const mov = moviles.filter((m) => m.cuartelId === id);
    const vtvVencen = mov.filter((m) => {
      const dd = diasHasta(m.vtvVencimiento);
      return dd >= 0 && dd < 30;
    }).length;
    const rend = Object.values(rendiciones).find(
      (r) => r.cuartelId === id && r.periodo === periodo,
    );
    const porTipo = servs.reduce<Record<string, number>>((acc, s) => {
      acc[s.tipo] = (acc[s.tipo] ?? 0) + 1;
      return acc;
    }, {});
    return { personal, servs, mov, vtvVencen, rend, porTipo };
  }, [params.id, personas, servicios, moviles, rendiciones, periodo]);

  const acciones = useMemo(
    () =>
      accionesFed
        .filter((a) => a.cuartelId === params.id)
        .sort((a, b) => b.fecha.localeCompare(a.fecha)),
    [accionesFed, params.id],
  );
  const abiertas = acciones.filter((a) => a.estado !== 'resuelta').length;

  if (!cuartel) {
    return (
      <div className="mx-auto max-w-4xl space-y-5">
        <Link
          href="/federacion"
          className="hover:text-brand-700 inline-flex items-center gap-1 text-sm text-slate-500"
        >
          <ArrowLeft size={14} /> Volver a Federación
        </Link>
        <EmptyState
          icon={<Flag size={28} />}
          titulo="Cuartel no encontrado"
          descripcion={`No existe un cuartel con id ${params.id}.`}
          variant="warning"
          accion={{ label: 'Volver', onClick: () => router.push('/federacion') }}
        />
      </div>
    );
  }

  const semColor =
    cuartel.cumplimiento === 'ok'
      ? 'bg-status-ok'
      : cuartel.cumplimiento === 'warn'
        ? 'bg-status-warn'
        : cuartel.cumplimiento === 'risk'
          ? 'bg-status-risk'
          : 'bg-status-neutral';
  const semLabel =
    cuartel.cumplimiento === 'ok'
      ? 'En regla'
      : cuartel.cumplimiento === 'warn'
        ? 'Atención'
        : cuartel.cumplimiento === 'risk'
          ? 'En riesgo'
          : 'Sin datos';

  function abrir(tipo: TipoAccionFed) {
    setAsunto('');
    setDetalle('');
    setDlg(tipo);
  }
  function guardar() {
    if (!dlg || !cuartel) return;
    if (asunto.trim().length < 4) {
      toast.push({
        kind: 'warn',
        title: 'Falta el asunto',
        description: 'Escribí de qué se trata.',
      });
      return;
    }
    registrarAccionFed({
      cuartelId: cuartel.id,
      region: cuartel.region,
      tipo: dlg,
      asunto: asunto.trim(),
      detalle: detalle.trim() || undefined,
    });
    toast.push({
      kind: 'success',
      title: `${TIPO_LABEL[dlg]} registrada`,
      description:
        dlg === 'comunicado'
          ? 'Le llega una notificación al mando del cuartel.'
          : 'Queda en la bitácora del cuartel.',
    });
    setDlg(null);
  }

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <Link
        href="/federacion"
        className="hover:text-brand-700 inline-flex items-center gap-1 text-sm text-slate-500"
      >
        <ArrowLeft size={14} /> Volver a Federación
      </Link>

      {/* Cabecera */}
      <Card>
        <CardContent className="p-5">
          <div className="flex items-start gap-4">
            <div
              className={cn(
                'grid h-16 w-16 shrink-0 place-items-center rounded-2xl text-xl font-black text-white shadow-sm',
                semColor,
              )}
            >
              {cuartel.porcentajeRendicion}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-black text-slate-900">{cuartel.nombre}</h1>
                <Badge
                  intent={
                    cuartel.cumplimiento === 'ok'
                      ? 'ok'
                      : cuartel.cumplimiento === 'warn'
                        ? 'warn'
                        : 'risk'
                  }
                >
                  {semLabel}
                </Badge>
                {abiertas > 0 && (
                  <Badge intent="brand">
                    {abiertas} acción{abiertas === 1 ? '' : 'es'} abierta{abiertas === 1 ? '' : 's'}
                  </Badge>
                )}
              </div>
              <div className="mt-0.5 text-sm text-slate-600">
                {cuartel.ciudad}, {cuartel.provincia} · {cuartel.region}
                {cuartel.matricula ? ` · ${cuartel.matricula}` : ''}
                {cuartel.jefe ? ` · Jefe: ${cuartel.jefe}` : ''}
              </div>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Kpi
              label="Rendición"
              value={`${cuartel.porcentajeRendicion}%`}
              hint={semLabel}
              icon={<Gauge size={16} />}
              intent={
                cuartel.cumplimiento === 'ok'
                  ? 'ok'
                  : cuartel.cumplimiento === 'warn'
                    ? 'warn'
                    : 'risk'
              }
            />
            <Kpi
              label="Personal activo"
              value={d.personal.length}
              icon={<Users size={16} />}
              intent="brand"
            />
            <Kpi label="Servicios mes" value={d.servs.length} hint={periodo} intent="neutral" />
            <Kpi
              label="Móviles"
              value={d.mov.length}
              hint={d.vtvVencen > 0 ? `${d.vtvVencen} VTV x vencer` : 'al día'}
              intent={d.vtvVencen > 0 ? 'warn' : 'ok'}
              icon={<Truck size={16} />}
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
        {/* Consolidación */}
        <div className="space-y-4">
          <Card>
            <CardContent className="p-5">
              <h3 className="mb-3 flex items-center gap-2 font-bold text-slate-900">
                <FileCheck2 size={18} className="text-brand-700" /> Consolidado del cuartel ·{' '}
                {periodo}
              </h3>
              {d.personal.length === 0 && d.servs.length === 0 && d.mov.length === 0 ? (
                <p className="text-sm text-slate-500">
                  Este cuartel todavía no tiene datos operativos cargados en el sistema. El semáforo
                  y la rendición vienen del consolidado regional; usá las acciones de la derecha
                  para pedir información o intervenir.
                </p>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-lg bg-slate-50 p-3">
                    <div className="text-xs text-slate-500">Personal activo</div>
                    <div className="text-xl font-bold text-slate-900">{d.personal.length}</div>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-3">
                    <div className="text-xs text-slate-500">Móviles</div>
                    <div className="text-xl font-bold text-slate-900">
                      {d.mov.length}
                      {d.vtvVencen > 0 && (
                        <span className="text-status-warn-fg ml-2 text-xs font-semibold">
                          {d.vtvVencen} VTV x vencer
                        </span>
                      )}
                    </div>
                  </div>
                  {Object.keys(d.porTipo).length > 0 && (
                    <div className="rounded-lg bg-slate-50 p-3 sm:col-span-2">
                      <div className="mb-1.5 text-xs text-slate-500">
                        Servicios del mes por tipo
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {Object.entries(d.porTipo)
                          .sort((a, b) => b[1] - a[1])
                          .map(([t, n]) => (
                            <span
                              key={t}
                              className="bg-brand-50 text-brand-800 rounded-md px-2 py-1 text-xs font-medium"
                            >
                              {tipoServicioLabel[t as keyof typeof tipoServicioLabel] ?? t}: {n}
                            </span>
                          ))}
                      </div>
                    </div>
                  )}
                  {d.rend && (
                    <div className="rounded-lg bg-slate-50 p-3 sm:col-span-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-500">
                          Rendición al Fondo (Ley 25.054)
                        </span>
                        <Badge intent={d.rend.estado === 'presentada' ? 'ok' : 'warn'}>
                          {d.rend.porcentaje}% · {d.rend.estado.replace(/_/g, ' ')}
                        </Badge>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Bitácora */}
          <Card>
            <CardContent className="p-5">
              <h3 className="mb-3 flex items-center gap-2 font-bold text-slate-900">
                <Wrench size={18} className="text-brand-700" /> Bitácora de la Federación
              </h3>
              {acciones.length === 0 ? (
                <EmptyState
                  inline
                  icon={<Flag size={24} />}
                  titulo="Sin acciones"
                  descripcion="Todavía no registraste acciones sobre este cuartel."
                />
              ) : (
                <ul className="space-y-2.5">
                  {acciones.map((a) => (
                    <li key={a.id} className="rounded-xl border border-slate-200 p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge
                              intent={
                                a.tipo === 'intervencion'
                                  ? 'risk'
                                  : a.tipo === 'auditoria'
                                    ? 'warn'
                                    : 'neutral'
                              }
                            >
                              {TIPO_LABEL[a.tipo]}
                            </Badge>
                            <span className="font-medium text-slate-900">{a.asunto}</span>
                          </div>
                          {a.detalle && <p className="mt-1 text-sm text-slate-600">{a.detalle}</p>}
                          <div className="mt-1 text-xs text-slate-400">
                            {fmtFechaCorta(a.fecha)} · {a.autor}
                          </div>
                        </div>
                        <div className="shrink-0">
                          {a.estado === 'resuelta' ? (
                            <Badge intent="ok">Resuelta</Badge>
                          ) : (
                            <Button
                              intent="ghost"
                              size="sm"
                              onClick={() => resolverAccionFed(a.id)}
                            >
                              Resolver
                            </Button>
                          )}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Decisiones */}
        <div className="space-y-3">
          <Card className="border-brand-100 bg-brand-50/30 border-2">
            <CardContent className="p-4">
              <h3 className="mb-1 flex items-center gap-2 font-bold text-slate-900">
                <ShieldAlert size={18} className="text-brand-700" /> Tomar una decisión
              </h3>
              <p className="mb-3 text-xs text-slate-600">
                Cada acción queda registrada en la bitácora del cuartel.
              </p>
              <div className="space-y-2">
                {TIPOS.map((t) => {
                  const Icon = t.icon;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => abrir(t.id)}
                      className="hover:border-brand-300 hover:bg-brand-50/40 flex w-full items-center gap-3 rounded-xl border border-slate-200 bg-white p-2.5 text-left transition-colors"
                    >
                      <span
                        className={cn(
                          'grid h-9 w-9 shrink-0 place-items-center rounded-lg text-white',
                          t.tone,
                        )}
                      >
                        <Icon size={16} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-semibold text-slate-900">
                          {t.label}
                        </span>
                        <span className="block text-xs text-slate-500">{t.desc}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Dialog acción */}
      <Dialog
        open={dlg !== null}
        onClose={() => setDlg(null)}
        title={dlg ? `${TIPO_LABEL[dlg]} · ${cuartel.nombre}` : ''}
        description={
          dlg === 'comunicado'
            ? 'Le llega una notificación al mando del cuartel y queda en la bitácora.'
            : 'Queda registrada en la bitácora del cuartel.'
        }
        size="md"
        footer={
          <div className="flex justify-end gap-2">
            <Button intent="ghost" onClick={() => setDlg(null)}>
              Cancelar
            </Button>
            <Button intent="primary" onClick={guardar}>
              Registrar
            </Button>
          </div>
        }
      >
        <div className="space-y-3">
          <div>
            <Label>Asunto *</Label>
            <Input
              value={asunto}
              onChange={(e) => setAsunto(e.target.value)}
              placeholder="Ej: Plan de regularización de rendición"
            />
          </div>
          <div>
            <Label>Detalle</Label>
            <Textarea
              value={detalle}
              onChange={(e) => setDetalle(e.target.value)}
              rows={3}
              placeholder="Contexto, plazo, responsable…"
            />
          </div>
        </div>
      </Dialog>
    </div>
  );
}
