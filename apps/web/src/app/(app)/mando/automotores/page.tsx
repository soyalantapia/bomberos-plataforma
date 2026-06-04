'use client';

import { AlertTriangle, Calendar, Camera, Sparkles, Truck, Wrench } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';

import type { Movil } from '@faro/types';

import { Card, CardContent, Kpi, StatusPill, cn } from '@faro/ui';

import { NuevoMovilDialog } from '../../../../components/automotores/nuevo-movil-dialog';
import { TruckIllustration } from '../../../../components/automotores/truck-illustration';
import { PageHero } from '../../../../components/shared/page-hero';
import type { EstadoOperativoMovil } from '../../../../data/automotores';
import { fmtFechaCorta } from '../../../../lib/utils/date';
import { demoToday } from '../../../../lib/utils/demo-today';
import { useFaroStore, selectCuartelActivo } from '../../../../store/use-faro-store';

function diasHasta(iso: string): number {
  const target = new Date(iso).setHours(0, 0, 0, 0);
  const now = demoToday().setHours(0, 0, 0, 0);
  return Math.round((target - now) / 8.64e7);
}

const ESTADO_OP: Record<EstadoOperativoMovil, { label: string; cls: string }> = {
  en_servicio: { label: 'En servicio', cls: 'bg-status-ok' },
  fuera_servicio: { label: 'Fuera de servicio', cls: 'bg-slate-700' },
  en_taller: { label: 'En taller', cls: 'bg-status-warn' },
};

const TIPOS: Array<{ id: 'todos' | Movil['tipo']; label: string }> = [
  { id: 'todos', label: 'Todos' },
  { id: 'autobomba', label: 'Autobomba' },
  { id: 'rescate', label: 'Rescate' },
  { id: 'forestal', label: 'Forestal' },
  { id: 'ambulancia', label: 'Ambulancia' },
  { id: 'utilitario', label: 'Utilitario' },
];

