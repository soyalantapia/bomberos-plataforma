'use client';

import {
  ArrowRight,
  Camera,
  Check,
  FileImage,
  ImagePlus,
  MapPin,
  Mic,
  Paperclip,
  Sparkles,
  Car,
  Flame,
  LifeBuoy,
  MoreHorizontal,
  Trash2,
  Trees,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useMemo, useRef, useState } from 'react';

import { Button, Card, cn, Input, Label, SectionHeader, Textarea, useToast } from '@faro/ui';

import {
  useFaroStore,
  selectPersonaActual,
  selectCuartelActivo,
} from '../../../../store/use-faro-store';
import { demoToday } from '../../../../lib/utils/demo-today';

import type { PropuestaServicioIA, TipoServicio } from '@faro/types';

type Step = 'tipo' | 'ubicacion' | 'movil' | 'dotacion' | 'horarios' | 'confirmar' | 'listo';

const PARTE_DEMO =
  'Incendio en Av. Alvear 4250 de Villa Ballester. Fuimos cuatro con el móvil BV-3. Salimos 22:15 y volvimos 23:48.';

const tipos: Array<{ value: TipoServicio; label: string; icon: React.ReactNode }> = [
  { value: 'incendio', label: 'Incendio', icon: <Flame size={26} /> },
  { value: 'rescate', label: 'Rescate', icon: <LifeBuoy size={26} /> },
  { value: 'accidente', label: 'Accidente', icon: <Car size={26} /> },
  { value: 'forestal', label: 'Forestal', icon: <Trees size={26} /> },
  { value: 'otro', label: 'Otro', icon: <MoreHorizontal size={26} /> },
];

const stepOrder: Step[] = ['tipo', 'ubicacion', 'movil', 'dotacion', 'horarios', 'confirmar'];

