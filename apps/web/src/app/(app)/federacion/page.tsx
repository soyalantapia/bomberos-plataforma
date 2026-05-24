'use client';

import { AlertTriangle, TrendingUp } from 'lucide-react';

import { Badge, Card, CardContent, CardHeader, CardTitle, cn, Kpi, SectionHeader, StatusPill } from '@faro/ui';

import { useFaroStore } from '../../../store/use-faro-store';

export default function TableroFederacion() {
  const cuarteles = useFaroStore((s) => s.cuarteles);
  const servicios = useFaroStore((s) => s.servicios);
  const personas = useFaroStore((s) => s.personas);

  const enRiesgo = cuarteles.filter((c) => c.cumplimiento === 'risk');
  const atencion = cuarteles.filter((c) => c.cumplimiento === 'warn');
  const enRegla = cuarteles.filter((c) => c.cumplimiento === 'ok');
  const totalServicios = servicios.length;
  const totalPersonal = personas.filter((p) => p.estado === 'activo').length;
  const promedio = Math.round(cuarteles.reduce((acc, c) => acc + c.porcentajeRendicion, 0) / cuarteles.length);
  const ranking = [...cuarteles].sort((a, b) => b.porcentajeRendicion - a.porcentajeRendicion);

  return (
    <div className="space-y-6">
      <SectionHeader title="Tablero Federación" description="Norte GBA · Estado del mes y cuarteles que necesitan acción" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Kpi label="Cuarteles" value={cuarteles.length} hint="bajo gestión" icon={<TrendingUp size={18} />} intent="brand" />
        <Kpi label="Cumplimiento medio" value={`${promedio}%`} hint="del mes" intent={promedio >= 90 ? 'ok' : promedio >= 70 ? 'warn' : 'risk'} />
        <Kpi label="Servicios" value={totalServicios} hint="acumulados" intent="neutral" />
        <Kpi label="Personal" value={totalPersonal} hint="activo" intent="neutral" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Cuarteles · Semáforo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {cuarteles.map((c) => (
              <div key={c.id} className="rounded-xl border border-slate-200 p-4 flex flex-col items-center text-center">
                <div className={cn('h-16 w-16 rounded-full grid place-items-center text-white text-lg font-bold mb-2',
                  c.cumplimiento === 'ok' && 'bg-status-ok',
                  c.cumplimiento === 'warn' && 'bg-status-warn',
                  c.cumplimiento === 'risk' && 'bg-status-risk',
                  c.cumplimiento === 'neutral' && 'bg-status-neutral')}>
                  {c.porcentajeRendicion}
                </div>
                <div className="font-semibold text-slate-900">{c.nombre}</div>
                <div className="text-xs text-slate-500">{c.ciudad}</div>
              </div>
            ))}
          </div>
          <div className="px-1 py-3 border-t border-slate-100 flex items-center gap-4 flex-wrap text-sm mt-4">
            <div className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full bg-status-ok" />En regla ({enRegla.length})</div>
            <div className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full bg-status-warn" />Atención ({atencion.length})</div>
            <div className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full bg-status-risk" />En riesgo ({enRiesgo.length})</div>
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-3 gap-5">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><AlertTriangle size={18} className="text-status-risk" /> Necesitan acción</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {[...enRiesgo, ...atencion].map((c) => (
                <li key={c.id} className={cn('flex items-start gap-2 p-3 rounded-lg', c.cumplimiento === 'risk' ? 'bg-status-risk-bg/40' : 'bg-status-warn-bg/40')}>
                  <StatusPill status={c.cumplimiento} label={`${c.porcentajeRendicion}%`} size="sm" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-slate-900">{c.nombre}</div>
                    <div className="text-xs text-slate-600">Cumplimiento del mes</div>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Ranking del mes</CardTitle></CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="text-left px-4 py-2.5 w-12">#</th>
                  <th className="text-left px-4 py-2.5">Cuartel</th>
                  <th className="text-left px-4 py-2.5">Ciudad</th>
                  <th className="text-right px-4 py-2.5">Rendición</th>
                  <th className="text-right px-4 py-2.5">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {ranking.map((c, idx) => (
                  <tr key={c.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-slate-500 font-medium">{idx + 1}</td>
                    <td className="px-4 py-3 font-semibold text-slate-900">{c.nombre}</td>
                    <td className="px-4 py-3 text-slate-600">{c.ciudad}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{c.porcentajeRendicion}%</td>
                    <td className="px-4 py-3 text-right">
                      <Badge intent={c.cumplimiento === 'ok' ? 'ok' : c.cumplimiento === 'warn' ? 'warn' : 'risk'}>
                        {c.cumplimiento === 'ok' ? 'En regla' : c.cumplimiento === 'warn' ? 'Atención' : 'En riesgo'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-gradient-to-br from-brand-50 to-white border-brand-100">
        <CardContent className="p-5">
          <div className="flex gap-3 items-start">
            <div className="h-10 w-10 rounded-xl bg-brand-600 grid place-items-center text-white shrink-0">
              <TrendingUp size={20} />
            </div>
            <div className="flex-1">
              <div className="font-semibold text-brand-900">Resumen de la región</div>
              <p className="text-sm text-brand-900/90 mt-1">
                Norte GBA con {cuarteles.length} cuarteles y un cumplimiento promedio del {promedio}%. <strong>San Isidro</strong> está en riesgo de no llegar a la rendición. <strong>Villa Ballester</strong> avanza pero le faltan firmas del Comandante.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
