'use client';

import {
  Cable,
  CheckCircle2,
  Clock,
  FileLock2,
  Network,
  PlugZap,
  ServerCog,
  Sparkles,
  Webhook,
} from 'lucide-react';

import { Badge, Card, CardContent, Kpi, cn, useToast } from '@faro/ui';

import { PageHero } from '../../../../components/shared/page-hero';

interface Integracion {
  nombre: string;
  emoji: string;
  proposito: string;
  estado: 'en_analisis' | 'piloto' | 'activo';
  color: string;
  beneficios: string[];
}

const integraciones: Integracion[] = [
  {
    nombre: 'RENAPER',
    emoji: '🪪',
    proposito: 'Verificación de identidad por DNI',
    estado: 'en_analisis',
    color: 'bg-brand-600',
    beneficios: [
      'Alta de personal sin cargar datos a mano',
      'Validación biométrica opcional al login',
      'Padrón siempre sincronizado con identidad real',
    ],
  },
  {
    nombre: 'ART',
    emoji: '⚕',
    proposito: 'Cobertura de personal operativo',
    estado: 'en_analisis',
    color: 'bg-status-risk',
    beneficios: [
      'Alta automática al ingresar al cuartel',
      'Notificación inmediata en accidentes',
      'Liquidación más rápida en siniestros',
    ],
  },
  {
    nombre: 'Defensa Civil',
    emoji: '🚨',
    proposito: 'Coordinación operativa municipal',
    estado: 'piloto',
    color: 'bg-status-warn',
    beneficios: [
      'Estado de móviles en vivo a Defensa Civil',
      'Despacho coordinado en eventos masivos',
      'Mapa compartido durante emergencias',
    ],
  },
];

const ESTADO_LABEL: Record<
  Integracion['estado'],
  { label: string; intent: 'brand' | 'warn' | 'ok' }
> = {
  en_analisis: { label: 'En análisis', intent: 'brand' },
  piloto: { label: 'Piloto', intent: 'warn' },
  activo: { label: 'Activo', intent: 'ok' },
};