export default function AutomotoresPage() {
  const cuartel = useFaroStore(selectCuartelActivo);
  const allMoviles = useFaroStore((s) => s.moviles);
  const fichas = useFaroStore((s) => s.fichasMovil);
  const router = useRouter();
  const [nuevoOpen, setNuevoOpen] = useState(false);
  const [filtroTipo, setFiltroTipo] = useState<'todos' | Movil['tipo']>('todos');

  const moviles = useMemo(
    () => allMoviles.filter((m) => m.cuartelId === cuartel?.id),
    [allMoviles, cuartel?.id],
  );
  const fichaDe = (id: string) => fichas.find((f) => f.movilId === id);

  const visibles = useMemo(
    () => (filtroTipo === 'todos' ? moviles : moviles.filter((m) => m.tipo === filtroTipo)),
    [moviles, filtroTipo],
  );

  const enServicio = moviles.filter(
    (m) =>
      (fichaDe(m.id)?.estadoOperativo ?? (m.enServicio ? 'en_servicio' : 'fuera_servicio')) ===
      'en_servicio',
  ).length;
  const porVencer = moviles.filter((m) => {
    const d = diasHasta(m.vtvVencimiento);
    return d >= 0 && d < 30;
  }).length;
  const horasTotales = moviles.reduce((acc, m) => acc + m.horasServicio, 0);

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <PageHero
        objetivo="Vista Mando · Automotores"
        titulo={porVencer > 0 ? `${porVencer} VTV por vencer en 30 días` : 'Toda la flota al día'}
        descripcion="El garaje del cuartel: cada móvil con su foto, capacidades, documentación y mantenimiento. Tocá un móvil para ver su ficha completa."
        icono={<Truck size={26} />}
        variant={porVencer > 0 ? 'critical' : 'success'}
        meta={
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Kpi label="Móviles" value={moviles.length} intent="brand" icon={<Truck size={16} />} />
            <Kpi label="En servicio" value={enServicio} hint={`de ${moviles.length}`} intent="ok" />
            <Kpi
              label="VTV próximas"
              value={porVencer}
              hint="< 30 días"
              intent={porVencer > 0 ? 'warn' : 'ok'}
              icon={<Calendar size={16} />}
            />
            <Kpi label="Horas flota" value={horasTotales} hint="acumuladas" intent="neutral" />
          </div>
        }
        acciones={
          <button
            type="button"
            onClick={() => setNuevoOpen(true)}
            className="bg-brand-600 hover:bg-brand-700 inline-flex h-10 items-center gap-1.5 rounded-lg px-3 text-sm font-medium text-white"
          >
            <Truck size={14} /> Nuevo móvil
          </button>
        }
      />

      {/* Filtros por tipo */}
      <div className="flex flex-wrap gap-2">
        {TIPOS.map((t) => {
          const n =
            t.id === 'todos' ? moviles.length : moviles.filter((m) => m.tipo === t.id).length;
          if (t.id !== 'todos' && n === 0) return null;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setFiltroTipo(t.id)}
              className={cn(
                'rounded-full px-3 py-1 text-xs font-medium transition-colors',
                filtroTipo === t.id
                  ? 'bg-brand-600 text-white'
                  : 'bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50',
              )}
            >
              {t.label} <span className="opacity-70">{n}</span>
            </button>
          );
        })}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {visibles.map((m) => {
          const ficha = fichaDe(m.id);
          const estadoOp =
            ficha?.estadoOperativo ?? (m.enServicio ? 'en_servicio' : 'fuera_servicio');
          const dias = diasHasta(m.vtvVencimiento);
          const vtvEstado = dias < 0 ? 'risk' : dias < 30 ? 'warn' : 'ok';
          const eo = ESTADO_OP[estadoOp];
          return (
            <Link key={m.id} href={`/mando/automotores/${m.id}` as never} className="group block">
              <Card className="overflow-hidden transition-shadow hover:shadow-lg">
                {/* Hero: foto real o ilustración por tipo */}
                <div className="relative aspect-video bg-slate-100">
                  {ficha?.fotoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={ficha.fotoUrl}
                      alt={`Móvil ${m.codigo}`}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <TruckIllustration codigo={m.codigo} tipo={m.tipo} className="h-full w-full" />
                  )}
                  <span
                    className={cn(
                      'absolute left-2 top-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold text-white shadow-sm',
                      eo.cls,
                    )}
                  >
                    {eo.label}
                  </span>
                  {!ficha?.fotoUrl && (
                    <span className="absolute bottom-2 right-2 inline-flex items-center gap-1 rounded-full bg-black/45 px-2 py-0.5 text-[11px] font-medium text-white backdrop-blur-sm">
                      <Camera size={11} /> Sin foto
                    </span>
                  )}
                </div>

                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="text-xl font-bold leading-tight text-slate-900">
                        {m.codigo}
                      </div>
                      <div className="text-sm text-slate-600">
                        {m.marca} {m.modelo} · {m.anio}
                      </div>
                    </div>
                    <span className="inline-flex shrink-0 items-center rounded-md bg-slate-900 px-2 py-1 font-mono text-[11px] font-bold tracking-wider text-white">
                      {m.dominio.toUpperCase()}
                    </span>
                  </div>

                  <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2.5 text-sm">
                    <div className="flex items-center gap-1.5 text-slate-500">
                      <Calendar size={12} /> VTV
                    </div>
                    <StatusPill
                      status={vtvEstado}
                      label={fmtFechaCorta(m.vtvVencimiento)}
                      size="sm"
                    />
                  </div>
                  {ficha && (
                    <div className="mt-1.5 flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1.5 text-slate-500">
                        <Wrench size={12} /> Combustible
                      </div>
                      <span
                        className={cn(
                          'font-bold tabular-nums',
                          ficha.combustiblePct < 25
                            ? 'text-status-risk-fg'
                            : ficha.combustiblePct < 50
                              ? 'text-status-warn-fg'
                              : 'text-slate-900',
                        )}
                      >
                        {ficha.combustiblePct}%
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {porVencer > 0 && (
        <Card className="bg-status-warn-bg/30 border-status-warn/40">
          <CardContent className="flex items-start gap-3 p-4">
            <div className="bg-status-warn grid h-10 w-10 shrink-0 place-items-center rounded-xl text-white">
              <Sparkles size={18} />
            </div>
            <div>
              <div className="text-status-warn-fg flex items-center gap-2 font-semibold">
                <AlertTriangle size={14} /> Vencimientos próximos
              </div>
              <p className="mt-1 text-sm text-slate-700">
                Hay {porVencer} VTV próxima{porVencer === 1 ? '' : 's'} a vencer. Sin VTV vigente el
                móvil no puede operar y se descuenta del cómputo. Coordiná la inspección con
                anticipación.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <NuevoMovilDialog
        open={nuevoOpen}
        onClose={() => setNuevoOpen(false)}
        onCreated={(m) => router.push(`/mando/automotores/${m.id}` as never)}
      />
    </div>
  );
}
