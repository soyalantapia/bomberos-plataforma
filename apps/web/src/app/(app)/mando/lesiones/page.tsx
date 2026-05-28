'use client';

import { motion } from 'framer-motion';
import { Activity, HeartPulse, Plus, ShieldPlus } from 'lucide-react';
import { useMemo, useState } from 'react';

import { Avatar, Badge, Button, Card, CardContent, Kpi, useToast } from '@faro/ui';

import type { EstadoLesion, GravedadLesion } from '@faro/types';

import { ReportarLesionDialog } from '../../../../components/salud/reportar-lesion-dialog';
import { PageHero } from '../../../../components/shared/page-hero';
import { fmtFecha } from '../../../../lib/utils/date';
import { selectCuartelActivo, useFaroStore } from '../../../../store/use-faro-store';

const GRAVEDAD: Record<GravedadLesion, { label: string; intent: 'neutral' | 'warn' | 'risk' }> = {
  leve: { label: 'Leve', intent: 'neutral' },
  moderada: { label: 'Moderada', intent: 'warn' },
  grave: { label: 'Grave', intent: 'risk' },
};

const ESTADO: Record<EstadoLesion, { label: string; intent: 'warn' | 'brand' | 'ok' }> = {
  reportada: { label: 'Reportada', intent: 'warn' },
  en_tratamiento: { label: 'En tratamiento', intent: 'brand' },
  cerrada: { label: 'Cerrada', intent: 'ok' },
};

export default function LesionesPage() {
  const toast = useToast();
  const cuartel = useFaroStore(selectCuartelActivo);
  const lesiones = useFaroStore((s) => s.lesiones);
  const personas = useFaroStore((s) => s.personas);
  const servicios = useFaroStore((s) => s.servicios);
  const actualizarLesion = useFaroStore((s) => s.actualizarLesion);

  const [open, setOpen] = useState(false);

  const personaById = useMemo(() => new Map(personas.map((p) => [p.id, p])), [personas]);
  const servicioById = useMemo(() => new Map(servicios.map((s) => [s.id, s])), [servicios]);

  const delCuartel = useMemo(
    () =>
      lesiones
        .filter((l) => l.cuartelId === cuartel?.id)
        .sort((a, b) => b.fecha.localeCompare(a.fecha)),
    [lesiones, cuartel?.id],
  );

  const reportadas = delCuartel.filter((l) => l.estado === 'reportada').length;
  const enTrat = delCuartel.filter((l) => l.estado === 'en_tratamiento').length;
  const conArt = delCuartel.filter((l) => l.art).length;
  const mes = new Date().toISOString().slice(0, 7);
  const esteMes = delCuartel.filter((l) => l.fecha.slice(0, 7) === mes).length;

  return (
    <>
      <div className="mx-auto max-w-4xl space-y-5">
        <PageHero
          objetivo="Vista Mando · Salud y seguridad"
          titulo="Lesiones e incidentes"
          descripcion="Toda lesión en intervención queda con constancia: quién, qué pasó, si necesitó atención médica y si se reportó a la ART. Sirve para el seguro y para prevenir."
          icono={<HeartPulse size={26} />}
          variant={reportadas > 0 ? 'critical' : 'default'}
          meta={
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <Kpi label="Reportadas" value={reportadas} intent={reportadas > 0 ? 'warn' : 'ok'} />
              <Kpi label="En tratamiento" value={enTrat} intent="brand" />
              <Kpi label="Con ART" value={conArt} intent="neutral" />
              <Kpi label="Este mes" value={esteMes} intent="neutral" />
            </div>
          }
          acciones={
            <Button intent="primary" onClick={() => setOpen(true)}>
              <Plus size={14} /> Registrar lesión
            </Button>
          }
        />

        {delCuartel.length === 0 ? (
          <Card>
            <CardContent className="grid place-items-center gap-2 py-12 text-center">
              <Activity size={28} className="text-status-ok" />
              <div className="text-sm text-slate-500">Sin lesiones registradas. ¡Mejor así!</div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {delCuartel.map((l) => {
              const p = personaById.get(l.personaId);
              const grav = GRAVEDAD[l.gravedad];
              const est = ESTADO[l.estado];
              const serv = l.servicioId ? servicioById.get(l.servicioId) : undefined;
              return (
                <motion.div
                  key={l.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card>
                    <CardContent className="p-3.5">
                      <div className="flex items-start gap-3">
                        <Avatar
                          name={p ? `${p.nombre} ${p.apellido}` : '—'}
                          src={p?.fotoUrl}
                          size={38}
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-semibold text-slate-900">
                              {p ? `${p.apellido}, ${p.nombre}` : l.personaId}
                            </span>
                            <Badge intent={grav.intent}>{grav.label}</Badge>
                            <Badge intent={est.intent}>{est.label}</Badge>
                            {l.art && <Badge intent="brand">ART</Badge>}
                          </div>
                          <p className="mt-1 text-sm text-slate-700">{l.descripcion}</p>
                          <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-slate-500">
                            <span>{fmtFecha(l.fecha)}</span>
                            {l.parteCuerpo && <span>· {l.parteCuerpo}</span>}
                            {l.requiereAtencion && (
                              <span className="text-status-warn-fg">
                                · requirió atención{l.derivadoA ? ` → ${l.derivadoA}` : ''}
                              </span>
                            )}
                            {serv && <span>· {serv.direccion}</span>}
                          </div>

                          <div className="mt-2.5 flex flex-wrap gap-2">
                            {l.estado === 'reportada' && (
                              <Button
                                intent="secondary"
                                size="sm"
                                onClick={() => {
                                  actualizarLesion(l.id, { estado: 'en_tratamiento' });
                                  toast.push({
                                    kind: 'info',
                                    title: 'En tratamiento',
                                    description: l.descripcion,
                                  });
                                }}
                              >
                                Marcar en tratamiento
                              </Button>
                            )}
                            {l.estado !== 'cerrada' && (
                              <Button
                                intent="ghost"
                                size="sm"
                                onClick={() => {
                                  actualizarLesion(l.id, { estado: 'cerrada' });
                                  toast.push({
                                    kind: 'success',
                                    title: 'Lesión cerrada',
                                    description: l.descripcion,
                                  });
                                }}
                              >
                                Cerrar
                              </Button>
                            )}
                            {!l.art && (
                              <Button
                                intent="ghost"
                                size="sm"
                                onClick={() => {
                                  actualizarLesion(l.id, { art: true });
                                  toast.push({
                                    kind: 'success',
                                    title: 'Reportada a la ART',
                                    description: l.descripcion,
                                  });
                                }}
                              >
                                <ShieldPlus size={14} /> Reportar a ART
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      <ReportarLesionDialog open={open} onClose={() => setOpen(false)} />
    </>
  );
}
