'use client';

import {
  Clock,
  FileSearch,
  FileText,
  FolderOpen,
  Image as ImageIcon,
  ScrollText,
  Sparkles,
  Upload,
} from 'lucide-react';
import { useState } from 'react';

import { Badge, Card, CardContent, Input, Kpi, cn, useToast } from '@faro/ui';

import { PageHero } from '../../../../components/shared/page-hero';

interface Doc {
  id: string;
  nombre: string;
  tipo: 'reglamento' | 'manual' | 'acta' | 'plantilla' | 'protocolo';
  formato: 'pdf' | 'docx' | 'img';
  paginas?: number;
  tamano: string;
  actualizado: string;
  destacado?: boolean;
}

const docs: Doc[] = [
  {
    id: 'd1',
    nombre: 'Reglamento interno · v2024',
    tipo: 'reglamento',
    formato: 'pdf',
    paginas: 142,
    tamano: '2.4 MB',
    actualizado: '1/3/2024',
    destacado: true,
  },
  {
    id: 'd2',
    nombre: 'Manual del Fondo Nacional',
    tipo: 'manual',
    formato: 'pdf',
    paginas: 56,
    tamano: '1.8 MB',
    actualizado: '15/1/2026',
    destacado: true,
  },
  {
    id: 'd3',
    nombre: 'Protocolo COVID actualizado',
    tipo: 'protocolo',
    formato: 'pdf',
    paginas: 24,
    tamano: '850 KB',
    actualizado: '12/3/2026',
  },
  {
    id: 'd4',
    nombre: 'Protocolo carga de servicio',
    tipo: 'protocolo',
    formato: 'pdf',
    paginas: 24,
    tamano: '1.1 MB',
    actualizado: '20/4/2026',
  },
  {
    id: 'd5',
    nombre: 'Acta asamblea anual 2025',
    tipo: 'acta',
    formato: 'docx',
    paginas: 12,
    tamano: '340 KB',
    actualizado: '15/12/2025',
  },
  {
    id: 'd6',
    nombre: 'Plantilla parte de servicio',
    tipo: 'plantilla',
    formato: 'docx',
    paginas: 2,
    tamano: '85 KB',
    actualizado: '10/3/2026',
  },
  {
    id: 'd7',
    nombre: 'Plano del cuartel · v2026',
    tipo: 'plantilla',
    formato: 'img',
    tamano: '3.2 MB',
    actualizado: '5/2/2026',
  },
  {
    id: 'd8',
    nombre: 'Resolución 24/26 · Cómputo',
    tipo: 'reglamento',
    formato: 'pdf',
    paginas: 8,
    tamano: '420 KB',
    actualizado: '1/4/2026',
    destacado: true,
  },
];

const TIPO_STYLE: Record<Doc['tipo'], { color: string; label: string }> = {
  reglamento: { color: 'bg-brand-600 text-white', label: 'Normativa' },
  manual: { color: 'bg-status-ok text-white', label: 'Manual' },
  acta: { color: 'bg-slate-600 text-white', label: 'Acta' },
  plantilla: { color: 'bg-status-warn text-white', label: 'Plantilla' },
  protocolo: { color: 'bg-status-risk text-white', label: 'Protocolo' },
};

const FORMATO_ICON: Record<Doc['formato'], React.ReactNode> = {
  pdf: <FileText size={20} />,
  docx: <ScrollText size={20} />,
  img: <ImageIcon size={20} />,
};

const SUGERENCIAS = [
  'qué dice el reglamento sobre uniforme',
  'cómo se calcula el cómputo en el Fondo',
  'plantilla de parte de servicio',
  'protocolo de carga por voz',
];

