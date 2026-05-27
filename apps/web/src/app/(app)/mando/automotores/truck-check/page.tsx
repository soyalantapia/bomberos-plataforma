'use client';

import {
  Badge,
  Button,
  Card,
  CardContent,
  Dialog,
  Input,
  Kpi,
  Label,
  cn,
  useToast,
} from '@faro/ui';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertTriangle,
  ArrowRight,
  Camera,
  Check,
  CheckCircle2,
  ChevronLeft,
  ClipboardCheck,
  Download,
  FileText,
  Gauge,
  Hash,
  Lock,
  Truck,
  X,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';

import { ConfirmDialog } from '../../../../../components/shared/confirm-dialog';
import { PageHero } from '../../../../../components/shared/page-hero';
import { useFaroStore } from '../../../../../store/use-faro-store';
import { demoToday } from '../../../../../lib/utils/demo-today';

type Estado = 'ok' | 'observacion' | 'falla' | 'pendiente';
type Fase = 'prechek' | 'checklist' | 'firma' | 'final';

interface ItemCheck {
  id: string;
  categoria: string;
  item: string;
  estado: Estado;
  nota?: string;
  foto?: string;
}

const ITEMS_BASE: Omit<ItemCheck, 'estado' | 'nota' | 'foto'>[] = [
  { id: 'fuel', categoria: 'Fluidos', item: 'Combustible (>3/4 tanque)' },
  { id: 'agua', categoria: 'Fluidos', item: 'Tanque de agua (>90%)' },
  { id: 'aceite', categoria: 'Fluidos', item: 'Nivel de aceite motor' },
  { id: 'refrig', categoria: 'Fluidos', item: 'Refrigerante' },
  { id: 'liq_freno', categoria: 'Fluidos', item: 'Líquido de frenos' },
  { id: 'espuma', categoria: 'Fluidos', item: 'Concentrado de espuma especial' },
  { id: 'bomba_presion', categoria: 'Bomba', item: 'Bomba presurización OK' },
  { id: 'valvulas', categoria: 'Bomba', item: 'Válvulas operativas' },
  { id: 'mangueras', categoria: 'Bomba', item: 'Mangueras 38mm + 63mm (cant.)' },
  { id: 'lanza', categoria: 'Bomba', item: 'Lanzas multifunción' },
  { id: 'codos', categoria: 'Bomba', item: 'Codos y reducciones' },
  { id: 'bateria', categoria: 'Eléctrico', item: 'Batería principal' },
  { id: 'sirena', categoria: 'Eléctrico', item: 'Sirena y baliza' },
  { id: 'luces', categoria: 'Eléctrico', item: 'Luces de escena' },
  { id: 'radio_v', categoria: 'Eléctrico', item: 'Radio del móvil' },
  { id: 'pinzas', categoria: 'Rescate', item: 'Pinzas hidráulicas' },
  { id: 'separador', categoria: 'Rescate', item: 'Separador / Cizalla' },
  { id: 'palanca', categoria: 'Rescate', item: 'Palancas y cuñas' },
  { id: 'escalera', categoria: 'Rescate', item: 'Escalera de 3 tramos' },
  { id: 'cuerdas', categoria: 'Rescate', item: 'Cuerdas estáticas (>30m)' },
  { id: 'casco', categoria: 'EPP', item: 'Cascos estructurales (mín 6)' },
  { id: 'chaqueta', categoria: 'EPP', item: 'Chaquetas de intervención' },
  { id: 'pantalon', categoria: 'EPP', item: 'Pantalones de intervención' },
  { id: 'botas', categoria: 'EPP', item: 'Botas estructurales' },
  { id: 'guantes', categoria: 'EPP', item: 'Guantes de intervención' },
  { id: 'scba_carga', categoria: 'Aire comprimido', item: 'Equipos de aire cargados (>4500 psi)' },
  { id: 'mascaras', categoria: 'Aire comprimido', item: 'Máscaras faciales' },
  { id: 'compresor', categoria: 'Aire comprimido', item: 'Compresor portátil' },
  { id: 'botiquin', categoria: 'Médico', item: 'Botiquín de emergencia' },
  { id: 'dea', categoria: 'Médico', item: 'Desfibrilador (DEA) con baterías OK' },
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

function initItems(): ItemCheck[] {
  return ITEMS_BASE.map((b): ItemCheck => ({ ...b, estado: 'pendiente' }));
}

export default function TruckCheckPage() {
  const router = useRouter();
  const toast = useToast();
  const moviles = useFaroStore((s) => s.moviles);
  const sesion = useFaroStore((s) => s.sesion);
  const personas = useFaroStore((s) => s.personas);
  const personaActual = personas.find((p) => p.id === sesion?.personaId);
  const movilesActivos = moviles.filter((m) => m.enServicio);

  // Estado del flujo
  const [fase, setFase] = useState<Fase>('prechek');
  const [movilSel, setMovilSel] = useState(movilesActivos[0]?.id ?? 'movil-bv3');
  const [km, setKm] = useState('45821');
  const [horometro, setHorometro] = useState('1247');
  const [jefe, setJefe] = useState(
    personaActual ? `${personaActual.apellido}, ${personaActual.nombre}` : 'Pereyra, Mariela',
  );
  const [errPre, setErrPre] = useState<Record<string, string>>({});

  const [items, setItems] = useState<ItemCheck[]>(initItems());
  const [editandoItem, setEditandoItem] = useState<{
    item: ItemCheck;
    estado: 'observacion' | 'falla';
  } | null>(null);
  const [notaBuffer, setNotaBuffer] = useState('');
  const [fotoBuffer, setFotoBuffer] = useState<string | undefined>(undefined);

  const [confirmFirma, setConfirmFirma] = useState(false);
  const [confirmTodoOk, setConfirmTodoOk] = useState(false);
  const [hashFinal, setHashFinal] = useState<string | null>(null);
  const [timestampFinal, setTimestampFinal] = useState<string | null>(null);

  const movilSeleccionado = useMemo(
    () => moviles.find((m) => m.id === movilSel),
    [moviles, movilSel],
  );

  function setEstado(id: string, estado: Estado) {
    if (estado === 'observacion' || estado === 'falla') {
      const item = items.find((i) => i.id === id);
      if (item) {
        setEditandoItem({ item, estado });
        setNotaBuffer(item.nota ?? '');
        setFotoBuffer(item.foto);
      }
      return;
    }
    setItems((arr) =>
      arr.map((i) => (i.id === id ? { ...i, estado, nota: undefined, foto: undefined } : i)),
    );
  }

  function guardarNota() {
    if (!editandoItem) return;
    if (notaBuffer.trim().length < 8) {
      toast.push({
        kind: 'warn',
        title: 'Nota muy corta',
        description: 'Mínimo 8 caracteres para que quede claro.',
      });
      return;
    }
    setItems((arr) =>
      arr.map((i) =>
        i.id === editandoItem.item.id
          ? { ...i, estado: editandoItem.estado, nota: notaBuffer.trim(), foto: fotoBuffer }
          : i,
      ),
    );
    setEditandoItem(null);
    setNotaBuffer('');
    setFotoBuffer(undefined);
  }

  function simularFoto() {
    const ids = ['photo-1', 'photo-2', 'photo-3'];
    setFotoBuffer(ids[Math.floor(Math.random() * ids.length)]);
    toast.push({ kind: 'info', title: 'Foto adjuntada' });
  }

  function marcarTodoOk() {
    setConfirmTodoOk(true);
  }

  function aplicarTodoOk() {
    setItems((arr) => arr.map((i): ItemCheck => ({ ...i, estado: 'ok' })));
    setConfirmTodoOk(false);
    toast.push({
      kind: 'success',
      title: 'Marcados todos en OK',
      description: 'Revisá si hay alguno con observación antes de firmar.',
    });
  }

  function resetTodo() {
    setItems(initItems());
    setFase('prechek');
    setHashFinal(null);
    setTimestampFinal(null);
    setKm('45821');
    setHorometro('1247');
  }

  // Conteos
  const ok = items.filter((i) => i.estado === 'ok').length;
  const obs = items.filter((i) => i.estado === 'observacion').length;
  const falla = items.filter((i) => i.estado === 'falla').length;
  const pendiente = items.filter((i) => i.estado === 'pendiente').length;
  const pct = Math.round((ok / items.length) * 100);
  const hayFallas = falla > 0;
  const puedeFinalizar = pendiente === 0;

  // Validación pre-check
  function validarPrechek(): boolean {
    const e: Record<string, string> = {};
    if (!movilSel) e.movil = 'Seleccioná un móvil';
    if (!km || Number(km) < 0) e.km = 'Kilometraje inválido';
    if (!horometro || Number(horometro) < 0) e.horometro = 'Horómetro inválido';
    if (!jefe || jefe.trim().length < 5) e.jefe = 'Apellido del jefe firmante';
    setErrPre(e);
    return Object.keys(e).length === 0;
  }

  function avanzarAChecklist() {
    if (!validarPrechek()) {
      toast.push({
        kind: 'warn',
        title: 'Completá el pre-check',
        description: 'Faltan datos del móvil o del jefe firmante.',
      });
      return;
    }
    setFase('checklist');
  }

  function intentarFirmar() {
    if (!puedeFinalizar) {
      toast.push({
        kind: 'warn',
        title: 'Faltan items',
        description: `${pendiente} sin marcar. Marcá todos antes de firmar.`,
      });
      return;
    }
    setConfirmFirma(true);
  }

  async function firmarFinal() {
    const payload = {
      movilId: movilSel,
      km,
      horometro,
      jefe,
      items: items.map((i) => ({
        id: i.id,
        estado: i.estado,
        nota: i.nota,
        foto: i.foto,
      })),
      ts: demoToday().toISOString(),
    };
    const json = JSON.stringify(payload);
    const buf = new TextEncoder().encode(json);
    const hashBuf = await crypto.subtle.digest('SHA-256', buf);
    const hex = Array.from(new Uint8Array(hashBuf))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
    setHashFinal(hex);
    setTimestampFinal(demoToday().toLocaleString('es-AR'));
    setConfirmFirma(false);
    setFase('final');
    if (hayFallas) {
      toast.push({
        kind: 'warn',
        title: `${movilSeleccionado?.codigo ?? movilSel} BLOQUEADO`,
        description: `${falla} falla(s) crítica(s). Taller notificado.`,
      });
    } else {
      toast.push({
        kind: 'success',
        title: `${movilSeleccionado?.codigo ?? movilSel} listo para operativo`,
        description: `${pct}% OK · ${obs} observaciones para taller.`,
      });
    }
  }

  function descargarPdf() {
    toast.push({
      kind: 'info',
      title: 'Generando PDF',
      description: `Truck-check-${movilSel}-${demoToday().toISOString().slice(0, 10)}.pdf`,
    });
  }

  const categorias = Array.from(new Set(items.map((i) => i.categoria)));

  // -------- VISTA PRECHEK --------
  if (fase === 'prechek') {
    return (
      <div className="mx-auto max-w-3xl space-y-5">
        <PageHero
          objetivo="Vista Mando · Revisión del móvil"
          titulo="Datos iniciales"
          descripcion="Antes de revisar los 31 ítems, registramos quién hace el control, en qué móvil y en qué condiciones lo entregás."
          icono={<Gauge size={26} />}
        />

        <Card>
          <CardContent className="space-y-4 p-5">
            <div>
              <Label>Móvil a chequear *</Label>
              <div className="mt-1 grid grid-cols-1 gap-2 sm:grid-cols-2">
                {movilesActivos.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setMovilSel(m.id)}
                    className={cn(
                      'flex items-start gap-3 rounded-lg border-2 p-3 text-left transition-all',
                      movilSel === m.id
                        ? 'border-brand-500 bg-brand-50'
                        : 'hover:border-brand-300 border-slate-200 bg-white',
                    )}
                  >
                    <div
                      className={cn(
                        'grid h-10 w-10 shrink-0 place-items-center rounded-lg',
                        movilSel === m.id
                          ? 'bg-brand-600 text-white'
                          : 'bg-slate-100 text-slate-600',
                      )}
                    >
                      <Truck size={18} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-slate-900">{m.codigo}</div>
                      <div className="text-xs text-slate-600">
                        {m.tipo} · {m.marca} {m.modelo}
                      </div>
                      <Badge intent={m.enServicio ? 'ok' : 'neutral'} className="mt-1">
                        {m.enServicio ? 'En servicio' : 'Fuera'}
                      </Badge>
                    </div>
                  </button>
                ))}
              </div>
              {errPre.movil && (
                <p className="text-status-risk-fg mt-1 text-xs font-medium">{errPre.movil}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Kilometraje *</Label>
                <Input
                  type="number"
                  value={km}
                  onChange={(e) => setKm(e.target.value)}
                  placeholder="45821"
                  aria-invalid={!!errPre.km}
                />
                {errPre.km && (
                  <p className="text-status-risk-fg mt-1 text-xs font-medium">{errPre.km}</p>
                )}
              </div>
              <div>
                <Label>Horómetro bomba *</Label>
                <Input
                  type="number"
                  value={horometro}
                  onChange={(e) => setHorometro(e.target.value)}
                  placeholder="1247"
                  aria-invalid={!!errPre.horometro}
                />
                {errPre.horometro && (
                  <p className="text-status-risk-fg mt-1 text-xs font-medium">{errPre.horometro}</p>
                )}
              </div>
            </div>

            <div>
              <Label>Jefe de servicio firmante *</Label>
              <Input
                value={jefe}
                onChange={(e) => setJefe(e.target.value)}
                placeholder="Apellido, Nombre"
                aria-invalid={!!errPre.jefe}
              />
              {errPre.jefe && (
                <p className="text-status-risk-fg mt-1 text-xs font-medium">{errPre.jefe}</p>
              )}
            </div>

            <div className="bg-brand-50 border-brand-100 flex items-start gap-2 rounded-lg border p-3 text-xs">
              <ClipboardCheck size={14} className="text-brand-600 mt-0.5 shrink-0" />
              <div className="text-brand-900">
                <strong>Próximo paso:</strong> 31 ítems en 6 categorías (Fluidos · Bomba · Eléctrico
                · Rescate · EPP · Aire comprimido · Médico). Marcá uno por uno con OK · Observación
                · Falla. Las observaciones y fallas requieren nota + foto.
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button intent="primary" size="lg" onClick={avanzarAChecklist}>
            Empezar revisión <ArrowRight size={16} />
          </Button>
        </div>
      </div>
    );
  }

  // -------- VISTA FINAL --------
  if (fase === 'final') {
    return (
      <div className="mx-auto max-w-4xl space-y-5">
        <PageHero
          objetivo="Vista Mando · Revisión del móvil"
          titulo={
            hayFallas
              ? `${movilSeleccionado?.codigo ?? movilSel} BLOQUEADO`
              : `${movilSeleccionado?.codigo ?? movilSel} listo`
          }
          descripcion={`Revisión finalizada el ${timestampFinal}. Firmado por ${jefe}.`}
          icono={hayFallas ? <Lock size={26} /> : <CheckCircle2 size={26} />}
          variant={hayFallas ? 'critical' : 'success'}
          meta={
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <Kpi label="OK" value={ok} hint={`${pct}%`} intent="ok" />
              <Kpi label="Observación" value={obs} intent={obs > 0 ? 'warn' : 'neutral'} />
              <Kpi label="Fallas" value={falla} intent={falla > 0 ? 'risk' : 'ok'} />
              <Kpi label="Total" value={items.length} intent="neutral" />
            </div>
          }
        />

        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <Card
            className={cn(
              'border-2',
              hayFallas
                ? 'border-status-risk/30 bg-status-risk-bg/30'
                : 'border-status-ok/30 bg-status-ok-bg/30',
            )}
          >
            <CardContent className="p-5">
              <div className="flex items-start gap-3">
                <div
                  className={cn(
                    'grid h-14 w-14 shrink-0 place-items-center rounded-2xl text-white',
                    hayFallas ? 'bg-status-risk' : 'bg-status-ok',
                  )}
                >
                  {hayFallas ? <Lock size={28} /> : <CheckCircle2 size={28} />}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-slate-900">
                    {hayFallas
                      ? `Móvil bloqueado · ${falla} falla(s) crítica(s)`
                      : `Revisión aprobada · ${pct}%`}
                  </h3>
                  <p className="mt-0.5 text-sm text-slate-700">
                    {hayFallas
                      ? 'No puede salir hasta resolver las fallas. Notificado al taller automáticamente.'
                      : `${obs} observación(es) en lista para taller. Mantenimiento agendado.`}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Badge intent={hayFallas ? 'risk' : 'ok'}>
                      <Hash size={11} /> Comprobante #{hashFinal?.slice(0, 8)}
                    </Badge>
                    <Badge intent="neutral">
                      <Gauge size={11} /> {km} km · {horometro}h
                    </Badge>
                    <Badge intent="neutral">Firmado por {jefe}</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Resumen ítems observados/fallados */}
        {(obs > 0 || falla > 0) && (
          <Card>
            <CardContent className="p-5">
              <h3 className="mb-3 font-bold text-slate-900">Ítems a resolver</h3>
              <ul className="space-y-2">
                {items
                  .filter((i) => i.estado === 'observacion' || i.estado === 'falla')
                  .map((i) => (
                    <li
                      key={i.id}
                      className={cn(
                        'rounded-lg p-3',
                        i.estado === 'falla'
                          ? 'bg-status-risk-bg/30 border-status-risk/30 border'
                          : 'bg-status-warn-bg/30 border-status-warn/30 border',
                      )}
                    >
                      <div className="flex items-start gap-2">
                        <Badge intent={i.estado === 'falla' ? 'risk' : 'warn'}>
                          {ESTADO_CONFIG[i.estado].icon}
                          {ESTADO_CONFIG[i.estado].label}
                        </Badge>
                        <div className="flex-1">
                          <div className="text-sm font-semibold text-slate-900">{i.item}</div>
                          <div className="text-xs text-slate-700">{i.categoria}</div>
                          {i.nota && (
                            <p className="mt-1 text-xs text-slate-700">&ldquo;{i.nota}&rdquo;</p>
                          )}
                          {i.foto && (
                            <Badge intent="neutral" className="mt-1">
                              <Camera size={10} /> Foto adjunta
                            </Badge>
                          )}
                        </div>
                      </div>
                    </li>
                  ))}
              </ul>
            </CardContent>
          </Card>
        )}

        <div className="flex flex-wrap justify-end gap-2">
          <Button intent="ghost" onClick={resetTodo}>
            Nueva revisión
          </Button>
          <Button intent="secondary" onClick={descargarPdf}>
            <Download size={14} /> Descargar PDF
          </Button>
          <Button intent="secondary" onClick={() => router.back()}>
            <FileText size={14} /> Volver a automotores
          </Button>
        </div>
      </div>
    );
  }

  // -------- VISTA CHECKLIST --------
  return (
    <>
      <div className="mx-auto max-w-6xl space-y-5">
        <PageHero
          objetivo="Vista Mando · Revisión del móvil"
          titulo={`${movilSeleccionado?.codigo ?? movilSel} · Revisión`}
          descripcion={`31 ítems en 6 categorías. ${pendiente} sin marcar. ${km} km · ${horometro}h · Jefe ${jefe}.`}
          icono={<ClipboardCheck size={26} />}
          variant={hayFallas ? 'critical' : pct === 100 && pendiente === 0 ? 'success' : 'default'}
          meta={
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <Kpi label="OK" value={ok} hint={`${pct}%`} intent="ok" />
              <Kpi label="Observación" value={obs} intent={obs > 0 ? 'warn' : 'neutral'} />
              <Kpi label="Fallas" value={falla} intent={falla > 0 ? 'risk' : 'ok'} />
              <Kpi label="Pendientes" value={pendiente} intent="neutral" />
            </div>
          }
          acciones={
            <>
              <Button intent="ghost" size="sm" onClick={() => setFase('prechek')}>
                <ChevronLeft size={12} /> Datos iniciales
              </Button>
              <Button intent="ghost" size="sm" onClick={marcarTodoOk}>
                <Check size={12} /> Marcar todo OK
              </Button>
              <Button intent="primary" onClick={intentarFirmar} disabled={pendiente > 0}>
                <CheckCircle2 size={14} /> Firmar
              </Button>
            </>
          }
        />

        {/* Progress visual */}
        <Card>
          <CardContent className="p-4">
            <div className="mb-2 flex items-center justify-between text-xs font-semibold text-slate-700">
              <span>Avance de la revisión</span>
              <span>
                {items.length - pendiente}/{items.length}
              </span>
            </div>
            <div className="bg-brand-50 h-2 overflow-hidden rounded-full">
              <motion.div
                initial={{ width: 0 }}
                animate={{
                  width: `${((items.length - pendiente) / items.length) * 100}%`,
                }}
                className={cn('h-full rounded-full', hayFallas ? 'bg-status-risk' : 'bg-brand-500')}
              />
            </div>
          </CardContent>
        </Card>

        {/* Items por categoría */}
        <div className="space-y-3">
          {categorias.map((cat) => {
            const itemsCat = items.filter((i) => i.categoria === cat);
            const okCat = itemsCat.filter((i) => i.estado === 'ok').length;
            const pctCat = Math.round((okCat / itemsCat.length) * 100);
            const pendCat = itemsCat.filter((i) => i.estado === 'pendiente').length;
            return (
              <Card key={cat}>
                <CardContent className="p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="font-bold text-slate-900">{cat}</h3>
                    <Badge intent={pctCat === 100 ? 'ok' : pendCat > 0 ? 'neutral' : 'warn'}>
                      {okCat}/{itemsCat.length}
                    </Badge>
                  </div>
                  <ul className="space-y-1.5">
                    {itemsCat.map((item) => {
                      return (
                        <li
                          key={item.id}
                          className={cn(
                            'flex items-center gap-3 rounded-lg p-2.5 transition-colors',
                            item.estado === 'ok'
                              ? 'bg-status-ok-bg/30'
                              : item.estado === 'observacion'
                                ? 'bg-status-warn-bg/30'
                                : item.estado === 'falla'
                                  ? 'bg-status-risk-bg/30'
                                  : 'bg-slate-50',
                          )}
                        >
                          <div className="flex-1">
                            <div className="text-sm font-medium text-slate-900">{item.item}</div>
                            {item.nota && (
                              <div className="mt-0.5 flex items-center gap-1 text-xs text-slate-600">
                                {item.foto && <Camera size={10} />}
                                <span className="italic">&ldquo;{item.nota}&rdquo;</span>
                              </div>
                            )}
                          </div>
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
                        </li>
                      );
                    })}
                  </ul>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card className="border-slate-200 bg-slate-50">
          <CardContent className="flex items-start gap-3 p-4 text-sm text-slate-600">
            <ClipboardCheck size={18} className="mt-0.5 shrink-0 text-slate-400" />
            <div>
              <strong className="text-slate-900">Al firmar:</strong> queda guardada para siempre la
              revisión completa con notas, fotos y los datos del jefe. Si hay fallas, el móvil se
              bloquea automáticamente.
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dialog: agregar nota a observación/falla */}
      <Dialog
        open={!!editandoItem}
        onClose={() => setEditandoItem(null)}
        title={
          editandoItem?.estado === 'falla'
            ? `Falla · ${editandoItem.item.item}`
            : `Observación · ${editandoItem?.item.item ?? ''}`
        }
        description="Las fallas y observaciones requieren nota explicativa y foto opcional."
      >
        <AnimatePresence>
          {editandoItem && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-3"
            >
              <div
                className={cn(
                  'rounded-lg p-3 text-xs',
                  editandoItem.estado === 'falla'
                    ? 'bg-status-risk-bg text-status-risk-fg'
                    : 'bg-status-warn-bg text-status-warn-fg',
                )}
              >
                <strong>{editandoItem.estado === 'falla' ? '⛔ FALLA' : '⚠️ Observación'}:</strong>{' '}
                {editandoItem.estado === 'falla'
                  ? 'El móvil queda BLOQUEADO si finalizás con fallas.'
                  : 'Quedará en la lista de pendientes para taller. No bloquea el móvil.'}
              </div>

              <div>
                <Label>Nota * (mín 8 caracteres)</Label>
                <textarea
                  value={notaBuffer}
                  onChange={(e) => setNotaBuffer(e.target.value)}
                  rows={3}
                  placeholder="Ej: Manguera 63mm con desgaste en racor, reemplazar antes del próximo turno"
                  className="focus:border-brand-400 mt-1 w-full rounded-lg border border-slate-200 bg-white p-2 text-sm outline-none focus:ring-2"
                />
                <div className="mt-1 text-xs text-slate-500">{notaBuffer.length}/8 mínimo</div>
              </div>

              <div>
                <Label>Foto del item (opcional)</Label>
                {fotoBuffer ? (
                  <div className="bg-brand-50 mt-1 flex items-center gap-2 rounded-lg p-2 text-xs">
                    <Camera size={14} className="text-brand-600" />
                    <span className="text-brand-900 flex-1">Foto adjuntada · {fotoBuffer}</span>
                    <button
                      type="button"
                      onClick={() => setFotoBuffer(undefined)}
                      className="text-status-risk-fg text-xs underline"
                    >
                      Quitar
                    </button>
                  </div>
                ) : (
                  <Button
                    intent="secondary"
                    size="sm"
                    onClick={simularFoto}
                    className="mt-1"
                    fullWidth
                  >
                    <Camera size={14} /> Tomar foto
                  </Button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div className="mt-5 flex justify-end gap-2 border-t border-slate-100 pt-4">
          <Button intent="ghost" onClick={() => setEditandoItem(null)}>
            Cancelar
          </Button>
          <Button intent="primary" onClick={guardarNota}>
            Guardar
          </Button>
        </div>
      </Dialog>

      {/* Confirm marcar todo OK */}
      <ConfirmDialog
        open={confirmTodoOk}
        onClose={() => setConfirmTodoOk(false)}
        onConfirm={aplicarTodoOk}
        titulo="¿Marcar los 31 ítems como OK?"
        descripcion="Después podés volver a marcar observaciones o fallas si hace falta."
        confirmarLabel="Sí, marcar todo OK"
        variant="warning"
      />

      {/* Confirm firma */}
      <ConfirmDialog
        open={confirmFirma}
        onClose={() => setConfirmFirma(false)}
        onConfirm={firmarFinal}
        titulo={hayFallas ? `Firmar y BLOQUEAR ${movilSeleccionado?.codigo}` : 'Firmar revisión'}
        descripcion={
          hayFallas
            ? `Estás por firmar una revisión con ${falla} falla(s). El móvil quedará bloqueado y no podrá salir a operativo hasta que el taller resuelva. Esta acción no se puede deshacer y queda registrada.`
            : `Estás por firmar la revisión del ${movilSeleccionado?.codigo} con ${ok} ítems OK${obs > 0 ? ` y ${obs} observación(es)` : ''}. Queda guardada para siempre.`
        }
        confirmarLabel={hayFallas ? 'Sí, bloquear móvil' : 'Sí, firmar'}
        variant={hayFallas ? 'destructive' : 'warning'}
      />
    </>
  );
}
