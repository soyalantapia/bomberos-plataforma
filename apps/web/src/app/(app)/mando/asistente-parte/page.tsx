'use client';

import { motion } from 'framer-motion';
import {
  AlertCircle,
  CheckCircle2,
  KeyRound,
  Loader2,
  Mic,
  Save,
  Sparkles,
  Wand2,
} from 'lucide-react';
import { useState } from 'react';

import { Badge, Button, Card, CardContent, Kpi, useToast } from '@faro/ui';

import { PageHero } from '../../../../components/shared/page-hero';

type Paso = 'inicial' | 'grabando' | 'transcribiendo' | 'estructurando' | 'revisar' | 'firmado';

interface CampoExtraido {
  campo: string;
  valor: string;
  fuente: 'audio' | 'foto' | 'voz';
  confianza: number;
}

const TRANSCRIPCION_DEMO = `Incendio en cocina, dirección Av. Mosconi 4521, Villa Devoto.
Llamado al 100 a las veintidós y quince. Salimos cuatro con el móvil BV-3.
Llegada a las veintidós diecinueve. Cuatro minutos de respuesta.
Una persona con quemaduras leves en mano derecha, trasladada por SAME al Hospital Municipal.
Foco controlado con extintor y línea 38 milímetros.
Causa probable, grasa caliente sobre hornalla desatendida.
Regreso al cuartel a las veintitrés cuarenta y ocho.`;

const CAMPOS_IA: CampoExtraido[] = [
  { campo: 'Dirección', valor: 'Av. Mosconi 4521, Villa Devoto', fuente: 'voz', confianza: 0.98 },
  {
    campo: 'Hora salida',
    valor: '22:15',
    fuente: 'voz',
    confianza: 0.96,
  },
  { campo: 'Hora regreso', valor: '23:48', fuente: 'voz', confianza: 0.97 },
  { campo: 'Móvil', valor: 'BV-3', fuente: 'voz', confianza: 0.99 },
  { campo: 'Dotación', valor: '4 personas', fuente: 'voz', confianza: 0.94 },
  {
    campo: 'Tipo de incidente',
    valor: '111 · Incendio estructural vivienda',
    fuente: 'voz',
    confianza: 0.93,
  },
  { campo: 'Heridos', valor: '1 (quemadura leve)', fuente: 'voz', confianza: 0.95 },
  {
    campo: 'Causa',
    valor: 'Cocina · grasa/aceite desatendido',
    fuente: 'voz',
    confianza: 0.91,
  },
  {
    campo: 'Tiempo respuesta',
    valor: '4 min (Tiempo objetivo: cumplido)',
    fuente: 'voz',
    confianza: 0.97,
  },
];

