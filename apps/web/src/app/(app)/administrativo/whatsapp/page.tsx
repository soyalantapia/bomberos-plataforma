'use client';

import { motion } from 'framer-motion';
import {
  AlertCircle,
  CheckCheck,
  Eye,
  MapPin,
  MessageCircle,
  Phone,
  Send,
  Sparkles,
  X,
} from 'lucide-react';
import { useState } from 'react';

import { Avatar, Badge, Button, Card, CardContent, Kpi, cn, useToast } from '@faro/ui';

import { PageHero } from '../../../../components/shared/page-hero';

interface Plantilla {
  id: string;
  nombre: string;
  categoria: 'despacho' | 'aviso' | 'recordatorio' | 'citacion';
  cuerpo: string;
  variables: string[];
  aprobada: boolean;
}

interface Mensaje {
  id: string;
  plantillaId: string;
  destinatario: string;
  enviado: string;
  estado: 'enviado' | 'entregado' | 'leido' | 'respondido';
  respuesta?: 'voy' | 'no_voy' | string;
  geoloc?: { lat: number; lng: number; precision: number };
}

const PLANTILLAS: Plantilla[] = [
  {
    id: 't-despacho',
    nombre: 'Despacho a operativo',
    categoria: 'despacho',
    cuerpo:
      '🚒 *FARO · Cuartel Villa Ballester*\n\nServicio activo: {{tipo}}\nUbicación: {{direccion}}\nMóvil: {{movil}}\n\nResponder VOY o NO VOY',
    variables: ['tipo', 'direccion', 'movil'],
    aprobada: true,
  },
  {
    id: 't-aptitud',
    nombre: 'Recordatorio aptitud médica',
    categoria: 'recordatorio',
    cuerpo:
      '⚕️ *Aviso · Aptitud médica*\n\nTu examen anual vence el {{vencimiento}}.\nAgendá tu turno: {{link}}',
    variables: ['vencimiento', 'link'],
    aprobada: true,
  },
  {
    id: 't-curso',
    nombre: 'Citación a curso',
    categoria: 'citacion',
    cuerpo:
      '📋 *Curso obligatorio*\n\n{{curso}}\nFecha: {{fecha}} · {{hora}}\nLugar: {{lugar}}\n\nConfirmá asistencia: VOY o NO VOY',
    variables: ['curso', 'fecha', 'hora', 'lugar'],
    aprobada: true,
  },
  {
    id: 't-asamblea',
    nombre: 'Convocatoria asamblea',
    categoria: 'aviso',
    cuerpo:
      '📣 *Asamblea de cuartel*\n\nFecha: {{fecha}}\nHora: {{hora}}\nOrden del día: {{temas}}',
    variables: ['fecha', 'hora', 'temas'],
    aprobada: true,
  },
];

const MENSAJES_RECIENTES: Mensaje[] = [
  {
    id: 'm-1',
    plantillaId: 't-despacho',
    destinatario: 'Mariana Pereyra · +54 11 5555 0099',
    enviado: '14:42',
    estado: 'respondido',
    respuesta: 'voy',
    geoloc: { lat: -34.5476, lng: -58.5556, precision: 12 },
  },
  {
    id: 'm-2',
    plantillaId: 't-despacho',
    destinatario: 'Sebastián Ruiz · +54 11 5555 0156',
    enviado: '14:42',
    estado: 'respondido',
    respuesta: 'voy',
    geoloc: { lat: -34.5489, lng: -58.5598, precision: 18 },
  },
  {
    id: 'm-3',
    plantillaId: 't-despacho',
    destinatario: 'Carolina Sosa · +54 11 5555 0078',
    enviado: '14:42',
    estado: 'leido',
  },
  {
    id: 'm-4',
    plantillaId: 't-despacho',
    destinatario: 'Federico Vázquez · +54 11 5555 0091',
    enviado: '14:42',
    estado: 'entregado',
  },
];

const ESTADO_COLOR = {
  enviado: 'text-slate-400',
  entregado: 'text-slate-500',
  leido: 'text-brand-600',
  respondido: 'text-status-ok-fg',
};

