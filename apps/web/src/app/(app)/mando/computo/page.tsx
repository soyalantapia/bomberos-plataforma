'use client';

import { Zap } from 'lucide-react';
import { useMemo } from 'react';

import { Avatar, Card, CardContent, CardHeader, CardTitle, SectionHeader } from '@faro/ui';

import { useFaroStore, selectCuartelActivo } from '../../../../store/use-faro-store';
import { calcularComputoMensual } from '../../../../lib/utils/computo';
import { fmtMesPeriodo } from '../../../../lib/utils/date';
import { fmtJerarquia, jerarquiaOrden } from '../../../../lib/utils/jerarquia';

export default function ComputoPage() {
  const personas = useFaroStore((s) => s.personas);
  const cuartel = useFaroStore(selectCuartelActivo);
  const asistencias = useFaroStore((s) => s.asistencias);
  const computo = useMemo(() => cuartel ? calcularComputoMensual(asistencias, cuartel.id, '2026-05') : [], [asistencias, cuartel]);

  const filas = useMemo(() => {
    return [...computo]
      .map((c) => ({ c, persona: personas.find((p) => p.id === c.personaId) }))
      .filter((f) => f.persona)
      .sort((a, b) => {
        if (b.c.total !== a.c.total) return b.c.total - a.c.total;
        return (jerarquiaOrden[b.persona!.jerarquia] ?? 0) - (jerarquiaOrden[a.persona!.jerarquia] ?? 0);
      });
  }, [computo, personas]);

  const totales = useMemo(() => computo.reduce((acc, c) => ({
    accidental: acc.accidental + c.accidental,
    obligatorio: acc.obligatorio + c.obligatorio,
    guardia: acc.guardia + c.guardia,
    jefatura: acc.jefatura + c.jefatura,
    ordenInterno: acc.ordenInterno + c.ordenInterno,
    total: acc.total + c.total,
  }), { accidental: 0, obligatorio: 0, guardia: 0, jefatura: 0, ordenInterno: 0, total: 0 }), [computo]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <SectionHeader title="Cómputo mensual" description={`${fmtMesPeriodo('2026-05')} · calculado en vivo desde asistencias y servicios`} />

      <Card className="bg-gradient-to-br from-status-ok-bg/30 to-white border-status-ok-bg">
        <CardContent className="p-4 sm:p-5">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-status-ok text-white grid place-items-center"><Zap size={20} /></div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-slate-900">Cómputo instantáneo</div>
              <p className="text-sm text-slate-600">
                <span className="line-through text-slate-400">GIB: 26 segundos</span> · Faro: tiempo real, automático.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Mayo 2026 · {filas.length} personas con horas</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-slate-600">
                  <th className="text-left px-4 py-2.5">Persona</th>
                  <th className="text-right px-2 py-2.5">Accident.</th>
                  <th className="text-right px-2 py-2.5">Obligat.</th>
                  <th className="text-right px-2 py-2.5">Guardia</th>
                  <th className="text-right px-2 py-2.5">Jefatura</th>
                  <th className="text-right px-2 py-2.5">O.I.</th>
                  <th className="text-right px-4 py-2.5 font-bold">Total</th>
                </tr>
              </thead>
              <tbody>
                {filas.map(({ c, persona }) => (
                  <tr key={c.personaId} className="border-t border-slate-100 hover:bg-slate-50">
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <Avatar name={`${persona!.nombre} ${persona!.apellido}`} size={28} />
                        <div>
                          <div className="font-medium text-slate-900">{persona!.nombre} {persona!.apellido}</div>
                          <div className="text-xs text-slate-500">{fmtJerarquia(persona!.jerarquia)}</div>
                        </div>
                      </div>
                    </td>
                    <td className="text-right px-2 py-2.5 text-slate-700 tabular-nums">{c.accidental}</td>
                    <td className="text-right px-2 py-2.5 text-slate-700 tabular-nums">{c.obligatorio}</td>
                    <td className="text-right px-2 py-2.5 text-slate-700 tabular-nums">{c.guardia}</td>
                    <td className="text-right px-2 py-2.5 text-slate-700 tabular-nums">{c.jefatura}</td>
                    <td className="text-right px-2 py-2.5 text-slate-700 tabular-nums">{c.ordenInterno}</td>
                    <td className="text-right px-4 py-2.5 font-bold text-slate-900 tabular-nums">{c.total}</td>
                  </tr>
                ))}
                <tr className="bg-slate-100 border-t border-slate-200 font-bold">
                  <td className="px-4 py-3 text-slate-900">Totales</td>
                  <td className="text-right px-2 py-3 tabular-nums">{totales.accidental}</td>
                  <td className="text-right px-2 py-3 tabular-nums">{totales.obligatorio}</td>
                  <td className="text-right px-2 py-3 tabular-nums">{totales.guardia}</td>
                  <td className="text-right px-2 py-3 tabular-nums">{totales.jefatura}</td>
                  <td className="text-right px-2 py-3 tabular-nums">{totales.ordenInterno}</td>
                  <td className="text-right px-4 py-3 text-slate-900 tabular-nums">{totales.total}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
