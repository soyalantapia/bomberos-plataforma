export type Perfil = 'bombero' | 'mando' | 'administrativo' | 'gobierno' | 'federacion';

export type PrioridadFaro = 'operativa' | 'minima';

export type EstadoSemaforo = 'ok' | 'warn' | 'risk' | 'neutral';

export interface Cuartel {
  id: string;
  nombre: string;
  ciudad: string;
  provincia: string;
  region: string;
  lat: number;
  lng: number;
  cumplimiento: EstadoSemaforo;
  porcentajeRendicion: number;
  fundacion?: string;
  matricula?: string;
  jefe?: string;
  /** Logo/escudo del cuartel. Relativo a /public (ej: "/cuarteles/villa-ballester.png"). */
  logoUrl?: string;
}

// ============================================================
// ESTRUCTURA ORGANIZACIONAL — pirámide institucional.
// Un cuartel se divide en dos órganos: el Consejo Directivo
// (administrativo, autoridad máxima = Presidente) y el Cuerpo
// Activo (operativo, conducción = Jefe de Cuerpo). El cuartel
// central puede tener destacamentos dependientes.
// ============================================================

/** A qué órgano de la pirámide pertenece un cargo. */
export type AmbitoInstitucional = 'consejo_directivo' | 'cuerpo_activo';

/** Cargo institucional. Consejo Directivo + conducción del Cuerpo Activo. */
export type CargoInstitucional =
  // Consejo Directivo (administrativo)
  | 'presidente'
  | 'vicepresidente'
  | 'secretario'
  | 'tesorero'
  | 'protesorero'
  | 'vocal'
  | 'revisor_cuentas'
  // Cuerpo Activo (operativo)
  | 'jefe_cuerpo'
  | 'segundo_jefe'
  | 'jefe_area'
  // Resto del cuerpo activo, sin cargo de conducción
  | 'ninguno';

/** Miembro del Consejo Directivo. Puede o no ser bombero activo (personaId). */
export interface MiembroConsejo {
  id: string;
  cuartelId: string;
  nombre: string;
  cargo: CargoInstitucional;
  /** Inicio del mandato (ISO date). */
  desde?: string;
  telefono?: string;
  email?: string;
  /** Si además integra el cuerpo activo, referencia a Persona. */
  personaId?: string;
}

/** Sector funcional del cuartel (automotores, materiales, intendencia…). */
export interface Sector {
  id: string;
  cuartelId: string;
  nombre: string;
  /** Nombre de ícono lucide para la UI. */
  icono?: string;
  /** Persona responsable del sector (jefe de área). */
  responsableId?: string;
  descripcion?: string;
}

/** Destacamento dependiente de un cuartel central. */
export interface Destacamento {
  id: string;
  /** Cuartel central del que depende. */
  cuartelId: string;
  nombre: string;
  esCentral: boolean;
  direccion?: string;
  /** Jefe de destacamento. */
  jefeId?: string;
}

// ============================================================
// TAREAS POR SECTOR — circuito asignar → ejecutar → controlar
// → cerrar. El jefe de área asigna, la persona ejecuta o reporta
// bloqueo, el jefe valida o reabre. Todo queda registrado.
// ============================================================

export type EstadoTarea =
  | 'asignada'
  | 'en_progreso'
  | 'hecha'
  | 'bloqueada'
  | 'validada'
  | 'reabierta';

export type PrioridadTarea = 'baja' | 'media' | 'alta';

export interface TareaEvento {
  fecha: string;
  actorId: string;
  /** asignada | tomada | hecha | bloqueada | validada | reabierta | comentario */
  accion: string;
  nota?: string;
}

export interface Tarea {
  id: string;
  cuartelId: string;
  sectorId?: string;
  titulo: string;
  descripcion?: string;
  /** Persona responsable de ejecutarla. */
  asignadaA: string;
  /** Jefe/responsable que la asignó. */
  asignadaPor: string;
  creadaEn: string;
  vencimiento?: string;
  estado: EstadoTarea;
  prioridad: PrioridadTarea;
  /** Bitácora del circuito (auditable). */
  historial: TareaEvento[];
  comentarioCierre?: string;
  motivoBloqueo?: string;
  validadaPor?: string;
  validadaEn?: string;
}

