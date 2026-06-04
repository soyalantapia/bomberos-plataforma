'use client';

import {
  Calendar,
  Check,
  ClipboardCheck,
  Clock,
  FileSignature,
  Flame,
  ShieldAlert,
  ShieldCheck,
  TrendingUp,
  X,
} from 'lucide-react';
import { useMemo, useState } from 'react';

import {
  Avatar,
  Badge,
  Button,
  Card,
  CardContent,
  Dialog,
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

import { PageHero } from '../../../../components/shared/page-hero';
import { demoTodayMinus } from '../../../../lib/utils/demo-today';
import { fmtFechaHora } from '../../../../lib/utils/date';
import { tipoServicioLabel } from '../../../../lib/utils/tipo-servicio';
import {
  selectCuartelActivo,
  selectPersonaActual,
  useFaroStore,
} from '../../../../store/use-faro-store';

type Categoria = 'licencia' | 'ascenso' | 'sancion';
interface Solicitud {
  id: string;
  persona: string;
  legajo: string;
  tipo: string;
  detalle: string;
  fecha: string;
  prioridad: 'alta' | 'normal' | 'baja';
  estado: 'pendiente' | 'aprobada' | 'rechazada';
  categoria: Categoria;
}

const fechaRel = (dias: number) => demoTodayMinus(dias).toLocaleDateString('es-AR');

// TODO: cuando exista slice `aprobaciones` en el store, leer desde useFaroStore
const SEED: Solicitud[] = [
  // Licencias
  {
    id: 'l-1',
    persona: 'Iván Quiroga',
    legajo: '0269',
    tipo: 'Licencia médica',
    detalle: 'Cirugía menor · 7 días',
    fecha: fechaRel(10),
    prioridad: 'alta',
    estado: 'pendiente',
    categoria: 'licencia',
  },
  {
    id: 'l-2',
    persona: 'Camila Torres',
    legajo: '0276',
    tipo: 'Licencia académica',
    detalle: 'Examen final · 1 día',
    fecha: fechaRel(11),
    prioridad: 'normal',
    estado: 'pendiente',
    categoria: 'licencia',
  },
  {
    id: 'l-3',
    persona: 'Florencia Salinas',
    legajo: '0212',
    tipo: 'Licencia académica',
    detalle: 'Aprobada por R. González',
    fecha: fechaRel(20),
    prioridad: 'normal',
    estado: 'aprobada',
    categoria: 'licencia',
  },
  {
    id: 'l-4',
    persona: 'Sebastián Ruiz',
    legajo: '0156',
    tipo: 'Licencia personal',
    detalle: '3 días · viaje familiar',
    fecha: fechaRel(13),
    prioridad: 'baja',
    estado: 'pendiente',
    categoria: 'licencia',
  },
  // Ascensos
  {
    id: 'a-1',
    persona: 'Carolina Sosa',
    legajo: '0078',
    tipo: 'Pliego de ascenso · a Sargento',
    detalle: 'Cumple antigüedad y cursos · Aval del Comandante',
    fecha: fechaRel(15),
    prioridad: 'normal',
    estado: 'pendiente',
    categoria: 'ascenso',
  },
  {
    id: 'a-2',
    persona: 'Tomás Vázquez',
    legajo: '0091',
    tipo: 'Pliego de ascenso · a Cabo',
    detalle: 'Pendiente curso de mando · vence agosto',
    fecha: fechaRel(17),
    prioridad: 'normal',
    estado: 'pendiente',
    categoria: 'ascenso',
  },
  {
    id: 'a-3',
    persona: 'Brenda Cáceres',
    legajo: '0184',
    tipo: 'Pliego de ascenso · a Sargento Ayudante',
    detalle: 'Aprobado por R. González',
    fecha: fechaRel(23),
    prioridad: 'normal',
    estado: 'aprobada',
    categoria: 'ascenso',
  },
  // Sanciones
  {
    id: 's-1',
    persona: 'Juan Aguirre',
    legajo: '0203',
    tipo: 'Apercibimiento',
    detalle: 'Inasistencia injustificada · turno noche',
    fecha: fechaRel(18),
    prioridad: 'alta',
    estado: 'pendiente',
    categoria: 'sancion',
  },
  {
    id: 's-2',
    persona: 'Lautaro Funes',
    legajo: '0117',
    tipo: 'Llamado de atención',
    detalle: 'Mal trato con par · informado por Sgto. Pérez',
    fecha: fechaRel(22),
    prioridad: 'normal',
    estado: 'rechazada',
    categoria: 'sancion',
  },
];

const COL_STYLE = {
  pendiente: {
    label: 'En tu mesa',
    icon: <ClipboardCheck size={16} />,
    bg: 'bg-status-warn-bg/40',
    ring: 'ring-status-warn/40',
    accent: 'text-status-warn-fg',
  },
  aprobada: {
    label: 'Aprobadas',
    icon: <ShieldCheck size={16} />,
    bg: 'bg-status-ok-bg/40',
    ring: 'ring-status-ok/40',
    accent: 'text-status-ok-fg',
  },
  rechazada: {
    label: 'Rechazadas',
    icon: <ShieldAlert size={16} />,
    bg: 'bg-slate-100',
    ring: 'ring-slate-300',
    accent: 'text-slate-600',
  },
};

const CAT_COLOR: Record<Categoria, string> = {
  licencia: 'bg-status-warn text-white',
  ascenso: 'bg-brand-600 text-white',
  sancion: 'bg-status-risk text-white',
};

const CAT_LABEL: Record<Categoria, string> = {
  licencia: 'Licencia',
  ascenso: 'Ascenso',
  sancion: 'Sanción',
};

export default function AprobacionesPage() {
  const [items, setItems] = useState<Solicitud[]>(SEED);
  const [tab, setTab] = useState<'todas' | Categoria>('todas');
  const [motivoDialog, setMotivoDialog] = useState<{
    id: string;
    accion: 'aprobar' | 'rechazar';
  } | null>(null);
  const [motivoTexto, setMotivoTexto] = useState('');
  const toast = useToast();

  // Servicios reales esperando validación (cierra el loop con el Tablero)
  const cuartel = useFaroStore(selectCuartelActivo);
  const persona = useFaroStore(selectPersonaActual);
  const serviciosAll = useFaroStore((s) => s.servicios);
  const validarServicio = useFaroStore((s) => s.validarServicio);
  const rechazarServicio = useFaroStore((s) => s.rechazarServicio);

  const serviciosPend = useMemo(
    () =>
      serviciosAll.filter(
        (s) => s.cuartelId === cuartel?.id && s.estado === 'pendiente_validacion',
      ),
    [serviciosAll, cuartel?.id],
  );

  function validarParte(id: string) {
    if (!persona) return;
    validarServicio(id, persona.id);
    toast.push({
      kind: 'success',
      title: 'Servicio validado',
      description: 'Queda firmado y baja del Tablero del Comandante.',
    });
  }

  function rechazarParte(id: string) {
    if (!persona) return;
    rechazarServicio(id, persona.id);
    toast.push({
      kind: 'info',
      title: 'Servicio devuelto',
      description: 'Vuelve al bombero para corregir el parte.',
    });
  }

  function aplicarDecision(id: string, accion: 'aprobar' | 'rechazar') {
    setItems((arr) =>
      arr.map((s) =>
        s.id === id ? { ...s, estado: accion === 'aprobar' ? 'aprobada' : 'rechazada' } : s,
      ),
    );
    toast.push({
      kind: accion === 'aprobar' ? 'success' : 'info',
      title: accion === 'aprobar' ? 'Aprobada' : 'Rechazada',
      description: 'Queda registrada con tu firma.',
    });
  }

  function decidir(id: string, accion: 'aprobar' | 'rechazar') {
    const item = items.find((s) => s.id === id);
    // Para sanciones o rechazos pedimos un motivo
    if (item?.categoria === 'sancion' || accion === 'rechazar') {
      setMotivoDialog({ id, accion });
      setMotivoTexto('');
      return;
    }
    aplicarDecision(id, accion);
  }

  function confirmarConMotivo() {
    if (!motivoDialog) return;
    if (motivoTexto.trim().length < 4) {
      toast.push({
        kind: 'warn',
        title: 'Necesitamos un motivo',
        description: 'Escribí al menos un par de palabras.',
      });
      return;
    }
    aplicarDecision(motivoDialog.id, motivoDialog.accion);
    setMotivoDialog(null);
    setMotivoTexto('');
  }

  function cerrarMotivoDialog() {
    setMotivoDialog(null);
    setMotivoTexto('');
  }

  const filtrado = useMemo(
    () => (tab === 'todas' ? items : items.filter((s) => s.categoria === tab)),
    [items, tab],
  );

  const pendientes = filtrado.filter((s) => s.estado === 'pendiente');
  const aprobadas = filtrado.filter((s) => s.estado === 'aprobada');
  const rechazadas = filtrado.filter((s) => s.estado === 'rechazada');
  const alta = pendientes.filter((s) => s.prioridad === 'alta').length;

  // KPIs globales (no filtrados)
  const pendientesTotal = items.filter((s) => s.estado === 'pendiente').length;
  const altaTotal = items.filter((s) => s.estado === 'pendiente' && s.prioridad === 'alta').length;
  const aprobadasMes = items.filter((s) => s.estado === 'aprobada').length;

  // Conteos por categoría
  const countLic = items.filter(
    (s) => s.categoria === 'licencia' && s.estado === 'pendiente',
  ).length;
  const countAsc = items.filter(
    (s) => s.categoria === 'ascenso' && s.estado === 'pendiente',
  ).length;
  const countSan = items.filter(
    (s) => s.categoria === 'sancion' && s.estado === 'pendiente',
  ).length;

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <PageHero
        objetivo="Vista Mando · Aprobaciones"
        titulo={
          pendientesTotal === 0
            ? 'Nada para decidir hoy'
            : `${pendientesTotal} ${pendientesTotal === 1 ? 'decisión espera' : 'decisiones esperan'} tu firma`
        }
        descripcion="Cada decisión queda firmada con tu nombre, fecha y motivo. Doble revisión obligatoria en sanciones."
        icono={<ClipboardCheck size={26} />}
        variant={altaTotal > 0 ? 'critical' : pendientesTotal === 0 ? 'success' : 'default'}
        meta={
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Kpi
              label="En tu mesa"
              value={pendientesTotal}
              hint="esperan"
              intent={pendientesTotal > 0 ? 'warn' : 'ok'}
            />
            <Kpi
              label="Alta prioridad"
              value={altaTotal}
              hint="médicas/urgentes"
              intent={altaTotal > 0 ? 'risk' : 'ok'}
            />
            <Kpi label="Aprobadas mes" value={aprobadasMes} intent="ok" />
            <Kpi label="Tiempo medio" value={14} hint="min por decisión" intent="brand" />
          </div>
        }
      />

      {/* Servicios sin firma — REAL, conectado al store. Validar baja el Tablero. */}
      {serviciosPend.length > 0 && (
        <Card className="border-status-warn/40 bg-status-warn-bg/15 border-2">
          <CardContent className="p-4">
            <h3 className="text-status-warn-fg flex items-center gap-2 text-sm font-black uppercase tracking-wide">
              <FileSignature size={16} />
              {serviciosPend.length} servicio{serviciosPend.length === 1 ? '' : 's'} sin tu firma
            </h3>
            <p className="mt-0.5 text-xs text-slate-600">
              Partes cargados por los bomberos que esperan tu validación. Al firmar, bajan del
              Tablero del Comandante y suman al cómputo del mes.
            </p>
            <div className="mt-3 space-y-2">
              {serviciosPend.map((s) => (
                <div
                  key={s.id}
                  className="ring-status-warn/15 flex flex-col gap-2 rounded-xl bg-white p-3 ring-1 sm:flex-row sm:items-center"
                >
                  <div className="bg-fire-600 grid h-9 w-9 shrink-0 place-items-center rounded-lg text-white">
                    <Flame size={16} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900">
                        {tipoServicioLabel[s.tipo]}
                      </span>
                      <span className="text-xs text-slate-500">
                        · {s.dotacionIds.length} en dotación
                      </span>
                    </div>
                    <div className="truncate text-sm text-slate-600">{s.direccion}</div>
                    <div className="mt-0.5 flex items-center gap-1 text-[11px] text-slate-500">
                      <Clock size={10} /> {fmtFechaHora(s.horaSalida)}
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <Button intent="success" size="sm" onClick={() => validarParte(s.id)}>
                      <Check size={14} /> Validar
                    </Button>
                    <Button
                      intent="secondary"
                      size="sm"
                      onClick={() => rechazarParte(s.id)}
                      aria-label={`Devolver el parte de ${tipoServicioLabel[s.tipo]} en ${s.direccion}`}
                    >
                      <X size={14} /> Devolver
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs value={tab} onChange={(v) => setTab(v as 'todas' | Categoria)}>
        <TabsList>
          <TabsTrigger value="todas">Todas ({items.length})</TabsTrigger>
          <TabsTrigger value="licencia">
            <span className="inline-flex items-center gap-1.5">
              <Calendar size={12} /> Licencias ({countLic})
            </span>
          </TabsTrigger>
          <TabsTrigger value="ascenso">
            <span className="inline-flex items-center gap-1.5">
              <TrendingUp size={12} /> Ascensos ({countAsc})
            </span>
          </TabsTrigger>
          <TabsTrigger value="sancion">
            <span className="inline-flex items-center gap-1.5">
              <ShieldAlert size={12} /> Sanciones ({countSan})
            </span>
          </TabsTrigger>
        </TabsList>

        {/* Una sola TabsContent que se renderiza siempre — el filtrado ya está hecho */}
        <TabsContent value={tab} className="space-y-4">
          {tab === 'sancion' && (
            <Card className="bg-status-risk-bg/40 border-status-risk/30 border-2">
              <CardContent className="flex items-start gap-3 p-4 text-sm">
                <ShieldAlert size={18} className="text-status-risk-fg mt-0.5 shrink-0" />
                <div>
                  <strong className="text-status-risk-fg">
                    Las sanciones requieren doble revisión
                  </strong>
                  <p className="text-status-risk-fg/80 mt-0.5">
                    Además de tu firma, el Comandante debe aprobar antes de que se aplique. Las
                    decisiones quedan registradas de forma permanente.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="-mx-4 grid snap-x snap-mandatory auto-cols-[85%] grid-flow-col gap-3 overflow-x-auto px-4 pb-2 sm:auto-cols-[60%] lg:mx-0 lg:auto-cols-auto lg:grid-flow-row lg:grid-cols-3 lg:gap-4 lg:px-0 lg:pb-0">
            {(['pendiente', 'aprobada', 'rechazada'] as const).map((estado) => {
              const col = COL_STYLE[estado];
              const lista =
                estado === 'pendiente'
                  ? pendientes
                  : estado === 'aprobada'
                    ? aprobadas
                    : rechazadas;
              return (
                <div
                  key={estado}
                  className={cn('snap-start rounded-2xl p-3 ring-1 lg:snap-none', col.bg, col.ring)}
                >
                  <div
                    className={cn(
                      'mb-3 flex items-center gap-2 px-1 text-sm font-bold',
                      col.accent,
                    )}
                  >
                    {col.icon}
                    <span>{col.label}</span>
                    {estado === 'pendiente' && alta > 0 && (
                      <span className="bg-status-risk-bg text-status-risk-fg rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase">
                        {alta} urg
                      </span>
                    )}
                    <span className="ml-auto rounded-full bg-white/80 px-2 py-0.5 text-xs tabular-nums text-slate-700">
                      {lista.length}
                    </span>
                  </div>

                  <div className="space-y-2">
                    {lista.length === 0 && (
                      <div className="rounded-xl border border-dashed border-slate-300 bg-white/50 p-6 text-center text-xs text-slate-500">
                        {estado === 'pendiente' && '🎉 Sin pendientes — todo decidido.'}
                        {estado === 'aprobada' && 'Sin aprobadas este mes.'}
                        {estado === 'rechazada' && 'Sin rechazos. Bien.'}
                      </div>
                    )}

                    {lista.map((s) => (
                      <Card key={s.id} className="overflow-hidden bg-white">
                        <CardContent className="p-3">
                          <div className="flex items-start gap-2.5">
                            <Avatar name={s.persona} size={36} />
                            <div className="min-w-0 flex-1">
                              <div className="flex items-baseline gap-2">
                                <span className="truncate font-semibold text-slate-900">
                                  {s.persona}
                                </span>
                                <span className="shrink-0 font-mono text-[11px] text-slate-500">
                                  {s.legajo}
                                </span>
                              </div>
                              <div className="mt-0.5 flex items-center gap-1.5">
                                <span
                                  className={cn(
                                    'inline-flex h-5 items-center rounded px-1.5 text-[10px] font-semibold uppercase',
                                    CAT_COLOR[s.categoria],
                                  )}
                                >
                                  {CAT_LABEL[s.categoria]}
                                </span>
                                {s.prioridad === 'alta' && estado === 'pendiente' && (
                                  <span className="bg-status-risk-bg text-status-risk-fg inline-flex h-5 items-center rounded px-1.5 text-[10px] font-semibold uppercase">
                                    Urgente
                                  </span>
                                )}
                              </div>
                              <div className="mt-1.5 text-sm text-slate-700">{s.tipo}</div>
                              <div className="mt-0.5 text-xs text-slate-600">{s.detalle}</div>
                              <div className="mt-1.5 flex items-center gap-1 text-[11px] text-slate-500">
                                <Calendar size={10} /> Presentada {s.fecha}
                              </div>
                            </div>
                          </div>

                          {estado === 'pendiente' && (
                            <div className="mt-3 flex gap-2 border-t border-slate-100 pt-3">
                              <Button
                                intent="success"
                                size="sm"
                                fullWidth
                                onClick={() => decidir(s.id, 'aprobar')}
                              >
                                <Check size={14} /> Aprobar
                              </Button>
                              <Button
                                intent="secondary"
                                size="sm"
                                onClick={() => decidir(s.id, 'rechazar')}
                                aria-label={`Rechazar solicitud de ${s.persona}`}
                              >
                                <X size={14} /> Rechazar
                              </Button>
                            </div>
                          )}

                          {estado !== 'pendiente' && (
                            <div className="mt-2 flex items-center gap-1.5 text-[11px] text-slate-500">
                              <ShieldCheck size={10} className={col.accent} /> Firmada y registrada
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>

      <Card className="border-slate-200 bg-slate-50">
        <CardContent className="flex items-start gap-3 p-4 text-sm text-slate-700">
          <Badge intent="brand">Doble revisión</Badge>
          <div>
            Toda aprobación queda con <strong>tu nombre</strong>, fecha exacta y motivo. Si
            rechazás, escribís el motivo y la persona lo recibe por notificación. Las sanciones
            requieren además aprobación del Comandante.
          </div>
        </CardContent>
      </Card>

      <Dialog
        open={!!motivoDialog}
        onClose={cerrarMotivoDialog}
        title={motivoDialog?.accion === 'aprobar' ? 'Motivo de aprobación' : 'Motivo del rechazo'}
        description={
          motivoDialog?.accion === 'aprobar'
            ? 'Estás aprobando una sanción. Queda registrado con tu firma.'
            : 'Queda registrado y la persona lo recibe por notificación.'
        }
        size="sm"
        footer={
          <div className="flex justify-end gap-2">
            <Button intent="ghost" onClick={cerrarMotivoDialog}>
              Cancelar
            </Button>
            <Button
              intent={motivoDialog?.accion === 'aprobar' ? 'primary' : 'danger'}
              onClick={confirmarConMotivo}
            >
              Confirmar
            </Button>
          </div>
        }
      >
        <div className="space-y-2">
          <Label>Motivo *</Label>
          <Textarea
            value={motivoTexto}
            onChange={(e) => setMotivoTexto(e.target.value)}
            rows={3}
            placeholder={
              motivoDialog?.accion === 'aprobar'
                ? 'Ej: Cumple antigüedad y curso de mando aprobado'
                : 'Ej: Documentación incompleta, falta certificado médico'
            }
          />
          <p className="text-xs text-slate-500">Mínimo 4 caracteres.</p>
        </div>
      </Dialog>
    </div>
  );
}
