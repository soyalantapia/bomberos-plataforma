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
      label: 'Mi equipo (uniforme)',
      href: '/bombero/equipo',
      icon: 'shield',

      seccion: 'Tu información',
    },
    {
      label: 'Disponibilidad',
      href: '/bombero/disponibilidad',
      icon: 'calendar',

      seccion: 'Tu información',
    },
  ],
  mando: [
    { label: 'Inicio', href: '/mando', icon: 'layout-dashboard', bottomNav: true },
    { label: 'Servicios', href: '/mando/operaciones', icon: 'siren', bottomNav: true },
    {
      label: 'Móviles en vivo',
      href: '/mando/avl',
      icon: 'radio',
      bottomNav: true,
      seccion: 'Operaciones',
    },
    {
      label: 'Parte de servicio',
      href: '/mando/parte-nfirs',
      icon: 'file-text',
      seccion: 'Operaciones',
    },
    {
      label: 'Asistente con voz',
      href: '/mando/asistente-parte',
      icon: 'wand-2',
      seccion: 'Operaciones',
    },
    {
      label: 'Análisis de fotos',
      href: '/mando/analisis-imagen',
      icon: 'eye',
      seccion: 'Operaciones',
    },
    {
      label: 'Radio',
      href: '/mando/radio',
      icon: 'antenna',
      seccion: 'Operaciones',
    },
    { label: 'Personal', href: '/mando/personal', icon: 'users', seccion: 'RR.HH.' },
    {
      label: 'Cursos y especialidades',
      href: '/mando/personal/skills',
      icon: 'sparkles',
      seccion: 'RR.HH.',
    },
    {
      label: 'Pedidos a firmar',
      href: '/mando/aprobaciones',
      icon: 'clipboard-check',
      seccion: 'RR.HH.',
    },
    {
      label: 'Móviles',
      href: '/mando/automotores',
      icon: 'truck',
      seccion: 'Logística',
    },
    {
      label: 'Revisión del móvil',
      href: '/mando/automotores/truck-check',
      icon: 'clipboard-check',
      seccion: 'Logística',
    },
    {
      label: 'Hidrantes',
      href: '/mando/hidrantes',
      icon: 'droplets',
      seccion: 'Logística',
    },
    {
      label: 'Resumen',
      href: '/mando/finanzas',
      icon: 'piggy-bank',
      seccion: 'Finanzas',
    },
    {
      label: 'Movimientos',
      href: '/mando/finanzas/movimientos',
      icon: 'arrow-left-right',
      seccion: 'Finanzas',
    },
    {
      label: 'Cuentas y cajas',
      href: '/mando/finanzas/cajas',
      icon: 'landmark',
      seccion: 'Finanzas',
    },
    {
      label: 'Cuotas sociales',
      href: '/mando/finanzas/cuotas',
      icon: 'badge-dollar-sign',
      seccion: 'Finanzas',
    },
    {
      label: 'Categorías',
      href: '/mando/finanzas/categorias',
      icon: 'list-tree',
      seccion: 'Finanzas',
    },
    {
      label: 'Presupuesto',
      href: '/mando/finanzas/presupuesto',
      icon: 'target',
      seccion: 'Finanzas',
    },
    {
      label: 'Facturas',
      href: '/mando/finanzas/comprobantes',
      icon: 'receipt',
      seccion: 'Finanzas',
    },
    {
      label: 'Resúmenes contables',
      href: '/mando/finanzas/reportes',
      icon: 'file-spreadsheet',
      seccion: 'Finanzas',
    },
    {
      label: 'Rendición',
      href: '/mando/rendicion',
      icon: 'file-check-2',
      bottomNav: true,
      seccion: 'Gestión',
    },
    { label: 'Cómputo de horas', href: '/mando/computo', icon: 'calculator', seccion: 'Gestión' },
    {
      label: 'Reportes',
      href: '/mando/reportes',
      icon: 'file-bar-chart',
      seccion: 'Gestión',
    },
    {
      label: 'Predicciones',
      href: '/mando/predicciones',
      icon: 'trending-up',
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

      seccion: 'Salud',
    },
    {
      label: 'WhatsApp Business',
      href: '/administrativo/whatsapp',
      icon: 'message-square',

      seccion: 'Comunicación',
    },
    {
      label: 'Aviso masivo',
      href: '/administrativo/broadcast',
      icon: 'megaphone',

      seccion: 'Comunicación',
    },
    {
      label: 'Actualizar con RUBA',
      href: '/administrativo/sync-ruba',
      icon: 'database',

      seccion: 'Integraciones',
    },
  ],
  gobierno: [
    { label: 'Orden Interno', href: '/gobierno', icon: 'building-2', bottomNav: true },
    { label: 'Ética', href: '/gobierno/etica', icon: 'scale', bottomNav: true },
    { label: 'Género', href: '/gobierno/genero', icon: 'shield-alert', bottomNav: true },
    { label: 'Registro permanente', href: '/gobierno/audit', icon: 'file-search', bottomNav: true },
    {
      label: 'Verificador de integridad',
      href: '/gobierno/audit/verificador',
      icon: 'hash',

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

      seccion: 'Análisis',
    },
    { label: 'Comunicados', href: '/federacion/comunicados', icon: 'megaphone' },
    { label: 'Integraciones', href: '/federacion/integraciones', icon: 'plug' },
  ],
};
