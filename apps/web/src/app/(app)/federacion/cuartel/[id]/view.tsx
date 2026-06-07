'use client';

import { Badge, Button, Card, CardContent, Kpi, cn, useToast } from '@faro/ui';
import { ArrowLeft, CalendarClock, Clock, Droplets, Flag, Send, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useMemo } from 'react';

import { ORGANISMO_LABEL } from '../../../../../components/federacion/finanzas-utils';
import { aireIntent, ars, arsCompact } from '../../../../../components/finanzas/utils';
import { EmptyState } from '../../../../../components/shared/empty-state';
import { finanzasRedMock } from '../../../../../data/finanzas-red';
import { finanzasCuartel } from '../../../../../lib/utils/finanzas-red';
import { useFaroStore } from '../../../../../store/use-faro-store';

const VENTANA_DIAS = 120;

const SALUD_CHIP: Record<
  'ok' | 'warn' | 'risk',
  { label: string; intent: 'ok' | 'warn' | 'risk' }
> = {
  ok: { label: 'Sana', intent: 'ok' },
  warn: { label: 'Atención', intent: 'warn' },
  risk: { label: 'En riesgo', intent: 'risk' },
};

export default function FichaCuartelFederacion() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const toast = useToast();
  const cuarteles = useFaroStore((s) => s.cuarteles);
  const enviarComunicadoFed = useFaroStore((s) => s.enviarComunicadoFed);

  const cuartel = cuarteles.find((c) => c.id === params.id);

  const fin = useMemo(() => (cuartel ? finanzasCuartel(cuartel) : null), [cuartel]);
  const subsidios = useMemo(() => {
    const fr = finanzasRedMock.find((x) => x.cuartelId === params.id);
    const caja = fin?.caja ?? fr?.caja ?? 0;
    const items = (fr?.subsidios ?? []).map((s) => {
      const porEjecutar = Math.max(0, s.otorgado - s.ejecutado);
      const pct = s.otorgado > 0 ? (s.ejecutado / s.otorgado) * 100 : 0;
      const pctTiempo = Math.min(100, Math.max(0, (1 - s.venceEnDias / VENTANA_DIAS) * 100));
      return {
        ...s,
        porEjecutar,
        pct,
        pctTiempo,
        atrasado: pct < pctTiempo - 6 && porEjecutar > 0,
      };
    });
    const otorgado = items.reduce((a, s) => a + s.otorgado, 0);
    const ejecutado = items.reduce((a, s) => a + s.ejecutado, 0);
    const porEjecutar = Math.max(0, otorgado - ejecutado);
    const ejecPct = otorgado > 0 ? (ejecutado / otorgado) * 100 : 0;
    const venceMasPronto = items
      .filter((s) => s.porEjecutar > 0)
      .reduce((m, s) => Math.min(m, s.venceEnDias), Infinity);
    return { items, otorgado, porEjecutar, ejecPct, caja, venceMasPronto };
  }, [params.id, fin]);

  if (!cuartel || !fin) {
    return (
      <div className="mx-auto max-w-4xl space-y-5">
        <Link
          href="/federacion"
          className="hover:text-brand-700 inline-flex items-center gap-1 text-sm text-slate-500"
        >
          <ArrowLeft size={14} /> Volver a Federación
        </Link>
        <EmptyState
          icon={<Flag size={28} />}
          titulo="Cuartel no encontrado"
          descripcion={`No existe un cuartel con id ${params.id}.`}
          variant="warning"
          accion={{ label: 'Volver', onClick: () => router.push('/federacion') }}
        />
      </div>
    );
  }

  const chip = SALUD_CHIP[fin.salud];

  function recordar() {
    if (!cuartel) return;
    enviarComunicadoFed({
      asunto: `Subsidio por ejecutar (vence en ${subsidios.venceMasPronto} días)`,
      cuerpo: `Tenés ${ars.format(subsidios.porEjecutar)} de subsidio otorgado sin ejecutar. Lo que no se ejecuta a tiempo se devuelve — coordiná la inversión.`,
      region: cuartel.region,
      canales: ['push'],
      prioridad: 'alta',
    });
    toast.push({
      kind: 'success',
      title: `Recordatorio enviado a ${cuartel.nombre}`,
      description: `${ars.format(subsidios.porEjecutar)} por ejecutar`,
    });
  }

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <Link
        href="/federacion"
        className="hover:text-brand-700 inline-flex items-center gap-1 text-sm text-slate-500"
      >
        <ArrowLeft size={14} /> Volver a Federación
      </Link>

      {/* Cabecera */}
      <Card>
        <CardContent className="p-5">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900">{cuartel.nombre}</h1>
            <Badge intent={chip.intent}>{chip.label}</Badge>
          </div>
          <div className="mt-0.5 text-sm text-slate-600">
            {cuartel.ciudad}, {cuartel.provincia} · {cuartel.region}
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Kpi label="Por ejecutar" value={arsCompact(subsidios.porEjecutar)} intent="brand" />
            <Kpi
              label="Ejecución"
              value={`${subsidios.ejecPct.toFixed(0)}%`}
              intent={subsidios.ejecPct >= 70 ? 'ok' : subsidios.ejecPct >= 45 ? 'warn' : 'risk'}
            />
            <Kpi
              label="Meses de aire"
              value={fin.mesesAire.toFixed(1).replace('.', ',')}
              intent={aireIntent(fin.mesesAire)}
              icon={<Clock size={16} />}
            />
            <Kpi
              label="Morosidad"
              value={`${fin.morosidadPct}%`}
              hint="cuotas"
              intent={fin.morosidadPct > 15 ? 'warn' : 'ok'}
            />
          </div>
        </CardContent>
      </Card>

      {/* Reloj de subsidios del cuartel */}
      <Card>
        <CardContent className="p-5">
          <h3 className="mb-3 flex items-center gap-2 font-bold text-slate-900">
            <CalendarClock size={18} className="text-brand-700" /> Subsidios · ejecución
          </h3>
          {subsidios.items.length === 0 ? (
            <p className="text-sm text-slate-500">Este cuartel no tiene subsidios cargados.</p>
          ) : (
            <ul className="space-y-3">
              {subsidios.items.map((s) => (
                <li key={s.organismo}>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold text-slate-900">
                      {ORGANISMO_LABEL[s.organismo]}
                    </span>
                    <span className="font-mono text-sm font-bold text-slate-900">
                      {ars.format(s.porEjecutar)}{' '}
                      <span className="text-xs font-normal text-slate-400">por ejecutar</span>
                    </span>
                  </div>
                  <div className="relative mt-1.5 h-2.5 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="absolute top-0 z-10 h-full w-0.5 bg-slate-500"
                      style={{ left: `${s.pctTiempo}%` }}
                      title={`${s.pctTiempo.toFixed(0)}% del plazo`}
                    />
                    <div
                      className={cn(
                        'h-full rounded-full',
                        s.atrasado ? 'bg-status-warn' : 'bg-status-ok',
                      )}
                      style={{ width: `${Math.min(100, s.pct)}%` }}
                    />
                  </div>
                  <div className="mt-1 flex justify-between text-[11px]">
                    <span className="text-slate-600">
                      Ejecutado <strong className="text-slate-900">{s.pct.toFixed(0)}%</strong>
                    </span>
                    <span
                      className={cn(s.venceEnDias < 15 ? 'text-status-risk-fg' : 'text-slate-500')}
                    >
                      vence en {s.venceEnDias} días
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <div className="mt-3 flex items-center gap-1.5 border-t border-slate-100 pt-3 text-sm text-slate-600">
            <Droplets size={14} className="text-slate-400" />
            {arsCompact(subsidios.caja)} en caja · ~{fin.mesesAire.toFixed(1).replace('.', ',')}{' '}
            meses de aire
          </div>
        </CardContent>
      </Card>

      {/* Acción de acompañamiento */}
      {subsidios.porEjecutar > 0 && (
        <Card className="border-brand-100 bg-brand-50/30 border-2">
          <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
            <div className="text-sm text-slate-700">
              Tiene <strong>{ars.format(subsidios.porEjecutar)}</strong> de subsidio sin ejecutar.
              Un recordatorio le avisa el plazo.
            </div>
            <Button intent="primary" size="sm" onClick={recordar}>
              <Send size={14} /> Recordar
            </Button>
          </CardContent>
        </Card>
      )}

      {/* No veo todo */}
      <Card className="border-slate-200 bg-slate-50">
        <CardContent className="flex items-start gap-3 p-4 text-sm text-slate-600">
          <ShieldCheck size={18} className="mt-0.5 shrink-0 text-slate-500" />
          <div>
            <strong className="text-slate-900">
              La Federación ve indicadores, no tus movimientos.
            </strong>{' '}
            Esta ficha muestra la salud financiera consolidada del cuartel (subsidios, caja, cuotas)
            — nunca el detalle de su caja interna ni su gestión operativa.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
