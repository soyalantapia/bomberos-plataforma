'use client';

import { motion } from 'framer-motion';
import {
  Antenna,
  Building2,
  Crown,
  MapPin,
  Network,
  Package,
  Phone,
  Search,
  Shield,
  Stethoscope,
  Truck,
  Warehouse,
  Wrench,
  X,
  type LucideIcon,
} from 'lucide-react';
import { useMemo, useState } from 'react';

import { Avatar, Badge, cn } from '@faro/ui';

import { CuartelLogo } from '../../../components/federacion/cuartel-logo';
import { CARGO_LABEL } from '../../../lib/permisos';
import { fmtJerarquia } from '../../../lib/utils/jerarquia';
import { selectCuartelActivo, useFaroStore } from '../../../store/use-faro-store';

const SECTOR_ICON: Record<string, LucideIcon> = {
  truck: Truck,
  package: Package,
  warehouse: Warehouse,
  wrench: Wrench,
  antenna: Antenna,
  stethoscope: Stethoscope,
};

function soloDigitos(s?: string): string {
  return (s ?? '').replace(/[^\d]/g, '');
}

export default function OrganigramaPage() {
  const cuartel = useFaroStore(selectCuartelActivo);
  const consejo = useFaroStore((s) => s.consejo);
  const sectores = useFaroStore((s) => s.sectores);
  const destacamentos = useFaroStore((s) => s.destacamentos);
  const personas = useFaroStore((s) => s.personas);

  const [busqueda, setBusqueda] = useState('');

  const personaById = useMemo(() => new Map(personas.map((p) => [p.id, p])), [personas]);

  const consejoCuartel = useMemo(
    () => consejo.filter((c) => c.cuartelId === cuartel?.id),
    [consejo, cuartel?.id],
  );
  const presidente = consejoCuartel.find((c) => c.cargo === 'presidente');
  const restoConsejo = consejoCuartel.filter((c) => c.cargo !== 'presidente');

  const jefeCuerpo = personas.find(
    (p) => p.cuartelId === cuartel?.id && p.cargoInstitucional === 'jefe_cuerpo',
  );
  const segundoJefe = personas.find(
    (p) => p.cuartelId === cuartel?.id && p.cargoInstitucional === 'segundo_jefe',
  );

  const sectoresCuartel = useMemo(
    () => sectores.filter((s) => s.cuartelId === cuartel?.id),
    [sectores, cuartel?.id],
  );
  const sectoresFiltrados = useMemo(() => {
    const q = busqueda.toLowerCase().trim();
    if (!q) return sectoresCuartel;
    return sectoresCuartel.filter((s) => {
      const resp = s.responsableId ? personaById.get(s.responsableId) : undefined;
      const respNombre = resp ? `${resp.nombre} ${resp.apellido}` : '';
      return (
        s.nombre.toLowerCase().includes(q) ||
        (s.descripcion ?? '').toLowerCase().includes(q) ||
        respNombre.toLowerCase().includes(q)
      );
    });
  }, [sectoresCuartel, busqueda, personaById]);

  const destacamentosCuartel = useMemo(
    () => destacamentos.filter((d) => d.cuartelId === cuartel?.id),
    [destacamentos, cuartel?.id],
  );

  if (!cuartel) {
    return (
      <div className="mx-auto max-w-5xl p-4">
        <div className="grid place-items-center gap-2 rounded-xl bg-white py-16 text-center">
          <Network size={36} className="text-slate-300" />
          <div className="text-sm text-slate-500">Sin cuartel activo</div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-5 pb-12">
      {/* Header */}
      <header className="flex items-center gap-3">
        <CuartelLogo cuartel={cuartel} size={48} className="rounded-2xl" />
        <div className="min-w-0 flex-1">
          <h1 className="text-xl font-bold text-slate-900">Organigrama</h1>
          <p className="text-xs text-slate-500">BV {cuartel.nombre} · estructura institucional</p>
        </div>
      </header>

      {/* ─── CONSEJO DIRECTIVO ─── */}
      <section className="space-y-3">
        <div className="flex items-center gap-2 px-1">
          <Building2 size={16} className="text-slate-500" />
          <h2 className="text-sm font-bold uppercase tracking-wide text-slate-700">
            Consejo Directivo
          </h2>
          <span className="text-xs text-slate-500">· administrativo</span>
        </div>

        {/* Presidente — autoridad máxima */}
        {presidente && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="from-brand-600 to-brand-700 flex items-center gap-3 rounded-2xl bg-gradient-to-br p-4 text-white shadow-md"
          >
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-white/15">
              <Crown size={24} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-white/70">
                Autoridad máxima
              </div>
              <div className="truncate text-lg font-bold">{presidente.nombre}</div>
              <div className="text-sm text-white/80">{CARGO_LABEL[presidente.cargo]}</div>
            </div>
            {presidente.telefono && (
              <a
                href={`tel:${soloDigitos(presidente.telefono)}`}
                className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/15 transition-colors hover:bg-white/25"
                aria-label={`Llamar a ${presidente.nombre}`}
              >
                <Phone size={18} />
              </a>
            )}
          </motion.div>
        )}

        {/* Resto del consejo */}
        <div className="grid gap-2 sm:grid-cols-2">
          {restoConsejo.map((m) => (
            <div
              key={m.id}
              className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3"
            >
              <Avatar name={m.nombre} size={36} />
              <div className="min-w-0 flex-1">
                <div className="truncate font-semibold text-slate-900">{m.nombre}</div>
                <div className="text-xs text-slate-500">{CARGO_LABEL[m.cargo]}</div>
              </div>
              {m.telefono && (
                <a
                  href={`tel:${soloDigitos(m.telefono)}`}
                  className="hover:bg-brand-50 hover:text-brand-700 grid h-9 w-9 shrink-0 place-items-center rounded-full text-slate-500 transition-colors"
                  aria-label={`Llamar a ${m.nombre}`}
                >
                  <Phone size={16} />
                </a>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ─── CUERPO ACTIVO — conducción ─── */}
      <section className="space-y-3">
        <div className="flex items-center gap-2 px-1">
          <Shield size={16} className="text-fire-600" />
          <h2 className="text-sm font-bold uppercase tracking-wide text-slate-700">
            Cuerpo Activo
          </h2>
          <span className="text-xs text-slate-500">· operativo</span>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          {[jefeCuerpo, segundoJefe].filter(Boolean).map((p) => (
            <div
              key={p!.id}
              className="border-fire-100 bg-fire-50/40 flex items-center gap-3 rounded-xl border p-3"
            >
              <Avatar name={`${p!.nombre} ${p!.apellido}`} src={p!.fotoUrl} size={40} />
              <div className="min-w-0 flex-1">
                <div className="truncate font-semibold text-slate-900">
                  {p!.nombre} {p!.apellido}
                </div>
                <div className="text-xs text-slate-500">
                  {CARGO_LABEL[p!.cargoInstitucional ?? 'ninguno']} · {fmtJerarquia(p!.jerarquia)}
                </div>
              </div>
              <a
                href={`tel:${soloDigitos(p!.telefono)}`}
                className="hover:bg-fire-100 text-fire-600 grid h-9 w-9 shrink-0 place-items-center rounded-full transition-colors"
                aria-label={`Llamar a ${p!.nombre}`}
              >
                <Phone size={16} />
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* ─── SECTORES / ÁREAS ─── */}
      <section className="space-y-3">
        <div className="flex flex-col gap-2 px-1 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Network size={16} className="text-slate-500" />
            <h2 className="text-sm font-bold uppercase tracking-wide text-slate-700">
              Áreas y responsables
            </h2>
          </div>
          <div className="relative sm:w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar área o responsable…"
              className="focus:border-brand-400 focus:ring-brand-100 w-full rounded-lg border border-slate-200 bg-white py-1.5 pl-9 pr-8 text-sm outline-none focus:ring-2"
            />
            {busqueda && (
              <button
                type="button"
                onClick={() => setBusqueda('')}
                className="absolute right-2 top-1/2 grid h-5 w-5 -translate-y-1/2 place-items-center rounded-full text-slate-500 hover:bg-slate-100"
              >
                <X size={12} />
              </button>
            )}
          </div>
        </div>

        <p className="px-1 text-xs text-slate-500">
          ¿Necesitás avisar algo (un baño roto, un móvil con falla)? Buscá el área y contactá al
          responsable.
        </p>

        <div className="grid gap-2 sm:grid-cols-2">
          {sectoresFiltrados.map((s) => {
            const resp = s.responsableId ? personaById.get(s.responsableId) : undefined;
            const IconC = (s.icono && SECTOR_ICON[s.icono]) || Network;
            return (
              <div
                key={s.id}
                className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-3"
              >
                <div className="bg-brand-50 text-brand-700 grid h-10 w-10 shrink-0 place-items-center rounded-xl">
                  <IconC size={18} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-slate-900">{s.nombre}</div>
                  {s.descripcion && (
                    <div className="mt-0.5 text-xs text-slate-500">{s.descripcion}</div>
                  )}
                  {resp ? (
                    <div className="mt-2 flex items-center gap-2 rounded-lg bg-slate-50 p-1.5">
                      <Avatar
                        name={`${resp.nombre} ${resp.apellido}`}
                        src={resp.fotoUrl}
                        size={28}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-xs font-medium text-slate-900">
                          {resp.nombre} {resp.apellido}
                        </div>
                        <div className="text-[10px] text-slate-500">Responsable</div>
                      </div>
                      <a
                        href={`tel:${soloDigitos(resp.telefono)}`}
                        className="hover:bg-brand-100 text-brand-600 grid h-8 w-8 shrink-0 place-items-center rounded-full transition-colors"
                        aria-label={`Llamar al responsable de ${s.nombre}`}
                      >
                        <Phone size={15} />
                      </a>
                    </div>
                  ) : (
                    <div className="mt-2 text-xs italic text-slate-500">
                      Sin responsable asignado
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          {sectoresFiltrados.length === 0 && (
            <div className="col-span-full grid place-items-center gap-1 rounded-xl bg-white py-8 text-center">
              <Search size={22} className="text-slate-300" />
              <div className="text-sm text-slate-500">Sin resultados</div>
            </div>
          )}
        </div>
      </section>

      {/* ─── DESTACAMENTOS ─── */}
      {destacamentosCuartel.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-2 px-1">
            <MapPin size={16} className="text-slate-500" />
            <h2 className="text-sm font-bold uppercase tracking-wide text-slate-700">
              Destacamentos
            </h2>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {destacamentosCuartel.map((d) => {
              const jefe = d.jefeId ? personaById.get(d.jefeId) : undefined;
              return (
                <div
                  key={d.id}
                  className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-3"
                >
                  <div
                    className={cn(
                      'grid h-10 w-10 shrink-0 place-items-center rounded-xl',
                      d.esCentral ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600',
                    )}
                  >
                    <Building2 size={18} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900">{d.nombre}</span>
                      {d.esCentral && <Badge intent="brand">Central</Badge>}
                    </div>
                    {d.direccion && (
                      <div className="mt-0.5 text-xs text-slate-500">{d.direccion}</div>
                    )}
                    {jefe && (
                      <div className="mt-1 text-xs text-slate-600">
                        Jefe:{' '}
                        <span className="font-medium">
                          {jefe.nombre} {jefe.apellido}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