// ============================================================
// PERSONAL Y CUMPLIMIENTO (F2)
// Fichaje de presencia (ingreso/egreso + permanencia, simula el
// lector de huella), reconocimientos (premio/sanción) y la
// calificación mensual privada.
// ============================================================

/** Registro de presencia física en la institución. */
export interface Fichaje {
  id: string;
  cuartelId: string;
  destacamentoId?: string;
  personaId: string;
  /** ISO datetime de ingreso. */
  ingreso: string;
  /** ISO datetime de egreso (si está abierto, undefined). */
  egreso?: string;
  fuente: 'huella' | 'app' | 'manual';
  /** Qué vino a hacer (opcional). */
  actividad?: string;
}

export type TipoReconocimiento = 'premio' | 'sancion';

/** Premio o sanción registrado a una persona; queda en su legajo. */
export interface Reconocimiento {
  id: string;
  cuartelId: string;
  personaId: string;
  tipo: TipoReconocimiento;
  motivo: string;
  fecha: string;
  otorgadoPor: string;
}

/** Calificación mensual. Privada: cada bombero ve sólo la suya. */
export interface Calificacion {
  id: string;
  cuartelId: string;
  personaId: string;
  /** Período YYYY-MM. */
  periodo: string;
  /** Puntaje 0–100. */
  puntaje: number;
  nota?: string;
  calificadoPor: string;
  fecha: string;
}

// ============================================================
// SALUD Y SEGURIDAD (F3)
// Registro de lesiones en intervención (constancia + ART) y la
// ficha médica/aptitud por persona (extiende Persona.salud).
// ============================================================

export type GravedadLesion = 'leve' | 'moderada' | 'grave';
export type EstadoLesion = 'reportada' | 'en_tratamiento' | 'cerrada';

/** Lesión/accidente sufrido por un bombero, normalmente en intervención. */
export interface Lesion {
  id: string;
  cuartelId: string;
  /** Bombero lesionado. */
  personaId: string;
  /** Intervención asociada (si la hubo). */
  servicioId?: string;
  fecha: string;
  descripcion: string;
  parteCuerpo?: string;
  gravedad: GravedadLesion;
  /** ¿Requirió atención médica? */
  requiereAtencion: boolean;
  /** Centro/hospital de derivación. */
  derivadoA?: string;
  /** ¿Se reportó a la ART? */
  art: boolean;
  reportadoPor: string;
  estado: EstadoLesion;
}

/** Aptitud física para el servicio. */
export type AptoFisico = 'apto' | 'observaciones' | 'no_apto' | 'pendiente';

export type EspecialidadBombero =
  | 'hazmat'
  | 'rescate_acuatico'
  | 'rescate_altura'
  | 'rescate_vehicular'
  | 'primeros_auxilios'
  | 'conductor_maquinista'
  | 'desfibrilador'
  | 'comunicaciones'
  | 'forestal'
  | 'busqueda_rescate';

export type NivelContactoRed = 'federacion' | 'region' | 'cuartel';

export type CategoriaContacto =
  | 'gobierno'
  | 'salud'
  | 'seguridad'
  | 'servicios'
  | 'logistica'
  | 'medios'
  | 'otro';

export interface ContactoRed {
  id: string;
  nombre: string;
  cargo: string;
  organismo?: string;
  telefonos: string[];
  email?: string;
  whatsapp?: string;
  direccion?: string;
  nivel: NivelContactoRed;
  regionId?: string;
  cuartelId?: string;
  categoria: CategoriaContacto;
  tags?: string[];
  notas?: string;
  agregadoPor: string;
  agregadoEn: string;
  ultimoUso?: {
    personaId: string;
    fecha: string;
    tipo: 'llamada' | 'whatsapp' | 'email';
  };
  usosTotal: number;
  activo: boolean;
}

export interface RegionInfo {
  id: string;
  nombre: string;
  responsableId?: string;
  descripcion?: string;
}

export type Jerarquia =
  | 'cadete'
  | 'bombero'
  | 'bombero_1ra'
  | 'cabo'
  | 'sargento'
  | 'sargento_ayudante'
  | 'oficial'
  | 'sub_comandante'
  | 'comandante'
  | 'jefe';

export type EstadoPersona = 'activo' | 'baja' | 'licencia' | 'jubilado';

export interface Curso {
  id: string;
  nombre: string;
  vencimiento?: string;
  centro?: string;
  vigente: boolean;
}

