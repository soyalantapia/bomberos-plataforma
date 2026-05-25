'use client';

import { motion } from 'framer-motion';
import {
  AlertOctagon,
  Flame,
  MapPin,
  Mic,
  Moon,
  Phone,
  Radio,
  ShieldAlert,
  Sun,
  Truck,
  Users,
} from 'lucide-react';
import { useEffect, useState } from 'react';

import { Avatar, Badge, Button, Card, CardContent, cn } from '@faro/ui';

export default function MobileTacticalPage() {
  const [modoNoche, setModoNoche] = useState(false);
  const [tiempoIncidente, setTiempoIncidente] = useState(154); // segundos
  const [parSec, setParSec] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setTiempoIncidente((t) => t + 1);
      setParSec((s) => s + 1);
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const parRemaining = 1200 - (parSec % 1200);
  const parMin = Math.floor(parRemaining / 60);
  const parSeg = parRemaining % 60;

  const horas = Math.floor(tiempoIncidente / 3600);
  const mins = Math.floor((tiempoIncidente % 3600) / 60);
  const secs = tiempoIncidente % 60;

  return (
    <div className={cn('min-h-screen transition-colors', modoNoche ? 'bg-black' : 'bg-slate-900')}>
      {/* Top bar */}
      <div
        className={cn(
          'flex items-center justify-between px-6 py-4 text-white',
          modoNoche ? 'bg-red-950/40 text-red-200' : 'bg-slate-950',
        )}
      >
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
            className={cn(
              'grid h-12 w-12 place-items-center rounded-xl',
              modoNoche ? 'bg-red-700' : 'bg-fire-600',
            )}
          >
            <Flame size={24} />
          </motion.div>
          <div>
            <div className="text-xs uppercase opacity-75">Incidente activo</div>
            <div className="text-lg font-bold">Incendio · Av. Mosconi 4521</div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-xs opacity-75">Tiempo activo</div>
            <div className="font-mono text-2xl font-bold tabular-nums">
              {horas.toString().padStart(2, '0')}:{mins.toString().padStart(2, '0')}:
              {secs.toString().padStart(2, '0')}
            </div>
          </div>
          <button
            type="button"
            onClick={() => setModoNoche(!modoNoche)}
            className={cn(
              'grid h-12 w-12 place-items-center rounded-xl',
              modoNoche ? 'bg-red-800 text-red-200' : 'bg-slate-800 text-slate-300',
            )}
            aria-label="Modo noche"
          >
            {modoNoche ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
      </div>

      {/* Grid principal · diseñado para tablet 10" landscape */}
      <div className="grid gap-3 p-3 md:grid-cols-3">
        {/* Columna izquierda · PAR + dotación */}
        <div className="space-y-3">
          {/* PAR timer · GRANDE */}
          <Card
            className={cn(
              'border-2',
              parRemaining < 60
                ? 'border-status-risk bg-status-risk-bg'
                : modoNoche
                  ? 'border-red-900 bg-red-950/30'
                  : 'border-slate-700 bg-slate-800',
            )}
          >
            <CardContent className="p-5 text-center">
              <div
                className={cn(
                  'text-xs uppercase tracking-wider',
                  modoNoche ? 'text-red-300' : 'text-slate-400',
                )}
              >
                Próximo PAR
              </div>
              <div
                className={cn(
                  'mt-1 font-mono text-5xl font-bold tabular-nums',
                  parRemaining < 60
                    ? 'text-status-risk-fg'
                    : modoNoche
                      ? 'text-red-200'
                      : 'text-white',
                )}
              >
                {parMin}:{parSeg.toString().padStart(2, '0')}
              </div>
              <Button
                intent={parRemaining < 60 ? 'primary' : 'secondary'}
                size="lg"
                fullWidth
                className="mt-3"
                onClick={() => setParSec(0)}
              >
                Ejecutar PAR
              </Button>
            </CardContent>
          </Card>

          {/* Dotación · GRANDE para guantes */}
          <Card className={cn(modoNoche ? 'bg-red-950/30' : 'bg-slate-800')}>
            <CardContent className="p-4">
              <div
                className={cn(
                  'mb-2 flex items-center gap-2 text-sm font-bold uppercase',
                  modoNoche ? 'text-red-300' : 'text-slate-300',
                )}
              >
                <Users size={16} />
                Dotación · 4 personas
              </div>
              <ul className="space-y-2">
                {[
                  { nombre: 'Mariana Pereyra', rol: 'Comandante', estado: 'ok' },
                  { nombre: 'Sebastián Ruiz', rol: 'Operaciones', estado: 'ok' },
                  { nombre: 'Carolina Sosa', rol: 'Seguridad', estado: 'warn' },
                  { nombre: 'Federico Vázquez', rol: 'Atacante', estado: 'ok' },
                ].map((p) => (
                  <li
                    key={p.nombre}
                    className={cn(
                      'flex items-center gap-3 rounded-lg p-2',
                      modoNoche ? 'bg-red-900/30' : 'bg-slate-900',
                    )}
                  >
                    <Avatar name={p.nombre} size={36} />
                    <div className="min-w-0 flex-1">
                      <div
                        className={cn(
                          'truncate text-sm font-medium',
                          modoNoche ? 'text-red-100' : 'text-white',
                        )}
                      >
                        {p.nombre}
                      </div>
                      <div
                        className={cn('text-xs', modoNoche ? 'text-red-300/70' : 'text-slate-400')}
                      >
                        {p.rol}
                      </div>
                    </div>
                    <Badge intent={p.estado === 'ok' ? 'ok' : 'warn'}>
                      {p.estado === 'ok' ? 'OK' : '⚠'}
                    </Badge>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Columna central · Mapa táctico */}
        <div>
          <Card className="h-full overflow-hidden">
            <CardContent className="p-0">
              <div
                className={cn(
                  'grid h-full min-h-[400px] place-items-center text-center',
                  modoNoche ? 'bg-red-950/20' : 'bg-slate-700',
                )}
              >
                <div>
                  <MapPin
                    size={48}
                    className={modoNoche ? 'mx-auto text-red-300' : 'mx-auto text-slate-300'}
                  />
                  <div className={cn('mt-2 font-bold', modoNoche ? 'text-red-200' : 'text-white')}>
                    Mapa táctico
                  </div>
                  <div
                    className={cn('mt-1 text-xs', modoNoche ? 'text-red-400/70' : 'text-slate-400')}
                  >
                    Móvil BV-3 · 14° rumbo · 0 km/h
                  </div>
                  <div className="bg-fire-600 mt-3 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold text-white">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-white" />
                    EN ESCENA
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Columna derecha · Acciones rápidas */}
        <div className="space-y-3">
          {/* Mando · botones grandes */}
          <Card className={cn(modoNoche ? 'bg-red-950/30' : 'bg-slate-800')}>
            <CardContent className="p-3">
              <div
                className={cn(
                  'mb-2 text-xs font-bold uppercase',
                  modoNoche ? 'text-red-300' : 'text-slate-300',
                )}
              >
                Acciones tácticas
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: 'Pedir refuerzo', icon: <Users size={28} />, color: 'bg-status-warn' },
                  { label: 'Comunicar', icon: <Radio size={28} />, color: 'bg-brand-600' },
                  {
                    label: 'Emergencia',
                    icon: <AlertOctagon size={28} />,
                    color: 'bg-status-risk',
                  },
                  { label: 'Llamar SAME', icon: <Phone size={28} />, color: 'bg-purple-600' },
                  { label: 'Dictar parte', icon: <Mic size={28} />, color: 'bg-brand-700' },
                  { label: 'Móvil', icon: <Truck size={28} />, color: 'bg-fire-700' },
                ].map((b) => (
                  <motion.button
                    key={b.label}
                    whileTap={{ scale: 0.95 }}
                    type="button"
                    className={cn(
                      'flex h-24 flex-col items-center justify-center gap-1 rounded-xl text-white shadow-lg',
                      b.color,
                    )}
                  >
                    {b.icon}
                    <span className="text-[10px] font-bold uppercase">{b.label}</span>
                  </motion.button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Estado vital */}
          <Card className={cn(modoNoche ? 'bg-red-950/30' : 'bg-slate-800')}>
            <CardContent className="p-3">
              <div
                className={cn(
                  'mb-2 text-xs font-bold uppercase',
                  modoNoche ? 'text-red-300' : 'text-slate-300',
                )}
              >
                <ShieldAlert size={14} className="mr-1 inline" />
                Estado vital escena
              </div>
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className={cn('rounded-lg p-2', modoNoche ? 'bg-red-900/40' : 'bg-slate-900')}>
                  <div
                    className={cn(
                      'text-[10px] uppercase',
                      modoNoche ? 'text-red-300/70' : 'text-slate-400',
                    )}
                  >
                    Temp.
                  </div>
                  <div
                    className={cn(
                      'text-xl font-bold tabular-nums',
                      modoNoche ? 'text-red-100' : 'text-white',
                    )}
                  >
                    21°C
                  </div>
                </div>
                <div className={cn('rounded-lg p-2', modoNoche ? 'bg-red-900/40' : 'bg-slate-900')}>
                  <div
                    className={cn(
                      'text-[10px] uppercase',
                      modoNoche ? 'text-red-300/70' : 'text-slate-400',
                    )}
                  >
                    Viento
                  </div>
                  <div
                    className={cn(
                      'text-xl font-bold tabular-nums',
                      modoNoche ? 'text-red-100' : 'text-white',
                    )}
                  >
                    8 km/h
                  </div>
                </div>
                <div className={cn('rounded-lg p-2', modoNoche ? 'bg-red-900/40' : 'bg-slate-900')}>
                  <div
                    className={cn(
                      'text-[10px] uppercase',
                      modoNoche ? 'text-red-300/70' : 'text-slate-400',
                    )}
                  >
                    Hum.
                  </div>
                  <div
                    className={cn(
                      'text-xl font-bold tabular-nums',
                      modoNoche ? 'text-red-100' : 'text-white',
                    )}
                  >
                    62%
                  </div>
                </div>
                <div className={cn('rounded-lg p-2', modoNoche ? 'bg-red-900/40' : 'bg-slate-900')}>
                  <div
                    className={cn(
                      'text-[10px] uppercase',
                      modoNoche ? 'text-red-300/70' : 'text-slate-400',
                    )}
                  >
                    Riesgo
                  </div>
                  <div className="text-status-ok-fg text-xl font-bold tabular-nums">Bajo</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer info */}
      <div
        className={cn(
          'px-6 py-3 text-center text-xs',
          modoNoche ? 'text-red-400/70' : 'text-slate-500',
        )}
      >
        Modo táctico · optimizado para tablet 10" en cabina · {modoNoche ? 'noche' : 'día'} · UI a
        prueba de guantes
      </div>
    </div>
  );
}
