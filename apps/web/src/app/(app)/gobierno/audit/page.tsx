'use client';

import { Sparkles } from 'lucide-react';

import { Badge, Card, CardContent, SectionHeader } from '@faro/ui';

import { useFaroStore } from '../../../../store/use-faro-store';
import { fmtFechaHora } from '../../../../lib/utils/date';
import { perfilLabel } from '../../../../lib/utils/perfil';

export default function AuditLogPage() {
  const audit = useFaroStore((s) => s.audit);
  const personas = useFaroStore((s) => s.personas);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <SectionHeader title="Audit log" description={`${audit.length} eventos registrados · cumplimiento Ley 25.326`} />

      <Card className="bg-brand-50 border-brand-100">
        <CardContent className="p-4 flex items-start gap-3">
          <Sparkles size={20} className="text-brand-700 shrink-0 mt-0.5" />
          <div>
            <div className="font-semibold text-brand-900">Detección de anomalías</div>
            <p className="text-sm text-brand-900/80 mt-0.5">La IA marca cambios inusuales para que los revise el referente de Orden Interno.</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0 max-h-[60vh] overflow-y-auto">
          {audit.length === 0 ? (
            <div className="p-6 text-center text-slate-500">Aún no hay eventos. Al crear o validar servicios, queda registrado acá.</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="text-left px-4 py-2">Fecha</th>
                  <th className="text-left px-4 py-2">Acción</th>
                  <th className="text-left px-4 py-2">Entidad</th>
                  <th className="text-left px-4 py-2">Usuario</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {audit.map((e) => {
                  const persona = personas.find((p) => p.id === e.actor);
                  return (
                    <tr key={e.id} className="hover:bg-slate-50">
                      <td className="px-4 py-2 text-slate-600">{fmtFechaHora(e.timestamp)}</td>
                      <td className="px-4 py-2"><Badge intent="brand">{e.action}</Badge></td>
                      <td className="px-4 py-2 text-slate-700 font-mono text-xs">{e.entityType}/{e.entityId.slice(0, 16)}</td>
                      <td className="px-4 py-2 text-slate-700">{persona ? `${persona.nombre} ${persona.apellido}` : e.actor}<div className="text-xs text-slate-500">{perfilLabel[e.actorPerfil]}</div></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
