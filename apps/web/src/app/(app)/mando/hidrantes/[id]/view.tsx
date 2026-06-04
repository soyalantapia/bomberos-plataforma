'use client';

import { ArrowLeft, CheckCircle2, Droplets, Gauge, History, MapPin, Wrench } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';

import { Badge, Button, Card, CardContent, Kpi, cn, useToast } from '@faro/ui';

import { ConfirmDialog } from '../../../../../components/shared/confirm-dialog';
import { EmptyState } from '../../../../../components/shared/empty-state';
import { MapView } from '../../../../../components/shared/map-view';
import { PageHero } from '../../../../../components/shared/page-hero';

// Mock data (mismos del listado)
const HIDRANTES_DEMO = [
  {
    id: 'h-001',
    codigo: 'H-VB-0001',
    direccion: 'Av. Alvear y Vélez Sarsfield',
    lat: -34.546,
    lng: -58.557,
    tipo: 'azul_150mm',
    caudal: 1500,
    presion: 5.5,
    estado: 'operativo' as const,
    ultimoTest: '2026-03-15',
    proximoTest: '2026-09-15',
    proveedor: 'ABSA',
  },
  {
    id: 'h-003',
    codigo: 'H-VB-0003',
    direccion: 'Constituyentes 5600',
    lat: -34.541,
    lng: -58.563,
    tipo: 'amarillo_100mm',
    caudal: 1200,
    presion: 5.0,
    estado: 'caudal_bajo' as const,
    ultimoTest: '2026-05-10',
    proximoTest: '2026-11-10',
    proveedor: 'ABSA',
    notas: 'Caudal reducido 30%, posible obstrucción.',
  },
];

// Mock historial de tests
const HISTORIAL_TESTS = [
  { fecha: '2026-03-15', caudal: 1500, presion: 5.5, ok: true, operador: 'M. Pereyra' },
  { fecha: '2025-09-10', caudal: 1480, presion: 5.4, ok: true, operador: 'S. Ruiz' },
  { fecha: '2025-03-08', caudal: 1510, presion: 5.6, ok: true, operador: 'M. Pereyra' },
  { fecha: '2024-09-12', caudal: 1450, presion: 5.2, ok: true, operador: 'C. Sosa' },
  { fecha: '2024-03-22', caudal: 1490, presion: 5.5, ok: true, operador: 'M. Pereyra' },
];

const ESTADO_CFG = {
  operativo: { color: 'bg-status-ok', label: 'Operativo', intent: 'ok' as const },
  caudal_bajo: { color: 'bg-status-warn', label: 'Caudal bajo', intent: 'warn' as const },
  mantenimiento: { color: 'bg-brand-600', label: 'Mantenimiento', intent: 'brand' as const },
  fuera_servicio: {
    color: 'bg-status-risk',
    label: 'Fuera de servicio',
    intent: 'risk' as const,
  },
} as const;

