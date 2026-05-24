'use client';

import { cn } from '@faro/ui';

import type { EstadoSemaforo, Rendicion } from '@faro/types';

const labels: Record<EstadoSemaforo, string> = {
  ok: 'En regla',
  warn: 'Atención',
  risk: 'En riesgo',
  neutral: '—',
};

export function SemaforoRendicion({ rendicion }: { rendicion: Rendicion | undefined }) {
  if (!rendicion) return null;
  const p = rendicion.porcentaje;
  const estado: EstadoSemaforo = p >= 95 ? 'ok' : p >= 70 ? 'warn' : 'risk';

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width="120" height="120" viewBox="0 0 120 120" className="-rotate-90">
        <circle cx="60" cy="60" r="48" stroke="currentColor" strokeWidth="12" fill="none" className="text-slate-200" />
        <circle cx="60" cy="60" r="48" stroke="currentColor" strokeWidth="12" fill="none" strokeLinecap="round"
          className={cn('transition-all duration-700', estado === 'ok' && 'text-status-ok', estado === 'warn' && 'text-status-warn', estado === 'risk' && 'text-status-risk')}
          strokeDasharray={`${(p / 100) * Math.PI * 96} ${Math.PI * 96}`}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-3xl font-bold text-slate-900 tabular-nums">{p}%</div>
        <div className={cn('text-xs font-semibold uppercase tracking-wide mt-0.5',
          estado === 'ok' && 'text-status-ok', estado === 'warn' && 'text-status-warn-fg', estado === 'risk' && 'text-status-risk')}>
          {labels[estado]}
        </div>
      </div>
    </div>
  );
}
