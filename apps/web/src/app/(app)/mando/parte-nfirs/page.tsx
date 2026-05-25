'use client';

import { motion } from 'framer-motion';
import {
  AlertCircle,
  Check,
  ChevronDown,
  FileText,
  Flame,
  Hash,
  KeyRound,
  Paintbrush,
  Save,
  ShieldCheck,
} from 'lucide-react';
import { useRef, useState } from 'react';

import { Badge, Button, Card, CardContent, Kpi, useToast } from '@faro/ui';

import { PageHero } from '../../../../components/shared/page-hero';

// Códigos NFPA 901-equivalentes adaptados a Argentina
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
  '400': 'HAZMAT · genérico',
  '411': 'HAZMAT · derrame gas',
  '412': 'HAZMAT · derrame combustible',
  '500': 'Servicio comunitario',
  '622': 'Asistencia ciudadanos · genérico',
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
  'Calefactor · cercanía con material combustible',
  'Vela/llama abierta',
  'Niños jugando con fuego',
  'Pirotecnia',
  'Quema de pastizal',
  'Intencional · investigar',
  'Indeterminada',
];

interface ParteNFIRS {
  numero: string;
  tipo: keyof typeof TIPOS_INCIDENTE | '';
  propiedad: string;
  causa: string;
  ignicion: string;
  victimas: number;
  heridos: number;
  perdidaEstimada: number;
  hectareas: number;
  narrativa: string;
  croquisDataUrl?: string;
  firmado: boolean;
  otpIngresado: string;
}

