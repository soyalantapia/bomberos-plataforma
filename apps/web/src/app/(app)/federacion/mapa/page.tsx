'use client';

import { motion } from 'framer-motion';
import { AlertTriangle, CheckCircle2, Download, Flame, Map as MapIcon, Users } from 'lucide-react';
import { useMemo, useState } from 'react';

import { Badge, Button, Card, CardContent, Kpi, cn, useToast } from '@faro/ui';

import { PageHero } from '../../../../components/shared/page-hero';
import { MapView } from '../../../../components/shared/map-view';
import { REGIONES_FEDERACION } from '../../../../data/cuarteles';
import { useFaroStore } from '../../../../store/use-faro-store';
import { mesKey } from '../../../../lib/utils/date';
import { demoToday } from '../../../../lib/utils/demo-today';

interface CuartelProvincial {
  id: string;
  nombre: string;
  region: string;
  lat: number;
  lng: number;
  voluntarios: number;
  serviciosMes: number;
  cumplimiento: number;
  estado: 'ok' | 'warn' | 'risk';
  alertas: number;
}

export default function MapaFederacionPage() {
  const toast = useToast();
  const cuarteles = useFaroStore((s) => s.cuarteles);
  const personas = useFaroStore((s) => s.personas);
  const servicios = useFaroStore((s) => s.servicios);
  const [filtroRegion, setFiltroRegion] = useState<'todas' | string>('todas');
  const periodo = mesKey(demoToday());

  const CUARTELES = useMemo<CuartelProvincial[]>(
    () =>
      cuarteles.map((c) => {
        const voluntarios = personas.filter(
          (p) => p.cuartelId === c.id && p.estado === 'activo',
        ).length;
        const serviciosMes = servicios.filter(
          (s) => s.cuartelId === c.id && s.horaSalida.startsWith(periodo),
        ).length;
        const estado: CuartelProvincial['estado'] =
          c.cumplimiento === 'ok' ? 'ok' : c.cumplimiento === 'warn' ? 'warn' : 'risk';
        const alertas =
          estado === 'risk'
            ? Math.max(1, Math.round((100 - c.porcentajeRendicion) / 10))
            : estado === 'warn'
              ? Math.max(1, Math.round((100 - c.porcentajeRendicion) / 15))
              : 0;
        return {
          id: c.id,
          nombre: c.nombre,
          region: c.region,
          lat: c.lat,
          lng: c.lng,
          voluntarios,
          serviciosMes,
          cumplimiento: c.porcentajeRendicion,
          estado,
          alertas,
        };
      }),
    [cuarteles, personas, servicios, periodo],
  );

  const filtrados =
    filtroRegion === 'todas' ? CUARTELES : CUARTELES.filter((c) => c.region === filtroRegion);

  const total = CUARTELES.length;
  const ok = CUARTELES.filter((c) => c.estado === 'ok').length;
  const warn = CUARTELES.filter((c) => c.estado === 'warn').length;
  const risk = CUARTELES.filter((c) => c.estado === 'risk').length;
  const voluntariosTotal = CUARTELES.reduce((a, c) => a + c.voluntarios, 0);
  const serviciosMes = CUARTELES.reduce((a, c) => a + c.serviciosMes, 0);
  const cumplimientoProm = CUARTELES.length
    ? Math.round(CUARTELES.reduce((a, c) => a + c.cumplimiento, 0) / CUARTELES.length)
    : 0;

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <PageHero
        objetivo="Federación Bonaerense · Mapa provincial"
        titulo={`${total} cuarteles en la provincia`}
        descripcion="Toda la red de bomberos voluntarios de la Provincia de Buenos Aires en el mapa. Tocá una región para filtrar."
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
          center={{ lat: -36.7, lng: -60 }}
          zoom={6}
          fitToPins
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
        <CardContent className="p-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold uppercase text-slate-500">Región</span>
            <span className="text-xs text-slate-500">{filtrados.length} cuarteles</span>
          </div>
          <div className="-mx-1 mt-2 flex gap-1.5 overflow-x-auto px-1">
            {(['todas', ...REGIONES_FEDERACION] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setFiltroRegion(r)}
                className={cn(
                  'shrink-0 whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium transition-colors',
                  filtroRegion === r
                    ? 'bg-brand-600 text-white'
                    : 'bg-white text-slate-700 ring-1 ring-slate-200',
                )}
              >
                {r === 'todas' ? 'Todas' : r}
              </button>
            ))}
          </div>
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
                      <td className="px-3 py-2.5 text-center text-xs text-slate-600">{c.region}</td>
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
              Federación: capacitación, intercambio de personal, préstamo de equipo. Click en el
              cuartel para abrir su ficha y proponer acciones.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
