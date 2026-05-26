'use client';

import {
  Database,
  Download,
  FileSearch,
  Megaphone,
  MessageCircle,
  Plus,
  ScanLine,
  Stethoscope,
  UserPlus,
  Users,
} from 'lucide-react';
import { useMemo, useState } from 'react';

import { Button, Card, CardContent, Kpi, useToast } from '@faro/ui';

import { EmptyState } from '../../../components/shared/empty-state';
import { FeaturesGrid } from '../../../components/shared/features-grid';
import { PageHero } from '../../../components/shared/page-hero';
import { FiltersBar, type FilterChip } from '../../../components/shared/filters-bar';
import { useRouter } from 'next/navigation';

import { OCRWizard } from '../../../components/ai/ocr-wizard';
import { NuevaPersonaDialog } from '../../../components/personal/nueva-persona-dialog';
import { PersonaCard } from '../../../components/personal/persona-card';
import {
  clasificarCuerpo,
  contarPorCuerpo,
  type Cuerpo,
  detectarAlertasPersona,
} from '../../../lib/utils/cuerpo';
import { jerarquiaOrden } from '../../../lib/utils/jerarquia';
import { useFaroStore, selectCuartelActivo } from '../../../store/use-faro-store';

type TabCuerpo = Cuerpo | 'todos';
type EstadoFiltro = 'todos' | 'activo' | 'licencia' | 'baja';

