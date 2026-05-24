'use client';

import { ArrowRight, ShieldCheck, Sparkles, Flame } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Button, Card, Input, Label, useToast } from '@faro/ui';

import { useFaroStore } from '../../store/use-faro-store';
import { PERSONA_DEMO_ID, CUARTEL_PRINCIPAL_ID } from '../../data';

type Step = 'legajo' | 'codigo';
const CODIGO_DEMO = '000000';

export default function LoginPage() {
  const router = useRouter();
  const toast = useToast();
  const iniciarSesion = useFaroStore((s) => s.iniciarSesion);
  const personas = useFaroStore((s) => s.personas);
  const [step, setStep] = useState<Step>('legajo');
  const [legajo, setLegajo] = useState('0017');
  const [codigo, setCodigo] = useState('');

  function enviarOtp(e: React.FormEvent) {
    e.preventDefault();
    if (legajo.trim().length === 0) {
      toast.push({ kind: 'warn', title: 'Ingresá tu legajo o email para seguir' });
      return;
    }
    setStep('codigo');
    toast.push({ kind: 'info', title: 'Código enviado (modo demo)', description: `Usá ${CODIGO_DEMO} para entrar.` });
  }

  function verificarOtp(e: React.FormEvent) {
    e.preventDefault();
    if (codigo !== CODIGO_DEMO) {
      toast.push({ kind: 'error', title: 'Código incorrecto', description: `En el demo el código es ${CODIGO_DEMO}.` });
      return;
    }
    const persona = personas.find((p) => p.legajo === legajo.trim()) ?? personas.find((p) => p.id === PERSONA_DEMO_ID)!;
    iniciarSesion(persona.id, persona.cuartelId ?? CUARTEL_PRINCIPAL_ID, persona.perfiles[0]!);
    router.replace('/seleccionar-perfil');
  }

  return (
    <div className="min-h-dvh flex items-center justify-center p-4 bg-gradient-to-br from-brand-900 via-brand-700 to-brand-900">
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-fire-600 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-[28rem] h-[28rem] rounded-full bg-brand-500 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-fire-600 shadow-lg shadow-fire-600/30 mb-3">
            <Flame size={28} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">Faro</h1>
          <p className="text-white/70 mt-1 text-sm">Gestión bomberil</p>
        </div>

        <Card className="bg-white/95 backdrop-blur shadow-2xl">
          <div className="p-6">
            {step === 'legajo' && (
              <form onSubmit={enviarOtp} className="flex flex-col gap-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Ingresar</h2>
                  <p className="text-slate-600 text-sm mt-1">Te enviamos un código de un solo uso al canal configurado.</p>
                </div>
                <div>
                  <Label htmlFor="legajo">Legajo o email</Label>
                  <Input id="legajo" autoFocus value={legajo} onChange={(e) => setLegajo(e.target.value)} placeholder="0017 · mpereyra@bv-vballester.org" />
                </div>
                <Button type="submit" size="lg" fullWidth>
                  Enviar código <ArrowRight size={20} />
                </Button>
                <div className="rounded-lg bg-brand-50 border border-brand-100 p-3 text-sm flex gap-2 items-start">
                  <Sparkles size={18} className="text-brand-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-brand-900">Modo demo</div>
                    <div className="text-brand-800/80">Usá <span className="font-mono font-bold">0017</span> (Sub-comandante). El código siempre es <span className="font-mono font-bold">{CODIGO_DEMO}</span>.</div>
                  </div>
                </div>
              </form>
            )}

            {step === 'codigo' && (
              <form onSubmit={verificarOtp} className="flex flex-col gap-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Tu código</h2>
                  <p className="text-slate-600 text-sm mt-1">Ingresá los 6 dígitos. (En demo: <span className="font-mono font-bold">{CODIGO_DEMO}</span>)</p>
                </div>
                <div>
                  <Label htmlFor="codigo">Código de un solo uso</Label>
                  <Input id="codigo" autoFocus value={codigo} onChange={(e) => setCodigo(e.target.value.replace(/\D/g, '').slice(0, 6))} inputMode="numeric" placeholder="000000" autoComplete="one-time-code" className="text-center text-2xl tracking-[0.5em] font-mono" />
                </div>
                <Button type="submit" size="lg" fullWidth>
                  Entrar <ArrowRight size={20} />
                </Button>
                <button type="button" onClick={() => setStep('legajo')} className="text-sm text-slate-600 hover:text-slate-900 underline">
                  Cambiar de legajo
                </button>
              </form>
            )}
          </div>
        </Card>

        <div className="mt-5 text-xs text-white/60 text-center flex items-center justify-center gap-1.5">
          <ShieldCheck size={14} />
          Login sin contraseñas. Cumple Ley 25.326.
        </div>
      </div>
    </div>
  );
}
