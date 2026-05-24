'use client';

import { Check, Sparkles, ShieldCheck, X } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

import { Badge, Button, Card, CardContent, CardHeader, CardTitle, cn, Dialog, Input, Label, SectionHeader, useToast } from '@faro/ui';

import { SemaforoRendicion } from '../../../../components/rendicion/semaforo-rendicion';
import { useFaroStore, selectRendicionActual, selectPersonaActual, selectCuartelActivo } from '../../../../store/use-faro-store';
import { fmtMesPeriodo } from '../../../../lib/utils/date';

export default function RendicionPage() {
  const rendicion = useFaroStore(selectRendicionActual);
  const cuartel = useFaroStore(selectCuartelActivo);
  const persona = useFaroStore(selectPersonaActual);
  const presentar = useFaroStore((s) => s.presentarRendicion);
  const toast = useToast();
  const [copilotoOpen, setCopilotoOpen] = useState(false);
  const [confirmaOpen, setConfirmaOpen] = useState(false);
  const [confirmText, setConfirmText] = useState('');

  if (!rendicion) {
    return <div className="max-w-5xl mx-auto"><Card><CardContent className="p-6 text-slate-600">No hay rendición.</CardContent></Card></div>;
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
    toast.push({ kind: 'success', title: '¡Rendición presentada!', description: `${cuartel?.nombre} · ${fmtMesPeriodo(rendicion!.periodo)}.` });
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <SectionHeader
        title="Rendición al Fondo"
        description={`${cuartel?.nombre} · ${fmtMesPeriodo(rendicion.periodo)}`}
        actions={
          <Button intent="secondary" onClick={() => setCopilotoOpen(true)}>
            <Sparkles size={16} /> Copiloto IA
          </Button>
        }
      />

      <Card className="bg-gradient-to-br from-white to-slate-50">
        <CardContent className="p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <SemaforoRendicion rendicion={rendicion} />
            <div className="flex-1 text-center sm:text-left">
              <div className="text-xs uppercase tracking-wide text-slate-500 font-semibold">Estado</div>
              <h2 className="text-2xl font-bold text-slate-900 mt-1">
                {rendicion.estado === 'presentada' ? 'Presentada al Fondo' : faltantes.length === 0 ? 'Lista para presentar' : `${faltantes.length} ítem${faltantes.length === 1 ? '' : 's'} pendiente${faltantes.length === 1 ? '' : 's'}`}
              </h2>
              <p className="text-slate-600 mt-1">
                {rendicion.estado === 'presentada' ? `Presentada el ${new Date(rendicion.presentadaEn!).toLocaleString('es-AR')}.` : 'Cuando todo esté en verde, presentamos al Fondo con tu confirmación.'}
              </p>
              {presentable && (
                <Button intent="success" size="lg" className="mt-3" onClick={() => setConfirmaOpen(true)}>
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
                  <div className={cn('h-6 w-6 rounded-full grid place-items-center shrink-0 mt-0.5', r.completo ? 'bg-status-ok text-white' : 'bg-slate-200 text-slate-500')}>
                    {r.completo && <Check size={14} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="font-semibold text-slate-900">{r.titulo}</div>
                      <Badge intent={r.completo ? 'ok' : r.avance > 50 ? 'warn' : 'risk'}>{r.avance}%</Badge>
                    </div>
                    <p className="text-sm text-slate-600 mt-0.5">{r.descripcion}</p>
                    {!r.completo && r.linkPagina && (
                      <Link href={r.linkPagina} className="text-sm font-medium text-brand-700 hover:text-brand-900 mt-2 inline-flex items-center gap-1">Ir a resolver →</Link>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Dialog open={copilotoOpen} onClose={() => setCopilotoOpen(false)} title="Copiloto de rendición" description="La IA propone. Vos confirmás.">
        <div className="space-y-3 max-h-[60vh] overflow-y-auto">
          {faltantes.length === 0 ? (
            <div className="text-center py-6">
              <div className="text-4xl">🎉</div>
              <h3 className="text-lg font-semibold mt-2">Todo en regla</h3>
              <p className="text-sm text-slate-600">No detecté ítems faltantes. Vos confirmás y presentás.</p>
            </div>
          ) : (
            faltantes.map((r) => (
              <div key={r.id} className="rounded-lg border border-slate-200 p-3">
                <div className="font-semibold text-slate-900">{r.titulo}</div>
                <p className="text-sm text-slate-600 mt-1">{r.descripcion}</p>
                <div className="text-xs uppercase tracking-wide text-slate-500 font-semibold mt-3">Por qué importa</div>
                <p className="text-sm text-slate-700">{r.importanciaTexto}</p>
                {r.linkPagina && <Link href={r.linkPagina} className="text-sm font-medium text-brand-700 mt-2 inline-block">Resolver →</Link>}
              </div>
            ))
          )}
        </div>
      </Dialog>

      <Dialog open={confirmaOpen} onClose={() => setConfirmaOpen(false)} title="Confirmar presentación" description="Doble validación. Queda en el audit log.">
        <div className="space-y-3">
          <div className="rounded-lg bg-status-warn-bg border border-status-warn p-3 text-sm">
            <div className="font-semibold text-status-warn-fg flex items-center gap-2"><ShieldCheck size={16} /> Acción crítica</div>
            <p className="text-status-warn-fg/90 mt-1">Estás por presentar la rendición de <strong>{fmtMesPeriodo(rendicion.periodo)}</strong> al Fondo Nacional. No se puede deshacer.</p>
          </div>
          <div>
            <Label>Escribí "PRESENTAR" para confirmar</Label>
            <Input value={confirmText} onChange={(e) => setConfirmText(e.target.value)} placeholder="PRESENTAR" autoFocus />
          </div>
          <div className="flex gap-2 justify-end">
            <Button intent="ghost" onClick={() => setConfirmaOpen(false)}><X size={16} /> Cancelar</Button>
            <Button intent="success" onClick={confirmarPresentacion}><Check size={16} /> Confirmar y presentar</Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
