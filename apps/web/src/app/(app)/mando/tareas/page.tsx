'use client';

import { motion } from 'framer-motion';
import { Ban, CheckCircle2, ClipboardList, Plus, RotateCcw } from 'lucide-react';
import { useMemo, useState } from 'react';

import { Avatar, Badge, Button, Card, CardContent, Kpi, cn, useToast } from '@faro/ui';

import { NuevaTareaDialog } from '../../../../components/tareas/nueva-tarea-dialog';
import {
  ESTADO_TAREA,
  PRIORIDAD_TAREA,
  estaVencida,
  fechaCorta,
} from '../../../../components/tareas/utils';
import { PageHero } from '../../../../components/shared/page-hero';
import { demoToday } from '../../../../lib/utils/demo-today';
import { selectCuartelActivo, useFaroStore } from '../../../../store/use-faro-store';

type FiltroEstado = 'todas' | 'abiertas' | 'a_validar' | 'bloqueadas';

export default function MandoTareasPage() {
  const toast = useToast();
  const cuartel = useFaroStore(selectCuartelActivo);
  const tareas = useFaroStore((s) => s.tareas);
  const sectores = useFaroStore((s) => s.sectores);
  const personas = useFaroStore((s) => s.personas);
  const validarTarea = useFaroStore((s) => s.validarTarea);
  const reabrirTarea = useFaroStore((s) => s.reabrirTarea);

  const [openNueva, setOpenNueva] = useState(false);
  const [filtro, setFiltro] = useState<FiltroEstado>('todas');
  const [sectorFiltro, setSectorFiltro] = useState<string>('todos');

  const hoy = useMemo(() => demoToday(), []);
  const personaById = useMemo(() => new Map(personas.map((p) => [p.id, p])), [personas]);
  const sectorById = useMemo(() => new Map(sectores.map((s) => [s.id, s])), [sectores]);

  const delCuartel = useMemo(
    () => tareas.filter((t) => t.cuartelId === cuartel?.id),
    [tareas, cuartel?.id],
  );

  const kpis = useMemo(() => {
    const abiertas = delCuartel.filter(
      (t) => t.estado === 'asignada' || t.estado === 'en_progreso' || t.estado === 'reabierta',
    ).length;
    const aValidar = delCuartel.filter((t) => t.estado === 'hecha').length;
    const bloqueadas = delCuartel.filter((t) => t.estado === 'bloqueada').length;
    const vencidas = delCuartel.filter((t) => estaVencida(t.vencimiento, t.estado, hoy)).length;
    return { abiertas, aValidar, bloqueadas, vencidas };
  }, [delCuartel, hoy]);

  const filtradas = useMemo(() => {
    return delCuartel
      .filter((t) => {
        if (filtro === 'abiertas')
          return t.estado === 'asignada' || t.estado === 'en_progreso' || t.estado === 'reabierta';
        if (filtro === 'a_validar') return t.estado === 'hecha';
        if (filtro === 'bloqueadas') return t.estado === 'bloqueada';
        return true;
      })
      .filter((t) => (sectorFiltro === 'todos' ? true : t.sectorId === sectorFiltro))
      .sort((a, b) => b.creadaEn.localeCompare(a.creadaEn));
  }, [delCuartel, filtro, sectorFiltro]);

  const sectoresCuartel = sectores.filter((s) => s.cuartelId === cuartel?.id);

  return (
    <>
      <div className="mx-auto max-w-5xl space-y-5">
        <PageHero
          objetivo="Vista Mando · Gestión"
          titulo="Tareas por sector"
          descripcion="Asignás, controlás y cerrás. Cada tarea queda registrada con quién la asignó y cuándo; la persona la marca hecha o reporta si le falta algo."
          icono={<ClipboardList size={26} />}
          meta={
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <Kpi label="Abiertas" value={kpis.abiertas} intent="neutral" />
              <Kpi label="A validar" value={kpis.aValidar} intent="warn" />
              <Kpi label="Bloqueadas" value={kpis.bloqueadas} intent="risk" />
              <Kpi
                label="Vencidas"
                value={kpis.vencidas}
                intent={kpis.vencidas > 0 ? 'risk' : 'ok'}
              />
            </div>
          }
          acciones={
            <Button intent="primary" onClick={() => setOpenNueva(true)}>
              <Plus size={14} /> Asignar tarea
            </Button>
          }
        />

        {/* Filtros */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="flex gap-1 overflow-x-auto rounded-xl bg-slate-100 p-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {(
              [
                ['todas', 'Todas'],
                ['abiertas', 'Abiertas'],
                ['a_validar', 'A validar'],
                ['bloqueadas', 'Bloqueadas'],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setFiltro(id)}
                className={cn(
                  'shrink-0 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium transition-colors active:scale-95',
                  filtro === id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600',
                )}
              >
                {label}
              </button>
            ))}
          </div>
          <select
            className="focus:border-brand-400 focus:ring-brand-100 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 sm:ml-auto sm:w-56"
            value={sectorFiltro}
            onChange={(e) => setSectorFiltro(e.target.value)}
          >
            <option value="todos">Todos los sectores</option>
            {sectoresCuartel.map((s) => (
              <option key={s.id} value={s.id}>
                {s.nombre}
              </option>
            ))}
          </select>
        </div>

        {/* Lista */}
        {filtradas.length === 0 ? (
          <Card>
            <CardContent className="grid place-items-center gap-2 py-12 text-center">
              <ClipboardList size={28} className="text-slate-300" />
              <div className="text-sm text-slate-500">No hay tareas en este filtro.</div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {filtradas.map((t) => {
              const resp = personaById.get(t.asignadaA);
              const jefe = personaById.get(t.asignadaPor);
              const sector = t.sectorId ? sectorById.get(t.sectorId) : undefined;
              const est = ESTADO_TAREA[t.estado];
              const prio = PRIORIDAD_TAREA[t.prioridad];
              const vencida = estaVencida(t.vencimiento, t.estado, hoy);
              return (
                <motion.div
                  key={t.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card>
                    <CardContent className="p-3.5">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="font-semibold text-slate-900">{t.titulo}</div>
                          {t.descripcion && (
                            <div className="mt-0.5 text-xs text-slate-500">{t.descripcion}</div>
                          )}
                        </div>
                        <Badge intent={est.intent}>{est.label}</Badge>
                      </div>

                      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                        {sector && (
                          <span className="font-medium text-slate-600">{sector.nombre}</span>
                        )}
                        {resp && (
                          <span className="inline-flex items-center gap-1">
                            <Avatar
                              name={`${resp.nombre} ${resp.apellido}`}
                              src={resp.fotoUrl}
                              size={18}
                            />
                            {resp.apellido}
                          </span>
                        )}
                        {jefe && <span>· asignó {jefe.apellido}</span>}
                        {t.vencimiento && (
                          <span className={cn(vencida && 'text-status-risk-fg font-semibold')}>
                            · vence {fechaCorta(t.vencimiento)}
                            {vencida && ' (vencida)'}
                          </span>
                        )}
                        <Badge intent={prio.intent}>{prio.label}</Badge>
                      </div>

                      {t.estado === 'bloqueada' && t.motivoBloqueo && (
                        <div className="bg-status-risk-bg/40 text-status-risk-fg mt-2 rounded-lg px-2.5 py-1.5 text-xs">
                          <strong>Bloqueada:</strong> {t.motivoBloqueo}
                        </div>
                      )}
                      {t.comentarioCierre && t.estado !== 'bloqueada' && (
                        <div className="mt-2 rounded-lg bg-slate-50 px-2.5 py-1.5 text-xs text-slate-600">
                          “{t.comentarioCierre}”
                        </div>
                      )}

                      {(t.estado === 'hecha' || t.estado === 'bloqueada') && (
                        <div className="mt-2.5 flex gap-2">
                          {t.estado === 'hecha' && (
                            <Button
                              intent="primary"
                              size="sm"
                              onClick={() => {
                                validarTarea(t.id);
                                toast.push({
                                  kind: 'success',
                                  title: 'Tarea validada',
                                  description: t.titulo,
                                });
                              }}
                            >
                              <CheckCircle2 size={14} /> Validar
                            </Button>
                          )}
                          <Button
                            intent="ghost"
                            size="sm"
                            onClick={() => {
                              reabrirTarea(t.id);
                              toast.push({
                                kind: 'warn',
                                title: 'Tarea reabierta',
                                description: t.titulo,
                              });
                            }}
                          >
                            <RotateCcw size={14} /> Reabrir
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}

        <Card className="border-slate-200 bg-slate-50">
          <CardContent className="flex items-start gap-3 p-4 text-sm text-slate-600">
            <Ban size={18} className="mt-0.5 shrink-0 text-slate-500" />
            <div>
              <strong className="text-slate-900">Cadena de mando:</strong> si asignaste una tarea y
              la persona no la cumplió, queda registrado que vos informaste en tiempo y forma. Si
              reporta que le faltan herramientas, la tarea pasa a “bloqueada” y el motivo queda a la
              vista para que el Consejo lo resuelva.
            </div>
          </CardContent>
        </Card>
      </div>

      <NuevaTareaDialog open={openNueva} onClose={() => setOpenNueva(false)} />
    </>
  );
}
