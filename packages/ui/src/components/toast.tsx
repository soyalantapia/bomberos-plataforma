'use client';

import { CheckCircle2, Info, AlertTriangle, XCircle } from 'lucide-react';
import { createContext, useCallback, useContext, useState } from 'react';

import { cn } from '../lib/cn';

type ToastKind = 'success' | 'info' | 'warn' | 'error';
interface Toast {
  id: number;
  kind: ToastKind;
  title: string;
  description?: string;
}

interface ToastCtx {
  push: (t: Omit<Toast, 'id'>) => void;
}
const Ctx = createContext<ToastCtx | null>(null);

const icon: Record<ToastKind, React.ReactNode> = {
  success: <CheckCircle2 className="text-status-ok" size={20} />,
  info: <Info className="text-brand-600" size={20} />,
  warn: <AlertTriangle className="text-status-warn" size={20} />,
  error: <XCircle className="text-fire-600" size={20} />,
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const push = useCallback((t: Omit<Toast, 'id'>) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { ...t, id }]);
    setTimeout(() => setToasts((prev) => prev.filter((x) => x.id !== id)), 4500);
  }, []);

  return (
    <Ctx.Provider value={{ push }}>
      {children}
      <div aria-live="polite" className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 w-full max-w-sm px-4">
        {toasts.map((t) => (
          <div key={t.id} className={cn('flex gap-3 items-start bg-white rounded-xl border border-slate-200 shadow-lg p-3')}>
            <div className="mt-0.5">{icon[t.kind]}</div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-slate-900">{t.title}</div>
              {t.description && <div className="text-sm text-slate-600 mt-0.5">{t.description}</div>}
            </div>
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}

export function useToast(): ToastCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useToast: envolvé tu app con <ToastProvider />');
  return ctx;
}
