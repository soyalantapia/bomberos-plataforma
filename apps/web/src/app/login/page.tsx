'use client';

import { Button, Card, Input, Label, cn, useToast } from '@faro/ui';
import { ArrowRight, ShieldCheck, Sparkles, Flame, AlertCircle, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

import { PERSONA_DEMO_ID, CUARTEL_PRINCIPAL_ID } from '../../data';
import { useFaroStore } from '../../store/use-faro-store';

type Step = 'legajo' | 'codigo';
const CODIGO_DEMO = '000000';
const OTP_LENGTH = 6;

export default function LoginPage() {
  const router = useRouter();
  const toast = useToast();
  const iniciarSesion = useFaroStore((s) => s.iniciarSesion);
  const personas = useFaroStore((s) => s.personas);
  const [step, setStep] = useState<Step>('legajo');
  const [legajo, setLegajo] = useState('0017');
  const [codigo, setCodigo] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [verificando, setVerificando] = useState(false);
  const codigoInputRef = useRef<HTMLInputElement>(null);

  // Auto-focus al cambiar de paso
  useEffect(() => {
    if (step === 'codigo' && codigoInputRef.current) {
      setTimeout(() => codigoInputRef.current?.focus(), 100);
    }
  }, [step]);

  function enviarOtp(e?: React.FormEvent) {
    e?.preventDefault();
    setError(null);
    if (legajo.trim().length === 0) {
      setError('Ingresá tu legajo o email para continuar');
      return;
    }
    setEnviando(true);
    // Simulamos latencia de envío
    setTimeout(() => {
      setEnviando(false);
      setStep('codigo');
      toast.push({
        kind: 'info',
        title: 'Código enviado (modo demo)',
        description: `Usá ${CODIGO_DEMO} para entrar.`,
      });
    }, 400);
  }

  // Acepta override opcional para evitar el problema de closure stale
  // cuando se llama desde setTimeout justo después de setCodigo()
  function verificarOtp(e?: React.FormEvent, codigoOverride?: string) {
    e?.preventDefault();
    setError(null);

    const codigoActual = codigoOverride ?? codigo;

    // Validación 1: longitud
    if (codigoActual.length < OTP_LENGTH) {
      const faltan = OTP_LENGTH - codigoActual.length;
      setError(`Faltan ${faltan} dígito${faltan === 1 ? '' : 's'}`);
      return;
    }

    // Validación 2: solo dígitos
    if (!/^\d{6}$/.test(codigoActual)) {
      setError('El código debe ser de 6 dígitos numéricos');
      return;
    }

    setVerificando(true);
    setTimeout(() => {
      // Validación 3: código correcto
      if (codigoActual !== CODIGO_DEMO) {
        setVerificando(false);
        setError(`Código incorrecto. En demo el código es ${CODIGO_DEMO}`);
        return;
      }
      const persona =
        personas.find((p) => p.legajo === legajo.trim()) ??
        personas.find((p) => p.id === PERSONA_DEMO_ID)!;
      iniciarSesion(persona.id, persona.cuartelId ?? CUARTEL_PRINCIPAL_ID, persona.perfiles[0]!);
      router.replace('/seleccionar-perfil');
    }, 600);
  }

  function onChangeCodigo(value: string) {
    const limpio = value.replace(/\D/g, '').slice(0, OTP_LENGTH);
    setCodigo(limpio);
    setError(null);
    // Auto-submit cuando completa los 6 dígitos
    // Pasamos `limpio` como override porque el state aún no se actualizó
    if (limpio.length === OTP_LENGTH) {
      setTimeout(() => verificarOtp(undefined, limpio), 80);
    }
  }

  function autoCompletar() {
    setCodigo(CODIGO_DEMO);
    setError(null);
    // Pasamos CODIGO_DEMO directo para evitar el closure stale
    setTimeout(() => verificarOtp(undefined, CODIGO_DEMO), 80);
  }

  const codigoCompleto = codigo.length === OTP_LENGTH;

  return (
    <div className="from-brand-900 via-brand-700 to-brand-900 flex min-h-dvh items-center justify-center bg-gradient-to-br p-4">
      <div className="pointer-events-none absolute inset-0 opacity-20">
        <div className="bg-fire-600 absolute -left-32 -top-32 h-96 w-96 rounded-full blur-3xl" />
        <div className="bg-brand-500 absolute -bottom-40 -right-40 h-[28rem] w-[28rem] rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="mb-6 text-center">
          <div className="bg-fire-600 shadow-fire-600/30 mb-3 inline-flex h-14 w-14 items-center justify-center rounded-2xl shadow-lg">
            <Flame size={28} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">Faro</h1>
          <p className="mt-1 text-sm text-white/70">Gestión bomberil</p>
        </div>

        <Card className="bg-white/95 shadow-2xl backdrop-blur">
          <div className="p-6">
            {step === 'legajo' && (
              <form onSubmit={enviarOtp} className="flex flex-col gap-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Ingresar</h2>
                  <p className="mt-1 text-sm text-slate-600">
                    Te enviamos un código de un solo uso al canal configurado.
                  </p>
                </div>
                <div>
                  <Label htmlFor="legajo">Legajo o email</Label>
                  <Input
                    id="legajo"
                    autoFocus
                    value={legajo}
                    onChange={(e) => {
                      setLegajo(e.target.value);
                      setError(null);
                    }}
                    placeholder="0017 · mpereyra@bv-vballester.org"
                    aria-invalid={!!error}
                  />
                  {error && (
                    <p className="text-status-risk-fg mt-1.5 flex items-center gap-1 text-xs font-medium">
                      <AlertCircle size={12} />
                      {error}
                    </p>
                  )}
                </div>
                <Button type="submit" size="lg" fullWidth disabled={enviando}>
                  {enviando ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      Enviar código <ArrowRight size={20} />
                    </>
                  )}
                </Button>
                <div className="bg-brand-50 border-brand-100 flex items-start gap-2 rounded-lg border p-3 text-sm">
                  <Sparkles size={18} className="text-brand-600 mt-0.5 shrink-0" />
                  <div>
                    <div className="text-brand-900 font-semibold">Probar la plataforma</div>
                    <div className="text-brand-800/80">
                      Esta es una demo pública. Entrá con legajo{' '}
                      <span className="font-mono font-bold">0017</span> (Sub-comandante) y código{' '}
                      <span className="font-mono font-bold">{CODIGO_DEMO}</span>.
                    </div>
                  </div>
                </div>
              </form>
            )}

            {step === 'codigo' && (
              <form onSubmit={verificarOtp} className="flex flex-col gap-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Tu código</h2>
                  <p className="mt-1 text-sm text-slate-600">
                    Ingresá los 6 dígitos enviados a tu legajo {legajo}
                  </p>
                </div>

                {/* OTP visualizado en 6 cajas */}
                <div>
                  <Label htmlFor="codigo">Código de un solo uso</Label>
                  <div className="relative mt-1">
                    <input
                      id="codigo"
                      ref={codigoInputRef}
                      type="text"
                      value={codigo}
                      onChange={(e) => onChangeCodigo(e.target.value)}
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      maxLength={OTP_LENGTH}
                      aria-invalid={!!error}
                      aria-describedby={error ? 'codigo-error' : undefined}
                      className="absolute inset-0 z-10 h-full w-full cursor-pointer text-transparent caret-transparent outline-none"
                    />
                    <div className="flex justify-between gap-2 sm:gap-3">
                      {Array.from({ length: OTP_LENGTH }).map((_, i) => {
                        const isFilled = i < codigo.length;
                        const isCurrent = i === codigo.length;
                        return (
                          <div
                            key={i}
                            className={cn(
                              'grid h-12 w-full max-w-[48px] place-items-center rounded-lg border-2 font-mono text-2xl font-bold transition-all sm:h-14',
                              error
                                ? 'border-status-risk bg-status-risk-bg/30 text-status-risk-fg animate-shake'
                                : isFilled
                                  ? 'border-brand-500 bg-brand-50 text-brand-900'
                                  : isCurrent
                                    ? 'border-brand-400 ring-brand-200 bg-white ring-2'
                                    : 'border-slate-200 bg-slate-50 text-slate-300',
                            )}
                          >
                            {isFilled ? codigo[i] : isCurrent ? '|' : '·'}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  {error && (
                    <p
                      id="codigo-error"
                      className="text-status-risk-fg mt-2 flex items-center gap-1 text-xs font-medium"
                    >
                      <AlertCircle size={12} />
                      {error}
                    </p>
                  )}
                </div>

                <Button type="submit" size="lg" fullWidth disabled={!codigoCompleto || verificando}>
                  {verificando ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      Verificando...
                    </>
                  ) : (
                    <>
                      Entrar <ArrowRight size={20} />
                    </>
                  )}
                </Button>

                {/* Demo shortcut */}
                <button
                  type="button"
                  onClick={autoCompletar}
                  disabled={verificando}
                  className="bg-brand-50 hover:bg-brand-100 text-brand-700 inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium disabled:opacity-50"
                >
                  <Sparkles size={14} /> Usar código de demo (000000)
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setStep('legajo');
                    setCodigo('');
                    setError(null);
                  }}
                  disabled={verificando}
                  className="text-sm text-slate-600 underline hover:text-slate-900 disabled:opacity-50"
                >
                  Cambiar de legajo
                </button>
              </form>
            )}
          </div>
        </Card>

        <div className="mt-5 flex items-center justify-center gap-1.5 text-center text-xs text-white/60">
          <ShieldCheck size={14} />
          Login sin contraseñas. Cumple Ley 25.326.
        </div>
      </div>
    </div>
  );
}
