'use client';

import { Award, Filter, ShieldCheck, Users } from 'lucide-react';
import { useMemo, useState } from 'react';

import { Card, CardContent, Kpi } from '@faro/ui';

import { PageHero } from '../../../../components/shared/page-hero';
import { FiltersBar, type FilterChip } from '../../../../components/shared/filters-bar';
import { PersonaCard } from '../../../../components/personal/persona-card';
import {
  clasificarCuerpo,
  contarPorCuerpo,
  type Cuerpo,
  detectarAlertasPersona,
  disponibleAhora,
} from '../../../../lib/utils/cuerpo';
import { jerarquiaOrden } from '../../../../lib/utils/jerarquia';
import { useFaroStore, selectCuartelActivo } from '../../../../store/use-faro-store';

type TabCuerpo = Cuerpo | 'todos';
type RangoFiltro = 'todos' | 'jefatura' | 'suboficiales' | 'tropa' | 'cadete';

const RANGOS: Array<{ value: RangoFiltro; label: string; jerarquias: string[] }> = [
  {
    value: 'jefatura',
    label: 'Jefatura',
    jerarquias: ['jefe', 'comandante', 'sub_comandante', 'oficial'],
  },
  {
    value: 'suboficiales',
    label: 'Suboficiales',
    jerarquias: ['sargento_ayudante', 'sargento', 'cabo'],
  },
  { value: 'tropa', label: 'Tropa', jerarquias: ['bombero_1ra', 'bombero'] },
  { value: 'cadete', label: 'Cadetes', jerarquias: ['cadete'] },
];

