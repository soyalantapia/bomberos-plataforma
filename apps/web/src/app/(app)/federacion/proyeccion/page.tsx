'use client';

import { Card, CardContent, Kpi } from '@faro/ui';
import { TrendingUp } from 'lucide-react';
import { useMemo } from 'react';

import { proyeccionRed, totalRed } from '../../../../components/federacion/finanzas-utils';
import { ars, arsCompact } from '../../../../components/finanzas/utils';
import { PageHero } from '../../../../components/shared/page-hero';

export default function ProyeccionRedPage() {
  const proy = useMemo(() => proyeccionRed(), []);
  const otorgado = totalRed.otorgado;
  const ejecutado = totalRed.ejecutado;
  const pctProyEjec = otorgado > 0 ? (proy.proyEjec / otorgado) * 100 : 0;
  const pctEjecHoy = otorgado > 0 ? (ejecutado / otorgado) * 100 : 0;
  const pctDevolver = otorgado > 0 ? (proy.proyDevolver / otorgado) * 100 : 0;
  const totalCuarteles = proy.llegan + proy.noLlegan;

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <PageHero
        objetivo="Federación Bonaerense · proyección de ejecución"
        titulo={`A este ritmo, la red devuelve ${arsCompact(proy.proyDevolver)}`}
        descripcion="Si los cuarteles siguen ejecutando al ritmo actual, esto es lo que se aprovecha y lo que se pierde al cerrar el plazo. Cada peso devuelto es una inversión que no se hizo."
        icono={<TrendingUp size={26} />}
        variant={proy.proyDevolver > 0 ? 'critical' : 'success'}
        meta={
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Kpi
              label="Se proyecta ejecutar"
              value={arsCompact(proy.proyEjec)}
              hint={`${pctProyEjec.toFixed(0)}%`}
              intent="ok"
            />
            <Kpi
              label="Se proyecta devolver"
              value={arsCompact(proy.proyDevolver)}
              intent={proy.proyDevolver > 0 ? 'risk' : 'ok'}
            />
            <Kpi
              label="Cuarteles que llegan"
              value={proy.llegan}
              hint={`de ${totalCuarteles}`}
              intent="ok"
            />
            <Kpi
              label="No llegan"
              value={proy.noLlegan}
              intent={proy.noLlegan > 0 ? 'warn' : 'ok'}
            />
          </div>
        }
      />

      {/* Barra de proyección */}
      <Card>
        <CardContent className="p-5">
          <h3 className="mb-1 font-bold text-slate-900">Cómo cierra el plazo</h3>
          <p className="mb-4 text-sm text-slate-600">
            De los {ars.format(otorgado)} otorgados a la red.
          </p>
          <div className="flex h-9 overflow-hidden rounded-lg">
            <div
              className="bg-status-ok grid place-items-center text-[11px] font-bold text-white"
              style={{ width: `${Math.max(4, pctEjecHoy)}%` }}
              title={`Ya ejecutado: ${ars.format(ejecutado)}`}
            >
              {pctEjecHoy >= 12 ? `${pctEjecHoy.toFixed(0)}%` : ''}
            </div>
            <div
              className="bg-status-ok/40 grid place-items-center text-[11px] font-bold text-slate-700"
              style={{ width: `${Math.max(0, pctProyEjec - pctEjecHoy)}%` }}
              title="Proyectado a ejecutar"
            />
            <div
              className="bg-status-risk grid place-items-center text-[11px] font-bold text-white"
              style={{ width: `${Math.max(4, pctDevolver)}%` }}
              title={`Se devuelve: ${ars.format(proy.proyDevolver)}`}
            >
              {pctDevolver >= 12 ? `${pctDevolver.toFixed(0)}%` : ''}
            </div>
          </div>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600">
            <span className="flex items-center gap-1.5">
              <span className="bg-status-ok h-2.5 w-2.5 rounded-full" /> Ejecutado hoy (
              {arsCompact(ejecutado)})
            </span>
            <span className="flex items-center gap-1.5">
              <span className="bg-status-ok/40 h-2.5 w-2.5 rounded-full" /> Se proyecta ejecutar
            </span>
            <span className="flex items-center gap-1.5">
              <span className="bg-status-risk h-2.5 w-2.5 rounded-full" /> Se devuelve (
              {arsCompact(proy.proyDevolver)})
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Cuarteles que no llegan */}
      <Card>
        <CardContent className="p-5">
          <h3 className="font-bold text-slate-900">¿Llegan los cuarteles?</h3>
          <p className="mt-1 text-sm text-slate-600">
            <strong className="text-status-ok-fg">{proy.llegan}</strong> cuarteles van a aprovechar
            casi todo su subsidio. <strong className="text-status-warn-fg">{proy.noLlegan}</strong>{' '}
            no llegan al ritmo actual y van a devolver plata si nadie los apura.
          </p>
          <div className="mt-3 flex h-3 overflow-hidden rounded-full bg-slate-100">
            <div
              className="bg-status-ok h-full"
              style={{ width: `${totalCuarteles > 0 ? (proy.llegan / totalCuarteles) * 100 : 0}%` }}
            />
            <div
              className="bg-status-warn h-full"
              style={{
                width: `${totalCuarteles > 0 ? (proy.noLlegan / totalCuarteles) * 100 : 0}%`,
              }}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-brand-100 from-brand-50 bg-gradient-to-br to-white">
        <CardContent className="flex items-start gap-3 p-4 text-sm text-slate-700">
          <TrendingUp size={18} className="text-brand-600 mt-0.5 shrink-0" />
          <div>
            <strong className="text-slate-900">Cómo se calcula:</strong> proyectamos la ejecución
            final de cada subsidio al ritmo que lleva hasta hoy contra su plazo. No es una
            calificación de los cuarteles — es cuánta inversión queda sin hacer si nada cambia.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
