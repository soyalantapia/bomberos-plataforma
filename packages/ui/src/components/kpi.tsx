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
    <div className={cn('rounded-xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm', className)}>
      <div className="flex items-start justify-between gap-2">
        <div className="text-sm text-slate-600 font-medium">{label}</div>
        {icon && <div className={cn('h-9 w-9 rounded-lg flex items-center justify-center shrink-0', intentBg[intent])}>{icon}</div>}
      </div>
      <div className="mt-2 text-2xl sm:text-3xl font-bold text-slate-900 tabular-nums">{value}</div>
      {hint && <div className="mt-1 text-xs text-slate-500">{hint}</div>}
    </div>
  );
}
