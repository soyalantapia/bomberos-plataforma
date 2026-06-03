'use client';

import {
  AtSign,
  Bell,
  ChevronRight,
  Fingerprint,
  KeyRound,
  Laptop,
  Mail,
  MessageCircle,
  Monitor,
  Palette,
  Phone,
  Settings,
  Shield,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Trash2,
  UserCircle,
} from 'lucide-react';
import { useState } from 'react';

import {
  Avatar,
  Badge,
  Button,
  Card,
  CardContent,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  cn,
  useToast,
} from '@faro/ui';

import { PageHero } from '../../../components/shared/page-hero';
import { fmtFechaHora } from '../../../lib/utils/date';
import { fmtJerarquia } from '../../../lib/utils/jerarquia';
import { useFaroStore, selectPersonaActual } from '../../../store/use-faro-store';

const SESIONES_MOCK = [
  {
    id: 's1',
    device: 'iPhone 14 · Mariana',
    tipo: 'mobile',
    ip: '190.55.x.x',
    ultimo: '2026-05-24T14:30:00-03:00',
    activa: true,
  },
  {
    id: 's2',
    device: 'MacBook Air · Cuartel',
    tipo: 'desktop',
    ip: '192.168.1.x',
    ultimo: '2026-05-24T09:12:00-03:00',
    activa: true,
  },
  {
    id: 's3',
    device: 'Chrome · Windows',
    tipo: 'desktop',
    ip: '181.20.x.x',
    ultimo: '2026-05-22T18:45:00-03:00',
    activa: false,
  },
];

const CANALES_NOTIF = [
  { tipo: 'rendicion', label: 'Rendición', push: true, mail: true, whatsapp: true },
  { tipo: 'aprobacion', label: 'Aprobaciones', push: true, mail: true, whatsapp: false },
  { tipo: 'vencimiento', label: 'Vencimientos', push: true, mail: false, whatsapp: false },
  { tipo: 'operativo', label: 'Operativo', push: true, mail: false, whatsapp: true },
  { tipo: 'mensaje', label: 'Mensajes/chat', push: true, mail: false, whatsapp: false },
];

