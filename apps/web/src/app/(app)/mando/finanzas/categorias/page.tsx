'use client';

import { Badge, Button, Card, CardContent, Input, cn } from '@faro/ui';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowDownRight,
  ArrowUpRight,
  ChevronRight,
  Coins,
  Filter,
  Landmark,
  Layers,
  ListTree,
  Search,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Wallet,
  X,
} from 'lucide-react';
import { useMemo, useState } from 'react';

import { ars, arsCompact, fechaCorta } from '../../../../../components/finanzas/utils';
import { PageHero } from '../../../../../components/shared/page-hero';
import { demoToday } from '../../../../../lib/utils/demo-today';
import { selectCuartelActivo, useFaroStore } from '../../../../../store/use-faro-store';

import type { CuentaContable, TipoCuentaContable } from '@faro/types';

const TIPO_CONFIG: Record<
  TipoCuentaContable,
  {
    label: string;
    grad: string;
    bg: string;
    border: string;
    text: string;
    icon: React.ReactNode;
    hex: string;
  }
> = {
  ingreso: {
    label: 'Ingresos',
    grad: 'from-emerald-500 to-emerald-700',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    text: 'text-emerald-700',
    icon: <ArrowUpRight size={16} />,
    hex: '#10b981',
  },
  egreso: {
    label: 'Egresos',
    grad: 'from-rose-500 to-rose-700',
    bg: 'bg-rose-50',
    border: 'border-rose-200',
    text: 'text-rose-700',
    icon: <ArrowDownRight size={16} />,
    hex: '#f43f5e',
  },
  activo: {
    label: 'Activo',
    grad: 'from-blue-500 to-blue-700',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-700',
    icon: <Wallet size={16} />,
    hex: '#3b82f6',
  },
  pasivo: {
    label: 'Pasivo',
    grad: 'from-amber-500 to-amber-700',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'text-amber-700',
    icon: <Coins size={16} />,
    hex: '#f59e0b',
  },
  patrimonio: {
    label: 'Patrimonio',
    grad: 'from-violet-500 to-violet-700',
    bg: 'bg-violet-50',
    border: 'border-violet-200',
    text: 'text-violet-700',
    icon: <Landmark size={16} />,
    hex: '#8b5cf6',
  },
};

