'use client';

import { motion } from 'framer-motion';
import { AlertTriangle, Camera, Check, CheckCircle2, ClipboardCheck, Truck, X } from 'lucide-react';
import { useState } from 'react';

import { Badge, Button, Card, CardContent, Kpi, cn, useToast } from '@faro/ui';

import { PageHero } from '../../../../../components/shared/page-hero';
import { useFaroStore } from '../../../../../store/use-faro-store';

type Estado = 'ok' | 'observacion' | 'falla' | 'pendiente';

interface ItemCheck {
  id: string;
  categoria: string;
  item: string;
  estado: Estado;
  nota?: string;
}

const ITEMS_BASE: Omit<ItemCheck, 'estado' | 'nota'>[] = [
  // Combustible y fluidos
  { id: 'fuel', categoria: 'Fluidos', item: 'Combustible (>3/4 tanque)' },
  { id: 'agua', categoria: 'Fluidos', item: 'Tanque de agua (>90%)' },
  { id: 'aceite', categoria: 'Fluidos', item: 'Nivel de aceite motor' },
  { id: 'refrig', categoria: 'Fluidos', item: 'Refrigerante' },
  { id: 'liq_freno', categoria: 'Fluidos', item: 'Líquido de frenos' },
  { id: 'espuma', categoria: 'Fluidos', item: 'Concentrado de espuma AFFF' },

  // Bomba e hidráulica
  { id: 'bomba_presion', categoria: 'Bomba', item: 'Bomba presurización OK' },
  { id: 'valvulas', categoria: 'Bomba', item: 'Válvulas operativas' },
  { id: 'mangueras', categoria: 'Bomba', item: 'Mangueras 38mm + 63mm (cant.)' },
  { id: 'lanza', categoria: 'Bomba', item: 'Lanzas multifunción' },
  { id: 'codos', categoria: 'Bomba', item: 'Codos y reducciones' },

  // Equipamiento eléctrico
  { id: 'bateria', categoria: 'Eléctrico', item: 'Batería principal' },
  { id: 'sirena', categoria: 'Eléctrico', item: 'Sirena y baliza' },
  { id: 'luces', categoria: 'Eléctrico', item: 'Luces de escena' },
  { id: 'radio_v', categoria: 'Eléctrico', item: 'Radio VHF/UHF vehicular' },

  // Herramientas de rescate
  { id: 'pinzas', categoria: 'Rescate', item: 'Pinzas hidráulicas' },
  { id: 'separador', categoria: 'Rescate', item: 'Separador / Cizalla' },
  { id: 'palanca', categoria: 'Rescate', item: 'Palancas y cuñas' },
  { id: 'escalera', categoria: 'Rescate', item: 'Escalera de 3 tramos' },
  { id: 'cuerdas', categoria: 'Rescate', item: 'Cuerdas estáticas (>30m)' },

  // EPP en el móvil
  { id: 'casco', categoria: 'EPP', item: 'Cascos NFPA 1971 (mín 6)' },
  { id: 'chaqueta', categoria: 'EPP', item: 'Chaquetas tipo turnout' },
  { id: 'pantalon', categoria: 'EPP', item: 'Pantalones turnout' },
  { id: 'botas', categoria: 'EPP', item: 'Botas estructurales' },
  { id: 'guantes', categoria: 'EPP', item: 'Guantes (NFPA 1971)' },

  // ERA / Aire comprimido
  { id: 'scba_carga', categoria: 'ERA', item: 'SCBA cargadas (>4500 psi)' },
  { id: 'mascaras', categoria: 'ERA', item: 'Máscaras faciales' },
  { id: 'compresor', categoria: 'ERA', item: 'Compresor portátil' },

  // Médico
  { id: 'botiquin', categoria: 'Médico', item: 'Botiquín de emergencia' },
  { id: 'dea', categoria: 'Médico', item: 'DEA con baterías OK' },
  { id: 'collar', categoria: 'Médico', item: 'Collar cervical y tabla' },
];

const ESTADO_CONFIG: Record<Estado, { color: string; label: string; icon: React.ReactNode }> = {
  ok: { color: 'bg-status-ok', label: 'OK', icon: <Check size={14} /> },
  observacion: {
    color: 'bg-status-warn',
    label: 'Observación',
    icon: <AlertTriangle size={14} />,
  },
  falla: { color: 'bg-status-risk', label: 'Falla', icon: <X size={14} /> },
  pendiente: { color: 'bg-slate-300', label: 'Pendiente', icon: null },
};