export default function DocumentosPage() {
  const toast = useToast();
  const [q, setQ] = useState('');
  const [tipoFiltro, setTipoFiltro] = useState<Doc['tipo'] | 'todos'>('todos');

  const filtrados = docs.filter((d) => {
    if (tipoFiltro !== 'todos' && d.tipo !== tipoFiltro) return false;
    if (q.length > 1) {
      return d.nombre.toLowerCase().includes(q.toLowerCase());
    }
    return true;
  });

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <PageHero
        objetivo="Administrativo · Biblioteca"
        titulo="Buscás por idea, te lleva al párrafo"
        descripcion="50 documentos del cuartel y la Federación · busca por significado, no solo por palabra exacta."
        icono={<FolderOpen size={26} />}
        meta={
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Kpi label="Documentos" value={50} intent="brand" />
            <Kpi label="Vigentes" value={36} intent="ok" />
            <Kpi label="Categorías" value={5} intent="neutral" />
            <Kpi
              label="Listos para buscar"
              value="100%"
              hint="búsqueda inteligente"
              intent="ok"
              icon={<Sparkles size={16} />}
            />
          </div>
        }
      />

      <Card className="border-brand-200 relative overflow-hidden border-2">
        <div className="bg-brand-100 absolute -right-12 -top-12 h-40 w-40 rounded-full blur-3xl" />
        <CardContent className="relative p-5">
          <div className="mb-3 flex items-center gap-2">
            <Sparkles size={18} className="text-brand-600" />
            <span className="font-semibold text-slate-900">Búsqueda inteligente</span>
            <Badge intent="brand">como vos hablás</Badge>
          </div>
          <div className="relative">
            <FileSearch
              size={18}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder='Ej: "qué dice el reglamento sobre uniforme"'
              className="border-2 pl-10 text-base"
            />
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            <span className="text-xs text-slate-500">Ideas:</span>
            {SUGERENCIAS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setQ(s)}
                className="hover:bg-brand-50 hover:text-brand-700 rounded-full bg-white px-2.5 py-0.5 text-xs text-slate-600 ring-1 ring-slate-200"
              >
                {s}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="-mx-1 flex items-center gap-1.5 overflow-x-auto px-1 text-sm">
        <span className="shrink-0 text-xs text-slate-500">Filtrar:</span>
        {(['todos', 'reglamento', 'manual', 'protocolo', 'acta', 'plantilla'] as const).map((t) => {
          const active = tipoFiltro === t;
          return (
            <button
              key={t}
              type="button"
              onClick={() => setTipoFiltro(t)}
              className={cn(
                'shrink-0 rounded-full border px-3 py-1 text-xs font-medium capitalize transition-colors',
                active
                  ? 'border-brand-600 bg-brand-600 text-white'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300',
              )}
            >
              {t === 'todos' ? 'Todos' : TIPO_STYLE[t].label}
            </button>
          );
        })}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filtrados.map((d) => (
          <button
            key={d.id}
            type="button"
            onClick={() =>
              toast.push({
                kind: 'info',
                title: 'Abriendo previsualización',
                description: d.nombre,
              })
            }
            className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 text-left transition-all hover:-translate-y-0.5 hover:shadow-lg"
          >
            {d.destacado && (
              <div className="bg-status-warn-bg text-status-warn-fg absolute right-2 top-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold">
                <Sparkles size={9} /> Destacado
              </div>
            )}

            <div className="mb-3 flex items-start gap-3">
              <div className="group-hover:bg-brand-50 group-hover:text-brand-700 grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-slate-50 text-slate-700 ring-1 ring-slate-200 transition-colors">
                {FORMATO_ICON[d.formato]}
              </div>
              <div className="min-w-0 flex-1 pr-12">
                <div className="line-clamp-2 font-semibold leading-tight text-slate-900">
                  {d.nombre}
                </div>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between gap-2 border-t border-slate-100 pt-3">
              <span
                className={cn(
                  'inline-flex h-5 items-center rounded px-1.5 text-[10px] font-semibold uppercase',
                  TIPO_STYLE[d.tipo].color,
                )}
              >
                {TIPO_STYLE[d.tipo].label}
              </span>
              <div className="flex items-center gap-2 text-[11px] text-slate-500">
                <span className="font-mono uppercase">{d.formato}</span>
                {d.paginas && <span>· {d.paginas}p</span>}
                <span>· {d.tamano}</span>
              </div>
            </div>

            <div className="mt-2 flex items-center gap-1 text-[10px] text-slate-400">
              <Clock size={10} /> Actualizado {d.actualizado}
            </div>
          </button>
        ))}
      </div>

      <Card className="border-2 border-dashed border-slate-300 bg-slate-50/50">
        <CardContent className="flex items-center gap-4 p-5">
          <div className="grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-white text-slate-500 ring-1 ring-slate-200">
            <Upload size={22} />
          </div>
          <div className="flex-1">
            <div className="font-semibold text-slate-900">Subir un documento</div>
            <div className="mt-0.5 text-sm text-slate-600">
              Arrastrá un PDF, .docx o imagen acá. Lo procesamos y aparece en la búsqueda en menos
              de 1 minuto.
            </div>
          </div>
          <button
            type="button"
            onClick={() =>
              toast.push({
                kind: 'info',
                title: 'Elegí un archivo',
                description: 'Buscando en tu carpeta',
              })
            }
            className="rounded-md bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-700"
          >
            Subir
          </button>
        </CardContent>
      </Card>
    </div>
  );
}
