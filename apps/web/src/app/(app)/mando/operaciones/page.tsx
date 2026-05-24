'use client';

import { Check } from 'lucide-react';
import { useMemo } from 'react';

import { Badge, Button, Card, CardContent, SectionHeader, useToast } from '@faro/ui';

import { useFaroStore, selectPersonaActual, selectCuartelActivo } from '../../../../store/use-faro-store';
import { fmtFechaHora } from '../../../../lib/utils/date';

export default function OperacionesPage() {
  const cuartel = useFaroStore(selectCuartelActivo);
  const allServicios = useFaroStore((s) => s.servicios);
  const persona = useFaroStore(selectPersonaActual);
  const validar = useFaroStore((s) => s.validarServicio);
  const toast = useToast();

  const servicios = useMemo(() => allServicios.filter((s) => s.cuartelId === cuartel?.id), [allServicios, cuartel?.id]);
  const pendientes = useMemo(() => servicios.filter((s) => s.estado === 'pendiente_validacion'), [servicios]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <SectionHeader title="Operaciones" description={`${servicios.length} servicios · ${pendientes.length} a validar`} />

      {pendientes.length > 0 && (
        <Card className="bg-status-warn-bg/40 border-status-warn">
          <CardContent className="p-4">
            <div className="font-semibold">{pendientes.length} servicio{pendientes.length === 1 ? '' : 's'} esperando validación</div>
            <p className="text-sm text-slate-700 mt-0.5">Doble check humano antes de sumar al cómputo.</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-0">
          <div className="divide-y divide-slate-100">
            {servicios.map((s) => (
              <div key={s.id} className="p-4 flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-slate-900 capitalize">{s.tipo}</span>
                    <Badge intent={s.origen === 'app' ? 'brand' : 'neutral'}>{s.origen === 'app' ? 'vía app' : 'manual'}</Badge>
                    {s.estado === 'pendiente_validacion' && <Badge intent="warn">Sin validar</Badge>}
                    {s.estado === 'validado' && <Badge intent="ok">Validado</Badge>}
                  </div>
                  <div className="text-sm text-slate-700 mt-0.5">{s.direccion}</div>
                  <div className="text-xs text-slate-500 mt-0.5">Salida {fmtFechaHora(s.horaSalida)} · {s.dotacionIds.length} personas</div>
                </div>
                {s.estado === 'pendiente_validacion' && persona && (
                  <Button intent="success" size="sm" onClick={() => { validar(s.id, persona.id); toast.push({ kind: 'success', title: 'Servicio validado' }); }}>
                    <Check size={16} /> Validar
                  </Button>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
