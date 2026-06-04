'use client';

import { Search } from 'lucide-react';
import { useMemo, useState } from 'react';

import {
  Badge,
  Card,
  CardContent,
  Input,
  Kpi,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  cn,
} from '@faro/ui';

import { PageHero } from '../shared/page-hero';

interface ListItem {
  titulo: string;
  cuerpo?: string;
  badge?: { label: string; intent?: 'ok' | 'warn' | 'risk' | 'neutral' | 'brand' | 'fire' };
  icon?: React.ReactNode;
  meta?: React.ReactNode;
  onClick?: () => void;
}

interface SimpleKpi {
  label: string;
  value: string | number;
  hint?: string;
  intent?: 'ok' | 'warn' | 'risk' | 'brand' | 'neutral';
  icon?: React.ReactNode;
}

export interface SimplePageProps {
  title: string;
  description: string;
  objetivo?: string;
  icono?: React.ReactNode;
  intro?: { titulo: string; cuerpo: string };
  kpis?: SimpleKpi[];
  acciones?: React.ReactNode;
  searchable?: boolean;
  tabs: { value: string; label: string; items: ListItem[]; emptyText?: string }[];
  variant?: 'default' | 'critical' | 'success';
}

export function SimplePage({
  title,
  description,
  objetivo,
  icono,
  intro,
  kpis,
  acciones,
  searchable = false,
  tabs,
  variant,
}: SimplePageProps) {
  const [tab, setTab] = useState(tabs[0]?.value ?? '');
  const [search, setSearch] = useState('');

  const tabActiva = tabs.find((t) => t.value === tab);

  const itemsFiltrados = useMemo(() => {
    if (!tabActiva) return [];
    if (!searchable || search.trim().length === 0) return tabActiva.items;
    const q = search.toLowerCase();
    return tabActiva.items.filter(
      (it) => it.titulo.toLowerCase().includes(q) || (it.cuerpo ?? '').toLowerCase().includes(q),
    );
  }, [tabActiva, search, searchable]);

  const totalItems = tabs.reduce((acc, t) => acc + t.items.length, 0);

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <PageHero
        objetivo={objetivo ?? title}
        titulo={title}
        descripcion={description}
        icono={icono}
        acciones={acciones}
        variant={variant}
        meta={
          kpis && kpis.length > 0 ? (
            <div
              className={cn(
                'grid gap-2',
                kpis.length === 2 && 'grid-cols-2',
                kpis.length === 3 && 'grid-cols-3',
                kpis.length >= 4 && 'grid-cols-2 sm:grid-cols-4',
              )}
            >
              {kpis.map((k, idx) => (
                <Kpi
                  key={idx}
                  label={k.label}
                  value={k.value}
                  hint={k.hint}
                  intent={k.intent}
                  icon={k.icon}
                />
              ))}
            </div>
          ) : undefined
        }
      />

      {intro && (
        <Card className="bg-brand-50 border-brand-100">
          <CardContent className="p-4 sm:p-5">
            <div className="text-brand-900 font-semibold">{intro.titulo}</div>
            <p className="text-brand-900/80 mt-1 text-sm">{intro.cuerpo}</p>
          </CardContent>
        </Card>
      )}

      <Tabs value={tab} onChange={setTab}>
        <TabsList>
          {tabs.map((t) => (
            <TabsTrigger key={t.value} value={t.value}>
              {t.label}
              {t.items.length > 0 && (
                <span className="ml-1.5 rounded-full bg-slate-100 px-1.5 py-0.5 text-[11px] tabular-nums text-slate-600">
                  {t.items.length}
                </span>
              )}
            </TabsTrigger>
          ))}
        </TabsList>

        {tabs.map((t) => (
          <TabsContent key={t.value} value={t.value}>
            {searchable && t.items.length > 5 && (
              <div className="relative mb-3">
                <Search
                  size={14}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={`Buscar en ${t.label.toLowerCase()}...`}
                  className="pl-9"
                />
              </div>
            )}

            <Card>
              <CardContent className="p-0">
                {itemsFiltrados.length === 0 ? (
                  <div className="p-6 text-center text-sm text-slate-500">
                    {search.length > 0
                      ? `Sin resultados para "${search}".`
                      : (t.emptyText ?? 'Sin elementos.')}
                  </div>
                ) : (
                  <ul className="divide-y divide-slate-100">
                    {itemsFiltrados.map((it, i) => (
                      <li
                        key={i}
                        className={cn(
                          'flex items-start gap-3 p-4',
                          it.onClick && 'cursor-pointer hover:bg-slate-50',
                        )}
                        onClick={it.onClick}
                      >
                        {it.icon && (
                          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-slate-100 text-slate-600">
                            {it.icon}
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="font-medium text-slate-900">{it.titulo}</div>
                          {it.cuerpo && (
                            <div className="mt-0.5 text-sm text-slate-600">{it.cuerpo}</div>
                          )}
                          {it.meta && <div className="mt-1.5">{it.meta}</div>}
                        </div>
                        {it.badge && (
                          <Badge intent={it.badge.intent ?? 'neutral'}>{it.badge.label}</Badge>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>

            {searchable && search.length === 0 && totalItems > 10 && (
              <p className="mt-2 text-xs text-slate-500">
                {t.items.length} elemento{t.items.length === 1 ? '' : 's'} en{' '}
                {t.label.toLowerCase()}.
              </p>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
