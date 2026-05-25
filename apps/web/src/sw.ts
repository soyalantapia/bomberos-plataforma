/// <reference lib="webworker" />
/**
 * Service Worker de Faro — generado por Serwist.
 *
 * Estrategia offline-first:
 * - Pre-cache de páginas críticas operativas al instalar
 * - Cache agresivo de tiles de mapa CARTO Voyager
 * - Runtime cache para API con fallback offline
 * - StaleWhileRevalidate para páginas (siempre se ven, se actualizan en bg)
 */
import { defaultCache } from '@serwist/next/worker';
import type { PrecacheEntry, SerwistGlobalConfig } from 'serwist';
import { CacheFirst, NetworkFirst, Serwist, StaleWhileRevalidate } from 'serwist';

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

// Páginas operativas críticas: deben funcionar 7 días sin internet
const PAGINAS_CRITICAS = [
  '/bombero',
  '/bombero/registrar-servicio',
  '/bombero/asistencia',
  '/bombero/comunicacion',
  '/bombero/equipo',
  '/bombero/disponibilidad',
  '/mando',
  '/mando/operaciones',
  '/mando/avl',
  '/mando/operaciones/ics',
  '/mando/parte-nfirs',
  '/mando/asistente-parte',
  '/mando/hidrantes',
  '/administrativo/aptitud-medica',
];

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [
    // Tiles de mapa CARTO Voyager: cache-first, casi inmutable
    {
      matcher: ({ url }) => url.hostname.includes('basemaps.cartocdn.com'),
      handler: new CacheFirst({
        cacheName: 'faro-map-tiles',
      }),
    },
    // API: network-first con timeout 5s
    {
      matcher: ({ url }) => url.pathname.startsWith('/api/'),
      handler: new NetworkFirst({
        cacheName: 'faro-api',
        networkTimeoutSeconds: 5,
      }),
    },
    // Páginas (stale while revalidate)
    {
      matcher: ({ request }) => request.mode === 'navigate',
      handler: new StaleWhileRevalidate({ cacheName: 'faro-pages' }),
    },
    ...defaultCache,
  ],
});

serwist.addEventListeners();

// Pre-cache de páginas críticas al instalar
self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open('faro-critical');
      try {
        await cache.addAll(PAGINAS_CRITICAS);
      } catch (e) {
        // En SSR/build algunas rutas pueden no existir aún
        console.warn('[sw] precache parcial:', e);
      }
    })(),
  );
});
