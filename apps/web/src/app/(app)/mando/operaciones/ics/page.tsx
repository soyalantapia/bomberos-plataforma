'use client';

import { motion } from 'framer-motion';
import {
  Activity,
  AlertCircle,
  ArrowLeft,
  Camera,
  CheckCircle2,
  ClipboardCheck,
  Clock,
  Megaphone,
  Radio,
  ShieldAlert,
  ShieldCheck,
  UserCog,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import { Avatar, Badge, Button, Card, CardContent, Kpi, cn, useToast } from '@faro/ui';

import { PageHero } from '../../../../../components/shared/page-hero';
import { useFaroStore } from '../../../../../store/use-faro-store';
import { demoToday } from '../../../../../lib/utils/demo-today';

type RolICS = 'comandante' | 'operaciones' | 'logistica' | 'seguridad' | 'informacion' | 'medico';

interface RolConfig {
  label: string;
  descripcion: string;
  icon: React.ReactNode;
  color: string;
  obligatorio: boolean;
}

const ROLES_ICS: Record<RolICS, RolConfig> = {
  comandante: {
    label: 'Comandante de Incidente',
    descripcion: 'Decisión final · liderazgo en escena',
    icon: <ShieldCheck size={18} />,
    color: 'bg-status-risk',
    obligatorio: true,
  },
  operaciones: {
    label: 'Operaciones',
    descripcion: 'Coordinación táctica con dotación',
    icon: <Activity size={18} />,
    color: 'bg-fire-600',
    obligatorio: true,
  },
  logistica: {
    label: 'Logística',
    descripcion: 'Equipo, refuerzos, suministros',
    icon: <ClipboardCheck size={18} />,
    color: 'bg-brand-600',
    obligatorio: false,
  },
  seguridad: {
    label: 'Oficial de Seguridad',
    descripcion: 'Riesgos, evacuación, zonas peligrosas',
    icon: <ShieldAlert size={18} />,
    color: 'bg-status-warn',
    obligatorio: true,
  },
  informacion: {
    label: 'Información pública',
    descripcion: 'Prensa, vecinos, autoridades',
    icon: <Megaphone size={18} />,
    color: 'bg-status-ok',
    obligatorio: false,
  },
  medico: {
    label: 'Coordinador Médico',
    descripcion: 'Triage, traslados, contacto hospitalario',
    icon: <UserCog size={18} />,
    color: 'bg-purple-600',
    obligatorio: false,
  },
};

const ROL_ORDEN: RolICS[] = [
  'comandante',
  'operaciones',
  'seguridad',
  'logistica',
  'informacion',
  'medico',
];

interface EventoICS {
  id: string;
  ts: string;
  tipo: 'rol_asignado' | 'rol_cambiado' | 'par' | 'orden' | 'cambio_mando';
  descripcion: string;
}

export default function ICSPage() {
  const personas = useFaroStore((s) => s.personas);
  const personasActivas = personas.filter((p) => p.estado === 'activo').slice(0, 12);

  const toast = useToast();

  const [asignaciones, setAsignaciones] = useState<Record<RolICS, string | null>>({
    comandante: personasActivas[0]?.id ?? null,
    operaciones: personasActivas[1]?.id ?? null,
    seguridad: personasActivas[2]?.id ?? null,
    logistica: null,
    informacion: null,
    medico: null,
  });

  const [eventos, setEventos] = useState<EventoICS[]>([
    {
      id: 'e-1',
      ts: '14:42',
      tipo: 'rol_asignado',
      descripcion: 'Mariana Pereyra asume Comandante de Incidente',
    },
    {
      id: 'e-2',
      ts: '14:43',
      tipo: 'rol_asignado',
      descripcion: 'Sebastián Ruiz asume Operaciones',
    },
    {
      id: 'e-3',
      ts: '14:44',
      tipo: 'rol_asignado',
      descripcion: 'Carolina Sosa asume Oficial de Seguridad',
    },
    {
      id: 'e-4',
      ts: '14:48',
      tipo: 'orden',
      descripcion: 'Operaciones: la primera dotación ingresa por el lado norte',
    },
  ]);

  // PAR timer: cada 20 minutos
  const [parSec, setParSec] = useState(0);
  const PAR_INTERVAL = 1200; // 20 min en seg

  useEffect(() => {
    const id = setInterval(() => setParSec((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const parRemaining = PAR_INTERVAL - (parSec % PAR_INTERVAL);
  const parMin = Math.floor(parRemaining / 60);
  const parSeg = parRemaining % 60;
  const parCritico = parRemaining < 60; // últimos 60s

  function asignar(rol: RolICS, personaId: string) {
    setAsignaciones((a) => ({ ...a, [rol]: personaId }));
    const persona = personas.find((p) => p.id === personaId);
    if (persona) {
      const ts = demoToday().toLocaleTimeString('es-AR').slice(0, 5);
      const nuevo: EventoICS = {
        id: `e-${Date.now()}`,
        ts,
        tipo: 'rol_asignado',
        descripcion: `${persona.nombre} ${persona.apellido} asume ${ROLES_ICS[rol].label}`,
      };
      setEventos((e) => [...e, nuevo]);
      toast.push({
        kind: 'success',
        title: 'Rol asignado',
        description: nuevo.descripcion,
      });
    }
  }

  function ejecutarPAR() {
    const ts = new Date().toLocaleTimeString('es-AR').slice(0, 5);
    const asignados = Object.values(asignaciones).filter(Boolean).length;
    const nuevo: EventoICS = {
      id: `e-${Date.now()}`,
      ts,
      tipo: 'par',
      descripcion: `Control de personal: ${asignados} bomberos confirmados. Todos OK.`,
    };
    setEventos((e) => [...e, nuevo]);
    setParSec(0);
    toast.push({
      kind: 'success',
      title: 'Control confirmado',
      description: `${asignados} bomberos verificados.`,
    });
  }

  const rolesAsignados = Object.values(asignaciones).filter(Boolean).length;
  const rolesObligatorios = (Object.entries(ROLES_ICS) as [RolICS, RolConfig][])
    .filter(([, c]) => c.obligatorio)
    .every(([r]) => asignaciones[r]);

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <Link
          href="/mando/operaciones"
          className="hover:text-brand-700 inline-flex items-center gap-1"
        >
          <ArrowLeft size={14} /> Volver a operaciones
        </Link>
      </div>

      <PageHero
        objetivo="Vista Mando · Comando de incidente"
        titulo="Incendio · Av. Mosconi 4521 · V. Devoto"
        descripcion="Sistema de Comando de Incidentes activo. Cada decisión queda registrada."
        icono={<ShieldCheck size={26} />}
        variant="critical"
        meta={
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Kpi
              label="Roles asignados"
              value={`${rolesAsignados}/6`}
              hint={rolesObligatorios ? 'todos asignados' : 'faltan obligatorios'}
              intent={rolesObligatorios ? 'ok' : 'warn'}
            />
            <Kpi
              label="Próximo control"
              value={`${parMin}:${parSeg.toString().padStart(2, '0')}`}
              hint="cada 20 min"
              intent={parCritico ? 'risk' : 'brand'}
            />
            <Kpi
              label="Bomberos en escena"
              value={rolesAsignados + 8}
              hint="acumulado"
              intent="brand"
            />
            <Kpi label="Tiempo activo" value="00:42" hint="hh:mm" intent="neutral" />
          </div>
        }
        acciones={
          <Button intent={parCritico ? 'primary' : 'secondary'} onClick={ejecutarPAR}>
            <ClipboardCheck size={14} /> Controlar bomberos
          </Button>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        {/* Roles ICS */}
        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            {ROL_ORDEN.map((rol) => {
              const cfg = ROLES_ICS[rol];
              const asignadoId = asignaciones[rol];
              const persona = personas.find((p) => p.id === asignadoId);
              return (
                <motion.div
                  key={rol}
                  layout
                  className={cn(
                    'rounded-xl border bg-white p-4',
                    asignadoId ? 'border-slate-200' : 'border-dashed border-slate-300',
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={cn(
                        'grid h-10 w-10 shrink-0 place-items-center rounded-xl text-white',
                        cfg.color,
                      )}
                    >
                      {cfg.icon}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{cfg.label}</span>
                        {cfg.obligatorio && <Badge intent="warn">Obligatorio</Badge>}
                      </div>
                      <p className="mt-0.5 text-xs text-slate-500">{cfg.descripcion}</p>

                      {persona ? (
                        <div className="bg-status-ok-bg/40 mt-2 flex items-center gap-2 rounded-md p-2">
                          <Avatar
                            name={`${persona.nombre} ${persona.apellido}`}
                            src={persona.fotoUrl}
                            size={28}
                          />
                          <div className="min-w-0 flex-1 text-sm">
                            <div className="truncate font-medium text-slate-900">
                              {persona.apellido}, {persona.nombre}
                            </div>
                            <div className="text-[10px] text-slate-500">
                              legajo {persona.legajo}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setAsignaciones((a) => ({ ...a, [rol]: null }))}
                            className="text-xs text-slate-500 hover:text-slate-700"
                          >
                            Liberar
                          </button>
                        </div>
                      ) : (
                        <div className="mt-2">
                          <select
                            className="focus:border-brand-400 focus:ring-brand-100 w-full rounded-md border border-slate-200 px-2 py-1.5 text-xs outline-none focus:ring-2"
                            onChange={(e) => {
                              if (e.target.value) asignar(rol, e.target.value);
                            }}
                            defaultValue=""
                          >
                            <option value="">Sin asignar...</option>
                            {personasActivas.map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.apellido}, {p.nombre} (legajo {p.legajo})
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Acciones rápidas */}
          <Card className="bg-brand-50/40 border-brand-100">
            <CardContent className="p-4">
              <div className="mb-3 flex items-center gap-2">
                <Radio size={16} className="text-brand-700 animate-pulse" />
                <span className="text-brand-900 font-bold">Acciones tácticas</span>
              </div>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                <Button
                  intent="secondary"
                  size="sm"
                  onClick={() =>
                    toast.push({
                      kind: 'info',
                      title: 'Orden emitida',
                      description: 'Notificación por radio y WhatsApp a 4 operativos',
                    })
                  }
                >
                  <Megaphone size={12} /> Orden a operativos
                </Button>
                <Button
                  intent="secondary"
                  size="sm"
                  onClick={() =>
                    toast.push({
                      kind: 'success',
                      title: 'Foto subida',
                      description: 'Adjunta al parte de servicio',
                    })
                  }
                >
                  <Camera size={12} /> Tomar foto de escena
                </Button>
                <Button
                  intent="secondary"
                  size="sm"
                  onClick={() =>
                    toast.push({
                      kind: 'warn',
                      title: 'Refuerzo solicitado',
                      description: 'Notificado al cuartel vecino San Andrés',
                    })
                  }
                >
                  <Users size={12} /> Pedir refuerzos
                </Button>
                <Button
                  intent="secondary"
                  size="sm"
                  onClick={() =>
                    toast.push({
                      kind: 'success',
                      title: 'Incidente cerrado',
                      description: 'Pasa a estado validación · 12 min en escena',
                    })
                  }
                >
                  <CheckCircle2 size={12} /> Cerrar incidente
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Timeline */}
        <Card>
          <CardContent className="p-0">
            <div className="border-b border-slate-100 px-4 py-3">
              <div className="flex items-center gap-2">
                <Clock size={14} className="text-brand-700" />
                <span className="font-bold text-slate-900">Línea de tiempo</span>
              </div>
              <div className="mt-0.5 text-[11px] text-slate-500">Queda guardado para siempre</div>
            </div>
            <ul className="divide-y divide-slate-100">
              {eventos.map((e) => (
                <motion.li
                  key={e.id}
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="px-4 py-2.5 text-sm"
                >
                  <div className="flex items-baseline gap-2">
                    <span className="shrink-0 font-mono text-xs text-slate-500">{e.ts}</span>
                    <Badge
                      intent={
                        e.tipo === 'par' ? 'ok' : e.tipo === 'rol_asignado' ? 'brand' : 'neutral'
                      }
                    >
                      {e.tipo === 'par'
                        ? 'Control'
                        : e.tipo === 'rol_asignado'
                          ? 'Rol asignado'
                          : e.tipo === 'rol_cambiado'
                            ? 'Rol cambiado'
                            : e.tipo === 'cambio_mando'
                              ? 'Cambio de mando'
                              : 'Orden'}
                    </Badge>
                  </div>
                  <p className="mt-1 text-xs text-slate-700">{e.descripcion}</p>
                </motion.li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {parCritico && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
          <Card className="border-status-risk/40 bg-status-risk-bg/30 border-2">
            <CardContent className="flex items-start gap-3 p-4">
              <AlertCircle size={20} className="text-status-risk-fg shrink-0 animate-pulse" />
              <div className="flex-1">
                <strong className="text-status-risk-fg">Control de personal</strong>
                <p className="text-status-risk-fg/80 text-sm">
                  En {parSeg}s se debe hacer el control · todos los bomberos en escena deben
                  confirmar estado. Tocá el botón "Controlar bomberos" arriba.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
