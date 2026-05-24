'use client';

import { Check, X } from 'lucide-react';
import { useState } from 'react';

import { Avatar, Badge, Button, Card, CardContent, SectionHeader, Tabs, TabsContent, TabsList, TabsTrigger, useToast } from '@faro/ui';

interface Solicitud {
  id: string;
  persona: string;
  tipo: string;
  detalle: string;
  fecha: string;
  estado: 'pendiente' | 'aprobada' | 'rechazada';
}

const seed: Record<string, Solicitud[]> = {
  licencias: [
    { id: 'l-1', persona: 'Iván Quiroga', tipo: 'Licencia médica', detalle: 'Cirugía menor · 7 días', fecha: '15/5/2026', estado: 'pendiente' },
    { id: 'l-2', persona: 'Camila Torres', tipo: 'Licencia académica', detalle: 'Examen final · 1 día', fecha: '20/5/2026', estado: 'pendiente' },
  ],
  ascensos: [
    { id: 'a-1', persona: 'Carolina Sosa', tipo: 'Pliego de ascenso', detalle: 'A Sargento · cumple antigüedad y cursos', fecha: '10/5/2026', estado: 'pendiente' },
  ],
  sanciones: [],
};

export default function AprobacionesPage() {
  const [tab, setTab] = useState<'licencias' | 'ascensos' | 'sanciones'>('licencias');
  const [data, setData] = useState(seed);
  const toast = useToast();

  function decidir(lista: keyof typeof seed, id: string, accion: 'aprobar' | 'rechazar') {
    setData((d) => ({
      ...d,
      [lista]: d[lista].map((s) => s.id === id ? { ...s, estado: accion === 'aprobar' ? 'aprobada' : 'rechazada' } : s),
    }));
    toast.push({
      kind: accion === 'aprobar' ? 'success' : 'info',
      title: accion === 'aprobar' ? 'Aprobado' : 'Rechazado',
      description: 'Acción registrada en el audit log.',
    });
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <SectionHeader title="Aprobaciones" description="Decisiones explícitas con doble check y audit log" />

      <Tabs value={tab} onChange={(v) => setTab(v as typeof tab)}>
        <TabsList>
          <TabsTrigger value="licencias">Licencias · {data.licencias.length}</TabsTrigger>
          <TabsTrigger value="ascensos">Ascensos · {data.ascensos.length}</TabsTrigger>
          <TabsTrigger value="sanciones">Sanciones · {data.sanciones.length}</TabsTrigger>
        </TabsList>

        {(['licencias', 'ascensos', 'sanciones'] as const).map((lista) => (
          <TabsContent key={lista} value={lista}>
            <Card>
              <CardContent className="p-0">
                {data[lista].length === 0 ? (
                  <div className="p-6 text-center text-slate-500">Sin solicitudes pendientes.</div>
                ) : (
                  <ul className="divide-y divide-slate-100">
                    {data[lista].map((s) => (
                      <li key={s.id} className="p-4 flex items-center gap-3">
                        <Avatar name={s.persona} size={40} />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-slate-900">{s.persona}</div>
                          <div className="text-sm text-slate-600">{s.tipo} · {s.detalle}</div>
                          <div className="text-xs text-slate-500 mt-0.5">Presentada {s.fecha}</div>
                        </div>
                        {s.estado === 'pendiente' ? (
                          <div className="flex gap-2">
                            <Button intent="success" size="sm" onClick={() => decidir(lista, s.id, 'aprobar')}>
                              <Check size={16} /> Aprobar
                            </Button>
                            <Button intent="ghost" size="sm" onClick={() => decidir(lista, s.id, 'rechazar')}>
                              <X size={16} /> Rechazar
                            </Button>
                          </div>
                        ) : (
                          <Badge intent={s.estado === 'aprobada' ? 'ok' : 'risk'}>{s.estado}</Badge>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
