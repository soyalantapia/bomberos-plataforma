'use client';

import { Activity, Award, BarChart3, Flame, GraduationCap, TrendingUp, Users } from 'lucide-react';
import { useState } from 'react';

import { Badge, Card, CardContent, Kpi, cn } from '@faro/ui';

import { PageHero } from '../../../../components/shared/page-hero';
import { useFaroStore } from '../../../../store/use-faro-store';

const personalPorCuartel = [
  { cuartel: 'Villa Ballester', activos: 18, cadetes: 4, lic: 1 },
  { cuartel: 'San Martín', activos: 64, cadetes: 8, lic: 3 },
  { cuartel: 'San Isidro', activos: 52, cadetes: 7, lic: 2 },
  { cuartel: 'Tigre', activos: 102, cadetes: 9, lic: 4 },
];

const serviciosPorTipo = [
  { tipo: 'Incendio estructural', cantidad: 14, color: 'bg-status-risk' },
  { tipo: 'Rescate', cantidad: 11, color: 'bg-status-warn' },
  { tipo: 'Accidente', cantidad: 9, color: 'bg-slate-500' },
  { tipo: 'Forestal', cantidad: 5, color: 'bg-status-ok' },
  { tipo: 'Otros', cantidad: 3, color: 'bg-slate-300' },
];

const tendencia = [32, 28, 35, 30, 38, 42];
const tendenciaLabels = ['Dic', 'Ene', 'Feb', 'Mar', 'Abr', 'May'];

const capacitacion = [
  { curso: 'Rescate vehicular avanzado', inscriptos: 38, cupos: 48 },
  { curso: 'Manejo víctimas múltiples', inscriptos: 42, cupos: 60 },
  { curso: 'Incendios estructurales II', inscriptos: 22, cupos: 36 },
  { curso: 'Primeros auxilios', inscriptos: 22, cupos: 30 },
];

