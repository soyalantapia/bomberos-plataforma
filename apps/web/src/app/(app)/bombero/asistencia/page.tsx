'use client';

import { CheckCircle2, Clock, Flame, LogOut, MapPin, Shield } from 'lucide-react';
import { useMemo, useState } from 'react';

import type { TipoAsistencia } from '@faro/types';

import { Badge, Button, Card, CardContent, Kpi, cn, useToast } from '@faro/ui';

import { PageHero } from '../../../../components/shared/page-hero';
import { FiltersBar, type FilterChip } from '../../../../components/shared/filters-bar';
import { calcularComputoMensual } from '../../../../lib/utils/computo';
import { fmtFecha, fmtMesPeriodo } from '../../../../lib/utils/date';
import {
  useFaroStore,
  selectCuartelActivo,
  selectPersonaActual,
} from '../../../../store/use-faro-store';

type TabHist = 'todos' | TipoAsistencia;

const TIPO_LABEL: Record<TipoAsistencia, string> = {
  accidental: 'Accidental',
  obligatorio: 'Obligatorio',
  guardia: 'Guardia',
  jefatura: 'Jefatura',
  orden_interno: 'Orden Interno',
  licencia: 'Licencia',
  sancion: 'Sanción',
};

const TIPO_INTENT: Record<TipoAsistencia, 'brand' | 'ok' | 'warn' | 'neutral' | 'risk'> = {
  accidental: 'brand',
  obligatorio: 'neutral',
  guardia: 'ok',
  jefatura: 'warn',
  orden_interno: 'neutral',
  licencia: 'warn',
  sancion: 'risk',
};