export default function PersonalMando() {
  const cuartel = useFaroStore(selectCuartelActivo);
  const allPersonas = useFaroStore((s) => s.personas);

  const personas = useMemo(
    () => allPersonas.filter((p) => p.cuartelId === cuartel?.id),
    [allPersonas, cuartel?.id],
  );

  const [tab, setTab] = useState<TabCuerpo>('todos');
  const [rango, setRango] = useState<RangoFiltro>('todos');
  const [search, setSearch] = useState('');
  const [soloDisponibles, setSoloDisponibles] = useState(false);

  const conteo = useMemo(() => contarPorCuerpo(personas), [personas]);
  const activos = personas.filter((p) => p.estado === 'activo').length;
  const enLicencia = personas.filter((p) => p.estado === 'licencia').length;
  const disponiblesAhora = personas.filter(disponibleAhora).length;
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

  const rangoChips: FilterChip<RangoFiltro>[] = [
    { value: 'todos', label: 'Todos los rangos' },
    ...RANGOS.map((r) => ({ value: r.value, label: r.label })),
  ];

  const filtradas = useMemo(() => {
    return personas
      .filter((p) => {
        if (tab !== 'todos' && clasificarCuerpo(p) !== tab) return false;
        if (rango !== 'todos') {
          const r = RANGOS.find((x) => x.value === rango);
          if (r && !r.jerarquias.includes(p.jerarquia)) return false;
        }
        if (soloDisponibles && !disponibleAhora(p)) return false;
        if (search.trim().length > 0) {
          const q = search.toLowerCase();
          const haystack = `${p.nombre} ${p.apellido} ${p.legajo} ${p.funcion}`.toLowerCase();
          if (!haystack.includes(q)) return false;
        }
        return true;
      })
      .sort((a, b) => {
        const ja = jerarquiaOrden[a.jerarquia] ?? 0;
        const jb = jerarquiaOrden[b.jerarquia] ?? 0;
        if (jb !== ja) return jb - ja;
        return a.apellido.localeCompare(b.apellido);
      });
  }, [personas, tab, rango, soloDisponibles, search]);

  const hayFiltrosActivos =
    tab !== 'todos' || rango !== 'todos' || soloDisponibles || search.length > 0;

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <PageHero
        objetivo="Vista Mando · Personal"
        titulo="Quién está y quién está disponible"
        descripcion={`${personas.length} personas en ${cuartel?.nombre ?? '—'}. Filtrá por cuerpo, rango o estado para encontrar a quien necesitás.`}
        icono={<Users size={26} />}
        meta={
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Kpi
              label="Activos"
              value={activos}
              hint={`de ${personas.length}`}
              intent="ok"
              icon={<ShieldCheck size={16} />}
            />
            <Kpi
              label="Disponibles ahora"
              value={disponiblesAhora}
              hint="sin alertas"
              intent="brand"
            />
            <Kpi
              label="Con alertas"
              value={conAlertas}
              hint="cursos / aptitud"
              intent={conAlertas > 0 ? 'warn' : 'neutral'}
              icon={<Award size={16} />}
            />
            <Kpi
              label="En licencia"
              value={enLicencia}
              hint="médica / académica"
              intent={enLicencia > 0 ? 'warn' : 'neutral'}
            />
          </div>
        }
      />

      <FiltersBar
        search={search}
        onSearch={setSearch}
        searchPlaceholder="Buscar por nombre, legajo o función..."
        chips={cuerpoChips}
        chipValue={tab}
        onChipChange={setTab}
        rightSlot={
          <button
            type="button"
            onClick={() => setSoloDisponibles((s) => !s)}
            className={`inline-flex h-10 items-center gap-1.5 rounded-lg border px-3 text-sm font-medium transition-colors ${
              soloDisponibles
                ? 'bg-status-ok border-status-ok text-white'
                : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
            }`}
            aria-pressed={soloDisponibles}
          >
            <ShieldCheck size={14} /> Disponibles
          </button>
        }
      />

      <div className="-mx-1 flex items-center gap-2 overflow-x-auto px-1 text-sm">
        <span className="flex shrink-0 items-center gap-1 text-slate-500">
          <Filter size={13} /> Rango:
        </span>
        {rangoChips.map((c) => {
          const active = rango === c.value;
          return (
            <button
              key={c.value}
              type="button"
              onClick={() => setRango(c.value)}
              className={`shrink-0 whitespace-nowrap rounded-md border px-2.5 py-1 text-xs font-medium transition-colors ${
                active
                  ? 'border-brand-600 bg-brand-50 text-brand-800'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
              }`}
            >
              {c.label}
            </button>
          );
        })}
      </div>

      {filtradas.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-slate-100 text-slate-400">
              <Users size={24} />
            </div>
            <h3 className="mt-3 font-semibold text-slate-900">No hay personas con esos filtros</h3>
            <p className="mt-1 text-sm text-slate-600">
              {hayFiltrosActivos
                ? 'Probá quitar algún filtro o cambiar la búsqueda.'
                : 'No hay personal cargado en este cuartel.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>
              {filtradas.length} resultado{filtradas.length === 1 ? '' : 's'}
              {hayFiltrosActivos && ' (filtrado)'}
            </span>
            {hayFiltrosActivos && (
              <button
                type="button"
                onClick={() => {
                  setTab('todos');
                  setRango('todos');
                  setSoloDisponibles(false);
                  setSearch('');
                }}
                className="text-brand-700 hover:text-brand-900 font-medium"
              >
                Limpiar filtros
              </button>
            )}
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {filtradas.map((p) => (
              <PersonaCard key={p.id} persona={p} />
            ))}
          </div>
        </>
      )}

      <Card className="border-slate-200 bg-slate-50">
        <CardContent className="p-4 text-sm text-slate-600">
          <strong className="text-slate-900">Tip:</strong> activá el filtro
          <span className="text-status-ok-fg ring-status-ok/30 mx-1 inline-flex items-center gap-1 rounded-md bg-white px-1.5 py-0.5 text-xs font-medium ring-1">
            <ShieldCheck size={11} /> Disponibles
          </span>
          para ver sólo quienes están activos y sin alertas críticas. Útil para armar una dotación
          de emergencia rápida o coordinar guardias.
        </CardContent>
      </Card>
    </div>
  );
}
