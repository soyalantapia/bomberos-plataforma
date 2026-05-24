'use client';

import { Download, FileSearch, Plus, ScanLine, UserPlus, Users } from 'lucide-react';
import { useMemo, useState } from 'react';

import { Button, Card, CardContent, Kpi, useToast } from '@faro/ui';

import { PageHero } from '../../../components/shared/page-hero';
import { FiltersBar, type FilterChip } from '../../../components/shared/filters-bar';
import { useRouter } from 'next/navigation';

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
        objetivo="Vista Administrativo · Padrón"
        titulo="Ficha única que reemplaza 28 formularios"
        descripcion="Buscás, filtrás, das de alta y mantenés actualizado el padrón completo. La IA extrae datos de un DNI o licencia con una foto."
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
            <Button
              intent="primary"
              size="md"
              onClick={() =>
                toast.push({
                  kind: 'info',
                  title: 'Próximamente',
                  description: 'Alta nueva con flujo en 3 pasos.',
                })
              }
            >
              <UserPlus size={16} /> Nueva persona
            </Button>
            <Button
              intent="secondary"
              size="md"
              onClick={() =>
                toast.push({
                  kind: 'info',
                  title: 'OCR de documento (IA)',
                  description: 'Subí una foto de DNI o licencia y se extraen los datos.',
                })
              }
            >
              <ScanLine size={16} /> OCR documento
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
                Buscá por nombre, legajo, email, función o categoría de licencia. La IA además
                entiende preguntas como{' '}
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
                kind: 'info',
                title: 'Exportando a Excel',
                description: 'Próximamente.',
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
        <Card>
          <CardContent className="p-8 text-center">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-slate-100 text-slate-400">
              <Users size={24} />
            </div>
            <h3 className="mt-3 font-semibold text-slate-900">Sin resultados</h3>
            <p className="mt-1 text-sm text-slate-600">
              Probá quitar algún filtro o cambiar la búsqueda.
            </p>
          </CardContent>
        </Card>
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

      <Card className="border-slate-200 bg-slate-50">
        <CardContent className="flex items-start gap-3 p-4 text-sm text-slate-600">
          <Plus size={18} className="mt-0.5 shrink-0 text-slate-400" />
          <div>
            <strong className="text-slate-900">La ficha única tiene 8 sub-pestañas</strong>: Datos
            personales, Salud, Familia/Herederos, Laboral/Antigüedad, Formación académica, Cursos,
            Licencias de conducir, Destino/Función/Cargo. Reemplaza los 28 formularios de GIB con
            una sola vista.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
