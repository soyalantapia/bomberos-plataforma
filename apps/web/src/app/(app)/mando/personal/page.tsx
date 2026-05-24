'use client';

import { useMemo } from 'react';

import { Avatar, Badge, Card, CardContent, SectionHeader } from '@faro/ui';

import { useFaroStore, selectCuartelActivo } from '../../../../store/use-faro-store';
import { fmtJerarquia, jerarquiaOrden } from '../../../../lib/utils/jerarquia';

export default function PersonalMando() {
  const cuartel = useFaroStore(selectCuartelActivo);
  const allPersonas = useFaroStore((s) => s.personas);
  const personas = useMemo(
    () => allPersonas
      .filter((p) => p.cuartelId === cuartel?.id)
      .sort((a, b) => (jerarquiaOrden[b.jerarquia] ?? 0) - (jerarquiaOrden[a.jerarquia] ?? 0)),
    [allPersonas, cuartel?.id],
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <SectionHeader title="Personal" description={`${personas.length} personas en ${cuartel?.nombre}`} />

      <Card>
        <CardContent className="p-0">
          <ul className="divide-y divide-slate-100">
            {personas.map((p) => (
              <li key={p.id} className="p-3 flex items-center gap-3 hover:bg-slate-50">
                <Avatar name={`${p.nombre} ${p.apellido}`} size={40} />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-slate-900">{p.nombre} {p.apellido}</div>
                  <div className="text-xs text-slate-600">Legajo {p.legajo} · {fmtJerarquia(p.jerarquia)} · {p.funcion}</div>
                </div>
                <Badge intent={p.estado === 'activo' ? 'ok' : 'warn'}>{p.estado}</Badge>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
