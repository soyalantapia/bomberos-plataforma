'use client';

import { Badge, Button, Card, CardContent, Kpi, cn, useToast } from '@faro/ui';
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Banknote,
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  Landmark,
  PiggyBank,
  Plus,
  ShieldAlert,
  Target,
  Users,
  Wallet,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';

import { NuevoMovimientoDialog } from '../../../../components/finanzas/nuevo-movimiento-dialog';
import {
  CATEGORIA_EGRESO_LABEL,
  CATEGORIA_INGRESO_LABEL,
  agruparPorMes,
  ars,
  arsCompact,
  fechaCorta,
} from '../../../../components/finanzas/utils';
import { PageHero } from '../../../../components/shared/page-hero';
import { mesAnteriorKey, mesKey, nombreMes } from '../../../../lib/utils/date';
import { demoToday } from '../../../../lib/utils/demo-today';
import { exportarCsv } from '../../../../lib/utils/export-csv';
import { selectCuartelActivo, useFaroStore } from '../../../../store/use-faro-store';

// Obligaciones próximas (ilustrativas): impuestos/cargas con fecha. Se calcula
// "días hasta" contra el día de la demo. A futuro: store-backed por cuartel.
const OBLIGACIONES = [
  {
    titulo: 'Aportes patronales · junio',
    subtitulo: 'Cargas sociales de mayo',
    fecha: '2026-06-15',
  },
  { titulo: 'VTV unidad BV-2', subtitulo: 'Verificación técnica', fecha: '2026-06-12' },
  { titulo: 'Ingresos Brutos', subtitulo: 'Anticipo mensual', fecha: '2026-05-28' },
];

function diasHasta(fechaIso: string): number {
  const f = new Date(fechaIso);
  const hoy = demoToday();
  return Math.round((f.getTime() - hoy.getTime()) / 86400000);
}

function meses1(n: number): string {
  return n.toFixed(1).replace('.', ',');
}

