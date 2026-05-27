'use client';

import { Badge, Button, Dialog, Input, Label, cn, useToast } from '@faro/ui';
import { ArrowDownRight, ArrowLeftRight, ArrowUpRight, Calculator, Camera } from 'lucide-react';
import { useMemo, useState } from 'react';

import { useFaroStore } from '../../store/use-faro-store';

import { MEDIO_LABEL, ars } from './utils';

import type { MedioPago, MovimientoFinanciero } from '@faro/types';

interface Props {
  open: boolean;
  onClose: () => void;
  /** Pre-llenar tipo (para botones contextuales) */
  tipoInicial?: 'ingreso' | 'egreso' | 'transferencia';
}

const MEDIOS: MedioPago[] = [
  'efectivo',
  'transferencia',
  'cheque',
  'tarjeta_debito',
  'tarjeta_credito',
  'mercadopago',
  'debito_automatico',
];

const COMPROBANTES = ['FA-A', 'FA-B', 'FA-C', 'NC', 'ND', 'Recibo', 'Ticket', 'Otro'] as const;

export function NuevoMovimientoDialog({ open, onClose, tipoInicial = 'egreso' }: Props) {
  const toast = useToast();
  const cuentas = useFaroStore((s) => s.cuentas);
  const cajas = useFaroStore((s) => s.cajas);
  const crearMovimiento = useFaroStore((s) => s.crearMovimiento);
  const sesion = useFaroStore((s) => s.sesion);

  const [tipo, setTipo] = useState<'ingreso' | 'egreso' | 'transferencia'>(tipoInicial);
  const [fecha, setFecha] = useState(new Date().toISOString().slice(0, 10));
  const [monto, setMonto] = useState('');
  const [cuentaId, setCuentaId] = useState('');
  const [cajaOrigenId, setCajaOrigenId] = useState(cajas[0]?.id ?? '');
  const [cajaDestinoId, setCajaDestinoId] = useState(cajas[1]?.id ?? '');
  const [medio, setMedio] = useState<MedioPago>('transferencia');
  const [descripcion, setDescripcion] = useState('');
  const [contraparte, setContraparte] = useState('');
  const [cuit, setCuit] = useState('');
  const [comprobanteTipo, setComprobanteTipo] =
    useState<MovimientoFinanciero['comprobanteTipo']>('FA-A');
  const [comprobanteNumero, setComprobanteNumero] = useState('');
  const [adjunto, setAdjunto] = useState<string | undefined>(undefined);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const cuentasFiltradas = useMemo(() => {
    if (tipo === 'transferencia') return cuentas.filter((c) => c.operable);
    return cuentas.filter(
      (c) => c.operable && (tipo === 'ingreso' ? c.tipo === 'ingreso' : c.tipo === 'egreso'),
    );
  }, [cuentas, tipo]);

  function reset() {
    setTipo(tipoInicial);
    setFecha(new Date().toISOString().slice(0, 10));
    setMonto('');
    setCuentaId('');
    setCajaOrigenId(cajas[0]?.id ?? '');
    setCajaDestinoId(cajas[1]?.id ?? '');
    setMedio('transferencia');
    setDescripcion('');
    setContraparte('');
    setCuit('');
    setComprobanteTipo('FA-A');
    setComprobanteNumero('');
    setAdjunto(undefined);
    setErrors({});
  }

  function close() {
    reset();
    onClose();
  }

  function validar(): Record<string, string> {
    const e: Record<string, string> = {};
    const m = Number(monto);
    if (!monto || isNaN(m) || m <= 0) e.monto = 'Monto debe ser mayor a 0';
    if (m > 50_000_000) e.monto = 'Monto demasiado alto, revisar';
    if (!cajaOrigenId) e.caja = 'Seleccioná caja origen';
    if (tipo === 'transferencia' && !cajaDestinoId) e.cajaDestino = 'Caja destino';
    if (tipo === 'transferencia' && cajaOrigenId === cajaDestinoId)
      e.cajaDestino = 'Origen y destino deben ser distintos';
    if (tipo !== 'transferencia' && !cuentaId) e.cuenta = 'Seleccioná cuenta contable';
    if (!descripcion || descripcion.trim().length < 5) e.descripcion = 'Mínimo 5 caracteres';
    if (cuit && !/^\d{2}-?\d{8}-?\d{1}$/.test(cuit)) e.cuit = 'CUIT inválido (XX-XXXXXXXX-X)';
    setErrors(e);
    return e;
  }

  function guardar(comoBorrador: boolean) {
    const errs = validar();
    if (Object.keys(errs).length > 0) {
      toast.push({
        kind: 'warn',
        title: 'Revisá el formulario',
        description: Object.values(errs)[0],
      });
      return;
    }
    const cuartelId = sesion?.cuartelId ?? cajas[0]?.cuartelId ?? '';
    const m = Number(monto);
    const data: Parameters<typeof crearMovimiento>[0] = {
      cuartelId,
      tipo,
      fecha: `${fecha}T${new Date().toTimeString().slice(0, 5)}:00`,
      monto: m,
      cuentaId: tipo === 'transferencia' ? 'c-1-1' : cuentaId,
      cajaOrigenId,
      cajaDestinoId: tipo === 'transferencia' ? cajaDestinoId : undefined,
      medio,
      descripcion: descripcion.trim(),
      contraparte: contraparte.trim() || undefined,
      cuitContraparte: cuit || undefined,
      comprobanteTipo: tipo !== 'transferencia' ? comprobanteTipo : undefined,
      comprobanteNumero: comprobanteNumero || undefined,
      comprobanteUrl: adjunto,
      estado: comoBorrador ? 'borrador' : 'conciliado',
    };
    const mov = crearMovimiento(data);
    toast.push({
      kind: 'success',
      title: `${tipo === 'ingreso' ? 'Ingreso' : tipo === 'egreso' ? 'Egreso' : 'Transferencia'} cargado`,
      description: `${ars.format(mov.monto)} · ${comoBorrador ? 'guardado como borrador' : 'registrado correctamente'}`,
    });
    close();
  }

  function simulOcr() {
    setAdjunto(`comp-${Date.now()}`);
    setContraparte('YPF SA');
    setCuit('30-54668997-0');
    setComprobanteTipo('FA-A');
    setComprobanteNumero('0042-00129631');
    setMonto('58000');
    toast.push({
      kind: 'success',
      title: 'OCR completo',
      description: 'Detecté CUIT, monto y nº de comprobante de la factura.',
    });
  }

  return (
    <Dialog
      open={open}
      onClose={close}
      title="Nuevo movimiento"
      description="Registrá una entrada, salida o pase entre cajas."
      size="lg"
      footer={
        <div className="flex flex-wrap justify-end gap-2">
          <Button intent="ghost" onClick={close}>
            Cancelar
          </Button>
          <Button intent="secondary" onClick={() => guardar(true)}>
            Guardar borrador
          </Button>
          <Button intent="primary" onClick={() => guardar(false)}>
            Confirmar y registrar
          </Button>
        </div>
      }
    >
      <div className="space-y-3">
        {/* Tipo */}
        <div>
          <Label>Tipo *</Label>
          <div className="mt-1 grid grid-cols-3 gap-2">
            {(['ingreso', 'egreso', 'transferencia'] as const).map((t) => {
              const Icon =
                t === 'ingreso' ? ArrowUpRight : t === 'egreso' ? ArrowDownRight : ArrowLeftRight;
              const color =
                t === 'ingreso'
                  ? 'border-status-ok bg-status-ok-bg text-status-ok-fg'
                  : t === 'egreso'
                    ? 'border-status-risk bg-status-risk-bg text-status-risk-fg'
                    : 'border-brand-500 bg-brand-50 text-brand-900';
              const inactive = 'border-slate-200 bg-white text-slate-700';
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTipo(t)}
                  className={cn(
                    'flex items-center justify-center gap-1.5 rounded-lg border-2 px-3 py-2 text-sm font-medium transition-all',
                    tipo === t ? color : inactive,
                  )}
                >
                  <Icon size={14} />
                  <span className="capitalize">{t}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Fecha *</Label>
            <Input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} />
          </div>
          <div>
            <Label>Monto (ARS) *</Label>
            <Input
              type="number"
              step="0.01"
              value={monto}
              onChange={(e) => setMonto(e.target.value)}
              placeholder="125000"
              aria-invalid={!!errors.monto}
            />
            {errors.monto && (
              <p className="text-status-risk-fg mt-1 text-xs font-medium">{errors.monto}</p>
            )}
          </div>
        </div>

        {/* Categoría (solo ingreso/egreso) */}
        {tipo !== 'transferencia' && (
          <div>
            <Label>Categoría *</Label>
            <select
              value={cuentaId}
              onChange={(e) => setCuentaId(e.target.value)}
              className="focus:border-brand-400 mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2"
              aria-invalid={!!errors.cuenta}
            >
              <option value="">Seleccionar...</option>
              {cuentasFiltradas.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.codigo} · {c.nombre}
                </option>
              ))}
            </select>
            {errors.cuenta && (
              <p className="text-status-risk-fg mt-1 text-xs font-medium">{errors.cuenta}</p>
            )}
          </div>
        )}

        {/* Cajas */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>{tipo === 'transferencia' ? 'Desde *' : 'Cuenta *'}</Label>
            <select
              value={cajaOrigenId}
              onChange={(e) => setCajaOrigenId(e.target.value)}
              className="focus:border-brand-400 mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2"
            >
              {cajas.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre} ({ars.format(c.saldoActual)})
                </option>
              ))}
            </select>
          </div>
          {tipo === 'transferencia' ? (
            <div>
              <Label>Hacia *</Label>
              <select
                value={cajaDestinoId}
                onChange={(e) => setCajaDestinoId(e.target.value)}
                className="focus:border-brand-400 mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2"
                aria-invalid={!!errors.cajaDestino}
              >
                {cajas.map((c) => (
                  <option key={c.id} value={c.id} disabled={c.id === cajaOrigenId}>
                    {c.nombre}
                  </option>
                ))}
              </select>
              {errors.cajaDestino && (
                <p className="text-status-risk-fg mt-1 text-xs font-medium">{errors.cajaDestino}</p>
              )}
            </div>
          ) : (
            <div>
              <Label>Medio de pago *</Label>
              <select
                value={medio}
                onChange={(e) => setMedio(e.target.value as MedioPago)}
                className="focus:border-brand-400 mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2"
              >
                {MEDIOS.map((m) => (
                  <option key={m} value={m}>
                    {MEDIO_LABEL[m]}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Descripción */}
        <div>
          <Label>Descripción *</Label>
          <Input
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            placeholder={
              tipo === 'ingreso'
                ? 'Subsidio Ley 25.054 · cuota mayo'
                : tipo === 'egreso'
                  ? 'Combustible diesel BV-1'
                  : 'Transferencia caja chica → MP'
            }
            aria-invalid={!!errors.descripcion}
          />
          {errors.descripcion && (
            <p className="text-status-risk-fg mt-1 text-xs font-medium">{errors.descripcion}</p>
          )}
        </div>

        {/* Bloque comprobante (solo ingreso/egreso) */}
        {tipo !== 'transferencia' && (
          <>
            <div className="border-t border-slate-100 pt-3">
              <div className="mb-2 flex items-center justify-between">
                <Label>Factura o recibo</Label>
                <Button intent="ghost" size="sm" onClick={simulOcr}>
                  <Camera size={12} /> Adjuntar foto
                </Button>
              </div>
              {adjunto && (
                <div className="bg-status-ok-bg/40 text-status-ok-fg mb-2 flex items-center gap-2 rounded p-2 text-xs">
                  <Calculator size={12} />
                  <span className="flex-1">Foto leída automáticamente · campos completados</span>
                  <Badge intent="ok">{adjunto.slice(-6)}</Badge>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Tipo de factura</Label>
                <select
                  value={comprobanteTipo}
                  onChange={(e) =>
                    setComprobanteTipo(e.target.value as MovimientoFinanciero['comprobanteTipo'])
                  }
                  className="focus:border-brand-400 mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2"
                >
                  {COMPROBANTES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Número</Label>
                <Input
                  value={comprobanteNumero}
                  onChange={(e) => setComprobanteNumero(e.target.value)}
                  placeholder="0042-00129631"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>{tipo === 'ingreso' ? 'De quién' : 'A quién'}</Label>
                <Input
                  value={contraparte}
                  onChange={(e) => setContraparte(e.target.value)}
                  placeholder={tipo === 'ingreso' ? 'Donante o cliente' : 'Proveedor'}
                />
              </div>
              <div>
                <Label>CUIT</Label>
                <Input
                  value={cuit}
                  onChange={(e) => setCuit(e.target.value)}
                  placeholder="30-54668997-0"
                  aria-invalid={!!errors.cuit}
                />
                {errors.cuit && (
                  <p className="text-status-risk-fg mt-1 text-xs font-medium">{errors.cuit}</p>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </Dialog>
  );
}