export default function MiPerfilPage() {
  const persona = useFaroStore(selectPersonaActual);
  const toast = useToast();
  const [tab, setTab] = useState('contacto');
  const [canales, setCanales] = useState(CANALES_NOTIF);
  const [biometria, setBiometria] = useState(true);

  if (!persona) return null;

  function toggleCanal(tipo: string, canal: 'push' | 'mail' | 'whatsapp') {
    setCanales((arr) => arr.map((c) => (c.tipo === tipo ? { ...c, [canal]: !c[canal] } : c)));
  }

  function cerrarSesion(_id: string) {
    toast.push({
      kind: 'info',
      title: 'Sesión cerrada',
      description: 'La sesión remota ya no puede acceder. Queda registrado.',
    });
  }

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <PageHero
        objetivo="Mi perfil y seguridad"
        titulo={`${persona.nombre} ${persona.apellido}`}
        descripcion={`${fmtJerarquia(persona.jerarquia)} · Legajo ${persona.legajo}. Gestioná tu contacto, sesiones, canales de notificación y preferencias.`}
        icono={
          <Avatar
            name={`${persona.nombre} ${persona.apellido}`}
            size={56}
            className="ring-2 ring-white/40"
          />
        }
        variant="default"
      />

      <Tabs value={tab} onChange={setTab}>
        <TabsList>
          <TabsTrigger value="contacto">
            <UserCircle size={13} className="mr-1" /> Contacto
          </TabsTrigger>
          <TabsTrigger value="sesiones">
            <Shield size={13} className="mr-1" /> Sesiones
          </TabsTrigger>
          <TabsTrigger value="canales">
            <Bell size={13} className="mr-1" /> Canales
          </TabsTrigger>
          <TabsTrigger value="preferencias">
            <Settings size={13} className="mr-1" /> Preferencias
          </TabsTrigger>
        </TabsList>

        <TabsContent value="contacto">
          <Card>
            <CardContent className="p-0">
              <dl className="divide-y divide-slate-100">
                {[
                  {
                    k: 'Email primario',
                    v: persona.email,
                    icon: <Mail size={14} />,
                    action: 'Cambiar',
                  },
                  {
                    k: 'Teléfono',
                    v: persona.telefono,
                    icon: <Phone size={14} />,
                    action: 'Cambiar',
                  },
                  {
                    k: 'WhatsApp (notif)',
                    v: persona.telefono,
                    icon: <MessageCircle size={14} />,
                    action: 'Conectar',
                  },
                  { k: 'Email secundario', v: '—', icon: <AtSign size={14} />, action: 'Agregar' },
                ].map((f) => (
                  <div key={f.k} className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50">
                    <div className="shrink-0 text-slate-500">{f.icon}</div>
                    <div className="w-40 shrink-0 text-xs text-slate-500">{f.k}</div>
                    <div className="flex-1 truncate text-sm font-medium text-slate-900">{f.v}</div>
                    <button
                      type="button"
                      onClick={() => toast.push({ kind: 'info', title: f.action + ' · ' + f.k })}
                      className="text-brand-700 hover:text-brand-900 shrink-0 text-xs font-medium"
                    >
                      {f.action}
                    </button>
                  </div>
                ))}
              </dl>
            </CardContent>
          </Card>

          <Card className="mt-3 border-slate-200 bg-slate-50">
            <CardContent className="flex items-start gap-3 p-4 text-sm text-slate-600">
              <ShieldCheck size={18} className="mt-0.5 shrink-0 text-slate-500" />
              <div>
                <strong className="text-slate-900">
                  Cambios confirmados con código al celular
                </strong>
                . Tras modificar email o teléfono recibís un código en el canal actual para
                confirmar.
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sesiones">
          <Card>
            <CardContent className="p-5">
              <h3 className="mb-3 flex items-center gap-2 font-bold text-slate-900">
                <Shield size={18} className="text-slate-700" /> Dispositivos conectados
              </h3>
              <div className="space-y-2">
                {SESIONES_MOCK.map((s) => (
                  <div
                    key={s.id}
                    className={cn(
                      'flex items-center gap-3 rounded-xl border p-3',
                      s.activa ? 'border-status-ok/40 bg-status-ok-bg/20' : 'border-slate-200',
                    )}
                  >
                    <div
                      className={cn(
                        'grid h-11 w-11 shrink-0 place-items-center rounded-xl text-white',
                        s.activa ? 'bg-status-ok' : 'bg-slate-400',
                      )}
                    >
                      {s.tipo === 'mobile' ? (
                        <Smartphone size={18} />
                      ) : s.tipo === 'desktop' ? (
                        <Laptop size={18} />
                      ) : (
                        <Monitor size={18} />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-slate-900">{s.device}</div>
                      <div className="mt-0.5 text-xs text-slate-600">
                        {s.activa ? 'Activa ahora' : `Último uso ${fmtFechaHora(s.ultimo)}`} · IP{' '}
                        {s.ip}
                      </div>
                    </div>
                    {s.activa && <Badge intent="ok">Activa</Badge>}
                    <button
                      type="button"
                      onClick={() => cerrarSesion(s.id)}
                      className="border-status-risk/40 text-status-risk-fg hover:bg-status-risk-bg/40 shrink-0 rounded-md border bg-white px-2.5 py-1.5 text-xs font-medium"
                    >
                      <Trash2 size={11} className="mr-1 inline" /> Cerrar
                    </button>
                  </div>
                ))}
              </div>

              <div className="bg-brand-50 text-brand-900 mt-4 rounded-md p-3 text-sm">
                <strong>Tip de seguridad:</strong> revisá esta lista periódicamente. Cualquier
                dispositivo desconocido podés cerrarlo desde acá y queda en el{' '}
                <a href="/gobierno/audit" className="hover:text-brand-700 font-medium">
                  Registro permanente
                </a>
                .
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="canales">
          <Card>
            <CardContent className="p-5">
              <h3 className="mb-3 flex items-center gap-2 font-bold text-slate-900">
                <Bell size={18} className="text-slate-700" /> Por tipo de notificación
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 text-slate-600">
                      <th className="px-3 py-2 text-left">Tipo</th>
                      <th className="px-3 py-2 text-center">Notificación</th>
                      <th className="px-3 py-2 text-center">Email</th>
                      <th className="px-3 py-2 text-center">WhatsApp</th>
                    </tr>
                  </thead>
                  <tbody>
                    {canales.map((c) => (
                      <tr key={c.tipo} className="border-t border-slate-100">
                        <td className="px-3 py-3 font-medium text-slate-900">{c.label}</td>
                        {(['push', 'mail', 'whatsapp'] as const).map((ch) => (
                          <td key={ch} className="px-3 py-3 text-center">
                            <button
                              type="button"
                              onClick={() => toggleCanal(c.tipo, ch)}
                              role="switch"
                              aria-checked={c[ch]}
                              className={cn(
                                'relative h-5 w-9 rounded-full transition-colors',
                                c[ch] ? 'bg-brand-600' : 'bg-slate-200',
                              )}
                            >
                              <span
                                className={cn(
                                  'absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-all',
                                  c[ch] ? 'left-[18px]' : 'left-0.5',
                                )}
                              />
                            </button>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-3 text-xs text-slate-500">
                Las notificaciones siempre van al dispositivo donde tenés sesión activa. Email y
                WhatsApp los activás por cada tipo.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferencias">
          <div className="space-y-3">
            <Card>
              <CardContent className="p-5">
                <h3 className="mb-3 flex items-center gap-2 font-bold text-slate-900">
                  <Fingerprint size={18} className="text-slate-700" /> Acceso
                </h3>

                <div className="space-y-3">
                  <div className="flex items-center justify-between rounded-lg border border-slate-200 p-3">
                    <div>
                      <div className="font-medium text-slate-900">
                        Huella o reconocimiento facial
                      </div>
                      <div className="mt-0.5 text-xs text-slate-600">
                        Después del primer ingreso con código al celular
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setBiometria((b) => !b)}
                      className={cn(
                        'relative h-6 w-11 rounded-full transition-colors',
                        biometria ? 'bg-brand-600' : 'bg-slate-200',
                      )}
                    >
                      <span
                        className={cn(
                          'absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-all',
                          biometria ? 'left-[22px]' : 'left-0.5',
                        )}
                      />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      toast.push({
                        kind: 'info',
                        title: 'Código de prueba enviado',
                        description: 'Revisá tu canal configurado.',
                      })
                    }
                    className="flex w-full items-center gap-3 rounded-lg border border-slate-200 bg-white p-3 text-left hover:border-slate-300"
                  >
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-slate-100">
                      <KeyRound size={16} className="text-slate-700" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-slate-900">Probar envío de código</div>
                      <div className="mt-0.5 text-xs text-slate-600">
                        Verificá que tu canal recibe los códigos
                      </div>
                    </div>
                    <ChevronRight size={16} className="text-slate-500" />
                  </button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-5">
                <h3 className="mb-3 flex items-center gap-2 font-bold text-slate-900">
                  <Palette size={18} className="text-slate-700" /> Apariencia y región
                </h3>
                <dl className="space-y-2 text-sm">
                  {[
                    { k: 'Idioma', v: 'Español (Argentina)' },
                    { k: 'Tema', v: 'Claro (auto en mobile)' },
                    { k: 'Hora', v: '24 hs · Buenos Aires (UTC-3)' },
                    { k: 'Tamaño de texto', v: 'Normal' },
                  ].map((f) => (
                    <div
                      key={f.k}
                      className="flex items-center justify-between border-b border-slate-100 pb-2"
                    >
                      <span className="text-slate-600">{f.k}</span>
                      <span className="font-medium text-slate-900">{f.v}</span>
                    </div>
                  ))}
                </dl>
              </CardContent>
            </Card>

            <Card className="border-status-risk/20 bg-status-risk-bg/20">
              <CardContent className="p-5">
                <h3 className="text-status-risk-fg mb-2 flex items-center gap-2 font-bold">
                  <Sparkles size={18} /> Datos personales
                </h3>
                <p className="text-sm text-slate-700">
                  Pedí exportar todo lo que Vulcano tiene sobre vos (Ley 25.326) o solicitá la baja
                  de tu cuenta. Ambos requieren código al celular y quedan registrados.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button
                    intent="secondary"
                    size="sm"
                    onClick={() =>
                      toast.push({
                        kind: 'info',
                        title: 'Exportando datos',
                        description: 'Recibís un email con el archivo en 24 hs.',
                      })
                    }
                  >
                    Exportar mis datos
                  </Button>
                  <Button
                    intent="ghost"
                    size="sm"
                    onClick={() =>
                      toast.push({
                        kind: 'info',
                        title: 'Solicitud iniciada',
                        description: 'Confirmá con el código que recibiste al celular.',
                      })
                    }
                  >
                    Solicitar baja
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
