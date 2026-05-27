'use client';

import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Download,
  FileCheck2,
  FileSignature,
  ShieldCheck,
  Upload,
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

import { Badge, Button, Card, CardContent, Kpi, cn, useToast } from '@faro/ui';

import { PageHero } from '../../../../../components/shared/page-hero';
import { fmtMesPeriodo, mesActual } from '../../../../../lib/utils/date';
import { exportarCsv } from '../../../../../lib/utils/export-csv';
import {
  selectCuartelActivo,
  selectPersonaActual,
  selectRendicionActual,
  useFaroStore,
} from '../../../../../store/use-faro-store';

import type { CategoriaEgreso } from '@faro/types';

/** Texto legal de la declaración jurada. Centralizado para facilitar
 *  cambios normativos (Res. MS 272/2025 + Ley 25.054). */
const DECLARACION_LEGAL = {
  normativa: 'Res. MS 272/2025',
  marco: 'Ley 25.054 y su modificación 26.987',
} as const;

type Paso = 1 | 2 | 3 | 4 | 5;

interface ItemRendicion {
  id: string;
  categoria: string;
  concepto: string;
  monto: number;
  comprobante?: string;
  validado: boolean;
}

/** Agrupa categorías técnicas en los 4 ejes Ley 25.054. */
function ejeRendicion(cat: CategoriaEgreso | undefined): string {
  if (!cat) return 'Otros';
  if (
    cat === 'combustible' ||
    cat === 'mantenimiento_movil' ||
    cat === 'epp_equipamiento' ||
    cat === 'insumos_medicos'
  )
    return 'Operativo';
  if (cat === 'capacitacion') return 'Capacitación';
  if (cat === 'personal_rentado') return 'Personal rentado';
  if (
    cat === 'administrativo' ||
    cat === 'servicios_publicos' ||
    cat === 'seguros' ||
    cat === 'impuestos_tasas'
  )
    return 'Administrativo';
  if (cat === 'inversion_bienes_uso') return 'Bienes de uso';
  return 'Otros';
}