export default function ParteNFIRSPage() {
  const toast = useToast();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawingRef = useRef(false);

  const [parte, setParte] = useState<ParteNFIRS>({
    numero: 'NFIRS-2026-' + Math.random().toString().slice(2, 8),
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
    firmado: false,
    otpIngresado: '',
  });

  const [otpRequest, setOtpRequest] = useState(false);

  // Canvas drawing
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

  function pedirOTP() {
    setOtpRequest(true);
    toast.push({
      kind: 'info',
      title: 'OTP enviado',
      description: 'Código 000000 (modo demo)',
    });
  }

  function firmar() {
    if (parte.otpIngresado.trim() !== '000000') {
      toast.push({
        kind: 'warn',
        title: 'OTP incorrecto',
        description: 'En modo demo, el código es 000000',
      });
      return;
    }
    setParte((p) => ({ ...p, firmado: true }));
    setOtpRequest(false);
    toast.push({
      kind: 'success',
      title: 'Parte firmado digitalmente',
      description: `Hash sellado: sha256:${Math.random().toString(36).slice(2, 18)}...`,
    });
  }

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <PageHero
        objetivo="Vista Mando · Parte NFIRS-equivalente"
        titulo={parte.firmado ? 'Parte firmado y archivado' : 'Parte de servicio NFIRS-AR'}
        descripcion="Estandarizado según NFPA 901 (adaptado a Argentina). Códigos compatibles con consolidados nacionales y exportable a SNBV."
        icono={<FileText size={26} />}
        variant={parte.firmado ? 'success' : 'default'}
        meta={
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Kpi
              label="N° parte"
              value={parte.numero.slice(-6)}
              hint={parte.numero.slice(0, 10)}
              intent="brand"
            />
            <Kpi label="Tipo" value={parte.tipo || '—'} intent="brand" />
            <Kpi
              label="Pérdida"
              value={`$${(parte.perdidaEstimada / 1000).toFixed(0)}K`}
              intent="warn"
            />
            <Kpi
              label="Estado"
              value={parte.firmado ? 'Firmado' : 'Borrador'}
              intent={parte.firmado ? 'ok' : 'warn'}
            />
          </div>
        }
      />

      <Card>
        <CardContent className="space-y-5 p-5">
          {/* Códigos NFPA */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-bold uppercase text-slate-500">
                <Hash size={11} className="mr-1 inline" />
                Tipo de incidente (NFPA 901)
              </label>
              <div className="relative">
                <select
                  value={parte.tipo}
                  onChange={(e) =>
                    setParte((p) => ({
                      ...p,
                      tipo: e.target.value as keyof typeof TIPOS_INCIDENTE,
                    }))
                  }
                  disabled={parte.firmado}
                  className="focus:border-brand-400 w-full appearance-none rounded-lg border border-slate-200 bg-white px-3 py-2 pr-8 text-sm outline-none focus:ring-2"
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
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold uppercase text-slate-500">
                Propiedad afectada (NFPA 901)
              </label>
              <select
                value={parte.propiedad}
                onChange={(e) => setParte((p) => ({ ...p, propiedad: e.target.value }))}
                disabled={parte.firmado}
                className="focus:border-brand-400 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2"
              >
                {PROPIEDADES.map((prop) => (
                  <option key={prop} value={prop}>
                    {prop}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold uppercase text-slate-500">
                Causa probable
              </label>
              <select
                value={parte.causa}
                onChange={(e) => setParte((p) => ({ ...p, causa: e.target.value }))}
                disabled={parte.firmado}
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
                Factor de ignición
              </label>
              <input
                type="text"
                value={parte.ignicion}
                onChange={(e) => setParte((p) => ({ ...p, ignicion: e.target.value }))}
                disabled={parte.firmado}
                className="focus:border-brand-400 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2"
              />
            </div>
          </div>

          {/* Métricas */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div>
              <label className="mb-1 block text-xs font-bold uppercase text-slate-500">
                Víctimas fatales
              </label>
              <input
                type="number"
                value={parte.victimas}
                onChange={(e) => setParte((p) => ({ ...p, victimas: Number(e.target.value) }))}
                disabled={parte.firmado}
                className="focus:border-brand-400 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold uppercase text-slate-500">
                Heridos
              </label>
              <input
                type="number"
                value={parte.heridos}
                onChange={(e) => setParte((p) => ({ ...p, heridos: Number(e.target.value) }))}
                disabled={parte.firmado}
                className="focus:border-brand-400 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold uppercase text-slate-500">
                Pérdida est. (ARS)
              </label>
              <input
                type="number"
                value={parte.perdidaEstimada}
                onChange={(e) =>
                  setParte((p) => ({ ...p, perdidaEstimada: Number(e.target.value) }))
                }
                disabled={parte.firmado}
                className="focus:border-brand-400 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold uppercase text-slate-500">
                Hectáreas (forestal)
              </label>
              <input
                type="number"
                step="0.1"
                value={parte.hectareas}
                onChange={(e) => setParte((p) => ({ ...p, hectareas: Number(e.target.value) }))}
                disabled={parte.firmado}
                className="focus:border-brand-400 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2"
              />
            </div>
          </div>

          {/* Narrativa */}
          <div>
            <label className="mb-1 block text-xs font-bold uppercase text-slate-500">
              Narrativa del jefe de servicio
            </label>
            <textarea
              value={parte.narrativa}
              onChange={(e) => setParte((p) => ({ ...p, narrativa: e.target.value }))}
              disabled={parte.firmado}
              rows={5}
              className="focus:border-brand-400 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2"
            />
            <p className="mt-1 text-xs text-slate-500">
              {parte.narrativa.length} caracteres · mínimo recomendado 80
            </p>
          </div>

          {/* Croquis canvas */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-xs font-bold uppercase text-slate-500">
                <Paintbrush size={11} className="mr-1 inline" />
                Croquis de escena
              </label>
              <Button intent="ghost" size="sm" onClick={limpiarCanvas}>
                Limpiar
              </Button>
            </div>
            <canvas
              ref={canvasRef}
              width={760}
              height={300}
              onPointerDown={iniciarDibujo}
              onPointerMove={dibujar}
              onPointerUp={detenerDibujo}
              onPointerLeave={detenerDibujo}
              className="w-full cursor-crosshair touch-none rounded-lg border-2 border-dashed border-slate-300 bg-slate-50"
            />
            <p className="mt-1 text-xs text-slate-500">
              Dibujá el croquis con dedo o mouse. Iconos sugeridos: 🚒 móvil · 🔥 foco · 👤 víctima
              · 💧 hidrante
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Firma digital */}
      {!parte.firmado ? (
        <Card className="border-brand-200 border-2">
          <CardContent className="p-5">
            <div className="flex items-start gap-3">
              <div className="bg-brand-600 grid h-12 w-12 shrink-0 place-items-center rounded-xl text-white">
                <ShieldCheck size={22} />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-slate-900">Firma digital del jefe de servicio</h3>
                <p className="mt-0.5 text-sm text-slate-600">
                  Con tu firma el parte se sella y queda en audit log inmutable. No se podrá editar
                  más.
                </p>

                {!otpRequest ? (
                  <Button intent="primary" onClick={pedirOTP} className="mt-3">
                    <KeyRound size={14} /> Solicitar OTP para firmar
                  </Button>
                ) : (
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <input
                      type="text"
                      value={parte.otpIngresado}
                      onChange={(e) => setParte((p) => ({ ...p, otpIngresado: e.target.value }))}
                      placeholder="000000"
                      maxLength={6}
                      className="focus:border-brand-400 w-32 rounded-lg border border-slate-200 px-3 py-2 text-center font-mono text-lg outline-none focus:ring-2"
                    />
                    <Button intent="success" onClick={firmar}>
                      <Check size={14} /> Firmar parte
                    </Button>
                    <span className="text-xs text-slate-500">Demo OTP: 000000</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
          <Card className="border-status-ok/30 bg-status-ok-bg/30 border-2">
            <CardContent className="flex items-start gap-3 p-5">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring' }}
                className="bg-status-ok grid h-12 w-12 shrink-0 place-items-center rounded-xl text-white"
              >
                <ShieldCheck size={22} />
              </motion.div>
              <div className="flex-1">
                <h3 className="text-status-ok-fg font-bold">Parte firmado y archivado</h3>
                <p className="mt-0.5 text-sm text-slate-700">
                  Hash SHA-256 · {parte.numero} · {new Date().toLocaleString('es-AR')}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button intent="secondary" size="sm">
                    <Save size={14} /> Exportar PDF
                  </Button>
                  <Button intent="secondary" size="sm">
                    <Flame size={14} /> Sumar a cómputo
                  </Button>
                  <Badge intent="ok">
                    <ShieldCheck size={10} className="mr-1" />
                    Audit log
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <Card className="border-slate-200 bg-slate-50">
        <CardContent className="flex items-start gap-3 p-4 text-sm text-slate-600">
          <AlertCircle size={18} className="mt-0.5 shrink-0 text-slate-400" />
          <div>
            <strong className="text-slate-900">Compatibilidad NFPA 901-AR:</strong> los códigos
            500-700 series están adaptados a la realidad argentina (asistencia ciudadanos, servicios
            comunitarios) y son consolidables con NFIRS internacional para reportes comparativos.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
