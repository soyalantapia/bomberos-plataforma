'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Check, Cloud, CloudOff, Loader2, RefreshCw } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { cn } from '@faro/ui';

interface QueueItem {
  id: string;
  tipo: 'servicio' | 'asistencia' | 'foto' | 'mensaje';
  descripcion: string;
  cuando: string;
}

type Estado = 'online' | 'syncing' | 'offline';

const TIPO_LABEL: Record<QueueItem['tipo'], { label: string; emoji: string }> = {
  servicio: { label: 'Servicio', emoji: '🚒' },
  asistencia: { label: 'Asistencia', emoji: '🕐' },
  foto: { label: 'Foto adjunto', emoji: '📷' },
  mensaje: { label: 'Mensaje', emoji: '💬' },
};

const QUEUE_DEMO_OFFLINE: QueueItem[] = [
  {
    id: 'q-1',
    tipo: 'servicio',
    descripcion: 'Incendio Av. Constituyentes — esperando subida',
    cuando: 'Hace 4 min',
  },
  {
    id: 'q-2',
    tipo: 'foto',
    descripcion: '3 fotos del operativo — 4.2 MB',
    cuando: 'Hace 4 min',
  },
  {
    id: 'q-3',
    tipo: 'asistencia',
    descripcion: 'Check-in en cuartel — 06:55',
    cuando: 'Hace 8 min',
  },
];

