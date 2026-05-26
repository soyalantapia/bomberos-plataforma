'use client';

import { Badge, Button, Card, CardContent, Input, Kpi, cn, useToast } from '@faro/ui';
import {
  ArrowDownRight,
  ArrowLeftRight,
  ArrowUpRight,
  Ban,
  BookOpen,
  CheckCircle2,
  Download,
  Filter,
  Plus,
  Search,
  X,
} from 'lucide-react';
import { useMemo, useState } from 'react';

import { NuevoMovimientoDialog } from '../../../../../components/finanzas/nuevo-movimiento-dialog';
import { MEDIO_LABEL, ars, arsCompact, fechaCorta } from '../../../../../components/finanzas/utils';
import { ConfirmDialog } from '../../../../../components/shared/confirm-dialog';
import { EmptyState } from '../../../../../components/shared/empty-state';
import { PageHero } from '../../../../../components/shared/page-hero';
import { useFaroStore } from '../../../../../store/use-faro-store';

import type { MovimientoFinanciero } from '@faro/types';

type FiltroTipo = 'todos' | 'ingreso' | 'egreso' | 'transferencia';
type FiltroEstado = 'todos' | 'borrador' | 'conciliado' | 'anulado';

export default function MovimientosPage() {
  const toast = useToast();
  const movimientos = useFaroStore((s) => s.movimientos);
  const cuentas = useFaroStore((s) => s.cuentas);
  const cajas = useFaroStore((s) => s.cajas);
  // Maps para O(1) lookups (evitar .find() por cada fila)
  const cuentaMap = useMemo(() => new Map(cuentas.map((c) => [c.id, c])), [cuentas]);
  const cajaMap = useMemo(() => new Map(cajas.map((c) => [c.id, c])), [cajas]);
  const conciliarMovimiento = useFaroStore((s) => s.conciliarMovimiento);
  const anularMovimiento = useFaroStore((s) => s.anularMovimiento);

  const [openNuevo, setOpenNuevo] = useState(false);
  const [tipoFiltro, setTipoFiltro] = useState<FiltroTipo>('todos');
  const [estadoFiltro, setEstadoFiltro] = useState<FiltroEstado>('todos');
  const [cuentaFiltro, setCuentaFiltro] = useState<string>('todas');
  const [cajaFiltro, setCajaFiltro] = useState<string>('todas');
  const [busqueda, setBusqueda] = useState('');
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');
  const [confirmAnular, setConfirmAnular] = useState<MovimientoFinanciero | null>(null);
  const [motivoAnular, setMotivoAnular] = useState('');

  const filtrados = useMemo(() => {
    let arr = [...movimientos];
    if (tipoFiltro !== 'todos') arr = arr.filter((m) => m.tipo === tipoFiltro);
    if (estadoFiltro !== 'todos') arr = arr.filter((m) => m.estado === estadoFiltro);
    if (cuentaFiltro !== 'todas') arr = arr.filter((m) => m.cuentaId === cuentaFiltro);
    if (cajaFiltro !== 'todas') arr = arr.filter((m) => m.cajaOrigenId === cajaFiltro);
    if (desde) arr = arr.filter((m) => m.fecha >= desde);
    if (hasta) arr = arr.filter((m) => m.fecha <= `${hasta}T23:59:59`);
    if (busqueda.trim()) {
      const q = busqueda.toLowerCase();
      arr = arr.filter(
        (m) =>
          m.descripcion.toLowerCase().includes(q) ||
          m.contraparte?.toLowerCase().includes(q) ||
          m.comprobanteNumero?.toLowerCase().includes(q) ||
          m.cuitContraparte?.includes(q),
      );
    }
    return arr.sort((a, b) => b.fecha.localeCompare(a.fecha));
  }, [movimientos, tipoFiltro, estadoFiltro, cuentaFiltro, cajaFiltro, desde, hasta, busqueda]);

  const totalIngresos = filtrados
    .filter((m) => m.tipo === 'ingreso' && m.estado === 'conciliado')
    .reduce((s, m) => s + m.monto, 0);
  const totalEgresos = filtrados
    .filter((m) => m.tipo === 'egreso' && m.estado === 'conciliado')
    .reduce((s, m) => s + m.monto, 0);
  const saldo = totalIngresos - totalEgresos;

  const hayFiltros =
    tipoFiltro !== 'todos' ||
    estadoFiltro !== 'todos' ||
    cuentaFiltro !== 'todas' ||
    cajaFiltro !== 'todas' ||
    desde ||
    hasta ||
    busqueda.trim();

  function limpiarFiltros() {
    setTipoFiltro('todos');
    setEstadoFiltro('todos');
    setCuentaFiltro('todas');
    setCajaFiltro('todas');
    setDesde('');
    setHasta('');
    setBusqueda('');
  }

  function exportar() {
    toast.push({
      kind: 'info',
      title: 'Descargando lista de movimientos',
      description: `Libro-Diario-${filtrados.length}-mov.xlsx`,
    });
  }

  function handleConciliar(id: string) {
    conciliarMovimiento(id);
    toast.push({
      kind: 'success',
      title: 'Movimiento confirmado',
      description: 'Pasó de borrador a definitivo',
    });
  }

  function handleAnular() {
    if (!confirmAnular) return;
    if (motivoAnular.trim().length < 8) {
      toast.push({
        kind: 'warn',
        title: 'Motivo muy corto',
        description: 'Escribí al menos 8 caracteres',
      });
      return;
    }
    anularMovimiento(confirmAnular.id, motivoAnular.trim());
    toast.push({
      kind: 'warn',
      title: 'Movimiento anulado',
      description: 'El saldo de la cuenta se ajustó automáticamente.',
    });
    setConfirmAnular(null);
    setMotivoAnular('');
  }

  return (
    <>
      <div className="mx-auto max-w-7xl space-y-5">
        <PageHero
          objetivo="Vista Mando · Tesorería"
          titulo="Movimientos"
          descripcion="Todas las entradas y salidas del cuartel. Filtrá por tipo, estado, categoría o cuenta."
          icono={<BookOpen size={26} />}
          meta={
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <Kpi label="Movimientos" value={filtrados.length} intent="neutral" />
              <Kpi label="Ingresos" value={arsCompact(totalIngresos)} intent="ok" />
              <Kpi label="Egresos" value={arsCompact(totalEgresos)} intent="warn" />
              <Kpi label="Saldo" value={arsCompact(saldo)} intent={saldo >= 0 ? 'ok' : 'risk'} />
            </div>
          }
          acciones={
            <>
              <Button intent="ghost" size="sm" onClick={exportar}>
                <Download size={12} /> Exportar
              </Button>
              <Button intent="primary" onClick={() => setOpenNuevo(true)}>
                <Plus size={14} /> Nuevo movimiento
              </Button>
            </>
          }
        />

        {/* Filtros */}
        <Card>
          <CardContent className="space-y-3 p-4">
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative min-w-[200px] flex-1">
                <Search
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <Input
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  placeholder="Buscar por descripción, contraparte, CUIT o nº comprobante"
                  className="pl-9"
                />
              </div>
              {hayFiltros && (
                <Button intent="ghost" size="sm" onClick={limpiarFiltros}>
                  <X size={12} /> Limpiar
                </Button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
              {/* Tipo */}
              <div className="flex flex-wrap gap-1">
                {(['todos', 'ingreso', 'egreso', 'transferencia'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTipoFiltro(t)}
                    className={cn(
                      'rounded-full px-2.5 py-1 text-xs font-medium',
                      tipoFiltro === t
                        ? 'bg-brand-600 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200',
                    )}
                  >
                    {t === 'todos' ? 'Todos' : t === 'ingreso' ? '↑' : t === 'egreso' ? '↓' : '⇄'}{' '}
                    {t !== 'todos' && t}
                  </button>
                ))}
              </div>

              <select
                value={estadoFiltro}
                onChange={(e) => setEstadoFiltro(e.target.value as FiltroEstado)}
                className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs"
              >
                <option value="todos">Todos los estados</option>
                <option value="conciliado">Confirmados</option>
                <option value="borrador">Borradores</option>
                <option value="anulado">Anulados</option>
              </select>

              <select
                value={cuentaFiltro}
                onChange={(e) => setCuentaFiltro(e.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs"
              >
                <option value="todas">Todas las categorías</option>
                {cuentas
                  .filter((c) => c.operable)
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.codigo} · {c.nombre}
                    </option>
                  ))}
              </select>

              <select
                value={cajaFiltro}
                onChange={(e) => setCajaFiltro(e.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs"
              >
                <option value="todas">Todas las cuentas</option>
                {cajas.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
              </select>

              <Input
                type="date"
                value={desde}
                onChange={(e) => setDesde(e.target.value)}
                placeholder="Desde"
                className="text-xs"
              />
              <Input
                type="date"
                value={hasta}
                onChange={(e) => setHasta(e.target.value)}
                placeholder="Hasta"
                className="text-xs"
              />
            </div>
          </CardContent>
        </Card>

        {/* Lista movimientos */}
        {filtrados.length === 0 ? (
          <Card>
            <CardContent>
              <EmptyState
                icon={<Filter size={28} />}
                titulo="Sin resultados"
                descripcion={
                  hayFiltros
                    ? 'No hay movimientos que coincidan con los filtros aplicados.'
                    : 'No hay movimientos cargados todavía.'
                }
                inline
                accion={{
                  label: hayFiltros ? 'Limpiar filtros' : 'Nuevo movimiento',
                  onClick: hayFiltros ? limpiarFiltros : () => setOpenNuevo(true),
                  icon: <Plus size={14} />,
                }}
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
                      <th className="px-3 py-2 text-left">Fecha</th>
                      <th className="px-3 py-2 text-left">Descripción</th>
                      <th className="px-3 py-2 text-left">Cuenta</th>
                      <th className="px-3 py-2 text-left">Caja</th>
                      <th className="px-3 py-2 text-left">Medio</th>
                      <th className="px-3 py-2 text-left">Comprobante</th>
                      <th className="px-3 py-2 text-right">Monto</th>
                      <th className="px-3 py-2 text-center">Estado</th>
                      <th className="px-3 py-2 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtrados.map((m) => {
                      const cuenta = cuentaMap.get(m.cuentaId);
                      const caja = cajaMap.get(m.cajaOrigenId ?? '');
                      const cajaDest = m.cajaDestinoId ? cajaMap.get(m.cajaDestinoId) : undefined;
                      const TipoIcon =
                        m.tipo === 'ingreso'
                          ? ArrowUpRight
                          : m.tipo === 'egreso'
                            ? ArrowDownRight
                            : ArrowLeftRight;
                      return (
                        <tr
                          key={m.id}
                          className={cn(
                            'border-t border-slate-100 hover:bg-slate-50',
                            m.estado === 'anulado' && 'opacity-50',
                          )}
                        >
                          <td className="px-3 py-2 text-xs text-slate-600">
                            {fechaCorta(m.fecha)}
                          </td>
                          <td className="max-w-[280px] px-3 py-2">
                            <div className="flex items-start gap-1.5">
                              <TipoIcon
                                size={14}
                                className={cn(
                                  'mt-0.5 shrink-0',
                                  m.tipo === 'ingreso'
                                    ? 'text-status-ok-fg'
                                    : m.tipo === 'egreso'
                                      ? 'text-status-risk-fg'
                                      : 'text-brand-600',
                                )}
                              />
                              <div className="min-w-0">
                                <div
                                  className={cn(
                                    'truncate font-medium text-slate-900',
                                    m.estado === 'anulado' && 'line-through',
                                  )}
                                >
                                  {m.descripcion}
                                </div>
                                {m.contraparte && (
                                  <div className="truncate text-xs text-slate-500">
                                    {m.contraparte}
                                    {m.cuitContraparte && (
                                      <span className="ml-1 font-mono text-[10px]">
                                        {m.cuitContraparte}
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-3 py-2 text-xs text-slate-600">
                            {cuenta ? (
                              <div>
                                <div className="font-mono text-[10px]">{cuenta.codigo}</div>
                                <div>{cuenta.nombre}</div>
                              </div>
                            ) : (
                              '—'
                            )}
                          </td>
                          <td className="px-3 py-2 text-xs text-slate-600">
                            {m.tipo === 'transferencia' && cajaDest
                              ? `${caja?.nombre} → ${cajaDest.nombre}`
                              : (caja?.nombre ?? '—')}
                          </td>
                          <td className="px-3 py-2 text-xs text-slate-600">
                            {MEDIO_LABEL[m.medio]}
                          </td>
                          <td className="px-3 py-2 text-xs">
                            {m.comprobanteNumero ? (
                              <div>
                                <Badge intent="neutral">{m.comprobanteTipo}</Badge>
                                <div className="mt-0.5 font-mono text-[10px] text-slate-500">
                                  {m.comprobanteNumero}
                                </div>
                              </div>
                            ) : (
                              <span className="text-slate-400">—</span>
                            )}
                          </td>
                          <td className="px-3 py-2 text-right">
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
                          <td className="px-3 py-2 text-center">
                            <Badge
                              intent={
                                m.estado === 'conciliado'
                                  ? 'ok'
                                  : m.estado === 'borrador'
                                    ? 'warn'
                                    : m.estado === 'anulado'
                                      ? 'risk'
                                      : 'neutral'
                              }
                            >
                              {m.estado}
                            </Badge>
                          </td>
                          <td className="px-3 py-2 text-right">
                            <div className="flex justify-end gap-1">
                              {m.estado === 'borrador' && (
                                <Button
                                  intent="ghost"
                                  size="sm"
                                  onClick={() => handleConciliar(m.id)}
                                  aria-label="Conciliar"
                                >
                                  <CheckCircle2 size={14} />
                                </Button>
                              )}
                              {m.estado !== 'anulado' && (
                                <Button
                                  intent="ghost"
                                  size="sm"
                                  onClick={() => setConfirmAnular(m)}
                                  aria-label="Anular"
                                >
                                  <Ban size={14} />
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="border-slate-200 bg-slate-50">
          <CardContent className="flex items-start gap-3 p-4 text-sm text-slate-600">
            <BookOpen size={18} className="mt-0.5 shrink-0 text-slate-400" />
            <div>
              <strong className="text-slate-900">Buena práctica:</strong> cada movimiento queda con
              la firma de quien lo cargó y el día y hora. Cuando anulás algo, no se borra del
              listado — queda con la marca de anulado y el motivo, así siempre podés ver el
              historial completo.
            </div>
          </CardContent>
        </Card>
      </div>

      <NuevoMovimientoDialog open={openNuevo} onClose={() => setOpenNuevo(false)} />

      <ConfirmDialog
        open={!!confirmAnular}
        onClose={() => {
          setConfirmAnular(null);
          setMotivoAnular('');
        }}
        onConfirm={handleAnular}
        titulo="¿Anular movimiento?"
        descripcion={
          confirmAnular
            ? `Vas a anular "${confirmAnular.descripcion}" por ${ars.format(confirmAnular.monto)}. El saldo se ajusta automáticamente y queda registrado con el motivo. No se borra del historial.`
            : ''
        }
        variant="destructive"
        confirmarLabel="Sí, anular"
      />

      {confirmAnular && (
        <div className="pointer-events-none fixed inset-x-4 bottom-24 z-50 mx-auto max-w-md sm:bottom-32">
          <div className="pointer-events-auto rounded-lg bg-white p-3 shadow-xl ring-1 ring-slate-200">
            <label className="text-xs font-semibold text-slate-700">Motivo de anulación *</label>
            <input
              autoFocus
              type="text"
              value={motivoAnular}
              onChange={(e) => setMotivoAnular(e.target.value)}
              placeholder="Ej: Error de carga, duplicado, factura rechazada"
              className="focus:border-brand-400 mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2"
            />
          </div>
        </div>
      )}
    </>
  );
}
