'use client';

import {
  Avatar,
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
  AlertTriangle,
  BadgeDollarSign,
  Calendar,
  CheckCircle2,
  CreditCard,
  Mail,
  MessageSquare,
  Search,
  Send,
  Users,
} from 'lucide-react';
import { useMemo, useState } from 'react';

import { MEDIO_LABEL, ars, arsCompact, fechaCorta } from '../../../../../components/finanzas/utils';
import { EmptyState } from '../../../../../components/shared/empty-state';
import { PageHero } from '../../../../../components/shared/page-hero';
import { useFaroStore } from '../../../../../store/use-faro-store';

import type { CuotaSocial, MedioPago } from '@faro/types';

type FiltroEstado = 'todas' | 'pendiente' | 'pagada' | 'vencida' | 'condonada';

export default function CuotasPage() {
  const toast = useToast();
  const cuotas = useFaroStore((s) => s.cuotas);
  const cajas = useFaroStore((s) => s.cajas);
  const cobrarCuota = useFaroStore((s) => s.cobrarCuota);

  const [busqueda, setBusqueda] = useState('');
  const [estadoFiltro, setEstadoFiltro] = useState<FiltroEstado>('todas');
  const [periodoFiltro, setPeriodoFiltro] = useState<string>('todos');
  const [cobrando, setCobrando] = useState<CuotaSocial | null>(null);
  const [cobroMedio, setCobroMedio] = useState<MedioPago>('mercadopago');
  const [cobroCaja, setCobroCaja] = useState(cajas[0]?.id ?? '');
  const [openBatch, setOpenBatch] = useState(false);

  // Agrupar por socio (mostrar resumen)
  const sociosMap = useMemo(() => {
    const map = new Map<string, { id: string; nombre: string; cuotas: CuotaSocial[] }>();
    for (const c of cuotas) {
      if (!map.has(c.socioId)) {
        map.set(c.socioId, { id: c.socioId, nombre: c.socioNombre, cuotas: [] });
      }
      map.get(c.socioId)!.cuotas.push(c);
    }
    return map;
  }, [cuotas]);

  const periodos = useMemo(
    () =>
      Array.from(new Set(cuotas.map((c) => c.periodo)))
        .sort()
        .reverse(),
    [cuotas],
  );

  const cuotasFiltradas = useMemo(() => {
    let arr = [...cuotas];
    if (estadoFiltro !== 'todas') arr = arr.filter((c) => c.estado === estadoFiltro);
    if (periodoFiltro !== 'todos') arr = arr.filter((c) => c.periodo === periodoFiltro);
    if (busqueda.trim()) {
      const q = busqueda.toLowerCase();
      arr = arr.filter((c) => c.socioNombre.toLowerCase().includes(q));
    }
    return arr.sort(
      (a, b) => b.periodo.localeCompare(a.periodo) || a.socioNombre.localeCompare(b.socioNombre),
    );
  }, [cuotas, estadoFiltro, periodoFiltro, busqueda]);

  const stats = useMemo(() => {
    const t = cuotas.length;
    const pagadas = cuotas.filter((c) => c.estado === 'pagada').length;
    const pendientes = cuotas.filter((c) => c.estado === 'pendiente').length;
    const vencidas = cuotas.filter((c) => c.estado === 'vencida').length;
    const recuperable = cuotas
      .filter((c) => c.estado === 'pendiente' || c.estado === 'vencida')
      .reduce((s, c) => s + c.monto + (c.cargoRecargo ?? 0), 0);
    return {
      t,
      pagadas,
      pendientes,
      vencidas,
      recuperable,
      pctCobranza: t > 0 ? (pagadas / t) * 100 : 0,
    };
  }, [cuotas]);

  function handleCobrar() {
    if (!cobrando) return;
    cobrarCuota(cobrando.id, cobroMedio, cobroCaja);
    toast.push({
      kind: 'success',
      title: `Cuota cobrada · ${cobrando.socioNombre}`,
      description: `${ars.format(cobrando.monto + (cobrando.cargoRecargo ?? 0))} ingresado a ${cajas.find((c) => c.id === cobroCaja)?.nombre}`,
    });
    setCobrando(null);
  }

  function generarLinkBatch() {
    const pendientes = cuotas.filter((c) => c.estado === 'pendiente' || c.estado === 'vencida');
    toast.push({
      kind: 'success',
      title: 'Recordatorios enviados',
      description: `Avisamos a ${pendientes.length} socios por WhatsApp y mail con el link para pagar`,
    });
    setOpenBatch(false);
  }

  return (
    <>
      <div className="mx-auto max-w-7xl space-y-5">
        <PageHero
          objetivo="Vista Mando · Tesorería"
          titulo="Cuotas sociales"
          descripcion={`Padrón de ${sociosMap.size} socios contribuyentes. Cobranza por MercadoPago, transferencia o efectivo en cuartel.`}
          icono={<BadgeDollarSign size={26} />}
          variant={
            stats.vencidas > 0 ? 'critical' : stats.pctCobranza >= 85 ? 'success' : 'default'
          }
          meta={
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <Kpi
                label="Cobranza"
                value={`${stats.pctCobranza.toFixed(0)}%`}
                hint={`${stats.pagadas}/${stats.t}`}
                intent={stats.pctCobranza >= 85 ? 'ok' : 'warn'}
              />
              <Kpi
                label="Pendientes"
                value={stats.pendientes}
                intent={stats.pendientes > 0 ? 'warn' : 'ok'}
              />
              <Kpi
                label="Vencidas"
                value={stats.vencidas}
                intent={stats.vencidas > 0 ? 'risk' : 'ok'}
              />
              <Kpi label="Recuperable" value={arsCompact(stats.recuperable)} intent="warn" />
            </div>
          }
          acciones={
            <>
              <Button intent="ghost" size="sm" onClick={() => setOpenBatch(true)}>
                <Send size={12} /> Mandar recordatorio a todos
              </Button>
            </>
          }
        />

        {/* Filtros */}
        <Card>
          <CardContent className="flex flex-wrap items-center gap-2 p-3">
            <div className="relative min-w-[200px] flex-1">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <Input
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar socio..."
                className="pl-9"
              />
            </div>
            <select
              value={periodoFiltro}
              onChange={(e) => setPeriodoFiltro(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs"
            >
              <option value="todos">Todos los períodos</option>
              {periodos.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
            <div className="flex gap-1">
              {(['todas', 'pendiente', 'vencida', 'pagada'] as const).map((e) => (
                <button
                  key={e}
                  type="button"
                  onClick={() => setEstadoFiltro(e)}
                  className={cn(
                    'rounded-full px-2.5 py-1 text-xs font-medium',
                    estadoFiltro === e
                      ? 'bg-brand-600 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200',
                  )}
                >
                  {e === 'todas' ? 'Todas' : e}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {cuotasFiltradas.length === 0 ? (
          <Card>
            <CardContent>
              <EmptyState
                icon={<Users size={28} />}
                titulo="Sin cuotas"
                descripcion="No hay cuotas que coincidan con los filtros."
                inline
              />
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                    <tr>
                      <th className="px-3 py-2 text-left">Socio</th>
                      <th className="px-3 py-2 text-left">Período</th>
                      <th className="px-3 py-2 text-left">Vencimiento</th>
                      <th className="px-3 py-2 text-right">Monto</th>
                      <th className="px-3 py-2 text-center">Estado</th>
                      <th className="px-3 py-2 text-left">Pagado el</th>
                      <th className="px-3 py-2 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    <AnimatePresence>
                      {cuotasFiltradas.map((c) => (
                        <motion.tr
                          key={c.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="border-t border-slate-100 hover:bg-slate-50"
                        >
                          <td className="px-3 py-2">
                            <div className="flex items-center gap-2">
                              <Avatar name={c.socioNombre} size={28} />
                              <span className="font-medium text-slate-900">{c.socioNombre}</span>
                            </div>
                          </td>
                          <td className="px-3 py-2 font-mono text-xs">{c.periodo}</td>
                          <td className="px-3 py-2 text-xs text-slate-600">{c.vencimiento}</td>
                          <td className="px-3 py-2 text-right font-mono">
                            <div className="font-bold text-slate-900">{ars.format(c.monto)}</div>
                            {c.cargoRecargo && (
                              <div className="text-status-risk-fg text-xs">
                                + {ars.format(c.cargoRecargo)} recargo
                              </div>
                            )}
                          </td>
                          <td className="px-3 py-2 text-center">
                            <Badge
                              intent={
                                c.estado === 'pagada'
                                  ? 'ok'
                                  : c.estado === 'vencida'
                                    ? 'risk'
                                    : c.estado === 'pendiente'
                                      ? 'warn'
                                      : 'neutral'
                              }
                            >
                              {c.estado === 'pagada' && <CheckCircle2 size={11} />}
                              {c.estado === 'vencida' && <AlertTriangle size={11} />}
                              {c.estado === 'pendiente' && <Calendar size={11} />}
                              {c.estado}
                            </Badge>
                          </td>
                          <td className="px-3 py-2 text-xs text-slate-600">
                            {c.pagadoEn ? (
                              <div>
                                <div>{fechaCorta(c.pagadoEn)}</div>
                                {c.medio && (
                                  <div className="text-[10px] text-slate-500">
                                    {MEDIO_LABEL[c.medio]}
                                  </div>
                                )}
                              </div>
                            ) : (
                              '—'
                            )}
                          </td>
                          <td className="px-3 py-2 text-right">
                            {c.estado !== 'pagada' && c.estado !== 'condonada' && (
                              <div className="flex justify-end gap-1">
                                <Button
                                  intent="ghost"
                                  size="sm"
                                  aria-label="Recordatorio WhatsApp"
                                  onClick={() =>
                                    toast.push({
                                      kind: 'success',
                                      title: `Recordatorio enviado a ${c.socioNombre}`,
                                      description: 'Vía WhatsApp con link de pago MP',
                                    })
                                  }
                                >
                                  <MessageSquare size={14} />
                                </Button>
                                <Button intent="primary" size="sm" onClick={() => setCobrando(c)}>
                                  <CreditCard size={12} /> Cobrar
                                </Button>
                              </div>
                            )}
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="border-slate-200 bg-slate-50">
          <CardContent className="flex items-start gap-3 p-4 text-sm text-slate-600">
            <BadgeDollarSign size={18} className="mt-0.5 shrink-0 text-slate-400" />
            <div>
              <strong className="text-slate-900">¿Qué son las cuotas sociales?</strong> Es el aporte
              mensual de los socios que ayudan a sostener el cuartel (no son los bomberos activos).
              Al cobrar por MercadoPago se genera un link que podés mandar por WhatsApp o mail. Las
              cuotas vencidas suman un 10% de recargo.
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dialog cobrar */}
      <Dialog
        open={!!cobrando}
        onClose={() => setCobrando(null)}
        title="Registrar pago de cuota"
        description={
          cobrando
            ? `Cuota ${cobrando.periodo} de ${cobrando.socioNombre} · ${ars.format(cobrando.monto + (cobrando.cargoRecargo ?? 0))}`
            : ''
        }
        footer={
          <div className="flex justify-end gap-2">
            <Button intent="ghost" onClick={() => setCobrando(null)}>
              Cancelar
            </Button>
            <Button intent="primary" onClick={handleCobrar}>
              <CheckCircle2 size={14} /> Registrar pago
            </Button>
          </div>
        }
      >
        <div className="space-y-3">
          <div>
            <Label>¿Cómo pagó?</Label>
            <select
              value={cobroMedio}
              onChange={(e) => setCobroMedio(e.target.value as MedioPago)}
              className="focus:border-brand-400 mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2"
            >
              <option value="mercadopago">MercadoPago</option>
              <option value="efectivo">Efectivo</option>
              <option value="transferencia">Transferencia</option>
              <option value="tarjeta_debito">Tarjeta débito</option>
            </select>
          </div>
          <div>
            <Label>¿Dónde entra la plata?</Label>
            <select
              value={cobroCaja}
              onChange={(e) => setCobroCaja(e.target.value)}
              className="focus:border-brand-400 mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2"
            >
              {cajas.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </select>
          </div>
          {cobrando?.cargoRecargo && (
            <div className="bg-status-warn-bg text-status-warn-fg rounded-lg p-2 text-xs">
              ⚠ Cuota vencida · se le suma {ars.format(cobrando.cargoRecargo)} de recargo (total a
              cobrar: {ars.format(cobrando.monto + cobrando.cargoRecargo)})
            </div>
          )}
        </div>
      </Dialog>

      {/* Dialog cobranza batch */}
      <Dialog
        open={openBatch}
        onClose={() => setOpenBatch(false)}
        title="Avisar a todos los socios que deben"
        description={`Vas a mandar un recordatorio con link de pago a ${stats.pendientes + stats.vencidas} socios.`}
        footer={
          <div className="flex justify-end gap-2">
            <Button intent="ghost" onClick={() => setOpenBatch(false)}>
              Cancelar
            </Button>
            <Button intent="primary" onClick={generarLinkBatch}>
              <Send size={14} /> Mandar recordatorios
            </Button>
          </div>
        }
      >
        <div className="space-y-3 text-sm">
          <div className="bg-brand-50 border-brand-100 rounded-lg border p-3 text-xs">
            <strong className="text-brand-900">Vas a avisar a:</strong>
            <ul className="text-brand-800/80 mt-2 space-y-0.5">
              <li>· {stats.pendientes} socios con cuotas sin pagar</li>
              <li>· {stats.vencidas} socios con cuotas atrasadas (+10% de recargo)</li>
              <li>· Total a recuperar: {ars.format(stats.recuperable)}</li>
            </ul>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Card>
              <CardContent className="p-3 text-center">
                <MessageSquare size={20} className="text-status-ok-fg mx-auto" />
                <div className="mt-1 text-xs font-semibold text-slate-900">WhatsApp</div>
                <div className="text-xs text-slate-500">con link de pago</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 text-center">
                <Mail size={20} className="text-brand-600 mx-auto" />
                <div className="mt-1 text-xs font-semibold text-slate-900">Mail</div>
                <div className="text-xs text-slate-500">con link de pago</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </Dialog>
    </>
  );
}
