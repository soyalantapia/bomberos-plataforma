import { cn } from '../lib/cn';

type Status = 'ok' | 'warn' | 'risk' | 'neutral';

const dotColor: Record<Status, string> = {
  ok: 'bg-status-ok',
  warn: 'bg-status-warn',
  risk: 'bg-status-risk',
  neutral: 'bg-status-neutral',
};

const bgColor: Record<Status, string> = {
  ok: 'bg-status-ok-bg text-status-ok-fg',
  warn: 'bg-status-warn-bg text-status-warn-fg',
  risk: 'bg-status-risk-bg text-status-risk-fg',
  neutral: 'bg-status-neutral-bg text-status-neutral-fg',
};

export function StatusPill({
  status,
  label,
  className,
  size = 'md',
  withDot = true,
}: {
  status: Status;
  label: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  withDot?: boolean;
}) {
  return (
    <span
      className={cn(
        'inline-flex max-w-full items-center gap-1.5 truncate rounded-full font-medium tabular-nums',
        bgColor[status],
        size === 'sm' && 'px-2 py-0.5 text-xs',
        size === 'md' && 'px-3 py-1 text-sm',
        size === 'lg' && 'px-4 py-1.5 text-base',
        className,
      )}
    >
      {withDot && (
        <span className={cn('h-2 w-2 shrink-0 rounded-full', dotColor[status])} />
      )}
      <span className="truncate">{label}</span>
    </span>
  );
}
