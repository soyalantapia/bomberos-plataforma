'use client';

import { ArrowRight, Globe2, HardHat, LogOut, Shield, Wallet } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { Avatar, Button, cn } from '@faro/ui';

import { useFaroStore, selectPersonaActual } from '../../store/use-faro-store';
import { perfilDescription, perfilHomePath, perfilLabel } from '../../lib/utils/perfil';
import { fmtJerarquia } from '../../lib/utils/jerarquia';
import { CUARTEL_PRINCIPAL_ID, PERSONA_FEDERACION_ID } from '../../data';

import type { Perfil } from '@faro/types';

// FASE 1 — VULCANO FINANZAS: única vista, el administrador del cuartel.
// Backlog (otra etapa): ['mando', 'bombero', 'federacion'].
const OPCIONES: Perfil[] = ['administrativo'];

const ICONO: Partial<Record<Perfil, React.ReactNode>> = {
  administrativo: <Wallet size={22} />,
  mando: <Shield size={22} />,
  bombero: <HardHat size={22} />,
  federacion: <Globe2 size={22} />,
};

const ACENTO: Partial<Record<Perfil, string>> = {
  administrativo: 'bg-brand-600',
  mando: 'bg-brand-600',
  bombero: 'bg-fire-600',
  federacion: 'bg-status-ok',
};

export default function SeleccionarPerfil() {
  const router = useRouter();
  const pathname = usePathname();
  const hidratado = useFaroStore((s) => s.hidratado);
  const sesion = useFaroStore((s) => s.sesion);
  const persona = useFaroStore(selectPersonaActual);
  const personas = useFaroStore((s) => s.personas);
  const cambiarPerfil = useFaroStore((s) => s.cambiarPerfil);
  const cerrar = useFaroStore((s) => s.cerrarSesion);
  const iniciarSesion = useFaroStore((s) => s.iniciarSesion);

  // Esperamos a que el store rehidrate antes de decidir; si no, un reload directo
  // de /seleccionar-perfil rebota a /login aunque haya sesión válida.
  useEffect(() => {
    if (hidratado && (!sesion || !persona)) {
      if (pathname !== '/login') router.replace('/login');
    }
  }, [hidratado, sesion, persona, pathname, router]);

  if (!hidratado || !sesion || !persona) return null;

  const cuartelId = sesion.cuartelId ?? CUARTEL_PRINCIPAL_ID;

  function entrar(p: Perfil) {
    if (p === 'federacion') {
      const fed = personas.find((x) => x.id === PERSONA_FEDERACION_ID);
      if (fed) iniciarSesion(fed.id, cuartelId, 'federacion');
      else cambiarPerfil('federacion');
    } else {
      cambiarPerfil(p);
    }
    router.replace(perfilHomePath[p]);
  }

  return (
    <div className="min-h-dvh bg-slate-50 px-4 py-8 sm:py-12">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar name={`${persona.nombre} ${persona.apellido}`} size={48} />
            <div>
              <div className="font-semibold text-slate-900">Hola, {persona.nombre}</div>
              <div className="text-sm text-slate-600">
                {fmtJerarquia(persona.jerarquia)} · Legajo {persona.legajo}
              </div>
            </div>
          </div>
          <Button
            intent="ghost"
            size="sm"
            onClick={() => {
              cerrar();
              router.replace('/login');
            }}
          >
            <LogOut size={16} /> Salir
          </Button>
        </div>

        <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">Entrá a Vulcano</h1>
        <p className="mt-1 text-sm text-slate-600">La gestión financiera de tu cuartel, en vivo.</p>

        <div className="mt-5 space-y-3">
          {OPCIONES.map((p) => {
            return (
              <button
                key={p}
                onClick={() => entrar(p)}
                className={cn(
                  'group flex w-full items-center gap-4 rounded-2xl border-2 border-slate-200 bg-white p-4 text-left transition-all',
                  'hover:border-brand-400 focus-visible:border-brand-500 hover:shadow-md',
                )}
              >
                <div
                  className={cn(
                    'grid h-12 w-12 shrink-0 place-items-center rounded-xl text-white shadow-sm',
                    ACENTO[p] ?? 'bg-brand-600',
                  )}
                >
                  {ICONO[p]}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-base font-bold text-slate-900">{perfilLabel[p]}</div>
                  <div className="mt-0.5 text-sm text-slate-600">{perfilDescription[p]}</div>
                </div>
                <ArrowRight
                  size={20}
                  className="group-hover:text-brand-600 shrink-0 text-slate-300 transition-colors"
                />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
