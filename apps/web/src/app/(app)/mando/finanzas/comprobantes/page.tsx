'use client';

import { Badge, Button, Card, CardContent, Dialog, Input, Kpi, cn, useToast } from '@faro/ui';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertTriangle,
  Camera,
  CheckCircle2,
  Download,
  Eye,
  FileText,
  Filter,
  Receipt,
  Scan,
  Search,
  Upload,
} from 'lucide-react';
import { useMemo, useState } from 'react';

import { ars, arsCompact, fechaCorta } from '../../../../../components/finanzas/utils';
import { EmptyState } from '../../../../../components/shared/empty-state';
import { PageHero } from '../../../../../components/shared/page-hero';
import { exportarCsv } from '../../../../../lib/utils/export-csv';
import { selectCuartelActivo, useFaroStore } from '../../../../../store/use-faro-store';

import type { MovimientoFinanciero } from '@faro/types';

const TIPO_COMPROBANTE_COLOR: Record<string, string> = {
  'FA-A': 'bg-emerald-100 text-emerald-700 border-emerald-200',
  'FA-B': 'bg-sky-100 text-sky-700 border-sky-200',
  'FA-C': 'bg-amber-100 text-amber-700 border-amber-200',
  Recibo: 'bg-slate-100 text-slate-700 border-slate-200',
  Ticket: 'bg-purple-100 text-purple-700 border-purple-200',
};

type Filtro = 'todos' | 'sin_comprobante' | 'con_comprobante' | 'pendiente_conciliar';

