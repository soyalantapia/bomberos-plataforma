'use client';

import { Mail, MessageCircle, Phone } from 'lucide-react';
import { useState } from 'react';

import { Avatar, cn } from '@faro/ui';

import type { Cuartel, Persona } from '@faro/types';

const JERARQUIA_LABEL: Record<Persona['jerarquia'], string> = {
  cadete: 'Cadete',
  bombero: 'Bombero',
  bombero_1ra: 'Bombero 1ra',
  cabo: 'Cabo',
  sargento: 'Sargento',
  sargento_ayudante: 'Sargento Ayudante',
  oficial: 'Oficial',
  sub_comandante: 'Sub Comandante',
  comandante: 'Comandante',
  jefe: 'Jefe',
};

const ESPECIALIDAD_LABEL: Record<NonNullable<Persona['especialidades']>[number], string> = {
  hazmat: 'Hazmat',
  rescate_acuatico: 'Rescate Acuático',
  rescate_altura: 'Rescate Altura',
  rescate_vehicular: 'Rescate Vehicular',
  primeros_auxilios: '1ros Auxilios',
  conductor_maquinista: 'Conductor',
  desfibrilador: 'DEA',
  comunicaciones: 'Comunicaciones',
  forestal: 'Forestal',
  busqueda_rescate: 'Búsqueda y Rescate',
};

function soloDigitos(s: string): string {
  return s.replace(/[^\d]/g, '');
}

interface Props {
  persona: Persona;
  cuartel?: Cuartel;
  /** Si se pasa, el header (avatar+nombre) abre el legajo al hacer click. */
  onOpenLegajo?: (persona: Persona) => void;
}

/**
 * Card simplificada: avatar + nombre + un botón primario "Contactar"
 * que despliega las 3 opciones (llamar / WhatsApp / email).
 * Sin tags, sin chips, sin metadata visual de fondo.
 */
export function PersonaCardFed({ persona, cuartel, onOpenLegajo }: Props) {
  const [open, setOpen] = useState(false);
  const tel = soloDigitos(persona.telefono);
  const isMando = ['jefe', 'comandante', 'sub_comandante'].includes(persona.jerarquia);

  const HeaderContent = (
    <div className="flex items-center gap-3">
      <Avatar name={`${persona.nombre} ${persona.apellido}`} src={persona.fotoUrl} size={48} />
      <div className="min-w-0 flex-1 text-left">
        <div className="truncate text-base font-bold text-slate-900">
          {persona.apellido}, {persona.nombre}
        </div>
        <div
          className={cn(
            'mt-0.5 truncate text-xs font-medium',
            isMando ? 'text-fire-700' : 'text-slate-500',
          )}
        >
          {JERARQUIA_LABEL[persona.jerarquia]}
          {cuartel && <span className="text-slate-500"> · BV {cuartel.nombre}</span>}
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col rounded-2xl border border-slate-200 bg-white p-4 transition-shadow hover:shadow-md">
      {onOpenLegajo ? (
        <button
          type="button"
          onClick={() => onOpenLegajo(persona)}
          className="-m-1 rounded-xl p-1 text-left transition-colors hover:bg-slate-50/60"
          aria-label={`Ver legajo de ${persona.nombre} ${persona.apellido}`}
        >
          {HeaderContent}
        </button>
      ) : (
        HeaderContent
      )}

      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="bg-brand-600 hover:bg-brand-700 mt-3 w-full rounded-xl py-2.5 text-sm font-semibold text-white transition-colors"
        >
          Contactar
        </button>
      )}

      {open && (
        <div className="mt-3 grid grid-cols-3 gap-2">
          <a
            href={`tel:${tel}`}
            className="bg-status-ok hover:bg-status-ok-fg flex flex-col items-center justify-center gap-1 rounded-xl py-3 text-white transition-colors"
            title={`Llamar a ${persona.nombre}`}
          >
            <Phone size={18} />
            <span className="text-[11px] font-semibold">Llamar</span>
          </a>
          <a
            href={`https://wa.me/${tel}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center justify-center gap-1 rounded-xl bg-green-600 py-3 text-white transition-colors hover:bg-green-700"
            title="WhatsApp"
          >
            <MessageCircle size={18} />
            <span className="text-[11px] font-semibold">WhatsApp</span>
          </a>
          <a
            href={`mailto:${persona.email}`}
            className="bg-brand-600 hover:bg-brand-700 flex flex-col items-center justify-center gap-1 rounded-xl py-3 text-white transition-colors"
            title={`Email a ${persona.email}`}
          >
            <Mail size={18} />
            <span className="text-[11px] font-semibold">Email</span>
          </a>
        </div>
      )}
    </div>
  );
}

export { JERARQUIA_LABEL, ESPECIALIDAD_LABEL };
