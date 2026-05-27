'use client';

import { Badge, Button, Card, CardContent, Kpi, cn, useToast } from '@faro/ui';
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Banknote,
  Calendar,
  Download,
  Landmark,
  PiggyBank,
  Plus,
  ShieldAlert,
  Target,
  Users,
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
import { demoToday } from '../../../../lib/utils/demo-today';
import { useFaroStore } from '../../../../store/use-faro-store';

const VENCIMIENTOS = [
  { titulo: 'Aportes patronales · junio', subtitulo: 'Cargas sociales mayo', fecha: '2026-06-15' },
  { titulo: 'VTV BV-2', subtitulo: 'Vence 12/06/2026', fecha: '2026-06-12' },
  { titulo: 'Ingresos Brutos', subtitulo: 'Vence 28/05/2026', fecha: '2026-05-28' },
];

function diasHasta(fechaIso: string): number {
  const f = new Date(fechaIso);
  const hoy = demoToday();
  return Math.round((f.getTime() - hoy.getTime()) / 86400000);
}

export default function FinanzasDashboardPage() {
  const router = useRouter();
  const toast = useToast();
  const movimientos = useFaroStore((s) => s.movimientos);
  const cajas = useFaroStore((s) => s.cajas);
  const cuentas = useFaroStore((s) => s.cuentas);
  const cuotas = useFaroStore((s) => s.cuotas);
  const presupuestos = useFaroStore((s) => s.presupuestos);
  const [openNuevo, setOpenNuevo] = useState(false);

  // KPIs del mes actual
  const mesActual = '2026-05';
  const mesAnterior = '2026-04';

  const movsConciliados = useMemo(
    () => movimientos.filter((m) => m.estado === 'conciliado'),
    [movimientos],
  );

  const ingMes = useMemo(
    () =>
      movsConciliados
        .filter((m) => m.tipo === 'ingreso' && m.fecha.startsWith(mesActual))
        .reduce((s, m) => s + m.monto, 0),
    [movsConciliados],
  );
  const egrMes = useMemo(
    () =>
      movsConciliados
        .filter((m) => m.tipo === 'egreso' && m.fecha.startsWith(mesActual))
        .reduce((s, m) => s + m.monto, 0),
    [movsConciliados],
  );
  const ingAnt = useMemo(
    () =>
      movsConciliados
        .filter((m) => m.tipo === 'ingreso' && m.fecha.startsWith(mesAnterior))
        .reduce((s, m) => s + m.monto, 0),
    [movsConciliados],
  );
  const egrAnt = useMemo(
    () =>
      movsConciliados
        .filter((m) => m.tipo === 'egreso' && m.fecha.startsWith(mesAnterior))
        .reduce((s, m) => s + m.monto, 0),
    [movsConciliados],
  );

  const saldoMes = ingMes - egrMes;
  const saldoTotal = cajas.reduce((s, c) => s + c.saldoActual, 0);
  const variacionIngresos = ingAnt > 0 ? ((ingMes - ingAnt) / ingAnt) * 100 : 0;
  const variacionEgresos = egrAnt > 0 ? ((egrMes - egrAnt) / egrAnt) * 100 : 0;

  // % personal rentado (Ley 25.054 obligatorio 70%)
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
  }, [movsConciliados, cuentas]);

  const subsidioMes = useMemo(() => {
    return movsConciliados
      .filter(
        (m) => m.tipo === 'ingreso' && m.fecha.startsWith(mesActual) && m.cuentaId === 'c-4-1-01',
      )
      .reduce((s, m) => s + m.monto, 0);
  }, [movsConciliados]);

  const pctPersonalRentado = subsidioMes > 0 ? (sueldosMes / subsidioMes) * 100 : 0;
  const cumple70 = pctPersonalRentado >= 70;

  // Gráfico de 6 meses
  const series = useMemo(() => agruparPorMes(movsConciliados, 6), [movsConciliados]);
  const maxBar = Math.max(...series.flatMap((s) => [s.ingresos, s.egresos]));

  // Top 5 categorías de egresos del mes
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
  }, [movsConciliados, cuentas]);

  // Cuotas vencidas
  const cuotasVencidas = useMemo(
    () => cuotas.filter((c) => c.estado === 'vencida' || c.estado === 'pendiente'),
    [cuotas],
  );

  // Borradores pendientes de conciliar
  const borradores = useMemo(
    () => movimientos.filter((m) => m.estado === 'borrador'),
    [movimientos],
  );

  // Presupuesto ejecutado YTD
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

  // Últimos 8 movimientos
  const ultimos = useMemo(
    () => [...movsConciliados].sort((a, b) => b.fecha.localeCompare(a.fecha)).slice(0, 8),
    [movsConciliados],
  );

  function exportarBalance() {
    toast.push({
      kind: 'info',
      title: 'Generando balance ejecutivo',
      description: 'Balance-Faro-2026-05.pdf · 18 páginas',
    });
  }

  return (
    <>
      <div className="mx-auto max-w-7xl space-y-5">
        <PageHero
          objetivo="Vista Mando · Tesorería"
          titulo="Finanzas · panel ejecutivo"
          descripcion="Resumen de entradas y salidas, saldos por cuenta, avance del presupuesto y aporte al personal pago."
          icono={<PiggyBank size={26} />}
          variant={
            !cumple70
              ? 'critical'
              : saldoMes < 0
                ? 'critical'
                : saldoMes > 0
                  ? 'success'
                  : 'default'
          }
          meta={
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <Kpi
                label="Ingresos mayo"
                value={arsCompact(ingMes)}
                intent="ok"
                hint={`${variacionIngresos >= 0 ? '+' : ''}${variacionIngresos.toFixed(0)}% vs abr`}
              />
              <Kpi
                label="Egresos mayo"
                value={arsCompact(egrMes)}
                intent="warn"
                hint={`${variacionEgresos >= 0 ? '+' : ''}${variacionEgresos.toFixed(0)}% vs abr`}
              />
              <Kpi
                label="Saldo mes"
                value={arsCompact(saldoMes)}
                intent={saldoMes >= 0 ? 'ok' : 'risk'}
              />
              <Kpi
                label="Saldo total"
                value={arsCompact(saldoTotal)}
                intent="ok"
                hint={`${cajas.length} cajas`}
              />
            </div>
          }
          acciones={
            <>
              <Button intent="ghost" size="sm" onClick={exportarBalance}>
                <Download size={12} /> Balance PDF
              </Button>
              <Button intent="primary" onClick={() => setOpenNuevo(true)}>
                <Plus size={14} /> Nuevo movimiento
              </Button>
            </>
          }
        />

        {/* Alerta Ley 25.054 si no cumple */}
        {!cumple70 && (
          <Card className="border-status-warn/40 bg-status-warn-bg/30 border-2">
            <CardContent className="flex items-start gap-3 p-4">
              <ShieldAlert size={20} className="text-status-warn-fg mt-0.5 shrink-0" />
              <div className="flex-1 text-sm">
                <strong className="text-status-warn-fg">
                  Estás usando {pctPersonalRentado.toFixed(0)}% del subsidio en sueldos (debe ser al
                  menos 70%)
                </strong>
                <p className="mt-0.5 text-slate-700">
                  Pagaste {ars.format(sueldosMes)} de sueldos sobre {ars.format(subsidioMes)} del
                  subsidio nacional. Te falta usar{' '}
                  {ars.format(Math.max(0, subsidioMes * 0.7 - sueldosMes))} más para cumplir el
                  mínimo.
                </p>
              </div>
              <Button intent="ghost" size="sm" onClick={() => router.push('/mando/rendicion')}>
                Ver rendición <ArrowRight size={12} />
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Borradores pendientes */}
        {borradores.length > 0 && (
          <Card className="border-brand-200 bg-brand-50 border">
            <CardContent className="flex items-start gap-3 p-4">
              <AlertTriangle size={18} className="text-brand-600 mt-0.5 shrink-0" />
              <div className="flex-1 text-sm">
                <strong className="text-brand-900">
                  Tenés {borradores.length} movimiento{borradores.length === 1 ? '' : 's'} sin
                  terminar
                </strong>
                <p className="text-brand-800/80 text-xs">
                  Falta confirmar la factura o el comprobante. Cerralos antes de fin de mes.
                </p>
              </div>
              <Button
                intent="ghost"
                size="sm"
                onClick={() => router.push('/mando/finanzas/movimientos?estado=borrador')}
              >
                Revisar <ArrowRight size={12} />
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Gráfico 6 meses */}
        <Card>
          <CardContent className="p-5">
            <div className="mb-4 flex items-end justify-between">
              <div>
                <h3 className="font-bold text-slate-900">Flujo últimos 6 meses</h3>
                <p className="text-xs text-slate-600">Ingresos · Egresos · Saldo neto mensual</p>
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
              {series.map((s, i) => (
                <div key={i} className="flex flex-col items-center">
                  <div className="flex h-32 w-full items-end justify-center gap-1">
                    <div
                      className="bg-status-ok w-2 rounded-t transition-[height] duration-300 sm:w-3"
                      style={{ height: `${(s.ingresos / maxBar) * 100}%` }}
                      title={`Ingresos: ${ars.format(s.ingresos)}`}
                    />
                    <div
                      className="bg-status-risk w-2 rounded-t transition-[height] duration-300 sm:w-3"
                      style={{ height: `${(s.egresos / maxBar) * 100}%` }}
                      title={`Egresos: ${ars.format(s.egresos)}`}
                    />
                  </div>
                  <div className="mt-1 text-xs font-medium uppercase text-slate-500">{s.mes}</div>
                  <div
                    className={cn(
                      'text-xs font-bold',
                      s.saldo >= 0 ? 'text-status-ok-fg' : 'text-status-risk-fg',
                    )}
                  >
                    {s.saldo >= 0 ? '+' : ''}
                    {arsCompact(s.saldo)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          {/* Saldos por caja */}
          <Card>
            <CardContent className="p-5">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-bold text-slate-900">
                  <Landmark size={14} className="mr-1 inline" /> Saldos por caja
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
                {cajas.map((c) => (
                  <li
                    key={c.id}
                    className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-2.5"
                  >
                    <div>
                      <div className="text-sm font-semibold text-slate-900">{c.nombre}</div>
                      {c.banco && <div className="text-xs text-slate-500">{c.banco}</div>}
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-sm font-bold text-slate-900">
                        {ars.format(c.saldoActual)}
                      </div>
                      {c.saldoConciliado !== c.saldoActual && (
                        <Badge intent="warn">
                          Δ {ars.format(c.saldoActual - (c.saldoConciliado ?? 0))}
                        </Badge>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Top 5 egresos */}
          <Card>
            <CardContent className="p-5">
              <h3 className="mb-3 font-bold text-slate-900">
                <ArrowDownRight size={14} className="mr-1 inline" /> Top 5 egresos · mayo
              </h3>
              <ul className="space-y-2">
                {topEgresos.map(([cat, monto], i) => {
                  const label =
                    CATEGORIA_EGRESO_LABEL[cat as keyof typeof CATEGORIA_EGRESO_LABEL] ?? cat;
                  const pct = (monto / egrMes) * 100;
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

          {/* Presupuesto ejecución */}
          <Card>
            <CardContent className="p-5">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-bold text-slate-900">
                  <Target size={14} className="mr-1 inline" /> Presupuesto 2026
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
          {/* Cuotas pendientes */}
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
                  <div className="text-xl font-bold text-slate-900">
                    {cuotas.filter((c) => c.estado === 'pagada').length}
                  </div>
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
              {cuotasVencidas.length > 0 && (
                <div className="mt-3 text-xs text-slate-600">
                  Recuperable:{' '}
                  <span className="font-bold text-slate-900">
                    {ars.format(
                      cuotasVencidas.reduce((s, c) => s + c.monto + (c.cargoRecargo ?? 0), 0),
                    )}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Ingresos del mes desglosados */}
          <Card>
            <CardContent className="p-5">
              <h3 className="mb-3 font-bold text-slate-900">
                <ArrowUpRight size={14} className="mr-1 inline" /> Composición ingresos · mayo
              </h3>
              <ul className="space-y-2">
                {Array.from(
                  new Set(
                    movsConciliados
                      .filter((m) => m.tipo === 'ingreso' && m.fecha.startsWith(mesActual))
                      .map((m) => m.cuentaId),
                  ),
                )
                  .map((cuentaId) => {
                    const cuenta = cuentas.find((c) => c.id === cuentaId);
                    if (!cuenta) return null;
                    const total = movsConciliados
                      .filter(
                        (m) =>
                          m.tipo === 'ingreso' &&
                          m.fecha.startsWith(mesActual) &&
                          m.cuentaId === cuentaId,
                      )
                      .reduce((s, m) => s + m.monto, 0);
                    const pct = (total / ingMes) * 100;
                    const label = cuenta.categoria
                      ? (CATEGORIA_INGRESO_LABEL[
                          cuenta.categoria as keyof typeof CATEGORIA_INGRESO_LABEL
                        ] ?? cuenta.nombre)
                      : cuenta.nombre;
                    return (
                      <li key={cuentaId}>
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
                  })
                  .filter(Boolean)}
              </ul>
            </CardContent>
          </Card>

          {/* Próximos vencimientos */}
          <Card>
            <CardContent className="p-5">
              <h3 className="mb-3 font-bold text-slate-900">
                <Calendar size={14} className="mr-1 inline" /> Próximos vencimientos
              </h3>
              <ul className="space-y-2 text-sm">
                {VENCIMIENTOS.map((v) => {
                  const dias = diasHasta(v.fecha);
                  const intent = dias <= 7 ? 'risk' : 'warn';
                  const bgClass =
                    intent === 'risk' ? 'bg-status-risk-bg/30' : 'bg-status-warn-bg/30';
                  return (
                    <li
                      key={v.titulo}
                      className={`${bgClass} flex items-start justify-between rounded-lg p-2`}
                    >
                      <div>
                        <div className="font-semibold text-slate-900">{v.titulo}</div>
                        <div className="text-xs text-slate-600">{v.subtitulo}</div>
                      </div>
                      <Badge intent={intent}>
                        {dias < 0
                          ? `Hace ${Math.abs(dias)} días`
                          : dias === 0
                            ? 'Hoy'
                            : `En ${dias} días`}
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
                    <th className="px-2 py-1.5 text-left">Caja</th>
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
