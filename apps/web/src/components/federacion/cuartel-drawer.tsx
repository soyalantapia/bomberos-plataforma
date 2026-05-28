'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { MapPin, Shield, X } from 'lucide-react';

import type { Cuartel, Persona } from '@faro/types';

import { PersonaCardFed } from './persona-card-fed';

interface Props {
  cuartel: Cuartel | null;
  personas: Persona[];
  onClose: () => void;
}

/**
 * Drawer simplificado: sin sub-tabs, lista plana con separadores
 * por grupo. Toda la información visible de un golpe.
 */
export function CuartelDrawer({ cuartel, personas, onClose }: Props) {
  const activos = personas.filter((p) => p.cuerpo === 'activo' && p.estado === 'activo');
  const admins = personas.filter((p) => p.cuerpo === 'administrativo' && p.estado === 'activo');

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
            className="fixed bottom-0 right-0 top-0 z-50 flex w-full max-w-md flex-col bg-slate-50 shadow-2xl"
            role="dialog"
            aria-modal="true"
          >
            {/* Header limpio */}
            <header className="shrink-0 border-b border-slate-200 bg-white px-5 py-4">
              <div className="flex items-start gap-3">
                <div className="bg-fire-50 text-fire-700 grid h-12 w-12 shrink-0 place-items-center rounded-2xl">
                  <Shield size={22} />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="truncate text-xl font-bold text-slate-900">BV {cuartel.nombre}</h2>
                  <div className="mt-1 inline-flex items-center gap-1 text-sm text-slate-500">
                    <MapPin size={12} />
                    {cuartel.ciudad}
                  </div>
                  {cuartel.jefe && (
                    <div className="mt-1 text-xs text-slate-500">
                      Jefe: <span className="font-semibold text-slate-700">{cuartel.jefe}</span>
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Cerrar"
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-slate-500 hover:bg-slate-100"
                >
                  <X size={20} />
                </button>
              </div>
            </header>

            {/* Lista plana con separadores */}
            <div className="flex-1 overflow-y-auto p-4">
              {activos.length > 0 && (
                <section className="mb-5">
                  <div className="mb-2 flex items-baseline gap-2 px-1">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Cuerpo Activo
                    </h3>
                    <span className="text-xs text-slate-400">{activos.length}</span>
                  </div>
                  <div className="space-y-2">
                    {activos.map((p) => (
                      <PersonaCardFed key={p.id} persona={p} cuartel={cuartel} />
                    ))}
                  </div>
                </section>
              )}

              {admins.length > 0 && (
                <section>
                  <div className="mb-2 flex items-baseline gap-2 px-1">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Comisión Directiva
                    </h3>
                    <span className="text-xs text-slate-400">{admins.length}</span>
                  </div>
                  <div className="space-y-2">
                    {admins.map((p) => (
                      <PersonaCardFed key={p.id} persona={p} cuartel={cuartel} />
                    ))}
                  </div>
                </section>
              )}

              {activos.length === 0 && admins.length === 0 && (
                <div className="grid h-32 place-items-center text-sm text-slate-400">
                  Sin personas cargadas en este cuartel
                </div>
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
