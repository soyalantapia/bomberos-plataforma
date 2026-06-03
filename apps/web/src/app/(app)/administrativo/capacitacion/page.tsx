'use client';

import {
  Award,
  Building2,
  Calendar,
  ChevronRight,
  GraduationCap,
  Layers,
  ScrollText,
  Sparkles,
  Users2,
} from 'lucide-react';
import { useState } from 'react';

import { Badge, Card, CardContent, Kpi, cn, useToast } from '@faro/ui';

import { NuevoCursoDialog } from '../../../../components/capacitacion/nuevo-curso-dialog';
import { PageHero } from '../../../../components/shared/page-hero';

interface Curso {
  nombre: string;
  centro: string;
  inicio: string;
  inscriptos: number;
  cupos: number;
  categoria: 'rescate' | 'incendio' | 'admin';
}

const cursos: Curso[] = [
  {
    nombre: 'Rescate vehicular avanzado',
    centro: 'Escuela Federación',
    inicio: '12 jun',
    inscriptos: 12,
    cupos: 16,
    categoria: 'rescate',
  },
  {
    nombre: 'Manejo víctimas múltiples',
    centro: 'Centro de práctica Norte',
    inicio: '20 jun',
    inscriptos: 14,
    cupos: 24,
    categoria: 'rescate',
  },
  {
    nombre: 'Incendios estructurales II',
    centro: 'Centro de práctica Norte',
    inicio: '5 jul',
    inscriptos: 5,
    cupos: 18,
    categoria: 'incendio',
  },
];

const cepros = [
  {
    nombre: 'Centro de práctica Norte GBA',
    ciudad: 'San Martín',
    capacidad: 32,
    ocupacion: 24,
    instructores: 4,
  },
  {
    nombre: 'Centro de práctica Tigre',
    ciudad: 'Tigre',
    capacidad: 24,
    ocupacion: 12,
    instructores: 3,
  },
];

const categorias = [
  {
    nombre: 'Operativos · rescate',
    cursos: 4,
    color: 'bg-status-warn',
    requiere: 'Bombero 1ra o superior',
  },
  {
    nombre: 'Operativos · incendio',
    cursos: 3,
    color: 'bg-status-risk',
    requiere: 'Todos los rangos',
  },
  { nombre: 'Administrativos', cursos: 2, color: 'bg-brand-600', requiere: 'Padrón y gestión' },
];

const folios = [
  { numero: '2026/04', certificados: 8, fecha: '8 may', firma: 'P. Morales (Federación)' },
  { numero: '2026/03', certificados: 12, fecha: '8 mar', firma: 'P. Morales (Federación)' },
];

const CAT_COLOR: Record<Curso['categoria'], string> = {
  rescate: 'bg-status-warn',
  incendio: 'bg-status-risk',
  admin: 'bg-brand-600',
};

