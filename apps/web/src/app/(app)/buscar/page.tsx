'use client';

import {
  ArrowRight,
  ChevronRight,
  FileText,
  Flame,
  Search as SearchIcon,
  Sparkles,
  Truck,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';

import type { Persona, Servicio, Movil } from '@faro/types';

import { Avatar, Badge, Card, CardContent, Input, cn } from '@faro/ui';

import { PageHero } from '../../../components/shared/page-hero';
import { useFaroStore, selectCuartelActivo } from '../../../store/use-faro-store';
import { fmtFechaHora } from '../../../lib/utils/date';
import { fmtJerarquia } from '../../../lib/utils/jerarquia';
import { tipoServicioLabel } from '../../../lib/utils/tipo-servicio';

const EJEMPLOS_NLP = [
  'quién tiene rescate vehicular vigente',
  'servicios de incendio en mayo',
  'qué móvil tiene VTV por vencer',
  'cadetes activos hoy',
  'reglamento sobre uniforme',
];

export default function BuscarPage() {
  const cuartel = useFaroStore(selectCuartelActivo);
  const personas = useFaroStore((s) => s.personas);
  const servicios = useFaroStore((s) => s.servicios);
  const moviles = useFaroStore((s) => s.moviles);
  const [q, setQ] = useState('');

  const resultados = useMemo(() => {
    if (q.trim().length < 2) return null;
    const qq = q.toLowerCase();

    // F25 audit · filtrar por cuartel activo para no mezclar entre cuarteles
    const cuartelId = cuartel?.id;
    const personasMatch = personas
      .filter((p) => {
        if (cuartelId && p.cuartelId !== cuartelId) return false;
        const hay =
          `${p.nombre} ${p.apellido} ${p.legajo} ${p.funcion} ${p.email} ${p.cursos.map((c) => c.nombre).join(' ')}`.toLowerCase();
        return hay.includes(qq);
      })
      .slice(0, 6);

    const serviciosMatch = servicios
      .filter((s) => {
        if (cuartelId && s.cuartelId !== cuartelId) return false;
        return `${tipoServicioLabel[s.tipo]} ${s.direccion}`.toLowerCase().includes(qq);
      })
      .slice(0, 4);

    const movilesMatch = moviles
      .filter((m) => {
        if (cuartelId && m.cuartelId !== cuartelId) return false;
        return `${m.codigo} ${m.tipo} ${m.marca} ${m.modelo} ${m.dominio}`
          .toLowerCase()
          .includes(qq);
      })
      .slice(0, 3);

    const docsMatch =
      qq.includes('reglamento') || qq.includes('manual') || qq.includes('protocolo')
        ? [
            {
              tipo: 'doc',
              titulo: 'Reglamento interno · v2024',
              cuerpo: '"Toda persona en servicio debe portar uniforme reglamentario..."',
            },
            {
              tipo: 'doc',
              titulo: 'Protocolo de uniformes',
              cuerpo: '"Componentes obligatorios del uniforme operativo..."',
            },
          ]
        : [];

    return {
      personas: personasMatch,
      servicios: serviciosMatch,
      moviles: movilesMatch,
      docs: docsMatch,
    };
  }, [q, personas, servicios, moviles, cuartel?.id]);

  const totalResultados = resultados
    ? resultados.personas.length +
      resultados.servicios.length +
      resultados.moviles.length +
      resultados.docs.length
    : 0;

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <PageHero
        objetivo="Búsqueda global · IA"
        titulo="Preguntale a Faro en lenguaje natural"
        descripcion="Buscás personas, servicios, móviles, documentos. La IA entiende preguntas tipo 'quién tiene rescate vehicular vigente esta noche'."
        icono={<SearchIcon size={26} />}
      />

      <Card className="border-brand-200 from-brand-50 border-2 bg-gradient-to-br to-white">
        <CardContent className="p-5">
          <div className="mb-3 flex items-center gap-2">
            <Sparkles size={18} className="text-brand-600" />
            <span className="font-bold text-slate-900">
              Buscar en {cuartel?.nombre ?? 'la organización'}
            </span>
            <Badge intent="brand">IA NLP</Badge>
          </div>
          <div className="relative">
            <SearchIcon
              size={18}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"
            />
            <Input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder='Ej: "quién tiene rescate vehicular vigente y está disponible"'
              className="border-2 pl-10 text-base"
            />
          </div>
          {q.length < 2 && (
            <div className="mt-3">
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Probá con estas:
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {EJEMPLOS_NLP.map((e) => (
                  <button
                    key={e}
                    type="button"
                    onClick={() => setQ(e)}
                    className="hover:bg-brand-50 hover:text-brand-700 rounded-full bg-white px-2.5 py-1 text-xs text-slate-700 ring-1 ring-slate-200"
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {q.trim().length >= 2 && (
        <div className="space-y-4">
          <div className="text-xs text-slate-500">
            {totalResultados === 0
              ? `Sin resultados para "${q}"`
              : `${totalResultados} resultado${totalResultados === 1 ? '' : 's'} para "${q}"`}
          </div>

          {resultados?.personas.length ? (
            <ResultGroup
              icon={<Users size={16} />}
              titulo="Personas"
              count={resultados.personas.length}
            >
              {resultados.personas.map((p) => (
                <PersonaRow key={p.id} p={p} />
              ))}
            </ResultGroup>
          ) : null}

          {resultados?.servicios.length ? (
            <ResultGroup
              icon={<Flame size={16} />}
              titulo="Servicios"
              count={resultados.servicios.length}
            >
              {resultados.servicios.map((s) => (
                <ServicioRow key={s.id} s={s} />
              ))}
            </ResultGroup>
          ) : null}

          {resultados?.moviles.length ? (
            <ResultGroup
              icon={<Truck size={16} />}
              titulo="Móviles"
              count={resultados.moviles.length}
            >
              {resultados.moviles.map((m) => (
                <MovilRow key={m.id} m={m} />
              ))}
            </ResultGroup>
          ) : null}

          {resultados?.docs.length ? (
            <ResultGroup
              icon={<FileText size={16} />}
              titulo="Documentos · búsqueda semántica"
              count={resultados.docs.length}
            >
              {resultados.docs.map((d, idx) => (
                <Link
                  key={idx}
                  href="/administrativo/documentos"
                  className="flex items-start gap-3 rounded-lg p-3 hover:bg-slate-50"
                >
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-slate-100">
                    <FileText size={16} className="text-slate-700" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-slate-900">{d.titulo}</div>
                    <div className="mt-0.5 line-clamp-1 text-xs italic text-slate-600">
                      {d.cuerpo}
                    </div>
                  </div>
                  <ChevronRight size={16} className="shrink-0 text-slate-500" />
                </Link>
              ))}
            </ResultGroup>
          ) : null}

          {totalResultados === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <SearchIcon size={32} className="mx-auto text-slate-300" />
                <p className="mt-2 text-sm text-slate-500">
                  No hay coincidencias. Probá con otra pregunta o palabras clave.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

function ResultGroup({
  icon,
  titulo,
  count,
  children,
}: {
  icon: React.ReactNode;
  titulo: string;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardContent className="p-0">
        <div className="flex items-center gap-2 border-b border-slate-100 px-4 py-3">
          <div className="text-slate-500">{icon}</div>
          <span className="text-sm font-bold text-slate-900">{titulo}</span>
          <Badge intent="brand" className="ml-auto">
            {count}
          </Badge>
        </div>
        <div className="divide-y divide-slate-50">{children}</div>
      </CardContent>
    </Card>
  );
}

function PersonaRow({ p }: { p: Persona }) {
  return (
    <Link
      href={`/administrativo/personas/${p.id}` as never}
      className="flex items-center gap-3 p-3 hover:bg-slate-50"
    >
      <Avatar name={`${p.nombre} ${p.apellido}`} size={36} />
      <div className="min-w-0 flex-1">
        <div className="font-medium text-slate-900">
          {p.nombre} {p.apellido}
        </div>
        <div className="mt-0.5 text-xs text-slate-600">
          {fmtJerarquia(p.jerarquia)} · Legajo {p.legajo}
        </div>
      </div>
      <ArrowRight size={14} className="shrink-0 text-slate-500" />
    </Link>
  );
}

function ServicioRow({ s }: { s: Servicio }) {
  return (
    <Link href="/mando/operaciones" className="flex items-center gap-3 p-3 hover:bg-slate-50">
      <div
        className={cn(
          'grid h-10 w-10 shrink-0 place-items-center rounded-lg text-white',
          s.tipo === 'incendio'
            ? 'bg-status-risk'
            : s.tipo === 'rescate'
              ? 'bg-status-warn'
              : 'bg-slate-500',
        )}
      >
        <Flame size={16} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="font-medium text-slate-900">
          {tipoServicioLabel[s.tipo]} · {s.direccion}
        </div>
        <div className="mt-0.5 text-xs text-slate-600">{fmtFechaHora(s.horaSalida)}</div>
      </div>
      <ArrowRight size={14} className="shrink-0 text-slate-500" />
    </Link>
  );
}

function MovilRow({ m }: { m: Movil }) {
  return (
    <Link href="/mando/automotores" className="flex items-center gap-3 p-3 hover:bg-slate-50">
      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-slate-900 text-white">
        <Truck size={16} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="font-bold text-slate-900">{m.codigo}</div>
        <div className="mt-0.5 text-xs capitalize text-slate-600">
          {m.tipo} · {m.marca} {m.modelo}
        </div>
      </div>
      <span className="font-mono text-[10px] text-slate-500">{m.dominio}</span>
    </Link>
  );
}
