'use client';

import { Badge, Card, CardContent, SectionHeader, StatusPill } from '@faro/ui';

import { useFaroStore } from '../../../../store/use-faro-store';
import { fmtMesPeriodo } from '../../../../lib/utils/date';

export default function CumplimientoFed() {
  const cuarteles = useFaroStore((s) => s.cuarteles);
  const ranking = [...cuarteles].sort((a, b) => a.porcentajeRendicion - b.porcentajeRendicion);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <SectionHeader title="Cumplimiento / Rendiciones" description={`${fmtMesPeriodo('2026-05')} · seguimiento de los ${cuarteles.length} cuarteles`} />

      <Card>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="text-left px-4 py-2.5">Cuartel</th>
                <th className="text-left px-4 py-2.5">Plazo</th>
                <th className="text-right px-4 py-2.5">Avance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {ranking.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <StatusPill status={c.cumplimiento} label=" " size="sm" className="!px-1.5 !py-1.5" />
                      <span className="font-medium text-slate-900">{c.nombre}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-600">10/06/2026</td>
                  <td className="px-4 py-3 text-right">
                    <Badge intent={c.cumplimiento === 'ok' ? 'ok' : c.cumplimiento === 'warn' ? 'warn' : 'risk'}>{c.porcentajeRendicion}%</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
