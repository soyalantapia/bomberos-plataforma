'use client';

import { AlertTriangle, Award, Ban, Clock, Star, UserCheck } from 'lucide-react';
import { useMemo, useState } from 'react';

import {
  Avatar,
  Badge,
  Button,
  Card,
  CardContent,
  Dialog,
  Input,
  Kpi,
  Label,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Textarea,
  cn,
  useToast,
} from '@faro/ui';

import type { TipoReconocimiento } from '@faro/types';

import { PageHero } from '../../../../../components/shared/page-hero';
import { calcularCumplimiento, intentCumplimiento } from '../../../../../lib/utils/cumplimiento';
import { fmtJerarquia } from '../../../../../lib/utils/jerarquia';
import { mesActual } from '../../../../../lib/utils/date';
import { selectCuartelActivo, useFaroStore } from '../../../../../store/use-faro-store';

function fmtHora(iso: string): string {
  return iso.slice(11, 16);
}
function durMin(ingreso: string, egreso?: string): number {
  const fin = egreso ? new Date(egreso).getTime() : Date.now();
  return Math.max(0, Math.round((fin - new Date(ingreso).getTime()) / 60000));
}
function fmtDur(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

type DialogState = { personaId: string; modo: 'calificar' | 'premio' | 'sancion' } | null;

export default function CumplimientoPage() {
  const toast = useToast();
  const cuartel = useFaroStore(selectCuartelActivo);
  const personas = useFaroStore((s) => s.personas);
  const fichajes = useFaroStore((s) => s.fichajes);
  const reconocimientos = useFaroStore((s) => s.reconocimientos);
  const calificaciones = useFaroStore((s) => s.calificaciones);
  const registrarReconocimiento = useFaroStore((s) => s.registrarReconocimiento);
  const calificar = useFaroStore((s) => s.calificar);

  const [tab, setTab] = useState('cumplimiento');
  const [dialog, setDialog] = useState<DialogState>(null);
  const [puntaje, setPuntaje] = useState('');
  const [texto, setTexto] = useState('');

  const periodo = mesActual();
  const personaById = useMemo(() => new Map(personas.map((p) => [p.id, p])), [personas]);

  const activas = useMemo(
    () =>
      personas.filter(
        (p) =>
          p.cuartelId === cuartel?.id && p.estado === 'activo' && p.cuerpo !== 'administrativo',
      ),
    [personas, cuartel?.id],
  );

  const ranking = useMemo(
    () =>
      activas
        .map((p) => ({ persona: p, c: calcularCumplimiento(p.id) }))
        .sort((a, b) => b.c.global - a.c.global),
    [activas],
  );

  const fichajesHoy = useMemo(
    () => fichajes.filter((f) => f.cuartelId === cuartel?.id),
    [fichajes, cuartel?.id],
  );
  const presentes = fichajesHoy.filter((f) => !f.egreso);
  const cerrados = fichajesHoy.filter((f) => f.egreso);

  const promedioCumpl = ranking.length
    ? Math.round(ranking.reduce((a, r) => a + r.c.global, 0) / ranking.length)
    : 0;

  // Los flojos al frente: bajo cumplimiento o sin apto médico, peor primero,
  // arriba de todo para que el jefe no tenga que scrollear el ranking entero.
  const UMBRAL_FALTA = 60;
  const enFalta = useMemo(
    () =>
      ranking
        .filter(({ c }) => c.global < UMBRAL_FALTA || !c.certificadoMedico)
        .sort((a, b) => a.c.global - b.c.global),
    [ranking],
  );
  const premios = reconocimientos.filter(
    (r) => r.cuartelId === cuartel?.id && r.tipo === 'premio',
  ).length;
  const sanciones = reconocimientos.filter(
    (r) => r.cuartelId === cuartel?.id && r.tipo === 'sancion',
  ).length;

  const calById = useMemo(
    () => new Map(calificaciones.filter((c) => c.periodo === periodo).map((c) => [c.personaId, c])),
    [calificaciones, periodo],
  );

  function abrir(personaId: string, modo: NonNullable<DialogState>['modo']) {
    setTexto('');
    setPuntaje(modo === 'calificar' ? String(calById.get(personaId)?.puntaje ?? '') : '');
    setDialog({ personaId, modo });
  }

  function confirmar() {
    if (!dialog) return;
    const persona = personaById.get(dialog.personaId);
    if (dialog.modo === 'calificar') {
      const n = Number(puntaje);
      if (!Number.isFinite(n) || n < 0 || n > 100) {
        toast.push({
          kind: 'warn',
          title: 'Puntaje inválido',
          description: 'Ingresá un número de 0 a 100.',
        });
        return;
      }
      calificar(dialog.personaId, periodo, n, texto.trim() || undefined);
      toast.push({
        kind: 'success',
        title: 'Calificación guardada',
        description: `${persona?.nombre} · ${n}/100 (privada).`,
      });
    } else {
      if (texto.trim().length < 5) {
        toast.push({ kind: 'warn', title: 'Falta el motivo', description: 'Escribí el motivo.' });
        return;
      }
      const tipo: TipoReconocimiento = dialog.modo === 'premio' ? 'premio' : 'sancion';
      registrarReconocimiento(dialog.personaId, tipo, texto.trim());
      toast.push({
        kind: tipo === 'premio' ? 'success' : 'warn',
        title: tipo === 'premio' ? 'Premio registrado' : 'Sanción registrada',
        description: `${persona?.nombre} · queda en el legajo.`,
      });
    }
    setDialog(null);
  }

  const dlgPersona = dialog ? personaById.get(dialog.personaId) : undefined;

  return (
    <>
      <div className="mx-auto max-w-5xl space-y-5">
        <PageHero
          objetivo="Vista Mando · RR.HH."
          titulo="Personal y cumplimiento"
          descripcion="Quién cumple y quién no: asistencia a academias, citaciones, actos y orden interno. Presencia en tiempo real y calificación mensual. Registrá premios o sanciones."
          icono={<UserCheck size={26} />}
          meta={
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <Kpi label="Presentes ahora" value={presentes.length} intent="ok" />
              <Kpi
                label="Cumplimiento prom."
                value={`${promedioCumpl}%`}
                intent={intentCumplimiento(promedioCumpl)}
              />
              <Kpi label="Premios" value={premios} intent="ok" />
              <Kpi
                label="Sanciones"
                value={sanciones}
                intent={sanciones > 0 ? 'risk' : 'neutral'}
              />
            </div>
          }
        />

        <Tabs value={tab} onChange={setTab}>
          <TabsList>
            <TabsTrigger value="cumplimiento">Cumplimiento</TabsTrigger>
            <TabsTrigger value="presencia">Presencia ({presentes.length})</TabsTrigger>
            <TabsTrigger value="calificaciones">Calificaciones</TabsTrigger>
          </TabsList>

          {/* ───── CUMPLIMIENTO (ranking) ───── */}
          <TabsContent value="cumplimiento" className="space-y-2">
            {/* Los flojos al frente */}
            {enFalta.length > 0 ? (
              <Card className="border-status-risk/40 bg-status-risk-bg/20 border-2">
                <CardContent className="p-3.5">
                  <h3 className="text-status-risk-fg flex items-center gap-1.5 text-sm font-bold">
                    <AlertTriangle size={16} />
                    {enFalta.length} en falta este mes
                  </h3>
                  <p className="mt-0.5 text-xs text-slate-600">
                    Bajo cumplimiento o sin apto médico vigente. Acá, al frente, para que no se te
                    escapen.
                  </p>
                  <div className="mt-2.5 space-y-1.5">
                    {enFalta.map(({ persona, c }) => (
                      <div
                        key={persona.id}
                        className="ring-status-risk/15 flex items-center gap-2.5 rounded-xl bg-white p-2.5 ring-1"
                      >
                        <Avatar
                          name={`${persona.nombre} ${persona.apellido}`}
                          src={persona.fotoUrl}
                          size={32}
                        />
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-sm font-semibold text-slate-900">
                            {persona.apellido}, {persona.nombre}
                          </div>
                          <div className="mt-0.5 flex flex-wrap gap-1">
                            {c.global < UMBRAL_FALTA && (
                              <Badge intent="risk">Cumple {c.global}%</Badge>
                            )}
                            {!c.certificadoMedico && <Badge intent="risk">Sin apto médico</Badge>}
                          </div>
                        </div>
                        <Button
                          intent="ghost"
                          size="sm"
                          onClick={() => abrir(persona.id, 'sancion')}
                        >
                          <Ban size={14} /> Sancionar
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="bg-status-ok-bg/30 text-status-ok-fg flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium">
                <UserCheck size={16} /> Nadie en falta este mes. Buen cuerpo.
              </div>
            )}

            <p className="px-1 text-xs text-slate-500">
              Ordenado de mayor a menor cumplimiento. Tocá una persona para ver el detalle y
              registrar un premio o una sanción.
            </p>
            {ranking.map(({ persona, c }, idx) => {
              const recs = reconocimientos.filter((r) => r.personaId === persona.id);
              return (
                <Card key={persona.id}>
                  <CardContent className="p-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-6 shrink-0 text-center text-sm font-bold text-slate-500">
                        {idx + 1}
                      </div>
                      <Avatar
                        name={`${persona.nombre} ${persona.apellido}`}
                        src={persona.fotoUrl}
                        size={40}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="truncate font-semibold text-slate-900">
                            {persona.apellido}, {persona.nombre}
                          </span>
                          {recs.some((r) => r.tipo === 'premio') && (
                            <Award size={14} className="text-status-ok-fg shrink-0" />
                          )}
                          {recs.some((r) => r.tipo === 'sancion') && (
                            <Ban size={14} className="text-status-risk-fg shrink-0" />
                          )}
                          {!c.certificadoMedico && <Badge intent="risk">Sin apto médico</Badge>}
                        </div>
                        <div className="text-xs text-slate-500">
                          {fmtJerarquia(persona.jerarquia)}
                        </div>
                        <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className={cn(
                              'h-full rounded-full',
                              c.global >= 80
                                ? 'bg-status-ok'
                                : c.global >= 60
                                  ? 'bg-status-warn'
                                  : 'bg-status-risk',
                            )}
                            style={{ width: `${c.global}%` }}
                          />
                        </div>
                      </div>
                      <div className="shrink-0 text-right">
                        <div className="text-lg font-bold tabular-nums text-slate-900">
                          {c.global}%
                        </div>
                        <div className="text-[11px] uppercase text-slate-500">cumple</div>
                      </div>
                    </div>

                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {c.categorias.map((cat) => (
                        <span
                          key={cat.id}
                          className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-1.5 py-0.5 text-[11px] text-slate-600"
                          title={`${cat.asistio}/${cat.total}`}
                        >
                          {cat.label}
                          <span
                            className={cn(
                              'font-semibold tabular-nums',
                              cat.pct >= 80
                                ? 'text-status-ok-fg'
                                : cat.pct >= 60
                                  ? 'text-status-warn-fg'
                                  : 'text-status-risk-fg',
                            )}
                          >
                            {cat.pct}%
                          </span>
                        </span>
                      ))}
                    </div>

                    <div className="mt-2.5 flex gap-2">
                      <Button intent="ghost" size="sm" onClick={() => abrir(persona.id, 'premio')}>
                        <Award size={14} /> Premiar
                      </Button>
                      <Button intent="ghost" size="sm" onClick={() => abrir(persona.id, 'sancion')}>
                        <Ban size={14} /> Sancionar
                      </Button>
                      <Button
                        intent="secondary"
                        size="sm"
                        onClick={() => abrir(persona.id, 'calificar')}
                      >
                        <Star size={14} /> Calificar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </TabsContent>

          {/* ───── PRESENCIA (fichajes) ───── */}
          <TabsContent value="presencia" className="space-y-4">
            <section className="space-y-2">
              <h3 className="px-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
                En el cuartel ahora ({presentes.length})
              </h3>
              {presentes.length === 0 ? (
                <Card>
                  <CardContent className="py-6 text-center text-sm text-slate-500">
                    Nadie fichado en este momento.
                  </CardContent>
                </Card>
              ) : (
                presentes.map((f) => {
                  const p = personaById.get(f.personaId);
                  return (
                    <Card key={f.id} className="border-status-ok/30 bg-status-ok-bg/20">
                      <CardContent className="flex items-center gap-3 p-3">
                        <span className="relative flex h-2.5 w-2.5 shrink-0">
                          <span className="bg-status-ok absolute inline-flex h-full w-full animate-ping rounded-full opacity-60" />
                          <span className="bg-status-ok relative inline-flex h-2.5 w-2.5 rounded-full" />
                        </span>
                        <Avatar
                          name={p ? `${p.nombre} ${p.apellido}` : '—'}
                          src={p?.fotoUrl}
                          size={34}
                        />
                        <div className="min-w-0 flex-1">
                          <div className="truncate font-medium text-slate-900">
                            {p ? `${p.nombre} ${p.apellido}` : f.personaId}
                          </div>
                          <div className="text-xs text-slate-500">
                            {f.actividad ?? 'Presente'} · desde {fmtHora(f.ingreso)}
                          </div>
                        </div>
                        <div className="text-status-ok-fg shrink-0 text-sm font-semibold tabular-nums">
                          {fmtDur(durMin(f.ingreso))}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </section>

            <section className="space-y-2">
              <h3 className="px-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Permanencia de hoy
              </h3>
              <p className="px-1 text-xs text-slate-500">
                No es lo mismo el que viene 10 minutos que el que se queda 3 horas.
              </p>
              {cerrados.map((f) => {
                const p = personaById.get(f.personaId);
                const min = durMin(f.ingreso, f.egreso);
                const corto = min < 30;
                return (
                  <Card key={f.id}>
                    <CardContent className="flex items-center gap-3 p-3">
                      <Clock size={16} className="shrink-0 text-slate-500" />
                      <Avatar
                        name={p ? `${p.nombre} ${p.apellido}` : '—'}
                        src={p?.fotoUrl}
                        size={30}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="truncate font-medium text-slate-900">
                          {p ? `${p.nombre} ${p.apellido}` : f.personaId}
                        </div>
                        <div className="text-xs text-slate-500">
                          {fmtHora(f.ingreso)}–{fmtHora(f.egreso!)} · {f.actividad ?? '—'}
                        </div>
                      </div>
                      <div
                        className={cn(
                          'shrink-0 text-sm font-semibold tabular-nums',
                          corto ? 'text-status-warn-fg' : 'text-slate-700',
                        )}
                      >
                        {fmtDur(min)}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </section>
          </TabsContent>

          {/* ───── CALIFICACIONES ───── */}
          <TabsContent value="calificaciones" className="space-y-2">
            <p className="px-1 text-xs text-slate-500">
              La calificación es <strong>privada</strong>: cada bombero ve sólo la suya. Como jefe,
              vos ves todas y podés cargarlas.
            </p>
            {activas.map((p) => {
              const cal = calById.get(p.id);
              return (
                <Card key={p.id}>
                  <CardContent className="flex items-center gap-3 p-3">
                    <Avatar name={`${p.nombre} ${p.apellido}`} src={p.fotoUrl} size={36} />
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-medium text-slate-900">
                        {p.apellido}, {p.nombre}
                      </div>
                      <div className="text-xs text-slate-500">
                        {cal ? `${periodo} · ${cal.puntaje}/100` : 'Sin calificar este mes'}
                      </div>
                    </div>
                    {cal && <Badge intent={intentCumplimiento(cal.puntaje)}>{cal.puntaje}</Badge>}
                    <Button intent="secondary" size="sm" onClick={() => abrir(p.id, 'calificar')}>
                      <Star size={14} /> {cal ? 'Editar' : 'Calificar'}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </TabsContent>
        </Tabs>
      </div>

      {/* Diálogo premio / sanción / calificar */}
      <Dialog
        open={!!dialog}
        onClose={() => setDialog(null)}
        title={
          dialog?.modo === 'calificar'
            ? `Calificar a ${dlgPersona?.nombre ?? ''}`
            : dialog?.modo === 'premio'
              ? `Premiar a ${dlgPersona?.nombre ?? ''}`
              : `Sancionar a ${dlgPersona?.nombre ?? ''}`
        }
        description={
          dialog?.modo === 'calificar'
            ? 'Puntaje del mes (0–100). Sólo lo ve esta persona y la jefatura.'
            : 'Queda registrado en el legajo y se notifica a la persona.'
        }
        size="sm"
        footer={
          <div className="flex justify-end gap-2">
            <Button intent="ghost" onClick={() => setDialog(null)}>
              Cancelar
            </Button>
            <Button
              intent={dialog?.modo === 'sancion' ? 'secondary' : 'primary'}
              onClick={confirmar}
            >
              Guardar
            </Button>
          </div>
        }
      >
        <div className="space-y-3">
          {dialog?.modo === 'calificar' && (
            <div>
              <Label htmlFor="c-pje">Puntaje (0–100)</Label>
              <Input
                id="c-pje"
                type="number"
                min={0}
                max={100}
                value={puntaje}
                onChange={(e) => setPuntaje(e.target.value)}
                autoFocus
              />
            </div>
          )}
          <div>
            <Label htmlFor="c-nota">
              {dialog?.modo === 'calificar' ? 'Nota (opcional)' : 'Motivo'}
            </Label>
            <Textarea
              id="c-nota"
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              rows={3}
              placeholder={
                dialog?.modo === 'calificar'
                  ? 'Observaciones del desempeño…'
                  : dialog?.modo === 'premio'
                    ? 'Ej: conducción destacada en el operativo…'
                    : 'Ej: faltó a 2 citaciones sin aviso…'
              }
              autoFocus={dialog?.modo !== 'calificar'}
            />
          </div>
        </div>
      </Dialog>
    </>
  );
}
