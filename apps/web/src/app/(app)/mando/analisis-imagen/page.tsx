'use client';

import { motion } from 'framer-motion';
import {
  AlertCircle,
  Camera,
  CheckCircle2,
  Eye,
  Flame,
  Image as ImageIcon,
  Loader2,
  Sparkles,
  Upload,
} from 'lucide-react';
import { useState } from 'react';

import { Badge, Button, Card, CardContent, Kpi, cn, useToast } from '@faro/ui';

import { PageHero } from '../../../../components/shared/page-hero';

type Paso = 'subir' | 'analizando' | 'resultado';

interface Deteccion {
  label: string;
  confianza: number;
  bbox?: { x: number; y: number; w: number; h: number };
  categoria: 'propiedad' | 'daño' | 'objeto' | 'causa';
}

const DETECCIONES_DEMO: Deteccion[] = [
  { label: 'Vivienda unifamiliar', confianza: 0.97, categoria: 'propiedad' },
  { label: 'Cocina afectada', confianza: 0.94, categoria: 'daño' },
  { label: 'Hornalla a gas', confianza: 0.96, categoria: 'objeto' },
  { label: 'Olla quemada', confianza: 0.92, categoria: 'objeto' },
  { label: 'Mancha de hollín en pared', confianza: 0.89, categoria: 'daño' },
  { label: 'Aceite/grasa residual', confianza: 0.86, categoria: 'causa' },
  { label: 'Extintor ABC usado', confianza: 0.95, categoria: 'objeto' },
  { label: 'Sin daños estructurales graves', confianza: 0.93, categoria: 'daño' },
];

const NARRATIVA_IA = `Análisis Claude Vision de 4 fotografías del incidente:

PROPIEDAD: Vivienda unifamiliar de planta baja, ambiente cocina-comedor de aprox. 18m². Pared norte presenta ennegrecimiento por hollín, sin compromiso estructural (97% confianza).

DAÑOS: Restringidos a un radio de ~2m alrededor de hornalla. Estimación material: $250.000 ARS (cocina + utensilios + repintar pared). Sin propagación.

CAUSA PROBABLE: Aceite/grasa caliente desatendido sobre hornalla a gas encendida. Compatible con relato del jefe de servicio.

OBJETO DE EXTINCIÓN: Extintor ABC visible en escena, vacío. Posiblemente operado por residente antes de llegada de dotación.

CALIDAD DE EVIDENCIA: Alta. Fotos bien iluminadas, ángulos múltiples, escena no contaminada por civiles. Sirve para presentación a aseguradora.

⚠ Esta narrativa es asistida por IA. El jefe de servicio valida y firma. La IA no concluye sobre culpabilidad ni causa legal.`;

