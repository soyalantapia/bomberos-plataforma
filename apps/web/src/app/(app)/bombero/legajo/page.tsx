'use client';

import {
  Award,
  Calendar,
  Clock,
  FileEdit,
  GraduationCap,
  Heart,
  IdCard,
  Mail,
  MapPin,
  Phone,
  Shield,
  User,
} from 'lucide-react';
import { useMemo, useState } from 'react';

import {
  Avatar,
  Badge,
  Button,
  Card,
  CardContent,
  Kpi,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  useToast,
  cn,
} from '@faro/ui';

import { PageHero } from '../../../../components/shared/page-hero';
import { calcularComputoMensual } from '../../../../lib/utils/computo';
import { detectarAlertasPersona } from '../../../../lib/utils/cuerpo';
import { fmtFechaCorta, fmtMesPeriodo, mesActual } from '../../../../lib/utils/date';
import { fmtJerarquia } from '../../../../lib/utils/jerarquia';
import {
  useFaroStore,
  selectCuartelActivo,
  selectPersonaActual,
} from '../../../../store/use-faro-store';

function diasHasta(iso: string): number {
  return Math.round((new Date(iso).getTime() - Date.now()) / 8.64e7);
}

export default function MiLegajo() {
  const persona = useFaroStore(selectPersonaActual);
  const cuartel = useFaroStore(selectCuartelActivo);
  const asistencias = useFaroStore((s) => s.asistencias);
  const toast = useToast();
  const [tab, setTab] = useState('datos');

  const computo = useMemo(
    () => (cuartel ? calcularComputoMensual(asistencias, cuartel.id, mesActual()) : []),
    [asistencias, cuartel],
  );

  if (!persona) return null;

  const propio = computo.find((c) => c.personaId === persona.id);
  const alertas = detectarAlertasPersona(persona);
  const aniosServicio = Math.floor(
    (Date.now() - new Date(persona.fechaIngreso).getTime()) / 3.15576e10,
  );

  function solicitarUpdate(campo: string) {
    toast.push({
      kind: 'info',
      title: 'Solicitud enviada',
      description: `Pediste actualizar "${campo}". Administrativo lo confirma con doble validación.`,
    });
  }

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <PageHero
        objetivo="Tu legajo en Faro"
        titulo={`${persona.nombre} ${persona.apellido}`}
        descripcion={`Lo ves vos; lo edita Administrativo con doble validación. ${alertas.length > 0 ? `Tenés ${alertas.length} alerta${alertas.length === 1 ? '' : 's'} para revisar.` : 'Todo al día.'}`}
        icono={
          <Avatar
            name={`${persona.nombre} ${persona.apellido}`}
            size={56}
            className="ring-2 ring-white/40"
          />
        }
        variant={
          alertas.some((a) => a.severidad === 'risk')
            ? 'critical'
            : alertas.length > 0
              ? 'default'
              : 'success'
        }
        meta={
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <Badge intent="warn">{fmtJerarquia(persona.jerarquia)}</Badge>
            <Badge intent={persona.estado === 'activo' ? 'ok' : 'warn'} className="capitalize">
              {persona.estado}
            </Badge>
            <span className="text-slate-700">
              Legajo <strong className="font-mono">{persona.legajo}</strong>
            </span>
            <span className="text-slate-700">·</span>
            <span className="text-slate-700">{aniosServicio} años de servicio</span>
          </div>
        }
      />

      {alertas.length > 0 && (
        <Card
          className={cn(
            'border-l-4',
            alertas.some((a) => a.severidad === 'risk')
              ? 'border-l-status-risk'
              : 'border-l-status-warn',
          )}
        >
          <CardContent className="p-4">
            <h3 className="mb-2 font-semibold text-slate-900">Cosas que requieren tu atención</h3>
            <ul className="space-y-1.5">
              {alertas.map((a, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm">
                  <span
                    className={cn(
                      'mt-0.5 h-2 w-2 shrink-0 rounded-full',
                      a.severidad === 'risk' ? 'bg-status-risk' : 'bg-status-warn',
                    )}
                  />
                  <span className="text-slate-700">{a.texto}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <Tabs value={tab} onChange={setTab}>
        <TabsList>
          <TabsTrigger value="datos">
            <User size={14} className="mr-1" /> Datos
          </TabsTrigger>
          <TabsTrigger value="cursos">
            <GraduationCap size={14} className="mr-1" /> Cursos
          </TabsTrigger>
          <TabsTrigger value="horas">
            <Clock size={14} className="mr-1" /> Horas
          </TabsTrigger>
          <TabsTrigger value="salud">
            <Heart size={14} className="mr-1" /> Salud
          </TabsTrigger>
        </TabsList>

        <TabsContent value="datos">
          <Card>
            <CardContent className="p-0">
              <dl className="divide-y divide-slate-100">
                {[
                  { k: 'Email', icon: <Mail size={14} />, v: persona.email, editable: true },
                  { k: 'Teléfono', icon: <Phone size={14} />, v: persona.telefono, editable: true },
                  {
                    k: 'Nacimiento',
                    icon: <Calendar size={14} />,
                    v: fmtFechaCorta(persona.fechaNacimiento),
                  },
                  {
                    k: 'Ingreso al cuartel',
                    icon: <Shield size={14} />,
                    v: fmtFechaCorta(persona.fechaIngreso),
                  },
                  { k: 'Base', icon: <MapPin size={14} />, v: persona.base },
                  { k: 'Función', icon: <IdCard size={14} />, v: persona.funcion },
                  {
                    k: 'Lic. conducir',
                    icon: <IdCard size={14} />,
                    v: persona.licenciaConducirCategorias?.length
                      ? `Categorías ${persona.licenciaConducirCategorias.join(' · ')}${persona.licenciaConducirVencimiento ? ` · vence ${fmtFechaCorta(persona.licenciaConducirVencimiento)}` : ''}`
                      : '—',
                  },
                ].map((f) => (
                  <div key={f.k} className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50">
                    <div className="shrink-0 text-slate-500">{f.icon}</div>
                    <div className="w-32 shrink-0 text-xs text-slate-500">{f.k}</div>
                    <div className="flex-1 truncate text-sm font-medium text-slate-900">{f.v}</div>
                    {f.editable && (
                      <button
                        type="button"
                        onClick={() => solicitarUpdate(f.k)}
                        className="text-brand-700 hover:text-brand-900 shrink-0 text-xs font-medium"
                      >
                        Pedir cambio
                      </button>
                    )}
                  </div>
                ))}
              </dl>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cursos">
          <div className="space-y-3">
            {persona.cursos.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center text-sm text-slate-500">
                  Aún no tenés cursos registrados.
                </CardContent>
              </Card>
            ) : (
              persona.cursos.map((c) => {
                const vencimiento = c.vencimiento ? diasHasta(c.vencimiento) : null;
                const estado =
                  c.vigente === false || (vencimiento !== null && vencimiento < 0)
                    ? 'risk'
                    : vencimiento !== null && vencimiento <= 30
                      ? 'warn'
                      : 'ok';
                return (
                  <Card key={c.id}>
                    <CardContent className="flex items-center gap-3 p-4">
                      <div
                        className={cn(
                          'grid h-11 w-11 shrink-0 place-items-center rounded-lg text-white',
                          estado === 'risk'
                            ? 'bg-status-risk'
                            : estado === 'warn'
                              ? 'bg-status-warn'
                              : 'bg-status-ok',
                        )}
                      >
                        <Award size={20} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold text-slate-900">{c.nombre}</div>
                        <div className="mt-0.5 text-xs text-slate-600">
                          {c.centro && `${c.centro} · `}
                          {c.vencimiento
                            ? `Vence ${fmtFechaCorta(c.vencimiento)}${vencimiento !== null ? ` (${vencimiento >= 0 ? `en ${vencimiento}d` : `hace ${-vencimiento}d`})` : ''}`
                            : 'Sin vencimiento registrado'}
                        </div>
                      </div>
                      <Badge intent={estado}>
                        {estado === 'risk'
                          ? 'Vencido'
                          : estado === 'warn'
                            ? 'Por vencer'
                            : 'Vigente'}
                      </Badge>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </TabsContent>

        <TabsContent value="horas">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <Kpi
              label="Total mes"
              value={propio?.total ?? 0}
              hint={fmtMesPeriodo(mesActual())}
              intent="brand"
            />
            <Kpi label="Accidentales" value={propio?.accidental ?? 0} hint="hs" intent="brand" />
            <Kpi label="Guardia" value={propio?.guardia ?? 0} hint="hs" intent="ok" />
            <Kpi label="Jefatura" value={propio?.jefatura ?? 0} hint="hs" intent="warn" />
            <Kpi label="Obligatorio" value={propio?.obligatorio ?? 0} hint="hs" intent="neutral" />
            <Kpi label="O. Interno" value={propio?.ordenInterno ?? 0} hint="hs" intent="neutral" />
          </div>
          <Card className="mt-3 border-slate-200 bg-slate-50">
            <CardContent className="p-4 text-sm text-slate-700">
              Estas horas se calculan en vivo desde tus asistencias y servicios. El cómputo completo
              del cuartel lo ve el Mando en su panel de inicio.
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="salud">
          <Card>
            <CardContent className="p-5">
              <dl className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-40 text-slate-500">Grupo sanguíneo</span>
                  <span className="font-semibold text-slate-900">
                    {persona.salud.grupoSanguineo ?? '—'}
                  </span>
                </div>
                {persona.salud.aptitudVencimiento && (
                  <div className="flex items-center gap-2">
                    <span className="w-40 text-slate-500">Aptitud médica</span>
                    <span className="font-medium text-slate-900">
                      Vence {fmtFechaCorta(persona.salud.aptitudVencimiento)}
                    </span>
                    {diasHasta(persona.salud.aptitudVencimiento) <= 30 && (
                      <Badge
                        intent={diasHasta(persona.salud.aptitudVencimiento) < 0 ? 'risk' : 'warn'}
                      >
                        {diasHasta(persona.salud.aptitudVencimiento) < 0 ? 'Vencida' : 'Por vencer'}
                      </Badge>
                    )}
                  </div>
                )}
                {persona.salud.alerta && (
                  <div className="bg-status-warn-bg text-status-warn-fg rounded-md p-3 text-sm">
                    {persona.salud.alerta}
                  </div>
                )}
              </dl>

              <Button
                intent="secondary"
                size="md"
                className="mt-4"
                onClick={() => solicitarUpdate('parte médico')}
              >
                <FileEdit size={14} /> Solicitar actualizar parte médico
              </Button>

              <p className="mt-3 text-xs text-slate-500">
                Los datos de salud son sensibles. Solo Administrativo, Gobierno Interno y vos los
                ven. Cada modificación queda registrada.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
