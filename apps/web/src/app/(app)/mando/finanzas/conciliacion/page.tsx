'use client';

import { Badge, Button, Card, CardContent, Input, Kpi, cn, useToast } from '@faro/ui';
import { AlertTriangle, CheckCircle2, Circle, Landmark, Plus, Scale, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';

import {
  TIPO_CAJA_LABEL,
  ars,
  arsCompact,
  fechaCorta,
} from '../../../../../components/finanzas/utils';
import { PageHero } from '../../../../../components/shared/page-hero';
import { demoToday } from '../../../../../lib/utils/demo-today';
import { selectCuartelActivo, useFaroStore } from '../../../../../store/use-faro-store';

interface Ajuste {
  id: string;
  descripcion: string;
  monto: number;
}

export default function ConciliacionPage() {
  const toast = useToast();
  const cuartel = useFaroStore(selectCuartelActivo);
  const cajas = useFaroStore((s) => s.cajas);
  const movimientos = useFaroStore((s) => s.movimientos);
  const actualizarCaja = useFaroStore((s) => s.actualizarCaja);

  const [selId, setSelId] = useState(cajas[0]?.id ?? '');
  const [extracto, setExtracto] = useState(String(cajas[0]?.saldoActual ?? ''));
  const [confirmados, setConfirmados] = useState<Set<string>>(new Set());
  const [ajustes, setAjustes] = useState<Ajuste[]>([]);
  const [ajDesc, setAjDesc] = useState('');
  const [ajMonto, setAjMonto] = useState('');

  const caja = cajas.find((c) => c.id === selId) ?? cajas[0];

  const movsCaja = useMemo(() => {
    if (!caja) return [];
    return movimientos
      .filter(
        (m) =>
          m.estado === 'conciliado' && (m.cajaOrigenId === caja.id || m.cajaDestinoId === caja.id),
      )
      .sort((a, b) => b.fecha.localeCompare(a.fecha))
      .slice(0, 12);
  }, [movimientos, caja]);

  function seleccionar(id: string) {
    const c = cajas.find((x) => x.id === id);
    setSelId(id);
    setExtracto(String(c?.saldoActual ?? ''));
    setConfirmados(new Set());
    setAjustes([]);
  }

  function toggle(id: string) {
    setConfirmados((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  }

  function addAjuste() {
    const monto = Number(ajMonto);
    if (!ajDesc.trim() || !monto) {
      toast.push({ kind: 'warn', title: 'Completá descripción y monto (puede ser negativo)' });
      return;
    }
    setAjustes((a) => [
      ...a,
      { id: `aj-${a.length}-${ajDesc.length}`, descripcion: ajDesc.trim(), monto },
    ]);
    setAjDesc('');
    setAjMonto('');
  }

  if (!caja) {
    return (
      <div className="mx-auto max-w-4xl">
        <PageHero
          objetivo="Tesorería"
          titulo="Conciliación"
          descripcion="No hay cuentas cargadas."
          icono={<Scale size={26} />}
        />
      </div>
    );
  }

  const saldoSistema = caja.saldoActual;
  const saldoExtracto = Number(extracto) || 0;
  const diferencia = saldoSistema - saldoExtracto;
  const totalAjustes = ajustes.reduce((s, a) => s + a.monto, 0);
  // El sistema + los ajustes (comisiones/intereses que faltan cargar) debe igualar
  // al extracto. Cuadra cuando (sistema − extracto) + ajustes = 0.
  const sinExplicar = diferencia + totalAjustes;
  const cuadra = Math.abs(sinExplicar) < 1;

  const cuadradas = cajas.filter((c) => c.saldoActual === c.saldoConciliado).length;

  function conciliar() {
    actualizarCaja(caja!.id, {
      saldoConciliado: saldoExtracto,
      fechaUltimaConciliacion: demoToday().toISOString().slice(0, 10),
    });
    toast.push({
      kind: 'success',
      title: `${caja!.nombre} conciliada`,
      description: 'El saldo del sistema quedó cuadrado contra el extracto del banco.',
    });
  }

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <PageHero
        objetivo={`Tesorería · ${cuartel?.nombre ?? 'Cuartel'}`}
        titulo="Cuadrá tus cuentas con el banco"
        descripcion="Compará el saldo del sistema con el del extracto, tildá lo que figura y explicá la diferencia. Cuando cuadra, queda conciliada."
        icono={<Scale size={26} />}
        meta={
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Kpi
              label="Cuentas"
              value={cajas.length}
              intent="neutral"
              icon={<Landmark size={16} />}
            />
            <Kpi
              label="Cuadradas"
              value={`${cuadradas}/${cajas.length}`}
              intent={cuadradas === cajas.length ? 'ok' : 'warn'}
            />
            <Kpi
              label="Saldo sistema"
              value={arsCompact(saldoSistema)}
              hint={caja.nombre}
              intent="brand"
            />
            <Kpi
              label="Estado"
              value={cuadra ? 'Cuadra' : 'A explicar'}
              intent={cuadra ? 'ok' : 'risk'}
            />
          </div>
        }
      />

      {/* Selector de cuenta */}
      <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1">
        {cajas.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => seleccionar(c.id)}
            className={cn(
              'inline-flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors',
              selId === c.id
                ? 'bg-brand-600 text-white'
                : 'bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50',
            )}
          >
            {c.nombre}
            {c.saldoActual === c.saldoConciliado && (
              <CheckCircle2
                size={13}
                className={selId === c.id ? 'text-white' : 'text-status-ok'}
              />
            )}
          </button>
        ))}
      </div>

      {/* Saldos + diferencia */}
      <Card>
        <CardContent className="p-5">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-slate-200 p-4">
              <div className="text-xs uppercase tracking-wide text-slate-500">
                Saldo en el sistema
              </div>
              <div className="mt-1 font-mono text-2xl font-bold text-slate-900">
                {ars.format(saldoSistema)}
              </div>
              <div className="text-xs text-slate-500">{TIPO_CAJA_LABEL[caja.tipo]}</div>
            </div>
            <div className="border-brand-200 bg-brand-50/40 rounded-xl border-2 p-4">
              <label className="text-xs uppercase tracking-wide text-slate-500">
                Saldo en el banco (extracto)
              </label>
              <Input
                type="number"
                value={extracto}
                onChange={(e) => setExtracto(e.target.value)}
                className="mt-1 font-mono text-lg font-bold"
              />
              <div className="text-xs text-slate-500">Lo que dice tu home banking o el PDF.</div>
            </div>
            <div
              className={cn(
                'rounded-xl border p-4',
                cuadra
                  ? 'border-status-ok/30 bg-status-ok-bg/20'
                  : 'border-status-risk/30 bg-status-risk-bg/20',
              )}
            >
              <div className="text-xs uppercase tracking-wide text-slate-500">
                {cuadra ? 'Resultado' : 'Falta explicar'}
              </div>
              <div
                className={cn(
                  'mt-1 font-mono text-2xl font-bold',
                  cuadra ? 'text-status-ok-fg' : 'text-status-risk-fg',
                )}
              >
                {cuadra ? '✓ Cuadra' : ars.format(Math.abs(sinExplicar))}
              </div>
              <div className="text-xs text-slate-500">
                {cuadra
                  ? 'Sistema y banco coinciden.'
                  : 'Cargá los ajustes que el banco tiene y el sistema no, hasta que llegue a cero.'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-5 lg:grid-cols-2">
        {/* Movimientos a confirmar */}
        <Card>
          <CardContent className="p-5">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-bold text-slate-900">Movimientos del sistema</h3>
              <Badge intent="neutral">
                {confirmados.size}/{movsCaja.length} en el extracto
              </Badge>
            </div>
            {movsCaja.length === 0 ? (
              <p className="text-sm text-slate-500">
                Esta cuenta no tiene movimientos confirmados.
              </p>
            ) : (
              <ul className="space-y-1">
                {movsCaja.map((m) => {
                  const ok = confirmados.has(m.id);
                  const esIngreso =
                    m.tipo === 'ingreso' ||
                    (m.tipo === 'transferencia' && m.cajaDestinoId === caja.id);
                  return (
                    <li key={m.id}>
                      <button
                        type="button"
                        onClick={() => toggle(m.id)}
                        className={cn(
                          'flex w-full items-center gap-2.5 rounded-lg p-2 text-left transition-colors',
                          ok ? 'bg-status-ok-bg/30' : 'hover:bg-slate-50',
                        )}
                      >
                        {ok ? (
                          <CheckCircle2 size={18} className="text-status-ok shrink-0" />
                        ) : (
                          <Circle size={18} className="shrink-0 text-slate-300" />
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-sm font-medium text-slate-900">
                            {m.descripcion}
                          </div>
                          <div className="text-xs text-slate-500">{fechaCorta(m.fecha)}</div>
                        </div>
                        <span
                          className={cn(
                            'shrink-0 font-mono text-sm font-bold',
                            esIngreso ? 'text-status-ok-fg' : 'text-status-risk-fg',
                          )}
                        >
                          {esIngreso ? '+' : '−'}
                          {arsCompact(m.monto)}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
            <p className="mt-2 text-[11px] text-slate-400">
              Tildá los que ya figuran en el extracto. Los que no, están en tránsito o faltan
              cargar.
            </p>
          </CardContent>
        </Card>

        {/* Ajustes */}
        <Card>
          <CardContent className="p-5">
            <h3 className="mb-1 font-bold text-slate-900">Ajustes</h3>
            <p className="mb-3 text-xs text-slate-500">
              Cosas que están en el banco pero no en el sistema: comisiones, intereses, cheques en
              tránsito. Usá monto negativo para descuentos.
            </p>
            <ul className="space-y-1.5">
              {ajustes.map((a) => (
                <li
                  key={a.id}
                  className="flex items-center gap-2 rounded-lg border border-slate-200 p-2 text-sm"
                >
                  <span className="min-w-0 flex-1 truncate text-slate-800">{a.descripcion}</span>
                  <span
                    className={cn(
                      'font-mono font-bold',
                      a.monto < 0 ? 'text-status-risk-fg' : 'text-status-ok-fg',
                    )}
                  >
                    {a.monto < 0 ? '−' : '+'}
                    {ars.format(Math.abs(a.monto))}
                  </span>
                  <button
                    type="button"
                    onClick={() => setAjustes((arr) => arr.filter((x) => x.id !== a.id))}
                    className="hover:text-status-risk-fg text-slate-300"
                    aria-label="Quitar ajuste"
                  >
                    <Trash2 size={14} />
                  </button>
                </li>
              ))}
              {ajustes.length === 0 && (
                <li className="rounded-lg border border-dashed border-slate-200 p-3 text-center text-xs text-slate-400">
                  Sin ajustes. Agregá uno si el banco tiene algo que el sistema no.
                </li>
              )}
            </ul>
            <div className="mt-3 flex gap-2 border-t border-slate-100 pt-3">
              <Input
                value={ajDesc}
                onChange={(e) => setAjDesc(e.target.value)}
                placeholder="Ej: Comisión bancaria"
                className="flex-1"
              />
              <Input
                type="number"
                value={ajMonto}
                onChange={(e) => setAjMonto(e.target.value)}
                placeholder="-3200"
                className="w-28"
              />
              <Button intent="ghost" size="sm" onClick={addAjuste}>
                <Plus size={14} />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cierre */}
      <Card
        className={cn(
          'border-2',
          cuadra ? 'border-status-ok/30 bg-status-ok-bg/10' : 'border-slate-200',
        )}
      >
        <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
          <div className="flex items-center gap-3">
            {cuadra ? (
              <CheckCircle2 size={22} className="text-status-ok shrink-0" />
            ) : (
              <AlertTriangle size={22} className="text-status-warn-fg shrink-0" />
            )}
            <div className="text-sm text-slate-700">
              {cuadra ? (
                <>
                  <strong className="text-slate-900">{caja.nombre} cuadra.</strong> El saldo del
                  sistema coincide con el extracto (con los ajustes cargados).
                </>
              ) : (
                <>
                  Todavía faltan <strong>{ars.format(Math.abs(sinExplicar))}</strong> por explicar.
                  Tildá movimientos o cargá un ajuste hasta que cuadre.
                </>
              )}
            </div>
          </div>
          <Button intent="primary" onClick={conciliar} disabled={!cuadra}>
            <CheckCircle2 size={14} /> Marcar conciliada
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
