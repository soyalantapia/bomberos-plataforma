'use client';

import {
  Activity,
  ArrowLeft,
  CheckCircle2,
  FileCheck2,
  Flame,
  PiggyBank,
  Printer,
  Scale,
  Users,
  type LucideIcon,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useMemo } from 'react';

import type { TipoServicio } from '@faro/types';

import { Button, cn } from '@faro/ui';

import { VulcanoLogo } from '../../components/brand/vulcano-mark';

import {
  selectCuartelActivo,
  selectPersonaActual,
  selectRendicionActual,
  useFaroStore,
} from '../../store/use-faro-store';
import { calcularComputoMensual } from '../../lib/utils/computo';
import { calcularCumplimiento } from '../../lib/utils/cumplimiento';
import { calcularEquidadGenero } from '../../lib/utils/genero';
import { fmtFecha, fmtMesPeriodo, mesKey } from '../../lib/utils/date';
import { demoToday } from '../../lib/utils/demo-today';
import { fmtJerarquia } from '../../lib/utils/jerarquia';
import { tipoServicioLabel } from '../../lib/utils/tipo-servicio';
import { ars } from '../../components/finanzas/utils';

const TIPOS: TipoServicio[] = ['incendio', 'rescate', 'accidente', 'forestal', 'otro'];

const REND_LABEL: Record<string, string> = {
  borrador: 'En preparación',
  lista_para_presentar: 'Lista para presentar',
  presentada: 'Presentada',
  rechazada: 'Observada',
};

