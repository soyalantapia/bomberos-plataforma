'use client';

import { motion } from 'framer-motion';
import { ArrowLeft, BookMarked, Flag, Globe2, Plus, Search, Shield } from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';

import { Badge, Button, Card, CardContent, Kpi, cn } from '@faro/ui';

import type { CategoriaContacto, ContactoRed, NivelContactoRed } from '@faro/types';

import { AgregarContactoDialog } from '../../../../components/federacion/agregar-contacto-dialog';
import { CAT_INFO, ContactoCard } from '../../../../components/federacion/contacto-card';
import { PageHero } from '../../../../components/shared/page-hero';
import { REGION_NOMBRE_A_ID } from '../../../../data/regiones';
import { selectCuartelActivo, useFaroStore } from '../../../../store/use-faro-store';

type Tab = 'cuartel' | 'region' | 'federacion' | 'todos';

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

  const [tab, setTab] = useState<Tab>('cuartel');
  const [busqueda, setBusqueda] = useState('');
  const [categoriasActivas, setCategoriasActivas] = useState<Set<CategoriaContacto>>(
    () => new Set(),
  );
  const [openAgregar, setOpenAgregar] = useState(false);

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
        // Filtro por tab
        if (tab === 'cuartel') return c.nivel === 'cuartel' && c.cuartelId === cuartel?.id;
        if (tab === 'region') return c.nivel === 'region' && c.regionId === miRegionId;
        if (tab === 'federacion') return c.nivel === 'federacion';
        return true; // todos
      })
      .filter((c) => {
        if (categoriasActivas.size === 0) return true;
        return categoriasActivas.has(c.categoria);
      })
      .filter((c) => {
        if (!busqueda.trim()) return true;
        const q = busqueda.toLowerCase();
        return (
          c.nombre.toLowerCase().includes(q) ||
          c.cargo.toLowerCase().includes(q) ||
          (c.organismo && c.organismo.toLowerCase().includes(q)) ||
          c.telefonos.some((t) => t.includes(q)) ||
          (c.tags && c.tags.some((t) => t.toLowerCase().includes(q))) ||
          (c.notas && c.notas.toLowerCase().includes(q))
        );
      });
  }, [contactos, tab, cuartel, miRegionId, categoriasActivas, busqueda]);

  // Conteos por tab
  const conteos = useMemo(() => {
    const c = (n: NivelContactoRed, extra?: (x: ContactoRed) => boolean) =>
      contactos.filter((x) => x.activo && x.nivel === n && (extra ? extra(x) : true)).length;
    return {
      cuartel: c('cuartel', (x) => x.cuartelId === cuartel?.id),
      region: c('region', (x) => x.regionId === miRegionId),
      federacion: c('federacion'),
      todos: contactos.filter((x) => x.activo).length,
    };
  }, [contactos, cuartel, miRegionId]);

  const totalUsosMes = useMemo(() => {
    const hace30dias = Date.now() - 30 * 86400000;
    return contactos.filter(
      (c) => c.ultimoUso && new Date(c.ultimoUso.fecha).getTime() > hace30dias,
    ).length;
  }, [contactos]);

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <Link href="/federacion" className="hover:text-brand-700 inline-flex items-center gap-1">
          <ArrowLeft size={14} /> Volver a federación
        </Link>
      </div>

      <PageHero
        objetivo="Federación · Red de contactos"
        titulo="Agenda federal"
        descripcion="Contactos externos a la federación: autoridades, salud, seguridad, medios y proveedores. Cada cuartel sostiene su agenda; la federación cura los contactos compartidos."
        icono={<BookMarked size={26} />}
        meta={
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Kpi label="Total contactos" value={conteos.todos} intent="brand" />
            <Kpi label="De mi cuartel" value={conteos.cuartel} intent="ok" />
            <Kpi label="De mi región" value={conteos.region} intent="brand" />
            <Kpi
              label="Activos último mes"
              value={totalUsosMes}
              hint="contactados"
              intent={totalUsosMes > 0 ? 'ok' : 'neutral'}
            />
          </div>
        }
        acciones={
          <Button intent="primary" onClick={() => setOpenAgregar(true)}>
            <Plus size={14} /> Agregar contacto
          </Button>
        }
      />

      {/* Tabs de nivel */}
      <Card>
        <CardContent className="space-y-3 p-4">
          <div className="flex flex-wrap gap-1 rounded-lg bg-slate-100 p-1">
            {(
              [
                ['cuartel', 'Mi Cuartel', <Shield key="c" size={14} />, conteos.cuartel],
                ['region', 'Mi Región', <Flag key="r" size={14} />, conteos.region],
                ['federacion', 'Federación', <Globe2 key="f" size={14} />, conteos.federacion],
                ['todos', 'Todos', null, conteos.todos],
              ] as const
            ).map(([t, label, icon, count]) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={cn(
                  'flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  tab === t
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900',
                )}
              >
                {icon}
                <span>{label}</span>
                <Badge intent={tab === t ? 'brand' : 'neutral'} className="px-1.5 text-[10px]">
                  {count}
                </Badge>
              </button>
            ))}
          </div>

          {/* Búsqueda y filtros */}
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
                placeholder="Buscar por nombre, cargo, organismo, teléfono o tag..."
                className="focus:border-brand-400 focus:ring-brand-100 w-full rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm outline-none focus:ring-2"
              />
            </div>
          </div>

          {/* Categorías */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="mr-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Categorías
            </span>
            {CATEGORIAS_FILTRO.map((c) => {
              const info = CAT_INFO[c];
              const activa = categoriasActivas.has(c);
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => toggleCat(c)}
                  className={cn(
                    'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition-all',
                    activa
                      ? 'bg-brand-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200',
                  )}
                >
                  <span>{info.icon}</span>
                  {info.label}
                </button>
              );
            })}
            {categoriasActivas.size > 0 && (
              <button
                type="button"
                onClick={() => setCategoriasActivas(new Set())}
                className="ml-1 text-xs text-slate-500 underline hover:text-slate-700"
              >
                Limpiar
              </button>
            )}
            <span className="ml-auto text-xs text-slate-500">
              {contactosFiltrados.length} resultados
            </span>
          </div>

          {/* Hint contextual */}
          {tab === 'federacion' && sesion?.perfilActivo !== 'federacion' && (
            <div className="bg-status-warn-bg/30 border-status-warn rounded-lg border px-3 py-2 text-xs text-slate-700">
              Estos contactos están curados por el Consejo Directivo de la federación. Solo el
              perfil <strong>Federación</strong> puede agregar a este nivel.
            </div>
          )}
          {tab === 'region' && !miRegionId && (
            <div className="bg-status-warn-bg/30 border-status-warn rounded-lg border px-3 py-2 text-xs text-slate-700">
              Tu cuartel no tiene región asignada. Hablá con el Consejo Directivo.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Lista de contactos */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {contactosFiltrados.length === 0 ? (
          <div className="col-span-full">
            <Card>
              <CardContent className="grid place-items-center gap-3 py-12 text-center">
                <BookMarked size={36} className="text-slate-300" />
                <div>
                  <div className="font-medium text-slate-700">
                    No hay contactos {tab === 'cuartel' ? 'en tu cuartel' : 'en este nivel'}
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    {busqueda || categoriasActivas.size > 0
                      ? 'Probá quitar los filtros o ampliar la búsqueda.'
                      : 'Sumá el primero con el botón "Agregar contacto" arriba.'}
                  </p>
                </div>
                <Button intent="primary" size="sm" onClick={() => setOpenAgregar(true)}>
                  <Plus size={14} /> Agregar contacto
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : (
          contactosFiltrados.map((c, idx) => (
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

      {/* Footer info contextual */}
      {tab === 'cuartel' && miRegionNombre && (
        <Card className="bg-brand-50/30 border-brand-100">
          <CardContent className="flex items-center gap-3 p-4">
            <Flag size={20} className="text-brand-700" />
            <div className="min-w-0 flex-1 text-sm text-slate-700">
              <strong>Tip:</strong> Si un contacto es útil para todos los cuarteles de{' '}
              <strong>{miRegionNombre}</strong>, pedile a un mando que lo promueva al nivel Región.
            </div>
          </CardContent>
        </Card>
      )}

      <AgregarContactoDialog open={openAgregar} onClose={() => setOpenAgregar(false)} />
    </div>
  );
}