export default function PlanCuentasPage() {
  const cuartel = useFaroStore(selectCuartelActivo);
  const cuentas = useFaroStore((s) => s.cuentas);
  const movimientos = useFaroStore((s) => s.movimientos);
  const [tipoActivo, setTipoActivo] = useState<TipoCuentaContable>('ingreso');
  const [busqueda, setBusqueda] = useState('');
  const [seleccionadaId, setSeleccionadaId] = useState<string | null>(null);
  const [expandido, setExpandido] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    cuentas.filter((c) => !c.parentId).forEach((c) => (init[c.id] = true));
    return init;
  });

  // Ejecutado YTD por cuenta (directo) + acumulado por nodo (incluyendo hijos)
  // Pre-calculamos ambos maps de una sola pasada para evitar recursiones
  // costosas durante el render del árbol.
  const { ejecutadoMap, acumuladoMap } = useMemo(() => {
    // Map cuenta → ejecutado directo
    const ejec = new Map<string, number>();
    for (const m of movimientos) {
      if (m.estado !== 'conciliado') continue;
      ejec.set(m.cuentaId, (ejec.get(m.cuentaId) ?? 0) + m.monto);
    }
    // Map padre → hijos (una sola pasada)
    const childMap = new Map<string | undefined, CuentaContable[]>();
    for (const c of cuentas) {
      const key = c.parentId;
      if (!childMap.has(key)) childMap.set(key, []);
      childMap.get(key)!.push(c);
    }
    // Acumular bottom-up con una función que cachea
    const acum = new Map<string, number>();
    const computar = (cuentaId: string): number => {
      if (acum.has(cuentaId)) return acum.get(cuentaId)!;
      const directo = ejec.get(cuentaId) ?? 0;
      const hijos = childMap.get(cuentaId) ?? [];
      let total = directo;
      for (const h of hijos) total += computar(h.id);
      acum.set(cuentaId, total);
      return total;
    };
    for (const c of cuentas) computar(c.id);
    return { ejecutadoMap: ejec, acumuladoMap: acum };
  }, [movimientos, cuentas]);

  // Helper rápido — O(1) lookup en map pre-calculado
  const acumular = (id: string): number => acumuladoMap.get(id) ?? 0;

  // Stats por tipo (para los tabs)
  const statsTipo = useMemo(() => {
    const r: Record<
      TipoCuentaContable,
      { count: number; presupuesto: number; ejecutado: number; pct: number }
    > = {
      ingreso: { count: 0, presupuesto: 0, ejecutado: 0, pct: 0 },
      egreso: { count: 0, presupuesto: 0, ejecutado: 0, pct: 0 },
      activo: { count: 0, presupuesto: 0, ejecutado: 0, pct: 0 },
      pasivo: { count: 0, presupuesto: 0, ejecutado: 0, pct: 0 },
      patrimonio: { count: 0, presupuesto: 0, ejecutado: 0, pct: 0 },
    };
    for (const c of cuentas) {
      r[c.tipo].count++;
      if (c.operable) {
        r[c.tipo].presupuesto += c.presupuestoAnual ?? 0;
        r[c.tipo].ejecutado += ejecutadoMap.get(c.id) ?? 0;
      }
    }
    for (const t of Object.keys(r) as TipoCuentaContable[]) {
      r[t].pct = r[t].presupuesto > 0 ? (r[t].ejecutado / r[t].presupuesto) * 100 : 0;
    }
    return r;
  }, [cuentas, ejecutadoMap]);

  // Filtramos por tipo + búsqueda y construimos un childMap específico
  const { cuentasDelTipo, childrenDelTipo } = useMemo(() => {
    let arr = cuentas.filter((c) => c.tipo === tipoActivo);
    if (busqueda.trim()) {
      const q = busqueda.toLowerCase();
      arr = arr.filter((c) => c.nombre.toLowerCase().includes(q) || c.codigo.includes(q));
    }
    const cm = new Map<string | undefined, CuentaContable[]>();
    for (const c of arr) {
      const key = c.parentId;
      if (!cm.has(key)) cm.set(key, []);
      cm.get(key)!.push(c);
    }
    return { cuentasDelTipo: arr, childrenDelTipo: cm };
  }, [cuentas, tipoActivo, busqueda]);

  function getChildren(parentId: string | undefined): CuentaContable[] {
    return childrenDelTipo.get(parentId) ?? [];
  }

  function toggleExpandido(id: string) {
    setExpandido((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  // Si hay búsqueda, expandir todo para que se vean los resultados
  const expandidoEfectivo = busqueda.trim()
    ? Object.fromEntries(cuentas.map((c) => [c.id, true]))
    : expandido;

  const seleccionada = cuentas.find((c) => c.id === seleccionadaId);

  // Movimientos recientes de la cuenta seleccionada
  const movsRecientes = useMemo(() => {
    if (!seleccionadaId) return [];
    return movimientos
      .filter((m) => m.cuentaId === seleccionadaId && m.estado === 'conciliado')
      .sort((a, b) => b.fecha.localeCompare(a.fecha))
      .slice(0, 6);
  }, [movimientos, seleccionadaId]);

  // Donut chart de composición (% por tipo)
  const totalGeneralEjec = Object.values(statsTipo).reduce((s, x) => s + x.ejecutado, 0);

  function renderCuenta(c: CuentaContable, nivel: number): React.ReactNode {
    const hijos = getChildren(c.id);
    const tieneHijos = hijos.length > 0;
    const estaExpandido = expandidoEfectivo[c.id] ?? false;
    const ejec = acumular(c.id);
    const presup = c.presupuestoAnual ?? 0;
    const pctIndiv = presup > 0 ? (ejec / presup) * 100 : 0;
    const cfg = TIPO_CONFIG[c.tipo];
    const esSeleccionada = seleccionadaId === c.id;
    const matchBusqueda =
      busqueda.trim() &&
      (c.nombre.toLowerCase().includes(busqueda.toLowerCase()) || c.codigo.includes(busqueda));

    return (
      <div key={c.id}>
        <button
          type="button"
          onClick={() => {
            if (tieneHijos) toggleExpandido(c.id);
            if (c.operable) setSeleccionadaId(c.id);
          }}
          className={cn(
            'group flex w-full items-center gap-2 rounded-lg p-2 text-left transition-colors transition-transform duration-100 hover:translate-x-[2px]',
            esSeleccionada
              ? `${cfg.bg} ${cfg.border} border-2 shadow-sm`
              : matchBusqueda
                ? 'border border-yellow-200 bg-yellow-50'
                : nivel === 0
                  ? 'bg-slate-100/60 font-semibold hover:bg-slate-100'
                  : 'hover:bg-slate-50',
          )}
          style={{ paddingLeft: `${nivel * 18 + 8}px` }}
        >
          {tieneHijos ? (
            <ChevronRight
              size={13}
              className={cn(
                'text-slate-500 transition-transform duration-150 group-hover:text-slate-700',
                estaExpandido && 'rotate-90',
              )}
            />
          ) : (
            <div className="w-[13px]" />
          )}

          {/* Código pill */}
          <div
            className={cn(
              'shrink-0 rounded px-1.5 py-0.5 font-mono text-[11px] font-bold',
              nivel === 0 ? `${cfg.bg} ${cfg.text}` : 'bg-slate-100 text-slate-500',
            )}
          >
            {c.codigo}
          </div>

          {/* Nombre */}
          <span
            className={cn(
              'flex-1 truncate text-sm',
              nivel === 0 ? 'font-bold text-slate-900' : 'text-slate-700',
            )}
          >
            {c.nombre}
          </span>

          {/* Indicador operable */}
          {c.operable && (
            <div
              className="bg-brand-400 h-1.5 w-1.5 shrink-0 rounded-full"
              title="Cuenta operable"
            />
          )}

          {/* Monto */}
          {(ejec > 0 || presup > 0) && (
            <div className="hidden shrink-0 text-right sm:block">
              <div className="font-mono text-xs font-bold text-slate-900">{arsCompact(ejec)}</div>
              {presup > 0 && (
                <div className="font-mono text-[11px] text-slate-500">/ {arsCompact(presup)}</div>
              )}
            </div>
          )}

          {/* Pct badge */}
          {presup > 0 && (
            <div
              className={cn(
                'shrink-0 rounded-full px-1.5 py-0.5 text-[11px] font-bold tabular-nums',
                pctIndiv >= 90
                  ? c.tipo === 'egreso'
                    ? 'bg-rose-100 text-rose-700'
                    : 'bg-emerald-100 text-emerald-700'
                  : pctIndiv >= 50
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-slate-100 text-slate-500',
              )}
            >
              {pctIndiv.toFixed(0)}%
            </div>
          )}
        </button>

        {/* Mini barra de progreso (CSS transition, no motion) */}
        {presup > 0 && (
          <div
            style={{ marginLeft: `${nivel * 18 + 32}px` }}
            className="mb-1 mt-0.5 h-[3px] overflow-hidden rounded-full bg-slate-100"
          >
            <div
              className={cn(
                'h-full transition-[width] duration-300',
                pctIndiv > 100
                  ? 'bg-rose-500'
                  : pctIndiv > 85
                    ? 'bg-amber-500'
                    : `bg-gradient-to-r ${cfg.grad}`,
              )}
              style={{ width: `${Math.min(100, pctIndiv)}%` }}
            />
          </div>
        )}

        {tieneHijos && estaExpandido && <div>{hijos.map((h) => renderCuenta(h, nivel + 1))}</div>}
      </div>
    );
  }

  // Construir donut chart svg
  const donutData = (['ingreso', 'egreso', 'activo', 'pasivo', 'patrimonio'] as const)
    .map((t) => ({ tipo: t, valor: statsTipo[t].ejecutado, cfg: TIPO_CONFIG[t] }))
    .filter((d) => d.valor > 0);
  const totalDonut = donutData.reduce((s, d) => s + d.valor, 0);

  let offsetAcumulado = 0;
  const donutSegmentos = donutData.map((d) => {
    const pct = totalDonut > 0 ? (d.valor / totalDonut) * 100 : 0;
    const seg = {
      ...d,
      pct,
      offset: offsetAcumulado,
    };
    offsetAcumulado += pct;
    return seg;
  });

  const cfgActivo = TIPO_CONFIG[tipoActivo];

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <PageHero
        objetivo={`Tesorería · ${cuartel?.nombre ?? 'Cuartel'}`}
        titulo="Categorías"
        descripcion="Cómo organizamos la plata del cuartel. Cada categoría puede recibir movimientos y muestra cuánto se gastó del presupuesto anual."
        icono={<ListTree size={26} />}
      />

      {/* Hero compacto con donut + stats */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Donut composición */}
        <Card className="lg:col-span-1">
          <CardContent className="p-5">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Composición ejecutada YTD</h3>
              <Sparkles size={14} className="text-brand-500" />
            </div>
            <div className="relative mx-auto flex h-44 w-44 items-center justify-center">
              {/* SVG donut */}
              <svg viewBox="0 0 100 100" className="absolute inset-0 -rotate-90">
                <circle
                  cx="50"
                  cy="50"
                  r="35"
                  fill="transparent"
                  stroke="#f1f5f9"
                  strokeWidth="12"
                />
                {donutSegmentos.map((seg, i) => {
                  const circumference = 2 * Math.PI * 35;
                  const dashLen = (seg.pct / 100) * circumference;
                  const dashOffset = -((seg.offset / 100) * circumference);
                  return (
                    <motion.circle
                      key={seg.tipo}
                      cx="50"
                      cy="50"
                      r="35"
                      fill="transparent"
                      stroke={seg.cfg.hex}
                      strokeWidth="12"
                      strokeDasharray={`${dashLen} ${circumference}`}
                      strokeDashoffset={dashOffset}
                      initial={{ strokeDasharray: `0 ${circumference}` }}
                      animate={{ strokeDasharray: `${dashLen} ${circumference}` }}
                      transition={{ delay: i * 0.1, duration: 0.6 }}
                    />
                  );
                })}
              </svg>
              <div className="relative z-10 text-center">
                <div className="text-xs uppercase text-slate-500">Volumen YTD</div>
                <div className="font-mono text-xl font-black text-slate-900">
                  {arsCompact(totalGeneralEjec)}
                </div>
              </div>
            </div>
            <div className="mt-4 space-y-1.5">
              {donutSegmentos.map((seg) => (
                <div key={seg.tipo} className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-sm" style={{ background: seg.cfg.hex }} />
                    <span className="text-slate-700">{seg.cfg.label}</span>
                  </span>
                  <span className="font-bold tabular-nums text-slate-900">
                    {seg.pct.toFixed(0)}%
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Tabs por tipo (visual moderno) */}
        <div className="grid grid-cols-2 content-start gap-3 sm:grid-cols-3 lg:col-span-2 lg:grid-cols-3">
          {(['ingreso', 'egreso', 'activo', 'pasivo', 'patrimonio'] as const).map((t) => {
            const cfg = TIPO_CONFIG[t];
            const stat = statsTipo[t];
            const activo = tipoActivo === t;
            return (
              <motion.button
                key={t}
                type="button"
                onClick={() => {
                  setTipoActivo(t);
                  setSeleccionadaId(null);
                  setBusqueda('');
                }}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  'group relative overflow-hidden rounded-xl border-2 p-3 text-left transition-all',
                  activo
                    ? 'border-transparent shadow-lg'
                    : 'border-slate-200 bg-white hover:border-slate-300',
                )}
              >
                {/* Background gradient si está activo */}
                {activo && (
                  <motion.div
                    layoutId="tab-active-bg"
                    className={cn('absolute inset-0 bg-gradient-to-br opacity-100', cfg.grad)}
                  />
                )}
                <div className={cn('relative z-10', activo && 'text-white')}>
                  <div className="flex items-start justify-between">
                    <div
                      className={cn(
                        'grid h-8 w-8 place-items-center rounded-lg',
                        activo ? 'bg-white/20 backdrop-blur' : cfg.bg,
                      )}
                    >
                      <span className={activo ? 'text-white' : cfg.text}>{cfg.icon}</span>
                    </div>
                    <Badge intent={activo ? 'neutral' : 'neutral'}>{stat.count}</Badge>
                  </div>
                  <div className="mt-2 text-xs font-medium uppercase opacity-80">{cfg.label}</div>
                  <div className="font-mono text-lg font-black">{arsCompact(stat.ejecutado)}</div>
                  {stat.presupuesto > 0 && (
                    <>
                      <div className="mt-1 text-xs opacity-70">
                        de {arsCompact(stat.presupuesto)}
                      </div>
                      <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/30">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(100, stat.pct)}%` }}
                          transition={{ duration: 0.5 }}
                          className={cn(
                            'h-full',
                            activo ? 'bg-white' : `bg-gradient-to-r ${cfg.grad}`,
                          )}
                        />
                      </div>
                      <div className="mt-1 flex items-center justify-between text-[11px] font-medium opacity-90">
                        <span>{stat.pct.toFixed(0)}% ejecutado</span>
                        {t === 'ingreso' && stat.pct >= 40 && <TrendingUp size={10} />}
                        {t === 'egreso' && stat.pct > 50 && <TrendingDown size={10} />}
                      </div>
                    </>
                  )}
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="flex items-center gap-2 p-3">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <Input
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder={`Buscar en ${cfgActivo.label.toLowerCase()}: nombre o código (ej: 5.1, sueldos)...`}
              className="pl-9"
            />
            {busqueda && (
              <button
                type="button"
                onClick={() => setBusqueda('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
              >
                <X size={14} />
              </button>
            )}
          </div>
          <Badge intent="neutral">
            <Layers size={11} /> {cuentasDelTipo.length} cuentas
          </Badge>
        </CardContent>
      </Card>

      {/* Split view: árbol + detalle */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        {/* Árbol */}
        <Card className={cn('lg:col-span-3', !seleccionadaId && 'lg:col-span-5')}>
          <CardContent className="p-3">
            <div className="mb-2 flex items-center gap-2 px-2">
              <div
                className={cn(
                  'grid h-6 w-6 place-items-center rounded',
                  cfgActivo.bg,
                  cfgActivo.text,
                )}
              >
                {cfgActivo.icon}
              </div>
              <span className="text-sm font-bold text-slate-900">{cfgActivo.label}</span>
              <Badge intent="neutral">
                {cuentasDelTipo.length} cuentas · {cuentasDelTipo.filter((c) => c.operable).length}{' '}
                operables
              </Badge>
            </div>
            {getChildren(undefined).length === 0 ? (
              <div className="flex flex-col items-center gap-2 p-12 text-center text-slate-500">
                <Filter size={32} className="text-slate-300" />
                <div className="text-sm">
                  Sin cuentas{' '}
                  {busqueda.trim() ? 'que coincidan con la búsqueda' : 'cargadas para este tipo'}
                </div>
                {busqueda.trim() && (
                  <Button intent="ghost" size="sm" onClick={() => setBusqueda('')}>
                    Limpiar búsqueda
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-0.5">
                {getChildren(undefined).map((c) => renderCuenta(c, 0))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Panel detalle de cuenta seleccionada */}
        <AnimatePresence mode="wait">
          {seleccionada && (
            <motion.div
              key={seleccionadaId}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 12 }}
              transition={{ duration: 0.2 }}
              className="lg:col-span-2"
            >
              <div className="sticky top-4 space-y-3">
                <Card className="overflow-hidden">
                  <div
                    className={cn(
                      'bg-gradient-to-br p-5 text-white',
                      TIPO_CONFIG[seleccionada.tipo].grad,
                    )}
                  >
                    <div className="flex items-start justify-between">
                      <div className="grid h-10 w-10 place-items-center rounded-xl bg-white/20 backdrop-blur">
                        {TIPO_CONFIG[seleccionada.tipo].icon}
                      </div>
                      <button
                        type="button"
                        onClick={() => setSeleccionadaId(null)}
                        className="rounded-lg p-1 text-white/80 hover:bg-white/20 hover:text-white"
                      >
                        <X size={16} />
                      </button>
                    </div>
                    <div className="mt-3">
                      <div className="font-mono text-xs uppercase opacity-80">
                        {seleccionada.codigo}
                      </div>
                      <div className="text-lg font-bold">{seleccionada.nombre}</div>
                      <div className="mt-1 flex flex-wrap gap-1.5">
                        <Badge intent="neutral">{TIPO_CONFIG[seleccionada.tipo].label}</Badge>
                        {seleccionada.operable && <Badge intent="ok">Operable</Badge>}
                      </div>
                    </div>
                  </div>
                  <CardContent className="p-5">
                    {(() => {
                      const ejec = acumular(seleccionada.id);
                      const presup = seleccionada.presupuestoAnual ?? 0;
                      const presupMensual = seleccionada.presupuestoMensual ?? 0;
                      const pct = presup > 0 ? (ejec / presup) * 100 : 0;
                      const mesesYTD = demoToday().getMonth() + 1; // meses transcurridos del año
                      const proyeccion = mesesYTD > 0 ? (ejec / mesesYTD) * 12 : 0;
                      return (
                        <>
                          {presup > 0 ? (
                            <>
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <div className="text-xs uppercase text-slate-500">
                                    Ejecutado YTD
                                  </div>
                                  <div className="font-mono text-xl font-black text-slate-900">
                                    {ars.format(ejec)}
                                  </div>
                                </div>
                                <div>
                                  <div className="text-xs uppercase text-slate-500">
                                    Presupuesto
                                  </div>
                                  <div className="font-mono text-xl font-black text-slate-900">
                                    {ars.format(presup)}
                                  </div>
                                </div>
                              </div>
                              <div className="mt-3">
                                <div className="mb-1 flex items-baseline justify-between text-xs">
                                  <span className="font-bold text-slate-700">
                                    {pct.toFixed(1)}%
                                  </span>
                                  <span className="text-slate-500">
                                    Resta {arsCompact(Math.max(0, presup - ejec))}
                                  </span>
                                </div>
                                <div className="relative h-2.5 overflow-hidden rounded-full bg-slate-100">
                                  <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${Math.min(100, pct)}%` }}
                                    transition={{ duration: 0.8 }}
                                    className={cn(
                                      'h-full bg-gradient-to-r',
                                      pct > 100
                                        ? 'from-rose-500 to-rose-700'
                                        : pct > 85
                                          ? 'from-amber-500 to-amber-700'
                                          : TIPO_CONFIG[seleccionada.tipo].grad,
                                    )}
                                  />
                                </div>
                              </div>

                              {/* Proyección anual */}
                              <div className="mt-4 grid grid-cols-2 gap-2 border-t border-slate-100 pt-3">
                                <div className="rounded-lg bg-slate-50 p-2">
                                  <div className="text-[11px] uppercase text-slate-500">
                                    Mensual proyectado
                                  </div>
                                  <div className="font-mono text-sm font-bold text-slate-900">
                                    {arsCompact(mesesYTD > 0 ? ejec / mesesYTD : 0)}
                                  </div>
                                  {presupMensual > 0 && (
                                    <div className="text-[11px] text-slate-500">
                                      objetivo {arsCompact(presupMensual)}
                                    </div>
                                  )}
                                </div>
                                <div
                                  className={cn(
                                    'rounded-lg p-2',
                                    proyeccion > presup
                                      ? 'bg-rose-50'
                                      : proyeccion > presup * 0.95
                                        ? 'bg-amber-50'
                                        : 'bg-emerald-50',
                                  )}
                                >
                                  <div className="text-[11px] uppercase text-slate-500">
                                    Proyección 12m
                                  </div>
                                  <div
                                    className={cn(
                                      'font-mono text-sm font-bold',
                                      proyeccion > presup
                                        ? 'text-rose-700'
                                        : proyeccion > presup * 0.95
                                          ? 'text-amber-700'
                                          : 'text-emerald-700',
                                    )}
                                  >
                                    {arsCompact(proyeccion)}
                                  </div>
                                  <div className="text-[11px] text-slate-500">
                                    {((proyeccion / presup) * 100).toFixed(0)}% del año
                                  </div>
                                </div>
                              </div>
                            </>
                          ) : (
                            <div className="rounded-lg bg-slate-50 p-3 text-center text-xs text-slate-500">
                              Cuenta agrupadora · no recibe movimientos directos
                            </div>
                          )}

                          {seleccionada.notas && (
                            <div className="bg-brand-50 border-brand-100 mt-3 rounded-lg border p-2 text-xs">
                              <strong className="text-brand-900">Nota:</strong>{' '}
                              <span className="text-brand-800/80">{seleccionada.notas}</span>
                            </div>
                          )}
                        </>
                      );
                    })()}
                  </CardContent>
                </Card>

                {/* Movimientos recientes */}
                {movsRecientes.length > 0 && (
                  <Card>
                    <CardContent className="p-4">
                      <div className="mb-2 flex items-center justify-between">
                        <h4 className="text-xs font-bold uppercase text-slate-500">
                          Últimos movimientos
                        </h4>
                        <Badge intent="neutral">{movsRecientes.length}</Badge>
                      </div>
                      <ul className="space-y-1.5">
                        {movsRecientes.map((m) => (
                          <li
                            key={m.id}
                            className="flex items-center gap-2 rounded-lg p-1.5 hover:bg-slate-50"
                          >
                            <div
                              className={cn(
                                'h-1.5 w-1.5 shrink-0 rounded-full',
                                m.tipo === 'ingreso' ? 'bg-emerald-500' : 'bg-rose-500',
                              )}
                            />
                            <div className="min-w-0 flex-1">
                              <div className="truncate text-xs font-medium text-slate-900">
                                {m.descripcion}
                              </div>
                              <div className="text-[11px] text-slate-500">
                                {fechaCorta(m.fecha)}
                                {m.contraparte && ` · ${m.contraparte}`}
                              </div>
                            </div>
                            <span
                              className={cn(
                                'shrink-0 font-mono text-xs font-bold tabular-nums',
                                m.tipo === 'ingreso' ? 'text-emerald-700' : 'text-rose-700',
                              )}
                            >
                              {m.tipo === 'ingreso' ? '+' : '−'}
                              {arsCompact(m.monto)}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer card */}
      <Card className="border-slate-200 bg-gradient-to-br from-slate-50 to-white">
        <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4 text-sm text-slate-600">
          <div className="flex items-center gap-3">
            <div className="bg-brand-100 text-brand-700 grid h-9 w-9 place-items-center rounded-lg">
              <ListTree size={18} />
            </div>
            <div>
              <div className="font-bold text-slate-900">Categorías del cuartel</div>
              <div className="text-xs">
                Lo que tiene el cuartel, lo que debe, las entradas de plata y los gastos.
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <div className="bg-brand-400 h-2 w-2 rounded-full" />
            <span>Las que tienen punto azul reciben movimientos</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
