'use client';

import { motion } from 'framer-motion';
import {
  Activity,
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Eye,
  Heart,
  Stethoscope,
  TrendingUp,
  XCircle,
} from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';

import { Avatar, Badge, Button, Card, CardContent, Kpi, cn, useToast } from '@faro/ui';

import { PageHero } from '../../../../components/shared/page-hero';
import { useFaroStore } from '../../../../store/use-faro-store';

interface AptitudMedica {
  personaId: string;
  ultimoExamen: string;
  vencimiento: string;
  estado: 'vigente' | 'por_vencer' | 'vencida' | 'sin_examen';
  vo2max?: number;
  presion?: string;
  audiometria?: string;
  cardiologica?: 'apto' | 'observado' | 'no_apto';
  oftalmologica?: 'apto' | 'observado' | 'no_apto';
  pulmonar?: 'apto' | 'observado' | 'no_apto';
  observaciones?: string;
}

const APTITUDES_MOCK: Record<string, AptitudMedica> = {
  'persona-001': {
    personaId: 'persona-001',
    ultimoExamen: '2026-02-15',
    vencimiento: '2027-02-15',
    estado: 'vigente',
    vo2max: 48,
    presion: '128/82',
    audiometria: 'normal',
    cardiologica: 'apto',
    oftalmologica: 'apto',
    pulmonar: 'apto',
  },
  'persona-002': {
    personaId: 'persona-002',
    ultimoExamen: '2026-04-22',
    vencimiento: '2027-04-22',
    estado: 'vigente',
    vo2max: 52,
    presion: '118/75',
    audiometria: 'normal',
    cardiologica: 'apto',
    oftalmologica: 'apto',
    pulmonar: 'apto',
  },
  'persona-005': {
    personaId: 'persona-005',
    ultimoExamen: '2025-07-10',
    vencimiento: '2026-07-10',
    estado: 'por_vencer',
    vo2max: 44,
    presion: '135/88',
    audiometria: 'levedeficit_agudos',
    cardiologica: 'observado',
    oftalmologica: 'apto',
    pulmonar: 'apto',
    observaciones: 'Control cardiológico recomendado en 6 meses por leve sobrepeso.',
  },
  'persona-007': {
    personaId: 'persona-007',
    ultimoExamen: '2024-12-01',
    vencimiento: '2025-12-01',
    estado: 'vencida',
    vo2max: 41,
    cardiologica: 'apto',
    oftalmologica: 'apto',
    pulmonar: 'apto',
    observaciones: 'Trámite vencido hace 5 meses. SUSPENDER de operativos.',
  },
};

const ESTADO_CONFIG = {
  vigente: {
    label: 'Vigente',
    color: 'bg-status-ok',
    bg: 'bg-status-ok-bg/30',
    icon: <CheckCircle2 size={14} />,
  },
  por_vencer: {
    label: 'Por vencer',
    color: 'bg-status-warn',
    bg: 'bg-status-warn-bg/30',
    icon: <AlertTriangle size={14} />,
  },
  vencida: {
    label: 'Vencida',
    color: 'bg-status-risk',
    bg: 'bg-status-risk-bg/30',
    icon: <XCircle size={14} />,
  },
  sin_examen: {
    label: 'Sin examen',
    color: 'bg-slate-400',
    bg: 'bg-slate-100',
    icon: <AlertTriangle size={14} />,
  },
};

function diasHasta(fecha: string) {
  const hoy = new Date('2026-05-24');
  const f = new Date(fecha);
  return Math.round((f.getTime() - hoy.getTime()) / 86400000);
}

function getAptitud(personaId: string): AptitudMedica {
  if (APTITUDES_MOCK[personaId]) return APTITUDES_MOCK[personaId]!;
  // Generar mock determinístico
  const seed = personaId.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const r = seed % 100;
  const estado: AptitudMedica['estado'] =
    r < 60 ? 'vigente' : r < 75 ? 'por_vencer' : r < 88 ? 'vencida' : 'sin_examen';
  return {
    personaId,
    ultimoExamen: '2025-06-15',
    vencimiento: '2026-06-15',
    estado,
    vo2max: 42 + (r % 12),
    presion: '125/80',
    cardiologica: 'apto',
    oftalmologica: 'apto',
    pulmonar: 'apto',
  };
}