export default function WhatsAppPage() {
  const toast = useToast();
  const [plantillaSel, setPlantillaSel] = useState<string>('t-despacho');
  const [destinatarios, setDestinatarios] = useState<number>(12);

  const plantilla = PLANTILLAS.find((p) => p.id === plantillaSel)!;

  function enviarMensaje() {
    toast.push({
      kind: 'success',
      title: `Enviado a ${destinatarios} voluntarios`,
      description: 'WhatsApp Business · entrega en segundos.',
    });
  }

  const voy = MENSAJES_RECIENTES.filter((m) => m.respuesta === 'voy').length;
  const noResp = MENSAJES_RECIENTES.filter((m) => m.estado !== 'respondido').length;

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <PageHero
        objetivo="Administrativo · WhatsApp Business"
        titulo="WhatsApp como canal oficial"
        descripcion="Plantillas oficiales aprobadas. Respuestas voy/no-voy con ubicación. Sin WhatsApp informal."
        icono={<MessageCircle size={26} />}
        meta={
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Kpi label="Plantillas" value={PLANTILLAS.length} hint="aprobadas" intent="ok" />
            <Kpi label="Enviados hoy" value={4} hint="último despacho" intent="brand" />
            <Kpi label="Respondieron VOY" value={voy} intent="ok" />
            <Kpi label="Sin respuesta" value={noResp} intent={noResp > 0 ? 'warn' : 'neutral'} />
          </div>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
        {/* Plantillas */}
        <div className="space-y-2">
          <h3 className="px-1 text-xs font-bold uppercase text-slate-500">Plantillas oficiales</h3>
          {PLANTILLAS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setPlantillaSel(p.id)}
              className={cn(
                'w-full rounded-xl border bg-white p-3 text-left transition-colors',
                plantillaSel === p.id
                  ? 'border-brand-400 bg-brand-50'
                  : 'border-slate-200 hover:border-slate-300',
              )}
            >
              <div className="flex items-center gap-2">
                <span className="font-medium text-slate-900">{p.nombre}</span>
                {p.aprobada && <Badge intent="ok">Aprobada</Badge>}
              </div>
              <div className="mt-0.5 text-[10px] uppercase text-slate-500">{p.categoria}</div>
            </button>
          ))}
        </div>

        {/* Preview + envío */}
        <div className="space-y-4">
          <Card>
            <CardContent className="p-0">
              <div className="border-b border-slate-100 px-5 py-3">
                <h3 className="font-bold text-slate-900">{plantilla.nombre}</h3>
                <p className="mt-0.5 text-xs text-slate-500">
                  Variables: {plantilla.variables.join(', ')}
                </p>
              </div>
              <div className="p-5">
                {/* Phone mockup */}
                <div className="mx-auto max-w-sm rounded-2xl bg-slate-100 p-4">
                  <div className="rounded-xl bg-[#dcf8c6] p-3">
                    <pre className="whitespace-pre-wrap font-sans text-sm text-slate-900">
                      {plantilla.cuerpo}
                    </pre>
                    <div className="mt-2 text-right text-[10px] text-slate-500">14:42 ✓✓</div>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <div className="min-w-[200px] flex-1">
                    <label className="block text-xs font-semibold uppercase text-slate-500">
                      Destinatarios
                    </label>
                    <input
                      type="number"
                      value={destinatarios}
                      onChange={(e) => setDestinatarios(Number(e.target.value))}
                      className="focus:border-brand-400 mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2"
                    />
                    <div className="mt-0.5 text-[10px] text-slate-500">
                      Cobertura: voluntarios activos con disponibilidad declarada
                    </div>
                  </div>
                  <Button intent="primary" size="lg" onClick={enviarMensaje}>
                    <Send size={16} /> Enviar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recientes */}
          <Card>
            <CardContent className="p-0">
              <div className="border-b border-slate-100 px-5 py-3">
                <h3 className="font-bold text-slate-900">Despacho activo · BV-3 a V. Devoto</h3>
                <p className="mt-0.5 text-xs text-slate-500">
                  Plantilla "Despacho a operativo" · enviada 14:42
                </p>
              </div>
              <ul className="divide-y divide-slate-100">
                {MENSAJES_RECIENTES.map((m, idx) => (
                  <motion.li
                    key={m.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.06 }}
                    className="flex items-start gap-3 p-3"
                  >
                    <Avatar name={m.destinatario.split(' · ')[0] ?? ''} size={32} />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium text-slate-900">
                        {m.destinatario.split(' · ')[0]}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500">
                        <Phone size={9} />
                        <span>{m.destinatario.split(' · ')[1]}</span>
                        <span>·</span>
                        <span>{m.enviado}</span>
                      </div>
                      {m.respuesta === 'voy' && m.geoloc && (
                        <div className="bg-status-ok-bg/40 text-status-ok-fg mt-1.5 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px]">
                          <MapPin size={10} />
                          GPS: {m.geoloc.lat.toFixed(4)}, {m.geoloc.lng.toFixed(4)} · ±
                          {m.geoloc.precision}m
                        </div>
                      )}
                    </div>
                    <div className="shrink-0 text-right">
                      {m.respuesta === 'voy' && (
                        <Badge intent="ok">
                          <CheckCheck size={10} className="mr-1" /> VOY
                        </Badge>
                      )}
                      {m.respuesta === 'no_voy' && (
                        <Badge intent="risk">
                          <X size={10} className="mr-1" /> NO VOY
                        </Badge>
                      )}
                      {!m.respuesta && (
                        <span
                          className={cn(
                            'inline-flex items-center gap-1 text-xs',
                            ESTADO_COLOR[m.estado],
                          )}
                        >
                          {m.estado === 'leido' ? (
                            <>
                              <Eye size={10} /> Visto
                            </>
                          ) : (
                            <>
                              <CheckCheck size={10} /> Entregado
                            </>
                          )}
                        </span>
                      )}
                    </div>
                  </motion.li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Tip de uso */}
          <Card className="bg-brand-50/40 border-brand-100">
            <CardContent className="flex items-start gap-3 p-4">
              <div className="bg-brand-600 grid h-10 w-10 shrink-0 place-items-center rounded-xl text-white">
                <Sparkles size={18} />
              </div>
              <div className="flex-1 text-sm">
                <div className="text-brand-900 font-semibold">Tip de uso</div>
                <p className="text-brand-900/80 mt-0.5">
                  Usar las plantillas oficiales mantiene la tasa de entrega arriba del 98% y respeta
                  las reglas de WhatsApp Business. Mensajes informales fuera de plantilla pueden
                  bloquear el número.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Privacidad */}
          <Card className="border-slate-200 bg-slate-50">
            <CardContent className="flex items-start gap-3 p-4 text-sm text-slate-600">
              <AlertCircle size={18} className="mt-0.5 shrink-0 text-slate-400" />
              <div>
                <strong className="text-slate-900">Privacidad:</strong> el WhatsApp del voluntario
                se guarda encriptado. Cada despacho permite responder "STOP" para no recibir más.
                Quedan registrados todos los envíos y respuestas.
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