export default function ComprobantesPage() {
  const toast = useToast();
  const cuartel = useFaroStore(selectCuartelActivo);
  const movimientos = useFaroStore((s) => s.movimientos);
  const actualizarMovimiento = useFaroStore((s) => s.actualizarMovimiento);
  const conciliarMovimiento = useFaroStore((s) => s.conciliarMovimiento);
  const [busqueda, setBusqueda] = useState('');
  const [filtro, setFiltro] = useState<Filtro>('todos');
  const [scanOpen, setScanOpen] = useState(false);
  const [scanStep, setScanStep] = useState<'upload' | 'procesando' | 'resultado'>('upload');
  const [scanResult, setScanResult] = useState<{
    tipo: string;
    numero: string;
    cuit: string;
    contraparte: string;
    monto: number;
    fecha: string;
  } | null>(null);
  const [detalleSel, setDetalleSel] = useState<MovimientoFinanciero | null>(null);

  // Sólo egresos (los que típicamente tienen comprobante)
  const egresos = useMemo(
    () => movimientos.filter((m) => m.tipo === 'egreso' && m.estado !== 'anulado'),
    [movimientos],
  );

  const filtrados = useMemo(() => {
    let arr = [...egresos];
    if (filtro === 'sin_comprobante')
      arr = arr.filter((m) => !m.comprobanteUrl && !m.comprobanteNumero);
    if (filtro === 'con_comprobante')
      arr = arr.filter((m) => m.comprobanteUrl || m.comprobanteNumero);
    if (filtro === 'pendiente_conciliar') arr = arr.filter((m) => m.estado === 'borrador');
    if (busqueda.trim()) {
      const q = busqueda.toLowerCase();
      arr = arr.filter(
        (m) =>
          m.descripcion.toLowerCase().includes(q) ||
          m.contraparte?.toLowerCase().includes(q) ||
          m.comprobanteNumero?.toLowerCase().includes(q),
      );
    }
    return arr.sort((a, b) => b.fecha.localeCompare(a.fecha));
  }, [egresos, filtro, busqueda]);

  const stats = useMemo(() => {
    const total = egresos.length;
    const conComp = egresos.filter((m) => m.comprobanteNumero).length;
    const sinComp = total - conComp;
    const pendConciliar = egresos.filter((m) => m.estado === 'borrador').length;
    const pctCompliance = total > 0 ? (conComp / total) * 100 : 0;
    return { total, conComp, sinComp, pendConciliar, pctCompliance };
  }, [egresos]);

  function iniciarScan() {
    setScanStep('upload');
    setScanOpen(true);
  }

  const OCR_MOCK_RESULTS = [
    {
      tipo: 'FA-A',
      numero: '0042-00129631',
      cuit: '30-54668997-0',
      contraparte: 'YPF SA',
      monto: 58_000,
      fecha: '2026-05-24',
    },
    {
      tipo: 'FA-B',
      numero: '0001-00084215',
      cuit: '30-65511224-9',
      contraparte: 'EDENOR SA',
      monto: 165_000,
      fecha: '2026-05-22',
    },
    {
      tipo: 'FA-A',
      numero: '0015-00073402',
      cuit: '30-50000675-3',
      contraparte: 'MSA Argentina',
      monto: 175_000,
      fecha: '2026-05-20',
    },
    {
      tipo: 'Recibo',
      numero: 'R-2026-0532',
      cuit: '20-12345678-9',
      contraparte: 'Cdor. González',
      monto: 95_000,
      fecha: '2026-05-18',
    },
  ];

  function procesarOcr() {
    setScanStep('procesando');
    setTimeout(() => {
      const idx = Math.floor(Math.random() * OCR_MOCK_RESULTS.length);
      setScanResult(OCR_MOCK_RESULTS[idx]!);
      setScanStep('resultado');
    }, 1500);
  }

  function asociarYConciliar(mov: MovimientoFinanciero) {
    if (!scanResult) return;
    actualizarMovimiento(mov.id, {
      comprobanteTipo: scanResult.tipo as MovimientoFinanciero['comprobanteTipo'],
      comprobanteNumero: scanResult.numero,
      cuitContraparte: scanResult.cuit,
      comprobanteUrl: `comp-${Date.now()}`,
      estado: 'conciliado',
    });
    toast.push({
      kind: 'success',
      title: 'Comprobante asociado y conciliado',
      description: `${scanResult.numero} → ${mov.descripcion}`,
    });
    setScanOpen(false);
    setScanResult(null);
  }

  return (
    <>
      <div className="mx-auto max-w-7xl space-y-5">
        <PageHero
          objetivo={`Tesorería · ${cuartel?.nombre ?? 'Cuartel'}`}
          titulo="Comprobantes y facturas"
          descripcion="Facturas y recibos de los gastos del cuartel. Sacá una foto y los datos se completan automáticamente."
          icono={<Receipt size={26} />}
          variant={
            stats.pctCompliance >= 90
              ? 'success'
              : stats.pctCompliance < 70
                ? 'critical'
                : 'default'
          }
          meta={
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <Kpi
                label="Con factura"
                value={`${stats.pctCompliance.toFixed(0)}%`}
                hint={`${stats.conComp}/${stats.total} · <70% = devol.`}
                intent={
                  stats.pctCompliance >= 90 ? 'ok' : stats.pctCompliance < 70 ? 'risk' : 'warn'
                }
              />
              <Kpi
                label="Sin factura"
                value={stats.sinComp}
                intent={stats.sinComp > 0 ? 'warn' : 'ok'}
              />
              <Kpi
                label="Por revisar"
                value={stats.pendConciliar}
                intent={stats.pendConciliar > 0 ? 'warn' : 'ok'}
              />
              <Kpi label="Total cargadas" value={stats.conComp} intent="neutral" />
            </div>
          }
          acciones={
            <>
              <Button
                intent="ghost"
                size="sm"
                onClick={() => {
                  const headers = [
                    'Fecha',
                    'Proveedor',
                    'CUIT',
                    'Tipo',
                    'Nº comprobante',
                    'Descripción',
                    'Monto',
                    'Estado',
                  ];
                  const rows = egresos.map((m) => [
                    m.fecha.slice(0, 10),
                    m.contraparte ?? '',
                    m.cuitContraparte ?? '',
                    m.comprobanteTipo ?? 'SIN COMPROBANTE',
                    m.comprobanteNumero ?? '',
                    m.descripcion,
                    m.monto,
                    m.estado === 'conciliado' ? 'Confirmado' : 'Borrador',
                  ]);
                  exportarCsv(`paquete-contador-${egresos.length}-comp`, headers, rows);
                  toast.push({
                    kind: 'success',
                    title: 'Paquete contador descargado',
                    description: `${egresos.length} comprobante${egresos.length === 1 ? '' : 's'} en CSV`,
                  });
                }}
              >
                <Download size={12} /> Paquete contador
              </Button>
              <Button intent="primary" onClick={iniciarScan}>
                <Scan size={14} /> Subir factura
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
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
              />
              <Input
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar por descripción, proveedor o nº..."
                className="pl-9"
              />
            </div>
            <div className="flex flex-wrap gap-1">
              {(
                [
                  ['todos', 'Todos'],
                  ['con_comprobante', 'Con factura'],
                  ['sin_comprobante', 'Sin factura'],
                  ['pendiente_conciliar', 'Por revisar'],
                ] as const
              ).map(([k, l]) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setFiltro(k)}
                  className={cn(
                    'rounded-full px-2.5 py-1 text-xs font-medium',
                    filtro === k
                      ? 'bg-brand-600 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200',
                  )}
                >
                  {l}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Galería estilo grid */}
        {filtrados.length === 0 ? (
          <Card>
            <CardContent>
              <EmptyState
                inline
                icon={<Filter size={28} />}
                titulo="Sin comprobantes"
                descripcion="No hay egresos que coincidan con el filtro."
              />
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
            {filtrados.map((m) => {
              const tieneComp = !!m.comprobanteNumero;
              return (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -2 }}
                >
                  <Card
                    className={cn(
                      'cursor-pointer overflow-hidden transition-all hover:shadow-lg',
                      m.estado === 'borrador' && 'ring-status-warn/40 ring-2',
                      !tieneComp && 'ring-status-risk/30 ring-1',
                    )}
                    onClick={() => setDetalleSel(m)}
                  >
                    {/* Mock thumbnail */}
                    <div
                      className={cn(
                        'relative h-32 bg-gradient-to-br',
                        tieneComp
                          ? 'from-slate-100 to-slate-200'
                          : 'from-status-risk-bg/40 to-status-warn-bg/40',
                      )}
                    >
                      <div className="absolute inset-0 flex items-center justify-center">
                        {tieneComp ? (
                          <FileText size={48} className="text-slate-500" />
                        ) : (
                          <AlertTriangle size={48} className="text-status-warn-fg" />
                        )}
                      </div>
                      {tieneComp && m.comprobanteTipo && (
                        <div
                          className={cn(
                            'absolute left-2 top-2 rounded border px-2 py-0.5 text-xs font-bold',
                            TIPO_COMPROBANTE_COLOR[m.comprobanteTipo] ?? 'bg-white',
                          )}
                        >
                          {m.comprobanteTipo}
                        </div>
                      )}
                      <Badge
                        intent={m.estado === 'conciliado' ? 'ok' : 'warn'}
                        className="absolute right-2 top-2"
                      >
                        {m.estado === 'conciliado' ? (
                          <CheckCircle2 size={10} />
                        ) : (
                          <AlertTriangle size={10} />
                        )}
                        {m.estado}
                      </Badge>
                    </div>
                    <CardContent className="p-3">
                      <div className="truncate text-sm font-semibold text-slate-900">
                        {m.descripcion}
                      </div>
                      {m.contraparte && (
                        <div className="truncate text-xs text-slate-600">
                          {m.contraparte}
                          {m.cuitContraparte && (
                            <span className="ml-1 font-mono text-[11px] text-slate-500">
                              {m.cuitContraparte}
                            </span>
                          )}
                        </div>
                      )}
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-xs text-slate-500">{fechaCorta(m.fecha)}</span>
                        <span className="text-status-risk-fg font-mono text-sm font-bold">
                          {ars.format(m.monto)}
                        </span>
                      </div>
                      {m.comprobanteNumero && (
                        <div className="mt-1 truncate font-mono text-[11px] text-slate-500">
                          {m.comprobanteNumero}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}

        <Card className="border-slate-200 bg-slate-50">
          <CardContent className="flex items-start gap-3 p-4 text-sm text-slate-600">
            <Receipt size={18} className="mt-0.5 shrink-0 text-slate-500" />
            <div>
              <strong className="text-slate-900">¿Por qué necesitás facturas?</strong> Cada gasto
              del cuartel tiene que tener su factura o recibo (la pide AFIP). Subí la foto del
              comprobante y el sistema completa solo los datos: CUIT, tipo, número y monto. Después
              lo vinculás con el gasto correspondiente.
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dialog escanear */}
      <Dialog
        open={scanOpen}
        onClose={() => {
          setScanOpen(false);
          setScanResult(null);
          setScanStep('upload');
        }}
        title="Subir factura"
        description="Sacale una foto o subí un PDF. El sistema lee solo el CUIT, número y monto."
        size="lg"
      >
        <AnimatePresence mode="wait">
          {scanStep === 'upload' && (
            <motion.div
              key="upload"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <button
                type="button"
                onClick={procesarOcr}
                className="border-brand-300 hover:bg-brand-50 flex w-full flex-col items-center gap-2 rounded-xl border-2 border-dashed p-8 transition-all"
              >
                <Upload size={32} className="text-brand-600" />
                <span className="font-semibold text-slate-900">Subir factura o recibo</span>
                <span className="text-xs text-slate-500">Foto o PDF · hasta 10MB</span>
                <span className="text-xs text-slate-500">o sacá una foto con la cámara</span>
              </button>
              <Button intent="ghost" fullWidth className="mt-3" onClick={procesarOcr}>
                <Camera size={14} /> Tomar foto
              </Button>
            </motion.div>
          )}
          {scanStep === 'procesando' && (
            <motion.div
              key="procesando"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-12 text-center"
            >
              <div className="border-brand-300 border-t-brand-600 mx-auto h-12 w-12 animate-spin rounded-full border-4" />
              <p className="mt-3 text-sm font-semibold text-slate-900">Leyendo la factura...</p>
              <p className="text-xs text-slate-500">Buscando CUIT, monto y número</p>
            </motion.div>
          )}
          {scanStep === 'resultado' && scanResult && (
            <motion.div
              key="resultado"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-3"
            >
              <div className="bg-status-ok-bg/30 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <CheckCircle2 size={16} className="text-status-ok-fg mt-0.5 shrink-0" />
                  <div className="text-xs">
                    <strong className="text-status-ok-fg">Listo · alta precisión</strong>
                    <p className="text-slate-700">
                      Leí todos los datos. Asociá esta factura a un gasto ya cargado o creá uno
                      nuevo.
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-1.5 rounded-lg border border-slate-200 bg-white p-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Tipo</span>
                  <Badge intent="ok">{scanResult.tipo}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Número</span>
                  <span className="font-mono font-bold text-slate-900">{scanResult.numero}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">CUIT</span>
                  <span className="font-mono text-slate-900">{scanResult.cuit}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Proveedor</span>
                  <span className="text-slate-900">{scanResult.contraparte}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Monto</span>
                  <span className="text-status-risk-fg font-mono font-bold">
                    {ars.format(scanResult.monto)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Fecha</span>
                  <span className="text-slate-900">{scanResult.fecha}</span>
                </div>
              </div>

              <div>
                <div className="mb-2 text-xs font-semibold text-slate-700">
                  Gastos que coinciden con este monto ({arsCompact(scanResult.monto)} ±5%):
                </div>
                <ul className="max-h-40 space-y-1.5 overflow-y-auto">
                  {egresos
                    .filter(
                      (m) =>
                        Math.abs(m.monto - scanResult.monto) / scanResult.monto < 0.1 &&
                        m.estado === 'borrador',
                    )
                    .slice(0, 4)
                    .map((m) => (
                      <li key={m.id}>
                        <button
                          type="button"
                          onClick={() => asociarYConciliar(m)}
                          className="hover:border-brand-300 hover:bg-brand-50 flex w-full items-center justify-between rounded-lg border border-slate-200 bg-white p-2 text-left text-xs transition-all"
                        >
                          <div className="min-w-0 flex-1">
                            <div className="truncate font-medium text-slate-900">
                              {m.descripcion}
                            </div>
                            <div className="text-slate-500">{fechaCorta(m.fecha)}</div>
                          </div>
                          <span className="ml-2 font-mono font-bold text-slate-900">
                            {ars.format(m.monto)}
                          </span>
                        </button>
                      </li>
                    ))}
                </ul>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Dialog>

      {/* Detalle comprobante */}
      <Dialog
        open={!!detalleSel}
        onClose={() => setDetalleSel(null)}
        title={detalleSel?.descripcion ?? ''}
        description="Datos del gasto y la factura asociada"
        footer={
          detalleSel && (
            <div className="flex flex-wrap justify-end gap-2">
              <Button intent="ghost" onClick={() => setDetalleSel(null)}>
                Cerrar
              </Button>
              {detalleSel.estado === 'borrador' && (
                <Button
                  intent="primary"
                  onClick={() => {
                    conciliarMovimiento(detalleSel.id);
                    toast.push({ kind: 'success', title: 'Gasto confirmado' });
                    setDetalleSel(null);
                  }}
                >
                  <CheckCircle2 size={14} /> Confirmar
                </Button>
              )}
              <Button
                intent="secondary"
                onClick={() => toast.push({ kind: 'info', title: 'Descargando PDF' })}
              >
                <Eye size={14} /> Ver original
              </Button>
            </div>
          )
        }
      >
        {detalleSel && (
          <div className="space-y-3 text-sm">
            <div className="grid h-40 place-items-center rounded-lg bg-gradient-to-br from-slate-100 to-slate-200">
              <FileText size={56} className="text-slate-500" />
            </div>
            <dl className="grid grid-cols-2 gap-2 text-xs">
              <dt className="text-slate-500">Tipo</dt>
              <dd className="font-semibold text-slate-900">
                {detalleSel.comprobanteTipo ?? 'Sin comprobante'}
              </dd>
              <dt className="text-slate-500">Número</dt>
              <dd className="font-mono font-bold text-slate-900">
                {detalleSel.comprobanteNumero ?? '—'}
              </dd>
              <dt className="text-slate-500">Proveedor</dt>
              <dd className="text-slate-900">{detalleSel.contraparte ?? '—'}</dd>
              <dt className="text-slate-500">CUIT</dt>
              <dd className="font-mono text-slate-900">{detalleSel.cuitContraparte ?? '—'}</dd>
              <dt className="text-slate-500">Fecha</dt>
              <dd className="text-slate-900">{fechaCorta(detalleSel.fecha)}</dd>
              <dt className="text-slate-500">Monto</dt>
              <dd className="text-status-risk-fg font-mono font-bold">
                {ars.format(detalleSel.monto)}
              </dd>
              <dt className="text-slate-500">Estado</dt>
              <dd>
                <Badge intent={detalleSel.estado === 'conciliado' ? 'ok' : 'warn'}>
                  {detalleSel.estado === 'conciliado'
                    ? 'Confirmado'
                    : detalleSel.estado === 'borrador'
                      ? 'Borrador'
                      : detalleSel.estado}
                </Badge>
              </dd>
            </dl>
          </div>
        )}
      </Dialog>
    </>
  );
}