export default function AnalisisImagenPage() {
  const toast = useToast();
  const [paso, setPaso] = useState<Paso>('subir');
  const [imagenes, setImagenes] = useState<number>(0);
  const [detecciones, setDetecciones] = useState<Deteccion[]>([]);

  function subir() {
    setImagenes(4);
    setPaso('analizando');
    setTimeout(() => {
      setDetecciones(DETECCIONES_DEMO);
      setPaso('resultado');
    }, 2400);
  }

  function aprobarNarrativa() {
    toast.push({
      kind: 'success',
      title: 'Narrativa agregada al parte',
      description: 'Con disclosure IA documentado',
    });
  }

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <PageHero
        objetivo="Vista Mando · Asistente IA · Análisis imágenes"
        titulo="Claude Vision analiza fotos del incidente"
        descripcion="Detecta propiedad, daños, objetos, causa probable. Genera narrativa para el parte. Disclosure obligatorio."
        icono={<Eye size={26} />}
        meta={
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Kpi label="Imágenes" value={imagenes} intent="brand" />
            <Kpi label="Detecciones" value={detecciones.length} intent="brand" />
            <Kpi label="Tiempo" value={paso === 'resultado' ? '2.4s' : '—'} intent="ok" />
            <Kpi
              label="Estado"
              value={paso === 'subir' ? 'Listo' : paso === 'analizando' ? 'Analizando' : 'Listo'}
              intent={paso === 'resultado' ? 'ok' : 'brand'}
            />
          </div>
        }
      />

      {paso === 'subir' && (
        <Card className="border-brand-200 border-2">
          <CardContent className="p-8 text-center">
            <div className="bg-brand-600 mx-auto grid h-16 w-16 place-items-center rounded-2xl text-white shadow-md">
              <Upload size={28} />
            </div>
            <h2 className="mt-3 text-xl font-bold text-slate-900">Subí fotos del incidente</h2>
            <p className="mx-auto mt-1 max-w-md text-sm text-slate-600">
              Claude Vision analiza tipo de propiedad, alcance de daños, objetos relevantes y causa
              probable. JPG, PNG. Máx 8MB por imagen.
            </p>
            <Button intent="primary" size="lg" onClick={subir} className="mt-4">
              <Camera size={16} /> Subir 4 fotos de muestra
            </Button>
          </CardContent>
        </Card>
      )}

      {paso === 'analizando' && (
        <Card className="bg-brand-50/40 border-brand-100">
          <CardContent className="p-8 text-center">
            <Loader2 size={40} className="text-brand-600 mx-auto animate-spin" />
            <h2 className="text-brand-900 mt-3 text-xl font-bold">Claude Vision analizando...</h2>
            <div className="mx-auto mt-4 max-w-md space-y-1.5">
              {[
                'Detectando propiedad y entorno',
                'Identificando objetos y daños',
                'Cruzando con relato del jefe',
                'Generando narrativa',
              ].map((s, idx) => (
                <motion.div
                  key={s}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.4 }}
                  className="flex items-center gap-2 text-sm text-slate-700"
                >
                  <CheckCircle2 size={12} className="text-status-ok-fg" />
                  {s}
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {paso === 'resultado' && (
        <>
          {/* Fotos mockup */}
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="relative aspect-square overflow-hidden rounded-lg bg-slate-200"
                  >
                    <div className="absolute inset-0 grid place-items-center">
                      <ImageIcon size={32} className="text-slate-400" />
                    </div>
                    <div className="absolute bottom-1 left-1 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-bold text-white">
                      Foto {i + 1}
                    </div>
                    <div className="bg-status-ok absolute right-1 top-1 grid h-5 w-5 place-items-center rounded text-[10px] font-bold text-white">
                      ✓
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Detecciones */}
          <Card>
            <CardContent className="p-0">
              <div className="border-b border-slate-100 px-5 py-3">
                <h3 className="font-bold text-slate-900">Detecciones de Claude Vision</h3>
                <p className="mt-0.5 text-xs text-slate-500">
                  8 elementos identificados · confianza promedio{' '}
                  {Math.round(
                    (detecciones.reduce((a, d) => a + d.confianza, 0) / detecciones.length) * 100,
                  )}
                  %
                </p>
              </div>
              <div className="grid gap-2 p-4 sm:grid-cols-2">
                {detecciones.map((d, idx) => (
                  <motion.div
                    key={d.label}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.04 }}
                    className={cn(
                      'flex items-center gap-2 rounded-lg p-2 text-sm',
                      d.categoria === 'propiedad'
                        ? 'bg-brand-50'
                        : d.categoria === 'daño'
                          ? 'bg-status-warn-bg/30'
                          : d.categoria === 'objeto'
                            ? 'bg-slate-50'
                            : 'bg-status-risk-bg/20',
                    )}
                  >
                    <Badge
                      intent={
                        d.categoria === 'daño' ? 'warn' : d.categoria === 'causa' ? 'risk' : 'brand'
                      }
                    >
                      {d.categoria}
                    </Badge>
                    <span className="flex-1 text-slate-900">{d.label}</span>
                    <span className="text-xs font-bold text-slate-500">
                      {Math.round(d.confianza * 100)}%
                    </span>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Narrativa */}
          <Card>
            <CardContent className="p-0">
              <div className="border-b border-slate-100 px-5 py-3">
                <h3 className="flex items-center gap-2 font-bold text-slate-900">
                  <Sparkles size={16} className="text-brand-700" />
                  Narrativa generada por IA
                </h3>
                <p className="mt-0.5 text-xs text-slate-500">
                  Lista para incluir en el parte de servicio
                </p>
              </div>
              <pre className="whitespace-pre-wrap rounded p-5 font-sans text-sm leading-relaxed text-slate-900">
                {NARRATIVA_IA}
              </pre>
            </CardContent>
          </Card>

          {/* Disclosure */}
          <Card className="border-status-warn/30 bg-status-warn-bg/20 border-2">
            <CardContent className="flex items-start gap-3 p-4">
              <AlertCircle size={18} className="text-status-warn-fg mt-0.5 shrink-0" />
              <div className="text-sm">
                <strong className="text-status-warn-fg">Disclosure IA · obligatorio</strong>
                <p className="text-status-warn-fg/80 mt-1">
                  El análisis por imágenes es asistido por IA. El jefe valida y asume
                  responsabilidad. La IA NO concluye sobre causalidad legal. Las fotos originales
                  quedan archivadas como prueba.
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-2">
            <Button intent="ghost" size="lg">
              Descartar análisis
            </Button>
            <Button intent="success" size="lg" onClick={aprobarNarrativa}>
              <Flame size={16} /> Agregar al parte
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
