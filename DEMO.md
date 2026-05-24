# Faro · Manual del demo

Esta guía es para cualquier persona — técnica o no — que quiera ver Faro funcionando en su computadora y entender qué hace de punta a punta.

> El demo corre sin backend real ni base de datos. Todo se simula en el navegador con datos en memoria. La IA es opcional: si tenés clave de Anthropic la usa; si no, simula respuestas creíbles.

---

## 1. Cómo correrlo

Necesitás **Node.js 20+** y **pnpm 10+** instalados.

```bash
# 1. Clonar e instalar
git clone https://github.com/soyalantapia/bomberos-plataforma.git
cd bomberos-plataforma
pnpm install

# 2. (Opcional) IA real
cp .env.example .env
# Editá .env y pegá tu ANTHROPIC_API_KEY (https://console.anthropic.com/)
# Si no la ponés, la IA usa modo demo automáticamente.

# 3. Arrancar
pnpm --filter @faro/web dev
```

**Se abre en**: <http://localhost:3010>

> La primera carga compila ~5 segundos. Después es instantánea.

---

## 2. Cómo instalarlo como PWA (instalable, como una app)

Faro es una **PWA**: se instala como una app de verdad, con su ícono, y queda funcionando offline.

**En el celular (Android, Chrome o Edge):**

1. Abrí <http://localhost:3010> en el navegador.
2. Tocá el menú (⋮) → **"Instalar app"** o **"Agregar a pantalla de inicio"**.
3. Aparece el ícono de Faro en el launcher.
4. Abrila desde ahí — corre en pantalla completa, sin barra del navegador.

**En iPhone / iPad (Safari):**

1. Abrí <http://localhost:3010> en Safari.
2. Tocá **Compartir** (cuadrado con flecha arriba) → **Agregar a pantalla de inicio**.
3. Listo: aparece el ícono y abre en modo app.

**En la computadora (Chrome, Edge, Brave):**

1. En la barra de direcciones aparece un ícono de **"Instalar"** (con flecha hacia abajo o un ➕).
2. Cliqueá ahí → **Instalar**.
3. Faro se abre como ventana independiente y queda en el dock / barra de tareas.

> En desarrollo (`pnpm dev`) el service worker está deshabilitado para iterar más rápido. Para probar la instalación PWA real, corré `pnpm --filter @faro/web build` y `pnpm --filter @faro/web start`.

---

## 3. Cómo entrar al demo

El login es **OTP passwordless** (sin contraseñas). En modo demo, el código siempre es el mismo.

```
Legajo:  0017
Código:  000000
```

Después del login aparece un **selector de perfil + cuartel**:

- **Mariana Pereyra (legajo 0017)** tiene dos perfiles: **Mando del cuartel** y **Bombero**, y puede operar 4 cuarteles (Villa Ballester, San Martín, San Isidro, Tigre).
- Tocá **"Entrar como Federación"** abajo del todo si querés ver la vista multi-cuartel desde Patricia Morales (Federación regional).

> Para ver otro perfil sin salir, tocá tu avatar arriba a la derecha → volvés al selector.

---

## 4. El circuito hero (recorrido recomendado)

Este es el flujo de 5 pantallas que cuenta toda la historia de Faro. Tardás 3-4 minutos.

### Paso 1 · Login (10 s)

- Legajo `0017` → **Enviar código**.
- Código `000000` → **Entrar**.

### Paso 2 · Selector de perfil (10 s)

- Dejá seleccionado **Mando del cuartel** + **Villa Ballester (78%)**.
- Tocá **Entrar**.

### Paso 3 · Dashboard del cuartel (mira el semáforo)

Estás en `/mando`. Vas a ver:

- **Donut amarillo de 78%** ("ATENCIÓN") — la rendición de mayo está en marcha, pero falta.
- **4 KPIs**: Cumplimiento, Servicios, Horas operativas, Personal.
- **Alertas** (VTV por vencer, aptitud médica, curso vencido).
- **Actividad en vivo**: los últimos servicios. Los que dicen **"Sin validar"** son los que cargaron desde la app y esperan que el Mando confirme.

### Paso 4 · Cómputo mensual (la magia de GIB superado)

