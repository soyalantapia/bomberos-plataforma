import {
  Anchor,
  Factory,
  Landmark,
  Mountain,
  Shield,
  TreePine,
  Waves,
  Wheat,
  type LucideIcon,
} from 'lucide-react';

import { cn } from '@faro/ui';

/**
 * Logotipo (escudo) propio de cada región de la Federación Bonaerense.
 * Toda la red es Provincia de Buenos Aires: 7 regiones, cada una con su
 * color, su motivo geográfico y su sigla. Es un emblema ilustrativo (no el
 * sello oficial), pensado para identificar la región de un vistazo.
 */
type CrestConf = {
  from: string;
  to: string;
  ring: string;
  abbr: string;
  Icon: LucideIcon;
};

const CRESTS: Record<string, CrestConf> = {
  'Norte GBA': { from: '#60a5fa', to: '#1d4ed8', ring: '#1e3a8a', abbr: 'N', Icon: Waves },
  'Oeste GBA': { from: '#34d399', to: '#047857', ring: '#065f46', abbr: 'O', Icon: TreePine },
  'Sur GBA': { from: '#fbbf24', to: '#b45309', ring: '#7c2d12', abbr: 'S', Icon: Factory },
  'La Plata y Sudeste': {
    from: '#a78bfa',
    to: '#6d28d9',
    ring: '#4c1d95',
    abbr: 'LP',
    Icon: Landmark,
  },
  'Costa Atlántica': { from: '#22d3ee', to: '#0891b2', ring: '#155e75', abbr: 'CA', Icon: Anchor },
  'Interior PBA Norte': {
    from: '#a3e635',
    to: '#4d7c0f',
    ring: '#365314',
    abbr: 'IN',
    Icon: Wheat,
  },
  'Interior PBA Sur': {
    from: '#fb923c',
    to: '#c2410c',
    ring: '#7c2d12',
    abbr: 'IS',
    Icon: Mountain,
  },
};

const SHIELD_PATH = 'M5 4 H51 V31 C51 47 28 59 28 59 C28 59 5 47 5 31 Z';

export function RegionCrest({
  region,
  size = 56,
  className,
}: {
  region: string;
  size?: number;
  className?: string;
}) {
  const c = CRESTS[region] ?? {
    from: '#94a3b8',
    to: '#475569',
    ring: '#334155',
    abbr: region.slice(0, 2).toUpperCase(),
    Icon: Shield,
  };
  const gradId = `rc-${region.replace(/[^a-zA-Z]/g, '')}`;
  const h = Math.round(size * 1.13);

  return (
    <div
      className={cn('relative shrink-0', className)}
      style={{ width: size, height: h }}
      role="img"
      aria-label={`Escudo de la región ${region}`}
    >
      <svg viewBox="0 0 56 63" width={size} height={h} className="absolute inset-0">
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={c.from} />
            <stop offset="1" stopColor={c.to} />
          </linearGradient>
        </defs>
        <path d={SHIELD_PATH} fill={`url(#${gradId})`} stroke={c.ring} strokeWidth={2.5} />
        <path
          d={SHIELD_PATH}
          fill="none"
          stroke="#ffffff"
          strokeOpacity={0.45}
          strokeWidth={1}
          transform="scale(0.86) translate(4.5 4)"
        />
      </svg>
      <div
        className="absolute inset-x-0 top-0 flex flex-col items-center justify-center gap-0.5 text-white"
        style={{ height: size }}
      >
        <c.Icon
          size={Math.round(size * 0.4)}
          strokeWidth={2.25}
          className="drop-shadow-[0_1px_1px_rgba(0,0,0,0.25)]"
          aria-hidden
        />
        <span
          className="font-extrabold leading-none tracking-tight drop-shadow-[0_1px_1px_rgba(0,0,0,0.3)]"
          style={{ fontSize: Math.round(size * 0.21) }}
        >
          {c.abbr}
        </span>
      </div>
    </div>
  );
}
