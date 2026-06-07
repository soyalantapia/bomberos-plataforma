'use client';

import { Button, Card, CardContent, Kpi, cn } from '@faro/ui';
import {
  AlertTriangle,
  ArrowRight,
  Calendar,
  CheckCircle2,
  ClipboardCheck,
  Clock,
  Landmark,
  Receipt,
  ShieldAlert,
  Target,
  Users,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';

import {
  ars,
  arsCompact,
  calcLey25054,
  egresoMensualPromedio,
  mesesDeAire,
} from '../../../../../components/finanzas/utils';
import { PageHero } from '../../../../../components/shared/page-hero';
import { mesKey } from '../../../../../lib/utils/date';
import { demoToday } from '../../../../../lib/utils/demo-today';
import { selectCuartelActivo, useFaroStore } from '../../../../../store/use-faro-store';

type Severidad = 'urgente' | 'importante' | 'sugerida';
type Categoria = 'plata' | 'cumplimiento' | 'planeamiento';

interface Accion {
  id: string;
  severidad: Severidad;
  categoria: Categoria;
  icon: React.ReactNode;
  titulo: string;
  detalle: string;
  monto?: number;
  cta: string;
  href: string;
}

const SEV: Record<Severidad, { label: string; orden: number; tile: string; dot: string }> = {
  urgente: {
    label: 'Urgente',
    orden: 0,
    tile: 'bg-status-risk-bg/60 text-status-risk-fg',
    dot: 'bg-status-risk',
  },
  importante: {
    label: 'Importante',
    orden: 1,
    tile: 'bg-status-warn-bg/60 text-status-warn-fg',
    dot: 'bg-status-warn',
  },
  sugerida: {
    label: 'Cuando puedas',
    orden: 2,
    tile: 'bg-brand-50 text-brand-600',
    dot: 'bg-brand-400',
  },
};

// Obligaciones próximas (ilustrativas) — mismas que en el panel de Finanzas.
const OBLIGACIONES = [
  {
    titulo: 'Aportes patronales · junio',
    subtitulo: 'Cargas sociales de mayo',
    fecha: '2026-06-15',
  },
  { titulo: 'VTV unidad BV-2', subtitulo: 'Verificación técnica', fecha: '2026-06-12' },
  { titulo: 'Ingresos Brutos', subtitulo: 'Anticipo mensual', fecha: '2026-05-28' },
];

function diasHasta(fechaIso: string): number {
  return Math.round((new Date(fechaIso).getTime() - demoToday().getTime()) / 86400000);
}

const FILTROS: { key: 'todo' | Categoria; label: string }[] = [
  { key: 'todo', label: 'Todo' },
  { key: 'plata', label: 'Plata' },
  { key: 'cumplimiento', label: 'Cumplimiento' },
  { key: 'planeamiento', label: 'Planeamiento' },
];

export default function AccionesPage() {
  const router = useRouter();
  const cuartel = useFaroStore(selectCuartelActivo);
  const movimientos = useFaroStore((s) => s.movimientos);
  const cuentas = useFaroStore((s) => s.cuentas);
  const cajas = useFaroStore((s) => s.cajas);
  const cuotas = useFaroStore((s) => s.cuotas);
  const planAnual = useFaroStore((s) => s.planAnual);
  const [filtro, setFiltro] = useState<'todo' | Categoria>('todo');

  const mesActual = mesKey(demoToday());

  const acciones = useMemo<Accion[]>(() => {
    const conciliados = movimientos.filter((m) => m.estado === 'conciliado');
    const list: Accion[] = [];

    // 1. Ley 25.054 — ≥70% del subsidio nacional a sueldos
    const ley = calcLey25054(conciliados, cuentas, mesActual);
    if (ley.subsidioMes > 0 && !ley.cumple) {
      list.push({
        id: 'ley70',
        severidad: 'urgente',
        categoria: 'cumplimiento',
        icon: <ShieldAlert size={18} />,
        titulo: `Subsidio: ${ley.pct.toFixed(0)}% aplicado a sueldos (mínimo 70%)`,
        detalle: `Faltan ${ars.format(ley.falta)} para cumplir la Ley 25.054 este mes.`,
        monto: ley.falta,
        cta: 'Ver rendición',
        href: '/mando/finanzas/reportes',
      });
    }

    // 2. Cuotas por cobrar
    const cuotasDeuda = cuotas.filter((c) => c.estado === 'vencida' || c.estado === 'pendiente');
    const vencidas = cuotasDeuda.filter((c) => c.estado === 'vencida').length;
    const recuperable = cuotasDeuda.reduce((s, c) => s + c.monto + (c.cargoRecargo ?? 0), 0);
    const sociosDeben = new Set(cuotasDeuda.map((c) => c.socioId)).size;
    if (cuotasDeuda.length > 0) {
      list.push({
        id: 'cuotas',
        severidad: vencidas > 0 ? 'urgente' : 'importante',
        categoria: 'plata',
        icon: <Users size={18} />,
        titulo: `${sociosDeben} socio${sociosDeben === 1 ? '' : 's'} con cuotas por cobrar`,
        detalle: `${vencidas > 0 ? `${vencidas} atrasada(s). ` : ''}Recuperás ${ars.format(recuperable)} si las regularizás.`,
        monto: recuperable,
        cta: 'Cobrar',
        href: '/mando/finanzas/cuotas',
      });
    }

    // 3. Obligaciones que vencen
    OBLIGACIONES.forEach((o, i) => {
      const dias = diasHasta(o.fecha);
      if (dias > 30) return;
      list.push({
        id: `oblig-${i}`,
        severidad: dias <= 7 ? 'urgente' : 'importante',
        categoria: 'cumplimiento',
        icon: <Calendar size={18} />,
        titulo: `${o.titulo} · ${dias < 0 ? `venció hace ${Math.abs(dias)} días` : dias === 0 ? 'vence hoy' : `vence en ${dias} días`}`,
        detalle: `${o.subtitulo}. Pagalo a tiempo para no sumar recargos.`,
        cta: 'Ver',
        href: '/mando/finanzas/movimientos',
      });
    });

    // 4. Movimientos sin terminar
    const borradores = movimientos.filter((m) => m.estado === 'borrador').length;
    if (borradores > 0) {
      list.push({
        id: 'borradores',
        severidad: 'importante',
        categoria: 'cumplimiento',
        icon: <AlertTriangle size={18} />,
        titulo: `${borradores} movimiento${borradores === 1 ? '' : 's'} sin terminar`,
        detalle: 'Falta confirmar la factura o el comprobante. Cerralos antes de fin de mes.',
        cta: 'Revisar',
        href: '/mando/finanzas/movimientos',
      });
    }

    // 5. Egresos sin comprobante
    const sinComp = movimientos.filter(
      (m) => m.tipo === 'egreso' && m.estado !== 'anulado' && !m.comprobanteNumero,
    ).length;
    if (sinComp > 0) {
      list.push({
        id: 'sincomp',
        severidad: 'importante',
        categoria: 'cumplimiento',
        icon: <Receipt size={18} />,
        titulo: `${sinComp} egresos sin comprobante`,
        detalle: 'Cargá la factura o recibo: son necesarios para la rendición.',
        cta: 'Cargar',
        href: '/mando/finanzas/comprobantes',
      });
    }

    // 6. Cuentas sin verificar contra el banco
    const conDif = cajas.filter(
      (c) => c.saldoActual !== (c.saldoConciliado ?? c.saldoActual),
    ).length;
    if (conDif > 0) {
      list.push({
        id: 'concilia',
        severidad: 'importante',
        categoria: 'plata',
        icon: <Landmark size={18} />,
        titulo: `${conDif} cuenta${conDif === 1 ? '' : 's'} sin cuadrar con el banco`,
        detalle: 'Compará el saldo del sistema con el resumen bancario.',
        cta: 'Verificar',
        href: '/mando/finanzas/cajas',
      });
    }

    // 7. Caja apretada (runway)
    const saldoTotal = cajas.reduce((s, c) => s + c.saldoActual, 0);
    const mesesAire = mesesDeAire(saldoTotal, egresoMensualPromedio(conciliados));
    if (mesesAire !== null && mesesAire < 4) {
      list.push({
        id: 'runway',
        severidad: mesesAire < 2 ? 'urgente' : 'importante',
        categoria: 'plata',
        icon: <Clock size={18} />,
        titulo: `La caja alcanza para ~${mesesAire.toFixed(1).replace('.', ',')} meses`,
        detalle: 'Al ritmo de gastos actual. Conviene revisar egresos o postergar inversiones.',
        cta: 'Ver flujo',
        href: '/mando/finanzas/cashflow',
      });
    }

    // 8. Plan del año sin presentar
    if (planAnual.estado === 'borrador') {
      list.push({
        id: 'plan',
        severidad: 'sugerida',
        categoria: 'planeamiento',
        icon: <Target size={18} />,
        titulo: `El Plan ${planAnual.anio} todavía no se presentó`,
        detalle: 'Armá los objetivos e inversiones y presentalo a la Comisión Directiva.',
        cta: 'Ir al plan',
        href: '/mando/finanzas/plan',
      });
    }

    return list.sort(
      (a, b) => SEV[a.severidad].orden - SEV[b.severidad].orden || (b.monto ?? 0) - (a.monto ?? 0),
    );
  }, [movimientos, cuentas, cajas, cuotas, planAnual, mesActual]);

  const visibles = filtro === 'todo' ? acciones : acciones.filter((a) => a.categoria === filtro);
  const urgentes = acciones.filter((a) => a.severidad === 'urgente').length;
  const porCobrar = acciones
    .filter((a) => a.categoria === 'plata' && a.id === 'cuotas')
    .reduce((s, a) => s + (a.monto ?? 0), 0);
  const sinComp = movimientos.filter(
    (m) => m.tipo === 'egreso' && m.estado !== 'anulado' && !m.comprobanteNumero,
  ).length;

  const grupos: Severidad[] = ['urgente', 'importante', 'sugerida'];

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <PageHero
        objetivo={`Tesorería · ${cuartel?.nombre ?? 'Cuartel'}`}
        titulo={
          acciones.length === 0
            ? 'Todo al día'
            : `Tenés ${acciones.length} cosa${acciones.length === 1 ? '' : 's'} para resolver`
        }
        descripcion="Todo lo que necesita tu atención, en un solo lugar y ordenado por prioridad."
        icono={<ClipboardCheck size={26} />}
        variant={urgentes > 0 ? 'critical' : acciones.length === 0 ? 'success' : 'default'}
        meta={
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Kpi label="Pendientes" value={acciones.length} intent="brand" />
            <Kpi
              label="Urgentes"
              value={urgentes}
              intent={urgentes > 0 ? 'risk' : 'ok'}
              icon={<AlertTriangle size={16} />}
            />
            <Kpi
              label="Por cobrar"
              value={arsCompact(porCobrar)}
              hint="cuotas"
              intent={porCobrar > 0 ? 'warn' : 'ok'}
            />
            <Kpi
              label="Sin comprobante"
              value={sinComp}
              hint="egresos"
              intent={sinComp > 0 ? 'warn' : 'ok'}
              icon={<Receipt size={16} />}
            />
          </div>
        }
      />

      {acciones.length === 0 ? (
        <Card className="border-status-ok/30 bg-status-ok-bg/20 border-2">
          <CardContent className="flex flex-col items-center gap-2 p-10 text-center">
            <CheckCircle2 size={40} className="text-status-ok" />
            <div className="text-lg font-bold text-slate-900">Todo al día 🎉</div>
            <p className="max-w-sm text-sm text-slate-600">
              No hay nada pendiente: cuotas cobradas, comprobantes cargados, subsidio bien aplicado
              y cuentas cuadradas. Buen trabajo.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Filtro por categoría */}
          <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1">
            {FILTROS.map((f) => {
              const n =
                f.key === 'todo'
                  ? acciones.length
                  : acciones.filter((a) => a.categoria === f.key).length;
              return (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => setFiltro(f.key)}
                  className={cn(
                    'inline-flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors',
                    filtro === f.key
                      ? 'bg-brand-600 text-white'
                      : 'bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50',
                  )}
                >
                  {f.label}
                  <span
                    className={cn(
                      'rounded-full px-1.5 text-[10px] font-bold tabular-nums',
                      filtro === f.key ? 'bg-white/25' : 'bg-slate-100 text-slate-600',
                    )}
                  >
                    {n}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Grupos por severidad */}
          {grupos.map((sev) => {
            const items = visibles.filter((a) => a.severidad === sev);
            if (items.length === 0) return null;
            return (
              <div key={sev} className="space-y-2">
                <div className="flex items-center gap-2 px-1">
                  <span className={cn('h-2.5 w-2.5 rounded-full', SEV[sev].dot)} />
                  <h2 className="text-sm font-bold uppercase tracking-wide text-slate-600">
                    {SEV[sev].label}
                  </h2>
                  <span className="text-xs text-slate-400">{items.length}</span>
                </div>
                <div className="space-y-2">
                  {items.map((a) => (
                    <Card key={a.id} className="overflow-hidden transition-shadow hover:shadow-md">
                      <CardContent className="flex items-center gap-3 p-3.5">
                        <span
                          className={cn(
                            'grid h-11 w-11 shrink-0 place-items-center rounded-xl',
                            SEV[a.severidad].tile,
                          )}
                        >
                          {a.icon}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="font-semibold text-slate-900">{a.titulo}</div>
                          <div className="text-sm text-slate-600">{a.detalle}</div>
                        </div>
                        {a.monto !== undefined && a.monto > 0 && (
                          <div className="hidden shrink-0 text-right sm:block">
                            <div className="font-mono text-sm font-bold text-slate-900">
                              {arsCompact(a.monto)}
                            </div>
                            <div className="text-[11px] text-slate-400">en juego</div>
                          </div>
                        )}
                        <Button
                          intent={a.severidad === 'urgente' ? 'primary' : 'ghost'}
                          size="sm"
                          onClick={() => router.push(a.href as Parameters<typeof router.push>[0])}
                          className="shrink-0"
                        >
                          {a.cta} <ArrowRight size={14} />
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}

          {visibles.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center text-sm text-slate-500">
                No hay acciones en esta categoría.
              </CardContent>
            </Card>
          )}
        </>
      )}

      <Card className="border-slate-200 bg-slate-50">
        <CardContent className="flex items-start gap-3 p-4 text-sm text-slate-600">
          <ClipboardCheck size={18} className="mt-0.5 shrink-0 text-slate-500" />
          <div>
            <strong className="text-slate-900">Tu centro de acciones.</strong> Vulcano junta acá
            todo lo que necesita tu atención —cuotas por cobrar, comprobantes que faltan, subsidio,
            vencimientos, cuentas sin cuadrar— y lo ordena por prioridad. Resolvé cada cosa con un
            toque.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
