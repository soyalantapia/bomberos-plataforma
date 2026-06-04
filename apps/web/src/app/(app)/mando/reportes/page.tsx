'use client';

import { motion } from 'framer-motion';
import {
  Calendar,
  Download,
  FileBarChart,
  FileText,
  Gavel,
  Loader2,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Badge, Button, Card, CardContent, Kpi, cn, useToast } from '@faro/ui';

import { PageHero } from '../../../../components/shared/page-hero';
import { exportarCsv } from '../../../../lib/utils/export-csv';
import { useFaroStore } from '../../../../store/use-faro-store';
import { demoToday } from '../../../../lib/utils/demo-today';

interface PlantillaReporte {
  id: string;
  titulo: string;
  descripcion: string;
  destinatario: string;
  formato: 'PDF firmado' | 'Excel' | 'PDF + XML';
  paginas: string;
  icon: React.ReactNode;
  categoria: 'periodico' | 'on_demand' | 'judicial';
}

const PLANTILLAS: PlantillaReporte[] = [
  {
    id: 'mensual-cd',
    titulo: 'Reporte mensual al Consejo Directivo',
    descripcion: 'Resumen ejecutivo de actividad operativa y administrativa',
    destinatario: 'Consejo Directivo · Comisión Directiva',
    formato: 'PDF firmado',
    paginas: '4-6 páginas',
    icon: <FileBarChart size={18} />,
    categoria: 'periodico',
  },
  {
    id: 'anual-ministerio',
    titulo: 'Reporte anual al Ministerio',
    descripcion: 'Cumplimiento Ley 25.054 + balance operativo completo',
    destinatario: 'Min. Seguridad · DNPC',
    formato: 'PDF + XML',
    paginas: '20-30 páginas',
    icon: <FileText size={18} />,
    categoria: 'periodico',
  },
  {
    id: 'fed-trimestral',
    titulo: 'Trimestral a Federación',
    descripcion: 'Indicadores operativos para consolidado federal',
    destinatario: 'Federación Bonaerense',
    formato: 'Excel',
    paginas: '12-15 hojas',
    icon: <FileBarChart size={18} />,
    categoria: 'periodico',
  },
  {
    id: 'judicial',
    titulo: 'Reporte por solicitud judicial',
    descripcion: 'Datos específicos de un incidente con firma y registro',
    destinatario: 'Juzgado / Fiscalía',
    formato: 'PDF firmado',
    paginas: 'Variable',
    icon: <Gavel size={18} />,
    categoria: 'judicial',
  },
  {
    id: 'sponsor',
    titulo: 'Reporte a sponsor anual',
    descripcion: 'Impacto del aporte privado en el cuartel',
    destinatario: 'Empresa sponsor',
    formato: 'PDF firmado',
    paginas: '8 páginas',
    icon: <FileText size={18} />,
    categoria: 'on_demand',
  },
  {
    id: 'fondo-rendicion',
    titulo: 'Histórico de rendiciones al Fondo',
    descripcion: 'Todas las rendiciones del año con comprobantes',
    destinatario: 'Auditor del sistema nacional',
    formato: 'PDF + XML',
    paginas: '60+ páginas',
    icon: <ShieldCheck size={18} />,
    categoria: 'on_demand',
  },
];

const RECIENTES = [
  { titulo: 'Mensual abril 2026 · CD', generado: '2026-05-02', tamaño: '2.4 MB' },
  { titulo: 'Trimestral Q1 · Federación', generado: '2026-04-15', tamaño: '8.1 MB' },
  { titulo: 'Anual 2025 · Ministerio', generado: '2026-01-31', tamaño: '12.6 MB' },
];

