'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Bell, Flame, LayoutGrid, LogOut, Menu, Search, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { Avatar, cn, OfflineBanner } from '@faro/ui';

import { useFaroStore, selectCuartelActivo, selectPersonaActual } from '../../store/use-faro-store';
import { perfilLabel } from '../../lib/utils/perfil';
import { fmtJerarquia } from '../../lib/utils/jerarquia';

import { PageSkeleton } from '../shared/page-skeleton';

import { navByPerfil } from './nav-config';
import { Icon } from './icon';
import { SyncStatusPill } from './sync-status-pill';

export function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const sesion = useFaroStore((s) => s.sesion);
  const persona = useFaroStore(selectPersonaActual);
  const cuartel = useFaroStore(selectCuartelActivo);
  const cerrar = useFaroStore((s) => s.cerrarSesion);
  const hidratado = useFaroStore((s) => s.hidratado);
  const notifSinLeer = useFaroStore((s) => s.notificaciones.filter((n) => !n.leida).length);
  const pathname = usePathname();
  const [mobileMenu, setMobileMenu] = useState(false);

  useEffect(() => {
    if (hidratado && !sesion) router.replace('/login');
  }, [hidratado, sesion, router]);

  if (!hidratado || !sesion || !persona) {
    return (
      <div className="min-h-dvh bg-slate-50">
        <div className="sticky top-0 z-30 flex items-center gap-2 border-b border-slate-200 bg-white px-4 py-2.5 sm:px-6">
          <div className="flex items-center gap-2">
            <div className="bg-fire-600 grid h-7 w-7 place-items-center rounded-md">
              <Flame size={14} className="text-white" />
            </div>
            <div className="font-bold leading-none text-slate-900">Faro</div>
          </div>
          <div className="ml-auto flex items-center gap-2 text-sm text-slate-500">
            <div className="border-brand-200 border-t-brand-600 h-4 w-4 animate-spin rounded-full border-2" />
            Cargando datos del cuartel...
          </div>
        </div>
        <div className="px-4 py-5 sm:px-6 sm:py-7">
          <PageSkeleton variant="list" />
        </div>
      </div>
    );
  }

  const items = navByPerfil[sesion.perfilActivo];
  const bottomItems = items.filter((i) => i.bottomNav).slice(0, 5);

  // Pre-pasamos pathname una sola vez para evitar string ops por cada item
  // en cada render. Cada nav item solo necesita saber si está activo.
  const activeCheck = (href: string) =>
    href === pathname || (href !== `/${sesion!.perfilActivo}` && pathname.startsWith(`${href}/`));

  function handleLogout() {
    cerrar();
    router.push('/login');
  }

  return (
    <div className="flex min-h-dvh bg-slate-50">
      {/* Sidebar desktop */}
      <aside className="bg-brand-900 sticky top-0 hidden h-screen w-64 shrink-0 flex-col px-3 py-4 text-white md:flex">
        <div className="flex items-center gap-2 px-2 py-2">
          <div className="bg-fire-600 grid h-9 w-9 place-items-center rounded-lg">
            <Flame size={20} className="text-white" />
          </div>
          <div>
            <div className="text-base font-bold leading-tight tracking-tight">Faro</div>
            <div className="text-xs text-white/60">{cuartel?.nombre ?? '—'}</div>
          </div>
        </div>

        <Link
          href="/seleccionar-perfil"
          className="mt-4 flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-white/5"
        >
          <Avatar name={`${persona.nombre} ${persona.apellido}`} size={36} />
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-semibold leading-tight">
              {persona.nombre} {persona.apellido}
            </div>
            <div className="truncate text-xs leading-tight text-white/60">
              {perfilLabel[sesion.perfilActivo]} · {fmtJerarquia(persona.jerarquia)}
            </div>
          </div>
        </Link>

        <nav className="mt-4 flex flex-1 flex-col gap-0.5 overflow-y-auto pr-1">
          {items.map((item, idx) => {
            const active = activeCheck(item.href);
            const prevSeccion = idx > 0 ? items[idx - 1]?.seccion : undefined;
            const showSeccion = item.seccion && item.seccion !== prevSeccion;
            return (
              <div key={item.href}>
                {showSeccion && (
                  <div className="mb-1 mt-3 px-3 text-[10px] font-bold uppercase tracking-wider text-white/40">
                    {item.seccion}
                  </div>
                )}
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    active
                      ? 'bg-white/10 text-white'
                      : 'text-white/70 hover:bg-white/5 hover:text-white',
                  )}
                >
                  <Icon name={item.icon} size={18} />
                  <span className="flex-1 truncate">{item.label}</span>
                  {item.nuevo && (
                    <span className="bg-fire-600 rounded px-1 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white">
                      Nuevo
                    </span>
                  )}
                </Link>
              </div>
            );
          })}
        </nav>

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-white/70 hover:bg-white/5 hover:text-white"
        >
          <LogOut size={18} /> Salir
        </button>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center gap-2 border-b border-slate-200 bg-white px-4 py-2.5 sm:px-6">
          <button
            onClick={() => setMobileMenu(true)}
            className="-ml-2 rounded-lg p-2 text-slate-700 hover:bg-slate-100 md:hidden"
            aria-label="Abrir menú"
          >
            <Menu size={22} />
          </button>
          <div className="flex items-center gap-2 md:hidden">
            <div className="bg-fire-600 grid h-7 w-7 place-items-center rounded-md">
              <Flame size={14} className="text-white" />
            </div>
            <div className="font-bold leading-none text-slate-900">Faro</div>
          </div>
          <div className="hidden items-center gap-2 text-sm text-slate-600 md:flex">
            <span>{cuartel?.nombre}</span>
            <span className="text-slate-300">·</span>
            <span>{perfilLabel[sesion.perfilActivo]}</span>
          </div>
          <div className="flex-1" />
          <Link
            href="/buscar"
            className="grid h-9 w-9 place-items-center rounded-lg text-slate-700 hover:bg-slate-100"
            aria-label="Búsqueda global"
          >
            <Search size={18} />
          </Link>
          <Link
            href="/mapa-app"
            className="hidden h-9 w-9 place-items-center rounded-lg text-slate-700 hover:bg-slate-100 sm:grid"
            aria-label="Mapa de pantallas"
            title="Mapa de la aplicación"
          >
            <LayoutGrid size={18} />
          </Link>
          <SyncStatusPill />
          <Link
            href="/notificaciones"
            className="relative grid h-9 w-9 place-items-center rounded-lg text-slate-700 hover:bg-slate-100"
            aria-label="Notificaciones"
          >
            <Bell size={18} />
            <AnimatePresence>
              {notifSinLeer > 0 && (
                <motion.span
                  key={`badge-${notifSinLeer}`}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 18 }}
                  className="bg-status-risk absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full px-1 text-[10px] font-bold tabular-nums text-white ring-2 ring-white"
                >
                  {notifSinLeer > 9 ? '9+' : notifSinLeer}
                </motion.span>
              )}
            </AnimatePresence>
          </Link>
          <Link
            href="/seleccionar-perfil"
            className="ml-1 flex items-center gap-2 rounded-lg p-1 pr-2 hover:bg-slate-100"
          >
            <Avatar name={`${persona.nombre} ${persona.apellido}`} size={32} />
            <span className="hidden text-sm font-medium text-slate-700 sm:block">
              {persona.nombre}
            </span>
          </Link>
        </header>

        <OfflineBanner />

        <main className="flex-1 px-4 py-5 pb-24 sm:px-6 sm:py-7 md:pb-7">{children}</main>
      </div>

      {/* Bottom nav mobile */}
      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white pb-[env(safe-area-inset-bottom)] md:hidden">
        <div className="grid" style={{ gridTemplateColumns: `repeat(${bottomItems.length}, 1fr)` }}>
          {bottomItems.map((item) => {
            const active = activeCheck(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex flex-col items-center justify-center gap-0.5 py-2 text-[11px]',
                  active ? 'text-brand-700' : 'text-slate-500',
                )}
              >
                <Icon name={item.icon} size={22} className={active ? 'text-brand-700' : ''} />
                <span className="leading-none">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Mobile drawer */}
      {mobileMenu && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/50 md:hidden"
          onClick={() => setMobileMenu(false)}
        >
          <aside
            className="bg-brand-900 absolute inset-y-0 left-0 flex w-72 flex-col p-4 text-white"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="bg-fire-600 grid h-9 w-9 place-items-center rounded-lg">
                  <Flame size={20} className="text-white" />
                </div>
                <div>
                  <div className="font-bold leading-tight tracking-tight">Faro</div>
                  <div className="text-xs text-white/60">{cuartel?.nombre}</div>
                </div>
              </div>
              <button
                onClick={() => setMobileMenu(false)}
                className="rounded-lg p-2 hover:bg-white/10"
                aria-label="Cerrar menú"
              >
                <X size={20} />
              </button>
            </div>
            <nav className="flex flex-col gap-0.5 overflow-y-auto">
              {items.map((it) => (
                <Link
                  key={it.href}
                  href={it.href}
                  onClick={() => setMobileMenu(false)}
                  className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm text-white/80 hover:bg-white/10 hover:text-white"
                >
                  <Icon name={it.icon} size={18} />
                  <span className="flex-1 truncate">{it.label}</span>
                  {it.nuevo && (
                    <span className="bg-fire-600 rounded px-1 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white">
                      Nuevo
                    </span>
                  )}
                </Link>
              ))}
            </nav>
          </aside>
        </div>
      )}
    </div>
  );
}
