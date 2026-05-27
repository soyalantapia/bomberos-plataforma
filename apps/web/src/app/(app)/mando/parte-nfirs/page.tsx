'use client';

import { Badge, Button, Card, CardContent, Kpi, cn, useToast } from '@faro/ui';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronDown,
  Download,
  FileText,
  Flame,
  Hash,
  KeyRound,
  Paintbrush,
  ShieldCheck,
} from 'lucide-react';
import { useRef, useState } from 'react';

import { ConfirmDialog } from '../../../../components/shared/confirm-dialog';
import { PageHero } from '../../../../components/shared/page-hero';
import { demoToday } from '../../../../lib/utils/demo-today';

type Paso = 1 | 2 | 3 | 4 | 5;

// Códigos NFPA 901 adaptados a Argentina
const TIPOS_INCIDENTE = {
  '111': 'Incendio estructural · vivienda',
  '112': 'Incendio estructural · comercial',
  '113': 'Incendio estructural · industrial',
  '121': 'Incendio vehicular · automóvil',
  '122': 'Incendio vehicular · camión/utilitario',
  '131': 'Incendio forestal · pastizal',
  '132': 'Incendio forestal · monte',
  '142': 'Incendio · basura/desperdicios',
  '300': 'Rescate · genérico',
  '321': 'Rescate vehicular · atrapamiento',
  '322': 'Rescate acuático',
  '323': 'Rescate vertical · altura/profundidad',
  '361': 'Emergencia médica · básica',
  '362': 'Emergencia médica · trauma',
  '400': 'Materiales peligrosos · genérico',
  '411': 'Materiales peligrosos · derrame de gas',
  '412': 'Materiales peligrosos · derrame de combustible',
  '500': 'Servicio comunitario',
  '622': 'Asistencia ciudadanos',
  '700': 'Falsa alarma · sistema automático',
  '711': 'Falsa alarma · llamado errado',
} as const;

const PROPIEDADES = [
  '419 · Vivienda unifamiliar',
  '429 · Departamento/edificio',
  '500 · Comercial',
  '569 · Hospital',
  '579 · Escuela',
  '600 · Industrial',
  '700 · Manufactura',
  '888 · Vehículo',
  '900 · Espacio abierto',
  '961 · Forestal',
];

const CAUSAS_PROBABLES = [
  'Eléctrica · cortocircuito',
  'Eléctrica · sobrecarga',
  'Cocina · grasa/aceite',
  'Cocina · olvido en hornalla',
  'Fumar en cama',
  'Calefactor · cercanía material combustible',
  'Vela/llama abierta',
  'Niños jugando con fuego',
  'Pirotecnia',
  'Quema de pastizal',
  'Intencional · investigar',
  'Indeterminada',
];

interface ParteData {
  numero: string;
  tipo: keyof typeof TIPOS_INCIDENTE;
  propiedad: string;
  causa: string;
  ignicion: string;
  victimas: number;
  heridos: number;
  perdidaEstimada: number;
  hectareas: number;
  narrativa: string;
}

const PASOS_DEF: Array<{ id: Paso; titulo: string; descripcion: string }> = [
  { id: 1, titulo: 'Clasificación', descripcion: 'Tipo + propiedad afectada' },
  { id: 2, titulo: 'Causa', descripcion: 'Origen y factor de ignición' },
  { id: 3, titulo: 'Impacto', descripcion: 'Víctimas + daños' },
  { id: 4, titulo: 'Relato', descripcion: 'Narrativa + croquis' },
  { id: 5, titulo: 'Firma', descripcion: 'Código del jefe' },
];

