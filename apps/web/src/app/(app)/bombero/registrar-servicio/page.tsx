'use client';

import { ArrowRight, Check, MapPin, Mic, Sparkles, AlertTriangle, Car, Flame, LifeBuoy, MoreHorizontal, Trees } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';

import { Button, Card, cn, Input, Label, SectionHeader, Textarea, useToast } from '@faro/ui';

import { useFaroStore, selectPersonaActual, selectCuartelActivo } from '../../../../store/use-faro-store';

import type { TipoServicio } from '@faro/types';

type Step = 'tipo' | 'ubicacion' | 'movil' | 'dotacion' | 'horarios' | 'confirmar' | 'listo';

const PARTE_DEMO = 'Incendio en Av. Alvear 4250 de Villa Ballester. Fuimos cuatro con el móvil BV-3. Salimos 22:15 y volvimos 23:48.';

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

  const movilesCuartel = useMemo(() => moviles.filter((m) => m.cuartelId === cuartel?.id && m.enServicio), [moviles, cuartel]);
  const personasCuartel = useMemo(() => personas.filter((p) => p.cuartelId === cuartel?.id && p.estado === 'activo'), [personas, cuartel]);

  const now = new Date();
  const horaActual = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
  const ago30 = new Date(now.getTime() - 30 * 60_000);
  const horaInicio = `${String(ago30.getHours()).padStart(2,'0')}:${String(ago30.getMinutes()).padStart(2,'0')}`;

  const [step, setStep] = useState<Step>('tipo');
  const [tipo, setTipo] = useState<TipoServicio>();
  const [direccion, setDireccion] = useState('');
  const [movilId, setMovilId] = useState<string>();
  const [dotacionIds, setDotacionIds] = useState<string[]>(persona ? [persona.id] : []);
  const [horaSalida, setHoraSalida] = useState(horaInicio);
  const [horaRegreso, setHoraRegreso] = useState(horaActual);
  const [notas, setNotas] = useState('');
  const [iaUsada, setIaUsada] = useState(false);

  function probarVoz() {
    // Demo: parser regex simple
    const t = PARTE_DEMO.toLowerCase();
    if (t.includes('incendio')) setTipo('incendio');
    setDireccion('Av. Alvear 4250, Villa Ballester');
    const m = movilesCuartel.find((m) => m.codigo === 'BV-3');
    if (m) setMovilId(m.id);
    setHoraSalida('22:15');
    setHoraRegreso('23:48');
    setDotacionIds(personasCuartel.slice(0, 4).map((p) => p.id));
    setIaUsada(true);
    toast.push({ kind: 'success', title: 'IA llenó los campos', description: 'Revisá antes de confirmar.' });
    setStep('ubicacion');
  }

  function confirmar() {
    if (!persona || !cuartel || !tipo || !direccion || !movilId || dotacionIds.length === 0) {
      toast.push({ kind: 'warn', title: 'Faltan datos' });
      return;
    }
    const fechaBase = now.toISOString().slice(0, 10);
    crearServicio({
      cuartelId: cuartel.id, tipo, direccion, lat: cuartel.lat, lng: cuartel.lng,
      movilId, dotacionIds,
      horaSalida: `${fechaBase}T${horaSalida}:00-03:00`,
      horaRegreso: `${fechaBase}T${horaRegreso}:00-03:00`,
      origen: 'app', creadoPor: persona.id, notas: notas || undefined,
    });
    setStep('listo');
  }

  const currentIdx = stepOrder.indexOf(step);
  const progress = step === 'listo' ? 100 : Math.round((currentIdx / (stepOrder.length - 1)) * 100);

  function avanzar() {
    const next = stepOrder[currentIdx + 1];
    if (next) setStep(next);
  }

  if (step === 'listo') {
    return (
      <div className="max-w-md mx-auto space-y-5">
        <Card>
          <div className="p-8 text-center">
            <div className="mx-auto h-20 w-20 rounded-full bg-status-ok grid place-items-center text-white shadow-lg">
              <Check size={48} />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mt-4">Servicio registrado</h2>
            <p className="text-slate-600 mt-1">Se actualizaron en segundos:</p>
            <ul className="mt-4 text-left mx-auto max-w-xs space-y-1.5">
              {['Tu asistencia del día','Cómputo del mes','Servicios del cuartel','Estado de la rendición'].map((t) => (
                <li key={t} className="flex items-start gap-2 text-sm text-slate-700">
                  <Check size={18} className="text-status-ok mt-0.5" />
                  {t}
                </li>
              ))}
            </ul>
            <div className="flex gap-2 mt-6 justify-center">
              <Button intent="secondary" onClick={() => router.push('/bombero')}>Volver al inicio</Button>
              <Button onClick={() => router.push('/mando')}>Ver dashboard mando</Button>
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
    return true;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <SectionHeader title="Registrar servicio" description="Lo cargás una vez y se actualizan asistencia, cómputo y rendición." />

      {step === 'tipo' && (
        <div className="rounded-2xl border border-brand-100 bg-gradient-to-br from-brand-50 to-white p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-xl bg-brand-600 grid place-items-center text-white shrink-0">
              <Sparkles size={20} />
            </div>
            <div className="flex-1">
              <div className="font-semibold text-slate-900">Cargar por voz</div>
              <p className="text-sm text-slate-600 mt-0.5">Dictás el parte y completamos los campos. Vos revisás y confirmás.</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button intent="primary" size="md" onClick={probarVoz}>
                  <Mic size={18} /> Probar con texto demo
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {iaUsada && step !== 'tipo' && (
        <div className="rounded-lg bg-brand-50 border border-brand-100 p-3 text-sm flex items-center gap-2">
          <Sparkles size={16} className="text-brand-700" />
          <span className="text-brand-900">La IA propuso una versión. Revisá y ajustá lo que haga falta.</span>
        </div>
      )}

      <Card>
        <div className="px-5 pt-4 pb-3 border-b border-slate-100">
          <div className="flex items-center justify-between mb-1.5">
            <div className="text-sm text-slate-600">Paso {currentIdx + 1} de {stepOrder.length}</div>
            <div className="text-sm font-semibold text-brand-700">{progress}%</div>
          </div>
          <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
            <div className="h-full bg-brand-600 transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
        </div>

        <div className="p-5 space-y-5">
          {step === 'tipo' && (
            <div>
              <Label>¿Qué tipo de servicio?</Label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mt-2">
                {tipos.map((t) => {
                  const active = tipo === t.value;
                  return (
                    <button key={t.value} type="button" onClick={() => setTipo(t.value)}
                      className={cn('flex flex-col items-center gap-1.5 p-3 sm:p-4 rounded-xl border-2 bg-white min-h-tap', active ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-slate-200 text-slate-700')}>
                      {t.icon}
                      <span className="font-semibold text-sm">{t.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {step === 'ubicacion' && (
            <div className="space-y-3">
              <Label>¿Dónde?</Label>
              <Input value={direccion} onChange={(e) => setDireccion(e.target.value)} placeholder="Av. Alvear 4250, Villa Ballester" />
              <div className="text-xs text-slate-500 flex items-center gap-1.5">
                <MapPin size={14} /> GPS: {cuartel?.lat.toFixed(4)}, {cuartel?.lng.toFixed(4)}
              </div>
            </div>
          )}

          {step === 'movil' && (
            <div className="space-y-3">
              <Label>¿Qué móvil salió?</Label>
              <div className="grid sm:grid-cols-3 gap-2">
                {movilesCuartel.map((m) => {
                  const active = movilId === m.id;
                  return (
                    <button key={m.id} type="button" onClick={() => setMovilId(m.id)}
                      className={cn('p-3 rounded-xl border-2 text-left', active ? 'border-brand-600 bg-brand-50' : 'border-slate-200 bg-white hover:border-slate-300')}>
                      <div className="font-bold text-lg text-slate-900">{m.codigo}</div>
                      <div className="text-sm text-slate-600 capitalize">{m.tipo} · {m.marca}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {step === 'dotacion' && (
            <div className="space-y-3">
              <Label>¿Quiénes fueron?</Label>
              <div className="text-xs text-slate-500">{dotacionIds.length} seleccionada{dotacionIds.length === 1 ? '' : 's'}</div>
              <div className="max-h-64 overflow-y-auto rounded-lg border border-slate-200 divide-y divide-slate-100">
                {personasCuartel.map((p) => {
                  const checked = dotacionIds.includes(p.id);
                  return (
                    <button key={p.id} type="button"
                      onClick={() => setDotacionIds(checked ? dotacionIds.filter((x) => x !== p.id) : [...dotacionIds, p.id])}
                      className={cn('flex w-full items-center gap-3 px-3 py-2.5 text-left hover:bg-slate-50', checked && 'bg-brand-50')}>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-slate-900">{p.nombre} {p.apellido}</div>
                        <div className="text-xs text-slate-600">Legajo {p.legajo}</div>
                      </div>
                      <div className={cn('h-6 w-6 rounded-md border-2 grid place-items-center', checked ? 'bg-brand-600 border-brand-600 text-white' : 'border-slate-300')}>
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
                <Input id="hs" type="time" value={horaSalida} onChange={(e) => setHoraSalida(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="hr">Hora de regreso</Label>
                <Input id="hr" type="time" value={horaRegreso} onChange={(e) => setHoraRegreso(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="notas">Notas (opcional)</Label>
                <Textarea id="notas" value={notas} onChange={(e) => setNotas(e.target.value)} placeholder="Detalles del servicio." />
              </div>
            </div>
          )}

          {step === 'confirmar' && (
            <div className="space-y-3">
              <h3 className="font-semibold text-slate-900">Revisá antes de guardar</h3>
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden">
                {[
                  { k: 'Tipo', v: tipo ?? '—' },
                  { k: 'Ubicación', v: direccion },
                  { k: 'Móvil', v: movilesCuartel.find((m) => m.id === movilId)?.codigo ?? '—' },
                  { k: 'Dotación', v: `${dotacionIds.length} personas` },
                  { k: 'Salida', v: horaSalida },
                  { k: 'Regreso', v: horaRegreso },
                  ...(notas ? [{ k: 'Notas', v: notas }] : []),
                ].map((f) => (
                  <div key={f.k} className="flex px-3 py-2 text-sm">
                    <div className="w-24 text-slate-500">{f.k}</div>
                    <div className="flex-1 text-slate-900 font-medium capitalize">{f.v}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between p-4 border-t border-slate-100">
          <Button intent="ghost" onClick={() => { const prev = stepOrder[currentIdx - 1]; if (prev) setStep(prev); }} disabled={currentIdx === 0}>
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
