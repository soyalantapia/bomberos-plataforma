'use client';

import { CheckCircle2, Clock, MapPin } from 'lucide-react';
import { useMemo, useState } from 'react';

import { Button, Card, CardContent, Kpi, SectionHeader, useToast } from '@faro/ui';

import { useFaroStore, selectCuartelActivo, selectPersonaActual } from '../../../../store/use-faro-store';
import { calcularComputoMensual } from '../../../../lib/utils/computo';

export default function AsistenciaBombero() {
  const persona = useFaroStore(selectPersonaActual);
  const cuartel = useFaroStore(selectCuartelActivo);
  const asistencias = useFaroStore((s) => s.asistencias);
  const computo = useMemo(() => cuartel ? calcularComputoMensual(asistencias, cuartel.id, '2026-05') : [], [asistencias, cuartel]);
  const toast = useToast();
  const [marcado, setMarcado] = useState(false);

  if (!persona) return null;
  const propio = computo.find((c) => c.personaId === persona.id);

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <SectionHeader title="Asistencia" description="Marcá tu presencia y consultá tu historial." />

      <Card>
        <CardContent className="p-6 text-center">
          <div className={`mx-auto h-20 w-20 rounded-full grid place-items-center text-white ${marcado ? 'bg-status-ok' : 'bg-brand-600'}`}>
            {marcado ? <CheckCircle2 size={40} /> : <Clock size={36} />}
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-4">{marcado ? '¡Presente registrado!' : 'Listo para marcar presente'}</h2>
          <p className="text-sm text-slate-600 mt-1">{marcado ? 'Tu asistencia quedó registrada.' : 'Asegurate de estar en el cuartel.'}</p>
          {!marcado && (
            <Button size="lg" className="mt-4" onClick={() => { setMarcado(true); toast.push({ kind: 'success', title: '¡Presente!' }); }}>
              <MapPin size={18} /> Marcar presente
            </Button>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-3">
        <Kpi label="Tus horas" value={propio?.total ?? 0} hint="del mes" intent="brand" />
        <Kpi label="Accidentales" value={propio?.accidental ?? 0} hint="hs en servicios" intent="neutral" />
      </div>
    </div>
  );
}
