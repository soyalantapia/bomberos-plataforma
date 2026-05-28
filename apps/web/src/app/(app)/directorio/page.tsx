'use client';

import { motion } from 'framer-motion';
import { ChevronRight, Search, Shield, Users, X } from 'lucide-react';
import { useMemo, useState } from 'react';

import { Avatar, cn } from '@faro/ui';

import type { Persona } from '@faro/types';

import { CuartelDrawer } from '../../../components/federacion/cuartel-drawer';
import { LegajoDrawer } from '../../../components/federacion/legajo-drawer';
import {
  ESPECIALIDAD_LABEL,
  JERARQUIA_LABEL,
} from '../../../components/federacion/persona-card-fed';
import { useFaroStore } from '../../../store/use-faro-store';

const REGION_COLORS: Record<string, string> = {
  'Norte GBA': 'bg-blue-50 text-blue-700',
  'Sur GBA': 'bg-amber-50 text-amber-700',
  'Oeste GBA': 'bg-green-50 text-green-700',
};

export default function DirectorioFederacionPage() {
  const cuarteles = useFaroStore((s) => s.cuarteles);
  const personas = useFaroStore((s) => s.personas);
  const personasFederacion = useFaroStore((s) => s.personasFederacion);
  const regiones = useFaroStore((s) => s.regiones);

  const todasPersonas = useMemo<Persona[]>(
    () => [...personas, ...personasFederacion],
    [personas, personasFederacion],
  );

  const [busqueda, setBusqueda] = useState('');
  const [cuartelSeleccionado, setCuartelSeleccionado] = useState<string | null>(null);
  const [personaSeleccionada, setPersonaSeleccionada] = useState<Persona | null>(null);

  const buscando = busqueda.trim().length > 0;

  const resultados = useMemo(() => {
    if (!buscando) return [];
    const q = busqueda.toLowerCase().trim();
    return todasPersonas
      .filter((p) => p.estado === 'activo')
      .filter((p) => {
        const cuartel = cuarteles.find((c) => c.id === p.cuartelId);
        return (
          p.nombre.toLowerCase().includes(q) ||
          p.apellido.toLowerCase().includes(q) ||
          p.legajo.includes(q) ||
          p.funcion.toLowerCase().includes(q) ||
          (cuartel?.nombre.toLowerCase().includes(q) ?? false) ||
          JERARQUIA_LABEL[p.jerarquia].toLowerCase().includes(q) ||
          (p.especialidades ?? []).some((e) => ESPECIALIDAD_LABEL[e].toLowerCase().includes(q))
        );
      })
      .slice(0, 50);
  }, [buscando, busqueda, todasPersonas, cuarteles]);

  const cuartelActivo = cuartelSeleccionado
    ? (cuarteles.find((c) => c.id === cuartelSeleccionado) ?? null)
    : null;
  const personasCuartelActivo = cuartelActivo
    ? todasPersonas.filter((p) => p.cuartelId === cuartelActivo.id)
    : [];

  const totalActivos = todasPersonas.filter((p) => p.estado === 'activo').length;

  return (
    <div className="mx-auto max-w-5xl space-y-4 pb-12">
      {/* Header chico horizontal */}
      <header className="flex items-center gap-3">
        <div className="bg-brand-50 text-brand-700 grid h-10 w-10 place-items-center rounded-xl">
          <Users size={20} />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900">Directorio</h1>
          <p className="text-xs text-slate-500">
            {totalActivos} personas · {cuarteles.length} cuarteles
          </p>
        </div>
      </header>

      {/* Búsqueda al frente */}
      <div className="relative">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar persona, cuartel o especialidad..."
          className="focus:border-brand-400 focus:ring-brand-100 w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm outline-none focus:ring-2"
        />
        {busqueda && (
          <button
            type="button"
            onClick={() => setBusqueda('')}
            className="absolute right-2 top-1/2 grid h-6 w-6 -translate-y-1/2 place-items-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <X size={13} />
          </button>
        )}
      </div>

      {/* ─── MODO BÚSQUEDA: resultados directos ─── */}
      {buscando && (
        <section>
          <div className="mb-2 px-1 text-xs text-slate-500">
            {resultados.length} {resultados.length === 1 ? 'resultado' : 'resultados'}
          </div>
          {resultados.length === 0 ? (
            <div className="grid place-items-center gap-2 rounded-xl bg-white py-10 text-center">
              <Users size={28} className="text-slate-300" />
              <div className="text-sm text-slate-500">Sin resultados</div>
            </div>
          ) : (
            <div className="grid gap-2 sm:grid-cols-2">
              {resultados.map((p, idx) => {
                const cuartel = cuarteles.find((c) => c.id === p.cuartelId);
                return (
                  <motion.button
                    key={p.id}
                    type="button"
                    onClick={() => setPersonaSeleccionada(p)}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.015 }}
                    className="hover:border-brand-300 flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 text-left transition-shadow hover:shadow-md"
                  >
                    <Avatar name={`${p.nombre} ${p.apellido}`} src={p.fotoUrl} size={40} />
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-semibold text-slate-900">
                        {p.apellido}, {p.nombre}
                      </div>
                      <div className="truncate text-xs text-slate-500">
                        {JERARQUIA_LABEL[p.jerarquia]}
                        {cuartel && ` · ${cuartel.nombre}`}
                      </div>
                    </div>
                    <ChevronRight size={16} className="shrink-0 text-slate-400" />
                  </motion.button>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* ─── MODO NAVEGACIÓN: lista simple por región ─── */}
      {!buscando &&
        regiones.map((r) => {
          const cuartelesRegion = cuarteles.filter((c) => c.region === r.nombre);
          const personasRegion = todasPersonas.filter(
            (p) => p.estado === 'activo' && cuartelesRegion.some((c) => c.id === p.cuartelId),
          ).length;
          const colorClass = REGION_COLORS[r.nombre] ?? 'bg-slate-100 text-slate-700';

          return (
            <section key={r.id}>
              <div className="mb-2 flex items-baseline justify-between px-1">
                <h2 className="flex items-center gap-2">
                  <span
                    className={cn(
                      'inline-flex h-6 items-center rounded-md px-2 text-xs font-bold',
                      colorClass,
                    )}
                  >
                    {r.nombre}
                  </span>
                </h2>
                <span className="text-xs text-slate-500">{personasRegion} personas</span>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                {cuartelesRegion.map((c) => {
                  const personasCuartel = todasPersonas.filter(
                    (p) => p.cuartelId === c.id && p.estado === 'activo',
                  );
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setCuartelSeleccionado(c.id)}
                      className="hover:border-brand-300 group flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 text-left transition-all hover:shadow-md"
                    >
                      <div className="bg-fire-50 text-fire-700 grid h-10 w-10 shrink-0 place-items-center rounded-xl">
                        <Shield size={18} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate font-semibold text-slate-900">{c.nombre}</div>
                        <div className="mt-0.5 text-xs text-slate-500">
                          {personasCuartel.length} personas
                        </div>
                      </div>
                      <ChevronRight
                        size={16}
                        className="group-hover:text-brand-600 shrink-0 text-slate-300 transition-colors"
                      />
                    </button>
                  );
                })}
              </div>
            </section>
          );
        })}

      <CuartelDrawer
        cuartel={cuartelActivo}
        personas={personasCuartelActivo}
        onClose={() => setCuartelSeleccionado(null)}
        onOpenLegajo={(p) => setPersonaSeleccionada(p)}
      />

      <LegajoDrawer
        persona={personaSeleccionada}
        cuartel={
          personaSeleccionada
            ? (cuarteles.find((c) => c.id === personaSeleccionada.cuartelId) ?? null)
            : null
        }
        onClose={() => setPersonaSeleccionada(null)}
      />
    </div>
  );
}
