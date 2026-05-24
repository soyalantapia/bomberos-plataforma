'use client';

import {
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  FileLock2,
  Gavel,
  ScrollText,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { useState } from 'react';

import { Badge, Card, CardContent, Kpi, cn, useToast } from '@faro/ui';

import { PageHero } from '../../../../components/shared/page-hero';

interface HitoExpediente {
  fecha: string;
  titulo: string;
  detalle: string;
  estado: 'completado' | 'actual' | 'futuro';
  porQuien?: string;
}

interface Expediente {
  numero: string;
  estado: 'activo' | 'cerrado';
  apertura: string;
  resumen: string;
  proximaAccion?: string;
  proximaFecha?: string;
  hitos: HitoExpediente[];
}

const expedientes: Expediente[] = [
  {
    numero: 'E-2026-014',
    estado: 'activo',
    apertura: '15/5/2026',
    resumen: 'Falta a reglamento interno · ámbito secundario',
    proximaAccion: 'Audiencia con partes',
    proximaFecha: '3/6/2026 · 18:00',
    hitos: [
      {
        fecha: '15/5',
        titulo: 'Apertura',
        detalle: 'Denuncia formal recibida',
        estado: 'completado',
        porQuien: 'F. Salinas',
      },
      {
        fecha: '17/5',
        titulo: 'Notificación al involucrado',
        detalle: 'Citación por OTP firmada',
        estado: 'completado',
        porQuien: 'Sistema',
      },
      {
        fecha: '20/5',
        titulo: 'Presentación de descargos',
        detalle: 'Recepción de documentación',
        estado: 'completado',
        porQuien: 'Involucrado',
      },
      {
        fecha: '24/5',
        titulo: 'Análisis preliminar',
        detalle: 'En revisión',
        estado: 'actual',
        porQuien: 'F. Salinas',
      },
      { fecha: '3/6', titulo: 'Audiencia', detalle: 'Sala de jefatura · 18:00', estado: 'futuro' },
      {
        fecha: '10/6',
        titulo: 'Resolución',
        detalle: 'Acto administrativo y firma',
        estado: 'futuro',
      },
    ],
  },
  {
    numero: 'E-2026-013',
    estado: 'cerrado',
    apertura: '12/4/2026',
    resumen: 'Conflicto interpersonal · resuelto por mediación',
    hitos: [
      {
        fecha: '12/4',
        titulo: 'Apertura',
        detalle: 'Denuncia informal',
        estado: 'completado',
        porQuien: 'F. Salinas',
      },
      {
        fecha: '20/4',
        titulo: 'Mediación',
        detalle: 'Reunión de partes con conducción',
        estado: 'completado',
        porQuien: 'F. Salinas + R. González',
      },
      {
        fecha: '5/5',
        titulo: 'Resolución · sin sanción',
        detalle: 'Acuerdo entre partes formalizado',
        estado: 'completado',
        porQuien: 'F. Salinas',
      },
    ],
  },
];

const ordenes = [
  {
    numero: '12/26',
    titulo: 'Renovación protocolo Pañol',
    firma: 'Comandante',
    fecha: '18/5/2026',
  },
  {
    numero: '11/26',
    titulo: 'Calendario de capacitación H2 2026',
    firma: 'Comandante',
    fecha: '5/5/2026',
  },
];

export default function EticaPage() {
  const toast = useToast();
  const [expSel, setExpSel] = useState<string>(expedientes[0]!.numero);
  const sel = expedientes.find((e) => e.numero === expSel)!;

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <PageHero
        objetivo="Gobierno interno · Ética"
        titulo={
          expedientes.filter((e) => e.estado === 'activo').length > 0
            ? `${expedientes.filter((e) => e.estado === 'activo').length} expediente activo`
            : 'Sin expedientes activos'
        }
        descripcion="Cada movimiento queda cifrado a nivel campo. Solo Referente de Ética, Comandante y Federación tienen acceso."
        icono={<Gavel size={26} />}
        variant="critical"
        meta={
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Kpi
              label="Activos"
              value={expedientes.filter((e) => e.estado === 'activo').length}
              intent="warn"
              icon={<ShieldAlert size={16} />}
            />
            <Kpi label="Cerrados año" value={8} intent="ok" icon={<ShieldCheck size={16} />} />
            <Kpi label="Órdenes vigentes" value={ordenes.length} icon={<Gavel size={16} />} />
            <Kpi
              label="Cifrado"
              value="AES-256"
              hint="campo a campo"
              intent="ok"
              icon={<FileLock2 size={16} />}
            />
          </div>
        }
      />

      <Card className="bg-status-warn-bg/40 border-status-warn/40">
        <CardContent className="flex items-start gap-3 p-4">
          <ShieldCheck size={20} className="text-status-warn-fg mt-0.5 shrink-0" />
          <div className="text-sm">
            <div className="text-status-warn-fg font-semibold">Acceso restringido y trazable</div>
            <p className="mt-1 text-slate-700">
              Todo lo que abrís acá queda con tu nombre, fecha y campo accedido en{' '}
              <a href="/gobierno/audit" className="text-brand-700 hover:text-brand-900 font-medium">
                Audit log
              </a>
              . Datos personales del involucrado y del denunciante se muestran con sus iniciales por
              defecto.
            </p>
          </div>
        </CardContent>
      </Card>

      <section>
        <h2 className="mb-3 flex items-center gap-2 text-base font-bold text-slate-900">
          <ShieldAlert size={18} className="text-status-warn" /> Expedientes
        </h2>

        <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
          <div className="space-y-2">
            {expedientes.map((e) => {
              const active = expSel === e.numero;
              return (
                <button
                  key={e.numero}
                  type="button"
                  onClick={() => setExpSel(e.numero)}
                  className={cn(
                    'w-full overflow-hidden rounded-xl border-2 bg-white p-3 text-left transition-all',
                    active
                      ? 'border-status-warn ring-status-warn-bg ring-2'
                      : 'border-slate-200 hover:border-slate-300',
                  )}
                >
                  <div className="flex items-start gap-2">
                    <div className="font-mono text-sm font-bold text-slate-900">{e.numero}</div>
                    <Badge
                      intent={e.estado === 'activo' ? 'warn' : 'neutral'}
                      className="ml-auto capitalize"
                    >
                      {e.estado}
                    </Badge>
                  </div>
                  <div className="mt-1 line-clamp-2 text-xs text-slate-600">{e.resumen}</div>
                  <div className="mt-2 flex items-center gap-1 text-[11px] text-slate-500">
                    <Calendar size={10} /> Apertura {e.apertura}
                  </div>
                </button>
              );
            })}
          </div>

          <Card>
            <CardContent className="p-5">
              <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <div className="font-mono text-2xl font-bold text-slate-900">{sel.numero}</div>
                  <div className="mt-0.5 text-sm text-slate-600">{sel.resumen}</div>
                </div>
                <Badge intent={sel.estado === 'activo' ? 'warn' : 'ok'} className="capitalize">
                  {sel.estado}
                </Badge>
              </div>

              {sel.proximaAccion && (
                <div className="border-status-warn/30 bg-status-warn-bg/30 mb-5 rounded-xl border p-3">
                  <div className="flex items-start gap-2">
                    <Clock size={16} className="text-status-warn-fg mt-0.5 shrink-0" />
                    <div className="flex-1">
                      <div className="text-status-warn-fg text-xs font-semibold uppercase tracking-wide">
                        Próxima acción
                      </div>
                      <div className="mt-0.5 font-semibold text-slate-900">{sel.proximaAccion}</div>
                      <div className="text-xs text-slate-600">{sel.proximaFecha}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => toast.push({ kind: 'info', title: 'Recordatorio agendado' })}
                      className="bg-status-warn-fg rounded-md px-2.5 py-1 text-xs font-semibold text-white hover:opacity-90"
                    >
                      Recordar
                    </button>
                  </div>
                </div>
              )}

              <h4 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">
                Timeline del expediente
              </h4>
              <div className="relative">
                <div className="absolute bottom-2 left-3 top-2 w-px bg-slate-200" />
                {sel.hitos.map((h, idx) => (
                  <div key={idx} className="relative pb-4 pl-9 last:pb-0">
                    <div
                      className={cn(
                        'absolute left-0 grid h-6 w-6 place-items-center rounded-full ring-4 ring-white',
                        h.estado === 'completado'
                          ? 'bg-status-ok text-white'
                          : h.estado === 'actual'
                            ? 'bg-status-warn animate-pulse text-white'
                            : 'bg-slate-200 text-slate-500',
                      )}
                    >
                      {h.estado === 'completado' && <CheckCircle2 size={14} />}
                      {h.estado === 'actual' && <Sparkles size={12} />}
                    </div>
                    <div className="text-[10px] uppercase tracking-wide text-slate-500">
                      {h.fecha}
                    </div>
                    <div
                      className={cn(
                        'mt-0.5 text-sm font-semibold',
                        h.estado === 'actual' ? 'text-status-warn-fg' : 'text-slate-900',
                      )}
                    >
                      {h.titulo}
                    </div>
                    <div className="mt-0.5 text-xs text-slate-600">
                      {h.detalle}
                      {h.porQuien && (
                        <span className="ml-1 text-slate-400">· por {h.porQuien}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section>
        <h2 className="mb-3 flex items-center gap-2 text-base font-bold text-slate-900">
          <Gavel size={18} className="text-slate-700" /> Órdenes de jefatura
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {ordenes.map((o) => (
            <div key={o.numero} className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex items-start gap-3">
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-slate-900 text-white">
                  <ScrollText size={18} />
                </div>
                <div className="flex-1">
                  <div className="font-mono text-xs text-slate-500">Orden N° {o.numero}</div>
                  <div className="font-semibold text-slate-900">{o.titulo}</div>
                  <div className="mt-1 text-xs text-slate-500">
                    {o.firma} · {o.fecha}
                  </div>
                </div>
                <ChevronRight size={16} className="text-slate-400" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