export interface Persona {
  id: string;
  cuartelId: string;
  legajo: string;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  fechaNacimiento: string;
  fechaIngreso: string;
  jerarquia: Jerarquia;
  estado: EstadoPersona;
  base: string;
  funcion: string;
  fotoUrl?: string;
  perfiles: Perfil[];
  especialidades?: EspecialidadBombero[];
  cuerpo?: 'activo' | 'administrativo';
  /** Cargo de conducción (si lo tiene). Default 'ninguno'. */
  cargoInstitucional?: CargoInstitucional;
  /** Sector funcional donde cumple tareas. */
  sectorId?: string;
  /** Destacamento de base. */
  destacamentoId?: string;
  salud: {
    grupoSanguineo?: string;
    aptitudVencimiento?: string;
    alerta?: string;
    /** Aptitud física para el servicio. */
    aptoFisico?: AptoFisico;
    /** Medicación habitual (dato sensible). */
    medicacion?: string;
    /** Antecedentes/dolencias relevantes (dato sensible). */
    antecedentes?: string;
    obraSocial?: string;
  };
  cursos: Curso[];
  licenciaConducirVencimiento?: string;
  licenciaConducirCategorias?: string[];
  /** Sexo registrado en el alta. En el padrón importado vive en `legajoExtra.sexo`. */
  sexo?: 'Masculino' | 'Femenino' | 'X';
  /** Datos extendidos del legajo (compatibles con el formato GIB/FAVBPBA). */
  legajoExtra?: LegajoExtra;
}

export interface LegajoExtra {
  // Identificación
  dni?: string;
  sexo?: 'Masculino' | 'Femenino' | 'X';
  jerarquiaReal?: string; // texto crudo: "Comandante Mayor", "Oficial Aux. de Dotación"
  cargoInstitucion?: string; // "Numerario", "Miembro C.D.", etc.
  cargoFederativo?: string;
  escalafon?: string; // "Cuerpo Activo", "C.Directiva", etc.
  fechaJerarquia?: string;
  fechaAlta?: string; // alta institucional (puede diferir de fechaIngreso)
  // Domicilio
  domicilio?: string;
  entreCalle?: string;
  yCalle?: string;
  localidad?: string;
  codigoPostal?: string;
  partido?: string;
  barrio?: string;
  provincia?: string;
  pais?: string;
  // Datos personales
  lugarNacimiento?: string;
  provinciaNacimiento?: string;
  estadoCivil?: string;
  altura?: string; // metros: "1.75"
  peso?: string; // kg
  donante?: 'SI' | 'NO' | '';
  // Contacto extra
  celular?: string;
  ciaCelular?: string; // "Personal", "Claro", "Movistar"
  emailFederativo?: string;
  // Cobertura / administrativo
  ioma?: string;
  observaciones?: string;
  // Registros institucionales
  acta?: string;
  folio?: string;
  libro?: string;
  ordenInterno?: string;
  // Computos
  calificaComputos?: 'SI' | 'NO' | '';
  informaComputos?: 'SI' | 'NO' | '';
  // Sistema
  region?: string;
  escuela?: string;
}

export interface Movil {
  id: string;
  cuartelId: string;
  codigo: string;
  tipo: 'autobomba' | 'rescate' | 'forestal' | 'ambulancia' | 'utilitario';
  marca: string;
  modelo: string;
  dominio: string;
  anio: number;
  enServicio: boolean;
  vtvVencimiento: string;
  horasServicio: number;
}

export type TipoServicio = 'incendio' | 'rescate' | 'accidente' | 'forestal' | 'otro';

export interface Servicio {
  id: string;
  cuartelId: string;
  tipo: TipoServicio;
  direccion: string;
  lat: number;
  lng: number;
  movilId: string;
  dotacionIds: string[];
  horaSalida: string;
  horaRegreso: string;
  origen: 'app' | 'manual';
  estado: 'pendiente_validacion' | 'validado' | 'rechazado';
  notas?: string;
  creadoPor: string;
  creadoEn: string;
  confirmadoPor?: string;
  confirmadoEn?: string;
}

export interface Guardia {
  id: string;
  cuartelId: string;
  fecha: string;
  turno: 'manana' | 'tarde' | 'noche';
  movilId: string;
  dotacionIds: string[];
  cubierta: boolean;
}

export type TipoAsistencia =
  | 'accidental'
  | 'obligatorio'
  | 'guardia'
  | 'jefatura'
  | 'orden_interno'
  | 'licencia'
  | 'sancion';

