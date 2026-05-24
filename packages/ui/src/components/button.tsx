import { cva, type VariantProps } from 'class-variance-authority';
import { forwardRef } from 'react';

import { cn } from '../lib/cn';

const buttonStyles = cva(
  'inline-flex items-center justify-center gap-2 font-semibold transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2',
  {
    variants: {
      intent: {
        primary:
          'bg-brand-600 text-white hover:bg-brand-700 focus-visible:outline-brand-600 shadow-sm',
        secondary:
          'bg-white text-slate-900 border border-slate-200 hover:bg-slate-50 focus-visible:outline-slate-400',
        ghost: 'bg-transparent text-slate-700 hover:bg-slate-100 focus-visible:outline-slate-400',
        danger:
          'bg-fire-600 text-white hover:bg-fire-700 focus-visible:outline-fire-600 shadow-sm',
        success:
          'bg-status-ok text-white hover:opacity-90 focus-visible:outline-status-ok shadow-sm',
      },
      size: {
        sm: 'h-9 px-3 text-sm rounded-md',
        md: 'h-11 px-4 text-base rounded-lg',
        lg: 'h-14 px-6 text-lg rounded-glove',
        xl: 'h-16 px-8 text-xl rounded-glove',
        icon: 'h-11 w-11 rounded-lg',
      },
      fullWidth: {
        true: 'w-full',
        false: '',
      },
    },
    defaultVariants: {
      intent: 'primary',
      size: 'md',
      fullWidth: false,
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonStyles> {}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, intent, size, fullWidth, type = 'button', ...props }, ref) => {
    return (
      <button
        ref={ref}
        type={type}
        className={cn(buttonStyles({ intent, size, fullWidth }), className)}
        {...props}
      />
    );
  },
);
Button.displayName = 'Button';
