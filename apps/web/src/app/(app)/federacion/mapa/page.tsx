'use client';

import { motion } from 'framer-motion';
import { AlertTriangle, CheckCircle2, Download, Flame, Map as MapIcon, Users } from 'lucide-react';
import { useState } from 'react';

import { Badge, Button, Card, CardContent, Kpi, cn, useToast } from '@faro/ui';

import { PageHero } from '../../../../components/shared/page-hero';
import { MapView } from '../../../../components/shared/map-view';

interface CuartelProvincial {
  id: string;
  nombre: string;
  region: 'norte' | 'sur' | 'este' | 'oeste';
  lat: number;
  lng: number;
  voluntarios: number;
  serviciosMes: number;
  cumplimiento: number;
  estado: 'ok' | 'warn' | 'risk';
  alertas: number;
}

const CUARTELES: CuartelProvincial[] = [
  {
    id: 'c-vb',
    nombre: 'Villa Ballester',
    region: 'norte',
    lat: -34.5476,
    lng: -58.5556,
    voluntarios: 38,
    serviciosMes: 21,
    cumplimiento: 87,
    estado: 'ok',
    alertas: 2,
  },
  {
    id: 'c-sa',
    nombre: 'San Andrés',
    region: 'norte',
    lat: -34.5634,
    lng: -58.545,
    voluntarios: 31,
    serviciosMes: 18,
    cumplimiento: 92,
    estado: 'ok',
    alertas: 1,
  },
  {
    id: 'c-jls',
    nombre: 'José León Suárez',
    region: 'norte',
    lat: -34.5285,
    lng: -58.568,
    voluntarios: 24,
    serviciosMes: 15,
    cumplimiento: 78,
    estado: 'warn',
    alertas: 4,
  },
  {
    id: 'c-sm',
    nombre: 'San Martín Centro',
    region: 'norte',
    lat: -34.572,
    lng: -58.541,
    voluntarios: 52,
    serviciosMes: 34,
    cumplimiento: 95,
    estado: 'ok',
    alertas: 0,
  },
  {
    id: 'c-vd',
    nombre: 'Villa Devoto',
    region: 'oeste',
    lat: -34.59,
    lng: -58.51,
    voluntarios: 41,
    serviciosMes: 29,
    cumplimiento: 84,
    estado: 'ok',
    alertas: 3,
  },
  {
    id: 'c-li',
    nombre: 'Liniers',
    region: 'oeste',
    lat: -34.638,
    lng: -58.518,
    voluntarios: 27,
    serviciosMes: 22,
    cumplimiento: 65,
    estado: 'risk',
    alertas: 7,
  },
  {
    id: 'c-flo',
    nombre: 'Florida',
    region: 'norte',
    lat: -34.529,
    lng: -58.493,
    voluntarios: 33,
    serviciosMes: 19,
    cumplimiento: 88,
    estado: 'ok',
    alertas: 2,
  },
  {
    id: 'c-mu',
    nombre: 'Munro',
    region: 'norte',
    lat: -34.529,
    lng: -58.522,
    voluntarios: 29,
    serviciosMes: 16,
    cumplimiento: 71,
    estado: 'warn',
    alertas: 5,
  },
  {
    id: 'c-tig',
    nombre: 'Tigre',
    region: 'norte',
    lat: -34.426,
    lng: -58.581,
    voluntarios: 47,
    serviciosMes: 28,
    cumplimiento: 91,
    estado: 'ok',
    alertas: 1,
  },
  {
    id: 'c-pacheco',
    nombre: 'General Pacheco',
    region: 'norte',
    lat: -34.456,
    lng: -58.62,
    voluntarios: 25,
    serviciosMes: 12,
    cumplimiento: 60,
    estado: 'risk',
    alertas: 9,
  },
];

