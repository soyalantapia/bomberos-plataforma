'use client';

import { motion } from 'framer-motion';
import {
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  Flag,
  Layers,
  ListFilter,
  Search,
  Shield,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';

import { Avatar, Badge, Card, CardContent, Kpi, StatusPill, cn } from '@faro/ui';

import type { EspecialidadBombero, Persona } from '@faro/types';

import { CuartelDrawer } from '../../../../components/federacion/cuartel-drawer';
import {
  ESPECIALIDAD_LABEL,
  JERARQUIA_LABEL,
  PersonaCardFed,
} from '../../../../components/federacion/persona-card-fed';
import { PageHero } from '../../../../components/shared/page-hero';
import { useFaroStore } from '../../../../store/use-faro-store';

type Vista = 'region' | 'especialidad' | 'jerarquia' | 'lista';
type CuerpoFilter = 'todos' | 'activo' | 'administrativo';

const ESPECIALIDADES_ORDEN: EspecialidadBombero[] = [
  'hazmat',
  'rescate_vehicular',
  'rescate_altura',
  'rescate_acuatico',
  'busqueda_rescate',
  'primeros_auxilios',
  'desfibrilador',
  'conductor_maquinista',
  'forestal',
  'comunicaciones',
];

const JERARQUIA_ORDEN: Persona['jerarquia'][] = [
  'jefe',
  'comandante',
  'sub_comandante',
  'oficial',
  'sargento_ayudante',
  'sargento',
  'cabo',
  'bombero_1ra',
  'bombero',
  'cadete',
];

export default function DirectorioFederacionPage() {
  const cuarteles = useFaroStore((s) => s.cuarteles);
  const personas = useFaroStore((s) => s.personas);
  const personasFederacion = useFaroStore((s) => s.personasFederacion);
  const regiones = useFaroStore((s) => s.regiones);

  // Combinar personas del cuartel principal con las de federación
  const todasPersonas = useMemo<Persona[]>(
    () => [...personas, ...personasFederacion],
    [personas, personasFederacion],
  );

  const [vista, setVista] = useState<Vista>('region');
  const [busqueda, setBusqueda] = useState('');
  const [cuerpoFilter, setCuerpoFilter] = useState<CuerpoFilter>('todos');
  const [especialidadFilter, setEspecialidadFilter] = useState<EspecialidadBombero | 'todas'>(
    'todas',
  );
  const [regionesExpand, setRegionesExpand] = useState<Set<string>>(
    () => new Set(regiones.map((r) => r.nombre)),
  );
  const [cuartelSeleccionado, setCuartelSeleccionado] = useState<string | null>(null);

  const personasFiltradas = useMemo(() => {
    return todasPersonas.filter((p) => {
      if (p.estado !== 'activo') return false;
      if (cuerpoFilter !== 'todos' && p.cuerpo !== cuerpoFilter) return false;
      if (
        especialidadFilter !== 'todas' &&
        (!p.especialidades || !p.especialidades.includes(especialidadFilter))
      )
        return false;
      if (busqueda.trim()) {
        const q = busqueda.toLowerCase();
        const cuartel = cuarteles.find((c) => c.id === p.cuartelId);
        return (
          p.nombre.toLowerCase().includes(q) ||
          p.apellido.toLowerCase().includes(q) ||
          p.legajo.includes(q) ||
          p.funcion.toLowerCase().includes(q) ||
          cuartel?.nombre.toLowerCase().includes(q) ||
          (p.especialidades ?? []).some((e) => ESPECIALIDAD_LABEL[e].toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [todasPersonas, cuerpoFilter, especialidadFilter, busqueda, cuarteles]);

  // Agrupados por región → cuartel
  const porRegion = useMemo(() => {
    const grupos: Record<string, { cuartelId: string; nombre: string; personas: Persona[] }[]> = {};
    for (const r of regiones) {
      grupos[r.nombre] = [];
    }
    for (const cuartel of cuarteles) {
      const personasCuartel = personasFiltradas.filter((p) => p.cuartelId === cuartel.id);
      const region = cuartel.region;
      if (!grupos[region]) grupos[region] = [];
      grupos[region]!.push({
        cuartelId: cuartel.id,
        nombre: cuartel.nombre,
        personas: personasCuartel,
      });
    }
    return grupos;
  }, [cuarteles, regiones, personasFiltradas]);

  // Por especialidad
  const porEspecialidad = useMemo(() => {
    const result: Record<EspecialidadBombero, Persona[]> = {} as Record<
      EspecialidadBombero,
      Persona[]
    >;
    for (const esp of ESPECIALIDADES_ORDEN) result[esp] = [];
    for (const p of personasFiltradas) {
      if (!p.especialidades) continue;
      for (const e of p.especialidades) {
        result[e]?.push(p);
      }
    }
    return result;
  }, [personasFiltradas]);

  // Por jerarquía
  const porJerarquia = useMemo(() => {
    const result: Record<Persona['jerarquia'], Persona[]> = {} as Record<
      Persona['jerarquia'],
      Persona[]
    >;
    for (const j of JERARQUIA_ORDEN) result[j] = [];
    for (const p of personasFiltradas) {
      result[p.jerarquia]?.push(p);
    }
    return result;
  }, [personasFiltradas]);

  const cuartelActivo = cuartelSeleccionado
    ? (cuarteles.find((c) => c.id === cuartelSeleccionado) ?? null)
    : null;
  const personasCuartelActivo = cuartelActivo
    ? todasPersonas.filter((p) => p.cuartelId === cuartelActivo.id)
    : [];

  function toggleRegion(nombre: string) {
    setRegionesExpand((prev) => {
      const next = new Set(prev);
      if (next.has(nombre)) next.delete(nombre);
      else next.add(nombre);
      return next;
    });
  }

  const totalActivos = todasPersonas.filter(
    (p) => p.estado === 'activo' && p.cuerpo === 'activo',
  ).length;
  const totalAdmin = todasPersonas.filter(
    (p) => p.estado === 'activo' && p.cuerpo === 'administrativo',
  ).length;
  const totalEspecialistas = todasPersonas.filter(
    (p) => p.estado === 'activo' && p.especialidades && p.especialidades.length > 0,
  ).length;

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <Link href="/federacion" className="hover:text-brand-700 inline-flex items-center gap-1">
          <ArrowLeft size={14} /> Volver a federación
        </Link>
      </div>

      <PageHero
        objetivo="Federación · Directorio de personal"
        titulo="Toda la red en un solo lugar"
        descripcion="Buscá a cualquier integrante de la federación por región, cuartel, jerarquía o especialidad. Llamalo, escribile o mandale un mail directo desde acá."
        icono={<Users size={26} />}
        meta={
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Kpi label="Cuarteles" value={cuarteles.length} intent="brand" />
            <Kpi label="Cuerpo activo" value={totalActivos} intent="ok" />
            <Kpi label="Comisión directiva" value={totalAdmin} intent="brand" />
            <Kpi label="Especialistas" value={totalEspecialistas} intent="warn" />
          </div>
        }
      />

      {/* Vista toggle + búsqueda */}
      <Card>
        <CardContent className="space-y-3 p-4">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative min-w-0 flex-1">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar nombre, apellido, legajo, cuartel o especialidad..."
                className="focus:border-brand-400 focus:ring-brand-100 w-full rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm outline-none focus:ring-2"
              />
            </div>
            <div className="flex shrink-0 gap-1 rounded-lg bg-slate-100 p-1">
              {(
                [
                  ['region', 'Por región', <Flag key="r" size={14} />],
                  ['especialidad', 'Especialidad', <Shield key="e" size={14} />],
                  ['jerarquia', 'Jerarquía', <Layers key="j" size={14} />],
                  ['lista', 'Lista', <ListFilter key="l" size={14} />],
                ] as const
              ).map(([v, label, icon]) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setVista(v)}
                  className={cn(
                    'inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors',
                    vista === v
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900',
                  )}
                >
                  {icon}
                  <span className="hidden sm:inline">{label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Filtros
            </span>
            <select
              value={cuerpoFilter}
              onChange={(e) => setCuerpoFilter(e.target.value as CuerpoFilter)}
              className="focus:border-brand-400 focus:ring-brand-100 rounded-md border border-slate-200 px-2 py-1 text-xs outline-none focus:ring-2"
            >
              <option value="todos">Cuerpo: todos</option>
              <option value="activo">Cuerpo activo</option>
              <option value="administrativo">Comisión directiva</option>
            </select>
            <select
              value={especialidadFilter}
              onChange={(e) =>
                setEspecialidadFilter(e.target.value as EspecialidadBombero | 'todas')
              }
              className="focus:border-brand-400 focus:ring-brand-100 rounded-md border border-slate-200 px-2 py-1 text-xs outline-none focus:ring-2"
            >
              <option value="todas">Especialidad: todas</option>
              {ESPECIALIDADES_ORDEN.map((e) => (
                <option key={e} value={e}>
                  {ESPECIALIDAD_LABEL[e]}
                </option>
              ))}
            </select>
            <span className="ml-auto text-xs text-slate-500">
              {personasFiltradas.length} resultados
            </span>
          </div>
        </CardContent>
      </Card>

      {/* ─── VISTA POR REGIÓN ─── */}
      {vista === 'region' && (
        <div className="space-y-3">
          {regiones.map((r) => {
            const cuartelesRegion = porRegion[r.nombre] ?? [];
            const totalPersonasRegion = cuartelesRegion.reduce(
              (acc, c) => acc + c.personas.length,
              0,
            );
            const expand = regionesExpand.has(r.nombre);
            return (
              <Card key={r.id}>
                <button
                  type="button"
                  onClick={() => toggleRegion(r.nombre)}
                  className="flex w-full items-center gap-3 p-4 text-left transition-colors hover:bg-slate-50"
                >
                  <div className="bg-brand-50 text-brand-700 grid h-10 w-10 shrink-0 place-items-center rounded-xl">
                    <Flag size={18} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{r.nombre}</span>
                      <Badge intent="brand">{cuartelesRegion.length} cuarteles</Badge>
                      <Badge intent="neutral">{totalPersonasRegion} personas</Badge>
                    </div>
                    {r.descripcion && (
                      <p className="mt-0.5 truncate text-xs text-slate-500">{r.descripcion}</p>
                    )}
                  </div>
                  {expand ? (
                    <ChevronDown size={18} className="text-slate-400" />
                  ) : (
                    <ChevronRight size={18} className="text-slate-400" />
                  )}
                </button>
                {expand && (
                  <CardContent className="border-t border-slate-100 p-4 pt-3">
                    <div className="grid gap-2 sm:grid-cols-2">
                      {cuartelesRegion.map((c) => {
                        const cuartel = cuarteles.find((cu) => cu.id === c.cuartelId)!;
                        const intent =
                          cuartel.cumplimiento === 'ok'
                            ? 'ok'
                            : cuartel.cumplimiento === 'warn'
                              ? 'warn'
                              : cuartel.cumplimiento === 'risk'
                                ? 'risk'
                                : 'neutral';
                        return (
                          <button
                            key={c.cuartelId}
                            type="button"
                            onClick={() => setCuartelSeleccionado(c.cuartelId)}
                            className="hover:border-brand-300 hover:bg-brand-50/30 flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-3 text-left transition-colors"
                          >
                            <div className="bg-fire-50 text-fire-700 grid h-9 w-9 shrink-0 place-items-center rounded-lg">
                              <Shield size={16} />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5">
                                <span className="truncate font-semibold text-slate-900">
                                  BV {cuartel.nombre}
                                </span>
                                <StatusPill
                                  status={intent}
                                  label={`${cuartel.porcentajeRendicion}%`}
                                  size="sm"
                                />
                              </div>
                              <div className="mt-0.5 truncate text-xs text-slate-500">
                                {c.personas.length} personas · {cuartel.jefe ?? 'sin jefe'}
                              </div>
                            </div>
                            <ChevronRight size={16} className="shrink-0 text-slate-400" />
                          </button>
                        );
                      })}
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* ─── VISTA POR ESPECIALIDAD ─── */}
      {vista === 'especialidad' && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {ESPECIALIDADES_ORDEN.map((esp) => {
            const lista = porEspecialidad[esp] ?? [];
            return (
              <Card key={esp}>
                <CardContent className="p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="bg-fire-50 text-fire-700 grid h-9 w-9 place-items-center rounded-lg">
                        <Shield size={16} />
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">{ESPECIALIDAD_LABEL[esp]}</div>
                        <div className="text-xs text-slate-500">{lista.length} especialistas</div>
                      </div>
                    </div>
                  </div>
                  {lista.length === 0 ? (
                    <div className="grid h-24 place-items-center rounded-lg bg-slate-50 text-xs text-slate-400">
                      Sin especialistas
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      {lista.slice(0, 5).map((p) => {
                        const cuartel = cuarteles.find((c) => c.id === p.cuartelId);
                        return (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => setCuartelSeleccionado(p.cuartelId)}
                            className="flex w-full items-center gap-2 rounded-lg p-1.5 text-left transition-colors hover:bg-slate-50"
                          >
                            <Avatar name={`${p.nombre} ${p.apellido}`} size={28} />
                            <div className="min-w-0 flex-1">
                              <div className="truncate text-sm font-medium text-slate-900">
                                {p.apellido}, {p.nombre[0]}.
                              </div>
                              <div className="truncate text-[11px] text-slate-500">
                                {cuartel?.nombre} · {JERARQUIA_LABEL[p.jerarquia]}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                      {lista.length > 5 && (
                        <div className="pt-1 text-center text-[11px] text-slate-500">
                          +{lista.length - 5} más
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* ─── VISTA POR JERARQUÍA ─── */}
      {vista === 'jerarquia' && (
        <div className="space-y-3">
          {JERARQUIA_ORDEN.map((j) => {
            const lista = porJerarquia[j] ?? [];
            if (lista.length === 0) return null;
            return (
              <Card key={j}>
                <CardContent className="p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <div className="bg-brand-50 text-brand-700 grid h-9 w-9 place-items-center rounded-lg">
                      <Layers size={16} />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900">{JERARQUIA_LABEL[j]}</div>
                      <div className="text-xs text-slate-500">
                        {lista.length} {lista.length === 1 ? 'persona' : 'personas'}
                      </div>
                    </div>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {lista.map((p) => {
                      const cuartel = cuarteles.find((c) => c.id === p.cuartelId);
                      return (
                        <PersonaCardFed
                          key={p.id}
                          persona={p}
                          cuartel={cuartel}
                          region={cuartel?.region}
                          compact
                        />
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* ─── VISTA LISTA PLANA ─── */}
      {vista === 'lista' && (
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {personasFiltradas.length === 0 ? (
            <div className="col-span-full grid h-32 place-items-center rounded-xl bg-slate-50 text-sm text-slate-400">
              No hay personas que coincidan con los filtros
            </div>
          ) : (
            personasFiltradas.map((p) => {
              const cuartel = cuarteles.find((c) => c.id === p.cuartelId);
              return (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <PersonaCardFed persona={p} cuartel={cuartel} region={cuartel?.region} />
                </motion.div>
              );
            })
          )}
        </div>
      )}

      <CuartelDrawer
        cuartel={cuartelActivo}
        personas={personasCuartelActivo}
        onClose={() => setCuartelSeleccionado(null)}
      />
    </div>
  );
}
