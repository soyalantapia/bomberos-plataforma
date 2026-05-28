'use client';

import { Copy, Mail, MessageCircle, Phone } from 'lucide-react';

import { cn, useToast } from '@faro/ui';

import type { CategoriaContacto, ContactoRed } from '@faro/types';

import { useFaroStore } from '../../store/use-faro-store';

const CAT_INFO: Record<CategoriaContacto, { label: string; icon: string; color: string }> = {
  gobierno: { label: 'Gobierno', icon: '🏛️', color: 'bg-indigo-50 text-indigo-700' },
  salud: { label: 'Salud', icon: '🏥', color: 'bg-pink-50 text-pink-700' },
  seguridad: { label: 'Seguridad', icon: '🚓', color: 'bg-blue-50 text-blue-700' },
  servicios: { label: 'Servicios', icon: '⚡', color: 'bg-amber-50 text-amber-700' },
  logistica: { label: 'Logística', icon: '📦', color: 'bg-orange-50 text-orange-700' },
  medios: { label: 'Medios', icon: '📰', color: 'bg-violet-50 text-violet-700' },
  otro: { label: 'Otro', icon: '📎', color: 'bg-slate-50 text-slate-700' },
};

function soloDigitos(s: string): string {
  return s.replace(/[^\d]/g, '');
}

interface Props {
  contacto: ContactoRed;
}

/**
 * Card compacta tipo address-book:
 * - Header (categoría + identidad)
 * - 1 acción primaria: botón Llamar gigante
 * - 2 íconos secundarios (WhatsApp · Email)
 * - Sin secciones expandibles, sin footer de trazabilidad
 *   (los detalles se muestran en hover/title attribute)
 */
export function ContactoCard({ contacto }: Props) {
  const toast = useToast();
  const registrarUso = useFaroStore((s) => s.registrarUsoContactoRed);

  const cat = CAT_INFO[contacto.categoria];
  const telPrincipal = contacto.telefonos[0] ?? '';
  const wapp = contacto.whatsapp ?? telPrincipal;

  function copiar() {
    navigator.clipboard.writeText(`${contacto.nombre} · ${contacto.cargo}\n${telPrincipal}`);
    toast.push({ kind: 'success', title: 'Copiado' });
  }

  return (
    <div
      className={cn(
        'flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 transition-shadow hover:shadow-md',
        !contacto.activo && 'opacity-50',
      )}
      title={contacto.notas || undefined}
    >
      {/* Identidad */}
      <div className="flex items-start gap-3">
        <div
          className={cn('grid h-11 w-11 shrink-0 place-items-center rounded-xl text-xl', cat.color)}
          title={cat.label}
        >
          {cat.icon}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-base font-bold text-slate-900">{contacto.nombre}</h3>
          <p className="truncate text-sm text-slate-600">{contacto.cargo}</p>
          {contacto.organismo && (
            <p className="truncate text-xs text-slate-400">{contacto.organismo}</p>
          )}
        </div>
      </div>

      {/* Acción primaria: Llamar */}
      <a
        href={`tel:${soloDigitos(telPrincipal)}`}
        onClick={() => registrarUso(contacto.id, 'llamada')}
        className="bg-status-ok hover:bg-status-ok-fg flex items-center justify-center gap-2 rounded-xl py-3 font-semibold text-white transition-colors active:scale-[0.98]"
      >
        <Phone size={18} />
        Llamar
      </a>

      {/* Acciones secundarias mini */}
      <div className="flex items-center gap-2">
        {wapp && (
          <a
            href={`https://wa.me/${soloDigitos(wapp)}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => registrarUso(contacto.id, 'whatsapp')}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-green-50 py-2 text-xs font-medium text-green-700 transition-colors hover:bg-green-100"
            title="WhatsApp"
          >
            <MessageCircle size={13} />
            WhatsApp
          </a>
        )}
        {contacto.email && (
          <a
            href={`mailto:${contacto.email}`}
            onClick={() => registrarUso(contacto.id, 'email')}
            className="bg-brand-50 text-brand-700 hover:bg-brand-100 flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-medium transition-colors"
            title="Email"
          >
            <Mail size={13} />
            Email
          </a>
        )}
        <button
          type="button"
          onClick={copiar}
          className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200"
          title="Copiar"
        >
          <Copy size={13} />
        </button>
      </div>
    </div>
  );
}

export { CAT_INFO };
