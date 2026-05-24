'use client';

import { Search, X } from 'lucide-react';

import { Input, cn } from '@faro/ui';

export interface FilterChip<T extends string> {
  value: T;
  label: string;
  count?: number;
  intent?: 'brand' | 'ok' | 'warn' | 'risk' | 'neutral';
}

interface FiltersBarProps<T extends string> {
  search?: string;
  onSearch?: (v: string) => void;
  searchPlaceholder?: string;
  chips?: FilterChip<T>[];
  chipValue?: T;
  onChipChange?: (v: T) => void;
  rightSlot?: React.ReactNode;
  className?: string;
}

/**
 * Barra reusable con búsqueda + chips de filtro. Mobile-friendly: chips
 * en row scrollable horizontal en pantalla chica.
 */
export function FiltersBar<T extends string>({
  search,
  onSearch,
  searchPlaceholder = 'Buscar...',
  chips,
  chipValue,
  onChipChange,
  rightSlot,
  className,
}: FiltersBarProps<T>) {
  return (
    <div className={cn('space-y-3', className)}>
      {(onSearch || rightSlot) && (
        <div className="flex items-center gap-2">
          {onSearch && (
            <div className="relative flex-1">
              <Search
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <Input
                value={search ?? ''}
                onChange={(e) => onSearch(e.target.value)}
                placeholder={searchPlaceholder}
                className="pl-9 pr-9"
              />
              {search && search.length > 0 && (
                <button
                  type="button"
                  onClick={() => onSearch('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                  aria-label="Limpiar búsqueda"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          )}
          {rightSlot && <div className="shrink-0">{rightSlot}</div>}
        </div>
      )}

      {chips && chips.length > 0 && (
        <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1">
          {chips.map((c) => {
            const active = chipValue === c.value;
            const intentClass = active
              ? c.intent === 'risk'
                ? 'bg-status-risk text-white border-status-risk'
                : c.intent === 'warn'
                  ? 'bg-status-warn text-white border-status-warn'
                  : c.intent === 'ok'
                    ? 'bg-status-ok text-white border-status-ok'
                    : 'bg-brand-600 text-white border-brand-600'
              : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300';
            return (
              <button
                key={c.value}
                type="button"
                onClick={() => onChipChange?.(c.value)}
                className={cn(
                  'inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-3 py-1.5 text-sm font-medium transition-colors',
                  intentClass,
                )}
              >
                {c.label}
                {c.count !== undefined && (
                  <span
                    className={cn(
                      'rounded-full px-1.5 py-px text-xs tabular-nums',
                      active ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600',
                    )}
                  >
                    {c.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