export default function InformePage() {
  const router = useRouter();
  const hidratado = useFaroStore((s) => s.hidratado);
  const cuartel = useFaroStore(selectCuartelActivo);
  const persona = useFaroStore(selectPersonaActual);
  const personas = useFaroStore((s) => s.personas);
  const servicios = useFaroStore((s) => s.servicios);
  const asistencias = useFaroStore((s) => s.asistencias);
  const movimientos = useFaroStore((s) => s.movimientos);
  const cajas = useFaroStore((s) => s.cajas);
  const rendicion = useFaroStore(selectRendicionActual);

  const periodo = mesKey(demoToday());

  const d = useMemo(() => {
    const cid = cuartel?.id;
    const activas = personas.filter((p) => p.cuartelId === cid && p.estado === 'activo');
    const operativas = activas.filter((p) => p.cuerpo !== 'administrativo');
    const admin = activas.length - operativas.length;
    const cumpl = operativas.map((p) => calcularCumplimiento(p.id));
    const cumplProm = cumpl.length
      ? Math.round(cumpl.reduce((a, c) => a + c.global, 0) / cumpl.length)
      : 0;
    const sinApto = cumpl.filter((c) => !c.certificadoMedico).length;

    const servs = servicios.filter(
      (s) => s.cuartelId === cid && s.horaSalida.slice(0, 7) === periodo,
    );
    const validados = servs.filter((s) => s.estado === 'validado').length;
    const porTipo = TIPOS.map((t) => ({ t, n: servs.filter((s) => s.tipo === t).length }))
      .filter((x) => x.n > 0)
      .sort((a, b) => b.n - a.n);

    const computo = calcularComputoMensual(asistencias, cid ?? '', periodo);
    const horas = Math.round(computo.reduce((a, c) => a + c.total, 0));

    const movs = movimientos.filter(
      (m) => m.cuartelId === cid && m.estado === 'conciliado' && m.fecha.slice(0, 7) === periodo,
    );
    const ingresos = movs.filter((m) => m.tipo === 'ingreso').reduce((a, m) => a + m.monto, 0);
    const egresos = movs.filter((m) => m.tipo === 'egreso').reduce((a, m) => a + m.monto, 0);
    const saldoCaja = cajas
      .filter((c) => c.cuartelId === cid && c.moneda === 'ARS' && c.activa)
      .reduce((a, c) => a + c.saldoActual, 0);

    const eq = calcularEquidadGenero(personas.filter((p) => p.cuartelId === cid));

    return {
      activas: activas.length,
      operativas: operativas.length,
      admin,
      cumplProm,
      sinApto,
      servicios: servs.length,
      validados,
      porTipo,
      horas,
      ingresos,
      egresos,
      neto: ingresos - egresos,
      saldoCaja,
      eq,
    };
  }, [cuartel?.id, personas, servicios, asistencias, movimientos, cajas, periodo]);

  if (!hidratado) {
    return (
      <div className="grid min-h-dvh place-items-center bg-slate-100 text-sm text-slate-500">
        Preparando el informe…
      </div>
    );
  }
  if (!cuartel || !persona) {
    return (
      <div className="grid min-h-dvh place-items-center bg-slate-100">
        <div className="text-center">
          <p className="text-sm text-slate-600">Necesitás una sesión activa para ver el informe.</p>
          <Button intent="primary" className="mt-3" onClick={() => router.push('/login')}>
            Ir a ingresar
          </Button>
        </div>
      </div>
    );
  }

  const rendPct = rendicion?.porcentaje ?? cuartel.porcentajeRendicion ?? 0;
  const rendEstado = rendicion ? (REND_LABEL[rendicion.estado] ?? rendicion.estado) : 'Sin datos';
  const emision = fmtFecha(demoToday().toISOString());
  const nroInforme = `${periodo.replace('-', '')}-${(cuartel.matricula ?? 'VLC').toString().slice(-4)}`;

  return (
    <div className="min-h-dvh bg-slate-100 pb-16">
      {/* Toolbar (no se imprime) */}
      <div className="no-print sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-[820px] items-center justify-between px-4 py-2.5">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100"
          >
            <ArrowLeft size={16} /> Volver
          </button>
          <div className="hidden text-xs text-slate-500 sm:block">
            Vista previa · listo para imprimir o guardar como PDF
          </div>
          <Button intent="primary" size="sm" onClick={() => window.print()}>
            <Printer size={16} /> Imprimir / Guardar PDF
          </Button>
        </div>
      </div>

      {/* Documento A4 */}
      <article className="informe-doc mx-auto my-6 max-w-[820px] overflow-hidden rounded-lg bg-white shadow-xl">
        {/* Cabecera institucional */}
        <header className="bg-brand-900 px-8 py-6 text-white sm:px-10">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <VulcanoLogo tile={48} className="rounded-xl shadow-lg" />
              <div>
                <div className="text-lg font-black leading-tight">
                  Cuerpo de Bomberos Voluntarios
                </div>
                <div className="text-sm text-white/80">{cuartel.nombre}</div>
                <div className="mt-0.5 text-xs text-white/60">
                  {cuartel.ciudad}, {cuartel.provincia}
                  {cuartel.matricula ? ` · Matrícula ${cuartel.matricula}` : ''}
                </div>
              </div>
            </div>
            <div className="shrink-0 text-right">
              <div className="text-[11px] font-bold uppercase tracking-widest text-white/50">
                Vulcano
              </div>
              <div className="mt-1 text-xs text-white/70">Informe N.º</div>
              <div className="font-mono text-sm font-semibold">{nroInforme}</div>
            </div>
          </div>
          <div className="mt-5 border-t border-white/15 pt-4">
            <h1 className="text-xl font-black tracking-tight sm:text-2xl">
              Informe mensual al Consejo Directivo
            </h1>
            <p className="mt-1 text-sm text-white/75">
              Período <span className="font-semibold capitalize">{fmtMesPeriodo(periodo)}</span> ·
              emitido el {emision}
            </p>
          </div>
        </header>

        <div className="space-y-7 px-8 py-7 sm:px-10">
          {/* Resumen ejecutivo */}
          <Section n={1} title="Resumen ejecutivo" icon={Activity}>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <Stat label="Dotación activa" value={d.activas} hint="bomberos" />
              <Stat
                label="Cumplimiento"
                value={`${d.cumplProm}%`}
                hint="promedio del cuerpo"
                tone={d.cumplProm >= 80 ? 'ok' : d.cumplProm >= 60 ? 'warn' : 'risk'}
              />
              <Stat
                label="Servicios del mes"
                value={d.servicios}
                hint={`${d.validados} validados`}
              />
              <Stat label="Horas trabajadas" value={`${d.horas}`} hint="hs acreditadas" />
              <Stat
                label="Avance rendición"
                value={`${rendPct}%`}
                hint={rendEstado}
                tone={rendPct >= 80 ? 'ok' : 'warn'}
              />
              <Stat
                label="Saldo en cajas"
                value={ars.format(d.saldoCaja)}
                hint="ARS disponible"
                tone="brand"
              />
            </div>
          </Section>

          {/* Actividad operativa */}
          <Section n={2} title="Actividad operativa" icon={Flame}>
            {d.porTipo.length === 0 ? (
              <p className="text-sm text-slate-500">Sin servicios registrados en el período.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
                    <th className="py-1.5 font-semibold">Tipo de servicio</th>
                    <th className="py-1.5 text-right font-semibold">Cantidad</th>
                    <th className="py-1.5 text-right font-semibold">Participación</th>
                  </tr>
                </thead>
                <tbody>
                  {d.porTipo.map(({ t, n }) => (
                    <tr key={t} className="border-b border-slate-100">
                      <td className="py-1.5 text-slate-800">{tipoServicioLabel[t]}</td>
                      <td className="py-1.5 text-right font-semibold tabular-nums text-slate-900">
                        {n}
                      </td>
                      <td className="py-1.5 text-right tabular-nums text-slate-500">
                        {Math.round((n / d.servicios) * 100)}%
                      </td>
                    </tr>
                  ))}
                  <tr className="font-bold text-slate-900">
                    <td className="py-2">Total</td>
                    <td className="py-2 text-right tabular-nums">{d.servicios}</td>
                    <td className="text-status-ok-fg py-2 text-right tabular-nums">
                      {d.validados} validados
                    </td>
                  </tr>
                </tbody>
              </table>
            )}
          </Section>

          {/* Personal y cumplimiento */}
          <Section n={3} title="Personal y cumplimiento" icon={Users}>
            <div className="grid gap-x-8 gap-y-2 sm:grid-cols-2">
              <KV label="Cuerpo activo (operativo)" value={`${d.operativas} bomberos`} />
              <KV label="Consejo Directivo / administrativo" value={`${d.admin} personas`} />
              <KV
                label="Cumplimiento promedio"
                value={`${d.cumplProm}%`}
                tone={d.cumplProm >= 80 ? 'ok' : d.cumplProm >= 60 ? 'warn' : 'risk'}
              />
              <KV
                label="Sin apto médico vigente"
                value={`${d.sinApto}`}
                tone={d.sinApto > 0 ? 'risk' : 'ok'}
              />
            </div>
            <div className="mt-3 flex items-start gap-2 rounded-lg bg-slate-50 p-3 text-sm">
              <Scale size={16} className="text-brand-700 mt-0.5 shrink-0" />
              <div className="text-slate-700">
                <span className="font-semibold">Equidad de género:</span> {d.eq.mujeres} mujeres y{' '}
                {d.eq.varones} varones en el cuerpo activo ({d.eq.pctMujeres}% mujeres).{' '}
                {d.eq.mujeresConduccion} en cuadro de conducción ({d.eq.pctMujeresConduccion}%).
              </div>
            </div>
          </Section>

          {/* Finanzas y rendición */}
          <Section n={4} title="Finanzas y rendición al Fondo" icon={PiggyBank}>
            <div className="grid gap-x-8 gap-y-2 sm:grid-cols-2">
              <KV label="Ingresos del período" value={ars.format(d.ingresos)} tone="ok" />
              <KV label="Egresos del período" value={ars.format(d.egresos)} tone="risk" />
              <KV
                label="Resultado neto"
                value={ars.format(d.neto)}
                tone={d.neto >= 0 ? 'ok' : 'risk'}
              />
              <KV label="Saldo en cajas y bancos" value={ars.format(d.saldoCaja)} />
            </div>
            <div className="mt-3 flex items-center gap-2 rounded-lg border border-slate-200 p-3 text-sm">
              <FileCheck2
                size={18}
                className={rendPct >= 80 ? 'text-status-ok-fg' : 'text-status-warn-fg'}
              />
              <div className="flex-1">
                <span className="font-semibold text-slate-900">Rendición Ley 25.054:</span>{' '}
                <span className="text-slate-700">
                  {rendEstado} · {rendPct}% de avance
                </span>
              </div>
            </div>
          </Section>

          {/* Cierre y firmas */}
          <section className="informe-section border-t border-slate-200 pt-6">
            <p className="text-sm leading-relaxed text-slate-700">
              Por el presente se eleva al Consejo Directivo el informe de gestión operativa y
              administrativa correspondiente a{' '}
              <span className="font-semibold capitalize">{fmtMesPeriodo(periodo)}</span>. Los datos
              consignados surgen de los registros del cuartel y se encuentran disponibles para su
              verificación.
            </p>
            <div className="mt-10 grid grid-cols-2 gap-8">
              <Firma rol="Jefe del Cuerpo Activo" nombre={cuartel.jefe} />
              <Firma rol="Presidente · Consejo Directivo" />
            </div>
            <div className="mt-8 flex items-center justify-between border-t border-slate-100 pt-3 text-[11px] text-slate-400">
              <span className="flex items-center gap-1">
                <CheckCircle2 size={12} className="text-status-ok-fg" />
                Generado por Vulcano · {emision}
              </span>
              <span>
                Emisor: {persona.nombre} {persona.apellido} · {fmtJerarquia(persona.jerarquia)}
              </span>
            </div>
          </section>
        </div>
      </article>
    </div>
  );
}

