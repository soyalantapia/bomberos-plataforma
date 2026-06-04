import { Shield } from 'lucide-react';

import { cn } from '@faro/ui';

import type { Cuartel } from '@faro/types';

import { withBasePath } from '../../lib/asset-path';

/**
 * Color del fondo según la región. Cada región tiene su propio par bg/fg
 * para que un golpe de vista permita ubicar geográficamente al cuartel.
 */
const REGION_COLOR: Record<string, { bg: string; fg: string }> = {
  'Norte GBA': { bg: 'bg-blue-100', fg: 'text-blue-700' },
  'Sur GBA': { bg: 'bg-amber-100', fg: 'text-amber-800' },
  'Oeste GBA': { bg: 'bg-emerald-100', fg: 'text-emerald-700' },
  'La Plata y Sudeste': { bg: 'bg-violet-100', fg: 'text-violet-700' },
  'Costa Atlántica': { bg: 'bg-cyan-100', fg: 'text-cyan-700' },
  'Interior PBA Norte': { bg: 'bg-lime-100', fg: 'text-lime-800' },
  'Interior PBA Sur': { bg: 'bg-orange-100', fg: 'text-orange-800' },
};

/** Iniciales de hasta 2 letras a partir del nombre del cuartel. */
function inicialesCuartel(nombre: string): string {
  const partes = nombre.split(/\s+/).filter((p) => p && !/^(de|del|la|las|el|los|y)$/i.test(p));
  if (partes.length === 0) return '';
  if (partes.length === 1) return partes[0]!.slice(0, 2).toUpperCase();
  return (partes[0]![0]! + partes[1]![0]!).toUpperCase();
}

export function CuartelLogo({
  cuartel,
  size = 40,
  className,
}: {
  cuartel: Pick<Cuartel, 'nombre' | 'region' | 'logoUrl'>;
  size?: number;
  className?: string;
}) {
  // 1. Logo real (img) — máxima prioridad
  if (cuartel.logoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={withBasePath(cuartel.logoUrl)}
        alt={`Escudo BV ${cuartel.nombre}`}
        width={size}
        height={size}
        className={cn('shrink-0 rounded-xl object-cover', className)}
        style={{ width: size, height: size }}
      />
    );
  }

  // 2. Iniciales coloreadas por región
  const iniciales = inicialesCuartel(cuartel.nombre);
  const palette = REGION_COLOR[cuartel.region] ?? {
    bg: 'bg-slate-100',
    fg: 'text-slate-700',
  };

  if (!iniciales) {
    return (
      <span
        aria-label={`Escudo BV ${cuartel.nombre}`}
        className={cn(
          'grid shrink-0 place-items-center rounded-xl',
          palette.bg,
          palette.fg,
          className,
        )}
        style={{ width: size, height: size }}
      >
        <Shield size={Math.round(size * 0.5)} />
      </span>
    );
  }

  return (
    <span
      aria-label={`Escudo BV ${cuartel.nombre}`}
      className={cn(
        'grid shrink-0 place-items-center rounded-xl font-bold tracking-tight',
        palette.bg,
        palette.fg,
        className,
      )}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.4) }}
    >
      {iniciales}
    </span>
  );
}
