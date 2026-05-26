'use client';

import { Button, Dialog, Input, Label, useToast } from '@faro/ui';
import { Landmark } from 'lucide-react';
import { useState } from 'react';

import { useFaroStore } from '../../store/use-faro-store';

import { TIPO_CAJA_LABEL } from './utils';

import type { Caja, TipoCaja } from '@faro/types';

interface Props {
  open: boolean;
  onClose: () => void;
}

const TIPOS: TipoCaja[] = [
  'caja_chica',
  'caja_principal',
  'banco_cc',
  'banco_ca',
  'mercadopago',
  'plazo_fijo',
];

export function NuevaCajaDialog({ open, onClose }: Props) {
  const toast = useToast();
  const sesion = useFaroStore((s) => s.sesion);
  const crearCaja = useFaroStore((s) => s.crearCaja);
  const [nombre, setNombre] = useState('');
  const [tipo, setTipo] = useState<TipoCaja>('caja_chica');
  const [banco, setBanco] = useState('');
  const [cbu, setCbu] = useState('');
  const [alias, setAlias] = useState('');
  const [saldoInicial, setSaldoInicial] = useState('0');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const esBancaria = tipo === 'banco_cc' || tipo === 'banco_ca' || tipo === 'plazo_fijo';

  function close() {
    setNombre('');
    setTipo('caja_chica');
    setBanco('');
    setCbu('');
    setAlias('');
    setSaldoInicial('0');
    setErrors({});
    onClose();
  }

  function guardar() {
    const e: Record<string, string> = {};
    if (nombre.trim().length < 3) e.nombre = 'Mínimo 3 caracteres';
    if (esBancaria && !banco) e.banco = 'Indicá el banco';
    if (cbu && cbu.length !== 22) e.cbu = 'CBU debe tener 22 dígitos';
    const saldo = Number(saldoInicial);
    if (isNaN(saldo) || saldo < 0) e.saldo = 'Saldo inválido';
    if (Object.keys(e).length > 0) {
      setErrors(e);
      toast.push({
        kind: 'warn',
        title: 'Revisá el formulario',
        description: Object.values(e)[0],
      });
      return;
    }
    const cajaInput: Omit<Caja, 'id'> = {
      cuartelId: sesion?.cuartelId ?? 'cuartel-villa-ballester',
      nombre: nombre.trim(),
      tipo,
      banco: esBancaria ? banco : undefined,
      cbu: cbu || undefined,
      alias: alias || undefined,
      saldoActual: saldo,
      saldoConciliado: saldo,
      fechaUltimaConciliacion: new Date().toISOString().slice(0, 10),
      moneda: 'ARS',
      activa: true,
    };
    const c = crearCaja(cajaInput);
    toast.push({
      kind: 'success',
      title: `Caja ${c.nombre} creada`,
      description: 'Disponible para registrar movimientos',
    });
    close();
  }

  return (
    <Dialog
      open={open}
      onClose={close}
      title="Nueva cuenta"
      description="Sumá una caja de efectivo, cuenta del banco o billetera virtual."
      footer={
        <div className="flex justify-end gap-2">
          <Button intent="ghost" onClick={close}>
            Cancelar
          </Button>
          <Button intent="primary" onClick={guardar}>
            <Landmark size={14} /> Crear cuenta
          </Button>
        </div>
      }
    >
      <div className="space-y-3">
        <div>
          <Label>Tipo *</Label>
          <select
            value={tipo}
            onChange={(e) => setTipo(e.target.value as TipoCaja)}
            className="focus:border-brand-400 mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2"
          >
            {TIPOS.map((t) => (
              <option key={t} value={t}>
                {TIPO_CAJA_LABEL[t]}
              </option>
            ))}
          </select>
        </div>

        <div>
          <Label>Nombre *</Label>
          <Input
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder={esBancaria ? 'BNA · Caja Ahorro Pesos' : 'Caja chica · materiales'}
            aria-invalid={!!errors.nombre}
          />
          {errors.nombre && (
            <p className="text-status-risk-fg mt-1 text-xs font-medium">{errors.nombre}</p>
          )}
        </div>

        {esBancaria && (
          <>
            <div>
              <Label>Banco *</Label>
              <Input
                value={banco}
                onChange={(e) => setBanco(e.target.value)}
                placeholder="Banco Nación Argentina"
                aria-invalid={!!errors.banco}
              />
              {errors.banco && (
                <p className="text-status-risk-fg mt-1 text-xs font-medium">{errors.banco}</p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>CBU</Label>
                <Input
                  value={cbu}
                  onChange={(e) => setCbu(e.target.value.replace(/\s/g, ''))}
                  placeholder="0110599540000012345678"
                  maxLength={22}
                  aria-invalid={!!errors.cbu}
                />
                {errors.cbu && (
                  <p className="text-status-risk-fg mt-1 text-xs font-medium">{errors.cbu}</p>
                )}
              </div>
              <div>
                <Label>Alias</Label>
                <Input
                  value={alias}
                  onChange={(e) => setAlias(e.target.value.toUpperCase())}
                  placeholder="BOMBEROS.VBA.AR"
                />
              </div>
            </div>
          </>
        )}

        <div>
          <Label>Saldo inicial *</Label>
          <Input
            type="number"
            value={saldoInicial}
            onChange={(e) => setSaldoInicial(e.target.value)}
            placeholder="0"
            aria-invalid={!!errors.saldo}
          />
          {errors.saldo && (
            <p className="text-status-risk-fg mt-1 text-xs font-medium">{errors.saldo}</p>
          )}
          <p className="mt-1 text-xs text-slate-500">
            Si la cuenta es nueva, dejá 0. Si ya tenía plata, poné el saldo de hoy.
          </p>
        </div>
      </div>
    </Dialog>
  );
}