export default function AsistenciaBombero() {
  const persona = useFaroStore(selectPersonaActual);
  const cuartel = useFaroStore(selectCuartelActivo);
  const asistencias = useFaroStore((s) => s.asistencias);
  const computo = useMemo(
    () => (cuartel ? calcularComputoMensual(asistencias, cuartel.id, '2026-05') : []),
    [asistencias, cuartel],
  );
  const toast = useToast();

  const [marcado, setMarcado] = useState<{ in?: string; out?: string }>({});
  const [tab, setTab] = useState<TabHist>('todos');

  const propias = useMemo(
    () =>
      asistencias
        .filter((a) => a.personaId === persona?.id)
        .sort((a, b) => b.fecha.localeCompare(a.fecha)),
    [asistencias, persona?.id],
  );

  if (!persona) return null;
  const propio = computo.find((c) => c.personaId === persona.id);

  const totalPorTipo = (t: TipoAsistencia) =>
    propias.filter((a) => a.tipo === t).reduce((acc, a) => acc + a.horas, 0);

  const filtradas = tab === 'todos' ? propias : propias.filter((a) => a.tipo === tab);

  const chips: FilterChip<TabHist>[] = [
    { value: 'todos', label: 'Todas', count: propias.length },
    {
      value: 'accidental',
      label: 'Accidental',
      count: propias.filter((a) => a.tipo === 'accidental').length,
      intent: 'brand',
    },
    {
      value: 'guardia',
      label: 'Guardia',
      count: propias.filter((a) => a.tipo === 'guardia').length,
      intent: 'ok',
    },
    {
      value: 'jefatura',
      label: 'Jefatura',
      count: propias.filter((a) => a.tipo === 'jefatura').length,
      intent: 'warn',
    },
    {
      value: 'orden_interno',
      label: 'O. Interno',
      count: propias.filter((a) => a.tipo === 'orden_interno').length,
    },
  ];

  function marcarPresente() {
    const now = new Date();
    const hora = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    setMarcado({ in: hora });
    toast.push({
      kind: 'success',
      title: '¡Presente!',
      description: `Check-in registrado a las ${hora}. Geocerca: dentro del cuartel.`,
    });
  }

  function marcarSalida() {
    const now = new Date();
    const hora = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    setMarcado((m) => ({ ...m, out: hora }));
    toast.push({ kind: 'success', title: 'Check-out registrado', description: `Salida ${hora}.` });
  }

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <PageHero
        objetivo="Tu asistencia"
        titulo={`${propio?.total ?? 0} hs este mes`}
        descripcion={`${fmtMesPeriodo('2026-05')} · ${persona.nombre}, marcá tu presente y revisá el desglose.`}
        icono={<Clock size={26} />}
        variant={(propio?.total ?? 0) >= 20 ? 'success' : 'default'}
        meta={
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
            <Kpi label="Total" value={propio?.total ?? 0} hint="hs mes" intent="brand" />
            <Kpi label="Accident." value={propio?.accidental ?? 0} hint="hs" intent="brand" />
            <Kpi label="Guardia" value={propio?.guardia ?? 0} hint="hs" intent="ok" />
            <Kpi label="Jefatura" value={propio?.jefatura ?? 0} hint="hs" intent="warn" />
            <Kpi label="O. Interno" value={propio?.ordenInterno ?? 0} hint="hs" intent="neutral" />
          </div>
        }
      />

      <Card
        className={cn(
          'overflow-hidden border-2 transition-colors',
          marcado.in && !marcado.out ? 'border-status-ok bg-status-ok-bg/30' : 'border-slate-200',
        )}
      >
        <CardContent className="p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  'grid h-14 w-14 shrink-0 place-items-center rounded-xl text-white',
                  marcado.out ? 'bg-slate-400' : marcado.in ? 'bg-status-ok' : 'bg-brand-600',
                )}
              >
                {marcado.out ? (
                  <LogOut size={28} />
                ) : marcado.in ? (
                  <CheckCircle2 size={28} />
                ) : (
                  <Shield size={28} />
                )}
              </div>
              <div className="min-w-0">
                <div className="text-lg font-bold text-slate-900">
                  {marcado.out
                    ? 'Cerraste tu guardia'
                    : marcado.in
                      ? `Estás en guardia desde ${marcado.in}`
                      : 'Listo para marcar presente'}
                </div>
                <div className="mt-0.5 text-sm text-slate-600">
                  <MapPin size={12} className="inline" /> {cuartel?.nombre} · Geocerca activa
                </div>
              </div>
            </div>
            {!marcado.in && (
              <Button intent="primary" size="lg" onClick={marcarPresente}>
                <Shield size={20} /> Marcar presente
              </Button>
            )}
            {marcado.in && !marcado.out && (
              <Button intent="secondary" size="lg" onClick={marcarSalida}>
                <LogOut size={20} /> Marcar salida
              </Button>
            )}
          </div>
          {marcado.in && (
            <div className="mt-3 rounded-md bg-white/60 px-3 py-2 text-xs text-slate-700">
              Tu check-in se guarda offline si te quedás sin señal. Cuando vuelva la conexión se
              sincroniza solo.
            </div>
          )}
        </CardContent>
      </Card>

      <div>
        <h2 className="mb-3 text-lg font-bold text-slate-900">Tu historial · mayo 2026</h2>

        <FiltersBar chips={chips} chipValue={tab} onChipChange={setTab} />

        <Card className="mt-3">
          <CardContent className="p-0">
            {filtradas.length === 0 ? (
              <div className="p-6 text-center text-sm text-slate-500">
                No hay asistencias de este tipo este mes.
              </div>
            ) : (
              <ul className="divide-y divide-slate-100">
                {filtradas.map((a) => (
                  <li key={a.id} className="flex items-center gap-3 p-3">
                    <div
                      className={cn(
                        'grid h-10 w-10 shrink-0 place-items-center rounded-lg text-white',
                        a.tipo === 'accidental'
                          ? 'bg-brand-600'
                          : a.tipo === 'guardia'
                            ? 'bg-status-ok'
                            : a.tipo === 'jefatura'
                              ? 'bg-status-warn'
                              : 'bg-slate-400',
                      )}
                    >
                      {a.tipo === 'accidental' ? <Flame size={18} /> : <Clock size={18} />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <Badge intent={TIPO_INTENT[a.tipo]}>{TIPO_LABEL[a.tipo]}</Badge>
                        <span className="text-sm font-medium text-slate-900">{a.horas} hs</span>
                      </div>
                      <div className="mt-0.5 text-xs text-slate-500">
                        {fmtFecha(a.fecha)}
                        {a.servicioId && ' · vinculada a un servicio'}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {tab === 'todos' && propias.length > 0 && (
          <Card className="mt-3 border-slate-200 bg-slate-50">
            <CardContent className="p-4 text-sm text-slate-700">
              <strong className="text-slate-900">Desglose total del mes:</strong>{' '}
              {(['accidental', 'guardia', 'jefatura', 'orden_interno'] as TipoAsistencia[])
                .filter((t) => totalPorTipo(t) > 0)
                .map((t) => `${TIPO_LABEL[t]} ${totalPorTipo(t)}hs`)
                .join(' · ')}
              {' · '}
              <strong className="text-slate-900">Total {propio?.total ?? 0}hs</strong>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
