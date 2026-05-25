'use client';

import { motion } from 'framer-motion';
import {
  AlertTriangle,
  Calendar,
  Camera,
  Flame,
  QrCode,
  Shield,
  ShieldCheck,
  Wind,
} from 'lucide-react';
import { useState } from 'react';

import { Avatar, Badge, Button, Card, CardContent, Kpi, cn } from '@faro/ui';

import { PageHero } from '../../../../components/shared/page-hero';
import { selectPersonaActual, useFaroStore } from '../../../../store/use-faro-store';

interface EquipoEPP {
  id: string;
  tipo: 'casco' | 'chaqueta' | 'pantalon' | 'botas' | 'guantes' | 'capucha' | 'scba' | 'mascara';
  fabricante: string;
  modelo: string;
  fechaCompra: string;
  vencimiento: string;
  qrCode: string;
  exposiciones: number; // veces que entró en hot zone
  ultimaExposicion?: string;
  estado: 'vigente' | 'por_vencer' | 'vencido' | 'fuera_servicio';
  notas?: string;
}

const TIPOS_EPP: Record<
  EquipoEPP['tipo'],
  { label: string; icon: React.ReactNode; color: string }
> = {
  casco: { label: 'Casco', icon: <Shield size={16} />, color: 'bg-fire-700' },
  chaqueta: { label: 'Chaqueta turnout', icon: <Shield size={16} />, color: 'bg-fire-600' },
  pantalon: { label: 'Pantalón turnout', icon: <Shield size={16} />, color: 'bg-fire-600' },
  botas: { label: 'Botas estructurales', icon: <Shield size={16} />, color: 'bg-slate-700' },
  guantes: { label: 'Guantes', icon: <Shield size={16} />, color: 'bg-slate-600' },
  capucha: { label: 'Capucha Nomex', icon: <Shield size={16} />, color: 'bg-slate-500' },
  scba: { label: 'SCBA / ERA', icon: <Wind size={16} />, color: 'bg-brand-700' },
  mascara: { label: 'Máscara facial', icon: <Wind size={16} />, color: 'bg-brand-600' },
};

const EQUIPO_MOCK: EquipoEPP[] = [
  {
    id: 'epp-001',
    tipo: 'casco',
    fabricante: 'MSA Cairns',
    modelo: '1010 Traditional',
    fechaCompra: '2024-03-15',
    vencimiento: '2034-03-15',
    qrCode: 'FARO-EPP-31456-CASCO',
    exposiciones: 47,
    ultimaExposicion: '2026-05-22',
    estado: 'vigente',
  },
  {
    id: 'epp-002',
    tipo: 'chaqueta',
    fabricante: 'Globe',
    modelo: 'GX-7 Athletix',
    fechaCompra: '2023-08-20',
    vencimiento: '2033-08-20',
    qrCode: 'FARO-EPP-31456-CHAQ',
    exposiciones: 62,
    ultimaExposicion: '2026-05-22',
    estado: 'vigente',
    notas: '2 reparaciones menores en costura del puño',
  },
  {
    id: 'epp-003',
    tipo: 'pantalon',
    fabricante: 'Globe',
    modelo: 'GX-7 Athletix',
    fechaCompra: '2023-08-20',
    vencimiento: '2033-08-20',
    qrCode: 'FARO-EPP-31456-PANT',
    exposiciones: 62,
    estado: 'vigente',
  },
  {
    id: 'epp-004',
    tipo: 'botas',
    fabricante: 'Haix',
    modelo: 'Fire Hero Xtreme',
    fechaCompra: '2022-11-10',
    vencimiento: '2027-11-10',
    qrCode: 'FARO-EPP-31456-BOTAS',
    exposiciones: 89,
    estado: 'por_vencer',
    notas: 'Suela desgastada, agendar reemplazo',
  },
  {
    id: 'epp-005',
    tipo: 'guantes',
    fabricante: 'Pro-Tech 8',
    modelo: 'Titan',
    fechaCompra: '2025-01-15',
    vencimiento: '2030-01-15',
    qrCode: 'FARO-EPP-31456-GUAN',
    exposiciones: 28,
    estado: 'vigente',
  },
  {
    id: 'epp-006',
    tipo: 'capucha',
    fabricante: 'Majestic',
    modelo: 'PAC II',
    fechaCompra: '2024-06-01',
    vencimiento: '2029-06-01',
    qrCode: 'FARO-EPP-31456-CAPU',
    exposiciones: 41,
    estado: 'vigente',
  },
  {
    id: 'epp-007',
    tipo: 'scba',
    fabricante: 'Scott Safety',
    modelo: 'Air-Pak X3 Pro',
    fechaCompra: '2020-09-15',
    vencimiento: '2035-09-15',
    qrCode: 'FARO-EPP-31456-SCBA',
    exposiciones: 73,
    ultimaExposicion: '2026-05-22',
    estado: 'vigente',
    notas: 'Test hidrostático próximo: agosto 2026',
  },
  {
    id: 'epp-008',
    tipo: 'mascara',
    fabricante: 'Scott Safety',
    modelo: 'AV-3000 HT',
    fechaCompra: '2024-02-20',
    vencimiento: '2029-02-20',
    qrCode: 'FARO-EPP-31456-MASC',
    exposiciones: 47,
    estado: 'vigente',
  },
];

