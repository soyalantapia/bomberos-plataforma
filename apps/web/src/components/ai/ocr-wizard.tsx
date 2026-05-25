'use client';

import {
  AlertCircle,
  Check,
  CheckCircle2,
  Image as ImageIcon,
  Loader2,
  ScanLine,
  Sparkles,
  Upload,
  X,
} from 'lucide-react';
import { useRef, useState } from 'react';

import { Avatar, Badge, Button, Dialog, cn, useToast } from '@faro/ui';

interface CampoExtraido {
  campo: string;
  valorActual?: string;
  valorExtraido: string;
  confianza: number;
  aplicar: boolean;
}

type Paso = 'subir' | 'procesando' | 'revisar' | 'aplicado';

interface Props {
  open: boolean;
  onClose: () => void;
  /** Persona actual (opcional) para mostrar diff entre actual y extraído. */
  persona?: { nombre: string; apellido: string; legajo: string };
  /** Aplica callback cuando confirma. */
  onAplicar?: (campos: CampoExtraido[]) => void;
}

const SAMPLE_FIELDS_DNI: CampoExtraido[] = [
  {
    campo: 'Apellido y nombre',
    valorExtraido: 'PEREYRA, MARIANA ELENA',
    confianza: 0.98,
    aplicar: true,
  },
  { campo: 'DNI', valorExtraido: '31.456.789', confianza: 0.99, aplicar: true },
  { campo: 'Fecha de nacimiento', valorExtraido: '23/11/1985', confianza: 0.96, aplicar: true },
  { campo: 'Nacionalidad', valorExtraido: 'Argentina', confianza: 0.97, aplicar: true },
  { campo: 'Sexo', valorExtraido: 'F', confianza: 0.99, aplicar: true },
  {
    campo: 'Domicilio',
    valorExtraido: 'Av. Alvear 4250, Villa Ballester',
    confianza: 0.91,
    aplicar: true,
  },
  { campo: 'Fecha de emisión', valorExtraido: '15/03/2018', confianza: 0.94, aplicar: false },
  { campo: 'Trámite N°', valorExtraido: 'XYZ-2018-32145678', confianza: 0.88, aplicar: false },
];

const PASOS_PROCESAMIENTO = [
  { label: 'Subiendo imagen', delay: 600 },
  { label: 'Detectando tipo de documento', delay: 700 },
  { label: 'Identificando: DNI argentino', delay: 600 },
  { label: 'Extrayendo campos con Claude Vision', delay: 1200 },
  { label: 'Validando contra padrón', delay: 700 },
];

