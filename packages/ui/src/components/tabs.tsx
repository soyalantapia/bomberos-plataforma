'use client';

import { createContext, useContext, useId } from 'react';

import { cn } from '../lib/cn';

interface TabsContext {
  value: string;
  onChange: (v: string) => void;
  baseId: string;
}
const Ctx = createContext<TabsContext | null>(null);

export function Tabs({
  value,
  onChange,
  children,
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  children: React.ReactNode;
  className?: string;
}) {
  const baseId = useId();
  return (
    <Ctx.Provider value={{ value, onChange, baseId }}>
      <div className={cn('w-full', className)}>{children}</div>
    </Ctx.Provider>
  );
}

export function TabsList({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      role="tablist"
      className={cn(
        'inline-flex items-center gap-1 rounded-lg bg-slate-100 p-1 overflow-x-auto max-w-full',
        className,
      )}
    >
      {children}
    </div>
  );
}

export function TabsTrigger({
  value: triggerValue,
  children,
  className,
}: {
  value: string;
  children: React.ReactNode;
  className?: string;
}) {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('TabsTrigger debe estar dentro de Tabs');
  const active = ctx.value === triggerValue;
  return (
    <button
      role="tab"
      type="button"
      aria-selected={active}
      onClick={() => ctx.onChange(triggerValue)}
      className={cn(
        'px-3 py-1.5 text-sm font-medium rounded-md transition-colors whitespace-nowrap',
        active ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900',
        className,
      )}
    >
      {children}
    </button>
  );
}

export function TabsContent({
  value: contentValue,
  children,
  className,
}: {
  value: string;
  children: React.ReactNode;
  className?: string;
}) {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('TabsContent debe estar dentro de Tabs');
  if (ctx.value !== contentValue) return null;
  return <div role="tabpanel" className={cn('mt-4', className)}>{children}</div>;
}
