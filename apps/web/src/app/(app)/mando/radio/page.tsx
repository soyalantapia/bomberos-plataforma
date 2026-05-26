'use client';

import { motion } from 'framer-motion';
import {
  Antenna,
  Download,
  Pause,
  Play,
  Radio,
  Search,
  Signal,
  Sparkles,
  User,
} from 'lucide-react';
import { useState } from 'react';

import { Badge, Button, Card, CardContent, Kpi, cn } from '@faro/ui';

import { PageHero } from '../../../../components/shared/page-hero';

type CanalRadio = 'F1' | 'F2' | 'F3' | 'inter';

interface Transmision {
  id: string;
  canal: CanalRadio;
  emisor: string;
  hora: string;
  duracionSeg: number;
  resumenIA: string;
  audio: boolean;
}

const CANALES: Record<CanalRadio, { label: string; protocolo: string; color: string }> = {
  F1: { label: 'F1 · Operativo', protocolo: 'P25 trunked', color: 'bg-fire-600' },
  F2: { label: 'F2 · Comando', protocolo: 'DMR Tier II', color: 'bg-status-warn' },
  F3: { label: 'F3 · Logística', protocolo: 'DMR Tier II', color: 'bg-brand-600' },
  inter: { label: 'INTER · Multi-cuartel', protocolo: 'TETRA', color: 'bg-status-risk' },
};

const TRANSMISIONES: Transmision[] = [
  {
    id: 't-1',
    canal: 'F1',
    emisor: 'BV-3 · M. Pereyra',
    hora: '14:42:18',
    duracionSeg: 14,
    resumenIA: 'Aviso de salida del cuartel. Móvil BV-3 en ruta a Av. Mosconi 4521.',
    audio: true,
  },
  {
    id: 't-2',
    canal: 'F2',
    emisor: 'Cuartel · Operador',
    hora: '14:42:35',
    duracionSeg: 8,
    resumenIA: 'Confirmación de despacho. Notifica al jefe de cuartel.',
    audio: true,
  },
  {
    id: 't-3',
    canal: 'F1',
    emisor: 'BV-3 · M. Pereyra',
    hora: '14:46:02',
    duracionSeg: 22,
    resumenIA: 'Reporte en escena. Incendio en cocina, sin víctimas visibles. Solicita refuerzo.',
    audio: true,
  },
  {
    id: 't-4',
    canal: 'inter',
    emisor: 'Cuartel V. Ballester',
    hora: '14:46:55',
    duracionSeg: 18,
    resumenIA: 'Pedido de refuerzo al cuartel vecino San Andrés.',
    audio: true,
  },
  {
    id: 't-5',
    canal: 'F1',
    emisor: 'BV-5 · S. Ruiz',
    hora: '14:48:12',
    duracionSeg: 11,
    resumenIA: 'Confirmación de salida del refuerzo. ETA 6 minutos.',
    audio: true,
  },
  {
    id: 't-6',
    canal: 'F3',
    emisor: 'Logística · C. Sosa',
    hora: '14:51:30',
    duracionSeg: 9,
    resumenIA: 'Verificación de stock de mangueras 38mm en taller.',
    audio: true,
  },
  {
    id: 't-7',
    canal: 'F1',
    emisor: 'BV-3 · M. Pereyra',
    hora: '14:54:08',
    duracionSeg: 19,
    resumenIA:
      'Foco controlado. Persona con quemaduras leves trasladada por SAME al Hosp. Municipal.',
    audio: true,
  },
  {
    id: 't-8',
    canal: 'F2',
    emisor: 'Cuartel · Operador',
    hora: '14:58:42',
    duracionSeg: 7,
    resumenIA: 'Cierre de despacho. Tiempo en escena: 12 minutos. Sin novedades.',
    audio: true,
  },
];