export function SyncStatusPill() {
  const [estado, setEstado] = useState<Estado>('online');
  const [abierto, setAbierto] = useState(false);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Sincronizar con navigator
  useEffect(() => {
    if (typeof navigator === 'undefined') return;
    const updateOnline = () => {
      const isOnline = navigator.onLine;
      if (!isOnline) {
        setEstado('offline');
        setQueue(QUEUE_DEMO_OFFLINE);
      } else if (estado === 'offline') {
        // Volvió la conexión: empezar a sincronizar
        setEstado('syncing');
        // Vaciar la cola progresivamente
        setTimeout(() => setQueue((q) => q.slice(1)), 700);
        setTimeout(() => setQueue((q) => q.slice(1)), 1400);
        setTimeout(() => setQueue((q) => q.slice(1)), 2100);
        setTimeout(() => setEstado('online'), 2700);
      }
    };
    updateOnline();
    window.addEventListener('online', updateOnline);
    window.addEventListener('offline', updateOnline);
    return () => {
      window.removeEventListener('online', updateOnline);
      window.removeEventListener('offline', updateOnline);
    };
  }, [estado]);

  // Cerrar popover al click fuera
  useEffect(() => {
    if (!abierto) return;
    const onClick = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setAbierto(false);
      }
    };
    setTimeout(() => document.addEventListener('click', onClick), 0);
    return () => document.removeEventListener('click', onClick);
  }, [abierto]);

  // Demo: forzar offline temporal con doble click (botón debug)
  function simularOffline() {
    setEstado('offline');
    setQueue(QUEUE_DEMO_OFFLINE);
  }
  function simularReconectar() {
    setEstado('syncing');
    setTimeout(() => setQueue((q) => q.slice(1)), 600);
    setTimeout(() => setQueue((q) => q.slice(1)), 1200);
    setTimeout(() => setQueue((q) => q.slice(1)), 1800);
    setTimeout(() => setEstado('online'), 2400);
  }

  const config = {
    online: {
      bg: 'bg-status-ok-bg text-status-ok-fg ring-status-ok/20',
      icon: <Cloud size={13} />,
      label: 'En línea',
    },
    syncing: {
      bg: 'bg-brand-50 text-brand-700 ring-brand-200',
      icon: <Loader2 size={13} className="animate-spin" />,
      label: 'Sincronizando',
    },
    offline: {
      bg: 'bg-status-warn-bg text-status-warn-fg ring-status-warn/30',
      icon: <CloudOff size={13} />,
      label: 'Sin señal',
    },
  }[estado];

  return (
    <div className="relative" ref={popoverRef}>
      <button
        type="button"
        onClick={() => setAbierto((a) => !a)}
        className={cn(
          'hidden items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 transition-colors sm:inline-flex',
          config.bg,
        )}
        aria-label={`Estado de sincronización: ${config.label}`}
      >
        {config.icon}
        <span>{config.label}</span>
        {queue.length > 0 && (
          <span className="ml-0.5 rounded-full bg-white/80 px-1.5 py-0.5 text-[10px] font-bold tabular-nums">
            {queue.length}
          </span>
        )}
      </button>

      {/* Versión mobile: solo el icono */}
      <button
        type="button"
        onClick={() => setAbierto((a) => !a)}
        className={cn(
          'relative grid h-9 w-9 place-items-center rounded-lg transition-colors sm:hidden',
          estado === 'online'
            ? 'text-status-ok-fg'
            : estado === 'syncing'
              ? 'text-brand-700'
              : 'text-status-warn-fg',
        )}
        aria-label={config.label}
      >
        {config.icon}
        {queue.length > 0 && (
          <span className="bg-status-warn absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full px-1 text-[10px] font-bold tabular-nums text-white ring-2 ring-white">
            {queue.length}
          </span>
        )}
      </button>

      <AnimatePresence>
        {abierto && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.18 }}
            className="absolute right-0 top-full z-50 mt-2 w-[320px] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl"
          >
            <div
              className={cn('flex items-center gap-2 px-4 py-3 text-sm font-semibold', config.bg)}
            >
              {config.icon}
              <span className="flex-1">{config.label}</span>
              {estado === 'syncing' && (
                <span className="text-xs font-normal opacity-75">
                  {queue.length} pendiente{queue.length === 1 ? '' : 's'}
                </span>
              )}
            </div>

            <div className="border-b border-slate-100 px-4 py-3 text-xs text-slate-600">
              {estado === 'online' && queue.length === 0 && (
                <>
                  <strong className="text-slate-900">Todo sincronizado.</strong> Última carga
                  exitosa hace menos de 1 minuto.
                </>
              )}
              {estado === 'syncing' && (
                <>
                  <strong className="text-slate-900">Subiendo cambios.</strong> Esto suele tomar
                  pocos segundos. No cierres la app.
                </>
              )}
              {estado === 'offline' && (
                <>
                  <strong className="text-slate-900">Trabajando offline.</strong> Todo lo que
                  cargues queda guardado localmente y se sincroniza cuando vuelva la conexión.
                </>
              )}
            </div>

            {queue.length > 0 && (
              <div className="max-h-[280px] divide-y divide-slate-100 overflow-y-auto">
                {queue.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, x: 40 }}
                    className="flex items-start gap-2.5 px-4 py-2.5"
                  >
                    <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-slate-100 text-base">
                      {TIPO_LABEL[item.tipo].emoji}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold uppercase text-slate-500">
                          {TIPO_LABEL[item.tipo].label}
                        </span>
                        {estado === 'syncing' && (
                          <Loader2 size={10} className="text-brand-600 animate-spin" />
                        )}
                        {estado === 'offline' && (
                          <span className="bg-status-warn-bg text-status-warn-fg rounded px-1 text-[10px] font-medium">
                            En cola
                          </span>
                        )}
                      </div>
                      <div className="truncate text-xs text-slate-700">{item.descripcion}</div>
                      <div className="mt-0.5 text-[10px] text-slate-500">{item.cuando}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {queue.length === 0 && estado !== 'online' && (
              <div className="flex items-center justify-center gap-2 px-4 py-6 text-xs text-slate-500">
                <Check size={14} className="text-status-ok-fg" />
                Sin items pendientes
              </div>
            )}

            <div className="flex border-t border-slate-100">
              <button
                type="button"
                onClick={estado === 'offline' ? simularReconectar : simularOffline}
                className="flex-1 px-4 py-2.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
              >
                <RefreshCw size={12} className="mr-1 inline" />
                {estado === 'offline' ? 'Simular reconexión' : 'Simular sin señal'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
