'use client';

import { ArrowRight, Flame } from 'lucide-react';
import Link from 'next/link';

import { Card, CardContent, Kpi, SectionHeader } from '@faro/ui';
import { useMemo } from 'react';

import { useFaroStore, selectPersonaActual, selectCuartelActivo } from '../../../store/use-faro-store';
import { calcularComputoMensual } from '../../../lib/utils/computo';

export default function BomberoInicio() {
  const persona = useFaroStore(selectPersonaActual);
  const cuartel = useFaroStore(selectCuartelActivo);
  const asistencias = useFaroStore((s) => s.asistencias);

  const computo = useMemo(() => cuartel ? calcularComputoMensual(asistencias, cuartel.id, '2026-05') : [], [asistencias, cuartel]);
  if (!persona) return null;
  const propio = computo.find((c) => c.personaId === persona.id);

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <SectionHeader title={`Hola, ${persona.nombre}`} description={`${cuartel?.nombre} · ${persona.funcion}`} />

      <Link href="/bombero/registrar-servicio">
        <Card className="hover:shadow-lg transition-shadow bg-gradient-to-br from-fire-600 to-fire-700 text-white cursor-pointer">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="h-14 w-14 rounded-xl bg-white/20 grid place-items-center">
              <Flame size={28} />
            </div>
            <div className="flex-1">
              <div className="text-xl font-bold">Registrar servicio</div>
              <div className="text-white/80 text-sm">En 1 minuto, con guantes, por voz si querés.</div>
            </div>
            <ArrowRight size={24} />
          </CardContent>
        </Card>
      </Link>

      <div className="grid grid-cols-2 gap-3">
        <Kpi label="Tus horas" value={propio?.total ?? 0} hint="del mes" intent="brand" />
        <Kpi label="Servicios" value={propio ? Math.max(1, Math.round((propio.accidental || 0) / 2)) : 0} hint="del mes" intent="neutral" />
      </div>

      <Card>
        <CardContent className="p-5">
          <h3 className="font-semibold text-slate-900 mb-2">Avisos del cuartel</h3>
          <ul className="space-y-2">
            <li className="text-sm text-slate-700">📋 Curso de rescate vehicular · inscripción hasta el 30/5</li>
            <li className="text-sm text-slate-700">🔧 Mantenimiento Móvil BV-5 · mañana 8-12 hs</li>
            <li className="text-sm text-slate-700">🩸 Donación de sangre · sábado 25/5</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
