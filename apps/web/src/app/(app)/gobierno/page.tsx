'use client';

import {
  ChevronRight,
  FileSearch,
  Hash,
  KeyRound,
  Network,
  ScrollText,
  Settings,
  ShieldCheck,
  Users2,
} from 'lucide-react';
import { useMemo, useState } from 'react';

import type { Persona } from '@faro/types';

import { Avatar, Badge, Card, CardContent, Kpi, useToast } from '@faro/ui';

import { FeaturesGrid } from '../../../components/shared/features-grid';
import { PageHero } from '../../../components/shared/page-hero';
import { fmtJerarquia } from '../../../lib/utils/jerarquia';
import { useFaroStore, selectCuartelActivo } from '../../../store/use-faro-store';

interface Seccion {
  id: string;
  nombre: string;
  jerarquia: string;
  personasIds: string[];
  jefeId?: string;
  base: string;
  tareasSemana: number;
}

export default function OrdenInterno() {
  const cuartel = useFaroStore(selectCuartelActivo);
  const personas = useFaroStore((s) => s.personas);
  const toast = useToast();
  const [seleccionada, setSeleccionada] = useState<string | null>(null);

  const personasCuartel = useMemo<Persona[]>(
    () => personas.filter((p) => p.cuartelId === cuartel?.id),
    [personas, cuartel?.id],
  );

  const secciones: Seccion[] = useMemo(() => {
    const operativos = personasCuartel.filter(
      (p: Persona) =>
        ['bombero', 'bombero_1ra', 'cabo', 'sargento', 'sargento_ayudante', 'oficial'].includes(
          p.jerarquia,
        ) && p.perfiles.includes('bombero'),
    );
    const cadetes = personasCuartel.filter((p: Persona) => p.jerarquia === 'cadete');
    const adminis = personasCuartel.filter((p: Persona) => p.perfiles.includes('administrativo'));
    const etica = personasCuartel.filter((p: Persona) => p.perfiles.includes('gobierno'));

    return [
      {
        id: 'sec-operativa',
        nombre: 'Sección Operativa',
        jerarquia: 'Cuerpo activo',
        personasIds: operativos.map((p: Persona) => p.id),
        jefeId: personasCuartel.find((p: Persona) => p.jerarquia === 'sub_comandante')?.id,
        base: 'Cuartel Central',
        tareasSemana: 12,
      },
      {
        id: 'sec-cadetes',
        nombre: 'Sección Cadetes',
        jerarquia: 'Formación',
        personasIds: cadetes.map((p: Persona) => p.id),
        base: 'Cuartel Central · Escuela',
        tareasSemana: 5,
      },
      {
        id: 'sec-admin',
        nombre: 'Sección Administrativa',
        jerarquia: 'Servicios de apoyo',
        personasIds: adminis.map((p: Persona) => p.id),
        jefeId: adminis.find((p: Persona) => p.jerarquia === 'oficial')?.id,
        base: 'Cuartel Central',
        tareasSemana: 8,
      },
      {
        id: 'sec-etica',
        nombre: 'Sección Ética y Género',
        jerarquia: 'Gobierno interno',
        personasIds: etica.map((p: Persona) => p.id),
        jefeId: etica[0]?.id,
        base: 'Sala reservada',
        tareasSemana: 3,
      },
    ];
  }, [personasCuartel]);

  const totalIntegrantes = secciones.reduce((acc, s) => acc + s.personasIds.length, 0);
  const seccionDetalle = secciones.find((s) => s.id === seleccionada);

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <PageHero
        objetivo="Gobierno interno"
        titulo="Estructura del cuartel"
        descripcion="Secciones, roles y tareas semanales. Las claves se resetean por OTP (Faro nunca las muestra en texto plano, a diferencia de GIB)."
        icono={<Network size={26} />}
        meta={
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Kpi
              label="Secciones"
              value={secciones.length}
              intent="brand"
              icon={<Users2 size={16} />}
            />
            <Kpi label="Integrantes" value={totalIntegrantes} hint="asignados" intent="ok" />
            <Kpi
              label="Tareas semana"
              value={secciones.reduce((acc, s) => acc + s.tareasSemana, 0)}
              hint="activas"
              intent="warn"
              icon={<Settings size={16} />}
            />
            <Kpi
              label="Login"
              value="OTP"
              hint="sin texto plano"
              intent="ok"
              icon={<KeyRound size={16} />}
            />
          </div>
        }
      />

      <Card className="bg-status-ok-bg/30 border-status-ok/30">
        <CardContent className="flex items-start gap-3 p-4">
          <ShieldCheck size={20} className="text-status-ok-fg mt-0.5 shrink-0" />
          <div className="flex-1 text-sm">
            <div className="text-status-ok-fg font-semibold">
              Reseteo de claves: solo por OTP, nunca a texto plano
            </div>
            <p className="mt-1 text-slate-700">
              En GIB el blanqueo dejaba la contraseña visible. En Faro el integrante recibe un OTP
              por SMS/WhatsApp/email y define la nueva clave él mismo. Todo queda en{' '}
              <a href="/gobierno/audit" className="text-brand-700 hover:text-brand-900 font-medium">
                Audit log
              </a>
              .
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-2 lg:col-span-1">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Secciones
          </h3>
          {secciones.map((s) => {
            const active = seleccionada === s.id;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setSeleccionada(active ? null : s.id)}
                className={`w-full overflow-hidden rounded-xl border-2 bg-white p-4 text-left transition-colors ${
                  active
                    ? 'border-brand-600 ring-brand-300 ring-1'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="min-w-0">
                    <div className="font-semibold text-slate-900">{s.nombre}</div>
                    <div className="mt-0.5 text-xs text-slate-500">{s.jerarquia}</div>
                  </div>
                  <ChevronRight size={16} className="shrink-0 text-slate-400" />
                </div>
                <div className="mt-3 flex items-center justify-between text-xs">
                  <Badge intent="neutral">{s.personasIds.length} personas</Badge>
                  <span className="text-slate-500">{s.tareasSemana} tareas / sem.</span>
                </div>
              </button>
            );
          })}
        </div>

        <div className="lg:col-span-2">
          {seccionDetalle ? (
            <Card>
              <CardContent className="p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">{seccionDetalle.nombre}</h2>
                    <p className="mt-0.5 text-sm text-slate-600">
                      {seccionDetalle.jerarquia} · {seccionDetalle.base}
                    </p>
                  </div>
                  <Badge intent="brand">{seccionDetalle.personasIds.length} integrantes</Badge>
                </div>

                {seccionDetalle.jefeId &&
                  (() => {
                    const jefe = personas.find((p: Persona) => p.id === seccionDetalle.jefeId);
                    if (!jefe) return null;
                    return (
                      <div className="bg-brand-50 mt-4 flex items-center gap-3 rounded-lg p-3">
                        <Avatar name={`${jefe.nombre} ${jefe.apellido}`} size={40} />
                        <div className="min-w-0 flex-1">
                          <div className="text-brand-700 text-xs font-semibold uppercase tracking-wide">
                            Jefe/a de sección
                          </div>
                          <div className="mt-0.5 truncate font-medium text-slate-900">
                            {jefe.nombre} {jefe.apellido}
                          </div>
                          <div className="text-xs text-slate-600">
                            {fmtJerarquia(jefe.jerarquia)}
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                <h3 className="mb-2 mt-5 text-sm font-semibold text-slate-700">Integrantes</h3>
                <ul className="divide-y divide-slate-100">
                  {seccionDetalle.personasIds.slice(0, 10).map((pid: string) => {
                    const p = personas.find((x: Persona) => x.id === pid);
                    if (!p) return null;
                    return (
                      <li key={p.id} className="flex items-center gap-3 py-2.5">
                        <Avatar name={`${p.nombre} ${p.apellido}`} size={32} />
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-sm font-medium text-slate-900">
                            {p.nombre} {p.apellido}
                          </div>
                          <div className="text-xs text-slate-500">
                            {fmtJerarquia(p.jerarquia)} · Legajo {p.legajo}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            toast.push({
                              kind: 'info',
                              title: `Reseteo de clave para ${p.nombre}`,
                              description:
                                'Se envió un OTP al canal configurado. El integrante define su nueva clave. Queda en audit log.',
                            })
                          }
                          className="text-brand-700 hover:bg-brand-50 hover:text-brand-900 rounded-md px-2 py-1 text-xs"
                        >
                          Resetear clave (OTP)
                        </button>
                      </li>
                    );
                  })}
                  {seccionDetalle.personasIds.length > 10 && (
                    <li className="py-2 text-xs text-slate-500">
                      + {seccionDetalle.personasIds.length - 10} más...
                    </li>
                  )}
                </ul>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-dashed">
              <CardContent className="p-8 text-center">
                <ScrollText size={36} className="mx-auto text-slate-300" />
                <h3 className="mt-3 font-semibold text-slate-900">Elegí una sección</h3>
                <p className="mt-1 text-sm text-slate-600">
                  Tocá una sección a la izquierda para ver integrantes y tareas.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Acceso rápido a herramientas nuevas */}
      <FeaturesGrid
        titulo="Auditoría e integridad"
        descripcion="Lo nuevo de Faro para verificar datos sin confianza ciega"
        columnas={2}
        cards={[
          {
            href: '/gobierno/audit',
            icon: <FileSearch size={18} />,
            titulo: 'Audit log completo',
            descripcion: '21 eventos · cifrado AES-256 · diff visual',
            color: 'bg-brand-700',
          },
          {
            href: '/gobierno/audit/verificador',
            icon: <Hash size={18} />,
            titulo: 'Verificador SHA-256',
            descripcion: 'Probá la cadena · detección de tampering',
            color: 'bg-status-risk',
            nuevo: true,
          },
        ]}
      />
    </div>
  );
}
