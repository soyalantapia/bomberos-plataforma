'use client';

import {
  Badge,
  Button,
  Card,
  CardContent,
  Dialog,
  Input,
  Kpi,
  Label,
  cn,
  useToast,
} from '@faro/ui';
import {
  ArrowDownRight,
  ArrowUpRight,
  CheckCircle2,
  Circle,
  Coins,
  Download,
  Plus,
  Send,
  Target,
  Trash2,
  Wrench,
} from 'lucide-react';
import { useMemo, useState } from 'react';

import { ars, arsCompact } from '../../../../../components/finanzas/utils';
import { PageHero } from '../../../../../components/shared/page-hero';
import { exportarCsv } from '../../../../../lib/utils/export-csv';
import { selectCuartelActivo, useFaroStore } from '../../../../../store/use-faro-store';

export default function PlanAnualPage() {
  const toast = useToast();
  const cuartel = useFaroStore(selectCuartelActivo);
  const plan = useFaroStore((s) => s.planAnual);
  const agregarObjetivo = useFaroStore((s) => s.agregarObjetivoPlan);
  const toggleObjetivo = useFaroStore((s) => s.toggleObjetivoPlan);
  const eliminarObjetivo = useFaroStore((s) => s.eliminarObjetivoPlan);
  const agregarInversion = useFaroStore((s) => s.agregarInversionPlan);
  const eliminarInversion = useFaroStore((s) => s.eliminarInversionPlan);
  const agregarLinea = useFaroStore((s) => s.agregarLineaPlan);
  const setMontoLinea = useFaroStore((s) => s.setMontoLineaPlan);
  const eliminarLinea = useFaroStore((s) => s.eliminarLineaPlan);
  const presentarPlan = useFaroStore((s) => s.presentarPlan);

  const [nuevoObjetivo, setNuevoObjetivo] = useState('');
  const [openInv, setOpenInv] = useState(false);
  const [invConcepto, setInvConcepto] = useState('');
  const [invMonto, setInvMonto] = useState('');
  const [invTrim, setInvTrim] = useState<1 | 2 | 3 | 4>(1);
  const [nuevaIng, setNuevaIng] = useState({ concepto: '', monto: '' });
  const [nuevaEgr, setNuevaEgr] = useState({ concepto: '', monto: '' });

  const ingEsperados = useMemo(
    () => plan.ingresos.reduce((s, l) => s + l.monto, 0),
    [plan.ingresos],
  );
  const egrOperativos = useMemo(
    () => plan.egresos.reduce((s, l) => s + l.monto, 0),
    [plan.egresos],
  );
  const resultadoOperativo = ingEsperados - egrOperativos;

  const inversionTotal = useMemo(
    () => plan.inversiones.reduce((s, i) => s + i.monto, 0),
    [plan.inversiones],
  );
  const aFinanciar = inversionTotal - resultadoOperativo; // si resultado es negativo, suma
  const objetivosCumplidos = plan.objetivos.filter((o) => o.cumplido).length;

  const porTrimestre = useMemo(() => {
    const t = [0, 0, 0, 0];
    for (const i of plan.inversiones) t[i.trimestre - 1] = (t[i.trimestre - 1] ?? 0) + i.monto;
    return t;
  }, [plan.inversiones]);
  const maxTrim = Math.max(1, ...porTrimestre);

  const inversionesOrden = useMemo(
    () => [...plan.inversiones].sort((a, b) => a.trimestre - b.trimestre || b.monto - a.monto),
    [plan.inversiones],
  );

  function addObjetivo() {
    const t = nuevoObjetivo.trim();
    if (!t) return;
    agregarObjetivo(t);
    setNuevoObjetivo('');
  }

  function addInversion() {
    const monto = Number(invMonto);
    if (!invConcepto.trim() || !monto || monto <= 0) {
      toast.push({ kind: 'warn', title: 'Completá concepto y monto' });
      return;
    }
    agregarInversion({ concepto: invConcepto.trim(), monto, trimestre: invTrim });
    setOpenInv(false);
    setInvConcepto('');
    setInvMonto('');
    setInvTrim(1);
    toast.push({ kind: 'success', title: 'Inversión agregada al plan' });
  }

  function addLinea(tipo: 'ingresos' | 'egresos') {
    const draft = tipo === 'ingresos' ? nuevaIng : nuevaEgr;
    const monto = Number(draft.monto);
    if (!draft.concepto.trim() || !monto || monto <= 0) {
      toast.push({ kind: 'warn', title: 'Completá concepto y monto' });
      return;
    }
    agregarLinea(tipo, draft.concepto.trim(), monto);
    if (tipo === 'ingresos') setNuevaIng({ concepto: '', monto: '' });
    else setNuevaEgr({ concepto: '', monto: '' });
  }

  function exportar() {
    const headers = ['Sección', 'Detalle', 'Monto / Estado'];
    const rows: Array<Array<string | number>> = [
      ['Objetivos', `Cumplidos`, `${objetivosCumplidos}/${plan.objetivos.length}`],
      ...plan.objetivos.map(
        (o) =>
          ['Objetivo', o.texto, o.cumplido ? 'Cumplido' : 'Pendiente'] as Array<string | number>,
      ),
      ...inversionesOrden.map(
        (i) => [`Inversión T${i.trimestre}`, i.concepto, i.monto] as Array<string | number>,
      ),
      ['Resumen', 'Inversión total planeada', inversionTotal],
      ['Resumen', 'Ingresos esperados', ingEsperados],
      ['Resumen', 'Egresos operativos esperados', egrOperativos],
      ['Resumen', 'Resultado operativo proyectado', resultadoOperativo],
      ['Resumen', 'Financiamiento a conseguir', Math.max(0, aFinanciar)],
    ];
    exportarCsv(`plan-${plan.anio}`, headers, rows);
    toast.push({
      kind: 'success',
      title: 'Plan exportado · CSV',
      description: `plan-${plan.anio}.csv`,
    });
  }

  return (
    <>
      <div className="mx-auto max-w-7xl space-y-5">
        <PageHero
          objetivo={`Tesorería · ${cuartel?.nombre ?? 'Cuartel'} · Planeamiento`}
          titulo={`Plan ${plan.anio}`}
          descripcion="Lo que vas a presentarle a la Comisión Directiva: los objetivos del año y las inversiones que el cuartel necesita."
          icono={<Target size={26} />}
          variant={plan.estado === 'presentado' ? 'success' : 'default'}
          meta={
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <Kpi
                label="Objetivos"
                value={plan.objetivos.length}
                hint={`${objetivosCumplidos} cumplidos`}
                intent="brand"
              />
              <Kpi
                label="Inversión planeada"
                value={arsCompact(inversionTotal)}
                hint={`${plan.inversiones.length} ítems`}
                intent="neutral"
                icon={<Wrench size={16} />}
              />
              <Kpi
                label="Resultado operativo"
                value={arsCompact(resultadoOperativo)}
                hint="ingresos − egresos"
                intent={resultadoOperativo >= 0 ? 'ok' : 'risk'}
              />
              <Kpi
                label="A financiar"
                value={arsCompact(Math.max(0, aFinanciar))}
                hint="para cumplir el plan"
                intent={aFinanciar > 0 ? 'warn' : 'ok'}
              />
            </div>
          }
          acciones={
            <>
              <Button intent="ghost" size="sm" onClick={exportar}>
                <Download size={12} /> Exportar plan
              </Button>
              <Button
                intent="primary"
                onClick={() => {
                  presentarPlan();
                  toast.push({
                    kind: 'success',
                    title: 'Plan marcado como presentado',
                    description: 'Quedó registrado como presentado a la Comisión Directiva.',
                  });
                }}
                disabled={plan.estado === 'presentado'}
              >
                <Send size={14} />{' '}
                {plan.estado === 'presentado' ? 'Presentado' : 'Presentar a la comisión'}
              </Button>
            </>
          }
        />

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {/* Objetivos */}
          <Card>
            <CardContent className="p-5">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="flex items-center gap-2 font-bold text-slate-900">
                  <Target size={16} className="text-brand-600" /> Objetivos del año
                </h3>
                <Badge intent="neutral">
                  {objetivosCumplidos}/{plan.objetivos.length}
                </Badge>
              </div>
              <ul className="space-y-1.5">
                {plan.objetivos.map((o) => (
                  <li
                    key={o.id}
                    className="group flex items-start gap-2.5 rounded-lg p-2 hover:bg-slate-50"
                  >
                    <button
                      type="button"
                      onClick={() => toggleObjetivo(o.id)}
                      className="mt-0.5 shrink-0"
                      aria-label={o.cumplido ? 'Marcar pendiente' : 'Marcar cumplido'}
                    >
                      {o.cumplido ? (
                        <CheckCircle2 size={18} className="text-status-ok" />
                      ) : (
                        <Circle size={18} className="text-slate-300" />
                      )}
                    </button>
                    <span
                      className={cn(
                        'flex-1 text-sm',
                        o.cumplido ? 'text-slate-400 line-through' : 'text-slate-800',
                      )}
                    >
                      {o.texto}
                    </span>
                    <button
                      type="button"
                      onClick={() => eliminarObjetivo(o.id)}
                      aria-label="Eliminar objetivo"
                      className="hover:text-status-risk-fg shrink-0 text-slate-300 opacity-0 transition-opacity group-hover:opacity-100"
                    >
                      <Trash2 size={15} />
                    </button>
                  </li>
                ))}
              </ul>
              <div className="mt-3 flex gap-2 border-t border-slate-100 pt-3">
                <Input
                  value={nuevoObjetivo}
                  onChange={(e) => setNuevoObjetivo(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addObjetivo()}
                  placeholder="Nuevo objetivo del año…"
                  className="flex-1"
                />
                <Button
                  intent="ghost"
                  size="sm"
                  onClick={addObjetivo}
                  disabled={!nuevoObjetivo.trim()}
                >
                  <Plus size={14} /> Agregar
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Inversiones */}
          <Card>
            <CardContent className="p-5">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="flex items-center gap-2 font-bold text-slate-900">
                  <Wrench size={16} className="text-brand-600" /> Inversiones planeadas
                </h3>
                <Button intent="ghost" size="sm" onClick={() => setOpenInv(true)}>
                  <Plus size={14} /> Agregar
                </Button>
              </div>
              <ul className="space-y-1.5">
                {inversionesOrden.map((i) => (
                  <li
                    key={i.id}
                    className="group flex items-center gap-2.5 rounded-lg border border-slate-200 p-2.5"
                  >
                    <Badge intent="brand">T{i.trimestre}</Badge>
                    <span className="min-w-0 flex-1 truncate text-sm text-slate-800">
                      {i.concepto}
                    </span>
                    <span className="shrink-0 font-mono text-sm font-bold text-slate-900">
                      {ars.format(i.monto)}
                    </span>
                    <button
                      type="button"
                      onClick={() => eliminarInversion(i.id)}
                      aria-label="Eliminar inversión"
                      className="hover:text-status-risk-fg shrink-0 text-slate-300 opacity-0 transition-opacity group-hover:opacity-100"
                    >
                      <Trash2 size={15} />
                    </button>
                  </li>
                ))}
                {plan.inversiones.length === 0 && (
                  <li className="rounded-lg border border-dashed border-slate-200 p-4 text-center text-sm text-slate-500">
                    Sin inversiones planeadas. Agregá la primera.
                  </li>
                )}
              </ul>
              {/* Por trimestre */}
              <div className="mt-3 border-t border-slate-100 pt-3">
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-600">Por trimestre</span>
                  <span className="font-mono font-bold text-slate-900">
                    Total {ars.format(inversionTotal)}
                  </span>
                </div>
                <div className="flex items-end gap-2">
                  {porTrimestre.map((m, i) => (
                    <div key={i} className="flex flex-1 flex-col items-center gap-1">
                      <div className="flex h-14 w-full items-end">
                        <div
                          className="bg-brand-500 w-full rounded-t transition-[height]"
                          style={{ height: `${(m / maxTrim) * 100}%` }}
                          title={ars.format(m)}
                        />
                      </div>
                      <span className="text-[11px] text-slate-500">
                        T{i + 1} · {arsCompact(m)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Presupuesto del año — editable */}
        <div className="space-y-0.5 px-1">
          <h2 className="text-sm font-bold uppercase tracking-wide text-slate-700">
            Presupuesto del año · armalo al detalle
          </h2>
          <p className="text-xs text-slate-500">
            Editá cada monto, agregá o quitá líneas. El cierre de abajo se recalcula solo.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {/* Ingresos */}
          <Card>
            <CardContent className="p-5">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="flex items-center gap-2 font-bold text-slate-900">
                  <ArrowUpRight size={16} className="text-status-ok-fg" /> Ingresos esperados
                </h3>
                <span className="text-status-ok-fg font-mono text-sm font-bold">
                  {ars.format(ingEsperados)}
                </span>
              </div>
              <ul className="space-y-1.5">
                {plan.ingresos.map((l) => (
                  <li key={l.id} className="group flex items-center gap-2">
                    <span className="min-w-0 flex-1 truncate text-sm text-slate-800">
                      {l.concepto}
                    </span>
                    <Input
                      type="number"
                      inputMode="numeric"
                      value={String(l.monto)}
                      onChange={(e) => setMontoLinea('ingresos', l.id, Number(e.target.value) || 0)}
                      className="w-28 text-right font-mono text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => eliminarLinea('ingresos', l.id)}
                      aria-label="Quitar ingreso"
                      className="hover:text-status-risk-fg shrink-0 text-slate-300 opacity-0 transition-opacity group-hover:opacity-100"
                    >
                      <Trash2 size={15} />
                    </button>
                  </li>
                ))}
              </ul>
              <div className="mt-3 flex gap-2 border-t border-slate-100 pt-3">
                <Input
                  value={nuevaIng.concepto}
                  onChange={(e) => setNuevaIng({ ...nuevaIng, concepto: e.target.value })}
                  onKeyDown={(e) => e.key === 'Enter' && addLinea('ingresos')}
                  placeholder="Nueva fuente…"
                  className="flex-1"
                />
                <Input
                  type="number"
                  inputMode="numeric"
                  value={nuevaIng.monto}
                  onChange={(e) => setNuevaIng({ ...nuevaIng, monto: e.target.value })}
                  placeholder="$"
                  className="w-24"
                />
                <Button intent="ghost" size="sm" onClick={() => addLinea('ingresos')}>
                  <Plus size={14} />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Egresos */}
          <Card>
            <CardContent className="p-5">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="flex items-center gap-2 font-bold text-slate-900">
                  <ArrowDownRight size={16} className="text-status-risk-fg" /> Egresos planeados
                </h3>
                <span className="text-status-risk-fg font-mono text-sm font-bold">
                  {ars.format(egrOperativos)}
                </span>
              </div>
              <ul className="space-y-1.5">
                {plan.egresos.map((l) => (
                  <li key={l.id} className="group flex items-center gap-2">
                    <span className="min-w-0 flex-1 truncate text-sm text-slate-800">
                      {l.concepto}
                    </span>
                    <Input
                      type="number"
                      inputMode="numeric"
                      value={String(l.monto)}
                      onChange={(e) => setMontoLinea('egresos', l.id, Number(e.target.value) || 0)}
                      className="w-28 text-right font-mono text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => eliminarLinea('egresos', l.id)}
                      aria-label="Quitar egreso"
                      className="hover:text-status-risk-fg shrink-0 text-slate-300 opacity-0 transition-opacity group-hover:opacity-100"
                    >
                      <Trash2 size={15} />
                    </button>
                  </li>
                ))}
              </ul>
              <div className="mt-3 flex gap-2 border-t border-slate-100 pt-3">
                <Input
                  value={nuevaEgr.concepto}
                  onChange={(e) => setNuevaEgr({ ...nuevaEgr, concepto: e.target.value })}
                  onKeyDown={(e) => e.key === 'Enter' && addLinea('egresos')}
                  placeholder="Nueva categoría…"
                  className="flex-1"
                />
                <Input
                  type="number"
                  inputMode="numeric"
                  value={nuevaEgr.monto}
                  onChange={(e) => setNuevaEgr({ ...nuevaEgr, monto: e.target.value })}
                  placeholder="$"
                  className="w-24"
                />
                <Button intent="ghost" size="sm" onClick={() => addLinea('egresos')}>
                  <Plus size={14} />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Cómo cierra el plan */}
        <Card>
          <CardContent className="p-5">
            <h3 className="mb-3 flex items-center gap-2 font-bold text-slate-900">
              <Coins size={16} className="text-brand-600" /> Cómo cierra el plan
            </h3>
            <div className="grid gap-3 sm:grid-cols-4">
              <div className="rounded-xl border border-slate-200 p-3">
                <div className="text-xs text-slate-500">Ingresos esperados</div>
                <div className="text-status-ok-fg text-lg font-bold">
                  {arsCompact(ingEsperados)}
                </div>
              </div>
              <div className="rounded-xl border border-slate-200 p-3">
                <div className="text-xs text-slate-500">Egresos operativos</div>
                <div className="text-status-risk-fg text-lg font-bold">
                  {arsCompact(egrOperativos)}
                </div>
              </div>
              <div className="rounded-xl border border-slate-200 p-3">
                <div className="text-xs text-slate-500">+ Inversiones del plan</div>
                <div className="text-brand-700 text-lg font-bold">{arsCompact(inversionTotal)}</div>
              </div>
              <div
                className={cn(
                  'rounded-xl border p-3',
                  aFinanciar > 0
                    ? 'border-status-warn/30 bg-status-warn-bg/20'
                    : 'border-status-ok/30 bg-status-ok-bg/20',
                )}
              >
                <div className="text-xs font-semibold text-slate-600">A financiar</div>
                <div
                  className={cn(
                    'text-lg font-bold',
                    aFinanciar > 0 ? 'text-status-warn-fg' : 'text-status-ok-fg',
                  )}
                >
                  {arsCompact(Math.max(0, aFinanciar))}
                </div>
              </div>
            </div>
            <p className="mt-3 border-t border-slate-100 pt-3 text-sm text-slate-700">
              {aFinanciar > 0 ? (
                <>
                  Con los ingresos previstos, el plan deja un{' '}
                  {resultadoOperativo >= 0 ? 'excedente' : 'déficit'} operativo de{' '}
                  <strong>{ars.format(Math.abs(resultadoOperativo))}</strong>. Para cumplir las
                  inversiones de {ars.format(inversionTotal)} hay que conseguir{' '}
                  <strong>{ars.format(aFinanciar)}</strong> extra (subsidios extraordinarios, rifas,
                  reservas o estirar las inversiones a otro año).
                </>
              ) : (
                <>
                  Los ingresos previstos alcanzan para cubrir la operación y las inversiones del
                  plan.{' '}
                </>
              )}
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-slate-50">
          <CardContent className="flex items-start gap-3 p-4 text-sm text-slate-600">
            <Target size={18} className="mt-0.5 shrink-0 text-slate-500" />
            <div>
              <strong className="text-slate-900">¿Para qué sirve?</strong> El jefe arma este plan ~2
              meses antes y se lo presenta a la Comisión Directiva: qué se quiere lograr y qué hay
              que comprar/renovar. Así, en enero, todos saben hacia dónde va el cuartel — y con qué
              plata.
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dialog nueva inversión */}
      <Dialog
        open={openInv}
        onClose={() => setOpenInv(false)}
        title="Agregar inversión al plan"
        description="Algo que el cuartel necesita comprar o renovar el año que viene."
        footer={
          <div className="flex justify-end gap-2">
            <Button intent="ghost" onClick={() => setOpenInv(false)}>
              Cancelar
            </Button>
            <Button intent="primary" onClick={addInversion}>
              <Plus size={14} /> Agregar
            </Button>
          </div>
        }
      >
        <div className="space-y-3">
          <div>
            <Label>Concepto *</Label>
            <Input
              value={invConcepto}
              onChange={(e) => setInvConcepto(e.target.value)}
              placeholder="Ej: Renovar mangueras de 2½″"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Monto *</Label>
              <Input
                type="number"
                value={invMonto}
                onChange={(e) => setInvMonto(e.target.value)}
                placeholder="1500000"
              />
            </div>
            <div>
              <Label>Trimestre</Label>
              <div className="mt-1 flex gap-1">
                {([1, 2, 3, 4] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setInvTrim(t)}
                    className={cn(
                      'flex-1 rounded-lg border px-2 py-2 text-sm font-semibold',
                      invTrim === t
                        ? 'border-brand-600 bg-brand-50 text-brand-700'
                        : 'border-slate-200 text-slate-600',
                    )}
                  >
                    T{t}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Dialog>
    </>
  );
}
