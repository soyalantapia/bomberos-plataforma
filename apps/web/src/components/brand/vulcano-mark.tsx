'use client';

import { useId } from 'react';

import { cn } from '@faro/ui';

/**
 * Isotipo de Vulcano: una llama con núcleo incandescente.
 * Gradiente cálido real (ámbar en la base → naranja → rojo en la punta) +
 * un core brillante, para que la marca se sienta forjada y no un ícono genérico.
 */
export function VulcanoMark({ size = 24, className }: { size?: number; className?: string }) {
  const uid = useId();
  const outer = `vmk-outer-${uid}`;
  const core = `vmk-core-${uid}`;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      role="img"
      aria-label="Vulcano"
    >
      <defs>
        <linearGradient id={outer} x1="12" y1="21" x2="12" y2="2" gradientUnits="userSpaceOnUse">
          <stop stopColor="#fbbf24" />
          <stop offset="0.5" stopColor="#f97316" />
          <stop offset="1" stopColor="#e11d2e" />
        </linearGradient>
        <linearGradient id={core} x1="12" y1="19.5" x2="12" y2="8.5" gradientUnits="userSpaceOnUse">
          <stop stopColor="#fffbeb" />
          <stop offset="1" stopColor="#fcd34d" />
        </linearGradient>
      </defs>
      {/* Llama exterior */}
      <path
        d="M12 1.5C13.1 6.7 16.4 8.8 16.4 13.6C16.4 17.3 14.5 20.4 12 20.4C9.5 20.4 7.6 17.3 7.6 13.6C7.6 11.6 8.3 10.2 9.2 9.3C9.05 10.85 9.7 11.7 10.7 11.9C9.4 8.7 10.2 4.9 12 1.5Z"
        fill={`url(#${outer})`}
      />
      {/* Núcleo incandescente */}
      <path
        d="M12 8.8C12.7 11.4 13.9 12.5 13.9 15.3C13.9 17.6 13 19.3 12 19.3C11 19.3 10.1 17.6 10.1 15.3C10.1 13 11.3 11.4 12 8.8Z"
        fill={`url(#${core})`}
      />
    </svg>
  );
}

/**
 * Logo de Vulcano: el isotipo dentro de un tile "app icon" navy con anillo
 * cálido. Consistente en sidebar, header, drawer e informe.
 */
export function VulcanoLogo({
  tile = 36,
  mark,
  className,
}: {
  tile?: number;
  mark?: number;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'from-brand-800 to-brand-950 inline-grid shrink-0 place-items-center bg-gradient-to-br ring-1 ring-white/10',
        className,
      )}
      style={{ width: tile, height: tile }}
    >
      <VulcanoMark size={mark ?? Math.round(tile * 0.6)} />
    </span>
  );
}
