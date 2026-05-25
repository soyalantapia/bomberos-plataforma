import type { Perfil } from '@faro/types';

export interface NavItem {
  label: string;
  href: string;
  icon: string;
  bottomNav?: boolean;
  /** Marca visual "nuevo" en el sidebar */
  nuevo?: boolean;
  /** Sección en la que agrupar el item en sidebar */
  seccion?: string;
}

export const navByPerfil: Record<Perfil, NavItem[]> = {
  bombero: [
    { label: 'Inicio', href: '/bombero', icon: 'home', bottomNav: true },
    { label: 'Registrar', href: '/bombero/registrar-servicio', icon: 'flame', bottomNav: true },
    { label: 'Asistencia', href: '/bombero/asistencia', icon: 'check-circle-2', bottomNav: true },
    { label: 'Mi legajo', href: '/bombero/legajo', icon: 'user', bottomNav: true },
    { label: 'Capacitación', href: '/bombero/capacitacion', icon: 'graduation-cap' },
    { label: 'Comunicación', href: '/bombero/comunicacion', icon: 'message-square' },
    {
      label: 'Mi equipo (EPP)',
      href: '/bombero/equipo',
      icon: 'shield',
      nuevo: true,
      seccion: 'Tu información',
    },
    {
      label: 'Disponibilidad',
      href: '/bombero/disponibilidad',
      icon: 'calendar',
      nuevo: true,
      seccion: 'Tu información',
    },
  ],
  mando: [
    { label: 'Dashboard', href: '/mando', icon: 'layout-dashboard', bottomNav: true },
    { label: 'Operaciones', href: '/mando/operaciones', icon: 'siren', bottomNav: true },
    {
      label: 'AVL · en vivo',
      href: '/mando/avl',
      icon: 'radio',
      bottomNav: true,
      nuevo: true,
      seccion: 'Operaciones',
    },
    {
      label: 'Parte NFIRS-AR',
      href: '/mando/parte-nfirs',
      icon: 'file-text',
      nuevo: true,
      seccion: 'Operaciones',
    },
    {
      label: 'Asistente parte IA',
      href: '/mando/asistente-parte',
      icon: 'wand-2',
      nuevo: true,
      seccion: 'Operaciones',
    },
    {
      label: 'Análisis imagen IA',
      href: '/mando/analisis-imagen',
      icon: 'eye',
      nuevo: true,
      seccion: 'Operaciones',
    },
    {
      label: 'Radio log',
      href: '/mando/radio',
      icon: 'antenna',
      nuevo: true,
      seccion: 'Operaciones',
    },
    { label: 'Personal', href: '/mando/personal', icon: 'users', seccion: 'RR.HH.' },
    {
      label: 'Skills Matrix',
      href: '/mando/personal/skills',
      icon: 'sparkles',
      nuevo: true,
      seccion: 'RR.HH.',
    },
    {
      label: 'Aprobaciones',
      href: '/mando/aprobaciones',
      icon: 'clipboard-check',
      seccion: 'RR.HH.',
    },
    {
      label: 'Automotores',
      href: '/mando/automotores',
      icon: 'truck',
      seccion: 'Logística',
    },
    {
      label: 'Truck check',
      href: '/mando/automotores/truck-check',
      icon: 'clipboard-check',
      nuevo: true,
      seccion: 'Logística',
    },
    {
      label: 'Hidrantes',
      href: '/mando/hidrantes',
      icon: 'droplets',
      nuevo: true,
      seccion: 'Logística',
    },
    {
      label: 'Rendición',
      href: '/mando/rendicion',
      icon: 'file-check-2',
      bottomNav: true,
      seccion: 'Gestión',
    },
    { label: 'Cómputo', href: '/mando/computo', icon: 'calculator', seccion: 'Gestión' },
    {
      label: 'Reportes',
      href: '/mando/reportes',
      icon: 'file-bar-chart',
      nuevo: true,
      seccion: 'Gestión',
    },
    {
      label: 'Predicciones IA',
      href: '/mando/predicciones',
      icon: 'trending-up',
      nuevo: true,
      seccion: 'Gestión',
    },
  ],
  administrativo: [
    { label: 'Padrón', href: '/administrativo', icon: 'users', bottomNav: true },
    {
      label: 'Materiales',
      href: '/administrativo/materiales',
      icon: 'package',
      bottomNav: true,
    },
    {
      label: 'Licencias',
      href: '/administrativo/licencias',
      icon: 'calendar-clock',
      bottomNav: true,
    },
    {
      label: 'Documentos',
      href: '/administrativo/documentos',
      icon: 'folder-open',
      bottomNav: true,
    },
    { label: 'Capacitación', href: '/administrativo/capacitacion', icon: 'graduation-cap' },
    { label: 'Agenda', href: '/administrativo/agenda', icon: 'calendar' },
    {
      label: 'Aptitud médica',
      href: '/administrativo/aptitud-medica',
      icon: 'stethoscope',
      nuevo: true,
      seccion: 'Salud',
    },
    {
      label: 'WhatsApp Business',
      href: '/administrativo/whatsapp',
      icon: 'message-square',
      nuevo: true,
      seccion: 'Comunicación',
    },
    {
      label: 'Broadcast',
      href: '/administrativo/broadcast',
      icon: 'megaphone',
      nuevo: true,
      seccion: 'Comunicación',
    },
    {
      label: 'Sync RUBA',
      href: '/administrativo/sync-ruba',
      icon: 'database',
      nuevo: true,
      seccion: 'Integraciones',
    },
  ],
  gobierno: [
    { label: 'Orden Interno', href: '/gobierno', icon: 'building-2', bottomNav: true },
    { label: 'Ética', href: '/gobierno/etica', icon: 'scale', bottomNav: true },
    { label: 'Género', href: '/gobierno/genero', icon: 'shield-alert', bottomNav: true },
    { label: 'Audit log', href: '/gobierno/audit', icon: 'file-search', bottomNav: true },
    {
      label: 'Verificador SHA-256',
      href: '/gobierno/audit/verificador',
      icon: 'hash',
      nuevo: true,
      seccion: 'Auditoría',
    },
  ],
  federacion: [
    { label: 'Tablero', href: '/federacion', icon: 'globe-2', bottomNav: true },
    {
      label: 'Cumplimiento',
      href: '/federacion/cumplimiento',
      icon: 'flag-triangle-right',
      bottomNav: true,
    },
    {
      label: 'Consolidados',
      href: '/federacion/consolidados',
      icon: 'bar-chart-3',
      bottomNav: true,
    },
    {
      label: 'Mapa provincial',
      href: '/federacion/mapa',
      icon: 'map',
      nuevo: true,
      seccion: 'Análisis',
    },
    { label: 'Comunicados', href: '/federacion/comunicados', icon: 'megaphone' },
    { label: 'Integraciones', href: '/federacion/integraciones', icon: 'plug' },
  ],
};
