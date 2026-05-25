import withSerwistInit from '@serwist/next';

const withSerwist = withSerwistInit({
  swSrc: 'src/sw.ts',
  swDest: 'public/sw.js',
  cacheOnNavigation: true,
  reloadOnOnline: true,
  disable: process.env.NODE_ENV === 'development',
});

import type { NextConfig } from 'next';

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
  },
};

export default withSerwist(nextConfig);
