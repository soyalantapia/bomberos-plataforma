import type { AmbitoInstitucional, CargoInstitucional, Perfil, Persona } from '@faro/types';

/**
 * Capa de permisos (RBAC) sobre la pirámide institucional.
 *
 * La autoridad combina tres ejes:
 *  - perfil activo de la sesión (mando, bombero, gobierno, …)
 *  - cargo institucional (Presidente, Jefe de Cuerpo, Jefe de área, …)
 *  - jerarquía bomberil (comandante … cadete)
 *
 * Regla de oro del feedback: el de arriba ve todo de su órgano; el de
 * abajo ve lo propio + comunicación interna. La calificación personal
 * es privada (cada uno ve sólo la suya).
 */

export type Capacidad =
  | 'organigrama.ver'
  | 'organigrama.editar'
  | 'tareas.asignar'
  | 'tareas.verTodas'
  | 'calificacion.verPropia'
  | 'calificacion.verTodas'
  | 'calificacion.calificar'
  | 'personal.verSensible' // ficha médica, sanciones, datos sensibles
  | 'finanzas.ver';

const CARGOS_CONSEJO: CargoInstitucional[] = [
  'presidente',
  'vicepresidente',
  'secretario',
  'tesorero',
  'protesorero',
  'vocal',
  'revisor_cuentas',
];

const CARGOS_CONDUCCION: CargoInstitucional[] = ['jefe_cuerpo', 'segundo_jefe', 'jefe_area'];

export const CARGO_LABEL: Record<CargoInstitucional, string> = {
  presidente: 'Presidente',
  vicepresidente: 'Vicepresidente',
  secretario: 'Secretario',
  tesorero: 'Tesorero',
  protesorero: 'Protesorero',
  vocal: 'Vocal',
  revisor_cuentas: 'Revisor de cuentas',
  jefe_cuerpo: 'Jefe de Cuerpo',
  segundo_jefe: '2º Jefe',
  jefe_area: 'Jefe de área',
  ninguno: '—',
};

export const AMBITO_LABEL: Record<AmbitoInstitucional, string> = {
  consejo_directivo: 'Consejo Directivo',
  cuerpo_activo: 'Cuerpo Activo',
};

/** Órgano de la pirámide al que pertenece un cargo. */
export function ambitoDeCargo(cargo?: CargoInstitucional): AmbitoInstitucional | null {
  if (!cargo || cargo === 'ninguno') return null;
  if (CARGOS_CONSEJO.includes(cargo)) return 'consejo_directivo';
  if (CARGOS_CONDUCCION.includes(cargo)) return 'cuerpo_activo';
  return null;
}

export function esPresidente(p?: Persona | null): boolean {
  return p?.cargoInstitucional === 'presidente';
}

export function esJefeCuerpo(p?: Persona | null): boolean {
  return p?.cargoInstitucional === 'jefe_cuerpo';
}

/** Conducción del cuerpo activo (jefe, 2º jefe, jefe de área). */
export function esConduccion(p?: Persona | null): boolean {
  return !!p?.cargoInstitucional && CARGOS_CONDUCCION.includes(p.cargoInstitucional);
}

/** Determina si una persona/perfil puede ejercer una capacidad. */
export function puede(
  persona: Persona | null | undefined,
  perfilActivo: Perfil | null | undefined,
  cap: Capacidad,
): boolean {
  const cargo = persona?.cargoInstitucional ?? 'ninguno';
  const esMando = perfilActivo === 'mando';
  const esGobierno = perfilActivo === 'gobierno';
  const presidente = cargo === 'presidente';
  const conduccion = CARGOS_CONDUCCION.includes(cargo);
  const jefeOPres = cargo === 'jefe_cuerpo' || cargo === 'segundo_jefe' || presidente;

  switch (cap) {
    case 'organigrama.ver':
    case 'calificacion.verPropia':
      // Todos los miembros ven el organigrama y su propia calificación.
      return true;
    case 'organigrama.editar':
      return presidente || cargo === 'jefe_cuerpo' || esMando || esGobierno;
    case 'tareas.asignar':
      return conduccion || esMando;
    case 'tareas.verTodas':
      return jefeOPres || esMando;
    case 'calificacion.verTodas':
      return jefeOPres || esMando;
    case 'calificacion.calificar':
      return conduccion || esMando;
    case 'personal.verSensible':
      return jefeOPres || esMando || esGobierno;
    case 'finanzas.ver':
      return presidente || cargo === 'tesorero' || cargo === 'protesorero' || esMando;
    default:
      return false;
  }
}
