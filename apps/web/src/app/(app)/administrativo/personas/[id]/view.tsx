'use client';

import {
  ArrowLeft,
  Award,
  Briefcase,
  Calendar,
  Edit3,
  FileText,
  GraduationCap,
  Heart,
  History,
  IdCard,
  Mail,
  MapPin,
  Phone,
  ScanLine,
  ShieldCheck,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { notFound, useParams } from 'next/navigation';
import { useState } from 'react';

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
  cn,
  useToast,
} from '@faro/ui';

import { OCRWizard } from '../../../../../components/ai/ocr-wizard';
import { EmptyState } from '../../../../../components/shared/empty-state';
import { PageHero } from '../../../../../components/shared/page-hero';
import { calcularComputoMensual } from '../../../../../lib/utils/computo';
import {
  clasificarCuerpo,
  cuerpoLabel,
  detectarAlertasPersona,
} from '../../../../../lib/utils/cuerpo';
import { fmtFechaCorta, fmtMesPeriodo, mesActual } from '../../../../../lib/utils/date';
import { fmtJerarquia } from '../../../../../lib/utils/jerarquia';
import { useFaroStore } from '../../../../../store/use-faro-store';

function diasHasta(iso: string): number {
  return Math.round((new Date(iso).getTime() - Date.now()) / 8.64e7);
}

function aniosEntre(iso: string): number {
  return Math.floor((Date.now() - new Date(iso).getTime()) / 3.15576e10);
}