export default function ConsolidadosFed() {
  const cuarteles = useFaroStore((s) => s.cuarteles);
  const [vista, setVista] = useState<'personal' | 'serv' | 'cap'>('personal');

  const totalPersonal = personalPorCuartel.reduce((a, c) => a + c.activos, 0);
  const totalCadetes = personalPorCuartel.reduce((a, c) => a + c.cadetes, 0);
  const totalServicios = serviciosPorTipo.reduce((a, t) => a + t.cantidad, 0);
  const maxServicios = Math.max(...serviciosPorTipo.map((t) => t.cantidad));
  const maxPersonal = Math.max(...personalPorCuartel.map((c) => c.activos + c.cadetes + c.lic));
  const maxTend = Math.max(...tendencia);

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <PageHero
        objetivo="Federación · Consolidados"
        titulo="Norte GBA en números"
        descripcion="Lo que en GIB hay que armar manualmente cuartel por cuartel, acá ya está sumado en gráficos comparativos."
        icono={<BarChart3 size={26} />}
        meta={
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Kpi label="Cuarteles" value={cuarteles.length} hint="región" intent="brand" />
            <Kpi
              label="Personal"
              value={totalPersonal}
              hint="activos"
              intent="ok"
              icon={<Users size={16} />}
            />
            <Kpi
              label="Servicios mes"
              value={totalServicios}
              hint="mayo 2026"
              icon={<Activity size={16} />}
            />
            <Kpi
              label="Capacitaciones"
              value={capacitacion.length}
              hint="en marcha"
              intent="brand"
              icon={<GraduationCap size={16} />}
            />
          </div>
        }
      />

      <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1">
        {[
          { v: 'personal' as const, l: 'Personal por cuartel', icon: <Users size={14} /> },
          { v: 'serv' as const, l: 'Servicios por tipo', icon: <Flame size={14} /> },
          { v: 'cap' as const, l: 'Capacitación', icon: <Award size={14} /> },
        ].map((t) => {
          const active = vista === t.v;
          return (
            <button
              key={t.v}
              type="button"
              onClick={() => setVista(t.v)}
              className={cn(
                'inline-flex shrink-0 items-center gap-2 rounded-full px-3.5 py-2 text-sm font-medium transition-colors',
                active
                  ? 'bg-brand-600 text-white'
                  : 'bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50',
              )}
            >
              {t.icon} {t.l}
            </button>
          );
        })}
      </div>

      {vista === 'personal' && (
        <div className="grid gap-5 lg:grid-cols-2">
          <Card>
            <CardContent className="p-5">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-bold text-slate-900">Personal por cuartel</h3>
                <Badge intent="brand">{totalPersonal + totalCadetes} personas</Badge>
              </div>
              <div className="space-y-3">
                {personalPorCuartel.map((c) => {
                  const total = c.activos + c.cadetes + c.lic;
                  const pct = (total / maxPersonal) * 100;
                  return (
                    <div key={c.cuartel}>
                      <div className="mb-1 flex items-baseline justify-between text-sm">
                        <span className="font-medium text-slate-900">{c.cuartel}</span>
                        <span className="tabular-nums text-slate-600">{total}</span>
                      </div>
                      <div
                        className="flex h-7 overflow-hidden rounded-md bg-slate-100"
                        style={{ width: `${pct}%` }}
                      >
                        <div
                          className="bg-status-ok"
                          style={{ width: `${(c.activos / total) * 100}%` }}
                          title={`${c.activos} activos`}
                        />
                        <div
                          className="bg-brand-600"
                          style={{ width: `${(c.cadetes / total) * 100}%` }}
                          title={`${c.cadetes} cadetes`}
                        />
                        <div
                          className="bg-status-warn"
                          style={{ width: `${(c.lic / total) * 100}%` }}
                          title={`${c.lic} en licencia`}
                        />
                      </div>
                      <div className="mt-1 flex gap-3 text-[10px] text-slate-500">
                        <span>● Activos {c.activos}</span>
                        <span>● Cadetes {c.cadetes}</span>
                        <span>● Licencia {c.lic}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 flex items-center gap-3 border-t border-slate-100 pt-3 text-[11px]">
                <span className="inline-flex items-center gap-1">
                  <span className="bg-status-ok h-2 w-2 rounded-sm" /> Activos
                </span>
                <span className="inline-flex items-center gap-1">
                  <span className="bg-brand-600 h-2 w-2 rounded-sm" /> Cadetes
                </span>
                <span className="inline-flex items-center gap-1">
                  <span className="bg-status-warn h-2 w-2 rounded-sm" /> Licencia
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <h3 className="mb-3 font-bold text-slate-900">Composición regional</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-status-ok-bg/40 rounded-xl p-4">
                  <Users size={20} className="text-status-ok" />
                  <div className="mt-2 text-3xl font-bold tabular-nums text-slate-900">
                    {totalPersonal}
                  </div>
                  <div className="text-xs text-slate-600">activos</div>
                </div>
                <div className="bg-brand-50 rounded-xl p-4">
                  <GraduationCap size={20} className="text-brand-600" />
                  <div className="mt-2 text-3xl font-bold tabular-nums text-slate-900">
                    {totalCadetes}
                  </div>
                  <div className="text-xs text-slate-600">cadetes</div>
                </div>
                <div className="bg-status-warn-bg/40 rounded-xl p-4">
                  <div className="text-status-warn-fg text-xl">⚕</div>
                  <div className="mt-2 text-3xl font-bold tabular-nums text-slate-900">10</div>
                  <div className="text-xs text-slate-600">en licencia</div>
                </div>
                <div className="rounded-xl bg-slate-50 p-4">
                  <Award size={20} className="text-slate-700" />
                  <div className="mt-2 text-3xl font-bold tabular-nums text-slate-900">38%</div>
                  <div className="text-xs text-slate-600">mujeres en mando</div>
                </div>
              </div>
              <p className="mt-3 text-xs text-slate-600">
                Datos al cierre de mayo. <strong>Tigre</strong> concentra el mayor cuerpo activo;{' '}
                <strong>Villa Ballester</strong> tiene la tasa más alta de cadetes.
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {vista === 'serv' && (
        <div className="grid gap-5 lg:grid-cols-2">
          <Card>
            <CardContent className="p-5">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-bold text-slate-900">Servicios mes por tipo</h3>
                <Badge intent="brand">+18% vs 2025</Badge>
              </div>
              <div className="space-y-2.5">
                {serviciosPorTipo.map((t) => {
                  const pct = (t.cantidad / maxServicios) * 100;
                  return (
                    <div key={t.tipo}>
                      <div className="mb-1 flex items-baseline justify-between text-sm">
                        <span className="font-medium text-slate-900">{t.tipo}</span>
                        <span className="tabular-nums text-slate-700">{t.cantidad}</span>
                      </div>
                      <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className={cn('h-full transition-all', t.color)}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-bold text-slate-900">Tendencia · últimos 6 meses</h3>
                <TrendingUp size={16} className="text-status-ok" />
              </div>
              <div className="flex h-32 items-end justify-between gap-2">
                {tendencia.map((v, idx) => {
                  const h = (v / maxTend) * 100;
                  const isCurrent = idx === tendencia.length - 1;
                  return (
                    <div key={idx} className="flex flex-1 flex-col items-center justify-end gap-2">
                      <div className="relative w-full">
                        <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] font-bold tabular-nums text-slate-700">
                          {v}
                        </div>
                        <div
                          className={cn(
                            'w-full rounded-t-md transition-all',
                            isCurrent ? 'bg-brand-600' : 'bg-slate-300',
                          )}
                          style={{ height: `${h}%`, minHeight: '8px' }}
                        />
                      </div>
                      <span
                        className={cn(
                          'text-[10px]',
                          isCurrent ? 'text-brand-700 font-bold' : 'text-slate-500',
                        )}
                      >
                        {tendenciaLabels[idx]}
                      </span>
                    </div>
                  );
                })}
              </div>
              <p className="mt-4 text-xs text-slate-600">
                Pico de mayo: 42 servicios. Tendencia ascendente desde febrero — coordinar refuerzo
                operativo regional para junio.
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {vista === 'cap' && (
        <div className="grid gap-5 lg:grid-cols-2">
          <Card className="lg:col-span-2">
            <CardContent className="p-5">
              <h3 className="mb-3 font-bold text-slate-900">
                Cursos en marcha · ocupación de cupos
              </h3>
              <div className="space-y-4">
                {capacitacion.map((c) => {
                  const pct = (c.inscriptos / c.cupos) * 100;
                  const intent = pct >= 80 ? 'status-warn' : pct >= 50 ? 'status-ok' : 'brand-600';
                  return (
                    <div key={c.curso}>
                      <div className="mb-1 flex items-baseline justify-between text-sm">
                        <span className="font-medium text-slate-900">{c.curso}</span>
                        <span className="tabular-nums text-slate-700">
                          {c.inscriptos} / {c.cupos}{' '}
                          <Badge intent={pct >= 80 ? 'warn' : 'brand'}>{Math.round(pct)}%</Badge>
                        </span>
                      </div>
                      <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                        <div className={cn('bg- h-full' + intent)} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-5 grid grid-cols-3 gap-3">
                <div className="bg-brand-50 rounded-xl p-3 text-center">
                  <div className="text-brand-700 text-2xl font-bold">8</div>
                  <div className="text-[10px] uppercase tracking-wide text-slate-600">
                    cursos activos
                  </div>
                </div>
                <div className="bg-status-ok-bg/40 rounded-xl p-3 text-center">
                  <div className="text-status-ok-fg text-2xl font-bold">124</div>
                  <div className="text-[10px] uppercase tracking-wide text-slate-600">
                    inscriptos
                  </div>
                </div>
                <div className="bg-status-warn-bg/40 rounded-xl p-3 text-center">
                  <div className="text-status-warn-fg text-2xl font-bold">32</div>
                  <div className="text-[10px] uppercase tracking-wide text-slate-600">
                    certificados mes
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
