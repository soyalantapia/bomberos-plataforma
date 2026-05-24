# Architecture · Faro

Decisiones de arquitectura y por qué de cada elección. Cuando algo cambie significativamente, registralo acá con fecha.

## Visión

Faro tiene que cumplir tres cosas que GIB no puede:

1. **Capturar el dato en la calle** (mobile real, offline, por voz).
2. **Cerrar el circuito al subsidio** (rendición asistida + checklist + paquete listo).
3. **Visión multi-cuartel** (Federación con semáforo en vivo).

Toda decisión técnica se evalúa contra esas tres metas.

---

## Decisiones clave

### Monorepo (pnpm workspaces + Turborepo)

**Por qué.** Web y API comparten esquemas Zod, tipos de dominio y componentes UI. Un monorepo evita la duplicación y permite refactors atómicos cross-app. Turborepo da pipeline cacheado y orquestación.

**Alternativas descartadas.** Nx (más pesado para nuestro tamaño actual), repos separados (perdíamos el compartido natural de tipos).

### Next.js 15 (App Router) en el frontend

**Por qué.** App Router permite Server Components, streaming, routing por convención y mejor performance por default. React 19 trae `useFormStatus`, transiciones, Server Actions. Es el estándar actual para PWA modernas con TypeScript.

**Alternativas descartadas.** Remix (excelente pero ecosistema más chico en LATAM), Astro (no encaja con app altamente dinámica), Pages Router (legacy).

### NestJS en la API

**Por qué.** Estructura modular fuerte (módulos / providers / DI), decoradores, validación, Swagger out-of-the-box. Para un dominio con muchos sub-módulos (padrón, servicios, cómputo, rendición, federación) el patrón Nest acompaña.

**Alternativas descartadas.** Fastify directo (más boilerplate para el equipo), Express (no escala en estructura).

### PostgreSQL + Prisma 6

**Por qué.** Faro tiene datos relacionales (personas ↔ servicios ↔ asistencias ↔ cómputo ↔ rendición) con consultas complejas y agregados. Postgres es el estándar. Prisma da DX excelente, migraciones seguras y tipado automático.

### Redis + BullMQ

**Por qué.** Jobs largos (OCR, generación de paquete de rendición, sync con sistemas externos) requieren colas. Redis también caché de sesiones y rate limiting.

### Tailwind v4 + shadcn/ui

**Por qué.** Tailwind v4 trae performance, theming nativo con `@theme`, y CSS-in-CSS sin runtime. shadcn/ui da componentes accesibles (Radix) que vivimos en `packages/ui` — los modificamos libremente, no son una dependencia.

### Better Auth (OTP passwordless)

**Por qué.** GIB tiene contraseñas en texto plano (riesgo legal). OTP saca el problema de las contraseñas para una población no técnica (voluntarios mayores, en el campo). Better Auth es moderno, full TS, framework-agnostic, soporta multi-channel OTP.

**Alternativas evaluadas.** Auth.js (excelente pero más opinado), Clerk (vendor lock + costo), implementación propia (riesgo de seguridad). Better Auth queda como primera elección, pero la decisión es revisable cuando arranque la implementación real.

### Serwist (PWA) + Dexie (IndexedDB)

**Por qué.** El bombero captura sin señal. Serwist es el sucesor moderno de Workbox, mantenido y con buen soporte de Next.js. Dexie es el wrapper de IndexedDB con la mejor DX.

**Patrón.** Optimistic UI → guardado en Dexie → cola `pendingMutations` → Background Sync → API. Ver skill `pwa-offline`.

### Anthropic SDK + Vercel AI SDK

**Por qué.** Anthropic SDK da acceso directo a Claude (Opus 4.7, Sonnet 4.6, Haiku 4.5). Vercel AI SDK encima da streaming, tool calling y abstracción de providers (por si en algún caso usamos otro modelo). Tool calling con Zod es la base de la extracción estructurada para carga por voz y OCR.

**Regla central.** La IA propone, la persona confirma. Esta regla atraviesa toda la implementación.

### Vitest + Playwright

**Por qué.** Vitest es rápido, tiene la API de Jest, integra con Vite. Playwright cubre e2e en Chromium/WebKit/Firefox + mobile devices, fundamental para una PWA responsive.

---

## Modelo de datos (preliminar)

Entidades núcleo definidas en el plan v0.2 (ver `Plan-de-Producto-Faro-v0.2.md`):

- `Cuartel`
- `Persona` (padrón) con sub-fichas: salud, familia, laboral, formación, licencias, cursos
- `Móvil`
- `Servicio` (tipo, GPS, móvil, dotación, horarios, origen app/manual)
- `Asistencia` (derivada de Servicio + Guardia)
- `Cómputo` (derivado de Asistencia)
- `Rendición` (estado, checklist, período) — **la entidad nueva que cierra el circuito**

Lo derivado se calcula on-the-fly o se materializa según performance. Modelado real se completa con la documentación de producto.

---

## Performance budget

- LCP < 2.5s en mobile 4G.
- Time to Interactive < 3.5s en mobile 4G.
- Cómputo mensual: < 1s para un cuartel de 100 personas (GIB tarda 26s).
- Vista del dashboard en mando: < 800ms.

---

## Seguridad

- OTP passwordless (Better Auth) — ver skill `security-auth`.
- Audit log nativo (`E4` del plan).
- Datos sensibles cifrados a nivel campo (Prisma + pgcrypto o libsodium — decidir al implementar).
- Permisos por perfil declarativos.
- Cumplimiento Ley 25.326.

---

## Despliegue (preliminar, sujeto a validación)

- **Web**: Vercel o Cloudflare Pages.
- **API**: Fly.io, Railway o un VPS con Docker. Decidir según costo y requerimiento de proximidad al usuario (Argentina).
- **DB**: Neon, Supabase o RDS. Idealmente con backup automatizado diario.
- **Observabilidad**: Sentry + algún APM (Axiom, Better Stack).

---

## Riesgos arquitectónicos

| Riesgo | Mitigación |
| --- | --- |
| Sincronización offline genera conflictos | Definir merge strategy por entidad; rechazar sin auto-resolver lo sensible |
| Costos de IA escalan con uso | Tier por cuartel + caché de prompts + modelos diferenciados (Haiku/Sonnet/Opus) |
| Datos sensibles (salud, género, ética) | Cifrado a nivel campo + permisos estrictos + audit |
| Formato exacto de rendición del Fondo es `[HIPÓTESIS]` | Módulo de rendición flexible + validar temprano con Federación |
| Bloqueo de adopción si la Federación no entra | Estrategia GTM "entrar por la Federación" antes que cuartel-por-cuartel |

---

## Historial de cambios

- **2026-05-23** — Scaffold inicial (paso 1): monorepo, web (Next.js+PWA), api (NestJS), packages, tooling, skills, CLAUDE.md.