function diasHasta(fecha: string) {
  const hoy = new Date('2026-05-24');
  const f = new Date(fecha);
  return Math.round((f.getTime() - hoy.getTime()) / 86400000);
}

export default function EquipoPage() {
  const persona = useFaroStore(selectPersonaActual);
  const [qrAbierto, setQrAbierto] = useState<string | null>(null);

  const totalExpos = EQUIPO_MOCK.reduce((a, e) => a + e.exposiciones, 0);
  const conAlertas = EQUIPO_MOCK.filter(
    (e) => e.estado === 'por_vencer' || e.estado === 'vencido',
  ).length;

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <PageHero
        objetivo="Vista Bombero · Tu equipo"
        titulo="Tu EPP individual"
        descripcion="8 items con vencimientos NFPA 1851 (10 años máximo). Cada exposición a hot zone queda registrada. QR único por pieza."
        icono={<Shield size={26} />}
        meta={
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Kpi label="Items" value={EQUIPO_MOCK.length} intent="brand" />
            <Kpi
              label="Vigentes"
              value={EQUIPO_MOCK.filter((e) => e.estado === 'vigente').length}
              intent="ok"
            />
            <Kpi label="Alertas" value={conAlertas} intent={conAlertas > 0 ? 'warn' : 'ok'} />
            <Kpi label="Exposiciones" value={totalExpos} hint="acumuladas" intent="neutral" />
          </div>
        }
      />

      {/* Resumen */}
      <Card className="bg-brand-50/40 border-brand-100">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Avatar
              name={`${persona?.nombre} ${persona?.apellido}`}
              src={persona?.fotoUrl}
              size={48}
            />
            <div className="flex-1">
              <div className="text-brand-900 font-bold">
                {persona?.apellido}, {persona?.nombre}
              </div>
              <p className="text-brand-900/80 mt-0.5 text-sm">
                Legajo {persona?.legajo} · {totalExpos} exposiciones registradas en los últimos 12
                meses
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Grid de EPP */}
      <div className="grid gap-3 sm:grid-cols-2">
        {EQUIPO_MOCK.map((item, idx) => {
          const cfg = TIPOS_EPP[item.tipo];
          const dias = diasHasta(item.vencimiento);
          const meses = Math.round(dias / 30);
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.04 }}
            >
              <Card
                className={cn(
                  'border-2',
                  item.estado === 'por_vencer'
                    ? 'border-status-warn/30'
                    : item.estado === 'vencido'
                      ? 'border-status-risk/30'
                      : 'border-slate-200',
                )}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div
                      className={cn(
                        'grid h-12 w-12 shrink-0 place-items-center rounded-xl text-white',
                        cfg.color,
                      )}
                    >
                      {cfg.icon}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{cfg.label}</span>
                        <Badge
                          intent={
                            item.estado === 'vigente'
                              ? 'ok'
                              : item.estado === 'por_vencer'
                                ? 'warn'
                                : 'risk'
                          }
                        >
                          {item.estado === 'vigente'
                            ? 'Vigente'
                            : item.estado === 'por_vencer'
                              ? 'Por vencer'
                              : 'Vencido'}
                        </Badge>
                      </div>
                      <div className="mt-0.5 text-xs text-slate-600">
                        {item.fabricante} · {item.modelo}
                      </div>

                      <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                        <div className="rounded-md bg-slate-50 p-2">
                          <div className="text-slate-500">Vence</div>
                          <div
                            className={cn(
                              'font-bold',
                              dias < 60 && 'text-status-warn-fg',
                              dias < 0 && 'text-status-risk-fg',
                            )}
                          >
                            {meses > 12 ? `${Math.floor(meses / 12)} años` : `${meses} meses`}
                          </div>
                        </div>
                        <div className="rounded-md bg-slate-50 p-2">
                          <div className="text-slate-500">Exposiciones</div>
                          <div className="flex items-center gap-1 font-bold text-slate-900">
                            <Flame size={11} className="text-fire-600" />
                            {item.exposiciones}
                          </div>
                        </div>
                      </div>

                      {item.ultimaExposicion && (
                        <div className="mt-2 text-[11px] text-slate-500">
                          <Calendar size={10} className="mr-1 inline" />
                          Última exposición:{' '}
                          {new Date(item.ultimaExposicion).toLocaleDateString('es-AR')}
                        </div>
                      )}

                      {item.notas && (
                        <div className="bg-status-warn-bg/40 text-status-warn-fg mt-2 flex items-start gap-2 rounded p-2 text-xs">
                          <AlertTriangle size={11} className="mt-0.5 shrink-0" />
                          <span>{item.notas}</span>
                        </div>
                      )}

                      <div className="mt-3 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setQrAbierto(qrAbierto === item.id ? null : item.id)}
                          className="bg-brand-50 text-brand-700 hover:bg-brand-100 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium"
                        >
                          <QrCode size={12} /> Ver QR
                        </button>
                        <Button intent="ghost" size="sm">
                          <Camera size={12} /> Foto
                        </Button>
                      </div>

                      {qrAbierto === item.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          className="mt-3 overflow-hidden"
                        >
                          <div className="flex items-center gap-3 rounded-lg bg-white p-3 ring-1 ring-slate-200">
                            <div className="grid h-20 w-20 shrink-0 place-items-center rounded bg-slate-900 text-white">
                              <QrCode size={48} />
                            </div>
                            <div className="min-w-0 flex-1 text-xs">
                              <div className="font-mono font-bold text-slate-900">
                                {item.qrCode}
                              </div>
                              <div className="mt-1 text-slate-600">
                                Escanear al entrar/salir de hot zone para registrar exposición
                                automática.
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <Card className="bg-brand-50/40 border-brand-100">
        <CardContent className="flex items-start gap-3 p-4">
          <div className="bg-brand-600 grid h-10 w-10 shrink-0 place-items-center rounded-xl text-white">
            <ShieldCheck size={18} />
          </div>
          <div className="text-sm">
            <strong className="text-brand-900">NFPA 1851 · Vida útil 10 años</strong>
            <p className="text-brand-900/80 mt-0.5">
              Esta norma exige reemplazo del traje turnout cada 10 años desde su fabricación. Faro
              genera alertas con 60 días de anticipación. El exposure log opcional sirve para
              auditorías post-incidente y reclamos a aseguradoras.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
