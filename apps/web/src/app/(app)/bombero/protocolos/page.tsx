'use client';

import { Badge, Card, CardContent, Input, cn } from '@faro/ui';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertTriangle,
  Car,
  ChevronDown,
  Flame,
  HeartPulse,
  ListChecks,
  Mountain,
  Search,
  ShieldAlert,
  TreePine,
  WifiOff,
  Wrench,
} from 'lucide-react';
import { useMemo, useState } from 'react';

import { fechaCorta } from '../../../../components/finanzas/utils';
import { PageHero } from '../../../../components/shared/page-hero';
import {
  CATEGORIA_PROTOCOLO_LABEL,
  protocolosMock,
  type CategoriaProtocolo,
} from '../../../../data/protocolos';
import { selectCuartelActivo, useFaroStore } from '../../../../store/use-faro-store';

const CAT: Record<CategoriaProtocolo, { icon: React.ReactNode; tile: string }> = {
  incendio_estructural: { icon: <Flame size={20} />, tile: 'bg-orange-100 text-orange-700' },
  incendio_forestal: { icon: <TreePine size={20} />, tile: 'bg-green-100 text-green-700' },
  rescate_vehicular: { icon: <Car size={20} />, tile: 'bg-sky-100 text-sky-700' },
  materiales_peligrosos: {
    icon: <AlertTriangle size={20} />,
    tile: 'bg-yellow-100 text-yellow-800',
  },
  rescate_altura: { icon: <Mountain size={20} />, tile: 'bg-purple-100 text-purple-700' },
  emergencia_medica: { icon: <HeartPulse size={20} />, tile: 'bg-rose-100 text-rose-700' },
  autoproteccion: { icon: <ShieldAlert size={20} />, tile: 'bg-brand-100 text-brand-700' },
};

const CATEGORIAS = Object.keys(CATEGORIA_PROTOCOLO_LABEL) as CategoriaProtocolo[];

