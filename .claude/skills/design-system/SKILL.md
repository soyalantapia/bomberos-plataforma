---
name: design-system
description: Sistema de diseño de Faro — tokens, paleta semáforo (verde/amarillo/rojo), accesibilidad, mobile-first pensado para uso con guantes y al sol. Usá esta skill antes de crear cualquier UI nueva o estilar componentes.
---

# Design system · Faro

## Tokens (Tailwind v4)

Definidos en `packages/ui/src/styles.css` (`@theme`) y replicados en `packages/config/tailwind/preset.js`:

| Token | Valor | Uso |
| --- | --- | --- |
| `--color-status-ok` | `#16a34a` | Cuartel en regla, rendición ✅ |
| `--color-status-warn` | `#eab308` | Atención, faltante, vence en pocos días |
| `--color-status-risk` | `#dc2626` | Riesgo de perder subsidio, vencimiento crítico |
| `--color-status-neutral` | `#64748b` | Sin datos suficientes / no aplica |
| `--color-brand-500/600/900` | azul Faro | Marca |
| `--radius-glove` | `1rem` | Botones grandes pensados para guantes |
| `--spacing-tap` | `44px` | Mínimo tap target accesible |

**Regla:** el semáforo es la única paleta de estado que se usa para cumplimiento. No inventar `success-light`, `warn-2`, etc.

## Mobile-first con guantes y al sol

El bombero opera el teléfono **con guantes, con prisa y a veces bajo luz fuerte**. Esto cambia las reglas:

- **Tap target ≥ 44px** (`h-12` mínimo, `h-14` para acciones primarias).
- **Tipografía base** mínimo `text-base` (16px); títulos `text-2xl` mobile.
- **Botones primarios bien grandes** con `rounded-glove` y `text-lg`.
- **Contraste alto**: nada de gris claro sobre fondo claro. Texto principal `text-slate-900` sobre `bg-slate-50`.
- **Estados claros**: lo que se puede tocar parece tocable (sombra/border/elevación).

## Layout por perfil

- **Bombero (mobile)**: barra inferior con 4–5 accesos, botón de acción primario destacado ("Registrar servicio").
- **Bombero (desktop)**: layout simple, lateral mínima.
- **Mando / Administrativo (desktop)**: sidebar + área de trabajo amplia con tablas y mapas.
- **Mando / Administrativo (mobile)**: sidebar plegable, prioridad a alertas y rendición.
- **Federación**: dashboard amplio en desktop, mobile reducido a top alertas + mapa.

**Misma página, distintos breakpoints. No hay "versión mobile" aparte.**

## Componentes base (shadcn extendidos)

A medida que se vayan creando, viven en `packages/ui/src/components/`. Conservar la API de shadcn (compatibilidad), agregar variantes faro cuando hace falta.

Componentes con tratamiento especial:

- **StatusPill** — chip 🟢🟡🔴 reutilizable.
- **GloveButton** — variante de Button con `h-14 rounded-glove`.
- **OfflineBanner** — banner persistente cuando no hay red.
- **DoubleConfirmDialog** — modal de doble validación para acciones sensibles.

## Accesibilidad

- WCAG AA mínimo. AAA en tipografía cuerpo.
- Focus visible siempre (no quitarlo, sí estilizarlo).
- Soporte teclado completo (Radix lo da gratis).
- `prefers-reduced-motion`: respetarlo en framer-motion (ver skill `animations`).
- `aria-live="polite"` para feedback de sync offline.

## Iconografía

- `lucide-react` único. No mezclar con otros sets.
- Tamaño mínimo `size={20}`. En botones grandes `size={24}`.

## Lo que evitamos

- Usar emojis como UI principal (sí como adorno en copy si suma).
- Gradientes decorativos que dificultan lectura al sol.
- Sombras "vidrio" / glassmorphism en pantallas operativas.
- Más de 1–2 fuentes por pantalla.
- Estado por color únicamente: el semáforo siempre va acompañado de texto o icono.
