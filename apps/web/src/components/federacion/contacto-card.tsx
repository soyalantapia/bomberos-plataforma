'use client';

import { Building2, ChevronRight, Copy, Mail, MapPin, MessageCircle, Phone } from 'lucide-react';
import { useState } from 'react';

import { Badge, cn, useToast } from '@faro/ui';

import type { CategoriaContacto, ContactoRed } from '@faro/types';

import { useFaroStore } from '../../store/use-faro-store';

const CAT_INFO: Record<CategoriaContacto, { label: string; icon: string; color: string }> = {
  gobierno: {
    label: 'Gobierno',
    icon: '🏛️',
    color: 'bg-indigo-50 text-indigo-700 ring-indigo-100',
  },
  salud: { label: 'Salud', icon: '🏥', color: 'bg-pink-50 text-pink-700 ring-pink-100' },
  seguridad: { label: 'Seguridad', icon: '🚓', color: 'bg-blue-50 text-blue-700 ring-blue-100' },
  servicios: { label: 'Servicios', icon: '⚡', color: 'bg-amber-50 text-amber-700 ring-amber-100' },
  logistica: {
    label: 'Logística',
    icon: '📦',
    color: 'bg-orange-50 text-orange-700 ring-orange-100',
  },
  medios: { label: 'Medios', icon: '📰', color: 'bg-violet-50 text-violet-700 ring-violet-100' },
  otro: { label: 'Otro', icon: '📎', color: 'bg-slate-50 text-slate-700 ring-slate-100' },
};

function diasDesde(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const d = Math.floor(ms / 86400000);
  if (d === 0) return 'hoy';
  if (d === 1) return 'hace 1 día';
  if (d < 30) return `hace ${d} días`;
  const m = Math.floor(d / 30);
  return `hace ${m} ${m === 1 ? 'mes' : 'meses'}`;
}

function soloDigitos(s: string): string {
  return s.replace(/[^\d]/g, '');
}

interface Props {
  contacto: ContactoRed;
}

export function ContactoCard({ contacto }: Props) {
  const toast = useToast();
  const personas = useFaroStore((s) => s.personas);
  const personasFed = useFaroStore((s) => s.personasFederacion);
  const registrarUso = useFaroStore((s) => s.registrarUsoContactoRed);

  const cat = CAT_INFO[contacto.categoria];
  const telPrincipal = contacto.telefonos[0] ?? '';
  const wapp = contacto.whatsapp ?? telPrincipal;

  const todasPersonas = [...personas, ...personasFed];
  const agregador = todasPersonas.find((p) => p.id === contacto.agregadoPor);
  const ultimoUsoPersona = contacto.ultimoUso
    ? todasPersonas.find((p) => p.id === contacto.ultimoUso!.personaId)
    : null;

  const [expand, setExpand] = useState(false);

  function copiar() {
    navigator.clipboard.writeText(`${contacto.nombre} · ${contacto.cargo}\n${telPrincipal}`);
    toast.push({ kind: 'success', title: 'Copiado al portapapeles' });
  }

  return (
    <div
      className={cn(
        'flex flex-col rounded-xl border border-slate-200 bg-white transition-shadow hover:shadow-md',
        !contacto.activo && 'opacity-50',
      )}
    >
      {/* Header */}
      <div className="flex items-start gap-3 p-4">
        <div
          className={cn(
            'grid h-11 w-11 shrink-0 place-items-center rounded-xl text-lg ring-2 ring-inset',
            cat.color,
          )}
          title={cat.label}
        >
          <span>{cat.icon}</span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="truncate font-bold text-slate-900">{contacto.nombre}</h3>
              <p className="mt-0.5 truncate text-sm text-slate-600">{contacto.cargo}</p>
              {contacto.organismo && (
                <p className="mt-0.5 inline-flex items-center gap-1 text-xs text-slate-500">
                  <Building2 size={11} /> {contacto.organismo}
                </p>
              )}
            </div>
            <Badge intent="neutral" className="shrink-0 capitalize">
              {cat.label}
            </Badge>
          </div>

          {contacto.tags && contacto.tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {contacto.tags.slice(0, 3).map((t) => (
                <span
                  key={t}
                  className="bg-brand-50 text-brand-700 inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-medium"
                >
                  {t}
                </span>
              ))}
              {contacto.tags.length > 3 && (
                <span className="text-[10px] text-slate-500">+{contacto.tags.length - 3}</span>
              )}
            </div>
          )}

          {contacto.notas && expand && (
            <p className="mt-2 rounded-md bg-slate-50 px-2.5 py-1.5 text-xs leading-relaxed text-slate-700">
              {contacto.notas}
            </p>
          )}

          {contacto.direccion && expand && (
            <p className="mt-1 inline-flex items-center gap-1 text-[11px] text-slate-500">
              <MapPin size={11} /> {contacto.direccion}
            </p>
          )}

          {(contacto.notas || contacto.direccion) && (
            <button
              type="button"
              onClick={() => setExpand((e) => !e)}
              className="text-brand-600 hover:text-brand-700 mt-1.5 text-[11px] font-medium"
            >
              {expand ? 'Ocultar detalles' : 'Ver más'}
            </button>
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div className="flex items-center gap-1 border-t border-slate-100 px-2 py-1.5">
        <a
          href={`tel:${soloDigitos(telPrincipal)}`}
          onClick={() => registrarUso(contacto.id, 'llamada')}
          className="hover:bg-status-ok-bg/30 hover:text-status-ok-fg flex flex-1 items-center justify-center gap-1.5 rounded-md py-1.5 text-xs font-medium text-slate-700 transition-colors"
        >
          <Phone size={13} />
          Llamar
        </a>
        {wapp && (
          <a
            href={`https://wa.me/${soloDigitos(wapp)}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => registrarUso(contacto.id, 'whatsapp')}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-md py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-green-50 hover:text-green-700"
          >
            <MessageCircle size={13} />
            WhatsApp
          </a>
        )}
        {contacto.email && (
          <a
            href={`mailto:${contacto.email}`}
            onClick={() => registrarUso(contacto.id, 'email')}
            className="hover:bg-brand-50 hover:text-brand-700 flex flex-1 items-center justify-center gap-1.5 rounded-md py-1.5 text-xs font-medium text-slate-700 transition-colors"
          >
            <Mail size={13} />
            <span className="hidden sm:inline">Email</span>
          </a>
        )}
        <button
          type="button"
          onClick={copiar}
          className="grid h-7 w-7 place-items-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-700"
          title="Copiar"
        >
          <Copy size={13} />
        </button>
      </div>

      {/* Footer: trazabilidad */}
      <div className="border-t border-slate-100 bg-slate-50/50 px-4 py-2 text-[11px] text-slate-500">
        <div className="flex items-center gap-2">
          <span>
            Agregado por{' '}
            <span className="font-medium text-slate-700">
              {agregador ? `${agregador.apellido}, ${agregador.nombre[0]}.` : '—'}
            </span>{' '}
            · {diasDesde(contacto.agregadoEn)}
          </span>
          {contacto.usosTotal > 0 && (
            <span className="ml-auto inline-flex items-center gap-1">
              <ChevronRight size={11} />
              {contacto.usosTotal} {contacto.usosTotal === 1 ? 'uso' : 'usos'}
            </span>
          )}
        </div>
        {contacto.ultimoUso && ultimoUsoPersona && (
          <div className="mt-0.5 text-[10px]">
            Último uso: {diasDesde(contacto.ultimoUso.fecha)} · {ultimoUsoPersona.apellido}
          </div>
        )}
      </div>
    </div>
  );
}

export { CAT_INFO };