export default function AptitudMedicaPage() {
  const toast = useToast();
  const personas = useFaroStore((s) => s.personas);
  const activas = personas.filter((p) => p.estado === 'activo');
  const [filtro, setFiltro] = useState<'todos' | AptitudMedica['estado']>('todos');

  const aptitudes = useMemo(
    () =>
      activas
        .map((p) => ({ persona: p, aptitud: getAptitud(p.id) }))
        .sort((a, b) => {
          const orden = { vencida: 0, por_vencer: 1, sin_examen: 2, vigente: 3 } as const;
          return orden[a.aptitud.estado] - orden[b.aptitud.estado];
        }),
    [activas],
  );

  const conteo = {
    vigente: aptitudes.filter((a) => a.aptitud.estado === 'vigente').length,
    por_vencer: aptitudes.filter((a) => a.aptitud.estado === 'por_vencer').length,
    vencida: aptitudes.filter((a) => a.aptitud.estado === 'vencida').length,
    sin_examen: aptitudes.filter((a) => a.aptitud.estado === 'sin_examen').length,
  };

  const filtradas =
    filtro === 'todos' ? aptitudes : aptitudes.filter((a) => a.aptitud.estado === filtro);

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <PageHero
        objetivo="Administrativo · Salud"
        titulo="Aptitud médica anual"
        descripcion="Examen anual obligatorio · capacidad física, electrocardiograma, audiometría, oftalmología, laboratorio, screening cáncer. Sin aptitud vigente, las horas no suman al subsidio."
        icono={<Stethoscope size={26} />}
        meta={
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Kpi label="Vigentes" value={conteo.vigente} hint="aptos" intent="ok" />
            <Kpi
              label="Por vencer"
              value={conteo.por_vencer}
              hint="<60 días"
              intent={conteo.por_vencer > 0 ? 'warn' : 'neutral'}
            />
            <Kpi
              label="Vencidas"
              value={conteo.vencida}
              hint="suspender"
              intent={conteo.vencida > 0 ? 'risk' : 'ok'}
            />
            <Kpi
              label="Sin examen"
              value={conteo.sin_examen}
              hint="alta pendiente"
              intent={conteo.sin_examen > 0 ? 'warn' : 'ok'}
            />
          </div>
        }
      />

      {/* Filtros */}
      <Card>
        <CardContent className="flex flex-wrap items-center gap-2 p-3">
          {(['todos', 'vencida', 'por_vencer', 'sin_examen', 'vigente'] as const).map((f) => {
            const isAll = f === 'todos';
            const cfg = isAll ? null : ESTADO_CONFIG[f];
            const count = isAll
              ? aptitudes.length
              : aptitudes.filter((a) => a.aptitud.estado === f).length;
            return (
              <button
                key={f}
                type="button"
                onClick={() => setFiltro(f)}
                className={cn(
                  'inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-xs font-medium transition-colors',
                  filtro === f
                    ? 'bg-brand-600 text-white'
                    : 'bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50',
                )}
              >
                {cfg?.icon}
                {isAll ? 'Todos' : cfg!.label}
                <span
                  className={cn(
                    'rounded-full px-1.5 py-0.5 text-[10px] tabular-nums',
                    filtro === f ? 'bg-white/20' : 'bg-slate-100',
                  )}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </CardContent>
      </Card>

      {/* Cards */}
      <div className="grid gap-3 lg:grid-cols-2">
        {filtradas.map(({ persona, aptitud }, idx) => {
          const cfg = ESTADO_CONFIG[aptitud.estado];
          const dias = diasHasta(aptitud.vencimiento);
          return (
            <motion.div
              key={persona.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.03 }}
            >
              <Card
                className={cn(
                  'overflow-hidden border-2',
                  `border-${aptitud.estado === 'vencida' ? 'status-risk' : aptitud.estado === 'por_vencer' ? 'status-warn' : 'slate-200'}/30`,
                )}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Avatar
                      name={`${persona.nombre} ${persona.apellido}`}
                      src={persona.fotoUrl}
                      size={48}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/administrativo/personas/${persona.id}` as never}
                          className="hover:text-brand-700 font-semibold text-slate-900"
                        >
                          {persona.apellido}, {persona.nombre}
                        </Link>
                        <Badge
                          intent={
                            aptitud.estado === 'vigente'
                              ? 'ok'
                              : aptitud.estado === 'por_vencer'
                                ? 'warn'
                                : 'risk'
                          }
                        >
                          {cfg.icon} {cfg.label}
                        </Badge>
                      </div>
                      <div className="mt-0.5 font-mono text-[11px] text-slate-500">
                        legajo {persona.legajo}
                      </div>

                      <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                        <div className={cn('rounded-md p-2', cfg.bg)}>
                          <div className="text-slate-500">Último examen</div>
                          <div className="font-bold text-slate-900">
                            {new Date(aptitud.ultimoExamen).toLocaleDateString('es-AR')}
                          </div>
                        </div>
                        <div className={cn('rounded-md p-2', cfg.bg)}>
                          <div className="text-slate-500">Vence</div>
                          <div
                            className={cn(
                              'font-bold',
                              dias < 0
                                ? 'text-status-risk-fg'
                                : dias < 60
                                  ? 'text-status-warn-fg'
                                  : 'text-slate-900',
                            )}
                          >
                            {dias < 0 ? `hace ${Math.abs(dias)}d` : `en ${dias}d`}
                          </div>
                        </div>
                      </div>

                      {/* Detalle expandido */}
                      <div className="mt-3 space-y-1.5 border-t border-slate-100 pt-3 text-xs">
                        {aptitud.vo2max !== undefined && (
                          <div className="flex items-center justify-between">
                            <span className="text-slate-600">
                              <Activity size={11} className="mr-1 inline" />
                              Capacidad física
                            </span>
                            <span
                              className={cn(
                                'font-bold tabular-nums',
                                aptitud.vo2max >= 42 ? 'text-status-ok-fg' : 'text-status-warn-fg',
                              )}
                            >
                              {aptitud.vo2max} ml/kg/min
                            </span>
                          </div>
                        )}
                        {aptitud.presion && (
                          <div className="flex items-center justify-between">
                            <span className="text-slate-600">
                              <Heart size={11} className="mr-1 inline" />
                              Presión
                            </span>
                            <span className="font-bold tabular-nums text-slate-900">
                              {aptitud.presion} mmHg
                            </span>
                          </div>
                        )}
                        {aptitud.audiometria && (
                          <div className="flex items-center justify-between">
                            <span className="text-slate-600">
                              <Eye size={11} className="mr-1 inline" />
                              Audiometría
                            </span>
                            <span className="capitalize text-slate-900">
                              {aptitud.audiometria.replace('_', ' ')}
                            </span>
                          </div>
                        )}
                        {aptitud.observaciones && (
                          <div className="bg-status-warn-bg/40 text-status-warn-fg mt-2 rounded p-2">
                            <strong>Obs:</strong> {aptitud.observaciones}
                          </div>
                        )}
                      </div>

                      {aptitud.estado !== 'vigente' && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          <Button
                            intent="primary"
                            size="sm"
                            onClick={() =>
                              toast.push({
                                kind: 'success',
                                title: `Turno solicitado para ${persona.nombre}`,
                                description: 'Notificado a la persona vía WhatsApp + email',
                              })
                            }
                          >
                            <Calendar size={12} /> Agendar turno
                          </Button>
                          {aptitud.estado === 'vencida' && (
                            <Badge intent="risk">Suspendida · las horas no suman</Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Detalle del examen anual */}
      <Card className="bg-brand-50/40 border-brand-100">
        <CardContent className="flex items-start gap-3 p-4">
          <div className="bg-brand-600 grid h-10 w-10 shrink-0 place-items-center rounded-xl text-white">
            <TrendingUp size={18} />
          </div>
          <div className="flex-1 text-sm">
            <div className="text-brand-900 font-semibold">Examen anual obligatorio</div>
            <p className="text-brand-900/80 mt-0.5">
              Incluye: examen físico completo, laboratorio (hemograma, lípidos, glucemia), capacidad
              física (cinta o bicicleta), electrocardiograma de esfuerzo, audiometría, oftalmología,
              espirometría, screening cáncer de piel/tiroides/colon (según edad), salud mental. Sin
              esto, las horas operativas no suman al subsidio.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
