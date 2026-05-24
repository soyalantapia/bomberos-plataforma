import type { Alerta } from '@faro/types';
import { CUARTEL_PRINCIPAL_ID } from './cuarteles';

export const alertasMock: Alerta[] = [
  { id: 'a-1', cuartelId: CUARTEL_PRINCIPAL_ID, tipo: 'vtv', severidad: 'warn', titulo: 'VTV del Móvil BV-5 vence el 8/6', descripcion: 'Faltan 16 días. Coordinar inspección.', fechaLimite: '2026-06-08' },
  { id: 'a-2', cuartelId: CUARTEL_PRINCIPAL_ID, tipo: 'aptitud', severidad: 'warn', titulo: 'Aptitud médica por vencer', descripcion: 'Federico Ruiz: vence en 7 días.' },
  { id: 'a-3', cuartelId: CUARTEL_PRINCIPAL_ID, tipo: 'rendicion', severidad: 'warn', titulo: 'Rendición de mayo · 78%', descripcion: 'Faltan 2 ítems para presentar al Fondo.' },
];
