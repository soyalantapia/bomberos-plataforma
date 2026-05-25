'use client';

import { motion } from 'framer-motion';
import {
  AlertTriangle,
  ArrowRightLeft,
  Check,
  ChevronRight,
  Database,
  Loader2,
  Plus,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  Upload,
  X,
} from 'lucide-react';
import { useState } from 'react';

import { Badge, Button, Card, CardContent, Kpi, cn, useToast } from '@faro/ui';

import { PageHero } from '../../../../components/shared/page-hero';

type Estado = 'idle' | 'comparando' | 'preview' | 'aplicando' | 'exito';

interface DiffItem {
  id: string;
  legajo: string;
  nombre: string;
  apellido: string;
  tipo: 'nuevo' | 'actualizado' | 'sin_cambios' | 'conflicto';
  campos?: { campo: string; rubaValor: string; faroValor: string }[];
}

const DIFF_DEMO: DiffItem[] = [
  {
    id: 'd-1',
    legajo: '0301',
    nombre: 'Mauro',
    apellido: 'Esquivel',
    tipo: 'nuevo',
  },
  {
    id: 'd-2',
    legajo: '0302',
    nombre: 'Romina',
    apellido: 'Vázquez',
    tipo: 'nuevo',
  },
  {
    id: 'd-3',
    legajo: '0017',
    nombre: 'Mariana',
    apellido: 'Pereyra',
    tipo: 'actualizado',
    campos: [
      { campo: 'Teléfono', rubaValor: '+54 11 5555 0017', faroValor: '+54 11 5555 0099' },
      { campo: 'Email', rubaValor: 'm.pereyra@ruba.org', faroValor: 'pereyra@faro.bvvb.org.ar' },
    ],
  },
  {
    id: 'd-4',
    legajo: '0078',
    nombre: 'Carolina',
    apellido: 'Sosa',
    tipo: 'actualizado',
    campos: [{ campo: 'Jerarquía', rubaValor: 'Cabo', faroValor: 'Sargento' }],
  },
  {
    id: 'd-5',
    legajo: '0156',
    nombre: 'Sebastián',
    apellido: 'Ruiz',
    tipo: 'conflicto',
    campos: [{ campo: 'Fecha alta', rubaValor: '2018-03-15', faroValor: '2019-01-10' }],
  },
  {
    id: 'd-6',
    legajo: '0269',
    nombre: 'Iván',
    apellido: 'Quiroga',
    tipo: 'sin_cambios',
  },
];

const TIPO_LABEL = {
  nuevo: { label: 'Nuevo en RUBA', intent: 'brand' as const, icon: <Plus size={12} /> },
  actualizado: {
    label: 'Datos distintos',
    intent: 'warn' as const,
    icon: <ArrowRightLeft size={12} />,
  },
  sin_cambios: { label: 'Sin cambios', intent: 'ok' as const, icon: <Check size={12} /> },
  conflicto: { label: 'Conflicto', intent: 'risk' as const, icon: <ShieldAlert size={12} /> },
};

