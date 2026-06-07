'use client';

import { Badge, Button, Card, CardContent, Kpi, cn, useToast } from '@faro/ui';
import { motion } from 'framer-motion';
import {
  ArrowDownRight,
  ArrowUpRight,
  Building2,
  ClipboardCheck,
  Download,
  FileSpreadsheet,
  Mail,
  Printer,
  ScrollText,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';
import { useMemo, useState } from 'react';

import { ars, arsCompact } from '../../../../../components/finanzas/utils';
import { PageHero } from '../../../../../components/shared/page-hero';
import { demoToday } from '../../../../../lib/utils/demo-today';
import { exportarCsv } from '../../../../../lib/utils/export-csv';
import { selectCuartelActivo, useFaroStore } from '../../../../../store/use-faro-store';

type ReporteTipo = 'balance' | 'resultados' | 'flujo' | 'compliance' | 'iva';

export default function ReportesPage() {
  const toast = useToast();
  const cuartel = useFaroStore(selectCuartelActivo);
  const movimientos = useFaroStore((s) => s.movimientos);
  const cuentas = useFaroStore((s) => s.cuentas);
  const cajas = useFaroStore((s) => s.cajas);
  const [tipo, setTipo] = useState<ReporteTipo>('resultados');
  const [periodo, setPeriodo] = useState<'mes' | 'trimestre' | 'anio'>('mes');

  const desde = useMemo(() => {
    const d = demoToday();
    if (periodo === 'mes') d.setDate(1);
    if (periodo === 'trimestre') {
      d.setMonth(d.getMonth() - 3);
      d.setDate(1);
    }
    if (periodo === 'anio') {
      d.setMonth(0);
      d.setDate(1);
    }
    return d.toISOString().slice(0, 10);
  }, [periodo]);

  const movsPeriodo = useMemo(
    () => movimientos.filter((m) => m.estado === 'conciliado' && m.fecha >= desde),
    [movimientos, desde],
  );

  // Estado de Resultados
  const ingresoPorCategoria = useMemo(() => {
    const map = new Map<string, number>();
    for (const m of movsPeriodo.filter((m) => m.tipo === 'ingreso')) {
      const cuenta = cuentas.find((c) => c.id === m.cuentaId);
      const key = cuenta?.nombre ?? 'Sin categorizar';
      map.set(key, (map.get(key) ?? 0) + m.monto);
    }
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
  }, [movsPeriodo, cuentas]);

  const egresoPorCategoria = useMemo(() => {
    const map = new Map<string, number>();
    for (const m of movsPeriodo.filter((m) => m.tipo === 'egreso')) {
      const cuenta = cuentas.find((c) => c.id === m.cuentaId);
      const key = cuenta?.nombre ?? 'Sin categorizar';
      map.set(key, (map.get(key) ?? 0) + m.monto);
    }
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
  }, [movsPeriodo, cuentas]);

  const totalIng = ingresoPorCategoria.reduce((s, [, v]) => s + v, 0);
  const totalEgr = egresoPorCategoria.reduce((s, [, v]) => s + v, 0);
  const resultado = totalIng - totalEgr;

  // Compliance Ley 25.054
  const subsidio = movsPeriodo
    .filter((m) => m.cuentaId === 'c-4-1-01' && m.tipo === 'ingreso')
    .reduce((s, m) => s + m.monto, 0);
  const cuentasPersonal = cuentas
    .filter((c) => c.categoria === 'personal_rentado')
    .map((c) => c.id);
  const sueldos = movsPeriodo
    .filter((m) => m.tipo === 'egreso' && cuentasPersonal.includes(m.cuentaId))
    .reduce((s, m) => s + m.monto, 0);
  const pctPersonal = subsidio > 0 ? (sueldos / subsidio) * 100 : 0;

  // Balance simplificado. "Resultados acumulados" es la figura de cierre para que
  // Activo = Pasivo + P.Neto (como en un balance real simplificado), no un número suelto.
  const activos = cajas.reduce((s, c) => s + c.saldoActual, 0);
  const activoTotal = activos + 45_000_000;
  const pasivoFijo = 2_400_000 + 1_100_000 + 50_000_000;
  const resultadosAcum = activoTotal - pasivoFijo;

  function exportar(formato: 'pdf' | 'excel' | 'csv') {
    if (formato === 'csv') {
      const headers = ['Sección', 'Concepto', 'Monto ARS'];
      const rows: Array<Array<string | number>> = [
        ['Resumen', `Ingresos (${periodo})`, totalIng],
        ['Resumen', `Egresos (${periodo})`, totalEgr],
        ['Resumen', 'Resultado', resultado],
        ['Resumen', 'Aporte sueldos sobre subsidio (%)', Number(pctPersonal.toFixed(1))],
        ...ingresoPorCategoria.map(
          ([cat, monto]) => ['Ingresos', cat, monto] as Array<string | number>,
        ),
        ...egresoPorCategoria.map(
          ([cat, monto]) => ['Egresos', cat, monto] as Array<string | number>,
        ),
      ];
      exportarCsv(`reporte-${tipo}-${periodo}`, headers, rows);
      toast.push({
        kind: 'success',
        title: 'Reporte exportado · CSV',
        description: `reporte-${tipo}-${periodo}.csv`,
      });
      return;
    }
    toast.push({
      kind: 'info',
      title: 'Por ahora, descargá en CSV',
      description:
        'El CSV abre en Excel. El PDF/Excel nativo se integra con el sistema del contador.',
    });
  }

  function enviarPorMail() {
    toast.push({
      kind: 'info',
      title: 'Demo: se enviaría a la Comisión Directiva',
      description:
        'En producción adjunta el reporte (PDF + Excel) y lo manda a los 5 destinatarios.',
    });
  }

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <PageHero
        objetivo={`Tesorería · ${cuartel?.nombre ?? 'Cuartel'}`}
        titulo="Reportes"
        descripcion="Resúmenes listos para mostrarle a la Comisión Directiva y a los organismos que controlan."
        icono={<ScrollText size={26} />}
        meta={
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Kpi label="Ingresos período" value={arsCompact(totalIng)} intent="ok" />
            <Kpi label="Egresos período" value={arsCompact(totalEgr)} intent="warn" />
            <Kpi
              label="Resultado"
              value={arsCompact(resultado)}
              intent={resultado >= 0 ? 'ok' : 'risk'}
            />
            <Kpi
              label="Aporte sueldos"
              value={`${pctPersonal.toFixed(0)}%`}
              hint="meta 70%"
              intent={pctPersonal >= 70 ? 'ok' : 'risk'}
            />
          </div>
        }
        acciones={
          <>
            <Button intent="ghost" size="sm" onClick={() => exportar('excel')}>
              <FileSpreadsheet size={12} /> Excel
            </Button>
            <Button intent="ghost" size="sm" onClick={() => exportar('csv')}>
              <Download size={12} /> CSV
            </Button>
            <Button intent="primary" size="sm" onClick={() => exportar('pdf')}>
              <Printer size={12} /> Imprimir PDF
            </Button>
          </>
        }
      />

      {/* Selectores reporte */}
      <Card>
        <CardContent className="flex flex-wrap items-center gap-2 p-3">
          <div className="flex gap-1">
            {(
              [
                ['resultados', 'Estado de Resultados'],
                ['balance', 'Balance General'],
                ['flujo', 'Flujo de fondos'],
                ['compliance', 'Cumplimiento Ley 25.054'],
                ['iva', 'Facturas A'],
              ] as const
            ).map(([k, l]) => (
              <button
                key={k}
                type="button"
                onClick={() => setTipo(k)}
                className={cn(
                  'rounded-full px-3 py-1.5 text-xs font-medium transition-all',
                  tipo === k
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200',
                )}
              >
                {l}
              </button>
            ))}
          </div>
          <div className="ml-auto flex gap-1">
            {(['mes', 'trimestre', 'anio'] as const).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPeriodo(p)}
                className={cn(
                  'rounded px-2 py-1 text-xs',
                  periodo === p ? 'bg-brand-100 text-brand-900 font-bold' : 'text-slate-600',
                )}
              >
                {p}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* === Estado de Resultados === */}
      {tipo === 'resultados' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
          <Card>
            <CardContent className="p-6">
              <div className="mb-4 flex items-baseline justify-between border-b border-slate-200 pb-3">
                <div>
                  <h3 className="font-bold text-slate-900">Estado de Resultados</h3>
                  <p className="text-xs text-slate-500">
                    Período{' '}
                    {periodo === 'mes'
                      ? 'mes en curso'
                      : periodo === 'trimestre'
                        ? 'último trimestre'
                        : 'año en curso'}{' '}
                    · Asoc. Civil Bomberos VBA
                  </p>
                </div>
                <Badge intent="neutral">{demoToday().getFullYear()}</Badge>
              </div>

              {/* Ingresos */}
              <div className="space-y-2">
                <h4 className="text-status-ok-fg text-sm font-bold uppercase">
                  <ArrowUpRight size={14} className="mr-1 inline" /> INGRESOS
                </h4>
                <table className="w-full text-sm">
                  <tbody>
                    {ingresoPorCategoria.map(([nombre, monto]) => (
                      <tr key={nombre} className="border-t border-slate-100">
                        <td className="py-1.5 text-slate-700">{nombre}</td>
                        <td className="py-1.5 text-right font-mono font-bold text-slate-900">
                          {ars.format(monto)}
                        </td>
                      </tr>
                    ))}
                    <tr className="border-t-2 border-slate-300">
                      <td className="text-status-ok-fg py-2 font-bold">Total ingresos</td>
                      <td className="text-status-ok-fg py-2 text-right font-mono text-lg font-bold">
                        {ars.format(totalIng)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Egresos */}
              <div className="mt-6 space-y-2">
                <h4 className="text-status-risk-fg text-sm font-bold uppercase">
                  <ArrowDownRight size={14} className="mr-1 inline" /> EGRESOS
                </h4>
                <table className="w-full text-sm">
                  <tbody>
                    {egresoPorCategoria.map(([nombre, monto]) => (
                      <tr key={nombre} className="border-t border-slate-100">
                        <td className="py-1.5 text-slate-700">{nombre}</td>
                        <td className="py-1.5 text-right font-mono font-bold text-slate-900">
                          {ars.format(monto)}
                        </td>
                      </tr>
                    ))}
                    <tr className="border-t-2 border-slate-300">
                      <td className="text-status-risk-fg py-2 font-bold">Total egresos</td>
                      <td className="text-status-risk-fg py-2 text-right font-mono text-lg font-bold">
                        {ars.format(totalEgr)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Resultado */}
              <div
                className={cn(
                  'mt-6 rounded-lg p-4',
                  resultado >= 0 ? 'bg-status-ok-bg/40' : 'bg-status-risk-bg/40',
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold uppercase text-slate-900">RESULTADO DEL PERÍODO</span>
                  <span
                    className={cn(
                      'font-mono text-2xl font-black',
                      resultado >= 0 ? 'text-status-ok-fg' : 'text-status-risk-fg',
                    )}
                  >
                    {resultado >= 0 ? '+' : ''}
                    {ars.format(resultado)}
                  </span>
                </div>
                <div className="mt-1 text-xs text-slate-700">
                  {resultado >= 0
                    ? '✓ Superávit operativo. Recomendado: trasladar excedente a reserva o plazo fijo.'
                    : '✗ Déficit del período. Revisar partidas excedidas en presupuesto.'}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* === Balance General === */}
      {tipo === 'balance' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
          <Card>
            <CardContent className="p-6">
              <div className="mb-4 flex items-baseline justify-between border-b border-slate-200 pb-3">
                <div>
                  <h3 className="font-bold text-slate-900">Balance General simplificado</h3>
                  <p className="text-xs text-slate-500">
                    Al {demoToday().toLocaleDateString('es-AR')}
                  </p>
                </div>
                <Badge intent="neutral">DPPJ</Badge>
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div>
                  <h4 className="bg-status-ok-bg text-status-ok-fg mb-2 rounded p-1.5 text-sm font-bold uppercase">
                    ACTIVO
                  </h4>
                  <table className="w-full text-sm">
                    <tbody>
                      <tr className="font-semibold">
                        <td className="py-1 text-slate-700">Disponibilidades</td>
                        <td className="py-1 text-right font-mono">{ars.format(activos)}</td>
                      </tr>
                      {cajas.map((c) => (
                        <tr key={c.id} className="border-t border-slate-100 text-xs">
                          <td className="py-1 pl-3 text-slate-600">· {c.nombre}</td>
                          <td className="py-1 text-right font-mono text-slate-700">
                            {ars.format(c.saldoActual)}
                          </td>
                        </tr>
                      ))}
                      <tr className="border-t border-slate-100">
                        <td className="py-1 font-semibold text-slate-700">
                          Bienes de uso (estimado)
                        </td>
                        <td className="py-1 text-right font-mono">{ars.format(45_000_000)}</td>
                      </tr>
                      <tr className="bg-status-ok-bg/40 border-t-2 border-slate-300">
                        <td className="py-2 font-bold uppercase text-slate-900">Total activo</td>
                        <td className="text-status-ok-fg py-2 text-right font-mono text-lg font-bold">
                          {ars.format(activoTotal)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div>
                  <h4 className="bg-status-risk-bg text-status-risk-fg mb-2 rounded p-1.5 text-sm font-bold uppercase">
                    PASIVO + P.NETO
                  </h4>
                  <table className="w-full text-sm">
                    <tbody>
                      <tr className="font-semibold">
                        <td className="py-1 text-slate-700">Deudas comerciales</td>
                        <td className="py-1 text-right font-mono">{ars.format(2_400_000)}</td>
                      </tr>
                      <tr className="border-t border-slate-100">
                        <td className="py-1 font-semibold text-slate-700">
                          Cargas sociales a pagar
                        </td>
                        <td className="py-1 text-right font-mono">{ars.format(1_100_000)}</td>
                      </tr>
                      <tr className="border-t border-slate-100">
                        <td className="py-1 font-semibold text-slate-700">Capital institucional</td>
                        <td className="py-1 text-right font-mono">{ars.format(50_000_000)}</td>
                      </tr>
                      <tr className="border-t border-slate-100">
                        <td className="py-1 font-semibold text-slate-700">Resultados acumulados</td>
                        <td className="py-1 text-right font-mono">{ars.format(resultadosAcum)}</td>
                      </tr>
                      <tr className="bg-status-risk-bg/40 border-t-2 border-slate-300">
                        <td className="py-2 font-bold uppercase text-slate-900">Total P+PN</td>
                        <td className="text-status-ok-fg py-2 text-right font-mono text-lg font-bold">
                          {ars.format(activoTotal)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* === Flujo de fondos === */}
      {tipo === 'flujo' && (
        <Card>
          <CardContent className="p-6">
            <h3 className="mb-4 font-bold text-slate-900">Flujo de fondos</h3>
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-3 py-2 text-left">Concepto</th>
                  <th className="px-3 py-2 text-right">Mes</th>
                  <th className="px-3 py-2 text-right">Trim. (est.)</th>
                  <th className="px-3 py-2 text-right">YTD (est.)</th>
                </tr>
              </thead>
              <tbody>
                <tr className="font-bold">
                  <td className="text-status-ok-fg px-3 py-2">+ Ingresos operativos</td>
                  <td className="px-3 py-2 text-right font-mono">{ars.format(totalIng)}</td>
                  <td className="px-3 py-2 text-right font-mono">{ars.format(totalIng * 2.95)}</td>
                  <td className="px-3 py-2 text-right font-mono">{ars.format(totalIng * 4.92)}</td>
                </tr>
                <tr>
                  <td className="text-status-risk-fg px-3 py-2">− Egresos operativos</td>
                  <td className="px-3 py-2 text-right font-mono">−{ars.format(totalEgr)}</td>
                  <td className="px-3 py-2 text-right font-mono">−{ars.format(totalEgr * 2.95)}</td>
                  <td className="px-3 py-2 text-right font-mono">−{ars.format(totalEgr * 4.92)}</td>
                </tr>
                <tr className="bg-brand-50 border-t-2 border-slate-300 font-bold">
                  <td className="text-brand-900 px-3 py-2">= Flujo operativo neto</td>
                  <td className="px-3 py-2 text-right font-mono">{ars.format(resultado)}</td>
                  <td className="px-3 py-2 text-right font-mono">{ars.format(resultado * 2.95)}</td>
                  <td className="px-3 py-2 text-right font-mono">{ars.format(resultado * 4.92)}</td>
                </tr>
                <tr className="border-t border-slate-100">
                  <td className="px-3 py-2 text-slate-700">+ Saldo inicial caja</td>
                  <td className="px-3 py-2 text-right font-mono">
                    {ars.format(activos - resultado)}
                  </td>
                  <td className="px-3 py-2 text-right font-mono">
                    {ars.format(activos - resultado * 2.95)}
                  </td>
                  <td className="px-3 py-2 text-right font-mono">
                    {ars.format(activos - resultado * 4.92)}
                  </td>
                </tr>
                <tr className="bg-status-ok-bg/40 border-t-2 border-slate-300 font-bold">
                  <td className="text-status-ok-fg px-3 py-2">= Saldo final caja</td>
                  <td className="px-3 py-2 text-right font-mono">{ars.format(activos)}</td>
                  <td className="px-3 py-2 text-right font-mono">{ars.format(activos)}</td>
                  <td className="px-3 py-2 text-right font-mono">{ars.format(activos)}</td>
                </tr>
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {/* === Cumplimiento Ley 25.054 === */}
      {tipo === 'compliance' && (
        <Card>
          <CardContent className="p-6">
            <div className="mb-4 flex items-baseline justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="font-bold text-slate-900">Cumplimiento Ley 25.054</h3>
                <p className="text-xs text-slate-500">
                  Reporte para Superintendencia (SSN) y Federación BV
                </p>
              </div>
              <Badge intent={pctPersonal >= 70 ? 'ok' : 'risk'}>
                {pctPersonal >= 70 ? <ShieldCheck size={11} /> : null}
                {pctPersonal.toFixed(0)}% personal rentado
              </Badge>
            </div>

            <div className="space-y-4">
              <div
                className={cn(
                  'rounded-xl p-5',
                  pctPersonal >= 70 ? 'bg-status-ok-bg/30' : 'bg-status-risk-bg/30',
                )}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={cn(
                      'grid h-12 w-12 shrink-0 place-items-center rounded-xl text-white',
                      pctPersonal >= 70 ? 'bg-status-ok' : 'bg-status-risk',
                    )}
                  >
                    <ShieldCheck size={24} />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-bold text-slate-900">
                      Art. 13 — Personal rentado · 70% mínimo del subsidio
                    </h4>
                    <p className="mt-1 text-sm text-slate-700">
                      Aplicaste <strong>{ars.format(sueldos)}</strong> en sueldos sobre{' '}
                      <strong>{ars.format(subsidio)}</strong> de subsidio nacional cobrado.
                    </p>
                    <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                      <div className="rounded-lg bg-white p-2 text-center">
                        <div className="text-slate-500">Subsidio recibido</div>
                        <div className="font-mono font-bold text-slate-900">
                          {arsCompact(subsidio)}
                        </div>
                      </div>
                      <div className="rounded-lg bg-white p-2 text-center">
                        <div className="text-slate-500">Mínimo obligatorio</div>
                        <div className="font-mono font-bold text-slate-900">
                          {arsCompact(subsidio * 0.7)}
                        </div>
                      </div>
                      <div className="rounded-lg bg-white p-2 text-center">
                        <div className="text-slate-500">Aplicado</div>
                        <div
                          className={cn(
                            'font-mono font-bold',
                            pctPersonal >= 70 ? 'text-status-ok-fg' : 'text-status-risk-fg',
                          )}
                        >
                          {arsCompact(sueldos)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {[
                  {
                    titulo: 'Art. 8 · Personería jurídica',
                    descripcion:
                      'Asoc. Civil sin fines de lucro inscripta en la Dirección de Personería Jurídica (DPPJ)',
                    ok: true,
                  },
                  {
                    titulo: 'Art. 12 · Reglamento interno',
                    descripcion: 'Reglamento aprobado por Asamblea y registrado',
                    ok: true,
                  },
                  {
                    titulo: 'Art. 14 · Rendición trimestral',
                    descripcion: 'Última rendición presentada: 30/04/2026',
                    ok: true,
                  },
                  {
                    titulo: 'Art. 17 · Memoria + Balance anual',
                    descripcion: 'Próximo cierre 31/12/2026 · presentar antes 30/04/2027',
                    ok: true,
                  },
                ].map((item) => (
                  <div
                    key={item.titulo}
                    className="bg-status-ok-bg/30 border-status-ok/30 rounded-lg border p-3 text-sm"
                  >
                    <div className="flex items-start gap-2">
                      <ClipboardCheck size={16} className="text-status-ok-fg mt-0.5 shrink-0" />
                      <div>
                        <div className="font-semibold text-slate-900">{item.titulo}</div>
                        <div className="text-xs text-slate-700">{item.descripcion}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* === Libro IVA === */}
      {tipo === 'iva' && (
        <Card>
          <CardContent className="p-6">
            <div className="mb-4 border-b border-slate-200 pb-3">
              <h3 className="font-bold text-slate-900">Listado de facturas A</h3>
              <p className="text-xs text-slate-500">
                Asociación civil exenta de IVA (Art. 7 inc. h Ley 23.349). Listado de facturas A
                recibidas con discriminación de crédito fiscal informativo.
              </p>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-3 py-2 text-left">Fecha</th>
                  <th className="px-3 py-2 text-left">Tipo</th>
                  <th className="px-3 py-2 text-left">Nº comprobante</th>
                  <th className="px-3 py-2 text-left">CUIT</th>
                  <th className="px-3 py-2 text-left">Razón social</th>
                  <th className="px-3 py-2 text-right">Neto</th>
                  <th className="px-3 py-2 text-right">IVA 21%</th>
                  <th className="px-3 py-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {movsPeriodo
                  .filter((m) => m.tipo === 'egreso' && m.comprobanteTipo === 'FA-A')
                  .slice(0, 20)
                  .map((m) => {
                    const neto = m.monto / 1.21;
                    const iva = m.monto - neto;
                    return (
                      <tr key={m.id} className="border-t border-slate-100">
                        <td className="px-3 py-1.5 text-xs">{m.fecha.slice(0, 10)}</td>
                        <td className="px-3 py-1.5">
                          <Badge intent="ok">FA-A</Badge>
                        </td>
                        <td className="px-3 py-1.5 font-mono text-xs">{m.comprobanteNumero}</td>
                        <td className="px-3 py-1.5 font-mono text-xs">{m.cuitContraparte}</td>
                        <td className="px-3 py-1.5 text-xs">{m.contraparte}</td>
                        <td className="px-3 py-1.5 text-right font-mono text-xs">
                          {ars.format(neto)}
                        </td>
                        <td className="px-3 py-1.5 text-right font-mono text-xs text-slate-500">
                          {ars.format(iva)}
                        </td>
                        <td className="px-3 py-1.5 text-right font-mono text-xs font-bold">
                          {ars.format(m.monto)}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Button intent="secondary" onClick={enviarPorMail}>
          <Mail size={14} /> Enviar a Comisión
        </Button>
        <Button
          intent="secondary"
          onClick={() =>
            toast.push({ kind: 'info', title: 'Subiendo al portal de la Superintendencia' })
          }
        >
          <Building2 size={14} /> Presentar a Superintendencia (SSN)
        </Button>
        <Button
          intent="secondary"
          onClick={() => toast.push({ kind: 'info', title: 'Generando archivo para AFIP' })}
        >
          <TrendingUp size={14} /> Archivo AFIP
        </Button>
      </div>
    </div>
  );
}
