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
}

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
  salud: {
    grupoSanguineo?: string;
    aptitudVencimiento?: string;
    alerta?: string;
  };
  cursos: Curso[];
  licenciaConducirVencimiento?: string;
  licenciaConducirCategorias?: string[];
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
