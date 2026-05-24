import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '../lib/cn';

const badgeStyles = cva(
  'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium',
  {
    variants: {
      intent: {
        ok: 'bg-status-ok-bg text-status-ok-fg',
        warn: 'bg-status-warn-bg text-status-warn-fg',
        risk: 'bg-status-risk-bg text-status-risk-fg',
        neutral: 'bg-status-neutral-bg text-status-neutral-fg',
        brand: 'bg-brand-100 text-brand-700',
        fire: 'bg-fire-50 text-fire-700',
      },
    },
    defaultVariants: { intent: 'neutral' },
  },
);

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeStyles> {}

export function Badge({ className, intent, ...props }: BadgeProps) {
  return <span className={cn(badgeStyles({ intent }), className)} {...props} />;
}
