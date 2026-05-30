'use client';

import { motion } from 'framer-motion';
import { FileText, Mail, MessageCircle, Phone } from 'lucide-react';
import { useState } from 'react';

import { Avatar, cn } from '@faro/ui';

import type { Cuartel, Persona } from '@faro/types';

import { JERARQUIA_LABEL } from './persona-card-fed';

function soloDigitos(s: string): string {
  return s.replace(/[^\d]/g, '');
}

interface Props {
  persona: Persona;
  cuartel?: Cuartel;
  /** Click en el botón "Ficha" abre el legajo modal. */
  onOpenFicha: (persona: Persona) => void;
}

/**
 * Card vertical (cuadrado): avatar grande arriba, nombre, cargo, 2 botones.
 * Contactar despliega inline llamar / wa / email.
 * Ficha abre el modal del legajo.
 */
export function PersonaCardVertical({ persona, cuartel, onOpenFicha }: Props) {
  const [contactarOpen, setContactarOpen] = useState(false);
  const tel = soloDigitos(persona.telefono);
  const isMando = ['jefe', 'comandante', 'sub_comandante'].includes(persona.jerarquia);

  return (
    <div className="flex flex-col rounded-2xl border border-slate-200 bg-white p-4 transition-shadow hover:shadow-md">
      {/* Avatar + identidad centrado */}
      <div className="flex flex-col items-center text-center">
        <Avatar name={`${persona.nombre} ${persona.apellido}`} src={persona.fotoUrl} size={72} />
        <div className="mt-3 w-full">
          <div className="truncate text-sm font-bold text-slate-900">
            {persona.apellido}, {persona.nombre}
          </div>
          <div
            className={cn(
              'mt-0.5 truncate text-xs font-medium',
              isMando ? 'text-fire-700' : 'text-slate-500',
            )}
          >
            {JERARQUIA_LABEL[persona.jerarquia]}
          </div>
          {cuartel && (
            <div className="mt-0.5 truncate text-[11px] text-slate-500">BV {cuartel.nombre}</div>
          )}
        </div>
      </div>

      {/* Botones */}
      <div className="mt-3 flex flex-col gap-1.5">
        {!contactarOpen ? (
          <button
            type="button"
            onClick={() => setContactarOpen(true)}
            className="bg-status-ok hover:bg-status-ok-fg flex w-full items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold text-white transition-colors"
          >
            <Phone size={12} />
            Contactar
          </button>
        ) : (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-3 gap-1">
              <a
                href={`tel:${tel}`}
                onClick={() => setContactarOpen(false)}
                className="bg-status-ok hover:bg-status-ok-fg grid place-items-center rounded-lg py-2 text-white transition-colors"
                title="Llamar"
              >
                <Phone size={14} />
              </a>
              <a
                href={`https://wa.me/${tel}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setContactarOpen(false)}
                className="grid place-items-center rounded-lg bg-green-600 py-2 text-white transition-colors hover:bg-green-700"
                title="WhatsApp"
              >
                <MessageCircle size={14} />
              </a>
              <a
                href={`mailto:${persona.email}`}
                onClick={() => setContactarOpen(false)}
                className="bg-brand-600 hover:bg-brand-700 grid place-items-center rounded-lg py-2 text-white transition-colors"
                title="Email"
              >
                <Mail size={14} />
              </a>
            </div>
            <button
              type="button"
              onClick={() => setContactarOpen(false)}
              className="mt-1 w-full text-center text-[11px] text-slate-500 hover:text-slate-700"
            >
              cancelar
            </button>
          </motion.div>
        )}
        <button
          type="button"
          onClick={() => onOpenFicha(persona)}
          className="bg-brand-600 hover:bg-brand-700 flex w-full items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold text-white transition-colors"
        >
          <FileText size={12} />
          Ficha
        </button>
      </div>
    </div>
  );
}