export default function SyncRubaPage() {
  const toast = useToast();
  const [estado, setEstado] = useState<Estado>('idle');
  const [items, setItems] = useState<DiffItem[]>([]);
  const [aplicados, setAplicados] = useState(new Set<string>());

  function comparar() {
    setEstado('comparando');
    setItems([]);
    setAplicados(new Set());
    setTimeout(() => {
      setItems(DIFF_DEMO);
      setEstado('preview');
    }, 1800);
  }

  function aplicar() {
    setEstado('aplicando');
    setTimeout(() => {
      const seleccionados = new Set(
        items.filter((i) => i.tipo !== 'sin_cambios' && i.tipo !== 'conflicto').map((i) => i.id),
      );
      setAplicados(seleccionados);
      setEstado('exito');
      toast.push({
        kind: 'success',
        title: `${seleccionados.size} registros sincronizados`,
        description: 'Quedó en audit log con tu firma.',
      });
    }, 1600);
  }

  const nuevos = items.filter((i) => i.tipo === 'nuevo').length;
  const actualizados = items.filter((i) => i.tipo === 'actualizado').length;
  const conflictos = items.filter((i) => i.tipo === 'conflicto').length;
  const sinCambios = items.filter((i) => i.tipo === 'sin_cambios').length;

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <PageHero
        objetivo="Vista Administrativo · Integraciones"
        titulo="Sincronización con RUBA"
        descripcion="Importa el padrón vigente del Registro Único de Bomberos Argentinos sin duplicar carga. Vos elegís qué se aplica."
        icono={<Database size={26} />}
        meta={
          estado !== 'idle' && estado !== 'comparando' ? (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <Kpi label="Nuevos" value={nuevos} intent="brand" />
              <Kpi label="Actualizados" value={actualizados} intent="warn" />
              <Kpi label="Conflictos" value={conflictos} intent="risk" />
              <Kpi label="Sin cambios" value={sinCambios} intent="ok" />
            </div>
          ) : undefined
        }
      />

      {/* Estado inicial */}
      {estado === 'idle' && (
        <Card className="from-brand-50 border-brand-100 bg-gradient-to-br to-white">
          <CardContent className="p-6 text-center">
            <div className="bg-brand-600 mx-auto grid h-16 w-16 place-items-center rounded-2xl text-white shadow-md">
              <Database size={28} />
            </div>
            <h2 className="mt-3 text-xl font-bold text-slate-900">
              Listo para sincronizar con RUBA
            </h2>
            <p className="mx-auto mt-1 max-w-md text-sm text-slate-600">
              Esta operación trae todos los registros del padrón en RUBA y los compara con tu padrón
              en Faro. Vos decidís qué aplicar.
            </p>
            <Button intent="primary" size="lg" onClick={comparar} className="mt-4">
              <RefreshCw size={18} /> Comparar con RUBA
            </Button>
            <p className="mt-3 text-xs text-slate-500">
              Última sincronización: nunca (esta es la primera)
            </p>
          </CardContent>
        </Card>
      )}

      {/* Comparando */}
      {estado === 'comparando' && (
        <Card>
          <CardContent className="p-8 text-center">
            <Loader2 size={32} className="text-brand-600 mx-auto animate-spin" />
            <h2 className="mt-3 font-bold text-slate-900">Consultando RUBA...</h2>
            <p className="mt-1 text-sm text-slate-600">
              Esto puede tardar unos segundos. No cierres la ventana.
            </p>
            <div className="mx-auto mt-4 max-w-xs space-y-1.5 text-left">
              {[
                'Autenticación con API RUBA 2.0',
                'Descargando padrón vigente',
                'Comparando con Faro local',
                'Detectando conflictos',
              ].map((step, idx) => (
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: -4 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.4 }}
                  className="flex items-center gap-2 text-xs text-slate-600"
                >
                  <Check size={12} className="text-status-ok-fg" />
                  {step}
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Preview con diff */}
      {(estado === 'preview' || estado === 'aplicando' || estado === 'exito') && (
        <>
          <Card>
            <CardContent className="p-4 sm:p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    {estado === 'exito'
                      ? `${aplicados.size} registros sincronizados`
                      : `${items.length} registros comparados`}
                  </h2>
                  <p className="mt-0.5 text-sm text-slate-600">
                    {estado === 'preview' &&
                      'Revisá los cambios antes de aplicar. Los conflictos requieren tu validación manual.'}
                    {estado === 'aplicando' && 'Aplicando cambios al padrón Faro...'}
                    {estado === 'exito' && 'Aplicado el ' + new Date().toLocaleString('es-AR')}
                  </p>
                </div>
                {estado === 'preview' && (
                  <Button intent="success" onClick={aplicar}>
                    <Upload size={14} /> Aplicar al padrón
                  </Button>
                )}
                {estado === 'aplicando' && (
                  <Button intent="success" disabled>
                    <Loader2 size={14} className="animate-spin" /> Aplicando...
                  </Button>
                )}
                {estado === 'exito' && (
                  <Button intent="secondary" onClick={comparar}>
                    <RefreshCw size={14} /> Volver a comparar
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          <ul className="space-y-2">
            {items.map((item) => {
              const tipoConfig = TIPO_LABEL[item.tipo];
              const fueAplicado = aplicados.has(item.id);
              return (
                <motion.li
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    'rounded-xl border bg-white p-4 transition-colors',
                    item.tipo === 'conflicto'
                      ? 'border-status-risk/30 bg-status-risk-bg/20'
                      : item.tipo === 'actualizado'
                        ? 'border-status-warn/30'
                        : 'border-slate-200',
                  )}
                >
                  <div className="flex items-start gap-3">
                    <Badge intent={tipoConfig.intent}>
                      <span className="inline-flex items-center gap-1">
                        {tipoConfig.icon}
                        {tipoConfig.label}
                      </span>
                    </Badge>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline gap-2">
                        <span className="font-semibold text-slate-900">
                          {item.apellido}, {item.nombre}
                        </span>
                        <span className="font-mono text-xs text-slate-500">
                          legajo {item.legajo}
                        </span>
                      </div>
                      {item.campos && (
                        <ul className="mt-2 space-y-1">
                          {item.campos.map((c) => (
                            <li key={c.campo} className="grid grid-cols-[100px_1fr] gap-2 text-xs">
                              <span className="font-semibold uppercase text-slate-500">
                                {c.campo}
                              </span>
                              <div className="flex items-center gap-2">
                                <span className="rounded bg-slate-100 px-1.5 py-0.5 text-slate-600 line-through">
                                  {c.faroValor}
                                </span>
                                <ChevronRight size={10} className="text-slate-400" />
                                <span className="bg-brand-100 text-brand-800 rounded px-1.5 py-0.5 font-medium">
                                  {c.rubaValor}
                                </span>
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}
                      {item.tipo === 'conflicto' && estado === 'preview' && (
                        <div className="bg-status-risk-bg/40 text-status-risk-fg mt-2 flex items-center gap-2 rounded-md p-2 text-xs">
                          <AlertTriangle size={12} />
                          <span>
                            Conflicto: ambos sistemas tienen historial. Resolvelo manualmente en la
                            ficha de la persona.
                          </span>
                        </div>
                      )}
                    </div>
                    {fueAplicado && (
                      <div className="bg-status-ok grid h-6 w-6 shrink-0 place-items-center rounded-full text-white">
                        <Check size={12} />
                      </div>
                    )}
                    {estado === 'preview' && item.tipo === 'conflicto' && (
                      <Button intent="ghost" size="sm">
                        <X size={12} /> Saltar
                      </Button>
                    )}
                  </div>
                </motion.li>
              );
            })}
          </ul>

          {estado === 'exito' && (
            <Card className="border-status-ok/30 bg-status-ok-bg/20 border-2">
              <CardContent className="flex items-start gap-3 p-4 text-sm">
                <ShieldCheck size={18} className="text-status-ok-fg mt-0.5 shrink-0" />
                <div>
                  <strong className="text-status-ok-fg">Sincronización completa.</strong>
                  <p className="mt-0.5 text-slate-700">
                    Todos los cambios quedaron en el audit log con tu firma y la fuente origen (RUBA
                    2.0). Próxima sincronización sugerida: en 30 días.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Documentación contextual */}
      <Card className="border-slate-200 bg-slate-50">
        <CardContent className="flex items-start gap-3 p-4 text-sm text-slate-600">
          <Database size={18} className="mt-0.5 shrink-0 text-slate-400" />
          <div>
            <strong className="text-slate-900">Por qué es importante:</strong> RUBA es el registro
            reconocido por el Art. 9 de la Ley 25.054. Sin sincronizar, los datos críticos
            (jerarquías, vencimientos, altas) quedan desactualizados y los subsidios del Fondo se
            pueden demorar o rechazar.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
