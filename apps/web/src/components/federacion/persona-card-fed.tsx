'use client';

import { Mail, MessageCircle, Phone } from 'lucide-react';

import { Avatar, Badge, cn } from '@faro/ui';

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

function telToWhatsApp(tel: string): string {
  return tel.replace(/[^\d]/g, '');
}

interface Props {
  persona: Persona;
  cuartel?: Cuartel;
  region?: string;
  compact?: boolean;
}

export function PersonaCardFed({ persona, cuartel, region, compact }: Props) {
  const wapp = telToWhatsApp(persona.telefono);
  const isMando = ['jefe', 'comandante', 'sub_comandante'].includes(persona.jerarquia);

  return (
    <div
      className={cn(
        'flex flex-col rounded-xl border border-slate-200 bg-white p-3 transition-shadow hover:shadow-md',
        compact && 'p-2.5',
      )}
    >
      <div className="flex items-start gap-3">
        <Avatar
          name={`${persona.nombre} ${persona.apellido}`}
          src={persona.fotoUrl}
          size={compact ? 36 : 44}
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-2">
            <div className="truncate font-semibold text-slate-900">
              {persona.apellido}, {persona.nombre}
            </div>
            <span className="shrink-0 font-mono text-[11px] text-slate-400">{persona.legajo}</span>
          </div>
          <div className="mt-0.5 truncate text-xs text-slate-600">
            {JERARQUIA_LABEL[persona.jerarquia]} · {persona.funcion}
          </div>
          {(cuartel || region) && (
            <div className="mt-0.5 truncate text-[11px] text-slate-500">
              {cuartel?.nombre}
              {cuartel && region && ' · '}
              {region}
            </div>
          )}
        </div>
        <Badge
          intent={persona.cuerpo === 'administrativo' ? 'brand' : isMando ? 'warn' : 'neutral'}
        >
          {persona.cuerpo === 'administrativo' ? 'Admin' : isMando ? 'Mando' : 'Activo'}
        </Badge>
      </div>

      {!compact && persona.especialidades && persona.especialidades.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {persona.especialidades.map((e) => (
            <span
              key={e}
              className="bg-fire-50 text-fire-700 inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-medium"
            >
              {ESPECIALIDAD_LABEL[e]}
            </span>
          ))}
        </div>
      )}

      <div className="mt-3 flex items-center gap-1 border-t border-slate-100 pt-2">
        <a
          href={`tel:${telToWhatsApp(persona.telefono)}`}
          className="hover:bg-status-ok-bg hover:text-status-ok-fg flex flex-1 items-center justify-center gap-1 rounded-md py-1.5 text-xs text-slate-700 transition-colors"
          title="Llamar"
        >
          <Phone size={13} />
          <span className="hidden sm:inline">Llamar</span>
        </a>
        <a
          href={`https://wa.me/${wapp}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-1 items-center justify-center gap-1 rounded-md py-1.5 text-xs text-slate-700 transition-colors hover:bg-green-50 hover:text-green-700"
          title="WhatsApp"
        >
          <MessageCircle size={13} />
          <span className="hidden sm:inline">WhatsApp</span>
        </a>
        <a
          href={`mailto:${persona.email}`}
          className="hover:bg-brand-50 hover:text-brand-700 flex flex-1 items-center justify-center gap-1 rounded-md py-1.5 text-xs text-slate-700 transition-colors"
          title="Email"
        >
          <Mail size={13} />
          <span className="hidden sm:inline">Email</span>
        </a>
      </div>
    </div>
  );
}

export { JERARQUIA_LABEL, ESPECIALIDAD_LABEL };