export default function AsistenteParteAIPage() {
  const toast = useToast();
  const [paso, setPaso] = useState<Paso>('inicial');
  const [transcripcion, setTranscripcion] = useState('');
  const [campos, setCampos] = useState<CampoExtraido[]>([]);
  const [audioSeg, setAudioSeg] = useState(0);

  function empezarGrabar() {
    setPaso('grabando');
    setAudioSeg(0);
    const interval = setInterval(() => {
      setAudioSeg((s) => {
        if (s >= 28) {
          clearInterval(interval);
          setPaso('transcribiendo');
          setTimeout(() => {
            setTranscripcion(TRANSCRIPCION_DEMO);
            setPaso('estructurando');
            setTimeout(() => {
              setCampos(CAMPOS_IA);
              setPaso('revisar');
            }, 1800);
          }, 1500);
          return s;
        }
        return s + 1;
      });
    }, 1000);
  }

  function firmar() {
    setPaso('firmado');
    toast.push({
      kind: 'success',
      title: 'Parte firmado y archivado',
      description: 'Queda registrado que la IA ayudó a completarlo',
    });
  }

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <PageHero
        objetivo="Vista Mando · Asistente con voz"
        titulo="Cargá el parte hablando"
        descripcion="Dictás lo que pasó, la inteligencia artificial completa el parte automáticamente y vos firmás. Queda registrado que la IA te ayudó."
        icono={<Wand2 size={26} />}
        meta={
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Kpi label="Datos detectados" value={campos.length} intent="brand" />
            <Kpi
              label="Seguridad"
              value={
                campos.length > 0
                  ? `${Math.round((campos.reduce((a, c) => a + c.confianza, 0) / campos.length) * 100)}%`
                  : '—'
              }
              hint="qué tan seguro está"
              intent="ok"
            />
            <Kpi
              label="Estado"
              value={
                paso === 'firmado'
                  ? 'Firmado'
                  : paso === 'revisar'
                    ? 'Revisar'
                    : paso === 'inicial'
                      ? 'Listo'
                      : 'Procesando'
              }
              intent={paso === 'firmado' ? 'ok' : 'warn'}
            />
          </div>
        }
      />

      {/* Paso inicial */}
      {paso === 'inicial' && (
        <Card className="border-brand-200 border-2">
          <CardContent className="p-8 text-center">
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="bg-brand-600 mx-auto grid h-24 w-24 place-items-center rounded-full text-white shadow-xl"
            >
              <Mic size={48} />
            </motion.div>
            <h2 className="mt-4 text-2xl font-bold text-slate-900">Tocá para empezar a dictar</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-slate-600">
              Hablá normal, la IA convierte lo que decís en el parte. Te marca si hay cosas que no
              cierran (por ejemplo horarios que no coinciden) y vos firmás al final.
            </p>
            <Button intent="primary" size="lg" onClick={empezarGrabar} className="mt-4">
              <Mic size={20} /> Empezar a grabar
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Paso grabando */}
      {paso === 'grabando' && (
        <Card className="border-status-risk/30 bg-status-risk-bg/20 border-2">
          <CardContent className="p-8 text-center">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="bg-status-risk mx-auto grid h-24 w-24 place-items-center rounded-full text-white shadow-xl"
            >
              <Mic size={48} />
            </motion.div>
            <h2 className="text-status-risk-fg mt-4 text-2xl font-bold">Grabando...</h2>
            <p className="mt-1 font-mono text-3xl font-bold tabular-nums text-slate-900">
              {Math.floor(audioSeg / 60)
                .toString()
                .padStart(2, '0')}
              :{(audioSeg % 60).toString().padStart(2, '0')}
            </p>
            <p className="mt-2 text-sm text-slate-600">
              Hablá normal. Tocá el micrófono otra vez para terminar.
            </p>
            <div className="mx-auto mt-4 flex max-w-md items-center gap-1">
              {Array.from({ length: 30 }).map((_, i) => (
                <motion.div
                  key={i}
                  animate={{
                    height: i === audioSeg % 30 ? 40 : 20 + Math.random() * 20,
                  }}
                  className="bg-status-risk flex-1 rounded"
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Paso transcribiendo */}
      {paso === 'transcribiendo' && (
        <Card>
          <CardContent className="p-8 text-center">
            <Loader2 size={40} className="text-brand-600 mx-auto animate-spin" />
            <h2 className="mt-3 text-xl font-bold text-slate-900">
              Convirtiendo el audio en texto…
            </h2>
            <p className="mt-1 text-sm text-slate-600">Esto tarda unos segundos</p>
          </CardContent>
        </Card>
      )}

      {/* Paso estructurando */}
      {paso === 'estructurando' && (
        <>
          <Card>
            <CardContent className="p-5">
              <div className="mb-2 text-xs font-semibold uppercase text-slate-500">
                Transcripción del audio
              </div>
              <p className="rounded-lg bg-slate-50 p-3 text-sm text-slate-900">{transcripcion}</p>
            </CardContent>
          </Card>
          <Card className="bg-brand-50/40 border-brand-100">
            <CardContent className="p-6 text-center">
              <Loader2 size={32} className="text-brand-600 mx-auto animate-spin" />
              <h2 className="text-brand-900 mt-3 font-bold">Identificando los datos del parte…</h2>
              <p className="text-brand-900/70 mt-1 text-sm">
                Identifica direcciones, horarios, tipos de incidente, causas probables...
              </p>
            </CardContent>
          </Card>
        </>
      )}

      {/* Paso revisar */}
      {(paso === 'revisar' || paso === 'firmado') && (
        <>
          <Card>
            <CardContent className="p-5">
              <div className="mb-2 text-xs font-semibold uppercase text-slate-500">
                Transcripción del audio
              </div>
              <p className="rounded-lg bg-slate-50 p-3 text-sm text-slate-900">{transcripcion}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-0">
              <div className="border-b border-slate-100 px-5 py-3">
                <h3 className="font-bold text-slate-900">Campos extraídos por IA</h3>
                <p className="mt-0.5 text-xs text-slate-500">
                  Click para editar cualquier campo · IA tiene confianza promedio{' '}
                  {Math.round((campos.reduce((a, c) => a + c.confianza, 0) / campos.length) * 100)}%
                </p>
              </div>
              <ul className="divide-y divide-slate-100">
                {campos.map((c, idx) => (
                  <motion.li
                    key={c.campo}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.04 }}
                    className="grid grid-cols-[140px_1fr_auto] items-center gap-3 p-3 hover:bg-slate-50"
                  >
                    <span className="text-xs font-semibold uppercase text-slate-500">
                      {c.campo}
                    </span>
                    <span className="font-medium text-slate-900">{c.valor}</span>
                    <Badge
                      intent={c.confianza >= 0.95 ? 'ok' : c.confianza >= 0.85 ? 'warn' : 'risk'}
                    >
                      {Math.round(c.confianza * 100)}%
                    </Badge>
                  </motion.li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Disclosure obligatorio */}
          <Card className="border-status-warn/30 bg-status-warn-bg/20 border-2">
            <CardContent className="flex items-start gap-3 p-4">
              <AlertCircle size={18} className="text-status-warn-fg mt-0.5 shrink-0" />
              <div className="flex-1 text-sm">
                <strong className="text-status-warn-fg">
                  Aclaración importante para que el parte tenga valor legal
                </strong>
                <p className="text-status-warn-fg/80 mt-1">
                  Este parte fue completado con ayuda de inteligencia artificial. El jefe de
                  servicio lo valida y asume responsabilidad final. La IA NO concluye sobre
                  culpabilidad ni causalidad legal. El audio original queda como prueba.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Firma */}
          {paso === 'revisar' && (
            <Card className="border-brand-200 border-2">
              <CardContent className="p-5">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="bg-brand-600 grid h-12 w-12 shrink-0 place-items-center rounded-xl text-white">
                    <KeyRound size={20} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-slate-900">Firma OTP</h3>
                    <p className="mt-0.5 text-xs text-slate-500">
                      Demo OTP: 000000 · audit log inmutable
                    </p>
                  </div>
                  <Button intent="success" size="lg" onClick={firmar}>
                    <CheckCircle2 size={16} /> Firmar y archivar
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {paso === 'firmado' && (
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
              <Card className="border-status-ok/30 bg-status-ok-bg/30 border-2">
                <CardContent className="flex items-start gap-3 p-5">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring' }}
                    className="bg-status-ok grid h-14 w-14 shrink-0 place-items-center rounded-xl text-white"
                  >
                    <CheckCircle2 size={24} />
                  </motion.div>
                  <div className="flex-1">
                    <h3 className="text-status-ok-fg text-lg font-bold">
                      Parte firmado y archivado
                    </h3>
                    <p className="mt-0.5 text-sm text-slate-700">
                      Tiempo total: 4.2s · 9 campos extraídos · 95% confianza · audio respaldado
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <Button intent="secondary" size="sm">
                        <Save size={12} /> Descargar PDF
                      </Button>
                      <Badge intent="ok">
                        <Sparkles size={10} className="mr-1" />
                        Completado con ayuda de IA (queda aclarado)
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </>
      )}
    </div>
  );
}