export default function MapaFederacionPage() {
  const toast = useToast();
  const [filtroRegion, setFiltroRegion] = useState<'todas' | CuartelProvincial['region']>('todas');

  const filtrados =
    filtroRegion === 'todas' ? CUARTELES : CUARTELES.filter((c) => c.region === filtroRegion);

  const total = CUARTELES.length;
  const ok = CUARTELES.filter((c) => c.estado === 'ok').length;
  const warn = CUARTELES.filter((c) => c.estado === 'warn').length;
  const risk = CUARTELES.filter((c) => c.estado === 'risk').length;
  const voluntariosTotal = CUARTELES.reduce((a, c) => a + c.voluntarios, 0);
  const serviciosMes = CUARTELES.reduce((a, c) => a + c.serviciosMes, 0);
  const cumplimientoProm = Math.round(
    CUARTELES.reduce((a, c) => a + c.cumplimiento, 0) / CUARTELES.length,
  );

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <PageHero
        objetivo="Vista Federación · Consolidados regionales"
        titulo={`${total} cuarteles · ${voluntariosTotal} voluntarios`}
        descripcion="Federación Bonaerense Conurbano Norte · datos en vivo desde Faro. Sin pedir Excel a cada cuartel."
        icono={<MapIcon size={26} />}
        meta={
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Kpi
              label="Cumplimiento"
              value={`${cumplimientoProm}%`}
              hint="promedio fed."
              intent={cumplimientoProm >= 85 ? 'ok' : cumplimientoProm >= 70 ? 'warn' : 'risk'}
            />
            <Kpi label="Voluntarios" value={voluntariosTotal} intent="brand" />
            <Kpi
              label="Servicios mes"
              value={serviciosMes}
              hint="consolidado"
              icon={<Flame size={16} />}
              intent="brand"
            />
            <Kpi
              label="Alertas críticas"
              value={risk}
              hint="cuarteles"
              intent={risk > 0 ? 'risk' : 'ok'}
            />
          </div>
        }
        acciones={
          <Button
            intent="primary"
            onClick={() =>
              toast.push({ kind: 'success', title: 'Reporte generado', description: 'PDF firmado' })
            }
          >
            <Download size={14} /> Reporte mensual
          </Button>
        }
      />

      {/* Mapa */}
      <Card className="overflow-hidden p-0">
        <MapView
          center={{ lat: -34.53, lng: -58.55 }}
          zoom={11}
          pins={filtrados.map((c) => ({
            id: c.id,
            lat: c.lat,
            lng: c.lng,
            color:
              c.estado === 'ok'
                ? 'bg-status-ok'
                : c.estado === 'warn'
                  ? 'bg-status-warn'
                  : 'bg-status-risk',
            label: '🏠',
            popup:
              '<strong>' +
              c.nombre +
              '</strong><div style="font-size:11px;color:#64748b">' +
              c.voluntarios +
              ' vol · ' +
              c.cumplimiento +
              '% cumplimiento</div>',
          }))}
        />
      </Card>

      {/* Filtros región */}
      <Card>
        <CardContent className="flex flex-wrap items-center gap-2 p-3">
          <span className="text-xs font-semibold uppercase text-slate-500">Región:</span>
          {(['todas', 'norte', 'oeste', 'sur', 'este'] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setFiltroRegion(r)}
              className={cn(
                'rounded-full px-3 py-1 text-xs font-medium transition-colors',
                filtroRegion === r
                  ? 'bg-brand-600 text-white'
                  : 'bg-white text-slate-700 ring-1 ring-slate-200',
              )}
            >
              {r === 'todas' ? 'Todas' : r.charAt(0).toUpperCase() + r.slice(1)}
            </button>
          ))}
          <span className="ml-auto text-xs text-slate-500">{filtrados.length} cuarteles</span>
        </CardContent>
      </Card>

      {/* Tabla rankeable */}
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700">
                    Cuartel
                  </th>
                  <th className="px-3 py-3 text-center text-xs font-semibold text-slate-700">
                    Región
                  </th>
                  <th className="px-3 py-3 text-center text-xs font-semibold text-slate-700">
                    Voluntarios
                  </th>
                  <th className="px-3 py-3 text-center text-xs font-semibold text-slate-700">
                    Servicios mes
                  </th>
                  <th className="px-3 py-3 text-center text-xs font-semibold text-slate-700">
                    Cumplimiento
                  </th>
                  <th className="px-3 py-3 text-center text-xs font-semibold text-slate-700">
                    Alertas
                  </th>
                </tr>
              </thead>
              <tbody>
                {[...filtrados]
                  .sort((a, b) => b.cumplimiento - a.cumplimiento)
                  .map((c, idx) => (
                    <motion.tr
                      key={c.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.03 }}
                      className="border-b border-slate-100 hover:bg-slate-50"
                    >
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-2">
                          {idx === 0 && <span className="text-base">🥇</span>}
                          {idx === 1 && <span className="text-base">🥈</span>}
                          {idx === 2 && <span className="text-base">🥉</span>}
                          <span className="font-medium text-slate-900">{c.nombre}</span>
                        </div>
                      </td>
                      <td className="px-3 py-2.5 text-center text-xs capitalize text-slate-600">
                        {c.region}
                      </td>
                      <td className="px-3 py-2.5 text-center font-mono">
                        <span className="text-slate-900">{c.voluntarios}</span>
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        <span className="text-slate-900">{c.serviciosMes}</span>
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        <div className="inline-flex items-center gap-2">
                          <div className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-100">
                            <div
                              className={cn(
                                'h-full',
                                c.cumplimiento >= 85
                                  ? 'bg-status-ok'
                                  : c.cumplimiento >= 70
                                    ? 'bg-status-warn'
                                    : 'bg-status-risk',
                              )}
                              style={{ width: `${c.cumplimiento}%` }}
                            />
                          </div>
                          <span className="font-bold tabular-nums">{c.cumplimiento}%</span>
                        </div>
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        {c.alertas > 0 ? (
                          <Badge intent={c.estado === 'risk' ? 'risk' : 'warn'}>{c.alertas}</Badge>
                        ) : (
                          <CheckCircle2 size={14} className="text-status-ok-fg mx-auto" />
                        )}
                      </td>
                    </motion.tr>
                  ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Estado consolidado */}
      <div className="grid gap-3 sm:grid-cols-3">
        <Card className="bg-status-ok-bg/30 border-status-ok/20 border-2">
          <CardContent className="p-4 text-center">
            <CheckCircle2 size={28} className="text-status-ok-fg mx-auto" />
            <div className="text-status-ok-fg mt-2 text-2xl font-bold">{ok}</div>
            <div className="text-status-ok-fg text-xs">cuarteles OK (≥85%)</div>
          </CardContent>
        </Card>
        <Card className="bg-status-warn-bg/30 border-status-warn/20 border-2">
          <CardContent className="p-4 text-center">
            <AlertTriangle size={28} className="text-status-warn-fg mx-auto" />
            <div className="text-status-warn-fg mt-2 text-2xl font-bold">{warn}</div>
            <div className="text-status-warn-fg text-xs">advertencias (70-85%)</div>
          </CardContent>
        </Card>
        <Card className="bg-status-risk-bg/30 border-status-risk/20 border-2">
          <CardContent className="p-4 text-center">
            <AlertTriangle size={28} className="text-status-risk-fg mx-auto" />
            <div className="text-status-risk-fg mt-2 text-2xl font-bold">{risk}</div>
            <div className="text-status-risk-fg text-xs">críticos (&lt;70%)</div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-brand-50/40 border-brand-100">
        <CardContent className="flex items-start gap-3 p-4">
          <div className="bg-brand-600 grid h-10 w-10 shrink-0 place-items-center rounded-xl text-white">
            <Users size={18} />
          </div>
          <div className="text-sm">
            <div className="text-brand-900 font-semibold">Tip Federación</div>
            <p className="text-brand-900/80 mt-0.5">
              Para los cuarteles en estado crítico, podés ofrecer apoyo logístico desde la
              federación: capacitación, intercambio de personal, préstamo de equipo. Click en el
              cuartel para abrir su ficha y proponer acciones.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