export default function ParteNFIRSPage() {
  const toast = useToast();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawingRef = useRef(false);

  const [paso, setPaso] = useState<Paso>(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [firmado, setFirmado] = useState(false);
  const [otpRequest, setOtpRequest] = useState(false);
  const [otp, setOtp] = useState('');
  const [confirmaFirma, setConfirmaFirma] = useState(false);
  const [hashFirma, setHashFirma] = useState<string>('');

  const [numeroInicial] = useState(
    () => 'PS-' + demoToday().getFullYear() + '-' + Math.random().toString().slice(2, 8),
  );

  const [data, setData] = useState<ParteData>({
    numero: numeroInicial,
    tipo: '111',
    propiedad: '419 · Vivienda unifamiliar',
    causa: 'Cocina · grasa/aceite',
    ignicion: 'Grasa caliente sobre hornalla encendida sin supervisión',
    victimas: 0,
    heridos: 1,
    perdidaEstimada: 250000,
    hectareas: 0,
    narrativa:
      'Llamado al 100 a las 22:15 hs por incendio en cocina. Llegada al lugar 4 min. Foco controlado con extintor + linea 38mm. Una persona con quemaduras leves en mano derecha, trasladada por SAME al Hosp. Municipal. Sin propagación a otras áreas. Acta de causa probable: grasa caliente desatendida en hornalla.',
  });

  function validarPaso(p: Paso): Record<string, string> {
    const e: Record<string, string> = {};
    if (p === 1) {
      if (!data.tipo) e.tipo = 'Seleccioná tipo';
      if (!data.propiedad) e.propiedad = 'Seleccioná propiedad';
    }
    if (p === 2) {
      if (!data.causa) e.causa = 'Seleccioná causa probable';
      if (data.ignicion.trim().length < 5) e.ignicion = 'Describí el factor de ignición (mín 5)';
    }
    if (p === 3) {
      if (data.victimas < 0) e.victimas = 'No puede ser negativo';
      if (data.heridos < 0) e.heridos = 'No puede ser negativo';
      if (data.perdidaEstimada < 0) e.perdidaEstimada = 'No puede ser negativo';
      if (data.tipo.startsWith('13') && data.hectareas <= 0) {
        e.hectareas = 'Forestal requiere hectáreas afectadas';
      }
    }
    if (p === 4) {
      if (data.narrativa.trim().length < 80) {
        e.narrativa = `Mínimo 80 caracteres (faltan ${80 - data.narrativa.trim().length})`;
      }
    }
    return e;
  }

  function siguiente() {
    const e = validarPaso(paso);
    if (Object.keys(e).length > 0) {
      setErrors(e);
      toast.push({
        kind: 'warn',
        title: 'Revisá el paso',
        description: Object.values(e)[0] ?? 'Faltan campos',
      });
      return;
    }
    setErrors({});
    if (paso < 5) setPaso(((paso as number) + 1) as Paso);
  }

  function anterior() {
    setErrors({});
    if (paso > 1) setPaso(((paso as number) - 1) as Paso);
  }

  // Canvas
  function iniciarDibujo(e: React.PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    drawingRef.current = true;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  }
  function dibujar(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawingRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#dc2626';
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  }
  function detenerDibujo() {
    drawingRef.current = false;
  }
  function limpiarCanvas() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  // Firma OTP
  function pedirOTP() {
    setOtpRequest(true);
    toast.push({
      kind: 'info',
      title: 'Código enviado al celular',
      description: 'Te llega un SMS con el código',
    });
  }
  function intentarFirmar() {
    if (otp !== '000000') {
      setErrors({ otp: 'Código incorrecto' });
      return;
    }
    setErrors({});
    setConfirmaFirma(true);
  }
  async function firmarFinal() {
    setConfirmaFirma(false);
    // Calcular hash SHA-256 del parte
    const json = JSON.stringify(data);
    const buf = new TextEncoder().encode(json);
    const hash = await crypto.subtle.digest('SHA-256', buf);
    const hex = Array.from(new Uint8Array(hash))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
    setHashFirma(hex);
    setFirmado(true);
    toast.push({
      kind: 'success',
      title: 'Parte firmado',
      description: 'Quedó registrado de forma permanente.',
    });
  }

  const progress = (paso / 5) * 100;

  // Estado FIRMADO: vista de éxito
  if (firmado) {
    return (
      <div className="mx-auto max-w-3xl space-y-5">
        <Card className="border-status-ok/30 bg-status-ok-bg/30 border-2">
          <CardContent className="p-8 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
              className="bg-status-ok mx-auto grid h-20 w-20 place-items-center rounded-full text-white shadow-lg"
            >
              <CheckCircle2 size={40} />
            </motion.div>
            <h2 className="mt-4 text-2xl font-bold text-slate-900">Parte firmado y archivado</h2>
            <p className="mt-1 text-sm text-slate-600">
              {data.numero} · {new Date().toLocaleString('es-AR')}
            </p>

            <div className="bg-brand-50 border-brand-100 mx-auto mt-4 max-w-md rounded-lg border p-3 text-left">
              <div className="text-brand-900 text-xs font-bold uppercase">Comprobante único</div>
              <div className="text-brand-800 mt-1 break-all font-mono text-[10px]">{hashFirma}</div>
            </div>

            <div className="mt-6 flex flex-wrap justify-center gap-2">
              <Button
                intent="primary"
                onClick={() =>
                  toast.push({
                    kind: 'success',
                    title: 'PDF descargado',
                    description: `${data.numero} · 4 páginas · firmado`,
                  })
                }
              >
                <Download size={14} /> Descargar PDF firmado
              </Button>
              <Button
                intent="secondary"
                onClick={() =>
                  toast.push({
                    kind: 'success',
                    title: 'Sumado al cómputo del mes',
                    description: '+1.5 hs accidental para la dotación',
                  })
                }
              >
                <Flame size={14} /> Sumar a cómputo
              </Button>
              <Button
                intent="ghost"
                onClick={() => {
                  setFirmado(false);
                  setPaso(1);
                  setOtp('');
                  setOtpRequest(false);
                  setData({
                    ...data,
                    numero:
                      'PS-' +
                      demoToday().getFullYear() +
                      '-' +
                      Math.random().toString().slice(2, 8),
                  });
                }}
              >
                Cargar otro parte
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-50">
          <CardContent className="flex items-start gap-3 p-4 text-sm text-slate-600">
            <ShieldCheck size={18} className="mt-0.5 shrink-0 text-slate-400" />
            <div>
              <strong className="text-slate-900">Queda registrado de forma permanente.</strong> El
              parte se vincula con la rendición del mes y no se puede modificar después de firmarlo.
              Si necesitás corregir algo, queda un nuevo parte vinculado al original.
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <PageHero
        objetivo="Vista Mando · Parte de servicio"
        titulo="Parte de servicio · paso a paso"
        descripcion="Cargá los datos del servicio paso a paso. Al final lo firmás con un código que te llega al celular."
        icono={<FileText size={26} />}
        meta={
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Kpi
              label="N° parte"
              value={data.numero.slice(-6)}
              hint="auto-generado"
              intent="brand"
            />
            <Kpi
              label="Tipo"
              value={data.tipo}
              hint={TIPOS_INCIDENTE[data.tipo].split('·')[0]}
              intent="brand"
            />
            <Kpi
              label="Pérdida"
              value={`$${(data.perdidaEstimada / 1000).toFixed(0)}K`}
              intent="warn"
            />
            <Kpi label="Paso" value={`${paso}/5`} hint={PASOS_DEF[paso - 1]!.titulo} intent="ok" />
          </div>
        }
      />

      {/* Stepper visual */}
      <Card className="overflow-hidden">
        <CardContent className="p-4 sm:p-5">
          <div className="mb-3 flex items-center justify-between text-xs">
            <span className="font-bold text-slate-900">{PASOS_DEF[paso - 1]!.titulo}</span>
            <span className="text-slate-500">{progress}% completado</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
            <motion.div
              className="bg-brand-600 h-full"
              initial={false}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
          <div className="mt-3 flex items-center justify-between gap-2">
            {PASOS_DEF.map((p) => (
              <div key={p.id} className="flex flex-1 flex-col items-center text-center">
                <div
                  className={cn(
                    'grid h-7 w-7 place-items-center rounded-full text-xs font-bold',
                    p.id < paso
                      ? 'bg-status-ok text-white'
                      : p.id === paso
                        ? 'bg-brand-600 text-white shadow-md'
                        : 'bg-slate-100 text-slate-500',
                  )}
                >
                  {p.id < paso ? <Check size={12} /> : p.id}
                </div>
                <span
                  className={cn(
                    'mt-1 hidden text-[10px] sm:inline',
                    p.id === paso ? 'text-brand-700 font-bold' : 'text-slate-500',
                  )}
                >
                  {p.titulo}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <AnimatePresence mode="wait">
        {/* PASO 1 · Clasificación */}
        {paso === 1 && (
          <motion.div
            key="paso1"
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
          >
            <Card>
              <CardContent className="space-y-4 p-5">
                <h2 className="text-lg font-bold text-slate-900">¿Qué tipo de incidente fue?</h2>

                <div>
                  <label className="mb-1 block text-xs font-bold uppercase text-slate-500">
                    <Hash size={11} className="mr-1 inline" />
                    Tipo de servicio *
                  </label>
                  <div className="relative">
                    <select
                      value={data.tipo}
                      onChange={(e) =>
                        setData((d) => ({
                          ...d,
                          tipo: e.target.value as keyof typeof TIPOS_INCIDENTE,
                        }))
                      }
                      className={cn(
                        'focus:border-brand-400 w-full appearance-none rounded-lg border bg-white px-3 py-2 pr-8 text-sm outline-none focus:ring-2',
                        errors.tipo ? 'border-status-risk' : 'border-slate-200',
                      )}
                    >
                      {Object.entries(TIPOS_INCIDENTE).map(([codigo, label]) => (
                        <option key={codigo} value={codigo}>
                          {codigo} · {label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      size={14}
                      className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                  </div>
                  {errors.tipo && (
                    <p className="text-status-risk-fg mt-1 text-xs font-medium">{errors.tipo}</p>
                  )}
                </div>

                <div>
                  <label className="mb-1 block text-xs font-bold uppercase text-slate-500">
                    Propiedad afectada *
                  </label>
                  <select
                    value={data.propiedad}
                    onChange={(e) => setData((d) => ({ ...d, propiedad: e.target.value }))}
                    className="focus:border-brand-400 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2"
                  >
                    {PROPIEDADES.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="bg-brand-50 text-brand-900 rounded-lg p-3 text-xs">
                  <strong>Tip:</strong> el código NFPA es estándar internacional. La elección acá
                  determina qué campos pedimos después (por ej. forestal pide hectáreas).
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* PASO 2 · Causa */}
        {paso === 2 && (
          <motion.div
            key="paso2"
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
          >
            <Card>
              <CardContent className="space-y-4 p-5">
                <h2 className="text-lg font-bold text-slate-900">Causa probable</h2>

                <div>
                  <label className="mb-1 block text-xs font-bold uppercase text-slate-500">
                    Causa *
                  </label>
                  <select
                    value={data.causa}
                    onChange={(e) => setData((d) => ({ ...d, causa: e.target.value }))}
                    className="focus:border-brand-400 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2"
                  >
                    {CAUSAS_PROBABLES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-bold uppercase text-slate-500">
                    Factor de ignición *
                  </label>
                  <input
                    type="text"
                    value={data.ignicion}
                    onChange={(e) => {
                      setData((d) => ({ ...d, ignicion: e.target.value }));
                      if (errors.ignicion) setErrors((er) => ({ ...er, ignicion: '' }));
                    }}
                    placeholder="Describí brevemente qué generó la ignición"
                    className={cn(
                      'focus:border-brand-400 w-full rounded-lg border bg-white px-3 py-2 text-sm outline-none focus:ring-2',
                      errors.ignicion ? 'border-status-risk' : 'border-slate-200',
                    )}
                  />
                  {errors.ignicion && (
                    <p className="text-status-risk-fg mt-1 text-xs font-medium">
                      {errors.ignicion}
                    </p>
                  )}
                </div>

                <div className="bg-status-warn-bg/30 text-status-warn-fg rounded-lg p-3 text-xs">
                  <strong>⚠ Importante:</strong> Si la causa es{' '}
                  <em>&ldquo;Intencional · investigar&rdquo;</em>, el parte se manda automáticamente
                  a Defensa Civil y queda marcado en el log.
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* PASO 3 · Impacto */}
        {paso === 3 && (
          <motion.div
            key="paso3"
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
          >
            <Card>
              <CardContent className="space-y-4 p-5">
                <h2 className="text-lg font-bold text-slate-900">Víctimas y daños</h2>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-xs font-bold uppercase text-slate-500">
                      Víctimas fatales
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={data.victimas}
                      onChange={(e) => setData((d) => ({ ...d, victimas: Number(e.target.value) }))}
                      className="focus:border-brand-400 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2"
                    />
                    {errors.victimas && (
                      <p className="text-status-risk-fg mt-1 text-xs font-medium">
                        {errors.victimas}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-bold uppercase text-slate-500">
                      Heridos
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={data.heridos}
                      onChange={(e) => setData((d) => ({ ...d, heridos: Number(e.target.value) }))}
                      className="focus:border-brand-400 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2"
                    />
                    {errors.heridos && (
                      <p className="text-status-risk-fg mt-1 text-xs font-medium">
                        {errors.heridos}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-bold uppercase text-slate-500">
                    Pérdida estimada (ARS)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={data.perdidaEstimada}
                    onChange={(e) =>
                      setData((d) => ({ ...d, perdidaEstimada: Number(e.target.value) }))
                    }
                    className="focus:border-brand-400 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2"
                  />
                  <p className="mt-1 text-xs text-slate-500">
                    Estimación inicial · puede actualizarse luego con peritaje
                  </p>
                </div>

                {data.tipo.startsWith('13') && (
                  <div>
                    <label className="mb-1 block text-xs font-bold uppercase text-slate-500">
                      Hectáreas afectadas (forestal) *
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min={0}
                      value={data.hectareas}
                      onChange={(e) =>
                        setData((d) => ({ ...d, hectareas: Number(e.target.value) }))
                      }
                      className={cn(
                        'focus:border-brand-400 w-full rounded-lg border bg-white px-3 py-2 text-sm outline-none focus:ring-2',
                        errors.hectareas ? 'border-status-risk' : 'border-slate-200',
                      )}
                    />
                    {errors.hectareas && (
                      <p className="text-status-risk-fg mt-1 text-xs font-medium">
                        {errors.hectareas}
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* PASO 4 · Narrativa + croquis */}
        {paso === 4 && (
          <motion.div
            key="paso4"
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            className="space-y-4"
          >
            <Card>
              <CardContent className="p-5">
                <h2 className="mb-3 text-lg font-bold text-slate-900">Relato del incidente</h2>
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase text-slate-500">
                    Narrativa del jefe de servicio * (mín 80 caracteres)
                  </label>
                  <textarea
                    value={data.narrativa}
                    onChange={(e) => {
                      setData((d) => ({ ...d, narrativa: e.target.value }));
                      if (errors.narrativa) setErrors((er) => ({ ...er, narrativa: '' }));
                    }}
                    rows={6}
                    className={cn(
                      'focus:border-brand-400 w-full rounded-lg border bg-white px-3 py-2 text-sm outline-none focus:ring-2',
                      errors.narrativa ? 'border-status-risk' : 'border-slate-200',
                    )}
                  />
                  {errors.narrativa ? (
                    <p className="text-status-risk-fg mt-1 text-xs font-medium">
                      {errors.narrativa}
                    </p>
                  ) : (
                    <p className="mt-1 text-xs text-slate-500">
                      {data.narrativa.trim().length} caracteres · mínimo 80
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-5">
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-xs font-bold uppercase text-slate-500">
                    <Paintbrush size={11} className="mr-1 inline" />
                    Croquis de escena (opcional)
                  </label>
                  <Button intent="ghost" size="sm" onClick={limpiarCanvas}>
                    Limpiar
                  </Button>
                </div>
                <canvas
                  ref={canvasRef}
                  width={760}
                  height={280}
                  onPointerDown={iniciarDibujo}
                  onPointerMove={dibujar}
                  onPointerUp={detenerDibujo}
                  onPointerLeave={detenerDibujo}
                  className="w-full cursor-crosshair touch-none rounded-lg border-2 border-dashed border-slate-300 bg-slate-50"
                />
                <p className="mt-1 text-xs text-slate-500">
                  Dibujá con dedo o mouse · Iconos sugeridos: 🚒 móvil · 🔥 foco · 👤 víctima · 💧
                  hidrante
                </p>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* PASO 5 · Firma OTP */}
        {paso === 5 && (
          <motion.div
            key="paso5"
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            className="space-y-4"
          >
            {/* Resumen final */}
            <Card>
              <CardContent className="p-5">
                <h2 className="mb-3 text-lg font-bold text-slate-900">Revisá antes de firmar</h2>
                <dl className="divide-y divide-slate-100 text-sm">
                  {[
                    ['Número', data.numero],
                    ['Tipo', `${data.tipo} · ${TIPOS_INCIDENTE[data.tipo]}`],
                    ['Propiedad', data.propiedad],
                    ['Causa', data.causa],
                    ['Ignición', data.ignicion],
                    ['Víctimas', `${data.victimas} fatales · ${data.heridos} heridos`],
                    ['Pérdida estimada', `$${data.perdidaEstimada.toLocaleString('es-AR')}`],
                    ...(data.hectareas > 0
                      ? ([['Hectáreas', `${data.hectareas} ha`]] as Array<[string, string]>)
                      : []),
                  ].map(([k, v]) => (
                    <div key={k} className="grid grid-cols-[140px_1fr] gap-2 py-2">
                      <dt className="text-xs text-slate-500">{k}</dt>
                      <dd className="text-slate-900">{v}</dd>
                    </div>
                  ))}
                </dl>
                <div className="mt-3 rounded-lg bg-slate-50 p-3">
                  <div className="text-xs font-bold uppercase text-slate-500">Narrativa</div>
                  <p className="mt-1 text-sm text-slate-700">{data.narrativa}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-brand-200 border-2">
              <CardContent className="p-5">
                <div className="flex items-start gap-3">
                  <div className="bg-brand-600 grid h-12 w-12 shrink-0 place-items-center rounded-xl text-white">
                    <KeyRound size={20} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-slate-900">Firmar con código de seguridad</h3>
                    <p className="mt-0.5 text-sm text-slate-600">
                      Después de firmar no se puede editar más. Tomate tu tiempo para revisar.
                    </p>

                    {!otpRequest ? (
                      <Button intent="primary" onClick={pedirOTP} className="mt-3">
                        <KeyRound size={14} /> Pedir código al celular
                      </Button>
                    ) : (
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <input
                          type="text"
                          value={otp}
                          onChange={(e) => {
                            setOtp(e.target.value.replace(/\D/g, '').slice(0, 6));
                            if (errors.otp) setErrors((er) => ({ ...er, otp: '' }));
                          }}
                          placeholder="000000"
                          maxLength={6}
                          className={cn(
                            'w-32 rounded-lg border px-3 py-2 text-center font-mono text-lg outline-none focus:ring-2',
                            errors.otp
                              ? 'border-status-risk focus:ring-status-risk-bg'
                              : 'focus:border-brand-400 border-slate-200',
                          )}
                        />
                        <Button
                          intent="success"
                          onClick={intentarFirmar}
                          disabled={otp.length !== 6}
                        >
                          <Check size={14} /> Firmar parte
                        </Button>
                      </div>
                    )}
                    {errors.otp && (
                      <p className="text-status-risk-fg mt-1 text-xs font-medium">{errors.otp}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navegación */}
      {paso < 5 && (
        <div className="flex items-center justify-between border-t border-slate-100 pt-4">
          <Button intent="ghost" onClick={anterior} disabled={paso === 1}>
            <ArrowLeft size={16} /> Anterior
          </Button>
          <Button intent="primary" onClick={siguiente}>
            Siguiente <ArrowRight size={16} />
          </Button>
        </div>
      )}
      {paso === 5 && (
        <div className="flex items-center justify-between border-t border-slate-100 pt-4">
          <Button intent="ghost" onClick={anterior}>
            <ArrowLeft size={16} /> Anterior
          </Button>
          <Badge intent="warn">
            <AlertCircle size={10} className="mr-1" />
            Después de firmar no se puede modificar
          </Badge>
        </div>
      )}

      <ConfirmDialog
        open={confirmaFirma}
        onClose={() => setConfirmaFirma(false)}
        onConfirm={firmarFinal}
        variant="warning"
        titulo="¿Firmar y archivar el parte?"
        descripcion="Al firmar, el parte queda guardado de forma permanente. No se puede editar más. Si necesitás corregir algo, vas a tener que hacer un parte nuevo."
        confirmarLabel="Sí, firmar"
      />
    </div>
  );
}