export interface Asistencia {
  id: string;
  cuartelId: string;
  personaId: string;
  fecha: string;
  tipo: TipoAsistencia;
  horas: number;
  servicioId?: string;
}

export interface ComputoPersona {
  personaId: string;
  cuartelId: string;
  mes: string;
  accidental: number;
  obligatorio: number;
  guardia: number;
  jefatura: number;
  ordenInterno: number;
  licencia: number;
  sancion: number;
  total: number;
}

export interface RequisitoRendicion {
  id: string;
  titulo: string;
  descripcion: string;
  completo: boolean;
  avance: number;
  linkPagina?: string;
  importanciaTexto?: string;
}

export interface Rendicion {
  id: string;
  cuartelId: string;
  periodo: string;
  estado: 'borrador' | 'lista_para_presentar' | 'presentada' | 'rechazada';
  porcentaje: number;
  requisitos: RequisitoRendicion[];
  presentadaEn?: string;
  presentadaPor?: string;
}

export type TipoAlerta = 'vtv' | 'curso' | 'aptitud' | 'dotacion' | 'rendicion' | 'aprobacion';

export interface Alerta {
  id: string;
  cuartelId: string;
  tipo: TipoAlerta;
  severidad: EstadoSemaforo;
  titulo: string;
  descripcion: string;
  fechaLimite?: string;
  entidad?: { tipo: string; id: string };
}

export interface Notificacion {
  id: string;
  cuartelId: string;
  destinatarioId: string;
  tipo: string;
  titulo: string;
  descripcion: string;
  leida: boolean;
  fecha: string;
  linkPagina?: string;
}

export interface AuditEvent {
  id: string;
  actor: string;
  actorPerfil: Perfil;
  action: string;
  entityType: string;
  entityId: string;
  diff?: Record<string, [unknown, unknown]>;
  timestamp: string;
}

export interface SesionUsuario {
  personaId: string;
  cuartelId: string;
  perfilActivo: Perfil;
  perfilesDisponibles: Perfil[];
  cuartelesDisponibles: string[];
  iniciadaEn: string;
}

export interface PropuestaServicioIA {
  tipo?: TipoServicio;
  direccion?: string;
  movilCodigo?: string;
  dotacionLegajos?: string[];
  horaSalida?: string;
  horaRegreso?: string;
  confianza: number;
  comentario?: string;
}

export interface ItemCopilotoRendicion {
  requisitoId: string;
  titulo: string;
  diagnostico: string;
  acciones: string[];
  importanciaTexto: string;
  textoRedactado?: string;
}

// ============================================================
// FINANZAS — módulo contable / tesorería para asociaciones
// civiles de bomberos voluntarios. Cubre Ley 25.054 (rendición
// 70% personal rentado), DPPJ (libros obligatorios) y AFIP
// (DDJJ, exención ganancias).
// ============================================================

/** Tipo contable raíz según plan de cuentas estándar */
export type TipoCuentaContable = 'activo' | 'pasivo' | 'patrimonio' | 'ingreso' | 'egreso';

/** Subtipo de ingreso para reportes (Ley 25.054 separa subsidios) */
export type CategoriaIngreso =
  | 'subsidio_nacional'
  | 'subsidio_provincial'
  | 'subsidio_municipal'
  | 'cuota_social'
  | 'donacion'
  | 'servicio_facturado'
  | 'rifa_evento'
  | 'rendimiento_financiero'
  | 'otro_ingreso';

/** Subtipo de egreso — el 70% obligatorio Ley 25.054 es 'personal_rentado' */
export type CategoriaEgreso =
  | 'personal_rentado'
  | 'combustible'
  | 'mantenimiento_movil'
  | 'epp_equipamiento'
  | 'capacitacion'
  | 'servicios_publicos'
  | 'seguros'
  | 'insumos_medicos'
  | 'administrativo'
  | 'impuestos_tasas'
  | 'inversion_bienes_uso'
  | 'otro_egreso';

export type MedioPago =
  | 'efectivo'
  | 'transferencia'
  | 'cheque'
  | 'tarjeta_debito'
  | 'tarjeta_credito'
  | 'mercadopago'
  | 'debito_automatico';

export type EstadoMovimiento = 'borrador' | 'conciliado' | 'rechazado' | 'anulado';

