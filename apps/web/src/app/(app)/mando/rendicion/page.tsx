'use client';

import { Check, Sparkles, ShieldCheck, X } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

import type { ItemCopilotoRendicion } from '@faro/types';

import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  cn,
  Dialog,
  Input,
  Label,
  SectionHeader,
  useToast,
} from '@faro/ui';

import { SemaforoRendicion } from '../../../../components/rendicion/semaforo-rendicion';
import {
  useFaroStore,
  selectRendicionActual,
  selectPersonaActual,
  selectCuartelActivo,
} from '../../../../store/use-faro-store';
import { fmtMesPeriodo } from '../../../../lib/utils/date';

export default function RendicionPage() {
  const rendicion = useFaroStore(selectRendicionActual);
  const cuartel = useFaroStore(selectCuartelActivo);
  const persona = useFaroStore(selectPersonaActual);
  const presentar = useFaroStore((s) => s.presentarRendicion);
  const toast = useToast();
  const [copilotoOpen, setCopilotoOpen] = useState(false);
  const [copilotoCargando, setCopilotoCargando] = useState(false);
  const [copilotoItems, setCopilotoItems] = useState<ItemCopilotoRendicion[]>([]);
  const [confirmaOpen, setConfirmaOpen] = useState(false);
  const [confirmText, setConfirmText] = useState('');

  async function abrirCopiloto() {
    if (!rendicion) return;
    setCopilotoOpen(true);
    setCopilotoCargando(true);
    setCopilotoItems([]);
    try {
      const resp = await fetch('/api/ai/copiloto-rendicion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rendicion }),
      });
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const json = (await resp.json()) as { items: ItemCopilotoRendicion[] };
      setCopilotoItems(json.items);
    } catch (err) {
      console.error('[copiloto]', err);
      toast.push({
        kind: 'error',
        title: 'No se pudo cargar el copiloto',
        description: 'Mostramos la guía base.',
      });
    } finally {
      setCopilotoCargando(false);
    }
  }

  if (!rendicion) {
    return (
      <div className="mx-auto max-w-5xl">
        <Card>
          <CardContent className="p-6 text-slate-600">No hay rendición.</CardContent>
        </Card>
      </div>
    );
  }

  const faltantes = rendicion.requisitos.filter((r) => !r.completo);
  const presentable = faltantes.length === 0 && rendicion.estado !== 'presentada';

  function confirmarPresentacion() {
    if (confirmText.trim().toUpperCase() !== 'PRESENTAR') {
      toast.push({ kind: 'warn', title: 'Escribí PRESENTAR para confirmar' });
      return;
    }
    if (!persona) return;
    presentar(rendicion!.id, persona.id);
    setConfirmaOpen(false);
    setConfirmText('');
    toast.push({
      kind: 'success',
      title: '¡Rendición presentada!',
      description: `${cuartel?.nombre} · ${fmtMesPeriodo(rendicion!.periodo)}.`,
    });
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <SectionHeader
        title="Rendición al Fondo"
        description={`${cuartel?.nombre} · ${fmtMesPeriodo(rendicion.periodo)}`}
        actions={
          <Button intent="secondary" onClick={abrirCopiloto}>
            <Sparkles size={16} /> Copiloto IA
          </Button>
        }
      />

      <Card className="bg-gradient-to-br from-white to-slate-50">
        <CardContent className="p-5 sm:p-6">
          <div className="flex flex-col items-center gap-6 sm:flex-row">
            <SemaforoRendicion rendicion={rendicion} />
            <div className="flex-1 text-center sm:text-left">
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Estado
              </div>
              <h2 className="mt-1 text-2xl font-bold text-slate-900">
                {rendicion.estado === 'presentada'
                  ? 'Presentada al Fondo'
                  : faltantes.length === 0
                    ? 'Lista para presentar'
                    : `${faltantes.length} ítem${faltantes.length === 1 ? '' : 's'} pendiente${faltantes.length === 1 ? '' : 's'}`}
              </h2>
              <p className="mt-1 text-slate-600">
                {rendicion.estado === 'presentada'
                  ? `Presentada el ${new Date(rendicion.presentadaEn!).toLocaleString('es-AR')}.`
                  : 'Cuando todo esté en verde, presentamos al Fondo con tu confirmación.'}
              </p>
              {presentable && (
                <Button
                  intent="success"
                  size="lg"
                  className="mt-3"
                  onClick={() => setConfirmaOpen(true)}
                >
                  <ShieldCheck size={20} /> Presentar al Fondo
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Requisitos del Fondo</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ul className="divide-y divide-slate-100">
            {rendicion.requisitos.map((r) => (
              <li key={r.id} className="p-4 sm:p-5">
                <div className="flex items-start gap-3">
                  <div
                    className={cn(
                      'mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full',
                      r.completo ? 'bg-status-ok text-white' : 'bg-slate-200 text-slate-500',
                    )}
                  >
                    {r.completo && <Check size={14} />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="font-semibold text-slate-900">{r.titulo}</div>
                      <Badge intent={r.completo ? 'ok' : r.avance > 50 ? 'warn' : 'risk'}>
                        {r.avance}%
                      </Badge>
                    </div>
                    <p className="mt-0.5 text-sm text-slate-600">{r.descripcion}</p>
                    {!r.completo && r.linkPagina && (
                      <Link
                        href={r.linkPagina}
                        className="text-brand-700 hover:text-brand-900 mt-2 inline-flex items-center gap-1 text-sm font-medium"
                      >
                        Ir a resolver →
                      </Link>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Dialog
        open={copilotoOpen}
        onClose={() => setCopilotoOpen(false)}
        title="Copiloto de rendición"
        description="La IA propone. Vos confirmás. (Doble validación)"
      >
        <div className="max-h-[60vh] space-y-3 overflow-y-auto">
          {copilotoCargando && (
            <div className="py-8 text-center">
              <div className="border-brand-200 border-t-brand-600 mx-auto h-8 w-8 animate-spin rounded-full border-4" />
              <p className="mt-3 text-sm text-slate-600">Analizando la rendición con IA...</p>
            </div>
          )}

          {!copilotoCargando && faltantes.length === 0 && (
            <div className="py-6 text-center">
              <div className="text-4xl">🎉</div>
              <h3 className="mt-2 text-lg font-semibold">Todo en regla</h3>
              <p className="text-sm text-slate-600">
                No detecté ítems faltantes. Vos confirmás y presentás.
              </p>
            </div>
          )}

          {!copilotoCargando &&
            faltantes.length > 0 &&
            copilotoItems.length === 0 &&
            faltantes.map((r) => (
              <div key={r.id} className="rounded-lg border border-slate-200 p-3">
                <div className="font-semibold text-slate-900">{r.titulo}</div>
                <p className="mt-1 text-sm text-slate-600">{r.descripcion}</p>
                <div className="mt-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Por qué importa
                </div>
                <p className="text-sm text-slate-700">{r.importanciaTexto}</p>
                {r.linkPagina && (
                  <Link
                    href={r.linkPagina}
                    className="text-brand-700 mt-2 inline-block text-sm font-medium"
                  >
                    Resolver →
                  </Link>
                )}
              </div>
            ))}

          {!copilotoCargando &&
            copilotoItems.length > 0 &&
            copilotoItems.map((item) => {
              const req = rendicion?.requisitos.find((r) => r.id === item.requisitoId);
              return (
                <div key={item.requisitoId} className="rounded-lg border border-slate-200 p-3">
                  <div className="flex items-center gap-2 font-semibold text-slate-900">
                    <Sparkles size={14} className="text-brand-600" />
                    {item.titulo}
                  </div>
                  <p className="mt-1 text-sm text-slate-700">{item.diagnostico}</p>

                  {item.acciones && item.acciones.length > 0 && (
                    <>
                      <div className="mt-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Qué hacer
                      </div>
                      <ul className="mt-1 list-inside list-disc space-y-0.5 text-sm text-slate-700">
                        {item.acciones.map((a, idx) => (
                          <li key={idx}>{a}</li>
                        ))}
                      </ul>
                    </>
                  )}

                  <div className="mt-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Por qué importa
                  </div>
                  <p className="text-sm text-slate-700">{item.importanciaTexto}</p>

                  {item.textoRedactado && (
                    <div className="mt-3 rounded-md border border-slate-200 bg-slate-50 p-3">
                      <div className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Borrador redactado
                      </div>
                      <p className="text-sm italic text-slate-700">{item.textoRedactado}</p>
                    </div>
                  )}

                  {req?.linkPagina && (
                    <Link
                      href={req.linkPagina}
                      className="text-brand-700 mt-2 inline-block text-sm font-medium"
                    >
                      Resolver →
                    </Link>
                  )}
                </div>
              );
            })}
        </div>
      </Dialog>

      <Dialog
        open={confirmaOpen}
        onClose={() => setConfirmaOpen(false)}
        title="Confirmar presentación"
        description="Doble validación. Queda en el audit log."
      >
        <div className="space-y-3">
          <div className="bg-status-warn-bg border-status-warn rounded-lg border p-3 text-sm">
            <div className="text-status-warn-fg flex items-center gap-2 font-semibold">
              <ShieldCheck size={16} /> Acción crítica
            </div>
            <p className="text-status-warn-fg/90 mt-1">
              Estás por presentar la rendición de{' '}
              <strong>{fmtMesPeriodo(rendicion.periodo)}</strong> al Fondo Nacional. No se puede
              deshacer.
            </p>
          </div>
          <div>
            <Label>Escribí "PRESENTAR" para confirmar</Label>
            <Input
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="PRESENTAR"
              autoFocus
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button intent="ghost" onClick={() => setConfirmaOpen(false)}>
              <X size={16} /> Cancelar
            </Button>
            <Button intent="success" onClick={confirmarPresentacion}>
              <Check size={16} /> Confirmar y presentar
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
