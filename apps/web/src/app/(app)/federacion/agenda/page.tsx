'use client';

import { motion } from 'framer-motion';
import { ArrowLeft, BookMarked, Plus, Search, SlidersHorizontal, X } from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';

import { Button, cn } from '@faro/ui';

import type { CategoriaContacto, ContactoRed } from '@faro/types';

import { AgregarContactoDialog } from '../../../../components/federacion/agregar-contacto-dialog';
import { CAT_INFO, ContactoCard } from '../../../../components/federacion/contacto-card';
import { REGION_NOMBRE_A_ID } from '../../../../data/regiones';
import { selectCuartelActivo, useFaroStore } from '../../../../store/use-faro-store';

type Nivel = 'cuartel' | 'region' | 'federacion';

const CATEGORIAS_FILTRO: CategoriaContacto[] = [
  'gobierno',
  'salud',
  'seguridad',
  'servicios',
  'logistica',
  'medios',
  'otro',
];

export default function AgendaFederalPage() {
  const cuartel = useFaroStore(selectCuartelActivo);
  const contactos = useFaroStore((s) => s.contactosRed);
  const sesion = useFaroStore((s) => s.sesion);

  const miRegionId = cuartel ? REGION_NOMBRE_A_ID[cuartel.region] : undefined;
  const miRegionNombre = cuartel?.region;

  const [nivel, setNivel] = useState<Nivel>('cuartel');
  const [busqueda, setBusqueda] = useState('');
  const [categoriasActivas, setCategoriasActivas] = useState<Set<CategoriaContacto>>(
    () => new Set(),
  );
  const [openAgregar, setOpenAgregar] = useState(false);
  const [openFiltros, setOpenFiltros] = useState(false);

  function toggleCat(c: CategoriaContacto) {
    setCategoriasActivas((prev) => {
      const next = new Set(prev);
      if (next.has(c)) next.delete(c);
      else next.add(c);
      return next;
    });
  }

  const contactosFiltrados = useMemo(() => {
    return contactos
      .filter((c) => c.activo)
      .filter((c) => {
        if (nivel === 'cuartel') return c.nivel === 'cuartel' && c.cuartelId === cuartel?.id;
        if (nivel === 'region') return c.nivel === 'region' && c.regionId === miRegionId;
        return c.nivel === 'federacion';
      })
      .filter((c) => (categoriasActivas.size === 0 ? true : categoriasActivas.has(c.categoria)))
      .filter((c) => {
        if (!busqueda.trim()) return true;
        const q = busqueda.toLowerCase();
        return (
          c.nombre.toLowerCase().includes(q) ||
          c.cargo.toLowerCase().includes(q) ||
          (c.organismo && c.organismo.toLowerCase().includes(q)) ||
          c.telefonos.some((t) => t.includes(q)) ||
          (c.tags && c.tags.some((t) => t.toLowerCase().includes(q)))
        );
      });
  }, [contactos, nivel, cuartel, miRegionId, categoriasActivas, busqueda]);

  // Conteos por nivel
  const conteos = useMemo(() => {
    const all = contactos.filter((c) => c.activo);
    return {
      cuartel: all.filter((c) => c.nivel === 'cuartel' && c.cuartelId === cuartel?.id).length,
      region: all.filter((c) => c.nivel === 'region' && c.regionId === miRegionId).length,
      federacion: all.filter((c) => c.nivel === 'federacion').length,
    };
  }, [contactos, cuartel, miRegionId]);

  const NIVELES: Array<{ id: Nivel; label: string; subtitulo: string; count: number }> = [
    {
      id: 'cuartel',
      label: 'Mi cuartel',
      subtitulo: cuartel?.nombre ? `BV ${cuartel.nombre}` : '—',
      count: conteos.cuartel,
    },
    {
      id: 'region',
      label: 'Mi región',
      subtitulo: miRegionNombre ?? '—',
      count: conteos.region,
    },
    {
      id: 'federacion',
      label: 'Federación',
      subtitulo: 'Toda la red',
      count: conteos.federacion,
    },
  ];

  const hayFiltros = categoriasActivas.size > 0;

  return (
    <div className="mx-auto max-w-5xl space-y-4 pb-12">
      {/* Volver */}
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <Link href="/federacion" className="hover:text-brand-700 inline-flex items-center gap-1">
          <ArrowLeft size={14} /> Volver a federación
        </Link>
      </div>

      {/* Header chico horizontal */}
      <header className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="bg-fire-50 text-fire-700 grid h-10 w-10 place-items-center rounded-xl">
            <BookMarked size={20} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Agenda</h1>
            <p className="text-xs text-slate-500">Contactos externos al cuartel</p>
          </div>
        </div>
        <Button intent="primary" onClick={() => setOpenAgregar(true)}>
          <Plus size={14} />
          <span className="hidden sm:inline">Agregar</span>
        </Button>
      </header>

      {/* Tabs delgados (subrayado activo) */}
      <div className="border-b border-slate-200">
        <div className="flex gap-1 overflow-x-auto">
          {NIVELES.map((n) => (
            <button
              key={n.id}
              type="button"
              onClick={() => setNivel(n.id)}
              className={cn(
                'relative whitespace-nowrap px-4 py-2.5 text-sm font-medium transition-colors',
                nivel === n.id ? 'text-brand-700' : 'text-slate-500 hover:text-slate-800',
              )}
            >
              <span>{n.label}</span>
              <span
                className={cn(
                  'ml-1.5 text-xs font-bold',
                  nivel === n.id ? 'text-brand-700' : 'text-slate-400',
                )}
              >
                {n.count}
              </span>
              {nivel === n.id && (
                <motion.span
                  layoutId="agenda-tab-underline"
                  className="bg-brand-600 absolute -bottom-px left-0 right-0 h-0.5 rounded-full"
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Búsqueda + filtros en una línea */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar nombre, cargo, teléfono..."
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
        <button
          type="button"
          onClick={() => setOpenFiltros((v) => !v)}
          className={cn(
            'relative flex shrink-0 items-center gap-1.5 rounded-xl border px-3 py-2.5 text-sm font-medium transition-colors',
            hayFiltros || openFiltros
              ? 'border-brand-300 bg-brand-50 text-brand-700'
              : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50',
          )}
        >
          <SlidersHorizontal size={14} />
          <span className="hidden sm:inline">Filtrar</span>
          {hayFiltros && (
            <span className="bg-brand-600 absolute -right-1 -top-1 grid h-4 min-w-[16px] place-items-center rounded-full px-1 text-[10px] font-bold text-white">
              {categoriasActivas.size}
            </span>
          )}
        </button>
      </div>

      {/* Panel de filtros colapsable */}
      {openFiltros && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="overflow-hidden"
        >
          <div className="rounded-xl border border-slate-200 bg-white p-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Categoría
              </span>
              {hayFiltros && (
                <button
                  type="button"
                  onClick={() => setCategoriasActivas(new Set())}
                  className="text-brand-600 text-xs font-medium hover:underline"
                >
                  Limpiar
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {CATEGORIAS_FILTRO.map((c) => {
                const info = CAT_INFO[c];
                const activa = categoriasActivas.has(c);
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => toggleCat(c)}
                    className={cn(
                      'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all',
                      activa
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200',
                    )}
                  >
                    <span>{info.icon}</span>
                    {info.label}
                  </button>
                );
              })}
            </div>
          </div>
        </motion.div>
      )}

      {/* Aviso de permisos solo cuando aplica */}
      {nivel === 'federacion' && sesion?.perfilActivo !== 'federacion' && (
        <div className="bg-status-warn-bg/30 rounded-lg px-3 py-2 text-xs text-slate-600">
          Solo el perfil <strong>Federación</strong> puede agregar contactos a este nivel.
        </div>
      )}

      {/* Lista de contactos */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {contactosFiltrados.length === 0 ? (
          <div className="col-span-full">
            <div className="grid place-items-center gap-3 rounded-xl bg-white py-12 text-center">
              <BookMarked size={28} className="text-slate-300" />
              <div className="text-sm text-slate-500">
                {busqueda || hayFiltros ? 'Sin resultados' : 'Sin contactos en este nivel'}
              </div>
              {!busqueda && !hayFiltros && (
                <Button intent="primary" size="sm" onClick={() => setOpenAgregar(true)}>
                  <Plus size={14} /> Agregar primero
                </Button>
              )}
            </div>
          </div>
        ) : (
          contactosFiltrados.map((c: ContactoRed, idx) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.02 }}
            >
              <ContactoCard contacto={c} />
            </motion.div>
          ))
        )}
      </div>

      <AgregarContactoDialog open={openAgregar} onClose={() => setOpenAgregar(false)} />
    </div>
  );
}