export default function ReportesPage() {
  const toast = useToast();
  const router = useRouter();
  const movimientos = useFaroStore((s) => s.movimientos);
  const cajas = useFaroStore((s) => s.cajas);
  const personas = useFaroStore((s) => s.personas);
  const servicios = useFaroStore((s) => s.servicios);
  const [generando, setGenerando] = useState<string | null>(null);
  const [seleccionada, setSeleccionada] = useState<string>('mensual-cd');
  const [rangoDesde, setRangoDesde] = useState(() => {
    const d = demoToday();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
  });
  const [rangoHasta, setRangoHasta] = useState(() => demoToday().toISOString().slice(0, 10));

  const rangoInvalido = rangoHasta < rangoDesde;

  function generar(id: string) {
    if (rangoInvalido) {
      toast.push({
        kind: 'warn',
        title: 'Rango de fechas inválido',
        description: 'La fecha "hasta" debe ser posterior o igual a "desde".',
      });
      return;
    }
    setGenerando(id);
    setTimeout(() => {
      setGenerando(null);
      // Generar CSV con resumen según la plantilla elegida
      const plantilla = PLANTILLAS.find((p) => p.id === id);
      const movsRango = movimientos.filter(
        (m) =>
          m.estado === 'conciliado' &&
          m.fecha.slice(0, 10) >= rangoDesde &&
          m.fecha.slice(0, 10) <= rangoHasta,
      );
      const servsRango = servicios.filter(
        (s) => s.horaSalida.slice(0, 10) >= rangoDesde && s.horaSalida.slice(0, 10) <= rangoHasta,
      );
      const totalIng = movsRango
        .filter((m) => m.tipo === 'ingreso')
        .reduce((s, m) => s + m.monto, 0);
      const totalEgr = movsRango
        .filter((m) => m.tipo === 'egreso')
        .reduce((s, m) => s + m.monto, 0);

      const headers = ['Sección', 'Concepto', 'Valor'];
      const rows: Array<Array<string | number>> = [
        ['Cabecera', 'Plantilla', plantilla?.titulo ?? id],
        ['Cabecera', 'Destinatario', plantilla?.destinatario ?? ''],
        ['Cabecera', 'Rango', `${rangoDesde} a ${rangoHasta}`],
        ['Resumen', 'Movimientos del período', movsRango.length],
        ['Resumen', 'Ingresos totales', totalIng],
        ['Resumen', 'Egresos totales', totalEgr],
        ['Resumen', 'Saldo neto', totalIng - totalEgr],
        ['Operativo', 'Servicios del período', servsRango.length],
        ['Operativo', 'Personal activo', personas.filter((p) => p.estado === 'activo').length],
        ['Operativo', 'Cajas operativas', cajas.length],
      ];
      exportarCsv(`reporte-${id}-${rangoDesde}-a-${rangoHasta}`, headers, rows);
      toast.push({
        kind: 'success',
        title: 'Reporte descargado',
        description: `reporte-${id}-${rangoDesde}-a-${rangoHasta}.csv`,
      });
    }, 1500);
  }

  function descargarReciente(titulo: string) {
    // Para los recientes generamos un CSV stub con metadatos
    exportarCsv(
      titulo.replace(/[^a-z0-9]/gi, '-').toLowerCase(),
      ['Campo', 'Valor'],
      [
        ['Reporte', titulo],
        ['Generado', demoToday().toLocaleString('es-AR')],
        ['Origen', 'Vulcano · histórico reportes'],
      ],
    );
    toast.push({ kind: 'success', title: `Descargando ${titulo}` });
  }

  const plantillaSel = PLANTILLAS.find((p) => p.id === seleccionada)!;

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <PageHero
        objetivo="Vista Mando · Reportes ejecutivos"
        titulo="Generador de reportes oficiales"
        descripcion="Plantillas pre-configuradas según destinatario. PDF firmado digitalmente y registrado. Disponible en segundos."
        icono={<FileBarChart size={26} />}
        meta={
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Kpi label="Plantillas" value={PLANTILLAS.length} intent="brand" />
            <Kpi label="Generados año" value={47} intent="neutral" />
            <Kpi label="Firmados" value="100%" hint="al día" intent="ok" />
            <Kpi label="Recientes" value={RECIENTES.length} intent="brand" />
          </div>
        }
      />

      {/* Informe institucional — documento real, listo para imprimir/PDF */}
      <Card className="border-brand-200 from-brand-50 border-2 bg-gradient-to-br to-white">
        <CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="bg-brand-900 grid h-11 w-11 shrink-0 place-items-center rounded-xl text-white">
              <FileBarChart size={20} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900">Informe mensual al Consejo Directivo</h3>
              <p className="text-sm text-slate-600">
                Documento institucional con los números reales del cuartel — listo para imprimir o
                guardar como PDF y presentar.
              </p>
            </div>
          </div>
          <Button
            intent="primary"
            size="lg"
            onClick={() => router.push('/informe')}
            className="shrink-0"
          >
            <FileText size={16} /> Ver informe
          </Button>
        </CardContent>
      </Card>

      {/* F24: Leyenda de categorías */}
      <div className="flex flex-wrap items-center gap-4 rounded-lg bg-slate-50 px-4 py-2.5">
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Categoría
        </span>
        <span className="flex items-center gap-1.5 text-xs text-slate-700">
          <span className="bg-brand-600 h-2.5 w-2.5 shrink-0 rounded-sm" />
          Periódico (obligatorio)
        </span>
        <span className="flex items-center gap-1.5 text-xs text-slate-700">
          <span className="bg-status-warn h-2.5 w-2.5 shrink-0 rounded-sm" />
          On-demand
        </span>
        <span className="flex items-center gap-1.5 text-xs text-slate-700">
          <span className="bg-status-risk h-2.5 w-2.5 shrink-0 rounded-sm" />
          Judicial
        </span>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {PLANTILLAS.map((p, idx) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.04 }}
          >
            <Card
              className={cn(
                'cursor-pointer transition-shadow hover:shadow-md',
                seleccionada === p.id && 'border-brand-400 ring-brand-200 ring-2',
              )}
              onClick={() => setSeleccionada(p.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div
                    className={cn(
                      'grid h-10 w-10 shrink-0 place-items-center rounded-xl text-white',
                      p.categoria === 'periodico'
                        ? 'bg-brand-600'
                        : p.categoria === 'judicial'
                          ? 'bg-status-risk'
                          : 'bg-status-warn',
                    )}
                  >
                    {p.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{p.titulo}</span>
                    </div>
                    <p className="mt-0.5 text-xs text-slate-600">{p.descripcion}</p>
                    <div className="mt-2 grid grid-cols-2 gap-1 text-[11px]">
                      <div className="text-slate-500">
                        Para: <span className="text-slate-900">{p.destinatario}</span>
                      </div>
                      <div className="text-slate-500">
                        Formato: <span className="font-mono text-slate-900">{p.formato}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Configurar reporte */}
      <Card className="bg-brand-50/40 border-brand-100">
        <CardContent className="p-5">
          <h3 className="mb-3 flex items-center gap-2 text-lg font-bold text-slate-900">
            <Sparkles size={18} className="text-brand-700" />
            Configurar · {plantillaSel.titulo}
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-bold uppercase text-slate-500">
                <Calendar size={11} className="mr-1 inline" />
                Desde
              </label>
              <input
                type="date"
                value={rangoDesde}
                onChange={(e) => setRangoDesde(e.target.value)}
                className="focus:border-brand-400 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold uppercase text-slate-500">Hasta</label>
              <input
                type="date"
                value={rangoHasta}
                onChange={(e) => setRangoHasta(e.target.value)}
                className="focus:border-brand-400 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2"
              />
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              intent="primary"
              size="lg"
              onClick={() => generar(plantillaSel.id)}
              disabled={generando !== null}
            >
              {generando === plantillaSel.id ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Generando...
                </>
              ) : (
                <>
                  <Download size={16} /> Generar {plantillaSel.formato}
                </>
              )}
            </Button>
            <Badge intent="brand">{plantillaSel.paginas}</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Recientes */}
      <Card>
        <CardContent className="p-0">
          <div className="border-b border-slate-100 px-5 py-3">
            <h3 className="font-bold text-slate-900">Reportes recientes</h3>
          </div>
          <ul className="divide-y divide-slate-100">
            {RECIENTES.map((r, idx) => (
              <motion.li
                key={r.titulo}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="flex items-center gap-3 p-4"
              >
                <div className="bg-status-ok-bg/40 text-status-ok-fg grid h-10 w-10 place-items-center rounded-xl">
                  <FileText size={16} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-slate-900">{r.titulo}</div>
                  <div className="text-xs text-slate-500">
                    Generado {new Date(r.generado).toLocaleDateString('es-AR')} · {r.tamaño}
                  </div>
                </div>
                <Button
                  intent="ghost"
                  size="sm"
                  onClick={() => descargarReciente(r.titulo)}
                  aria-label={`Descargar ${r.titulo}`}
                >
                  <Download size={12} />
                </Button>
              </motion.li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
