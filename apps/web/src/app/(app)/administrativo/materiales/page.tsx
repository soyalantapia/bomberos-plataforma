'use client';

import { AlertTriangle, Boxes, CheckCircle2, Package, Shirt, Truck, Wrench } from 'lucide-react';
import { useState } from 'react';

import { Badge, Card, CardContent, Kpi, cn, useToast } from '@faro/ui';

import { PageHero } from '../../../../components/shared/page-hero';

type Estado = 'ok' | 'warn' | 'risk';

interface MovilStock {
  codigo: string;
  tipo: string;
  items: { nombre: string; cantidad: number; estado: Estado; nota?: string }[];
}

const moviles: MovilStock[] = [
  {
    codigo: 'BV-3',
    tipo: 'Autobomba',
    items: [
      { nombre: 'Mangueras 70 mm', cantidad: 4, estado: 'ok' },
      { nombre: 'Línea de ataque', cantidad: 2, estado: 'ok', nota: 'Revisada 20/5' },
      { nombre: 'Lanzas regulables', cantidad: 3, estado: 'ok' },
      { nombre: 'Tubo SCBA', cantidad: 6, estado: 'ok' },
    ],
  },
  {
    codigo: 'BV-5',
    tipo: 'Rescate',
    items: [
      { nombre: 'Pinzas hidráulicas', cantidad: 1, estado: 'warn', nota: 'Mant. 28/5' },
      { nombre: 'Cojín de elevación', cantidad: 2, estado: 'ok' },
      { nombre: 'Cilindros aire 30 min', cantidad: 4, estado: 'ok' },
    ],
  },
  {
    codigo: 'BV-7',
    tipo: 'Forestal',
    items: [
      { nombre: 'Bidones forestales', cantidad: 2, estado: 'warn', nota: 'Falta 1 reposición' },
      { nombre: 'Batefuegos', cantidad: 6, estado: 'ok' },
      { nombre: 'Mochilas espalda', cantidad: 4, estado: 'ok' },
    ],
  },
];

interface PanolItem {
  nombre: string;
  cantidad: number;
  capacidad: number;
  icono: React.ReactNode;
  intent: Estado;
  hint?: string;
}

const panol: PanolItem[] = [
  { nombre: 'EPP completo', cantidad: 18, capacidad: 20, icono: <Shirt size={20} />, intent: 'ok' },
  {
    nombre: 'Botellas SCBA cargadas',
    cantidad: 12,
    capacidad: 12,
    icono: <Boxes size={20} />,
    intent: 'ok',
  },
  {
    nombre: 'Linternas industriales',
    cantidad: 8,
    capacidad: 10,
    icono: <Wrench size={20} />,
    intent: 'warn',
    hint: '2 con batería baja',
  },
  {
    nombre: 'Camisas reglamentarias',
    cantidad: 36,
    capacidad: 40,
    icono: <Shirt size={20} />,
    intent: 'ok',
  },
  {
    nombre: 'Pantalones operativos',
    cantidad: 24,
    capacidad: 30,
    icono: <Shirt size={20} />,
    intent: 'ok',
  },
  {
    nombre: 'Buzos de invierno',
    cantidad: 6,
    capacidad: 20,
    icono: <Shirt size={20} />,
    intent: 'risk',
    hint: 'Pedir reposición',
  },
];

const ESTADO_COLOR: Record<Estado, string> = {
  ok: 'bg-status-ok',
  warn: 'bg-status-warn',
  risk: 'bg-status-risk',
};

