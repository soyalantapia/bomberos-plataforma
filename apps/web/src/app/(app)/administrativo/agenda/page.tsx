'use client';

import { Badge, Card, CardContent, SectionHeader } from '@faro/ui';

const eventos = [
  { fecha: '2026-05-25', titulo: 'Donación de sangre', tipo: 'Acto institucional' },
  { fecha: '2026-05-28', titulo: 'Reunión de jefatura', tipo: 'Interna' },
  { fecha: '2026-06-02', titulo: 'Práctica de rescate', tipo: 'Capacitación' },
  { fecha: '2026-06-05', titulo: 'Aniversario del cuartel', tipo: 'Acto institucional' },
  { fecha: '2026-06-08', titulo: 'VTV Móvil BV-5', tipo: 'Mantenimiento' },
];

export default function AgendaPage() {
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <SectionHeader title="Agenda" description="Calendario institucional del cuartel" />

      <Card>
        <CardContent className="p-0">
          <ul className="divide-y divide-slate-100">
            {eventos.map((e) => (
              <li key={e.fecha} className="p-4 flex items-center gap-3">
                <div className="h-12 w-12 rounded-lg bg-brand-50 text-brand-700 grid place-items-center font-bold">
                  {new Date(e.fecha).getDate()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-slate-900">{e.titulo}</div>
                  <div className="text-xs text-slate-500">{e.fecha}</div>
                </div>
                <Badge intent="brand">{e.tipo}</Badge>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