export default function FinanzasDashboardPage() {
  const router = useRouter();
  const toast = useToast();
  const cuartel = useFaroStore(selectCuartelActivo);
  const movimientos = useFaroStore((s) => s.movimientos);
  const cajas = useFaroStore((s) => s.cajas);
  const cuentas = useFaroStore((s) => s.cuentas);
  const cuotas = useFaroStore((s) => s.cuotas);
  const presupuestos = useFaroStore((s) => s.presupuestos);
  const [openNuevo, setOpenNuevo] = useState(false);

  const hoy = demoToday();
  const mesActual = mesKey(hoy);
  const mesAnterior = mesAnteriorKey(hoy);
  const mesActualNombre = nombreMes(mesActual);
  const mesAnteriorAbrev = nombreMes(mesAnterior).slice(0, 3);

  const movsConciliados = useMemo(
    () => movimientos.filter((m) => m.estado === 'conciliado'),
    [movimientos],
  );

  const ingMes = useMemo(
    () =>
      movsConciliados
        .filter((m) => m.tipo === 'ingreso' && m.fecha.startsWith(mesActual))
        .reduce((s, m) => s + m.monto, 0),
    [movsConciliados, mesActual],
  );
  const egrMes = useMemo(
    () =>
      movsConciliados
        .filter((m) => m.tipo === 'egreso' && m.fecha.startsWith(mesActual))
        .reduce((s, m) => s + m.monto, 0),
    [movsConciliados, mesActual],
  );
  const ingAnt = useMemo(
    () =>
      movsConciliados
        .filter((m) => m.tipo === 'ingreso' && m.fecha.startsWith(mesAnterior))
        .reduce((s, m) => s + m.monto, 0),
    [movsConciliados, mesAnterior],
  );

  const saldoMes = ingMes - egrMes;
  const saldoTotal = cajas.reduce((s, c) => s + c.saldoActual, 0);
  const variacionIngresos = ingAnt > 0 ? ((ingMes - ingAnt) / ingAnt) * 100 : 0;

  // ── Flujo 6 meses + RUNWAY ("meses de aire") ───────────────────────
  const series = useMemo(() => agruparPorMes(movsConciliados, 6), [movsConciliados]);
  const maxBar = Math.max(1, ...series.flatMap((s) => [s.ingresos, s.egresos]));
  const egrPromMensual = useMemo(() => {
    const conDatos = series.filter((s) => s.egresos > 0);
    return conDatos.length ? conDatos.reduce((s, x) => s + x.egresos, 0) / conDatos.length : 0;
  }, [series]);
  const mesesAire = egrPromMensual > 0 ? saldoTotal / egrPromMensual : null;
  const aireIntent =
    mesesAire === null ? 'neutral' : mesesAire >= 6 ? 'ok' : mesesAire >= 3 ? 'warn' : 'risk';

  // ── Cobranza de cuotas ─────────────────────────────────────────────
  const cuotasPagadas = cuotas.filter((c) => c.estado === 'pagada').length;
  const cuotasAlDiaPct = cuotas.length ? Math.round((cuotasPagadas / cuotas.length) * 100) : 0;
  const cuotasVencidas = useMemo(
    () => cuotas.filter((c) => c.estado === 'vencida' || c.estado === 'pendiente'),
    [cuotas],
  );
  const recuperableCuotas = cuotasVencidas.reduce((s, c) => s + c.monto + (c.cargoRecargo ?? 0), 0);

  // ── Ley 25.054: ≥70% del subsidio nacional a sueldos ──────────────
  const sueldosMes = useMemo(() => {
    const cuentasPersonal = cuentas
      .filter((c) => c.categoria === 'personal_rentado')
      .map((c) => c.id);
    return movsConciliados
      .filter(
        (m) =>
          m.tipo === 'egreso' &&
          m.fecha.startsWith(mesActual) &&
          cuentasPersonal.includes(m.cuentaId),
      )
      .reduce((s, m) => s + m.monto, 0);
  }, [movsConciliados, cuentas, mesActual]);
  const subsidioMes = useMemo(
    () =>
      movsConciliados
        .filter(
          (m) => m.tipo === 'ingreso' && m.fecha.startsWith(mesActual) && m.cuentaId === 'c-4-1-01',
        )
        .reduce((s, m) => s + m.monto, 0),
    [movsConciliados, mesActual],
  );
  const pctPersonalRentado = subsidioMes > 0 ? (sueldosMes / subsidioMes) * 100 : 0;
  const cumple70 = subsidioMes === 0 || pctPersonalRentado >= 70;

  // ── Composición de ingresos del mes + dependencia del subsidio ─────
  const cuentasSubsidio = useMemo(
    () => cuentas.filter((c) => c.codigo.startsWith('4.1')).map((c) => c.id),
    [cuentas],
  );
  const subsidiosMes = useMemo(
    () =>
      movsConciliados
        .filter(
          (m) =>
            m.tipo === 'ingreso' &&
            m.fecha.startsWith(mesActual) &&
            cuentasSubsidio.includes(m.cuentaId),
        )
        .reduce((s, m) => s + m.monto, 0),
    [movsConciliados, cuentasSubsidio, mesActual],
  );
  const dependenciaSubsidio = ingMes > 0 ? Math.round((subsidiosMes / ingMes) * 100) : 0;

  // Top 5 egresos del mes
  const topEgresos = useMemo(() => {
    const map = new Map<string, number>();
    for (const m of movsConciliados.filter(
      (m) => m.tipo === 'egreso' && m.fecha.startsWith(mesActual),
    )) {
      const cuenta = cuentas.find((c) => c.id === m.cuentaId);
      if (!cuenta) continue;
      const key = cuenta.categoria ?? cuenta.nombre;
      map.set(key, (map.get(key) ?? 0) + m.monto);
    }
    return Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  }, [movsConciliados, cuentas, mesActual]);

  const ingresosComp = useMemo(() => {
    const map = new Map<string, number>();
    for (const m of movsConciliados.filter(
      (m) => m.tipo === 'ingreso' && m.fecha.startsWith(mesActual),
    )) {
      const cuenta = cuentas.find((c) => c.id === m.cuentaId);
      if (!cuenta) continue;
      const label = cuenta.categoria
        ? (CATEGORIA_INGRESO_LABEL[cuenta.categoria as keyof typeof CATEGORIA_INGRESO_LABEL] ??
          cuenta.nombre)
        : cuenta.nombre;
      map.set(label, (map.get(label) ?? 0) + m.monto);
    }
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
  }, [movsConciliados, cuentas, mesActual]);

  // Presupuesto YTD
  const presupuesto = presupuestos[0];
  const ingresosYTD = useMemo(
    () => movsConciliados.filter((m) => m.tipo === 'ingreso').reduce((s, m) => s + m.monto, 0),
    [movsConciliados],
  );
  const egresosYTD = useMemo(
    () => movsConciliados.filter((m) => m.tipo === 'egreso').reduce((s, m) => s + m.monto, 0),
    [movsConciliados],
  );
  const pctEjecIngresos = presupuesto?.totalIngresos
    ? (ingresosYTD / presupuesto.totalIngresos) * 100
    : 0;
  const pctEjecEgresos = presupuesto?.totalEgresos
    ? (egresosYTD / presupuesto.totalEgresos) * 100
    : 0;

  const borradores = useMemo(
    () => movimientos.filter((m) => m.estado === 'borrador'),
    [movimientos],
  );
  const ultimos = useMemo(
    () => [...movsConciliados].sort((a, b) => b.fecha.localeCompare(a.fecha)).slice(0, 8),
    [movsConciliados],
  );
  const obligacionesUrgentes = OBLIGACIONES.filter((o) => diasHasta(o.fecha) <= 7).length;

  // ── VEREDICTO (answer-first) ───────────────────────────────────────
  const veredicto = useMemo(() => {
    const mesCap = mesActualNombre.charAt(0).toUpperCase() + mesActualNombre.slice(1);
    const pos = `Tenés ${arsCompact(saldoTotal)} en caja${
      mesesAire !== null ? ` · ~${meses1(mesesAire)} meses de aire al ritmo de gastos actual` : ''
    }. ${mesCap}: ${saldoMes >= 0 ? 'vas +' : 'vas −'}${arsCompact(Math.abs(saldoMes))}.`;
    if (!cumple70)
      return {
        estado: 'risk' as const,
        titulo: 'Revisá cómo se aplica el subsidio',
        desc: pos,
      };
    if (saldoTotal <= 0 || (mesesAire !== null && mesesAire < 2))
      return { estado: 'risk' as const, titulo: 'La caja está al límite', desc: pos };
    if ((mesesAire !== null && mesesAire < 4) || saldoMes < 0)
      return { estado: 'warn' as const, titulo: 'La caja está justa', desc: pos };
    return { estado: 'ok' as const, titulo: 'El cuartel está en regla', desc: pos };
  }, [cumple70, saldoTotal, mesesAire, saldoMes, mesActualNombre]);

  // ── "Necesita tu atención" — consolidado ───────────────────────────
  type Atencion = {
    icon: React.ReactNode;
    texto: string;
    detalle: string;
    href: string;
    intent: 'risk' | 'warn';
  };
  const atencion: Atencion[] = [];
  if (!cumple70)
    atencion.push({
      icon: <ShieldAlert size={18} />,
      texto: `Subsidio: ${pctPersonalRentado.toFixed(0)}% aplicado a sueldos (la Ley 25.054 pide ≥70%)`,
      detalle: `Faltan ${ars.format(Math.max(0, subsidioMes * 0.7 - sueldosMes))} para llegar al mínimo.`,
      href: '/mando/rendicion',
      intent: 'risk',
    });
  if (cuotasVencidas.length > 0)
    atencion.push({
      icon: <Users size={18} />,
      texto: `${cuotasVencidas.length} cuotas sociales por cobrar`,
      detalle: `${ars.format(recuperableCuotas)} recuperables si las regularizás.`,
      href: '/mando/finanzas/cuotas',
      intent: 'warn',
    });
  if (borradores.length > 0)
    atencion.push({
      icon: <AlertTriangle size={18} />,
      texto: `${borradores.length} movimiento${borradores.length === 1 ? '' : 's'} sin terminar`,
      detalle: 'Falta confirmar factura o comprobante. Cerralos antes de fin de mes.',
      href: '/mando/finanzas/movimientos?estado=borrador',
      intent: 'warn',
    });
  if (obligacionesUrgentes > 0)
    atencion.push({
      icon: <Calendar size={18} />,
      texto: `${obligacionesUrgentes} obligación${obligacionesUrgentes === 1 ? '' : 'es'} vence${obligacionesUrgentes === 1 ? '' : 'n'} esta semana`,
      detalle: 'Revisá los próximos vencimientos para no pagar recargos.',
      href: '/mando/finanzas/movimientos',
      intent: 'risk',
    });

  function exportarBalance() {
    const rows: Array<Array<string | number>> = [
      ['Sección', 'Concepto', 'Monto ARS'],
      ['Resumen', `Ingresos ${mesActualNombre}`, ingMes],
      ['Resumen', `Egresos ${mesActualNombre}`, egrMes],
      ['Resumen', 'Saldo del mes', saldoMes],
      ['Resumen', 'Saldo total (todas las cajas)', saldoTotal],
      ['Resumen', 'Meses de aire (runway)', mesesAire !== null ? Number(mesesAire.toFixed(1)) : 0],
      ['Saldos', 'Caja', 'Saldo actual'],
      ...cajas.map((c) => ['Saldos', c.nombre, c.saldoActual]),
      ['Top egresos', 'Categoría', 'Monto'],
      ...topEgresos.map(([cat, monto]) => [
        'Top egresos',
        CATEGORIA_EGRESO_LABEL[cat as keyof typeof CATEGORIA_EGRESO_LABEL] ?? cat,
        monto,
      ]),
    ];
    exportarCsv(`balance-${mesActual}`, rows[0]!.map(String), rows.slice(1));
    toast.push({
      kind: 'success',
      title: 'Balance exportado',
      description: `balance-${mesActual}.csv`,
    });
  }

  const heroVariant =
    veredicto.estado === 'risk' ? 'critical' : veredicto.estado === 'ok' ? 'success' : 'default';

  return (
    <>
      <div className="mx-auto max-w-7xl space-y-5">
        <PageHero
          objetivo={`Tesorería · ${cuartel?.nombre ?? 'Cuartel'}`}
          titulo={veredicto.titulo}
          descripcion={veredicto.desc}
          icono={<PiggyBank size={26} />}
          variant={heroVariant}
          meta={
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <Kpi
                label="En caja hoy"
                value={arsCompact(saldoTotal)}
                hint={`${cajas.length} cuentas`}
                intent="brand"
                icon={<Wallet size={16} />}
              />
              <Kpi
                label={`Resultado ${mesActualNombre.slice(0, 3)}.`}
                value={`${saldoMes >= 0 ? '+' : '−'}${arsCompact(Math.abs(saldoMes))}`}
                hint={`ingresos ${variacionIngresos >= 0 ? '+' : ''}${variacionIngresos.toFixed(0)}% vs ${mesAnteriorAbrev}`}
                intent={saldoMes >= 0 ? 'ok' : 'risk'}
              />
              <Kpi
                label="Meses de aire"
                value={mesesAire === null ? '—' : meses1(mesesAire)}
                hint="al ritmo de gastos actual"
                intent={aireIntent}
                icon={<Clock size={16} />}
              />
              <Kpi
                label="Cuotas al día"
                value={`${cuotasAlDiaPct}%`}
                hint={
                  recuperableCuotas > 0
                    ? `${arsCompact(recuperableCuotas)} por cobrar`
                    : 'todo cobrado'
                }
                intent={cuotasAlDiaPct >= 80 ? 'ok' : cuotasAlDiaPct >= 60 ? 'warn' : 'risk'}
                icon={<Users size={16} />}
              />
            </div>
          }
          acciones={
            <>
              <Button intent="ghost" size="sm" onClick={exportarBalance}>
                <Download size={12} /> Exportar balance
              </Button>
              <Button intent="primary" onClick={() => setOpenNuevo(true)}>
                <Plus size={14} /> Nuevo movimiento
              </Button>
            </>
          }
        />

        {/* Necesita tu atención — todo lo accionable en un solo lugar */}
        {atencion.length > 0 ? (
          <Card className="overflow-hidden border-slate-200">
            <CardContent className="p-0">
              <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-3">
                <AlertTriangle size={16} className="text-status-warn-fg" />
                <h3 className="font-bold text-slate-900">Necesita tu atención</h3>
                <Badge intent="warn" className="ml-auto">
                  {atencion.length}
                </Badge>
              </div>
              <ul className="divide-y divide-slate-100">
                {atencion.map((a, i) => (
                  <li key={i}>
                    <button
                      type="button"
                      onClick={() => router.push(a.href as Parameters<typeof router.push>[0])}
                      className="flex w-full items-center gap-3 px-5 py-3 text-left hover:bg-slate-50"
                    >
                      <span
                        className={cn(
                          'grid h-9 w-9 shrink-0 place-items-center rounded-lg',
                          a.intent === 'risk'
                            ? 'bg-status-risk-bg/50 text-status-risk-fg'
                            : 'bg-status-warn-bg/50 text-status-warn-fg',
                        )}
                      >
                        {a.icon}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-semibold text-slate-900">{a.texto}</div>
                        <div className="text-xs text-slate-600">{a.detalle}</div>
                      </div>
                      <ArrowRight size={16} className="shrink-0 text-slate-300" />
                    </button>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-status-ok/30 bg-status-ok-bg/20 border">
            <CardContent className="flex items-center gap-3 p-4">
              <CheckCircle2 size={20} className="text-status-ok shrink-0" />
              <div className="text-sm font-medium text-slate-800">
                Todo en orden: sin movimientos sin terminar, cuotas al día y subsidio bien aplicado.
              </div>
            </CardContent>
          </Card>
        )}

        {/* Flujo 6 meses */}
        <Card>
          <CardContent className="p-5">
            <div className="mb-4 flex items-end justify-between">
              <div>
                <h3 className="font-bold text-slate-900">
                  Cómo se movió la plata · últimos 6 meses
                </h3>
                <p className="text-xs text-slate-600">
                  Ingresos vs egresos y el saldo neto de cada mes
                </p>
              </div>
              <div className="flex gap-3 text-xs">
                <span className="flex items-center gap-1">
                  <span className="bg-status-ok h-2 w-2 rounded-full" /> Ingresos
                </span>
                <span className="flex items-center gap-1">
                  <span className="bg-status-risk h-2 w-2 rounded-full" /> Egresos
                </span>
              </div>
            </div>
            <div className="grid grid-cols-6 gap-2 sm:gap-4">
              {series.map((s, i) => {
                const sinDatos = s.ingresos === 0 && s.egresos === 0;
                return (
                  <div
                    key={i}
                    className={cn('flex flex-col items-center', sinDatos && 'opacity-40')}
                  >
                    <div className="flex h-32 w-full items-end justify-center gap-1">
                      {sinDatos ? (
                        <div className="w-full self-center text-center text-[11px] text-slate-400">
                          sin datos
                        </div>
                      ) : (
                        <>
                          <div
                            className="bg-status-ok w-2.5 rounded-t transition-[height] duration-500 sm:w-4"
                            style={{ height: `${(s.ingresos / maxBar) * 100}%` }}
                            title={`Ingresos: ${ars.format(s.ingresos)}`}
                          />
                          <div
                            className="bg-status-risk w-2.5 rounded-t transition-[height] duration-500 sm:w-4"
                            style={{ height: `${(s.egresos / maxBar) * 100}%` }}
                            title={`Egresos: ${ars.format(s.egresos)}`}
                          />
                        </>
                      )}
                    </div>
                    <div className="mt-1.5 text-xs font-medium uppercase text-slate-500">
                      {s.mes}
                    </div>
                    {!sinDatos && (
                      <div
                        className={cn(
                          'text-xs font-bold',
                          s.saldo >= 0 ? 'text-status-ok-fg' : 'text-status-risk-fg',
                        )}
                      >
                        {s.saldo >= 0 ? '+' : '−'}
                        {arsCompact(Math.abs(s.saldo))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          {/* De dónde viene */}
          <Card>
            <CardContent className="p-5">
              <h3 className="mb-1 font-bold text-slate-900">
                <ArrowUpRight size={14} className="text-status-ok mr-1 inline" /> De dónde viene
              </h3>
              <p className="mb-3 text-xs text-slate-500">Ingresos de {mesActualNombre}</p>
              {ingresosComp.length === 0 ? (
                <p className="text-sm text-slate-500">Sin ingresos cargados este mes.</p>
              ) : (
                <ul className="space-y-2">
                  {ingresosComp.map(([label, monto]) => {
                    const pct = ingMes ? (monto / ingMes) * 100 : 0;
                    return (
                      <li key={label}>
                        <div className="mb-0.5 flex items-center justify-between text-xs">
                          <span className="font-medium text-slate-700">{label}</span>
                          <span className="font-mono font-bold text-slate-900">
                            {pct.toFixed(0)}%
                          </span>
                        </div>
                        <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                          <div className="bg-status-ok h-full" style={{ width: `${pct}%` }} />
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
              {dependenciaSubsidio > 0 && (
                <p className="mt-3 border-t border-slate-100 pt-2 text-xs text-slate-600">
                  <strong className="text-slate-900">{dependenciaSubsidio}%</strong> de los ingresos
                  son subsidios.{' '}
                  {dependenciaSubsidio >= 70
                    ? 'Alta dependencia — conviene diversificar.'
                    : 'Buena diversificación.'}
                </p>
              )}
            </CardContent>
          </Card>

          {/* A dónde va */}
          <Card>
            <CardContent className="p-5">
              <h3 className="mb-1 font-bold text-slate-900">
                <ArrowDownRight size={14} className="text-status-risk mr-1 inline" /> A dónde va
              </h3>
              <p className="mb-3 text-xs text-slate-500">Top egresos de {mesActualNombre}</p>
              <ul className="space-y-2">
                {topEgresos.map(([cat, monto], i) => {
                  const label =
                    CATEGORIA_EGRESO_LABEL[cat as keyof typeof CATEGORIA_EGRESO_LABEL] ?? cat;
                  const pct = egrMes ? (monto / egrMes) * 100 : 0;
                  return (
                    <li key={cat}>
                      <div className="mb-0.5 flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-700">
                          {i + 1}. {label}
                        </span>
                        <span className="font-mono font-bold text-slate-900">
                          {arsCompact(monto)}
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="bg-status-risk h-full transition-[width] duration-300"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </li>
                  );
                })}
              </ul>
            </CardContent>
          </Card>

          {/* Presupuesto */}
          <Card>
            <CardContent className="p-5">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-bold text-slate-900">
                  <Target size={14} className="text-brand-600 mr-1 inline" /> Presupuesto{' '}
                  {presupuesto?.anio ?? ''}
                </h3>
                <Button
                  intent="ghost"
                  size="sm"
                  onClick={() => router.push('/mando/finanzas/presupuesto')}
                >
                  Detalle <ArrowRight size={12} />
                </Button>
              </div>
              <div className="space-y-3">
                <div>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="text-slate-600">Ingresos ejecutados</span>
                    <span className="font-bold text-slate-900">{pctEjecIngresos.toFixed(0)}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="bg-status-ok h-full"
                      style={{ width: `${Math.min(100, pctEjecIngresos)}%` }}
                    />
                  </div>
                  <div className="mt-1 text-xs text-slate-500">
                    {arsCompact(ingresosYTD)} de {arsCompact(presupuesto?.totalIngresos ?? 0)}
                  </div>
                </div>
                <div>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="text-slate-600">Egresos ejecutados</span>
                    <span className="font-bold text-slate-900">{pctEjecEgresos.toFixed(0)}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={cn(
                        'h-full',
                        pctEjecEgresos > 100 ? 'bg-status-risk' : 'bg-status-warn',
                      )}
                      style={{ width: `${Math.min(100, pctEjecEgresos)}%` }}
                    />
                  </div>
                  <div className="mt-1 text-xs text-slate-500">
                    {arsCompact(egresosYTD)} de {arsCompact(presupuesto?.totalEgresos ?? 0)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          {/* Saldos por caja */}
          <Card>
            <CardContent className="p-5">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-bold text-slate-900">
                  <Landmark size={14} className="mr-1 inline" /> Saldos por cuenta
                </h3>
                <Button
                  intent="ghost"
                  size="sm"
                  onClick={() => router.push('/mando/finanzas/cajas')}
                >
                  Ver todas <ArrowRight size={12} />
                </Button>
              </div>
              <ul className="space-y-2">
                {cajas.map((c) => {
                  const pct = saldoTotal > 0 ? (c.saldoActual / saldoTotal) * 100 : 0;
                  return (
                    <li key={c.id} className="rounded-lg border border-slate-200 bg-white p-2.5">
                      <div className="flex items-center justify-between">
                        <div className="min-w-0">
                          <div className="truncate text-sm font-semibold text-slate-900">
                            {c.nombre}
                          </div>
                          {c.banco && (
                            <div className="truncate text-xs text-slate-500">{c.banco}</div>
                          )}
                        </div>
                        <div className="ml-2 shrink-0 text-right font-mono text-sm font-bold text-slate-900">
                          {ars.format(c.saldoActual)}
                        </div>
                      </div>
                      <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-slate-100">
                        <div className="bg-brand-500 h-full" style={{ width: `${pct}%` }} />
                      </div>
                    </li>
                  );
                })}
              </ul>
            </CardContent>
          </Card>

          {/* Cuotas sociales */}
          <Card>
            <CardContent className="p-5">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-bold text-slate-900">
                  <Users size={14} className="mr-1 inline" /> Cuotas sociales
                </h3>
                <Button
                  intent="ghost"
                  size="sm"
                  onClick={() => router.push('/mando/finanzas/cuotas')}
                >
                  Padrón <ArrowRight size={12} />
                </Button>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-status-ok-bg/40 rounded-lg p-2 text-center">
                  <div className="text-xl font-bold text-slate-900">{cuotasPagadas}</div>
                  <div className="text-xs text-slate-600">Pagas</div>
                </div>
                <div className="bg-status-warn-bg/40 rounded-lg p-2 text-center">
                  <div className="text-xl font-bold text-slate-900">
                    {cuotas.filter((c) => c.estado === 'pendiente').length}
                  </div>
                  <div className="text-xs text-slate-600">Pendientes</div>
                </div>
                <div className="bg-status-risk-bg/40 rounded-lg p-2 text-center">
                  <div className="text-xl font-bold text-slate-900">
                    {cuotas.filter((c) => c.estado === 'vencida').length}
                  </div>
                  <div className="text-xs text-slate-600">Vencidas</div>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2 text-xs">
                <span className="text-slate-600">Al día</span>
                <span className="font-bold text-slate-900">{cuotasAlDiaPct}%</span>
              </div>
              {recuperableCuotas > 0 && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600">Por cobrar</span>
                  <span className="font-bold text-slate-900">{ars.format(recuperableCuotas)}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Próximos vencimientos */}
          <Card>
            <CardContent className="p-5">
              <h3 className="mb-3 font-bold text-slate-900">
                <Calendar size={14} className="mr-1 inline" /> Próximos vencimientos
              </h3>
              <ul className="space-y-2 text-sm">
                {[...OBLIGACIONES]
                  .sort((a, b) => diasHasta(a.fecha) - diasHasta(b.fecha))
                  .map((v) => {
                    const dias = diasHasta(v.fecha);
                    const intent = dias <= 7 ? 'risk' : 'warn';
                    const bgClass =
                      intent === 'risk' ? 'bg-status-risk-bg/30' : 'bg-status-warn-bg/30';
                    return (
                      <li
                        key={v.titulo}
                        className={`${bgClass} flex items-start justify-between rounded-lg p-2`}
                      >
                        <div className="min-w-0">
                          <div className="font-semibold text-slate-900">{v.titulo}</div>
                          <div className="text-xs text-slate-600">{v.subtitulo}</div>
                        </div>
                        <Badge intent={intent}>
                          {dias < 0
                            ? `Hace ${Math.abs(dias)}d`
                            : dias === 0
                              ? 'Hoy'
                              : `En ${dias}d`}
                        </Badge>
                      </li>
                    );
                  })}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Últimos movimientos */}
        <Card>
          <CardContent className="p-5">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-bold text-slate-900">
                <Banknote size={14} className="mr-1 inline" /> Últimos movimientos
              </h3>
              <Button
                intent="ghost"
                size="sm"
                onClick={() => router.push('/mando/finanzas/movimientos')}
              >
                Ver todos <ArrowRight size={12} />
              </Button>
            </div>
            <div className="-mx-2 overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-2 py-1.5 text-left">Fecha</th>
                    <th className="px-2 py-1.5 text-left">Descripción</th>
                    <th className="px-2 py-1.5 text-left">Cuenta</th>
                    <th className="px-2 py-1.5 text-right">Monto</th>
                  </tr>
                </thead>
                <tbody>
                  {ultimos.map((m) => {
                    const caja = cajas.find((c) => c.id === m.cajaOrigenId);
                    return (
                      <tr key={m.id} className="border-t border-slate-100 hover:bg-slate-50">
                        <td className="px-2 py-2 text-xs text-slate-600">{fechaCorta(m.fecha)}</td>
                        <td className="px-2 py-2">
                          <div className="font-medium text-slate-900">{m.descripcion}</div>
                          {m.contraparte && (
                            <div className="text-xs text-slate-500">{m.contraparte}</div>
                          )}
                        </td>
                        <td className="px-2 py-2 text-xs text-slate-600">{caja?.nombre ?? '—'}</td>
                        <td className="px-2 py-2 text-right">
                          <span
                            className={cn(
                              'font-mono font-bold',
                              m.tipo === 'ingreso'
                                ? 'text-status-ok-fg'
                                : m.tipo === 'egreso'
                                  ? 'text-status-risk-fg'
                                  : 'text-slate-700',
                            )}
                          >
                            {m.tipo === 'ingreso' ? '+' : m.tipo === 'egreso' ? '−' : ''}
                            {ars.format(m.monto)}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      <NuevoMovimientoDialog open={openNuevo} onClose={() => setOpenNuevo(false)} />
    </>
  );
}