export default function FichaHidranteView() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const toast = useToast();
  const [confirmaReclamo, setConfirmaReclamo] = useState(false);
  const [confirmaTest, setConfirmaTest] = useState(false);

  const hidrante = HIDRANTES_DEMO.find((h) => h.id === params.id) ?? HIDRANTES_DEMO[0]!;

  if (!hidrante) {
    return (
      <div className="mx-auto max-w-5xl space-y-5">
        <Link
          href="/mando/hidrantes"
          className="hover:text-brand-700 inline-flex items-center gap-1 text-sm text-slate-500"
        >
          <ArrowLeft size={14} /> Volver
        </Link>
        <EmptyState
          icon={<Droplets size={28} />}
          titulo="Hidrante no encontrado"
          descripcion={`No existe un hidrante con id ${params.id}.`}
          variant="warning"
          accion={{
            label: 'Volver al mapa',
            onClick: () => router.push('/mando/hidrantes'),
          }}
        />
      </div>
    );
  }

  const cfg = ESTADO_CFG[hidrante.estado];

  function ejecutarReclamo() {
    setConfirmaReclamo(false);
    toast.push({
      kind: 'success',
      title: `Reclamo enviado a ${hidrante.proveedor}`,
      description: 'Plazo 72 horas hábiles · queda registrado',
    });
  }

  function registrarTest() {
    setConfirmaTest(false);
    toast.push({
      kind: 'success',
      title: 'Prueba registrada',
      description: `Próxima prueba programada para ${new Date(hidrante.proximoTest).toLocaleDateString('es-AR')}`,
    });
  }

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <Link
        href="/mando/hidrantes"
        className="hover:text-brand-700 inline-flex items-center gap-1 text-sm text-slate-500"
      >
        <ArrowLeft size={14} /> Volver a hidrantes
      </Link>

      <PageHero
        objetivo={`Hidrante ${hidrante.codigo}`}
        titulo={hidrante.direccion}
        descripcion={`Prestadora ${hidrante.proveedor} · Tipo ${hidrante.tipo.replace('_', ' · ')}`}
        icono={<Droplets size={26} />}
        variant={hidrante.estado === 'operativo' ? 'success' : 'critical'}
        meta={
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Kpi label="Estado" value={cfg.label} intent={cfg.intent} />
            <Kpi label="Caudal" value={`${hidrante.caudal}`} hint="L/min" intent="brand" />
            <Kpi label="Presión" value={`${hidrante.presion}`} hint="bar" intent="brand" />
            <Kpi
              label="Próxima prueba"
              value={new Date(hidrante.proximoTest).toLocaleDateString('es-AR')}
              hint="dd/mm/aa"
              intent="warn"
            />
          </div>
        }
        acciones={
          <>
            <Button intent="primary" onClick={() => setConfirmaTest(true)}>
              <CheckCircle2 size={14} /> Registrar prueba
            </Button>
            {hidrante.estado !== 'operativo' && (
              <Button intent="secondary" onClick={() => setConfirmaReclamo(true)}>
                <Wrench size={14} /> Reclamar a {hidrante.proveedor}
              </Button>
            )}
          </>
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="overflow-hidden p-0 lg:col-span-2">
          <MapView
            center={{ lat: hidrante.lat, lng: hidrante.lng }}
            zoom={16}
            className="h-[300px]"
            pins={[
              {
                id: hidrante.id,
                lat: hidrante.lat,
                lng: hidrante.lng,
                color: cfg.color,
                label: '💧',
                popup:
                  '<strong>' +
                  hidrante.codigo +
                  '</strong><div style="font-size:11px;color:#64748b">' +
                  hidrante.caudal +
                  ' L/min · ' +
                  hidrante.presion +
                  ' bar</div>',
              },
            ]}
          />
        </Card>

        <div className="space-y-3">
          <Card>
            <CardContent className="p-4">
              <div className="mb-2 flex items-center gap-2">
                <MapPin size={14} className="text-slate-500" />
                <span className="text-xs font-bold uppercase text-slate-500">Ubicación</span>
              </div>
              <p className="text-sm font-medium text-slate-900">{hidrante.direccion}</p>
              <p className="mt-0.5 font-mono text-[11px] text-slate-500">
                {hidrante.lat.toFixed(4)}, {hidrante.lng.toFixed(4)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="mb-2 flex items-center gap-2">
                <Gauge size={14} className="text-slate-500" />
                <span className="text-xs font-bold uppercase text-slate-500">Lectura actual</span>
              </div>
              <dl className="space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <dt className="text-slate-500">Caudal nominal</dt>
                  <dd className="font-bold tabular-nums">{hidrante.caudal} L/min</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">Presión</dt>
                  <dd className="font-bold tabular-nums">{hidrante.presion} bar</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">Boca</dt>
                  <dd className="font-bold tabular-nums">{hidrante.tipo.split('_')[1] ?? '—'}</dd>
                </div>
              </dl>
              {hidrante.notas && (
                <div className="bg-status-warn-bg/40 text-status-warn-fg mt-3 rounded-md p-2 text-xs">
                  ⚠ {hidrante.notas}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Historial de pruebas */}
      <Card>
        <CardContent className="p-0">
          <div className="border-b border-slate-100 px-5 py-3">
            <div className="flex items-center gap-2">
              <History size={14} className="text-brand-700" />
              <h3 className="font-bold text-slate-900">Historial de pruebas</h3>
            </div>
          </div>
          <ul className="divide-y divide-slate-100">
            {HISTORIAL_TESTS.map((t, idx) => {
              const variacion = idx > 0 ? t.caudal - HISTORIAL_TESTS[idx - 1]!.caudal : 0;
              return (
                <li
                  key={t.fecha}
                  className={cn(
                    'grid grid-cols-[120px_1fr_100px_100px_140px] items-center gap-3 p-3 text-sm',
                  )}
                >
                  <div>
                    <div className="font-medium text-slate-900">
                      {new Date(t.fecha).toLocaleDateString('es-AR')}
                    </div>
                    <div className="text-xs text-slate-500">{t.operador}</div>
                  </div>
                  <Badge intent={t.ok ? 'ok' : 'risk'}>{t.ok ? '✓ Aprobado' : '✗ Rechazado'}</Badge>
                  <div className="text-right">
                    <span className="font-mono font-bold tabular-nums">{t.caudal}</span>
                    <span className="ml-1 text-xs text-slate-500">L/m</span>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold tabular-nums">{t.presion}</span>
                    <span className="ml-1 text-xs text-slate-500">bar</span>
                  </div>
                  <div
                    className={cn(
                      'text-right text-xs font-medium',
                      variacion < -50
                        ? 'text-status-risk-fg'
                        : variacion > 50
                          ? 'text-status-ok-fg'
                          : 'text-slate-500',
                    )}
                  >
                    {variacion === 0
                      ? '—'
                      : `${variacion > 0 ? '+' : ''}${variacion} L/m vs anterior`}
                  </div>
                </li>
              );
            })}
          </ul>
        </CardContent>
      </Card>

      <Card className="border-slate-200 bg-slate-50">
        <CardContent className="p-4 text-sm text-slate-600">
          <strong className="text-slate-900">Cómo se prueban:</strong> los hidrantes se prueban cada
          6 meses según el código de color (rojo &lt;500 L/m, amarillo 500-1000, azul 1000-1500,
          verde &gt;1500). Variaciones &gt;30% requieren mantenimiento prioritario.
        </CardContent>
      </Card>

      <ConfirmDialog
        open={confirmaTest}
        onClose={() => setConfirmaTest(false)}
        onConfirm={registrarTest}
        titulo="¿Registrar prueba del hidrante?"
        descripcion={`Vas a registrar una prueba exitosa para ${hidrante.codigo}. La próxima se programa automáticamente.`}
        confirmarLabel="Registrar"
      />

      <ConfirmDialog
        open={confirmaReclamo}
        onClose={() => setConfirmaReclamo(false)}
        onConfirm={ejecutarReclamo}
        variant="warning"
        titulo={`¿Reclamar a ${hidrante.proveedor}?`}
        descripcion={`Se notifica a la prestadora con código ${hidrante.codigo}. Plazo de respuesta: 72 horas hábiles.`}
        confirmarLabel="Enviar reclamo"
      />
    </div>
  );
}
