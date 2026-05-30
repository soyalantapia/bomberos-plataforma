'use client';

import { motion } from 'framer-motion';
import { Calendar, Check, Moon, Save, Sparkles, Sun, Sunset } from 'lucide-react';
import { useState } from 'react';

import { Avatar, Badge, Button, Card, CardContent, Kpi, cn, useToast } from '@faro/ui';

import { PageHero } from '../../../../components/shared/page-hero';
import { fmtJerarquia } from '../../../../lib/utils/jerarquia';
import { selectPersonaActual, useFaroStore } from '../../../../store/use-faro-store';

type Turno = 'manana' | 'tarde' | 'noche';
type Dia = 'lun' | 'mar' | 'mie' | 'jue' | 'vie' | 'sab' | 'dom';

const DIAS: Array<{ id: Dia; label: string; nombre: string }> = [
  { id: 'lun', label: 'L', nombre: 'Lunes' },
  { id: 'mar', label: 'M', nombre: 'Martes' },
  { id: 'mie', label: 'Mi', nombre: 'Miércoles' },
  { id: 'jue', label: 'J', nombre: 'Jueves' },
  { id: 'vie', label: 'V', nombre: 'Viernes' },
  { id: 'sab', label: 'S', nombre: 'Sábado' },
  { id: 'dom', label: 'D', nombre: 'Domingo' },
];

const TURNOS: Array<{ id: Turno; label: string; rango: string; icon: React.ReactNode }> = [
  { id: 'manana', label: 'Mañana', rango: '08-14', icon: <Sun size={14} /> },
  { id: 'tarde', label: 'Tarde', rango: '14-20', icon: <Sunset size={14} /> },
  { id: 'noche', label: 'Noche', rango: '20-08', icon: <Moon size={14} /> },
];

type Disponibilidad = Record<Dia, Record<Turno, boolean>>;

const PRESET_TODA_SEMANA: Disponibilidad = {
  lun: { manana: false, tarde: true, noche: true },
  mar: { manana: false, tarde: true, noche: true },
  mie: { manana: false, tarde: true, noche: true },
  jue: { manana: false, tarde: true, noche: true },
  vie: { manana: false, tarde: true, noche: true },
  sab: { manana: true, tarde: true, noche: true },
  dom: { manana: true, tarde: true, noche: false },
};

// Mock: cobertura agregada del cuartel (cuántos voluntarios declaran disponibilidad por celda)
const COBERTURA_CUARTEL: Disponibilidad & Record<Dia, Record<Turno, number>> = {
  lun: { manana: 6, tarde: 12, noche: 8 } as never,
  mar: { manana: 5, tarde: 14, noche: 9 } as never,
  mie: { manana: 4, tarde: 11, noche: 7 } as never,
  jue: { manana: 5, tarde: 13, noche: 10 } as never,
  vie: { manana: 7, tarde: 15, noche: 12 } as never,
  sab: { manana: 14, tarde: 16, noche: 13 } as never,
  dom: { manana: 11, tarde: 12, noche: 6 } as never,
} as never;

const COBERTURA_OBJETIVO = 8; // mínimo recomendado