export default function PadronPage() {
  const cuartel = useFaroStore(selectCuartelActivo);
  const allPersonas = useFaroStore((s) => s.personas);
  const toast = useToast();
  const router = useRouter();

  const personas = useMemo(
    () => allPersonas.filter((p) => p.cuartelId === cuartel?.id),
    [allPersonas, cuartel?.id],
  );

  const [tab, setTab] = useState<TabCuerpo>('todos');
  const [estado, setEstado] = useState<EstadoFiltro>('todos');
  const [search, setSearch] = useState('');
  const [ocrOpen, setOcrOpen] = useState(false);
  const [nuevaOpen, setNuevaOpen] = useState(false);

  const conteo = useMemo(() => contarPorCuerpo(personas), [personas]);
  const activos = personas.filter((p) => p.estado === 'activo').length;
  const enLicencia = personas.filter((p) => p.estado === 'licencia').length;
  const conAlertas = personas.filter((p) => detectarAlertasPersona(p).length > 0).length;

  const cuerpoChips: FilterChip<TabCuerpo>[] = [
    { value: 'todos', label: 'Todos', count: personas.length },
    { value: 'operativo', label: 'Cuerpo activo', count: conteo.operativo, intent: 'brand' },
    { value: 'mando', label: 'Mando', count: conteo.mando, intent: 'warn' },
    { value: 'administrativo', label: 'Administrativo', count: conteo.administrativo },
    { value: 'cadete', label: 'Cadetes', count: conteo.cadete, intent: 'ok' },
  ];
  if (conteo.gobierno > 0)
    cuerpoChips.push({ value: 'gobierno', label: 'Gobierno', count: conteo.gobierno });

  const estadoChips: FilterChip<EstadoFiltro>[] = [
    { value: 'todos', label: 'Todos los estados' },
    { value: 'activo', label: 'Activos', count: activos, intent: 'ok' },
    { value: 'licencia', label: 'En licencia', count: enLicencia, intent: 'warn' },
    {
      value: 'baja',
      label: 'Baja',
      count: personas.filter((p) => p.estado === 'baja' || p.estado === 'jubilado').length,
    },
  ];

  const filtradas = useMemo(() => {
    return personas
      .filter((p) => {
        if (tab !== 'todos' && clasificarCuerpo(p) !== tab) return false;
        if (estado === 'activo' && p.estado !== 'activo') return false;
        if (estado === 'licencia' && p.estado !== 'licencia') return false;
        if (estado === 'baja' && p.estado !== 'baja' && p.estado !== 'jubilado') return false;
        if (search.trim().length > 0) {
          const q = search.toLowerCase();
          if (
            !`${p.nombre} ${p.apellido} ${p.legajo} ${p.email} ${p.funcion}`
              .toLowerCase()
              .includes(q)
          )
            return false;
        }
        return true;
      })
      .sort((a, b) => {
        const ja = jerarquiaOrden[a.jerarquia] ?? 0;
        const jb = jerarquiaOrden[b.jerarquia] ?? 0;
        if (jb !== ja) return jb - ja;
        return a.apellido.localeCompare(b.apellido);
      });
  }, [personas, tab, estado, search]);

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <PageHero
        objetivo="Administrativo · Padrón"
        titulo="Ficha única del personal"
        descripcion="Buscás, filtrás, das de alta y mantenés actualizado el padrón completo. Sacás una foto del DNI o licencia y se cargan los datos solos."
        icono={<Users size={26} />}
        meta={
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Kpi label="Total" value={personas.length} hint="en padrón" intent="neutral" />
            <Kpi
              label="Activos"
              value={activos}
              hint={`${Math.round((activos / personas.length) * 100)}%`}
              intent="ok"
            />
            <Kpi
              label="Con alertas"
              value={conAlertas}
              hint="aptitud / cursos"
              intent={conAlertas > 0 ? 'warn' : 'neutral'}
            />
            <Kpi
              label="En licencia"
              value={enLicencia}
              intent={enLicencia > 0 ? 'warn' : 'neutral'}
            />
          </div>
        }
        acciones={
          <>
            <Button intent="primary" size="md" onClick={() => setNuevaOpen(true)}>
              <UserPlus size={16} /> Nueva persona
            </Button>
            <Button intent="secondary" size="md" onClick={() => setOcrOpen(true)}>
              <ScanLine size={16} /> Cargar desde foto
            </Button>
          </>
        }
      />

      <Card className="bg-brand-50 border-brand-100">
        <CardContent className="p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <div className="bg-brand-600 grid h-10 w-10 shrink-0 place-items-center rounded-xl text-white">
              <FileSearch size={20} />
            </div>
            <div className="flex-1">
              <div className="text-brand-900 font-semibold">Búsqueda inteligente</div>
              <p className="text-brand-900/80 text-sm">
                Buscá por nombre, legajo, email, función o categoría de licencia. También podés
                preguntar cosas como{' '}
                <em>"quién tiene rescate vehicular vigente y está disponible esta noche"</em>.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <FiltersBar
        search={search}
        onSearch={setSearch}
        searchPlaceholder="Nombre, legajo, email, función..."
        chips={cuerpoChips}
        chipValue={tab}
        onChipChange={setTab}
      />

      <FiltersBar
        chips={estadoChips}
        chipValue={estado}
        onChipChange={setEstado}
        rightSlot={
          <button
            type="button"
            onClick={() =>
              toast.push({
                kind: 'success',
                title: 'Exportando a Excel',
                description: 'Te llega el archivo por mail.',
              })
            }
            className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 hover:border-slate-300"
          >
            <Download size={14} /> Exportar
          </button>
        }
      />

      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>
          {filtradas.length} de {personas.length} personas
        </span>
        {(tab !== 'todos' || estado !== 'todos' || search.length > 0) && (
          <button
            type="button"
            onClick={() => {
              setTab('todos');
              setEstado('todos');
              setSearch('');
            }}
            className="text-brand-700 hover:text-brand-900 font-medium"
          >
            Limpiar filtros
          </button>
        )}
      </div>

      {filtradas.length === 0 ? (
        <EmptyState
          icon={<Users size={28} />}
          titulo="Sin personas con esos filtros"
          descripcion="Probá quitar algún filtro o cambiar la búsqueda. Si es la primera vez, sumá tu primera persona."
          accion={{
            label: 'Nueva persona',
            icon: <UserPlus size={14} />,
            onClick: () => setNuevaOpen(true),
          }}
          accionSecundaria={{
            label: 'Limpiar filtros',
            onClick: () => {
              setTab('todos');
              setEstado('todos');
              setSearch('');
            },
          }}
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {filtradas.map((p) => (
            <PersonaCard
              key={p.id}
              persona={p}
              onClick={() => router.push(`/administrativo/personas/${p.id}` as never)}
            />
          ))}
        </div>
      )}

      {/* Acceso rápido a nuevas funcionalidades */}
      <FeaturesGrid
        titulo="Lo nuevo en Administrativo"
        descripcion="Herramientas que reemplazan el trabajo manual"
        cards={[
          {
            href: '/administrativo/aptitud-medica',
            icon: <Stethoscope size={18} />,
            titulo: 'Aptitud médica',
            descripcion: 'Vencimientos · estudios anuales · screening',
            color: 'bg-status-risk',
            nuevo: true,
          },
          {
            href: '/administrativo/sync-ruba',
            icon: <Database size={18} />,
            titulo: 'Actualizar con RUBA',
            descripcion: 'Sin doble carga · ves qué cambia antes de aplicar',
            color: 'bg-brand-700',
            nuevo: true,
          },
          {
            href: '/administrativo/whatsapp',
            icon: <MessageCircle size={18} />,
            titulo: 'WhatsApp Business',
            descripcion: 'Plantillas oficiales · voy/no voy + GPS',
            color: 'bg-status-ok',
            nuevo: true,
          },
          {
            href: '/administrativo/broadcast',
            icon: <Megaphone size={18} />,
            titulo: 'Aviso masivo',
            descripcion: 'Editor con formato · 6 audiencias',
            color: 'bg-status-warn',
            nuevo: true,
          },
        ]}
      />

      <Card className="border-slate-200 bg-slate-50">
        <CardContent className="flex items-start gap-3 p-4 text-sm text-slate-600">
          <Plus size={18} className="mt-0.5 shrink-0 text-slate-400" />
          <div>
            <strong className="text-slate-900">La ficha única tiene 8 solapas</strong>: Datos
            personales, Salud, Familia/Herederos, Laboral/Antigüedad, Formación académica, Cursos,
            Licencias de conducir, Destino/Función/Cargo. Reemplaza los 28 formularios anteriores
            con una sola vista.
          </div>
        </CardContent>
      </Card>

      <OCRWizard open={ocrOpen} onClose={() => setOcrOpen(false)} />
      <NuevaPersonaDialog
        open={nuevaOpen}
        onClose={() => setNuevaOpen(false)}
        onCreated={(p) => router.push(`/administrativo/personas/${p.id}` as never)}
      />
    </div>
  );
}
