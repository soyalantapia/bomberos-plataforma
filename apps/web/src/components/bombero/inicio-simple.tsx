'use client';

import { ClipboardList, Flame, LayoutGrid, LogIn, LogOut, Star, User } from 'lucide-react';
import Link from 'next/link';
import { useMemo } from 'react';

import type { Persona } from '@faro/types';

import { useFaroStore } from '../../store/use-faro-store';

function fmtHora(iso: string): string {
  return iso.slice(11, 16);
}

/**
 * Inicio simplificado para el usuario menos técnico (feedback, párrafos 1–2:
 * "para la baldosa tiene que ser fácil; para el capaz, con profundidad").
 * Pocas acciones grandes, texto grande, un toque por tarea. El modo completo
 * sigue disponible con un botón.
 */
export function InicioSimple({ persona }: { persona: Persona }) {
  const tareas = useFaroStore((s) => s.tareas);
  const fichajes = useFaroStore((s) => s.fichajes);
  const setModoSimple = useFaroStore((s) => s.setModoSimple);

  const pendientes = useMemo(
    () =>
      tareas.filter(
        (t) =>
          t.asignadaA === persona.id &&
          (t.estado === 'asignada' || t.estado === 'reabierta' || t.estado === 'en_progreso'),
      ).length,
    [tareas, persona.id],
  );

  const fichajeAbierto = useMemo(
    () => fichajes.find((f) => f.personaId === persona.id && !f.egreso),
    [fichajes, persona.id],
  );

  const tiles: {
    href: string;
    icon: typeof Flame;
    label: string;
    sub: string;
    color: string;
    badge?: number;
  }[] = [
    {
      href: '/bombero/asistencia',
      icon: fichajeAbierto ? LogOut : LogIn,
      label: fichajeAbierto ? 'Marcar salida' : 'Fichar entrada',
      sub: fichajeAbierto
        ? `En el cuartel desde ${fmtHora(fichajeAbierto.ingreso)}`
        : 'Registrá tu llegada',
      color: 'bg-brand-600',
    },
    {
      href: '/bombero/tareas',
      icon: ClipboardList,
      label: 'Mis tareas',
      sub: pendientes > 0 ? `${pendientes} pendiente${pendientes === 1 ? '' : 's'}` : 'Todo al día',
      color: 'bg-slate-700',
      badge: pendientes || undefined,
    },
    {
      href: '/bombero/legajo',
      icon: User,
      label: 'Mi legajo',
      sub: 'Tus datos y cursos',
      color: 'bg-slate-700',
    },
    {
      href: '/bombero/mi-desempeno',
      icon: Star,
      label: 'Mi desempeño',
      sub: 'Tu nota y cumplimiento',
      color: 'bg-slate-700',
    },
  ];

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="px-1 pt-1">
        <h1 className="text-2xl font-bold text-slate-900">Hola, {persona.nombre}</h1>
        <p className="text-base text-slate-600">¿Qué querés hacer?</p>
      </div>

      {/* Acción principal: registrar servicio */}
      <Link href="/bombero/registrar-servicio" className="block">
        <div className="from-fire-600 to-fire-700 flex items-center gap-4 rounded-3xl bg-gradient-to-br p-6 text-white shadow-lg active:scale-[0.99]">
          <div className="grid h-20 w-20 shrink-0 place-items-center rounded-2xl bg-white/20">
            <Flame size={44} />
          </div>
          <div className="min-w-0">
            <div className="text-2xl font-bold leading-tight">Registrar un servicio</div>
            <div className="mt-1 text-base text-white/85">
              Tocá acá cuando vuelvas de una salida
            </div>
          </div>
        </div>
      </Link>

      {/* Acciones grandes */}
      <div className="grid grid-cols-2 gap-3">
        {tiles.map((t) => {
          const Icon = t.icon;
          return (
            <Link
              key={t.href}
              href={t.href}
              className="relative flex min-h-[140px] flex-col items-center justify-center gap-2 rounded-3xl bg-white p-4 text-center shadow-sm ring-1 ring-slate-200 transition-shadow hover:shadow-md active:scale-[0.99]"
            >
              {t.badge ? (
                <span className="bg-status-warn text-status-warn-fg absolute right-3 top-3 grid h-7 min-w-7 place-items-center rounded-full px-2 text-sm font-bold">
                  {t.badge}
                </span>
              ) : null}
              <div
                className={`grid h-16 w-16 place-items-center rounded-2xl text-white ${t.color}`}
              >
                <Icon size={32} />
              </div>
              <div className="text-lg font-bold leading-tight text-slate-900">{t.label}</div>
              <div className="text-xs text-slate-500">{t.sub}</div>
            </Link>
          );
        })}
      </div>

      <button
        type="button"
        onClick={() => setModoSimple(false)}
        className="mx-auto mt-2 flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-700"
      >
        <LayoutGrid size={15} /> Ver modo completo
      </button>
    </div>
  );
}
