'use client';

import { CheckCircle2, Info, AlertTriangle, XCircle, X } from 'lucide-react';
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

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((x) => x.id !== id));
  }, []);

  const push = useCallback((t: Omit<Toast, 'id'>) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { ...t, id }]);
    setTimeout(() => setToasts((prev) => prev.filter((x) => x.id !== id)), 6000);
  }, []);

  return (
    <Ctx.Provider value={{ push }}>
      {children}
      <div
        aria-live="polite"
        className="fixed bottom-20 left-1/2 z-50 flex w-full max-w-sm -translate-x-1/2 flex-col gap-2 px-4 md:bottom-4"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              'flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-lg',
            )}
          >
            <div className="mt-0.5">{icon[t.kind]}</div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold text-slate-900">{t.title}</div>
              {t.description && (
                <div className="mt-0.5 text-sm text-slate-600">{t.description}</div>
              )}
            </div>
            <button
              type="button"
              onClick={() => dismiss(t.id)}
              aria-label="Cerrar notificación"
              className="-m-0.5 rounded-md p-0.5 text-slate-500 hover:text-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400"
            >
              <X size={16} />
            </button>
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