export default function FichaPersonaView() {
  const { id } = useParams<{ id: string }>();
  const personas = useFaroStore((s) => s.personas);
  const asistencias = useFaroStore((s) => s.asistencias);
  const persona = personas.find((p) => p.id === id);
  const toast = useToast();
  const [tab, setTab] = useState('datos');
  const [ocrOpen, setOcrOpen] = useState(false);

  if (!persona) return notFound();

  const cuerpo = clasificarCuerpo(persona);
  const alertas = detectarAlertasPersona(persona);
  const computo = calcularComputoMensual(asistencias, persona.cuartelId, mesActual()).find(
    (c) => c.personaId === persona.id,
  );
  const anios = aniosEntre(persona.fechaIngreso);

  function solicitar(campo: string) {
    toast.push({
      kind: 'info',
      title: `Cambio solicitado · ${campo}`,
      description:
        'La persona recibe la notificación, confirma con un código al celular y queda registrado.',
    });
  }

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <Link
        href="/administrativo"
        className="text-brand-700 hover:text-brand-900 inline-flex items-center gap-1 text-sm font-medium"
      >
        <ArrowLeft size={14} /> Volver al padrón
      </Link>

      <PageHero
        objetivo={`Ficha · ${cuerpoLabel[cuerpo]}`}
        titulo={`${persona.nombre} ${persona.apellido}`}
        descripcion={`${persona.funcion} · ${persona.base}. Cada modificación queda registrada con tu firma.`}
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
        acciones={
          <>
            <Button intent="secondary" size="md" onClick={() => setOcrOpen(true)}>
              <ScanLine size={14} /> Actualizar con foto
            </Button>
            <Button intent="primary" size="md" onClick={() => solicitar('múltiples campos')}>
              <Edit3 size={14} /> Editar
            </Button>
          </>
        }
        meta={
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <Badge intent="warn">{fmtJerarquia(persona.jerarquia)}</Badge>
            <Badge
              intent={
                persona.estado === 'activo' ? 'ok' : persona.estado === 'licencia' ? 'warn' : 'risk'
              }
              className="capitalize"
            >
              {persona.estado}
            </Badge>
            <span className="text-slate-700">
              Legajo <strong className="font-mono">{persona.legajo}</strong>
            </span>
            <span className="text-slate-700">·</span>
            <span className="text-slate-700">{anios} años de servicio</span>
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
            <h3 className="mb-2 font-semibold text-slate-900">Alertas activas</h3>
            <ul className="space-y-1">
              {alertas.map((a, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm">
                  <span
                    className={cn(
                      'mt-1.5 h-2 w-2 shrink-0 rounded-full',
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
            <IdCard size={13} className="mr-1" /> Datos
          </TabsTrigger>
          <TabsTrigger value="salud">
            <Heart size={13} className="mr-1" /> Salud
          </TabsTrigger>
          <TabsTrigger value="familia">
            <Users size={13} className="mr-1" /> Familia
          </TabsTrigger>
          <TabsTrigger value="laboral">
            <Briefcase size={13} className="mr-1" /> Laboral
          </TabsTrigger>
          <TabsTrigger value="formacion">
            <GraduationCap size={13} className="mr-1" /> Formación
          </TabsTrigger>
          <TabsTrigger value="cursos">
            <Award size={13} className="mr-1" /> Cursos
          </TabsTrigger>
          <TabsTrigger value="licencia">
            <IdCard size={13} className="mr-1" /> Lic. conducir
          </TabsTrigger>
          <TabsTrigger value="destino">
            <MapPin size={13} className="mr-1" /> Destino
          </TabsTrigger>
        </TabsList>

        <TabsContent value="datos">
          <Card>
            <CardContent className="p-0">
              <dl className="divide-y divide-slate-100">
                {[
                  {
                    k: 'Nombre completo',
                    v: `${persona.nombre} ${persona.apellido}`,
                    icon: <IdCard size={14} />,
                  },
                  { k: 'Legajo', v: persona.legajo, icon: <IdCard size={14} /> },
                  { k: 'Email', v: persona.email, icon: <Mail size={14} />, editable: true },
                  { k: 'Teléfono', v: persona.telefono, icon: <Phone size={14} />, editable: true },
                  {
                    k: 'Nacimiento',
                    v: fmtFechaCorta(persona.fechaNacimiento),
                    icon: <Calendar size={14} />,
                  },
                  {
                    k: 'Ingreso al cuartel',
                    v: `${fmtFechaCorta(persona.fechaIngreso)} (${anios} años)`,
                    icon: <ShieldCheck size={14} />,
                  },
                  {
                    k: 'Foto',
                    v: 'Cargada · resolución 800×800',
                    icon: <FileText size={14} />,
                    editable: true,
                  },
                  {
                    k: 'Posición en libro',
                    v: `Folio 12 · Hoja ${persona.legajo}`,
                    icon: <FileText size={14} />,
                  },
                ].map((f) => (
                  <FieldRow
                    key={f.k}
                    {...f}
                    onEdit={f.editable ? () => solicitar(f.k) : undefined}
                  />
                ))}
              </dl>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="salud">
          <Card>
            <CardContent className="p-5">
              <div className="bg-status-warn-bg text-status-warn-fg mb-4 inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-semibold">
                <ShieldCheck size={12} /> Datos sensibles · acceso restringido
              </div>

              <dl className="divide-y divide-slate-100">
                <FieldRow
                  k="Grupo sanguíneo"
                  v={persona.salud.grupoSanguineo ?? '—'}
                  icon={<Heart size={14} />}
                />
                <FieldRow
                  k="Aptitud médica"
                  v={
                    persona.salud.aptitudVencimiento
                      ? `Vence ${fmtFechaCorta(persona.salud.aptitudVencimiento)}`
                      : '—'
                  }
                  icon={<Calendar size={14} />}
                  badge={
                    persona.salud.aptitudVencimiento &&
                    diasHasta(persona.salud.aptitudVencimiento) < 0
                      ? { label: 'Vencida', intent: 'risk' }
                      : persona.salud.aptitudVencimiento &&
                          diasHasta(persona.salud.aptitudVencimiento) <= 30
                        ? { label: 'Por vencer', intent: 'warn' }
                        : { label: 'Vigente', intent: 'ok' }
                  }
                />
                <FieldRow
                  k="Alergias"
                  v="Ninguna registrada"
                  icon={<Heart size={14} />}
                  editable
                  onEdit={() => solicitar('alergias')}
                />
                <FieldRow
                  k="Medicación crónica"
                  v="—"
                  icon={<Heart size={14} />}
                  editable
                  onEdit={() => solicitar('medicación')}
                />
                <FieldRow
                  k="Contacto emergencia"
                  v="No informado"
                  icon={<Phone size={14} />}
                  editable
                  onEdit={() => solicitar('contacto emergencia')}
                />
              </dl>

              {persona.salud.alerta && (
                <div className="bg-status-warn-bg text-status-warn-fg mt-4 rounded-md p-3 text-sm">
                  ⚠ {persona.salud.alerta}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="familia">
          <Card>
            <CardContent className="p-5">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-bold text-slate-900">Vínculos familiares y herederos</h3>
                <Button intent="ghost" size="sm" onClick={() => solicitar('familiar nuevo')}>
                  + Agregar
                </Button>
              </div>
              <EmptyState
                inline
                icon={<Users size={28} />}
                titulo="Sin datos cargados"
                descripcion="Esta sección se completará desde la ficha de Recursos Humanos."
              />
              <p className="mt-3 text-xs text-slate-500">
                Los herederos figuran en la planilla del Fondo · cambios requieren un código al
                celular del titular.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="laboral">
          <Card>
            <CardContent className="p-5">
              <h3 className="mb-4 font-bold text-slate-900">Historial laboral y movimientos</h3>
              <EmptyState
                inline
                icon={<Users size={28} />}
                titulo="Sin datos cargados"
                descripcion="Esta sección se completará desde la ficha de Recursos Humanos."
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="formacion">
          <Card>
            <CardContent className="p-5">
              <h3 className="mb-3 font-bold text-slate-900">Formación académica</h3>
              <EmptyState
                inline
                icon={<Users size={28} />}
                titulo="Sin datos cargados"
                descripcion="Esta sección se completará desde la ficha de Recursos Humanos."
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cursos">
          <Card>
            <CardContent className="p-5">
              <h3 className="mb-3 font-bold text-slate-900">Cursos y certificaciones</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                {persona.cursos.length === 0 ? (
                  <div className="col-span-2 text-sm text-slate-500">Sin cursos registrados.</div>
                ) : (
                  persona.cursos.map((c) => {
                    const dias = c.vencimiento ? diasHasta(c.vencimiento) : null;
                    const estado =
                      !c.vigente || (dias !== null && dias < 0)
                        ? 'risk'
                        : dias !== null && dias <= 30
                          ? 'warn'
                          : 'ok';
                    return (
                      <div
                        key={c.id}
                        className={cn(
                          'rounded-xl border border-l-4 border-slate-200 p-4',
                          estado === 'risk' && 'border-l-status-risk',
                          estado === 'warn' && 'border-l-status-warn',
                          estado === 'ok' && 'border-l-status-ok',
                        )}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <div className="font-semibold text-slate-900">{c.nombre}</div>
                            {c.centro && (
                              <div className="mt-0.5 text-xs text-slate-600">{c.centro}</div>
                            )}
                          </div>
                          <Award
                            size={16}
                            className={cn(
                              estado === 'risk'
                                ? 'text-status-risk'
                                : estado === 'warn'
                                  ? 'text-status-warn'
                                  : 'text-status-ok',
                            )}
                          />
                        </div>
                        {c.vencimiento && (
                          <div className="mt-2 flex items-center gap-2">
                            <Calendar size={11} className="text-slate-500" />
                            <span className="text-xs text-slate-600">
                              Vence {fmtFechaCorta(c.vencimiento)}
                            </span>
                            <Badge intent={estado}>
                              {estado === 'risk'
                                ? 'Vencido'
                                : estado === 'warn'
                                  ? 'Por vencer'
                                  : 'Vigente'}
                            </Badge>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="licencia">
          <Card>
            <CardContent className="p-5">
              <h3 className="mb-3 font-bold text-slate-900">Licencia de conducir</h3>
              {persona.licenciaConducirCategorias &&
              persona.licenciaConducirCategorias.length > 0 ? (
                <>
                  <div className="mb-4 flex flex-wrap gap-2">
                    {persona.licenciaConducirCategorias.map((c) => (
                      <div
                        key={c}
                        className="rounded-lg bg-slate-900 px-3 py-1.5 font-mono text-sm font-bold text-white"
                      >
                        Cat. {c}
                      </div>
                    ))}
                  </div>
                  {persona.licenciaConducirVencimiento && (
                    <div className="flex items-center justify-between rounded-lg border border-slate-200 p-3 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-slate-500" />
                        <span>Vencimiento</span>
                      </div>
                      <Badge
                        intent={
                          diasHasta(persona.licenciaConducirVencimiento) < 0
                            ? 'risk'
                            : diasHasta(persona.licenciaConducirVencimiento) < 30
                              ? 'warn'
                              : 'ok'
                        }
                      >
                        {fmtFechaCorta(persona.licenciaConducirVencimiento)}
                      </Badge>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-sm text-slate-500">Sin licencia registrada.</p>
              )}
              <p className="mt-3 text-xs text-slate-500">
                Las categorías habilitadas determinan qué móviles puede conducir. Cambios requieren
                copia digital de la nueva licencia.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="destino">
          <Card>
            <CardContent className="p-5">
              <h3 className="mb-3 font-bold text-slate-900">Destino, función y cargo actual</h3>
              <dl className="divide-y divide-slate-100">
                <FieldRow k="Base operativa" v={persona.base} icon={<MapPin size={14} />} />
                <FieldRow k="Función actual" v={persona.funcion} icon={<Briefcase size={14} />} />
                <FieldRow
                  k="Jerarquía"
                  v={fmtJerarquia(persona.jerarquia)}
                  icon={<ShieldCheck size={14} />}
                />
                <FieldRow k="Sección" v="Operativa" icon={<Users size={14} />} />
                <FieldRow k="Cuerpo" v={cuerpoLabel[cuerpo]} icon={<IdCard size={14} />} />
              </dl>

              {computo && (
                <div className="mt-4">
                  <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Cómputo del mes ({fmtMesPeriodo(mesActual())})
                  </div>
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                    <Kpi label="Total" value={computo.total} hint="hs" intent="brand" />
                    <Kpi label="Accident." value={computo.accidental} hint="hs" intent="brand" />
                    <Kpi label="Guardia" value={computo.guardia} hint="hs" intent="ok" />
                    <Kpi label="Jefatura" value={computo.jefatura} hint="hs" intent="warn" />
                    <Kpi label="O.I." value={computo.ordenInterno} hint="hs" intent="neutral" />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card className="border-slate-200 bg-slate-50">
        <CardContent className="flex items-start gap-3 p-4 text-sm text-slate-600">
          <History size={18} className="mt-0.5 shrink-0 text-slate-500" />
          <div>
            <strong className="text-slate-900">Historial de cambios:</strong> cada edición de esta
            ficha queda en el{' '}
            <Link
              href="/gobierno/audit"
              className="text-brand-700 hover:text-brand-900 font-medium"
            >
              Registro permanente
            </Link>{' '}
            con tu nombre, fecha y campo modificado. Los datos sensibles (salud, familia) requieren
            un código al celular del titular para editarse.
          </div>
        </CardContent>
      </Card>

      <OCRWizard
        open={ocrOpen}
        onClose={() => setOcrOpen(false)}
        persona={{ nombre: persona.nombre, apellido: persona.apellido, legajo: persona.legajo }}
      />
    </div>
  );
}

function FieldRow({
  k,
  v,
  icon,
  editable,
  onEdit,
  badge,
}: {
  k: string;
  v: string;
  icon?: React.ReactNode;
  editable?: boolean;
  onEdit?: () => void;
  badge?: { label: string; intent: 'ok' | 'warn' | 'risk' | 'brand' | 'neutral' };
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50">
      {icon && <div className="shrink-0 text-slate-500">{icon}</div>}
      <div className="w-36 shrink-0 text-xs text-slate-500">{k}</div>
      <div className="flex-1 truncate text-sm font-medium text-slate-900">{v}</div>
      {badge && <Badge intent={badge.intent}>{badge.label}</Badge>}
      {editable && (
        <button
          type="button"
          onClick={onEdit}
          className="text-brand-700 hover:text-brand-900 shrink-0 text-xs font-medium"
        >
          Pedir cambio
        </button>
      )}
    </div>
  );
}
