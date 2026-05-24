/**
 * Tipos de dominio compartidos por toda la plataforma Faro.
 * Aún sin implementar — placeholders para que web y api compartan vocabulario.
 * El modelado real se hace cuando arranque el paso 2 (con la documentación de producto).
 */

export type Perfil = 'bombero' | 'mando' | 'administrativo' | 'gobierno' | 'federacion';

export type PrioridadFaro = 'operativa' | 'minima';

export type EstadoSemaforo = 'ok' | 'warn' | 'risk' | 'neutral';