export default function MaterialesPage() {
  const toast = useToast();
  const [movilSel, setMovilSel] = useState<string>('BV-3');
  const movilActivo = moviles.find((m) => m.codigo === movilSel)!;

  const bajoStock = panol.filter((p) => p.intent !== 'ok').length;
  const proxMantenimiento = moviles
    .flatMap((m) => m.items)
    .filter((i) => i.estado === 'warn').length;

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <PageHero
        objetivo="Administrativo · Materiales"
        titulo="247 ítems · 4 reposiciones pendientes"
        descripcion="Lo que va en cada móvil, lo del pañol y lo de ropería — todo con su estado real, no sólo cantidades."
        icono={<Package size={26} />}
        meta={
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Kpi label="Ítems totales" value={247} intent="brand" icon={<Boxes size={16} />} />
            <Kpi
              label="Bajo stock"
              value={bajoStock}
              intent={bajoStock > 0 ? 'warn' : 'ok'}
              icon={<AlertTriangle size={16} />}
            />
            <Kpi
              label="Mantenimientos"
              value={proxMantenimiento}
              hint="programados"
              intent="warn"
              icon={<Wrench size={16} />}
            />
            <Kpi
              label="Verificados"
              value="92%"
              hint="auditados 15/5"
              intent="ok"
              icon={<CheckCircle2 size={16} />}
            />
          </div>
        }
      />

      <section>
        <h2 className="mb-3 flex items-center gap-2 text-base font-bold text-slate-900">
          <Truck size={18} className="text-brand-600" /> Equipamiento por móvil
        </h2>

        <div className="grid gap-4 lg:grid-cols-[260px_1fr]">
          <div className="space-y-2">
            {moviles.map((m) => {
              const issues = m.items.filter((i) => i.estado !== 'ok').length;
              const active = movilSel === m.codigo;
              return (
                <button
                  key={m.codigo}
                  type="button"
                  onClick={() => setMovilSel(m.codigo)}
                  className={cn(
                    'w-full overflow-hidden rounded-2xl border-2 bg-white p-4 text-left transition-all',
                    active
                      ? 'border-brand-600 ring-brand-100 ring-2'
                      : 'border-slate-200 hover:border-slate-300',
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        'grid h-12 w-12 shrink-0 place-items-center rounded-xl text-white',
                        active ? 'bg-brand-600' : 'bg-slate-700',
                      )}
                    >
                      <Truck size={20} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-lg font-bold text-slate-900">{m.codigo}</div>
                      <div className="text-xs text-slate-600">{m.tipo}</div>
                    </div>
                    {issues > 0 ? (
                      <Badge intent="warn">{issues}</Badge>
                    ) : (
                      <CheckCircle2 size={16} className="text-status-ok" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          <Card>
            <CardContent className="p-5">
              <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <div className="font-bold text-slate-900">
                    {movilActivo.codigo} · {movilActivo.tipo}
                  </div>
                  <div className="text-xs text-slate-500">{movilActivo.items.length} ítems</div>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    toast.push({
                      kind: 'info',
                      title: 'Revisión iniciada',
                      description: `Checklist de ${movilActivo.codigo}`,
                    })
                  }
                  className="rounded-md bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-700"
                >
                  Iniciar revisión
                </button>
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                {movilActivo.items.map((it, idx) => (
                  <div
                    key={idx}
                    className={cn(
                      'flex items-center gap-3 rounded-lg border bg-white p-3',
                      it.estado === 'warn' && 'border-status-warn/40 bg-status-warn-bg/20',
                      it.estado === 'risk' && 'border-status-risk/40 bg-status-risk-bg/20',
                      it.estado === 'ok' && 'border-slate-200',
                    )}
                  >
                    <div className={cn('h-2 w-2 shrink-0 rounded-full', ESTADO_COLOR[it.estado])} />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium text-slate-900">{it.nombre}</div>
                      {it.nota && (
                        <div className="mt-0.5 truncate text-[11px] text-slate-500">{it.nota}</div>
                      )}
                    </div>
                    <div className="shrink-0 rounded-md bg-slate-50 px-2 py-1 text-sm font-bold tabular-nums text-slate-900">
                      ×{it.cantidad}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section>
        <h2 className="mb-3 flex items-center gap-2 text-base font-bold text-slate-900">
          <Boxes size={18} className="text-status-warn" /> Pañol y ropería
        </h2>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {panol.map((p, idx) => {
            const pct = Math.round((p.cantidad / p.capacidad) * 100);
            return (
              <div
                key={idx}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-4"
              >
                <div className="flex items-start gap-3">
                  <div
                    className={cn(
                      'grid h-11 w-11 shrink-0 place-items-center rounded-xl text-white',
                      ESTADO_COLOR[p.intent],
                    )}
                  >
                    {p.icono}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-semibold text-slate-900">{p.nombre}</div>
                    {p.hint && <div className="mt-0.5 text-xs text-slate-500">{p.hint}</div>}
                  </div>
                </div>
                <div className="mt-4 flex items-baseline justify-between text-sm">
                  <div>
                    <span className="text-2xl font-bold tabular-nums text-slate-900">
                      {p.cantidad}
                    </span>
                    <span className="ml-1 text-slate-500">/ {p.capacidad}</span>
                  </div>
                  <Badge intent={p.intent}>{pct}%</Badge>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={cn('h-full transition-all', ESTADO_COLOR[p.intent])}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
