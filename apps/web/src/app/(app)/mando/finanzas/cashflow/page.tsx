'use client';

import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  PiggyBank,
  TrendingDown,
  Wrench,
} from 'lucide-react';
import { useMemo } from 'react';

import { Badge, Card, CardContent, Kpi, cn } from '@faro/ui';

import { PageHero } from '../../../../../components/shared/page-hero';
import { ars, arsCompact } from '../../../../../components/finanzas/utils';
import { calcularCashFlow } from '../../../../../lib/utils/cashflow';
import { useFaroStore } from '../../../../../store/use-faro-store';

export default function CashFlowPage() {
  const cajas = useFaroStore((s) => s.cajas);
  const movimientos = useFaroStore((s) => s.movimientos);
  const presupuestos = useFaroStore((s) => s.presupuestos);
  const cuentas = useFaroStore((s) => s.cuentas);

  const cf = useMemo(
    () => calcularCashFlow(cajas, movimientos, presupuestos[0], cuentas),
    [cajas, movimientos, presupuestos, cuentas],
  );

  const maxSaldo = Math.max(cf.saldoHoy, ...cf.proyeccion.map((p) => Math.abs(p.saldoFinal)), 1);
  const quiebre = cf.proyeccion.find((p) => p.negativo);

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <PageHero
        objetivo="Vista Mando · Tesorería"
        titulo="Flujo de fondos proyectado"
        descripcion="Con qué dinero contás de acá en adelante. Proyecta el saldo mes a mes según ingresos y egresos esperados, separando el gasto operativo de la inversión en bienes de uso."
        icono={<PiggyBank size={26} />}
        variant={cf.runwayMeses !== null ? 'critical' : 'success'}
        meta={
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Kpi label="Saldo hoy" value={arsCompact(cf.saldoHoy)} intent="brand" />
            <Kpi
              label="Neto mensual"
              value={arsCompact(cf.netoMensual)}
              intent={cf.netoMensual >= 0 ? 'ok' : 'risk'}
            />
            <Kpi
              label="Runway"
              value={cf.runwayMeses !== null ? `${cf.runwayMeses} meses` : '∞'}
              intent={cf.runwayMeses !== null && cf.runwayMeses <= 6 ? 'risk' : 'ok'}
            />
            <Kpi label="Inversión/mes" value={arsCompact(cf.inversionMensual)} intent="neutral" />
          </div>
        }
      />

      {/* Lectura accionable */}
      <Card
        className={cn(
          'border-2',
          cf.runwayMeses !== null
            ? 'border-status-risk/30 bg-status-risk-bg/20'
            : 'border-status-ok/30 bg-status-ok-bg/20',
        )}
      >
        <CardContent className="flex items-start gap-3 p-4">
          {cf.runwayMeses !== null ? (
            <TrendingDown size={22} className="text-status-risk-fg mt-0.5 shrink-0" />
          ) : (
            <ArrowUpRight size={22} className="text-status-ok-fg mt-0.5 shrink-0" />
          )}
          <div className="text-sm text-slate-700">
            {cf.runwayMeses !== null ? (
              <>
                A este ritmo gastás <strong>{ars.format(Math.abs(cf.netoMensual))}</strong> más de
                lo que entra por mes. Con el saldo actual te alcanza para{' '}
                <strong>~{cf.runwayMeses} meses</strong>
                {quiebre && (
                  <>
                    {' '}
                    — la proyección se vuelve negativa en <strong>{quiebre.label}</strong>
                  </>
                )}
                . Conviene revisar gastos o postergar inversiones.
              </>
            ) : (
              <>
                El flujo es positivo: sumás <strong>{ars.format(cf.netoMensual)}</strong> por mes.
                Hay margen para planificar inversiones.
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Composición mensual */}
      <Card>
        <CardContent className="p-4">
          <h3 className="mb-3 font-bold text-slate-900">Movimiento mensual esperado</h3>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-status-ok-bg/40 rounded-xl p-3">
              <div className="text-status-ok-fg inline-flex items-center gap-1 text-xs font-medium">
                <ArrowUpRight size={12} /> Ingresos
              </div>
              <div className="text-status-ok-fg mt-1 font-bold">
                {arsCompact(cf.ingresoMensual)}
              </div>
            </div>
            <div className="bg-status-warn-bg/40 rounded-xl p-3">
              <div className="text-status-warn-fg inline-flex items-center gap-1 text-xs font-medium">
                <ArrowDownRight size={12} /> Gasto
              </div>
              <div className="text-status-warn-fg mt-1 font-bold">
                {arsCompact(cf.gastoMensual)}
              </div>
            </div>
            <div className="bg-brand-50 rounded-xl p-3">
              <div className="text-brand-700 inline-flex items-center gap-1 text-xs font-medium">
                <Wrench size={12} /> Inversión
              </div>
              <div className="text-brand-700 mt-1 font-bold">{arsCompact(cf.inversionMensual)}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Proyección mes a mes */}
      <div className="space-y-2">
        <h3 className="px-1 text-sm font-bold uppercase tracking-wide text-slate-700">
          Proyección de saldo
        </h3>
        {cf.proyeccion.map((p) => {
          const pct = Math.round((Math.abs(p.saldoFinal) / maxSaldo) * 100);
          return (
            <Card key={p.mes} className={cn(p.negativo && 'border-status-risk/40')}>
              <CardContent className="p-3.5">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900">{p.label}</span>
                    {p.negativo && (
                      <Badge intent="risk">
                        <AlertTriangle size={11} /> En rojo
                      </Badge>
                    )}
                  </div>
                  <div
                    className={cn(
                      'text-lg font-bold tabular-nums',
                      p.negativo ? 'text-status-risk-fg' : 'text-slate-900',
                    )}
                  >
                    {ars.format(p.saldoFinal)}
                  </div>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={cn(
                      'h-full rounded-full',
                      p.negativo ? 'bg-status-risk' : 'bg-brand-500',
                    )}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="mt-1.5 flex flex-wrap gap-x-3 text-[11px] text-slate-500">
                  <span className="text-status-ok-fg">+{arsCompact(p.ingresos)} ingresos</span>
                  <span className="text-status-warn-fg">−{arsCompact(p.gasto)} gasto</span>
                  {p.inversion > 0 && (
                    <span className="text-brand-700">−{arsCompact(p.inversion)} inversión</span>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
