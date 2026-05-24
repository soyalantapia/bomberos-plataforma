import { cn } from '../lib/cn';

export function Kpi({
  label,
  value,
  hint,
  icon,
  intent = 'neutral',
  className,
}: {
  label: string;
  value: React.ReactNode;
  hint?: string;
  icon?: React.ReactNode;
  intent?: 'ok' | 'warn' | 'risk' | 'neutral' | 'brand';
  className?: string;
}) {
  const intentBg: Record<string, string> = {
    ok: 'bg-status-ok-bg text-status-ok-fg',
    warn: 'bg-status-warn-bg text-status-warn-fg',
    risk: 'bg-status-risk-bg text-status-risk-fg',
    neutral: 'bg-slate-100 text-slate-700',
    brand: 'bg-brand-100 text-brand-700',
  };

  return (
    <div
      className={cn('rounded-xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4', className)}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="text-xs font-medium leading-tight text-slate-600 sm:text-sm">{label}</div>
        {icon && (
          <div
            className={cn(
              'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg sm:h-8 sm:w-8',
              intentBg[intent],
            )}
          >
            {icon}
          </div>
        )}
      </div>
      <div className="mt-1.5 text-xl font-bold tabular-nums leading-none text-slate-900 sm:text-2xl lg:text-3xl">
        {value}
      </div>
      {hint && (
        <div className="mt-1 text-[11px] leading-tight text-slate-500 sm:text-xs">{hint}</div>
      )}
    </div>
  );
}
