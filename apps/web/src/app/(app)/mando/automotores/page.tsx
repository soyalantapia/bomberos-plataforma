'use client';

import { AlertTriangle, Calendar, Truck } from 'lucide-react';

import { Badge, Card, CardContent, Kpi, SectionHeader, StatusPill } from '@faro/ui';

import { useFaroStore, selectCuartelActivo } from '../../../../store/use-faro-store';
import { fmtFechaCorta } from '../../../../lib/utils/date';

function diasHasta(iso: string): number {
  const target = new Date(iso).setHours(0, 0, 0, 0);
  const now = new Date().setHours(0, 0, 0, 0);
  return Math.round((target - now) / 8.64e7);
}

export default function AutomotoresPage() {
  const cuartel = useFaroStore(selectCuartelActivo);
  const allMoviles = useFaroStore((s) => s.moviles);
  const moviles = allMoviles.filter((m) => m.cuartelId === cuartel?.id);

  const enServicio = moviles.filter((m) => m.enServicio).length;
  const porVencer = moviles.filter((m) => diasHasta(m.vtvVencimiento) < 30).length;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <SectionHeader title="Automotores" description="Móviles, VTV, licencias y horas de servicio" />

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        <Kpi label="Móviles" value={moviles.length} intent="brand" icon={<Truck size={18} />} />
        <Kpi label="En servicio" value={enServicio} intent="ok" />
        <Kpi label="VTV por vencer" value={porVencer} hint="próximos 30 días" intent={porVencer > 0 ? 'warn' : 'ok'} icon={<Calendar size={18} />} />
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {moviles.map((m) => {
          const dias = diasHasta(m.vtvVencimiento);
          const estado = dias < 0 ? 'risk' : dias < 30 ? 'warn' : 'ok';
          return (
            <Card key={m.id}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="text-2xl font-bold text-slate-900">{m.codigo}</div>
                    <div className="text-xs text-slate-500 capitalize">{m.tipo}</div>
                  </div>
                  <Badge intent={m.enServicio ? 'ok' : 'warn'}>{m.enServicio ? 'En servicio' : 'Fuera'}</Badge>
                </div>
                <div className="text-sm text-slate-700">{m.marca} {m.modelo} · {m.anio}</div>
                <div className="text-xs text-slate-500 mt-0.5 font-mono">{m.dominio}</div>
                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="text-xs text-slate-500">VTV</div>
                  <StatusPill status={estado} label={fmtFechaCorta(m.vtvVencimiento)} size="sm" />
                </div>
                <div className="mt-2 flex items-center justify-between text-sm">
                  <div className="text-slate-500">Horas</div>
                  <div className="font-medium tabular-nums">{m.horasServicio}</div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {porVencer > 0 && (
        <Card className="bg-status-warn-bg/30 border-status-warn">
          <CardContent className="p-4 flex items-start gap-3">
            <AlertTriangle size={20} className="text-status-warn-fg shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-status-warn-fg">Alertas predictivas (IA)</div>
              <p className="text-sm text-slate-700 mt-1">
                Coordiná la VTV de los móviles con vencimiento próximo. Sin VTV vigente el móvil no puede operar y se descuenta del cómputo.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