- Tocá **"Ver cómputo"** o la pestaña **Cómputo** abajo (en mobile) / sidebar (en desktop).
- Estás en `/mando/computo`. Vas a ver la tabla con todas las personas y sus horas por tipo (Accidental, Obligatorio, Guardia, Jefatura, O.I.) + Total.
- Mensaje arriba: **"GIB: 26 segundos · Faro: tiempo real, automático"** — el cómputo que en el sistema viejo tarda 26 segundos (y a veces da timeout), acá se arma solo.

### Paso 5 · Rendición al Fondo (la pantalla estrella)

- Tocá **"Resolver pendientes"** del dashboard o la pestaña **Rendición**.
- Estás en `/mando/rendicion`. Vas a ver:
  - **Donut 78% ATENCIÓN** con "3 ítems pendientes".
  - **Lista de requisitos** del Fondo: cuáles están en verde, cuáles falta resolver, con el % de avance y un link "Ir a resolver" en los pendientes.
- Tocá arriba a la derecha **"Copiloto IA"**. Se abre un diálogo:
  - Muestra **"Analizando la rendición con IA..."**.
  - Después aparece **cada requisito faltante con diagnóstico, qué hacer paso a paso, por qué importa, y a veces un texto redactado para usar tal cual.**
  - La regla es: **la IA propone, vos confirmás**. Nunca se envía sola.

### Paso 6 · Tablero Federación (visión multi-cuartel)

- Salí (avatar arriba a la derecha → o desde el selector tocá **"Entrar como Federación"**).
- Estás en `/federacion`. Vas a ver:
  - **4 cuarteles** con su semáforo: **Villa Ballester 78% (amarillo)**, **San Martín 96% (verde)**, **San Isidro 42% (rojo)**, **Tigre 88% (verde)**.
  - **Ranking del mes**.
  - **"Cuarteles que necesitan acción"** (los amarillos y rojos).

### Bonus · Registrar servicio con IA (probar la captura por voz)

- Cambiá a perfil **Bombero**: tocá tu avatar → seleccioná Bombero → Entrar.
- Tocá **"Registrar servicio"** (botón grande).
- En el cuadro **"Cargar por voz · IA copiloto"** ya hay un parte de ejemplo. Tocá **"Probar con IA"**.
- En 3-5 segundos la IA llena tipo, dirección, móvil, horarios y dotación. **Aparece un badge "Confianza X%"**.
- Avanzá paso a paso (Ubicación → Móvil → Dotación → Horarios → Confirmar). Tocá **"Confirmar servicio"**.
- Volvés a una pantalla de **éxito** con un check verde y las cosas que se actualizaron solas: tu asistencia, el cómputo, los servicios del cuartel, el estado de la rendición. Tocá **"Ver dashboard mando"** para verlo.

---

## 5. ¿Qué hay para clickear en cada perfil?

| Perfil                | Pantallas                                                                             | Para qué                                                     |
| --------------------- | ------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| **Bombero**           | Inicio · Registrar servicio · Asistencia · Mi legajo · Capacitación · Comunicación    | Captura en la calle, ve sus horas, sus cursos, recibe avisos |
| **Mando del cuartel** | Dashboard · Operaciones · Cómputo · Rendición · Personal · Automotores · Aprobaciones | Supervisión total del cuartel y rendición del subsidio       |
| **Administrativo**    | Padrón · Materiales · Licencias · Documentos · Capacitación · Agenda                  | Mantiene legajos, inventarios, calendario institucional      |
| **Gobierno interno**  | Orden Interno · Ética · Género · Audit log                                            | Acceso sensible y trazable                                   |
| **Federación**        | Tablero · Cumplimiento · Consolidados · Comunicados · Integraciones                   | Visión multi-cuartel, semáforo regional, ranking             |

---

## 6. Comandos útiles

```bash
# Levantar el demo (solo frontend, ningún backend real)
pnpm --filter @faro/web dev          # http://localhost:3010

# Build de producción (para probar PWA instalable real)
pnpm --filter @faro/web build && pnpm --filter @faro/web start

# Verificaciones de calidad
pnpm typecheck                       # TypeScript estricto en verde
pnpm test                            # Vitest (unit)
pnpm --filter @faro/web test:e2e     # Playwright (circuito hero)

# Resetear el estado del demo (datos en memoria)
# En la consola del navegador:
localStorage.clear(); location.reload();
```

---

## 7. Qué quedó hecho

