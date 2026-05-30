'use client';

import { AlertTriangle, ChevronRight, Mail, Phone, ShieldCheck } from 'lucide-react';

import { Avatar, Badge, cn } from '@faro/ui';

import type { Persona } from '@faro/types';

import {
  clasificarCuerpo,
  cuerpoLabel,
  detectarAlertasPersona,
  disponibleAhora,
} from '../../lib/utils/cuerpo';

interface Props {
  persona: Persona;
  onClick?: () => void;
  compact?: boolean;
}

export function PersonaCard({ persona, onClick, compact = false }: Props) {
  const cuerpo = clasificarCuerpo(persona);
  const alertas = detectarAlertasPersona(persona);
  const critica = alertas.find((a) => a.severidad === 'risk');
  const advertencia = alertas.find((a) => a.severidad === 'warn');
  const disponible = disponibleAhora(persona);

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className={cn(
        'w-full overflow-hidden rounded-xl border border-slate-200 bg-white text-left transition-shadow',
        onClick && 'focus:ring-brand-300 hover:shadow-md focus:outline-none focus:ring-2',
      )}
    >
      <div className="flex items-center gap-3 p-3 sm:p-4">
        <div className="relative">
          <Avatar name={`${persona.nombre} ${persona.apellido}`} size={compact ? 40 : 48} />
          {disponible && (
            <span
              className="bg-status-ok absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full ring-2 ring-white"
              title="Disponible ahora"
            />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-2">
            <div className="truncate font-semibold text-slate-900">
              {persona.nombre} {persona.apellido}
            </div>
            <div className="shrink-0 font-mono text-xs text-slate-500">{persona.legajo}</div>
          </div>
          <div className="mt-0.5 truncate text-xs text-slate-600">{persona.funcion}</div>

          {!compact && (alertas.length > 0 || persona.estado !== 'activo') && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {critica && (
                <span className="bg-status-risk-bg text-status-risk-fg inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-medium">
                  <AlertTriangle size={10} /> {critica.texto}
                </span>
              )}
              {!critica && advertencia && (
                <span className="bg-status-warn-bg text-status-warn-fg inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-medium">
                  <AlertTriangle size={10} /> {advertencia.texto}
                </span>
              )}
              {disponible && !critica && !advertencia && (
                <span className="bg-status-ok-bg text-status-ok-fg inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-medium">
                  <ShieldCheck size={10} /> Disponible
                </span>
              )}
            </div>
          )}
        </div>

        <div className="hidden shrink-0 flex-col items-end gap-1.5 md:flex">
          <Badge
            intent={cuerpo === 'mando' ? 'warn' : cuerpo === 'cadete' ? 'ok' : 'neutral'}
            className="whitespace-nowrap capitalize"
          >
            {cuerpoLabel[cuerpo]}
          </Badge>
        </div>

        {onClick && <ChevronRight size={18} className="shrink-0 text-slate-500" />}
      </div>

      {!compact && (
        <div className="hidden items-center gap-4 border-t border-slate-100 bg-slate-50/50 px-4 py-2 text-xs text-slate-600 lg:flex">
          <span className="inline-flex min-w-0 items-center gap-1 truncate">
            <Mail size={12} className="shrink-0" />{' '}
            <span className="truncate">{persona.email}</span>
          </span>
          <span className="inline-flex shrink-0 items-center gap-1">
            <Phone size={12} /> {persona.telefono}
          </span>
          {persona.licenciaConducirCategorias && persona.licenciaConducirCategorias.length > 0 && (
            <span className="ml-auto inline-flex shrink-0 items-center gap-1 font-mono">
              Cat. {persona.licenciaConducirCategorias.join('·')}
            </span>
          )}
        </div>
      )}
    </button>
  );
}
