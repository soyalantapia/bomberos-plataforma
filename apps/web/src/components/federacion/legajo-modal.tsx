'use client';

import { motion } from 'framer-motion';
import {
  Briefcase,
  Building,
  CalendarDays,
  Droplet,
  GraduationCap,
  Heart,
  Home,
  IdCard,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Ruler,
  Shield,
  User,
  Weight,
  X,
} from 'lucide-react';
import { useState } from 'react';

import { Avatar, Badge, cn } from '@faro/ui';

import type { Cuartel, Persona } from '@faro/types';

import { JERARQUIA_LABEL } from './persona-card-fed';

type Tab = 'generales' | 'personal' | 'medico' | 'institucional';

interface Props {
  persona: Persona | null;
  cuartel?: Cuartel | null;
  onClose: () => void;
}

function soloDigitos(s: string): string {
  return s.replace(/[^\d]/g, '');
}

function fmtFecha(s?: string): string {
  if (!s || s === '0000-00-00') return '—';
  const [y, m, d] = s.slice(0, 10).split('-');
  if (!y || !m || !d) return s;
  return `${d}/${m}/${y}`;
}

function Field({
  label,
  value,
  icon,
  mono,
}: {
  label: string;
  value?: string | number | null;
  icon?: React.ReactNode;
  mono?: boolean;
}) {
  const display = value === undefined || value === null || value === '' ? '—' : String(value);
  return (
    <div className="border-b border-slate-100 py-2 last:border-b-0">
      <div className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
        {icon}
        <span>{label}</span>
      </div>
      <div className={cn('mt-0.5 text-sm text-slate-900', mono && 'font-mono')}>{display}</div>
    </div>
  );
}

/**
 * Versión modal centrada del legajo (en vez de drawer lateral).
 * Mantiene el mismo contenido y diseño del header rojo institucional.
 */