export default function CapacitacionGestion() {
  const toast = useToast();
  const [nuevoCursoOpen, setNuevoCursoOpen] = useState(false);

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <PageHero
        objetivo="Administrativo · Capacitación"
        titulo="31 inscriptos en 3 cursos · 2 folios este trimestre"
        descripcion="Catálogo de cursos abiertos, centros de práctica, categorías y folios de acreditación que firman desde Federación."
        icono={<GraduationCap size={26} />}
        meta={
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Kpi
              label="Cursos activos"
              value={cursos.length}
              intent="brand"
              icon={<Award size={16} />}
            />
            <Kpi
              label="Inscriptos"
              value={cursos.reduce((a, c) => a + c.inscriptos, 0)}
              intent="ok"
              icon={<Users2 size={16} />}
            />
            <Kpi label="Centros de práctica" value={cepros.length} icon={<Building2 size={16} />} />
            <Kpi
              label="Folios mes"
              value={folios.length}
              hint="20 certificados"
              intent="ok"
              icon={<ScrollText size={16} />}
            />
          </div>
        }
        acciones={
          <button
            type="button"
            onClick={() => setNuevoCursoOpen(true)}
            className="bg-brand-600 hover:bg-brand-700 inline-flex h-10 items-center gap-1.5 rounded-lg px-3 text-sm font-medium text-white"
          >
            <GraduationCap size={14} /> Nuevo curso
          </button>
        }
      />

      <section>
        <h2 className="mb-3 flex items-center gap-2 text-base font-bold text-slate-900">
          <Award size={18} className="text-brand-600" /> Cursos en marcha
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {cursos.map((c) => {
            const pct = (c.inscriptos / c.cupos) * 100;
            return (
              <button
                key={c.nombre}
                type="button"
                onClick={() =>
                  toast.push({
                    kind: 'info',
                    title: c.nombre,
                    description: `${c.inscriptos}/${c.cupos} inscriptos · ${c.centro}`,
                  })
                }
                className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 text-left transition-all hover:-translate-y-0.5 hover:shadow-lg"
              >
                <div
                  className={cn(
                    'absolute -right-8 -top-8 h-24 w-24 rotate-12 rounded-3xl opacity-20',
                    CAT_COLOR[c.categoria],
                  )}
                />
                <div className="relative">
                  <div className="mb-3 flex items-center gap-2">
                    <span
                      className={cn(
                        'inline-flex h-5 items-center rounded px-1.5 text-[10px] font-bold uppercase text-white',
                        CAT_COLOR[c.categoria],
                      )}
                    >
                      {c.categoria}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded bg-slate-50 px-1.5 py-0.5 text-[10px] text-slate-600">
                      <Calendar size={10} /> {c.inicio}
                    </span>
                  </div>
                  <div className="font-bold leading-tight text-slate-900">{c.nombre}</div>
                  <div className="mt-0.5 text-xs text-slate-600">{c.centro}</div>

                  <div className="mt-4">
                    <div className="mb-1 flex items-baseline justify-between text-xs">
                      <span className="text-slate-600">Ocupación de cupos</span>
                      <span className="font-semibold tabular-nums text-slate-900">
                        {c.inscriptos}/{c.cupos}
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className={cn(
                          'h-full transition-all',
                          pct >= 80 ? 'bg-status-warn' : 'bg-brand-600',
                        )}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardContent className="p-5">
            <h3 className="mb-4 flex items-center gap-2 font-bold text-slate-900">
              <Building2 size={18} className="text-slate-700" /> Centros de práctica
            </h3>
            <div className="space-y-3">
              {cepros.map((c) => {
                const pct = (c.ocupacion / c.capacidad) * 100;
                return (
                  <div key={c.nombre} className="rounded-xl border border-slate-200 bg-white p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-slate-900">{c.nombre}</div>
                        <div className="text-xs text-slate-500">
                          {c.ciudad} · {c.instructores} instructores
                        </div>
                      </div>
                      <Badge intent={pct >= 80 ? 'warn' : 'ok'}>{Math.round(pct)}%</Badge>
                    </div>
                    <div className="mt-3">
                      <div className="mb-1 flex items-center justify-between text-[11px] text-slate-500">
                        <span>Ocupación</span>
                        <span className="tabular-nums">
                          {c.ocupacion}/{c.capacidad}
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className={cn('h-full', pct >= 80 ? 'bg-status-warn' : 'bg-status-ok')}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <h3 className="mb-4 flex items-center gap-2 font-bold text-slate-900">
              <Layers size={18} className="text-slate-700" /> Categorías de cursos
            </h3>
            <div className="space-y-2">
              {categorias.map((c) => (
                <div
                  key={c.nombre}
                  className="flex w-full items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 text-left"
                >
                  <div className={cn('h-10 w-1.5 rounded-full', c.color)} />
                  <div className="flex-1">
                    <div className="font-semibold text-slate-900">{c.nombre}</div>
                    <div className="text-xs text-slate-500">{c.requiere}</div>
                  </div>
                  <Badge intent="brand">
                    {c.cursos} curso{c.cursos === 1 ? '' : 's'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      <section>
        <h2 className="mb-3 flex items-center gap-2 text-base font-bold text-slate-900">
          <ScrollText size={18} className="text-status-ok" /> Folios de acreditación emitidos
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {folios.map((f) => (
            <div
              key={f.numero}
              className="to-status-ok-bg/30 overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-white p-5"
            >
              <div className="mb-3 flex items-start justify-between">
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                    Folio N°
                  </div>
                  <div className="font-mono text-2xl font-bold text-slate-900">{f.numero}</div>
                </div>
                <div className="bg-status-ok grid h-11 w-11 place-items-center rounded-xl text-white">
                  <Sparkles size={18} />
                </div>
              </div>
              <div className="text-sm text-slate-700">
                <strong className="font-bold tabular-nums">{f.certificados}</strong> certificados
                emitidos
              </div>
              <div className="mt-1 text-xs text-slate-500">
                Fecha: {f.fecha} · Firma: {f.firma}
              </div>
              <button
                type="button"
                onClick={() => toast.push({ kind: 'info', title: 'Descargando folio firmado' })}
                className="text-brand-700 hover:text-brand-900 mt-3 inline-flex items-center gap-1 text-sm font-medium"
              >
                Descargar PDF con firma <ChevronRight size={14} />
              </button>
            </div>
          ))}
        </div>
      </section>

      <NuevoCursoDialog open={nuevoCursoOpen} onClose={() => setNuevoCursoOpen(false)} />
    </div>
  );
}
