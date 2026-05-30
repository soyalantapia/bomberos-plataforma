'use client';

import {
  AlertTriangle,
  Award,
  Check,
  Download,
  Flame,
  GraduationCap,
  LifeBuoy,
  MountainSnow,
  Sparkles,
  Truck,
  Waves,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';

import { Badge, Button, Card, CardContent, Kpi, cn, useToast } from '@faro/ui';

import { PageHero } from '../../../../../components/shared/page-hero';
import { useFaroStore } from '../../../../../store/use-faro-store';

type EstadoCert = 'vigente' | 'por_vencer' | 'vencido' | 'sin_cursar';

interface Especialidad {
  id: string;
  label: string;
  icon: React.ReactNode;
  cursoOficial: string;
}

const ESPECIALIDADES: Especialidad[] = [
  {
    id: 'rescate_veh',
    label: 'Rescate vehicular',
    icon: <Truck size={14} />,
    cursoOficial: 'Curso oficial · 80 hs',
  },
  {
    id: 'forestal',
    label: 'Combate forestal',
    icon: <Flame size={14} />,
    cursoOficial: 'Curso oficial · 120 hs',
  },
  {
    id: 'hazmat',
    label: 'Materiales peligrosos',
    icon: <AlertTriangle size={14} />,
    cursoOficial: 'Curso oficial · 160 hs',
  },
  {
    id: 'usar',
    label: 'Búsqueda y rescate urbano',
    icon: <MountainSnow size={14} />,
    cursoOficial: 'Curso oficial · 200 hs',
  },
  {
    id: 'acuatico',
    label: 'Rescate acuático',
    icon: <Waves size={14} />,
    cursoOficial: 'Curso oficial · 60 hs',
  },
  {
    id: 'vertical',
    label: 'Rescate vertical',
    icon: <LifeBuoy size={14} />,
    cursoOficial: 'Curso oficial · 40 hs',
  },
  {
    id: 'epp_era',
    label: 'Equipos de protección y respiración',
    icon: <Award size={14} />,
    cursoOficial: 'Obligatorio',
  },
  {
    id: 'cem',
    label: 'Manejo de emergencias',
    icon: <GraduationCap size={14} />,
    cursoOficial: 'Curso oficial · 40 hs',
  },
];

// Generamos un mock determinístico de estados por persona+especialidad
function getEstado(personaId: string, espId: string): EstadoCert {
  const seed = (personaId + espId).split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const r = seed % 100;
  if (r < 50) return 'vigente';
  if (r < 65) return 'por_vencer';
  if (r < 78) return 'vencido';
  return 'sin_cursar';
}

const ESTADO_CONFIG: Record<EstadoCert, { color: string; label: string; icon: React.ReactNode }> = {
  vigente: { color: 'bg-status-ok text-white', label: 'Vigente', icon: <Check size={10} /> },
  por_vencer: {
    color: 'bg-status-warn text-white',
    label: 'Por vencer',
    icon: <AlertTriangle size={10} />,
  },
  vencido: { color: 'bg-status-risk text-white', label: 'Vencido', icon: <X size={10} /> },
  sin_cursar: { color: 'bg-slate-200 text-slate-500', label: '—', icon: null },
};

export default function SkillsMatrixPage() {
  const toast = useToast();
  const personas = useFaroStore((s) => s.personas);
  const activas = personas.filter((p) => p.estado === 'activo');

  const [filtroEsp, setFiltroEsp] = useState<string | 'todas'>('todas');
  const [soloGaps, setSoloGaps] = useState(false);

  const matrix = useMemo(() => {
    return activas
      .map((p) => ({
        persona: p,
        estados: Object.fromEntries(
          ESPECIALIDADES.map((esp) => [esp.id, getEstado(p.id, esp.id)]),
        ) as Record<string, EstadoCert>,
      }))
      .filter((row) => {
        if (filtroEsp !== 'todas') {
          if (row.estados[filtroEsp] !== 'vigente' && row.estados[filtroEsp] !== 'por_vencer')
            return soloGaps;
          return !soloGaps;
        }
        if (soloGaps) {
          return Object.values(row.estados).some(
            (e) => e === 'vencido' || e === 'sin_cursar' || e === 'por_vencer',
          );
        }
        return true;
      });
  }, [activas, filtroEsp, soloGaps]);

  const totales = ESPECIALIDADES.map((esp) => {
    const vigentes = activas.filter((p) => getEstado(p.id, esp.id) === 'vigente').length;
    const total = activas.length;
    return {
      esp,
      vigentes,
      total,
      porcentaje: Math.round((vigentes / total) * 100),
    };
  });

  const gaps = totales.filter((t) => t.porcentaje < 50).length;

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <PageHero
        objetivo="Vista Mando · Cursos y especialidades"
        titulo="¿Quién tiene qué curso?"
        descripcion="Para cada bombero, qué especialidades tiene certificadas y cuáles le faltan. Te avisa si la cobertura para un tipo de operativo está floja."
        icono={<Sparkles size={26} />}
        meta={
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Kpi label="Personas activas" value={activas.length} intent="brand" />
            <Kpi label="Especialidades" value={ESPECIALIDADES.length} intent="neutral" />
            <Kpi
              label="Gaps críticos"
              value={gaps}
              hint="cobertura <50%"
              intent={gaps > 0 ? 'risk' : 'ok'}
            />
            <Kpi label="Mejor cubierta" value="Equipos" hint="98%" intent="ok" />
          </div>
        }
        acciones={
          <Button
            intent="secondary"
            onClick={() => toast.push({ kind: 'info', title: 'Exportando Excel...' })}
          >
            <Download size={14} /> Exportar
          </Button>
        }
      />

      {/* Resumen por especialidad */}
      <Card>
        <CardContent className="p-0">
          <div className="border-b border-slate-100 px-5 py-3">
            <h3 className="font-bold text-slate-900">Cobertura por especialidad</h3>
          </div>
          <div className="grid gap-2 p-4 sm:grid-cols-2 lg:grid-cols-4">
            {totales.map((t) => {
              const critico = t.porcentaje < 50;
              const bajo = t.porcentaje < 70;
              return (
                <button
                  key={t.esp.id}
                  type="button"
                  onClick={() => setFiltroEsp(filtroEsp === t.esp.id ? 'todas' : t.esp.id)}
                  className={cn(
                    'rounded-lg border p-3 text-left transition-colors',
                    filtroEsp === t.esp.id
                      ? 'border-brand-400 bg-brand-50'
                      : 'border-slate-200 hover:border-slate-300',
                  )}
                >
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                    {t.esp.icon}
                    <span className="truncate">{t.esp.label}</span>
                  </div>
                  <div className="mt-1.5 flex items-baseline justify-between">
                    <span className="text-2xl font-bold text-slate-900">{t.porcentaje}%</span>
                    <span className="text-xs text-slate-500">
                      {t.vigentes}/{t.total}
                    </span>
                  </div>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all',
                        critico ? 'bg-status-risk' : bajo ? 'bg-status-warn' : 'bg-status-ok',
                      )}
                      style={{ width: `${t.porcentaje}%` }}
                    />
                  </div>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Filtros */}
      <Card>
        <CardContent className="flex flex-wrap items-center gap-3 p-3">
          <Button
            intent={filtroEsp === 'todas' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setFiltroEsp('todas')}
          >
            Todas las especialidades
          </Button>
          <label className="inline-flex cursor-pointer items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={soloGaps}
              onChange={(e) => setSoloGaps(e.target.checked)}
              className="h-4 w-4"
            />
            <span className="text-slate-700">Solo personas con cursos faltantes</span>
          </label>
          {filtroEsp !== 'todas' && (
            <Badge intent="brand">{ESPECIALIDADES.find((e) => e.id === filtroEsp)?.label}</Badge>
          )}
          <span className="ml-auto text-xs text-slate-500">{matrix.length} personas</span>
        </CardContent>
      </Card>

      {/* Matriz */}
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          {/* Mobile: card por persona con chips de especialidades cursadas */}
          <ul className="divide-y divide-slate-100 md:hidden">
            {matrix.map((row) => {
              const cursadas = ESPECIALIDADES.filter((esp) => row.estados[esp.id] !== 'sin_cursar');
              return (
                <li key={row.persona.id} className="p-3.5">
                  <Link
                    href={`/administrativo/personas/${row.persona.id}` as never}
                    className="block"
                  >
                    <div className="text-sm font-medium text-slate-900">
                      {row.persona.apellido}, {row.persona.nombre}
                    </div>
                    <div className="font-mono text-[10px] text-slate-500">
                      legajo {row.persona.legajo}
                    </div>
                  </Link>
                  {cursadas.length === 0 ? (
                    <div className="mt-2 text-xs italic text-slate-500">
                      Sin especialidades cursadas
                    </div>
                  ) : (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {cursadas.map((esp) => {
                        const cfg = ESTADO_CONFIG[row.estados[esp.id]!];
                        return (
                          <span
                            key={esp.id}
                            className={cn(
                              'inline-flex items-center gap-1 rounded-md px-1.5 py-1 text-[11px] font-medium',
                              cfg.color,
                            )}
                          >
                            {esp.icon}
                            <span className="leading-none">{esp.label}</span>
                          </span>
                        );
                      })}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>

          {/* Desktop/tablet: matriz completa con scroll horizontal */}
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[800px] text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="sticky left-0 z-10 bg-slate-50 px-4 py-3 text-left font-semibold text-slate-700">
                    Persona
                  </th>
                  {ESPECIALIDADES.map((esp) => (
                    <th
                      key={esp.id}
                      className="px-2 py-3 text-center text-[10px] font-semibold uppercase text-slate-600"
                    >
                      <div className="mx-auto inline-flex flex-col items-center gap-0.5">
                        {esp.icon}
                        <span className="block max-w-[80px] leading-tight">{esp.label}</span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {matrix.map((row) => (
                  <tr key={row.persona.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="sticky left-0 z-10 bg-white px-4 py-2.5">
                      <Link
                        href={`/administrativo/personas/${row.persona.id}` as never}
                        className="block"
                      >
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-slate-900">
                            {row.persona.apellido}, {row.persona.nombre}
                          </span>
                          <span className="font-mono text-[10px] text-slate-500">
                            legajo {row.persona.legajo}
                          </span>
                        </div>
                      </Link>
                    </td>
                    {ESPECIALIDADES.map((esp) => {
                      const estado = row.estados[esp.id]!;
                      const cfg = ESTADO_CONFIG[estado];
                      return (
                        <td key={esp.id} className="px-2 py-2.5 text-center">
                          <span
                            className={cn(
                              'inline-flex h-6 min-w-6 items-center justify-center gap-0.5 rounded px-1.5 text-[10px] font-bold',
                              cfg.color,
                            )}
                            title={`${esp.label}: ${cfg.label}`}
                          >
                            {cfg.icon}
                            {estado !== 'sin_cursar' && cfg.label}
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Recomendaciones IA */}
      <Card className="bg-brand-50/40 border-brand-100">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="bg-brand-600 grid h-10 w-10 shrink-0 place-items-center rounded-xl text-white">
              <Sparkles size={18} />
            </div>
            <div className="flex-1">
              <div className="text-brand-900 font-semibold">Recomendaciones IA</div>
              <ul className="text-brand-900/80 mt-1 list-disc space-y-1 pl-5 text-sm">
                <li>
                  <strong>Búsqueda y rescate urbano está al 28% de cobertura.</strong> Conviene
                  inscribir 6 voluntarios al próximo curso (18/06).
                </li>
                <li>
                  <strong>
                    3 personas tienen Rescate vehicular por vencer en menos de 60 días.
                  </strong>{' '}
                  Conviene cursar el reciclaje en grupo.
                </li>
                <li>
                  <strong>Diversidad de género:</strong> aún ninguna mujer está certificada en
                  Materiales peligrosos. Considerar invitarlas al próximo curso.
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