export default function RegistrarServicio() {
  const router = useRouter();
  const toast = useToast();
  const persona = useFaroStore(selectPersonaActual);
  const cuartel = useFaroStore(selectCuartelActivo);
  const moviles = useFaroStore((s) => s.moviles);
  const personas = useFaroStore((s) => s.personas);
  const crearServicio = useFaroStore((s) => s.crearServicio);

  const movilesCuartel = useMemo(
    () => moviles.filter((m) => m.cuartelId === cuartel?.id && m.enServicio),
    [moviles, cuartel],
  );
  const personasCuartel = useMemo(
    () => personas.filter((p) => p.cuartelId === cuartel?.id && p.estado === 'activo'),
    [personas, cuartel],
  );

  const now = demoToday();
  const horaActual = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  const ago30 = new Date(now.getTime() - 30 * 60_000);
  const horaInicio = `${String(ago30.getHours()).padStart(2, '0')}:${String(ago30.getMinutes()).padStart(2, '0')}`;

  const [step, setStep] = useState<Step>('tipo');
  const [tipo, setTipo] = useState<TipoServicio>();
  const [direccion, setDireccion] = useState('');
  const [movilId, setMovilId] = useState<string>();
  const [dotacionIds, setDotacionIds] = useState<string[]>(persona ? [persona.id] : []);
  const [horaSalida, setHoraSalida] = useState(horaInicio);
  const [horaRegreso, setHoraRegreso] = useState(horaActual);
  const [notas, setNotas] = useState('');
  const [iaUsada, setIaUsada] = useState(false);
  const [iaTexto, setIaTexto] = useState(PARTE_DEMO);
  const [iaCargando, setIaCargando] = useState(false);
  const [iaConfianza, setIaConfianza] = useState<number | null>(null);

  // Adjuntos
  interface Adjunto {
    id: string;
    nombre: string;
    tipo: 'foto' | 'doc' | 'video';
    pesoKb: number;
    color: string;
  }
  const [adjuntos, setAdjuntos] = useState<Adjunto[]>([]);
  const [arrastrando, setArrastrando] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function inferirTipoArchivo(file: File): Adjunto['tipo'] {
    if (file.type.startsWith('image/')) return 'foto';
    if (file.type.startsWith('video/')) return 'video';
    return 'doc';
  }

  function agregarAdjuntosReales(files: FileList) {
    const colores: Record<Adjunto['tipo'], string> = {
      foto: 'bg-brand-100 text-brand-700',
      doc: 'bg-status-warn-bg text-status-warn-fg',
      video: 'bg-fire-100 text-fire-700',
    };
    const nuevos: Adjunto[] = Array.from(files).map((f) => {
      const tipoArchivo = inferirTipoArchivo(f);
      return {
        id: `adj-${Date.now()}-${Math.random()}`,
        nombre: f.name,
        tipo: tipoArchivo,
        pesoKb: Math.max(1, Math.round(f.size / 1024)),
        color: colores[tipoArchivo],
      };
    });
    setAdjuntos((a) => [...a, ...nuevos]);
    if (nuevos.length > 0) {
      toast.push({
        kind: 'success',
        title: `${nuevos.length} archivo${nuevos.length === 1 ? '' : 's'} adjuntado${nuevos.length === 1 ? '' : 's'}`,
        description: nuevos.map((n) => n.nombre).join(', '),
      });
    }
  }

  function abrirSelectorArchivos() {
    fileInputRef.current?.click();
  }

  function eliminarAdjunto(id: string) {
    setAdjuntos((a) => a.filter((x) => x.id !== id));
  }

  function aplicarPropuesta(p: PropuestaServicioIA) {
    if (p.tipo) setTipo(p.tipo);
    if (p.direccion) setDireccion(p.direccion);
    if (p.movilCodigo) {
      const m = movilesCuartel.find((mo) => mo.codigo === p.movilCodigo);
      if (m) setMovilId(m.id);
    }
    if (p.horaSalida) setHoraSalida(p.horaSalida);
    if (p.horaRegreso) setHoraRegreso(p.horaRegreso);
    if (p.dotacionLegajos && p.dotacionLegajos.length > 0) {
      const ids = p.dotacionLegajos
        .map((leg) => personasCuartel.find((per) => per.legajo === leg)?.id)
        .filter(Boolean) as string[];
      if (ids.length > 0) setDotacionIds(ids);
    } else if (persona && dotacionIds.length === 0) {
      setDotacionIds([persona.id]);
    }
    setIaUsada(true);
    setIaConfianza(p.confianza);
    setStep('ubicacion');
  }

  async function probarVoz() {
    const texto = iaTexto.trim() || PARTE_DEMO;
    setIaCargando(true);
    try {
      const resp = await fetch('/api/ai/extraer-servicio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ texto }),
      });
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const json = (await resp.json()) as { propuesta: PropuestaServicioIA };
      aplicarPropuesta(json.propuesta);
      toast.push({
        kind: 'success',
        title: 'Se llenaron los campos solos',
        description: `Confianza ${Math.round((json.propuesta.confianza ?? 0.6) * 100)}%. Revisá antes de confirmar.`,
      });
    } catch (err) {
      console.error('[ia voz]', err);
      toast.push({
        kind: 'error',
        title: 'No se pudo procesar el texto',
        description: 'Intentá de nuevo o cargá manualmente.',
      });
    } finally {
      setIaCargando(false);
    }
  }

  function confirmar() {
    if (!persona || !cuartel || !tipo || !direccion || !movilId || dotacionIds.length === 0) {
      toast.push({ kind: 'warn', title: 'Faltan datos' });
      return;
    }
    const fechaBase = now.toISOString().slice(0, 10);
    crearServicio({
      cuartelId: cuartel.id,
      tipo,
      direccion,
      lat: cuartel.lat,
      lng: cuartel.lng,
      movilId,
      dotacionIds,
      horaSalida: `${fechaBase}T${horaSalida}:00-03:00`,
      horaRegreso: `${fechaBase}T${horaRegreso}:00-03:00`,
      origen: 'app',
      creadoPor: persona.id,
      notas: notas || undefined,
    });
    setStep('listo');
  }

  const currentIdx = stepOrder.indexOf(step);
  const progress = step === 'listo' ? 100 : Math.round((currentIdx / (stepOrder.length - 1)) * 100);

  function avanzar() {
    if (step === 'horarios' && horaSalida && horaRegreso && horaSalida >= horaRegreso) {
      toast.push({
        kind: 'warn',
        title: 'Horario inválido',
        description: 'La hora de regreso debe ser después de la salida.',
      });
      return;
    }
    const next = stepOrder[currentIdx + 1];
    if (next) setStep(next);
  }

  if (step === 'listo') {
    return (
      <div className="mx-auto max-w-md space-y-5">
        <Card>
          <div className="p-8 text-center">
            <div className="bg-status-ok mx-auto grid h-20 w-20 place-items-center rounded-full text-white shadow-lg">
              <Check size={48} />
            </div>
            <h2 className="mt-4 text-2xl font-bold text-slate-900">Servicio registrado</h2>
            <p className="mt-1 text-slate-600">Se actualizaron en segundos:</p>
            <ul className="mx-auto mt-4 max-w-xs space-y-1.5 text-left">
              {[
                'Tu asistencia del día',
                'Cómputo del mes',
                'Servicios del cuartel',
                'Estado de la rendición',
              ].map((t) => (
                <li key={t} className="flex items-start gap-2 text-sm text-slate-700">
                  <Check size={18} className="text-status-ok mt-0.5" />
                  {t}
                </li>
              ))}
            </ul>
            <div className="mt-6 flex justify-center gap-2">
              <Button intent="secondary" onClick={() => router.push('/bombero')}>
                Volver al inicio
              </Button>
              <Button onClick={() => router.push('/mando')}>Ver inicio del Mando</Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  function canAdvance() {
    if (step === 'tipo') return !!tipo;
    if (step === 'ubicacion') return direccion.trim().length >= 3;
    if (step === 'movil') return !!movilId;
    if (step === 'dotacion') return dotacionIds.length > 0;
    if (step === 'horarios') {
      if (horaSalida && horaRegreso && horaSalida >= horaRegreso) return false;
      return true;
    }
    return true;
  }

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <SectionHeader
        title="Registrar servicio"
        description="Lo cargás una vez y se actualizan asistencia, cómputo y rendición."
      />

      {step === 'tipo' && (
        <div className="border-brand-100 from-brand-50 rounded-2xl border bg-gradient-to-br to-white p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <div className="bg-brand-600 grid h-10 w-10 shrink-0 place-items-center rounded-xl text-white">
              <Sparkles size={20} />
            </div>
            <div className="flex-1">
              <div className="font-semibold text-slate-900">Cargar por voz</div>
              <p className="mt-0.5 text-sm text-slate-600">
                Dictás el parte (o lo tipeás) y se llenan los campos solos. Vos revisás y confirmás.
              </p>
              <div className="mt-3">
                <Textarea
                  value={iaTexto}
                  onChange={(e) => setIaTexto(e.target.value)}
                  rows={3}
                  placeholder="Ej.: Incendio en Av. Alvear 4250, fuimos con BV-3, salimos 22:15..."
                  disabled={iaCargando}
                />
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Button intent="primary" size="md" onClick={probarVoz} disabled={iaCargando}>
                  <Mic size={18} /> {iaCargando ? 'Procesando...' : 'Probar carga por voz'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {iaUsada && step !== 'tipo' && (
        <div className="bg-brand-50 border-brand-100 flex items-center gap-2 rounded-lg border p-3 text-sm">
          <Sparkles size={16} className="text-brand-700" />
          <span className="text-brand-900 flex-1">
            Se llenaron los campos. Revisá y ajustá lo que haga falta.
          </span>
          {iaConfianza !== null && (
            <span className="bg-brand-100 text-brand-800 rounded-full px-2 py-0.5 text-xs font-semibold">
              Confianza {Math.round(iaConfianza * 100)}%
            </span>
          )}
        </div>
      )}

      <Card>
        <div className="border-b border-slate-100 px-5 pb-3 pt-4">
          <div className="mb-1.5 flex items-center justify-between">
            <div className="text-sm text-slate-600">
              Paso {currentIdx + 1} de {stepOrder.length}
            </div>
            {progress > 0 && (
              <div className="text-brand-700 text-sm font-semibold">{progress}%</div>
            )}
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-100">
            <div
              className="bg-brand-600 h-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="space-y-5 p-5">
          {step === 'tipo' && (
            <div>
              <Label>¿Qué tipo de servicio?</Label>
              <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-5">
                {tipos.map((t) => {
                  const active = tipo === t.value;
                  return (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => setTipo(t.value)}
                      className={cn(
                        'min-h-tap flex flex-col items-center gap-1.5 rounded-xl border-2 bg-white p-3 sm:p-4',
                        active
                          ? 'border-brand-600 bg-brand-50 text-brand-700'
                          : 'border-slate-200 text-slate-700',
                      )}
                    >
                      {t.icon}
                      <span className="text-sm font-semibold">{t.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {step === 'ubicacion' && (
            <div className="space-y-3">
              <Label>¿Dónde?</Label>
              <Input
                value={direccion}
                onChange={(e) => setDireccion(e.target.value)}
                placeholder="Av. Alvear 4250, Villa Ballester"
              />
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <MapPin size={14} /> GPS: {cuartel?.lat.toFixed(4)}, {cuartel?.lng.toFixed(4)}
              </div>
            </div>
          )}

          {step === 'movil' && (
            <div className="space-y-3">
              <Label>¿Qué móvil salió?</Label>
              <div className="grid gap-2 sm:grid-cols-3">
                {movilesCuartel.map((m) => {
                  const active = movilId === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setMovilId(m.id)}
                      className={cn(
                        'rounded-xl border-2 p-3 text-left',
                        active
                          ? 'border-brand-600 bg-brand-50'
                          : 'border-slate-200 bg-white hover:border-slate-300',
                      )}
                    >
                      <div className="text-lg font-bold text-slate-900">{m.codigo}</div>
                      <div className="text-sm capitalize text-slate-600">
                        {m.tipo} · {m.marca}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {step === 'dotacion' && (
            <div className="space-y-3">
              <Label>¿Quiénes fueron?</Label>
              <div className="text-xs text-slate-500">
                {dotacionIds.length} seleccionada{dotacionIds.length === 1 ? '' : 's'}
              </div>
              <div className="max-h-64 divide-y divide-slate-100 overflow-y-auto rounded-lg border border-slate-200">
                {personasCuartel.map((p) => {
                  const checked = dotacionIds.includes(p.id);
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() =>
                        setDotacionIds(
                          checked ? dotacionIds.filter((x) => x !== p.id) : [...dotacionIds, p.id],
                        )
                      }
                      className={cn(
                        'flex w-full items-center gap-3 px-3 py-2.5 text-left hover:bg-slate-50',
                        checked && 'bg-brand-50',
                      )}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium text-slate-900">
                          {p.nombre} {p.apellido}
                        </div>
                        <div className="text-xs text-slate-600">Legajo {p.legajo}</div>
                      </div>
                      <div
                        className={cn(
                          'grid h-6 w-6 place-items-center rounded-md border-2',
                          checked ? 'bg-brand-600 border-brand-600 text-white' : 'border-slate-300',
                        )}
                      >
                        {checked && <Check size={14} />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {step === 'horarios' && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="hs">Hora de salida</Label>
                <Input
                  id="hs"
                  type="time"
                  value={horaSalida}
                  onChange={(e) => setHoraSalida(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="hr">Hora de regreso</Label>
                <Input
                  id="hr"
                  type="time"
                  value={horaRegreso}
                  onChange={(e) => setHoraRegreso(e.target.value)}
                  aria-invalid={!!(horaSalida && horaRegreso && horaSalida >= horaRegreso)}
                />
                {horaSalida && horaRegreso && horaSalida >= horaRegreso && (
                  <p className="text-status-risk-fg mt-1 text-xs font-medium">
                    La hora de regreso debe ser después de la salida.
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="notas">Notas (opcional)</Label>
                <Textarea
                  id="notas"
                  value={notas}
                  onChange={(e) => setNotas(e.target.value)}
                  placeholder="Detalles del servicio."
                />
              </div>

              {/* Adjuntos · dropzone + thumbnails */}
              <div>
                <Label>Adjuntos (opcional)</Label>
                <p className="mt-1 text-xs text-slate-500">
                  Fotos del lugar, parte policial, video del operativo. Suben encriptados.
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*,video/*,.pdf"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      agregarAdjuntosReales(e.target.files);
                    }
                    // Reset para permitir adjuntar el mismo archivo de nuevo
                    e.target.value = '';
                  }}
                />
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setArrastrando(true);
                  }}
                  onDragLeave={() => setArrastrando(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setArrastrando(false);
                    if (e.dataTransfer.files.length > 0) {
                      agregarAdjuntosReales(e.dataTransfer.files);
                    }
                  }}
                  className={cn(
                    'mt-2 rounded-xl border-2 border-dashed p-4 text-center transition-colors',
                    arrastrando ? 'border-brand-400 bg-brand-50' : 'border-slate-200 bg-slate-50',
                  )}
                >
                  <Paperclip
                    size={28}
                    className={cn('mx-auto', arrastrando ? 'text-brand-600' : 'text-slate-400')}
                  />
                  <div className="mt-2 text-sm font-medium text-slate-700">
                    {arrastrando ? 'Soltá para subir' : 'Arrastrá archivos o tocá un botón'}
                  </div>
                  <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={abrirSelectorArchivos}
                      className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 hover:border-slate-300"
                    >
                      <Camera size={14} /> Foto
                    </button>
                    <button
                      type="button"
                      onClick={abrirSelectorArchivos}
                      className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 hover:border-slate-300"
                    >
                      <FileImage size={14} /> Documento
                    </button>
                    <button
                      type="button"
                      onClick={abrirSelectorArchivos}
                      className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 hover:border-slate-300"
                    >
                      <ImagePlus size={14} /> Video
                    </button>
                  </div>
                </div>

                {adjuntos.length > 0 && (
                  <div className="mt-3 space-y-2">
                    <div className="text-xs font-medium text-slate-600">
                      {adjuntos.length} archivo{adjuntos.length === 1 ? '' : 's'} adjunto
                      {adjuntos.length === 1 ? '' : 's'}
                    </div>
                    <ul className="space-y-1.5">
                      {adjuntos.map((a) => (
                        <li
                          key={a.id}
                          className="flex items-center gap-2.5 rounded-lg border border-slate-200 bg-white px-2.5 py-2"
                        >
                          <div
                            className={cn(
                              'grid h-9 w-9 shrink-0 place-items-center rounded-lg',
                              a.color,
                            )}
                          >
                            {a.tipo === 'foto' ? (
                              <Camera size={16} />
                            ) : a.tipo === 'doc' ? (
                              <FileImage size={16} />
                            ) : (
                              <ImagePlus size={16} />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="truncate text-sm font-medium text-slate-900">
                              {a.nombre}
                            </div>
                            <div className="text-[11px] text-slate-500">
                              {a.pesoKb >= 1024
                                ? (a.pesoKb / 1024).toFixed(1) + ' MB'
                                : a.pesoKb + ' KB'}{' '}
                              · subido ✓
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => eliminarAdjunto(a.id)}
                            className="text-status-risk hover:bg-status-risk-bg/50 grid h-8 w-8 place-items-center rounded-md"
                            aria-label="Eliminar"
                          >
                            <Trash2 size={14} />
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {step === 'confirmar' && (
            <div className="space-y-3">
              <h3 className="font-semibold text-slate-900">Revisá antes de guardar</h3>
              <div className="divide-y divide-slate-100 overflow-hidden rounded-lg border border-slate-200">
                {[
                  { k: 'Tipo', v: tipo ?? '—' },
                  { k: 'Ubicación', v: direccion },
                  { k: 'Móvil', v: movilesCuartel.find((m) => m.id === movilId)?.codigo ?? '—' },
                  { k: 'Dotación', v: `${dotacionIds.length} personas` },
                  { k: 'Salida', v: horaSalida },
                  { k: 'Regreso', v: horaRegreso },
                  ...(notas ? [{ k: 'Notas', v: notas }] : []),
                  ...(adjuntos.length > 0
                    ? [
                        {
                          k: 'Adjuntos',
                          v: `${adjuntos.length} archivo${adjuntos.length === 1 ? '' : 's'} (${adjuntos
                            .map((a) => a.tipo)
                            .join(', ')})`,
                        },
                      ]
                    : []),
                ].map((f) => (
                  <div key={f.k} className="flex px-3 py-2 text-sm">
                    <div className="w-24 text-slate-500">{f.k}</div>
                    <div className="flex-1 font-medium capitalize text-slate-900">{f.v}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-slate-100 p-4">
          <Button
            intent="ghost"
            onClick={() => {
              const prev = stepOrder[currentIdx - 1];
              if (prev) setStep(prev);
            }}
            disabled={currentIdx === 0}
          >
            Volver
          </Button>
          {step !== 'confirmar' ? (
            <Button onClick={avanzar} disabled={!canAdvance()}>
              Siguiente <ArrowRight size={18} />
            </Button>
          ) : (
            <Button intent="success" size="lg" onClick={confirmar}>
              <Check size={20} /> Confirmar servicio
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
