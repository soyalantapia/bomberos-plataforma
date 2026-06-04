'use client';

import { useId } from 'react';

import type { Movil } from '@faro/types';

import { withBasePath } from '../../lib/asset-path';

type TipoMovil = Movil['tipo'];

/** Fotos de referencia (royalty-free, Pexels) por tipo de móvil, bundleadas en /public. */
const FOTO_POR_TIPO: Partial<Record<TipoMovil, string>> = {
  autobomba: '/automotores/autobomba.webp',
  rescate: '/automotores/rescate.webp',
  forestal: '/automotores/forestal.webp',
};

/**
 * URL de foto a mostrar para un móvil: la subida real (base64/url) tiene
 * prioridad; si no, una foto de referencia por tipo; si tampoco, null → se usa
 * la ilustración.
 */
export function fotoMovilSrc(tipo: TipoMovil, fotoUrl?: string): string | null {
  if (fotoUrl) return fotoUrl;
  const p = FOTO_POR_TIPO[tipo];
  return p ? (withBasePath(p) ?? null) : null;
}

/** True cuando lo que se muestra es la foto de referencia (no la subida por el cuartel). */
export function esFotoReferencia(tipo: TipoMovil, fotoUrl?: string): boolean {
  return !fotoUrl && tipo in FOTO_POR_TIPO;
}

const ACCENT: Record<TipoMovil, { beacon: string; body: string; bodyDark: string }> = {
  autobomba: { beacon: '#2563eb', body: '#e11d2e', bodyDark: '#b3111f' },
  rescate: { beacon: '#f59e0b', body: '#ea580c', bodyDark: '#c2410c' },
  forestal: { beacon: '#f59e0b', body: '#16a34a', bodyDark: '#15803d' },
  ambulancia: { beacon: '#2563eb', body: '#f8fafc', bodyDark: '#cbd5e1' },
  utilitario: { beacon: '#64748b', body: '#475569', bodyDark: '#334155' },
};

/**
 * Ilustración lateral de un móvil bomberil, coloreada por tipo y con el número
 * de unidad "pintado" en la puerta. Es el placeholder lindo del catálogo
 * cuando todavía no se subió una foto real.
 */
export function TruckIllustration({
  codigo,
  tipo,
  className,
}: {
  codigo: string;
  tipo: TipoMovil;
  className?: string;
}) {
  const uid = useId();
  const a = ACCENT[tipo] ?? ACCENT.utilitario;
  const bgId = `tbg-${uid}`;
  const bodyId = `tbody-${uid}`;
  const ambulancia = tipo === 'ambulancia';
  // El blanco de la ambulancia necesita texto/ventanas oscuras para contraste
  const ink = ambulancia ? '#0f172a' : '#ffffff';
  const winFill = ambulancia ? '#bae6fd' : '#cfe8ff';

  return (
    <svg
      viewBox="0 0 240 120"
      className={className}
      role="img"
      aria-label={`Ilustración del móvil ${codigo} (${tipo})`}
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <linearGradient id={bgId} x1="0" y1="0" x2="0" y2="120" gradientUnits="userSpaceOnUse">
          <stop stopColor="#eef2f7" />
          <stop offset="1" stopColor="#dbe2ec" />
        </linearGradient>
        <linearGradient id={bodyId} x1="0" y1="28" x2="0" y2="96" gradientUnits="userSpaceOnUse">
          <stop stopColor={a.body} />
          <stop offset="1" stopColor={a.bodyDark} />
        </linearGradient>
      </defs>

      <rect width="240" height="120" fill={`url(#${bgId})`} />
      {/* piso */}
      <rect x="0" y="98" width="240" height="22" fill="#c3ccd8" />

      {/* sombra */}
      <ellipse cx="120" cy="99" rx="96" ry="6" fill="#9aa6b6" opacity="0.5" />

      {/* cuerpo trasero (equipamiento) */}
      <rect x="96" y="40" width="116" height="48" rx="5" fill={`url(#${bodyId})`} />
      {/* cabina */}
      <path
        d="M28 50 q0-22 22-22 h34 q6 0 9 5 l13 19 v36 h-78 q-13 0-13-13 z"
        fill={`url(#${bodyId})`}
      />
      {/* ventana cabina */}
      <path d="M40 38 h28 l9 13 h-37 z" fill={winFill} />

      {/* baliza */}
      <rect x="120" y="30" width="40" height="7" rx="3" fill={a.beacon} />
      <rect x="120" y="30" width="13" height="7" rx="3" fill="#ef4444" opacity="0.9" />

      {/* franja reflectiva inferior */}
      <rect x="28" y="78" width="184" height="7" fill="#fde047" opacity="0.95" />
      {/* tanque / detalle superior trasero */}
      <rect
        x="104"
        y="44"
        width="100"
        height="10"
        rx="3"
        fill={ink}
        opacity={ambulancia ? 0.08 : 0.16}
      />

      {/* puerta cabina + número de unidad */}
      <rect x="40" y="54" width="34" height="28" rx="3" fill={ink} opacity="0.12" />
      <text
        x="57"
        y="73"
        textAnchor="middle"
        fontSize="14"
        fontWeight="800"
        fontFamily="ui-sans-serif, system-ui, sans-serif"
        fill={ink}
      >
        {codigo}
      </text>

      {/* cruz para ambulancia */}
      {ambulancia && (
        <g fill="#e11d2e">
          <rect x="150" y="52" width="20" height="6" rx="1" />
          <rect x="157" y="45" width="6" height="20" rx="1" />
        </g>
      )}

      {/* ruedas */}
      {[72, 178].map((cx) => (
        <g key={cx}>
          <circle cx={cx} cy="88" r="15" fill="#1f2937" />
          <circle cx={cx} cy="88" r="6.5" fill="#9ca3af" />
        </g>
      ))}
    </svg>
  );
}