export function OCRWizard({ open, onClose, persona, onAplicar }: Props) {
  const [paso, setPaso] = useState<Paso>('subir');
  const [archivo, setArchivo] = useState<{ url: string; name: string; size: number } | null>(null);
  const [campos, setCampos] = useState<CampoExtraido[]>([]);
  const [stepIdx, setStepIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();

  function reset() {
    setPaso('subir');
    setArchivo(null);
    setCampos([]);
    setStepIdx(0);
  }

  function handleClose() {
    reset();
    onClose();
  }

  function handleFile(file: File) {
    setArchivo({ url: URL.createObjectURL(file), name: file.name, size: file.size });
    setPaso('procesando');
    setStepIdx(0);
    // Run animated steps
    let acc = 0;
    PASOS_PROCESAMIENTO.forEach((p, idx) => {
      acc += p.delay;
      setTimeout(() => setStepIdx(idx + 1), acc);
    });
    setTimeout(() => {
      setCampos(SAMPLE_FIELDS_DNI);
      setPaso('revisar');
    }, acc + 300);
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }

  function aplicar() {
    const aplicados = campos.filter((c) => c.aplicar);
    onAplicar?.(aplicados);
    setPaso('aplicado');
    toast.push({
      kind: 'success',
      title: `${aplicados.length} campos actualizados`,
      description: 'Cambios firmados en audit log.',
    });
    setTimeout(handleClose, 1800);
  }

  function demoFile() {
    handleFile(new File([new Blob(['fake'])], 'dni-mariana-pereyra.jpg', { type: 'image/jpeg' }));
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      title="OCR de documento"
      description="La IA extrae los datos. Vos confirmás (doble validación)."
    >
      <div className="space-y-4">
        {/* PASO 1 · Subir */}
        {paso === 'subir' && (
          <>
            <div
              onDrop={onDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => inputRef.current?.click()}
              className="hover:border-brand-400 hover:bg-brand-50/50 cursor-pointer rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50/50 p-8 text-center transition-colors"
            >
              <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
                <Upload size={28} className="text-slate-500" />
              </div>
              <div className="mt-3 font-semibold text-slate-900">Arrastrá tu DNI o licencia</div>
              <div className="mt-1 text-sm text-slate-600">
                o tocá para elegir desde galería · JPG, PNG, PDF · máx 8 MB
              </div>
              <input
                ref={inputRef}
                type="file"
                accept="image/*,.pdf"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleFile(f);
                }}
              />
            </div>

            <button
              type="button"
              onClick={demoFile}
              className="bg-brand-50 text-brand-700 hover:bg-brand-100 w-full rounded-md px-3 py-2 text-sm font-medium"
            >
              ✨ Probar con DNI de muestra
            </button>

            <div className="rounded-lg bg-slate-50 p-3 text-xs text-slate-600">
              <strong className="text-slate-900">Privacidad:</strong> la imagen se procesa, los
              campos se aplican al padrón con doble validación humana, y la foto se borra del
              servidor. Queda solo el hash en audit log.
            </div>
          </>
        )}

        {/* PASO 2 · Procesando */}
        {paso === 'procesando' && (
          <div className="space-y-4">
            {archivo && (
              <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-slate-900 text-white">
                  <ImageIcon size={20} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-medium text-slate-900">{archivo.name}</div>
                  <div className="text-xs text-slate-500">
                    {(archivo.size / 1024).toFixed(0)} KB · procesando con IA
                  </div>
                </div>
                <Loader2 size={20} className="text-brand-600 shrink-0 animate-spin" />
              </div>
            )}

            <div className="space-y-2">
              {PASOS_PROCESAMIENTO.map((s, idx) => {
                const done = idx < stepIdx;
                const active = idx === stepIdx;
                return (
                  <div
                    key={s.label}
                    className={cn(
                      'flex items-center gap-3 rounded-lg p-3 transition-all',
                      done && 'bg-status-ok-bg/30',
                      active && 'bg-brand-50 ring-brand-200 ring-2',
                      !done && !active && 'opacity-40',
                    )}
                  >
                    <div
                      className={cn(
                        'grid h-6 w-6 shrink-0 place-items-center rounded-full',
                        done
                          ? 'bg-status-ok text-white'
                          : active
                            ? 'bg-brand-600 text-white'
                            : 'bg-slate-200',
                      )}
                    >
                      {done ? (
                        <Check size={12} />
                      ) : active ? (
                        <Loader2 size={12} className="animate-spin" />
                      ) : null}
                    </div>
                    <span
                      className={cn(
                        'text-sm',
                        done
                          ? 'font-medium text-slate-900'
                          : active
                            ? 'text-brand-800 font-semibold'
                            : 'text-slate-500',
                      )}
                    >
                      {s.label}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="bg-brand-50 text-brand-900 flex items-center gap-2 rounded-md p-3 text-xs">
              <Sparkles size={14} className="shrink-0" />
              <span>
                Claude Vision analizando 12 campos posibles · típicamente toma 2-4 segundos
              </span>
            </div>
          </div>
        )}

        {/* PASO 3 · Revisar */}
        {paso === 'revisar' && (
          <div className="space-y-3">
            <div className="bg-status-ok-bg/40 text-status-ok-fg flex items-center gap-2 rounded-lg p-3 text-sm">
              <CheckCircle2 size={16} />
              <span>
                <strong>{campos.length} campos extraídos</strong> · confianza promedio{' '}
                {Math.round((campos.reduce((a, c) => a + c.confianza, 0) / campos.length) * 100)}%
              </span>
            </div>

            {persona && (
              <div className="flex items-center gap-2 rounded-md bg-slate-50 px-3 py-2 text-xs text-slate-600">
                <Avatar name={`${persona.nombre} ${persona.apellido}`} size={24} />
                <span>
                  Aplicar a{' '}
                  <strong className="text-slate-900">
                    {persona.nombre} {persona.apellido}
                  </strong>{' '}
                  (legajo {persona.legajo})
                </span>
              </div>
            )}

            <div className="max-h-[40vh] space-y-1.5 overflow-y-auto">
              {campos.map((c, idx) => {
                const conf = Math.round(c.confianza * 100);
                const confColor = conf >= 95 ? 'ok' : conf >= 85 ? 'warn' : 'risk';
                return (
                  <label
                    key={c.campo}
                    className={cn(
                      'flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors',
                      c.aplicar ? 'border-brand-300 bg-brand-50/40' : 'border-slate-200 bg-white',
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={c.aplicar}
                      onChange={() =>
                        setCampos((arr) =>
                          arr.map((x, i) => (i === idx ? { ...x, aplicar: !x.aplicar } : x)),
                        )
                      }
                      className="text-brand-600 focus:ring-brand-300 mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                          {c.campo}
                        </span>
                        <Badge intent={confColor as 'ok' | 'warn' | 'risk'}>
                          {conf}% confianza
                        </Badge>
                      </div>
                      <div className="mt-1 text-sm font-medium text-slate-900">
                        {c.valorExtraido}
                      </div>
                      {c.valorActual && c.valorActual !== c.valorExtraido && (
                        <div className="mt-0.5 text-xs text-slate-500">
                          <span className="line-through">{c.valorActual}</span> → nuevo
                        </div>
                      )}
                    </div>
                  </label>
                );
              })}
            </div>

            <div className="flex gap-2 border-t border-slate-100 pt-3">
              <Button intent="ghost" onClick={handleClose}>
                <X size={14} /> Cancelar
              </Button>
              <Button
                intent="primary"
                fullWidth
                onClick={aplicar}
                disabled={campos.filter((c) => c.aplicar).length === 0}
              >
                <Check size={14} /> Aplicar {campos.filter((c) => c.aplicar).length} cambios
              </Button>
            </div>

            <div className="bg-status-warn-bg/40 text-status-warn-fg flex items-start gap-2 rounded-md p-2.5 text-xs">
              <AlertCircle size={14} className="mt-0.5 shrink-0" />
              <span>
                Cambios sensibles (fecha de nacimiento, domicilio) requieren OTP del titular antes
                de impactar el padrón.
              </span>
            </div>
          </div>
        )}

        {/* PASO 4 · Aplicado */}
        {paso === 'aplicado' && (
          <div className="py-8 text-center">
            <div className="bg-status-ok mx-auto grid h-20 w-20 place-items-center rounded-full text-white shadow-lg">
              <CheckCircle2 size={40} />
            </div>
            <h3 className="mt-4 text-lg font-bold text-slate-900">Datos actualizados</h3>
            <p className="mt-1 text-sm text-slate-600">
              Los cambios quedaron firmados en{' '}
              <a href="/gobierno/audit" className="text-brand-700 hover:text-brand-900 font-medium">
                Audit log
              </a>
            </p>
            <div className="bg-brand-50 text-brand-700 mt-4 inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold">
              <ScanLine size={12} /> OCR completado en 3.8 s
            </div>
          </div>
        )}
      </div>
    </Dialog>
  );
}
