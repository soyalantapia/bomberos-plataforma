'use client';

import { motion } from 'framer-motion';
import { ArrowLeft, BookPlus, MapPin, Search, Shield, X } from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';

import { Badge, StatusPill, cn } from '@faro/ui';

import type { Persona } from '@faro/types';

import { AgregarContactoDialog } from '../../../../../components/federacion/agregar-contacto-dialog';
import { CuartelLogo } from '../../../../../components/federacion/cuartel-logo';
import { LegajoModal } from '../../../../../components/federacion/legajo-modal';
import { PersonaCardVertical } from '../../../../../components/federacion/persona-card-vertical';
import { useFaroStore } from '../../../../../store/use-faro-store';

type Filtro = 'todos' | 'activo' | 'administrativo';

/** Orden jerárquico de mayor a menor rango. */
const JERARQUIA_ORDEN: Record<Persona['jerarquia'], number> = {
  jefe: 100,
  comandante: 90,
  sub_comandante: 80,
  oficial: 70,
  sargento_ayudante: 60,
  sargento: 50,
  cabo: 40,
  bombero_1ra: 30,
  bombero: 20,
  cadete: 10,
};

export function CuartelDetalladoView({ slug }: { slug: string }) {
  const cuartelId = `cuartel-${slug}`;

  const cuarteles = useFaroStore((s) => s.cuarteles);
  const personas = useFaroStore((s) => s.personas);
  const personasFederacion = useFaroStore((s) => s.personasFederacion);

  const todasPersonas = useMemo<Persona[]>(
    () => [...personas, ...personasFederacion],
    [personas, personasFederacion],
  );

  const cuartel = cuarteles.find((c) => c.id === cuartelId);

  const [busqueda, setBusqueda] = useState('');
  const [filtro, setFiltro] = useState<Filtro>('todos');
  const [personaSeleccionada, setPersonaSeleccionada] = useState<Persona | null>(null);
  const [openAgregarContacto, setOpenAgregarContacto] = useState(false);

  const personasCuartel = useMemo(
    () => todasPersonas.filter((p) => p.cuartelId === cuartelId && p.estado === 'activo'),
    [todasPersonas, cuartelId],
  );

  const filtradas = useMemo(() => {
    return personasCuartel
      .filter((p) => {
        if (filtro === 'activo') return p.cuerpo === 'activo';
        if (filtro === 'administrativo') return p.cuerpo === 'administrativo';
        return true;
      })
      .filter((p) => {
        if (!busqueda.trim()) return true;
        const q = busqueda.toLowerCase();
        return (
          p.nombre.toLowerCase().includes(q) ||
          p.apellido.toLowerCase().includes(q) ||
          p.legajo.includes(q) ||
          p.funcion.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        // Orden: mayor jerarquía primero, después por apellido alfabético
        const ja = JERARQUIA_ORDEN[a.jerarquia] ?? 0;
        const jb = JERARQUIA_ORDEN[b.jerarquia] ?? 0;
        if (jb !== ja) return jb - ja;
        return a.apellido.localeCompare(b.apellido);
      });
  }, [personasCuartel, filtro, busqueda]);

  const cantActivos = personasCuartel.filter((p) => p.cuerpo === 'activo').length;
  const cantAdmin = personasCuartel.filter((p) => p.cuerpo === 'administrativo').length;

  if (!cuartel) {
    return (
      <div className="mx-auto max-w-5xl space-y-4 p-4">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Link href="/directorio" className="hover:text-brand-700 inline-flex items-center gap-1">
            <ArrowLeft size={14} /> Volver al directorio
          </Link>
        </div>
        <div className="grid place-items-center gap-2 rounded-xl bg-white py-16 text-center">
          <Shield size={36} className="text-slate-300" />
          <div className="text-sm text-slate-500">Cuartel no encontrado</div>
        </div>
      </div>
    );
  }

  const intent: 'ok' | 'warn' | 'risk' | 'neutral' =
    cuartel.cumplimiento === 'ok'
      ? 'ok'
      : cuartel.cumplimiento === 'warn'
        ? 'warn'
        : cuartel.cumplimiento === 'risk'
          ? 'risk'
          : 'neutral';

  return (
    <div className="mx-auto max-w-7xl space-y-4 pb-12">
      {/* Volver */}
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <Link href="/directorio" className="hover:text-brand-700 inline-flex items-center gap-1">
          <ArrowLeft size={14} /> Volver al directorio
        </Link>
      </div>

      {/* Header del cuartel */}
      <header className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 sm:flex-row sm:items-center">
        <CuartelLogo cuartel={cuartel} size={56} className="rounded-2xl" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900">BV {cuartel.nombre}</h1>
            <StatusPill status={intent} label={`${cuartel.porcentajeRendicion}%`} size="sm" />
          </div>
          <div className="mt-1 inline-flex flex-wrap items-center gap-3 text-sm text-slate-500">
            <span className="inline-flex items-center gap-1">
              <MapPin size={12} /> {cuartel.ciudad} · {cuartel.region}
            </span>
            {cuartel.matricula && (
              <span className="font-mono text-xs text-slate-400">{cuartel.matricula}</span>
            )}
          </div>
          {cuartel.jefe && (
            <div className="mt-1 text-xs text-slate-500">
              Jefe: <span className="font-semibold text-slate-800">{cuartel.jefe}</span>
            </div>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-2 text-center">
          <div className="rounded-xl bg-slate-50 px-3 py-2">
            <div className="text-xs uppercase tracking-wide text-slate-500">Activos</div>
            <div className="text-xl font-bold text-slate-900">{cantActivos}</div>
          </div>
          <div className="rounded-xl bg-slate-50 px-3 py-2">
            <div className="text-xs uppercase tracking-wide text-slate-500">Comisión</div>
            <div className="text-xl font-bold text-slate-900">{cantAdmin}</div>
          </div>
          <button
            type="button"
            onClick={() => setOpenAgregarContacto(true)}
            className="hover:border-brand-300 hover:bg-brand-50 inline-flex items-center gap-1.5 self-stretch rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 transition-colors"
            title="Sumar un contacto externo al cuartel (periodista, intendente, comercio…)"
          >
            <BookPlus size={14} />
            <span className="hidden sm:inline">Sumar contacto</span>
          </button>
        </div>
      </header>

      {/* Tabs cuerpo + búsqueda */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="flex gap-1 rounded-xl bg-slate-100 p-1">
          {(
            [
              ['todos', `Todos (${personasCuartel.length})`],
              ['activo', `Cuerpo Activo (${cantActivos})`],
              ['administrativo', `Comisión (${cantAdmin})`],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setFiltro(id)}
              className={cn(
                'whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
                filtro === id
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900',
              )}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar nombre, legajo o función..."
            className="focus:border-brand-400 focus:ring-brand-100 w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:ring-2"
          />
          {busqueda && (
            <button
              type="button"
              onClick={() => setBusqueda('')}
              className="absolute right-2 top-1/2 grid h-6 w-6 -translate-y-1/2 place-items-center rounded-full text-slate-400 hover:bg-slate-100"
            >
              <X size={12} />
            </button>
          )}
        </div>
        <Badge intent="neutral" className="shrink-0">
          {filtradas.length} {filtradas.length === 1 ? 'persona' : 'personas'}
        </Badge>
      </div>

      {/* Grilla de cards verticales */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {filtradas.length === 0 ? (
          <div className="col-span-full grid place-items-center gap-2 rounded-xl bg-white py-16 text-center">
            <Shield size={28} className="text-slate-300" />
            <div className="text-sm text-slate-500">Sin resultados</div>
          </div>
        ) : (
          filtradas.map((p, idx) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.01 }}
            >
              <PersonaCardVertical
                persona={p}
                cuartel={cuartel}
                onOpenFicha={(persona) => setPersonaSeleccionada(persona)}
              />
            </motion.div>
          ))
        )}
      </div>

      <AgregarContactoDialog
        open={openAgregarContacto}
        onClose={() => setOpenAgregarContacto(false)}
      />

      <LegajoModal
        persona={personaSeleccionada}
        cuartel={personaSeleccionada ? cuartel : null}
        onClose={() => setPersonaSeleccionada(null)}
      />
    </div>
  );
}