// Pre-cargamos algunos estados para mostrar el check parcialmente hecho
function initItems(): ItemCheck[] {
  return ITEMS_BASE.map((b, i) => ({
    ...b,
    estado: i < 18 ? 'ok' : i === 18 ? 'observacion' : 'pendiente',
    nota: i === 18 ? 'Pinza hidráulica con leve fuga de aceite, agendar mant.' : undefined,
  }));
}

export default function TruckCheckPage() {
  const toast = useToast();
  const moviles = useFaroStore((s) => s.moviles);
  const movilesActivos = moviles.filter((m) => m.enServicio);
  const [movilSel, setMovilSel] = useState(movilesActivos[0]?.id ?? 'movil-bv3');
  const [items, setItems] = useState<ItemCheck[]>(initItems());
  const [completado, setCompletado] = useState(false);

  function setEstado(id: string, estado: Estado) {
    setItems((arr) => arr.map((i) => (i.id === id ? { ...i, estado } : i)));
  }

  function marcarTodoOk() {
    setItems((arr) => arr.map((i) => ({ ...i, estado: 'ok' as Estado })));
  }

  const ok = items.filter((i) => i.estado === 'ok').length;
  const obs = items.filter((i) => i.estado === 'observacion').length;
  const falla = items.filter((i) => i.estado === 'falla').length;
  const pendiente = items.filter((i) => i.estado === 'pendiente').length;
  const pct = Math.round((ok / items.length) * 100);

  const puedeFinalizar = pendiente === 0;
  const hayFallas = falla > 0;

  function finalizar() {
    if (!puedeFinalizar) {
      toast.push({
        kind: 'warn',
        title: 'Faltan items por chequear',
        description: `${pendiente} sin marcar`,
      });
      return;
    }
    setCompletado(true);
    if (hayFallas) {
      toast.push({
        kind: 'warn',
        title: `Móvil BLOQUEADO con ${falla} falla(s)`,
        description: 'No puede salir hasta resolver.',
      });
    } else {
      toast.push({
        kind: 'success',
        title: `Truck check completo · ${pct}%`,
        description: `${obs} observaciones registradas en mantenimiento.`,
      });
    }
  }

  // Agrupar items por categoría
  const categorias = Array.from(new Set(items.map((i) => i.categoria)));

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <PageHero
        objetivo="Vista Mando · Truck check"
        titulo={
          completado
            ? `Móvil ${movilSel.replace('movil-', '').toUpperCase()} chequeado`
            : 'Pre-servicio · Truck check'
        }
        descripcion="Checklist obligatorio antes de cada turno. 30 items × 6 categorías. Si hay fallas, el móvil queda bloqueado."
        icono={<ClipboardCheck size={26} />}
        variant={hayFallas && completado ? 'critical' : completado ? 'success' : 'default'}
        meta={
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Kpi label="OK" value={ok} hint={`${pct}%`} intent="ok" />
            <Kpi label="Observación" value={obs} intent={obs > 0 ? 'warn' : 'neutral'} />
            <Kpi label="Fallas" value={falla} intent={falla > 0 ? 'risk' : 'ok'} />
            <Kpi label="Pendientes" value={pendiente} intent="neutral" />
          </div>
        }
        acciones={
          !completado ? (
            <>
              <Button intent="ghost" size="sm" onClick={marcarTodoOk}>
                <Check size={12} /> Marcar todo OK
              </Button>
              <Button intent="primary" onClick={finalizar} disabled={pendiente > 0}>
                <CheckCircle2 size={14} /> Finalizar
              </Button>
            </>
          ) : undefined
        }
      />

      {/* Selector móvil */}
      {!completado && (
        <Card>
          <CardContent className="flex flex-wrap items-center gap-2 p-3">
            <span className="text-xs font-semibold uppercase text-slate-500">
              <Truck size={12} className="mr-1 inline" /> Móvil:
            </span>
            {movilesActivos.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setMovilSel(m.id)}
                className={cn(
                  'rounded-full px-3 py-1 text-xs font-medium transition-colors',
                  movilSel === m.id
                    ? 'bg-brand-600 text-white'
                    : 'bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50',
                )}
              >
                {m.codigo} · {m.tipo}
              </button>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Resultado completado */}
      {completado && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <Card
            className={cn(
              'border-2',
              hayFallas
                ? 'border-status-risk/30 bg-status-risk-bg/30'
                : 'border-status-ok/30 bg-status-ok-bg/30',
            )}
          >
            <CardContent className="flex items-start gap-3 p-5">
              <div
                className={cn(
                  'grid h-14 w-14 shrink-0 place-items-center rounded-2xl text-white',
                  hayFallas ? 'bg-status-risk' : 'bg-status-ok',
                )}
              >
                {hayFallas ? <X size={28} /> : <CheckCircle2 size={28} />}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-slate-900">
                  {hayFallas
                    ? `Móvil bloqueado · ${falla} falla(s) crítica(s)`
                    : `Truck check aprobado · ${pct}%`}
                </h3>
                <p className="mt-0.5 text-sm text-slate-700">
                  {hayFallas
                    ? 'No puede salir a operativo hasta resolver las fallas. Notificado al taller.'
                    : `${obs} observaciones registradas. Mantenimiento agendado.`}
                </p>
                <Badge intent={hayFallas ? 'risk' : 'ok'} className="mt-2">
                  Firmado en audit log
                </Badge>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Items por categoría */}
      <div className="space-y-3">
        {categorias.map((cat) => {
          const itemsCat = items.filter((i) => i.categoria === cat);
          const okCat = itemsCat.filter((i) => i.estado === 'ok').length;
          const pctCat = Math.round((okCat / itemsCat.length) * 100);
          return (
            <Card key={cat}>
              <CardContent className="p-4">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="font-bold text-slate-900">{cat}</h3>
                  <Badge intent={pctCat === 100 ? 'ok' : pctCat >= 80 ? 'warn' : 'risk'}>
                    {okCat}/{itemsCat.length}
                  </Badge>
                </div>
                <ul className="space-y-1.5">
                  {itemsCat.map((item) => {
                    const cfg = ESTADO_CONFIG[item.estado];
                    return (
                      <li
                        key={item.id}
                        className={cn(
                          'flex items-center gap-3 rounded-lg p-2.5',
                          item.estado === 'ok'
                            ? 'bg-status-ok-bg/30'
                            : item.estado === 'observacion'
                              ? 'bg-status-warn-bg/30'
                              : item.estado === 'falla'
                                ? 'bg-status-risk-bg/30'
                                : 'bg-slate-50',
                        )}
                      >
                        <span className="flex-1 text-sm text-slate-900">{item.item}</span>
                        {!completado ? (
                          <div className="flex shrink-0 gap-1">
                            {(['ok', 'observacion', 'falla'] as const).map((e) => {
                              const c = ESTADO_CONFIG[e];
                              return (
                                <button
                                  key={e}
                                  type="button"
                                  onClick={() => setEstado(item.id, e)}
                                  className={cn(
                                    'grid h-7 w-7 place-items-center rounded text-xs text-white transition-transform hover:scale-110',
                                    item.estado === e ? c.color : 'bg-slate-200 text-slate-400',
                                  )}
                                  aria-label={c.label}
                                >
                                  {c.icon}
                                </button>
                              );
                            })}
                          </div>
                        ) : (
                          <Badge
                            intent={
                              item.estado === 'ok'
                                ? 'ok'
                                : item.estado === 'observacion'
                                  ? 'warn'
                                  : 'risk'
                            }
                          >
                            {cfg.icon} {cfg.label}
                          </Badge>
                        )}
                      </li>
                    );
                  })}
                </ul>

                {/* Notas si hay alguna obs/falla en esta categoría */}
                {itemsCat.some((i) => i.nota) && (
                  <div className="mt-2 space-y-1">
                    {itemsCat
                      .filter((i) => i.nota)
                      .map((i) => (
                        <div
                          key={i.id}
                          className="bg-status-warn-bg/40 text-status-warn-fg flex items-start gap-2 rounded p-2 text-xs"
                        >
                          <Camera size={10} className="mt-0.5 shrink-0" />
                          <span>{i.nota}</span>
                        </div>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="border-slate-200 bg-slate-50">
        <CardContent className="flex items-start gap-3 p-4 text-sm text-slate-600">
          <ClipboardCheck size={18} className="mt-0.5 shrink-0 text-slate-400" />
          <div>
            <strong className="text-slate-900">Trazabilidad:</strong> cada check queda con la firma
            del jefe de servicio, hora y, opcionalmente, foto del item observado/fallado. Si
            finalizás con fallas, se notifica al taller automáticamente.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
