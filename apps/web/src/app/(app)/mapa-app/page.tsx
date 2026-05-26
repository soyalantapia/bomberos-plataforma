'use client';

import Link from 'next/link';

import { Badge, Card, CardContent, Kpi } from '@faro/ui';

import { PageHero } from '../../../components/shared/page-hero';
import { Icon } from '../../../components/shell/icon';
import { navByPerfil } from '../../../components/shell/nav-config';
import { perfilLabel } from '../../../lib/utils/perfil';

const PERFIL_ICONS = {
  bombero: 'flame',
  mando: 'layout-dashboard',
  administrativo: 'users',
  gobierno: 'building-2',
  federacion: 'globe-2',
} as const;

const PERFIL_COLORS = {
  bombero: 'bg-fire-600',
  mando: 'bg-brand-700',
  administrativo: 'bg-status-warn',
  gobierno: 'bg-status-risk',
  federacion: 'bg-purple-600',
} as const;

export default function MapaAppPage() {
  const perfiles = Object.keys(navByPerfil) as Array<keyof typeof navByPerfil>;
  const totalPaginas = perfiles.reduce((acc, p) => acc + navByPerfil[p].length, 0);

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <PageHero
        objetivo="Mapa de la aplicación"
        titulo="Todas las pantallas de Faro"
        descripcion={`${totalPaginas} pantallas distribuidas en 5 perfiles. Click para abrir.`}
        icono={<Icon name="layout-dashboard" size={26} />}
        meta={
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
            {perfiles.map((p) => (
              <Kpi
                key={p}
                label={perfilLabel[p]}
                value={navByPerfil[p].length}
                hint="pantallas"
                intent="brand"
              />
            ))}
          </div>
        }
      />

      {perfiles.map((perfil) => {
        const items = navByPerfil[perfil];
        const seccions = new Set(items.map((i) => i.seccion ?? 'Principal'));
        const color = PERFIL_COLORS[perfil];
        return (
          <Card key={perfil}>
            <CardContent className="p-5">
              <div className="mb-3 flex items-center gap-3">
                <div className={`grid h-10 w-10 place-items-center rounded-xl text-white ${color}`}>
                  <Icon name={PERFIL_ICONS[perfil]} size={18} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{perfilLabel[perfil]}</h3>
                  <p className="text-xs text-slate-500">
                    {items.length} pantallas · {seccions.size} secciones
                  </p>
                </div>
              </div>

              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href as never}
                    className="hover:border-brand-300 group flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-3 transition-colors"
                  >
                    <Icon
                      name={item.icon}
                      size={16}
                      className="group-hover:text-brand-700 text-slate-500"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium text-slate-900">
                        {item.label}
                      </div>
                      <div className="truncate font-mono text-[10px] text-slate-500">
                        {item.href}
                      </div>
                    </div>
                    {item.nuevo && <Badge intent="risk">Nuevo</Badge>}
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })}

      <Card className="border-slate-200 bg-slate-50">
        <CardContent className="p-4 text-sm text-slate-600">
          <strong className="text-slate-900">Tip:</strong> en cada perfil tenés el menú completo con
          las pantallas distribuidas por sección. Las marcadas como{' '}
          <Badge intent="risk">Nuevo</Badge> son las funcionalidades recién agregadas: cumplimiento
          legal Argentina, móviles en vivo, comando de incidentes, parte de servicio, capacidades,
          aptitud médica, uniforme, hidrantes, WhatsApp, avisos masivos, federación, asistente con
          voz, trabajo sin internet.
        </CardContent>
      </Card>
    </div>
  );
}
