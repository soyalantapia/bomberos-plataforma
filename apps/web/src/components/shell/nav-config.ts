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

// Items comunes a todos los perfiles: Directorio + Agenda.
const DIRECTORIO_PUBLICO: NavItem = {
  label: 'Directorio',
  href: '/directorio',
  icon: 'users-round',
  bottomNav: true,
};

const AGENDA_PUBLICA: NavItem = {
  label: 'Agenda',
  href: '/agenda',
  icon: 'book-marked',
  seccion: 'Red',
};

// Organigrama institucional — accesible por todos los perfiles.
const ORGANIGRAMA_PUBLICO: NavItem = {
  label: 'Organigrama',
  href: '/organigrama',
  icon: 'network',
  seccion: 'Red',
};

// ════════════════════════════════════════════════════════════════════
// FASE 1 — VULCANO FINANZAS · única navegación viva
// Solo el Administrador del cuartel, solo Finanzas. Todo lo demás está en
// `navByPerfilBacklog` (abajo) — no borrado, recuperable. Ver BACKLOG.md.
// ════════════════════════════════════════════════════════════════════
const NAV_FINANZAS: NavItem[] = [
  {
    label: 'Resumen',
    href: '/mando/finanzas',
    icon: 'piggy-bank',
    bottomNav: true,
    seccion: 'Día a día',
  },
  {
    label: 'Movimientos',
    href: '/mando/finanzas/movimientos',
    icon: 'arrow-left-right',
    bottomNav: true,
    seccion: 'Día a día',
  },
  {
    label: 'Cuentas y cajas',
    href: '/mando/finanzas/cajas',
    icon: 'landmark',
    bottomNav: true,
    seccion: 'Día a día',
  },
  {
    label: 'Cuotas sociales',
    href: '/mando/finanzas/cuotas',
    icon: 'badge-dollar-sign',
    bottomNav: true,
    seccion: 'Planeamiento',
  },
  {
    label: 'Presupuesto',
    href: '/mando/finanzas/presupuesto',
    icon: 'target',
    seccion: 'Planeamiento',
  },
  {
    label: 'Flujo de fondos',
    href: '/mando/finanzas/cashflow',
    icon: 'trending-up',
    bottomNav: true,
    seccion: 'Planeamiento',
  },
  {
    label: 'Categorías',
    href: '/mando/finanzas/categorias',
    icon: 'list-tree',
    seccion: 'Documentos',
  },
  {
    label: 'Facturas',
    href: '/mando/finanzas/comprobantes',
    icon: 'receipt',
    seccion: 'Documentos',
  },
  {
    label: 'Resúmenes contables',
    href: '/mando/finanzas/reportes',
    icon: 'file-spreadsheet',
    seccion: 'Documentos',
  },
];

export const navByPerfil: Record<Perfil, NavItem[]> = {
  bombero: NAV_FINANZAS,
  mando: NAV_FINANZAS,
  administrativo: NAV_FINANZAS,
  gobierno: NAV_FINANZAS,
  federacion: NAV_FINANZAS,
};

// ════════════════════════════════════════════════════════════════════
// BACKLOG — navegación completa por perfil. PARADA en Fase 1, NO BORRAR.
// Reactivar (otra etapa): `export const navByPerfil = navByPerfilBacklog`
// o mover items puntuales a NAV_FINANZAS. Ver BACKLOG.md.
// ════════════════════════════════════════════════════════════════════
export const navByPerfilBacklog: Record<Perfil, NavItem[]> = {
  bombero: [
    { label: 'Inicio', href: '/bombero', icon: 'home', bottomNav: true },
    { label: 'Registrar', href: '/bombero/registrar-servicio', icon: 'flame', bottomNav: true },
    { label: 'Mis tareas', href: '/bombero/tareas', icon: 'clipboard-list' },
    { label: 'Mi desempeño', href: '/bombero/mi-desempeno', icon: 'star' },
    DIRECTORIO_PUBLICO,
    AGENDA_PUBLICA,
    ORGANIGRAMA_PUBLICO,
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
    DIRECTORIO_PUBLICO,
    AGENDA_PUBLICA,
    ORGANIGRAMA_PUBLICO,
    {
      label: 'Móviles en vivo',
      href: '/mando/avl',
      icon: 'radio',
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
    {
      label: 'Lesiones',
      href: '/mando/lesiones',
      icon: 'heart-pulse',
      seccion: 'Operaciones',
    },
    { label: 'Personal', href: '/mando/personal', icon: 'users', seccion: 'RR.HH.' },
    {
      label: 'Cumplimiento',
      href: '/mando/personal/cumplimiento',
      icon: 'user-check',
      seccion: 'RR.HH.',
    },
    {
      label: 'Cursos y especialidades',
      href: '/mando/personal/skills',
      icon: 'sparkles',
      seccion: 'RR.HH.',
    },
    {
      label: 'Firmas pendientes',
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
      label: 'Flujo de fondos',
      href: '/mando/finanzas/cashflow',
      icon: 'trending-up',
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
      label: 'Tareas',
      href: '/mando/tareas',
      icon: 'clipboard-list',
      bottomNav: true,
      seccion: 'Gestión',
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
    DIRECTORIO_PUBLICO,
    AGENDA_PUBLICA,
    ORGANIGRAMA_PUBLICO,
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
    DIRECTORIO_PUBLICO,
    AGENDA_PUBLICA,
    ORGANIGRAMA_PUBLICO,
    { label: 'Género', href: '/gobierno/genero', icon: 'shield-alert', bottomNav: true },
    { label: 'Equidad de género', href: '/gobierno/equidad', icon: 'pie-chart' },
    { label: 'Registro permanente', href: '/gobierno/audit', icon: 'file-search' },
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
    DIRECTORIO_PUBLICO,
    AGENDA_PUBLICA,
    ORGANIGRAMA_PUBLICO,
    {
      label: 'Consolidados',
      href: '/federacion/consolidados',
      icon: 'bar-chart-3',
      seccion: 'Análisis',
    },
    {
      label: 'Mapa provincial',
      href: '/federacion/mapa',
      icon: 'map',
      seccion: 'Análisis',
    },
    {
      label: 'Gobernanza',
      href: '/federacion/governance',
      icon: 'gavel',
      seccion: 'Análisis',
    },
    { label: 'Comunicados', href: '/federacion/comunicados', icon: 'megaphone' },
    { label: 'Integraciones', href: '/federacion/integraciones', icon: 'plug' },
  ],
};
