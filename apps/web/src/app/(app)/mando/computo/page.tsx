'use client';

import { Calculator, Calendar, Download, TrendingUp, User, Zap } from 'lucide-react';
import { useMemo, useState } from 'react';

import {
  Avatar,
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Kpi,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  cn,
  useToast,
} from '@faro/ui';

import { PageHero } from '../../../../components/shared/page-hero';
import { calcularComputoMensual } from '../../../../lib/utils/computo';
import { fmtMesPeriodo } from '../../../../lib/utils/date';
import { demoToday } from '../../../../lib/utils/demo-today';
import { fmtJerarquia, jerarquiaOrden } from '../../../../lib/utils/jerarquia';
import { useFaroStore, selectCuartelActivo } from '../../../../store/use-faro-store';

export default function ComputoPage() {
  const personas = useFaroStore((s) => s.personas);
  const cuartel = useFaroStore(selectCuartelActivo);
  const asistencias = useFaroStore((s) => s.asistencias);
  const toast = useToast();
  const [tab, setTab] = useState('mensual');
  const [personaSel, setPersonaSel] = useState<string>('');

  // F19: calculado dentro del componente para evitar ejecución en SSR/prerender
  const MESES_ANIO = useMemo(() => {
    const today = demoToday();
    const year = today.getFullYear();
    const upToMonth = today.getMonth() + 1;
    return Array.from({ length: upToMonth }, (_, i) => `${year}-${String(i + 1).padStart(2, '0')}`);
  }, []);
  const MES_ACTUAL = useMemo(() => MESES_ANIO[MESES_ANIO.length - 1] ?? '', [MESES_ANIO]);

  const computo = useMemo(
    () => (cuartel ? calcularComputoMensual(asistencias, cuartel.id, MES_ACTUAL) : []),
    [asistencias, cuartel, MES_ACTUAL],
  );

  const filas = useMemo(() => {
    return [...computo]
      .map((c) => ({ c, persona: personas.find((p) => p.id === c.personaId) }))
      .filter((f) => f.persona)
      .sort((a, b) => {
        if (b.c.total !== a.c.total) return b.c.total - a.c.total;
        return (
          (jerarquiaOrden[b.persona!.jerarquia] ?? 0) - (jerarquiaOrden[a.persona!.jerarquia] ?? 0)
        );
      });
  }, [computo, personas]);

  const totales = useMemo(
    () =>
      computo.reduce(
        (acc, c) => ({
          accidental: acc.accidental + c.accidental,
          obligatorio: acc.obligatorio + c.obligatorio,
          guardia: acc.guardia + c.guardia,
          jefatura: acc.jefatura + c.jefatura,
          ordenInterno: acc.ordenInterno + c.ordenInterno,
          total: acc.total + c.total,
        }),
        { accidental: 0, obligatorio: 0, guardia: 0, jefatura: 0, ordenInterno: 0, total: 0 },
      ),
    [computo],
  );

  // Computo anual: agregado por mes (simulado a partir del mes actual)
  const anual = useMemo(() => {
    return MESES_ANIO.map((mes, idx) => {
      const c = cuartel ? calcularComputoMensual(asistencias, cuartel.id, mes) : [];
      const tot = c.reduce((a, x) => a + x.total, 0);
      // Como solo tenemos data del mes actual, simulamos meses anteriores con variación determinística
      const factor = mes === MES_ACTUAL ? 1 : 0.6 + ((idx * 0.137 + mes.length * 0.05) % 0.4);
      return { mes, total: Math.round((tot || totales.total) * factor) };
    });
  }, [asistencias, cuartel, totales.total, MESES_ANIO, MES_ACTUAL]);

  const maxAnual = Math.max(...anual.map((a) => a.total), 1);
  const totalAnual = anual.reduce((a, x) => a + x.total, 0);

  // Computo por persona seleccionada
  const personaActiva = personas.find((p) => p.id === personaSel);
  const computoPersona = computo.find((c) => c.personaId === personaSel);

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <PageHero
        objetivo="Vista Mando · Cómputo mensual"
        titulo={`${totales.total} hs operativas · ${fmtMesPeriodo(MES_ACTUAL)}`}
        descripcion="Calculado en vivo desde asistencias y servicios. Mensual, anual o detalle por persona."
        icono={<Calculator size={26} />}
        meta={
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Kpi
              label="Total mes"
              value={totales.total}
              hint="hs"
              intent="brand"
              icon={<Zap size={16} />}
            />
            <Kpi
              label="Personas con horas"
              value={filas.length}
              hint={`de ${personas.filter((p) => p.cuartelId === cuartel?.id).length}`}
              intent="ok"
            />
            <Kpi
              label="Anual acumulado"
              value={totalAnual}
              hint="hs YTD"
              intent="neutral"
              icon={<TrendingUp size={16} />}
            />
            <Kpi label="Cálculo" value="instantáneo" hint="en tiempo real" intent="ok" />
          </div>
        }
        acciones={
          <button
            type="button"
            onClick={() =>
              toast.push({ kind: 'info', title: 'Exportando cómputo', description: 'PDF + Excel.' })
            }
            className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:border-slate-300"
          >
            <Download size={14} /> Exportar
          </button>
        }
      />

      <Tabs value={tab} onChange={setTab}>
        <TabsList>
          <TabsTrigger value="mensual">
            <Calendar size={13} className="mr-1" /> Mensual
          </TabsTrigger>
          <TabsTrigger value="anual">
            <TrendingUp size={13} className="mr-1" /> Anual
          </TabsTrigger>
          <TabsTrigger value="persona">
            <User size={13} className="mr-1" /> Por persona
          </TabsTrigger>
        </TabsList>

        <TabsContent value="mensual">
          <Card>
            <CardHeader>
              <CardTitle>
                {fmtMesPeriodo(MES_ACTUAL)} · {filas.length} personas con horas
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {/* Mobile: card por persona con total destacado + desglose */}
              <ul className="divide-y divide-slate-100 md:hidden">
                {filas.map(({ c, persona }) => {
                  const desglose = [
                    ['Accidental', c.accidental],
                    ['Obligatorio', c.obligatorio],
                    ['Guardia', c.guardia],
                    ['Jefatura', c.jefatura],
                    ['Orden Int.', c.ordenInterno],
                  ].filter(([, v]) => (v as number) > 0) as [string, number][];
                  return (
                    <li key={c.personaId} className="p-3.5">
                      <div className="flex items-center gap-2.5">
                        <Avatar name={`${persona!.nombre} ${persona!.apellido}`} size={36} />
                        <div className="min-w-0 flex-1">
                          <div className="truncate font-medium text-slate-900">
                            {persona!.nombre} {persona!.apellido}
                          </div>
                          <div className="text-xs text-slate-500">
                            {fmtJerarquia(persona!.jerarquia)}
                          </div>
                        </div>
                        <div className="shrink-0 text-right">
                          <div className="text-lg font-bold tabular-nums text-slate-900">
                            {c.total}
                          </div>
                          <div className="text-[10px] uppercase text-slate-400">hs total</div>
                        </div>
                      </div>
                      {desglose.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {desglose.map(([label, v]) => (
                            <span
                              key={label}
                              className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-1.5 py-0.5 text-[11px] text-slate-600"
                            >
                              {label}
                              <span className="font-semibold tabular-nums text-slate-900">{v}</span>
                            </span>
                          ))}
                        </div>
                      )}
                    </li>
                  );
                })}
                <li className="bg-slate-100 p-3.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">Totales</span>
                    <span className="text-lg font-bold tabular-nums text-slate-900">
                      {totales.total} hs
                    </span>
                  </div>
                </li>
              </ul>

              {/* Desktop/tablet: tabla completa */}
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 text-slate-600">
                      <th className="px-4 py-2.5 text-left">Persona</th>
                      <th className="px-2 py-2.5 text-right">
                        <span className="hidden sm:inline">Accidental</span>
                        <span className="sm:hidden">Acc.</span>
                      </th>
                      <th className="px-2 py-2.5 text-right">
                        <span className="hidden sm:inline">Obligatorio</span>
                        <span className="sm:hidden">Oblig.</span>
                      </th>
                      <th className="px-2 py-2.5 text-right">Guardia</th>
                      <th className="px-2 py-2.5 text-right">Jefatura</th>
                      <th className="px-2 py-2.5 text-right">
                        <span className="hidden sm:inline">Orden Int.</span>
                        <span className="sm:hidden">O.I.</span>
                      </th>
                      <th className="px-4 py-2.5 text-right font-bold">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filas.map(({ c, persona }) => (
                      <tr key={c.personaId} className="border-t border-slate-100 hover:bg-slate-50">
                        <td className="px-4 py-2.5">
                          <div className="flex items-center gap-2">
                            <Avatar name={`${persona!.nombre} ${persona!.apellido}`} size={28} />
                            <div>
                              <div className="font-medium text-slate-900">
                                {persona!.nombre} {persona!.apellido}
                              </div>
                              <div className="text-xs text-slate-500">
                                {fmtJerarquia(persona!.jerarquia)}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-2 py-2.5 text-right tabular-nums text-slate-700">
                          {c.accidental}
                        </td>
                        <td className="px-2 py-2.5 text-right tabular-nums text-slate-700">
                          {c.obligatorio}
                        </td>
                        <td className="px-2 py-2.5 text-right tabular-nums text-slate-700">
                          {c.guardia}
                        </td>
                        <td className="px-2 py-2.5 text-right tabular-nums text-slate-700">
                          {c.jefatura}
                        </td>
                        <td className="px-2 py-2.5 text-right tabular-nums text-slate-700">
                          {c.ordenInterno}
                        </td>
                        <td className="px-4 py-2.5 text-right font-bold tabular-nums text-slate-900">
                          {c.total}
                        </td>
                      </tr>
                    ))}
                    <tr className="border-t border-slate-200 bg-slate-100 font-bold">
                      <td className="px-4 py-3 text-slate-900">Totales</td>
                      <td className="px-2 py-3 text-right tabular-nums">{totales.accidental}</td>
                      <td className="px-2 py-3 text-right tabular-nums">{totales.obligatorio}</td>
                      <td className="px-2 py-3 text-right tabular-nums">{totales.guardia}</td>
                      <td className="px-2 py-3 text-right tabular-nums">{totales.jefatura}</td>
                      <td className="px-2 py-3 text-right tabular-nums">{totales.ordenInterno}</td>
                      <td className="px-4 py-3 text-right tabular-nums text-slate-900">
                        {totales.total}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="anual">
          <Card>
            <CardHeader>
              <CardTitle>
                Año {demoToday().getFullYear()} · {totalAnual} hs acumuladas
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5">
              {/* Leyenda estimado */}
              <div className="mb-3 flex items-center gap-1.5">
                <div className="bg-brand-600 h-2.5 w-2.5 rounded-sm" />
                <span className="text-[11px] text-slate-600">Mes actual</span>
                <div className="ml-3 h-2.5 w-2.5 rounded-sm border border-dashed border-slate-400 bg-slate-200" />
                <span className="text-[11px] text-slate-500">Estimado (meses anteriores)</span>
              </div>
              <div className="flex h-48 items-end justify-between gap-3">
                {anual.map((a, idx) => {
                  const h = (a.total / maxAnual) * 100;
                  const isCurrent = idx === anual.length - 1;
                  return (
                    <div
                      key={a.mes}
                      className="flex flex-1 flex-col items-center justify-end gap-2"
                    >
                      <div className="relative w-full">
                        <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] font-bold tabular-nums text-slate-700">
                          {isCurrent ? a.total : `~${a.total}`}
                        </div>
                        <div
                          className={cn(
                            'w-full rounded-t-md transition-all',
                            isCurrent
                              ? 'bg-brand-600'
                              : 'border border-dashed border-slate-400 bg-slate-200',
                          )}
                          style={{ height: `${h}%`, minHeight: '8px' }}
                        />
                      </div>
                      <span
                        className={cn(
                          'text-[10px] uppercase',
                          isCurrent ? 'text-brand-700 font-bold' : 'text-slate-500',
                        )}
                      >
                        {fmtMesPeriodo(a.mes).slice(0, 3)}
                      </span>
                    </div>
                  );
                })}
              </div>
              <p className="mt-6 text-sm text-slate-600">
                {fmtMesPeriodo(MES_ACTUAL).split(' ')[0]} es el mes con más actividad (
                <strong className="text-slate-900">{totales.total} hs</strong>) — refleja el aumento
                estacional de incendios y rescates. Promedio anual:
                <strong className="ml-1 text-slate-900">
                  {Math.round(totalAnual / anual.length)} hs/mes
                </strong>
                .
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="persona">
          <div className="grid gap-3 lg:grid-cols-[280px_1fr]">
            <Card>
              <CardContent className="p-3">
                <div className="mb-2 px-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Elegí una persona
                </div>
                <div className="max-h-[420px] space-y-1 overflow-y-auto">
                  {filas.map(({ c, persona }) => (
                    <button
                      key={c.personaId}
                      type="button"
                      onClick={() => setPersonaSel(c.personaId)}
                      className={cn(
                        'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left transition-colors',
                        personaSel === c.personaId
                          ? 'bg-brand-50 ring-brand-200 ring-1'
                          : 'hover:bg-slate-50',
                      )}
                    >
                      <Avatar name={`${persona!.nombre} ${persona!.apellido}`} size={26} />
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-medium text-slate-900">
                          {persona!.nombre} {persona!.apellido}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {fmtJerarquia(persona!.jerarquia)}
                        </div>
                      </div>
                      <Badge intent="brand">{c.total}h</Badge>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-5">
                {personaActiva && computoPersona ? (
                  <>
                    <div className="mb-4 flex items-center gap-3 border-b border-slate-100 pb-3">
                      <Avatar
                        name={`${personaActiva.nombre} ${personaActiva.apellido}`}
                        size={48}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="text-lg font-bold text-slate-900">
                          {personaActiva.nombre} {personaActiva.apellido}
                        </div>
                        <div className="text-sm text-slate-600">
                          {fmtJerarquia(personaActiva.jerarquia)} · Legajo {personaActiva.legajo}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold tabular-nums text-slate-900">
                          {computoPersona.total}
                        </div>
                        <div className="text-[10px] uppercase tracking-wide text-slate-500">
                          hs mes
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                      <Kpi
                        label="Accident."
                        value={computoPersona.accidental}
                        hint="hs"
                        intent="brand"
                      />
                      <Kpi
                        label="Obligat."
                        value={computoPersona.obligatorio}
                        hint="hs"
                        intent="neutral"
                      />
                      <Kpi label="Guardia" value={computoPersona.guardia} hint="hs" intent="ok" />
                      <Kpi
                        label="Jefatura"
                        value={computoPersona.jefatura}
                        hint="hs"
                        intent="warn"
                      />
                      <Kpi
                        label="O. Interno"
                        value={computoPersona.ordenInterno}
                        hint="hs"
                        intent="neutral"
                      />
                    </div>

                    <div className="mt-4 rounded-lg bg-slate-50 p-3 text-sm text-slate-700">
                      <strong className="text-slate-900">Desglose para rendición:</strong> de las{' '}
                      {computoPersona.total} hs,{' '}
                      {computoPersona.accidental + computoPersona.guardia} cuentan como operativas
                      para el Fondo. El resto suma a antigüedad y ranking.
                    </div>
                  </>
                ) : (
                  <div className="py-12 text-center text-sm text-slate-500">
                    Tocá una persona a la izquierda para ver su desglose mensual.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
