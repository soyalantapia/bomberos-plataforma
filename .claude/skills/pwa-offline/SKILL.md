---
name: pwa-offline
description: Patrones PWA y offline-first de Faro (Serwist + Dexie). Usá esta skill al tocar el service worker, almacenamiento local, sincronización, estados sin conexión o instalabilidad.
---

# PWA y offline · Faro

## Por qué importa

El bombero captura **en la calle**, donde la señal va y viene. Si el sistema depende de conexión, Faro no cumple su promesa. Todo el circuito hero (B2 → C1 → C3 → C4 → F1) tiene que funcionar **al menos en modo captura** sin red.

## Stack offline

- **Serwist** (sucesor moderno de Workbox) gestiona el service worker desde `apps/web/src/sw.ts`.
- **Dexie** (IndexedDB) almacena: borradores de servicios, cola de mutaciones pendientes, datos básicos cacheados (padrón propio, dotación reciente).
- **Background Sync API** dispara reintentos cuando vuelve la red.

## Patrón de sincronización

```
[Usuario carga servicio]
       │
       ▼
[Optimistic UI: aparece "vía app · pendiente sync"]
       │
       ├──► [Dexie.pendingMutations.add(...)]
       │
       ▼
[fetch /api/v1/servicios]
       │       │
   ok? │  fallo│ (sin red, timeout, 5xx)
       ▼       ▼
  [marca   [encola sync]
   synced]  [registra Background Sync]
                │
                ▼ (cuando vuelve red)
       [sw reintenta con backoff]
                │
                ▼
       [marca synced + notifica UI]
```

## Reglas duras

- **Nunca bloquear la UI esperando red**. Todo el flujo de captura confirma local primero.
- **Optimistic UI** + reconciliación con el server. Si el server rechaza, la UI muestra el error con opción de editar (no perder lo que cargó el bombero).
- **Tiempos de servidor canónicos**: el servidor decide el `serverCreatedAt`; el cliente envía el `clientCreatedAt` (para mostrarlo si vuelve la conexión tarde).
- **Conflicts**: si el server rechaza por conflicto, mostrar la versión actual y dejar al usuario elegir (no auto-resolver mutaciones sensibles).

## Service worker · qué cachear

- **App shell** (HTML, JS, CSS): cache-first con revalidación.
- **Iconos y manifest**: cache-first largo.
- **API GET de datos del perfil** (legajo propio, guardias asignadas): stale-while-revalidate, TTL corto.
- **API POST/PUT/DELETE**: **nunca cachear**. Van por cola si fallan.

## Estados de conexión en UI

3 estados que se muestran al usuario (banner sutil en el shell):

- 🟢 **Online y sincronizado** — sin banner.
- 🟡 **Sin señal, guardado local** — banner persistente.
- 🔵 **Sincronizando…** — indicador en el sync queue, no bloqueante.

Componente esperado: `<OfflineBanner />` en el layout root.

## Instalabilidad

- `manifest.webmanifest` con iconos 192/512 maskable.
- Promote install solo cuando el usuario ya completó al menos 1 servicio (no en el primer minuto).
- iOS Safari: prompt "Agregar a la pantalla de inicio" con instrucción visual (Safari no expone install prompt).

## Push notifications

- Suscripción opcional desde el shell. Pedir permiso después de una interacción significativa, no al landing.
- Tipos: vencimientos, aprobaciones, rendición. (Ver A4 del plan.)

## Tests

- **Playwright** con `context.setOffline(true)` para simular sin conexión en e2e.
- Vitest unitario sobre la lógica de la `syncQueue` (mock de fetch + fake timers).

## Lo que evitamos

- Cache global agresivo de respuestas autenticadas (riesgo de mostrar datos de otro usuario tras logout).
- Sincronizaciones sin retry policy (un fallo deja la mutación huérfana).
- Mostrar "Sin conexión" como error: para Faro es un estado normal, no un fallo.
- Dejar al bombero perdiendo lo que cargó porque "el server no respondió".
