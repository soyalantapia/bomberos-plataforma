'use client';

import { ArrowRight, Check, LogOut, HardHat, Shield, FolderCog, Gavel, Globe2 } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { Avatar, Button, Card, cn, StatusPill } from '@faro/ui';

import { useFaroStore, selectPersonaActual } from '../../store/use-faro-store';
import { perfilDescription, perfilHomePath, perfilLabel } from '../../lib/utils/perfil';
import { fmtJerarquia } from '../../lib/utils/jerarquia';
import { CUARTEL_PRINCIPAL_ID, PERSONA_FEDERACION_ID } from '../../data';

import type { Perfil } from '@faro/types';

const perfilIcon: Record<Perfil, React.ReactNode> = {
  bombero: <HardHat size={18} />,
  mando: <Shield size={18} />,
  administrativo: <FolderCog size={18} />,
  gobierno: <Gavel size={18} />,
  federacion: <Globe2 size={18} />,
};

export default function SeleccionarPerfil() {
  const router = useRouter();
  const pathname = usePathname();
  const sesion = useFaroStore((s) => s.sesion);
  const persona = useFaroStore(selectPersonaActual);
  const cuarteles = useFaroStore((s) => s.cuarteles);
  const personas = useFaroStore((s) => s.personas);
  const cambiarPerfil = useFaroStore((s) => s.cambiarPerfil);
  const cambiarCuartel = useFaroStore((s) => s.cambiarCuartel);
  const cerrar = useFaroStore((s) => s.cerrarSesion);
  const iniciarSesion = useFaroStore((s) => s.iniciarSesion);

  const [perfilSel, setPerfilSel] = useState<Perfil | null>(sesion?.perfilActivo ?? null);
  const [cuartelSel, setCuartelSel] = useState<string>(sesion?.cuartelId ?? CUARTEL_PRINCIPAL_ID);

  useEffect(() => {
    if (!sesion || !persona) {
      if (pathname !== '/login') router.replace('/login');
    }
  }, [sesion, persona, pathname, router]);

  if (!sesion || !persona) return null;

  function entrar() {
    if (!perfilSel || !persona) return;
    cambiarCuartel(cuartelSel);
    if (perfilSel === 'federacion' && !persona.perfiles.includes('federacion')) {
      const fed = personas.find((p) => p.id === PERSONA_FEDERACION_ID);
      if (fed) iniciarSesion(fed.id, cuartelSel, 'federacion');
    } else {
      cambiarPerfil(perfilSel);
    }
    const destino = perfilHomePath[perfilSel];
    if (pathname !== destino) router.replace(destino);
  }

  function entrarComoFederacion() {
    const fed = personas.find((p) => p.id === PERSONA_FEDERACION_ID);
    if (!fed) return;
    iniciarSesion(fed.id, cuartelSel, 'federacion');
    router.push('/federacion');
  }

  return (
    <div className="min-h-dvh bg-slate-50 px-4 py-8 sm:py-12">
      <div className="mx-auto max-w-3xl">
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

        <Card className="mb-5">
          <div className="p-5 sm:p-6">
            <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">¿Cómo querés entrar?</h1>
            <p className="mt-1 text-sm text-slate-600">Elegí perfil y cuartel.</p>

            <div className="mt-5">
              <div className="mb-2 text-sm font-semibold text-slate-700">Tus perfiles</div>
              <div className="grid gap-2 sm:grid-cols-2">
                {persona.perfiles.map((p) => {
                  const active = perfilSel === p;
                  return (
                    <button
                      key={p}
                      onClick={() => setPerfilSel(p)}
                      className={cn(
                        'rounded-xl border-2 p-4 text-left transition-all',
                        active
                          ? 'border-brand-600 bg-brand-50'
                          : 'border-slate-200 bg-white hover:border-slate-300',
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={cn(
                            'grid h-10 w-10 shrink-0 place-items-center rounded-lg',
                            active ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-700',
                          )}
                        >
                          {perfilIcon[p]}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-semibold text-slate-900">{perfilLabel[p]}</div>
                          <div className="mt-0.5 text-xs text-slate-600">
                            {perfilDescription[p]}
                          </div>
                        </div>
                        {active && <Check size={18} className="text-brand-600 shrink-0" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-5">
              <div className="mb-2 text-sm font-semibold text-slate-700">Cuartel</div>
              {perfilSel === 'federacion' ? (
                <>
                  <div className="mb-2 text-xs text-slate-500">
                    Como Federación podés entrar a cualquier cuartel para auditar.
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {cuarteles.map((c) => {
                      const active = cuartelSel === c.id;
                      return (
                        <button
                          key={c.id}
                          onClick={() => setCuartelSel(c.id)}
                          className={cn(
                            'flex items-center gap-2 rounded-lg border-2 px-3 py-2 text-sm',
                            active
                              ? 'border-brand-600 bg-brand-50'
                              : 'border-slate-200 bg-white hover:border-slate-300',
                          )}
                        >
                          <StatusPill
                            status={c.cumplimiento}
                            label={`${c.porcentajeRendicion}%`}
                            size="sm"
                          />
                          <span className="font-medium text-slate-900">{c.nombre}</span>
                        </button>
                      );
                    })}
                  </div>
                </>
              ) : (
                <div className="border-brand-300 bg-brand-50/40 flex items-center gap-3 rounded-lg border-2 p-3">
                  <div className="bg-brand-600 grid h-10 w-10 shrink-0 place-items-center rounded-lg text-white">
                    <Globe2 size={18} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-slate-900">
                      BV {cuarteles.find((c) => c.id === cuartelSel)?.nombre ?? '—'}
                    </div>
                    <div className="text-xs text-slate-600">
                      Tu cuartel asignado. Para auditar otros, ingresá con perfil Federación.
                    </div>
                  </div>
                </div>
              )}
            </div>

            <Button size="lg" fullWidth className="mt-6" disabled={!perfilSel} onClick={entrar}>
              Entrar <ArrowRight size={20} />
            </Button>
          </div>
        </Card>

        <Card className="bg-brand-50 border-brand-100">
          <div className="p-4 sm:p-5">
            <div className="flex items-start gap-3">
              <div className="bg-status-ok grid h-9 w-9 shrink-0 place-items-center rounded-lg text-white">
                <Globe2 size={18} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-brand-900 font-semibold">¿Ver la vista de Federación?</div>
                <div className="text-brand-900/80 mt-0.5 text-sm">
                  El acceso a la vista de Federación es regional. Si tu cuartel forma parte, vas a
                  ver el tablero correspondiente.
                </div>
              </div>
              <Button intent="secondary" size="sm" onClick={entrarComoFederacion}>
                Entrar como Federación
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
