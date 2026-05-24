'use client';

import { Avatar, Badge, Card, CardContent, SectionHeader } from '@faro/ui';

import { useFaroStore, selectPersonaActual } from '../../../../store/use-faro-store';
import { fmtFechaCorta } from '../../../../lib/utils/date';
import { fmtJerarquia } from '../../../../lib/utils/jerarquia';

export default function MiLegajo() {
  const persona = useFaroStore(selectPersonaActual);
  if (!persona) return null;

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <SectionHeader title="Mi legajo" description="Tus datos en el sistema" />

      <Card>
        <CardContent className="p-5 flex items-center gap-4">
          <Avatar name={`${persona.nombre} ${persona.apellido}`} size={72} />
          <div className="flex-1 min-w-0">
            <div className="font-bold text-lg text-slate-900">{persona.nombre} {persona.apellido}</div>
            <div className="text-sm text-slate-600">{fmtJerarquia(persona.jerarquia)} · Legajo {persona.legajo}</div>
            <Badge intent={persona.estado === 'activo' ? 'ok' : 'warn'} className="mt-1">{persona.estado}</Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <dl className="divide-y divide-slate-100">
            {[
              { k: 'Email', v: persona.email },
              { k: 'Teléfono', v: persona.telefono },
              { k: 'Nacimiento', v: fmtFechaCorta(persona.fechaNacimiento) },
              { k: 'Ingreso', v: fmtFechaCorta(persona.fechaIngreso) },
              { k: 'Base', v: persona.base },
              { k: 'Función', v: persona.funcion },
              { k: 'Grupo sanguíneo', v: persona.salud.grupoSanguineo ?? '—' },
            ].map((f) => (
              <div key={f.k} className="px-4 py-3 flex items-center gap-3">
                <div className="text-sm text-slate-500 w-32 shrink-0">{f.k}</div>
                <div className="text-sm font-medium text-slate-900 flex-1 truncate">{f.v}</div>
              </div>
            ))}
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}
