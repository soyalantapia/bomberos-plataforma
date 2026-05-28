'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { MapPin, Shield, X } from 'lucide-react';
import { useState } from 'react';

import { Badge, cn, StatusPill } from '@faro/ui';

import type { Cuartel, Persona } from '@faro/types';

import { PersonaCardFed } from './persona-card-fed';

type Tab = 'activo' | 'admin' | 'especialistas';

interface Props {
  cuartel: Cuartel | null;
  personas: Persona[];
  onClose: () => void;
}

export function CuartelDrawer({ cuartel, personas, onClose }: Props) {
  const [tab, setTab] = useState<Tab>('activo');

  const activos = personas.filter((p) => p.cuerpo === 'activo' && p.estado === 'activo');
  const admins = personas.filter((p) => p.cuerpo === 'administrativo' && p.estado === 'activo');
  const especialistas = personas.filter(
    (p) => p.estado === 'activo' && p.especialidades && p.especialidades.length > 0,
  );

  const listaActual: Persona[] =
    tab === 'activo' ? activos : tab === 'admin' ? admins : especialistas;

  const intentByCumplimiento: 'ok' | 'warn' | 'risk' | 'neutral' = cuartel
    ? cuartel.cumplimiento === 'ok'
      ? 'ok'
      : cuartel.cumplimiento === 'warn'
        ? 'warn'
        : cuartel.cumplimiento === 'risk'
          ? 'risk'
          : 'neutral'
    : 'neutral';

  return (
    <AnimatePresence>
      {cuartel && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm"
            aria-hidden="true"
          />
          {/* Drawer */}
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 280 }}
            className="fixed bottom-0 right-0 top-0 z-50 flex w-full max-w-md flex-col bg-white shadow-2xl"
            role="dialog"
            aria-modal="true"
          >
            <header className="shrink-0 border-b border-slate-100 px-5 py-4">
              <div className="flex items-start gap-3">
                <div className="bg-fire-50 text-fire-700 grid h-10 w-10 shrink-0 place-items-center rounded-xl">
                  <Shield size={18} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h2 className="truncate text-lg font-bold text-slate-900">
                      BV {cuartel.nombre}
                    </h2>
                    <StatusPill
                      status={intentByCumplimiento}
                      label={`${cuartel.porcentajeRendicion}% rend.`}
                      size="sm"
                    />
                  </div>
                  <div className="mt-0.5 inline-flex items-center gap-1 text-xs text-slate-500">
                    <MapPin size={11} /> {cuartel.ciudad} · {cuartel.region}
                  </div>
                  {cuartel.jefe && (
                    <div className="mt-1 text-xs text-slate-600">
                      Jefe: <span className="font-medium text-slate-800">{cuartel.jefe}</span>
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Cerrar"
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-slate-500 hover:bg-slate-100"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="mt-3 flex gap-1 rounded-lg bg-slate-100 p-1">
                {(
                  [
                    ['activo', 'Cuerpo Activo', activos.length],
                    ['admin', 'Comisión Directiva', admins.length],
                    ['especialistas', 'Especialistas', especialistas.length],
                  ] as const
                ).map(([id, label, count]) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setTab(id)}
                    className={cn(
                      'flex-1 rounded-md px-2 py-1.5 text-xs font-medium transition-colors',
                      tab === id
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900',
                    )}
                  >
                    {label}
                    <Badge
                      intent={tab === id ? 'brand' : 'neutral'}
                      className="ml-1.5 px-1.5 py-0 text-[10px]"
                    >
                      {count}
                    </Badge>
                  </button>
                ))}
              </div>
            </header>

            <div className="flex-1 overflow-y-auto p-4">
              {listaActual.length === 0 ? (
                <div className="grid h-32 place-items-center text-sm text-slate-400">
                  Sin personas en esta categoría
                </div>
              ) : (
                <div className="space-y-2">
                  {listaActual.map((p) => (
                    <PersonaCardFed
                      key={p.id}
                      persona={p}
                      cuartel={cuartel}
                      region={cuartel.region}
                    />
                  ))}
                </div>
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
