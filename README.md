# Faro

**Plataforma de gestión para bomberos voluntarios** — PWA responsive (web + mobile), uso offline en el campo, IA copiloto.

Faro reemplaza al sistema heredado "GIB" y cierra el circuito **"de la calle al subsidio"**:

> Capturás una vez, en la calle, desde el teléfono. Asistencia, cómputo, ranking y rendición se arman solos y quedan listos para presentar a tiempo.

> **Estado actual:** demo navegable completo (31 pantallas de la spec). Todo el frontend corre con datos en memoria y, opcionalmente, IA real Claude. Backend NestJS preparado pero el demo no lo necesita. Ver [DEMO.md](./DEMO.md) para correrlo y un recorrido guiado.

---

## Stack

- **Monorepo**: pnpm workspaces + Turborepo
- **Web (PWA)**: Next.js 15 (App Router, React 19) + TypeScript strict
- **API**: NestJS 11 + Prisma 6 + Zod
- **UI**: Tailwind CSS v4 + shadcn/ui (Radix) + lucide-react + Framer Motion
- **Estado**: TanStack Query (server) + Zustand (UI)
- **Formularios**: React Hook Form + Zod
- **Gráficos / Mapas**: Recharts + MapLibre GL
- **i18n**: next-intl (`es-AR`, voseo)
- **DB / Cache**: PostgreSQL + Redis + BullMQ
- **PWA**: Serwist + Dexie (IndexedDB)
- **Auth**: Better Auth (OTP passwordless)
- **IA**: `@anthropic-ai/sdk` + Vercel AI SDK
- **Tests**: Vitest + Playwright
- **CI**: GitHub Actions

Detalles y por qué de cada elección en [ARCHITECTURE.md](./ARCHITECTURE.md).

---

## Estructura

```
bomberos-plataforma/
├─ apps/
│  ├─ web/                # Next.js PWA (puerto 3010)
│  └─ api/                # NestJS (puerto 3011)
├─ packages/
│  ├─ ui/                 # componentes shadcn/ui compartidos
│  ├─ types/              # tipos de dominio + esquemas Zod
│  └─ config/             # eslint, tsconfig, tailwind preset
├─ .claude/skills/        # skills propias del proyecto (8)
├─ .github/workflows/     # CI (lint, typecheck, test, build)
├─ docker-compose.yml     # Postgres + Redis locales
├─ CLAUDE.md              # contexto persistente para asistentes
└─ turbo.json
```

---

## Requisitos

- **Node.js** 20 LTS o superior (probado con 22 en CI)
- **pnpm** 10+
- **Docker** (para Postgres y Redis locales)
- **GitHub CLI** (`gh`) si vas a abrir PRs desde la consola

---

## Setup

```bash
# 1. Clonar
git clone https://github.com/soyalantapia/bomberos-plataforma.git
cd bomberos-plataforma

# 2. Copiar variables de entorno
cp .env.example .env
# Editar .env con tus claves (ANTHROPIC_API_KEY, BETTER_AUTH_SECRET)

# 3. Instalar dependencias
pnpm install

# 4. Levantar infra local
docker compose up -d

# 5. Generar cliente Prisma
pnpm --filter @faro/api prisma:generate

# 6. Dev (web :3000 + api :3001)
pnpm dev
```

---

## Comandos principales

| Comando                | Qué hace                                    |
| ---------------------- | ------------------------------------------- |
| `pnpm dev`             | Levanta web (3010) + api (3011) en paralelo |
| `pnpm build`           | Build de producción de todo el monorepo     |
| `pnpm lint`            | ESLint en todo el monorepo                  |
| `pnpm typecheck`       | TypeScript strict check                     |
| `pnpm test`            | Tests unitarios (Vitest)                    |
| `pnpm test:e2e`        | Tests end-to-end (Playwright)               |
| `pnpm format`          | Prettier en todo el código                  |
| `docker compose up -d` | Postgres + Redis locales                    |

Comandos por workspace:

```bash
pnpm --filter @faro/web dev         # solo el frontend
pnpm --filter @faro/api dev         # solo la API
pnpm --filter @faro/api prisma:studio
```

---

## Variables de entorno

Todas en `.env.example`. Las críticas:

- `DATABASE_URL` — Postgres (default: la del compose)
- `REDIS_URL` — Redis (default: la del compose)
- `BETTER_AUTH_SECRET` — generá con `openssl rand -hex 32`
- `ANTHROPIC_API_KEY` — pedila en https://console.anthropic.com/

**Nunca commitees `.env`.** Está en `.gitignore`.

---

## Convenciones

- **Conventional Commits** validados por commitlint.
- **Husky + lint-staged**: lint + prettier en pre-commit; commitlint en commit-msg.
- **TypeScript strict** en todo el monorepo.
- **i18n**: español rioplatense (voseo). Ver skill `ux-writing`.
- **Doble validación** humana en cualquier flujo que toque subsidio o datos sensibles.

Para detalles: leer [CLAUDE.md](./CLAUDE.md) y las skills en [.claude/skills/](./.claude/skills/).

---

## Privacidad y seguridad

- Login **OTP passwordless** (sin contraseñas).
- **Audit log nativo** sobre todas las mutaciones sensibles.
- Cumplimiento **Ley 25.326** (Argentina).
- Datos sensibles cifrados a nivel campo (a implementar).

Ver skill [`security-auth`](./.claude/skills/security-auth/SKILL.md).

---

## Licencia

Privado. Todos los derechos reservados.
