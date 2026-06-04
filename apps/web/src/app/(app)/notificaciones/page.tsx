'use client';

import { Bell, BellOff, CheckCheck, ChevronRight, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';

import type { Notificacion } from '@faro/types';

import { Badge, Card, CardContent, Kpi, cn, useToast } from '@faro/ui';

import { EmptyState } from '../../../components/shared/empty-state';
import { PageHero } from '../../../components/shared/page-hero';
import { FiltersBar, type FilterChip } from '../../../components/shared/filters-bar';
import { TIPOS_NOTIF } from '../../../data/notificaciones';
import { fmtFechaHora } from '../../../lib/utils/date';
import { demoToday } from '../../../lib/utils/demo-today';
import { useFaroStore } from '../../../store/use-faro-store';

type TabFiltro = 'todas' | 'sin_leer' | string;

function fechaRelativa(iso: string): string {
  const d = new Date(iso).getTime();
  const ahora = demoToday().getTime();
  const diff = ahora - d;
  const min = Math.floor(diff / 60_000);
  if (min < 60) return `hace ${min} min`;
  const hs = Math.floor(min / 60);
  if (hs < 24) return `hace ${hs} h`;
  const dias = Math.floor(hs / 24);
  if (dias < 7) return `hace ${dias} d`;
  return fmtFechaHora(iso);
}

export default function NotificacionesPage() {
  const notificaciones = useFaroStore((s) => s.notificaciones);
  const marcarLeida = useFaroStore((s) => s.marcarNotifLeida);
  const marcarTodas = useFaroStore((s) => s.marcarTodasLeidas);
  const toast = useToast();
  const [tab, setTab] = useState<TabFiltro>('todas');

  const sinLeer = notificaciones.filter((n) => !n.leida);
  const porTipo = useMemo(() => {
    const m = new Map<string, Notificacion[]>();
    for (const n of notificaciones) {
      const arr = m.get(n.tipo) ?? [];
      arr.push(n);
      m.set(n.tipo, arr);
    }
    return m;
  }, [notificaciones]);

  const filtradas = useMemo(() => {
    if (tab === 'todas') return notificaciones;
    if (tab === 'sin_leer') return sinLeer;
    return notificaciones.filter((n) => n.tipo === tab);
  }, [tab, notificaciones, sinLeer]);

  const todayStr = demoToday().toISOString().slice(0, 10);
  const top3 = sinLeer.slice(0, 3);

  const tiposConCantidad = Array.from(porTipo.entries())
    .filter(([, arr]) => arr.length > 0)
    .map(([tipo, arr]) => ({ tipo, cantidad: arr.length }));

  const chips: FilterChip<TabFiltro>[] = [
    { value: 'todas', label: 'Todas', count: notificaciones.length },
    {
      value: 'sin_leer',
      label: 'Sin leer',
      count: sinLeer.length,
      intent: sinLeer.length > 0 ? 'warn' : 'ok',
    },
    ...tiposConCantidad.map(({ tipo, cantidad }) => ({
      value: tipo,
      label: TIPOS_NOTIF[tipo as keyof typeof TIPOS_NOTIF]?.label ?? tipo,
      count: cantidad,
    })),
  ];

  function abrir(n: Notificacion) {
    if (!n.leida) marcarLeida(n.id);
  }

  function marcarTodasYToast() {
    marcarTodas();
    toast.push({ kind: 'success', title: 'Todas marcadas como leídas' });
  }

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <PageHero
        objetivo="Centro de notificaciones"
        titulo={
          sinLeer.length === 0
            ? 'Todo al día'
            : `${sinLeer.length} ${sinLeer.length === 1 ? 'aviso sin leer' : 'avisos sin leer'}`
        }
        descripcion="Lo que importa, priorizado por IA. Click en una notificación te lleva a la página de origen."
        icono={<Bell size={26} />}
        variant={sinLeer.length === 0 ? 'success' : 'default'}
        acciones={
          sinLeer.length > 0 ? (
            <button
              type="button"
              onClick={marcarTodasYToast}
              className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:border-slate-300"
            >
              <CheckCheck size={14} /> Marcar todas leídas
            </button>
          ) : undefined
        }
        meta={
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Kpi label="Total" value={notificaciones.length} intent="neutral" />
            <Kpi
              label="Sin leer"
              value={sinLeer.length}
              intent={sinLeer.length > 0 ? 'warn' : 'ok'}
              icon={<Bell size={16} />}
            />
            <Kpi
              label="Hoy"
              value={notificaciones.filter((n) => n.fecha.startsWith(todayStr)).length}
              intent="brand"
            />
            <Kpi label="Canales" value="Push + Mail" hint="WhatsApp opt-in" intent="ok" />
          </div>
        }
      />

      {top3.length > 0 && (
        <Card className="border-brand-200 from-brand-50 overflow-hidden border-2 bg-gradient-to-br to-white">
          <CardContent className="p-5">
            <div className="mb-3 flex items-center gap-2">
              <div className="bg-brand-600 grid h-9 w-9 place-items-center rounded-lg text-white">
                <Sparkles size={16} />
              </div>
              <div>
                <div className="font-bold text-slate-900">Priorización IA</div>
                <div className="text-xs text-slate-600">
                  De {sinLeer.length} sin leer, esto es lo que mira primero el copiloto:
                </div>
              </div>
            </div>
            <ol className="space-y-2">
              {top3.map((n, idx) => {
                const t = TIPOS_NOTIF[n.tipo as keyof typeof TIPOS_NOTIF];
                return (
                  <li
                    key={n.id}
                    className="flex items-start gap-3 rounded-lg bg-white p-3 ring-1 ring-slate-100"
                  >
                    <div className="bg-brand-600 grid h-6 w-6 shrink-0 place-items-center rounded-full text-[11px] font-bold text-white">
                      {idx + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-semibold text-slate-900">
                        {t?.icon} {n.titulo}
                      </div>
                      <div className="mt-0.5 line-clamp-1 text-xs text-slate-600">
                        {n.descripcion}
                      </div>
                    </div>
                    {n.linkPagina && (
                      <Link
                        href={n.linkPagina as never}
                        onClick={() => abrir(n)}
                        className="text-brand-700 hover:text-brand-900 shrink-0 text-xs font-semibold"
                      >
                        Ir →
                      </Link>
                    )}
                  </li>
                );
              })}
            </ol>
          </CardContent>
        </Card>
      )}

      <FiltersBar chips={chips} chipValue={tab} onChipChange={setTab} />

      {filtradas.length === 0 ? (
        <EmptyState
          icon={<BellOff size={28} />}
          titulo={tab === 'sin_leer' ? 'Todo al día' : 'Sin notificaciones'}
          descripcion={
            tab === 'sin_leer'
              ? 'No tenés notificaciones sin leer. Volvé más tarde.'
              : 'Sin notificaciones de este tipo en los últimos 30 días.'
          }
          variant={tab === 'sin_leer' ? 'success' : 'default'}
          accionSecundaria={
            tab !== 'todas' ? { label: 'Ver todas', onClick: () => setTab('todas') } : undefined
          }
        />
      ) : (
        <div className="space-y-2">
          {filtradas.map((n) => {
            const t = TIPOS_NOTIF[n.tipo as keyof typeof TIPOS_NOTIF];
            return (
              <Card
                key={n.id}
                className={cn(
                  'overflow-hidden border-l-4 transition-colors',
                  n.leida ? 'border-l-slate-200' : 'border-l-brand-600',
                )}
              >
                {n.linkPagina ? (
                  <Link href={n.linkPagina as never} onClick={() => abrir(n)} className="block">
                    <NotifBody n={n} t={t} />
                  </Link>
                ) : (
                  <button type="button" onClick={() => abrir(n)} className="block w-full text-left">
                    <NotifBody n={n} t={t} />
                  </button>
                )}
              </Card>
            );
          })}
        </div>
      )}

      <Card className="border-slate-200 bg-slate-50">
        <CardContent className="flex items-start gap-3 p-4 text-sm text-slate-600">
          <Bell size={18} className="mt-0.5 shrink-0 text-slate-500" />
          <div>
            <strong className="text-slate-900">Configurás los canales por tipo</strong> desde
            <Link
              href="/mi-perfil"
              className="text-brand-700 hover:text-brand-900 ml-1 font-medium"
            >
              Mi perfil
            </Link>
            . Push siempre activo; WhatsApp y mail por opt-in.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function NotifBody({
  n,
  t,
}: {
  n: Notificacion;
  t: { label: string; icon: string; color: string } | undefined;
}) {
  return (
    <div className={cn('flex items-start gap-3 p-4', !n.leida && 'bg-brand-50/30')}>
      <div
        className={cn(
          'grid h-11 w-11 shrink-0 place-items-center rounded-xl text-lg text-white',
          t?.color ?? 'bg-slate-400',
        )}
      >
        {t?.icon ?? '🔔'}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          {t && <Badge intent="neutral">{t.label}</Badge>}
          {!n.leida && (
            <span className="bg-brand-600 inline-flex h-2 w-2 rounded-full" title="Sin leer" />
          )}
        </div>
        <div
          className={cn(
            'mt-1 text-sm',
            n.leida ? 'font-medium text-slate-700' : 'font-bold text-slate-900',
          )}
        >
          {n.titulo}
        </div>
        <div className="mt-0.5 text-xs text-slate-600">{n.descripcion}</div>
        <div className="mt-1 text-[11px] text-slate-500">{fechaRelativa(n.fecha)}</div>
      </div>
      <ChevronRight size={16} className="shrink-0 text-slate-500" />
    </div>
  );
}