export default function ProtocolosPage() {
  const cuartel = useFaroStore(selectCuartelActivo);
  const [query, setQuery] = useState('');
  const [cat, setCat] = useState<'todos' | CategoriaProtocolo>('todos');
  const [abierto, setAbierto] = useState<string | null>(null);

  const filtrados = useMemo(() => {
    const q = query.trim().toLowerCase();
    return protocolosMock.filter((p) => {
      const matchCat = cat === 'todos' || p.categoria === cat;
      const matchQ =
        !q ||
        p.titulo.toLowerCase().includes(q) ||
        p.resumen.toLowerCase().includes(q) ||
        CATEGORIA_PROTOCOLO_LABEL[p.categoria].toLowerCase().includes(q) ||
        p.pasos.some((s) => s.toLowerCase().includes(q));
      return matchCat && matchQ;
    });
  }, [query, cat]);

  const conteoPorCat = useMemo(() => {
    const m = new Map<CategoriaProtocolo, number>();
    for (const p of protocolosMock) m.set(p.categoria, (m.get(p.categoria) ?? 0) + 1);
    return m;
  }, []);

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <PageHero
        objetivo={`Cuerpo activo · ${cuartel?.nombre ?? 'Cuartel'}`}
        titulo="Protocolos"
        descripcion="Los procedimientos del cuartel, siempre en tu bolsillo — también sin señal."
        icono={<ListChecks size={26} />}
        meta={
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-xl bg-white/10 p-2.5 text-center">
              <div className="text-xl font-black text-white">{protocolosMock.length}</div>
              <div className="text-[11px] text-white/70">protocolos</div>
            </div>
            <div className="rounded-xl bg-white/10 p-2.5 text-center">
              <div className="text-xl font-black text-white">{CATEGORIAS.length}</div>
              <div className="text-[11px] text-white/70">categorías</div>
            </div>
            <div className="flex flex-col items-center justify-center rounded-xl bg-white/10 p-2.5 text-center">
              <WifiOff size={16} className="text-white" />
              <div className="text-[11px] text-white/70">offline</div>
            </div>
          </div>
        }
      />

      {/* Buscador */}
      <div className="relative">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar protocolo, situación o categoría…"
          className="pl-10"
        />
      </div>

      {/* Filtro por categoría */}
      <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1">
        <button
          type="button"
          onClick={() => setCat('todos')}
          className={cn(
            'inline-flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors',
            cat === 'todos'
              ? 'bg-brand-600 text-white'
              : 'bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50',
          )}
        >
          Todos
          <span
            className={cn(
              'rounded-full px-1.5 text-[10px] font-bold',
              cat === 'todos' ? 'bg-white/25' : 'bg-slate-100 text-slate-600',
            )}
          >
            {protocolosMock.length}
          </span>
        </button>
        {CATEGORIAS.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCat(c)}
            className={cn(
              'inline-flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors',
              cat === c
                ? 'bg-brand-600 text-white'
                : 'bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50',
            )}
          >
            {CATEGORIA_PROTOCOLO_LABEL[c]}
            <span
              className={cn(
                'rounded-full px-1.5 text-[10px] font-bold',
                cat === c ? 'bg-white/25' : 'bg-slate-100 text-slate-600',
              )}
            >
              {conteoPorCat.get(c) ?? 0}
            </span>
          </button>
        ))}
      </div>

      {/* Lista de protocolos */}
      <div className="space-y-2.5">
        {filtrados.map((p) => {
          const cfg = CAT[p.categoria];
          const open = abierto === p.id;
          return (
            <Card key={p.id} className={cn('overflow-hidden', open && 'ring-brand-200 ring-2')}>
              <button
                type="button"
                onClick={() => setAbierto(open ? null : p.id)}
                className="flex w-full items-center gap-3 p-4 text-left"
                aria-expanded={open}
              >
                <span
                  className={cn('grid h-11 w-11 shrink-0 place-items-center rounded-xl', cfg.tile)}
                >
                  {cfg.icon}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-slate-900">{p.titulo}</div>
                  <div className="truncate text-sm text-slate-600">{p.resumen}</div>
                </div>
                <ChevronDown
                  size={20}
                  className={cn(
                    'shrink-0 text-slate-400 transition-transform',
                    open && 'rotate-180',
                  )}
                />
              </button>

              <AnimatePresence initial={false}>
                {open && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.22 }}
                    className="overflow-hidden"
                  >
                    <CardContent className="space-y-4 border-t border-slate-100 p-4 pt-4">
                      <Badge intent="neutral">{CATEGORIA_PROTOCOLO_LABEL[p.categoria]}</Badge>

                      {/* Paso a paso */}
                      <div>
                        <h4 className="mb-2 flex items-center gap-1.5 text-sm font-bold text-slate-900">
                          <ListChecks size={15} className="text-brand-600" /> Paso a paso
                        </h4>
                        <ol className="space-y-1.5">
                          {p.pasos.map((paso, i) => (
                            <li key={i} className="flex gap-2.5 text-sm text-slate-700">
                              <span className="bg-brand-100 text-brand-700 grid h-5 w-5 shrink-0 place-items-center rounded-full text-[11px] font-bold">
                                {i + 1}
                              </span>
                              <span>{paso}</span>
                            </li>
                          ))}
                        </ol>
                      </div>

                      {/* Seguridad */}
                      <div className="border-status-risk/30 bg-status-risk-bg/20 rounded-xl border p-3">
                        <h4 className="text-status-risk-fg mb-2 flex items-center gap-1.5 text-sm font-bold">
                          <AlertTriangle size={15} /> Seguridad
                        </h4>
                        <ul className="space-y-1">
                          {p.seguridad.map((s, i) => (
                            <li key={i} className="flex gap-2 text-sm text-slate-700">
                              <span className="text-status-risk-fg">•</span>
                              <span>{s}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Equipo */}
                      <div>
                        <h4 className="mb-2 flex items-center gap-1.5 text-sm font-bold text-slate-900">
                          <Wrench size={15} className="text-slate-500" /> Equipo
                        </h4>
                        <div className="flex flex-wrap gap-1.5">
                          {p.equipo.map((e, i) => (
                            <span
                              key={i}
                              className="rounded-lg bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700"
                            >
                              {e}
                            </span>
                          ))}
                        </div>
                      </div>

                      <p className="text-[11px] text-slate-400">
                        Actualizado el {fechaCorta(p.actualizado)} · contenido orientativo, seguí
                        siempre la orden del jefe de la dotación.
                      </p>
                    </CardContent>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          );
        })}

        {filtrados.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center text-sm text-slate-500">
              No encontramos protocolos para “{query}”. Probá con otra palabra o categoría.
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
