'use client';

import {
  Award,
  Clock,
  Filter,
  Flame,
  Medal,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Users,
} from 'lucide-react';
import { useMemo, useState } from 'react';

import {
  Avatar,
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Kpi,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  cn,
} from '@faro/ui';

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
import { calcularComputoMensual } from '../../../../lib/utils/computo';
import { fmtJerarquia, jerarquiaOrden } from '../../../../lib/utils/jerarquia';
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

// Mock: estado de quién está en guardia ahora (simulado)
const EN_GUARDIA_AHORA = new Set<string>(); // se calcula con personas[0..2]

export default function PersonalMando() {
  const cuartel = useFaroStore(selectCuartelActivo);
  const allPersonas = useFaroStore((s) => s.personas);
  const allAsistencias = useFaroStore((s) => s.asistencias);
  const allServicios = useFaroStore((s) => s.servicios);

  const personas = useMemo(
    () => allPersonas.filter((p) => p.cuartelId === cuartel?.id),
    [allPersonas, cuartel?.id],
  );

  const [tab, setTab] = useState('nomina');
  const [cuerpoTab, setCuerpoTab] = useState<TabCuerpo>('todos');
  const [rango, setRango] = useState<RangoFiltro>('todos');
  const [search, setSearch] = useState('');
  const [soloDisponibles, setSoloDisponibles] = useState(false);

  const conteo = useMemo(() => contarPorCuerpo(personas), [personas]);
  const activos = personas.filter((p) => p.estado === 'activo').length;
  const enLicencia = personas.filter((p) => p.estado === 'licencia').length;
  const disponiblesAhora = personas.filter(disponibleAhora).length;
  const conAlertas = personas.filter((p) => detectarAlertasPersona(p).length > 0).length;

  // Marcamos arbitrariamente los primeros 3 activos como "en guardia ahora"
  const personasActivas = personas.filter((p) => p.estado === 'activo');
  personasActivas.slice(0, 3).forEach((p) => EN_GUARDIA_AHORA.add(p.id));

  const computo = useMemo(
    () => (cuartel ? calcularComputoMensual(allAsistencias, cuartel.id, '2026-05') : []),
    [allAsistencias, cuartel],
  );

  // Ranking: ordenar personas por total horas + servicios atendidos
  const ranking = useMemo(() => {
    return personas
      .filter((p) => p.estado === 'activo')
      .map((p) => {
        const c = computo.find((x) => x.personaId === p.id);
        const total = c?.total ?? 0;
        const servicios = allServicios.filter((s) => s.dotacionIds.includes(p.id)).length;
        return { persona: p, horas: total, servicios };
      })
      .sort((a, b) => b.horas - a.horas || b.servicios - a.servicios)
      .slice(0, 10);
  }, [personas, computo, allServicios]);

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
        if (cuerpoTab !== 'todos' && clasificarCuerpo(p) !== cuerpoTab) return false;
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
  }, [personas, cuerpoTab, rango, soloDisponibles, search]);

  const hayFiltrosActivos =
    cuerpoTab !== 'todos' || rango !== 'todos' || soloDisponibles || search.length > 0;

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

      <Tabs value={tab} onChange={setTab}>
        <TabsList>
          <TabsTrigger value="nomina">Nómina ({personas.length})</TabsTrigger>
          <TabsTrigger value="disponibilidad">Disponibilidad ({disponiblesAhora})</TabsTrigger>
          <TabsTrigger value="ranking">Ranking del mes</TabsTrigger>
        </TabsList>

        {/* ───────── NÓMINA ───────── */}
        <TabsContent value="nomina" className="space-y-4">
          <FiltersBar
            search={search}
            onSearch={setSearch}
            searchPlaceholder="Buscar por nombre, legajo o función..."
            chips={cuerpoChips}
            chipValue={cuerpoTab}
            onChipChange={setCuerpoTab}
            rightSlot={
              <button
                type="button"
                onClick={() => setSoloDisponibles((s) => !s)}
                className={cn(
                  'inline-flex h-10 items-center gap-1.5 rounded-lg border px-3 text-sm font-medium transition-colors',
                  soloDisponibles
                    ? 'bg-status-ok border-status-ok text-white'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300',
                )}
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
                  className={cn(
                    'shrink-0 whitespace-nowrap rounded-md border px-2.5 py-1 text-xs font-medium transition-colors',
                    active
                      ? 'border-brand-600 bg-brand-50 text-brand-800'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300',
                  )}
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
                <h3 className="mt-3 font-semibold text-slate-900">
                  No hay personas con esos filtros
                </h3>
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
                      setCuerpoTab('todos');
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
        </TabsContent>

        {/* ───────── DISPONIBILIDAD ───────── */}
        <TabsContent value="disponibilidad" className="space-y-4">
          <Card className="bg-status-ok-bg/40 border-status-ok/20">
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-start gap-3">
                <div className="bg-status-ok grid h-10 w-10 shrink-0 place-items-center rounded-xl text-white">
                  <Sparkles size={20} />
                </div>
                <div className="flex-1">
                  <div className="text-status-ok-fg font-semibold">
                    {disponiblesAhora} personas listas ahora
                  </div>
                  <p className="text-status-ok-fg/80 text-sm">
                    Activas, sin alertas críticas, sin licencias. Ideal para armar una dotación de
                    emergencia o cubrir un turno faltante.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 lg:grid-cols-3">
            {/* En guardia ahora */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Flame size={18} className="text-fire-700" />
                  En guardia ahora
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {personas
                    .filter((p) => EN_GUARDIA_AHORA.has(p.id))
                    .map((p) => (
                      <li key={p.id} className="bg-fire-50 flex items-center gap-2 rounded-lg p-2">
                        <Avatar name={`${p.nombre} ${p.apellido}`} src={p.fotoUrl} size={32} />
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-sm font-medium text-slate-900">
                            {p.apellido} {p.nombre[0]}.
                          </div>
                          <div className="truncate text-xs text-slate-600">
                            {fmtJerarquia(p.jerarquia)}
                          </div>
                        </div>
                        <Badge intent="risk">En servicio</Badge>
                      </li>
                    ))}
                </ul>
              </CardContent>
            </Card>

            {/* Disponibles ahora */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShieldCheck size={18} className="text-status-ok-fg" />
                  Disponibles ahora
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {personas
                    .filter((p) => disponibleAhora(p) && !EN_GUARDIA_AHORA.has(p.id))
                    .slice(0, 6)
                    .map((p) => (
                      <li
                        key={p.id}
                        className="bg-status-ok-bg/30 flex items-center gap-2 rounded-lg p-2"
                      >
                        <Avatar name={`${p.nombre} ${p.apellido}`} src={p.fotoUrl} size={32} />
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-sm font-medium text-slate-900">
                            {p.apellido} {p.nombre[0]}.
                          </div>
                          <div className="truncate text-xs text-slate-600">
                            {fmtJerarquia(p.jerarquia)}
                          </div>
                        </div>
                        <Badge intent="ok">Listo</Badge>
                      </li>
                    ))}
                  {personas.filter((p) => disponibleAhora(p) && !EN_GUARDIA_AHORA.has(p.id))
                    .length > 6 && (
                    <li className="text-center text-xs text-slate-500">
                      +
                      {personas.filter((p) => disponibleAhora(p) && !EN_GUARDIA_AHORA.has(p.id))
                        .length - 6}{' '}
                      más
                    </li>
                  )}
                </ul>
              </CardContent>
            </Card>

            {/* En licencia / no disponibles */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock size={18} className="text-status-warn-fg" />
                  No disponibles
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {personas
                    .filter((p) => p.estado === 'licencia' || detectarAlertasPersona(p).length > 0)
                    .slice(0, 6)
                    .map((p) => (
                      <li
                        key={p.id}
                        className="bg-status-warn-bg/30 flex items-center gap-2 rounded-lg p-2"
                      >
                        <Avatar name={`${p.nombre} ${p.apellido}`} src={p.fotoUrl} size={32} />
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-sm font-medium text-slate-900">
                            {p.apellido} {p.nombre[0]}.
                          </div>
                          <div className="truncate text-xs text-slate-600">
                            {p.estado === 'licencia' ? 'Licencia' : 'Alertas pendientes'}
                          </div>
                        </div>
                        <Badge intent="warn">
                          {p.estado === 'licencia' ? 'Licencia' : 'Alerta'}
                        </Badge>
                      </li>
                    ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          <Card className="border-slate-200 bg-slate-50">
            <CardContent className="flex items-start gap-3 p-4 text-sm text-slate-600">
              <Sparkles size={18} className="mt-0.5 shrink-0 text-slate-400" />
              <div>
                <strong className="text-slate-900">IA proactiva:</strong> si un turno queda sin
                cubrir, Faro propone candidatos en función de disponibilidad, cercanía geográfica,
                horas trabajadas en el mes y cursos vigentes. La asignación final siempre la valida
                un jefe.
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ───────── RANKING ───────── */}
        <TabsContent value="ranking" className="space-y-4">
          <Card className="bg-brand-50/60 border-brand-100">
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-start gap-3">
                <div className="bg-brand-600 grid h-10 w-10 shrink-0 place-items-center rounded-xl text-white">
                  <Medal size={20} />
                </div>
                <div className="flex-1">
                  <div className="text-brand-900 font-semibold">
                    Top 10 del mes · {ranking.length > 0 && ranking[0]?.horas} hs el más alto
                  </div>
                  <p className="text-brand-900/80 text-sm">
                    Ordenado por horas totales y servicios. No reemplaza la evaluación cualitativa
                    de cada jefe pero ayuda a reconocer compromiso.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-0">
              <ul className="divide-y divide-slate-100">
                {ranking.map((r, idx) => {
                  const medal =
                    idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `${idx + 1}`;
                  const horasMax = ranking[0]?.horas ?? 1;
                  const porc = Math.round((r.horas / horasMax) * 100);
                  return (
                    <li key={r.persona.id} className="flex items-center gap-3 p-3 sm:p-4">
                      <div
                        className={cn(
                          'grid h-10 w-10 shrink-0 place-items-center rounded-lg text-sm font-bold',
                          idx < 3 ? 'bg-amber-100 text-amber-900' : 'bg-slate-100 text-slate-600',
                        )}
                      >
                        {medal}
                      </div>
                      <Avatar
                        name={`${r.persona.nombre} ${r.persona.apellido}`}
                        src={r.persona.fotoUrl}
                        size={40}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="truncate font-semibold text-slate-900">
                          {r.persona.apellido}, {r.persona.nombre}
                        </div>
                        <div className="truncate text-xs text-slate-500">
                          {fmtJerarquia(r.persona.jerarquia)} · {r.persona.funcion}
                        </div>
                        <div className="mt-1.5 flex items-center gap-2">
                          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                            <div
                              className="bg-brand-500 h-full rounded-full"
                              style={{ width: `${porc}%` }}
                            />
                          </div>
                          <span className="text-xs font-medium text-slate-600">{porc}%</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-sm font-bold text-slate-900">
                          <Clock size={14} className="text-slate-400" />
                          {r.horas} hs
                        </div>
                        <div className="flex items-center gap-1 text-xs text-slate-600">
                          <Flame size={12} className="text-fire-600" />
                          {r.servicios} servicios
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </CardContent>
          </Card>

          <Card className="border-slate-200 bg-slate-50">
            <CardContent className="flex items-start gap-3 p-4 text-sm text-slate-600">
              <TrendingUp size={18} className="mt-0.5 shrink-0 text-slate-400" />
              <div>
                <strong className="text-slate-900">Próximamente:</strong> ranking por categoría
                (jefatura, suboficiales, tropa, cadetes), evolución mensual con sparklines, y badges
                automáticos (más servicios, más cursos, mejor asistencia).
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