export default function RadioPage() {
  const [canalFiltro, setCanalFiltro] = useState<'todos' | CanalRadio>('todos');
  const [search, setSearch] = useState('');
  const [reproduciendo, setReproduciendo] = useState<string | null>(null);

  const filtradas = TRANSMISIONES.filter((t) => {
    if (canalFiltro !== 'todos' && t.canal !== canalFiltro) return false;
    if (search.trim().length > 0) {
      const q = search.toLowerCase();
      if (!(t.resumenIA + t.emisor).toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const totalSeg = TRANSMISIONES.reduce((a, t) => a + t.duracionSeg, 0);

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <PageHero
        objetivo="Vista Mando · Radio interop log"
        titulo="Log de transmisiones radio"
        descripcion="Todas las comunicaciones por radio P25/DMR/TETRA quedan grabadas y transcriptas con IA (Whisper). Indispensable para auditorías post-incidente."
        icono={<Radio size={26} className="animate-pulse" />}
        meta={
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Kpi
              label="Transmisiones"
              value={TRANSMISIONES.length}
              hint="último incidente"
              intent="brand"
            />
            <Kpi
              label="Duración total"
              value={`${Math.floor(totalSeg / 60)}:${(totalSeg % 60).toString().padStart(2, '0')}`}
              hint="mm:ss"
              intent="neutral"
            />
            <Kpi label="Canales activos" value={4} intent="brand" />
            <Kpi label="Inter-cuartel" value="1" hint="V. Ballester ↔ S. Andrés" intent="warn" />
          </div>
        }
      />

      {/* Canales */}
      <Card>
        <CardContent className="p-3">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setCanalFiltro('todos')}
              className={cn(
                'rounded-full px-3 py-1 text-xs font-medium transition-colors',
                canalFiltro === 'todos'
                  ? 'bg-brand-600 text-white'
                  : 'bg-white text-slate-700 ring-1 ring-slate-200',
              )}
            >
              Todos los canales
            </button>
            {(Object.entries(CANALES) as [CanalRadio, (typeof CANALES)[CanalRadio]][]).map(
              ([id, cfg]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setCanalFiltro(id)}
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors',
                    canalFiltro === id
                      ? cn(cfg.color, 'text-white')
                      : 'bg-white text-slate-700 ring-1 ring-slate-200',
                  )}
                >
                  <Antenna size={11} />
                  {cfg.label}
                  <span className="text-[9px] opacity-75">{cfg.protocolo}</span>
                </button>
              ),
            )}
          </div>
        </CardContent>
      </Card>

      {/* Search */}
      <Card>
        <CardContent className="p-3">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar en transcripciones... (búsqueda full-text por IA)"
              className="focus:border-brand-400 w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:ring-2"
            />
          </div>
        </CardContent>
      </Card>

      {/* Timeline */}
      <Card>
        <CardContent className="p-0">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
            <h3 className="font-bold text-slate-900">Transmisiones · Incendio V. Devoto</h3>
            <Button intent="ghost" size="sm">
              <Download size={12} /> Exportar log
            </Button>
          </div>
          <ul className="divide-y divide-slate-100">
            {filtradas.map((t, idx) => {
              const cfg = CANALES[t.canal];
              const repro = reproduciendo === t.id;
              return (
                <motion.li
                  key={t.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.04 }}
                  className="flex items-start gap-3 p-4"
                >
                  <div
                    className={cn(
                      'grid h-10 w-10 shrink-0 place-items-center rounded-xl text-white',
                      cfg.color,
                    )}
                  >
                    <Antenna size={16} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge intent="brand">{cfg.label.split(' · ')[0]}</Badge>
                      <span className="text-xs text-slate-500">{t.hora}</span>
                      <span className="text-xs text-slate-500">·</span>
                      <span className="text-xs text-slate-500">{t.duracionSeg}s</span>
                      <span className="flex items-center gap-1 text-xs text-slate-700">
                        <User size={10} />
                        {t.emisor}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-slate-900">{t.resumenIA}</p>

                    {/* Audio player mock */}
                    {repro && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        className="mt-2 overflow-hidden"
                      >
                        <div className="flex items-center gap-2 rounded-lg bg-slate-50 p-2">
                          <button
                            type="button"
                            onClick={() => setReproduciendo(null)}
                            className="bg-brand-600 grid h-8 w-8 place-items-center rounded-full text-white"
                          >
                            <Pause size={12} />
                          </button>
                          <div className="flex-1">
                            <div className="h-1 overflow-hidden rounded-full bg-slate-200">
                              <motion.div
                                initial={{ width: '0%' }}
                                animate={{ width: '60%' }}
                                transition={{ duration: t.duracionSeg }}
                                className="bg-brand-600 h-full"
                              />
                            </div>
                            <div className="mt-1 text-[10px] text-slate-500">
                              Reproduciendo · {Math.round(t.duracionSeg * 0.6)}/{t.duracionSeg}s
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>
                  <div className="shrink-0">
                    <Button
                      intent="ghost"
                      size="sm"
                      onClick={() => setReproduciendo(repro ? null : t.id)}
                    >
                      {repro ? <Pause size={12} /> : <Play size={12} />}
                    </Button>
                  </div>
                </motion.li>
              );
            })}
          </ul>
        </CardContent>
      </Card>

      {/* IA insights */}
      <Card className="bg-brand-50/40 border-brand-100">
        <CardContent className="flex items-start gap-3 p-4">
          <div className="bg-brand-600 grid h-10 w-10 shrink-0 place-items-center rounded-xl text-white">
            <Sparkles size={18} />
          </div>
          <div className="flex-1 text-sm">
            <div className="text-brand-900 font-semibold">Análisis IA del incidente</div>
            <p className="text-brand-900/80 mt-0.5">
              La IA transcribió 8 transmisiones (108 segundos en total) y detectó: tiempo de
              respuesta 4 min ✓, comunicación clara, pedido de refuerzo apropiado, cierre
              coordinado. <strong>Sin problemas en las comunicaciones.</strong>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Compliance */}
      <Card className="border-slate-200 bg-slate-50">
        <CardContent className="flex items-start gap-3 p-4 text-sm text-slate-600">
          <Signal size={18} className="mt-0.5 shrink-0 text-slate-400" />
          <div>
            <strong className="text-slate-900">Cuánto tiempo se guarda:</strong> los audios se
            guardan 90 días y las transcripciones 7 años. Están encriptados. Solo se accede a ellos
            por orden judicial o con doble firma del cuartel.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
