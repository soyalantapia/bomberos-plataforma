'use client';

import { AlertTriangle, Calendar, Sparkles, Truck, Wrench } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Badge, Card, CardContent, Kpi, StatusPill, cn } from '@faro/ui';

import { NuevoMovilDialog } from '../../../../components/automotores/nuevo-movil-dialog';
import { PageHero } from '../../../../components/shared/page-hero';
import { fmtFechaCorta } from '../../../../lib/utils/date';
import { demoToday } from '../../../../lib/utils/demo-today';
import { useFaroStore, selectCuartelActivo } from '../../../../store/use-faro-store';

function diasHasta(iso: string): number {
  const target = new Date(iso).setHours(0, 0, 0, 0);
  const now = demoToday().setHours(0, 0, 0, 0);
  return Math.round((target - now) / 8.64e7);
}

function fmtDominio(d: string): string {
  return d.replace(/\s+/g, ' ').toUpperCase();
}

const TIPO_COLOR: Record<string, string> = {
  autobomba: 'bg-status-risk',
  rescate: 'bg-status-warn',
  forestal: 'bg-status-ok',
  ambulancia: 'bg-brand-600',
  utilitario: 'bg-slate-600',
};

export default function AutomotoresPage() {
  const cuartel = useFaroStore(selectCuartelActivo);
  const allMoviles = useFaroStore((s) => s.moviles);
  const moviles = allMoviles.filter((m) => m.cuartelId === cuartel?.id);
  const router = useRouter();
  const [nuevoOpen, setNuevoOpen] = useState(false);

  const enServicio = moviles.filter((m) => m.enServicio).length;
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
        descripcion="Móviles del cuartel, vencimientos de VTV, licencias de conductores y horas de servicio acumuladas."
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

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {moviles.map((m) => {
          const dias = diasHasta(m.vtvVencimiento);
          const estado = dias < 0 ? 'risk' : dias < 30 ? 'warn' : 'ok';
          return (
            <Card key={m.id} className="overflow-hidden">
              <div className={cn('h-1.5', TIPO_COLOR[m.tipo] ?? 'bg-slate-400')} />
              <CardContent className="p-5">
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-2xl font-bold text-slate-900">{m.codigo}</div>
                    <div className="text-xs capitalize text-slate-500">{m.tipo}</div>
                  </div>
                  <Badge intent={m.enServicio ? 'ok' : 'warn'}>
                    {m.enServicio ? 'En servicio' : 'Fuera'}
                  </Badge>
                </div>

                <div className="text-sm text-slate-700">
                  {m.marca} {m.modelo}
                </div>
                <div className="mt-0.5 text-xs text-slate-500">Año {m.anio}</div>

                <div className="mt-2 inline-flex items-center rounded-md bg-slate-900 px-2 py-1 font-mono text-[11px] font-bold tracking-wider text-white">
                  {fmtDominio(m.dominio)}
                </div>

                <div className="mt-4 space-y-2 border-t border-slate-100 pt-3">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1.5 text-slate-500">
                      <Calendar size={12} /> VTV
                    </div>
                    <StatusPill status={estado} label={fmtFechaCorta(m.vtvVencimiento)} size="sm" />
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1.5 text-slate-500">
                      <Wrench size={12} /> Horas
                    </div>
                    <div className="font-bold tabular-nums text-slate-900">{m.horasServicio}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
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
