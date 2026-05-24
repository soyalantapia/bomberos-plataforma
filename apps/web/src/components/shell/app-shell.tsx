'use client';

import { Bell, Flame, LogOut, Menu, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { Avatar, cn, OfflineBanner } from '@faro/ui';

import { useFaroStore, selectCuartelActivo, selectPersonaActual } from '../../store/use-faro-store';
import { perfilLabel } from '../../lib/utils/perfil';
import { fmtJerarquia } from '../../lib/utils/jerarquia';

import { navByPerfil } from './nav-config';
import { Icon } from './icon';

export function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const sesion = useFaroStore((s) => s.sesion);
  const persona = useFaroStore(selectPersonaActual);
  const cuartel = useFaroStore(selectCuartelActivo);
  const cerrar = useFaroStore((s) => s.cerrarSesion);
  const hidratado = useFaroStore((s) => s.hidratado);
  const pathname = usePathname();
  const [mobileMenu, setMobileMenu] = useState(false);

  useEffect(() => {
    if (hidratado && !sesion) router.replace('/login');
  }, [hidratado, sesion, router]);

  if (!hidratado || !sesion || !persona) {
    return (
      <div className="min-h-dvh grid place-items-center bg-slate-50">
        <div className="h-8 w-8 rounded-full border-4 border-brand-200 border-t-brand-600 animate-spin" />
      </div>
    );
  }

  const items = navByPerfil[sesion.perfilActivo];
  const bottomItems = items.filter((i) => i.bottomNav).slice(0, 5);

  function handleLogout() {
    cerrar();
    router.push('/login');
  }

  return (
    <div className="min-h-dvh flex bg-slate-50">
      {/* Sidebar desktop */}
      <aside className="hidden md:flex w-64 shrink-0 flex-col bg-brand-900 text-white h-screen sticky top-0 px-3 py-4">
        <div className="px-2 py-2 flex items-center gap-2">
          <div className="h-9 w-9 rounded-lg bg-fire-600 grid place-items-center">
            <Flame size={20} className="text-white" />
          </div>
          <div>
            <div className="text-base font-bold tracking-tight leading-tight">Faro</div>
            <div className="text-xs text-white/60">{cuartel?.nombre ?? '—'}</div>
          </div>
        </div>

        <Link href="/seleccionar-perfil" className="mt-4 flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-white/5">
          <Avatar name={`${persona.nombre} ${persona.apellido}`} size={36} />
          <div className="min-w-0 flex-1">
            <div className="text-sm font-semibold leading-tight truncate">{persona.nombre} {persona.apellido}</div>
            <div className="text-xs text-white/60 leading-tight truncate">{perfilLabel[sesion.perfilActivo]} · {fmtJerarquia(persona.jerarquia)}</div>
          </div>
        </Link>

        <nav className="mt-4 flex-1 flex flex-col gap-0.5">
          {items.map((item) => {
            const active = item.href === pathname || (item.href !== `/${sesion.perfilActivo}` && pathname.startsWith(`${item.href}/`));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  active ? 'bg-white/10 text-white' : 'text-white/70 hover:bg-white/5 hover:text-white'
                )}
              >
                <Icon name={item.icon} size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white/70 hover:bg-white/5 hover:text-white">
          <LogOut size={18} /> Salir
        </button>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 bg-white border-b border-slate-200 px-4 sm:px-6 py-2.5 flex items-center gap-2">
          <button onClick={() => setMobileMenu(true)} className="md:hidden p-2 -ml-2 rounded-lg text-slate-700 hover:bg-slate-100" aria-label="Abrir menú">
            <Menu size={22} />
          </button>
          <div className="md:hidden flex items-center gap-2">
            <div className="h-7 w-7 rounded-md bg-fire-600 grid place-items-center">
              <Flame size={14} className="text-white" />
            </div>
            <div className="font-bold text-slate-900 leading-none">Faro</div>
          </div>
          <div className="hidden md:flex items-center text-sm gap-2 text-slate-600">
            <span>{cuartel?.nombre}</span>
            <span className="text-slate-300">·</span>
            <span>{perfilLabel[sesion.perfilActivo]}</span>
          </div>
          <div className="flex-1" />
          <Link href="/seleccionar-perfil" className="ml-1 flex items-center gap-2 p-1 pr-2 rounded-lg hover:bg-slate-100">
            <Avatar name={`${persona.nombre} ${persona.apellido}`} size={32} />
            <span className="hidden sm:block text-sm font-medium text-slate-700">{persona.nombre}</span>
          </Link>
        </header>

        <OfflineBanner />

        <main className="flex-1 px-4 sm:px-6 py-5 sm:py-7 pb-24 md:pb-7">{children}</main>
      </div>

      {/* Bottom nav mobile */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-white border-t border-slate-200 z-30 pb-[env(safe-area-inset-bottom)]">
        <div className="grid" style={{ gridTemplateColumns: `repeat(${bottomItems.length}, 1fr)` }}>
          {bottomItems.map((item) => {
            const active = item.href === pathname || (item.href !== `/${sesion.perfilActivo}` && pathname.startsWith(`${item.href}/`));
            return (
              <Link key={item.href} href={item.href} className={cn('flex flex-col items-center justify-center gap-0.5 py-2 text-[11px]', active ? 'text-brand-700' : 'text-slate-500')}>
                <Icon name={item.icon} size={22} className={active ? 'text-brand-700' : ''} />
                <span className="leading-none">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Mobile drawer */}
      {mobileMenu && (
        <div className="md:hidden fixed inset-0 z-50 bg-slate-900/50" onClick={() => setMobileMenu(false)}>
          <aside className="absolute inset-y-0 left-0 w-72 bg-brand-900 text-white p-4 flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="h-9 w-9 rounded-lg bg-fire-600 grid place-items-center">
                  <Flame size={20} className="text-white" />
                </div>
                <div>
                  <div className="font-bold tracking-tight leading-tight">Faro</div>
                  <div className="text-xs text-white/60">{cuartel?.nombre}</div>
                </div>
              </div>
              <button onClick={() => setMobileMenu(false)} className="p-2 rounded-lg hover:bg-white/10" aria-label="Cerrar menú">
                <X size={20} />
              </button>
            </div>
            <nav className="flex flex-col gap-0.5">
              {items.map((it) => (
                <Link key={it.href} href={it.href} onClick={() => setMobileMenu(false)} className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm text-white/80 hover:bg-white/10 hover:text-white">
                  <Icon name={it.icon} size={18} />
                  {it.label}
                </Link>
              ))}
            </nav>
          </aside>
        </div>
      )}
    </div>
  );
}