export type TipoCaja =
  | 'caja_chica'
  | 'caja_principal'
  | 'banco_cc'
  | 'banco_ca'
  | 'mercadopago'
  | 'plazo_fijo';

export interface CuentaContable {
  id: string;
  /** Código jerárquico tipo "5.1.01" (Egresos · Personal · Sueldos) */
  codigo: string;
  nombre: string;
  tipo: TipoCuentaContable;
  /** Subcategoría operativa (mapea a CategoriaIngreso o CategoriaEgreso) */
  categoria?: CategoriaIngreso | CategoriaEgreso;
  parentId?: string;
  /** Presupuesto mensual estimado en ARS */
  presupuestoMensual?: number;
  /** Presupuesto anual estimado en ARS */
  presupuestoAnual?: number;
  /** Si es cuenta operable (true) o agrupadora */
  operable: boolean;
  cuartelId: string;
  notas?: string;
}

export interface Caja {
  id: string;
  cuartelId: string;
  nombre: string;
  tipo: TipoCaja;
  /** Nombre del banco si es cuenta bancaria */
  banco?: string;
  cbu?: string;
  alias?: string;
  numeroCuenta?: string;
  saldoActual: number;
  /** Último saldo conciliado contra extracto bancario */
  saldoConciliado?: number;
  fechaUltimaConciliacion?: string;
  responsableId?: string;
  moneda: 'ARS' | 'USD';
  activa: boolean;
}

export interface MovimientoFinanciero {
  id: string;
  cuartelId: string;
  tipo: 'ingreso' | 'egreso' | 'transferencia';
  fecha: string;
  monto: number;
  cuentaId: string;
  cajaOrigenId?: string;
  /** Si es transferencia, la caja destino */
  cajaDestinoId?: string;
  medio: MedioPago;
  descripcion: string;
  /** Proveedor (egreso) o donante/cliente (ingreso) */
  contraparte?: string;
  cuitContraparte?: string;
  /** Tipo y número de comprobante (FA-A-0001-00012345) */
  comprobanteTipo?: 'FA-A' | 'FA-B' | 'FA-C' | 'NC' | 'ND' | 'Recibo' | 'Ticket' | 'Otro';
  comprobanteNumero?: string;
  /** Foto/PDF del comprobante en storage */
  comprobanteUrl?: string;
  estado: EstadoMovimiento;
  /** Si el movimiento se aplicó a una rendición Ley 25.054 */
  rendicionId?: string;
  /** Si vincula a un incidente (egreso operativo) */
  servicioId?: string;
  /** Si vincula a un móvil (combustible/mantenimiento) */
  movilId?: string;
  /** Si es sueldo, persona */
  personaId?: string;
  cargadoPor: string;
  cargadoEn: string;
  /** Hash SHA-256 del movimiento al conciliar (inmutable) */
  hashAudit?: string;
  notas?: string;
}

export interface CuotaSocial {
  id: string;
  cuartelId: string;
  /** ID del socio (referencia a Persona si es bombero, o socio independiente) */
  socioId: string;
  socioNombre: string;
  periodo: string;
  monto: number;
  vencimiento: string;
  estado: 'pendiente' | 'pagada' | 'vencida' | 'condonada';
  pagadoEn?: string;
  medio?: MedioPago;
  movimientoId?: string;
  cargoRecargo?: number;
}

export interface PresupuestoAnual {
  id: string;
  cuartelId: string;
  anio: number;
  /** Estado del presupuesto: borrador / aprobado / cerrado */
  estado: 'borrador' | 'aprobado' | 'cerrado';
  aprobadoPor?: string;
  aprobadoEn?: string;
  /** Total proyectado de ingresos */
  totalIngresos: number;
  /** Total proyectado de egresos */
  totalEgresos: number;
  /** Líneas por cuenta */
  lineas: Array<{
    cuentaId: string;
    montoAnual: number;
    distribucionMensual?: number[];
  }>;
}

export interface ConciliacionBancaria {
  id: string;
  cuartelId: string;
  cajaId: string;
  periodo: string;
  saldoSistema: number;
  saldoExtracto: number;
  diferencia: number;
  movimientosConciliados: string[];
  movimientosPendientes: string[];
  ajustes: Array<{ descripcion: string; monto: number }>;
  estado: 'pendiente' | 'conciliada' | 'con_diferencias';
  hashConciliacion?: string;
}