**Pantallas (31)**: las 5 áreas de la spec completas — Bombero (6), Mando (7), Administrativo (6), Gobierno (4), Federación (5), más Login y Selector.

**Lógica viva del demo**:

- Login OTP demo con código fijo `000000`.
- Store Zustand persistido en localStorage con migración por versión.
- **Crear un servicio recalcula automáticamente**: asistencia, cómputo, rendición y el semáforo del cuartel + Federación.
- Doble validación: presentar la rendición pide escribir `PRESENTAR` literal.

**IA copiloto** (con fallback demo automático si no hay API key):

- Carga por voz en Registrar servicio (`claude-sonnet-4-6` real; regex en demo).
- Copiloto de rendición (`claude-opus-4-7` real; descripciones en demo).
- Regla "la IA propone, la persona confirma" implementada en ambos.

**PWA**:

- Manifest, viewport, theme color azul Faro (`#0c1e45`).
- Iconos PNG (192, 512, 180 apple-touch, 32 favicon) generados con Sharp.
- Service worker Serwist habilitado en producción.

**Datos mock creíbles**:

- 4 cuarteles del Norte GBA (Villa Ballester principal) con semáforo verde/amarillo/rojo.
- 18 personas activas + 1 en licencia + 1 federativa, con jerarquías variadas.
- 3 móviles (uno con VTV por vencer, uno con horas altas).
- 10 servicios con GPS reales de la zona (Villa Ballester, San Andrés, Acassuso, José León Suárez).
- 5 alertas (VTV, aptitud, rendición, curso vencido, validación pendiente).

**Calidad**:

- TypeScript strict en verde (4 packages).
- 10 tests Vitest verdes (computo + date utils).
- Playwright e2e: 3 escenarios cubriendo el circuito hero.
- GitHub Actions CI: typecheck + build + tests + Playwright headless.

---

## 8. Decisiones que tomé sin preguntar

- **Stack tal cual la doc**: Next.js 15, React 19, Tailwind v4, Serwist, Dexie, Better Auth, Anthropic SDK. No vi razón para cambiar nada.
- **Puerto 3010** para el web (la doc dice 3000 pero el package.json marca 3010 — corregí la doc en este DEMO.md).
- **Login demo siempre acepta `000000`** para cualquier legajo. Si el legajo no matchea ninguna persona, cae a Mariana Pereyra como default.
- **Mapas con OSM tiles públicos** (MapLibre sin token de Mapbox).
- **Persistencia del demo en localStorage** (con `version: 2` para forzar reseed cuando cambian los mocks). Dexie está cableada pero el demo no la usa todavía — entra cuando se agregue offline real.
- **lint no corre por ahora**: el binario de eslint no se resuelve por un bug de pnpm en la instalación actual. Anotado para fase de backend. Typecheck y tests sí corren.

---

## 9. Qué falta para la fase del backend real

- **Schema Prisma completo** (Cuartel, Persona, Servicio, Asistencia, Cómputo, Rendición, AuditLog) — hoy es un placeholder `SchemaSeed`.
- **Módulos NestJS** por dominio (padrón, servicios, rendición, federación) — hoy solo hay `health`.
- **Better Auth** con OTP real por SMS/WhatsApp/email — hoy el OTP es local.
- **Cola BullMQ** para jobs largos (OCR, paquete de rendición consolidado, sync externos).
- **API de rendición al Fondo** (formato exacto pendiente de validar con Federación — marcado `[HIPÓTESIS]` en la doc).
- **Datos sensibles cifrados a nivel campo** (Salud, Ética, Género).
- **Sentry + APM**, backups DB, deploy real (Vercel + Fly/Railway).
- **PWA offline real**: sync queue con Dexie + Background Sync para servicios cargados sin señal.
- **lint funcional** (reinstalar bins de eslint).

---

## 10. Soporte

- **Repo**: <https://github.com/soyalantapia/bomberos-plataforma>
- **Plan de producto**: `Plan-de-Producto-Faro-v0.2.md` (en `~/Downloads/`)
- **Anexo de páginas**: `Faro-Especificacion-de-Paginas.md` (en `~/Downloads/`)
- **Contexto para IA**: `CLAUDE.md` en la raíz del repo
- **Skills del proyecto**: `.claude/skills/` (8 skills: frontend, backend, design system, animations, ux-writing, pwa-offline, security-auth, ai-features)
