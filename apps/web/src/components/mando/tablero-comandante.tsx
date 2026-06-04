'use client';

import {
  AlertTriangle,
  Ban,
  ClipboardCheck,
  FileCheck2,
  FileSignature,
  Gauge,
  HeartPulse,
  PiggyBank,
  ShieldCheck,
  Stethoscope,
  Users,
  type LucideIcon,
} from 'lucide-react';
import Link from 'next/link';
import { useMemo } from 'react';

import type { Rendicion } from '@faro/types';

import { Card, CardContent, Kpi, cn } from '@faro/ui';

import { calcularCumplimiento } from '../../lib/utils/cumplimiento';
import {
  selectCuartelActivo,
  selectRendicionActual,
  useFaroStore,
} from '../../store/use-faro-store';
import { arsCompact } from '../finanzas/utils';

const REND_LABEL: Record<Rendicion['estado'], string> = {
  borrador: 'En borrador',
  lista_para_presentar: 'Lista para presentar',
  presentada: 'Presentada',
  rechazada: 'Rechazada',
};

interface Pendiente {
  icon: LucideIcon;
  label: string;
  n: number;
  href: string;
  tone: 'warn' | 'risk';
  sub?: string;
}

/**
 * Tablero del Comandante: la foto del cuartel + la bandeja "Requiere tu
 * atención", en una sola pantalla. Responde al test del jefe de cuerpo:
 * "no me hagas caminar 6 pantallas para saber cómo está el cuartel y qué me
 * está esperando a mí". Todo se calcula de slices que ya existen en el store.
 */
export function TableroComandante() {
  const cuartel = useFaroStore(selectCuartelActivo);
  const personas = useFaroStore((s) => s.personas);
  const fichajes = useFaroStore((s) => s.fichajes);
  const tareas = useFaroStore((s) => s.tareas);
  const lesiones = useFaroStore((s) => s.lesiones);
  const cajas = useFaroStore((s) => s.cajas);
  const servicios = useFaroStore((s) => s.servicios);
  const rendicion = useFaroStore(selectRendicionActual);

  const f = useMemo(() => {
    const cid = cuartel?.id;
    const activas = personas.filter(
      (p) => p.cuartelId === cid && p.estado === 'activo' && p.cuerpo !== 'administrativo',
    );
    const cumpl = activas.map((p) => calcularCumplimiento(p.id));
    const cumplProm = cumpl.length
      ? Math.round(cumpl.reduce((a, c) => a + c.global, 0) / cumpl.length)
      : 0;
    const sinApto = cumpl.filter((c) => !c.certificadoMedico).length;
    const presentes = fichajes.filter((x) => x.cuartelId === cid && !x.egreso).length;
    const tc = tareas.filter((x) => x.cuartelId === cid);
    const aValidar = tc.filter((x) => x.estado === 'hecha').length;
    const trabadas = tc.filter((x) => x.estado === 'bloqueada').length;
    const lesNuevas = lesiones.filter(
      (l) => l.cuartelId === cid && l.estado === 'reportada',
    ).length;
    const firmas = servicios.filter(
      (x) => x.cuartelId === cid && x.estado === 'pendiente_validacion',
    ).length;
    const saldo = cajas
      .filter((c) => c.cuartelId === cid && c.moneda === 'ARS' && c.activa)
      .reduce((a, c) => a + c.saldoActual, 0);
    return { cumplProm, sinApto, presentes, aValidar, trabadas, lesNuevas, firmas, saldo };
  }, [cuartel?.id, personas, fichajes, tareas, lesiones, cajas, servicios]);

  const rendPendiente = rendicion ? rendicion.estado !== 'presentada' : false;

  const pendientes: Pendiente[] = [
    f.firmas > 0 && {
      icon: FileSignature,
      label: 'Servicios sin tu firma',
      n: f.firmas,
      href: '/mando/aprobaciones',
      tone: 'warn' as const,
    },
    f.aValidar > 0 && {
      icon: ClipboardCheck,
      label: 'Tareas para validar',
      n: f.aValidar,
      href: '/mando/tareas',
      tone: 'warn' as const,
    },
    f.trabadas > 0 && {
      icon: Ban,
      label: 'Tareas trabadas',
      n: f.trabadas,
      href: '/mando/tareas',
      tone: 'risk' as const,
    },
    f.lesNuevas > 0 && {
      icon: HeartPulse,
      label: 'Lesiones sin seguimiento',
      n: f.lesNuevas,
      href: '/mando/lesiones',
      tone: 'risk' as const,
    },
    f.sinApto > 0 && {
      icon: Stethoscope,
      label: 'Sin apto médico vigente',
      n: f.sinApto,
      href: '/mando/personal/cumplimiento',
      tone: 'risk' as const,
    },
    rendPendiente &&
      rendicion && {
        icon: FileCheck2,
        label: 'Rendición sin presentar',
        n: 1,
        href: '/mando/rendicion',
        tone: 'warn' as const,
        sub: REND_LABEL[rendicion.estado],
      },
  ].filter(Boolean) as Pendiente[];

  return (
    <Card className="border-brand-100 border-2">
      <CardContent className="space-y-4 p-4">
        {/* La foto del cuartel */}
        <div>
          <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">
            El cuartel hoy
          </h3>
          <div className="grid grid-cols-3 gap-2">
            <Kpi
              label="Presentes"
              value={f.presentes}
              hint="ahora"
              intent={f.presentes > 0 ? 'ok' : 'neutral'}
              icon={<Users size={16} />}
            />
            <Kpi
              label="Cumplimiento"
              value={`${f.cumplProm}%`}
              hint="promedio"
              intent={f.cumplProm >= 80 ? 'ok' : f.cumplProm >= 60 ? 'warn' : 'risk'}
              icon={<Gauge size={16} />}
            />
            <Kpi
              label="Caja"
              value={arsCompact(f.saldo)}
              hint="saldo ARS"
              intent="brand"
              icon={<PiggyBank size={16} />}
            />
          </div>
        </div>

        {/* Requiere tu atención */}
        <div>
          <h3 className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-slate-500">
            <AlertTriangle size={13} className="text-status-warn-fg" /> Requiere tu atención
          </h3>
          {pendientes.length === 0 ? (
            <div className="bg-status-ok-bg/30 text-status-ok-fg flex items-center gap-2 rounded-xl px-3 py-3 text-sm font-medium">
              <ShieldCheck size={18} /> Todo bajo control. No hay nada esperándote.
            </div>
          ) : (
            <div className="space-y-1.5">
              {pendientes.map((p) => {
                const Icon = p.icon;
                return (
                  <Link
                    key={p.label}
                    href={p.href}
                    className={cn(
                      'flex items-center gap-3 rounded-xl border p-3 transition-colors hover:bg-slate-50',
                      p.tone === 'risk' ? 'border-status-risk/30' : 'border-status-warn/30',
                    )}
                  >
                    <div
                      className={cn(
                        'grid h-9 w-9 shrink-0 place-items-center rounded-lg text-white',
                        p.tone === 'risk' ? 'bg-status-risk' : 'bg-status-warn',
                      )}
                    >
                      <Icon size={18} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-slate-900">{p.label}</div>
                      {p.sub && <div className="text-xs text-slate-500">{p.sub}</div>}
                    </div>
                    <div
                      className={cn(
                        'grid h-7 min-w-7 place-items-center rounded-full px-2 text-sm font-bold text-white',
                        p.tone === 'risk' ? 'bg-status-risk' : 'bg-status-warn',
                      )}
                    >
                      {p.n}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