export default function PresentarRendicionPage() {
  const cuartel = useFaroStore(selectCuartelActivo);
  const rendicion = useFaroStore(selectRendicionActual);
  const persona = useFaroStore(selectPersonaActual);
  const sesion = useFaroStore((s) => s.sesion);
  const movimientos = useFaroStore((s) => s.movimientos);
  const cuentas = useFaroStore((s) => s.cuentas);
  const presentarRendicion = useFaroStore((s) => s.presentarRendicion);
  const toast = useToast();

  // Construir ítems a partir de los movimientos reales del período de la rendición
  const itemsDelStore = useMemo<ItemRendicion[]>(() => {
    if (!rendicion) return [];
    const cuentaPorId = new Map(cuentas.map((c) => [c.id, c]));
    return movimientos
      .filter(
        (m) =>
          m.tipo === 'egreso' && m.estado !== 'anulado' && m.fecha.startsWith(rendicion.periodo),
      )
      .sort((a, b) => b.monto - a.monto)
      .slice(0, 12) // limitamos para que el paso 1 sea legible
      .map<ItemRendicion>((m) => {
        const cta = cuentaPorId.get(m.cuentaId);
        return {
          id: m.id,
          categoria: ejeRendicion(cta?.categoria as CategoriaEgreso | undefined),
          concepto: m.descripcion,
          monto: m.monto,
          comprobante: m.comprobanteNumero
            ? `${m.contraparte ?? ''} ${m.comprobanteTipo ?? ''} ${m.comprobanteNumero}`.trim()
            : (m.contraparte ?? 'Sin comprobante'),
          validado: m.estado === 'conciliado' && Boolean(m.comprobanteNumero),
        };
      });
  }, [rendicion, movimientos, cuentas]);

  const [paso, setPaso] = useState<Paso>(1);
  const [items, setItems] = useState<ItemRendicion[]>(itemsDelStore);
  const [aceptaDeclaracion, setAceptaDeclaracion] = useState(false);
  const [presentando, setPresentando] = useState(false);
  const [presentada, setPresentada] = useState(false);
  const [comprobante, setComprobante] = useState<string | null>(null);

  // Hidratar items si la rendición/store cargan después del primer render
  useEffect(() => {
    if (items.length === 0 && itemsDelStore.length > 0 && !presentada && !presentando) {
      setItems(itemsDelStore);
    }
  }, [itemsDelStore, items.length, presentada, presentando]);

  const total = items.reduce((acc, i) => acc + i.monto, 0);
  const totalValidados = items.filter((i) => i.validado).reduce((acc, i) => acc + i.monto, 0);
  const subsidio = Math.round(total * 0.8); // 80% asociaciones según Ley 25.054

  function siguiente() {
    if (paso < 5) setPaso((paso + 1) as Paso);
  }
  function anterior() {
    if (paso > 1) setPaso((paso - 1) as Paso);
  }
  function presentarFondo() {
    setPresentando(true);
    setTimeout(() => {
      setPresentando(false);
      setPresentada(true);
      const cod = 'RND-' + Date.now().toString().slice(-8);
      setComprobante(cod);
      if (rendicion) {
        presentarRendicion(rendicion.id, sesion?.personaId ?? persona?.id ?? 'persona-001');
      }
      toast.push({
        kind: 'success',
        title: 'Rendición presentada al Sistema Nacional',
        description: `Comprobante ${cod} · Firmada y guardada para siempre.`,
      });
    }, 2200);
  }

  const PASOS: Array<{ id: Paso; titulo: string; descripcion: string }> = [
    { id: 1, titulo: 'Validación', descripcion: 'Confirmar ítems del período' },
    { id: 2, titulo: 'Comprobantes', descripcion: 'Adjuntar facturas y recibos' },
    { id: 3, titulo: 'Resumen', descripcion: 'Revisar totales y distribución' },
    { id: 4, titulo: 'Declaración', descripcion: 'Firma del jefe del cuartel' },
    { id: 5, titulo: 'Presentar', descripcion: 'Subir al sistema nacional' },
  ];

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <Link
          href="/mando/rendicion"
          className="hover:text-brand-700 inline-flex items-center gap-1"
        >
          <ArrowLeft size={14} /> Volver a rendición
        </Link>
      </div>

      <PageHero
        objetivo="Vista Mando · Rendición al Fondo"
        titulo={
          presentada
            ? 'Rendición presentada al sistema nacional'
            : `Presentar rendición · ${fmtMesPeriodo(rendicion?.periodo ?? mesActual())}`
        }
        descripcion={`Paso a paso según ${DECLARACION_LEGAL.normativa}. Genera el archivo exacto que pide el sistema nacional de rendiciones.`}
        icono={<FileCheck2 size={26} />}
        variant={presentada ? 'success' : 'default'}
        meta={
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Kpi label="Items" value={items.length} intent="brand" />
            <Kpi
              label="Total"
              value={`$${(total / 1_000_000).toFixed(2)}M`}
              hint="ARS"
              intent="neutral"
            />
            <Kpi
              label="Subsidio (80%)"
              value={`$${(subsidio / 1_000_000).toFixed(2)}M`}
              hint="Ley 25.054"
              intent="ok"
            />
            <Kpi
              label="Pendientes"
              value={items.filter((i) => !i.validado).length}
              hint="validar"
              intent={items.some((i) => !i.validado) ? 'warn' : 'ok'}
            />
          </div>
        }
      />

      {/* Stepper */}
      <Card className="overflow-hidden">
        <CardContent className="p-4 sm:p-5">
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {PASOS.map((p, idx) => {
              const activo = p.id === paso;
              const completado = p.id < paso || presentada;
              return (
                <div key={p.id} className="flex shrink-0 items-center gap-2">
                  <div
                    className={cn(
                      'grid h-8 w-8 place-items-center rounded-full text-xs font-bold',
                      completado
                        ? 'bg-status-ok text-white'
                        : activo
                          ? 'bg-brand-600 text-white shadow-md'
                          : 'bg-slate-100 text-slate-500',
                    )}
                  >
                    {completado ? <Check size={14} /> : p.id}
                  </div>
                  <div className="hidden sm:block">
                    <div
                      className={cn(
                        'text-xs font-semibold uppercase',
                        activo ? 'text-brand-700' : 'text-slate-600',
                      )}
                    >
                      {p.titulo}
                    </div>
                    <div className="text-[10px] text-slate-500">{p.descripcion}</div>
                  </div>
                  {idx < PASOS.length - 1 && (
                    <div
                      className={cn(
                        'h-0.5 w-6 sm:w-10',
                        completado ? 'bg-status-ok' : 'bg-slate-200',
                      )}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <AnimatePresence mode="wait">
        {/* PASO 1 · Validación de items */}
        {paso === 1 && (
          <motion.div
            key="paso1"
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            className="space-y-3"
          >
            <Card>
              <CardContent className="p-5">
                <h2 className="mb-3 text-lg font-bold text-slate-900">
                  Confirmar ítems del período
                </h2>
                <p className="mb-4 text-sm text-slate-600">
                  Revisá cada gasto. Tocá para marcarlo como validado. Los pendientes se excluyen de
                  la rendición.
                </p>
                <ul className="divide-y divide-slate-100">
                  {items.map((item) => (
                    <li key={item.id} className="flex items-start gap-3 py-3">
                      <button
                        type="button"
                        onClick={() =>
                          setItems((arr) =>
                            arr.map((i) =>
                              i.id === item.id ? { ...i, validado: !i.validado } : i,
                            ),
                          )
                        }
                        className={cn(
                          'grid h-6 w-6 shrink-0 place-items-center rounded-md border-2',
                          item.validado
                            ? 'border-status-ok bg-status-ok text-white'
                            : 'border-slate-300',
                        )}
                      >
                        {item.validado && <Check size={14} />}
                      </button>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <Badge intent="neutral">{item.categoria}</Badge>
                          <span className="font-mono text-xs text-slate-500">{item.id}</span>
                        </div>
                        <div className="mt-1 font-medium text-slate-900">{item.concepto}</div>
                        <div className="text-xs text-slate-500">{item.comprobante}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold tabular-nums text-slate-900">
                          ${item.monto.toLocaleString('es-AR')}
                        </div>
                        <div className="text-xs text-slate-500">ARS</div>
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* PASO 2 · Comprobantes */}
        {paso === 2 && (
          <motion.div
            key="paso2"
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            className="space-y-3"
          >
            <Card className="bg-brand-50/40 border-brand-100">
              <CardContent className="flex items-start gap-3 p-4 text-sm text-slate-700">
                <Upload size={18} className="text-brand-700 mt-0.5 shrink-0" />
                <div>
                  <strong className="text-brand-900">Adjuntar comprobantes</strong>
                  <p className="text-brand-900/80 mt-0.5">
                    Para cada ítem validado el sistema pide Factura A/B o recibo oficial. Los
                    comprobantes se guardan cifrados.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-0">
                <ul className="divide-y divide-slate-100">
                  {items
                    .filter((i) => i.validado)
                    .map((item) => (
                      <li key={item.id} className="flex items-center gap-3 p-3 sm:p-4">
                        <div className="bg-status-ok-bg/60 text-status-ok-fg grid h-10 w-10 shrink-0 place-items-center rounded-lg">
                          <CheckCircle2 size={18} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="truncate font-medium text-slate-900">{item.concepto}</div>
                          <div className="text-xs text-slate-500">
                            {item.comprobante} · {item.categoria}
                          </div>
                        </div>
                        <Badge intent="ok">PDF adjunto</Badge>
                      </li>
                    ))}
                </ul>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* PASO 3 · Resumen */}
        {paso === 3 && (
          <motion.div
            key="paso3"
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            className="space-y-3"
          >
            <Card>
              <CardContent className="p-5">
                <h2 className="mb-4 text-lg font-bold text-slate-900">Resumen y distribución</h2>

                <div className="space-y-2">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2 text-sm">
                    <span className="text-slate-600">Total presentado al Fondo</span>
                    <span className="font-bold tabular-nums">
                      ${totalValidados.toLocaleString('es-AR')}
                    </span>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-3">
                    <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Distribución 5‰ Ley 25.054
                    </div>
                    <div className="space-y-1.5 text-sm">
                      <div className="flex items-center justify-between">
                        <span>
                          <strong className="text-status-ok-fg">80%</strong> Asociación (este
                          cuartel)
                        </span>
                        <span className="font-bold tabular-nums">
                          ${Math.round(totalValidados * 0.8).toLocaleString('es-AR')}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>
                          <strong>10%</strong> Federación
                        </span>
                        <span className="tabular-nums">
                          ${Math.round(totalValidados * 0.1).toLocaleString('es-AR')}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>
                          <strong>7%</strong> Consejo Nacional
                        </span>
                        <span className="tabular-nums">
                          ${Math.round(totalValidados * 0.07).toLocaleString('es-AR')}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>
                          <strong>3%</strong> Autoridad de aplicación
                        </span>
                        <span className="tabular-nums">
                          ${Math.round(totalValidados * 0.03).toLocaleString('es-AR')}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-status-warn-bg/40 text-status-warn-fg flex items-start gap-2 rounded-lg p-3 text-xs">
                    <AlertCircle size={14} className="mt-0.5 shrink-0" />
                    <div>
                      Los ítems sin validar ({items.filter((i) => !i.validado).length}) quedan en
                      borrador para el próximo período.
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* PASO 4 · Declaración + firma */}
        {paso === 4 && (
          <motion.div
            key="paso4"
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            className="space-y-3"
          >
            <Card>
              <CardContent className="p-5">
                <h2 className="mb-3 flex items-center gap-2 text-lg font-bold text-slate-900">
                  <FileSignature size={20} className="text-brand-700" />
                  Declaración jurada
                </h2>
                <div className="prose prose-sm max-w-none text-sm text-slate-700">
                  <p>
                    Quien suscribe, en su carácter de jefe del cuartel{' '}
                    <strong>{cuartel?.nombre}</strong>, declara bajo juramento que los ítems y
                    comprobantes incluidos en esta rendición son veraces, corresponden al período{' '}
                    <strong>{fmtMesPeriodo(rendicion?.periodo ?? mesActual())}</strong> y se
                    enmarcan en la <strong>{DECLARACION_LEGAL.marco}</strong>.
                  </p>
                  <p>
                    Toda diferencia material detectada por la auditoría del sistema nacional será
                    responsabilidad del firmante (norma de presentación:{' '}
                    {DECLARACION_LEGAL.normativa}).
                  </p>
                </div>

                <label className="bg-brand-50 mt-4 flex cursor-pointer items-start gap-3 rounded-lg p-3">
                  <input
                    type="checkbox"
                    checked={aceptaDeclaracion}
                    onChange={(e) => setAceptaDeclaracion(e.target.checked)}
                    className="mt-0.5 h-4 w-4"
                  />
                  <span className="text-sm text-slate-900">
                    <strong>Acepto la declaración jurada</strong> y firmo digitalmente con mi legajo{' '}
                    {persona?.legajo}. Esta acción queda guardada para siempre.
                  </span>
                </label>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* PASO 5 · Presentar */}
        {paso === 5 && (
          <motion.div
            key="paso5"
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            className="space-y-3"
          >
            {!presentada ? (
              <Card className="border-brand-200 border-2">
                <CardContent className="p-6 text-center">
                  <div className="bg-brand-600 mx-auto grid h-16 w-16 place-items-center rounded-2xl text-white shadow-md">
                    <Upload size={28} />
                  </div>
                  <h2 className="mt-3 text-xl font-bold text-slate-900">
                    Listo para presentar al sistema nacional
                  </h2>
                  <p className="mt-1 text-sm text-slate-600">
                    Se generará el archivo XML según especificación Res. 272/2025 y se subirá al
                    sistema nacional de rendiciones. Recibirás el comprobante en segundos.
                  </p>
                  <Button
                    intent="success"
                    size="lg"
                    onClick={presentarFondo}
                    disabled={presentando}
                    aria-busy={presentando}
                    className="mt-4"
                  >
                    {presentando ? (
                      <>Presentando...</>
                    ) : (
                      <>
                        <FileSignature size={18} /> Presentar al Fondo Permanente
                      </>
                    )}
                  </Button>
                  {presentando && (
                    <span role="status" aria-live="polite" className="sr-only">
                      Presentando rendición al sistema nacional, esto puede tardar unos segundos.
                    </span>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card className="border-status-ok bg-status-ok-bg/30 border-2">
                <CardContent className="p-6 text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200 }}
                    className="bg-status-ok mx-auto grid h-20 w-20 place-items-center rounded-full text-white shadow-lg"
                  >
                    <CheckCircle2 size={40} />
                  </motion.div>
                  <h2 className="mt-3 text-2xl font-bold text-slate-900">Rendición presentada</h2>
                  <p className="mt-1 text-sm text-slate-600">
                    Comprobante: <span className="font-mono font-bold">{comprobante}</span>
                  </p>
                  <p className="mt-2 text-xs text-slate-500">
                    El Fondo Permanente acredita habitualmente entre 7 y 21 días hábiles.
                  </p>

                  <div className="mt-4 flex flex-wrap justify-center gap-2">
                    <Button
                      intent="secondary"
                      size="sm"
                      onClick={() => {
                        const headers = ['Campo', 'Valor'];
                        const rows: Array<Array<string | number>> = [
                          ['Comprobante', comprobante ?? ''],
                          ['Cuartel', cuartel?.nombre ?? ''],
                          ['Período', rendicion?.periodo ?? mesActual()],
                          ['Ítems', items.length],
                          ['Total presentado', totalValidados],
                          ['Subsidio (80%)', Math.round(totalValidados * 0.8)],
                          ['Normativa', DECLARACION_LEGAL.normativa],
                          ['Marco', DECLARACION_LEGAL.marco],
                        ];
                        exportarCsv(`rendicion-${comprobante ?? 'sin-cod'}`, headers, rows);
                      }}
                    >
                      <Download size={14} /> Descargar resumen
                    </Button>
                    <Button
                      intent="secondary"
                      size="sm"
                      onClick={() => {
                        const headers = [
                          'ID',
                          'Categoría',
                          'Concepto',
                          'Comprobante',
                          'Monto',
                          'Validado',
                        ];
                        const rows = items.map((it) => [
                          it.id,
                          it.categoria,
                          it.concepto,
                          it.comprobante ?? '',
                          it.monto,
                          it.validado ? 'Sí' : 'No',
                        ]);
                        exportarCsv(`rendicion-detalle-${comprobante ?? 'sin-cod'}`, headers, rows);
                      }}
                    >
                      <Download size={14} /> Detalle de ítems
                    </Button>
                    <Link href="/mando/rendicion">
                      <Button intent="primary" size="sm">
                        Volver a rendición
                      </Button>
                    </Link>
                  </div>

                  <div className="bg-brand-50 border-brand-100 mt-5 rounded-lg border p-3 text-left text-xs text-slate-700">
                    <div className="text-brand-900 flex items-center gap-1 font-semibold">
                      <ShieldCheck size={12} /> Comprobante de firma
                    </div>
                    <div className="mt-1 break-all font-mono text-[10px] text-slate-600">
                      {comprobante}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navegación */}
      {!presentada && (
        <div className="flex items-center justify-between border-t border-slate-100 pt-4">
          <Button intent="ghost" onClick={anterior} disabled={paso === 1}>
            <ArrowLeft size={16} /> Anterior
          </Button>
          {paso < 5 && (
            <Button
              intent="primary"
              onClick={siguiente}
              disabled={paso === 4 && !aceptaDeclaracion}
            >
              Siguiente <ArrowRight size={16} />
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
