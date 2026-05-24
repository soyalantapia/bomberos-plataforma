# Plugins de Claude Code recomendados para Faro

Esta lista la corrés vos manualmente en Claude Code con `/plugin`. Yo no puedo ejecutarlos directamente. Cada plugin tiene un comando exacto y una línea de para qué sirve.

> Verificado al 2026-05-23. Si pasó tiempo, repasá con `/plugin` Discover por si cambiaron nombres.

---

## 1. Marketplace oficial de Anthropic

El marketplace `claude-plugins-official` **viene preconfigurado** en Claude Code, no hace falta agregarlo. Podés instalar plugins de ahí directamente.

### Plugins oficiales recomendados

```
/plugin install playwright@claude-plugins-official
```
→ Browser automation real (Chromium/Firefox/WebKit) para que el asistente pueda escribir y correr tests Playwright reales en la PWA.

> Para ver el catálogo completo del marketplace oficial: corré `/plugin`, andá a la pestaña **Discover** y filtrá por lo que necesites (TypeScript, Next.js, git, Figma, Vercel, etc.).

**Fuente:** [github.com/anthropics/claude-plugins-official](https://github.com/anthropics/claude-plugins-official)

---

## 2. Marketplace community: wshobson/agents

Es el más grande y mantenido de la comunidad. 191 agentes especializados, 155 skills, 102 commands organizados en 82 plugins modulares.

### Agregar marketplace

```
/plugin marketplace add wshobson/agents
```

### Plugins recomendados para nuestro stack

> Los nombres exactos pueden cambiar. Después del `marketplace add`, corré `/plugin` Discover y filtrá por las palabras clave indicadas para confirmar el nombre actual antes de instalar.

| Buscá por… | Para qué | Comando tentativo |
| --- | --- | --- |
| `react`, `nextjs`, `frontend` | Patrones React/Next.js, code reviews del frontend | `/plugin install react-expert@wshobson-agents` |
| `typescript` | Refactors TS, tipos, generics | `/plugin install typescript-expert@wshobson-agents` |
| `nestjs`, `backend`, `node` | Patrones Nest, services, módulos | `/plugin install nestjs-expert@wshobson-agents` |
| `prisma`, `database`, `postgres` | Schema design, migraciones, queries | `/plugin install database-expert@wshobson-agents` |
| `testing`, `vitest`, `playwright` | Diseñar tests, cobertura, e2e | `/plugin install testing-expert@wshobson-agents` |
| `tailwind`, `css`, `design` | UI/UX, accesibilidad, design tokens | `/plugin install ui-expert@wshobson-agents` |
| `security`, `auth` | Reviews de seguridad, OWASP, OTP | `/plugin install security-expert@wshobson-agents` |
| `code-review`, `pr-review` | Reviews automáticos de PRs | `/plugin install code-reviewer@wshobson-agents` |
| `agent-teams` | Múltiples agentes en paralelo (eval por métrica/juez) | `/plugin install agent-teams@wshobson-agents` |

**Fuente:** [github.com/wshobson/agents](https://github.com/wshobson/agents)

---

## 3. Workflow recomendado para instalar

1. Abrí Claude Code en el proyecto.
2. Corré `/plugin` para abrir el plugin manager.
3. En **Discover**, mirá primero los del marketplace oficial.
4. Si querés agentes especializados, hacé `/plugin marketplace add wshobson/agents` y volvé a Discover.
5. Instalá solo lo que vayas a usar. Demasiados plugins ralentizan y meten ruido en `/agents`.
6. Después de instalar, corré `/plugin` y verificá que aparezcan en la pestaña **Manage**.

---

## 4. Lo que NO instales sin chequear

- Plugins que requieran credenciales en plain text en el repo.
- Marketplaces que no tengan estrellas/historia en GitHub (regla básica: no instales de un repo creado ayer).
- Plugins con MCP servers que pidan acceso a sistemas que no usás (Linear, Slack, etc.) — meten herramientas que distraen al asistente.

---

## 5. Skills propias del proyecto (ya creadas)

Estas no se instalan via `/plugin`. Ya están en `.claude/skills/` de este repo y Claude Code las descubre automáticamente:

- `frontend-conventions`
- `backend-conventions`
- `design-system`
- `animations`
- `ux-writing`
- `pwa-offline`
- `security-auth`
- `ai-features`

Si querés ver una en uso, mencionala en tu prompt ("usá la skill `design-system`").
