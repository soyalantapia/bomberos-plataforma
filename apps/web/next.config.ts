import withSerwistInit from '@serwist/next';

import type { NextConfig } from 'next';

// Cuando hacemos build para GitHub Pages, exportamos como sitio estático
// y respetamos el subpath del repo. Activado por env var FARO_EXPORT=1.
const isExport = process.env.FARO_EXPORT === '1';
const basePath = isExport ? '/bomberos-plataforma' : '';

const withSerwist = withSerwistInit({
  swSrc: 'src/sw.ts',
  swDest: 'public/sw.js',
  cacheOnNavigation: true,
  reloadOnOnline: true,
  // En dev no, y en static export tampoco (no hay service worker dinámico).
  disable: process.env.NODE_ENV === 'development' || isExport,
});

const nextConfig: NextConfig = {
  reactStrictMode: true,
  typedRoutes: true,
  transpilePackages: ['@faro/ui', '@faro/types'],
  devIndicators: false,
  // En demo frontend: no bloquear build con warnings de lint preexistentes.
  // Typecheck (tsc --noEmit) sigue siendo el quality gate.
  eslint: { ignoreDuringBuilds: true },
  images: {
    remotePatterns: [],
    unoptimized: isExport,
  },
  ...(isExport
    ? {
        output: 'export' as const,
        basePath,
        assetPrefix: basePath,
        trailingSlash: true,
      }
    : {}),
};

export default withSerwist(nextConfig);
