'use client';

import {
  Home, Flame, CheckCircle2, User, GraduationCap, MessageSquare,
  LayoutDashboard, Siren, Calculator, FileCheck2, Users, Truck, ClipboardCheck,
  Package, CalendarClock, FolderOpen, Calendar,
  Building2, Scale, ShieldAlert, FileSearch,
  Globe2, FlagTriangleRight, BarChart3, Megaphone, Plug,
  type LucideIcon,
} from 'lucide-react';

const iconMap: Record<string, LucideIcon> = {
  home: Home,
  flame: Flame,
  'check-circle-2': CheckCircle2,
  user: User,
  'graduation-cap': GraduationCap,
  'message-square': MessageSquare,
  'layout-dashboard': LayoutDashboard,
  siren: Siren,
  calculator: Calculator,
  'file-check-2': FileCheck2,
  users: Users,
  truck: Truck,
  'clipboard-check': ClipboardCheck,
  package: Package,
  'calendar-clock': CalendarClock,
  'folder-open': FolderOpen,
  calendar: Calendar,
  'building-2': Building2,
  scale: Scale,
  'shield-alert': ShieldAlert,
  'file-search': FileSearch,
  'globe-2': Globe2,
  'flag-triangle-right': FlagTriangleRight,
  'bar-chart-3': BarChart3,
  megaphone: Megaphone,
  plug: Plug,
};

export function Icon({ name, size = 20, className }: { name: string; size?: number; className?: string }) {
  const C = iconMap[name];
  if (!C) return null;
  return <C size={size} className={className} aria-hidden />;
}