export default function DisponibilidadPage() {
  const persona = useFaroStore(selectPersonaActual);
  const toast = useToast();
  const [disp, setDisp] = useState<Disponibilidad>(PRESET_TODA_SEMANA);
  const [vista, setVista] = useState<'mia' | 'cuartel'>('mia');

  function toggle(dia: Dia, turno: Turno) {
    setDisp((d) => ({
      ...d,
      [dia]: { ...d[dia], [turno]: !d[dia][turno] },
    }));
  }

  function guardar() {
    toast.push({
      kind: 'success',
      title: 'Disponibilidad guardada',
      description: `${total} turnos declarados para mayo.`,
    });
  }

  const total = Object.values(disp).reduce(
    (acc, dia) => acc + Object.values(dia).filter(Boolean).length,
    0,
  );
  const horasMes = total * 4 * 6; // 4 semanas * 6h promedio

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <PageHero
        objetivo="Bombero · Disponibilidad"
        titulo="Declará tu disponibilidad semanal"
        descripcion="Lo que cargues acá sirve para sugerir tu nombre cuando falta cobertura. Podés cambiar cuando quieras. Click en una celda alterna disponible/no disponible."
        icono={<Calendar size={26} />}
        meta={
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            <Kpi label="Tu nombre" value={persona?.nombre ?? '—'} intent="brand" />
            <Kpi label="Turnos/sem" value={total} intent="brand" />
            <Kpi label="Hs estimadas/mes" value={horasMes} intent="ok" />
            <Kpi label="Cobertura cuartel" value="74%" hint="esta sem." intent="warn" />
          </div>
        }
        acciones={
          <Button intent="primary" onClick={guardar}>
            <Save size={14} /> Guardar
          </Button>
        }
      />

      {/* Toggle vista */}
      <Card>
        <CardContent className="flex gap-2 p-3">
          <Button
            intent={vista === 'mia' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setVista('mia')}
          >
            Mi disponibilidad
          </Button>
          <Button
            intent={vista === 'cuartel' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setVista('cuartel')}
          >
            Mapa de cobertura del cuartel
          </Button>
        </CardContent>
      </Card>

      {/* Grilla 7×3 */}
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700">
                    Turno
                  </th>
                  {DIAS.map((d) => (
                    <th
                      key={d.id}
                      className="px-2 py-3 text-center text-xs font-semibold text-slate-700"
                    >
                      <div className="flex flex-col items-center">
                        <span className="text-slate-500">{d.label}</span>
                        <span className="text-[10px] uppercase">{d.nombre.slice(0, 3)}</span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {TURNOS.map((t) => (
                  <tr key={t.id} className="border-b border-slate-100">
                    <td className="px-4 py-3 align-middle">
                      <div className="flex flex-col">
                        <span className="flex items-center gap-1 text-sm font-semibold text-slate-900">
                          {t.icon}
                          {t.label}
                        </span>
                        <span className="text-[10px] text-slate-500">{t.rango} hs</span>
                      </div>
                    </td>
                    {DIAS.map((d) => {
                      if (vista === 'mia') {
                        const activo = disp[d.id][t.id];
                        return (
                          <td key={d.id} className="px-2 py-3 text-center">
                            <motion.button
                              whileTap={{ scale: 0.92 }}
                              type="button"
                              onClick={() => toggle(d.id, t.id)}
                              className={cn(
                                'grid h-12 w-12 place-items-center rounded-lg transition-colors',
                                activo
                                  ? 'bg-status-ok text-white shadow-md'
                                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200',
                              )}
                              aria-label={`${d.nombre} ${t.label} ${activo ? 'disponible' : 'no disponible'}`}
                            >
                              {activo && <Check size={20} />}
                            </motion.button>
                          </td>
                        );
                      } else {
                        const count = COBERTURA_CUARTEL[d.id][t.id] as never as number;
                        const okay = count >= COBERTURA_OBJETIVO;
                        const bajo = count >= COBERTURA_OBJETIVO * 0.6;
                        return (
                          <td key={d.id} className="px-2 py-3 text-center">
                            <div
                              className={cn(
                                'grid h-12 w-12 place-items-center rounded-lg font-bold tabular-nums',
                                okay
                                  ? 'bg-status-ok text-white'
                                  : bajo
                                    ? 'bg-status-warn text-white'
                                    : 'bg-status-risk text-white',
                              )}
                              title={`${count} voluntarios disponibles`}
                            >
                              {count}
                            </div>
                          </td>
                        );
                      }
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* IA recomienda */}
      {vista === 'mia' && (
        <Card className="bg-brand-50/40 border-brand-100">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="bg-brand-600 grid h-10 w-10 shrink-0 place-items-center rounded-xl text-white">
                <Sparkles size={18} />
              </div>
              <div className="flex-1 text-sm">
                <div className="text-brand-900 font-semibold">Sugerencia</div>
                <p className="text-brand-900/80 mt-0.5">
                  Tu cuartel necesita refuerzo en <strong>miércoles mañana (4 voluntarios)</strong>{' '}
                  y <strong>domingo noche (6 voluntarios)</strong>. Si te suma, sumate.
                </p>
                <Button
                  intent="secondary"
                  size="sm"
                  className="mt-2"
                  onClick={() => {
                    setDisp((d) => ({
                      ...d,
                      mie: { ...d.mie, manana: true },
                      dom: { ...d.dom, noche: true },
                    }));
                    toast.push({
                      kind: 'success',
                      title: 'Sumaste 2 turnos para cubrir los huecos',
                      description: 'Mié mañana + Dom noche',
                    });
                  }}
                >
                  Completar huecos del cuartel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Heatmap legend */}
      {vista === 'cuartel' && (
        <Card>
          <CardContent className="p-4">
            <div className="mb-2 text-xs font-semibold uppercase text-slate-500">Leyenda</div>
            <div className="flex flex-wrap items-center gap-3 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="bg-status-ok grid h-5 w-5 place-items-center rounded text-[10px] font-bold text-white">
                  8+
                </span>
                <span>Cobertura plena</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="bg-status-warn grid h-5 w-5 place-items-center rounded text-[10px] font-bold text-white">
                  5-7
                </span>
                <span>Cobertura justa</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="bg-status-risk grid h-5 w-5 place-items-center rounded text-[10px] font-bold text-white">
                  &lt;5
                </span>
                <span>Cobertura crítica</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Equipo disponible ahora */}
      <Card>
        <CardContent className="p-4">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-900">
            <Sparkles size={14} className="text-status-ok-fg" />
            Quién está disponible justo ahora
          </h3>
          <div className="flex flex-wrap gap-2">
            {[
              persona
                ? {
                    nombre: `${persona.nombre} ${persona.apellido}`,
                    jerarquia: fmtJerarquia(persona.jerarquia),
                  }
                : { nombre: 'Voluntario', jerarquia: 'Bombero' },
              { nombre: 'Sebastián Ruiz', jerarquia: 'Sargento' },
              { nombre: 'Carolina Sosa', jerarquia: 'Cabo' },
              { nombre: 'Federico Vázquez', jerarquia: 'Bombero 1ra' },
              { nombre: 'Lucía Méndez', jerarquia: 'Bombero' },
            ].map((p) => (
              <div
                key={p.nombre}
                className="bg-status-ok-bg/40 flex items-center gap-2 rounded-full px-2.5 py-1"
              >
                <Avatar name={p.nombre} size={20} />
                <div className="text-xs">
                  <span className="font-medium text-slate-900">{p.nombre}</span>
                  <span className="ml-1 text-slate-500">· {p.jerarquia}</span>
                </div>
                <Badge intent="ok">Listo</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