export function LegajoModal({ persona, cuartel, onClose }: Props) {
  const [tab, setTab] = useState<Tab>('generales');

  if (!persona) return null;
  const ex = persona.legajoExtra;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4"
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        aria-hidden="true"
      />

      {/* Modal — bottom-sheet en mobile, modal centrado en desktop */}
      <motion.div
        initial={{ opacity: 0, y: 48, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 380, damping: 34 }}
        className="relative flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-3xl bg-slate-50 shadow-2xl sm:max-h-[90vh] sm:max-w-4xl sm:rounded-3xl"
      >
        {/* Header rojo */}
        <header className="bg-fire-700 shrink-0 px-5 pb-4 pt-3 text-white sm:px-6 sm:pt-4">
          {/* Grab handle (solo mobile) */}
          <div
            className="mx-auto mb-3 h-1 w-10 rounded-full bg-white/35 sm:hidden"
            aria-hidden="true"
          />
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 flex-1 items-start gap-3">
              <Avatar
                name={`${persona.nombre} ${persona.apellido}`}
                src={persona.fotoUrl}
                size={56}
              />
              <div className="min-w-0 flex-1">
                <div className="text-xs uppercase tracking-widest text-white/70">
                  Legajo personal · {persona.legajo}
                </div>
                <h2 className="mt-0.5 truncate text-xl font-bold">
                  {persona.apellido}, {persona.nombre}
                </h2>
                <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-white/90">
                  <span className="inline-flex items-center gap-1 rounded-md bg-white/15 px-1.5 py-0.5">
                    <Shield size={11} />
                    {ex?.jerarquiaReal ?? JERARQUIA_LABEL[persona.jerarquia]}
                  </span>
                  {cuartel && (
                    <span className="inline-flex items-center gap-1 rounded-md bg-white/15 px-1.5 py-0.5">
                      <Building size={11} /> BV {cuartel.nombre}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1 rounded-md bg-white/15 px-1.5 py-0.5">
                    {persona.base}
                  </span>
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar legajo"
              className="grid h-10 w-10 shrink-0 place-items-center rounded-full hover:bg-white/10"
            >
              <X size={20} />
            </button>
          </div>

          {/* Quick actions */}
          <div className="mt-4 flex flex-wrap gap-2">
            <a
              href={`tel:${soloDigitos(persona.telefono)}`}
              className="bg-status-ok hover:bg-status-ok-fg inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-semibold text-white transition-colors"
            >
              <Phone size={14} />
              Llamar
            </a>
            <a
              href={`https://wa.me/${soloDigitos(persona.telefono)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-green-500 py-2 text-sm font-semibold text-white transition-colors hover:bg-green-600"
            >
              <MessageCircle size={14} />
              WhatsApp
            </a>
            <a
              href={`mailto:${persona.email}`}
              className="bg-brand-600 hover:bg-brand-700 inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-semibold text-white transition-colors"
            >
              <Mail size={14} />
              Email
            </a>
          </div>
        </header>

        {/* Tabs */}
        <div className="shrink-0 border-b border-slate-200 bg-white px-2">
          <div className="flex gap-1 overflow-x-auto">
            {(
              [
                ['generales', 'Generales', <User key="g" size={14} />],
                ['personal', 'Personal', <Home key="p" size={14} />],
                ['medico', 'Médico', <Heart key="m" size={14} />],
                ['institucional', 'Institucional', <Briefcase key="i" size={14} />],
              ] as const
            ).map(([id, label, icon]) => (
              <button
                key={id}
                type="button"
                onClick={() => setTab(id)}
                className={cn(
                  'relative inline-flex items-center gap-1.5 whitespace-nowrap px-4 py-3 text-sm font-medium transition-colors',
                  tab === id ? 'text-brand-700' : 'text-slate-500 hover:text-slate-800',
                )}
              >
                {icon}
                {label}
                {tab === id && (
                  <motion.span
                    layoutId="legajo-modal-tab"
                    className="bg-brand-600 absolute -bottom-px left-0 right-0 h-0.5 rounded-full"
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))]">
          {tab === 'generales' && (
            <div className="grid gap-x-6 sm:grid-cols-2">
              <Field label="N° Legajo" value={persona.legajo} icon={<IdCard size={11} />} mono />
              <Field label="DNI" value={ex?.dni} icon={<IdCard size={11} />} mono />
              <Field label="Apellido" value={persona.apellido} />
              <Field label="Nombre" value={persona.nombre} />
              <Field label="Sexo" value={ex?.sexo} />
              <Field
                label="Fecha nacimiento"
                value={fmtFecha(persona.fechaNacimiento)}
                icon={<CalendarDays size={11} />}
              />
              <Field label="Estado de revista" value={ex?.escalafon} />
              <Field label="Estado civil" value={ex?.estadoCivil} />
              <Field label="Cargo institución" value={ex?.cargoInstitucion} />
              <Field
                label="Jerarquía"
                value={ex?.jerarquiaReal ?? JERARQUIA_LABEL[persona.jerarquia]}
              />
              <Field label="Función" value={persona.funcion} />
              <Field label="Base" value={persona.base} icon={<Building size={11} />} />
              <Field
                label="Estado"
                value={persona.estado === 'activo' ? 'Activo' : persona.estado}
              />
              <Field label="Cargo federativo" value={ex?.cargoFederativo} />
            </div>
          )}

          {tab === 'personal' && (
            <div className="space-y-5">
              <section>
                <h3 className="mb-2 inline-flex items-center gap-1.5 text-sm font-bold text-slate-700">
                  <Home size={14} /> Domicilio
                </h3>
                <div className="grid gap-x-6 sm:grid-cols-2">
                  <Field label="Calle y altura" value={ex?.domicilio} icon={<MapPin size={11} />} />
                  <Field label="Código postal" value={ex?.codigoPostal} mono />
                  <Field label="Localidad" value={ex?.localidad} />
                  <Field label="Partido" value={ex?.partido} />
                  <Field label="Provincia" value={ex?.provincia} />
                  <Field label="País" value={ex?.pais} />
                </div>
              </section>
              <section>
                <h3 className="mb-2 inline-flex items-center gap-1.5 text-sm font-bold text-slate-700">
                  <Phone size={14} /> Contacto
                </h3>
                <div className="grid gap-x-6 sm:grid-cols-2">
                  <Field
                    label="Teléfono"
                    value={persona.telefono}
                    icon={<Phone size={11} />}
                    mono
                  />
                  <Field label="Celular" value={ex?.celular} icon={<Phone size={11} />} mono />
                  <Field label="Cía. celular" value={ex?.ciaCelular} />
                  <Field label="Email personal" value={persona.email} icon={<Mail size={11} />} />
                  <Field
                    label="Email federativo"
                    value={ex?.emailFederativo}
                    icon={<Mail size={11} />}
                  />
                </div>
              </section>
              <section>
                <h3 className="mb-2 inline-flex items-center gap-1.5 text-sm font-bold text-slate-700">
                  <CalendarDays size={14} /> Nacimiento
                </h3>
                <div className="grid gap-x-6 sm:grid-cols-2">
                  <Field label="Fecha" value={fmtFecha(persona.fechaNacimiento)} />
                  <Field label="Lugar" value={ex?.lugarNacimiento} />
                  <Field label="Provincia" value={ex?.provinciaNacimiento} />
                </div>
              </section>
            </div>
          )}

          {tab === 'medico' && (
            <div className="space-y-5">
              <section>
                <h3 className="mb-2 inline-flex items-center gap-1.5 text-sm font-bold text-slate-700">
                  <Heart size={14} /> Aptitud y salud
                </h3>
                <div className="grid gap-x-6 sm:grid-cols-2">
                  <Field
                    label="Grupo sanguíneo"
                    value={persona.salud.grupoSanguineo}
                    icon={<Droplet size={11} />}
                    mono
                  />
                  <Field label="Donante" value={ex?.donante} />
                  <Field
                    label="Aptitud vence"
                    value={fmtFecha(persona.salud.aptitudVencimiento)}
                    icon={<CalendarDays size={11} />}
                  />
                  <Field label="Alerta" value={persona.salud.alerta ?? '—'} />
                </div>
              </section>
              <section>
                <h3 className="mb-2 inline-flex items-center gap-1.5 text-sm font-bold text-slate-700">
                  <Ruler size={14} /> Físico
                </h3>
                <div className="grid gap-x-6 sm:grid-cols-2">
                  <Field label="Altura (m)" value={ex?.altura} icon={<Ruler size={11} />} mono />
                  <Field label="Peso (kg)" value={ex?.peso} icon={<Weight size={11} />} mono />
                </div>
              </section>
              <section>
                <h3 className="mb-2 inline-flex items-center gap-1.5 text-sm font-bold text-slate-700">
                  <Shield size={14} /> Cobertura
                </h3>
                <div className="grid gap-x-6 sm:grid-cols-2">
                  <Field label="N° IOMA" value={ex?.ioma} mono />
                </div>
              </section>
              {ex?.observaciones && (
                <section>
                  <h3 className="mb-2 inline-flex items-center gap-1.5 text-sm font-bold text-slate-700">
                    Observaciones
                  </h3>
                  <p className="rounded-lg bg-white p-3 text-sm text-slate-700">
                    {ex.observaciones}
                  </p>
                </section>
              )}
            </div>
          )}

          {tab === 'institucional' && (
            <div className="space-y-5">
              <section>
                <h3 className="mb-2 inline-flex items-center gap-1.5 text-sm font-bold text-slate-700">
                  <Shield size={14} /> Carrera bomberil
                </h3>
                <div className="grid gap-x-6 sm:grid-cols-2">
                  <Field
                    label="Fecha de alta"
                    value={fmtFecha(ex?.fechaAlta ?? persona.fechaIngreso)}
                  />
                  <Field label="Fecha de jerarquía" value={fmtFecha(ex?.fechaJerarquia)} />
                  <Field
                    label="Jerarquía actual"
                    value={ex?.jerarquiaReal ?? JERARQUIA_LABEL[persona.jerarquia]}
                  />
                  <Field label="Escalafón" value={ex?.escalafon} />
                  <Field label="Cargo institucional" value={ex?.cargoInstitucion} />
                  <Field label="Cargo federativo" value={ex?.cargoFederativo} />
                </div>
              </section>
              <section>
                <h3 className="mb-2 inline-flex items-center gap-1.5 text-sm font-bold text-slate-700">
                  <IdCard size={14} /> Registro institucional
                </h3>
                <div className="grid gap-x-6 sm:grid-cols-2">
                  <Field label="N° Acta" value={ex?.acta} mono />
                  <Field label="N° Libro" value={ex?.libro} mono />
                  <Field label="N° Folio" value={ex?.folio} mono />
                  <Field label="Orden interno" value={ex?.ordenInterno} mono />
                </div>
              </section>
              <section>
                <h3 className="mb-2 inline-flex items-center gap-1.5 text-sm font-bold text-slate-700">
                  <Building size={14} /> Asignación
                </h3>
                <div className="grid gap-x-6 sm:grid-cols-2">
                  <Field label="Cuartel" value={cuartel ? `BV ${cuartel.nombre}` : '—'} />
                  <Field label="Región" value={ex?.region} />
                  <Field label="Base" value={persona.base} />
                  <Field label="Escuela" value={ex?.escuela} />
                </div>
              </section>
              {persona.especialidades && persona.especialidades.length > 0 && (
                <section>
                  <h3 className="mb-2 inline-flex items-center gap-1.5 text-sm font-bold text-slate-700">
                    <GraduationCap size={14} /> Especialidades
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {persona.especialidades.map((e) => (
                      <Badge key={e} intent="warn">
                        {e.replace(/_/g, ' ')}
                      </Badge>
                    ))}
                  </div>
                </section>
              )}
              <section>
                <h3 className="mb-2 inline-flex items-center gap-1.5 text-sm font-bold text-slate-700">
                  Cómputos
                </h3>
                <div className="grid gap-x-6 sm:grid-cols-2">
                  <Field label="Califica" value={ex?.calificaComputos} />
                  <Field label="Informa" value={ex?.informaComputos} />
                </div>
              </section>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
