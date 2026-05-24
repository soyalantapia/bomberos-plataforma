# CLAUDE.md · Faro

Contexto persistente del proyecto. Leelo siempre antes de tocar código.

## Qué es Faro

Plataforma de gestión para **bomberos voluntarios** (Argentina). Reemplaza al sistema heredado "GIB" y cierra el circuito **"de la calle al subsidio"**:

> _Capturás una vez, en la calle, desde el teléfono. Asistencia, cómputo, ranking y rendición se arman solos y quedan listos para presentar a tiempo._

Se distribuye como **PWA responsive** (web + mobile, instalable, con uso offline en el campo).

## Principios no negociables

1. **Capturar una vez.** Ningún dato se tipea dos veces.
2. **Responsive real**: misma página en mobile y desktop; lo que cambia es el perfil del usuario.
3. **Cumplimiento visible**, no PDF al final. Estado en tiempo real (semáforo verde/amarillo/rojo).
4. **Tiempo real**: lo de la calle aparece al instante en cuartel y Federación.
5. **IA como copiloto, nunca decisor**: la IA propone, **la persona confirma** (doble validación). Vale especialmente para subsidio y datos legales.
6. **Rápido de verdad**: sub-segundo en vistas críticas. Nada de timeouts.
7. **Seguridad desde el día uno**: login OTP passwordless, audit log nativo, Ley 25.326.
8. **Una experiencia por perfil**: simple para el bombero, potencia para el administrativo, panorama para la Federación.

## Perfiles (5)

- **Bombero** — captura en la calle, asistencia, su legajo.
- **Mando del cuartel** — supervisión, decisiones, rendición.
- **Administrativo** — padrón, materiales, documentos.
- **Gobierno interno** — Orden Interno, Ética, Género (acceso sensible, trazable).
- **Federación** — visión multi-cuartel, cumplimiento regional.

Un mismo usuario puede tener más de un perfil y cambia con el **selector de perfil**.

## Stack

| Capa          | Elección                                               |
| ------------- | ------------------------------------------------------ |
| Monorepo      | pnpm workspaces + Turborepo                            |
| Web (PWA)     | Next.js 15 (App Router) + React 19 + TypeScript strict |
| API           | NestJS 11 + TypeScript                                 |
| Estilos       | Tailwind CSS v4 + shadcn/ui (Radix) + lucide-react     |
| Animaciones   | Framer Motion                                          |
| Estado        | TanStack Query (server) + Zustand (UI)                 |
| Formularios   | React Hook Form + Zod v4                               |
| Gráficos      | Recharts                                               |
| Mapas / GPS   | MapLibre GL + react-map-gl                             |
| i18n          | next-intl (`es-AR`, voseo)                             |
| DB            | PostgreSQL + Prisma 6                                  |
| Colas / cache | Redis + BullMQ                                         |
| PWA           | Serwist (service worker) + Dexie (IndexedDB)           |
| Auth          | Better Auth (OTP passwordless)                         |
| IA            | `@anthropic-ai/sdk` + Vercel AI SDK                    |
| Tests         | Vitest (unit) + Playwright (e2e)                       |
| CI            | GitHub Actions                                         |

## Estructura

```
bomberos-plataforma/
├─ apps/
│  ├─ web/          # Next.js PWA (puerto 3010)
│  └─ api/          # NestJS (puerto 3011)
├─ packages/
│  ├─ ui/           # shadcn/ui compartidos
│  ├─ types/        # tipos de dominio + esquemas Zod
│  └─ config/       # eslint, tsconfig, tailwind preset
├─ .claude/skills/  # skills propias del proyecto
├─ docker/          # data volumes locales
├─ docker-compose.yml
└─ turbo.json
```

## Comandos

```bash
# instalar
pnpm install

# levantar infra local (postgres + redis)
docker compose up -d

# dev (web :3010 + api :3011 en paralelo)
pnpm dev

# solo el frontend (no necesita postgres/redis para el demo)
pnpm --filter @faro/web dev

# calidad
pnpm lint
pnpm typecheck
pnpm test
pnpm test:e2e

# build de producción
pnpm build
```

## Convenciones rápidas

- **Conventional Commits** obligatorios (`feat:`, `fix:`, `chore:`, etc.) — los valida commitlint.
- **TypeScript strict** en todo. Nada de `any` sin justificación.
- **Validación en bordes** (HTTP / SW / DB) con Zod, no en cada función interna.
- **i18n**: todo el copy en `messages/es-AR.json`. Voseo: "registrá", "anotá", "querés".
- **Mobile-first**: layouts y tipografía pensados primero para pantalla chica con guantes.
- **Doble validación**: cualquier flujo que toque subsidio o datos sensibles requiere confirmación humana explícita después de la propuesta de IA o del sistema.
- **Audit log**: toda mutación sobre legajos, sanciones, secciones, rendición → registra quién, qué, cuándo.

## Skills del proyecto

Cargá las relevantes antes de codear. Cada una está en `.claude/skills/<nombre>/SKILL.md`:

- `frontend-conventions` — Next.js, React, Tailwind, shadcn, RHF.
- `backend-conventions` — NestJS, Prisma, Zod, BullMQ.
- `design-system` — tokens, paleta semáforo, accesibilidad, mobile-first con guantes.
- `animations` — Framer Motion, presets de Faro, performance.
- `ux-writing` — microcopy español rioplatense, claro, no técnico.
- `pwa-offline` — service worker, sync queue, estados sin conexión.
- `security-auth` — OTP, datos sensibles, Ley 25.326.
- `ai-features` — Anthropic SDK, voz, OCR, copiloto, regla "propone vs confirma".

## Lo que NO hay que hacer

- Subir `.env` al repo (está en `.gitignore`; usá `.env.example`).
- Implementar features sin alinear con el plan de producto (v0.2) y el anexo de páginas.
- Auto-presentar la rendición o auto-modificar un legajo sin paso humano de confirmación.
- Crear UIs "solo desktop" o "solo mobile": la misma página tiene que funcionar en ambos.
- Usar contraseñas tradicionales: la auth es OTP passwordless.
