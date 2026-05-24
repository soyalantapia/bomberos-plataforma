import type { Perfil } from '@faro/types';

export interface NavItem {
  label: string;
  href: string;
  icon: string;
  bottomNav?: boolean;
}

export const navByPerfil: Record<Perfil, NavItem[]> = {
  bombero: [
    { label: 'Inicio', href: '/bombero', icon: 'home', bottomNav: true },
    { label: 'Registrar', href: '/bombero/registrar-servicio', icon: 'flame', bottomNav: true },
    { label: 'Asistencia', href: '/bombero/asistencia', icon: 'check-circle-2', bottomNav: true },
    { label: 'Mi legajo', href: '/bombero/legajo', icon: 'user', bottomNav: true },
    { label: 'Capacitación', href: '/bombero/capacitacion', icon: 'graduation-cap' },
    { label: 'Comunicación', href: '/bombero/comunicacion', icon: 'message-square' },
  ],
  mando: [
    { label: 'Dashboard', href: '/mando', icon: 'layout-dashboard', bottomNav: true },
    { label: 'Operaciones', href: '/mando/operaciones', icon: 'siren', bottomNav: true },
    { label: 'Cómputo', href: '/mando/computo', icon: 'calculator', bottomNav: true },
    { label: 'Rendición', href: '/mando/rendicion', icon: 'file-check-2', bottomNav: true },
    { label: 'Personal', href: '/mando/personal', icon: 'users' },
    { label: 'Automotores', href: '/mando/automotores', icon: 'truck' },
    { label: 'Aprobaciones', href: '/mando/aprobaciones', icon: 'clipboard-check' },
  ],
  administrativo: [
    { label: 'Padrón', href: '/administrativo', icon: 'users', bottomNav: true },
    { label: 'Materiales', href: '/administrativo/materiales', icon: 'package', bottomNav: true },
    { label: 'Licencias', href: '/administrativo/licencias', icon: 'calendar-clock', bottomNav: true },
    { label: 'Documentos', href: '/administrativo/documentos', icon: 'folder-open', bottomNav: true },
    { label: 'Capacitación', href: '/administrativo/capacitacion', icon: 'graduation-cap' },
    { label: 'Agenda', href: '/administrativo/agenda', icon: 'calendar' },
  ],
  gobierno: [
    { label: 'Orden Interno', href: '/gobierno', icon: 'building-2', bottomNav: true },
    { label: 'Ética', href: '/gobierno/etica', icon: 'scale', bottomNav: true },
    { label: 'Género', href: '/gobierno/genero', icon: 'shield-alert', bottomNav: true },
    { label: 'Audit log', href: '/gobierno/audit', icon: 'file-search', bottomNav: true },
  ],
  federacion: [
    { label: 'Tablero', href: '/federacion', icon: 'globe-2', bottomNav: true },
    { label: 'Cumplimiento', href: '/federacion/cumplimiento', icon: 'flag-triangle-right', bottomNav: true },
    { label: 'Consolidados', href: '/federacion/consolidados', icon: 'bar-chart-3', bottomNav: true },
    { label: 'Comunicados', href: '/federacion/comunicados', icon: 'megaphone', bottomNav: true },
    { label: 'Integraciones', href: '/federacion/integraciones', icon: 'plug' },
  ],
};
