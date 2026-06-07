'use client';

import {
  Badge,
  Button,
  Card,
  CardContent,
  Dialog,
  Input,
  Kpi,
  Label,
  cn,
  useToast,
} from '@faro/ui';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowLeftRight,
  Banknote,
  CheckCircle2,
  ClipboardCopy,
  Copy,
  CreditCard,
  Landmark,
  Plus,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import { useMemo, useState } from 'react';

import { NuevaCajaDialog } from '../../../../../components/finanzas/nueva-caja-dialog';
import {
  TIPO_CAJA_LABEL,
  ars,
  arsCompact,
  fechaCorta,
} from '../../../../../components/finanzas/utils';
import { PageHero } from '../../../../../components/shared/page-hero';
import { demoToday } from '../../../../../lib/utils/demo-today';
import { selectCuartelActivo, useFaroStore } from '../../../../../store/use-faro-store';

import type { Caja, TipoCaja } from '@faro/types';

const TIPO_ICON: Record<TipoCaja, React.ReactNode> = {
  caja_chica: <Banknote size={20} />,
  caja_principal: <Wallet size={20} />,
  banco_cc: <Landmark size={20} />,
  banco_ca: <Landmark size={20} />,
  mercadopago: <CreditCard size={20} />,
  plazo_fijo: <TrendingUp size={20} />,
};

const TIPO_COLOR: Record<TipoCaja, string> = {
  caja_chica: 'from-amber-500 to-amber-600',
  caja_principal: 'from-emerald-500 to-emerald-600',
  banco_cc: 'from-brand-500 to-brand-700',
  banco_ca: 'from-brand-500 to-brand-700',
  mercadopago: 'from-sky-500 to-blue-600',
  plazo_fijo: 'from-purple-500 to-purple-700',
};

// Color sólido para la barra de distribución "¿dónde está la plata?"
const TIPO_BAR: Record<TipoCaja, string> = {
  caja_chica: 'bg-amber-500',
  caja_principal: 'bg-emerald-500',
  banco_cc: 'bg-brand-600',
  banco_ca: 'bg-brand-600',
  mercadopago: 'bg-sky-500',
  plazo_fijo: 'bg-purple-500',
};

function diasDesde(fechaIso?: string): number | null {
  if (!fechaIso) return null;
  return Math.round((demoToday().getTime() - new Date(fechaIso).getTime()) / 86400000);
}