/* ── Sub-componentes presentacionales ── */

function Section({
  n,
  title,
  icon: Icon,
  children,
}: {
  n: number;
  title: string;
  icon: LucideIcon;
  children: React.ReactNode;
}) {
  return (
    <section className="informe-section">
      <h2 className="mb-3 flex items-center gap-2 text-sm font-black uppercase tracking-wide text-slate-900">
        <span className="bg-brand-900 grid h-6 w-6 place-items-center rounded-md text-xs text-white">
          {n}
        </span>
        <Icon size={16} className="text-brand-700" />
        {title}
      </h2>
      {children}
    </section>
  );
}

const TONE: Record<string, string> = {
  ok: 'text-status-ok-fg',
  warn: 'text-status-warn-fg',
  risk: 'text-status-risk-fg',
  brand: 'text-brand-700',
  default: 'text-slate-900',
};

function Stat({
  label,
  value,
  hint,
  tone = 'default',
}: {
  label: string;
  value: string | number;
  hint?: string;
  tone?: keyof typeof TONE;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3">
      <div className="text-[11px] font-medium uppercase tracking-wide text-slate-500">{label}</div>
      <div className={cn('mt-0.5 text-xl font-black tabular-nums', TONE[tone])}>{value}</div>
      {hint && <div className="text-[11px] text-slate-500">{hint}</div>}
    </div>
  );
}

function KV({
  label,
  value,
  tone = 'default',
}: {
  label: string;
  value: string;
  tone?: keyof typeof TONE;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-slate-100 py-1.5">
      <span className="text-sm text-slate-600">{label}</span>
      <span className={cn('text-sm font-bold tabular-nums', TONE[tone])}>{value}</span>
    </div>
  );
}

function Firma({ rol, nombre }: { rol: string; nombre?: string }) {
  return (
    <div className="text-center">
      <div className="mb-1 h-12" />
      <div className="border-t border-slate-400" />
      <div className="mt-1 text-sm font-semibold text-slate-900">{nombre ?? ' '}</div>
      <div className="text-xs text-slate-500">{rol}</div>
    </div>
  );
}
