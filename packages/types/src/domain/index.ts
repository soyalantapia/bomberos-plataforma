export type Perfil =
  | 'bombero'
  | 'mando'
  | 'administrativo'
  | 'gobierno'
  | 'federacion';

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

export type TipoServicio =
  | 'incendio'
  | 'rescate'
  | 'accidente'
  | 'forestal'
  | 'otro';

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

export type TipoAlerta =
  | 'vtv'
  | 'curso'
  | 'aptitud'
  | 'dotacion'
  | 'rendicion'
  | 'aprobacion';

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