export default function CajasPage() {
  const toast = useToast();
  const cuartel = useFaroStore(selectCuartelActivo);
  const cajas = useFaroStore((s) => s.cajas);
  const movimientos = useFaroStore((s) => s.movimientos);
  const transferirEntreCajas = useFaroStore((s) => s.transferirEntreCajas);
  const actualizarCaja = useFaroStore((s) => s.actualizarCaja);
  const [openNueva, setOpenNueva] = useState(false);
  const [openTransfer, setOpenTransfer] = useState(false);
  const [cajaSel, setCajaSel] = useState<Caja | null>(null);

  // Form transferencia
  const [transOrigen, setTransOrigen] = useState(cajas[0]?.id ?? '');
  const [transDestino, setTransDestino] = useState(cajas[1]?.id ?? '');
  const [transMonto, setTransMonto] = useState('');
  const [transDescripcion, setTransDescripcion] = useState('');
  const [errTrans, setErrTrans] = useState<Record<string, string>>({});

  const saldoTotal = useMemo(() => cajas.reduce((s, c) => s + c.saldoActual, 0), [cajas]);
  const cajasOk = cajas.filter(
    (c) => c.saldoActual === (c.saldoConciliado ?? c.saldoActual),
  ).length;
  const conDif = cajas.filter((c) => c.saldoActual !== (c.saldoConciliado ?? c.saldoActual)).length;
  const cajasOrden = useMemo(
    () => [...cajas].sort((a, b) => b.saldoActual - a.saldoActual),
    [cajas],
  );

  // Últimos movimientos de la caja seleccionada
  const movsCaja = useMemo(() => {
    if (!cajaSel) return [];
    return movimientos
      .filter((m) => m.cajaOrigenId === cajaSel.id || m.cajaDestinoId === cajaSel.id)
      .sort((a, b) => b.fecha.localeCompare(a.fecha))
      .slice(0, 15);
  }, [movimientos, cajaSel]);

  function copiar(texto: string, label: string) {
    void navigator.clipboard.writeText(texto);
    toast.push({ kind: 'success', title: `${label} copiado` });
  }

  function transferir() {
    const e: Record<string, string> = {};
    const m = Number(transMonto);
    if (!transMonto || isNaN(m) || m <= 0) e.monto = 'Monto debe ser > 0';
    if (transOrigen === transDestino) e.destino = 'Origen y destino deben ser distintos';
    const cajaO = cajas.find((c) => c.id === transOrigen);
    if (cajaO && m > cajaO.saldoActual) e.monto = 'Saldo insuficiente en caja origen';
    if (Object.keys(e).length > 0) {
      setErrTrans(e);
      toast.push({ kind: 'warn', title: 'Revisá el formulario', description: Object.values(e)[0] });
      return;
    }
    transferirEntreCajas(transOrigen, transDestino, m, transDescripcion.trim());
    toast.push({
      kind: 'success',
      title: 'Transferencia interna registrada',
      description: `${ars.format(m)} movidos entre cajas`,
    });
    setOpenTransfer(false);
    setTransMonto('');
    setTransDescripcion('');
    setErrTrans({});
  }

  function conciliar(caja: Caja) {
    // Marca el saldo conciliado igual al actual
    actualizarCaja(caja.id, {
      saldoConciliado: caja.saldoActual,
      fechaUltimaConciliacion: demoToday().toISOString().slice(0, 10),
    });
    toast.push({
      kind: 'success',
      title: `${caja.nombre} verificada`,
      description: 'El saldo del sistema coincide con el saldo real',
    });
  }

  return (
    <>
      <div className="mx-auto max-w-7xl space-y-5">
        <PageHero
          objetivo={`Tesorería · ${cuartel?.nombre ?? 'Cuartel'}`}
          titulo="Cuentas y cajas"
          descripcion="Saldos al día de cajas, cuentas del banco y billeteras virtuales. Compará con el resumen del banco para que cierre."
          icono={<Landmark size={26} />}
          meta={
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <Kpi label="Saldo total" value={arsCompact(saldoTotal)} intent="ok" />
              <Kpi label="Cuentas" value={cajas.length} intent="neutral" />
              <Kpi
                label="Al día"
                value={cajasOk}
                intent={cajasOk === cajas.length ? 'ok' : 'warn'}
              />
              <Kpi label="Con diferencia" value={conDif} intent={conDif > 0 ? 'warn' : 'ok'} />
            </div>
          }
          acciones={
            <>
              <Button intent="ghost" size="sm" onClick={() => setOpenTransfer(true)}>
                <ArrowLeftRight size={12} /> Transferir
              </Button>
              <Button intent="primary" onClick={() => setOpenNueva(true)}>
                <Plus size={14} /> Nueva cuenta
              </Button>
            </>
          }
        />

        {/* ¿Dónde está la plata? — distribución entre cuentas */}
        {saldoTotal > 0 && cajas.length > 1 && (
          <Card>
            <CardContent className="p-5">
              <div className="mb-3">
                <h3 className="font-bold text-slate-900">¿Dónde está la plata?</h3>
                <p className="text-xs text-slate-600">
                  Cómo se reparten los {ars.format(saldoTotal)} entre las cuentas
                </p>
              </div>
              <div className="flex h-7 overflow-hidden rounded-lg">
                {cajasOrden.map((c) => {
                  const pct = (c.saldoActual / saldoTotal) * 100;
                  if (pct <= 0) return null;
                  return (
                    <div
                      key={c.id}
                      className={cn(
                        'grid place-items-center text-[11px] font-bold text-white',
                        TIPO_BAR[c.tipo],
                      )}
                      style={{ width: `${pct}%` }}
                      title={`${c.nombre}: ${ars.format(c.saldoActual)} (${pct.toFixed(0)}%)`}
                    >
                      {pct >= 8 ? `${pct.toFixed(0)}%` : ''}
                    </div>
                  );
                })}
              </div>
              <div className="mt-3 grid gap-x-4 gap-y-1.5 sm:grid-cols-2">
                {cajasOrden.map((c) => {
                  const pct = (c.saldoActual / saldoTotal) * 100;
                  return (
                    <div key={c.id} className="flex items-center gap-2 text-sm">
                      <span className={cn('h-2.5 w-2.5 shrink-0 rounded-sm', TIPO_BAR[c.tipo])} />
                      <span className="min-w-0 flex-1 truncate text-slate-700">{c.nombre}</span>
                      <span className="font-mono text-xs font-bold text-slate-900">
                        {ars.format(c.saldoActual)}
                      </span>
                      <span className="w-10 text-right text-xs tabular-nums text-slate-500">
                        {pct.toFixed(0)}%
                      </span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Grid cajas */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-2">
          {cajas.map((c) => {
            const dif = c.saldoActual - (c.saldoConciliado ?? c.saldoActual);
            return (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="focus-visible:outline-brand-600 cursor-pointer rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                onClick={() => setCajaSel(c)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setCajaSel(c);
                  }
                }}
                role="button"
                tabIndex={0}
                aria-label={`Ver detalle de caja ${c.nombre}`}
              >
                <Card className="overflow-hidden transition-all hover:-translate-y-0.5 hover:shadow-lg">
                  <div className={cn('bg-gradient-to-br p-5 text-white', TIPO_COLOR[c.tipo])}>
                    <div className="flex items-start justify-between">
                      <div className="grid h-12 w-12 place-items-center rounded-xl bg-white/20 backdrop-blur">
                        {TIPO_ICON[c.tipo]}
                      </div>
                      <Badge intent={c.activa ? 'ok' : 'neutral'}>
                        {c.activa ? 'Activa' : 'Inactiva'}
                      </Badge>
                    </div>
                    <div className="mt-3">
                      <div className="text-xs opacity-80">{TIPO_CAJA_LABEL[c.tipo]}</div>
                      <div className="text-lg font-bold">{c.nombre}</div>
                      {c.banco && <div className="text-sm opacity-90">{c.banco}</div>}
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <div className="flex items-end justify-between">
                      <div>
                        <div className="text-xs uppercase text-slate-500">Saldo actual</div>
                        <div className="font-mono text-2xl font-bold text-slate-900">
                          {ars.format(c.saldoActual)}
                        </div>
                      </div>
                      {dif !== 0 && <Badge intent="warn">Δ {ars.format(dif)}</Badge>}
                    </div>
                    {(() => {
                      const d = diasDesde(c.fechaUltimaConciliacion);
                      const stale = d !== null && d > 30;
                      return (
                        <div
                          className={cn(
                            'mt-2 text-xs',
                            stale ? 'text-status-warn-fg font-medium' : 'text-slate-500',
                          )}
                        >
                          {d === null
                            ? 'Sin verificar contra el banco todavía'
                            : `Verificado ${d === 0 ? 'hoy' : `hace ${d} día${d === 1 ? '' : 's'}`}`}
                          {dif === 0 && d !== null && ' · coincide con el banco'}
                          {stale && ' · conviene revisar'}
                        </div>
                      );
                    })()}
                    {(c.cbu || c.alias) && (
                      <div className="mt-3 space-y-1 border-t border-slate-100 pt-2 text-xs">
                        {c.cbu && (
                          <div className="flex items-center gap-1.5">
                            <span className="text-slate-500">CBU</span>
                            <span className="font-mono font-bold text-slate-900">{c.cbu}</span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                copiar(c.cbu!, 'CBU');
                              }}
                              className="hover:text-brand-600 text-slate-500"
                            >
                              <Copy size={11} />
                            </button>
                          </div>
                        )}
                        {c.alias && (
                          <div className="flex items-center gap-1.5">
                            <span className="text-slate-500">Alias</span>
                            <span className="font-mono font-bold text-slate-900">{c.alias}</span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                copiar(c.alias!, 'Alias');
                              }}
                              className="hover:text-brand-600 text-slate-500"
                            >
                              <Copy size={11} />
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                    {dif !== 0 && (
                      <Button
                        intent="ghost"
                        size="sm"
                        fullWidth
                        className="mt-3"
                        onClick={(e) => {
                          e.stopPropagation();
                          conciliar(c);
                        }}
                      >
                        <CheckCircle2 size={12} /> Marcar como verificada
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        <Card className="border-slate-200 bg-slate-50">
          <CardContent className="flex items-start gap-3 p-4 text-sm text-slate-600">
            <ClipboardCopy size={18} className="mt-0.5 shrink-0 text-slate-500" />
            <div>
              <strong className="text-slate-900">¿Para qué sirve esto?</strong> Mostramos lo que
              tendría que haber en cada cuenta según los movimientos cargados. Cada mes compará con
              el resumen del banco. Si hay diferencia, cargá lo que falte hasta que coincida.
            </div>
          </CardContent>
        </Card>
      </div>

      <NuevaCajaDialog open={openNueva} onClose={() => setOpenNueva(false)} />

      {/* Dialog detalle caja */}
      <Dialog
        open={!!cajaSel}
        onClose={() => setCajaSel(null)}
        title={cajaSel?.nombre ?? ''}
        description={
          cajaSel
            ? `${TIPO_CAJA_LABEL[cajaSel.tipo]} · saldo ${ars.format(cajaSel.saldoActual)}`
            : ''
        }
      >
        <AnimatePresence>
          {cajaSel && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
              <h4 className="text-sm font-semibold text-slate-900">
                Últimos {movsCaja.length} movimientos
              </h4>
              <ul className="max-h-72 space-y-1.5 overflow-y-auto">
                {movsCaja.map((m) => {
                  const esIngreso =
                    m.tipo === 'ingreso' ||
                    (m.tipo === 'transferencia' && m.cajaDestinoId === cajaSel.id);
                  return (
                    <li
                      key={m.id}
                      className={cn(
                        'flex items-center justify-between rounded-lg p-2 text-xs',
                        esIngreso ? 'bg-status-ok-bg/30' : 'bg-status-risk-bg/30',
                      )}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="truncate font-medium text-slate-900">{m.descripcion}</div>
                        <div className="text-slate-500">{fechaCorta(m.fecha)}</div>
                      </div>
                      <span
                        className={cn(
                          'font-mono font-bold',
                          esIngreso ? 'text-status-ok-fg' : 'text-status-risk-fg',
                        )}
                      >
                        {esIngreso ? '+' : '−'}
                        {ars.format(m.monto)}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </Dialog>

      {/* Dialog transferencia */}
      <Dialog
        open={openTransfer}
        onClose={() => setOpenTransfer(false)}
        title="Pasar plata entre cuentas"
        description="Movés dinero de una caja o cuenta a otra. No es una entrada ni una salida del cuartel, solo un cambio de lugar."
        footer={
          <div className="flex justify-end gap-2">
            <Button intent="ghost" onClick={() => setOpenTransfer(false)}>
              Cancelar
            </Button>
            <Button intent="primary" onClick={transferir}>
              <ArrowLeftRight size={14} /> Pasar plata
            </Button>
          </div>
        }
      >
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Desde *</Label>
              <select
                value={transOrigen}
                onChange={(e) => setTransOrigen(e.target.value)}
                className="focus:border-brand-400 mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2"
              >
                {cajas.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre} ({ars.format(c.saldoActual)})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label>Hacia *</Label>
              <select
                value={transDestino}
                onChange={(e) => setTransDestino(e.target.value)}
                className="focus:border-brand-400 mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2"
                aria-invalid={!!errTrans.destino}
              >
                {cajas.map((c) => (
                  <option key={c.id} value={c.id} disabled={c.id === transOrigen}>
                    {c.nombre}
                  </option>
                ))}
              </select>
              {errTrans.destino && (
                <p className="text-status-risk-fg mt-1 text-xs font-medium">{errTrans.destino}</p>
              )}
            </div>
          </div>
          <div>
            <Label>Monto *</Label>
            <Input
              type="number"
              value={transMonto}
              onChange={(e) => setTransMonto(e.target.value)}
              placeholder="50000"
              aria-invalid={!!errTrans.monto}
            />
            {errTrans.monto && (
              <p className="text-status-risk-fg mt-1 text-xs font-medium">{errTrans.monto}</p>
            )}
          </div>
          <div>
            <Label>Descripción</Label>
            <Input
              value={transDescripcion}
              onChange={(e) => setTransDescripcion(e.target.value)}
              placeholder="Ej: Saqué plata del banco para la caja chica"
            />
          </div>
        </div>
      </Dialog>
    </>
  );
}
