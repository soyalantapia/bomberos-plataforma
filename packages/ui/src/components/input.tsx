import { forwardRef } from 'react';

import { cn } from '../lib/cn';

export const Input = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type = 'text', ...props }, ref) => (
    <input
      ref={ref}
      type={type}
      className={cn(
        'h-12 w-full rounded-lg border border-slate-300 bg-white px-4 text-base text-slate-900 transition-colors placeholder:text-slate-500',
        'focus:border-brand-600 focus:ring-brand-600/20 hover:border-slate-400 focus:outline-none focus:ring-2',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = 'Input';

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      'min-h-[100px] w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-base text-slate-900 transition-colors placeholder:text-slate-500',
      'focus:border-brand-600 focus:ring-brand-600/20 hover:border-slate-400 focus:outline-none focus:ring-2',
      'disabled:cursor-not-allowed disabled:opacity-50',
      className,
    )}
    {...props}
  />
));
Textarea.displayName = 'Textarea';