export default function IntegracionesFed() {
  const toast = useToast();

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <PageHero
        objetivo="Federación · Integraciones"
        titulo="Conectar Vulcano con los sistemas que ya existen"
        descripcion="Identidad, salud laboral y coordinación operativa. Pensado para no duplicar carga y que todo quede registrado."
        icono={<Cable size={26} />}
        meta={
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Kpi
              label="Convenios"
              value={3}
              hint="en evaluación"
              intent="warn"
              icon={<PlugZap size={16} />}
            />
            <Kpi
              label="Activos"
              value={0}
              hint="en producción"
              intent="neutral"
              icon={<ServerCog size={16} />}
            />
            <Kpi
              label="Avisos automáticos"
              value={0}
              hint="suscriptos"
              icon={<Webhook size={16} />}
            />
            <Kpi
              label="Conexión segura"
              value="Sí"
              hint="cliente + servidor"
              intent="ok"
              icon={<FileLock2 size={16} />}
            />
          </div>
        }
      />

      <Card className="border-brand-200 from-brand-50 overflow-hidden border-2 bg-gradient-to-br via-white to-white">
        <CardContent className="p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="bg-brand-600 grid h-12 w-12 place-items-center rounded-xl text-white">
                <Network size={22} />
              </div>
              <div>
                <div className="text-brand-700 text-xs font-semibold uppercase tracking-wide">
                  Arquitectura
                </div>
                <div className="text-lg font-bold text-slate-900">
                  Cómo se conecta Vulcano a otros sistemas
                </div>
              </div>
            </div>
            <Badge intent="brand">Próxima fase · Q2 2026</Badge>
          </div>

          <div className="mt-6 grid grid-cols-3 items-center gap-3 text-xs">
            <div className="text-center">
              <div className="ring-brand-100 mx-auto mb-2 grid h-16 w-16 place-items-center rounded-2xl bg-white shadow-sm ring-2">
                <span className="text-3xl">🚒</span>
              </div>
              <div className="font-bold text-slate-900">Vulcano</div>
              <div className="text-slate-500">Plataforma</div>
            </div>

            <div className="flex items-center justify-center">
              <div className="relative flex flex-col items-center gap-1">
                <div className="from-brand-300 to-status-warn h-px w-16 animate-pulse bg-gradient-to-r" />
                <div className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold text-slate-700 ring-1 ring-slate-200">
                  <FileLock2 size={9} /> mTLS
                </div>
                <div className="from-status-warn to-brand-300 h-px w-16 animate-pulse bg-gradient-to-r" />
              </div>
            </div>

            <div className="text-center">
              <div className="mx-auto mb-2 grid grid-cols-3 gap-0.5">
                {['🪪', '⚕', '🚨'].map((e, i) => (
                  <div
                    key={i}
                    className="grid h-9 w-9 place-items-center rounded-lg bg-white text-base shadow-sm ring-1 ring-slate-200"
                  >
                    {e}
                  </div>
                ))}
              </div>
              <div className="font-bold text-slate-900">Organismos</div>
              <div className="text-slate-500">3 conectados</div>
            </div>
          </div>

          <div className="mt-5 grid gap-2 text-xs sm:grid-cols-3">
            <div className="rounded-lg bg-white p-2.5 ring-1 ring-slate-200">
              <div className="font-bold text-slate-900">Conexión estándar</div>
              <div className="mt-0.5 text-slate-600">Versionada (v1)</div>
            </div>
            <div className="rounded-lg bg-white p-2.5 ring-1 ring-slate-200">
              <div className="font-bold text-slate-900">Avisos automáticos</div>
              <div className="mt-0.5 text-slate-600">Hacia los sistemas suscriptos</div>
            </div>
            <div className="rounded-lg bg-white p-2.5 ring-1 ring-slate-200">
              <div className="font-bold text-slate-900">Todo queda registrado</div>
              <div className="mt-0.5 text-slate-600">Cada llamada queda firmada</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <section>
        <h2 className="mb-3 flex items-center gap-2 text-base font-bold text-slate-900">
          <PlugZap size={18} className="text-status-warn" /> Conexiones en agenda
        </h2>

        <div className="grid gap-3 lg:grid-cols-3">
          {integraciones.map((i) => {
            const st = ESTADO_LABEL[i.estado];
            return (
              <Card key={i.nombre} className="overflow-hidden">
                <div className={cn('h-1.5', i.color)} />
                <CardContent className="p-4">
                  <div className="mb-3 flex items-start gap-3">
                    <div
                      className={cn(
                        'grid h-12 w-12 shrink-0 place-items-center rounded-xl text-2xl',
                        i.color,
                      )}
                    >
                      {i.emoji}
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-slate-900">{i.nombre}</div>
                      <Badge intent={st.intent}>{st.label}</Badge>
                    </div>
                  </div>
                  <div className="text-sm text-slate-700">{i.proposito}</div>

                  <div className="mt-4 space-y-1.5 border-t border-slate-100 pt-3">
                    <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                      Lo que habilita
                    </div>
                    {i.beneficios.map((b, idx) => (
                      <div key={idx} className="flex items-start gap-1.5 text-xs text-slate-700">
                        <CheckCircle2 size={12} className="text-status-ok mt-0.5 shrink-0" />
                        <span>{b}</span>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      toast.push({ kind: 'info', title: `Avanzar convenio con ${i.nombre}` })
                    }
                    className="mt-3 inline-flex w-full items-center justify-center gap-1 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Ver detalle del convenio
                  </button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      <Card className="border-slate-200 bg-slate-50">
        <CardContent className="flex items-start gap-3 p-4 text-sm text-slate-700">
          <Sparkles size={18} className="mt-0.5 shrink-0 text-slate-500" />
          <div>
            <strong className="text-slate-900">Modelo de cobro</strong> · Las integraciones consumen
            llamadas. Plan inicial: gratis hasta 1.000 llamadas por mes por organismo, después
            tarifa nacional. Cada organismo recibe sus propias credenciales y un panel de uso.
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-5">
          <h3 className="mb-3 flex items-center gap-2 font-bold text-slate-900">
            <Webhook size={18} className="text-slate-700" /> Registro de llamadas
          </h3>
          <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
            <Clock size={28} className="mx-auto text-slate-500" />
            <p className="mt-2 text-sm text-slate-600">
              Sin actividad todavía. Cuando una integración esté activa, las llamadas aparecen acá
              con su tiempo de respuesta y resultado.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
